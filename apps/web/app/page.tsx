"use client";

import { useState } from "react";
import { useTask } from "../hooks/use-task";

export default function Page() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const task = useTask(taskId);

  async function handleRun() {
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
    setTaskId(data.task.id);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>AI SDLC</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Digite um prompt..."
        style={{ width: "100%", height: 100 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={handleRun}>Run</button>
      </div>

      {task && (
        <div style={{ marginTop: 20 }}>
          <p>Status: {task.status}</p>
          {task.output?.text && <pre>{task.output.text}</pre>}
        </div>
      )}
    </div>
  );
}