import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  createOpenCodeClient,
  OpenCodeApiError,
  type NormalizedAssistantMessage,
} from "../adapters/opencode.js";

export type RunRepoAnalyzeTaskInput = {
  prompt: string;
  repositoryRoot: string;
};

export type RunRepoAnalyzeTaskResult = {
  sessionId: string;
  output: string;
  message: NormalizedAssistantMessage;
  repository: {
    root: string;
    entries: string[];
    detectedFiles: string[];
    detectedApps: string[];
  };
};

export class RunRepoAnalyzeTaskError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "RunRepoAnalyzeTaskError";
  }
}

async function pathExists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function safeReadTextFile(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function listTopLevelEntries(repositoryRoot: string) {
  const entries = await readdir(repositoryRoot, { withFileTypes: true });

  return entries
    .map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function buildRepositoryBootstrap(repositoryRoot: string) {
  const exists = await pathExists(repositoryRoot);

  if (!exists) {
    throw new RunRepoAnalyzeTaskError(
      `Repository root does not exist: ${repositoryRoot}`
    );
  }

  const topLevelEntries = await listTopLevelEntries(repositoryRoot);

  const candidateFiles = [
    "package.json",
    "pnpm-workspace.yaml",
    "turbo.json",
    "tsconfig.json",
    ".gitignore",
    "README.md",
    "apps/web/package.json",
    "apps/agent/package.json",
  ];

  const detectedFiles: string[] = [];

  for (const relativePath of candidateFiles) {
    const absolutePath = path.join(repositoryRoot, relativePath);

    if (await pathExists(absolutePath)) {
      detectedFiles.push(relativePath);
    }
  }

  const detectedApps = topLevelEntries
    .filter((entry) => entry.isDirectory)
    .map((entry) => entry.name)
    .filter((name) => name === "apps" || name === "packages");

  const rootPackageJson = await safeReadTextFile(
    path.join(repositoryRoot, "package.json")
  );

  const webPackageJson = await safeReadTextFile(
    path.join(repositoryRoot, "apps/web/package.json")
  );

  const agentPackageJson = await safeReadTextFile(
    path.join(repositoryRoot, "apps/agent/package.json")
  );

  return {
    repositoryRoot,
    topLevelEntries: topLevelEntries.map((entry) =>
      entry.isDirectory ? `${entry.name}/` : entry.name
    ),
    detectedFiles,
    detectedApps,
    rootPackageJson,
    webPackageJson,
    agentPackageJson,
  };
}

function buildAnalysisPrompt(input: {
  userPrompt: string;
  bootstrap: Awaited<ReturnType<typeof buildRepositoryBootstrap>>;
}) {
  const {
    userPrompt,
    bootstrap: {
      repositoryRoot,
      topLevelEntries,
      detectedFiles,
      detectedApps,
      rootPackageJson,
      webPackageJson,
      agentPackageJson,
    },
  } = input;

  return `
Você está analisando um repositório local real.

Objetivo do usuário:
${userPrompt}

Contexto do repositório:
- repositoryRoot: ${repositoryRoot}
- topLevelEntries:
${topLevelEntries.map((entry) => `  - ${entry}`).join("\n")}
- detectedFiles:
${detectedFiles.map((file) => `  - ${file}`).join("\n") || "  - none"}
- detectedApps:
${detectedApps.map((app) => `  - ${app}`).join("\n") || "  - none"}

Conteúdo relevante do root package.json:
${rootPackageJson ?? "[not found]"}

Conteúdo relevante de apps/web/package.json:
${webPackageJson ?? "[not found]"}

Conteúdo relevante de apps/agent/package.json:
${agentPackageJson ?? "[not found]"}

Instruções:
- Responda com foco arquitetural e prático.
- Explique a relação entre apps/web e apps/agent se isso aparecer no contexto.
- Liste os principais pontos do monorepo.
- Aponte próximos passos técnicos realistas.
- Não invente arquivos que não estejam no contexto.
`.trim();
}

export async function runRepoAnalyzeTask(
  input: RunRepoAnalyzeTaskInput
): Promise<RunRepoAnalyzeTaskResult> {
  const client = createOpenCodeClient();

  try {
    const bootstrap = await buildRepositoryBootstrap(input.repositoryRoot);

    const session = await client.createSession({
      title: "ai_sdlc repo analyze",
    });

    const message = await client.sendMessage({
      sessionId: session.id,
      text: buildAnalysisPrompt({
        userPrompt: input.prompt,
        bootstrap,
      }),
    });

    return {
      sessionId: session.id,
      output: message.text || "Análise concluída sem texto de saída",
      message,
      repository: {
        root: bootstrap.repositoryRoot,
        entries: bootstrap.topLevelEntries,
        detectedFiles: bootstrap.detectedFiles,
        detectedApps: bootstrap.detectedApps,
      },
    };
  } catch (error) {
    if (error instanceof OpenCodeApiError) {
      throw new RunRepoAnalyzeTaskError(
        `OpenCode failure: ${error.message}`,
        error
      );
    }

    if (error instanceof RunRepoAnalyzeTaskError) {
      throw error;
    }

    throw new RunRepoAnalyzeTaskError(
      error instanceof Error
        ? error.message
        : "Unknown error while running repo analyze task",
      error
    );
  }
}