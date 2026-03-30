//apps/web/src/features/execution/components/sprint-health-card.tsx
"use client";

import { SectionCard } from "@/components/ui/section-card";

export function SprintHealthCard({
  totalTasks,
  completedTasks,
  runningTasks,
  failedTasks,
}: Readonly<{
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  failedTasks: number;
}>) {
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <SectionCard
      title="Sprint health"
      subtitle="Indicadores rápidos da execução atual."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#475569",
              marginBottom: 8,
            }}
          >
            <span>Progresso</span>
            <strong style={{ color: "#0f172a" }}>{progress}%</strong>
          </div>

          <div
            style={{
              width: "100%",
              height: 10,
              borderRadius: 999,
              background: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <Metric label="Tasks" value={String(totalTasks)} />
          <Metric label="Concluídas" value={String(completedTasks)} />
          <Metric label="Rodando" value={String(runningTasks)} />
          <Metric label="Falharam" value={String(failedTasks)} danger />
        </div>
      </div>
    </SectionCard>
  );
}

function Metric({
  label,
  value,
  danger = false,
}: Readonly<{
  label: string;
  value: string;
  danger?: boolean;
}>) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: danger ? "#fff1f2" : "#ffffff",
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: danger ? "#be123c" : "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}