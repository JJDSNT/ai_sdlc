---
id: ISSUE-0003
title: Mutações do AI_context (create/update/append/move/consolidate)
status: review
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - mutations
related_files:
  - apps/agent/src/ai-context/mutations.ts
  - apps/agent/src/ai-context/issues.ts
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/frontmatter.ts
  - apps/agent/src/ai-context/verify.script.ts
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

- `apps/agent/src/ai-context/mutations.ts` criado com `createIssue`,
  `updateIssue`, `appendIssueLog`, `moveIssueStatus`, `consolidateIssue` e
  `AiContextMutationError`.
- Numeração sequencial: `nextSequentialId` escaneia `issues/` ou
  `consolidated/` (sequências independentes), extrai o maior número usado
  via regex e retorna o próximo, zero-padded a 4 dígitos.
- Tabela explícita `ALLOWED_TRANSITIONS` valida toda chamada a
  `moveIssueStatus`; `consolidated` nunca é alcançável por ela (só por
  `consolidateIssue`, e só a partir de `done`).
- `consolidateIssue` gera `AI_context/consolidated/CONSOLIDATED-XXXX.md`
  reaproveitando título/corpo/related_files reais da issue (sem inventar
  conteúdo) e marca a issue original como `status: consolidated`.
- `verify.script.ts` estendido com smoke test descartável: cria uma issue,
  atualiza, loga, percorre as transições válidas, confirma que
  `done → consolidated` via `moveIssueStatus` lança `AiContextMutationError`,
  consolida de fato via `consolidateIssue`, e remove os artefatos de teste
  no final (não polui a instância real).
- Bug real encontrado e corrigido durante a verificação: `stringifyFrontmatter`
  grava listas vazias como `key: []`, mas `parseFrontmatter` não reconhecia
  esse literal e devolvia a string `"[]"` em vez de um array — corrigido em
  `apps/agent/src/ai-context/frontmatter.ts`.
- Esta própria issue foi movida `backlog → ready → doing` usando
  `moveIssueStatus`/`appendIssueLog` reais, não edição manual de frontmatter
  (dogfooding direto das funções que ela mesma introduz).

# O que falta fazer

- Nada pendente para o escopo desta issue. Seguir para `ISSUE-0002` (MCP) e
  `ISSUE-0004` (Task↔Issue), que dependiam destas funções.

# Decisões tomadas

- Concorrência: sem lock de arquivo. Uso é local/single-process (mesmo
  padrão do resto do `apps/agent`); "last write wins" é aceitável e não
  há necessidade de mecanismo de lock nesta fase.
- `moveIssueStatus` nunca aceita `consolidated` como destino — é
  estruturalmente impossível chegar lá sem passar por `consolidateIssue`,
  que é o único ponto que verifica (parcialmente) os critérios da regra de
  `AI_context/consolidated/README.md`.
- `consolidateIssue` verifica programaticamente apenas `status === "done"`.
  "Documentação atualizada" e "critérios de aceite satisfeitos" continuam
  dependendo de julgamento humano/do agente antes de chamar a função — não
  são (e não seriam triviais de) verificar automaticamente.
- Serialização reaproveita `stringifyFrontmatter` (`frontmatter.ts`), sem
  reimplementar.

# Critérios de aceite

- [x] `createIssue`, `updateIssue`, `appendIssueLog`, `moveIssueStatus`,
      `consolidateIssue` implementados e exportados de
      `apps/agent/src/ai-context/index.ts`.
- [x] Numeração sequencial de IDs sem colisão, testada.
- [x] `consolidateIssue` recusa-se a rodar se a issue não estiver `done`
      (critérios de aceite/documentação continuam sendo um gate humano, não
      automatizável — ver "Decisões tomadas").
- [x] Verificado contra a instância dogfood real (`/home/jaime/ai_sdlc/AI_context`),
      sem mocks, seguindo o padrão de `verify.script.ts`.

# Observações

Esta issue era o item "mutações (create/update/append/consolidate)"
mencionado junto com MCP e Task↔Issue em `ISSUE-0001`/conversas
subsequentes — desmembrada porque é um pré-requisito de ambas, não parte
delas.

# Log de execução

- 2026-06-21: issue registrada em backlog.
- 2026-06-21: implementação de mutations.ts iniciada (createIssue/updateIssue/appendIssueLog/moveIssueStatus/consolidateIssue), via moveIssueStatus/appendIssueLog reais (dogfooding desta própria issue).
- 2026-06-21: implementação concluída e verificada via verify.script.ts; movida para review.
