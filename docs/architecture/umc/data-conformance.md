# UMC Data Conformance — UMC-DATA-01

**Discovery baseline:** documentation repository `7d625f8d84faea229fc13635f2963c67b40510c1`; product repository `7ece6cbb6167876458c6390c420f54728510d6f6`. This is a read-only source inventory. No database, product code, migration, bootstrap, seed, backup, restore, or runtime was executed or modified.

## Executive assessment

**PostgreSQL as a management surface: LIMITED_GOVERNED_SURFACE.** Direct PostgreSQL scripting is appropriate for controlled schema initialization, additive migration, deployment-owned backup/verification, and narrowly governed bootstrap or bulk configuration. It is not a first-class peer for normal Web/CLI resource administration and must not mean arbitrary SQL access.

**Normal Web/CLI administration bypassing Management API: SPECIAL_CASES_ONLY.** Normal resource changes should use the owning service/API. Direct scripts remain justified for deployment migrations, initial role/bootstrap work, recovery validation, and explicitly approved bulk initialization where they preserve validation, authorization, audit, transactionality, compatibility, and tenant/environment scope.

The current repository already contains strong subsystem controls—bound parameters, transactions, immutable revisions, idempotency ledgers, optimistic revisions, row locks, RLS in selected domains, and audit tables—but these controls are not uniform across scripts or services. There is no common UMC scripting contract, global migration runner, universal operator identity, or single audit/result envelope.

## Data authority and stores

The approved authority model is confirmed, not redesigned:

| Store | Role | Authority | Writers | Readers | UMC relevance |
| --- | --- | --- | --- | --- | --- |
| PostgreSQL | Operational state, configuration, ledgers, history, outboxes | **AUTHORITATIVE** for OEM operational state | Gateway, Processor, Worker/CACF, ESS, Console Catalog API, collection library; controlled migrations/scripts | Owning services, BFF read adapters, operational tools | Resource administration and governed scripts; runtime data-plane writes stay service-owned |
| OpenSearch | Search/analytics projection | **DERIVED** | ESS projection path | Dashboards/operations | Rebuild/recovery orchestration only; never an independent management authority |
| Kafka | Events, commands, results and replay | **TRANSPORT** | Gateway, Processor, Worker, ESS-related publishers | Domain consumers and operational tooling | Topic/config administration is operational infrastructure, not authoritative resource mutation |
| SQLite | Local operation records and synthetic secret/provider state | **LOCAL** | Frontend Management API operation store; local mocks | Same local services | Local-only/test state; not promoted to UMC operational authority |
| Filesystem/config JSON | Dashboard source selection, environment/deployment config, ignored secret files, evidence | **LOCAL / DECLARATIVE** | CLI/deployment/bootstrap tools | Services and operators | Candidate for governed config/bootstrap; secrets must remain references |
| Browser `localStorage` | Language, theme, columns, navigation and operation IDs | **LOCAL** | Browser | Browser | Preferences only; never resource authority |
| Browser `sessionStorage` | Exact pending request for uncertain UI mutations | **TRANSIENT** | Browser | Browser | Retry-safety aid, not authoritative state |
| External ServiceNow, GLPI, GNM/Everbridge, CACF/NEXT, webhooks | Provider-owned external objects | **EXTERNAL** | Provider adapters/external systems | Integration adapters | Provider objects remain externally authoritative; OEM stores configuration, references and execution evidence |

Evidence: `docs/architecture/data-authority-replay.md`; `infrastructure/docker-compose.yml`; `services/event-state-service`; `services/event-processor`; `services/integration-worker`; `services/event-gateway`; `services/console-catalog-api`; `services/oem-dashboards-api/dashboard.py`; `services/frontend-management-api/control.py`; `services/mock-secrets`; Web console storage calls.

## PostgreSQL ownership

There are two primary schemas plus the collection configuration schema. The list below is an administrative boundary inventory, not a physical data dictionary.

