// apps/web/features/execution/components/issue-card.tsx

"use client";

import { getMissingDependencies } from "@/features/execution/lib/issue-dependencies";
import type { ExecutionCard, ExecutionCardStatus } from "@/features/execution/types";

const STATUS_OPTIONS: ExecutionCardStatus[] = [
  "backlog",
  "ready",
  "doing",
  "review",
  "done",
  "blocked",
];

type Props = Readonly<{
  card: ExecutionCard;
  allCards: ExecutionCard[];
  onMoveStatus: (issueId: string, status: ExecutionCardStatus) => Promise<void>;
}>;

export function ExecutionIssueCard({ card, allCards, onMoveStatus }: Props) {
  const missingDependencies = getMissingDependencies(card, allCards);
  const blocked = card.status === "blocked" || missingDependencies.length > 0;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value as ExecutionCardStatus;
    if (nextStatus === card.status) return;
    void onMoveStatus(card.id, nextStatus);
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 12,
        borderRadius: 14,
        border: blocked ? "1px solid #fecaca" : "1px solid #e2e8f0",
        background: blocked ? "#fef2f2" : "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>
          {card.id}
        </div>

        {blocked ? <BlockedBadge /> : null}
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
        {card.title}
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginTop: 2,
        }}
      >
        <MetaTag>{formatPriority(card.priority)}</MetaTag>
        <MetaTag>{formatEffort(card.effort)}</MetaTag>

        {card.tags.slice(0, 2).map((tag) => (
          <MetaTag key={tag} subtle>
            {tag}
          </MetaTag>
        ))}

        {missingDependencies.length > 0 ? (
          <MetaTag subtle>
            Dep: {missingDependencies.slice(0, 2).join(", ")}
            {missingDependencies.length > 2 ? "…" : ""}
          </MetaTag>
        ) : null}
      </div>

      <select
        value={card.status}
        onChange={handleChange}
        style={{
          marginTop: 4,
          padding: "6px 8px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          fontSize: 12,
          fontWeight: 700,
          color: "#334155",
          background: "#f8fafc",
        }}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {formatStatus(status)}
          </option>
        ))}
      </select>
    </div>
  );
}

function BlockedBadge() {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: "#fee2e2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      Blocked
    </span>
  );
}

function MetaTag({
  children,
  subtle = false,
}: Readonly<{
  children: React.ReactNode;
  subtle?: boolean;
}>) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: subtle ? "#f8fafc" : "#e2e8f0",
        border: "1px solid #e2e8f0",
        color: "#334155",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function formatPriority(priority: ExecutionCard["priority"]) {
  switch (priority) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "No priority";
  }
}

function formatEffort(effort?: ExecutionCard["effort"]) {
  if (!effort) return "Effort -";
  return `Effort ${effort.toUpperCase()}`;
}

function formatStatus(status: ExecutionCardStatus) {
  switch (status) {
    case "backlog":
      return "Backlog";
    case "ready":
      return "Ready";
    case "doing":
      return "Doing";
    case "review":
      return "Review";
    case "done":
      return "Done";
    case "blocked":
      return "Blocked";
  }
}
