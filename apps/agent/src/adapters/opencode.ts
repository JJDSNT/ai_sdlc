// apps/agent/src/adapters/opencode.ts

export type OpenCodeSession = {
  id: string;
  title: string;
  version: string;
  directory: string;
};

export type OpenCodePart = {
  id?: string;
  type: string;
  text?: string;
  state?: {
    status?: string;
    output?: string;
    error?: string;
  };
  [key: string]: unknown;
};

export type OpenCodeMessageResponse = {
  info?: {
    id?: string;
    sessionID?: string;
    role?: string;
    [key: string]: unknown;
  };
  parts: OpenCodePart[];
  [key: string]: unknown;
};

export type NormalizedAssistantMessage = {
  text: string;
  reasoning: string[];
  tools: Array<{
    status?: string;
    output?: string;
    error?: string;
    raw: OpenCodePart;
  }>;
  parts: OpenCodePart[];
  messageId?: string;
  sessionId?: string;
  role?: string;
};

export type CreateSessionInput = {
  title?: string;
};

export type SendMessageInput = {
  sessionId: string;
  text: string;
};

export type SendMessageStreamInput = SendMessageInput & {
  onDelta?: (chunk: string) => void;
};

export type RunShellInput = {
  sessionId: string;
  command: string;
  agent?: string;
  model?: string;
};

export type FindTextMatch = {
  path: string;
  lines?: string;
  line_number?: number;
  absolute_offset?: number;
  submatches?: Array<{
    match?: string;
    start?: number;
    end?: number;
  }>;
  [key: string]: unknown;
};

export type FindTextInput = {
  pattern: string;
};

export type FindFilesInput = {
  query: string;
  type?: "file" | "directory";
  directory?: string;
  limit?: number;
};

export type ReadFileInput = {
  path: string;
};

export type ListFilesInput = {
  path?: string;
};

export type FileNode = {
  name?: string;
  path?: string;
  type?: string;
  children?: FileNode[];
  [key: string]: unknown;
};

export type FileContentResponse = {
  path?: string;
  content?: string;
  [key: string]: unknown;
};

export type FileDiff = {
  path?: string;
  oldPath?: string;
  newPath?: string;
  hunks?: unknown[];
  [key: string]: unknown;
};

export type GetDiffInput = {
  sessionId: string;
  messageId?: string;
};

export class OpenCodeApiError extends Error {
  readonly status?: number;
  readonly body?: string;
  override readonly cause?: unknown;

