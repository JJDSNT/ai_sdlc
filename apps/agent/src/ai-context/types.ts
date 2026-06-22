//apps/agent/src/ai-context/types.ts

import { z } from "zod";

export const IssueStatusSchema = z.enum([
  "backlog",
  "ready",
  "doing",
  "review",
  "done",
  "consolidated",
  "blocked",
]);

export const IssuePrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const IssueTypeSchema = z.enum([
  "feature",
  "bug",
  "refactor",
  "research",
  "docs",
  "infra",
]);

export type IssueStatus = z.infer<typeof IssueStatusSchema>;
export type IssuePriority = z.infer<typeof IssuePrioritySchema>;
export type IssueType = z.infer<typeof IssueTypeSchema>;

export const IssueFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  type: IssueTypeSchema,
  owner: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(z.string()).default([]),
  related_files: z.array(z.string()).default([]),
  // Opcional, nunca obrigatório (ISSUE-0008): issues de memória de agente
  // não nascem de uma Spec, só issues de produto têm esse vínculo.
  spec_id: z.string().optional(),
});

export type IssueFrontmatter = z.infer<typeof IssueFrontmatterSchema>;

export type Issue = {
  frontmatter: IssueFrontmatter;
  body: string;
  filePath: string;
};

export const SpecStatusSchema = z.enum(["draft", "validated", "active", "deprecated"]);

export type SpecStatus = z.infer<typeof SpecStatusSchema>;

export const SpecFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: SpecStatusSchema,
  owner: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(z.string()).default([]),
});

export type SpecFrontmatter = z.infer<typeof SpecFrontmatterSchema>;

export type Spec = {
  frontmatter: SpecFrontmatter;
  body: string;
  filePath: string;
};
