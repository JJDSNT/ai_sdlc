---
id: ISSUE-0010
title: Conectar /execution (Kanban) às Issues reais do AI_context
status: review
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-22
tags:
  - web
  - execution
  - issue
related_files:
  - apps/web/app/execution/page.tsx
  - apps/web/features/execution
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/mutations.ts
depends_on: []
---

# Resumo

`apps/web/app/execution/page.tsx` renderiza um Kanban com cards 100% mock
(`cards: ExecutionCard[]`, linhas 13-66 — hardcoded, nada vem do backend).
Esta issue substitui isso por Issues reais do `AI_context`, via a API
REST de `ISSUE-0009`.

# Problema

O mock já usa ids `ISSUE-101`, `ISSUE-102`... e campos `status`/`priority`
muito parecidos com `IssueFrontmatter` — só que com duas diferenças reais:

1. Usa um status `"test"` que não existe no nosso `IssueStatusSchema`
   (`backlog`/`ready`/`doing`/`review`/`done`/`consolidated`/`blocked`).
2. Tem campos `effort` (`s`/`m`/`l`) e `dependsOn` (array de ids) que não
   existem em `IssueFrontmatter`.

Isso precisa ser resolvido antes de só "trocar o array mock por um fetch".

# Objetivo

- Página busca issues reais via `GET /ai-context/issues` (`ISSUE-0009`).
- Decidir e resolver as duas diferenças de schema acima (ver "O que falta
  fazer") — sem isso, o Kanban real não reproduz o que o mock já propunha.
- Mutações da UI (mover card de coluna, etc.) chamam as rotas de escrita
  (`PATCH`/`/status`) em vez de só atualizar estado local em memória.

# O que foi feito

- Backend (`apps/agent/src/ai-context/`): `IssueEffortSchema` (`xs/s/m/l/xl`)
  e dois campos novos em `IssueFrontmatterSchema` — `effort` (opcional,
  mirror do precedente de `spec_id`/`ISSUE-0008`) e `depends_on` (array,
  default `[]`, mesmo padrão de `tags`/`related_files`).
- `createIssue`/`updateIssue` (`mutations.ts`) aceitam os dois campos.
  `depends_on` passa por `assertNoDependencyCycle` antes de gravar —
  detecta auto-dependência e ciclos indiretos percorrendo o grafo das
  issues existentes, rejeitando com `AiContextMutationError`. Necessário
  porque `ISSUE-0015` (rotina de priorização) vai precisar assumir que o
  grafo de dependências é um DAG.
- `ISSUE_TEMPLATE`, `mcp/server.ts` (`create_issue`/`update_issue`) e
  `routes/ai-context.ts` (REST) atualizados para os dois campos novos,
  mantendo os três contratos (template, MCP, REST) em paridade.
- `apps/web/app/execution/page.tsx` e `features/execution/*`: array mock
  removido por completo. Novo hook `useIssues()` busca issues reais via
  `GET /api/ai-context/issues` (rota Next.js que faz proxy para o agent,
  resolvendo `repositoryRoot` no servidor a partir de
  `AI_CONTEXT_REPO_ROOT`, nunca exposto ao client) e expõe `moveStatus()`
  que persiste via `POST /api/ai-context/issues/:id/status` → agent →
  arquivo real.
- Cada card ganhou um `<select>` de status real (chama `moveStatus`,
  reflete erros de transição inválida vindos do backend — testado: tentar
  `ready → done` direto retorna 400 e aparece como erro na sidebar).
- `lib/issue-dependencies.ts` recriado operando sobre o `depends_on` real
  (antes operava sobre um campo só do mock). "Bloqueado" no Kanban combina
  duas condições distintas: `status === "blocked"` (bloqueio manual,
  explícito) e dependência pendente (`depends_on` com algo não-`done`) —
  cards com status manual `blocked` saem das 5 colunas principais e só
  aparecem na sidebar; cards com dependência pendente mas status normal
  continuam na coluna, com borda vermelha + listados na sidebar também.
- Testado de ponta a ponta com os dois servidores reais rodando
  (`apps/agent` + `apps/web`, Next 16.2.1/Turbopack): proxy retornando
  issues reais, `POST .../status` persistindo no arquivo real
  (`ISSUE-0017` de teste, criado/limpo), `depends_on` sobrevivendo ao
  round-trip via o proxy.
- `pnpm --filter agent typecheck` e `pnpm --filter web exec tsc --noEmit`:
  nenhum erro novo (confirmado via `git stash` que os erros pré-existentes
  em `task-runner.ts`/`task-store.ts` e em `components/copilot/copilot-panel.tsx`
  — este último é o código morto de `ISSUE-0012` — já existiam antes desta
  issue).

# O que falta fazer

Nada pendente para o escopo desta issue.

# Decisões tomadas

- `status: "test"` do mock mapeado para a coluna `review` na UI — não
  adicionado ao `IssueStatusSchema` oficial (afetaria `ALLOWED_TRANSITIONS`
  e todo o resto do sistema). Possibilidade de status dedicado registrada
  separadamente em `ISSUE-0016`, não descartada sem rastro.
- `effort`/`depends_on`: **persistidos de verdade** no frontmatter, não
  descartados. Reversão de uma decisão inicial minha de descartar os dois
  campos — corrigida após feedback explícito do usuário: esforço e
  dependências são insumo necessário para uma futura rotina de
  priorização de agentes (`ISSUE-0015`, registrada nesta mesma sessão), não
  metadata cosmética. `dependsOn` ganhou validação de ciclo porque uma
  rotina de priorização não pode assumir um grafo consistente sem isso.
- `repositoryRoot` no contexto do `apps/web`: resolvido inteiramente no
  servidor (rota proxy `app/api/ai-context/*`), via env var
  `AI_CONTEXT_REPO_ROOT` em `.env.local` (não commitado, mesmo padrão de
  `AGENT_URL`). Cliente nunca vê nem manda `repositoryRoot` — mais seguro e
  mais simples que expor via `NEXT_PUBLIC_*`. Decisão definitiva para este
  contexto (a deferida em `ISSUE-0009` era sobre *onde* resolver, isto a
  resolve).
- Card não tem mais campo `description` solto — `IssueFrontmatter` não tem
  um resumo de uma linha (só `body` completo, que `GET /ai-context/issues`
  não retorna por design, só frontmatter). Substituído por exibição de
  `tags` no card.
- Issues com `status: "consolidated"` são filtradas antes de chegar ao
  Kanban (`useIssues`) — consolidated é arquivo de conhecimento, não
  trabalho em execução.

# Critérios de aceite

- [x] Cards do Kanban vêm de `GET /ai-context/issues`, não de array mock.
- [x] Gap de `status: "test"` resolvido e documentado.
- [x] Gap de `effort`/`dependsOn` resolvido e documentado (persistidos,
      com validação de ciclo para `depends_on`).
- [x] Mover um card de coluna persiste via API real (testado manualmente
      com os dois servidores reais rodando, não só unit test).

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Issues derivadas desta: `ISSUE-0015` (rotina de priorização) e `ISSUE-0016`
(avaliar status dedicado de teste/QA).

# Log de execução

- 2026-06-21: issue registrada em backlog.
- 2026-06-22: movida para ready: dependência ISSUE-0009 satisfeita.
- 2026-06-22: iniciada implementação.
- 2026-06-22: implementação concluída: effort/depends_on persistidos com validação de ciclo, Kanban real em /execution conectado via proxy Next.js + REST do agent, testado de ponta a ponta com os dois servidores reais. Movida para review.
