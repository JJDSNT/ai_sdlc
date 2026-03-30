//apps/agent/src/db/seed.ts

import { db } from "./client.js";

async function seed() {
  await db.run(`
    INSERT INTO projects (
      id,
      name,
      description,
      status,
      created_at,
      updated_at
    )
    VALUES (
      'proj_1',
      'AI SDLC',
      'Sistema de engenharia assistida por AI',
      'active',
      datetime('now'),
      datetime('now')
    );
  `);

  console.log("✅ Projeto inserido");
}

seed();