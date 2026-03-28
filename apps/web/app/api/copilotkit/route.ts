// app/api/copilotkit/route.ts

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

function getAgentUrl() {
  const rawUrl =
    process.env.AGENT_URL?.trim() ||
    process.env.NEXT_PUBLIC_AGENT_URL?.trim() ||
    "http://localhost:3001";

  return rawUrl.replace(/\/+$/, "");
}

const agentUrl = getAgentUrl();

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({
      url: `${agentUrl}/copilot/stream`,
    }),
  },
});

const serviceAdapter = new ExperimentalEmptyAdapter();

const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter,
  endpoint: "/api/copilotkit",
});

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}