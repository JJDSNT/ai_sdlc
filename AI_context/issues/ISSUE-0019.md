---
id: ISSUE-0019
title: "Definir critérios objetivos para backlog→ready, review→done, e convenção de blocked"
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - ai-context
  - workflow
  - agent-behavior
related_files:
  - apps/agent/src/ai-context/mutations.ts
  - apps/agent/src/ai-context/templates.ts
---

# Resumo

Hoje `moveIssueStatus` valida *quais* transições são estruturalmente
permitidas (`ALLOWED_TRANSITIONS`), mas não valida *se* uma transição
específica deveria acontecer — ex.: nada impede mover para `done` com
checkboxes de "Critérios de aceite" ainda desmarcados. Pedido do usuário:
definir critérios objetivos para `backlog→ready` e `review→done`, e uma
convenção para quando usar `blocked` (qualquer ponto que dependa de
intervenção manual do usuário).

# Problema

Três lacunas distintas, levantadas em conjunto pelo usuário:

1. `backlog→ready`: hoje é decisão livre (humana ou do agente), sem
   critério escrito. Proposta do usuário: se a issue está completa
   (não precisa de esclarecimento adicional), pode ir para `ready`.
2. `review→done`: idem — nada verifica que os critérios de aceite foram
   de fato satisfeitos antes de marcar como `done`. Proposta do usuário:
   só vai para `done` se passar no critério de aceitação e não houver
   nada pendente de esclarecimento/execução.
3. `blocked`: já é um status estrutural válido a partir de qualquer status
   ativo (`ALLOWED_TRANSITIONS` em `mutations.ts` já permite isso), mas
   não há convenção escrita de *quando* usá-lo. Proposta do usuário: toda
   vez que avançar depender de intervenção manual do usuário, isso deveria
   aparecer como `blocked`, não ficar represado em `doing`/`ready` sem
   sinalização.

# Objetivo

Não decidido em detalhe — esboço de direção, a refinar quando esta issue
for retomada:

- `backlog→ready`: provavelmente fica como **convenção escrita** (não
  validável em código — "está bem especificado, sem ambiguidade" é
  julgamento, não uma checagem mecânica), documentada ao lado da
  convenção de status ao vivo já prevista em `ISSUE-0018`.
- `review→done`: candidato a **gate mecânico de verdade** em
  `moveIssueStatus`/uma nova função: ao tentar mover para `done`, parsear
  a seção "Critérios de aceite" do corpo e rejeitar
  (`AiContextMutationError`) se houver algum `- [ ]` (checkbox desmarcado)
  — só permite se todos estiverem `- [x]`. Mecanicamente checável, ao
  contrário do critério de `ready`.
- `blocked`: convenção escrita — sempre que um agente identificar que
  precisa de decisão/ação do usuário para continuar, mover a issue para
  `blocked` (com `appendIssueLog` explicando o que falta) em vez de
  deixá-la parada em outro status sem sinalização.

# O que foi feito

Nada ainda — issue em `backlog`. Registrada a partir de pedido direto do
usuário.

# O que falta fazer

- Tudo. Decidir o formato exato do parser de "Critérios de aceite" (já
  existe convenção de `- [ ]`/`- [x]` em todos os templates — ver
  `ISSUE_TEMPLATE`/`SPEC_TEMPLATE` em `templates.ts` — só falta escrever
  o parser e plugar no `moveIssueStatus`).
- Decidir se o gate de `done` é estrito (bloqueia 100% das vezes) ou tem
  uma via de escape documentada (ex. critério de aceite genuinamente não
  aplicável, marcado como tal em vez de simplesmente apagado).
- Escrever a convenção de `backlog→ready` e `blocked` em algum doc do
  `AI_context` (mesmo lugar previsto por `ISSUE-0018` para a convenção de
  status ao vivo — possivelmente a mesma seção/doc).

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Convenção de `backlog→ready` documentada.
- [ ] Gate mecânico de `review→done` implementado (rejeita se houver
      checkbox desmarcado em "Critérios de aceite") e testado.
- [ ] Convenção de `blocked` documentada e exemplificada.

# Observações

Relacionada a `ISSUE-0018` (maturidade do Kanban / instruções para
agentes) — ambas tratam de como agentes devem operar o ciclo de vida de
uma issue, não só de UI. Podem acabar compartilhando o mesmo documento de
convenções quando implementadas.

# Log de execução

- 2026-06-22: issue registrada em backlog, a partir de pedido direto do
  usuário.
