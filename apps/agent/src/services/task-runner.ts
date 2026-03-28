import type { Task } from "../task.js";
import { updateTask } from "../task-store.js";
import { runChatTask } from "./run-chat-task.js";
import { runRepoInspectTask } from "./run-repo-inspect-task.js";
import { runRepoCommandTask } from "./run-repo-command-task.js";

function getAllowedRepoRoot() {
  return process.env.REPO_ALLOWED_ROOT?.trim() || undefined;
}

export async function executeTask(task: Task) {
  try {
    updateTask(task.id, {
      status: "running",
    });

    if (task.kind === "chat") {
      if (!task.prompt) {
        throw new Error("Chat task requires prompt");
      }

      const result = await runChatTask(task.prompt);

      updateTask(task.id, {
        status: "succeeded",
        sessionId: result.sessionId,
        output: {
          text: result.output,
          reasoning: result.message.reasoning,
          tools: result.message.tools,
        },
      });

      return;
    }

    if (task.kind === "repo-analyze") {
      if (!task.prompt) {
        throw new Error("repo-analyze task requires prompt");
      }

      if (!task.target || task.target.kind !== "local_path") {
        throw new Error(
          "repo-analyze requires target.kind = 'local_path' with valid path"
        );
      }

      const result = await runRepoInspectTask({
        prompt: task.prompt,
        repositoryRoot: task.target.path,
      });

      updateTask(task.id, {
        status: "succeeded",
        sessionId: result.sessionId,
        output: {
          text: result.output,
          reasoning: result.message.reasoning,
          tools: result.message.tools,
          metadata: {
            repository: result.repository,
          },
        },
      });

      return;
    }

    if (task.kind === "repo-command") {
      if (!task.target || task.target.kind !== "local_path") {
        throw new Error(
          "repo-command requires target.kind = 'local_path' with valid path"
        );
      }

      if (!task.command) {
        throw new Error("repo-command requires command");
      }

      if (
        task.command.intent === "custom" &&
        (!task.command.customCommand ||
          task.command.customCommand.trim().length === 0)
      ) {
        throw new Error(
          "repo-command with intent = 'custom' requires customCommand"
        );
      }

      const result = await runRepoCommandTask({
        repositoryRoot: task.target.path,
        intent: task.command.intent,
        customCommand: task.command.customCommand,
        allowedRoot: getAllowedRepoRoot(),
      });

      updateTask(task.id, {
        status: "succeeded",
        sessionId: result.sessionId,
        command: {
          ...task.command,
          resolvedCommand: result.resolvedCommand.command,
          ecosystem: result.repository.ecosystem,
          reason: result.resolvedCommand.reason,
        },
        output: {
          text: result.output,
          reasoning: result.message.reasoning,
          tools: result.message.tools,
          metadata: {
            repository: result.repository,
            resolvedCommand: result.resolvedCommand,
          },
        },
      });

      return;
    }

    throw new Error(`Unsupported task kind: ${task.kind}`);
  } catch (error) {
    updateTask(task.id, {
      status: "failed",
      error: {
        message:
          error instanceof Error ? error.message : "Unknown execution error",
      },
    });
  }
}