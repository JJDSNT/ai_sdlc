"use client";

import { useEffect, useMemo, useState } from "react";
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

function StatusBadge({ status }: { status: string }) {
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
  const [prompt, setPrompt] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  async function handleRunChat() {
    if (!prompt.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
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
        throw new Error(
          data?.message || `Task creation failed: ${res.status}`
        );
      }

      if (data?.task?.id) {
        setSelectedTaskId(data.task.id);
      }

      setPrompt("");
      await refresh();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Erro ao criar task"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
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

        <div
          style={{
            display: "grid",
            gap: 10,
            padding: 14,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Novo prompt
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Digite um prompt..."
            style={{
              width: "100%",
              minHeight: 110,
              resize: "vertical",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              padding: 12,
              font: "inherit",
              outline: "none",
              background: "#fff",
            }}
          />

          <button
            onClick={handleRunChat}
            disabled={!prompt.trim() || creating}
            style={{
              height: 40,
              border: 0,
              borderRadius: 12,
              background: !prompt.trim() || creating ? "#cbd5e1" : "#111827",
              color: "white",
              fontWeight: 600,
              cursor: !prompt.trim() || creating ? "not-allowed" : "pointer",
            }}
          >
            {creating ? "Criando..." : "Nova task de chat"}
          </button>

          <button
            onClick={() => void refresh()}
            disabled={loading}
            style={{
              height: 40,
              borderRadius: 12,
              border: "1px solid #d1d5db",
              background: "white",
              color: "#111827",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Atualizando..." : "Atualizar lista"}
          </button>

          {createError && (
            <div
              style={{
                borderRadius: 12,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#991b1b",
                padding: 12,
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {createError}
            </div>
          )}

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
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              marginBottom: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            Histórico
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {sortedTasks.length === 0 && !loading && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px dashed #d1d5db",
                  color: "#6b7280",
                  background: "white",
                  fontSize: 14,
                }}
              >
                Nenhuma task criada ainda.
              </div>
            )}

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
                    boxShadow: isSelected
                      ? "0 1px 2px rgba(0,0,0,0.06)"
                      : "0 1px 1px rgba(0,0,0,0.03)",
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
        </div>
      </aside>

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
                Selecione ou crie uma task
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                Use a sidebar para iniciar uma nova execução e acompanhar o
                resultado em tempo real.
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

            {selectedTask.command && (
              <Panel title="Command">
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedTask.command.intent && (
                    <div>
                      <strong>Intent:</strong> {selectedTask.command.intent}
                    </div>
                  )}

                  {selectedTask.command.customCommand && (
                    <div>
                      <strong>Custom:</strong>{" "}
                      <code>{selectedTask.command.customCommand}</code>
                    </div>
                  )}

                  {selectedTask.command.resolvedCommand && (
                    <div>
                      <strong>Resolved:</strong>{" "}
                      <code>{selectedTask.command.resolvedCommand}</code>
                    </div>
                  )}

                  {selectedTask.command.ecosystem && (
                    <div>
                      <strong>Ecosystem:</strong>{" "}
                      {selectedTask.command.ecosystem}
                    </div>
                  )}

                  {selectedTask.command.reason && (
                    <div>
                      <strong>Reason:</strong> {selectedTask.command.reason}
                    </div>
                  )}
                </div>
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