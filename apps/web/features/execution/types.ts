// apps/web/features/execution/types.ts

// Subconjunto de IssueStatus (apps/agent/src/ai-context/types.ts) exibido no
// Kanban — "consolidated" é filtrado antes de chegar aqui (ver use-issues.tsx).
export type ExecutionCardStatus =
  | "backlog"
  | "ready"
  | "doing"
  | "review"
  | "done"
  | "blocked";

export type ExecutionPriority = "low" | "medium" | "high" | "critical";

// Mirror de IssueEffort (apps/agent/src/ai-context/types.ts).
export type ExecutionEffort = "xs" | "s" | "m" | "l" | "xl";

export type ExecutionCard = {
  id: string;
  title: string;
  status: ExecutionCardStatus;
  priority: ExecutionPriority;
  tags: string[];
  effort?: ExecutionEffort;
  // Mapeado de depends_on (frontmatter) — ver use-issues.tsx.
  dependsOn?: string[];
};
