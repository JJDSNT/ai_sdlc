# 🖥️ Frontend Architecture — AI SDLC Platform

## 1. Objetivo

Definir a arquitetura do frontend, incluindo:

* telas e responsabilidades
* componentes principais
* estrutura de navegação
* padrões de interação
* integração com IA

Este documento garante consistência visual e funcional.

---

## 2. Princípios de UX

### 2.1 Workspace-first (não chat-first)

O sistema é um ambiente de trabalho, não um chat.

---

### 2.2 Contextual AI

A IA atua sobre o que está visível.

---

### 2.3 Baixa navegação

Evitar troca constante de telas.

---

### 2.4 Continuidade

Usuário sempre sabe:

* onde está
* o que fez
* o que fazer

---

### 2.5 Ação > conversa

Preferir botões e ações a prompts livres.

---

## 3. Estrutura de Navegação

```txt
Projeto
├── Overview
├── Definition
├── Execution
├── Knowledge
├── Activity
└── Settings
```

---

## 4. Telas Principais

---

# 🏠 4.1 Overview

## Papel

Centro de comando do projeto.

## Mostra

* resumo da spec
* sprint atual
* progresso
* impedimentos
* atividades recentes
* próximos passos

## Componentes

* ProjectHeader
* SprintHealthCard
* ProgressCards
* PendingActions
* ActivityFeed
* QuickActions

## Ações

* continuar trabalho
* abrir spec
* abrir execução

---

# 🧠 4.2 Definition (Spec Workspace)

## Papel

Editar e visualizar a spec.

## Estrutura interna (tabs)

* Discovery
* Requirements
* Spec
* Decisions

## Componentes

* SpecEditor
* RequirementList
* DecisionBlocks
* OutlineSidebar
* ArtifactRelationsPanel

## Ações

* gerar requisitos
* gerar spec
* validar spec
* criar decisão
* detectar lacunas

## IA

* transformação de conteúdo
* validação
* sugestões

---

# 🗂️ 4.3 Execution

## Papel

Gerenciar execução.

## Modos

* Backlog
* Board (Kanban)
* Sprint
* Blocked

---

## Componentes principais

### IssueBoard

* colunas
* drag & drop

### IssueList

* backlog
* priorização

### IssueCard

* título
* status
* prioridade
* bloqueios
* vínculos

### IssueDrawer

* detalhes completos
* edição

---

## Sprint UI

* SprintProgressBar
* SprintHealthCard
* SprintGoal
* SprintIssues

---

## Indicadores

* WIP
* bloqueios
* retrabalho
* fluxo

---

## Ações

* criar issue
* mover issue
* priorizar
* marcar bloqueio
* adicionar à sprint

---

## IA

* gerar issues
* decompor tarefas
* sugerir prioridade
* detectar gargalos

---

# 📚 4.4 Knowledge

## Papel

Memória do projeto.

## Componentes

* DocumentTree
* DocumentEditor
* BacklinksPanel
* RelatedArtifacts

---

## Conteúdo

* docs técnicos
* arquitetura
* decisões
* onboarding

---

# 📜 4.5 Activity

## Papel

Rastreabilidade.

## Componentes

* Timeline
* ActivityItem
* Filters
* DiffViewer

---

## Mostra

* ações do usuário
* ações da IA
* mudanças no sistema
* eventos de código

---

# ⚙️ 4.6 Settings

## Papel

Configuração do sistema.

## Seções

* Projeto
* Workflow (Git/CI/CD)
* IA
* Qualidade
* Segurança

---

## 5. Componentes Globais

---

### AppShell

* sidebar
* header
* navegação

---

### CopilotPanel

* lateral fixa
* ações contextuais
* sugestões

---

### CommandPalette

* navegação rápida
* ações globais

---

### GlobalSearch

* busca em:

  * docs
  * issues
  * spec

---

### ContextBar

Mostra:

* projeto atual
* sprint atual
* entidade ativa

---

### UniversalDrawer

Abre:

* issue
* doc
* spec
* evento

---

### Notifications

* eventos importantes
* alertas
* IA

---

## 6. Estrutura de Pastas (Next.js)

```txt
apps/web/src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── copilot/
├── features/
│   ├── overview/
│   ├── definition/
│   ├── execution/
│   ├── knowledge/
│   ├── activity/
│   ├── settings/
├── lib/
│   ├── api/
│   ├── copilot/
│   ├── utils/
├── hooks/
├── types/
```

---

## 7. Estado da Aplicação

Separar em:

### Server state

* projetos
* spec
* issues
* sprints

### Client state

* UI
* seleção
* filtros
* modais

---

## 8. Integração com IA

IA deve:

* operar sobre contexto atual
* receber:

  * entidade ativa
  * sprint
  * histórico recente

---

## Padrões

* ações explícitas (botões)
* feedback visual imediato
* rastreabilidade

---

## 9. Padrões de Interação

### Inline actions

ações diretamente no conteúdo

---

### Context-aware suggestions

IA sugere com base na tela

---

### Progressive disclosure

mostrar complexidade sob demanda

---

## 10. Responsabilidade por Tela

| Tela       | Responsabilidade |
| ---------- | ---------------- |
| Overview   | orientação       |
| Definition | edição da spec   |
| Execution  | execução         |
| Knowledge  | memória          |
| Activity   | rastreabilidade  |
| Settings   | configuração     |

---

## 11. Anti-patterns

❌ chat como interface principal
❌ telas isoladas
❌ navegação excessiva
❌ IA sem contexto
❌ estado duplicado

---

## 12. Resumo

O frontend é um conjunto de workspaces conectados, onde:

* Definition cria a realidade
* Execution opera sobre ela
* Knowledge preserva
* Activity explica
* Overview orienta

---

## Frase final

> O frontend é a superfície onde a spec se transforma em ação, com a IA operando diretamente sobre o contexto do usuário.
