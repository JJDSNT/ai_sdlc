// apps/web/src/app/execution/page.tsx
"use client";

import { TopNav } from "@/components/layout/top-nav";

type ExecutionCard = {
  id: string;
  title: string;
  status: "backlog" | "ready" | "doing" | "blocked" | "done";
  description: string;
};

const cards: ExecutionCard[] = [
  {
    id: "ISSUE-101",
    title: "Definir fluxo de autenticação social",
    status: "doing",
    description:
      "Consolidar fluxo principal de entrada e vínculo de identidade.",
  },
  {
    id: "ISSUE-102",
    title: "Formalizar regras de sessão",
    status: "ready",
    description: "Definir expiração, renovação e logout.",
  },
  {
    id: "ISSUE-103",
    title: "Resolver colisão entre contas",
    status: "blocked",
    description:
      "Falta decisão final sobre identidade única por email.",
  },
  {
    id: "ISSUE-104",
    title: "Preparar critérios de aceite",
    status: "backlog",
    description:
      "Transformar blocos da spec em critérios verificáveis.",
  },
  {
    id: "ISSUE-105",
    title: "Implementar fallback por email e senha",
    status: "done",
    description:
      "Garantir caminho alternativo ao login social.",
  },
  {
    id: "ISSUE-106",
    title: "Definir onboarding inicial",
    status: "done",
    description:
      "Fechar experiência inicial de entrada no sistema.",
  },
];

export default function ExecutionPage() {
  const totalIssues = cards.length;
  const doneIssues = cards.filter((card) => card.status === "done").length;
  const doingIssues = cards.filter((card) => card.status === "doing").length;
  const blockedIssues = cards.filter((card) => card.status === "blocked").length;

  const sprintProgress =
    totalIssues === 0 ? 0 : Math.round((doneIssues / totalIssues) * 100);

  const backlogCards = cards.filter((card) => card.status === "backlog");
  const readyCards = cards.filter((card) => card.status === "ready");
  const doingCards = cards.filter(
    (card) => card.status === "doing" || card.status === "blocked",
  );
  const doneCards = cards.filter((card) => card.status === "done");
  const blockedCards = cards.filter((card) => card.status === "blocked");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "64px auto 1fr",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent 25%), #f8fafc",
      }}
    >
      <TopNav />

      <section
        style={{
          padding: 20,
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Execution
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.1,
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Workspace de execução
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: "#475569",
                maxWidth: 720,
              }}
            >
              Acompanhe a sprint, visualize o progresso, identifique bloqueios
              e mantenha a execução alinhada com a spec.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Metric label="Sprint" value="ativa" />
            <Metric label="% feito" value={`${sprintProgress}%`} />
            <Metric label="WIP" value={String(doingIssues)} />
            <Metric label="Bloqueios" value={String(blockedIssues)} danger />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            padding: 16,
            borderRadius: 18,
            border: "1px solid #dbeafe",
            background:
              "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)",
            boxShadow: "0 12px 28px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#2563eb",
                }}
              >
                Sprint Progress
              </div>

              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                {sprintProgress}%
              </div>
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#475569",
              }}
            >
              {doneIssues} de {totalIssues} issues concluídas
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: 12,
              borderRadius: 999,
              background: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${sprintProgress}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
              }}
            />
          </div>
        </div>
      </section>

      <section
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            alignContent: "start",
          }}
        >
          <BoardColumn title="Backlog" count={backlogCards.length}>
            {backlogCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} />
            ))}
          </BoardColumn>

          <BoardColumn title="Ready" count={readyCards.length}>
            {readyCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} />
            ))}
          </BoardColumn>

          <BoardColumn title="Doing" count={doingCards.length}>
            {doingCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} />
            ))}
          </BoardColumn>

          <BoardColumn title="Done" count={doneCards.length}>
            {doneCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} />
            ))}
          </BoardColumn>
        </div>

        <aside
          style={{
            display: "grid",
            gap: 14,
            alignContent: "start",
          }}
        >
          <SideCard
            title="Assistência contextual"
            description="Aqui depois entra o copiloto sugerindo prioridades, detectando gargalos e propondo próximas ações."
          />

          <SideCard
            title="Resumo da sprint"
            description={`A sprint está com ${sprintProgress}% concluído, ${doingIssues} issue(s) em andamento e ${blockedIssues} bloqueio(s) visíveis.`}
          />

          <BlockedPanel blockedCards={blockedCards} />
        </aside>
      </section>
    </main>
  );
}

function BoardColumn({
  title,
  count,
  children,
}: Readonly<{
  title: string;
  count: number;
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        alignContent: "start",
        padding: 14,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.88)",
        minHeight: 420,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
          {title}
        </div>

        <span
          style={{
            minWidth: 28,
            height: 28,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 12,
            fontWeight: 800,
            color: "#475569",
          }}
        >
          {count}
        </span>
      </div>

      {children}
    </div>
  );
}

function ExecutionIssueCard({
  card,
}: Readonly<{
  card: ExecutionCard;
}>) {
  const isBlocked = card.status === "blocked";

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 12,
        borderRadius: 14,
        border: isBlocked ? "1px solid #fecaca" : "1px solid #e2e8f0",
        background: isBlocked ? "#fef2f2" : "#ffffff",
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

        {isBlocked ? <BlockedBadge /> : null}
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
        {card.title}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
        {card.description}
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

function BlockedPanel({
  blockedCards,
}: Readonly<{
  blockedCards: ExecutionCard[];
}>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 16,
        borderRadius: 18,
        border: "1px solid #fecaca",
        background: "#fff5f5",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#991b1b" }}>
        Bloqueios visíveis
      </div>

      {blockedCards.length === 0 ? (
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
          Nenhuma issue bloqueada no momento.
        </div>
      ) : (
        blockedCards.map((card) => (
          <div
            key={card.id}
            style={{
              display: "grid",
              gap: 4,
              padding: 12,
              borderRadius: 14,
              border: "1px solid #fecaca",
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: "#991b1b" }}>
              {card.id}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
              {card.title}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: "#475569" }}>
              {card.description}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SideCard({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 16,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>
        {description}
      </div>
    </div>
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
        display: "grid",
        gap: 4,
        padding: "8px 12px",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: danger ? "#fff1f2" : "#f8fafc",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: danger ? "#be123c" : "#0f172a",
        }}
      >
        {value}
      </span>
    </div>
  );
}