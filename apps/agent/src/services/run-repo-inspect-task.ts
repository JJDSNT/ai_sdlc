import path from "node:path";
import {
  createOpenCodeClient,
  OpenCodeApiError,
  type NormalizedAssistantMessage,
} from "../adapters/opencode.js";

export type RunRepoInspectTaskInput = {
  prompt: string;
  repositoryRoot: string;
};

export type RunRepoInspectTaskResult = {
  sessionId: string;
  output: string;
  message: NormalizedAssistantMessage;
  repository: {
    root: string;
    files: string[];
    snippets: Array<{
      path: string;
      content: string;
    }>;
  };
};

export class RunRepoInspectTaskError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "RunRepoInspectTaskError";
  }
}

const IMPORTANT_FILE_QUERIES = [
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.json",
  "README.md",
  "next.config",
  "fastify",
  "apps/web",
  "apps/agent",
];

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function truncate(text: string, max = 4000) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n... [truncated]`;
}

function normalizeFilePath(filePath: string, repositoryRoot: string) {
  if (filePath.startsWith(repositoryRoot)) {
    return path.relative(repositoryRoot, filePath) || ".";
  }

  return filePath;
}

async function discoverRelevantFiles(repositoryRoot: string) {
  const client = createOpenCodeClient();

  const allResults = await Promise.all(
    IMPORTANT_FILE_QUERIES.map(async (query) => {
      try {
        return await client.findFiles({
          query,
          directory: repositoryRoot,
          limit: 20,
        });
      } catch {
        return [];
      }
    })
  );

  const files = unique(
    allResults
      .flat()
      .filter((value) => typeof value === "string" && value.length > 0)
  );

  const prioritized = files
    .map((filePath) => normalizeFilePath(filePath, repositoryRoot))
    .filter((filePath) => {
      return (
        filePath === "package.json" ||
        filePath === "pnpm-workspace.yaml" ||
        filePath === "turbo.json" ||
        filePath === "README.md" ||
        filePath.startsWith("apps/web/") ||
        filePath.startsWith("apps/agent/")
      );
    });

  return unique(prioritized).slice(0, 12);
}

async function readRelevantSnippets(repositoryRoot: string, files: string[]) {
  const client = createOpenCodeClient();
  const selected = files.slice(0, 6);

  const snippets = await Promise.all(
    selected.map(async (relativePath) => {
      const absolutePath = path.join(repositoryRoot, relativePath);

      try {
        const content = await client.readFile({
          path: absolutePath,
        });

        return {
          path: relativePath,
          content: truncate(content, 3000),
        };
      } catch {
        return null;
      }
    })
  );

  return snippets.filter(
    (value): value is { path: string; content: string } => Boolean(value)
  );
}

function buildInspectPrompt(input: {
  userPrompt: string;
  repositoryRoot: string;
  files: string[];
  snippets: Array<{ path: string; content: string }>;
}) {
  const { userPrompt, repositoryRoot, files, snippets } = input;

  return `
Você está analisando um repositório real.

Objetivo do usuário:
${userPrompt}

Repository root:
${repositoryRoot}

Arquivos relevantes encontrados:
${files.map((file) => `- ${file}`).join("\n") || "- nenhum"}

Trechos de arquivos:
${snippets
  .map(
    (snippet) => `
### ${snippet.path}
\`\`\`
${snippet.content}
\`\`\`
`.trim()
  )
  .join("\n\n")}

Instruções:
- Faça uma análise técnica objetiva.
- Explique a arquitetura detectada.
- Destaque a relação entre apps/web e apps/agent se houver evidência.
- Aponte riscos, lacunas e próximos passos.
- Não invente arquivos ou detalhes fora do contexto.
`.trim();
}

export async function runRepoInspectTask(
  input: RunRepoInspectTaskInput
): Promise<RunRepoInspectTaskResult> {
  const client = createOpenCodeClient();

  try {
    const files = await discoverRelevantFiles(input.repositoryRoot);
    const snippets = await readRelevantSnippets(input.repositoryRoot, files);

    const session = await client.createSession({
      title: "ai_sdlc repo inspect",
    });

    const message = await client.sendMessage({
      sessionId: session.id,
      text: buildInspectPrompt({
        userPrompt: input.prompt,
        repositoryRoot: input.repositoryRoot,
        files,
        snippets,
      }),
    });

    return {
      sessionId: session.id,
      output: message.text || "Inspeção concluída sem texto de saída",
      message,
      repository: {
        root: input.repositoryRoot,
        files,
        snippets,
      },
    };
  } catch (error) {
    if (error instanceof OpenCodeApiError) {
      throw new RunRepoInspectTaskError(
        `OpenCode failure: ${error.message}`,
        error
      );
    }

    throw new RunRepoInspectTaskError(
      error instanceof Error
        ? error.message
        : "Unknown error while running repo inspect task",
      error
    );
  }
}