---
id: ISSUE-0011
title: Conectar /definition (Spec) à persistência real
status: review
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-22
tags:
  - web
  - definition
  - spec
related_files:
  - apps/web/app/definition/page.tsx
  - apps/web/features/definition
depends_on: []
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

- Novas rotas proxy em `apps/web/app/api/ai-context/specs/*` (mesmo padrão
  de `api/ai-context/issues/*` de `ISSUE-0010`): `GET`/`POST /specs`,
  `GET`/`PATCH /specs/:id`, `POST /specs/:id/status`. `repositoryRoot`
  resolvido no servidor via `AI_CONTEXT_REPO_ROOT`, mesmo de `ISSUE-0010`.
- `features/definition/lib/spec-sections.ts`: parser/stringifier
  hand-rolled (mesma filosofia de `frontmatter.ts` no agent — sem lib de
  markdown nova) que divide o `body` real de uma Spec pelos headings de
  nível 1 (`# Heading`) em seções editáveis, e reconstrói o `body`
  completo preservando TODAS as seções (não só as exibidas), evitando
  perda de conteúdo ao salvar.
- `features/definition/hooks/use-spec.tsx`: busca a primeira Spec
  existente (produto hoje só tem o conceito de uma spec por vez, igual ao
  mock original — não há seletor multi-spec, não foi necessário para
  paridade); se não existir nenhuma, expõe estado vazio +
  `createInitialSpec()`. Expõe `updateSectionContent`/`saveSections`
  (PATCH real) e `moveStatus` (POST `/status` real).
- `apps/web/app/definition/page.tsx` reescrita: `FormalSpecPanel` renderiza
  cada seção real da Spec como um card editável (`SpecSectionCard`), com
  botão "Salvar" persistindo via PATCH. `ContextBar` mostra
  título/status reais da Spec e tem "Validar spec" chamando
  `moveStatus("validated")` (habilitado só quando `status === "draft"`,
  espelhando `ALLOWED_TRANSITIONS` do backend).
- `ConversationSection` mantida intacta (mock estático) — fora de escopo,
  é `ISSUE-0012`. `ValidationPanel` mantido mock, explicitamente permitido
  pelo texto original desta issue (cálculo real é `ISSUE-0013`).
- `UnderstandingDraftPanel` (`draftInsights`): decisão explícita de manter
  como rascunho client-side efêmero, não persistido — ver "Decisões
  tomadas". Ações de IA ("Refinar com IA") ficam desabilitadas em vez de
  simular comportamento inexistente.
- Testado de ponta a ponta com os dois servidores reais: estado vazio (sem
  spec) → criar spec inicial → editar uma seção (PATCH) → confirmar que as
  outras 9 seções do template sobreviveram intactas → mover para
  `validated` → reler a spec (simulando reload) e confirmar que o status
  persistiu. Artefato de teste (`SPEC-0001`) removido depois.
- `pnpm --filter web exec tsc --noEmit`: nenhum erro novo (só os
  pré-existentes em `copilot-panel.tsx`, já confirmados não-relacionados
  em `ISSUE-0010`).

# O que falta fazer

Nada pendente para o escopo desta issue.

# Decisões tomadas

- Sem status por bloco: a Spec real só tem status a nível de Spec inteira
  (`draft`/`validated`/`active`/`deprecated`, de `ISSUE-0007`). Em vez de
  inventar um status por seção (que não existe no backend e exigiria
  schema novo), a unidade de edição mudou de "bloco tipado com status
  próprio" para "seção de markdown" — cada heading do `body` real é um
  card editável, sem status individual. Resolve a pergunta original do
  mock (`kind`/`status` por bloco) eliminando a necessidade dela.
- `draftInsights` fica como rascunho client-side efêmero, não persistido —
  decisão explícita (não um descarte silencioso): são notas de
  pré-formalização, perdê-las ao recarregar é o comportamento esperado de
  um rascunho. O que precisa sobreviver vai direto para uma seção real da
  Spec via edição manual por enquanto; promoção automática depende de
  chat real (`ISSUE-0012`) e transformação assistida (`ISSUE-0013`) — os
  botões correspondentes existem na UI mas ficam desabilitados, não
  removidos, para não perder o desenho de produto.
- Página assume uma Spec por workspace (igual ao mock original, que também
  só mostrava uma). Sem seletor multi-spec — não é um gap, é paridade
  exata com o que já existia.

# Critérios de aceite

- [x] Página lê/escreve uma Spec real, não array mock.
- [x] Mapeamento de status por bloco vs. status da Spec decidido e
      documentado (decisão: sem status por bloco, só por Spec).
- [x] Testado manualmente no browser/via servidor real (criar, editar,
      recarregar a página e confirmar que persistiu).

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Visualmente, esta página é onde `ISSUE-0012` (chat real) também vive — as
duas issues são sobre a mesma página, mas integrações de backend
diferentes (Spec vs. Task/chat) — `ConversationSection` não foi tocada.

# Log de execução

- 2026-06-21: issue registrada em backlog.
- 2026-06-22: movida para ready: dependências ISSUE-0007/ISSUE-0009 satisfeitas.
- 2026-06-22: iniciada implementação.
- 2026-06-22: implementação concluída: rotas proxy de specs, parser de seções por heading, hook useSpec com create/edit/save/move-status reais, página /definition reescrita (Formal Spec real, draftInsights efêmero por decisão explícita, ConversationSection intacta). Testado de ponta a ponta. Movida para review.
