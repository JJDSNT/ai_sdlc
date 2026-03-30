// apps/web/src/app/definition/page.tsx
"use client";

import { TopNav } from "@/components/layout/top-nav";

type DraftInsight = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
};

type FormalSpecBlock = {
  id: string;
  kind: "requirement" | "constraint" | "decision" | "rule" | "acceptance";
  title: string;
  description: string;
  status?: "draft" | "solid" | "needs-review";
};

type ValidationSignal = {
  id: string;
  tone: "error" | "warning" | "success";
  title: string;
  description: string;
};

const draftInsights: DraftInsight[] = [
  {
    id: "d-1",
    title: "Objetivo do sistema",
    description:
      "Reduzir fricção de entrada com login social, sem perder consistência de identidade do usuário entre métodos de autenticação.",
    tags: ["goal", "onboarding"],
  },
  {
    id: "d-2",
    title: "Pergunta em aberto",
    description:
      "O MVP precisa suportar somente Google ou já deve nascer preparado para múltiplos provedores externos?",
    tags: ["open-question", "scope"],
  },
  {
    id: "d-3",
    title: "Restrição percebida",
    description:
      "A autenticação deve funcionar bem para experiência web e não bloquear evolução futura para APIs protegidas.",
    tags: ["constraint", "session"],
  },
  {
    id: "d-4",
    title: "Risco de entendimento",
    description:
      "Se o vínculo entre email social e credenciais locais não for bem definido, pode haver duplicação de conta.",
    tags: ["risk", "identity"],
  },
];

const formalSpecBlocks: FormalSpecBlock[] = [
  {
    id: "s-1",
    kind: "requirement",
    title: "Autenticação por provedores externos",
    description:
      "O sistema deve permitir autenticação por provedores externos configurados, iniciando por Google e mantendo possibilidade de expansão.",
    status: "solid",
  },
  {
    id: "s-2",
    kind: "constraint",
    title: "Fallback por email e senha",
    description:
      "A plataforma deve manter autenticação local como alternativa ao login social, garantindo cobertura de acesso em cenários de indisponibilidade ou escolha do usuário.",
    status: "solid",
  },
  {
    id: "s-3",
    kind: "decision",
    title: "Identidade única por email consolidado",
    description:
      "Quando houver correspondência de email entre métodos de autenticação, a identidade do usuário deve convergir para uma única conta.",
    status: "needs-review",
  },
  {
    id: "s-4",
    kind: "acceptance",
    title: "Critério de aceite inicial",
    description:
      "Usuário consegue autenticar com Google, manter sessão ativa e recuperar acesso via email/senha sem criar contas duplicadas.",
    status: "draft",
  },
];

const validationSignals: ValidationSignal[] = [
  {
    id: "v-1",
    tone: "warning",
    title: "Escopo de provedores ainda ambíguo",
    description:
      "A conversa já indica login social, mas ainda não define claramente quantos provedores entram no MVP.",
  },
  {
    id: "v-2",
    tone: "warning",
    title: "Gestão de sessão ainda parcial",
    description:
      "A spec menciona sessão, mas ainda não formaliza expiração, renovação ou logout.",
  },
  {
    id: "v-3",
    tone: "error",
    title: "Fluxo de conflito de identidade precisa ser fechado",
    description:
      "Ainda falta detalhar como o sistema trata colisão entre login social e credenciais locais com o mesmo email.",
  },
  {
    id: "v-4",
    tone: "success",
    title: "Base suficiente para formalização inicial",
    description:
      "Já existe entendimento suficiente para consolidar requirements, constraints e decisões iniciais.",
  },
];

export default function DefinitionPage() {
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
      <ContextBar />
      <Workspace />
    </main>
  );
}

function ContextBar() {
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
        <ContextPill label="Spec" value="Authentication System" />
        <ContextPill label="Versão" value="Draft v0.1" />

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
        <StatusBadge label="Draft" tone="warning" />
        <GhostAction label="Validar spec" />
        <PrimaryAction label="Formalizar entendimento" />
      </div>
    </section>
  );
}

function Workspace() {
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
        <FormalSpecPanel />
        <ValidationPanel />
      </div>
    </section>
  );
}

function ConversationSection() {
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 22,
        background: "#ffffff",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
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

      <div
        style={{
          padding: 16,
          overflow: "auto",
          display: "grid",
          gap: 12,
          alignContent: "start",
        }}
      >
        <Message role="assistant">
          Vamos começar pelo entendimento do problema. Qual experiência você quer
          habilitar e quais limites esse sistema precisa respeitar?
        </Message>

        <Message role="user">
          Quero um sistema de autenticação que reduza fricção de entrada, permita
          login social e não complique a gestão de conta quando o usuário voltar
          por outro método.
        </Message>

        <Message role="assistant">
          Ótimo. Então temos pelo menos quatro frentes para explorar: objetivo de
          onboarding, provedores iniciais, fallback local e regra de identidade
          única entre métodos de autenticação.
        </Message>

        <Message role="assistant">
          Também parece existir uma preocupação implícita com sessão, recuperação
          de acesso e conflitos entre email social e email manual.
        </Message>
      </div>

      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: 12,
          display: "grid",
          gap: 8,
          background: "#ffffff",
        }}
      >
        <textarea
          placeholder="Descreva o problema, objetivo, restrição ou cenário que a IA deve entender..."
          style={{
            width: "100%",
            minHeight: 78,
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            padding: 12,
            resize: "none",
            fontSize: 14,
            lineHeight: 1.55,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SmallHint label="Objetivo" />
            <SmallHint label="Restrição" />
            <SmallHint label="Risco" />
            <SmallHint label="Hipótese" />
          </div>

          <PrimaryAction label="Enviar" />
        </div>
      </div>
    </section>
  );
}

