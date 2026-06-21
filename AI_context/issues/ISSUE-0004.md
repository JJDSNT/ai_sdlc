---
id: ISSUE-0004
title: Integração Task ↔ Issue
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - task-system
related_files:
  - apps/agent/src/task-store.ts
  - apps/agent/src/services/task-runner.ts
  - apps/agent/src/types/task.ts
  - apps/agent/src/ai-context/issues.ts
---

# Resumo

Conectar o sistema de Tasks já existente (`apps/agent/src/task-store.ts`,
`apps/agent/src/services/task-runner.ts`) com o `AI_context` do
repositório-alvo em que a task está operando, mapeando: Task → Issue,
TaskEvent → log da issue, Task completed → candidato a consolidação.

# Problema

Hoje Task (banco SQLite/libsql, `apps/agent/src/db/schema.ts`) e Issue
(markdown em `AI_context/`) são dois sistemas completamente desconectados.
Uma task executada pelo agente sobre um `repositoryRoot`
(`Task.target = { kind: "local_path", path }`, ver
`apps/agent/src/services/task-runner.ts:119-169`) não deixa nenhum rastro em
`AI_context/issues/`, mesmo que esse `repositoryRoot` já tenha (ou devesse
ter) sua própria instância de `AI_context`.

# Objetivo

- Ao iniciar uma task relevante (a definir quais `kind` qualificam — ex.
  `repo-command`, `repo-analyze`, chat com intenção de mudança de código),
  opcionalmente criar ou vincular a uma issue existente em
  `AI_context/issues/` no `repositoryRoot` da task.
- Cada `TaskEvent` relevante (`task.completed`, `task.failed`, deltas de
  saída significativos) gera uma entrada no "Log de execução" da issue
  vinculada, via `appendIssueLog` (depende de `ISSUE-0003`).
- Ao completar uma task com sucesso, marcar a issue vinculada como
  candidata a consolidação (não consolidar automaticamente — isso continua
  uma decisão humana/agente explícita, conforme a regra de
  `AI_context/consolidated/README.md`).

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

- Decidir o gatilho: toda task cria/atualiza uma issue, ou só task kinds
  específicos? Criação automática indiscriminada pode poluir
  `AI_context/issues/` com ruído.
- Decidir como uma Task referencia sua Issue vinculada (novo campo em
  `Task`/`tasks` no schema? ou inferência por convenção, ex.
  `related_files` contém o path da task?).
- `ISSUE-0003` (mutações) está em `review` — `createIssue`/`appendIssueLog`
  já existem em `apps/agent/src/ai-context/mutations.ts` e podem ser
  chamados a partir daqui.
- Definir comportamento quando o `repositoryRoot` da task ainda não tem
  `AI_context/` escaffoldado (chamar `scaffoldAiContext` automaticamente?
  ou exigir que já exista?).

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Critério de "task relevante" para criação/vínculo de issue definido e
      documentado.
- [ ] Vínculo Task → Issue implementado e persistido de forma rastreável.
- [ ] TaskEvent relevante gera entrada no log da issue vinculada.
- [ ] Task completed marca a issue como candidata a consolidação, sem
      consolidar automaticamente.
- [ ] Comportamento definido para repositórios-alvo sem `AI_context/`
      ainda inicializado.

# Observações

Esta era a integração explicitamente listada como fora de escopo na criação
inicial do `AI_context` (ver histórico de `ISSUE-0001`) — agora registrada
como trabalho futuro concreto, não mais apenas "fora de escopo".

# Log de execução

- 2026-06-21: issue registrada em backlog.
