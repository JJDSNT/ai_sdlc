// apps/web/app/definition/page.tsx
"use client";

import { TopNav } from "@/components/layout/top-nav";
import { ConversationChat } from "@/features/definition/components/conversation-chat";
import { useSpec, type SpecStatus } from "@/features/definition/hooks/use-spec";
import type { SpecSection } from "@/features/definition/lib/spec-sections";

type ValidationSignal = {
  id: string;
  tone: "error" | "warning" | "success";
  title: string;
  description: string;
};

// validationSignals continua mock: calcular sinais de verdade a partir do
// conteúdo da Spec é trabalho de IA (ISSUE-0013), fora do escopo de
// ISSUE-0011 (que só conecta leitura/escrita real da Spec).
const validationSignals: ValidationSignal[] = [
  {
    id: "v-1",
    tone: "warning",
    title: "Escopo ainda em aberto",
    description:
      "Revise as seções abaixo e confirme se já há requisitos suficientes para avançar.",
  },
  {
    id: "v-4",
    tone: "success",
    title: "Base suficiente para formalização inicial",
    description:
      "Já existe estrutura suficiente para consolidar requirements, constraints e decisões iniciais.",
  },
];

export default function DefinitionPage() {
  const spec = useSpec();

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
      <ContextBar
        title={spec.title}
        status={spec.status}
        hasSpec={spec.specId !== null}
        saving={spec.saving}
        onValidate={() => spec.moveStatus("validated")}
      />
      <Workspace spec={spec} />
    </main>
  );
}

function ContextBar({
  title,
  status,
  hasSpec,
  saving,
  onValidate,
}: Readonly<{
  title: string;
  status: SpecStatus;
  hasSpec: boolean;
  saving: boolean;
  onValidate: () => void;
}>) {
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
        <ContextPill label="Projeto" value="AI SDLC Platform" />
        <ContextPill label="Spec" value={hasSpec ? title || "(sem título)" : "Nenhuma ainda"} />

        <a
          href="https://github.com/github/spec-kit/tree/main?tab=readme-ov-file"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          Descoberta baseada em Spec-Driven Development ↗
        </a>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {hasSpec ? <StatusBadge label={formatStatus(status)} tone={statusTone(status)} /> : null}
        <GhostAction label="Validar spec" disabled={!hasSpec || status !== "draft" || saving} onClick={onValidate} />
        <PrimaryAction label="Formalizar entendimento" disabled title="Em breve (ISSUE-0013) — depende de chat real (ISSUE-0012)" />
      </div>
    </section>
  );
}

function Workspace({ spec }: Readonly<{ spec: ReturnType<typeof useSpec> }>) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateRows: "340px 1fr",
        gap: 16,
        padding: 20,
        minHeight: 0,
      }}
    >
      <ConversationSection />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 320px",
          gap: 16,
          minHeight: 0,
        }}
      >
        <UnderstandingDraftPanel />
        <FormalSpecPanel spec={spec} />
        <ValidationPanel />
      </div>
    </section>
  );
}

// ConversationSection é mock estático de propósito — ativar o chat real
// aqui é ISSUE-0012, uma integração de backend diferente (Task/chat, não
// Spec). Inalterado nesta issue.
// Chat real (ISSUE-0012): CopilotChat conectado via /api/copilotkit ->
// apps/agent /copilot/stream -> cria uma Task real (kind: "chat"). Não
// reaproveita CopilotPanel (ver conversation-chat.tsx) — tools de gestão de
// task não fazem sentido nesta página.
function ConversationSection() {
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 22,
        background: "#ffffff",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        boxShadow: "0 18px 40px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid #e2e8f0",
          background:
            "linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,0.95) 100%)",
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
            Conversation
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Entendimento do que precisa ser construído
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label="Extrair requisitos" />
          <Chip label="Encontrar restrições" />
          <Chip label="Detectar edge cases" />
          <Chip label="Consolidar decisões" />
        </div>
      </div>

      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <ConversationChat />
      </div>
    </section>
  );
}

// draftInsights deixou de ser mock hardcoded. Decisão (ISSUE-0011): este
// painel é rascunho client-side efêmero, de propósito — não persistido no
// backend. "Refinar com IA"/"Mover para spec" automático dependem de
// chat real (ISSUE-0012) e transformação assistida (ISSUE-0013); até lá
// ficam desabilitados em vez de simular um comportamento que não existe.
function UnderstandingDraftPanel() {
  return (
    <Panel
      eyebrow="Understanding Draft"
      title="Material em busca de entendimento"
      subtitle="Rascunho local (não persistido) — vire requirement/rule/decision direto na Formal Spec ao lado."
    >
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          border: "1px dashed #cbd5e1",
          color: "#64748b",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        Sem rascunhos ainda. Extração automática a partir de uma conversa real
        depende de ISSUE-0012 (chat) + ISSUE-0013 (transformação assistida).
      </div>
    </Panel>
  );
}

