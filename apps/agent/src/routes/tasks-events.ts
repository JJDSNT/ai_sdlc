import type { FastifyInstance } from "fastify";
import {
  getTask,
  subscribeToTaskEvents,
  type TaskEvent,
} from "../task-store.js";

export async function taskEventsRoutes(app: FastifyInstance) {
  app.get("/tasks/:id/events", async (request, reply) => {
    const { id } = request.params as { id: string };

    const task = await getTask(id);

    if (!task) {
      return reply.status(404).send({
        ok: false,
        error: "task_not_found",
        message: "Task não encontrada",
      });
    }

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");

    if (typeof reply.raw.flushHeaders === "function") {
      reply.raw.flushHeaders();
    }

    const sendEvent = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent("task.snapshot", task);

    const unsubscribe = subscribeToTaskEvents(id, (event: TaskEvent) => {
      sendEvent(event.type, event);
    });

    const keepAlive = setInterval(() => {
      reply.raw.write(": keep-alive\n\n");
    }, 15000);

    request.raw.on("close", () => {
      clearInterval(keepAlive);
      unsubscribe();
      reply.raw.end();
    });
  });
}