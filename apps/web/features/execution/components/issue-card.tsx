// apps/web/features/execution/components/issue-card.tsx

import {
  getMissingDependencies,
  isCardBlocked,
} from "@/features/execution/lib/issue-dependencies";
import type { ExecutionCard } from "@/features/execution/types";

type Props = Readonly<{
  card: ExecutionCard;
  allCards?: ExecutionCard[];
}>;

export function ExecutionIssueCard({ card, allCards = [] }: Props) {
  const missingDependencies = getMissingDependencies(card, allCards);
  const blocked = isCardBlocked(card, allCards);

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

      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
        {card.description}
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

        {missingDependencies.length > 0 ? (
          <MetaTag subtle>
            Dep: {missingDependencies.slice(0, 2).join(", ")}
            {missingDependencies.length > 2 ? "…" : ""}
          </MetaTag>
        ) : null}
      </div>
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

function formatPriority(priority?: ExecutionCard["priority"]) {
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