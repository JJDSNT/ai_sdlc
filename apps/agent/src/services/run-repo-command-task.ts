import { access } from "node:fs/promises";
import path from "node:path";
import {
  createOpenCodeClient,
  OpenCodeApiError,
  type NormalizedAssistantMessage,
} from "../adapters/opencode.js";
import {
  detectRepositoryContext,
  resolveRepoCommand,
  type RepoCommandIntent,
  type ResolvedRepoCommand,
} from "./repo-command-resolver.js";

export type RunRepoCommandTaskInput = {
  repositoryRoot: string;
  intent: RepoCommandIntent;
  customCommand?: string;
  allowedRoot?: string;
};

export type RunRepoCommandTaskResult = {
  sessionId: string;
  output: string;
  message: NormalizedAssistantMessage;
  resolvedCommand: ResolvedRepoCommand;
  repository: {
    root: string;
    ecosystem: string;
  };
};

export class RunRepoCommandTaskError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "RunRepoCommandTaskError";
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

function resolveSafeRepositoryRoot(repositoryRoot: string, allowedRoot?: string) {
  const resolvedRepoRoot = path.resolve(repositoryRoot);

  if (!allowedRoot) {
    return resolvedRepoRoot;
  }

  const resolvedAllowedRoot = path.resolve(allowedRoot);

  if (
    resolvedRepoRoot !== resolvedAllowedRoot &&
    !resolvedRepoRoot.startsWith(`${resolvedAllowedRoot}${path.sep}`)
  ) {
    throw new RunRepoCommandTaskError(
      `Repository path is outside the allowed root: ${resolvedRepoRoot}`
    );
  }

  return resolvedRepoRoot;
}

function shellEscapeDoubleQuoted(value: string) {
  return value.replace(/(["\\$`])/g, "\\$1");
}

function wrapCommandInRepositoryContext(repositoryRoot: string, command: string) {
  const escapedRoot = shellEscapeDoubleQuoted(repositoryRoot);
  return `cd "${escapedRoot}" && ${command}`;
}

function validateCustomCommand(command: string) {
  const forbiddenPatterns = [
    /(^|[\s;&|])rm\s+-rf\b/,
    /(^|[\s;&|])sudo\b/,
    /(^|[\s;&|])shutdown\b/,
    /(^|[\s;&|])reboot\b/,
    /(^|[\s;&|])mkfs\b/,
    /(^|[\s;&|])dd\b/,
    /(^|[\s;&|])chmod\s+777\b/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(command)) {
      throw new RunRepoCommandTaskError(
        `Custom command contains a forbidden pattern: ${command}`
      );
    }
  }
}

export async function runRepoCommandTask(
  input: RunRepoCommandTaskInput
): Promise<RunRepoCommandTaskResult> {
  const client = createOpenCodeClient();

  try {
    const safeRepositoryRoot = resolveSafeRepositoryRoot(
      input.repositoryRoot,
      input.allowedRoot
    );

    const exists = await pathExists(safeRepositoryRoot);

    if (!exists) {
      throw new RunRepoCommandTaskError(
        `Repository root does not exist: ${safeRepositoryRoot}`
      );
    }

    if (input.intent === "custom" && input.customCommand) {
      validateCustomCommand(input.customCommand);
    }

    const [context, resolvedCommand] = await Promise.all([
      detectRepositoryContext(safeRepositoryRoot),
      resolveRepoCommand({
        repositoryRoot: safeRepositoryRoot,
        intent: input.intent,
        customCommand: input.customCommand,
      }),
    ]);

    const session = await client.createSession({
      title: `ai_sdlc repo command: ${input.intent}`,
    });

    const commandInRepo = wrapCommandInRepositoryContext(
      safeRepositoryRoot,
      resolvedCommand.command
    );

    const message = await client.runShell({
      sessionId: session.id,
      command: commandInRepo,
    });

    return {
      sessionId: session.id,
      output: message.text || "Command execution completed without text output",
      message,
      resolvedCommand,
      repository: {
        root: safeRepositoryRoot,
        ecosystem: context.ecosystem,
      },
    };
  } catch (error) {
    if (error instanceof OpenCodeApiError) {
      throw new RunRepoCommandTaskError(
        `OpenCode failure: ${error.message}`,
        error
      );
    }

    if (error instanceof RunRepoCommandTaskError) {
      throw error;
    }

    throw new RunRepoCommandTaskError(
      error instanceof Error
        ? error.message
        : "Unknown error while running repository command task",
      error
    );
  }
}