// apps/agent/src/services/run-chat-task.ts

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
  onDelta?: (chunk: string) => void;
};

export type RunChatTaskResult = {
  sessionId: string;
  output: string;
  message: NormalizedAssistantMessage;
};

export class RunChatTaskError extends Error {
  override cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "RunChatTaskError";
    this.cause = cause;
  }
}

function buildSessionTitle(input: RunChatTaskInput): string {
  if (input.title?.trim()) {
    return input.title.trim();
  }

  if (input.threadId?.trim()) {
    return `ai_sdlc chat:${input.threadId.trim()}`;
  }

  return "ai_sdlc chat";
}

export async function runChatTask(
  input: RunChatTaskInput
): Promise<RunChatTaskResult> {
  const client = createOpenCodeClient();
  const prompt = input.prompt?.trim();

  if (!prompt) {
    throw new RunChatTaskError("Prompt is required");
  }

  try {
    let sessionId = input.sessionId?.trim();

    if (!sessionId) {
      const session = await client.createSession({
        title: buildSessionTitle(input),
      });

      sessionId = session.id;
    }

    const message = await client.sendMessageStream({
      sessionId,
      text: prompt,
      onDelta: input.onDelta,
    });

    const output = message.text?.trim() || "Execução concluída sem texto de saída";

    // Fallback atual: como o OpenCode ainda responde de forma bloqueante,
    // emitimos a saída final inteira uma única vez.
    if (output) {
      input.onDelta?.(output);
    }

    return {
      sessionId,
      output,
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