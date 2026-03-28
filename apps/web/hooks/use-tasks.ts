"use client";

import { useCallback, useEffect, useState } from "react";

export type TaskListItem = {
  id: string;
  kind: string;
  status: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
};

export function useTasks() {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tasks", {
        cache: "no-store",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : { ok: true, tasks: [] };

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch tasks");
      }

      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch tasks"
      );
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    tasks,
    loading,
    error,
    refresh,
  };
}