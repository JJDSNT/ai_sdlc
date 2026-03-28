//apps/agent/src/task.ts

export type TaskInput = {
  prompt: string;
  repoPath?: string;
};

export type TaskStatus = "queued" | "running" | "succeeded" | "failed";

export type TaskResult = {
  id: string;
  status: TaskStatus;
  summary?: string;
  logs?: string;
};