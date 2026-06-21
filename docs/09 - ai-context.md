# 🧠 AI_context — Memória Operacional Persistente

## 1. Objetivo

Documentar o que existe **hoje, implementado e funcionando** em torno da
camada `AI_context/`: um diretório markdown versionado que serve de memória
operacional para agentes de IA que operam sobre um repositório.

Diferente dos demais documentos desta pasta (`01` a `08`), que descrevem a
**visão de produto** do AI SDLC Platform (em boa parte ainda não
implementada), este documento descreve um sistema concreto, já em uso.

---

## 2. Relação com a visão de produto (e uma ambiguidade de nome a observar)

`02 - domain model.md` e `05 - data model.md` descrevem uma entidade
**Issue** que é um registro em banco de dados, vinculado a `spec_id` e
`requirement_id`, parte do modelo Spec-Driven Development do produto.

`AI_context/issues/*.md` também usa o nome **Issue**, mas é uma entidade
completamente diferente: um arquivo markdown, sem nenhum vínculo com Spec ou
banco de dados, criado para dar memória persistente a agentes que executam
trabalho sobre um repositório (via `apps/agent/src/services/task-runner.ts`).

As duas não são sincronizadas nem se substituem. Um possível mapeamento
entre a Issue de produto (Spec-Driven) e a Issue de `AI_context` (memória de
agente) não está definido e não é, por enquanto, um objetivo — quem precisar
desse cruzamento deve tratá-lo como uma decisão de produto separada, não
assumir equivalência implícita pelo nome.

---

## 3. O que existe hoje (implementado)

Módulo `apps/agent/src/ai-context/`:

- `types.ts` — schemas Zod para `IssueStatus`/`IssuePriority`/`IssueType`/`IssueFrontmatter`.
- `frontmatter.ts` — parser/stringifier de frontmatter markdown (hand-rolled, sem dependência de YAML).
- `templates.ts` — fonte canônica dos templates de issue/consolidated e dos READMEs.
- `scaffold.ts` — `scaffoldAiContext(repositoryRoot)`: materializa a estrutura `AI_context/` em **qualquer** repositório-alvo, de forma idempotente (nunca sobrescreve arquivo existente).
- `issues.ts` — `listIssues`, `readIssue`, `filterIssuesByStatus`, `filterIssuesByPriority`, `searchIssuesByTag`: leitura direta do markdown, sem cache/banco.
- `mutations.ts` — `createIssue`, `updateIssue`, `appendIssueLog`, `moveIssueStatus`, `consolidateIssue`: escrita, com numeração sequencial e validação de transição de status.
- `mcp/server.ts` + `mcp/security.ts` — servidor MCP via stdio que expõe as funções acima como ferramentas (ver seção 4.1).
- `verify.script.ts` — script manual de verificação ponta a ponta.

Toda função pública recebe `repositoryRoot: string` explícito — o mesmo
padrão já usado por `run-repo-analyze-task.ts`/`run-repo-command-task.ts`/
`run-repo-inspect-task.ts`, porque `AI_context` deve poder ser materializado
em qualquer repositório que o agente venha a operar, não só no `ai_sdlc`.

Instância "dogfood": a raiz deste próprio repositório tem seu
[`/AI_context`](../AI_context/README.md), gerado por esse módulo, usado
para rastrear o desenvolvimento do próprio `AI_context`.

---

## 4. Convenção de arquivos

A convenção de estrutura, status/prioridade/tipo permitidos e o fluxo
`Issue → Implementação → Review → Consolidation → Documentation Update`
estão documentados em [`AI_context/README.md`](../AI_context/README.md) —
esse é o documento vivo e autoritativo; não duplicar aqui.

---

## 4.1 Servidor MCP

`apps/agent/src/ai-context/mcp/server.ts` expõe `list_issues`, `read_issue`,
`search_context`, `create_issue`, `update_issue`, `append_issue_log`,
`move_issue_status` e `consolidate_issue` como ferramentas MCP via stdio.

Cada ferramenta recebe `repositoryRoot` explicitamente — o servidor não
assume nenhum diretório fixo, e pode operar sobre qualquer repositório-alvo
em qualquer chamada, não só sobre o `ai_sdlc`.

Rodar manualmente:

```bash
pnpm --filter agent run mcp:ai-context
```

