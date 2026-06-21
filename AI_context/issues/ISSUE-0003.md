---
id: ISSUE-0003
title: Mutações do AI_context (create/update/append/move/consolidate)
status: backlog
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - mutations
related_files:
  - apps/agent/src/ai-context/issues.ts
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/frontmatter.ts
---

# Resumo

Implementar as operações de escrita sobre issues do `AI_context` —
`apps/agent/src/ai-context/issues.ts` hoje é somente leitura. Esta é a peça
que bloqueia tanto `ISSUE-0002` (MCP, ferramentas de escrita) quanto
`ISSUE-0004` (integração Task↔Issue, que precisa criar/atualizar issues
programaticamente).

# Problema

A única forma de criar ou atualizar uma issue hoje é editando o markdown à
mão. Não há função programática para criar uma nova issue com o próximo ID
sequencial, atualizar frontmatter, anexar uma entrada ao "Log de execução",
mudar o `status`, ou promover uma issue para `consolidated/`.

# Objetivo

Adicionar a `apps/agent/src/ai-context/issues.ts` (ou um novo módulo irmão,
ex. `mutations.ts`, a decidir na implementação):

- `createIssue(repositoryRoot, input)` — gera o próximo `ISSUE-XXXX`
  sequencial, grava o arquivo a partir de `ISSUE_TEMPLATE`.
- `updateIssue(repositoryRoot, issueId, patch)` — atualiza campos do
  frontmatter, sempre atualizando `updated_at`.
- `appendIssueLog(repositoryRoot, issueId, entry)` — adiciona uma linha à
  seção "Log de execução".
- `moveIssueStatus(repositoryRoot, issueId, status)` — valida a transição
  (ex.: não permitir `consolidated` sem os critérios de aceite satisfeitos).
- `consolidateIssue(repositoryRoot, issueId)` — gera
  `AI_context/consolidated/CONSOLIDATED-XXXX.md` a partir do
  `CONSOLIDATED_TEMPLATE`, só quando a issue estiver `done` com critérios
  marcados (reforçando a regra de `AI_context/consolidated/README.md`).

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

- Definir estratégia de numeração sequencial de IDs (`ISSUE-XXXX`) sem
  colisão — ex.: escanear `issues/` + `consolidated/` para achar o próximo
  número livre, já que não há banco de dados.
- Definir estratégia de concorrência: uso é local/single-process, então
  "last write wins" pode ser aceitável, mas vale registrar a decisão
  explicitamente em vez de deixar implícito.
- Decidir e implementar a regra de validação de transição de status (quais
  transições são permitidas, ex. não pular direto de `backlog` para
  `consolidated`).
- Reaproveitar `stringifyFrontmatter` (`apps/agent/src/ai-context/frontmatter.ts`)
  para serialização, evitando reimplementar.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] `createIssue`, `updateIssue`, `appendIssueLog`, `moveIssueStatus`,
      `consolidateIssue` implementados e exportados de
      `apps/agent/src/ai-context/index.ts`.
- [ ] Numeração sequencial de IDs sem colisão, testada.
- [ ] `consolidateIssue` recusa-se a rodar se a issue não estiver `done`
      com critérios de aceite marcados.
- [ ] Verificado contra a instância dogfood real (`/home/jaime/ai_sdlc/AI_context`),
      sem mocks, seguindo o padrão de `verify.script.ts`.

# Observações

Esta issue era o item "mutações (create/update/append/consolidate)"
mencionado junto com MCP e Task↔Issue em `ISSUE-0001`/conversas
subsequentes — desmembrada porque é um pré-requisito de ambas, não parte
delas.

# Log de execução

- 2026-06-21: issue registrada em backlog.
