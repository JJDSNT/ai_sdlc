---
id: ISSUE-0002
title: Camada MCP sobre o AI_context
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - mcp
related_files:
  - apps/agent/src/ai-context/issues.ts
  - apps/agent/src/ai-context/scaffold.ts
  - apps/agent/src/ai-context/index.ts
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

E, depois que `ISSUE-0003` (mutações) estiver concluída, as ferramentas de
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

Nada ainda — issue em `backlog`.

# O que falta fazer

- Decidir o transporte MCP (stdio vs SSE/HTTP) e onde o servidor MCP roda
  (processo dedicado, ou exposto a partir de `apps/agent`).
- Mapear 1:1 cada função de `apps/agent/src/ai-context/issues.ts` para uma
  definição de ferramenta MCP (nome, schema de input/output).
- Aguardar `ISSUE-0003` para expor as ferramentas de mutação; até então,
  expor apenas as de leitura.
- Definir estratégia de autenticação/escopo (quais repositórios um cliente
  MCP pode acessar) — hoje `repositoryRoot` é um parâmetro livre, o que pode
  ser um risco de acesso a caminhos arbitrários do disco.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Servidor/adapter MCP implementado e documentado.
- [ ] `list_issues`, `read_issue`, `search_context` expostos e testados
      contra um `repositoryRoot` real.
- [ ] Ferramentas de mutação expostas após `ISSUE-0003` concluída.
- [ ] Estratégia de escopo/segurança para `repositoryRoot` definida e
      aplicada.

# Observações

Esta issue era o item "Integração com MCP" listado em "O que falta fazer" de
`ISSUE-0001`, agora desmembrado em issue própria.

# Log de execução

- 2026-06-21: issue registrada em backlog, a partir do desmembramento de
  `ISSUE-0001`.
