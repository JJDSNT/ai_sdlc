---
id: ISSUE-0007
title: Módulo de Spec persistida no AI_context (AI_context/specs/)
status: backlog
priority: high
type: feature
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - spec
related_files:
  - apps/agent/src/ai-context/types.ts
  - apps/agent/src/ai-context/templates.ts
  - apps/agent/src/ai-context/scaffold.ts
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

Nada ainda — issue em `backlog`.

# O que falta fazer

- Decidir se `specs.ts` reaproveita `frontmatter.ts`/`parseFrontmatter`
  tal como está (deveria — o formato é o mesmo, flat YAML) ou se precisa de
  ajuste para os blocos tipados de Spec.
- Decidir id sequencial: reaproveitar a mesma função `nextSequentialId` de
  `mutations.ts`, generalizada para aceitar `(dirName, prefix)` quaisquer
  (hoje é só `issues`/`ISSUE` e `consolidated`/`CONSOLIDATED` — extender
  para `specs`/`SPEC`, não duplicar lógica).
- `scaffoldAiContext` precisa passar a criar `AI_context/specs/` também,
  com um README curto explicando o que vai lá (mesmo padrão de
  `issues/`/`consolidated/`).
- Depois que este módulo existir, expor `list_specs`/`read_spec`/
  `create_spec`/`update_spec` no servidor MCP (`ISSUE-0002`) é trabalho
  futuro natural — não está no escopo desta issue, só registrando a nota.

# Decisões tomadas

- Spec é markdown no `AI_context`, não tabela relacional — decisão tomada
  com o usuário antes desta issue ser registrada (ver `ISSUE-0008`/`ISSUE-0009`
  que dependem disso).
- Reaproveitar ao máximo o padrão já validado para Issue (frontmatter,
  scaffold, numeração sequencial) em vez de desenhar algo novo do zero.

# Critérios de aceite

- [ ] `AI_context/specs/` existe e é criado por `scaffoldAiContext`.
- [ ] `createSpec`/`readSpec`/`updateSpec`/`listSpecs`/`moveSpecStatus`
      implementados e exportados de `apps/agent/src/ai-context/index.ts`.
- [ ] Numeração sequencial de `SPEC-XXXX` sem colisão, independente da
      numeração de `ISSUE-XXXX`.
- [ ] Verificado contra a instância dogfood real, sem mocks (estender
      `verify.script.ts` ou criar um equivalente).

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
