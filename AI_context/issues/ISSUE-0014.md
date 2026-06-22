---
id: ISSUE-0014
title: Viewer estático de AI_context (deploy em gh-pages, por URL de repositório)
status: review
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
  - docs/viewer/index.html
depends_on: []
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

(Revisado durante a implementação — ver "Decisões tomadas".) Uma única
página estática, `docs/viewer/index.html`, sem build, que:

- Recebe uma URL de repositório GitHub (ex. `owner/repo` ou URL completa)
  via input na própria página, ou via `?repo=owner/repo` na query string
  (link direto compartilhável).
- Busca `AI_context/issues/*.md`, `AI_context/specs/*.md` e
  `AI_context/consolidated/*.md` daquele repositório client-side, via
  GitHub Contents API + `download_url` (raw), sem backend próprio.
- Faz parse do frontmatter com um port direto, em JS puro, do parser de
  `apps/agent/src/ai-context/frontmatter.ts` (mesma lógica, sem reimportar
  — ver "Decisões tomadas" sobre por que é cópia, não import).
- Renderiza: board de issues agrupadas por status (visão tipo Kanban,
  read-only, clicável para ver o corpo completo), lista de specs por
  status, lista de consolidated — essencialmente a mesma visão que
  `grep`/`head` davam no terminal (`AI_context/README.md` §"Visão rápida
  do estado"), só que num link compartilhável, sem precisar de terminal.

# O que foi feito

- `docs/viewer/index.html`: HTML+CSS+JS vanilla, um único arquivo, zero
  dependências, zero build.
- Parser de frontmatter portado de `frontmatter.ts` para JS puro (mesma
  lógica exata: escalares, listas, `key: []` como array vazio).
- Cliente GitHub: `fetchDir` (Contents API, trata 404 como lista vazia e
  403 como erro de rate-limit/acesso com mensagem específica),
  `fetchRaw` (busca o conteúdo via `download_url`), ambos aceitando um
  token opcional (`Authorization: token ...`) — cobre repositório privado
  de graça, é o mesmo header em qualquer chamada à API do GitHub.
- Board de issues (7 colunas, uma por status), lista de specs (agrupada
  por status), lista de consolidated (sem frontmatter — título extraído da
  primeira linha `# Heading`, conforme `CONSOLIDATED_TEMPLATE`).
- Clique em qualquer item abre um `<dialog>` nativo do browser mostrando o
  corpo completo, via `textContent` (nunca `innerHTML`) — sem necessidade
  de renderizar markdown nem de sanitizar HTML, já que conteúdo de
  repositório arbitrário nunca é injetado como HTML.
- Estado vazio (nenhum `AI_context/` encontrado), estado de erro (rate
  limit/403, repo inválido) e link direto via `?repo=`.
- Testado de ponta a ponta contra o repositório real `JJDSNT/ai_sdlc`
  (público, já no GitHub): a API do GitHub retornou as 18 issues reais
  (9 `backlog`, 9 `review` no momento do teste), e o parser de
  frontmatter portado produziu exatamente o mesmo resultado que o parser
  original em TypeScript ao rodar contra o conteúdo real baixado.

# O que falta fazer

- **Passo manual fora do meu alcance**: habilitar GitHub Pages no repo
  (Settings → Pages → Source: "Deploy from a branch" → `main` /
  `/docs`) — é uma configuração no site do GitHub, não algo que `git`
  resolve. Depois disso, a página fica em
  `https://JJDSNT.github.io/ai_sdlc/viewer/`.
- Repositório privado: funciona se o usuário colar um token pessoal com
  acesso (mesmo header de auth de qualquer chamada à API), mas não foi
  testado de fato (exigiria um token real e um repo privado de teste).

# Decisões tomadas

- **Revisão de escopo** (pergunta direta do usuário: "vai precisar de um
  novo app inteiro?"): abandonado o plano original de `apps/ai-context-viewer`
  (Vite+React+TS, novo membro do workspace pnpm, build pipeline, GitHub
  Actions). Trocado por um único arquivo HTML vanilla — o problema real
  (buscar markdown do GitHub, parsear frontmatter simples, agrupar por
  status) não justificava uma app completa. Confirmado pelo próprio
  usuário em seguida: o objetivo real era replicar no browser a mesma
  visão que o `grep` já dava no terminal.
- `frontmatter.ts` **duplicado** (portado para JS puro), não compartilhado
  via `packages/`: como o viewer não tem build nem `node_modules`, não há
  como importar de um package TypeScript do monorepo sem introduzir
  tooling — duplicar ~40 linhas de lógica estável é mais simples que criar
  infraestrutura de compartilhamento para isso.
- Sem renderização de markdown (nenhuma lib tipo `marked`/`react-markdown`):
  o corpo é mostrado como texto pré-formatado via `textContent`. Decisão
  dupla: evita dependência nova E evita qualquer risco de XSS ao exibir
  conteúdo de repositórios arbitrários (nunca usa `innerHTML` com dado
  remoto).
- Deploy via GitHub Pages "serve from branch" (`/docs`), não GitHub
  Actions: não há nada para buildar, então um workflow de CI seria
  overhead puro.

# Critérios de aceite

- [x] Página estática roda 100% no browser, sem servidor (testado com um
      servidor HTTP local trivial, mas a página não depende dele — é só
      um arquivo).
- [x] Usuário consegue colar uma URL/`owner/repo` de um repositório
      público com `AI_context/` e ver issues/specs/consolidated
      navegáveis — testado contra `JJDSNT/ai_sdlc` real.
- [x] Estado vazio (sem `AI_context/`) e estado de erro (rate limit, repo
      inexistente) tratados com mensagem clara, não crash.
- [ ] Deploy publicado em GitHub Pages, acessível por URL pública —
      depende do passo manual de habilitar Pages nas configurações do
      repositório (fora do meu alcance).
- [x] Decisão sobre compartilhamento de `frontmatter.ts`/`types.ts`
      documentada (duplicado/portado para JS puro, não extraído para
      `packages/` — ver "Decisões tomadas").

# Observações

Diferente de `ISSUE-0009`/`ISSUE-0010`/`ISSUE-0011` (que conectam o
`AI_context` ao produto ai_sdlc via `repositoryRoot` local): este viewer é
público, estático e aponta para QUALQUER repositório GitHub com a
convenção `AI_context/`, não só repos geridos pelo ai_sdlc. É uma
ferramenta de apresentação/compartilhamento, não parte do fluxo
chat→spec→issue→task.

# Log de execução

- 2026-06-22: issue registrada em backlog.
- 2026-06-22: movida para ready: usuário pediu para atacar esta issue.
- 2026-06-22: iniciada implementação: novo app apps/ai-context-viewer (Vite+React, fetch client-side via GitHub Contents API).
- 2026-06-22: escopo revisado após pergunta do usuário: nada de apps/ai-context-viewer (Vite/React/build) — um único docs/viewer/index.html vanilla JS, sem build, sem dependências, deploy via GitHub Pages 'serve from branch'.
- 2026-06-22: implementação concluída: docs/viewer/index.html (vanilla JS, sem build), testado de ponta a ponta contra JJDSNT/ai_sdlc real via GitHub Contents API. Falta só habilitar GitHub Pages nas configurações do repositório (passo manual, fora do meu alcance). Movida para review.
- 2026-06-22: ajuste pós-review: input pré-preenchido com https://github.com/JJDSNT/ai_sdlc e carregado automaticamente ao abrir a página (até a pessoa colar outra URL), a pedido do usuário.
