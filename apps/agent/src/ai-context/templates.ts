//apps/agent/src/ai-context/templates.ts

// Fonte canônica do conteúdo do AI_context. scaffoldAiContext() grava estas
// constantes, verbatim, em qualquer repositoryRoot — instâncias em disco
// (incluindo a do próprio ai_sdlc) são cópias geradas, não a fonte da verdade.

export const README_MAIN = `# AI_context

## Objetivo

Esta pasta representa a memória operacional do projeto.

Ela é utilizada por agentes para:

- planejamento
- execução
- rastreamento
- consolidação de conhecimento

## Fluxo

\`\`\`text
Issue
 ↓
Implementação
 ↓
Review
 ↓
Consolidation
 ↓
Documentation Update
\`\`\`

## Estrutura

- \`issues/\` — trabalho ativo. Documentos vivos, modificáveis pelos agentes.
- \`consolidated/\` — conhecimento estabilizado. Ver \`consolidated/README.md\`
  para a regra de promoção.
- \`templates/\` — modelos para novas issues e entradas consolidadas.
- \`metadata/\` — reservado para uma futura view derivada/cacheada (não
  populado nesta fase; leitura é feita diretamente do frontmatter dos
  arquivos markdown).

## Status permitidos

\`backlog\`, \`ready\`, \`doing\`, \`review\`, \`done\`, \`consolidated\`, \`blocked\`

## Prioridades

\`low\`, \`medium\`, \`high\`, \`critical\`

## Tipos

\`feature\`, \`bug\`, \`refactor\`, \`research\`, \`docs\`, \`infra\`
`;

export const README_CONSOLIDATED = `# AI_context/consolidated

## Regra

Nenhuma issue pode ser movida para consolidated sem:

- implementação concluída
- documentação atualizada
- critérios de aceite satisfeitos

## Objetivo

Transformar trabalho concluído em conhecimento permanente.
`;

export const README_METADATA = `# AI_context/metadata

Reservado para uma futura view derivada/cacheada (ex.: \`status.json\`,
\`kanban.json\`, \`tags.json\`).

Nesta fase, a leitura é feita diretamente do frontmatter dos arquivos em
\`AI_context/issues/*.md\` — nenhum arquivo aqui é gerado ou consumido ainda.
`;

export const ISSUE_TEMPLATE = `---
id: ISSUE-XXXX
title:
status: backlog
priority: medium
type: feature
owner: agent
created_at:
updated_at:
tags:
  -
related_files:
  -
---

# Resumo

Breve descrição da issue.

# Problema

Descrição detalhada.

# Objetivo

Resultado esperado.

# O que foi feito

Lista de implementações realizadas.

# O que falta fazer

Pendências.

# Decisões tomadas

Registro arquitetural.

# Critérios de aceite

Checklist.

# Observações

Notas adicionais.

# Log de execução

Registro cronológico.
`;

export const CONSOLIDATED_TEMPLATE = `# Título

Resumo da funcionalidade.

# Motivação

Por que foi criada.

# Solução adotada

Descrição final.

# Arquivos alterados

Lista.

# Impacto arquitetural

Descrição.

# Documentações atualizadas

Lista.

# Próximos passos

Itens futuros.
`;
