---
id: ISSUE-0002
title: Camada MCP sobre o AI_context
status: review
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - mcp
related_files:
  - apps/agent/src/ai-context/mcp/server.ts
  - apps/agent/src/ai-context/mcp/security.ts
  - apps/agent/src/ai-context/issues.ts
  - apps/agent/src/ai-context/mutations.ts
  - apps/agent/src/ai-context/index.ts
  - apps/agent/package.json
  - docs/09 - ai-context.md
---

# Resumo

Expor as operações do módulo `apps/agent/src/ai-context/` (leitura hoje,
mutações quando ISSUE-0003 estiver pronta) como ferramentas MCP, para que
qualquer cliente/agente MCP consiga ler e operar sobre o `AI_context/` de um
repositório-alvo sem precisar importar o módulo TypeScript diretamente.

# Problema

Hoje o `AI_context` só é acessível por quem importa
`apps/agent/src/ai-context/index.ts` diretamente em código TypeScript. Não
existe nenhuma camada de protocolo que um cliente MCP externo (editor, outro
agente, etc.) possa usar para listar, ler ou (futuramente) modificar issues.

# Objetivo

Implementar um servidor/adapter MCP que exponha, no mínimo, as ferramentas
de leitura já existentes:

- `list_issues`
- `read_issue`
- `search_context`

E, agora que `ISSUE-0003` (mutações) está em `review` com
`apps/agent/src/ai-context/mutations.ts` implementado, as ferramentas de
escrita:

- `create_issue`
- `update_issue`
- `append_issue_log`
- `move_issue_status`
- `consolidate_issue`

Cada ferramenta deve receber `repositoryRoot` explicitamente como parâmetro
de entrada (nunca assumir um diretório fixo), preservando o contrato já
estabelecido em `apps/agent/src/ai-context/issues.ts`.

# O que foi feito

- `@modelcontextprotocol/sdk` (`^1.28.0`) adicionado como dependência direta
  de `apps/agent` — já estava resolvido no lockfile como transitivo, sem
  conflito de peer dependency com o `zod ^4.3.6` já usado no projeto
  (o SDK aceita `zod: "^3.25 || ^4.0"`).
- `apps/agent/src/ai-context/mcp/server.ts`: `McpServer` + `StdioServerTransport`,
  registrando as 8 ferramentas (`list_issues`, `read_issue`, `search_context`,
  `create_issue`, `update_issue`, `append_issue_log`, `move_issue_status`,
  `consolidate_issue`), cada uma recebendo `repositoryRoot` explícito e
  delegando para `apps/agent/src/ai-context/index.ts` (`issues.ts`/`mutations.ts`).
- `apps/agent/src/ai-context/mcp/security.ts`: `resolveSafeRepositoryRoot`,
  reaproveitando o mesmo mecanismo de `REPO_ALLOWED_ROOT` já usado em
  `run-repo-command-task.ts` — fora dela, qualquer caminho é aceito (mesmo
  padrão de confiança local já existente no `apps/agent`).
- Script `pnpm --filter agent run mcp:ai-context` para rodar o servidor.
- `docs/09 - ai-context.md` atualizado com a seção "Servidor MCP" (como
  rodar, exemplo de configuração de cliente, nota de segurança).
- Testado de ponta a ponta com um cliente MCP real (`Client` +
  `StdioClientTransport` do próprio SDK, não só chamadas diretas de função):
  `initialize`, `tools/list` (8 ferramentas com JSON Schema correto),
  create → update → append_issue_log → transições válidas → transição
  inválida (`done → consolidated` via `move_issue_status`, rejeitada
  corretamente) → `consolidate_issue` real → `read_issue` confirmando o
  resultado. Testado também o bloqueio de `REPO_ALLOWED_ROOT` contra um
  `repositoryRoot` fora do permitido.
- Esta própria issue foi movida `backlog → ready → doing → review` e logada
  através do servidor MCP real (chamando `move_issue_status`/
  `append_issue_log` via um cliente MCP, não a função TypeScript direto).

# O que falta fazer

- `ISSUE-0006` (interoperabilidade entre edição manual e `mutations.ts`)
  continua em backlog, não foi resolvida antes desta — decisão explícita do
  usuário de seguir direto para o MCP. O risco que ela descreve (campo extra
  de frontmatter sendo descartado) se aplica integralmente às ferramentas de
  escrita expostas aqui.
- Nada além disso planejado para o escopo desta issue.

# Decisões tomadas

- Transporte: stdio, não SSE/HTTP. É o que clientes locais (Claude Code,
  Codex) spawnam diretamente como subprocesso; não exige o Fastify do
  `apps/agent` rodando.
- Onde roda: processo dedicado (`mcp/server.ts`), independente do servidor
  Fastify (`server.ts`) — cada cliente MCP sobe sua própria instância via
  stdio, não é algo "montado" na API HTTP existente.
- Segurança: reaproveitado `REPO_ALLOWED_ROOT` em vez de inventar um modelo
  novo de permissão — consistente com o resto do `apps/agent` e suficiente
  para o uso local pretendido.
- stdout é reservado para o protocolo MCP; qualquer log de diagnóstico vai
  para stderr (`console.error`).

# Critérios de aceite

- [x] Servidor/adapter MCP implementado e documentado.
- [x] `list_issues`, `read_issue`, `search_context` expostos e testados
      contra um `repositoryRoot` real.
- [x] Ferramentas de mutação expostas (`ISSUE-0003` concluída).
- [x] Estratégia de escopo/segurança para `repositoryRoot` definida e
      aplicada (`REPO_ALLOWED_ROOT`, testado).

# Observações

Esta issue era o item "Integração com MCP" listado em "O que falta fazer" de
`ISSUE-0001`, agora desmembrado em issue própria.

# Log de execução

- 2026-06-21: issue registrada em backlog, a partir do desmembramento de
  `ISSUE-0001`.
- 2026-06-21: servidor MCP implementado e testado de ponta a ponta via cliente MCP real (não só chamadas diretas de função); movida para doing via move_issue_status real, através do próprio servidor MCP.
