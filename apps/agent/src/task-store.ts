import { EventEmitter } from "node:events";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Task } from "./task.js";

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

const DATA_DIR =
  process.env.AGENT_DATA_DIR?.trim() ||
  path.resolve(process.cwd(), ".agent-data");

const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

let hasLoaded = false;
const tasks = new Map<string, Task>();
let writeQueue: Promise<void> = Promise.resolve();

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

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function persistTasks() {
  await ensureDataDir();

  const payload = JSON.stringify(Array.from(tasks.values()), null, 2);

  writeQueue = writeQueue.then(async () => {
    const tempFile = `${TASKS_FILE}.tmp`;
    await writeFile(tempFile, payload, "utf8");
    await rename(tempFile, TASKS_FILE);
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
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "ENOENT") {
      hasLoaded = true;
      return;
    }

    throw error;
  }

  hasLoaded = true;
}

export async function createTask(task: Task) {
  await loadTasks();

  if (tasks.has(task.id)) {
    throw new Error(`Task already exists: ${task.id}`);
  }

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

  return Array.from(tasks.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

type MutableTaskPatch = Omit<Partial<Task>, "id" | "createdAt">;

export async function updateTask(taskId: string, patch: MutableTaskPatch) {
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

  emitTaskEvent(taskId, {
    type: "task.updated",
    task: next,
  });

  return next;
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