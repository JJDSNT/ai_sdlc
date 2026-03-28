// apps/agent/src/routes/tasks.ts

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { TaskInput, TaskResult } from "../task.js";
import { runTask } from "../services/run-task.js";

const createTaskSchema = z.object({
  prompt: z.string().min(1),
  repoPath: z.string().optional(),
});

export async function taskRoutes(app: FastifyInstance) {
  app.post("/tasks", async (request, reply) => {
    const body = createTaskSchema.parse(request.body) as TaskInput;

    try {
      const { stdout, stderr } = await runTask(body.prompt);

      const result: TaskResult = {
        id: crypto.randomUUID(),
        status: "succeeded",
        summary: stdout || `Executado: ${body.prompt}`,
        logs: stderr || "Execução concluída",
      };

      return reply.send(result);
    } catch (error) {
      const result: TaskResult = {
        id: crypto.randomUUID(),
        status: "failed",
        summary: "Falha na execução",
        logs: error instanceof Error ? error.message : "Erro desconhecido",
      };

      return reply.code(500).send(result);
    }
  });
}