| Schema/domain | Major objects | Primary writer/owner | Administrative surface |
| --- | --- | --- | --- |
| `event_management` ingress | `gateway_receipt`, `gateway_receipt_status`, gateway rules/mapping and ingress bindings | Event Gateway | Gateway rule API/deployment utility; migrations 025–033 |
| `event_management` event lifecycle | `event_state`, `ess_state_request`, `ess_event_transition`, `ess_quarantine` | ESS | Runtime Kafka processing; read-only ESS admin API; migrations 002/016/017 |
| `event_management` integration delivery | `integration_command_execution`, worker control/checkpoints, GLPI state | Integration Worker, ESS result processing | Worker operational-control API; migrations 003–007/021/027 |
| `event_management` CACF | automation execution, provider message/result/outbox/dispatch | Integration Worker CACF runtime | CACF APIs and runtime; migration 008 |
| `event_management` catalog/configuration | customers, delivery filters/targets, integrations/connections/revisions, secret metadata/usage, ticketing/notification/automation profiles | Console Catalog API | Same-origin Web/BFF API; migrations 022/023/028/036–050 |
| `event_processor` runtime | processing records, output outbox, correlation, command and lifecycle ledgers | Event Processor | Runtime Kafka/application services; migrations 009/010/013/014/020/029 |
| `event_processor` configuration | rule definitions/versions/changes, AIOps config/change, dedup policies/transitions/admin audit | Event Processor | Processor administration API; migrations 011/012/015/029/034/035/044/045 |
| `data_collection_config` | alert templates/revisions, audit, send attempts | Dashboard collection API/library | Authenticated library/API boundary with RLS; migration 032 |
| `dashboard_read` | dashboard views | No independent writer; projections over authoritative tables | OEM Dashboards API read-only adapter; migrations 018/024/027/033/045–051 |

PostgreSQL is the operational source of truth, but ownership remains with domain services. Sharing one database does not authorize cross-domain ad-hoc writes.

## Migration and bootstrap inventory

`infrastructure/postgres/init/001-...051-*.sql` is the versioned, ordered SQL baseline. Fresh Docker volumes mount it read-only at `/docker-entrypoint-initdb.d`; existing volumes do **not** re-run new files. Files are generally additive and frequently use `IF NOT EXISTS`, guarded `ALTER`, explicit `BEGIN/COMMIT`, constraints, triggers, RLS, grants, and seed-style `ON CONFLICT`. The repository has no global migration framework recording applied versions and checksums for every existing environment.

