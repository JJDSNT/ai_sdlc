// apps/web/features/execution/types.ts

export type ExecutionCardStatus =
  | "backlog"
  | "ready"
  | "doing"
  | "test"
  | "done";

export type ExecutionPriority = "low" | "medium" | "high" | "critical";

export type ExecutionEffort = "xs" | "s" | "m" | "l" | "xl";

export type ExecutionCard = {
  id: string;
  title: string;
  description: string;
  status: ExecutionCardStatus;

  priority: ExecutionPriority;
  effort: ExecutionEffort;

  dependsOn?: string[];
};