"use client";

import { useEffect, useRef, useState } from "react";

export type TaskState = {
  id: string;
  status: string;
  output?: {
    text?: string;
  };
};

export function useTask(taskId: string | null) {
  const [task, setTask] = useState<TaskState | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const es = new EventSource(`/api/tasks/${taskId}/events`);
    eventSourceRef.current = es;

    const handleSnapshot = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskState;
      setTask(data);
    };

    const handleUpdated = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskState;
      setTask(data);
    };

    const handleCompleted = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TaskState;
      setTask(data);
      es.close();
    };

    es.addEventListener("task.snapshot", handleSnapshot);
    es.addEventListener("task.updated", handleUpdated);
    es.addEventListener("task.completed", handleCompleted);

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.removeEventListener("task.snapshot", handleSnapshot);
      es.removeEventListener("task.updated", handleUpdated);
      es.removeEventListener("task.completed", handleCompleted);
      es.close();
    };
  }, [taskId]);

  return task;
}