Configuração de cliente (ex. Claude Code, `.mcp.json`):

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "pnpm",
      "args": ["--filter", "agent", "exec", "tsx", "src/ai-context/mcp/server.ts"],
      "cwd": "/caminho/para/ai_sdlc"
    }
  }
}
```

Segurança: se a variável de ambiente `REPO_ALLOWED_ROOT` estiver definida
(mesmo mecanismo já usado por `run-repo-command-task.ts`), toda chamada com
`repositoryRoot` fora dela é rejeitada. Sem a variável, qualquer caminho é
aceito — ambiente local confiável, mesmo padrão já adotado pelo resto do
`apps/agent`.

---

## 5. Decisão: unificação do lifecycle chat → spec → issue → task

A seção 2 deste documento originalmente tratava a Issue de produto (descrita
em `docs/02`/`docs/05`, ligada a `spec_id`/`requirement_id` em banco) como
um conceito **diferente** da Issue do `AI_context`. Essa distinção foi
revista: depois de avaliar o lifecycle completo do produto
(`chat → spec → issue → task`, hoje em boa parte mock — ver
`apps/web/app/definition/page.tsx` e `apps/web/app/execution/page.tsx`),
duas decisões foram tomadas:

1. **Issue é uma só.** Não existe (e não vai existir) uma tabela `issues`
   separada. `AI_context/issues/*.md` é a única fonte — tanto para memória
   de agente quanto para o Kanban de produto. `docs/02`/`docs/05` foram
   atualizados para refletir isso.
2. **Spec também é markdown**, em `AI_context/specs/` (`ISSUE-0007`), pelo
   mesmo motivo: versionamento sai de graça do git, sem precisar de tabela
   nem de `SpecVersion`.

Motivo prático que confirmou a decisão: o mock do Kanban
(`apps/web/app/execution/page.tsx:13-66`) já usa ids `ISSUE-101`,
`ISSUE-102`... com `status`/`priority` quase idênticos ao que
`IssueFrontmatter` já tinha — a intenção original parecia já apontar para
um único conceito.

## 5.1 Roadmap registrado como backlog

O trabalho futuro está registrado como issues reais em `AI_context/issues/`,
não apenas como texto narrativo:

- **ISSUE-0004** — Integração Task ↔ Issue (vincular o sistema de Tasks existente, `apps/agent/src/task-store.ts`, ao `AI_context` do repositório-alvo).
- **ISSUE-0005** — Cache derivado em `AI_context/metadata/*.json`.
- **ISSUE-0006** — Interoperabilidade entre edição manual e `mutations.ts` (safeguards básicas, sem reconciliação, incluindo `importIssue`).
- **ISSUE-0007** — Módulo de Spec persistida no `AI_context` (`AI_context/specs/`).
- **ISSUE-0008** — Vincular Issue a Spec (`spec_id` opcional no frontmatter).
- **ISSUE-0009** — API REST no `apps/agent` para Issues e Specs (consumo pelo `apps/web`).
- **ISSUE-0010** — Conectar `/execution` (Kanban) às Issues reais.
- **ISSUE-0011** — Conectar `/definition` (Spec) à persistência real.
- **ISSUE-0012** — Ativar o chat real (`CopilotPanel`, hoje código morto) na página de definição.
- **ISSUE-0013** — Pesquisa (não implementação): transformação assistida por IA de chat em Spec e de Spec em Issues.

Ordem de dependência recomendada: `0007 → 0008 → 0009 → (0010 e 0011 em
paralelo)`. `ISSUE-0012` é independente (só depende do que já existe) e
pode ser feita em qualquer momento. `ISSUE-0013` só faz sentido depois que
`0007`, `0008` e `0012` existirem de verdade.

`ISSUE-0003` (mutações) e `ISSUE-0002` (MCP) já estão implementadas — ver
seção 3 e 4.1.

---

## 6. Fora de escopo (por ora)

Banco de dados, vector database, embeddings, RAG, IA autônoma, sincronização
externa, GitHub Issues sync. Qualquer um desses pode vir a ser avaliado mais
adiante, mas nenhum está implícito pela existência do `AI_context`.

---

## Frase final

> `AI_context` não é a visão de produto deste repositório — é a memória de
> trabalho que faz qualquer agente, operando sobre qualquer repositório,
> não começar do zero a cada sessão.
