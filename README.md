# 🤖 AI SDLC Platform (Spec-Driven Development)

Uma plataforma de engenharia de software de ponta a ponta, onde o **Desenvolvimento Orientado a Spec (SDD)** é o paradigma central. O sistema atua como um **"Spec Operating System"**, transformando especificações estruturadas em software executável com rastreabilidade total e auxílio de IA operacional.

---

## 🎯 O Coração do Projeto: Spec-Driven Development (SDD)

Diferente do desenvolvimento tradicional, aqui a **Spec (Especificação)** não é apenas um documento estático, mas a fonte viva de verdade que orquestra todo o ciclo de vida:

1.  **Spec-First:** Nada é desenvolvido ou alterado sem que a especificação seja atualizada primeiro.
2.  **Transformação Automatizada:** A IA consome a Spec para gerar artefatos (issues, testes, documentação).
3.  **Sincronia Total:** Qualquer desvio entre a implementação e a Spec é identificado como um "drift" de conhecimento.

---

## 🚀 Visão Geral

A plataforma resolve o problema da fragmentação de ferramentas e perda de contexto através de:

- **Contexto Contínuo:** Manutenção do estado do projeto e histórico de decisões entre sessões de trabalho.
- **IA Operacional:** Agentes que não apenas conversam, mas executam ações sobre a codebase e infraestrutura.
- **Rastreabilidade Bidirecional:** Conexão direta entre `Spec ↔ Issue ↔ Código ↔ Decisão ↔ Documento`.

---

## 🛠️ Stack Tecnológica

- **Monorepo:** [pnpm Workspaces](https://pnpm.io/workspaces)
- **Frontend:** [Next.js 15+](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend:** [Fastify](https://www.fastify.io/) (TypeScript)
- **Banco de Dados:** SQLite via [LibSQL](https://turso.tech/libsql) & [Drizzle ORM](https://orm.drizzle.team/)
- **IA Engine:** [CopilotKit](https://www.copilotkit.ai/) integrado com agentes customizados.
- **Runtime de Execução:** [OpenCode](https://github.com/google/opencode) para execução segura de tarefas de codificação.

---

## 🏗️ Arquitetura do Projeto

```text
ai_sdlc/
├── apps/
│   ├── agent/          # Backend (Lógica de Agentes, Task Runner, Persistência)
│   └── web/            # Frontend (Dashboard, Kanban, Knowledge Base, Copilot UI)
├── packages/
│   ├── shared/         # Contratos, tipagens e esquemas Zod compartilhados
│   └── tasks/          # Motores de execução para diferentes tipos de tarefas de IA
├── docs/               # Documentação detalhada do domínio e sistema
└── workspaces/         # Sandboxes temporários para execução de código pelos agentes
```

---

## 🚦 Primeiros Passos

### Pré-requisitos
- Node.js (v20+)
- pnpm (v10+)
- [OpenCode CLI](https://github.com/google/opencode)

### Instalação e Setup

```bash
# Instalar dependências
pnpm install

# Inicializar banco de dados e sementes (seed)
pnpm db:init

# Iniciar ambiente de desenvolvimento (Web, Agent e OpenCode)
pnpm dev
```

Acessos:
- **Web App:** `http://localhost:3000`
- **Agent API:** `http://localhost:3001`

---

## 🌟 Funcionalidades de Destaque

- [x] **Gestão de Spec Dinâmica:** Definição estruturada de requisitos que evolui com o projeto.
- [x] **Knowledge Base (Documentação Viva):** Geração automática de documentação técnica vinculada diretamente aos artefatos (código, specs e decisões).
- [x] **Geração de Issues Inteligente:** Decomposição de requisitos complexos em tarefas acionáveis e rastreáveis.
- [x] **Activity Timeline:** Histórico completo de quem (humano ou IA), quando e por que cada mudança ocorreu.
- [x] **Session Checkpoints:** Salva o estado mental da sessão para que o desenvolvedor ou a IA possam retomar o trabalho instantaneamente sem perda de contexto.
- [x] **Sprint Health:** Monitoramento em tempo real da saúde da entrega baseado no alinhamento com a Spec original.

---

## 📖 Aprofundamento

Para entender os detalhes técnicos e filosóficos, consulte:
- [01-visao.md](docs/01-visao.md) - Visão estratégica e princípios.
- [03-workflow.md](docs/03-workflow.md) - O ciclo de vida do SDD na prática.
- [06-AI-copilot.md](docs/06%20-%20AI%20copilot.md) - Como a IA opera sobre o contexto.
