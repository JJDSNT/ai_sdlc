// apps/web/src/app/knowledge/page.tsx
"use client";

import { TopNav } from "@/components/layout/top-nav";

type KnowledgeItem = {
  id: string;
  title: string;
  type: "spec" | "decision" | "architecture" | "onboarding" | "checkpoint";
  status: "draft" | "active" | "archived";
  updatedAt: string;
};

type RelatedArtifact = {
  id: string;
  label: string;
  type: "spec" | "issue" | "decision" | "checkpoint";
  description: string;
};

const knowledgeItems: KnowledgeItem[] = [
  {
    id: "doc-1",
    title: "Arquitetura do Digital Twin Hidrológico",
    type: "architecture",
    status: "active",
    updatedAt: "há 2h",
  },
  {
    id: "doc-2",
    title: "Spec de ingestão temporal",
    type: "spec",
    status: "draft",
    updatedAt: "há 5h",
  },
  {
    id: "doc-3",
    title: "Decisão sobre modelo de persistência",
    type: "decision",
    status: "active",
    updatedAt: "ontem",
  },
  {
    id: "doc-4",
    title: "Onboarding técnico do projeto",
    type: "onboarding",
    status: "active",
    updatedAt: "há 3 dias",
  },
  {
    id: "doc-5",
    title: "Checkpoint da sprint atual",
    type: "checkpoint",
    status: "active",
    updatedAt: "há 30min",
  },
];

const relatedArtifacts: RelatedArtifact[] = [
  {
    id: "rel-1",
    label: "Spec principal do sistema",
    type: "spec",
    description: "Define objetivos, restrições e estrutura da solução.",
  },
  {
    id: "rel-2",
    label: "ISSUE-204 - Validar consistência temporal",
    type: "issue",
    description: "Issue ligada à ingestão e validação de séries temporais.",
  },
  {
    id: "rel-3",
    label: "Decisão sobre snapshots do repositório",
    type: "decision",
    description: "Define estratégia de versionamento e indexação.",
  },
  {
    id: "rel-4",
    label: "Checkpoint da sprint",
    type: "checkpoint",
    description: "Resumo recente de estado, próximos passos e bloqueios.",
  },
];

export default function KnowledgePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "64px 64px 1fr",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent 25%), #f8fafc",
      }}
    >
      <TopNav />
      <KnowledgeContextBar />
      <KnowledgeWorkspace />
    </main>
  );
}

