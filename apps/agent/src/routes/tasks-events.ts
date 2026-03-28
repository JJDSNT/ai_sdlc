import type { FastifyInstance } from "fastify";
import { getTask, subscribeToTask } from "../task-store.js";

export async function taskEventsRoutes(app: FastifyInstance) {
  app.get("/tasks/:id/events", async (request, reply) => {
    const { id } = request.params as { id: string };

    const task = getTask(id);

    if (!task) {
      return reply.status(404).send({
        ok: false,
        error: "task_not_found",
        message: "Task não encontrada",
      });
    }

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    if (typeof reply.raw.flushHeaders === "function") {
      reply.raw.flushHeaders();
    }

    const sendEvent = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent("task.snapshot", task);

    const unsubscribe = subscribeToTask(id, (updatedTask) => {
      sendEvent("task.updated", updatedTask);

      if (
        updatedTask.status === "succeeded" ||
        updatedTask.status === "failed" ||
        updatedTask.status === "cancelled"
      ) {
        sendEvent("task.completed", updatedTask);
      }
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