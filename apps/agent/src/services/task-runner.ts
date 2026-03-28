import type { Task } from "../task.js";
import { emitTaskEvent, getTask, updateTask } from "../task-store.js";
import { runChatTask } from "./run-chat-task.js";
import { runRepoInspectTask } from "./run-repo-inspect-task.js";
import { runRepoCommandTask } from "./run-repo-command-task.js";

function getAllowedRepoRoot() {
  return process.env.REPO_ALLOWED_ROOT?.trim() || undefined;
}

async function markTaskRunning(taskId: string) {
  const task = await updateTask(taskId, {
    status: "running",
  });

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  emitTaskEvent(taskId, {
    type: "task.running",
    task,
  });

  return task;
}

async function markTaskCompleted(taskId: string, patch: Partial<Task>) {
  const task = await updateTask(taskId, {
    ...patch,
    status: "succeeded",
  });

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  emitTaskEvent(taskId, {
    type: "task.completed",
    task,
  });

  return task;
}

async function markTaskFailed(taskId: string, error: unknown) {
  const task = await updateTask(taskId, {
    status: "failed",
    error: {
      message:
        error instanceof Error ? error.message : "Unknown execution error",
      name: error instanceof Error ? error.name : "Error",
      stack: error instanceof Error ? error.stack : undefined,
    },
  });

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  emitTaskEvent(taskId, {
    type: "task.failed",
    task,
  });

  return task;
}

function emitOutputDelta(taskId: string, text: string) {
  if (!text) return;

  emitTaskEvent(taskId, {
    type: "task.output.delta",
    taskId,
    chunk: text,
  });
}

export async function executeTask(task: Task) {
  try {
    const current = await getTask(task.id);

    if (!current) {
      throw new Error(`Task not found: ${task.id}`);
    }

    if (current.status === "running" || current.status === "succeeded") {
      return;
    }

    await markTaskRunning(task.id);

    if (current.kind === "chat") {
      if (!current.prompt) {
        throw new Error("Chat task requires prompt");
      }

      const result = await runChatTask(current.prompt);

      emitOutputDelta(task.id, result.output);

      await markTaskCompleted(task.id, {
        sessionId: result.sessionId,
        output: {
          text: result.output,
          reasoning: result.message.reasoning,
          tools: result.message.tools,
        },
      });

      return;
    }

    if (current.kind === "repo-analyze") {
      if (!current.prompt) {
        throw new Error("repo-analyze task requires prompt");
      }

      if (!current.target || current.target.kind !== "local_path") {
        throw new Error(
          "repo-analyze requires target.kind = 'local_path' with valid path"
        );
      }

      const result = await runRepoInspectTask({
        prompt: current.prompt,
        repositoryRoot: current.target.path,
      });

      emitOutputDelta(task.id, result.output);

      await markTaskCompleted(task.id, {
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

    if (current.kind === "repo-command") {
      if (!current.target || current.target.kind !== "local_path") {
        throw new Error(
          "repo-command requires target.kind = 'local_path' with valid path"
        );
      }

      if (!current.command) {
        throw new Error("repo-command requires command");
      }

      if (
        current.command.intent === "custom" &&
        (!current.command.customCommand ||
          current.command.customCommand.trim().length === 0)
      ) {
        throw new Error(
          "repo-command with intent = 'custom' requires customCommand"
        );
      }

      const result = await runRepoCommandTask({
        repositoryRoot: current.target.path,
        intent: current.command.intent,
        customCommand: current.command.customCommand,
        allowedRoot: getAllowedRepoRoot(),
      });

      await updateTask(task.id, {
        command: {
          ...current.command,
          resolvedCommand: result.resolvedCommand.command,
          ecosystem: result.repository.ecosystem,
          reason: result.resolvedCommand.reason,
        },
      });

      emitTaskEvent(task.id, {
        type: "task.command.resolved",
        taskId: task.id,
        command: result.resolvedCommand.command,
        ecosystem: result.repository.ecosystem,
        reason: result.resolvedCommand.reason,
      });

      emitOutputDelta(task.id, result.output);

      await markTaskCompleted(task.id, {
        sessionId: result.sessionId,
        command: {
          ...current.command,
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

    throw new Error(`Unsupported task kind: ${current.kind}`);
  } catch (error) {
    await markTaskFailed(task.id, error);
  }
}