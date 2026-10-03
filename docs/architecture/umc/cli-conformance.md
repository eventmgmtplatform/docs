# UMC CLI Conformance — UMC-CLI-01

**Discovery baseline:** current repository evidence only. No product CLI or runtime code was changed by this inventory.

## Current CLI surfaces

| Surface | Type | Evidence | Scope |
| --- | --- | --- | --- |
| `bash scripts/emctl` | Operational CLI / installer utility | `scripts/emctl`, `scripts/eventmanagement-services.sh` | Local Compose lifecycle, ESS administration, Kafka administration, documentation and labs |
| `python3 scripts/kafka-admin.py` | Installer and operational CLI | `scripts/kafka-admin.py`, `docs/kafka/cli.md` | Isolated Kafka package preparation, inspection and verification |
| `python3 scripts/event-state-admin.py` | Operational administration CLI | `scripts/event-state-admin.py`, `docs/event-state-service/admin-api.md` | ESS read administration and quarantine |
| `bash scripts/emctl ui oem-dashboards ...` | Operational configuration CLI | `scripts/oem-dashboards.sh`, `services/oem-dashboards-api/cli.py` | Dashboard source selection and smoke testing |
| `python3 scripts/event-processor-dedup.py` | Operational administration utility | `scripts/event-processor-dedup.py` | Deduplication administration for a tenant |
| `python3 scripts/gateway-rules-deploy.py` | Deployment utility | `scripts/gateway-rules-deploy.py` | Gateway rules deployment/evidence |
| `testing/**`, `evidences/**` tools | Test/certification tools | Repository paths and parser definitions | Certification and laboratory validation; not product CLI |

The product does not expose one universal `oem <resource> <action>` executable today. Test harnesses, mocks, browser checks and Terraform are excluded from the product CLI surface.

## Current CLI tree

```text
scripts/emctl
├── global: validate, services, status, health, start, stop, restart, reload, logs, down
├── <service>: start, stop, restart, reload, status, health, logs
├── event-state-service: admin, test
├── kafka: config, inventory, topics, groups, verify, inspect, prepare, install
├── ui oem-dashboards: status, health, start, stop, restart, reload, logs, smoke-test
└── oem-labs / documentation: lifecycle actions

scripts/event-state-admin.py
├── configure
├── events
├── event --event-key KEY
├── history --event-key KEY
└── quarantine

scripts/kafka-admin.py
└── prepare | install | config | inventory | topics | groups | verify | inspect
```

## UMC target tree

This is a target grammar, not a claim that these commands exist:

```text
oem
├── product
├── datasource
├── rule
├── policy
├── integration
├── script
├── config
└── bootstrap
    └── <resource> <install|create|get|list|update|delete|test|validate|enable|disable|import|export|configure>
```

## Master conformance matrix

`EXISTING` means equivalent governed capability is evidenced. `PARTIAL` means subsystem-specific or incomplete behavior. `MISSING` means no capability was found. `CONFLICTING` is reserved for an evidenced governance bypass; none was found in this discovery.

| Resource | Action | Current evidence | Status | Gap |
| --- | --- | --- | --- | --- |
| Internal products | start/stop/restart/status/health | `emctl <service> <action>` | PARTIAL | Operational lifecycle is not a universal product-resource contract |
| Internal products | install/upgrade/configure | Compose/deployment utilities | PARTIAL | No governed product-resource grammar |
| Datasources | install/create/get/list/update/delete | No general datasource CLI | MISSING | Define resource contract |
| Datasources | test/validate/enable/disable | Dashboard source `test`/`set` | PARTIAL | Not a universal datasource contract |
| Datasources | import/export | No general datasource import/export | MISSING | Define portable contract |
| Rules | install/import/create/get/list/update | Gateway deployment only | PARTIAL | Separate deployment from administration |
| Rules | validate/enable/disable/delete/export | No universal lifecycle commands | PARTIAL | Define governed rule actions |
| Policies | lifecycle actions | No policy administration CLI | MISSING | Clarify policy domains and contract |
| Integrations/providers | register/configure/get/list/update | Provider-specific tools and dashboard source configuration | PARTIAL | No common provider grammar |
| Integrations/providers | test/validate/enable/disable/remove | Dashboard source test/set; provider registration is designed | PARTIAL | Converge provider contract and secret references |
| Scripts | lifecycle actions | No governed script resource CLI | MISSING | Define identity and audit |
| Configuration | get/list/update/validate/configure | Dashboard source/config and environment variables | PARTIAL | Scope varies by subsystem |
| Environment/bootstrap | bootstrap/apply/configure | Compose start; Kafka prepare/install; bootstrap utilities | PARTIAL | No single idempotent bootstrap contract |
| Any resource | result/audit envelope | JSON, text, files, logs and exit codes vary | PARTIAL | Standard result and audit contract pending |

No current capability was classified `CONFLICTING` or `NOT_APPLICABLE`.

## Findings

`event-state-admin.py` reads protected local token material and sends tenant/admin tokens in headers; it does not accept raw token arguments. Dashboard configuration stores modes only; credentials belong to the BFF environment. Kafka and Compose rely on environment files and Docker access. A common independent UMC authorization model is not evidenced.

Audit behavior is subsystem-specific: services document operational records/logs, while deployment and test utilities write evidence files. A universal UMC audit event/result envelope is not implemented. Output includes JSON, plain text, tables, Docker logs, files and exit codes; detailed per-command exit contracts are not defined.

No universal Web Console → PostgreSQL interoperability switch was found. PostgreSQL appears in bootstrap, migration, deployment and evidence scripts; these remain operational/bootstrap tooling and are not promoted to UMC resources by this inventory.

## BAU convergence plan

| Priority | Convergence work |
| --- | --- |
| P0 | Establish identity, authorization, secret-reference and audit requirements |
| P1 | Define a common dispatcher, resource identity, validation and result envelope |
| P1 | Close datasource, rule, policy, provider, configuration and bootstrap lifecycle gaps |
| P2 | Add provider specialization behind the common integration contract |
| P2 | Normalize output, exit codes, correlation identity and audit events |
| P3 | Retire or isolate legacy/developer/test utilities from the product namespace |

These are documentation findings only. No remediation is started by UMC-CLI-01.

## Evidence index

`scripts/emctl`; `scripts/eventmanagement-services.sh`; `scripts/kafka-admin.py`; `scripts/event-state-admin.py`; `scripts/oem-dashboards.sh`; `services/oem-dashboards-api/cli.py`; `scripts/event-processor-dedup.py`; `scripts/gateway-rules-deploy.py`; `docs/kafka/cli.md`; `docs/event-state-service/admin-api.md`; `docs/dashboards/contracts.md`; `docs/architecture/universal-management-contract.md`.
