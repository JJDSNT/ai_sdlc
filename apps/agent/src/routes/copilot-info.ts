import type { FastifyInstance } from "fastify";

export async function registerCopilotInfoRoute(app: FastifyInstance) {
  app.get("/copilot/info", async () => {
    return {
      name: "ai_sdlc_agent",
      version: "0.1.0",
      protocol: "ag-ui",
      endpoints: {
        info: "/copilot/info",
        run: "/copilot/run",
        stream: "/copilot/stream",
      },
      transports: ["http", "sse"],
      capabilities: {
        streaming: true,
        threads: true,
        tools: true,
        humanInTheLoop: false,
        checkpoints: false,
      },
    };
  });
}