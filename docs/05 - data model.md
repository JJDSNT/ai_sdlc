# 🗄️ Data Model & Persistence — AI SDLC Platform

## 1. Objetivo

Definir como o sistema persiste seus dados, garantindo:

* integridade
* rastreabilidade
* versionamento
* continuidade entre sessões
* suporte à IA
* evolução para integração com codebase, workflow e métricas

---

## 2. Princípios de Persistência

### 2.1 Spec como fonte de verdade

A estrutura de dados deve refletir que a Spec é o núcleo do sistema.

### 2.2 Relações explícitas

Toda relação importante deve ser persistida.

### 2.3 Rastreabilidade por padrão

Toda ação relevante deve gerar evento ou vínculo.

### 2.4 Versionamento

Specs, decisões e contextos importantes devem ser versionáveis.

### 2.5 Flexibilidade controlada

O núcleo deve ser relacional; metadados variáveis podem usar campos JSON.

---

## 3. Tecnologia recomendada

## Banco principal

* **SQLite** para MVP e desenvolvimento local
* **PostgreSQL** para evolução e produção

## Complementares

* Redis para cache, filas e estado efêmero
* Object Storage para anexos e blobs grandes
* indexação semântica opcional no futuro

---

## 4. Núcleos de Dados

O modelo é dividido em 6 grupos:

1. Core Product
2. Execution
3. Memory & Activity
4. Governance
5. Codebase Index
6. AI Context & Metrics

---

# 5. Core Product

---

## 5.1 Project

Representa o espaço principal de trabalho.

### Campos mínimos

* id
* name
* description
* status
* created_at
* updated_at

---

## 5.2 Spec

Fonte de verdade do sistema.

### Campos mínimos

* id
* project_id
* title
* description
* status
* version
* created_at
* updated_at

### Observação

A estrutura interna da spec pode ser persistida em tabelas relacionadas e/ou blocos JSON controlados.

---

## 5.3 Requirement

Unidade de definição dentro da spec.

### Campos mínimos

* id
* spec_id
* title
* description
* type
* priority
* acceptance_criteria_json
* created_at
* updated_at

---

## 5.4 Decision

Registro estruturado de decisão (ADR).

### Campos mínimos

* id
* spec_id
* title
* context
* options_json
* decision
* consequences
* status
* version
* created_at
* updated_at

---

## 5.5 Document

Artefato de conhecimento.

### Campos mínimos

* id
* project_id
* title
* type
* content
* status
* created_at
* updated_at

---

## 5.6 ArtifactLink

Relação genérica entre artefatos.

### Campos mínimos

* id
* source_artifact_type
* source_artifact_id
* target_artifact_type
* target_artifact_id
* link_type
* confidence_score
* source
* created_at

### Exemplos

* spec → issue
* decision → document
* issue → document

---

# 6. Execution

---

## 6.1 Issue

Unidade executável derivada da spec.

### Campos mínimos

* id
* project_id
* spec_id
* requirement_id
* sprint_id (nullable)
* title
* description
* type
* priority
* status
* acceptance_criteria_json
* blocked_reason
* created_from
* created_at
* updated_at

### Regras

* spec_id obrigatório
* created_from obrigatório
* blocked_reason obrigatório quando status = blocked

---

## 6.2 Sprint

Container de foco e contexto.

### Campos mínimos

* id
* project_id
* name
* goal
* status
* start_date
* end_date
* checkpoint_id (nullable)
* created_at
* updated_at

---

## 6.3 SprintSpecScope

Relação entre sprint e partes da spec.

### Campos mínimos

* id
* sprint_id
* spec_id
* scope_type
* created_at

---

## 6.4 SprintIssueOrder

Ordenação explícita de issues numa sprint/backlog.

### Campos mínimos

* id
* sprint_id
* issue_id
* position
* created_at

---

## 6.5 IssueStateTransition

Histórico de transições da issue.

### Campos mínimos

* id
* issue_id
* from_status
* to_status
* reason
* actor_type
* actor_id
* created_at

### Uso

* detectar retrabalho
* medir fluxo
* explicar mudanças

---

## 6.6 Impediment (opcional como tabela separada)

Se quiser granularidade maior.

### Campos mínimos

* id
* issue_id
* title
* description
* severity
* status
* created_at
* resolved_at

---

# 7. Memory & Activity

---

## 7.1 Checkpoint

Snapshot de contexto.

### Campos mínimos

* id
* project_id
* sprint_id (nullable)
* summary
* next_steps_json
* blockers_json
* active_entities_json
* created_at

---

## 7.2 ActivityEvent

Registro de ações do sistema.

### Campos mínimos

* id
* project_id
* artifact_type
* artifact_id
* event_type
* actor_type
* actor_id
* title
* description
* payload_json
* created_at

### Exemplos

* issue_created
* spec_validated
* sprint_started
* ai_generated_issues

---

## 7.3 Session

Sessão de trabalho.

### Campos mínimos

* id
* project_id
* started_at
* ended_at
* checkpoint_id (nullable)
* metadata_json

---

## 7.4 DocumentVersion (opcional)

Versionamento de documentos.

---

## 7.5 SpecVersion

Versionamento da spec.

### Campos mínimos

* id
* spec_id
* version
* snapshot_json
* created_at

---

# 8. Governance

---

## 8.1 ProjectSettings

Configuração geral do projeto.

### Campos mínimos

* id
* project_id
* settings_json
* updated_at

---

## 8.2 WorkflowPolicy

Regras de fluxo técnico.

### Campos mínimos

* id
* project_id
* git_strategy
* merge_policy
* ci_required
* cd_policy
* metadata_json
* updated_at

