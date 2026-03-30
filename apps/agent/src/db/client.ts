// apps/agent/src/db/client.ts
import { fileURLToPath } from "node:url";
import path from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.js";

// Pega o diretório do arquivo atual (apps/agent/src/db)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sobe dois níveis para chegar em apps/agent/sqlite.db
const dbPath = path.resolve(__dirname, "../../sqlite.db");

const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });