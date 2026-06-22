---
id: ISSUE-0009
title: API REST no apps/agent para Issues e Specs (consumo pelo apps/web)
status: review
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-22
tags:
  - ai-context
  - api
  - web
related_files:
  - apps/agent/src/ai-context/issues.ts
  - apps/agent/src/ai-context/mutations.ts
  - apps/agent/src/routes
---

# Resumo

O `apps/web` (Next.js) fala HTTP com o `apps/agent`, não MCP via stdio
(MCP é para clientes externos como Claude Code/Codex — ver `ISSUE-0002`).
Esta issue cria rotas REST no Fastify que expõem `issues.ts`/`mutations.ts`
(e, depois de `ISSUE-0007`, o módulo de Specs) para o frontend consumir.

# Problema

`apps/agent/src/ai-context/index.ts` hoje só é chamável por: (a) código
TypeScript que importa direto, (b) o servidor MCP (`mcp/server.ts`). O
frontend web não tem nenhuma forma de listar/criar/atualizar Issues ou
Specs. Sem isso, `ISSUE-0010` (Kanban real) e `ISSUE-0011` (Spec real) não
têm como ser implementadas.

# Objetivo

Novo arquivo de rotas, ex. `apps/agent/src/routes/ai-context.ts`, registrado
em `server.ts` junto das rotas existentes (`routes/tasks.ts`, etc.), expondo
no mínimo:

```text
GET    /ai-context/issues?repositoryRoot=...&status=...&priority=...&tag=...
GET    /ai-context/issues/:id?repositoryRoot=...
POST   /ai-context/issues?repositoryRoot=...
PATCH  /ai-context/issues/:id?repositoryRoot=...
POST   /ai-context/issues/:id/log?repositoryRoot=...
POST   /ai-context/issues/:id/status?repositoryRoot=...
POST   /ai-context/issues/:id/consolidate?repositoryRoot=...
```

E o equivalente para `/ai-context/specs/*` depois que `ISSUE-0007` existir.

`repositoryRoot` continua explícito (query param ou body), nunca implícito
— mesmo contrato já estabelecido em todo o resto do `apps/agent`.

# O que foi feito

- Novo `apps/agent/src/routes/ai-context.ts`, registrado em `server.ts`
  (sem prefixo extra, mesmo padrão de `tasksRoutes`), expondo:
  - Issues: `GET /ai-context/issues` (filtros `status`/`priority`/`tag`/
    `spec_id`), `GET /ai-context/issues/:id`, `POST /ai-context/issues`,
    `PATCH /ai-context/issues/:id`, `POST /ai-context/issues/:id/log`,
    `POST /ai-context/issues/:id/status`,
    `POST /ai-context/issues/:id/consolidate`.
  - Specs: `GET /ai-context/specs` (filtro `status`),
    `GET /ai-context/specs/:id`, `POST /ai-context/specs`,
    `PATCH /ai-context/specs/:id`, `POST /ai-context/specs/:id/status`.
  - `repositoryRoot` sempre via query string, explícito, nunca implícito —
    mesmo contrato do resto do `apps/agent` e do servidor MCP.
- Validação de entrada com `zod`, reaproveitando os schemas já existentes
  em `types.ts` (`IssuePrioritySchema`, `IssueStatusSchema`, etc.) em vez
  de duplicar enums.
- `mcp/security.ts` (`resolveSafeRepositoryRoot`/`McpRepositoryAccessError`)
  promovido para `ai-context/security.ts`
  (`resolveSafeRepositoryRoot`/`AiContextAccessError`) — deixou de ser
  exclusivo do MCP porque a rota REST precisa do mesmo boundary de
  `REPO_ALLOWED_ROOT`. `mcp/server.ts` atualizado para importar do novo
  caminho; nenhuma mudança de comportamento, só remoção da duplicação que
  essa issue criaria.
- Mapeamento de erros: `AiContextAccessError` → 403,
  `AiContextMutationError` → 404 se a mensagem indicar "não encontrada"
  (caso de `requireIssue`/`requireSpec`), 400 nos demais casos (transição
  inválida, etc.). Erro de validação de payload (`zod`) → 400 com a lista
  de `issues` do Zod no corpo.
- Testado manualmente de ponta a ponta contra a instância real
  (`/home/jaime/ai_sdlc`) com o servidor rodando: list/read/create/update/
  append-log/move-status/consolidate de Issues, create/update/move-status
  de Specs, filtro por `spec_id`, erro 400 em payload inválido, erro 400
  em transição inválida, erro 404 em id inexistente — todos os artefatos
  de teste (`ISSUE-0015`, `ISSUE-0016`, `SPEC-0001`, `CONSOLIDATED-0001`)
  removidos depois.
- `pnpm --filter agent typecheck`: nenhum erro novo introduzido (mesma
  lista de erros pré-existentes em `task-runner.ts`/`task-store.ts`,
  confirmada por comparação via `git stash` em `ISSUE-0008`).

# O que falta fazer

Nada pendente para o escopo desta issue.

# Decisões tomadas

- `repositoryRoot` continua explícito via query string em toda rota —
  decisão sobre como o frontend obtém esse valor fica para `ISSUE-0010`/
  `ISSUE-0011`: por ora, a rota é agnóstica à origem do valor (poderia vir
  hardcoded para o próprio `ai_sdlc`, de um campo novo em `projects`, etc.
  — essa decisão de produto fica para quando o Kanban/Spec real forem
  conectados, não nesta issue de infraestrutura de API).
- `AiContextMutationError` não tem um código de erro estruturado
  distinguindo "não encontrado" de "validação inválida" — diferenciado na
  borda HTTP por substring na mensagem (`"não encontrada"`). Aceitável
  porque é só uma checagem de borda, não lógica de negócio duplicada;
  revisitar se `mutations.ts`/`specs.ts` ganharem um código de erro
  estruturado no futuro.
- Security boundary (`resolveSafeRepositoryRoot`) deixou de ser exclusivo
  do MCP e moveu para `ai-context/security.ts`, compartilhado entre MCP e
  REST — evita duplicar a checagem de `REPO_ALLOWED_ROOT` numa segunda
  cópia.

# Critérios de aceite

- [x] Rotas de Issues implementadas e testadas contra a instância dogfood
      real (sem mocks).
- [x] Rotas de Specs implementadas depois de `ISSUE-0007`.
- [x] Erros de domínio (`AiContextMutationError`) retornam status HTTP
      apropriado, com mensagem útil no corpo.
- [x] Decisão sobre origem do `repositoryRoot` no contexto web documentada
      (diferida para `ISSUE-0010`/`ISSUE-0011` — ver "Decisões tomadas").

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Esta é a peça que efetivamente conecta o `AI_context` (hoje só acessível
via import direto ou MCP) ao produto web.

# Log de execução

- 2026-06-21: issue registrada em backlog.
- 2026-06-22: movida para ready: dependência ISSUE-0007 satisfeita.
- 2026-06-22: iniciada implementação.
- 2026-06-22: implementação concluída: rotas REST de Issues e Specs em routes/ai-context.ts, security boundary promovido para ai-context/security.ts, testado manualmente de ponta a ponta com o servidor real. Movida para review.
