# Primer evento: happy path

Basado en `testing/cases/UC-001-happy-path.md`, este recorrido lleva un evento
fatal hasta su resolución usando fixtures y proveedores sintéticos.

```mermaid
sequenceDiagram
  participant Z as Zabbix
  participant G as Gateway
  participant K as Kafka
  participant P as Processor
  participant W as Worker
  participant X as Integraciones
  participant E as ESS
  Z->>G: PROBLEM / Type=1 / severity=5
  G->>K: events.raw
  K->>P: snapshot y decisiones
  P->>K: integration.commands
  K->>W: CREATE_TICKET / OPEN
  W->>X: ticket, GNM y CACF
  X-->>W: resultados confirmados
  W->>K: integration.results
  K->>E: proyecta OPEN
  Z->>G: OK / Type=0, mismo eventKey
  G->>P: nuevo eventId
  P->>W: cierres idempotentes
  W->>E: clear
  E-->>Z: lifecycle RESOLVED
```

## Aceptación

1. Enviar el fixture fatal: HTTP 202, `eventId`, `eventKey`, `processingId` y
   evento OPEN persistidos.
2. Confirmar un único ticket y una alerta GNM asociados al mismo evento.
3. Confirmar `executionId`, ACK y resultado CACF/NEXT.
4. Enviar callback `RESOLVE` y verificar resultado proyectado.
5. Enviar recuperación `Type=0`: mismo `eventKey`, nuevo `eventId` y clear.
6. Repetir callback/clear: no se crean operaciones duplicadas.

```bash
python3 testing/run.py certification --name lifecycle-prepare
python3 testing/run.py happy-path
```

Los reportes quedan en `evidences/testing/`; el runner limpia únicamente sus
reglas sintéticas. La aceptación falla ante duplicación, timeout, DLQ, IDs
inconsistentes o confirmaciones ausentes.
