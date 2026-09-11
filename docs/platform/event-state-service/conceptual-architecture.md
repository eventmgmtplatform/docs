# Event State Service — arquitectura conceptual
ESS consolida el estado operacional; Processor decide, Worker ejecuta y ESS persiste/publica lifecycle.

![Arquitectura V1 del Event State Service](diagrams/ESS_V1_Architecture.png)
```mermaid
flowchart LR
 RES[(integration.results)]-->ESS[Event State Service]
 N[(events.normalized)]-->ESS
 ESS-->ID[Idempotency / ledger]-->AGG[Event aggregate]
 AGG-->PG[(PostgreSQL)]
 AGG-->OS[(OpenSearch)]
 AGG-->L[(events.lifecycle)]
 API[Admin / Query API]-->AGG
```
Responsabilidades: validación, correlación contractual, idempotencia, estado durable, historial, proyección, lifecycle y API. No debe duplicar reglas, routing ni clientes de proveedores.

```mermaid
sequenceDiagram
 participant K as Kafka
 participant E as ESS
 participant P as PostgreSQL
 participant O as OpenSearch
 participant L as events.lifecycle
 K->>E: integration.results
 E->>E: validate + idempotency
 E->>P: state/history
 E->>O: projection
 E->>L: lifecycle
```
