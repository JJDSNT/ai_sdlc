"use client";

import { useMemo, useState } from "react";
import { useTask } from "../hooks/use-task";
import { useTasks } from "../hooks/use-tasks";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { tasks, loading, refresh } = useTasks();
  const selectedTask = useTask(selectedTaskId);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [tasks]);

  async function handleRunChat() {
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

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Task creation failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    setSelectedTaskId(data.task.id);
    setPrompt("");
    await refresh();
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e5e7eb",
          padding: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Tasks</h2>

        <div style={{ display: "grid", gap: 8 }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Digite um prompt..."
            style={{ width: "100%", minHeight: 100 }}
          />

          <button onClick={handleRunChat} disabled={!prompt.trim()}>
            Nova task de chat
          </button>

          <button onClick={() => void refresh()} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {sortedTasks.map((task) => {
            const isSelected = task.id === selectedTaskId;

            return (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                style={{
                  textAlign: "left",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  background: isSelected ? "#f3f4f6" : "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>{task.kind}</div>
                <div style={{ fontWeight: 600 }}>{task.status}</div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.prompt || "(sem prompt)"}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section style={{ padding: 24 }}>
        {!selectedTaskId && <p>Selecione ou crie uma task.</p>}

        {selectedTask && (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <h1 style={{ marginBottom: 8 }}>Task</h1>
              <div><strong>ID:</strong> {selectedTask.id}</div>
              <div><strong>Status:</strong> {selectedTask.status}</div>
              <div><strong>Kind:</strong> {selectedTask.kind}</div>
              {selectedTask.prompt && (
                <div style={{ marginTop: 8 }}>
                  <strong>Prompt:</strong>
                  <pre>{selectedTask.prompt}</pre>
                </div>
              )}
            </div>

            {selectedTask.command && (
              <div>
                <h2>Command</h2>
                <div><strong>Intent:</strong> {selectedTask.command.intent}</div>
                {selectedTask.command.resolvedCommand && (
                  <div>
                    <strong>Resolved:</strong> {selectedTask.command.resolvedCommand}
                  </div>
                )}
                {selectedTask.command.ecosystem && (
                  <div>
                    <strong>Ecosystem:</strong> {selectedTask.command.ecosystem}
                  </div>
                )}
                {selectedTask.command.reason && (
                  <div>
                    <strong>Reason:</strong> {selectedTask.command.reason}
                  </div>
                )}
              </div>
            )}

            {selectedTask.output?.text && (
              <div>
                <h2>Output</h2>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    background: "#f9fafb",
                    padding: 16,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {selectedTask.output.text}
                </pre>
              </div>
            )}

            {selectedTask.error?.message && (
              <div>
                <h2>Error</h2>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    background: "#fef2f2",
                    padding: 16,
                    border: "1px solid #fecaca",
                  }}
                >
                  {selectedTask.error.message}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}