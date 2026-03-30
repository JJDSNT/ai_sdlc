//apps/agent/src/repositories/task-repository.ts
import { desc, eq, max } from "drizzle-orm";
import { db } from "@/db/client";
import { taskEvents, tasks } from "@/db/schema";
import type { Task } from "@/task";
import type { TaskEvent } from "@/task-event";

export type MutableTaskPatch = Omit<Partial<Task>, "id" | "createdAt">;

function parseJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  return JSON.parse(value) as T;
}

function toTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    sessionId: row.sessionId ?? undefined,
    kind: row.kind,
    status: row.status as Task["status"],
    result: (row.result as Task["result"] | null) ?? undefined,
    title: row.title ?? undefined,
    prompt: row.prompt ?? undefined,
    input: parseJson<Task["input"]>(row.inputJson),
    output: parseJson<Task["output"]>(row.outputJson),
    error: parseJson<Task["error"]>(row.errorJson),
    startedAt: row.startedAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toTaskInsert(task: Task) {
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

export const taskRepository = {
  async create(task: Task): Promise<Task> {
    await db.insert(tasks).values(toTaskInsert(task));
    return task;
  },

  async getById(taskId: string): Promise<Task | null> {
    const row = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    return row ? toTask(row) : null;
  },

  async list(): Promise<Task[]> {
    const rows = await db.query.tasks.findMany({
      orderBy: [desc(tasks.createdAt)],
    });

    return rows.map(toTask);
  },

  async update(taskId: string, patch: MutableTaskPatch): Promise<Task | null> {
    const current = await this.getById(taskId);

    if (!current) {
      return null;
    }

    const next: Task = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    await db.update(tasks).set(toTaskInsert(next)).where(eq(tasks.id, taskId));

    return next;
  },

  async getNextEventSequence(taskId: string): Promise<number> {
    const rows = await db
      .select({
        value: max(taskEvents.sequence),
      })
      .from(taskEvents)
      .where(eq(taskEvents.taskId, taskId));

    return (rows[0]?.value ?? -1) + 1;
  },

  async appendEvent(taskId: string, event: TaskEvent): Promise<void> {
    const sequence = await this.getNextEventSequence(taskId);

    await db.insert(taskEvents).values({
      id: crypto.randomUUID(),
      taskId,
      eventType: event.type,
      sequence,
      payloadJson: JSON.stringify(event),
      createdAt: new Date().toISOString(),
    });
  },

  async listEvents(taskId: string): Promise<TaskEvent[]> {
    const rows = await db.query.taskEvents.findMany({
      where: eq(taskEvents.taskId, taskId),
      orderBy: [taskEvents.sequence],
    });

    return rows.map((row) => JSON.parse(row.payloadJson ?? "{}") as TaskEvent);
  },
};