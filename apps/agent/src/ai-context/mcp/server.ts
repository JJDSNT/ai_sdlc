//apps/agent/src/ai-context/mcp/server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  IssueEffortSchema,
  IssuePrioritySchema,
  IssueStatusSchema,
  IssueTypeSchema,
  appendIssueLog,
  consolidateIssue,
  createIssue,
  listIssues,
  moveIssueStatus,
  readIssue,
  searchIssuesByTag,
  updateIssue,
} from "../index.js";
import { resolveSafeRepositoryRoot } from "../security.js";

const repositoryRootInput = z
  .string()
  .describe("Caminho absoluto do repositório-alvo (o mesmo conceito de repositoryRoot usado pelos run-repo-*-task.ts).");

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

const server = new McpServer({ name: "ai-context", version: "0.1.0" });

server.registerTool(
  "list_issues",
  {
    title: "Listar issues do AI_context",
    description:
      "Lista as issues de AI_context/issues/*.md de um repositório-alvo, com filtros opcionais por status/priority/tag.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      status: IssueStatusSchema.optional(),
      priority: IssuePrioritySchema.optional(),
      tag: z.string().optional(),
    },
  },
  async ({ repositoryRoot, status, priority, tag }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      let issues = await listIssues(root);

      if (status) issues = issues.filter((issue) => issue.frontmatter.status === status);
      if (priority) issues = issues.filter((issue) => issue.frontmatter.priority === priority);
      if (tag) issues = issues.filter((issue) => issue.frontmatter.tags.includes(tag));

      return textResult(issues.map((issue) => issue.frontmatter));
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "read_issue",
  {
    title: "Ler uma issue do AI_context",
    description: "Lê o frontmatter e o corpo completo de uma issue pelo id (ex. ISSUE-0001).",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      issueId: z.string(),
    },
  },
  async ({ repositoryRoot, issueId }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const issue = await readIssue(root, issueId);

      if (!issue) {
        return errorResult(new Error(`Issue não encontrada: ${issueId}`));
      }

      return textResult({ frontmatter: issue.frontmatter, body: issue.body });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "search_context",
  {
    title: "Buscar issues por tag",
    description: "Busca issues do AI_context por tag.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      tag: z.string(),
    },
  },
  async ({ repositoryRoot, tag }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const issues = await searchIssuesByTag(root, tag);

      return textResult(issues.map((issue) => issue.frontmatter));
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "create_issue",
  {
    title: "Criar issue no AI_context",
    description: "Cria uma nova issue com o próximo ID sequencial, status inicial backlog.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      title: z.string(),
      priority: IssuePrioritySchema,
      type: IssueTypeSchema,
      owner: z.string(),
      tags: z.array(z.string()).optional(),
      related_files: z.array(z.string()).optional(),
      body: z.string().optional(),
      spec_id: z.string().optional(),
      effort: IssueEffortSchema.optional(),
      depends_on: z.array(z.string()).optional(),
    },
  },
  async ({ repositoryRoot, ...input }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const issue = await createIssue(root, input);

      return textResult(issue.frontmatter);
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "update_issue",
  {
    title: "Atualizar issue do AI_context",
    description: "Atualiza campos do frontmatter (e opcionalmente o corpo) de uma issue existente.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      issueId: z.string(),
      title: z.string().optional(),
      priority: IssuePrioritySchema.optional(),
      type: IssueTypeSchema.optional(),
      owner: z.string().optional(),
      tags: z.array(z.string()).optional(),
      related_files: z.array(z.string()).optional(),
      body: z.string().optional(),
      spec_id: z.string().optional(),
      effort: IssueEffortSchema.optional(),
      depends_on: z.array(z.string()).optional(),
    },
  },
  async ({ repositoryRoot, issueId, ...patch }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const issue = await updateIssue(root, issueId, patch);

      return textResult(issue.frontmatter);
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "append_issue_log",
  {
    title: "Adicionar entrada ao log de execução",
    description: "Adiciona uma linha datada à seção \"Log de execução\" de uma issue.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      issueId: z.string(),
      entry: z.string(),
    },
  },
  async ({ repositoryRoot, issueId, entry }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const issue = await appendIssueLog(root, issueId, entry);

      return textResult(issue.frontmatter);
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "move_issue_status",
  {
    title: "Mover status de uma issue",
    description:
      "Transiciona o status de uma issue, validando contra as transições permitidas. \"consolidated\" nunca é um destino válido aqui — use consolidate_issue.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      issueId: z.string(),
      status: IssueStatusSchema,
    },
  },
  async ({ repositoryRoot, issueId, status }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const issue = await moveIssueStatus(root, issueId, status);

      return textResult(issue.frontmatter);
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.registerTool(
  "consolidate_issue",
  {
    title: "Consolidar uma issue",
    description:
      "Promove uma issue \"done\" para AI_context/consolidated/, gerando o arquivo CONSOLIDATED-XXXX.md e marcando a issue original como consolidated.",
    inputSchema: {
      repositoryRoot: repositoryRootInput,
      issueId: z.string(),
    },
  },
  async ({ repositoryRoot, issueId }) => {
    try {
      const root = resolveSafeRepositoryRoot(repositoryRoot);
      const result = await consolidateIssue(root, issueId);

      return textResult({
        issue: result.issue.frontmatter,
        consolidatedId: result.consolidatedId,
        consolidatedFilePath: result.consolidatedFilePath,
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout é o protocolo MCP — diagnóstico só vai para stderr.
  console.error("[ai-context mcp] servidor conectado via stdio");
}

main().catch((error) => {
  console.error("[ai-context mcp] falha ao iniciar:", error);
  process.exit(1);
});
