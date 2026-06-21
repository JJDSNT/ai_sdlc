---
id: ISSUE-0001
title: Criação da camada AI_context (memória operacional persistente)
status: review
priority: high
type: refactor
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - infra
  - refactor
related_files:
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/frontmatter.ts
  - apps/agent/src/ai-context/templates.ts
  - apps/agent/src/ai-context/scaffold.ts
  - apps/agent/src/ai-context/issues.ts
---

# Resumo

Introdução de `AI_context/`, uma camada de memória operacional persistente
baseada em arquivos markdown versionados, conforme proposto em
`refatoracao.md`. Inclui um módulo em `apps/agent/src/ai-context/` capaz de
materializar (`scaffoldAiContext`) e ler/indexar (`listIssues`, `readIssue`,
`filterIssuesByStatus`, `filterIssuesByPriority`, `searchIssuesByTag`) essa
estrutura em qualquer repositório-alvo.

# Problema

Agentes que operam sobre um repositório (via `Task.target.path`, ver
`apps/agent/src/services/task-runner.ts`) não tinham nenhum lugar persistente
para registrar contexto, decisões e progresso entre sessões. Tudo vivia
apenas na conversa/task corrente e se perdia ao final da execução.

# Objetivo

Fornecer uma convenção de arquivos (`AI_context/issues/`, `consolidated/`,
`templates/`, `metadata/`) que qualquer repositório-alvo possa adotar, com
leitura/escrita direta em markdown — sem banco de dados, sem MCP ainda — para
servir de base a uma futura camada de acesso via MCP.

# O que foi feito

- Módulo `apps/agent/src/ai-context/` com:
  - `types.ts`: schemas Zod para `IssueStatus`/`IssuePriority`/`IssueType`/`IssueFrontmatter`.
  - `frontmatter.ts`: parser/stringifier de frontmatter hand-rolled (sem nova dependência de YAML).
  - `templates.ts`: fonte canônica dos templates de issue/consolidated e dos READMEs.
  - `scaffold.ts`: `scaffoldAiContext(repositoryRoot)`, idempotente, nunca sobrescreve arquivo existente.
  - `issues.ts`: leitura/indexação direta dos arquivos markdown (sem cache).
  - `verify.script.ts`: script manual de verificação ponta a ponta.
- Instância "dogfood" gerada em `/AI_context` na raiz deste repositório,
  rodando `scaffoldAiContext` contra o próprio `ai_sdlc`.
- Esta própria issue, como exemplo real (não fictício) de issue ativa.

# O que falta fazer

- Mutações create/update/append/move/consolidate — ver `ISSUE-0003`
  (pré-requisito de `ISSUE-0002` e `ISSUE-0004`).
- Integração com MCP — ver `ISSUE-0002` (ferramentas `list_issues`,
  `read_issue`, `create_issue`, `update_issue`, `append_issue_log`,
  `move_issue_status`, `consolidate_issue`, `search_context`).
- Mapeamento Task ↔ Issue — ver `ISSUE-0004` (Task → Issue, TaskEvent → log
  da issue, Task completed → candidato a consolidação).
- Cache derivado em `AI_context/metadata/*.json` — ver `ISSUE-0005`.
- Promover esta issue para `consolidated/` quando: status virar `done`, a
  documentação estiver atualizada e os critérios de aceite abaixo estiverem
  marcados.

# Decisões tomadas

- Sem banco de dados/vector DB/embeddings nesta etapa — leitura sempre direto
  do markdown.
- Parser de frontmatter hand-rolled em vez de adicionar dependência de YAML
  (nenhuma estava declarada em nenhum `package.json` do monorepo).
- Módulo vive em `apps/agent/src/ai-context/` (não em `packages/`) — nada
  além do agent consome isso hoje, e é lógica de filesystem sem acoplamento a
  Fastify, então extrair para um package fica barato se for necessário depois.
- Toda função pública recebe `repositoryRoot: string` explícito, espelhando o
  padrão já usado em `run-repo-analyze-task.ts`/`run-repo-command-task.ts`/
  `run-repo-inspect-task.ts` — `AI_context` deve poder ser materializado em
  qualquer repositório-alvo, não só no próprio `ai_sdlc`.
- Nenhuma rota HTTP nova: esta etapa prepara a estrutura, não a expõe.
- Nenhum `CONSOLIDATED-0001.md` fictício foi criado — promover uma issue para
  consolidated antes de ela estar `done` violaria a regra descrita em
  `AI_context/consolidated/README.md`.

# Critérios de aceite

- [x] `AI_context` existe (gerado via `scaffoldAiContext`).
- [x] Templates existem (`AI_context/templates/*.template.md`).
- [x] README principal existe (`AI_context/README.md`).
- [x] Consolidated README existe (`AI_context/consolidated/README.md`).
- [x] Exemplo de issue existe (esta própria issue).
- [ ] Exemplo de consolidated existe — propositalmente não criado ainda (ver
      "O que falta fazer"); satisfeito por ora pelo template + regra
      documentada.
- [x] Estrutura documentada (`AI_context/README.md`, `consolidated/README.md`,
      `metadata/README.md`).
- [x] Nenhuma funcionalidade existente quebrada (módulo novo e isolado;
      `pnpm --filter agent typecheck` e `pnpm dev` continuam funcionando).
- [x] Preparação para MCP concluída (funções de leitura mapeiam 1:1 para
      `list_issues`/`read_issue`/`search_context`; mutações ficam para a
      etapa de MCP).

# Observações

A leitura/indexação (`issues.ts`) foi implementada nesta etapa mesmo não
estando explicitamente listada no critério de aceite do documento de
proposta original ("refatoracao.md"), porque a seção "Indexação" do próprio
documento a pedia e ela não constava na lista de itens "fora do escopo".

O documento de proposta original (`refatoracao.md`, na raiz do repositório)
foi removido após esta consolidação — seu conteúdo está integralmente
refletido nesta issue e no módulo `apps/agent/src/ai-context/`.

# Log de execução

- 2026-06-21: módulo `apps/agent/src/ai-context/` implementado; scaffold
  executado contra `/home/jaime/ai_sdlc`; esta issue autorada como exemplo
  real; `verify.script.ts` validado contra a instância dogfood.
- 2026-06-21: roadmap desmembrado em `ISSUE-0002` (MCP), `ISSUE-0003`
  (mutações), `ISSUE-0004` (integração Task↔Issue) e `ISSUE-0005` (cache em
  `metadata/`); `refatoracao.md` removido após consolidação.
- 2026-06-21: documentação atualizada — `docs/09 - ai-context.md` criado;
  notas de desambiguação adicionadas em `docs/02 - domain model.md` e
  `docs/05 - data model.md` (a Issue de `AI_context` não é a Issue de
  produto/Spec-Driven); `README.md` atualizado com referência ao
  `AI_context/`.
