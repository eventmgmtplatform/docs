# Glosario

| Término | Significado |
|---|---|
| `eventId` | Identidad única de una recepción concreta. |
| `eventKey` | Identidad estable del evento/ciclo entre problema y recuperación. |
| Tenant | Ámbito lógico del cliente y sus configuraciones. |
| Gateway | Entrada, validación, normalización e idempotencia. |
| Processor | Motor de reglas, enriquecimiento, correlación, supresión y routing. |
| Snapshot | Conjunto versionado de reglas activas usado por un evento. |
| Command intent | Intención durable antes de ejecutar una integración. |
| Worker | Consumidor que ejecuta comandos y publica resultados. |
| ESS | Event State Service; autoridad de lifecycle, historial y proyección. |
| Outbox | Registro transaccional de mensajes pendientes de publicación. |
| ETag / `If-Match` | Control de revisión para evitar sobrescrituras concurrentes. |
| DLQ | Destino de eventos que no pueden procesarse, con evidencia sanitizada. |
| Same-origin / BFF | Proxy que permite a la consola consumir APIs relativas de forma controlada. |
| Lifecycle | Estado operativo del evento, por ejemplo `OPEN` o `RESOLVED`. |
