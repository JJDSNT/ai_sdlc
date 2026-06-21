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

Resolver isso com **safeguards básicas, não um sistema de reconciliação**.
Não há merge inteligente de conflitos, não há versionamento de schema, não
há relatório estruturado de erros de parsing — o objetivo é só parar de
perder dados e deixar uma expectativa clara, com a menor mudança possível:

- Campo extra de frontmatter adicionado à mão sobrevive a uma escrita
  subsequente do `ai_sdlc`.
- `AI_context/README.md`, gerado pelo scaffold, declara que o uso do
  `ai_sdlc` é opcional.

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

Três mudanças pequenas, sem nada além disso:

1. `IssueFrontmatterSchema` (`types.ts`): trocar o padrão `.strip()` do Zod
   por `.passthrough()`, pra campos desconhecidos sobreviverem à validação
   em vez de serem descartados.
2. `frontmatterToRecord` (`mutations.ts`): hoje monta o record campo a
   campo, manualmente, só com os campos conhecidos do schema — trocar para
   espalhar os campos conhecidos (na ordem fixa atual, por legibilidade) e
   depois incluir qualquer campo extra que `.passthrough()` tenha
   preservado, sem tentar entender ou reordenar esses campos.
3. `README_MAIN` (`templates.ts`): uma frase explícita dizendo que
   `AI_context/` foi gerado por/para o `ai_sdlc`, mas que ler/criar/editar
   esses arquivos manualmente, sem nenhuma ferramenta, é um uso suportado.

# Fora de escopo (de propósito, pra não virar over-engineering)

- Não mudar o comportamento de frontmatter inválido na leitura — continua
  sendo ignorado com `console.warn`. Isso já é proteção suficiente contra
  quebrar o fluxo do `ai_sdlc`; reportar rejeições de forma estruturada é
  complexidade que ninguém pediu.
- Não tocar no corpo da issue — `updateIssue`/`appendIssueLog` já
  preservam `current.body` quando não fornecido explicitamente; nenhuma
  mudança necessária aí.
- Sem lock de arquivo, sem merge de conflito, sem detecção de edição
  concorrente. Continua "last write wins", como já decidido em
  `ISSUE-0003`.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] `IssueFrontmatterSchema` usa `.passthrough()`.
- [ ] Um campo extra de frontmatter adicionado à mão sobrevive a uma
      chamada subsequente de `updateIssue`/`moveIssueStatus`/`appendIssueLog`
      sobre o mesmo arquivo (teste real, sem mocks).
- [ ] `AI_context/README.md` gerado pelo scaffold declara explicitamente
      que o uso do `ai_sdlc` não é obrigatório.

# Observações

Esta issue nasceu de uma pergunta direta do usuário antes de avançar para
`ISSUE-0002` (MCP): tanto agentes operando via `ai_sdlc` quanto agentes ou
humanos editando `AI_context/` diretamente devem conseguir coexistir sobre
o mesmo repositório-alvo, sem que um fluxo quebre o outro. Vale resolver
isso antes ou junto de `ISSUE-0002`, já que o servidor MCP vai expor
exatamente as mesmas `mutations.ts` que hoje têm esse risco.

Escopo deliberadamente reduzido a 3 mudanças pequenas (ver "O que falta
fazer"/"Fora de escopo") após feedback do usuário: o objetivo é uma
safeguard básica, não um sistema de reconciliação entre edições manuais e
automatizadas.

# Log de execução

- 2026-06-21: issue registrada em backlog, via `createIssue` real
  (dogfooding de `mutations.ts`).
