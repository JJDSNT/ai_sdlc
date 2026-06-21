---
id: ISSUE-0006
title: Interoperabilidade: edição manual (sem ai_sdlc) vs. mutations.ts (com ai_sdlc)
status: backlog
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - compatibility
  - interop
related_files:
  - apps/agent/src/ai-context/mutations.ts
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/frontmatter.ts
  - apps/agent/src/ai-context/templates.ts
---

# Resumo

`AI_context` precisa funcionar em dois modos de uso simultâneos e sem
conflito: (1) qualquer humano ou agente editando os arquivos `.md`
diretamente, sem nenhuma ferramenta do `ai_sdlc`; e (2) o `ai_sdlc`
operando sobre os mesmos arquivos via `apps/agent/src/ai-context/mutations.ts`.
Hoje o segundo modo pode silenciosamente apagar dados do primeiro.

# Problema

`createIssue`/`updateIssue`/`appendIssueLog`/`moveIssueStatus`/
`consolidateIssue` (`mutations.ts`) sempre reescrevem o arquivo inteiro a
partir de um objeto `Issue` reconstruído em memória. O frontmatter é
serializado por `frontmatterToRecord`, que só conhece os campos fixos de
`IssueFrontmatterSchema` (`types.ts`). Se um humano, ou um agente que não
usa o `ai_sdlc`, editar manualmente um arquivo e adicionar um campo extra
no frontmatter (ex. um campo próprio de outra ferramenta), a primeira vez
que o `ai_sdlc` voltar a escrever naquele arquivo (qualquer mutation)
**descarta esse campo silenciosamente** — porque ele nunca é lido de volta
para o objeto em memória.

Outro ângulo do mesmo problema: `parseFrontmatter`/`IssueFrontmatterSchema`
são estritos. Uma edição manual que não siga exatamente o formato esperado
(frontmatter incompleto, ordem diferente, um valor fora do enum) faz
`listIssues`/`readIssue` descartarem a issue inteira com um `console.warn`
(ver `apps/agent/src/ai-context/issues.ts`) — sem sinalizar isso de forma
visível para quem está realmente operando o sistema (humano via editor, ou
agente via `ai_sdlc`).

Por fim, o README gerado por `scaffoldAiContext` (`templates.ts` →
`README_MAIN`) não deixa explícito que usar o `ai_sdlc` é opcional. Hoje a
estrutura é lida como se fosse "deste software", quando o objetivo real é
que `AI_context/` seja uma convenção de arquivos que qualquer um pode ler e
editar, com ou sem `ai_sdlc`.

# Objetivo

- Edições manuais (sem `ai_sdlc`) não devem ser destruídas pela próxima
  escrita feita pelo `ai_sdlc` através de `mutations.ts`.
- Edições manuais malformadas (fora do schema esperado) não devem quebrar o
  fluxo de quem usa o `ai_sdlc` (hoje: a issue é só ignorada na listagem —
  decidir se isso é suficiente ou se merece um sinal mais visível).
- `AI_context/README.md`, gerado pelo scaffold, deve declarar explicitamente
  que a estrutura foi criada por e para o `ai_sdlc`, mas que seu uso não é
  obrigatório: qualquer pessoa ou agente pode ler, criar e editar os
  arquivos manualmente, sem nenhuma ferramenta.

# O que foi feito

Nada ainda — issue em `backlog`. Esta issue registra o problema e as
decisões abertas; a implementação fica para quando for priorizada.

# O que falta fazer

- Decidir se `IssueFrontmatterSchema` deve preservar campos desconhecidos
  (`.passthrough()` no Zod) em vez de descartá-los (`.strip()`, padrão
  atual), e se `frontmatterToRecord`/`updateIssue`/`moveIssueStatus`/
  `appendIssueLog` devem repassar esses campos extras de volta ao gravar.
- Decidir o que fazer com frontmatter inválido na leitura: manter o
  comportamento atual (ignorar com `console.warn`), ou expor isso de forma
  mais explícita (ex. `listIssues` retornar também os arquivos
  rejeitados e o motivo, deixando quem chama decidir o que fazer).
- Atualizar `README_MAIN` (`templates.ts`) com uma seção curta deixando
  explícito que `AI_context/` não exige `ai_sdlc` — é uma convenção de
  arquivos, não uma feature proprietária.
- Avaliar se o corpo da issue (não só o frontmatter) tem o mesmo risco:
  hoje `updateIssue`/`appendIssueLog` preservam `current.body` quando não
  fornecido explicitamente, então uma seção customizada adicionada à mão
  sobrevive — confirmar que isso continua valendo depois de qualquer
  mudança feita por esta issue.

# Decisões tomadas

Nenhuma ainda — issue registra o problema, não a solução.

# Critérios de aceite

- [ ] Uma edição manual com campo extra de frontmatter sobrevive a uma
      chamada subsequente de `updateIssue`/`moveIssueStatus`/`appendIssueLog`
      sobre o mesmo arquivo (teste real, sem mocks).
- [ ] Comportamento para frontmatter manualmente malformado decidido e
      documentado (não é mais um efeito colateral implícito do parser).
- [ ] `AI_context/README.md` gerado pelo scaffold declara explicitamente
      que o uso do `ai_sdlc` não é obrigatório.

# Observações

Esta issue nasceu de uma pergunta direta do usuário antes de avançar para
`ISSUE-0002` (MCP): tanto agentes operando via `ai_sdlc` quanto agentes ou
humanos editando `AI_context/` diretamente devem conseguir coexistir sobre
o mesmo repositório-alvo, sem que um fluxo quebre o outro. Vale resolver
isso antes ou junto de `ISSUE-0002`, já que o servidor MCP vai expor
exatamente as mesmas `mutations.ts` que hoje têm esse risco.

# Log de execução

- 2026-06-21: issue registrada em backlog, via `createIssue` real
  (dogfooding de `mutations.ts`).
