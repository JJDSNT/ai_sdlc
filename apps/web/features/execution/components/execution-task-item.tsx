//apps/web/src/features/execution/components/execution-task-item.tsx
"use client";

import { StatusBadge } from "@/components/ui/status-badge";

type TaskListItem = {
  id: string;
  kind: string;
  status: string;
  prompt?: string | null;
  createdAt: string;
};

export function ExecutionTaskItem({
  task,
  isSelected,
  onSelect,
}: Readonly<{
  task: TaskListItem;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
}>) {
  return (
    <button
      onClick={() => onSelect(task.id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 14,
        borderRadius: 18,
        border: isSelected ? "1px solid #93c5fd" : "1px solid #e2e8f0",
        background: isSelected
          ? "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
          : "#ffffff",
        boxShadow: isSelected
          ? "0 8px 24px rgba(37,99,235,0.10)"
          : "0 1px 2px rgba(15,23,42,0.04)",
        cursor: "pointer",
        transition: "all 160ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          {task.kind}
        </div>

        <StatusBadge status={task.status} />
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.5,
          color: "#0f172a",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {task.prompt || "(sem prompt)"}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        {new Date(task.createdAt).toLocaleString()}
      </div>
    </button>
  );
}