// apps/web/src/app/settings/page.tsx
"use client";

import { TopNav } from "@/components/layout/top-nav";

export default function SettingsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "64px 1fr",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent 25%), #f8fafc",
      }}
    >
      <TopNav />

      <section
        style={{
          padding: 24,
          display: "grid",
          gap: 16,
          alignContent: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 8,
            padding: 20,
            borderRadius: 20,
            border: "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Settings
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Configuração do sistema
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            Aqui depois entram políticas de workflow, regras de qualidade,
            configuração de IA e guardrails do projeto.
          </p>
        </div>
      </section>
    </main>
  );
}