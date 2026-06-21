---
id: ISSUE-0012
title: Ativar chat real (CopilotPanel) na página de definição
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - web
  - chat
  - copilot
related_files:
  - apps/web/components/copilot/copilot-panel.tsx
  - apps/web/app/api/copilotkit/route.ts
  - apps/agent/src/routes/copilot-stream.ts
---

# Resumo

`CopilotPanel`/`CopilotChat` (`apps/web/components/copilot/copilot-panel.tsx:739`)
existe, compila, mas não é importado em nenhuma página — código morto. O
backend que ele chamaria já é real e funciona: `apps/web/app/api/copilotkit/route.ts`
→ `apps/agent/src/routes/copilot-stream.ts` → cria uma `Task` com
`kind: "chat"` no banco. Esta issue só conecta as duas pontas que já
existem.

# Problema

A conversa que o usuário descreveu ("chat antes de formalizar specs") não
acontece de verdade hoje — `ConversationSection()` em
`apps/web/app/definition/page.tsx:214-333` é UI estática sem nenhuma
chamada de rede. O backend de chat funciona (testável direto via API), mas
ninguém na UI chama ele.

# Objetivo

Substituir `ConversationSection()` (ou colocar ao lado dela, a decidir) pelo
componente `CopilotPanel`/`CopilotChat` real, na página `/definition`,
conectado ao pipeline já existente.

# O que foi feito

Nada ainda — issue em `backlog`.

# O que falta fazer

- Confirmar que `CopilotPanel` (que parece ter sido escrito para outro
  contexto/versão do produto, dado que ficou órfão) ainda é compatível com
  o estado atual de `routes/copilot-stream.ts`, ou se precisa de ajuste.
- Decidir o que acontece com `draftInsights` (mock) — esse era claramente
  o lugar pensado para "o que saiu da conversa até agora". Com o chat
  real, isso deveria vir de mensagens reais da `Task`, não de um array
  estático.
- Esta issue NÃO inclui a transformação de conversa em Spec formal — isso
  é `ISSUE-0013` (research), que depende desta estar pronta primeiro.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] `CopilotPanel`/`CopilotChat` renderizado em `/definition`, não mais
      código morto.
- [ ] Uma conversa real cria uma `Task` (`kind: "chat"`) visível no banco
      (testável via `listTasks`/rota existente).
- [ ] `draftInsights` deixa de ser array hardcoded (ou é explicitamente
      removido, se decidirmos que não faz mais sentido nesse formato).

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Esta é, na prática, a issue mais barata do lote — quase tudo que ela
precisa já existe, só está desconectado.

# Log de execução

- 2026-06-21: issue registrada em backlog.
