// apps/web/app/execution/page.tsx
"use client";

import { TopNav } from "@/components/layout/top-nav";
import { BlockedPanel } from "@/features/execution/components/blocked-panel";
import { BoardColumn } from "@/features/execution/components/board-column";
import { ExecutionIssueCard } from "@/features/execution/components/issue-card";
import { Metric } from "@/features/execution/components/metric";
import { SideCard } from "@/features/execution/components/side-card";
import { isCardBlocked } from "@/features/execution/lib/issue-dependencies";
import type { ExecutionCard } from "@/features/execution/types";

const cards: ExecutionCard[] = [
  {
    id: "ISSUE-101",
    title: "Definir fluxo de autenticação social",
    description:
      "Consolidar fluxo principal de entrada e vínculo de identidade.",
    status: "done",
    priority: "critical",
    effort: "m",
  },
  {
    id: "ISSUE-102",
    title: "Formalizar regras de sessão",
    description: "Definir expiração, renovação e logout.",
    status: "doing",
    priority: "high",
    effort: "s",
    dependsOn: ["ISSUE-101"],
  },
  {
    id: "ISSUE-103",
    title: "Resolver colisão entre contas",
    description: "Fechar decisão sobre identidade única por email.",
    status: "ready",
    priority: "high",
    effort: "l",
    dependsOn: ["ISSUE-102"],
  },
  {
    id: "ISSUE-104",
    title: "Preparar critérios de aceite",
    description: "Transformar blocos da spec em critérios verificáveis.",
    status: "backlog",
    priority: "medium",
    effort: "s",
  },
  {
    id: "ISSUE-105",
    title: "Validar fallback por email e senha",
    description: "Executar testes antes de mover a issue para done.",
    status: "test",
    priority: "medium",
    effort: "m",
    dependsOn: ["ISSUE-102"],
  },
  {
    id: "ISSUE-106",
    title: "Definir onboarding inicial",
    description: "Fechar experiência inicial de entrada no sistema.",
    status: "done",
    priority: "medium",
    effort: "m",
  },
];

export default function ExecutionPage() {
  const totalIssues = cards.length;
  const doneIssues = cards.filter((card) => card.status === "done").length;
  const doingIssues = cards.filter((card) => card.status === "doing").length;
  const testIssues = cards.filter((card) => card.status === "test").length;
  const blockedIssues = cards.filter((card) => isCardBlocked(card, cards)).length;
  const highPriorityIssues = cards.filter(
    (card) => card.priority === "high" || card.priority === "critical",
  ).length;

  const sprintProgress =
    totalIssues === 0 ? 0 : Math.round((doneIssues / totalIssues) * 100);

  const backlogCards = cards.filter((card) => card.status === "backlog");
  const readyCards = cards.filter((card) => card.status === "ready");
  const doingCards = cards.filter((card) => card.status === "doing");
  const testCards = cards.filter((card) => card.status === "test");
  const doneCards = cards.filter((card) => card.status === "done");
  const blockedCards = cards.filter((card) => isCardBlocked(card, cards));

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
          gap: 14,
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
              display: "grid",
              gap: 8,
              justifyItems: "end",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Metric label="Sprint" value="ativa" />
              <Metric label="% feito" value={`${sprintProgress}%`} />
              <Metric label="WIP" value={String(doingIssues)} />
              <Metric label="Em teste" value={String(testIssues)} />
              <Metric label="Alta prioridade" value={String(highPriorityIssues)} />
              <Metric label="Bloqueios" value={String(blockedIssues)} danger />
            </div>

            <div
              style={{
                width: 320,
                maxWidth: "100%",
                display: "grid",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                <span>
                  {doneIssues} de {totalIssues} concluídas
                </span>

                <strong style={{ color: "#0f172a" }}>{sprintProgress}%</strong>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 999,
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${sprintProgress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 16,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 16,
            alignContent: "start",
          }}
        >
          <BoardColumn title="Backlog" count={backlogCards.length}>
            {backlogCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} allCards={cards} />
            ))}
          </BoardColumn>

          <BoardColumn title="Ready" count={readyCards.length}>
            {readyCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} allCards={cards} />
            ))}
          </BoardColumn>

          <BoardColumn title="Doing" count={doingCards.length}>
            {doingCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} allCards={cards} />
            ))}
          </BoardColumn>

          <BoardColumn title="Test" count={testCards.length}>
            {testCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} allCards={cards} />
            ))}
          </BoardColumn>

          <BoardColumn title="Done" count={doneCards.length}>
            {doneCards.map((card) => (
              <ExecutionIssueCard key={card.id} card={card} allCards={cards} />
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
            description="Aqui depois entra o copiloto sugerindo prioridades, detectando dependências e propondo próximas ações."
          />

          <SideCard
            title="Resumo da sprint"
            description={`A sprint está com ${sprintProgress}% concluído, ${doingIssues} issue(s) em andamento, ${testIssues} em teste, ${highPriorityIssues} de alta prioridade e ${blockedIssues} bloqueio(s) por dependência.`}
          />

          <BlockedPanel blockedCards={blockedCards} />
        </aside>
      </section>
    </main>
  );
}