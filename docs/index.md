<div class="oem-home-intro" markdown>

<span class="oem-home-intro__eyebrow">Documentation</span>

# Open Event Management

Documentación de producto para la plataforma de gestión de eventos operativos.
Este portal explica cómo se integra cada servicio, cómo ejecutar el entorno local
y cómo seguir un evento desde su entrada hasta su estado final.

</div>

## Explore la documentación

<div class="oem-quick-links">
  <a class="oem-quick-link" href="architecture/oem-architecture-definition/"><strong>Architecture</strong><span>Definición maestra, arquitecturas Golden y vistas cross-cutting.</span></a>
  <a class="oem-quick-link" href="platform/"><strong>Platform</strong><span>Servicios, integraciones y evidencia de implementación.</span></a>
  <a class="oem-quick-link" href="operations/local-runbook/"><strong>Operations</strong><span>Runbooks, observabilidad, incidentes y recuperación.</span></a>
  <a class="oem-quick-link" href="development/contributing/"><strong>Development</strong><span>Contribución, estándares, pruebas y releases.</span></a>
  <a class="oem-quick-link" href="reference/api/"><strong>Reference</strong><span>APIs, eventos, configuración y Terraform.</span></a>
  <a class="oem-quick-link" href="architecture/d6-environment-evolution/"><strong>Deployment</strong><span>Mapa de ambientes y perfiles de despliegue OEM.</span></a>
</div>

## Qué resuelve el producto

Event Management recibe señales de monitoreo, conserva el evento original,
normaliza su contrato, aplica políticas y enriquecimiento, decide acciones de
integración y proyecta el estado consultable. La consola WebGUI administra estas
capacidades mediante APIs same-origin; no accede directamente a bases de datos.

## Arquitectura principal

```mermaid
flowchart LR
  S[Fuentes: Zabbix y otros productores] --> G[event-gateway\n8081]
  G --> R[(events.raw)]
  R --> P[event-processor\n8082]
  P --> C[(PostgreSQL\nreglas, auditoría, outbox)]
  P --> I[integration.commands]
  I --> W[integration-worker\n8083]
  W --> X[ServiceNow / GLPI]
  W --> N[GNM / CACF / NEXT]
  W --> O[(integration.results)]
  O --> E[event-state-service\n8084]
  E --> Q[(PostgreSQL\nestado e historial)]
  E --> OS[(OpenSearch\neventos actuales)]
  UI[Console React\n8090] --> B[Nginx / BFF same-origin]
  B --> G
  B --> P
  B --> E
  B --> D[Dashboards operativos]
  D --> C
```

## Librería de arquitectura principal

```mermaid
flowchart TB
  subgraph Entrada
    Envelope[Envelope del evento]
    Normalize[Normalización e idempotencia]
  end
  subgraph Decisión
    Snapshot[Snapshot versionado por tenant]
    Policy[POLICY]
    Enrich[ENRICHMENT / INVENTORY]
    Correlation[CORRELATION]
    Routing[ROUTING]
  end
  subgraph Ejecución
    Commands[Command intent durable]
    Worker[Adaptadores de integración]
    Result[Resultado idempotente]
  end
  Envelope --> Normalize --> Snapshot
  Snapshot --> Policy --> Enrich --> Correlation --> Routing
  Routing --> Commands --> Worker --> Result
  Result --> State[Estado y lifecycle]
  State --> Evidence[Auditoría, explain y observabilidad]
```

La documentación detallada está en [Arquitectura](architecture/index.md),
[Modelo de dominio](concepts/domain-model.md) y [Flujo de eventos](concepts/event-flow.md).

## Documentación ampliada

- [Flujos de solución ejecutados](architecture/solution-flows.md)
- [Topología del runtime local](architecture/runtime-topology.md)
- [Defect Prevention global](project/defect-prevention.md)
- [Cobertura documental](project/documentation-coverage.md)
- [Administración e integraciones de plataforma](platform/service-administration.md)
