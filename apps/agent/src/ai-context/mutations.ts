//apps/agent/src/ai-context/mutations.ts

import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter, stringifyFrontmatter } from "./frontmatter.js";
import { readIssue } from "./issues.js";
import { ISSUE_TEMPLATE } from "./templates.js";
import {
  IssueFrontmatterSchema,
  type Issue,
  type IssueFrontmatter,
  type IssuePriority,
  type IssueStatus,
  type IssueType,
} from "./types.js";

export class AiContextMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiContextMutationError";
  }
}

// Transições válidas de status via moveIssueStatus(). "consolidated" não
// aparece como destino aqui de propósito: só consolidateIssue() pode chegar
// lá, e só a partir de "done" — reforça a regra de
// AI_context/consolidated/README.md.
const ALLOWED_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  backlog: ["ready", "blocked"],
  ready: ["backlog", "doing", "blocked"],
  doing: ["ready", "review", "blocked"],
  review: ["doing", "done", "blocked"],
  done: ["doing"],
  blocked: ["backlog", "ready", "doing", "review"],
  consolidated: [],
};

const ID_PATTERN = /^(ISSUE|CONSOLIDATED)-(\d{4,})$/;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function issueFilePath(repositoryRoot: string, issueId: string) {
  return path.join(repositoryRoot, "AI_context", "issues", `${issueId}.md`);
}

function consolidatedFilePath(repositoryRoot: string, consolidatedId: string) {
  return path.join(repositoryRoot, "AI_context", "consolidated", `${consolidatedId}.md`);
}

