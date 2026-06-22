---
id: ISSUE-0018
title: "Maturidade do Kanban: look & feel, feedback visual ao vivo, e instruções para agentes (on/off)"
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - web
  - execution
  - agent-behavior
  - workflow
related_files:
  - apps/web/app/execution/page.tsx
  - apps/web/features/execution
  - AI_context/README.md
---

# Resumo

`ISSUE-0010` conectou o Kanban a Issues reais, mas uma sessão real de uso
expôs um problema mais profundo que conectar dados: o usuário acompanhou a
página durante uma sessão de implementação longa (`ISSUE-0007` a
`ISSUE-0012`) e só viu issues em `backlog` ou `review` — nunca `doing` —
porque o agente transicionava status em lote, no final de cada issue, em
vez de em tempo real conforme o trabalho de fato acontecia. O Kanban
existe para dar visibilidade ao vivo do que está em andamento; sem isso,
ele é só decoração que reflete o passado.

# Problema

Três problemas distintos, todos expostos pela mesma sessão:

1. **Comportamento do agente**: nada hoje obriga ou nem mesmo sugere que um
   agente trabalhando numa issue deva movê-la para `doing` *antes* de
   começar a trabalhar, e registrar log conforme o progresso acontece (não
   só uma entrada agregada no final). Isso já foi corrigido como prática
   pessoal (ver memória `feedback-live-status-updates`), mas não está
   escrito em lugar nenhum do `AI_context` — outro agente (ou eu numa
   sessão futura) pode repetir o mesmo erro.
2. **UI não mostra o que já existe**: `GET /ai-context/issues` (`ISSUE-0009`)
   retorna só frontmatter — o `body` (onde vive o "Log de execução" real,
   com timestamps e narrativa) nunca chega ao Kanban. Mesmo que um agente
   já estivesse fazendo log ao vivo, a UI não tinha como mostrar isso.
3. **Sem atualização ao vivo de verdade**: a página só busca dados no
   mount (`useIssues`, `ISSUE-0010`). Sem polling/SSE, mesmo um card que
   muda de status em tempo real só aparece depois de um reload manual.

# Objetivo

Não decidido integralmente — issue de maturidade, escopo amplo de
propósito. Linhas de trabalho identificadas até aqui:

- **Instruções escritas para agentes**: adicionar ao `AI_context` (ex.
  `README_MAIN`/novo doc) uma seção descrevendo o protocolo esperado de
  status ao vivo: mover para `doing` antes de iniciar, logar conforme o
  progresso, mover para `review` só ao terminar de verdade.
- **Modo "feedback visual on/off"**: o protocolo acima tem custo (mais
  chamadas de mutação, mais ruído no log) que só vale a pena quando alguém
  está de fato observando o Kanban. Definir como um agente decide/é
  informado se deve operar em modo "ao vivo" (granular, várias transições
  e logs) ou modo "lote" (transições mínimas, ex. para execução autônoma
  longa/overnight sem ninguém olhando) — provavelmente uma flag explícita
  passada ao agente (env var, parâmetro de prompt, ou convenção de
  instrução), não inferência automática.
- **UI mostra o log real**: alguma forma de ver o "Log de execução" (ou ao
  menos a entrada mais recente) de uma issue direto no card ou ao
  expandir, sem precisar abrir o arquivo markdown.
- **Atualização ao vivo de verdade**: polling leve (ex. refetch a cada N
  segundos) ou, se justificar o custo, SSE reaproveitando o padrão já
  existente de `task-store.ts`/`tasks-events.ts` (`subscribeToTaskEvents`)
  adaptado para eventos de Issue.
- **Look & feel**: revisão visual mais ampla do Kanban (esta parte
  fica deliberadamente vaga — é trabalho de design, não só de dados).

# O que foi feito

Nada ainda — issue em `backlog`. Registrada em resposta a feedback direto
do usuário observando a página `/execution` durante a sessão de
`ISSUE-0007`–`ISSUE-0012`.

# O que falta fazer

Tudo. Possíveis sub-issues quando esta for retomada (a decompor, não
decidido agora): (a) protocolo de status ao vivo + doc, (b) flag on/off,
(c) exibição de log no Kanban, (d) polling/SSE, (e) redesign visual.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Convenção de status ao vivo documentada em algum lugar do
      `AI_context` (não só na memória pessoal do agente).
- [ ] Mecanismo de "feedback visual on/off" definido e documentado — como
      um agente sabe em qual modo operar.
- [ ] Decisão registrada sobre exibir log/atividade recente no Kanban
      (mesmo que a decisão seja "não agora, por X razão").
- [ ] Decisão registrada sobre live update (polling/SSE) — implementado
      ou explicitamente adiado com motivo.

# Observações

Issue de maturidade de processo, não só de produto — nasce de uma
observação sobre como agentes (incluindo eu) devem operar dentro do
próprio sistema que estamos construindo, não só de uma lacuna de UI.

# Log de execução

- 2026-06-22: issue registrada em backlog, a partir de feedback direto do
  usuário sobre a sessão de implementação de ISSUE-0007–ISSUE-0012.
