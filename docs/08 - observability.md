# 📊 Metrics & Observability — AI SDLC Platform

## 1. Objetivo

Definir como o sistema:

* mede progresso
* detecta problemas
* avalia qualidade
* monitora uso da IA
* suporta decisões de melhoria contínua

---

## 2. Princípio Central

> O sistema deve ser **observável por padrão**, permitindo entender o que está acontecendo sem depender de interpretação manual.

---

## 3. Tipos de Métricas

O sistema trabalha com 4 categorias:

```txt
Execução
Qualidade
IA
Sistema
```

---

# 4. Métricas de Execução

---

## 4.1 Progresso da Sprint

```txt
progress = issues_done / total_issues
```

## Uso

* barra de progresso
* acompanhamento de sprint

---

## 4.2 WIP (Work in Progress)

```txt
wip = issues_in_doing
```

## Uso

* detectar sobrecarga
* identificar gargalos

---

## 4.3 Taxa de Bloqueio

```txt
blocked_rate = issues_blocked / total_issues
```

## Uso

* identificar impedimentos
* detectar dependências mal resolvidas

---

## 4.4 Throughput

```txt
throughput = issues_done / período
```

## Uso

* medir produtividade real
* comparar ciclos

---

## 4.5 Lead Time

Tempo entre criação e conclusão da issue

---

## 4.6 Cycle Time

Tempo em estado "doing"

---

# 5. Métricas de Qualidade

---

## 5.1 Retrabalho

```txt
rework_rate = reopened_issues / total_issues
```

## Uso

* detectar baixa qualidade
* identificar falhas na spec

---

## 5.2 Cobertura de Spec

```txt
coverage = issues_linked_to_requirements / total_requirements
```

## Uso

* detectar requisitos não implementados

---

## 5.3 Consistência Spec ↔ Execução

Indicador baseado em:

* issues sem requirement
* requisitos sem issues
* conflitos detectados

---

## 5.4 Qualidade de Definição

Checklist:

* spec tem critérios?
* tem edge cases?
* tem decisões registradas?

---

## 5.5 Drift Spec ↔ Code (futuro)

Indicador de desalinhamento entre:

* o que foi definido
* o que foi implementado

---

# 6. Métricas de IA

---

## 6.1 Uso de Tokens

```txt
tokens_total = sum(token_input + token_output)
```

---

## 6.2 Tokens por Sprint

```txt
tokens_sprint = sum(tokens durante sprint)
```

---

## 6.3 Eficiência de IA

```txt
efficiency = artefatos_gerados / tokens_usados
```

---

## 6.4 Ações por Tipo

Distribuição de:

* geração
* validação
* auditoria
* assistência

---

## 6.5 Taxa de Aceitação

```txt
acceptance_rate = ações_aprovadas / ações_sugeridas
```

---

## 6.6 Retrabalho causado por IA

```txt
ai_rework = issues_reopened_com_origem_ai
```

---

# 7. Métricas de Sistema

---

## 7.1 Atividade

* número de ações por período
* uso por sessão

---

## 7.2 Continuidade

* número de sessões
* frequência de checkpoints
* tempo de retomada

---

## 7.3 Engajamento

* ações por sessão
* uso da IA
* interação com artefatos

---

## 7.4 Complexidade do Projeto

* número de specs
* número de issues
* número de documentos
* tamanho do codebase

---

# 8. Indicadores Compostos

---

## 8.1 Health da Sprint

Baseado em:

* progresso
* bloqueios
* retrabalho
* WIP

Resultado:

* saudável
* atenção
* crítico

---

## 8.2 Risco de Handoff

Baseado em:

* ausência de checkpoint
* alta complexidade
* baixo progresso
* alto número de bloqueios

---

## 8.3 Qualidade Geral

Combina:

* retrabalho
* cobertura de spec
* consistência
* validação

---

## 8.4 Eficiência da IA

Combina:

* tokens
* impacto real
* aceitação
* retrabalho

---

# 9. Observabilidade

---

## 9.1 Activity Feed

Mostra:

* tudo que aconteceu
* ações humanas
* ações da IA
* mudanças no sistema

---

## 9.2 Timeline

Linha do tempo com:

* eventos
* mudanças de estado
* evolução do projeto

---

## 9.3 Diff & Histórico

Permite ver:

* mudanças na spec
* mudanças em issues
* evolução de decisões

---

## 9.4 Logs de IA

Permite ver:

* ações executadas
* contexto usado
* resultado
* tokens

---

# 10. Alertas

---

## 10.1 Tipos de alerta

* bloqueio elevado
* retrabalho alto
* sprint atrasada
* ausência de checkpoint
* uso excessivo de tokens
* inconsistência entre spec e execução

---

## 10.2 Requisitos

Alertas devem:

* ser acionáveis
* indicar causa provável
* sugerir ação

---

# 11. Visualização no Frontend

---

## Overview

* progresso
* health
* alertas
* próximos passos

---

## Execution

* WIP
* bloqueios
* fluxo
* retrabalho

---

## Sprint

* barra de progresso
* métricas da sprint
* indicadores de risco

---

## Activity

* timeline
* eventos
* histórico

---

## Settings

* configuração de métricas
* limites de alerta

---

# 12. Frequência de Cálculo

---

## Tempo real

* progresso
* WIP
* bloqueios

---

## Periódico

* eficiência da IA
* qualidade
* métricas compostas

---

## Sob demanda

* relatórios
* auditorias

---

# 13. Armazenamento

---

## SprintMetric

* métricas por sprint

## ProjectMetric

* métricas agregadas

## AIActionLog

* base para métricas de IA

## ActivityEvent

* base para métricas de sistema

---

# 14. Anti-patterns

❌ medir tudo sem usar
❌ métricas sem ação
❌ métricas invisíveis
❌ depender só de percepção
❌ ignorar métricas de IA

---

# 15. Objetivo Final

Permitir que o sistema:

* identifique problemas cedo
* otimize execução
* reduza retrabalho
* aumente eficiência da IA
* suporte decisões melhores

---

## Frase final

> Métricas não existem para relatar o passado, mas para orientar as próximas ações do sistema e do usuário.
