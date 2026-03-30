//apps/agent/src/task-event.ts
import type { Task } from "@/task";

export type TaskEvent =
  | { type: "task.created"; task: Task }
  | { type: "task.snapshot"; task: Task }
  | { type: "task.running"; task: Task }
  | { type: "task.updated"; task: Task }
  | { type: "task.completed"; task: Task }
  | { type: "task.failed"; task: Task }
  | { type: "task.output.delta"; taskId: string; chunk: string }
  | {
      type: "task.command.resolved";
      taskId: string;
      command: string;
      ecosystem?: string;
      reason?: string;
    };