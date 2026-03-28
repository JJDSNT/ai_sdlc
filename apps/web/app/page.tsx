// apps/web/app/page.tsx

"use client";

import { useState } from "react";

type TaskResult = {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  summary?: string;
  logs?: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<TaskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createTask() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar task");
      }

      const data = (await res.json()) as TaskResult;
      setResult(data);
    } catch {
      setError("Falha ao chamar o agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>ai_sdlc</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Descreva a task..."
        rows={6}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={createTask}
        disabled={loading || !prompt.trim()}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Enviando..." : "Criar task"}
      </button>

      {error ? (
        <p style={{ marginTop: 16, color: "red" }}>{error}</p>
      ) : null}

      {result ? (
        <pre
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 8,
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </main>
  );
}