| Script/mechanism | Type | Domain | State change | Validation / transaction | Audit / evidence | Idempotent | UMC candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `init/001`, `002` | BOOTSTRAP / INITIALIZATION | Core platform/config; ESS state | DDL + default config | Constraints; partial explicit transactions | Git history/changelog | Mostly (`IF NOT EXISTS`, conflict handling) | Internal bootstrap contract |
| `init/003`–`007`, `021`, `027`, `028` | SCHEMA MIGRATION | Worker delivery/idempotency/control/GLPI/config revision | DDL + compatibility rows | Guarded DDL/checks; some files lack an outer transaction | Git/changelog; runtime ledgers | Designed repeatable | Internal migration |
| `init/008` | SCHEMA MIGRATION | CACF | Transactional DDL | `BEGIN/COMMIT`, constraints/indexes | Git/changelog | Repeatable DDL | Internal migration |
| `init/009`–`015`, `020`, `029`, `034`, `035`, `044`, `045-dedup` | SCHEMA MIGRATION / CONFIGURATION | Processor runtime, rules, AIOps, dedup, lifecycle | DDL + tenant baseline | Explicit transactions; immutable-history triggers and checks in later migrations | Admin audit/transition tables + Git | Mostly repeatable; baseline insert conflict-safe | Internal migration; governed initial policy provisioning where approved |
| `init/016`, `017` | SCHEMA MIGRATION | ESS quarantine/lifecycle | DDL | Additive constraints/indexes; 017 is not wrapped by explicit `BEGIN` | Git/deployment evidence | Repeatable DDL | Internal migration |
| `init/018`, `024`, `027`, `033`, `045-plugin`, `046`–`051` | SCHEMA MIGRATION / READ PROJECTION | Dashboards/catalog | Views, grants, compatibility columns and selected baselines | Closed view definitions; many transactional | Git/changelog | Mostly repeatable | Internal migration |
| `init/022`, `023`, `036`–`043`, `050` | SCHEMA MIGRATION | Customers, filters, identities, secrets, connections and provider profiles | DDL + baseline/backfill | Transactions, constraints, revisions, selected RLS | `console_catalog_audit` plus Git | Mostly repeatable | Internal migration; bootstrap wrapper candidate |
| `init/025`, `026`, `030`, `031` | SCHEMA MIGRATION | Gateway receipts/rules/identity/mapping | DDL, triggers, views | Transactions, immutability triggers and checks | Rule history/receipts + Git | Repeatable | Internal migration |
| `init/032` | SCHEMA MIGRATION | Data collection library | DDL/RLS/policies | One transaction, tenant policies, immutable revision/audit triggers | DB audit + Git | Repeatable | Internal migration |
| `scripts/dashboards/bootstrap-console-catalog.py` | BOOTSTRAP / INITIALIZATION | Console configuration | Executes selected migrations, creates restricted login/grants, optional seed | `ON_ERROR_STOP`; generated secret validation; each call separate | Terminal result; DB audit applies to later API writes | Largely repeatable, but no all-or-nothing transaction across the sequence | **GOVERNABLE** bootstrap candidate |
| `scripts/dashboards/deploy.py` | BOOTSTRAP / SEED / DEVELOPER TOOL | Dashboard views/demo | Migrations, role/grants, demo seeds | `ON_ERROR_STOP`; schema check | Script output | Seeds use conflict-safe writes | Governed lab/bootstrap candidate, not normal administration |
| `seed-console-catalog.sql` | SEED / SAMPLE DATA | Customers/filters | Synthetic rows | `BEGIN/COMMIT`, `ON CONFLICT` | Origin fields/Git | Yes | Test/local bootstrap only |
| `seed-demo.sql`, `seed-delivery-demo.sql` | SEED / SAMPLE DATA | Dashboard demos | Synthetic table/rows | `BEGIN/COMMIT`, conflict-safe writes | Git | Yes | TEST_ONLY |
| `event-processor-deploy.py`, `event-state-deploy.py`, `event-state-lifecycle-deploy.py`, `cacf-gnm-activate.py` | OPERATIONAL ADMINISTRATION / SCHEMA MIGRATION | Processor, ESS, Worker, CACF/GNM | Backup, migrations, image rollout | `ON_ERROR_STOP`, hashes, health checks; additive schema retained on image rollback | Timestamped reports/logs/checksums | Partially; migration SQL repeatable, deployment not universally retry-safe | **GOVERNABLE** deployment orchestration |
| `gateway-rules-deploy.py`, `scripts/dashboards/deploy-collection.py` | SCHEMA MIGRATION / CONFIGURATION | Gateway rules/collection | Applies migration and configuration | `ON_ERROR_STOP`; subsystem validation | Evidence/output | Partial | Prefer owning API for normal changes; wrapper needed for bootstrap |
| `event-processor-recovery.py` | TEST / CERTIFICATION / BACKUP-RESTORE | Processor | Disposable DB create/load/dump/restore/drop | Isolated names, assertions, checksums | Dedicated evidence | Test-controlled | TEST_ONLY; patterns reusable by Operations |
| `consolidate-environments.py` | MAINTENANCE / BACKUP-RESTORE | Environment DBs | Dumps, creates restore DB, verifies counts, drops temporary DB | Explicit verification and cleanup | Timestamped report and protected dumps | Operationally controlled, not declarative | Operations-owned; requires formal runbook/authorization |
| `event-state-discovery.py` | TEST / CERTIFICATION | ESS | Read-only schema/runtime inspection | SELECT only | Evidence JSON | Yes | NOT_APPLICABLE to state changes |
| `SN-02.9E-owner-guarded-package/scripts/*` | LEGACY / SUPERSEDED package | ServiceNow worker ledger/control | Direct installation SQL | Owner/preflight guards | Package evidence | UNKNOWN against current baseline | Isolate; do not promote without reconciliation |

The numbered SQL migrations should remain internal deployment artifacts. UMC may govern **invocation**, provenance, authorization, environment targeting, checksums, and result evidence; it should not expose raw migration SQL as normal user actions.

## Runtime write paths

| Domain | Initiator → interface → writer | Validation / transaction / audit | Boundary | Authority | UMC relevance | Status | Evidence | Gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gateway ingress | HTTP ingress → Event Gateway → `GatewayReceiptStore` → receipts/status | Prepared statements; original body protection; status transitions | SERVICE_GOVERNED | PostgreSQL | Runtime/data-plane, not UMC administration | EXISTING | `GatewayReceiptStore.java`, migrations 025/030 | Common operational audit remains separate |
| Processor execution | Kafka event → application pipeline → `PostgresProcessingUnitOfWork`/stores → processing/outbox/correlation/dedup/lifecycle | JTA/transactions, tenant lock, idempotency, outbox, immutable evidence | SERVICE_GOVERNED | PostgreSQL | Runtime/data-plane | EXISTING | Processor PostgreSQL adapters, migrations 009–015/020/029 | None for UMC resource management |
| Worker delivery | Kafka command → Worker → `JdbcIntegrationCommandLedger` / recovery → integration ledger | Prepared statements, idempotency, checkpoints, recovery leases | SERVICE_GOVERNED | PostgreSQL + external provider | Runtime/data-plane | EXISTING | Worker ledger/recovery classes, migrations 004/005/007/021 | Provider config is separate management plane |
| CACF automation | API/Kafka/provider callback → `AutomationRepository` → automation state/outbox/result | Transactions, row locks, dedup hashes, provider dispatch ledger | SERVICE_GOVERNED | PostgreSQL + external CACF/NEXT | Runtime/data-plane | EXISTING | `AutomationRepository.java`, migration 008 | No UMC bypass identified |
| ESS lifecycle | Kafka state/results → ESS repositories → state/request/history/quarantine | One transaction for request/current/history; advisory locks; idempotent request ledger | SERVICE_GOVERNED | PostgreSQL | Runtime/data-plane; retain ESS authority | EXISTING | `StateTransitionRepository.java`, `EventStateRepository.java`, migrations 002/016/017 | No state-changing admin API is evidenced |
| Search projection | ESS projection → OpenSearch | Derived publication after state processing | SERVICE_GOVERNED | OpenSearch DERIVED | Runtime projection | EXISTING | ESS projection code/docs | Recovery/rebuild governance remains operational |

