"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExecutionCard, ExecutionCardStatus } from "@/features/execution/types";

type IssueFrontmatterPayload = {
  id: string;
  title: string;
  status: string;
  priority: string;
  tags?: string[];
  effort?: string;
  depends_on?: string[];
};

const CONSOLIDATED_STATUS = "consolidated";

function toExecutionCard(frontmatter: IssueFrontmatterPayload): ExecutionCard | null {
  if (frontmatter.status === CONSOLIDATED_STATUS) {
    return null;
  }

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    status: frontmatter.status as ExecutionCardStatus,
    priority: frontmatter.priority as ExecutionCard["priority"],
    tags: frontmatter.tags ?? [],
    effort: frontmatter.effort as ExecutionCard["effort"],
    dependsOn: frontmatter.depends_on,
  };
}

export function useIssues() {
  const [cards, setCards] = useState<ExecutionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-context/issues", { cache: "no-store" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : { ok: true, issues: [] };

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to fetch issues");
      }

      const mapped = (Array.isArray(data.issues) ? data.issues : [])
        .map(toExecutionCard)
        .filter((card: ExecutionCard | null): card is ExecutionCard => card !== null);

      setCards(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issues");
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const moveStatus = useCallback(
    async (issueId: string, status: ExecutionCardStatus) => {
      setActionError(null);

      try {
        const res = await fetch(`/api/ai-context/issues/${issueId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : { ok: false };

        if (!res.ok || !data.ok) {
          throw new Error(data?.error || "Failed to move issue status");
        }

        await refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to move issue status");
      }
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { cards, loading, error, actionError, refresh, moveStatus };
}
