import type { FastifyInstance } from "fastify";
import { createOpenCodeClient } from "../adapters/opencode.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "agent",
    };
  });

  app.get("/health/opencode", async (_request, reply) => {
    const client = createOpenCodeClient();

    try {
      const ok = await client.healthcheck();

      if (!ok) {
        return reply.status(502).send({
          status: "error",
          dependency: "opencode",
          reachable: false,
        });
      }

      return {
        status: "ok",
        dependency: "opencode",
        reachable: true,
      };
    } catch (error) {
      return reply.status(502).send({
        status: "error",
        dependency: "opencode",
        reachable: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}