## Administrative write paths

| Domain | Initiator → interface → writer → object | Boundary | Controls/evidence | UMC status | Gap |
| --- | --- | --- | --- | --- | --- |
| Customers and delivery filters | Browser → Nginx → Console Catalog API → PostgreSQL | BFF_GOVERNED | JSON/action header, validation, tenant/reference checks, stale revision, transaction-coupled `console_catalog_audit` | PARTIAL | Local/default mode is not universal authenticated RBAC |
| Datasources/connections | Browser/API → Console Catalog `data_sources.py` → integration config, operation/revision, secret usage | BFF_GOVERNED | Provider registry, secret-reference validation, operation idempotency/MAC, revisions, audit | PARTIAL | Common UMC resource/result envelope absent |
| Customer/provider links | Browser/API → `customer_origins.py` → connection links | BFF_GOVERNED | Locks, usage guards, revision, audit | PARTIAL | Shared authorization depends on configured mode |
| Ticketing/notification/automation profiles | Browser/API → profile modules → versioned account/profile tables | BFF_GOVERNED | Customer/link validation, immutable revisions, logical disable, audit | PARTIAL | Provider lifecycle fragmented across modules |
| Secret metadata | Browser/API → `secret_library.py` → metadata/version/usage + external vault operation | BFF_GOVERNED | No secret value in PostgreSQL response, operation lock/idempotency, audit, secret references | PARTIAL | Vault deployment/identity is environment-specific |
| Processor rules/AIOps/dedup | Browser/CLI → Processor admin HTTP resources → PostgreSQL adapters | API_GOVERNED | request IDs, validation, `If-Match`, versions, logical delete/retire, admin audit/transition history | EXISTING | Semantics are subsystem-specific, not common UMC |
| Gateway rules | CLI → gateway rule API/deploy helper → gateway rule/history | API_GOVERNED for API; SCRIPT_GOVERNED/DIRECT_SQL for deploy helper | API validation/history; helper uses `ON_ERROR_STOP` | PARTIAL | Converge normal changes on API; retain SQL only for migration/bootstrap |
| Worker operating mode | Operator/API → `/integration/control` → worker control row | API_GOVERNED | validation and durable control state | PARTIAL | Subsystem auth/result model |
| Dashboard source selection | Operator CLI → config validation → atomic JSON replacement | SCRIPT_GOVERNED | closed modes/domains, source test before switch, backup/replace | PARTIAL | Local config, not PostgreSQL resource administration |
| Schema/deployment | Operator → Python/shell → Docker exec `psql` → migration objects | SCRIPT_GOVERNED / DIRECT_SQL | OS/Docker + DB role, file hashes and deployment reports vary | PARTIAL | Common authorization, migration ledger and audit envelope missing |
| Demo/catalog seeds | Operator/bootstrap → `psql` → catalog/demo tables | DIRECT_SQL | synthetic fixed rows, transactions/conflict handling | TEST_ONLY / PARTIAL | Must remain opt-in and environment-scoped |

## ESS findings

ESS owns operational current state, immutable transition history, request idempotency and quarantine. Runtime writes are driven by Kafka state requests and integration results, not by UMC administration. `StateAdminResource` exposes token-protected reads for events, an event, history and quarantine summary; no state-changing ESS admin endpoint was found. UMC relevance is limited to administration of configuration/retention/recovery if later defined; UMC must not let operators bypass ESS lifecycle invariants with SQL.

