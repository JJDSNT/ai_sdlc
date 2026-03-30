# 🤖 AI & Copilot Behavior — AI SDLC Platform

## 1. Objetivo

Definir de forma explícita:

* o papel da IA no sistema
* o que ela pode fazer
* o que ela não pode fazer
* como ela recebe contexto
* como suas ações devem ser registradas
* como sua atuação se integra ao fluxo Spec-Driven

Este documento existe para garantir que a IA seja **útil, previsível, rastreável e segura**.

---

## 2. Princípio Central

> A IA não é a fonte de verdade.
> A **Spec é a fonte de verdade**.
> A IA atua como **motor de transformação, validação, assistência e auditoria** sobre artefatos reais do sistema.

---

## 3. Papéis da IA

A IA pode operar em quatro papéis principais.

---

# 3.1 Transformadora

## Função

Converter um artefato em outro.

## Exemplos

* ideia → requisitos
* requisitos → spec
* spec → issues
* spec → critérios de aceitação
* spec → documentação
* atividade → checkpoint
* guardrails → configuração técnica

## Regra

Toda transformação deve:

* ter origem rastreável
* indicar artefato de entrada
* registrar artefato de saída
* gerar evento no sistema

---

# 3.2 Validadora

## Função

Verificar consistência, completude e qualidade.

## Exemplos

* detectar lacunas na spec
* verificar se issue cobre requirement
* validar critérios de aceitação
* apontar conflitos entre decisões
* detectar drift entre spec e implementação
* verificar coerência de sprint

## Regra

A IA pode recomendar bloqueios, mas o sistema aplica as regras.

---

# 3.3 Auditora

## Função

Observar padrões, riscos e desvios.

## Exemplos

* detectar retrabalho
* apontar gargalos no kanban
* identificar bloqueios recorrentes
* detectar uso ineficiente de tokens
* sinalizar risco de handoff
* identificar áreas mal documentadas

## Regra

A auditoria deve preferir explicações acionáveis, não apenas alertas genéricos.

---

# 3.4 Assistente Contextual

## Função

Ajudar o usuário a agir sobre o contexto atual.

## Exemplos

* sugerir próximo passo
* resumir a sprint
* explicar uma decisão
* sugerir melhorias em um requirement
* indicar arquivos relacionados
* criar onboarding a partir do estado atual

## Regra

A IA deve sempre priorizar o contexto ativo do usuário.

---

## 4. O que a IA pode fazer

A IA pode:

* criar rascunhos
* transformar artefatos
* sugerir mudanças
* resumir estado
* comparar artefatos
* identificar inconsistências
* propor ações
* gerar documentação auxiliar
* gerar issues e tarefas
* produzir checkpoints
* recomendar guardrails
* ajudar na seleção de contexto técnico

---

## 5. O que a IA não pode fazer

A IA não pode:

* criar artefatos soltos, sem vínculo
* alterar source of truth sem rastreabilidade
* marcar execução como concluída por conta própria
* ignorar regras do sistema
* operar sem contexto
* assumir fatos não presentes no sistema sem sinalizar incerteza
* apagar histórico
* sobrescrever validações estruturais do backend
* decidir sozinha políticas críticas sem confirmação humana

---

## 6. Fonte de Contexto

A IA nunca deve operar com contexto livre ou implícito.
Ela deve receber um **Context Bundle** explícito.

---

# 6.1 Context Bundle

O Context Bundle pode incluir:

* projeto atual
* tela atual
* artefato ativo
* sprint atual
* requirements relacionados
* issues relacionadas
* decisões recentes
* documentos relacionados
* histórico recente
* arquivos relacionados do codebase
* métricas relevantes
* settings do projeto

---

# 6.2 Context Priority

Quando o contexto for grande, a IA deve priorizar:

1. artefato ativo
2. sprint atual
3. histórico recente
4. artefatos relacionados
5. código relacionado
6. contexto amplo do projeto

---

# 6.3 Context Discipline

A IA deve:

* preferir contexto explícito
* evitar inferência desnecessária
* registrar quando operar com contexto parcial
* pedir expansão de contexto quando necessário

---

## 7. Modos de Atuação da IA

---

# 7.1 Inline Action Mode

A IA age sobre um bloco, item ou artefato específico.

## Exemplos

* refinar um requirement
* decompor uma issue
* gerar edge cases
* criar ADR a partir de uma decisão

## UX esperada

* ação pontual
* feedback imediato
* resultado visível no mesmo contexto

---

# 7.2 Panel Assistant Mode

A IA atua no painel lateral do Copilot.

## Exemplos

* responder perguntas contextuais
* resumir estado da sprint
* sugerir próximos passos
* comparar artefatos

## UX esperada

* conversa contextual
* sugestões acionáveis
* links para entidades do sistema

---

# 7.3 Batch Transformation Mode

A IA processa um conjunto maior de artefatos.

## Exemplos

* gerar issues de uma spec inteira
* gerar onboarding
* gerar documentação inicial
* criar checklist de execução

## UX esperada

* progresso visível
* resumo final
* rastreabilidade das saídas

---

# 7.4 Audit Mode

A IA analisa o sistema para encontrar problemas ou oportunidades.

