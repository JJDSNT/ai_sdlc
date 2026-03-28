"use client";

import { useCopilotReadable } from "@copilotkit/react-core";
import {
  CopilotChat,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
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

function cardStyle(borderColor = "#e5e7eb"): React.CSSProperties {
  return {
    border: `1px solid ${borderColor}`,
    borderRadius: 14,
    padding: 14,
    background: "white",
    display: "grid",
    gap: 8,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };
}

function badgeStyle(status: string): React.CSSProperties {
  const color =
    status === "succeeded"
      ? "#16a34a"
      : status === "failed"
      ? "#dc2626"
      : status === "running"
      ? "#2563eb"
      : status === "cancelled"
      ? "#9333ea"
      : "#6b7280";

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: `${color}14`,
    color,
    border: `1px solid ${color}33`,
    width: "fit-content",
  };
}

function truncate(value: string | undefined, max = 160) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function CopilotPanel({
  tasks,
  selectedTaskId,
  selectedTask,
  onSelectTask,
  onTaskCreated,
  onRefreshTasks,
}: {
  tasks: TaskSummary[];
  selectedTaskId: string | null;
  selectedTask: SelectedTask | null;
  onSelectTask: (taskId: string) => void;
  onTaskCreated: (taskId: string) => void;
  onRefreshTasks: () => Promise<void> | void;
}) {
  useCopilotReadable({
    description: "Lista de tasks exibidas na sidebar",
    value: tasks.map((task) => ({
      id: task.id,
      kind: task.kind,
      status: task.status,
      prompt: task.prompt,
    })),
  });

  useCopilotReadable({
    description: "ID da task atualmente selecionada",
    value: selectedTaskId,
  });

  useCopilotReadable({
    description: "Resumo da task selecionada atualmente",
    value: selectedTask
      ? {
          id: selectedTask.id,
          kind: selectedTask.kind,
          status: selectedTask.status,
          prompt: selectedTask.prompt,
          command: selectedTask.command,
          hasOutput: Boolean(selectedTask.output?.text),
          hasError: Boolean(selectedTask.error?.message),
          createdAt: selectedTask.createdAt,
          updatedAt: selectedTask.updatedAt,
        }
      : null,
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
    render: ({ status, args, result }) => {
      return (
        <div style={cardStyle("#dbeafe")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
            TOOL · createChatTask
          </div>
          <div style={badgeStyle(status === "complete" ? "succeeded" : "running")}>
            {status}
          </div>
          <div>
            <strong>Prompt:</strong> {truncate(args.prompt, 220)}
          </div>
          {result?.taskId && (
            <div>
              <strong>Task ID:</strong> {result.taskId}
            </div>
          )}
          {result?.message && <div>{result.message}</div>}
        </div>
      );
    },
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
    render: ({ status, args, result }) => {
      return (
        <div style={cardStyle("#dbeafe")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
            TOOL · createRepoAnalyzeTask
          </div>
          <div style={badgeStyle(status === "complete" ? "succeeded" : "running")}>
            {status}
          </div>
          <div>
            <strong>Path:</strong> {args.path}
          </div>
          <div>
            <strong>Prompt:</strong> {truncate(args.prompt, 220)}
          </div>
          {result?.taskId && (
            <div>
              <strong>Task ID:</strong> {result.taskId}
            </div>
          )}
        </div>
      );
    },
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
    render: ({ status, args, result }) => {
      return (
        <div style={cardStyle("#dbeafe")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
            TOOL · createRepoCommandTask
          </div>
          <div style={badgeStyle(status === "complete" ? "succeeded" : "running")}>
            {status}
          </div>
          <div>
            <strong>Intent:</strong> {args.intent}
          </div>
          <div>
            <strong>Path:</strong> {args.path}
          </div>
          {args.customCommand && (
            <div>
              <strong>Custom:</strong> <code>{args.customCommand}</code>
            </div>
          )}
          {result?.taskId && (
            <div>
              <strong>Task ID:</strong> {result.taskId}
            </div>
          )}
        </div>
      );
    },
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
    render: ({ status, args }) => {
      return (
        <div style={cardStyle("#e5e7eb")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
            TOOL · selectTask
          </div>
          <div style={badgeStyle(status === "complete" ? "succeeded" : "running")}>
            {status}
          </div>
          <div>
            <strong>Task ID:</strong> {args.taskId}
          </div>
        </div>
      );
    },
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
    render: ({ status, result }) => {
      return (
        <div style={cardStyle("#e5e7eb")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
            TOOL · refreshTasks
          </div>
          <div style={badgeStyle(status === "complete" ? "succeeded" : "running")}>
            {status}
          </div>
          {result?.message && <div>{result.message}</div>}
        </div>
      );
    },
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
          <div style={cardStyle("#fde68a")}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>
              TOOL · getSelectedTaskSummary
            </div>
            <div style={badgeStyle(status === "complete" ? "queued" : "running")}>
              {status}
            </div>
            <div>Nenhuma task selecionada.</div>
          </div>
        );
      }

      const task = result.task;

      return (
        <div style={cardStyle("#c7d2fe")}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4338ca" }}>
            TOOL · getSelectedTaskSummary
          </div>
          <div style={badgeStyle(task.status)}>{task.status}</div>
          <div>
            <strong>ID:</strong> {task.id}
          </div>
          <div>
            <strong>Kind:</strong> {task.kind}
          </div>
          {task.prompt && (
            <div>
              <strong>Prompt:</strong> {truncate(task.prompt, 180)}
            </div>
          )}
          {task.command?.resolvedCommand && (
            <div>
              <strong>Resolved command:</strong>{" "}
              <code>{task.command.resolvedCommand}</code>
            </div>
          )}
          {task.outputPreview && (
            <div>
              <strong>Output preview:</strong>
              <div
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  whiteSpace: "pre-wrap",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 12,
                }}
              >
                {task.outputPreview}
              </div>
            </div>
          )}
          {task.errorMessage && (
            <div style={{ color: "#991b1b" }}>
              <strong>Error:</strong> {task.errorMessage}
            </div>
          )}
        </div>
      );
    },
  });

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "1fr",
      }}
    >
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
  );
}