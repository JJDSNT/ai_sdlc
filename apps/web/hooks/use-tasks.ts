"use client";

import { useCallback, useEffect, useState } from "react";

export type TaskSummary = {
  id: string;
  kind: string;
  status: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
};

export function useTasks() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();
      setTasks(data.tasks ?? []);
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
    refresh,
  };
}