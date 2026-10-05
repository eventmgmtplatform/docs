# UMC API Conformance — UMC-API-01

**Discovery baseline:** current repository evidence only. No product API, runtime, or contract was changed by this inventory.

## Scope and assessment

UMC-API-01 inventories the APIs that exist today and compares their documented
capabilities with the UMC-01 target resource/action model. It is not an API
implementation plan and does not create a universal REST endpoint catalogue.

**Overall assessment: YES_WITH_GAPS.** Existing APIs provide useful governed
surfaces for rules, state, dashboards, catalogues and operational control, but
there is no single API implementing every UMC resource and action. The gaps are
recorded below; no remediation is started here.

## Current API surface tree

```text
Management / control plane
├── Frontend Management API
│   ├── /api/administration/platform
│   ├── /api/administration/sources
│   └── /api/administration/operations
├── Console Catalog API
│   ├── /api/catalog/customers
│   ├── /api/catalog/filters
│   └── /api/catalog/views/{view}
├── Event Gateway rules
│   └── /api/v1/gateway/rules
├── Event Processor administration
│   ├── /api/v1/rules
│   ├── /api/v1/aiops
│   ├── /api/v1/simulations
│   └── /api/v1/explain/{processingId}
└── Integration operational control
    └── /integration/control

Runtime / data plane
├── Event State Service
│   ├── GET /api/v1/state/events
│   ├── GET /api/v1/state/event
│   ├── GET /api/v1/state/history
│   └── GET /api/v1/state/quarantine
├── Dashboard BFF
│   ├── GET /api/dashboards/{events|ticketing|gnm|cacf|delivery|data-collection}
│   ├── GET /api/dashboards/config
│   ├── GET /health
│   └── GET /ready
└── Integration/provider adapters
    ├── ServiceNow, GLPI and GNM provider calls
    └── CACF admission/callback APIs
```

The OpenAPI reference is a contract source, not proof that every route is
available in every deployment. The administration inventory records runtime
observations and explicitly distinguishes authentication evidence from proof
of an authenticated state change.

## API surface matrix

| Surface | Owner | Evidence | UMC role | Status |
| --- | --- | --- | --- | --- |
| Frontend Management API | Frontend management service | `/api/administration/platform`, `/sources`, `/operations` | Product/service lifecycle and operational control | PARTIAL |
| Console Catalog API | Console catalog service | `/api/catalog/customers`, `/filters`, `/views/{view}` | Catalogue/resource reads and CRUD where documented | PARTIAL |
| Gateway rules API | Event Gateway | `/api/v1/gateway/rules` | Rule deployment, validation and simulation | PARTIAL |
| Processor administration | Event Processor | `/api/v1/rules`, `/aiops`, `/simulations`, `/explain/{processingId}` | Rules, AIOps and explainability | PARTIAL |
| ESS administration API | Event State Service | `docs/event-state-service/admin-api.md` | State/history/quarantine reads | PARTIAL |
| Dashboard BFF | OEM Dashboards API | `/api/dashboards/*`, `/config`, `/health`, `/ready` | Read/query surface; no public mutation | EXISTING |
| Integration operational control | Integration Worker | `/integration/control` | Operational mode control | PARTIAL |
| Provider registration | Integration management | Existing provider configuration and adapters | Integration/provider lifecycle | DESIGNED / FRAGMENTED |
| Secrets | Local MockSecrets and environment boundaries | `/mock-secrets` in the local OpenAPI contract | Laboratory/reference only; not production UMC | MOCK |

## Control plane and data plane

The control plane contains management, catalogue, rule, configuration and
operational-control APIs. The data plane contains event ingestion/processing,
ESS state and provider execution. Dashboard routes are read/query surfaces over
the derived presentation contract. Kafka remains transport/replay, PostgreSQL
remains the operational source of truth, and OpenSearch remains a derived
projection; no API surface changes that authority model.

## UMC resource/action conformance

`EXISTING` means an equivalent capability is evidenced. `PARTIAL` means a
subsystem-specific or incomplete capability. `MISSING` means no common API was
found. `CONFLICTING` is reserved for an evidenced governance bypass.

| Resource | Actions evidenced today | Status | Gap against UMC |
| --- | --- | --- | --- |
| Internal products/services | get/list/status/start/stop/restart through management control | PARTIAL | No common product-resource lifecycle contract |
| Datasources | catalogue/source configuration and dashboard source operations | PARTIAL | No universal datasource identity and lifecycle API |
| Rules | list/get/create/validate/enable/disable/retire in processor/gateway-specific contracts | PARTIAL | Separate contracts and route families |
| Policies | policy/filter criteria used by processing and catalogues | MISSING | No evidenced common policy lifecycle API |
| Integrations/providers | adapter execution, operational control and provider-specific configuration | PARTIAL | Registration, secret references and lifecycle are not uniform |
| Scripts | operational/bootstrap scripts | MISSING | No governed script resource API |
| Configuration | component-specific configuration and catalogue APIs | PARTIAL | Scope and revision semantics vary |
| Environment/bootstrap | deployment and administration utilities | PARTIAL | No idempotent universal bootstrap API |
| State/lifecycle | ESS event, history and quarantine reads | EXISTING | Mutations, rebuild and UI remain outside this API |
| Query/read model | dashboard domain queries, config, health and readiness | EXISTING | Read-only BFF contract; not a management mutation surface |