## Datasources, rules, policies and providers

- **Datasource configuration:** `integration_configuration`, `connection_operation`, `connection_revision`, `secret_usage`, and `customer_connection_link` are written through Console Catalog API modules. Connections use provider allow-lists, versioned snapshots, durable operations and secret references. Legacy and bootstrap SQL can populate the shared tables, creating a mixed API/direct-SQL history.
- **Rules and policies:** Processor rules, blackouts/routing/correlation policies, AIOps and dedup use Processor APIs and versioned PostgreSQL stores. Delivery filters are a configuration catalog owned by Console Catalog API and explicitly are not themselves the runtime routing engine. Gateway rules have an owning API plus a deployment utility.
- **ServiceNow/GLPI:** runtime Worker adapters read configured ticketing profiles and external secret references. External incidents/tickets stay provider-authoritative. OEM configuration uses connection/profile revisions; GLPI operational state and Worker ledgers remain runtime evidence.
- **GNM/Everbridge and Teams:** notification account/profile revisions and destinations are Console Catalog-managed; Worker resolves them server-side. Provider configuration and tokens do not belong in browser state.
- **CACF/NEXT:** automation account/profile configuration is management-plane state; automation execution/result/provider messages are Worker-owned runtime state. These must remain separate UMC resource and execution domains.
- **Custom API:** represented through the closed connection/provider configuration model where supported. No evidence authorizes arbitrary endpoint/credential SQL.

## Configuration persistence

| Mechanism | Examples | Classification | UMC treatment |
| --- | --- | --- | --- |
| PostgreSQL | customers, integrations, links, profiles, rules, policies, secret metadata | AUTHORITATIVE operational/configuration | Candidate resource contracts through owning API/services |
| Environment variables | JDBC URLs, provider URLs, feature modes, Kafka/OpenSearch addresses | Environment configuration | Governed environment/bootstrap inputs; secrets by reference/file |
| Read-only secret files / Vault | catalog DB password, ESS admin tokens, Vault workload tokens, CA/trust material | Secret boundary | References only; never UMC payload or evidence |
| JSON/files | dashboard source config, provider registries, Compose overlays | LOCAL / DECLARATIVE | Versioned/configured where appropriate; define owner, validation and atomic application |
| Git SQL/config | migrations and fixed synthetic seeds | DECLARATIVE | Controlled deployment provenance, not runtime resource authority |
| SQLite | frontend operation records, mock secrets/providers | LOCAL / TEST | Keep outside production UMC authority unless explicitly replaced |
| Browser storage | preferences and pending-operation copies | LOCAL / TRANSIENT | Exclude from resource authority |

Security evidence is mixed. Most runtime credentials are externalized through environment variables or mounted files, and Console Catalog generates an ignored mode-0600 database password. Vault integrations use token files and trust material. However, `infrastructure/docker-compose.oem-dashboards.yml` contains a sensitive database-credential fallback in source configuration. Its value is intentionally not reproduced here; this is a **P0 remediation finding**. Example placeholders in `.env.example` are development guidance, not production secrets.

## Web PostgreSQL mode

`postgresql` in dashboard configuration means:

```text
Browser
  → GET /api/dashboards/{domain}
  → OEM Dashboards API
  → PostgresSource
  → read-only transaction
  → allow-listed dashboard_read.{events|ticketing|glpi|gnm|cacf} views
     or the fixed delivery/data-collection read adapters
```

`internal-api` replaces only the final adapter with a validated server-side HTTP request. `dashboard.py` accepts a closed domain registry, bound filters/pagination, `REPEATABLE READ, READ ONLY`, and a statement timeout. The browser never receives database credentials, never constructs SQL, and cannot choose a relation or SQL fragment. The BFF owns query construction. This mode is read-only for dashboard queries; collection preview/send and template-library actions are separate API capabilities, not evidence that dashboard reads mutate PostgreSQL.

Therefore **PostgreSQL interoperability = OPTIONAL_TARGET is confirmed**: it is an optional controlled BFF adapter, not browser SQL and not a universal UMC-wide switch.

## Web ↔ Data matrix

