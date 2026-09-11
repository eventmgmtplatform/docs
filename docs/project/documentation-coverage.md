# Cobertura documental incorporada

**Corte:** 11 de septiembre de 2026.

La wiki se revisó contra el código entregado de `event-management-platform`. `docs/platform/` ya contenía una réplica amplia de la documentación técnica de la plataforma; esta extensión preserva ese contenido y mejora su descubrimiento.

| Área | Cobertura |
|---|---|
| Arquitectura | Contexto, componentes, datos, seguridad, despliegue, GCP, flujos y topología. |
| Event Processor | Reglas, blackouts, correlación, auto-suppression, enrichment/inventory, routing, AIOps, ADR y DP. |
| Event State Service | Baseline, lifecycle, API administrativa, validación, gaps, ADR y DP. |
| Integraciones | ServiceNow, GLPI, GNM y CACF/NEXT. |
| Frontend / dashboards | Arquitectura, contratos, fuentes, delivery, apariencia, observabilidad y validación. |
| Kafka | Instalación, certificación, configuración, Web UI y CLI. |
| Operación | Servicios, runbooks, incidentes, observabilidad y DR. |
| Git | Gobierno, ramas, commits, publicación e índice. |
| Defect Prevention | Índice global y registros específicos. |

## Hallazgos

- No se eliminó documentación existente.
- La documentación de `docs/platform/` comparada con `event-management-platform/docs` estaba alineada; la wiki además conserva PKC JSON/timeline de CACF.
- El compose revisado declara el core, Kafka, PostgreSQL, OpenSearch, consola y mocks/adaptadores.
- Se añadieron vistas transversales de flujo, runtime, integraciones y Defect Prevention.