  constructor(params: {
    message: string;
    status?: number;
    body?: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "OpenCodeApiError";
    this.status = params.status;
    this.body = params.body;
    this.cause = params.cause;
  }
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function withQuery(
  baseUrl: string,
  path: string,
  query: Record<string, string | number | undefined>
) {
  const url = new URL(joinUrl(baseUrl, path));

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function readErrorBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

export function extractTextParts(parts: OpenCodePart[]): string {
  return parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text?.trim())
    .filter((value): value is string => Boolean(value))
    .join("\n\n");
}

export function extractReasoningParts(parts: OpenCodePart[]): string[] {
  return parts
    .filter((part) => part.type === "reasoning")
    .map((part) => (typeof part.text === "string" ? part.text.trim() : ""))
    .filter(Boolean);
}

export function extractToolParts(parts: OpenCodePart[]) {
  return parts
    .filter((part) => part.type === "tool")
    .map((part) => ({
      status: part.state?.status,
      output: part.state?.output,
      error: part.state?.error,
      raw: part,
    }));
}

export function normalizeAssistantMessage(
  payload: OpenCodeMessageResponse
): NormalizedAssistantMessage {
  return {
    text: extractTextParts(payload.parts),
    reasoning: extractReasoningParts(payload.parts),
    tools: extractToolParts(payload.parts),
    parts: payload.parts,
    messageId: payload.info?.id,
    sessionId: payload.info?.sessionID,
    role: payload.info?.role,
  };
}

function buildMessageRequestBody(text: string) {
  return JSON.stringify({
    parts: [
      {
        type: "text",
        text,
      },
    ],
  });
}

function tryParseJson(value: string): unknown | undefined {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function extractDeltaFromUnknown(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  const directCandidates = [
    record.delta,
    record.text,
    record.content,
    record.chunk,
    record.output,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  const nestedData = record.data;
  if (nestedData && typeof nestedData === "object") {
    const nested = nestedData as Record<string, unknown>;
    const nestedCandidates = [
      nested.delta,
      nested.text,
      nested.content,
      nested.chunk,
      nested.output,
    ];

    for (const candidate of nestedCandidates) {
      if (typeof candidate === "string" && candidate.length > 0) {
        return candidate;
      }
    }
  }

  return undefined;
}

function splitSseEvents(buffer: string): { events: string[]; rest: string } {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const parts = normalized.split("\n\n");

  if (parts.length === 1) {
    return {
      events: [],
      rest: buffer,
    };
  }

  const rest = parts.pop() ?? "";

  return {
    events: parts,
    rest,
  };
}

function parseSseEventBlock(block: string): string[] {
  const deltas: string[] = [];
  const lines = block.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith(":")) {
      continue;
    }

    if (!trimmed.startsWith("data:")) {
      continue;
    }

    const rawData = trimmed.slice(5).trim();

    if (!rawData) {
      continue;
    }

    const parsed = tryParseJson(rawData);
    const delta = extractDeltaFromUnknown(parsed);

    if (delta) {
      deltas.push(delta);
      continue;
    }

    if (typeof parsed === "string" && parsed.trim()) {
      deltas.push(parsed.trim());
      continue;
    }

    if (!parsed) {
      deltas.push(rawData);
    }
  }

  return deltas;
}

function parseNdjsonLines(buffer: string): { deltas: string[]; rest: string } {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const rest = lines.pop() ?? "";
  const deltas: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parsed = tryParseJson(trimmed);
    const delta = extractDeltaFromUnknown(parsed);

    if (delta) {
      deltas.push(delta);
      continue;
    }

    if (typeof parsed === "string" && parsed.trim()) {
      deltas.push(parsed.trim());
      continue;
    }

    if (!parsed) {
      deltas.push(trimmed);
    }
  }

  return { deltas, rest };
}

export class OpenCodeClient {
  constructor(private readonly baseUrl: string) {}

  getBaseUrl() {
    return this.baseUrl;
  }

  async healthcheck(): Promise<boolean> {
    try {
      const response = await fetch(joinUrl(this.baseUrl, "/global/health"), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      return response.ok;
    } catch (cause) {
      throw new OpenCodeApiError({
        message: "Failed to reach OpenCode server",
        cause,
      });
    }
  }

  async createSession(input: CreateSessionInput = {}): Promise<OpenCodeSession> {
    const response = await fetch(joinUrl(this.baseUrl, "/session"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.title ?? "ai_sdlc task",
      }),
    });

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to create OpenCode session",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    return (await response.json()) as OpenCodeSession;
  }