function UnderstandingDraftPanel() {
  return (
    <Panel
      eyebrow="Understanding Draft"
      title="Material em busca de entendimento"
      subtitle="Aqui ficam hipóteses, intenções, restrições percebidas e pontos ainda não consolidados."
    >
      {draftInsights.map((item) => (
        <DraftInsightCard key={item.id} item={item} />
      ))}
    </Panel>
  );
}

function FormalSpecPanel() {
  return (
    <Panel
      eyebrow="Formal Spec"
      title="Estrutura operacional da spec"
      subtitle="Aqui entra o que já está claro o suficiente para virar requirement, constraint, decision, rule ou acceptance criteria."
    >
      {formalSpecBlocks.map((block) => (
        <FormalSpecCard key={block.id} block={block} />
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
          A spec ainda está em construção, mas já existem sinais suficientes para
          indicar prontidão parcial e pontos que precisam ser fechados antes de
          avançar.
        </div>
      </div>

      <ValidationSummaryCard />

      {validationSignals.map((signal) => (
        <ValidationSignalCard key={signal.id} signal={signal} />
      ))}
    </aside>
  );
}

function DraftInsightCard({
  item,
}: Readonly<{
  item: DraftInsight;
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
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          {item.title}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>
          {item.description}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {item.tags?.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <GhostAction label="Refinar com IA" small />
        <GhostAction label="Mover para spec" small />
      </div>
    </div>
  );
}

function FormalSpecCard({
  block,
}: Readonly<{
  block: FormalSpecBlock;
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
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <KindBadge kind={block.kind} />
          {block.status ? <SpecStatusBadge status={block.status} /> : null}
        </div>

        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          {block.title}
        </div>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>
        {block.description}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <GhostAction label="Melhorar redação" small />
        <GhostAction label="Expandir" small />
        <GhostAction label="Validar bloco" small />
      </div>
    </div>
  );
}

function ValidationSummaryCard() {
  return (
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
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
        Readiness
      </div>

      <ValidationMetric label="Entendimento" value="alto" tone="success" />
      <ValidationMetric label="Formalização" value="média" tone="warning" />
      <ValidationMetric label="Pronta para gerar issues" value="parcial" tone="warning" />
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
      <GhostAction label="Ir para ponto" small />
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  subtitle,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  subtitle: string;
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

      {children}
    </section>
  );
}

function Message({
  role,
  children,
}: Readonly<{
  role: "user" | "assistant";
  children: React.ReactNode;
}>) {
  const isUser = role === "user";

  return (
    <div
      style={{
        maxWidth: "78%",
        justifySelf: isUser ? "end" : "start",
        padding: 12,
        borderRadius: 16,
        background: isUser ? "#2563eb" : "#f1f5f9",
        color: isUser ? "#ffffff" : "#0f172a",
        fontSize: 14,
        lineHeight: 1.6,
        boxShadow: isUser ? "0 8px 20px rgba(37,99,235,0.18)" : "none",
      }}
    >
      {children}
    </div>
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
      style={{
        border: "1px solid #dbeafe",
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function SmallHint({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        fontSize: 12,
        color: "#64748b",
      }}
    >
      {label}
    </span>
  );
}

function Tag({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        fontSize: 11,
        fontWeight: 700,
        color: "#475569",
      }}
    >
      {label}
    </span>
  );
}

function KindBadge({
  kind,
}: Readonly<{
  kind: FormalSpecBlock["kind"];
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
      {kind}
    </span>
  );
}

function SpecStatusBadge({
  status,
}: Readonly<{
  status: NonNullable<FormalSpecBlock["status"]>;
}>) {
  const palette =
    status === "solid"
      ? { fg: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }
      : status === "needs-review"
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

function ValidationMetric({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: string;
  tone: "success" | "warning" | "error";
}>) {
  const palette =
    tone === "success"
      ? { fg: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }
      : tone === "error"
        ? { fg: "#991b1b", bg: "#fef2f2", border: "#fecaca" }
        : { fg: "#92400e", bg: "#fffbeb", border: "#fde68a" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
      }}
    >
      <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          color: palette.fg,
          letterSpacing: "0.06em",
        }}
      >
        {value}
      </span>
    </div>
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
  small = false,
}: Readonly<{
  label: string;
  small?: boolean;
}>) {
  return (
    <button
      type="button"
      style={{
        height: small ? 30 : 38,
        borderRadius: small ? 10 : 12,
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#0f172a",
        padding: small ? "0 10px" : "0 14px",
        fontSize: small ? 12 : 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}