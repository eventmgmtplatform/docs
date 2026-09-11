# Flujo de eventos

```mermaid
flowchart TD
  A[Evento recibido] --> B[Guardar original]
  B --> C[Normalizar y validar]
  C --> D[Snapshot de reglas]
  D --> E[Policy / Enrichment]
  E --> F[Correlation / Suppression]
  F --> G[Routing]
  G --> H{¿Hay integración?}
  H -- No --> I[STATE_ONLY o cierre]
  H -- Sí --> J[Command intent]
  J --> K[Worker y proveedor]
  K --> L[Resultado idempotente]
  L --> M[ESS: estado, historial y explain]
  I --> M
```

El flujo normalizado publica en Kafka; PostgreSQL conserva configuración,
auditoría, outbox y estado. El Worker no inventa comandos: ejecuta una intención
durable y exige consistencia de `commandId`. Los reintentos reutilizan la misma
intención y no deben crear tickets o alertas duplicados.

Las rutas de administración y simulación están en [API](../reference/api/index.md)
y el escenario completo en [Primer evento](../getting-started/first-event.md).
