# Introducción

Event Management es una plataforma open source para operar el ciclo completo de
un evento: ingreso, normalización, procesamiento, integración, consolidación y
consulta. Separa transporte, decisión, ejecución y estado para que cada frontera
pueda auditarse y recuperarse.

## Capas del producto

1. **Gateway:** valida el envelope, conserva `originalEvent` y publica el evento.
2. **Processor:** evalúa políticas, enrichment, correlación, supresión y routing.
3. **Worker:** ejecuta intenciones durables contra las integraciones externas.
4. **ESS:** consolida resultados y proyecta lifecycle en PostgreSQL/OpenSearch.

PostgreSQL es autoridad de estado y Kafka es transporte con retención finita. La
consola React usa APIs same-origin y no accede directamente a bases de datos.

Consulta [Desarrollo local](local-development.md) para levantar el producto o
[Primer evento](first-event.md) para seguir un happy path E2E.
