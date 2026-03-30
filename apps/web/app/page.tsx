// apps/web/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";

type Project = {
  id: string;
  name: string;
  spec: string;
  progress: number;
  totalIssues: number;
  doneIssues: number;
  wip: number;
  blocked: number;
  lastActivity: string;
  aiHint: string;
};

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "64px auto 1fr",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent 25%), #f8fafc",
      }}
    >
      <TopNav />

      {/* HEADER */}
      <section
        style={{
          padding: 20,
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Overview
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Projetos ativos
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#475569",
              maxWidth: 720,
            }}
          >
            Acompanhe o estado dos sistemas, identifique riscos e entre no ponto
            certo para avançar.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
          alignContent: "start",
        }}
      >
        {loading && (
          <div style={{ color: "#64748b" }}>Carregando projetos...</div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{ color: "#64748b" }}>
            Nenhum projeto encontrado.
          </div>
        )}

        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>
    </main>
  );
}

function ProjectCard({
  project,
}: Readonly<{
  project: Project;
}>) {
  return (
    <Link
      href="/definition"
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 14,
          padding: 18,
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
            {project.name}
          </div>

          <div style={{ fontSize: 13, color: "#64748b" }}>
            {project.spec}
          </div>
        </div>

        {/* PROGRESS */}
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#475569",
            }}
          >
            <span>Sprint</span>
            <strong style={{ color: "#0f172a" }}>
              {project.progress}%
            </strong>
          </div>

          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              background: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${project.progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
              }}
            />
          </div>

          <div style={{ fontSize: 12, color: "#64748b" }}>
            {project.doneIssues} de {project.totalIssues} issues concluídas
          </div>
        </div>

        {/* METRICS */}
        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span>WIP: {project.wip}</span>
          <span style={{ color: "#dc2626" }}>
            Bloqueios: {project.blocked}
          </span>
        </div>

        {/* AI INSIGHT */}
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 12,
            color: "#475569",
          }}
        >
          💡 {project.aiHint}
        </div>

        {/* FOOTER */}
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          Última atividade: {project.lastActivity}
        </div>
      </div>
    </Link>
  );
}