# GNM Core Foundation — Notification Router
```mermaid
flowchart LR
 EP[event-processor]-->C[(integration.commands)]-->IW[integration-worker]-->A[GNM Adapter]-->EB[Everbridge]
 EB-->A-->R[(integration.results)]-->ESS[event-state-service]
```
El contrato forense legado usa `ServerSerial` como correlación relevante y Launch mediante `POST /rest/incidents/{organizationId}`. El payload incluye acción, nombre, fases/broadcast template y `formVariableItems`; la respuesta aporta identificador/URI y el detalle expone estado.

Casos CROWN y VITRO documentados sirven como fixtures/contract tests, sin conservar secretos.

Principios: provider HTTP sólo en Worker/adapter; secrets externos; resultado normalizado; idempotencia; mock para desarrollo y certificación real separada.
