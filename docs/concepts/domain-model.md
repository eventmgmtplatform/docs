# Modelo de dominio

El evento conserva una identidad técnica (`eventId`) y una identidad de ciclo
(`eventKey`). El envelope original se conserva para trazabilidad; la salida
normalizada agrega estado, severidad, tenant, timestamps y decisiones sin
alterar el original.

```mermaid
classDiagram
  EventEnvelope "1" --> "1" ProcessingRecord
  ProcessingRecord --> "0..*" Decision
  Decision --> "0..*" CommandIntent
  CommandIntent --> "0..*" IntegrationResult
  IntegrationResult --> EventState
  EventEnvelope : eventId
  EventEnvelope : eventKey
  EventEnvelope : tenant
  Decision : policyVersion
  CommandIntent : commandId
  EventState : lifecycle
```

Las configuraciones `POLICY`, `ENRICHMENT` y `ROUTING` se versionan por tenant.
Su activación usa revisión/ETag, checksum y auditoría inmutable. Un snapshot
capturado no cambia durante el pipeline. Las decisiones son directivas; la
ejecución pertenece al Worker y el lifecycle al Event State Service.
