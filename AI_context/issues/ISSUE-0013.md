---
id: ISSUE-0013
title: Pesquisa: transformação assistida por IA de chat em Spec e de Spec em Issues
status: backlog
priority: low
type: research
owner: agent
created_at: 2026-06-21
updated_at: 2026-06-21
tags:
  - ai-context
  - ai-behavior
  - research
related_files:
  - docs/03 - workflow.md
  - docs/06 - AI copilot.md
---

# Resumo

A última peça do lifecycle `chat → spec → issue → task` é a transformação
em si: pegar uma conversa real (`ISSUE-0012`) e virar uma Spec formal
(`ISSUE-0007`), e pegar uma Spec e decompor em Issues (`ISSUE-0008`/§4.3 de
`docs/03 - workflow.md`). Isso é comportamento de IA, não só persistência —
por isso é `type: research`, não `feature`: não tem escopo fechado ainda.

# Problema

`docs/06 - AI copilot.md` já descreve o papel esperado da IA aqui
("Transformadora": ideia → requisitos → spec → issues, §3.1) e os limites
("IA não deve criar issues sem vínculo com requirement/spec", §13.2). Mas
isso é visão de produto — não há prompt, contrato de entrada/saída, nem
decisão de quando a transformação dispara (automática a cada mensagem?
sob comando explícito do usuário? ao fechar a conversa?).

# Objetivo

Não implementar nesta issue. Objetivo é só explorar e decidir:

- Gatilho: usuário pede explicitamente ("formalizar spec"), ou a IA
  sugere quando percebe que a conversa estabilizou?
- Quanto da Spec a IA preenche sozinha vs. quanto fica como rascunho para
  revisão humana (`docs/06` §9 sugere "Drafting + Assisted Action" como
  comportamento padrão inicial — isso provavelmente vale aqui também).
- Mesma pergunta para Spec → Issues: a IA decompõe tudo de uma vez, ou
  sugere e o usuário aprova cada issue antes de `createIssue` ser chamado
  de fato?

# O que foi feito

Nada ainda — issue em `backlog`, propositalmente sem solução pré-definida.

# O que falta fazer

- Tudo — esta é a issue mais aberta do lote. Depende de `ISSUE-0007`,
  `ISSUE-0008` e `ISSUE-0012` estarem implementadas antes de fazer sentido
  prototipar qualquer coisa aqui.
- Quando for retomada, considerar decompor em issues mais concretas (uma
  para chat→spec, outra para spec→issues) em vez de manter como um único
  research guarda-chuva.

# Decisões tomadas

Nenhuma — issue de pesquisa, não de implementação.

# Critérios de aceite

- [ ] Gatilho de transformação decidido (automático vs. explícito).
- [ ] Nível de autonomia da IA decidido (rascunho vs. aplicação direta),
      alinhado com `docs/06 - AI copilot.md` §9.
- [ ] Escopo dividido em issues concretas de implementação, se/quando
      avançar.

# Observações

Prioridade `low` de propósito — é a parte do roadmap mais dependente de
julgamento de produto (não técnico) e mais arriscada de over-engineering
se atacada cedo demais, antes de `ISSUE-0007`/`ISSUE-0008`/`ISSUE-0012`
existirem de verdade para se ter algo real para transformar.

# Log de execução

- 2026-06-21: issue registrada em backlog.
