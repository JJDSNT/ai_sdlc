---
id: ISSUE-0011
title: Conectar /definition (Spec) à persistência real
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - web
  - definition
  - spec
related_files:
  - apps/web/app/definition/page.tsx
---

# Resumo

`apps/web/app/definition/page.tsx` é inteiramente mock: `draftInsights`,
`formalSpecBlocks`, `validationSignals` são arrays hardcoded (linhas 27-94),
sem nenhuma chamada ao backend. Esta issue substitui isso pela Spec real
(`ISSUE-0007`), via a API REST de `ISSUE-0009`.

# Problema

`formalSpecBlocks` já tem exatamente o shape que viraria seções do corpo de
uma Spec real (`kind: "requirement" | "constraint" | "decision" | "rule" | "acceptance"`,
`title`, `description`, `status: "draft" | "solid" | "needs-review"`). O
gap é só persistência — a modelagem da UI já está alinhada com o que
`ISSUE-0007` propõe para o corpo da Spec.

# Objetivo

- Página carrega uma Spec real via `GET /ai-context/specs/:id`.
- Criar/editar blocos da spec persiste de fato (`POST`/`PATCH` via
  `ISSUE-0009`), não só atualiza estado React local.
- `validationSignals` (hoje mock) podem continuar client-side por enquanto
  — são derivados, não dados primários; calcular isso de verdade a partir
  do conteúdo da Spec é trabalho de IA (`ISSUE-0013`), fora do escopo
  desta issue.

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

- Mapear `status: "draft" | "solid" | "needs-review"` (por bloco, no mock)
  para o que a Spec real vai ter — `ISSUE-0007` propõe status a nível de
  Spec inteira (`draft`/`validated`/`active`/`deprecated`), não por bloco.
  Decidir se cada bloco também precisa de status próprio, ou se isso fica
  só no nível da Spec.
- Depende de `ISSUE-0007` (módulo de Spec) e `ISSUE-0009` (rotas REST)
  estarem prontas.
- Decidir o que fazer com `draftInsights` (a coluna de "insights" antes de
  formalizar) — vira o corpo de uma Spec em status `draft`, ou é descartado
  depois de promovido a bloco formal? Provavelmente o segundo, mas vale
  decidir explicitamente em vez de deixar implícito.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Página lê/escreve uma Spec real, não array mock.
- [ ] Mapeamento de status por bloco vs. status da Spec decidido e
      documentado.
- [ ] Testado manualmente no browser (criar, editar, recarregar a página
      e confirmar que persistiu).

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Visualmente, esta página é onde `ISSUE-0012` (chat real) também vive — as
duas issues são sobre a mesma página, mas integrações de backend
diferentes (Spec vs. Task/chat).

# Log de execução

- 2026-06-21: issue registrada em backlog.
