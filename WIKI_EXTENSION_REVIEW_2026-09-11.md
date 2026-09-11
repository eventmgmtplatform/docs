# Wiki Extension Review — 2026-09-11

## Base revisada
- `event-mgmt-docs-main(1).zip`
- `event-management-platform-main.zip`

## Estrategia
Extensión aditiva: no se eliminaron páginas existentes.

## Incorporado
- Flujos ejecutados end-to-end.
- Topología runtime derivada del compose entregado.
- Índice global de Defect Prevention.
- Índice de integraciones.
- Cobertura documental.
- Navegación MkDocs ampliada para exponer documentación ya presente en `docs/platform/`.

## Rama recomendada
`feature/docs-wiki-platform-extension-20260911`, con PR hacia `main`.

## Validación antes de push
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-docs.txt
mkdocs build --strict
git status
git diff --check
```

## Publicación
```bash
git checkout main
git pull --ff-only origin main
git checkout -b feature/docs-wiki-platform-extension-20260911
# copiar el contenido del ZIP sobre el checkout
git add .
git commit -m "docs: extend wiki with platform architecture flows and defect prevention"
git push -u origin feature/docs-wiki-platform-extension-20260911
```
