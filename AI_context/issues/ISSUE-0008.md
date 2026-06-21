---
id: ISSUE-0008
title: Vincular Issue a Spec (spec_id opcional no frontmatter)
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
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

Nada ainda — issue em `backlog`.

# O que falta fazer

- Depende de `ISSUE-0007` (módulo de Spec) existir antes de fazer sentido
  de verdade, mesmo que o campo em si seja só uma string.
- Decidir se vale a pena também guardar, no lado da Spec, uma lista de
  `related_issues` (mão dupla) ou se basta a referência unidirecional
  Issue → Spec (mais simples, evita manter duas listas sincronizadas).
  Recomendação: só unidirecional por agora — quem quiser "issues de uma
  spec" usa `filterIssuesBySpec(repositoryRoot, specId)`, sem precisar de
  estado duplicado na Spec.

# Decisões tomadas

- `spec_id` é opcional, nunca obrigatório — diverge deliberadamente da
  regra "toda issue pertence a uma spec" dos docs originais, porque essa
  regra valia para um mundo sem Issues de memória de agente.

# Fora de escopo

- Não validar que `spec_id` referencia uma Spec que de fato existe — isso
  seria integridade referencial, que normalmente uma FK de banco daria de
  graça, mas estamos em arquivos markdown sem banco. Uma referência
  pendurada (Spec deletada, id digitado errado) não quebra nada, só não
  resolve em lugar nenhum. Aceitável para esta fase.

# Critérios de aceite

- [ ] `spec_id` opcional no schema, com round-trip testado (criar issue
      com `spec_id`, ler de volta, confirmar que sobrevive a uma mutation
      subsequente).
- [ ] `createIssue`/`updateIssue` aceitam o campo.
- [ ] Alguma forma de listar issues de uma Spec específica.

# Observações

Parte do roadmap de unificação do lifecycle chat → spec → issue → task
(ver `ISSUE-0007`, `ISSUE-0009` a `ISSUE-0013`).

# Log de execução

- 2026-06-21: issue registrada em backlog.
