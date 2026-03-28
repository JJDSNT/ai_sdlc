import { EventEmitter } from "node:events";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Task } from "./task.js";

const emitter = new EventEmitter();

const DATA_DIR =
  process.env.AGENT_DATA_DIR?.trim() ||
  path.resolve(process.cwd(), ".agent-data");

const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

let hasLoaded = false;
const tasks = new Map<string, Task>();
let writeQueue: Promise<void> = Promise.resolve();

export type TaskEvent =
  | { type: "task.created"; task: Task }
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

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function persistTasks() {
  await ensureDataDir();

  const payload = JSON.stringify(Array.from(tasks.values()), null, 2);

  writeQueue = writeQueue.then(async () => {
    await writeFile(TASKS_FILE, payload, "utf8");
  });

  await writeQueue;
}

export async function loadTasks() {
  if (hasLoaded) return;

  await ensureDataDir();

  try {
    const raw = await readFile(TASKS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Task[];

    for (const task of parsed) {
      tasks.set(task.id, task);
    }
  } catch {
    // noop
  }

  hasLoaded = true;
}

export async function saveTask(task: Task) {
  await loadTasks();
  tasks.set(task.id, task);
  await persistTasks();

  emitTaskEvent(task.id, {
    type: "task.created",
    task,
  });

  return task;
}

export async function getTask(taskId: string) {
  await loadTasks();
  return tasks.get(taskId) ?? null;
}

export async function listTasks() {
  await loadTasks();

  return Array.from(tasks.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function updateTask(taskId: string, patch: Partial<Task>) {
  await loadTasks();

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
  await persistTasks();

  emitter.emit(taskId, next);
  emitTaskEvent(taskId, {
    type: "task.updated",
    task: next,
  });

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

export function emitTaskEvent(taskId: string, event: TaskEvent) {
  emitter.emit(`${taskId}:event`, event);
}

export function subscribeToTaskEvents(
  taskId: string,
  listener: (event: TaskEvent) => void
) {
  emitter.on(`${taskId}:event`, listener);

  return () => {
    emitter.off(`${taskId}:event`, listener);
  };
}