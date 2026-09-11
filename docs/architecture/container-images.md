# Arquitectura de las cinco imágenes
```mermaid
flowchart TB
 CORE[oem-core]-->K[(Kafka)]
 CORE-->PG[(PostgreSQL)]
 CORE-->OS[(OpenSearch)]
 INT[oem-integrations]-->SN[ServiceNow]
 INT-->GNM[GNM / Everbridge]
 INT-->CACF[CACF / NEXT]
 CON[oem-console]-->CORE
 INIT[oem-init]-->K
 INIT-->PG
 TOOL[oem-toolbox]-->CORE
```
## oem-core
Familia del dominio central: Gateway, Event Processor y Event State Service. En Kubernetes los procesos deben seguir siendo desplegables y escalables independientemente.

## oem-integrations
Integration Worker y adapters ITSM, Notification y Automation Router. Aísla credenciales y conectividad de proveedores.

## oem-console
Event Management Console, dashboards OEM y APIs frontend. Kafka UI y OpenSearch Dashboards son herramientas integradas, no el frontend OEM.

## oem-init
Jobs one-shot idempotentes para topics, esquemas, migraciones, bootstrap y preflight.

## oem-toolbox
CLI, diagnóstico, readiness, smoke tests, evidencia y soporte; debe ejecutarse on-demand.

```mermaid
sequenceDiagram
 participant Z as Zabbix
 participant C as oem-core
 participant I as oem-integrations
 participant E as External systems
 participant U as oem-console
 Z->>C: evento
 C->>C: normalize / rules / route
 C->>I: integration.commands
 I->>E: ticket / notification / automation
 E-->>I: result
 I->>C: integration.results
 C->>C: ESS state + lifecycle
 U->>C: query / admin
```
