# AI_context

## Objetivo

Esta pasta representa a memória operacional do projeto.

Ela é utilizada por agentes para:

- planejamento
- execução
- rastreamento
- consolidação de conhecimento

## Fluxo

```text
Issue
 ↓
Implementação
 ↓
Review
 ↓
Consolidation
 ↓
Documentation Update
```

## Estrutura

- `issues/` — trabalho ativo. Documentos vivos, modificáveis pelos agentes.
- `consolidated/` — conhecimento estabilizado. Ver `consolidated/README.md`
  para a regra de promoção.
- `templates/` — modelos para novas issues e entradas consolidadas.
- `metadata/` — reservado para uma futura view derivada/cacheada (não
  populado nesta fase; leitura é feita diretamente do frontmatter dos
  arquivos markdown).

## Status permitidos

`backlog`, `ready`, `doing`, `review`, `done`, `consolidated`, `blocked`

## Prioridades

`low`, `medium`, `high`, `critical`

## Tipos

`feature`, `bug`, `refactor`, `research`, `docs`, `infra`
