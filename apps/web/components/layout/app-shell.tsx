// apps/web/src/components/layout/app-shell.tsx
"use client";

import { ReactNode } from "react";

type Props = {
  sidebar?: ReactNode;
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
};

export function AppShell({ sidebar, left, center, right }: Props) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: `
          ${sidebar ? "260px" : ""}
          ${left ? "240px" : ""}
          1fr
          ${right ? "320px" : ""}
        `,
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent 25%), #f8fafc",
      }}
    >
      {sidebar && (
        <aside
          style={{
            borderRight: "1px solid #e2e8f0",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(10px)",
            padding: 16,
          }}
        >
          {sidebar}
        </aside>
      )}

      {left && (
        <aside
          style={{
            borderRight: "1px solid #e2e8f0",
            padding: 12,
            background: "#ffffff",
          }}
        >
          {left}
        </aside>
      )}

      <section
        style={{
          padding: 20,
          display: "grid",
          gap: 16,
        }}
      >
        {center}
      </section>

      {right && (
        <aside
          style={{
            borderLeft: "1px solid #e2e8f0",
            padding: 16,
            background: "#ffffff",
          }}
        >
          {right}
        </aside>
      )}
    </main>
  );
}