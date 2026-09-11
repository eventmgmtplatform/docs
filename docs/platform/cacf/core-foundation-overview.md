# CACF Core Foundation — Automation Router
```mermaid
sequenceDiagram
 participant EP as event-processor
 participant K as Kafka
 participant IW as integration-worker
 participant N as NEXT / CACF
 participant SN as ServiceNow
 participant ESS as ESS
 EP->>K: CACF command
 K->>IW: consume
 IW->>N: automation request
 N-->>IW: accepted / result / callback
 IW->>K: integration result
 K->>ESS: state update
 alt failure or SLA expiry
  IW->>SN: escalation / tower reassignment
 end
```
Requester Identifier documentado: `<servername>:<serverserial>:<customercode>`. El modelo contempla aceptación asíncrona, listener/callback, worknote, timeout parametrizable y escalación humana. Casos de referencia incluyen `NO ACTION/NO MATCHING HOST`, `ESCALATION/AUTO ESCALATION`, `REMEDIATION` y `TOWER TRANSFER`.

La documentación detallada de contratos, estados, validación, runbook, ADR, DP y Draw.io se conserva en `platform/cacf/`.