| Web capability | Path | Classification | Write authority |
| --- | --- | --- | --- |
| Dashboard reads in `postgresql` mode | Browser → Dashboard BFF → read-only PostgreSQL adapter | BFF_TO_POSTGRESQL | None |
| Dashboard reads in `internal-api` mode | Browser → Dashboard BFF → internal API | BFF_TO_SERVICE | Owning service, if any |
| Customer/filter/source/profile administration | Browser → Nginx → Console Catalog API → PostgreSQL | BFF_TO_POSTGRESQL | Catalog API transaction |
| Rules/blackouts/routing/AIOps/dedup | Browser → Nginx → Processor API → PostgreSQL | SERVICE_TO_POSTGRESQL | Processor API/service |
| ESS state/history/quarantine | Browser → Catalog proxy → ESS read API → PostgreSQL | BFF_TO_SERVICE | Read-only |
| Service lifecycle | Browser → Frontend Management API → allow-listed scripts → SQLite operation record | BFF_TO_SERVICE | Operational script boundary |
| Preferences/pending copies | Browser storage | CLIENT_LOCAL | Not authoritative |
| Ticket/provider demos | Browser → isolated adapter/mock | EXTERNAL | Local/external provider state |

## CLI ↔ Data matrix

| CLI/tool | Data mechanism | Classification | Assessment |
| --- | --- | --- | --- |
| `emctl event-state-service admin|test`, `event-state-admin.py` | Calls ESS HTTP read API | API/service | Appropriate; no SQL bypass |
| Dashboard source CLI | Validates/tests adapter then atomically updates JSON config | File/configuration | Governable local configuration |
| Processor/gateway admin utilities | Call subsystem APIs where available | API/service | Preferred normal administration path |
| `bootstrap-console-catalog.py` | Direct migration/role/grant/optional seed through `psql` | SCRIPT_GOVERNED / DIRECT_SQL | Requires governed bootstrap wrapper |
| Deployment scripts | `pg_dump`, versioned migration SQL, Compose rollout | Deployment/direct SQL | Appropriate special case with stronger common controls needed |
| Recovery/consolidation scripts | dump/restore/disposable DB or environment verification | Operations/test | Keep operational; require explicit authorization/runbook |
| Kafka CLI | Broker tooling | Transport administration | Outside PostgreSQL/UMC resource authority |
| Terraform/Compose | Infrastructure/environment state | Deployment tooling | UMC bootstrap may orchestrate, not replace their ownership |

## API ↔ Data matrix

| API | PostgreSQL path | Current governance | UMC assessment |
| --- | --- | --- | --- |
| Console Catalog API | Direct catalog/configuration SQL in BFF/domain API | Validation, transactions, revisions, tenant checks, audit; auth mode varies | Strong candidate for UMC resource adaptation |
| Processor administration | API → application/adapters → processor schema | Validation, idempotency keys, concurrency, revisions, audit | Existing governed transition; preserve service semantics |
| Gateway rules API | API → rule store/history | Validation/history | Existing subsystem resource path |
| Worker operational control | API → worker control state | Closed action validation | Operational action candidate |
| ESS admin | Read-only API → ESS tables | Tenant/operator tokens | Not a write path; preserve authority |
| Dashboard API | Read-only adapter or internal API | Closed modes, validation, timeouts | Query surface only |
| Provider APIs | Worker/adapters → external systems | Provider-specific auth/contracts | External execution, not OEM configuration authority |

## Direct SQL assessment

| Mechanism | Assessment | Reason |
| --- | --- | --- |
| Ordered schema migrations | **APPROPRIATE_INTERNAL** | Deployment concern; normal users should not invoke raw DDL |
| Fresh-volume Docker init | **APPROPRIATE_INTERNAL** | Controlled initialization, but only on empty volumes |
| Catalog bootstrap/role grants | **REQUIRES_UMC_WRAPPER** | Legitimate bootstrap, but sequence lacks one common identity/audit/result contract |
| Fixed synthetic seeds | **TEST_ONLY** | Useful for local/demo/certification; never production resource authority |
| Deployment scripts with backup/migration/rollout | **GOVERNABLE** | Strong evidence/checksum patterns; formalize authorization, environment targeting and result envelope |
| Recovery/consolidation dump/restore | **GOVERNABLE** under Operations | High-impact operations needing explicit gate, retention, RPO/RTO and audit |
| API-owned configuration writes | **APPROPRIATE_INTERNAL** | SQL is an implementation detail behind validation/authorization/audit |
| Ad-hoc operator UPDATE of managed resources | **REQUIRES_REMEDIATION** | Bypasses service semantics, revisions and audit; no approved mechanism found |
| Read-only dashboard SQL adapter | **APPROPRIATE_INTERNAL** | Fixed BFF-owned queries, read-only role/transaction, no browser SQL |
| Certification/disposable-database SQL | **TEST_ONLY** | Isolated evidence, not production administration |
| Legacy owner-guarded package | **UNKNOWN** | Must be reconciled to current migrations before any reuse |

