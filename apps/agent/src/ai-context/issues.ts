//apps/agent/src/ai-context/issues.ts

import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { IssueFrontmatterSchema, type Issue, type IssueStatus, type IssuePriority } from "./types.js";

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function toIssue(filePath: string, raw: string): Issue | null {
  const { frontmatter, body } = parseFrontmatter(raw);
  const parsed = IssueFrontmatterSchema.safeParse(frontmatter);

  if (!parsed.success) {
    console.warn(`[ai-context] frontmatter inválido em ${filePath}: ${parsed.error.message}`);
    return null;
  }

  return { frontmatter: parsed.data, body, filePath };
}

// Lê AI_context/issues/*.md sob repositoryRoot. Retorna [] se a pasta não
// existir (o repositório-alvo pode ainda não ter sido inicializado com
// scaffoldAiContext).
export async function listIssues(repositoryRoot: string): Promise<Issue[]> {
  const issuesDir = path.join(repositoryRoot, "AI_context", "issues");

  if (!(await exists(issuesDir))) {
    return [];
  }

  const entries = await readdir(issuesDir, { withFileTypes: true });
  const issues: Issue[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const filePath = path.join(issuesDir, entry.name);
    const raw = await readFile(filePath, "utf8");
    const issue = toIssue(filePath, raw);

    if (issue) {
      issues.push(issue);
    }
  }

  return issues;
}

export async function readIssue(
  repositoryRoot: string,
  issueId: string
): Promise<Issue | null> {
  const issues = await listIssues(repositoryRoot);
  return issues.find((issue) => issue.frontmatter.id === issueId) ?? null;
}

export async function filterIssuesByStatus(
  repositoryRoot: string,
  status: IssueStatus
): Promise<Issue[]> {
  const issues = await listIssues(repositoryRoot);
  return issues.filter((issue) => issue.frontmatter.status === status);
}

export async function filterIssuesByPriority(
  repositoryRoot: string,
  priority: IssuePriority
): Promise<Issue[]> {
  const issues = await listIssues(repositoryRoot);
  return issues.filter((issue) => issue.frontmatter.priority === priority);
}

export async function searchIssuesByTag(
  repositoryRoot: string,
  tag: string
): Promise<Issue[]> {
  const issues = await listIssues(repositoryRoot);
  return issues.filter((issue) => issue.frontmatter.tags.includes(tag));
}

export async function filterIssuesBySpec(
  repositoryRoot: string,
  specId: string
): Promise<Issue[]> {
  const issues = await listIssues(repositoryRoot);
  return issues.filter((issue) => issue.frontmatter.spec_id === specId);
}
