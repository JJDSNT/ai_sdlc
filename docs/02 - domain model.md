# 🧱 Domain Model — AI SDLC Platform

## 1. Objetivo

Este documento define **todas as entidades centrais do sistema**, suas responsabilidades, relações e regras.

Seu objetivo é eliminar ambiguidade e garantir que:

* frontend, backend e IA compartilhem o mesmo modelo mental
* nenhuma entidade seja usada de forma inconsistente
* todas as relações sejam explícitas

---

## 2. Princípio Central

> **Spec é a fonte de verdade única do sistema**

Todas as outras entidades são derivadas ou conectadas à Spec.

---

## 3. Entidades Principais

---

# 🔥 3.1 Spec (Especificação)

## Definição

Representa a definição estruturada do sistema ou funcionalidade.

## Responsabilidade

* descrever comportamento esperado
* definir regras e fluxos
* servir como base para geração de execução

## Estrutura

* título
* descrição
* requisitos
* fluxos
* regras de negócio
* edge cases
* critérios de aceitação
* restrições de segurança
* decisões (ADR)
* versão
* status

## Regras

* toda execução deve estar vinculada a uma spec
* spec incompleta bloqueia execução
* spec é versionada

---

# 🧩 3.2 Requirement (Requisito)

## Definição

Unidade de necessidade funcional ou não funcional dentro da spec.

## Responsabilidade

* representar uma capacidade do sistema
* servir de base para geração de issues

## Regras

* todo requirement pertence a uma spec
* todo requirement deve ter critérios de aceitação
* requirement pode gerar múltiplas issues

---

# 🧠 3.3 Decision (ADR)

## Definição

Registro estruturado de uma decisão técnica ou de produto.

## Responsabilidade

* capturar o “por quê”
* documentar trade-offs
* preservar contexto

## Estrutura

* contexto
* opções
* decisão
* consequências

## Regras

* toda decisão deve estar vinculada a uma spec
* decisões devem ser versionadas ou substituíveis

---

# 🗂️ 3.4 Issue

## Definição

Unidade executável derivada da spec.

## Responsabilidade

* representar trabalho a ser realizado
* conectar definição com execução

## Tipos

* feature
* bug
* task
* spike
* security

## Estrutura

* título
* descrição
* tipo
* prioridade
* status
* spec_id
* requirement_id
* critérios de aceitação
* bloqueios
* origem (spec/IA/manual)

## Regras

* toda issue deve estar vinculada a uma spec
* issue não pode existir sem origem rastreável
* issue só pode ser “done” se critérios forem atendidos

---

# 🏃 3.5 Sprint

## Definição

Container de execução e contexto.

## Responsabilidade

* agrupar issues
* definir foco
* preservar contexto de trabalho

## Estrutura

* nome
* objetivo
* issues
* escopo da spec
* checkpoint
* status

## Regras

* sprint representa um recorte da spec
* sprint não é obrigatória
* sprint deve ter objetivo claro

---

# ⏱️ 3.6 Checkpoint

## Definição

Snapshot do estado de trabalho.

## Responsabilidade

* permitir retomada
* registrar progresso

## Conteúdo

* entidades ativas
* resumo
* próximos passos
* bloqueios

## Regras

* gerado automaticamente ou manualmente
* associado a sessão ou sprint

---

# 📚 3.7 Document

## Definição

Artefato de conhecimento.

## Responsabilidade

* documentar arquitetura
* apoiar entendimento
* facilitar onboarding

## Tipos

* técnico
* funcional
* onboarding
* arquitetura

## Regras

* deve se relacionar com spec, issue ou decisão
* não deve existir isolado

---

# 🧠 3.8 Artifact (Abstração)

## Definição

Representa qualquer entidade relevante do sistema.

## Inclui

* spec
* requirement
* issue
* decision
* document
* sprint

## Uso

* criar relações genéricas
* suportar grafo de conhecimento

---

# 🧾 3.9 Activity (Evento)

## Definição

Registro de qualquer ação no sistema.

## Exemplos

* criação de issue
* geração por IA
* mudança de status
* merge
* atualização de spec

## Regras

* toda ação relevante deve gerar activity
* activity deve indicar origem (humano/IA)

---

# 💻 3.10 Repository

## Definição

Representa o codebase associado ao projeto.

---

# 📁 3.11 FileNode

## Definição

Elemento da árvore de arquivos.

## Tipos

* arquivo
* diretório

---

# 🧠 3.12 FileDocument

## Definição

Representação semântica de um arquivo.

---

# 🔗 3.13 ArtifactFileLink

## Definição

Relação entre artefato e código.

## Exemplos

* issue → arquivo
* spec → implementação
* doc → código

---

# 4. Relações principais

```txt
Spec
 ├── Requirements
 ├── Decisions
 ├── Issues
 ├── Documents
 └── Sprint (escopo)

Issue
 ├── Spec
 ├── Requirement
 ├── Files
 └── Sprint

Sprint
 ├── Issues
 ├── Spec Scope
 └── Checkpoint

File
 ├── Files (dependências)
 └── Artifacts
```

---

# 5. Regras Globais

## Regra 1 — Tudo rastreável

Nenhuma entidade deve existir sem origem.

---

## Regra 2 — Nada fora da spec

Execução deve sempre derivar da spec.

---

## Regra 3 — Relações explícitas

Toda ligação entre entidades deve ser armazenada.

---

## Regra 4 — Versionamento

Spec e decisões devem ser versionadas.

---

## Regra 5 — IA com contexto

IA só pode operar sobre entidades existentes.

---

# 6. Estados principais

## Issue

* backlog
* ready
* doing
* blocked
* done

## Sprint

* planned
* active
* completed

## Spec

* draft
* validated
* active
* deprecated

---

# 7. Anti-patterns

❌ issue sem spec
❌ decisão fora da spec
❌ doc isolado
❌ execução sem critérios
❌ IA criando entidades sem vínculo

---

# 8. Resumo

Este modelo garante que:

* tudo parte da spec
* execução é rastreável
* decisões são preservadas
* código se conecta ao sistema
* IA opera com consistência

---

## Frase final

> O sistema é um grafo de artefatos conectados, com a spec como núcleo e a execução como projeção.