## Governed scripting candidates

| Candidate | Purpose/domain | Inputs & validation | Transaction/idempotency | Audit/rollback | Required convergence |
| --- | --- | --- | --- | --- | --- |
| Catalog bootstrap | Initialize schemas, roles and optional local seed | Version-controlled files; generated secret format; `ON_ERROR_STOP` | Migrations mostly repeatable; sequence not globally atomic | Console message; no universal operation record | Environment/tenant scope, migration ledger, dry-run, standard result/audit, explicit seed flag |
| Subsystem deployment scripts | Backup, migrate and roll out Processor/ESS/Worker | Fixed service/container/files, migration hashes, health checks | Repeatable additive SQL; deployment retry semantics vary | Evidence folders and image rollback; schema retained | Operator identity, approved environment, durable operation status, retention and recovery policy |
| Gateway/collection schema deploy | Apply fixed versioned migrations | Fixed paths and readiness checks | Partially repeatable | Script output/evidence | Prefer Management API for subsequent resource changes |
| Environment consolidation | Backup/restore verification | Enumerated containers/databases | Temporary restore with count comparison | Protected dumps/report; cleanup | Explicit destructive-operation gate, RPO/RTO, retention, encryption and restore authorization |
| Fixed baseline import | Approved initial customers/filters/policies | Synthetic/approved declarative manifest | Conflict-safe inserts | Origin metadata/Git | Replace raw seed with schema-validated, tenant/environment-bound manifest and audit |

“Governed PostgreSQL Scripting” should mean a constrained runner for signed/versioned or checksummed scripts/manifests with explicit operation identity, actor/role, target environment and tenant scope, compatibility preflight, dry-run where possible, transaction policy, idempotency classification, secret references, structured result/audit, and rollback/recovery instructions. It must reject arbitrary caller SQL.

## Backup and restore

`pg_dump` is used before selected Processor, ESS, lifecycle and CACF/GNM migrations. `event-processor-recovery.py` performs an isolated dump/restore plus exact state/replay verification. `consolidate-environments.py` dumps environments, restores to a temporary database, compares counts, and removes the temporary database. These demonstrate useful mechanisms, not a platform-wide scheduled backup, retention, encryption, off-site storage, restore-authorization, or certified RPO/RTO program. Backup/restore orchestration is primarily **Operations**, with UMC Product Management exposing only governed requests/status if later required.

## Authorization, audit and safety

- Direct scripts rely mainly on OS access, Docker socket/container access and the PostgreSQL role present in the container environment. Separate application/tenant authorization is generally not evidenced for raw scripts.
- Service/API paths add domain validation, tenant context, locks/revisions/idempotency, and—in selected domains—OIDC/RBAC and PostgreSQL RLS. Local compatibility modes do not equal production multi-user authorization.
- Audit is fragmented across `console_catalog_audit`, Processor `admin_audit` and transitions, rule/history tables, ESS transition/request ledgers, Worker/CACF ledgers, gateway history/receipts, SQLite operation records, logs, Git, and deployment evidence. There is no universal UMC audit event.
- Transactionality varies: runtime services commonly use explicit/JTA transactions; many migrations use `BEGIN/COMMIT`; `bootstrap-console-catalog.py` invokes multiple independently committed scripts. Do not infer atomic rollback for a whole deployment.
- Idempotency varies: runtime request/command ledgers and revision stores are strong; migration DDL is mostly repeatable; deployment orchestration and external-provider actions are not universally safe to retry. No claim beyond file-specific evidence is made.

## Master data management matrix

