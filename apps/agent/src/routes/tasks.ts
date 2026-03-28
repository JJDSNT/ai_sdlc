import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { TaskInput } from "../task.js";
import { runWithOpenCodeServer } from "../adapters/opencode-server.js";

const createTaskSchema = z.object({
  prompt: z.string().min(1),
  repoPath: z.string().optional(),
});

export async function taskRoutes(app: FastifyInstance) {
  app.post("/tasks", async (request, reply) => {
    try {
      const body = createTaskSchema.parse(request.body) as TaskInput;
      const result = await runWithOpenCodeServer(body);
      return reply.send(result);
    } catch (error) {
      return reply.code(500).send({
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });
}