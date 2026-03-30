// apps/web/features/execution/lib/issue-dependencies.ts

import type { ExecutionCard } from "@/features/execution/types";

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
    return !dependency || dependency.status !== "done";
  });
}

export function isCardBlocked(
  card: ExecutionCard,
  cards: ExecutionCard[] = [],
) {
  return getMissingDependencies(card, cards).length > 0;
}