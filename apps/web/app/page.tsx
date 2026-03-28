"use client";

import { useEffect, useMemo, useState } from "react";
import { CopilotPanel } from "../components/copilot-panel";
import { useTask } from "../hooks/use-task";
import { useTasks } from "../hooks/use-tasks";

function getStatusColor(status: string) {
  switch (status) {
    case "queued":
      return "#6b7280";
    case "running":
      return "#2563eb";
    case "succeeded":
      return "#16a34a";
    case "failed":
      return "#dc2626";
    case "cancelled":
      return "#9333ea";
    default:
      return "#6b7280";
  }
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const color = getStatusColor(status);

  return (
    <span
      style={{
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
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 14,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Page() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { tasks, loading, error, refresh } = useTasks();
  const selectedTask = useTask(selectedTaskId);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [tasks]);

  useEffect(() => {
    if (!selectedTask) return;

    if (
      selectedTask.status === "succeeded" ||
      selectedTask.status === "failed" ||
      selectedTask.status === "cancelled"
    ) {
      void refresh();
    }
  }, [selectedTask?.id, selectedTask?.status, refresh]);

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "320px 480px 1fr",
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e5e7eb",
          padding: 20,
          background: "#fbfbfc",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            AI Engineering Console
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 22,
              lineHeight: 1.2,
            }}
          >
            Tasks
          </h1>
        </div>

        <button
          onClick={() => void refresh()}
          disabled={loading}
          style={{
            height: 40,
            width: "100%",
            borderRadius: 12,
            border: "1px solid #d1d5db",
            background: "white",
            color: "#111827",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "Atualizando..." : "Atualizar lista"}
        </button>

        {error && (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#991b1b",
              padding: 12,
              fontSize: 13,
              whiteSpace: "pre-wrap",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {sortedTasks.map((task) => {
            const isSelected = task.id === selectedTaskId;

            return (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  border: isSelected
                    ? "1px solid #94a3b8"
                    : "1px solid #e5e7eb",
                  background: isSelected ? "#f1f5f9" : "white",
                  borderRadius: 14,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 600,
                    }}
                  >
                    {task.kind}
                  </div>

                  <StatusBadge status={task.status} />
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.prompt || "(sem prompt)"}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  {new Date(task.createdAt).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section
        style={{
          borderRight: "1px solid #e5e7eb",
          padding: 16,
          background: "white",
        }}
      >
        <CopilotPanel
          tasks={sortedTasks}
          selectedTaskId={selectedTaskId}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTaskId}
          onTaskCreated={(taskId) => {
            setSelectedTaskId(taskId);
          }}
          onRefreshTasks={refresh}
        />
      </section>

      <section
        style={{
          padding: 24,
          display: "grid",
          gap: 16,
          alignContent: "start",
        }}
      >
        {!selectedTaskId && (
          <div
            style={{
              minHeight: "100%",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                maxWidth: 420,
                color: "#6b7280",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Selecione uma task
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                Use o Copilot no painel central para criar ou selecionar tasks.
              </div>
            </div>
          </div>
        )}

        {selectedTask && (
          <>
            <Panel title="Task">
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>ID:</strong> {selectedTask.id}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <strong>Status:</strong>
                  <StatusBadge status={selectedTask.status} />
                </div>

                <div>
                  <strong>Kind:</strong> {selectedTask.kind}
                </div>

                <div>
                  <strong>Criada em:</strong>{" "}
                  {new Date(selectedTask.createdAt).toLocaleString()}
                </div>

                <div>
                  <strong>Atualizada em:</strong>{" "}
                  {new Date(selectedTask.updatedAt).toLocaleString()}
                </div>
              </div>
            </Panel>

            {selectedTask.prompt && (
              <Panel title="Prompt">
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#111827",
                  }}
                >
                  {selectedTask.prompt}
                </pre>
              </Panel>
            )}

            {selectedTask.output?.text && (
              <Panel title="Output">
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "#0f172a",
                    color: "#e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #1e293b",
                    maxHeight: 520,
                    overflow: "auto",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  {selectedTask.output.text}
                </pre>
              </Panel>
            )}

            {selectedTask.output?.metadata && (
              <Panel title="Metadata">
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "#f8fafc",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 12,
                    lineHeight: 1.6,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(selectedTask.output.metadata, null, 2)}
                </pre>
              </Panel>
            )}

            {selectedTask.error?.message && (
              <Panel title="Error">
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "#fef2f2",
                    color: "#991b1b",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #fecaca",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {selectedTask.error.message}
                  {selectedTask.error.stack
                    ? `\n\n${selectedTask.error.stack}`
                    : ""}
                </pre>
              </Panel>
            )}
          </>
        )}
      </section>
    </main>
  );
}
