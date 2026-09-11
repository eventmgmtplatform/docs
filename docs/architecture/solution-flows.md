# Flujos de solución ejecutados

Esta página extiende la arquitectura existente con flujos representados en el código y procedimientos de certificación del repositorio de plataforma. No convierte mocks ni pruebas locales en certificación productiva.

## Happy path end-to-end

```mermaid
flowchart LR
  Z[Zabbix / productor HTTP] --> GW[event-gateway :8081]
  GW --> RAW[(events.raw)]
  RAW --> EP[event-processor :8082]
  EP --> NORM[(events.normalized)]
  EP --> CMD[(integration.commands)]
  CMD --> IW[integration-worker :8083]
  IW --> SN[ServiceNow / GLPI]
  IW --> GNM[GNM / Everbridge]
  IW --> CACF[CACF / NEXT]
  IW --> RES[(integration.results)]
  RES --> ESS[event-state-service :8084]
  ESS --> PG[(PostgreSQL)]
  ESS --> OS[(OpenSearch)]
  ESS --> LIFE[(events.lifecycle)]
  UI[event-management-console :8090] --> BFF[Same-origin APIs]
  BFF --> EP
  BFF --> ESS
```

Las certificaciones ESS documentan trazabilidad de `sourceEventId`, `commandId`, `resultId` y `eventKey`.

## Decisión dentro de Event Processor

```mermaid
flowchart TB
  IN[events.raw] --> NORMALIZE[Normalización]
  NORMALIZE --> SNAPSHOT[Snapshot versionado por tenant]
  SNAPSHOT --> POLICY[Policy]
  POLICY --> ENRICH[Enrichment + Inventory]
  ENRICH --> BLACKOUT[Blackout]
  BLACKOUT --> AUTOSUP[Auto-suppression]
  AUTOSUP --> CORR[Correlation ATTRIBUTE / GROUP]
  CORR --> ROUTE[Routing]
  ROUTE --> OUTBOX[Command intent + outbox]
  OUTBOX --> COMMANDS[(integration.commands)]
  SNAPSHOT --> EXPLAIN[Evidence / Explain / Audit]
```

## Ticketing

```mermaid
sequenceDiagram
  participant EP as event-processor
  participant K as Kafka
  participant IW as integration-worker
  participant ITSM as ServiceNow/GLPI
  participant ESS as event-state-service
  participant DB as PostgreSQL/OpenSearch
  EP->>K: integration.commands
  K->>IW: consume command
  IW->>ITSM: create / lookup / reconcile
  ITSM-->>IW: ticket result
  IW->>K: integration.results
  K->>ESS: consume result
  ESS->>DB: state + history + projection
```

## Notification Router — GNM / Everbridge

```mermaid
sequenceDiagram
  participant EP as event-processor
  participant IW as integration-worker
  participant GNM as GNM / Everbridge
  participant ESS as event-state-service
  EP->>IW: command intent via Kafka
  IW->>GNM: Launch incident
  GNM-->>IW: incident id / status
  IW->>ESS: integration.results via Kafka
  ESS->>ESS: idempotency + aggregate update
```

El compose revisado incluye `gnm-mock`; un PASS contra mock no certifica conectividad real con Everbridge.

## Automation Router — CACF / NEXT

```mermaid
flowchart LR
  EVENT[Evento normalizado] --> EP[event-processor]
  EP --> CMD[(integration.commands)]
  CMD --> IW[integration-worker]
  IW --> NEXT[NEXT / CACF]
  NEXT --> RESULT[Remediation / escalation / transfer]
  RESULT --> IW
  IW --> RES[(integration.results)]
  RES --> ESS[event-state-service]
  ESS --> JOURNAL[event journal / lifecycle]
```

## Fallo y recuperación

```mermaid
flowchart TB
  MSG[Mensaje / resultado] --> VALID{Contrato válido?}
  VALID -- no --> Q[Quarantine / DLQ + evidencia]
  VALID -- sí --> IDEM{Ya procesado?}
  IDEM -- sí --> ACK[ACK idempotente]
  IDEM -- no --> TX[Transacción / ledger / outbox]
  TX --> EXT[Integración o proyección]
  EXT -->|éxito| COMMIT[Commit + ACK]
  EXT -->|fallo recuperable| RETRY[Retry / reconciliation]
  RETRY --> EXT
  EXT -->|fallo terminal| EVID[Resultado de error + evidencia]
```
