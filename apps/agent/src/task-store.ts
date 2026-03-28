import { EventEmitter } from "node:events";
import type { Task } from "./task.js";

const tasks = new Map<string, Task>();
const emitter = new EventEmitter();

export function saveTask(task: Task) {
  tasks.set(task.id, task);
  return task;
}

export function getTask(taskId: string) {
  return tasks.get(taskId) ?? null;
}

export function listTasks() {
  return Array.from(tasks.values());
}

export function updateTask(taskId: string, patch: Partial<Task>) {
  const current = tasks.get(taskId);

  if (!current) {
    return null;
  }

  const next: Task = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  tasks.set(taskId, next);
  emitter.emit(taskId, next);

  return next;
}

export function subscribeToTask(
  taskId: string,
  listener: (task: Task) => void
) {
  emitter.on(taskId, listener);

  return () => {
    emitter.off(taskId, listener);
  };
}