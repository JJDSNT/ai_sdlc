---
id: ISSUE-0009
title: API REST no apps/agent para Issues e Specs (consumo pelo apps/web)
status: backlog
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
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

Nada ainda — issue em `backlog`.

# O que falta fazer

- Validação de entrada com `zod` (já dependência do projeto, usado em
  `routes/tasks.ts`) — reaproveitar o padrão existente, não inventar outro.
- Decidir como o frontend descobre o `repositoryRoot` correto (hoje não há
  conceito de "repositório do projeto atual" persistido em lugar nenhum
  óbvio — `projects` no schema não tem campo de path). Pode ser que esta
  issue precise de uma decisão menor: adicionar `path`/`repositoryRoot` à
  tabela `projects`, ou assumir o próprio `ai_sdlc` como repositório único
  por enquanto (mais simples, mas limita o produto a só gerenciar issues
  de si mesmo).
- Mapear erros de `mutations.ts` (`AiContextMutationError`) para respostas
  HTTP com status apropriado (400/404), não 500 genérico.
- Depende de `ISSUE-0007` para a parte de Specs; a parte de Issues pode
  começar antes, já que `issues.ts`/`mutations.ts` já existem.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Rotas de Issues implementadas e testadas contra a instância dogfood
      real (sem mocks).
- [ ] Rotas de Specs implementadas depois de `ISSUE-0007`.
- [ ] Erros de domínio (`AiContextMutationError`) retornam status HTTP
      apropriado, com mensagem útil no corpo.
- [ ] Decisão sobre origem do `repositoryRoot` no contexto web documentada.

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Esta é a peça que efetivamente conecta o `AI_context` (hoje só acessível
via import direto ou MCP) ao produto web.

# Log de execução

- 2026-06-21: issue registrada em backlog.
