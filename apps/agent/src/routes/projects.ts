//apps/agent/src/routes/projects.ts

import { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { projects } from "../db/schema.js";

export async function registerProjectRoutes(app: FastifyInstance) {
  app.get("/projects", async () => {
    const rows = await db.query.projects.findMany();

    return rows.map((p: typeof rows[number]) => ({
      id: p.id,
      name: p.name,
      spec: p.description ?? "",
      progress: 0,
      totalIssues: 0,
      doneIssues: 0,
      wip: 0,
      blocked: 0,
      lastActivity: "agora",
      aiHint: "Sem análise ainda",
    }));
  });
}