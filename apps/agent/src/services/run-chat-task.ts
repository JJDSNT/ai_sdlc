import {
  createOpenCodeClient,
  OpenCodeApiError,
  type NormalizedAssistantMessage,
} from "../adapters/opencode.js";

export type RunChatTaskResult = {
  sessionId: string;
  output: string;
  message: NormalizedAssistantMessage;
};

export class RunChatTaskError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "RunChatTaskError";
  }
}

export async function runChatTask(
  prompt: string
): Promise<RunChatTaskResult> {
  const client = createOpenCodeClient();

  try {
    const session = await client.createSession({
      title: "ai_sdlc chat",
    });

    const message = await client.sendMessage({
      sessionId: session.id,
      text: prompt,
    });

    return {
      sessionId: session.id,
      output: message.text || "Execução concluída sem texto de saída",
      message,
    };
  } catch (error) {
    if (error instanceof OpenCodeApiError) {
      throw new RunChatTaskError(`OpenCode failure: ${error.message}`, error);
    }

    throw new RunChatTaskError(
      error instanceof Error
        ? error.message
        : "Unknown error while running chat task",
      error
    );
  }
}