async function nextSequentialId(
  repositoryRoot: string,
  dirName: "issues" | "consolidated",
  prefix: "ISSUE" | "CONSOLIDATED"
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

function frontmatterToRecord(fm: IssueFrontmatter) {
  return {
    id: fm.id,
    title: fm.title,
    status: fm.status,
    priority: fm.priority,
    type: fm.type,
    owner: fm.owner,
    created_at: fm.created_at,
    updated_at: fm.updated_at,
    tags: fm.tags,
    related_files: fm.related_files,
  };
}

async function writeIssueFile(repositoryRoot: string, issue: Issue) {
  const content = `${stringifyFrontmatter(frontmatterToRecord(issue.frontmatter))}\n${issue.body}`;
  await writeFile(issueFilePath(repositoryRoot, issue.frontmatter.id), content, "utf8");
}

async function requireIssue(repositoryRoot: string, issueId: string): Promise<Issue> {
  const issue = await readIssue(repositoryRoot, issueId);

  if (!issue) {
    throw new AiContextMutationError(`Issue não encontrada: ${issueId}`);
  }

  return issue;
}

export type CreateIssueInput = {
  title: string;
  priority: IssuePriority;
  type: IssueType;
  owner: string;
  tags?: string[];
  related_files?: string[];
  body?: string;
};

export async function createIssue(
  repositoryRoot: string,
  input: CreateIssueInput
): Promise<Issue> {
  const id = await nextSequentialId(repositoryRoot, "issues", "ISSUE");
  const today = todayIso();

  const frontmatter = IssueFrontmatterSchema.parse({
    id,
    title: input.title,
    status: "backlog",
    priority: input.priority,
    type: input.type,
    owner: input.owner,
    created_at: today,
    updated_at: today,
    tags: input.tags ?? [],
    related_files: input.related_files ?? [],
  });

  const issue: Issue = {
    frontmatter,
    body: input.body ?? parseFrontmatter(ISSUE_TEMPLATE).body,
    filePath: issueFilePath(repositoryRoot, id),
  };

  await mkdir(path.join(repositoryRoot, "AI_context", "issues"), { recursive: true });
  await writeIssueFile(repositoryRoot, issue);

  return issue;
}

export type UpdateIssuePatch = Partial<
  Pick<IssueFrontmatter, "title" | "priority" | "type" | "owner" | "tags" | "related_files">
> & { body?: string };

export async function updateIssue(
  repositoryRoot: string,
  issueId: string,
  patch: UpdateIssuePatch
): Promise<Issue> {
  const current = await requireIssue(repositoryRoot, issueId);
  const { body: bodyPatch, ...framePatch } = patch;

  const frontmatter = IssueFrontmatterSchema.parse({
    ...current.frontmatter,
    ...framePatch,
    updated_at: todayIso(),
  });

  const issue: Issue = {
    frontmatter,
    body: bodyPatch ?? current.body,
    filePath: current.filePath,
  };

  await writeIssueFile(repositoryRoot, issue);

  return issue;
}

const LOG_HEADING = "# Log de execução";

export async function appendIssueLog(
  repositoryRoot: string,
  issueId: string,
  entry: string
): Promise<Issue> {
  const current = await requireIssue(repositoryRoot, issueId);
  const logLine = `- ${todayIso()}: ${entry}`;

  const body = current.body.includes(LOG_HEADING)
    ? `${current.body.trimEnd()}\n${logLine}\n`
    : `${current.body.trimEnd()}\n\n${LOG_HEADING}\n\n${logLine}\n`;

  const frontmatter = IssueFrontmatterSchema.parse({
    ...current.frontmatter,
    updated_at: todayIso(),
  });

  const issue: Issue = { frontmatter, body, filePath: current.filePath };
  await writeIssueFile(repositoryRoot, issue);

  return issue;
}

export async function moveIssueStatus(
  repositoryRoot: string,
  issueId: string,
  nextStatus: IssueStatus
): Promise<Issue> {
  const current = await requireIssue(repositoryRoot, issueId);
  const allowed = ALLOWED_TRANSITIONS[current.frontmatter.status];

  if (!allowed.includes(nextStatus)) {
    throw new AiContextMutationError(
      `Transição inválida: "${current.frontmatter.status}" → "${nextStatus}". ` +
        `Permitidas a partir de "${current.frontmatter.status}": ${
          allowed.length > 0 ? allowed.join(", ") : "nenhuma"
        }.`
    );
  }

  const frontmatter = IssueFrontmatterSchema.parse({
    ...current.frontmatter,
    status: nextStatus,
    updated_at: todayIso(),
  });

  const issue: Issue = { frontmatter, body: current.body, filePath: current.filePath };
  await writeIssueFile(repositoryRoot, issue);

  return issue;
}

export type ConsolidateIssueResult = {
  issue: Issue;
  consolidatedId: string;
  consolidatedFilePath: string;
};

export async function consolidateIssue(
  repositoryRoot: string,
  issueId: string
): Promise<ConsolidateIssueResult> {
  const current = await requireIssue(repositoryRoot, issueId);

  // Só o status é verificável programaticamente. "Documentação atualizada" e
  // "critérios de aceite satisfeitos" (AI_context/consolidated/README.md)
  // dependem de julgamento humano/do agente antes de chamar esta função.
  if (current.frontmatter.status !== "done") {
    throw new AiContextMutationError(
      `Issue ${issueId} não pode ser consolidada: status é "${current.frontmatter.status}", esperado "done".`
    );
  }

  const consolidatedId = await nextSequentialId(repositoryRoot, "consolidated", "CONSOLIDATED");

  const relatedFilesList =
    current.frontmatter.related_files.length > 0
      ? current.frontmatter.related_files.map((file) => `- ${file}`).join("\n")
      : "(nenhum)";

  const content = `# ${current.frontmatter.title}

Origem: ${issueId}.

# Motivação

Ver ${issueId} (issue original) para o histórico completo de decisões.

# Solução adotada

${current.body.trim()}

# Arquivos alterados

${relatedFilesList}

# Impacto arquitetural

(preencher)

# Documentações atualizadas

(preencher)

# Próximos passos

(preencher)
`;

  await mkdir(path.join(repositoryRoot, "AI_context", "consolidated"), { recursive: true });
  await writeFile(consolidatedFilePath(repositoryRoot, consolidatedId), content, "utf8");

  const frontmatter = IssueFrontmatterSchema.parse({
    ...current.frontmatter,
    status: "consolidated",
    updated_at: todayIso(),
  });

  const issue: Issue = { frontmatter, body: current.body, filePath: current.filePath };
  await writeIssueFile(repositoryRoot, issue);

  return {
    issue,
    consolidatedId,
    consolidatedFilePath: consolidatedFilePath(repositoryRoot, consolidatedId),
  };
}
