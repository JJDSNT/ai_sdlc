//apps/agent/src/routes/ai-context.ts

import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";

import {
  AiContextAccessError,
  AiContextMutationError,
  IssuePrioritySchema,
  IssueStatusSchema,
  IssueTypeSchema,
  SpecStatusSchema,
  appendIssueLog,
  consolidateIssue,
  createIssue,
  createSpec,
  filterIssuesBySpec,
  listIssues,
  listSpecs,
  moveIssueStatus,
  moveSpecStatus,
  readIssue,
  readSpec,
  resolveSafeRepositoryRoot,
  updateIssue,
  updateSpec,
} from "../ai-context/index.js";

const repositoryRootQuery = z.object({ repositoryRoot: z.string() });

const issueFiltersQuery = repositoryRootQuery.extend({
  status: IssueStatusSchema.optional(),
  priority: IssuePrioritySchema.optional(),
  tag: z.string().optional(),
  spec_id: z.string().optional(),
});

const createIssueBody = z.object({
  title: z.string(),
  priority: IssuePrioritySchema,
  type: IssueTypeSchema,
  owner: z.string(),
  tags: z.array(z.string()).optional(),
  related_files: z.array(z.string()).optional(),
  body: z.string().optional(),
  spec_id: z.string().optional(),
});

const updateIssueBody = z.object({
  title: z.string().optional(),
  priority: IssuePrioritySchema.optional(),
  type: IssueTypeSchema.optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  related_files: z.array(z.string()).optional(),
  body: z.string().optional(),
  spec_id: z.string().optional(),
});

const appendLogBody = z.object({ entry: z.string() });
const moveStatusBody = z.object({ status: IssueStatusSchema });
const moveSpecStatusBody = z.object({ status: SpecStatusSchema });

const createSpecBody = z.object({
  title: z.string(),
  owner: z.string(),
  tags: z.array(z.string()).optional(),
  body: z.string().optional(),
});

const updateSpecBody = z.object({
  title: z.string().optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  body: z.string().optional(),
});

function sendValidationError(reply: FastifyReply, error: z.ZodError) {
  return reply.status(400).send({ ok: false, error: "invalid_payload", issues: error.issues });
}

// AiContextMutationError cobre tanto "recurso não encontrado" (requireIssue/
// requireSpec) quanto erros de validação de domínio (transição inválida,
// status incompatível). Sem um código de erro estruturado em mutations.ts,
// a forma mais simples de diferenciar sem expandir aquele módulo é checar a
// mensagem — aceitável aqui porque é só uma checagem de borda HTTP, não lógica
// de negócio duplicada.
function sendDomainError(reply: FastifyReply, error: unknown) {
  if (error instanceof AiContextAccessError) {
    return reply.status(403).send({ ok: false, error: error.message });
  }

  if (error instanceof AiContextMutationError) {
    const status = error.message.includes("não encontrada") ? 404 : 400;
    return reply.status(status).send({ ok: false, error: error.message });
  }

  throw error;
}

export async function aiContextRoutes(app: FastifyInstance) {
  app.get("/ai-context/issues", async (request, reply) => {
    const parsed = issueFiltersQuery.safeParse(request.query);
    if (!parsed.success) return sendValidationError(reply, parsed.error);

    try {
      const { repositoryRoot, status, priority, tag, spec_id } = parsed.data;
      const root = resolveSafeRepositoryRoot(repositoryRoot);

      let issues = spec_id
        ? await filterIssuesBySpec(root, spec_id)
        : await listIssues(root);

      if (status) issues = issues.filter((issue) => issue.frontmatter.status === status);
      if (priority) issues = issues.filter((issue) => issue.frontmatter.priority === priority);
      if (tag) issues = issues.filter((issue) => issue.frontmatter.tags.includes(tag));

      return { ok: true, issues: issues.map((issue) => issue.frontmatter) };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>("/ai-context/issues/:id", async (request, reply) => {
    const parsed = repositoryRootQuery.safeParse(request.query);
    if (!parsed.success) return sendValidationError(reply, parsed.error);

    try {
      const root = resolveSafeRepositoryRoot(parsed.data.repositoryRoot);
      const issue = await readIssue(root, request.params.id);

      if (!issue) {
        return reply.status(404).send({ ok: false, error: `Issue não encontrada: ${request.params.id}` });
      }

      return { ok: true, frontmatter: issue.frontmatter, body: issue.body };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.post("/ai-context/issues", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = createIssueBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const issue = await createIssue(root, body.data);

      return reply.status(201).send({ ok: true, frontmatter: issue.frontmatter });
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.patch<{ Params: { id: string } }>("/ai-context/issues/:id", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = updateIssueBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const issue = await updateIssue(root, request.params.id, body.data);

      return { ok: true, frontmatter: issue.frontmatter };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/ai-context/issues/:id/log", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = appendLogBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const issue = await appendIssueLog(root, request.params.id, body.data.entry);

      return { ok: true, frontmatter: issue.frontmatter };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/ai-context/issues/:id/status", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = moveStatusBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const issue = await moveIssueStatus(root, request.params.id, body.data.status);

      return { ok: true, frontmatter: issue.frontmatter };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/ai-context/issues/:id/consolidate", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const result = await consolidateIssue(root, request.params.id);

      return {
        ok: true,
        frontmatter: result.issue.frontmatter,
        consolidatedId: result.consolidatedId,
        consolidatedFilePath: result.consolidatedFilePath,
      };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.get("/ai-context/specs", async (request, reply) => {
    const parsed = repositoryRootQuery.extend({ status: SpecStatusSchema.optional() }).safeParse(request.query);
    if (!parsed.success) return sendValidationError(reply, parsed.error);

    try {
      const root = resolveSafeRepositoryRoot(parsed.data.repositoryRoot);
      let specs = await listSpecs(root);

      if (parsed.data.status) {
        specs = specs.filter((spec) => spec.frontmatter.status === parsed.data.status);
      }

      return { ok: true, specs: specs.map((spec) => spec.frontmatter) };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>("/ai-context/specs/:id", async (request, reply) => {
    const parsed = repositoryRootQuery.safeParse(request.query);
    if (!parsed.success) return sendValidationError(reply, parsed.error);

    try {
      const root = resolveSafeRepositoryRoot(parsed.data.repositoryRoot);
      const spec = await readSpec(root, request.params.id);

      if (!spec) {
        return reply.status(404).send({ ok: false, error: `Spec não encontrada: ${request.params.id}` });
      }

      return { ok: true, frontmatter: spec.frontmatter, body: spec.body };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.post("/ai-context/specs", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = createSpecBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const spec = await createSpec(root, body.data);

      return reply.status(201).send({ ok: true, frontmatter: spec.frontmatter });
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.patch<{ Params: { id: string } }>("/ai-context/specs/:id", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = updateSpecBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const spec = await updateSpec(root, request.params.id, body.data);

      return { ok: true, frontmatter: spec.frontmatter };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/ai-context/specs/:id/status", async (request, reply) => {
    const query = repositoryRootQuery.safeParse(request.query);
    if (!query.success) return sendValidationError(reply, query.error);

    const body = moveSpecStatusBody.safeParse(request.body);
    if (!body.success) return sendValidationError(reply, body.error);

    try {
      const root = resolveSafeRepositoryRoot(query.data.repositoryRoot);
      const spec = await moveSpecStatus(root, request.params.id, body.data.status);

      return { ok: true, frontmatter: spec.frontmatter };
    } catch (error) {
      return sendDomainError(reply, error);
    }
  });
}
