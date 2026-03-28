import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { createTask, updateTask, emitTaskEvent } from "../task-store.js";
import { runChatTask } from "../services/run-chat-task.js";

type CopilotMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type CopilotRunBody = {
  threadId?: string;
  sessionId?: string;
  messages: CopilotMessage[];
};

function getLastUserMessage(messages: CopilotMessage[]): string {
  const lastUser = [...messages]
    .reverse()
    .find(
      (m) =>
        m.role === "user" &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    );

  return lastUser?.content?.trim() ?? "";
}

export async function registerCopilotRoutes(app: FastifyInstance) {
  app.post("/copilot/run", async (request, reply) => {
    const body = (request.body ?? {}) as Partial<CopilotRunBody>;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return reply.code(400).send({
        error: "messages is required",
      });
    }

    const prompt = getLastUserMessage(body.messages);

    if (!prompt) {
      return reply.code(400).send({
        error: "No user message found",
      });
    }

    const now = new Date().toISOString();

    const task = await createTask({
      id: randomUUID(),
      kind: "chat",
      status: "pending",
      input: {
        threadId: body.threadId,
        sessionId: body.sessionId,
        messages: body.messages,
      },
      createdAt: now,
      updatedAt: now,
    });

    try {
      const runningTask = await updateTask(task.id, {
        status: "running",
      });

      if (runningTask) {
        emitTaskEvent(task.id, {
          type: "task.running",
          task: runningTask,
        });
      }

      const result = await runChatTask({
        prompt,
        sessionId: body.sessionId,
        threadId: body.threadId,
      });

      const completedTask = await updateTask(task.id, {
        status: "completed",
        output: {
          sessionId: result.sessionId,
          messageId: result.message.messageId,
          finalMessage: {
            role: "assistant",
            content: result.output,
          },
          reasoning: result.message.reasoning ?? [],
          tools: result.message.tools ?? [],
          rawParts: result.message.parts ?? [],
        },
      });

      if (completedTask) {
        emitTaskEvent(task.id, {
          type: "task.completed",
          task: completedTask,
        });
      }

      return reply.send({
        taskId: task.id,
        status: "completed",
        message: {
          role: "assistant",
          content: result.output,
        },
        metadata: {
          sessionId: result.sessionId,
          messageId: result.message.messageId,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Chat task failed";

      const failedTask = await updateTask(task.id, {
        status: "failed",
        error: message,
      });

      if (failedTask) {
        emitTaskEvent(task.id, {
          type: "task.failed",
          task: failedTask,
        });
      }

      return reply.code(500).send({
        taskId: task.id,
        status: "failed",
        error: message,
      });
    }
  });
}