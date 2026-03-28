import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: "openai:gpt-4o-mini",
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

/*
To use CopilotKit without its built-in agent, you can integrate it with an external agent framework like LangGraph, Microsoft Agent Framework, or CrewAI. This approach uses CopilotKit as the frontend layer (UI components, state management, generative UI) that connects to your own custom backend agent logic. 
CopilotKit docs
CopilotKit docs
 +3
Key Methods for External Agent Integration
CopilotKit is designed to be framework-agnostic, enabling a headless UI experience that bridges your custom agent logic to your application's frontend using the Agent-User Interaction (AG-UI) protocol. 
CopilotKit docs
CopilotKit docs
 +1
Choose an Agent Framework: Select an external framework for building your agent's backend logic. Popular options include:
LangGraph (part of LangChain) for stateful agent workflows.
Google's ADK (Agent Development Kit).
Microsoft Agent Framework.
CrewAI Flows for orchestrating sequential agent tasks.
Set up the Copilot Runtime: In your backend, you will set up a Copilot Runtime instance that acts as a proxy, handling HTTP requests from the frontend and forwarding them to your custom agent framework.
Use the useAgent() hook: On the frontend (React), you interact with the agent using the useAgent() hook, which provides a consistent interface to manage messages, state, and execution status, abstracting away the backend complexity. This allows you to build a completely custom UI without using CopilotKit's default components, gaining full control over the user experience.
Programmatic Control: The useCopilotKit hook also allows you to run agents programmatically (e.g., triggering a run via a button click rather than a chat input). 
CopilotKit docs
CopilotKit docs
 +9
By following these methods, you leverage CopilotKit's robust frontend infrastructure (like Generative UI and state synchronization) while maintaining complete control over your agent's backend logic and execution flow. 
CopilotKit
CopilotKit
 +1
 */