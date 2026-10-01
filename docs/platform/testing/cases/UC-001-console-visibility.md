# UC-001 — Validación de las pantallas publicadas

Complementa el PASS de procesamiento/API de `python3 testing/run.py happy-path`.
El informe declara `browserValidation: NOT_RUN` hasta realizar esta comprobación;
consultar un endpoint no demuestra que funcionan los controles React.
Usar el navegador ya disponible; no requiere instalar Chromium.

1. Tomar tenant, eventId, receiptId y eventKey del informe de esa ejecución.
2. En `http://localhost:8091/dashboards/data-collection`, buscar eventId y comprobar
   ID del evento e ID de recepción claramente etiquetados, con estado PUBLISHED.
3. En `http://localhost:8090/events`, seleccionar el mismo cliente. Comprobar su
   fila de evento (recorrer paginación si es necesario), estado CLOSED e ID original.
4. Consultar sucesivamente eventId, receiptId y eventKey con el formulario visible.
   Los tres deben abrir el mismo evento CLOSED y su historial; cerrar entre consultas.
5. En `http://localhost:8091/dashboards/events`, buscar eventId y comprobar la misma
   identidad/cliente/estado. El recibo identifica recepción, no una entidad ESS distinta.
6. Guardar resultado del navegador en evidencia con identidad de ejecución y versión
   publicada. No sobrescribir el resultado de una ejecución distinta ni declarar
   verificación visual a partir de respuestas HTTP. Fallar si hay 404, historial
   incorrecto, tenant distinto o estado inconsistente.

El evento de origen y la situación correlacionada son filas distintas. El ticket y
confirmaciones de proveedores pertenecen a la situación; no se copian al origen.
