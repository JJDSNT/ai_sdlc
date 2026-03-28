import type { TaskInput, TaskResult } from "../task.js";

type OpenCodeSession = {
  id: string;
  title: string;
  version: string;
  directory: string;
};

type OpenCodeMessageResponse = {
  info: {
    id: string;
    sessionID: string;
    role: string;
  };
  parts: Array<{
    id: string;
    type: string;
    text?: string;
    state?: {
      status?: string;
      output?: string;
      error?: string;
    };
  }>;
};

const OPENCODE_BASE_URL =
  process.env.OPENCODE_BASE_URL || "http://127.0.0.1:4096";

async function createSession(): Promise<OpenCodeSession> {
  const res = await fetch(`${OPENCODE_BASE_URL}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "ai_sdlc task",
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao criar sessão no OpenCode: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as OpenCodeSession;
}

function extractTextFromParts(parts: OpenCodeMessageResponse["parts"]) {
  const textParts = parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text?.trim())
    .filter(Boolean);

  if (textParts.length > 0) {
    return textParts.join("\n\n");
  }

  const toolOutputs = parts
    .filter((part) => part.type === "tool")
    .map((part) => part.state?.output || part.state?.error)
    .filter(Boolean);

  return toolOutputs.join("\n\n");
}

export async function runWithOpenCodeServer(
  input: TaskInput
): Promise<TaskResult> {
  try {
    const session = await createSession();

    const res = await fetch(
      `${OPENCODE_BASE_URL}/session/${session.id}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parts: [
            {
              type: "text",
              text: input.prompt,
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Falha ao enviar mensagem ao OpenCode: ${res.status} ${await res.text()}`
      );
    }

    const data = (await res.json()) as OpenCodeMessageResponse;
    const output = extractTextFromParts(data.parts);

    return {
      id: crypto.randomUUID(),
      status: "succeeded",
      summary: output || "Execução concluída sem texto de saída",
      logs: JSON.stringify(
        {
          sessionId: session.id,
          messageId: data.info?.id,
          parts: data.parts,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      id: crypto.randomUUID(),
      status: "failed",
      summary: "Erro ao executar OpenCode Server",
      logs:
        error instanceof Error ? error.message : "Erro desconhecido no OpenCode Server",
    };
  }
}