//apps/agent/src/ai-context/mcp/security.ts

import path from "node:path";

export class McpRepositoryAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "McpRepositoryAccessError";
  }
}

// Mesmo mecanismo de REPO_ALLOWED_ROOT já usado em
// apps/agent/src/services/run-repo-command-task.ts: se a env var estiver
// definida, todo repositoryRoot recebido via ferramenta MCP precisa estar
// dentro dela. Sem ela, qualquer caminho é aceito (ambiente local confiável,
// mesmo padrão já adotado pelo resto do agent).
export function resolveSafeRepositoryRoot(repositoryRoot: string): string {
  const resolvedRepoRoot = path.resolve(repositoryRoot);
  const allowedRoot = process.env.REPO_ALLOWED_ROOT?.trim();

  if (!allowedRoot) {
    return resolvedRepoRoot;
  }

  const resolvedAllowedRoot = path.resolve(allowedRoot);

  if (
    resolvedRepoRoot !== resolvedAllowedRoot &&
    !resolvedRepoRoot.startsWith(`${resolvedAllowedRoot}${path.sep}`)
  ) {
    throw new McpRepositoryAccessError(
      `repositoryRoot fora de REPO_ALLOWED_ROOT: ${resolvedRepoRoot}`
    );
  }

  return resolvedRepoRoot;
}