| Domain | Operation | Current mechanism | Boundary | Authority | UMC relevance | Status | Evidence | Gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Customers/filters | CRUD/bulk action | Console Catalog API → PostgreSQL | BFF_GOVERNED | PostgreSQL | High | PARTIAL | `server.py`, migrations 022/023 | Universal auth/result absent |
| Datasources | create/update/enable/link/test | Catalog API + connection operations/revisions | BFF_GOVERNED | PostgreSQL; external provider for test | High | PARTIAL | `data_sources.py`, migrations 028/039 | Common provider contract absent |
| Secrets | create/rotate/disable/reference | Catalog API + Vault + metadata | BFF_GOVERNED | Secret manager external; metadata PostgreSQL | High | PARTIAL | `secret_library.py`, migration 038 | Environment-specific identity/deployment |
| Rules/policies | version/validate/enable/disable/retire | Processor/Gateway APIs | API_GOVERNED | PostgreSQL | High | EXISTING | Admin resources/stores | Cross-surface envelope absent |
| ESS event state | runtime transitions/history/quarantine | Kafka → ESS repositories | SERVICE_GOVERNED | PostgreSQL | Low for UMC writes | NOT_APPLICABLE | ESS repositories | Must not expose direct management mutation |
| Integration execution | idempotent command/provider result | Kafka/API → Worker/CACF | SERVICE_GOVERNED | PostgreSQL + external | Low for UMC writes | NOT_APPLICABLE | Worker repositories | Separate config from execution |
| Provider profiles | version/configure/disable | Catalog profile APIs | BFF_GOVERNED | PostgreSQL | High | PARTIAL | ticketing/notification/automation modules | Fragmented provider lifecycle |
| Dashboard query | list/filter | BFF → PostgreSQL/internal API | BFF_GOVERNED | Read-only derived view | Query only | EXISTING | `dashboard.py` | Not a general interoperability switch |
| Schema | initialize/migrate | init SQL and deploy scripts | SCRIPT_GOVERNED / DIRECT_SQL | PostgreSQL | Controlled bootstrap | PARTIAL | `infrastructure/postgres/init`, deploy scripts | Global ledger/runner missing |
| Backup/recovery | dump/restore/verify | Operational scripts | SCRIPT_GOVERNED | PostgreSQL | Operations | PARTIAL | recovery/consolidation scripts | Platform policy and RPO/RTO missing |

## BAU convergence plan

| Priority | Convergence work |
| --- | --- |
| P0 database/security boundaries | Remove the source-configured dashboard credential fallback; require secret references/files; document least-privilege roles and prohibit browser/direct arbitrary SQL |
| P0 direct mutation governance | Declare owning APIs as the normal write path; inventory and gate every production-capable direct script; prohibit ad-hoc updates of managed resources |
| P1 governed scripting contract | Define actor/role, operation ID, approved script/manifest identity, checksum, target environment/tenant, preflight, dry-run, structured outcome and immutable audit |
| P1 bootstrap/idempotency | Define `oem bootstrap apply` orchestration over internal migrations; add an applied-version/checksum ledger and explicit seed profiles without exposing SQL |
| P1 resource persistence ownership | Publish owners for shared `event_management` tables and separate management configuration from runtime execution state |
| P2 audit/transaction consistency | Correlate script/API operations across existing audit tables; declare transaction and safe-retry semantics per operation |
| P2 backup/recovery integration | Define ownership, encryption/retention, restore authorization, RPO/RTO and evidence policy; keep raw dumps out of Git |
| P3 legacy/test cleanup | Isolate legacy packages and synthetic seeds; label test-only SQLite/localStorage/provider state; reconcile superseded scripts |

## Conclusion and human gate

UMC-DATA-01 establishes the current data-administration baseline. It does not implement UMC Data, alter Data Authority, start UMC-CONFORMANCE-01, or authorize publication. Product sync remains a validation concern and `docs/platform/**` is unchanged.

**UMC-CONFORMANCE-01 readiness:** the CLI/API/Web/Data baselines now provide enough evidence to begin a separately authorized cross-surface equivalence design. Security, audit, resource-identity and scripting-contract gaps remain inputs, not implementations.

**Human Gate: PENDING.**

**UMC-DATA-01 INVENTORY COMPLETE — CURRENT DATA ADMINISTRATION BASELINE ESTABLISHED — DATA AUTHORITY AND WRITE PATHS DOCUMENTED — GOVERNED SCRIPTING CANDIDATES IDENTIFIED — CLI/API/WEB/DATA RELATIONSHIPS MAPPED — PRODUCT REPOSITORY UNCHANGED.**

## Evidence index

- SQL/migrations: `infrastructure/postgres/init/*.sql`, `infrastructure/postgres/CHANGELOG.md`.
- Scripts: `scripts/dashboards/bootstrap-console-catalog.py`, `deploy.py`, seed SQL; Processor/ESS/lifecycle/CACF deployment and recovery scripts; `gateway-rules-deploy.py`; `consolidate-environments.py`.
- Runtime writers: Event Gateway stores; Processor PostgreSQL adapters; Integration Worker ledgers, registries and CACF repository; ESS repositories.
- Management writers: Console Catalog API server and configuration/profile modules; Processor and Gateway administration resources.
- Web/data: OEM Dashboards API `dashboard.py`, collection/delivery adapters; console/catalog/dashboard clients and Nginx paths.
- Contracts: UMC-01, UMC-CLI-01, UMC-API-01, UMC-WEB-01; Data Authority & Replay; component READMEs and runbooks.
