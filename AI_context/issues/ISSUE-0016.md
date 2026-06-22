---
id: ISSUE-0016
title: "Avaliar status dedicado de QA/teste (separar de \"review\")"
status: backlog
priority: low
type: research
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - ai-context
  - issue
  - status
related_files:
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/mutations.ts
---

# Resumo

O mock original de `apps/web/app/execution/page.tsx` (antes de `ISSUE-0010`)
tinha uma coluna `status: "test"` que não existe no `IssueStatusSchema` real
(`backlog`/`ready`/`doing`/`review`/`done`/`consolidated`/`blocked`).
`ISSUE-0010` resolveu o gap mapeando essa coluna para `review` na UI, sem
adicionar `"test"` ao enum oficial. Esta issue registra a possibilidade de,
no futuro, separar os dois conceitos de verdade no schema.

# Problema

`review` hoje carrega dois sentidos possíveis: "peer review do trabalho" e
"em validação/teste antes de done". O mock sugeria que esses são estados
distintos de um fluxo real (`doing → test → done`, com `review` seria um
terceiro conceito ainda diferente — revisão de código/decisão). Adicionar
`"test"` ao `IssueStatusSchema` não é uma mudança isolada: afeta
`ALLOWED_TRANSITIONS` em `mutations.ts` e qualquer lugar que itere sobre os
status possíveis (UI, MCP, REST) — por isso não foi feito dentro de
`ISSUE-0010`.

# Objetivo

Não decidido. Quando retomada, esta issue deve decidir: vale a pena ter um
status `test` (ou `qa`) separado de `review`? Se sim, qual a transição
correta (`doing → test → review → done`? `doing → test → done` direto?).

# O que foi feito

Nada ainda — issue em `backlog`, registrada para não perder o gap mapeado
durante `ISSUE-0010` (status `test` → `review` foi uma normalização de UI,
não uma decisão de que os dois conceitos são equivalentes para sempre).

# O que falta fazer

Tudo — decisão de produto, não técnica, sobre se o fluxo precisa de um
estado de teste/QA explícito.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Decisão registrada: manter `review` cobrindo os dois sentidos, ou
      adicionar status novo.
- [ ] Se adicionar: `ALLOWED_TRANSITIONS`, schema, UI e qualquer doc que
      liste os status possíveis atualizados em conjunto.

# Observações

Prioridade `low` — normalização de UI já resolve o problema imediato de
`ISSUE-0010`; isto é só para não esquecer a pergunta de produto subjacente.

# Log de execução

- 2026-06-22: issue registrada em backlog.
