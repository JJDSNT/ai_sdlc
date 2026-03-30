# ⚙️ Execution & Workflow Policy — AI SDLC Platform

## 1. Objetivo

Definir as regras operacionais do sistema, garantindo:

* execução consistente
* qualidade mínima obrigatória
* integração com fluxo de desenvolvimento real (Git, CI/CD)
* previsibilidade entre sessões
* suporte a sprint e fluxo contínuo

---

## 2. Princípio Central

> Execução não é livre: ela segue regras explícitas que garantem qualidade, rastreabilidade e continuidade.

---

## 3. Modelo de Trabalho

O sistema suporta dois modos:

---

# 3.1 Sprint Mode

## Características

* escopo definido
* objetivo claro
* janela de tempo
* acompanhamento contínuo

## Uso ideal

* trabalho focado
* sessões planejadas
* evitar handoff brusco

---

# 3.2 Continuous Flow Mode

## Características

* fluxo contínuo
* sem ciclos rígidos
* foco em throughput

## Uso ideal

* manutenção
* ajustes rápidos
* tarefas pequenas

---

## Regra

O sistema deve suportar ambos, mas manter rastreabilidade em qualquer modo.

---

## 4. Regras de Issue

---

# 4.1 Criação

Toda issue deve:

* estar vinculada a uma spec
* ter origem definida (spec, IA, manual)
* ter descrição clara
* conter critérios de aceitação

---

# 4.2 Estados válidos

```txt
backlog → ready → doing → done
                  ↘ blocked ↗
```

---

# 4.3 Critérios de “done”

Uma issue só pode ser marcada como concluída se:

* critérios de aceitação foram atendidos
* não há bloqueios ativos
* dependências foram resolvidas
* validação foi realizada

---

# 4.4 Bloqueios

Quando uma issue está bloqueada:

* motivo deve ser registrado
* dependência deve ser explícita
* impacto deve ser visível

---

# 4.5 Retrabalho

Se uma issue volta de “done” para outro estado:

* deve ser marcada como retrabalho
* deve registrar motivo
* deve gerar evento

---

## 5. Regras de Sprint

---

# 5.1 Criação

Uma sprint deve:

* ter objetivo claro
* conter conjunto definido de issues
* estar vinculada a uma spec (ou parte dela)

---

# 5.2 Durante a sprint

* progresso deve ser monitorado
* bloqueios devem ser visíveis
* retrabalho deve ser detectado
* checkpoints devem ser gerados

---

# 5.3 Encerramento

Ao finalizar uma sprint:

* todas as issues devem estar em estado consistente
* deve gerar resumo da sprint
* deve gerar checkpoint final
* deve registrar métricas

---

## 6. Indicadores obrigatórios

---

# 6.1 Progresso

```txt
done / total issues
```

---

# 6.2 WIP (Work in Progress)

Número de issues em execução

---

# 6.3 Bloqueios

```txt
issues bloqueadas / total
```

---

# 6.4 Retrabalho

```txt
issues reabertas / total
```

---

# 6.5 Uso de IA

* tokens por sprint
* tokens por ação

---

## 7. Fluxo Git (recomendado)

---

# 7.1 Branching

* `main` → produção
* `feature/*` → desenvolvimento
* `hotfix/*` → correções urgentes

---

# 7.2 Regra

Cada issue deve:

* mapear para uma branch
* ou conjunto de commits identificáveis

---

# 7.3 Naming

```txt
feature/ISSUE-123-nome-curto
```

---

## 8. Pull Request

---

# 8.1 Regras

Todo PR deve:

* estar vinculado a uma issue
* descrever mudanças
* listar critérios de aceitação atendidos

---

# 8.2 Validação

Antes do merge:

* testes devem passar
* validações devem rodar
* políticas devem ser respeitadas

---

## 9. Merge para Main

---

# 9.1 Trigger

Ao fazer merge:

* CI deve ser disparado automaticamente
* validações devem rodar
* artefatos podem ser gerados

---

# 9.2 CD (opcional)

Dependendo da configuração:

* deploy automático
* ou aprovação manual

---

## 10. Guardrails

---

# 10.1 Definição

Regras que garantem qualidade e segurança.

---

# 10.2 Exemplos

* issue sem spec → inválida
* issue sem critérios → inválida
* merge sem validação → bloqueado
* spec incompleta → bloqueia execução

---

# 10.3 Evolução

Guardrails devem ser:

* configuráveis
* versionáveis
* transformáveis em código (CI/CD)

---

## 11. CI/CD (visão futura)

---

# CI

Executa:

* testes
* validações
* lint
* regras de qualidade

---

# CD

Executa:

* deploy
* migração
* atualização de ambiente

---

## 12. Integração com Spec

---

## Regra fundamental

```txt
Spec → define → Execução → implementa → Validação → confirma → Spec atualiza
```

---

## Consequência

* código deve refletir spec
* mudanças devem atualizar spec
* inconsistências devem ser sinalizadas

---

## 13. Continuidade entre sessões

---

# Checkpoint obrigatório quando:

* sessão termina
* sprint termina
* risco de perda de contexto

---

# Checkpoint deve conter:

* estado atual
* progresso
* próximos passos
* bloqueios

---

## 14. Onboarding

O sistema deve permitir:

* entender rapidamente o projeto
* ver estado atual
* ver últimas ações
* entender próximos passos

---

## 15. Políticas configuráveis

Usuário pode definir:

* uso de sprint vs fluxo contínuo
* nível de automação da IA
* regras de qualidade
* estratégia de merge
* obrigatoriedade de CI/CD

---

## 16. Anti-patterns

❌ issue sem critério de aceitação
❌ merge direto no main sem validação
❌ execução fora da spec
❌ ausência de checkpoint
❌ retrabalho não registrado
❌ bloqueios invisíveis
❌ IA executando sem controle

---

## 17. Resumo

O sistema garante execução de qualidade através de:

* regras explícitas
* integração com Git
* validação contínua
* rastreabilidade
* suporte a sprint e fluxo contínuo

---

## Frase final

> A execução não depende da disciplina do usuário; ela é garantida pelo sistema através de regras, validações e integração com o fluxo real de desenvolvimento.
