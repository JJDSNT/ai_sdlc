---
id: ISSUE-0017
title: "Reconciliar o tipo Task divergente entre task.ts/task-store.ts/routes/tasks.ts"
status: backlog
priority: medium
type: bug
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - agent
  - task
  - tech-debt
related_files:
  - apps/agent/src/task.ts
  - apps/agent/src/task-store.ts
  - apps/agent/src/routes/tasks.ts
  - apps/agent/src/task-repository.ts
  - apps/agent/src/task-service.ts
  - apps/agent/src/task-event.ts
  - apps/agent/src/task-event-bus.ts
---

# Resumo

`pnpm --filter agent typecheck` falha com ~40 erros concentrados em
`task-store.ts`, `task-runner.ts`, `routes/tasks.ts`, `routes/copilot.ts` e
em quatro arquivos órfãos (`task-repository.ts`, `task-service.ts`,
`task-event.ts`, `task-event-bus.ts`). Todos têm a mesma causa raiz: o tipo
`Task` (`apps/agent/src/task.ts`) está desatualizado em relação à tabela
real `tasks` (Drizzle, `db/schema.ts`) e ao que o código de fato lê/escreve
em runtime.

# Problema

O commit `510ca3f` ("refactor: migrate task store to Drizzle and implement
domain services", 2026-03-30) reduziu `task.ts` de ~198 para ~30 linhas
(`Task = {id, input, status, result?, createdAt, updatedAt}`), mas
`task-store.ts` continuou (e precisa) ler/escrever `projectId`, `sessionId`,
`kind`, `title`, `prompt`, `output`, `error`, `startedAt`, `completedAt` —
campos que não existem mais no tipo declarado. `routes/tasks.ts` e
`routes/copilot.ts` têm o mesmo problema do lado de quem chama
`createTask`/`updateTask`.

Os erros são só de `tsc` — em runtime, como o projeto roda via `tsx`
(esbuild, não verifica tipos), tudo funciona até bater em um problema real
de schema (ver `ISSUE-0012`: `tasks.project_id NOT NULL` sem valor
informado por `copilot-stream.ts`/`routes/tasks.ts`, corrigido lá com um
fallback pontual em `task-store.ts::createTask` — esta issue é sobre
corrigir a causa raiz do tipo, não mais sobre aquele bug específico).

Achado relacionado: `task-repository.ts`/`task-service.ts`/
`task-event.ts`/`task-event-bus.ts` (todos em `apps/agent/src/`, na raiz —
não em `repositories/`/`services/`/`realtime/`, apesar dos cabeçalhos
`//apps/agent/src/repositories/task-repository.ts` etc. dizerem o
contrário) importam de `@/task`, `@/task-event`, `@/db/client` sem
extensão `.js`, o que falha sob `moduleResolution: NodeNext` independente
do problema de tipo. Parecem ser uma tentativa de nova arquitetura
(repository + service + event bus) iniciada no mesmo commit e nunca
finalizada/conectada a nenhuma rota — candidatos a serem completados,
movidos para os diretórios certos, ou removidos.

# Objetivo

Não decidido. Quando retomada, esta issue precisa decidir:

- `Task` em `task.ts` passa a refletir o schema real (idealmente derivado
  de `typeof tasks.$inferSelect`, para nunca mais divergir), ou os arquivos
  órfãos (`task-repository.ts` etc.) são completados e tornam-se a fonte de
  verdade, substituindo `task-store.ts`?
- O que fazer com os 4 arquivos órfãos: completar a migração (movê-los para
  `repositories/`/`services/`/`realtime/`, corrigir os imports,
  conectá-los a `server.ts`) ou removê-los, se a decisão for manter
  `task-store.ts`.

# O que foi feito

Nada ainda — issue em `backlog`. Identificada incidentalmente durante
`ISSUE-0012` ao investigar por que `tasks.project_id NOT NULL` falhava;
aquele bug específico já foi corrigido lá (fallback em `createTask`), mas
o problema de tipo maior que o expôs continua aberto.

# O que falta fazer

Tudo — decisão de arquitetura (qual implementação é a fonte de verdade)
antes de qualquer correção de tipo em massa.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] `pnpm --filter agent typecheck` limpo (ou with apenas erros
      documentados como aceitos, não os ~40 atuais).
- [ ] Decisão sobre os 4 arquivos órfãos registrada e aplicada (completar
      ou remover, não deixar pela metade).

# Observações

Pré-existente — não introduzido por `ISSUE-0007`–`ISSUE-0012`. Confirmado
via `git stash` antes de cada issue do lote AI_context que os erros já
existiam na árvore original.

# Log de execução

- 2026-06-22: issue registrada em backlog, encontrada durante ISSUE-0012.
