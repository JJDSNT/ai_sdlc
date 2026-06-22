// apps/web/features/execution/lib/issue-dependencies.ts

import type { ExecutionCard } from "@/features/execution/types";

const SATISFIED_STATUSES: ExecutionCard["status"][] = ["done"];

export function getCardMap(cards: ExecutionCard[] = []) {
  return new Map(cards.map((card) => [card.id, card]));
}

export function getMissingDependencies(
  card: ExecutionCard,
  cards: ExecutionCard[] = [],
) {
  const cardMap = getCardMap(cards);

  return (card.dependsOn ?? []).filter((dependencyId) => {
    const dependency = cardMap.get(dependencyId);
    return !dependency || !SATISFIED_STATUSES.includes(dependency.status);
  });
}

// Bloqueado por dependência (depends_on com pendência) é distinto de
// status === "blocked" (bloqueio manual/explícito) — ver execution/page.tsx,
// que combina os dois para a lista "Bloqueios" da sidebar.
export function isBlockedByDependency(
  card: ExecutionCard,
  cards: ExecutionCard[] = [],
) {
  return getMissingDependencies(card, cards).length > 0;
}
