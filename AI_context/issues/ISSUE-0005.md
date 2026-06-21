---
id: ISSUE-0005
title: Cache derivado em AI_context/metadata (status.json, kanban.json, tags.json)
status: backlog
priority: low
type: infra
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - metadata
  - performance
related_files:
  - apps/agent/src/ai-context/issues.ts
  - AI_context/metadata/README.md
---

# Resumo

Popular `AI_context/metadata/status.json`, `kanban.json` e `tags.json` como
views derivadas/cacheadas das issues em `AI_context/issues/*.md`, hoje
deliberadamente vazias (ver `AI_context/metadata/README.md`).

# Problema

`listIssues`/`filterIssuesByStatus`/`filterIssuesByPriority`/
`searchIssuesByTag` (`apps/agent/src/ai-context/issues.ts`) sempre leem e
parseiam todos os arquivos `.md` do diretório a cada chamada. Para poucas
issues isso é irrelevante; se o volume crescer (ou se um consumidor como um
Kanban no frontend passar a chamar essas funções com frequência), recalcular
tudo a cada leitura deixa de ser ideal.

# Objetivo

Gerar `metadata/status.json` (issues agrupadas por status),
`metadata/kanban.json` (estrutura pronta para um board) e `metadata/tags.json`
(índice tag → issues) como cache derivado, sem se tornarem fonte de verdade —
o markdown em `issues/*.md` continua sendo a fonte de verdade; o cache é
apenas uma otimização de leitura, descartável e regenerável a qualquer
momento.

# O que foi feito

Nada ainda — issue em `backlog`. `AI_context/metadata/README.md` já
documenta que a pasta está reservada para isso.

# O que falta fazer

- Decidir o gatilho de regeneração: a cada mutação (depende de `ISSUE-0003`),
  via comando explícito de reindexação, ou ambos.
- Definir o formato exato de cada JSON (esquema de `kanban.json` em
  particular, já que é o que mais se presta a alimentar uma UI).
- Garantir que essas funções de leitura (`issues.ts`) preferem o cache
  quando presente e válido, mas continuam funcionando sem ele (fallback
  para leitura direta do markdown) — manter o comportamento atual como
  fallback, nunca como dependência obrigatória.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] `status.json`, `kanban.json`, `tags.json` gerados a partir das issues
      reais via alguma função `reindexAiContext(repositoryRoot)`.
- [ ] Cache é estritamente derivado — apagar `metadata/*.json` não quebra
      `listIssues` e funções relacionadas (fallback para leitura direta).
- [ ] Gatilho de regeneração definido e documentado.

# Observações

Esta issue resolve a contradição apontada durante a criação do `AI_context`
(`ISSUE-0001`): a estrutura original previa esses arquivos, mas a regra de
"leitura direta do markdown" os deixou propositalmente vazios na primeira
etapa.

# Log de execução

- 2026-06-21: issue registrada em backlog.