function KnowledgeContextBar() {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "0 20px",
        borderBottom: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <ContextPill label="Projeto" value="Digital Twin Hidrológico" />
        <ContextPill label="Memória ativa" value="Arquitetura + checkpoints" />
        <ContextPill label="Documento aberto" value="Arquitetura do sistema" />
      </div>

      <div
        style={{
          width: 320,
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          placeholder="Buscar docs, decisões, checkpoints..."
          style={{
            width: "100%",
            height: 38,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            padding: "0 12px",
            fontSize: 14,
            outline: "none",
            background: "#ffffff",
          }}
        />
      </div>
    </section>
  );
}

function KnowledgeWorkspace() {
  return (
    <section
      style={{
        padding: 20,
        display: "grid",
        gridTemplateColumns: "260px 1fr 320px",
        gap: 16,
        minHeight: 0,
      }}
    >
      <KnowledgeNav />
      <DocumentViewer />
      <RelatedContextPanel />
    </section>
  );
}

function KnowledgeNav() {
  return (
    <aside
      style={{
        minHeight: 0,
        overflow: "auto",
        display: "grid",
        gap: 12,
        alignContent: "start",
        padding: 16,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.88)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.04)",
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
          Knowledge
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
          Memória do projeto
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>
          Navegue por documentos, decisões, checkpoints e artefatos persistidos.
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <NavSectionTitle label="Coleções" />
        <KnowledgeNavItem label="Specs" active />
        <KnowledgeNavItem label="Decisions" />
        <KnowledgeNavItem label="Architecture" />
        <KnowledgeNavItem label="Onboarding" />
        <KnowledgeNavItem label="Checkpoints" />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <NavSectionTitle label="Itens recentes" />
        {knowledgeItems.map((item) => (
          <KnowledgeListItem key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}

function DocumentViewer() {
  return (
    <section
      style={{
        minHeight: 0,
        overflow: "auto",
        display: "grid",
        gap: 14,
        alignContent: "start",
        padding: 18,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 18px 40px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2563eb",
            }}
          >
            Architecture Document
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
            Arquitetura do Digital Twin Hidrológico
          </h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TypeBadge label="architecture" />
            <StatusBadge label="active" />
            <MetaLabel label="Atualizado há 2h" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostAction label="Gerar resumo" />
          <GhostAction label="Criar onboarding" />
          <PrimaryAction label="Relacionar artefatos" />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 14,
          padding: 18,
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <DocumentSection
          title="Contexto"
          content="O sistema busca modelar e acompanhar o comportamento hidrológico de uma bacia, combinando ingestão de dados, simulação, rastreabilidade de decisões e geração de conhecimento operacional."
        />

        <DocumentSection
          title="Componentes principais"
          content="A arquitetura atual está organizada em ingestão temporal, processamento de séries, motor de simulação, camada de observabilidade e artefatos de conhecimento ligados à spec."
        />

        <DocumentSection
          title="Pontos em aberto"
          content="Ainda falta consolidar a estratégia de versionamento dos snapshots do repositório, o vínculo entre resultados simulados e checkpoints, e a formalização de edge cases de inconsistência temporal."
        />
      </div>
    </section>
  );
}

function RelatedContextPanel() {
  return (
    <aside
      style={{
        minHeight: 0,
        overflow: "auto",
        display: "grid",
        gap: 12,
        alignContent: "start",
      }}
    >
      <SidePanelCard
        title="Assistência contextual"
        description="A IA pode resumir o documento, explicar uma decisão, conectar artefatos e sugerir próximo passo com base no contexto ativo."
      />

      <div
        style={{
          display: "grid",
          gap: 10,
          padding: 16,
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          Artefatos relacionados
        </div>

        {relatedArtifacts.map((artifact) => (
          <RelatedArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>

      <SidePanelCard
        title="Próximo passo sugerido"
        description="Formalizar as decisões de versionamento e conectar esse documento à spec ativa e ao checkpoint atual."
      />
    </aside>
  );
}

function KnowledgeListItem({
  item,
}: Readonly<{
  item: KnowledgeItem;
}>) {
  return (
    <button
      type="button"
      style={{
        textAlign: "left",
        display: "grid",
        gap: 6,
        padding: 12,
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <TypeBadge label={item.type} />
        <MiniStatus status={item.status} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
        {item.title}
      </div>

      <div style={{ fontSize: 12, color: "#64748b" }}>
        Atualizado {item.updatedAt}
      </div>
    </button>
  );
}

function RelatedArtifactCard({
  artifact,
}: Readonly<{
  artifact: RelatedArtifact;
}>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 6,
        padding: 12,
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <TypeBadge label={artifact.type} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
        {artifact.label}
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.6, color: "#475569" }}>
        {artifact.description}
      </div>
    </div>
  );
}

function DocumentSection({
  title,
  content,
}: Readonly<{
  title: string;
  content: string;
}>) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: "#475569" }}>
        {content}
      </div>
    </div>
  );
}

function SidePanelCard({
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

function NavSectionTitle({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#94a3b8",
      }}
    >
      {label}
    </div>
  );
}

function KnowledgeNavItem({
  label,
  active = false,
}: Readonly<{
  label: string;
  active?: boolean;
}>) {
  return (
    <button
      type="button"
      style={{
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 12,
        border: active ? "1px solid #bfdbfe" : "1px solid transparent",
        background: active ? "#eff6ff" : "transparent",
        color: active ? "#1d4ed8" : "#334155",
        fontWeight: active ? 800 : 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function ContextPill({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: "8px 12px",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
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
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
        {value}
      </span>
    </div>
  );
}

function TypeBadge({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: "#eef2ff",
        border: "1px solid #c7d2fe",
        fontSize: 11,
        fontWeight: 800,
        color: "#4338ca",
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
  );
}

function StatusBadge({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        fontSize: 12,
        fontWeight: 800,
        color: "#166534",
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
  );
}

function MiniStatus({
  status,
}: Readonly<{
  status: KnowledgeItem["status"];
}>) {
  const palette =
    status === "active"
      ? { fg: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }
      : status === "draft"
        ? { fg: "#92400e", bg: "#fffbeb", border: "#fde68a" }
        : { fg: "#475569", bg: "#f8fafc", border: "#cbd5e1" };

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        fontSize: 11,
        fontWeight: 800,
        color: palette.fg,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function MetaLabel({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <span
      style={{
        fontSize: 12,
        color: "#64748b",
      }}
    >
      {label}
    </span>
  );
}

function PrimaryAction({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <button
      type="button"
      style={{
        height: 38,
        border: "none",
        borderRadius: 12,
        padding: "0 14px",
        background: "#2563eb",
        color: "#ffffff",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function GhostAction({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <button
      type="button"
      style={{
        height: 38,
        borderRadius: 12,
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#0f172a",
        padding: "0 14px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}