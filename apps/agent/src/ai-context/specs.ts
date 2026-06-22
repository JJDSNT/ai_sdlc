//apps/agent/src/ai-context/specs.ts

import { mkdir, readdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter, stringifyFrontmatter } from "./frontmatter.js";
import { AiContextMutationError, nextSequentialId, todayIso } from "./shared.js";
import { SPEC_TEMPLATE } from "./templates.js";
import {
  SpecFrontmatterSchema,
  type Spec,
  type SpecFrontmatter,
  type SpecStatus,
} from "./types.js";

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function specFilePath(repositoryRoot: string, specId: string) {
  return path.join(repositoryRoot, "AI_context", "specs", `${specId}.md`);
}

function toSpec(filePath: string, raw: string): Spec | null {
  const { frontmatter, body } = parseFrontmatter(raw);
  const parsed = SpecFrontmatterSchema.safeParse(frontmatter);

  if (!parsed.success) {
    console.warn(`[ai-context] frontmatter de spec inválido em ${filePath}: ${parsed.error.message}`);
    return null;
  }

  return { frontmatter: parsed.data, body, filePath };
}

// Mesmo padrão de listIssues/readIssue (issues.ts): leitura direta do
// markdown, sem cache. Retorna [] se AI_context/specs ainda não existir.
export async function listSpecs(repositoryRoot: string): Promise<Spec[]> {
  const specsDir = path.join(repositoryRoot, "AI_context", "specs");

  if (!(await exists(specsDir))) {
    return [];
  }

  const entries = await readdir(specsDir, { withFileTypes: true });
  const specs: Spec[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "README.md") {
      continue;
    }

    const filePath = path.join(specsDir, entry.name);
    const raw = await readFile(filePath, "utf8");
    const spec = toSpec(filePath, raw);

    if (spec) {
      specs.push(spec);
    }
  }

  return specs;
}

export async function readSpec(repositoryRoot: string, specId: string): Promise<Spec | null> {
  const specs = await listSpecs(repositoryRoot);
  return specs.find((spec) => spec.frontmatter.id === specId) ?? null;
}

function frontmatterToRecord(fm: SpecFrontmatter) {
  return {
    id: fm.id,
    title: fm.title,
    status: fm.status,
    owner: fm.owner,
    created_at: fm.created_at,
    updated_at: fm.updated_at,
    tags: fm.tags,
  };
}

async function writeSpecFile(repositoryRoot: string, spec: Spec) {
  const content = `${stringifyFrontmatter(frontmatterToRecord(spec.frontmatter))}\n${spec.body}`;
  await writeFile(specFilePath(repositoryRoot, spec.frontmatter.id), content, "utf8");
}

async function requireSpec(repositoryRoot: string, specId: string): Promise<Spec> {
  const spec = await readSpec(repositoryRoot, specId);

  if (!spec) {
    throw new AiContextMutationError(`Spec não encontrada: ${specId}`);
  }

  return spec;
}

export type CreateSpecInput = {
  title: string;
  owner: string;
  tags?: string[];
  body?: string;
};

export async function createSpec(repositoryRoot: string, input: CreateSpecInput): Promise<Spec> {
  const id = await nextSequentialId(repositoryRoot, "specs", "SPEC");
  const today = todayIso();

  const frontmatter = SpecFrontmatterSchema.parse({
    id,
    title: input.title,
    status: "draft",
    owner: input.owner,
    created_at: today,
    updated_at: today,
    tags: input.tags ?? [],
  });

  const spec: Spec = {
    frontmatter,
    body: input.body ?? parseFrontmatter(SPEC_TEMPLATE).body,
    filePath: specFilePath(repositoryRoot, id),
  };

  await mkdir(path.join(repositoryRoot, "AI_context", "specs"), { recursive: true });
  await writeSpecFile(repositoryRoot, spec);

  return spec;
}

export type UpdateSpecPatch = Partial<Pick<SpecFrontmatter, "title" | "owner" | "tags">> & {
  body?: string;
};

export async function updateSpec(
  repositoryRoot: string,
  specId: string,
  patch: UpdateSpecPatch
): Promise<Spec> {
  const current = await requireSpec(repositoryRoot, specId);
  const { body: bodyPatch, ...framePatch } = patch;

  const frontmatter = SpecFrontmatterSchema.parse({
    ...current.frontmatter,
    ...framePatch,
    updated_at: todayIso(),
  });

  const spec: Spec = {
    frontmatter,
    body: bodyPatch ?? current.body,
    filePath: current.filePath,
  };

  await writeSpecFile(repositoryRoot, spec);

  return spec;
}

// Transições mais simples que as de Issue (sem "consolidated" nem
// "blocked"): draft -> validated -> active -> deprecated, com volta de
// active/validated para draft permitida (revisão).
const ALLOWED_TRANSITIONS: Record<SpecStatus, SpecStatus[]> = {
  draft: ["validated"],
  validated: ["draft", "active"],
  active: ["draft", "deprecated"],
  deprecated: [],
};

export async function moveSpecStatus(
  repositoryRoot: string,
  specId: string,
  nextStatus: SpecStatus
): Promise<Spec> {
  const current = await requireSpec(repositoryRoot, specId);
  const allowed = ALLOWED_TRANSITIONS[current.frontmatter.status];

  if (!allowed.includes(nextStatus)) {
    throw new AiContextMutationError(
      `Transição inválida: "${current.frontmatter.status}" → "${nextStatus}". ` +
        `Permitidas a partir de "${current.frontmatter.status}": ${
          allowed.length > 0 ? allowed.join(", ") : "nenhuma"
        }.`
    );
  }

  const frontmatter = SpecFrontmatterSchema.parse({
    ...current.frontmatter,
    status: nextStatus,
    updated_at: todayIso(),
  });

  const spec: Spec = { frontmatter, body: current.body, filePath: current.filePath };
  await writeSpecFile(repositoryRoot, spec);

  return spec;
}
