---
id: ISSUE-0008
title: Vincular Issue a Spec (spec_id opcional no frontmatter)
status: review
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-22
tags:
  - ai-context
  - spec
  - issue
related_files:
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/mutations.ts
---

# Resumo

Adicionar um campo opcional `spec_id` ao frontmatter de Issue, permitindo
rastrear de qual Spec (`ISSUE-0007`) uma issue derivou — sem tornar isso
obrigatório, porque issues de memória de agente (como `ISSUE-0001` a
`ISSUE-0006`, este próprio lote) não nascem de nenhuma Spec.

# Problema

`docs/02 - domain model.md` §3.4 e §5 (Regra 2 — "Nada fora da spec")
descrevem que toda issue de produto deveria estar vinculada a uma spec.
Isso é correto para issues que vêm de uma Spec formal, mas a Issue do
`AI_context`, depois de unificada (decisão tomada no roadmap desta etapa),
também é usada como memória operacional de agente para trabalho que nunca
passa por uma Spec. Tornar `spec_id` obrigatório quebraria esse uso.

# Objetivo

- `IssueFrontmatterSchema` (`types.ts`) ganha `spec_id: z.string().optional()`.
- `createIssue`/`updateIssue` (`mutations.ts`) aceitam `spec_id` no input,
  sem validar que a Spec referenciada existe (ver "Fora de escopo").
- `listIssues`/futuras funções de filtro ganham a possibilidade de filtrar
  por `spec_id`, viabilizando "ver todas as issues de uma Spec".

# O que foi feito

- `spec_id: z.string().optional()` adicionado a `IssueFrontmatterSchema`
  (`types.ts`).
- `createIssue`/`UpdateIssuePatch` (`mutations.ts`) aceitam `spec_id` no
  input. `frontmatterToRecord` só grava a chave quando `spec_id` é truthy
  — nunca persiste a string literal `"undefined"` no markdown.
- `filterIssuesBySpec(repositoryRoot, specId)` adicionado a `issues.ts`,
  mesmo padrão de `filterIssuesByStatus`/`filterIssuesByPriority`.
- `ISSUE_TEMPLATE` (`templates.ts`) ganhou a linha `spec_id:` para
  descoberta ao criar issues manualmente a partir do template.
- `mcp/server.ts`: `create_issue` e `update_issue` ganharam
  `spec_id: z.string().optional()` no `inputSchema`, mantendo o contrato
  MCP em paridade com `mutations.ts`.
- `verify.script.ts`: novo smoke test dedicado — cria Spec + Issue já
  vinculada, relê do disco, aplica uma mutation que não toca em `spec_id`
  (`appendIssueLog`) e confirma que o vínculo sobrevive, confirma
  `filterIssuesBySpec`, e testa explicitamente que `updateIssue` com
  `spec_id: undefined` desvincula. Rodado com sucesso contra a instância
  real (`/home/jaime/ai_sdlc`), sem regressão nos smoke tests existentes
  de Issue/Spec.
- `pnpm --filter agent typecheck`: os erros pré-existentes em
  `task-runner.ts`/`task-store.ts`/etc. (área legada, não tocada por esta
  issue) foram confirmados como já presentes antes desta mudança (`git
  stash` + typecheck reproduz os mesmos erros) — nenhuma regressão
  introduzida pelo módulo `ai-context`.

# O que falta fazer

Nada pendente para o escopo desta issue.

# Decisões tomadas

- `spec_id` é opcional, nunca obrigatório — diverge deliberadamente da
  regra "toda issue pertence a uma spec" dos docs originais, porque essa
  regra valia para um mundo sem Issues de memória de agente.
- Vínculo unidirecional (Issue → Spec), sem `related_issues` no lado da
  Spec: evita manter duas listas sincronizadas. Quem quiser "issues de
  uma spec" usa `filterIssuesBySpec(repositoryRoot, specId)`.

# Fora de escopo

- Não validar que `spec_id` referencia uma Spec que de fato existe — isso
  seria integridade referencial, que normalmente uma FK de banco daria de
  graça, mas estamos em arquivos markdown sem banco. Uma referência
  pendurada (Spec deletada, id digitado errado) não quebra nada, só não
  resolve em lugar nenhum. Aceitável para esta fase.

# Critérios de aceite

- [x] `spec_id` opcional no schema, com round-trip testado (criar issue
      com `spec_id`, ler de volta, confirmar que sobrevive a uma mutation
      subsequente).
- [x] `createIssue`/`updateIssue` aceitam o campo.
- [x] Alguma forma de listar issues de uma Spec específica.

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task
(ver `ISSUE-0007`, `ISSUE-0009` a `ISSUE-0013`).

# Log de execução

- 2026-06-21: issue registrada em backlog.
- 2026-06-22: movida para ready: dependências (ISSUE-0007) satisfeitas.
- 2026-06-22: iniciada implementação.
- 2026-06-22: implementação concluída: schema, mutations, filterIssuesBySpec, template, MCP server, smoke test dedicado e regressão completa via verify.script.ts. Movida para review.