function FormalSpecPanel({ spec }: Readonly<{ spec: ReturnType<typeof useSpec> }>) {
  if (spec.loading) {
    return (
      <Panel
        eyebrow="Formal Spec"
        title="Estrutura operacional da spec"
        subtitle="Carregando…"
      >
        <div />
      </Panel>
    );
  }

  if (spec.specId === null) {
    return (
      <Panel
        eyebrow="Formal Spec"
        title="Estrutura operacional da spec"
        subtitle="Nenhuma spec ainda neste repositório."
      >
        <PrimaryAction label="Criar spec inicial" onClick={() => void spec.createInitialSpec()} disabled={spec.saving} />
        {spec.error ? <ErrorText>{spec.error}</ErrorText> : null}
      </Panel>
    );
  }

  return (
    <Panel
      eyebrow="Formal Spec"
      title="Estrutura operacional da spec"
      subtitle="Seções reais da Spec — editar e salvar persiste no arquivo."
      action={<GhostAction label={spec.saving ? "Salvando…" : "Salvar"} small onClick={() => void spec.saveSections()} disabled={spec.saving} />}
    >
      {spec.error ? <ErrorText>{spec.error}</ErrorText> : null}

      {spec.sections.map((section) => (
        <SpecSectionCard
          key={section.heading}
          section={section}
          onChange={(content) => spec.updateSectionContent(section.heading, content)}
        />
      ))}
    </Panel>
  );
}

function ValidationPanel() {
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
      <div
        style={{
          display: "grid",
          gap: 8,
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
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#2563eb",
          }}
        >
          Validation
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
          Feedback contínuo
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
          Sinais ilustrativos por enquanto — cálculo real a partir do conteúdo
          da Spec é ISSUE-0013.
        </div>
      </div>

      {validationSignals.map((signal) => (
        <ValidationSignalCard key={signal.id} signal={signal} />
      ))}
    </aside>
  );
}

function SpecSectionCard({
  section,
  onChange,
}: Readonly<{
  section: SpecSection;
  onChange: (content: string) => void;
}>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 14,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: "#4338ca" }}>{section.heading}</div>

      <textarea
        value={section.content}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          minHeight: 70,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          padding: 10,
          resize: "vertical",
          fontSize: 13,
          lineHeight: 1.6,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function ValidationSignalCard({
  signal,
}: Readonly<{
  signal: ValidationSignal;
}>) {
  const palette =
    signal.tone === "error"
      ? { fg: "#991b1b", bg: "#fef2f2", border: "#fecaca" }
      : signal.tone === "success"
        ? { fg: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }
        : { fg: "#92400e", bg: "#fffbeb", border: "#fde68a" };

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 14,
        borderRadius: 16,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: palette.fg }}>
        {signal.title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
        {signal.description}
      </div>
    </div>
  );
}

function ErrorText({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        border: "1px solid #fecaca",
        background: "#fef2f2",
        color: "#991b1b",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <section
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
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
            {eyebrow}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
            {title}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>
            {subtitle}
          </div>
        </div>

        {action}
      </div>

      {children}
    </section>
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

function Chip({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <button
      type="button"
      disabled
      style={{
        border: "1px solid #dbeafe",
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "not-allowed",
        opacity: 0.7,
      }}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  label,
  tone,
}: Readonly<{
  label: string;
  tone: "warning" | "success" | "error";
}>) {
  const palette =
    tone === "success"
      ? { fg: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }
      : tone === "error"
        ? { fg: "#991b1b", bg: "#fef2f2", border: "#fecaca" }
        : { fg: "#92400e", bg: "#fffbeb", border: "#fde68a" };

  return (
    <span
      style={{
        padding: "7px 12px",
        borderRadius: 999,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.fg,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  );
}

function PrimaryAction({
  label,
  disabled = false,
  title,
  onClick,
}: Readonly<{
  label: string;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
}>) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      style={{
        height: 38,
        border: "none",
        borderRadius: 12,
        padding: "0 14px",
        background: disabled ? "#94a3b8" : "#2563eb",
        color: "#ffffff",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function GhostAction({
  label,
  small = false,
  disabled = false,
  onClick,
}: Readonly<{
  label: string;
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        height: small ? 30 : 38,
        borderRadius: small ? 10 : 12,
        border: "1px solid #cbd5e1",
        background: disabled ? "#f1f5f9" : "#ffffff",
        color: disabled ? "#94a3b8" : "#0f172a",
        padding: small ? "0 10px" : "0 14px",
        fontSize: small ? 12 : 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function formatStatus(status: SpecStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "validated":
      return "Validated";
    case "active":
      return "Active";
    case "deprecated":
      return "Deprecated";
  }
}

function statusTone(status: SpecStatus): "warning" | "success" | "error" {
  switch (status) {
    case "draft":
      return "warning";
    case "validated":
    case "active":
      return "success";
    case "deprecated":
      return "error";
  }
}
