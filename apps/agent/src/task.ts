//apps/agent/src/task.ts

export type TaskTarget =
  | {
      kind: "local_path";
      path: string;
    }
  | {
      kind: "git";
      url: string;
      ref?: string;
      path?: string;
    };

export type TaskInput = {
  prompt: string;
  repoPath?: string;
  target?: TaskTarget;
};

export type TaskStatus = "queued" | "running" | "succeeded" | "failed";

export type TaskResult = {
  summary?: string;
  logs?: string;
  workspacePath?: string;
};

export type Task = {
  id: string;
  input: TaskInput;
  status: TaskStatus;
  result?: TaskResult;
  createdAt: string;
  updatedAt: string;
};