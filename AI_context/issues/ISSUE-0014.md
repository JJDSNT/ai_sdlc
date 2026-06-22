---
id: ISSUE-0014
title: Viewer estático de AI_context (deploy em gh-pages, por URL de repositório)
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - ai-context
  - viewer
  - gh-pages
related_files:
  - apps/agent/src/ai-context/frontmatter.ts
  - apps/agent/src/ai-context/types.ts
---

# Resumo

Um site estático, deployável em GitHub Pages, onde o usuário informa a URL
de um repositório GitHub e visualiza o `AI_context/` daquele repositório
(issues, specs, consolidated) de forma navegável e apresentável — sem
precisar clonar o repo, abrir editor ou rodar o `apps/agent`.

# Problema

Hoje a única forma de "ver" um `AI_context/` é abrindo os arquivos
markdown direto no editor/GitHub, ou via MCP/API a partir do próprio
`apps/agent` rodando localmente contra um `repositoryRoot` (`ISSUE-0009`).
Não existe nenhuma superfície pública e read-only para apresentar o estado
de um `AI_context` (ex.: para compartilhar o progresso de um projeto com
alguém que não tem o repo clonado, ou para o próprio ai_sdlc se
apresentar usando seu próprio dogfood).

# Objetivo

Novo app estático (ex. `apps/ai-context-viewer`), com build de export
estático (compatível com GitHub Pages — sem servidor, sem SSR), que:

- Recebe uma URL de repositório GitHub (ex. `owner/repo` ou URL completa)
  via input na própria página (não via variável de ambiente/build-time).
- Busca `AI_context/issues/*.md`, `AI_context/specs/*.md` e
  `AI_context/consolidated/*.md` daquele repositório client-side, via
  GitHub REST API (`api.github.com/repos/{owner}/{repo}/contents/...`) ou
  `raw.githubusercontent.com`, sem backend próprio.
- Faz parse do frontmatter reaproveitando a lógica de
  `apps/agent/src/ai-context/frontmatter.ts` (já isomórfica — zero
  dependência de `node:fs`, confirmado nesta issue) em vez de reimplementar.
- Renderiza: lista de issues agrupadas por status (visão tipo Kanban,
  read-only), lista de specs por status, lista de consolidated, e o corpo
  de cada item com markdown renderizado.

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

- Decidir como `frontmatter.ts`/`types.ts` são compartilhados entre
  `apps/agent` e o novo app sem duplicar código: extrair para
  `packages/ai-context-core` (o monorepo já tem `packages/*` no workspace,
  hoje vazio) é o caminho mais natural, mas é uma decisão de escopo desta
  issue, não pré-definida aqui.
- Decidir o método de fetch: GitHub Contents API (autenticado opcionalmente
  via token informado pelo próprio usuário no client, nunca persistido em
  build) tem rate limit de 60 req/h sem auth — suficiente para uso pessoal,
  mas precisa de uma mensagem de erro clara quando esgotar, não falha
  silenciosa.
- Escopo inicial: somente repositórios públicos. Repositório privado
  exigiria o usuário colar um token pessoal no próprio browser (sessão,
  não persistido) — avaliar se entra nesta issue ou fica para depois.
- Pipeline de deploy para GitHub Pages (provavelmente GitHub Actions no
  próprio repo do ai_sdlc, build estático + publish em `gh-pages` branch
  ou GitHub Pages a partir de Actions).
- Tratamento de repositório sem `AI_context/` (estado vazio claro, não erro).

# Decisões tomadas

Nenhuma ainda. Confirmado nesta issue: `frontmatter.ts` não tem dependência
de Node (`node:fs` etc.) — pode rodar no browser sem adaptação.

# Critérios de aceite

- [ ] App estático buildável e exportável (sem servidor) que roda 100% no
      browser.
- [ ] Usuário consegue colar uma URL/`owner/repo` de um repositório público
      com `AI_context/` e ver issues/specs/consolidated navegáveis.
- [ ] Estado vazio (sem `AI_context/`) e estado de erro (rate limit, repo
      inexistente) tratados com mensagem clara, não crash.
- [ ] Deploy publicado em GitHub Pages, acessível por URL pública.
- [ ] Decisão sobre compartilhamento de `frontmatter.ts`/`types.ts` entre
      `apps/agent` e o viewer documentada (extraído para `packages/` ou
      duplicado deliberadamente).

# Observações

Diferente de `ISSUE-0009`/`ISSUE-0010`/`ISSUE-0011` (que conectam o
`AI_context` ao produto ai_sdlc via `repositoryRoot` local): este viewer é
público, estático e aponta para QUALQUER repositório GitHub com a
convenção `AI_context/`, não só repos geridos pelo ai_sdlc. É uma
ferramenta de apresentação/compartilhamento, não parte do fluxo
chat→spec→issue→task.

# Log de execução

- 2026-06-22: issue registrada em backlog.
