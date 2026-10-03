# Matriz por arquitectura

Doce dimensiones con límites; LAB19 aporta transporte de push acotado, no DR global.

| Dimensión | Keep | OEM | Decisión | Evidencia |
|---|---|---|---|---|
| Despliegue | Backend/Next dev/Soketi; SQLite en checkout observado | Servicios independientes y buses/proyecciones | REUSE fronteras OEM; no copiar perfil dev | P06/P18; L13.O08; L15.O03–O06 |
| Modelo de autoridad | Alert histórico + LastAlert + Incident | Processor decisión/grupo; ESS lifecycle; Worker integración | Ownership explícito; Incident propuesto no reemplaza ESS | P10/P15; N01/N02 |
| Transacción | Commits Alert/current y finalización workflow separados | Processor procesamiento/correlación/dedup/comando/outbox transaccional | No extender atomicidad a ESS/Search/remote effects | P13/P15; L15.O03/O04 |
| Identidad | fingerprint/hash provider; FULL salta CEL por evento | transport id/eventKey/fingerprint/processingId separados; FULL continúa | Preservar política OEM, no copiar filtro FULL | P08/P09/P10; N06 |
| Configuración | Rule mutable; WorkflowVersion separada | RuleSnapshot/revision/checksum; policy dedup inmutable | Pin por decisión y administración trazable | P09/P13/P14; L14.O02/O05 |
| Entrega | Queue workflow RAM, retry de Step | Command→Worker→result; CACF REVIEW/UNKNOWN; outbox con redelivery | Conservar ledger y reconciliación; no exactly-once externo | P11/P13; L13.O04/O05 |
| Proyecciones | LastAlert; index fuera del commit relacional | ESS SQL → OpenSearch bajo lock/relectura; Kafka redelivery | Visibilidad eventual + reconstrucción/lag | P15; L15.O04/O05/O06 |
| Control administrativo | Modos auth heterogéneos; GET con efectos | Processor actor declarado; ESS auth distinto; Console proxy | Contrato por operación y gate exposición | P16/P17; N04/N09 |
| Experiencia operador | Producto integrado con vistas workflow/provider/Incident | Console ya tiene editors/simulation/explain/catalogs | Adaptar navegación por lineage y completar gestión dedup | N05/N07/N08/N15 |
| Observabilidad | Logs best effort; metrics de estado/operación separadas | Readiness DB/Kafka + snapshots + domain IDs | Métricas por transición y continuidad trazable | P17; L17.O01/O02/O05 |
| AI y enrichment | Mapping/topology/LLM/plugin rutas distintas | Enrichment tipado/provenance + AIOps REST mock aislado | Reusar lo existente, evaluación/historial humano futuros | P12; N10–N17 |
| Resiliencia/costo | Restart controlado, benchmark health y outage Soketi P19; health sano con push degradado, sin replay/browser probado. | Fundaciones source + evidencia histórica acotada; comparación global pendiente | DEFER RTO/RPO/TCO; no interpretación de imagen como capacidad | P06/P18/P19; N21 |
