---
id: ISSUE-0015
title: Rotina de priorização para agentes (priority/effort/depends_on)
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - ai-context
  - agent-behavior
  - prioritization
related_files:
  - apps/agent/src/ai-context/issues.ts
  - apps/agent/src/ai-context/types.ts
---

# Resumo

`ISSUE-0010` adiciona `effort` e `depends_on` ao frontmatter de Issue. Esta
issue é o passo seguinte natural: uma rotina real de priorização que um
agente possa chamar para descobrir "qual issue eu deveria trabalhar agora",
considerando `priority`, `effort` e quais issues estão de fato desbloqueadas
(`depends_on` satisfeito).

# Problema

Hoje, decidir o que trabalhar a seguir é julgamento manual (humano ou do
próprio agente lendo `list_issues`/`GET /ai-context/issues` e decidindo na
mão). Sem uma rotina explícita, cada agente pode aplicar um critério
diferente (ou nenhum), inconsistente entre sessões. Pedido explícito do
usuário: "devemos ter uma rotina que suporte priorização para os agentes
buscarem sempre trabalhar de acordo com o priorizado esforço/valor."

# Objetivo

Não implementado ainda — escopo a decidir quando esta issue for retomada,
mas inclui pelo menos:

- Uma função (ex. `listUnblockedIssues`/`nextIssueToWork`) que filtra issues
  cujo `depends_on` está 100% em status `done`/`consolidated`.
- Algum critério de ordenação combinando `priority` e `effort` (ex.: maior
  prioridade primeiro, desempate por menor esforço — "ganho rápido" antes de
  trabalho grande de mesma prioridade). Critério exato fica para quando esta
  issue for implementada, não decidido aqui.
- Possivelmente exposta como ferramenta MCP (`get_next_issue`) e/ou rota REST
  (`GET /ai-context/issues/next`), para uso direto por agentes externos
  (Claude Code/Codex via MCP) e pelo `apps/web`.

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

- Tudo. Depende de `ISSUE-0010` ter `effort`/`depends_on` persistidos de
  verdade no frontmatter antes de fazer sentido implementar isto.
- Decidir a fórmula/critério de ordenação (pode precisar de input do usuário
  sobre o que "valor" significa aqui — prioridade sozinha, ou alguma
  combinação com tipo/tags?).

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Rotina implementada e exposta de pelo menos uma forma (função
      TypeScript reutilizável no mínimo; MCP/REST se fizer sentido no
      momento da implementação).
- [ ] Considera `depends_on` (só retorna issues desbloqueadas) e
      `priority`/`effort` na ordenação.
- [ ] Testada contra a instância dogfood real.

# Observações

Registrada em resposta a feedback explícito do usuário durante a
implementação de `ISSUE-0010`, para não descartar a necessidade de
priorização sem deixar rastro — ver decisão de persistir `effort`/`depends_on`
em vez de descartá-los.

# Log de execução

- 2026-06-22: issue registrada em backlog.
