# Validación CACF

La base canónica de pruebas está en [testing](https://github.com/eventmgmtplatform/event-management-platform/blob/abd899c2c852828f3e0cbbdcfc63a6f1793f21cc/testing/README.md).
El éxito de automatización se ejecuta con `python3 testing/run.py cacf-remediated`.
La certificación completa del componente se ejecuta con
`python3 testing/run.py certification --name cacf-local-certification`.

Requiere el ambiente aislado de [operación CACF](operational-runbook.md).
Cubre CREATE, ACK, asociación de ticket, duplicados, reinicio, timeout, escalamiento,
callback desconocido, entrada Kafka y XML inválido. No certifica proveedores reales
ni el encadenamiento completo [UC-001](https://github.com/eventmgmtplatform/event-management-platform/blob/abd899c2c852828f3e0cbbdcfc63a6f1793f21cc/testing/cases/UC-001-happy-path.md).

Los resultados históricos se conservaron localmente en
`evidences/testing/imported/cacf-validation-historical.md`; las ejecuciones nuevas
escriben reportes bajo `evidences/testing/`. No guardar resultados en este documento.
