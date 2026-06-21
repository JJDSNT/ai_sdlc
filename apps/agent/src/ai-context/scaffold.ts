//apps/agent/src/ai-context/scaffold.ts

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import {
  README_MAIN,
  README_CONSOLIDATED,
  README_METADATA,
  ISSUE_TEMPLATE,
  CONSOLIDATED_TEMPLATE,
} from "./templates.js";

export type ScaffoldResult = {
  created: string[];
  skipped: string[];
};

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureFile(
  result: ScaffoldResult,
  repositoryRoot: string,
  relativePath: string,
  content: string
) {
  const absolutePath = path.join(repositoryRoot, relativePath);

  if (await exists(absolutePath)) {
    result.skipped.push(relativePath);
    return;
  }

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
  result.created.push(relativePath);
}

// Materializa a árvore AI_context/ em qualquer repositoryRoot. Idempotente:
// nunca sobrescreve um arquivo já existente, apenas preenche o que falta —
// necessário porque a mesma função será chamada futuramente contra
// repositórios-alvo que já podem ter um AI_context/ parcial.
export async function scaffoldAiContext(
  repositoryRoot: string
): Promise<ScaffoldResult> {
  const result: ScaffoldResult = { created: [], skipped: [] };
  const root = "AI_context";

  await mkdir(path.join(repositoryRoot, root, "issues"), { recursive: true });

  await ensureFile(result, repositoryRoot, `${root}/README.md`, README_MAIN);
  await ensureFile(
    result,
    repositoryRoot,
    `${root}/consolidated/README.md`,
    README_CONSOLIDATED
  );
  await ensureFile(
    result,
    repositoryRoot,
    `${root}/metadata/README.md`,
    README_METADATA
  );
  await ensureFile(
    result,
    repositoryRoot,
    `${root}/templates/issue.template.md`,
    ISSUE_TEMPLATE
  );
  await ensureFile(
    result,
    repositoryRoot,
    `${root}/templates/consolidated.template.md`,
    CONSOLIDATED_TEMPLATE
  );

  return result;
}
