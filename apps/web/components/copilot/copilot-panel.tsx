// apps/web/src/components/copilot/copilot-panel.tsx
"use client";

import { useMemo } from "react";
import { useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat, useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

type TaskSummary = {
  id: string;
  kind: string;
  status: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
};

type SelectedTask = {
  id: string;
  kind: string;
  status: string;
  prompt?: string;
  output?: {
    text?: string;
    metadata?: Record<string, unknown>;
  };
  command?: {
    intent?: string;
    customCommand?: string;
    resolvedCommand?: string;
    ecosystem?: string;
    reason?: string;
  };
  error?: {
    message?: string;
    stack?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type CopilotPanelProps = {
  tasks: TaskSummary[];
  selectedTaskId: string | null;
  selectedTask: SelectedTask | null;
  onSelectTask: (taskId: string) => void;
  onTaskCreated: (taskId: string) => void;
  onRefreshTasks: () => Promise<void> | void;
};

type ToolRenderStatus = "running" | "complete" | "error";

function getStatusPalette(status: string) {
  switch (status) {
    case "succeeded":
      return { fg: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" };
    case "failed":
      return { fg: "#b91c1c", bg: "#fef2f2", border: "#fecaca" };
    case "running":
      return { fg: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" };
    case "cancelled":
      return { fg: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe" };
    case "queued":
    default:
      return { fg: "#475569", bg: "#f8fafc", border: "#cbd5e1" };
  }
}

function normalizeToolStatus(status: ToolRenderStatus): string {
  if (status === "complete") return "succeeded";
  if (status === "error") return "failed";
  return "running";
}

function truncate(value?: string, max = 160) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function ToolBadge({
  status,
}: Readonly<{
  status: string;
}>) {
  const palette = getStatusPalette(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.03em",
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        width: "fit-content",
        textTransform: "capitalize",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: palette.fg,
          display: "inline-block",
          boxShadow: `0 0 0 3px ${palette.bg}`,
        }}
      />
      {status}
    </span>
  );
}

function ToolCard({
  name,
  tone = "blue",
  status,
  children,
}: Readonly<{
  name: string;
  tone?: "blue" | "slate" | "amber" | "indigo";
  status: ToolRenderStatus;
  children: React.ReactNode;
}>) {
  const tones = {
    blue: {
      border: "#dbeafe",
      label: "#1d4ed8",
      bg: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    },
    slate: {
      border: "#e2e8f0",
      label: "#334155",
      bg: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    },
    amber: {
      border: "#fde68a",
      label: "#92400e",
      bg: "linear-gradient(180deg, #fffdf7 0%, #fffbeb 100%)",
    },
    indigo: {
      border: "#c7d2fe",
      label: "#4338ca",
      bg: "linear-gradient(180deg, #ffffff 0%, #f5f7ff 100%)",
    },
  };

  const currentTone = tones[tone];

  return (
    <div
      style={{
        border: `1px solid ${currentTone.border}`,
        borderRadius: 18,
        padding: 16,
        background: currentTone.bg,
        display: "grid",
        gap: 12,
        boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: currentTone.label,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Tool · {name}
        </div>

        <ToolBadge status={normalizeToolStatus(status)} />
      </div>

      {children}
    </div>
  );
}

function CodeInline({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <code
      style={{
        fontSize: 12,
        padding: "3px 8px",
        borderRadius: 10,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
      }}
    >
      {children}
    </code>
  );
}

function InfoLine({
  label,
  value,
}: Readonly<{
  label: string;
  value: React.ReactNode;
}>) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.65, color: "#0f172a" }}>
      <strong style={{ color: "#334155" }}>{label}:</strong> {value}
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
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.8)",
        padding: "10px 12px",
        display: "grid",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function CopilotPanel({
  tasks,
  selectedTaskId,
  selectedTask,
  onSelectTask,
  onTaskCreated,
  onRefreshTasks,
}: CopilotPanelProps) {
  const readableTaskList = useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        kind: task.kind,
        status: task.status,
        prompt: task.prompt,
      })),
    [tasks],
  );

  const readableSelectedTask = useMemo(() => {
    if (!selectedTask) return null;

    return {
      id: selectedTask.id,
      kind: selectedTask.kind,
      status: selectedTask.status,
      prompt: selectedTask.prompt,
      command: selectedTask.command,
      hasOutput: Boolean(selectedTask.output?.text),
      hasError: Boolean(selectedTask.error?.message),
      createdAt: selectedTask.createdAt,
      updatedAt: selectedTask.updatedAt,
    };
  }, [selectedTask]);

  useCopilotReadable({
    description: "Lista de tasks exibidas na sidebar",
    value: readableTaskList,
  });

  useCopilotReadable({
    description: "ID da task atualmente selecionada",
    value: selectedTaskId,
  });

  useCopilotReadable({
    description: "Resumo da task selecionada atualmente",
    value: readableSelectedTask,
  });

  useFrontendTool({
    name: "createChatTask",
    description: "Cria uma nova task de chat",
    parameters: z.object({
      prompt: z.string().min(1),
    }),
    handler: async ({ prompt }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "chat",
          prompt,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.message || "Falha ao criar task de chat");
      }

      const taskId = data?.task?.id as string | undefined;

      if (taskId) {
        onTaskCreated(taskId);
        await onRefreshTasks();
      }

      return {
        ok: true,
        taskId,
        kind: "chat",
        prompt,
        message: taskId
          ? `Task criada com sucesso: ${taskId}`
          : "Task criada com sucesso",
      };
    },
    render: ({ status, args, result }) => (
      <ToolCard name="createChatTask" tone="blue" status={status}>
        <InfoLine label="Prompt" value={truncate(args.prompt, 220)} />
        {result?.taskId ? <InfoLine label="Task ID" value={result.taskId} /> : null}
        {result?.message ? (
          <div style={{ fontSize: 13, color: "#334155" }}>{result.message}</div>
        ) : null}
      </ToolCard>
    ),
  });

  useFrontendTool({
    name: "createRepoAnalyzeTask",
    description: "Cria uma task de análise de repositório local",
    parameters: z.object({
      prompt: z.string().min(1),
      path: z.string().min(1),
    }),
    handler: async ({ prompt, path }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "repo-analyze",
          prompt,
          target: {
            kind: "local_path",
            path,
          },
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.message || "Falha ao criar análise de repositório");
      }

      const taskId = data?.task?.id as string | undefined;

      if (taskId) {
        onTaskCreated(taskId);
        await onRefreshTasks();
      }

      return {
        ok: true,
        taskId,
        kind: "repo-analyze",
        path,
        prompt,
        message: taskId
          ? `Análise criada com sucesso: ${taskId}`
          : "Análise criada com sucesso",
      };
    },
    render: ({ status, args, result }) => (
      <ToolCard name="createRepoAnalyzeTask" tone="blue" status={status}>
        <InfoLine label="Path" value={<CodeInline>{args.path}</CodeInline>} />
        <InfoLine label="Prompt" value={truncate(args.prompt, 220)} />
        {result?.taskId ? <InfoLine label="Task ID" value={result.taskId} /> : null}
      </ToolCard>
    ),
  });

  useFrontendTool({
    name: "createRepoCommandTask",
    description: "Cria uma task para executar um comando em um repositório local",
    parameters: z.object({
      intent: z.enum(["build", "test", "lint", "format", "install", "custom"]),
      path: z.string().min(1),
      customCommand: z.string().optional(),
    }),
    handler: async ({ intent, path, customCommand }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "repo-command",
          target: {
            kind: "local_path",
            path,
          },
          command: {
            intent,
            customCommand,
          },
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.message || "Falha ao criar comando de repositório");
      }

      const taskId = data?.task?.id as string | undefined;

      if (taskId) {
        onTaskCreated(taskId);
        await onRefreshTasks();
      }

      return {
        ok: true,
        taskId,
        intent,
        path,
        customCommand,
        message: taskId
          ? `Comando criado com sucesso: ${taskId}`
          : "Comando criado com sucesso",
      };
    },
    render: ({ status, args, result }) => (
      <ToolCard name="createRepoCommandTask" tone="blue" status={status}>
        <InfoLine label="Intent" value={args.intent} />
        <InfoLine label="Path" value={<CodeInline>{args.path}</CodeInline>} />
        {args.customCommand ? (
          <InfoLine
            label="Custom"
            value={<CodeInline>{args.customCommand}</CodeInline>}
          />
        ) : null}
        {result?.taskId ? <InfoLine label="Task ID" value={result.taskId} /> : null}
      </ToolCard>
    ),
  });

  useFrontendTool({
    name: "selectTask",
    description: "Seleciona uma task existente na interface",
    parameters: z.object({
      taskId: z.string().min(1),
    }),
    handler: async ({ taskId }) => {
      onSelectTask(taskId);

      return {
        ok: true,
        taskId,
        message: `Task ${taskId} selecionada`,
      };
    },
    render: ({ status, args }) => (
      <ToolCard name="selectTask" tone="slate" status={status}>
        <InfoLine label="Task ID" value={args.taskId} />
      </ToolCard>
    ),
  });

  useFrontendTool({
    name: "refreshTasks",
    description: "Atualiza a lista de tasks da interface",
    parameters: z.object({}),
    handler: async () => {
      await onRefreshTasks();

      return {
        ok: true,
        message: "Lista de tasks atualizada",
      };
    },
    render: ({ status, result }) => (
      <ToolCard name="refreshTasks" tone="slate" status={status}>
        {result?.message ? (
          <div style={{ fontSize: 13, color: "#334155" }}>{result.message}</div>
        ) : null}
      </ToolCard>
    ),
  });

  useFrontendTool({
    name: "getSelectedTaskSummary",
    description:
      "Retorna um resumo da task atualmente selecionada na interface",
    parameters: z.object({}),
    handler: async () => {
      if (!selectedTask) {
        return {
          ok: false,
          selected: false,
          message: "Nenhuma task está selecionada no momento.",
        };
      }

      return {
        ok: true,
        selected: true,
        task: {
          id: selectedTask.id,
          kind: selectedTask.kind,
          status: selectedTask.status,
          prompt: selectedTask.prompt,
          command: selectedTask.command,
          outputPreview: truncate(selectedTask.output?.text, 400),
          errorMessage: selectedTask.error?.message,
          createdAt: selectedTask.createdAt,
          updatedAt: selectedTask.updatedAt,
        },
      };
    },
    render: ({ status, result }) => {
      if (!result?.selected) {
        return (
          <ToolCard name="getSelectedTaskSummary" tone="amber" status={status}>
            <div style={{ fontSize: 13, color: "#92400e" }}>
              Nenhuma task selecionada.
            </div>
          </ToolCard>
        );
      }

      const task = result.task;

      return (
        <ToolCard name="getSelectedTaskSummary" tone="indigo" status={status}>
          <ToolBadge status={task.status} />
          <InfoLine label="ID" value={task.id} />
          <InfoLine label="Kind" value={task.kind} />

          {task.prompt ? (
            <InfoLine label="Prompt" value={truncate(task.prompt, 180)} />
          ) : null}

          {task.command?.resolvedCommand ? (
            <InfoLine
              label="Resolved command"
              value={<CodeInline>{task.command.resolvedCommand}</CodeInline>}
            />
          ) : null}

          {task.outputPreview ? (
            <div>
              <strong style={{ fontSize: 13, color: "#334155" }}>
                Output preview:
              </strong>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  whiteSpace: "pre-wrap",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: "#0f172a",
                }}
              >
                {task.outputPreview}
              </div>
            </div>
          ) : null}

          {task.errorMessage ? (
            <div style={{ color: "#991b1b", fontSize: 13 }}>
              <strong>Error:</strong> {task.errorMessage}
            </div>
          ) : null}
        </ToolCard>
      );
    },
  });

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto auto 1fr auto",
        gap: 14,
      }}
    >
      <div
        style={{
          border: "1px solid #dbeafe",
          borderRadius: 22,
          padding: 18,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(124,58,237,0.08) 100%), #ffffff",
          boxShadow: "0 18px 40px rgba(37,99,235,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#1d4ed8",
            marginBottom: 8,
          }}
        >
          AI Copilot
        </div>

        <div
          style={{
            fontSize: 28,
            lineHeight: 1.05,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 10,
          }}
        >
          Operador do workspace
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#475569",
            maxWidth: 720,
          }}
        >
          Crie tasks, analise repositórios, execute comandos e navegue pelo fluxo
          atual sem sair do contexto da execução.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <ContextPill label="Tasks visíveis" value={String(tasks.length)} />
        <ContextPill
          label="Task selecionada"
          value={selectedTaskId ? selectedTaskId : "Nenhuma"}
        />
        <ContextPill
          label="Status atual"
          value={selectedTask?.status ?? "Sem seleção"}
        />
      </div>

      <div
        style={{
          minHeight: 0,
          border: "1px solid #e2e8f0",
          borderRadius: 24,
          overflow: "hidden",
          background: "rgba(255,255,255,0.86)",
          boxShadow: "0 20px 40px rgba(15,23,42,0.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #e2e8f0",
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,0.8) 100%)",
            fontSize: 13,
            color: "#475569",
          }}
        >
          Conversa contextual com ferramentas conectadas à interface.
        </div>

        <div style={{ height: "100%" }}>
          <CopilotChat
            instructions={[
              "Você é um copiloto de um console de engenharia de software.",
              "Quando fizer sentido, use as tools disponíveis em vez de responder apenas em texto.",
              "Se o usuário pedir para executar algo, prefira criar tasks.",
              "Se o usuário pedir detalhes da task atual, use getSelectedTaskSummary.",
              "Se houver tasks relevantes, você pode sugerir que o usuário selecione uma delas.",
            ].join(" ")}
            labels={{
              title: "Copilot",
              initial:
                "Posso criar tasks, selecionar tasks e resumir a task atualmente selecionada.",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          Criar task de chat
        </span>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          Analisar repositório
        </span>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          Executar comando
        </span>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          Resumir task atual
        </span>
      </div>
    </div>
  );
}