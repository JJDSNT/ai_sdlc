// apps/agent/src/task.ts

export type TaskInput = {
  prompt: string;
  target?: {
    kind: "local_path" | "git";
    path?: string;
    url?: string;
    ref?: string;
  };
};

export type TaskStatus = "queued" | "running" | "succeeded" | "failed";

export type TaskResult = {
  id: string;
  status: TaskStatus;
  summary?: string;
  logs?: string;
  workspacePath?: string;
};