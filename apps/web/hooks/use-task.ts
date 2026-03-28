"use client";

import { useEffect, useRef, useState } from "react";

export type TaskState = {
  id: string;
  kind: string;
  status: string;
  prompt?: string;
  output?: {
    text?: string;
    metadata?: Record<string, unknown>;
    reasoning?: unknown;
    tools?: unknown[];
  };
  command?: {
    intent?: string;
    customCommand?: string;
    resolvedCommand?: string;
    ecosystem?: string;
    reason?: string;
  };
  error?: {
    message?: string;
    name?: string;
    stack?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type TaskSnapshotEvent = {
  type: "task.snapshot";
  task: TaskState;
};

type TaskLifecycleEvent = {
  type: "task.created" | "task.running" | "task.updated" | "task.completed" | "task.failed";
  task: TaskState;
};

type TaskOutputDeltaEvent = {
  type: "task.output.delta";
  taskId: string;
  chunk: string;
};

type TaskCommandResolvedEvent = {
  type: "task.command.resolved";
  taskId: string;
  command: string;
  ecosystem?: string;
  reason?: string;
};

export function useTask(taskId: string | null) {
  const [task, setTask] = useState<TaskState | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }

    const es = new EventSource(`/api/tasks/${taskId}/events`);
    eventSourceRef.current = es;

    const handleSnapshot = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskSnapshotEvent;
      setTask(data.task);
    };

    const handleLifecycle = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskLifecycleEvent;
      setTask(data.task);

      if (data.type === "task.completed" || data.type === "task.failed") {
        es.close();
      }
    };

    const handleOutputDelta = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskOutputDeltaEvent;

      setTask((current) => {
        if (!current) return current;

        return {
          ...current,
          output: {
            ...current.output,
            text: `${current.output?.text ?? ""}${data.chunk}`,
          },
        };
      });
    };

    const handleCommandResolved = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskCommandResolvedEvent;

      setTask((current) => {
        if (!current) return current;

        return {
          ...current,
          command: {
            ...current.command,
            resolvedCommand: data.command,
            ecosystem: data.ecosystem,
            reason: data.reason,
          },
        };
      });
    };

    es.addEventListener("task.snapshot", handleSnapshot);
    es.addEventListener("task.created", handleLifecycle);
    es.addEventListener("task.running", handleLifecycle);
    es.addEventListener("task.updated", handleLifecycle);
    es.addEventListener("task.completed", handleLifecycle);
    es.addEventListener("task.failed", handleLifecycle);
    es.addEventListener("task.output.delta", handleOutputDelta);
    es.addEventListener("task.command.resolved", handleCommandResolved);

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.removeEventListener("task.snapshot", handleSnapshot);
      es.removeEventListener("task.created", handleLifecycle);
      es.removeEventListener("task.running", handleLifecycle);
      es.removeEventListener("task.updated", handleLifecycle);
      es.removeEventListener("task.completed", handleLifecycle);
      es.removeEventListener("task.failed", handleLifecycle);
      es.removeEventListener("task.output.delta", handleOutputDelta);
      es.removeEventListener("task.command.resolved", handleCommandResolved);
      es.close();
    };
  }, [taskId]);

  return task;
}