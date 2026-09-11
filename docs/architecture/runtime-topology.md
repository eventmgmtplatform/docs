# Topología del runtime local

Vista alineada con los servicios declarados en el `docker-compose.yml` entregado.

```mermaid
flowchart TB
  subgraph UX[Experience Layer]
    CONSOLE[event-management-console 8090]
    FM[frontend-management-api 8091]
    OSD[OpenSearch Dashboards 5601]
    KUI[Kafka UI]
  end
  subgraph CORE[Event Management Core]
    GW[event-gateway 8081]
    EP[event-processor 8082]
    IW[integration-worker 8083]
    ESS[event-state-service 8084]
  end
  subgraph DATA[Data & Streaming]
    K[(Kafka 9092)]
    PG[(PostgreSQL 5432)]
    OS[(OpenSearch 9200 / 9600)]
  end
  subgraph INT[Integration Foundation]
    SN[ServiceNow mock]
    GNM[GNM mock]
    NEXT[NEXT mock]
    GLPI[GLPI mock + API]
    AIOPS[AIOps mock]
  end
  CONSOLE --> FM
  FM --> GW
  FM --> EP
  FM --> ESS
  GW --> K
  K --> EP
  EP --> K
  K --> IW
  IW --> SN
  IW --> GNM
  IW --> NEXT
  IW --> GLPI
  IW --> K
  K --> ESS
  ESS --> PG
  ESS --> OS
  OSD --> OS
```

Además del core, el árbol `services/` revisado contiene `console-catalog-api`, `e2e-tool-api`, `enrichment-engine`, `frontend-management-api`, `glpi-ticketing-api`, `itsm-ticketing-dashboard`, `mock-secrets`, `oem-dashboards`, `oem-dashboards-api` y `product-observability`.

La presencia de un servicio o mock en el código no implica promoción productiva.
