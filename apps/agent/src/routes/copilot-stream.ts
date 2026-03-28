// apps/agent/src/routes/copilot-stream.ts

import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply } from "fastify";
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
      (message) =>
        message.role === "user" &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    );

  return lastUser?.content?.trim() ?? "";
}

function normalizeThreadId(threadId?: string): string {
  const value = threadId?.trim();
  if (value) return value;
  return `thread_${randomUUID().replace(/-/g, "")}`;
}

function sendEvent(reply: FastifyReply, data: unknown) {
  if (reply.raw.destroyed || reply.raw.writableEnded) {
    return;
  }

  const payload = JSON.stringify(data);
  reply.raw.write(`data: ${payload}\n\n`);
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

    const effectiveThreadId = normalizeThreadId(body.threadId);
    const now = new Date().toISOString();

    const task = await createTask({
      id: randomUUID(),
      kind: "chat",
      status: "pending",
      input: {
        threadId: effectiveThreadId,
        sessionId: body.sessionId,
        messages: body.messages,
      },
      createdAt: now,
      updatedAt: now,
    });

    const assistantMessageId = `msg_${randomUUID().replace(/-/g, "")}`;

    reply.raw.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");

    if (typeof reply.raw.flushHeaders === "function") {
      reply.raw.flushHeaders();
    }

    reply.raw.write("retry: 3000\n\n");

    sendEvent(reply, {
      type: "RUN_STARTED",
      runId: task.id,
      threadId: effectiveThreadId,
    });

    let textStarted = false;
    let closed = false;

    const keepAlive = setInterval(() => {
      if (!reply.raw.destroyed && !reply.raw.writableEnded) {
        reply.raw.write(": keep-alive\n\n");
      }
    }, 15000);

    const cleanup = () => {
      if (closed) return;
      closed = true;

      clearInterval(keepAlive);
      unsubscribe();

      if (!reply.raw.destroyed && !reply.raw.writableEnded) {
        reply.raw.end();
      }
    };

    const ensureTextStarted = () => {
      if (textStarted) return;

      textStarted = true;

      sendEvent(reply, {
        type: "TEXT_MESSAGE_START",
        messageId: assistantMessageId,
        role: "assistant",
      });
    };

    const unsubscribe = subscribeToTaskEvents(task.id, (event: TaskEvent) => {
      if (reply.raw.destroyed || reply.raw.writableEnded) {
        cleanup();
        return;
      }

      switch (event.type) {
        case "task.output.delta": {
          if (!event.chunk) break;

          ensureTextStarted();

          sendEvent(reply, {
            type: "TEXT_MESSAGE_CONTENT",
            messageId: assistantMessageId,
            delta: event.chunk,
          });
          break;
        }

        case "task.completed": {
          const content =
            event.task.output?.finalMessage?.content ??
            event.task.output?.output ??
            "";

          if (!textStarted && content) {
            ensureTextStarted();

            sendEvent(reply, {
              type: "TEXT_MESSAGE_CONTENT",
              messageId: assistantMessageId,
              delta: content,
            });
          }

          if (textStarted) {
            sendEvent(reply, {
              type: "TEXT_MESSAGE_END",
              messageId: assistantMessageId,
            });
          }

          sendEvent(reply, {
            type: "RUN_FINISHED",
            runId: task.id,
            threadId: effectiveThreadId,
          });

          cleanup();
          break;
        }

        case "task.failed": {
          if (textStarted) {
            sendEvent(reply, {
              type: "TEXT_MESSAGE_END",
              messageId: assistantMessageId,
            });
          }

          sendEvent(reply, {
            type: "RUN_ERROR",
            message: event.task.error ?? "Task failed",
          });

          cleanup();
          break;
        }

        default:
          break;
      }
    });

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
          threadId: effectiveThreadId,
          onDelta: (chunk) => {
            if (!chunk) return;

            emitTaskEvent(task.id, {
              type: "task.output.delta",
              taskId: task.id,
              chunk,
            });
          },
        });

        if (!textStarted && result.output) {
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