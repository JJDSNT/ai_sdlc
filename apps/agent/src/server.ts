import Fastify from "fastify";
import cors from "@fastify/cors";
import { taskRoutes } from "./routes/tasks.js";
import { taskEventsRoutes } from "./routes/tasks-events.js";
import { createOpenCodeClient } from "./adapters/opencode.js";

const app = Fastify({
  logger: true,
});

async function registerPlugins() {
  await app.register(cors, {
    origin: "http://localhost:3000",
  });
}

async function registerRoutes() {
  app.get("/", async () => {
    return { message: "agent is running" };
  });

  app.get("/health", async () => {
    return { ok: true, service: "agent" };
  });

  app.get("/health/opencode", async (_request, reply) => {
    const client = createOpenCodeClient();

    try {
      const ok = await client.healthcheck();

      if (!ok) {
        return reply.status(502).send({
          ok: false,
          dependency: "opencode",
          reachable: false,
        });
      }

      return {
        ok: true,
        dependency: "opencode",
        reachable: true,
      };
    } catch (error) {
      return reply.status(502).send({
        ok: false,
        dependency: "opencode",
        reachable: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
  });

  await app.register(taskRoutes);
  await app.register(taskEventsRoutes);
}

async function checkDependencies() {
  const client = createOpenCodeClient();

  try {
    const ok = await client.healthcheck();

    if (ok) {
      app.log.info("OpenCode is reachable");
    } else {
      app.log.warn("OpenCode responded but not OK");
    }
  } catch (error) {
    app.log.warn(
      { error },
      "OpenCode is NOT reachable at startup (continuing anyway)"
    );
  }
}

async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = Number(process.env.PORT ?? 3001);
    const host = process.env.HOST ?? "0.0.0.0";

    await app.listen({ port, host });

    app.log.info(`🚀 Agent running at http://${host}:${port}`);

    await checkDependencies();
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();