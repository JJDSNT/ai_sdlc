---
id: ISSUE-0010
title: Conectar /execution (Kanban) às Issues reais do AI_context
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - web
  - execution
  - issue
related_files:
  - apps/web/app/execution/page.tsx
  - apps/web/src/features/execution
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

Nada ainda — issue em `backlog`.

# O que falta fazer

- Decidir sobre `status: "test"`: ou mapeia para `review` (mais próximo
  semanticamente do que já existe), ou justifica adicionar `"test"` ao
  enum oficial de `IssueStatus` — isso afeta `ALLOWED_TRANSITIONS`
  (`mutations.ts`) e todo o resto do sistema, não é uma mudança isolada
  desta página.
- Decidir sobre `effort`/`dependsOn`: viram campos opcionais reais em
  `IssueFrontmatter` (`ISSUE-0008` já abre precedente para campos
  opcionais), ou ficam só como metadata client-side não persistida? Effort
  parece razoável de persistir; `dependsOn` é mais delicado (é
  relacionamento entre issues, precisa de validação de ciclo se for sério).
- Depende de `ISSUE-0009` (API REST) estar pronta.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Cards do Kanban vêm de `GET /ai-context/issues`, não de array mock.
- [ ] Gap de `status: "test"` resolvido e documentado.
- [ ] Gap de `effort`/`dependsOn` resolvido e documentado (persistido ou
      explicitamente descartado, com motivo).
- [ ] Mover um card de coluna persiste via API real (testado manualmente
      no browser, não só unit test).

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.

# Log de execução

- 2026-06-21: issue registrada em backlog.
