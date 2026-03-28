import {
  createOpenCodeClient,
  OpenCodeApiError,
  type NormalizedAssistantMessage,
} from "../adapters/opencode.js";

export type RunChatTaskInput = {
  prompt: string;
  sessionId?: string;
  threadId?: string;
  title?: string;
};

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
  input: RunChatTaskInput
): Promise<RunChatTaskResult> {
  const client = createOpenCodeClient();

  if (!input.prompt?.trim()) {
    throw new RunChatTaskError("Prompt is required");
  }

  try {
    let sessionId = input.sessionId;

    if (!sessionId) {
      const session = await client.createSession({
        title:
          input.title ??
          (input.threadId ? `ai_sdlc chat:${input.threadId}` : "ai_sdlc chat"),
      });

      sessionId = session.id;
    }

    const message = await client.sendMessage({
      sessionId,
      text: input.prompt.trim(),
    });

    return {
      sessionId,
      output: message.text?.trim() || "Execução concluída sem texto de saída",
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