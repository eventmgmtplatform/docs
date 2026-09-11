# Entrega directa a gh-pages

Esta entrega está preparada exclusivamente para la rama `gh-pages` de `eventmgmtplatform/event-mgmt-docs`.

No crear branch feature para este paquete.

## Aplicación
```bash
git clone https://github.com/eventmgmtplatform/event-mgmt-docs.git
cd event-mgmt-docs
git fetch origin
git checkout gh-pages
git pull --ff-only origin gh-pages

# respaldar primero si el árbol de gh-pages contiene artefactos publicados distintos
# copiar/sincronizar el contenido del ZIP según la estrategia actual del repo

git status
git diff --check
git add .
git commit -m "docs: expand V1 architecture foundations and defect prevention"
git push origin gh-pages
```

## Importante
El ZIP conserva el proyecto fuente MkDocs recibido y lo amplía. Antes de sobrescribir una rama `gh-pages` que contenga únicamente HTML generado, verificar el modelo de publicación del repositorio. Si `gh-pages` es el source branch, copiar el árbol directamente; si es output generado, construir primero MkDocs y publicar `site/`.
