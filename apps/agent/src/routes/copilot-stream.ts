import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  createTask,
  updateTask,
  emitTaskEvent,
  subscribeToTaskEvents,
  type TaskEvent,
} from "../task-store.js";
import { runChatTask } from "../services/run-chat-task.js";

type CopilotMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type CopilotStreamBody = {
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

function sendEvent(reply: any, event: string, data: unknown) {
  if (reply.raw.destroyed || reply.raw.writableEnded) {
    return;
  }

  reply.raw.write(`event: ${event}\n`);
  reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function registerCopilotStreamRoute(app: FastifyInstance) {
  app.post("/copilot/stream", async (request, reply) => {
    const body = (request.body ?? {}) as Partial<CopilotStreamBody>;

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

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");

    if (typeof reply.raw.flushHeaders === "function") {
      reply.raw.flushHeaders();
    }

    reply.raw.write("retry: 3000\n\n");

    sendEvent(reply, "RUN_STARTED", {
      type: "RUN_STARTED",
      runId: task.id,
      taskId: task.id,
      threadId: body.threadId,
    });

    let textStarted = false;
    let closed = false;

    const cleanup = () => {
      if (closed) return;
      closed = true;

      clearInterval(keepAlive);
      unsubscribe();

      if (!reply.raw.writableEnded) {
        reply.raw.end();
      }
    };

    const unsubscribe = subscribeToTaskEvents(task.id, (event: TaskEvent) => {
      if (reply.raw.destroyed || reply.raw.writableEnded) {
        cleanup();
        return;
      }

      switch (event.type) {
        case "task.running": {
          sendEvent(reply, "STATE_SNAPSHOT", {
            type: "STATE_SNAPSHOT",
            state: "running",
            taskId: task.id,
          });
          break;
        }

        case "task.output.delta": {
          if (!textStarted) {
            textStarted = true;
            sendEvent(reply, "TEXT_MESSAGE_START", {
              type: "TEXT_MESSAGE_START",
              messageId: task.id,
              role: "assistant",
            });
          }

          sendEvent(reply, "TEXT_MESSAGE_CONTENT", {
            type: "TEXT_MESSAGE_CONTENT",
            messageId: task.id,
            delta: event.chunk,
          });
          break;
        }

        case "task.completed": {
          const content =
            event.task.output?.finalMessage?.content ??
            event.task.output?.output ??
            "";

          if (!textStarted) {
            sendEvent(reply, "TEXT_MESSAGE_START", {
              type: "TEXT_MESSAGE_START",
              messageId: event.task.output?.messageId ?? task.id,
              role: "assistant",
            });

            if (content) {
              sendEvent(reply, "TEXT_MESSAGE_CONTENT", {
                type: "TEXT_MESSAGE_CONTENT",
                messageId: event.task.output?.messageId ?? task.id,
                delta: content,
              });
            }
          }

          sendEvent(reply, "TEXT_MESSAGE_END", {
            type: "TEXT_MESSAGE_END",
            messageId: event.task.output?.messageId ?? task.id,
          });

          sendEvent(reply, "RUN_FINISHED", {
            type: "RUN_FINISHED",
            runId: task.id,
            taskId: task.id,
            sessionId: event.task.output?.sessionId,
          });

          cleanup();
          break;
        }

        case "task.failed": {
          sendEvent(reply, "ERROR", {
            type: "ERROR",
            runId: task.id,
            taskId: task.id,
            message: event.task.error ?? "Task failed",
          });

          cleanup();
          break;
        }

        default:
          break;
      }
    });

    const keepAlive = setInterval(() => {
      if (!reply.raw.destroyed && !reply.raw.writableEnded) {
        reply.raw.write(": keep-alive\n\n");
      }
    }, 15000);

    request.raw.on("close", cleanup);
    request.raw.on("error", cleanup);
    reply.raw.on("error", cleanup);

    void (async () => {
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

        if (result.output) {
          emitTaskEvent(task.id, {
            type: "task.output.delta",
            taskId: task.id,
            chunk: result.output,
          });
        }

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
      }
    })();
  });
}