  async sendMessage(
    input: SendMessageInput
  ): Promise<NormalizedAssistantMessage> {
    const response = await fetch(
      joinUrl(this.baseUrl, `/session/${input.sessionId}/message`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: buildMessageRequestBody(input.text),
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to send message to OpenCode session",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    const payload = (await response.json()) as OpenCodeMessageResponse;
    return normalizeAssistantMessage(payload);
  }

  async sendMessageStream(
    input: SendMessageStreamInput
  ): Promise<NormalizedAssistantMessage> {
    const response = await fetch(
      joinUrl(this.baseUrl, `/session/${input.sessionId}/message`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/x-ndjson, application/json, text/plain",
        },
        body: buildMessageRequestBody(input.text),
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to send message to OpenCode session",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (!response.body) {
      const payload = (await response.json()) as OpenCodeMessageResponse;
      const normalized = normalizeAssistantMessage(payload);

      if (normalized.text) {
        input.onDelta?.(normalized.text);
      }

      return normalized;
    }

    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as OpenCodeMessageResponse;
      const normalized = normalizeAssistantMessage(payload);

      if (normalized.text) {
        input.onDelta?.(normalized.text);
      }

      return normalized;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      if (contentType.includes("text/event-stream")) {
        const { events, rest } = splitSseEvents(buffer);
        buffer = rest;

        for (const eventBlock of events) {
          const deltas = parseSseEventBlock(eventBlock);

          for (const delta of deltas) {
            accumulatedText += delta;
            input.onDelta?.(delta);
          }
        }

        continue;
      }

      if (contentType.includes("application/x-ndjson")) {
        const { deltas, rest } = parseNdjsonLines(buffer);
        buffer = rest;

        for (const delta of deltas) {
          accumulatedText += delta;
          input.onDelta?.(delta);
        }

        continue;
      }

      // Fallback genérico para texto puro/chunked.
      if (buffer) {
        accumulatedText += buffer;
        input.onDelta?.(buffer);
        buffer = "";
      }
    }

    const remaining = buffer.trim();
    if (remaining) {
      const parsed = tryParseJson(remaining);
      const delta = extractDeltaFromUnknown(parsed);

      if (delta) {
        accumulatedText += delta;
        input.onDelta?.(delta);
      } else if (!parsed) {
        accumulatedText += remaining;
        input.onDelta?.(remaining);
      }
    }

    return {
      text: accumulatedText.trim(),
      reasoning: [],
      tools: [],
      parts: [],
      sessionId: input.sessionId,
      role: "assistant",
    };
  }

  async runShell(input: RunShellInput): Promise<NormalizedAssistantMessage> {
    const response = await fetch(
      joinUrl(this.baseUrl, `/session/${input.sessionId}/shell`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: input.agent ?? "build",
          model: input.model,
          command: input.command,
        }),
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to run shell command in OpenCode session",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    const payload = (await response.json()) as OpenCodeMessageResponse;
    return normalizeAssistantMessage(payload);
  }

  async findText(input: FindTextInput): Promise<FindTextMatch[]> {
    const response = await fetch(
      withQuery(this.baseUrl, "/find", {
        pattern: input.pattern,
      }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to search text in workspace",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    return (await response.json()) as FindTextMatch[];
  }

  async findFiles(input: FindFilesInput): Promise<string[]> {
    const response = await fetch(
      withQuery(this.baseUrl, "/find/file", {
        query: input.query,
        type: input.type,
        directory: input.directory,
        limit: input.limit,
      }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to find files in workspace",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    return (await response.json()) as string[];
  }

  async listFiles(input: ListFilesInput = {}): Promise<FileNode[]> {
    const response = await fetch(
      withQuery(this.baseUrl, "/file", {
        path: input.path,
      }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to list files",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    return (await response.json()) as FileNode[];
  }

  async readFile(input: ReadFileInput): Promise<string> {
    const response = await fetch(
      withQuery(this.baseUrl, "/file/content", {
        path: input.path,
      }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to read file",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    const payload = (await response.json()) as FileContentResponse;
    return payload.content ?? "";
  }

  async getDiff(input: GetDiffInput): Promise<FileDiff[]> {
    const response = await fetch(
      withQuery(this.baseUrl, `/session/${input.sessionId}/diff`, {
        messageID: input.messageId,
      }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new OpenCodeApiError({
        message: "Failed to get session diff",
        status: response.status,
        body: await readErrorBody(response),
      });
    }

    return (await response.json()) as FileDiff[];
  }
}

export function createOpenCodeClient() {
  const baseUrl =
    process.env.OPENCODE_BASE_URL?.trim() || "http://127.0.0.1:4096";

  return new OpenCodeClient(baseUrl);
}