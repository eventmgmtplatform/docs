# Desarrollo local con Docker Compose

La versión actual compartida usa `infrastructure/docker-compose.yml`.

```mermaid
flowchart LR
  Compose[Docker Compose] --> Kafka[(Kafka)]
  Compose --> PG[(PostgreSQL)]
  Compose --> OS[(OpenSearch)]
  Kafka --> G[event-gateway :8081]
  Kafka --> P[event-processor :8082]
  Kafka --> W[integration-worker :8083]
  Kafka --> E[event-state-service :8084]
  UI[Console :8090] --> BFF[Nginx / BFF]
  BFF --> G
  BFF --> P
  BFF --> E
  W --> M[Mocks locales :8181–8184]
```

```bash
cp .env.example .env
docker compose -f infrastructure/docker-compose.yml up -d --build
bash scripts/eventmanagement-services.sh health
bash scripts/eventmanagement-services.sh status
```

La consola queda en `http://localhost:8090`; los mocks de ServiceNow, GNM,
AIOps y NEXT son sintéticos. Para el E2E aislado se usa
`testing/environments/lifecycle.compose.yml`, con puertos `28081–28084`:

```bash
python3 testing/run.py certification --name lifecycle-prepare
python3 testing/run.py happy-path
```

No mezclar el laboratorio aislado con el Compose compartido ni usar bases
productivas. Detener el entorno compartido con:

```bash
docker compose -f infrastructure/docker-compose.yml down
```
