//apps/agent/src/task-store.ts

import { EventEmitter } from "node:events";
import { desc, eq, max } from "drizzle-orm";
import { db } from "@/db/client";
import { taskEvents, tasks } from "@/db/schema";
import type { Task } from "./task.js";

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

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

type MutableTaskPatch = Omit<Partial<Task>, "id" | "createdAt">;

// ---------- MAPPERS ----------

function parseJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function mapRowToTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    sessionId: row.sessionId ?? undefined,
    kind: row.kind,
    status: row.status as Task["status"],
    result: (row.result as Task["result"]) ?? undefined,
    title: row.title ?? undefined,
    prompt: row.prompt ?? undefined,
    input: parseJson(row.inputJson),
    output: parseJson(row.outputJson),
    error: parseJson(row.errorJson),
    startedAt: row.startedAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function serializeTask(task: Task) {
  return {
    id: task.id,
    projectId: task.projectId,
    sessionId: task.sessionId ?? null,
    kind: task.kind,
    status: task.status,
    result: task.result ?? null,
    title: task.title ?? null,
    prompt: task.prompt ?? null,
    inputJson: task.input ? JSON.stringify(task.input) : null,
    outputJson: task.output ? JSON.stringify(task.output) : null,
    errorJson: task.error ? JSON.stringify(task.error) : null,
    startedAt: task.startedAt ?? null,
    completedAt: task.completedAt ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

// ---------- CORE ----------

export async function createTask(task: Task) {
  const existing = await getTask(task.id);

  if (existing) {
    throw new Error(`Task already exists: ${task.id}`);
  }

  await db.insert(tasks).values(serializeTask(task));

  await emitAndPersistTaskEvent(task.id, {
    type: "task.created",
    task,
  });

  return task;
}

export async function getTask(taskId: string) {
  const row = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  return row ? mapRowToTask(row) : null;
}

export async function listTasks() {
  const rows = await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
  });

  return rows.map(mapRowToTask);
}

export async function updateTask(taskId: string, patch: MutableTaskPatch) {
  const current = await getTask(taskId);

  if (!current) {
    return null;
  }

  const next: Task = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await db
    .update(tasks)
    .set(serializeTask(next))
    .where(eq(tasks.id, taskId));

  await emitAndPersistTaskEvent(taskId, {
    type: "task.updated",
    task: next,
  });

  return next;
}

// ---------- EVENTS ----------

async function getNextSequence(taskId: string) {
  const row = await db
    .select({ value: max(taskEvents.sequence) })
    .from(taskEvents)
    .where(eq(taskEvents.taskId, taskId));

  return (row[0]?.value ?? -1) + 1;
}

export async function appendTaskEvent(taskId: string, event: TaskEvent) {
  const sequence = await getNextSequence(taskId);

  await db.insert(taskEvents).values({
    id: crypto.randomUUID(),
    taskId,
    eventType: event.type,
    sequence,
    payloadJson: JSON.stringify(event),
    createdAt: new Date().toISOString(),
  });
}

export function emitTaskEvent(taskId: string, event: TaskEvent) {
  emitter.emit(`${taskId}:event`, event);
}

export async function emitAndPersistTaskEvent(
  taskId: string,
  event: TaskEvent
) {
  await appendTaskEvent(taskId, event);
  emitTaskEvent(taskId, event);
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

export async function listTaskEvents(taskId: string) {
  const rows = await db.query.taskEvents.findMany({
    where: eq(taskEvents.taskId, taskId),
    orderBy: [taskEvents.sequence],
  });

  return rows.map((row) =>
    JSON.parse(row.payloadJson) as TaskEvent
  );
}