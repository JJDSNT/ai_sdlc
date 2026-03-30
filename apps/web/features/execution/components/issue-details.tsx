//apps/web/src/features/execution/components/issue-details.tsx
"use client";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

type SelectedTask = {
  id: string;
  kind: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  prompt?: string | null;
  output?: {
    text?: string | null;
    metadata?: unknown;
  } | null;
  error?: {
    message?: string | null;
    stack?: string | null;
  } | null;
};

export function IssueDetails({
  task,
}: Readonly<{
  task: SelectedTask;
}>) {
  return (
    <>
      <SectionCard
        title="Execution item"
        subtitle="Detalhes da execução atual e contexto operacional."
      >
        <div style={{ display: "grid", gap: 12 }}>
          <InfoRow label="ID" value={task.id} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <strong style={{ fontSize: 13, color: "#334155" }}>Status</strong>
            <StatusBadge status={task.status} />
          </div>

          <InfoRow label="Kind" value={task.kind} />
          <InfoRow
            label="Criada em"
            value={new Date(task.createdAt).toLocaleString()}
          />
          <InfoRow
            label="Atualizada em"
            value={new Date(task.updatedAt).toLocaleString()}
          />
        </div>
      </SectionCard>

      {task.prompt ? (
        <SectionCard title="Prompt" subtitle="Input enviado para a execução.">
          <CodeBlock light>{task.prompt}</CodeBlock>
        </SectionCard>
      ) : null}

      {task.output?.text ? (
        <SectionCard title="Output" subtitle="Resultado textual retornado.">
          <CodeBlock dark>{task.output.text}</CodeBlock>
        </SectionCard>
      ) : null}

      {task.output?.metadata ? (
        <SectionCard
          title="Metadata"
          subtitle="Metadados úteis para análise e debug."
        >
          <CodeBlock light>
            {JSON.stringify(task.output.metadata, null, 2)}
          </CodeBlock>
        </SectionCard>
      ) : null}

      {task.error?.message ? (
        <SectionCard title="Error" subtitle="Falha capturada durante a execução.">
          <CodeBlock error>
            {task.error.message}
            {task.error.stack ? `\n\n${task.error.stack}` : ""}
          </CodeBlock>
        </SectionCard>
      ) : null}
    </>
  );
}

function InfoRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#0f172a",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CodeBlock({
  children,
  dark = false,
  light = false,
  error = false,
}: Readonly<{
  children: React.ReactNode;
  dark?: boolean;
  light?: boolean;
  error?: boolean;
}>) {
  const background = error ? "#fef2f2" : dark ? "#0f172a" : "#f8fafc";
  const color = error ? "#991b1b" : dark ? "#e2e8f0" : "#0f172a";
  const border = error ? "#fecaca" : dark ? "#1e293b" : "#e2e8f0";

  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        background,
        color,
        padding: 16,
        borderRadius: 16,
        border: `1px solid ${border}`,
        overflow: "auto",
        maxHeight: 520,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 12.5,
        lineHeight: 1.65,
      }}
    >
      {children}
    </pre>
  );
}