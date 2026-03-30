//apps/agent/src/services/task-service.ts
import { taskEventBus } from "@/realtime/task-event-bus";
import { taskRepository } from "@/repositories/task-repository";
import type { Task, TaskError, TaskOutput } from "@/task";
import type { TaskEvent } from "@/task-event";

type CreateTaskInput = {
  id: string;
  projectId: string;
  sessionId?: string;
  kind: string;
  title?: string;
  prompt?: string;
  input?: Task["input"];
};

export const taskService = {
  async createTask(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();

    const task: Task = {
      id: input.id,
      projectId: input.projectId,
      sessionId: input.sessionId,
      kind: input.kind,
      status: "queued",
      title: input.title,
      prompt: input.prompt,
      input: input.input,
      createdAt: now,
      updatedAt: now,
    };

    await taskRepository.create(task);

    const event: TaskEvent = {
      type: "task.created",
      task,
    };

    await taskRepository.appendEvent(task.id, event);
    taskEventBus.publish(task.id, event);

    return task;
  },

  async getTask(taskId: string) {
    return taskRepository.getById(taskId);
  },

  async listTasks() {
    return taskRepository.list();
  },

  async listTaskEvents(taskId: string) {
    return taskRepository.listEvents(taskId);
  },

  subscribeToTaskEvents(taskId: string, listener: (event: TaskEvent) => void) {
    return taskEventBus.subscribe(taskId, listener);
  },

  async markRunning(taskId: string): Promise<Task | null> {
    const current = await taskRepository.getById(taskId);

    if (!current) {
      return null;
    }

    const next = await taskRepository.update(taskId, {
      status: "running",
      startedAt: current.startedAt ?? new Date().toISOString(),
    });

    if (!next) {
      return null;
    }

    const event: TaskEvent = {
      type: "task.running",
      task: next,
    };

    await taskRepository.appendEvent(taskId, event);
    taskEventBus.publish(taskId, event);

    return next;
  },

  async updateTask(taskId: string, patch: Omit<Partial<Task>, "id" | "createdAt">) {
    const next = await taskRepository.update(taskId, patch);

    if (!next) {
      return null;
    }

    const event: TaskEvent = {
      type: "task.updated",
      task: next,
    };

    await taskRepository.appendEvent(taskId, event);
    taskEventBus.publish(taskId, event);

    return next;
  },

  async appendOutputDelta(taskId: string, chunk: string): Promise<void> {
    const event: TaskEvent = {
      type: "task.output.delta",
      taskId,
      chunk,
    };

    await taskRepository.appendEvent(taskId, event);
    taskEventBus.publish(taskId, event);
  },

  async markCompleted(
    taskId: string,
    params?: {
      result?: Task["result"];
      output?: TaskOutput;
    }
  ): Promise<Task | null> {
    const next = await taskRepository.update(taskId, {
      status: "completed",
      result: params?.result ?? "neutral",
      output: params?.output,
      completedAt: new Date().toISOString(),
    });

    if (!next) {
      return null;
    }

    const event: TaskEvent = {
      type: "task.completed",
      task: next,
    };

    await taskRepository.appendEvent(taskId, event);
    taskEventBus.publish(taskId, event);

    return next;
  },

  async markFailed(
    taskId: string,
    error: TaskError
  ): Promise<Task | null> {
    const next = await taskRepository.update(taskId, {
      status: "failed",
      result: "error",
      error,
      completedAt: new Date().toISOString(),
    });

    if (!next) {
      return null;
    }

    const event: TaskEvent = {
      type: "task.failed",
      task: next,
    };

    await taskRepository.appendEvent(taskId, event);
    taskEventBus.publish(taskId, event);

    return next;
  },

  async emitCommandResolved(params: {
    taskId: string;
    command: string;
    ecosystem?: string;
    reason?: string;
  }): Promise<void> {
    const event: TaskEvent = {
      type: "task.command.resolved",
      taskId: params.taskId,
      command: params.command,
      ecosystem: params.ecosystem,
      reason: params.reason,
    };

    await taskRepository.appendEvent(params.taskId, event);
    taskEventBus.publish(params.taskId, event);
  },
};