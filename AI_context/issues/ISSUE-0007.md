---
id: ISSUE-0007
title: Módulo de Spec persistida no AI_context (AI_context/specs/)
status: review
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-22
tags:
  - ai-context
  - spec
related_files:
  - apps/agent/src/ai-context/specs.ts
  - apps/agent/src/ai-context/shared.ts
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/templates.ts
  - apps/agent/src/ai-context/scaffold.ts
  - apps/agent/src/ai-context/mutations.ts
---

# Resumo

Hoje "Spec" só existe como UI mock estática em `apps/web/app/definition/page.tsx`
(`draftInsights`, `formalSpecBlocks`, `validationSignals` — tudo hardcoded,
sem persistência). Esta issue cria o módulo que persiste Spec de verdade,
como markdown versionado em `AI_context/specs/`, no mesmo padrão já usado
para Issue (`apps/agent/src/ai-context/{types,templates,scaffold,issues,mutations}.ts`).

# Problema

A decisão registrada na conversa com o usuário foi: Spec não vira tabela
relacional (como `docs/05 - data model.md` propunha originalmente) — vira
markdown no `AI_context`, pelo mesmo motivo que Issue virou: versionamento
de Spec (exigido pelos docs) sai de graça do git history do próprio
arquivo, sem precisar de uma tabela `SpecVersion` separada, e mantém um
único padrão arquitetural (git-native) em vez de introduzir a primeira
tabela de produto do projeto.

# Objetivo

Estrutura nova, paralela a `issues/`:

```text
AI_context/
└── specs/
    └── SPEC-XXXX.md
```

Frontmatter (`SpecFrontmatter`, novo em `types.ts`):

```yaml
id: SPEC-0001
title:
status: draft   # draft | validated | active | deprecated (docs/02 §3.1)
owner:
created_at:
updated_at:
tags:
  -
```

Corpo, espelhando a estrutura de Spec descrita em `docs/02 - domain model.md`
§3.1 e o que a UI mock de `/definition` já modela como três tipos de bloco
(`draftInsights`, `formalSpecBlocks` com `kind: requirement|constraint|decision|rule|acceptance`,
`validationSignals`):

```text
# Resumo
# Objetivo
# Requisitos
# Regras de negócio
# Edge cases
# Decisões
# Critérios de aceitação
# Restrições de segurança
# Sinais de validação
# Log de execução
```

Módulo novo `apps/agent/src/ai-context/specs.ts` (ou `specs/` como subpasta,
a decidir na implementação) com o mesmo shape de `issues.ts`/`mutations.ts`:
`listSpecs`, `readSpec`, `createSpec`, `updateSpec`, `moveSpecStatus`,
todas recebendo `repositoryRoot` explícito.

# O que foi feito

- `apps/agent/src/ai-context/specs.ts` criado: `listSpecs`, `readSpec`,
  `createSpec`, `updateSpec`, `moveSpecStatus` — mesmo shape de
  `issues.ts`/`mutations.ts`, todas recebendo `repositoryRoot` explícito.
- `nextSequentialId`/`todayIso`/`AiContextMutationError` extraídos de
  `mutations.ts` para `shared.ts` (novo), generalizando o tipo de
  `nextSequentialId` para aceitar qualquer `(dirName, prefix)` — agora com
  2 consumidores (`mutations.ts` para `ISSUE`/`CONSOLIDATED`, `specs.ts`
  para `SPEC`), a extração deixou de ser prematura.
- `SpecStatusSchema`/`SpecFrontmatterSchema`/`Spec` adicionados a `types.ts`.
- `SPEC_TEMPLATE`/`README_SPECS` adicionados a `templates.ts`; `README_MAIN`
  atualizado para mencionar `specs/` na "Estrutura".
- `scaffoldAiContext` agora também cria `AI_context/specs/README.md` e
  `AI_context/templates/spec.template.md`.
- Transições de status de Spec, mais simples que as de Issue (sem
  `consolidated`/`blocked`): `draft → validated → active → deprecated`,
  com volta de `validated`/`active` para `draft` permitida (revisão).
- `verify.script.ts` estendido com smoke test descartável de Spec
  (create/update/transições válidas/transição inválida rejeitada),
  seguindo o mesmo padrão do smoke test de Issue.
- Bug real encontrado e corrigido: `listSpecs` tentava parsear
  `AI_context/specs/README.md` como se fosse uma Spec (mesmo arquivo que o
  scaffold cria dentro do próprio diretório que é listado) — corrigido
  excluindo `README.md` explicitamente do scan.
- Esta própria issue foi movida `backlog → ready → doing → review` via
  `moveIssueStatus`/`appendIssueLog` reais.

# O que falta fazer

- Expor `list_specs`/`read_spec`/`create_spec`/`update_spec` no servidor
  MCP (`ISSUE-0002`) — trabalho futuro natural, fora do escopo desta issue.
- Possibilidade registrada (não decidida) de revisitar o template de Spec
  no futuro para alinhar com o
  [spec-kit do GitHub](https://github.com/github/spec-kit), a pedido do
  usuário — não foi usado como referência nesta implementação.

# Decisões tomadas

- Spec é markdown no `AI_context`, não tabela relacional — decisão tomada
  com o usuário antes desta issue ser registrada (ver `ISSUE-0008`/`ISSUE-0009`
  que dependem disso).
- Reaproveitar ao máximo o padrão já validado para Issue (frontmatter,
  scaffold, numeração sequencial) em vez de desenhar algo novo do zero —
  inclusive extraindo o que passou a ser compartilhado para `shared.ts`.
- Transições de Spec ficam num módulo próprio (`specs.ts`), não em
  `mutations.ts` — a superfície de Spec é pequena o suficiente (5 funções)
  para não justificar a mesma separação read/write que Issue tem.

# Critérios de aceite

- [x] `AI_context/specs/` existe e é criado por `scaffoldAiContext`.
- [x] `createSpec`/`readSpec`/`updateSpec`/`listSpecs`/`moveSpecStatus`
      implementados e exportados de `apps/agent/src/ai-context/index.ts`.
- [x] Numeração sequencial de `SPEC-XXXX` sem colisão, independente da
      numeração de `ISSUE-XXXX`.
- [x] Verificado contra a instância dogfood real, sem mocks (`verify.script.ts`
      estendido).

# Observações

Esta issue nasceu de uma avaliação arquitetural mais ampla: o usuário pediu
para avaliar o lifecycle completo `chat → spec → issue → task` e registrar
as issues necessárias para implementá-lo corretamente. Duas decisões
arquiteturais foram tomadas antes de registrar este lote (`ISSUE-0007` a
`ISSUE-0013`): unificar a Issue de produto com a Issue do `AI_context`
(em vez de uma tabela separada), e persistir Spec também como markdown no
`AI_context` (em vez de tabela relacional).

# Log de execução

- 2026-06-21: issue registrada em backlog, via `createIssue` real
  (dogfooding de `mutations.ts`), como parte do roadmap de unificação do
  lifecycle chat → spec → issue → task.
- 2026-06-22: módulo apps/agent/src/ai-context/specs.ts implementado (createSpec/updateSpec/moveSpecStatus/listSpecs/readSpec); scaffold estendido para criar AI_context/specs/; verify.script.ts estendido e validado contra a instância dogfood; bug real encontrado e corrigido (listSpecs tentava parsear specs/README.md como spec).