No `CONFLICTING` API was identified in this evidence pass.

## API contract observations

- The OpenAPI reference defines catalog, processor rules, blackouts, AIOps,
  local mock secrets and dashboard query paths. It requires tenant context for
  the documented tenant-scoped operations and uses revision/idempotency headers
  where specified.
- ESS is a read API in the current baseline. Tenant event, event detail and
  history queries use `X-Tenant-Id` plus the configured ESS admin token; the
  quarantine summary uses a separate operator permission. The companion
  `event-state-admin.py` and `emctl event-state-service admin|test` commands
  consume this surface. Mutations, central authentication and UI are pending.
- The Dashboard BFF exposes domain reads, source configuration, health and
  readiness. Its contract is deliberately read-only and does not expose SQL,
  shell, ingestion, secrets or provider-native mutations.
- GLPI's `/initSession`, `/killSession`, ticket creation, lookup and update
  routes are external GLPI REST APIs called by the provider adapter. They are
  not OEM Management API resources. ServiceNow and CACF have the same boundary:
  provider APIs/callbacks are integration contracts, not a universal OEM
  provider-registration API.
- Provider registration and secret-reference management remain designed or
  fragmented where no common endpoint is evidenced. This inventory does not
  promote a provider-specific route to a UMC endpoint.

## Resource/action matrix

| UMC resource | create/register | get/list | update/configure | test/validate | enable/disable | delete/retire |
| --- | --- | --- | --- | --- | --- | --- |
| Product/service | PARTIAL | EXISTING | PARTIAL | EXISTING | EXISTING | MISSING |
| Datasource | MISSING | PARTIAL | PARTIAL | PARTIAL | PARTIAL | MISSING |
| Rule | EXISTING | EXISTING | PARTIAL | EXISTING | EXISTING | PARTIAL |
| Policy | MISSING | PARTIAL | MISSING | MISSING | MISSING | MISSING |
| Integration/provider | DESIGNED | PARTIAL | PARTIAL | PARTIAL | PARTIAL | MISSING |
| Script/bootstrap | MISSING | MISSING | PARTIAL | PARTIAL | MISSING | MISSING |
| Configuration | PARTIAL | EXISTING | PARTIAL | PARTIAL | PARTIAL | MISSING |

## CLI ↔ API reuse

| CLI surface | API/resource relationship | Reuse assessment |
| --- | --- | --- |
| `emctl event-state-service admin|test` and `event-state-admin.py` | ESS state/history/quarantine reads | REUSES EXISTING API |
| `emctl ui oem-dashboards ...` and dashboards CLI | Dashboard source/config, health and readiness | REUSES EXISTING API/CLI boundary |
| Gateway rules deployment utility | Gateway rules API | REUSES SUBSYSTEM API |
| Processor administration utilities | Processor rules/AIOps/simulation APIs | REUSES SUBSYSTEM API |
| Integration/provider commands | Provider adapters and operational control | PARTIAL; no common registration contract |
| Kafka, Terraform and bootstrap tools | Infrastructure and deployment surfaces | OUTSIDE UNIVERSAL MANAGEMENT API |

UMC-CLI-01 remains the authoritative CLI inventory. This page records API
reuse only; it does not create CLI commands or alter the approved matrix.

## Findings and BAU follow-up

1. Establish a common identity, authorization, secret-reference and audit
   boundary before claiming a universal management API.
2. Define resource identity, versioning, validation, errors, result envelopes
   and correlation/audit events shared by API and CLI surfaces.
3. Converge datasource, policy, provider, configuration and bootstrap lifecycle
   contracts behind the existing subsystem APIs.
4. Keep provider-native ServiceNow/GLPI/CACF endpoints behind adapters; they are
   not UMC resources.

These are inventory findings only. UMC-WEB-01, UMC-DATA-01 and implementation
work are not started by UMC-API-01.

## Evidence index

- `docs/api/openapi.yaml` — reference OpenAPI contract.
- `docs/administration-api-inventory.md` — runtime administration inventory.
- `docs/event-state-service/admin-api.md` — ESS API and CLI evidence.
- `docs/dashboards/contracts.md` — Dashboard BFF read contract.
- `docs/integrations/glpi.md` — provider-native GLPI boundary.
- `docs/cacf/contracts.md` and `docs/cacf/README.md` — CACF admission/callback boundary.
- [UMC-CLI-01 CLI Conformance](cli-conformance.md) — approved CLI baseline.
- [OEM Universal Management Contract](../universal-management-contract.md) — target semantics.
