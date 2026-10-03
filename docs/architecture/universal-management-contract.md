# OEM Universal Management Contract

**UMC-01 — Cross-Cutting Architecture · DESIGNED / DOCUMENTED**

## Purpose

UMC-01 defines one governed, versioned management contract for installing,
creating, querying, modifying, testing, validating, enabling, configuring,
initializing, and operating OEM resources. CLI, Management API, Web Console,
and governed PostgreSQL scripting are alternative surfaces over the same
resource and action semantics; this is a target architecture, not a claim of
complete implementation.

## Solution Architecture

![OEM Universal Management Contract Architecture](/diagrams/oem-universal-management-contract-solution-architecture.png)

The approved solution view is a presentation of the UMC target. It does not
change D0 service ownership, Multi-Surface governance, or Data Authority.

## Management Surfaces

| Surface | Role | Boundary |
| --- | --- | --- |
| CLI | Automation and scripting | Identity → authorization → UMC action |
| Management API / BFF | Programmatic access | Governed API and audit boundary |
| Web Console | Human administration | BFF/Management API, or configured controlled data-access boundary |
| Governed PostgreSQL scripting | Bootstrap, migration, approved bulk/admin operations | Controlled scripts preserving validation, authorization, audit, and schema compatibility |

PostgreSQL scripting is not arbitrary user SQL, browser SQL, or a bypass of
validation and audit. A PostgreSQL-backed console mode, where permitted, uses a
controlled data-access component rather than direct browser access.

## Resource Model

UMC-01 initially covers Internal Products, Datasources, Rules, Policies,
Integrations/Providers, Scripts, Configuration, and Environment/Bootstrap
definitions. The common envelope is **DESIGNED**:

`resourceType`, `resourceId`, `tenantId`, `environment`, `name`, `version`,
`configuration`, `enabled/status`, `metadata`, and `provenance`.

Resource-specific contracts remain authoritative until conformance work maps
them to this envelope.

## Action Model

The target action vocabulary is install, create, get, list, update, delete,
test, validate, enable, disable, import, export, bootstrap, and configure.
Capabilities are explicit per resource; not every resource supports every
action, and lifecycle rules may prohibit deletion.

## CLI Contract

The target grammar is **DESIGNED**, not a claim that these commands exist:

```text
oem <resource> <action>
oem datasource create | get | list | test | update
oem rule create | validate | enable
oem policy create | update
oem integration register | test | update
oem bootstrap apply
oem config interoperability set
```

Provider-specific designs such as `oem integration register --type glpi` or
`--type custom-api` are specializations that require later conformance work.

## Conformance

The current CLI baseline is documented in [CLI Conformance — UMC-CLI-01](umc/cli-conformance.md).
It is a discovery record, not an implementation claim or a start of remediation.

## Management API

The Management API is another surface over UMC; it must not define separate
resource semantics or an invented universal REST endpoint catalog. Existing
API contracts remain evidence sources for the UMC-API-01 inventory.

## Web Console / BFF

Preferred path:

`Web Console → BFF / Management API → Management Services → UMC`

An explicitly configured alternative is:

`Web Console → controlled Data Access Boundary → PostgreSQL`

This does not authorize arbitrary browser-to-PostgreSQL access. Exact
interoperability field names remain designed unless existing evidence defines
them.

## Governed PostgreSQL Scripting

Governed scripts may support bootstrap, initialization, migration, approved
administration, bulk configuration where appropriate, and controlled
operations. They must preserve validation, transactionality where applicable,
audit, authorization, schema compatibility, and tenant/environment boundaries.

## Management Services

Management Services is a logical boundary for resource lifecycle,
configuration, orchestration, validation, audit/events, and authorization
integration. It is not a claim that a separate deployed microservice exists.

## Security

Every state-changing action requires identity, authorization, policy,
validation, audit, and tenant/environment context. Secret payloads must not be
embedded in CLI history, Git, documentation, or management event payloads;
governed secret references are required.

## Data Authority

UMC-01 preserves the existing authority model:

- PostgreSQL — OEM Operational Source of Truth.
- Kafka — transport and replay boundary.
- OpenSearch — derived search and analytics projection.

Management surfaces cannot independently redefine authority or directly mutate
internal stores outside governed transitions.

## Audit / Observability

The conceptual flow is:

`Management Request → Identity → Authorization → Contract Validation → Resource Resolution → Action Execution → Result → Audit Event`

The future result envelope should carry status, resource identity, action,
result, validation outcome, error classification, request/correlation identity,
and version/provenance. Exact field names remain detailed-contract work.

## Cross-Surface Consistency

Equivalent operations from CLI, API, Web Console, or governed scripting must
have equivalent business semantics. Surface choice must not create a second
resource model or bypass action governance. Installation, bootstrap, and
configuration actions should be declarative, version-aware, auditable, and
idempotent where feasible; current implementations are not universally claimed
to be idempotent.

## Implementation Status

| Capability | Architecture | Implementation |
| --- | --- | --- |
| UMC common resource model | DESIGNED | Existing resource models to be inventoried |
| CLI universal grammar | DESIGNED | Current CLI inventory pending |
| Management API common contract | DESIGNED | Existing APIs to be inventoried |
| Web Console via BFF | DESIGNED | Current access path to be assessed |
| Governed PostgreSQL scripting | DESIGNED | Existing scripts to be inventoried |
| Frontend interoperability switch | DESIGNED | Implementation to be assessed |
| Datasource lifecycle management | DESIGNED | Existing capabilities to be assessed |
| Rules/policies management | DESIGNED | Existing capabilities to be assessed |
| Integration/provider registration | DESIGNED | Provider implementations vary |
| Bootstrap / all-in-one | DESIGNED | Existing scripts to be inventoried |

## Architecture Relationships

- [D0 Logical Architecture](d0-logical-current.md) remains authoritative for core ownership.
- [Multi-Surface Interaction](multi-surface-interaction.md) governs interaction surfaces; UMC defines management semantics.
- [Data Authority & Replay](data-authority-replay.md) remains authoritative for persistence, transport, replay, and projection.
- [AI-01](ai-01-aiops-ai-architecture.md) remains separate; AI may invoke governed UMC actions but cannot bypass authorization, policy, validation, or audit.
- [Platform architecture landing](../platform/architecture/README.md) provides the concise product view.

## BAU Development Plan

UMC implementation/conformance is future BAU work, not part of this
documentation operation. The registered areas are UMC-CLI, UMC-API, UMC-WEB,
UMC-DATA, UMC-RESOURCE-MODEL, UMC-SECURITY, UMC-AUDIT, UMC-CONFORMANCE,
UMC-BOOTSTRAP, and UMC-INTEROPERABILITY.

The first follow-ups are UMC-CLI-01 (inventory current CLI), UMC-API-01
(inventory management APIs), UMC-WEB-01 (inventory Web/BFF/database access),
and UMC-DATA-01 (inventory administrative and bootstrap scripts).