---

## 8.3 GuardrailPolicy

Regras de qualidade, segurança e execução.

### Campos mínimos

* id
* project_id
* category
* rule_key
* rule_value_json
* enabled
* updated_at

---

## 8.4 QualityPolicy

Pode ser separada ou absorvida por GuardrailPolicy.

### Exemplos

* done exige critérios de aceitação
* spec exige edge cases
* issue sem spec é inválida

---

# 9. Codebase Index

---

## 9.1 Repository

Representa o repositório ligado ao projeto.

### Campos mínimos

* id
* project_id
* name
* provider
* remote_url
* default_branch
* root_path
* created_at
* updated_at

---

## 9.2 RepositorySnapshot

Foto do repositório em um momento.

### Campos mínimos

* id
* repository_id
* revision
* branch_name
* indexed_at
* indexing_status
* file_count
* directory_count
* metadata_json

---

## 9.3 FileNode

Elemento da árvore de arquivos.

### Campos mínimos

* id
* repository_snapshot_id
* parent_id (nullable)
* path
* name
* node_type
* extension
* depth
* size_bytes
* content_hash
* mime_type
* is_generated
* created_at

---

## 9.4 FileDocument

Metadados semânticos do arquivo.

### Campos mínimos

* id
* file_node_id
* language
* parser_status
* summary
* role_label
* domain_label
* symbol_count
* import_count
* export_count
* line_count
* token_estimate
* metadata_json
* updated_at

---

## 9.5 FileSymbol

Símbolos extraídos do arquivo.

### Campos mínimos

* id
* file_node_id
* name
* symbol_type
* exported
* start_line
* end_line
* signature_text
* metadata_json

---

## 9.6 FileDependency

Relação entre arquivos.

### Campos mínimos

* id
* source_file_id
* target_file_id
* dependency_type
* reference_text

---

## 9.7 ArtifactFileLink

Relação entre artefato e arquivo.

### Campos mínimos

* id
* artifact_type
* artifact_id
* file_node_id
* link_type
* confidence_score
* source
* created_at

---

## 9.8 FileChange

Mudança detectada entre snapshots.

### Campos mínimos

* id
* repository_id
* from_snapshot_id
* to_snapshot_id
* path
* change_type
* old_path
* old_hash
* new_hash
* change_scope
* detected_at

---

## 9.9 SprintCodeScope

Escopo técnico da sprint.

### Campos mínimos

* id
* sprint_id
* repository_id
* snapshot_id
* file_node_id (nullable)
* file_symbol_id (nullable)
* scope_type
* source
* created_at

---

## 9.10 SpecCodeDriftReport (futuro)

Relatório de desalinhamento entre spec e implementação.

---

# 10. AI Context & Metrics

---

## 10.1 AIActionLog

Registro de ação da IA.

### Campos mínimos

* id
* project_id
* action_type
* target_artifact_type
* target_artifact_id
* input_context_json
* output_summary
* token_input
* token_output
* model
* created_at

---

## 10.2 ContextBundleSnapshot

Snapshot do contexto enviado à IA.

### Campos mínimos

* id
* project_id
* sprint_id (nullable)
* active_artifact_type
* active_artifact_id
* context_json
* created_at

---

## 10.3 SprintMetric

Métricas da sprint.

### Campos mínimos

* id
* sprint_id
* metric_key
* metric_value
* calculated_at

### Exemplos

* progress_percent
* rework_rate
* blocked_rate
* token_usage

---

## 10.4 ProjectMetric

Métricas agregadas do projeto.

---

# 11. Regras de Integridade

## 11.1 Toda issue pertence a uma spec

`issue.spec_id` é obrigatório.

## 11.2 Toda transition deve ser registrada

Mudança de status gera `IssueStateTransition`.

## 11.3 Toda ação relevante gera evento

Criação, alteração, geração por IA e validação devem gerar `ActivityEvent`.

## 11.4 Snapshot é imutável

`RepositorySnapshot` não deve ser alterado após criação.

## 11.5 Relações automáticas devem indicar origem

Toda inferência deve registrar `source` e, se aplicável, `confidence_score`.

---

# 12. Versionamento

## Obrigatório

* Spec
* Decision

## Recomendado

* Document
* WorkflowPolicy

---

# 13. Estratégia de armazenamento

## Relacional

Usar para:

* entidades principais
* chaves estrangeiras
* integridade

## JSON

Usar para:

* snapshots
* metadados flexíveis
* critérios variáveis
* payloads de IA
* configurações extensíveis

---

# 14. Estratégia de evolução

## MVP

Começar com:

* Project
* Spec
* Requirement
* Decision
* Issue
* Sprint
* Checkpoint
* ActivityEvent
* ProjectSettings

## Fase seguinte

Adicionar:

* WorkflowPolicy
* GuardrailPolicy
* AIActionLog
* Repository
* RepositorySnapshot
* FileNode
* ArtifactFileLink

## Fase avançada

Adicionar:

* FileSymbol
* FileDependency
* SpecCodeDriftReport
* métricas agregadas
* automações de entrega

---

# 15. Anti-patterns

❌ issue sem spec
❌ spec sem versionamento
❌ relações implícitas apenas na UI
❌ lógica de integridade só no frontend
❌ snapshots mutáveis
❌ eventos importantes sem log

---

# 16. Resumo

A persistência do sistema deve suportar:

* spec como núcleo
* execução rastreável
* continuidade via checkpoint
* governança configurável
* integração futura com codebase
* observabilidade de IA e sprint

---

## Frase final

> O banco de dados não armazena apenas entidades; ele preserva a memória operacional do sistema e a transformação contínua da spec em software.
