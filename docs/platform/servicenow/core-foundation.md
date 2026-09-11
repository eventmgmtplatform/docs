# ServiceNow Core Foundation — Ticketing Router
```mermaid
flowchart LR
 E[Evento]-->EP[event-processor]-->C[(integration.commands)]-->IW[integration-worker]-->SN[ServiceNow Adapter]-->EXT[ServiceNow]
 EXT-->SN-->R[(integration.results)]-->ESS[event-state-service]
```
Processor decide **si** emitir el comando; Worker ejecuta el contrato ServiceNow; ESS consolida el resultado. El foundation cubre creación/reconciliación, ownership guards, normalización, evidencia y configuración mock/real.

## CMDB Processor
La evolución contempla un CI ServiceNow CMDB Processor para sustituir middleware legacy entre inventario/Lansweeper y ServiceNow CMDB. Debe mantenerse separado del ticketing transaccional y tener reconciliación, idempotencia y observabilidad propias.
