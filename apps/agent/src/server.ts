//apps/agent/src/server.ts

import Fastify from "fastify";
import cors from "@fastify/cors";

import { tasksRoutes } from "./routes/tasks.js";
import { taskEventsRoutes } from "./routes/tasks-events.js";

import { registerCopilotRoutes } from "./routes/copilot.js";
import { registerCopilotInfoRoute } from "./routes/copilot-info.js";
import { registerCopilotStreamRoute } from "./routes/copilot-stream.js";

import { registerProjectRoutes } from "./routes/projects.js";

import { createOpenCodeClient } from "./adapters/opencode.js";

const app = Fastify({
  logger: true,
});

async function registerPlugins() {
  await app.register(cors, {
    origin: "http://localhost:3000",
  });
}

async function registerBaseRoutes() {
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
}

async function registerRoutes() {
  await registerBaseRoutes();

  // existing
  await app.register(tasksRoutes);
  await app.register(taskEventsRoutes);

 
  await app.register(registerProjectRoutes, {
    prefix: "/api",
  });

  // copilot
  await app.register(registerCopilotInfoRoute);
  await app.register(registerCopilotRoutes);
  await app.register(registerCopilotStreamRoute);
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
    app.log.info(
      `📦 Projects API at http://${host}:${port}/api/projects`
    );

    await checkDependencies();
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

export { app };

start();