## Exemplos

* risco da sprint
* inconsistência entre spec e board
* retrabalho elevado
* alto consumo de tokens

## UX esperada

* alertas claros
* causa provável
* recomendação de ação

---

## 8. Ações Permitidas por Domínio

---

# 8.1 Na Definition

A IA pode:

* estruturar descoberta
* extrair requirements
* gerar sections da spec
* sugerir decisões
* criar critérios de aceitação
* apontar lacunas
* identificar conflitos

---

# 8.2 Na Execution

A IA pode:

* gerar issues
* decompor issues grandes
* sugerir prioridade
* identificar bloqueios
* gerar resumo da sprint
* sugerir checkpoint
* apontar retrabalho

---

# 8.3 Na Knowledge

A IA pode:

* gerar documentação
* resumir arquitetura
* criar onboarding
* conectar docs com artefatos

---

# 8.4 Na Activity

A IA pode:

* resumir uma sessão
* responder o que mudou
* agrupar eventos
* explicar evolução recente

---

# 8.5 Em Settings / Workflow

A IA pode:

* sugerir guardrails
* recomendar workflow Git
* gerar políticas iniciais
* transformar política em rascunho técnico

---

## 9. Nível de Autonomia

A IA deve operar com níveis controlados de autonomia.

---

# 9.1 Read-only

Apenas observa, explica e recomenda.

---

# 9.2 Drafting

Cria rascunhos e propostas, sem aplicar automaticamente.

---

# 9.3 Assisted Action

Executa ação com confirmação humana.

---

# 9.4 Controlled Automation

Executa ações permitidas automaticamente, desde que previstas nas policies.

---

## Regra recomendada

No início do produto, o comportamento padrão deve ser:

* **Drafting + Assisted Action**

---

## 10. Rastreabilidade

Toda ação da IA deve registrar:

* tipo da ação
* artefato alvo
* contexto usado
* resultado produzido
* modelo utilizado
* tokens consumidos
* timestamp

Além disso, deve gerar:

* `AIActionLog`
* `ActivityEvent`

---

## 11. Transparência

A IA deve sempre deixar claro:

* o que foi gerado
* com base em quê
* o que é sugestão
* o que foi aplicado
* o que está incompleto ou incerto

A IA nunca deve simular certeza absoluta em contexto parcial.

---

## 12. Qualidade da Resposta

A saída da IA deve ser:

* contextual
* objetiva
* acionável
* rastreável
* proporcional à tarefa

Evitar:

* respostas genéricas
* texto excessivo sem ação
* sugestões desconectadas do sistema

---

## 13. Comportamentos Específicos Importantes

---

# 13.1 Sobre a Spec

A IA deve sempre tratar a spec como núcleo.
Se houver conflito entre execução e spec, deve sinalizar.

---

# 13.2 Sobre Issues

A IA não deve criar issues sem vínculo com requirement/spec.
Se isso acontecer, deve marcar explicitamente como exceção a validar.

---

# 13.3 Sobre Sprints

A IA deve tratar sprint como:

* container de foco
* recorte executável da spec
* unidade de continuidade entre sessões

---

# 13.4 Sobre Checkpoints

A IA deve ser capaz de gerar checkpoint automaticamente ao:

* fim de sessão
* pausa manual
* fechamento de sprint
* risco de handoff

---

# 13.5 Sobre Codebase

Quando houver indexação:

* a IA deve preferir arquivos relacionados
* evitar carregar árvore inteira sem necessidade
* justificar quando usar contexto técnico parcial

---

## 14. Segurança e Limites

A IA não deve:

* inventar vínculo com código sem evidência
* aplicar políticas destrutivas sem confirmação
* alterar fluxo crítico sem autorização
* burlar guardrails configurados

Ela pode:

* sugerir mitigação
* sinalizar risco
* propor melhorias

---

## 15. Uso de Tokens

O sistema deve registrar uso de tokens por:

* ação
* sprint
* projeto
* tipo de artefato

A IA deve evitar desperdício:

* preferindo contexto relevante
* reutilizando artefatos já resumidos
* evitando regenerações desnecessárias

---

## 16. Indicadores de Boa Atuação da IA

A IA está funcionando bem quando:

* reduz retrabalho
* acelera criação de spec
* melhora clareza dos artefatos
* melhora retomada entre sessões
* gera issues consistentes
* ajuda a explicar estado e próximos passos
* usa contexto de forma eficiente

---

## 17. Anti-patterns

❌ IA agindo como source of truth
❌ IA sem contexto
❌ IA criando artefatos órfãos
❌ IA sem rastreabilidade
❌ IA excessivamente conversacional e pouco acionável
❌ IA ignorando policies
❌ IA gerando muito texto e pouca transformação

---

## 18. Resumo

A IA deve funcionar como uma camada operacional do sistema, capaz de:

* transformar
* validar
* auditar
* assistir

sempre com:

* contexto explícito
* autonomia controlada
* rastreabilidade completa
* respeito à spec e às policies

---

## Frase final

> A IA não substitui a engenharia do sistema; ela amplifica a capacidade de transformar a spec em software, com contexto, disciplina e rastreabilidade.
