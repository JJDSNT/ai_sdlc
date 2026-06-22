//apps/agent/src/ai-context/shared.ts

import { readdir } from "node:fs/promises";
import path from "node:path";

export class AiContextMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiContextMutationError";
  }
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const ID_PATTERN = /^([A-Z]+)-(\d{4,})$/;

// Compartilhado entre mutations.ts (ISSUE/CONSOLIDATED) e specs.ts (SPEC) —
// cada prefixo tem sua própria sequência, escaneando só o diretório dado.
export async function nextSequentialId(
  repositoryRoot: string,
  dirName: string,
  prefix: string
) {
  const dirPath = path.join(repositoryRoot, "AI_context", dirName);
  let entries: string[] = [];

  try {
    entries = await readdir(dirPath);
  } catch {
    entries = [];
  }

  let max = 0;

  for (const entry of entries) {
    const match = entry.replace(/\.md$/, "").match(ID_PATTERN);
    if (match && match[1] === prefix) {
      max = Math.max(max, Number(match[2]));
    }
  }

  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}
