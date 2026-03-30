// apps/web/features/execution/components/blocked-panel.tsx

import { getMissingDependencies } from "@/features/execution/lib/issue-dependencies";
import type { ExecutionCard } from "@/features/execution/types";

type Props = Readonly<{
  blockedCards: ExecutionCard[];
  allCards?: ExecutionCard[];
}>;

export function BlockedPanel({ blockedCards, allCards = [] }: Props) {
  if (blockedCards.length === 0) {
    return (
      <Panel>
        <Title>Bloqueios</Title>
        <Empty>Nenhum bloqueio ativo</Empty>
      </Panel>
    );
  }

  return (
    <Panel>
      <Title>Bloqueios</Title>

      <div style={{ display: "grid", gap: 10 }}>
        {blockedCards.map((card) => {
          const missing = getMissingDependencies(card, allCards);

          return (
            <div
              key={card.id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                display: "grid",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#b91c1c",
                }}
              >
                {card.id}
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#7f1d1d",
                }}
              >
                {missing.length > 0
                  ? `Aguardando: ${missing.join(", ")}`
                  : "Bloqueado"}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        display: "grid",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 800,
        color: "#0f172a",
      }}
    >
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: "#64748b",
      }}
    >
      {children}
    </div>
  );
}