---
id: ISSUE-0012
title: Ativar chat real (CopilotPanel) na página de definição
status: review
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-22
tags:
  - web
  - chat
  - copilot
related_files:
  - apps/web/components/copilot/copilot-panel.tsx
  - apps/web/app/api/copilotkit/route.ts
  - apps/agent/src/routes/copilot-stream.ts
  - apps/web/features/definition/components/conversation-chat.tsx
  - apps/agent/src/task-store.ts
depends_on: []
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

- Confirmado: `CopilotPanel` (`components/copilot/copilot-panel.tsx`) NÃO
  foi reaproveitado — seus `useFrontendTool` (createChatTask/selectTask/
  etc.) são sobre gestão de uma lista de Tasks, conceito que não existe em
  `/definition` (conversa única sobre uma Spec). Além disso o arquivo
  falha typecheck (API do CopilotKit mudou — `labels.title`/`instructions`
  não existem mais na versão instalada, `useFrontendTool`'s `render` tem
  assinatura de `status` diferente) — confirma a suspeita já registrada
  nesta issue de que ficou desatualizado.
- Novo `features/definition/components/conversation-chat.tsx`: usa
  `CopilotChat` (`@copilotkit/react-core/v2`) direto, sem tools
  customizadas, com `labels` usando as chaves reais do tipo instalado
  (`chatInputPlaceholder`/`welcomeMessageText` — não `title`/`initial`,
  que não existem nesta versão).
- `ConversationSection` em `app/definition/page.tsx` substituída: grid
  `auto 1fr` (cabeçalho + `ConversationChat`), removendo as mensagens
  estáticas e o textarea desabilitado.
- `app/layout.tsx`: adicionado `import "@copilotkit/react-core/v2/styles.css"`
  (faltava — sem isso o widget renderizaria sem estilo).
- **Bug real corrigido** (regressão de `510ca3f`, confirmada pelo usuário
  como algo que já funcionou antes): `tasks.project_id` é `NOT NULL` no
  schema Drizzle, mas `copilot-stream.ts` (e `routes/tasks.ts`, mesmo bug)
  chamavam `createTask` sem `projectId`, quebrando toda criação de Task de
  chat com `SQLITE_CONSTRAINT`. Corrigido em `task-store.ts::createTask`
  com um fallback para o primeiro `project` existente
  (`resolveDefaultProjectId`) — conserta os dois call sites de uma vez, sem
  tocar em nenhum deles.
- Causa raiz mais profunda do bug (tipo `Task` desatualizado em `task.ts`
  desde o mesmo commit, espalhando ~40 erros de typecheck por
  `task-store.ts`/`task-runner.ts`/`routes/tasks.ts`/`routes/copilot.ts` e
  4 arquivos órfãos) registrada separadamente em `ISSUE-0017` — não
  resolvida aqui, só o suficiente para desbloquear o chat real.
- Testado de ponta a ponta com `apps/agent` + `apps/web` + `opencode serve`
  reais rodando: `POST /copilot/stream` com uma mensagem real retornou um
  stream SSE completo (`RUN_STARTED` → `TEXT_MESSAGE_*` → `RUN_FINISHED`)
  com resposta real do modelo ("OK"), e `GET /tasks` confirmou a Task
  persistida no banco (`kind: "chat"`, `projectId: "proj_1"`,
  `status: "completed"`, `output.finalMessage` com a resposta real).
- **Não verificado**: interação real no browser com o widget
  `CopilotChat` renderizado (sem ferramenta de automação de browser
  disponível neste ambiente). O que foi provado é a cadeia completa de
  backend (rota real → `/copilot/stream` → OpenCode → Task no banco) e que
  a página renderiza sem erro de servidor; falta confirmar visualmente que
  digitar e enviar no widget de fato dispara essa cadeia pelo
  `/api/copilotkit` (código não tocado por esta issue, mas nunca exercitado
  de fato antes).

# O que falta fazer

- Verificação manual no browser (digitar uma mensagem real no
  `CopilotChat` renderizado e confirmar visualmente a resposta) — meu
  ambiente não tem ferramenta de automação de browser para fazer isso
  diretamente.
- `draftInsights`: já resolvido em `ISSUE-0011` (passou a ser rascunho
  client-side efêmero, não mock hardcoded) — nada pendente aqui.

# Decisões tomadas

- `CopilotPanel` não foi adaptado/reaproveitado — usar `CopilotChat`
  diretamente é mais correto para esta página (sem tools de gestão de
  task que não fazem sentido aqui). `CopilotPanel` continua existindo,
  intacto, para uma futura página de console de tasks, se um dia existir.
- Bug do `projectId` corrigido na raiz comum (`task-store.ts::createTask`)
  em vez de em cada call site — conserta `copilot-stream.ts` e
  `routes/tasks.ts` de uma vez.
- Causa raiz do tipo `Task` desatualizado NÃO corrigida aqui — registrada
  como `ISSUE-0017` (escopo maior, decisão de arquitetura sobre arquivos
  órfãos, fora do que "ativar chat real" pedia).

# Critérios de aceite

- [x] `CopilotPanel`/`CopilotChat` renderizado em `/definition`, não mais
      código morto (via `CopilotChat`, decisão documentada acima).
- [x] Uma conversa real cria uma `Task` (`kind: "chat"`) visível no banco
      — confirmado via `GET /tasks` com resposta real do modelo.
- [x] `draftInsights` deixa de ser array hardcoded — já resolvido em
      `ISSUE-0011`.

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task.
Acabou não sendo "a issue mais barata do lote" como a observação original
previa — o bug de `projectId` (regressão real, não algo que eu introduzi)
escondia o fato de que a fiação nunca tinha sido testada de ponta a ponta
desde a migração para Drizzle. `ISSUE-0017` registra o resto da dívida
técnica encontrada.

# Log de execução

- 2026-06-21: issue registrada em backlog.
- 2026-06-22: movida para ready: draftInsights já resolvido em ISSUE-0011.
- 2026-06-22: iniciada implementação.
- 2026-06-22: implementação concluída: CopilotChat real em /definition (sem reaproveitar CopilotPanel, tools de task não fazem sentido aqui), CSS do widget importado. Corrigido bug real de regressão (projectId faltante em createTask, ISSUE-0017 registra a causa raiz maior). Testado de ponta a ponta com agent+web+opencode serve reais: Task de chat criada e completada no banco com resposta real do modelo. Verificação interativa em browser não feita (sem ferramenta de automação). Movida para review.
