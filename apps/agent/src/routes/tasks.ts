import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { createTask, listTasks } from "../task-store.js";
import { executeTask } from "../services/task-runner.js";

const createTaskSchema = z.object({
  kind: z.enum(["chat", "repo-analyze", "repo-command"]),
  prompt: z.string().optional(),
  target: z
    .object({
      kind: z.literal("local_path"),
      path: z.string(),
    })
    .optional(),
  command: z
    .object({
      intent: z.enum([
        "build",
        "test",
        "lint",
        "format",
        "install",
        "custom",
      ]),
      customCommand: z.string().optional(),
    })
    .optional(),
});

export async function tasksRoutes(app: FastifyInstance) {
  app.get("/tasks", async () => {
    const tasks = await listTasks();

    return {
      ok: true,
      tasks,
    };
  });

  app.post("/tasks", async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        ok: false,
        error: "invalid_payload",
        issues: parsed.error.issues,
      });
    }

    const input = parsed.data;

    const now = new Date().toISOString();

    const task = await createTask({
      id: randomUUID(),
      kind: input.kind,
      status: "queued",
      prompt: input.prompt,
      target: input.target,
      command: input.command,
      createdAt: now,
      updatedAt: now,
    });

    // execução assíncrona
    queueMicrotask(() => {
      executeTask(task).catch((err) => {
        console.error("Task execution failed:", err);
      });
    });

    return reply.status(202).send({
      ok: true,
      task,
    });
  });
}