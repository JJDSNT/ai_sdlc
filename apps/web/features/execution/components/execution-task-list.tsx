//apps/web/src/features/execution/components/execution-task-list.tsx
"use client";

import { ExecutionTaskItem } from "@/features/execution/components/execution-task-item";

type TaskListItem = {
  id: string;
  kind: string;
  status: string;
  prompt?: string | null;
  createdAt: string;
};

export function ExecutionTaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
}: Readonly<{
  tasks: TaskListItem[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}>) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {tasks.map((task) => (
        <ExecutionTaskItem
          key={task.id}
          task={task}
          isSelected={task.id === selectedTaskId}
          onSelect={onSelectTask}
        />
      ))}
    </div>
  );
}