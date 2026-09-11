# Changelogs por componente

Corte documental: **2026-09-10**. Historia reconstruida desde el primer commit local disponible (**2026-07-31**, `30817ba`). Se recorrieron todas las referencias Git locales; no se consultaron remotos ni se inventó historia anterior. El repositorio no es shallow.

Las fechas históricas son fechas de autor conservadas por Git, con su zona original; no prueban cuándo se desplegó o comenzó a desarrollarse una función. Un commit que incorpora trabajo acumulado no permite desglosarlo por fechas anteriores. La entrada Unreleased describe trabajo observado sin commit al corte y debe revisarse antes de publicar.

## Índice canónico

| Componente | Changelog |
|---|---|
| event-gateway | [Historial transversal](../CHANGELOG.md) |
| event-processor | [Historial](../event-processor/CHANGELOG.md) |
| event-state-service | [Estado del servicio](../event-state-service/README.md) |
| integration-worker | [Historial transversal](../CHANGELOG.md) |
| event-management-console | [Historial transversal](../CHANGELOG.md) |
| itsm-ticketing-dashboard | [Historial transversal](../CHANGELOG.md) |
| enrichment-engine | [Historial transversal](../CHANGELOG.md) |
| ServiceNow | [Historial](../servicenow/CHANGELOG.md) |
| GNM / Everbridge | [Historial](../gnm/CHANGELOG.md) |
| CACF / NEXT | [Historial](../cacf/CHANGELOG.md) |
| Infraestructura local y cloud | [Despliegue GCP](../../deployment/iac-gcp-kubernetes.md) |
| PostgreSQL / migraciones | [Arquitectura de datos](../../architecture/data.md) |
| Kafka / topics | [Kafka](../kafka/README.md) |
| Terraform / convenciones | [Terraform](../../reference/terraform.md) |
| Terraform GCP | [Despliegue GCP](../../deployment/iac-gcp-kubernetes.md) |
| Módulos cloud | [Despliegue GCP](../../deployment/iac-gcp-kubernetes.md) |
| Despliegue / CI-CD | [Despliegue GCP](../../deployment/iac-gcp-kubernetes.md) |
| Operación / scripts | [Runbook local](../../operations/local-runbook.md) |
| Contratos compartidos | [Historial transversal](../CHANGELOG.md) |
| Gobierno Git | [Historial](../git/CHANGELOG.md) |
| Documentación transversal | [Historial](../CHANGELOG.md) |
| Testing | [Cobertura documental](../../project/documentation-coverage.md) |

## Cómo mantenerlo

1. Actualizar el changelog del componente en el mismo cambio que modifica su código, contrato o configuración. Para varios componentes, registrar el impacto específico en cada uno.
2. Usar Unreleased con fecha de edición y categorías cuando ayuden: Agregado, Modificado, Corregido, Retirado, Migraciones/compatibilidad. Explicar qué cambia y por qué, sin afirmar que se publicó.
3. Al confirmar/publicar, enlazar el SHA real y mover la entrada al hito correspondiente. No inventar versiones semánticas ni fechas de release. Mantener sólo versiones documentadas.
4. Mantener este índice y el CHANGELOG raíz para cambios transversales. Las rutas antiguas deben apuntar al historial canónico.
5. Guardar resultados de pruebas, conteos, logs, hashes de ejecución y capturas exclusivamente en evidences/, ignorado por Git. El changelog puede describir una prueba agregada o la ruta para reproducirla, pero no sus resultados.
6. Los changelogs padre (Worker, infraestructura, documentación) agregan el alcance de sus subcomponentes; la repetición de un SHA en varios archivos es intencional. Las tablas/secciones de historia son trazabilidad por rutas modificadas. El mensaje original de un commit transversal se conserva como fuente; no implica que toda su funcionalidad corresponda a cada componente listado. Las rutas históricas pueden estar retiradas o movidas.

## Plantilla de entrada nueva

OEM Dashboards: [UI](../dashboards/architecture.md) ·
[API y CLI](../dashboards/api-management.md).

```markdown
## Unreleased — AAAA-MM-DD

### Modificado

- Cambio concreto y motivo; API/contrato/configuración afectados.

### Migraciones y compatibilidad

- Migración requerida, orden y efecto; estrategia de compatibilidad o reversión.

### Referencias

- Caso de uso o decisión de arquitectura; SHA al existir.
```

Los respaldos de los changelogs previos y el inventario de reconstrucción se conservan localmente en `evidences/changelog-reconstruction/2026-09-10/`. Su existencia no es una certificación funcional del producto.
