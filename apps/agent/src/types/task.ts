//apps/agent/src/types/task.ts

export type TaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type TaskResult =
  | "success"
  | "error"
  | "neutral"
  | null;

export type TaskEventType =
  | "task.created"
  | "task.running"
  | "task.delta"
  | "task.reasoning"
  | "task.tool"
  | "task.completed"
  | "task.failed";