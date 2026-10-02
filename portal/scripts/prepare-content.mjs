import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const portalRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(portalRoot, '..')
const source = resolve(repositoryRoot, 'docs')
const destination = resolve(portalRoot, 'content')
const publicDownloads = resolve(portalRoot, 'public/downloads')

await rm(destination, { recursive: true, force: true })
await cp(source, destination, { recursive: true })

// Nextra treats every file below content/ as an importable page resource. Keep
// page Markdown and browser-renderable image assets in this disposable mirror;
// downloadable/source artifacts continue to live authoritatively in docs/.
const contentExtensions = new Set([
  '.md', '.mdx', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'
])
const removeNonContentSources = async directory => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await removeNonContentSources(path)
    else if (!contentExtensions.has(extname(entry.name).toLowerCase())) await rm(path)
  }
}
await removeNonContentSources(destination)

await rm(publicDownloads, { recursive: true, force: true })
for (const asset of [
  'platform/api/openapi.yaml',
  'platform/cacf/CACF-local-architecture.drawio'
]) {
  const target = resolve(publicDownloads, asset)
  await mkdir(dirname(target), { recursive: true })
  await cp(resolve(source, asset), target)
}

// MkDocs accepts repository-relative image targets without a './' prefix;
// MDX resolves those as package names. Normalize images only in the generated
// mirror so the authoritative Markdown remains byte-for-byte unchanged.
const normalizeMarkdown = async directory => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await normalizeMarkdown(path)
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const markdown = await readFile(path, 'utf8')
      const imageNormalized = markdown.replace(
        /(!\[[^\]]*\]\()(?!\.?\.?\/|\/|#|https?:|data:|<)/g,
        '$1./'
      )
      const sourcePath = relative(destination, path).split('\\').join('/')
      const normalized = imageNormalized.replace(
        /(\[[^\]]*\]\()([^\s)]+)(\))/g,
        (match, prefix, target, suffix) => {
          if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(target)) return match
          const [pathAndQuery, fragment = ''] = target.split('#', 2)
          const [targetPath, query = ''] = pathAndQuery.split('?', 2)
          const sourceDirectory = posix.dirname(sourcePath)
          const repositoryRelative = targetPath.startsWith('docs/')
            ? targetPath.slice('docs/'.length)
            : posix.normalize(posix.join(sourceDirectory, targetPath))
          if (/\.(?:ya?ml|drawio)$/i.test(targetPath)) {
            return `${prefix}/downloads/${repositoryRelative}${fragment ? `#${fragment}` : ''}${suffix}`
          }
          if (!/\.mdx?$/i.test(targetPath)) return match
          let route = repositoryRelative.replace(/\.mdx?$/i, '')
          if (posix.basename(route) === 'index') route = posix.dirname(route)
          const href = `/${route === '.' ? '' : route}/`
            .replace(/\/+/g, '/')
          return `${prefix}${href}${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}${suffix}`
        }
      )
      if (normalized !== markdown) await writeFile(path, normalized, 'utf8')
    }
  }
}
await normalizeMarkdown(destination)

// The public home is a concise portal entry point. Keep this presentation-only
// adjustment in the disposable Nextra mirror; docs/index.md remains canonical.
const homePath = resolve(destination, 'index.md')
const home = await readFile(homePath, 'utf8')
const portalHome = home
  .replace('<span class="oem-home-intro__eyebrow">Documentation</span>', '<span class="oem-home-intro__eyebrow">Docs</span>')
  .replace('# Open Event Management', '# Event Management')
  .replace(/\n## Explore la documentación\n[\s\S]*?\n<\/div>\n/, '\n')
await writeFile(homePath, portalHome, 'utf8')

const write = async (path, content) => {
  const target = resolve(destination, path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content, 'utf8')
}

const portalHref = route => `/${route.replace(/^\.\.\//, '').replace(/^\.\//, '')}`.replace(/\/+/g, '/')
const landing = (title, links) => [
  `# ${title}`,
  '',
  ...links.map(([label, href]) => `- [${label}](${portalHref(href)})`),
  ''
].join('\n')

await write('_meta.js', `export default {
  architecture: { title: 'Architecture', type: 'page' },
  platform: { title: 'Engineering', type: 'page' },
  deployment: { title: 'Deployment', type: 'page' },
  operations: { title: 'Operations', type: 'page' },
  integrations: { title: 'Integrations', type: 'page' },
  'ai-automation': { title: 'AI & Automation', type: 'page' },
  quality: { title: 'Quality', type: 'page' },
  'devops-iac': { title: 'DevOps & IaC', type: 'page' },
  project: { title: 'Project', type: 'page' },
  'getting-started': { display: 'hidden' },
  concepts: { display: 'hidden' },
  assets: { display: 'hidden' },
  decisions: { display: 'hidden' },
  development: { display: 'hidden' },
  frontend: { display: 'hidden' },
  knowledge: { display: 'hidden' },
  reference: { display: 'hidden' },
  security: { display: 'hidden' },
  tutorials: { display: 'hidden' },
  'carbon-preview': { display: 'hidden' }
}\n`)

await write('architecture/_meta.js', `export default {
  'oem-architecture-definition': 'Architecture Definition',
  'd0-logical-current': 'Logical Architecture — D0',
  'data-authority-replay': 'Data Architecture',
  'multi-surface-interaction': 'Interaction Architecture',
  'ai-01-aiops-ai-architecture': 'AI Architecture — AI-01',
  'd1-local-current': 'Deployment — D1 Local',
  'd2-kvm-kubernetes-target': 'Deployment — D2 Kubernetes',
  'd3-rhel-current': 'Deployment — D3 RHEL',
  'd4-qa-gke-minimum-target': 'Deployment — D4 QA GKE',
  'd5a-prod-gke-runtime-target': 'Deployment — D5A Production',
  'd5b-prod-gke-cicd-target': 'Deployment — D5B Composition',
  'd6-environment-evolution': 'Deployment — D6 Environment Map',
  'gcp-foundation-current': 'Cloud Architecture — GCP-01',
  'gcp-cicd-current': 'Cloud Architecture — GCP-02',
  evolution: 'Architecture Evolution',
  index: { display: 'hidden' },
  publication: { display: 'hidden' }
}\n`)

await write('platform/labs/keep/_meta.js', `export default {
  index: 'Overview',
  architecture: 'Architecture',
  'ai-llm': 'AI / LLM',
  'oem-comparison': 'OEM Comparison',
  references: 'References'
}\n`)

await write('platform/labs/keep/index.md', `# Keep Overview

> **External Reference — Keep**

Keep is an external event-management and AIOps reference examined through the
local Keep evidence package. It is not part of the OEM implementation or its
authoritative architecture.

OEM studies Keep for bounded decision input around provider-oriented event
ingestion, alert identity and deduplication, declarative workflows, operator
explainability, and AI-assisted enrichment. The evidence classifies these as
reference patterns and lessons, not as OEM capabilities.

Relevant evidence includes the Keep provider catalog, workflow execution model,
relational alert/incident state model, correlation and deduplication findings,
and the Keep-versus-OEM comparison package.
`)

await write('platform/labs/keep/architecture.md', `# Keep Architecture

> **External Reference — Keep**

The inspected evidence describes a tenant-oriented relational model for alerts,
incidents, alert identity, workflow definitions and executions. Providers
normalize inbound monitoring data and expose provider-specific queries or
actions. Correlation and deduplication operate on alert identity and incident
membership; the evidence explicitly distinguishes current state from historical
records.

Workflows are defined through YAML or a visual editor, parsed into steps and
actions, selected by triggers, and executed through an in-process queue and
worker pool. Scheduler and manual execution paths persist execution records,
but the evidence does not establish a durable queue or an exactly-once
distributed guarantee. Provider side effects, relational commits, search
indexing, and workflow execution are separate boundaries.

Observed deployment evidence includes a backend/frontend development shape and
SQLite or relational SQL persistence. These observations are not an OEM target
deployment recommendation.
`)

await write('platform/labs/keep/ai-llm.md', `# Keep AI / LLM

> **External Reference — Keep**

Inspected evidence identifies separate AI paths: incident suggestions and
reports using an OpenAI client, workflow providers for OpenAI, Anthropic,
LiteLLM and vLLM endpoints, a frontend copilot runtime, and an external
transformers plugin. Workflow context can include incidents, alerts, provider
identifiers and workflow metadata; provider outputs may be persisted when
configured.

The evidence also records explicit limits: no uniform model abstraction across
all paths, no demonstrated production RAG implementation, and no certification
of every external model path. Some GET paths can initiate AI-related work.

For the authoritative OEM position, see [AI-01 — OEM AIOps / AI Architecture](/architecture/ai-01-aiops-ai-architecture/).
Keep evidence is comparative input only; it does not modify AI-01.
`)

await write('platform/labs/keep/oem-comparison.md', `# Keep vs OEM Comparison

> **External Reference — Keep**

This is a factual comparison from the inspected Keep-versus-OEM evidence. It
contains no score, ranking, or winner.

| Dimension | Keep evidence | OEM decision input |
|---|---|---|
| Event ingestion | Provider-specific normalization and queries | Preserve explicit gateway and event identity boundaries |
| Event processing | Alert identity, deduplication and incident membership | Keep Processor, ESS and policy ownership explicit |
| Correlation / deduplication | Fingerprint and current-membership patterns | Do not copy Keep filtering or mutable-policy gaps |
| Integrations | Provider catalog with query and action surfaces | Keep governed integration contracts and worker ownership |
| Automation / workflows | Declarative steps, triggers, scheduler and execution logs | Prefer visible contracts; do not assume durable queue semantics |
| AI / LLM | Multiple model/provider paths and copilot flows | Preserve AI optionality and AI-01 authorization boundaries |
| Data / state | Relational alert/incident state plus optional search projection | Preserve authoritative PostgreSQL and rebuildable projections |
| Deployment | Development-oriented backend/frontend and SQL/SQLite evidence | Do not infer an OEM production profile from Keep evidence |
| Extensibility | Provider and workflow extension points | Reuse patterns only where OEM contracts remain authoritative |
| Governance | Evidence notes heterogeneous auth and side-effect boundaries | Require explicit authorization, audit and operational evidence |

The resulting lessons are decision inputs, not a replacement for the OEM
Golden Architectures.
`)

await write('platform/labs/keep/references.md', `# Keep References

> **External Reference — Keep**

Inspected sources:

- /opt/keep-aiops/evidence/KEEP-LAB-13-workflows-automation/architecture.md
- /opt/keep-aiops/evidence/KEEP-LAB-15-data-persistence/architecture.md
- /opt/keep-aiops/evidence/KEEP-LAB-12-correlation-aiops/discovery/ai-llm-dependency-model.md
- /opt/keep-aiops/evidence/KEEP-LAB-11-providers-integrations/discovery/representative-providers.md
- /opt/keep-aiops/evidence/KEEP-LAB-20-keep-vs-oem/architecture-matrix.md
- /opt/keep-aiops/evidence/KEEP-LAB-21-lessons-for-oem/README.md

These files are evidence references, not copied portal content. The canonical
OEM pages remain the source of truth for OEM architecture and implementation.
`)

const platformReadme = await readFile(resolve(destination, 'platform/README.md'), 'utf8')
await write('platform/index.md', platformReadme)
await write('platform/operations/_meta.js', `export default { README: 'Platform Operations' }\n`)
await write('platform/api/_meta.js', `export default {
  README: 'API Overview',
  'oem-api-catalog': 'API Catalog'
}\n`)
await write('platform/api/oem-api-catalog.md', `# OEM API Catalog

The catalog is the single documentation inventory for OEM administration and
service interfaces. It distinguishes runtime evidence from governed contracts,
future designs, and laboratory mocks. It does not implement APIs or grant
direct datastore access.

## 1. API Principles

- **API-first:** consumers use documented interfaces rather than service internals.
- **Governed interfaces:** contracts, identity context, versioning, auditability,
  and compatibility are reviewed at the interface boundary.
- **No direct datastore access:** clients do not connect directly to PostgreSQL,
  Kafka, or OpenSearch.
- **Authorization boundary:** authentication and authorization remain service or
  gateway responsibilities; an identity header alone is not an RBAC claim.
- **Auditability and compatibility:** mutating operations must preserve the
  applicable audit and backward-compatibility rules documented by the owning
  service.

## 2. API Lifecycle Model

Each catalog entry uses one status: **Implemented**, **Governed**, **Designed**,
**Mock**, or **Deprecated**. Implemented means the referenced runtime surface is
documented as available. Governed identifies a contract boundary whose ownership
and compatibility rules are explicit. Designed is reserved for documented
proposals that are not available. Mock is test-only. No entry is upgraded based
on a mock, a diagram, or a proposed path alone.

## 3. API Inventory

| API | Domain | Status | Consumer | Evidence |
| --- | --- | --- | --- | --- |
| Event Gateway Rules (\`/api/v1/gateway/rules\`) | Event processing | Implemented | Console and operators | Administration API inventory; Gateway Rules API |
| Processor administration (\`/api/v1/rules\`, \`/api/v1/aiops\`, \`/api/v1/simulations\`, \`/api/v1/explain/{processingId}\`) | Management | Implemented | Console and CLI workflows | Administration API inventory; Processor rules and contracts |
| Event State Service (\`/api/v1/state/events\`, \`/event\`, \`/history\`, \`/quarantine\`) | State and lifecycle | Implemented | Console, CLI and operators | Administration API inventory; ESS admin API |
| Frontend Management (\`/api/administration/platform\`, \`/sources\`, \`/operations\`) | Management | Implemented | Management console | Administration API inventory |
| Console Catalog (\`/api/catalog/customers\`, \`/filters\`, \`/views/...\`) | Management | Implemented | Management console | Administration API inventory; console catalog docs |
| Integration control (\`/integration/control\`) | Integrations | Implemented | Integration Worker and operators | Administration API inventory |
| Dashboards (\`/api/dashboards/...\`) | Observability | Implemented | Dashboards | Administration API inventory; dashboard API docs |
| Shared rules contract (\`/rules\` namespace) | Configuration | Governed | Processor and configuration consumers | Correlation Service documentation; Processor contracts |
| Integration-instance and secret administration paths | Integrations | Designed | Future management consumers | Architecture components (explicitly not available) |
| Internal assessment provider | AI / assessment | Mock | Certification and laboratory tests | AI-01 implementation evidence |

No deprecated API is registered in the current evidence set.

## 4. Management APIs

The administration inventory is authoritative for the currently evidenced
management surfaces: platform and source inventory, operations control, console
catalog CRUD, and Processor administration. Health and audit behavior is
documented by each owning service; this catalog does not infer unlisted
endpoints.

## 5. Event Processing APIs

Event Gateway rules, Processor administration, and Event State Service lifecycle
operations are the evidenced event-processing surfaces. Normalization,
correlation, replay, and state ownership remain service responsibilities; no
new endpoint is claimed here. Correlation uses the governed shared rules
contract and does not imply a separate correlation endpoint.

## 6. Configuration APIs

The configuration capability map covers Correlation, Deduplication, Suppression,
Auto-Suppression, Blackouts & Maintenance, Enrichment, Routing, Filters &
Criteria, Ticketing, Notifications, and Automation. Their current management
surfaces are represented by the implemented Processor/console APIs above and
the governed rules contract. Proposed integration-instance and secret paths
remain **Designed**, not implemented.

## 7. Integration APIs

Integration control is an evidenced operational API. Provider-specific
integration instances, adapter contracts, and secret references are governed by
the owning service when available; the documented integration-instance and
secret administration paths are still Designed. Secret values are never
exposed in this catalog. OpenBAO is referenced only where the integration
documentation defines that relationship.

## 8. Frontend/API Contract

The supported interaction is:

\`Frontend → Governed API or BFF → Backend services\`

The following are explicit anti-patterns:

- \`Frontend → PostgreSQL\`
- \`Frontend → Kafka\`
- \`Frontend → OpenSearch\`

The frontend consumes governed APIs and does not bypass service ownership or
datastore authority.

## 9. CLI/API Relationship

The supported relationship is:

\`CLI → Governed API → Services\`

CLI workflows may orchestrate allow-listed management operations, but they do
not bypass contracts or mutate internal stores directly.

## 10. Mock / Laboratory APIs

Mock APIs support testing and certification only; they are not production API
contracts and are intentionally excluded from the implemented inventory. The
current evidence identifies the internal assessment mock provider and isolated
ServiceNow, GLPI, GNM, NEXT, AIOps, and MockSecrets test doubles. Their presence
does not promote a provider, adapter, or secret store to a production API.

## 11. Future API Evolution

Future work may extend the OpenAPI catalog, formalize provider contracts,
complete authorization and audit coverage, and expose AI assistants through the
same governed interfaces. AI may consume governed APIs, but it cannot directly
mutate databases, Kafka, or state. These are compatibility directions, not
claims of current implementation.
`)
await write('platform/labs/index.md', `# Certification Labs

Reference and validation evidence for Event Management. This landing page does
not create certifications; each status is owned by its linked evidence.

| Lab | Status | Evidence | Date |
| --- | --- | --- | --- |
| OS_01_01 | Certified/validated evidence | [Acceptance Checklist](\/platform\/labs\/os-01-01\/acceptance-checklist\/) | Recorded in lab evidence |
| Keep | External Reference | [Keep overview](\/platform\/labs\/keep\/) | Reference material |
`)
await write('platform/labs/_meta.js', `export default {
  index: 'Certification Labs',
  'os-01-01': {
    title: 'OS 01 01',
    type: 'menu',
    items: {
      'acceptance-checklist': { title: 'OS_01_01 — Checklist de aceptación', href: '/platform/labs/os-01-01/acceptance-checklist/' },
      contract: { title: 'OS_01_01 — Contrato Zabbix Message Bus', href: '/platform/labs/os-01-01/contract/' },
      'decisions-adr': { title: 'OS_01_01 — Decisiones arquitectónicas', href: '/platform/labs/os-01-01/decisions-adr/' },
      'field-mapping': { title: 'OS_01_01 — Mapeo de campos Zabbix', href: '/platform/labs/os-01-01/field-mapping/' },
      'operational-runbook': { title: 'OS_01_01 — Runbook operativo', href: '/platform/labs/os-01-01/operational-runbook/' }
    }
  },
  keep: {
    title: 'Keep',
    type: 'menu',
    items: {
      overview: { title: 'Overview', href: '/platform/labs/keep/' },
      architecture: { title: 'Architecture', href: '/platform/labs/keep/architecture/' },
      'ai-llm': { title: 'AI / LLM', href: '/platform/labs/keep/ai-llm/' },
      'oem-comparison': { title: 'OEM Comparison', href: '/platform/labs/keep/oem-comparison/' },
      references: { title: 'References', href: '/platform/labs/keep/references/' }
    }
  }
}\n`)
await write('platform/components/oem-component-catalog.md', `# OEM Component Catalog

This engineering catalog is the single reference inventory for the documented
Event Management composition. It records identity, responsibility, placement,
interfaces, dependencies, evidence, and lifecycle status without implementing
or redefining any component.

## Component Model

| Component | Layer | Purpose | Runtime | Interfaces | Evidence |
| --- | --- | --- | --- | --- | --- |
| Event Gateway | Event Processing | Validate, normalize, and admit events | Gateway service | Event ingress; governed gateway rules API | [Architecture Definition](/architecture/oem-architecture-definition/); [Gateway Rules API](/platform/event-gateway/rules-api/) |
| Event Processor | Event Processing | Apply policy, enrichment, correlation, suppression, and routing | Processor service | Kafka events; governed rules and lifecycle contracts | [D0 Logical Architecture](/architecture/d0-logical-current/); [Processor contracts](/platform/event-processor/rules-and-contracts/) |
| Correlation Engine Service | Event Processing | Deterministic hierarchical grouping and lifecycle decisions | Event Processor capability | Shared \`/rules\` contract; Event State Service | [Correlation Engine](/platform/event-processor/correlation-engine-service/) |
| Event State Service (ESS) | State | Maintain event lifecycle, history, and quarantine state | ESS service | State administration and lifecycle APIs | [ESS validation](/platform/event-state-service/validation/); [Data Authority & Replay](/architecture/data-authority-replay/) |
| Kafka | Messaging | Decouple event transport and provide bounded replay | Messaging platform | Event and integration topics | [Kafka reference](/platform/kafka/installation-and-certification/); [Data Authority & Replay](/architecture/data-authority-replay/) |
| PostgreSQL | State | Authoritative operational persistence | Database platform | Service-owned persistence contracts | [Data Authority & Replay](/architecture/data-authority-replay/) |
| OpenSearch | State | Derived search and analytics projection | Search platform | Projection/query consumers | [Data Authority & Replay](/architecture/data-authority-replay/); [Dashboards](/platform/dashboards/product-observability/) |
| Management Console | Experience | Provide operator and administrator workflows | Frontend application | Governed API/BFF and catalog APIs | [Frontend handoffs](/platform/event-processor/frontend-handoffs/README/); [OEM API Catalog](/platform/api/oem-api-catalog/) |
| Integration Worker | Integration | Execute approved external integration commands and record results | Worker service | \`integration.commands\` / \`integration.results\`; provider adapters | [Architecture Definition](/architecture/oem-architecture-definition/); [Integration control API](/platform/administration-api-inventory/) |
| Policy Engine | Event Processing | Evaluate governed policy and filter criteria | Event Processor capability | Shared rules/configuration contract | [Policy backend](/platform/event-processor/policy-backend/); [Operations](/operations/) |
| Enrichment Engine | Event Processing | Add evidenced inventory and contextual facts | Event Processor capability | Enrichment and inventory contracts | [Enrichment and inventory](/platform/event-processor/enrichment-and-inventory/) |
| Automation Router | Automation / AI | Route approved automation and integration actions | Event Processor / Integration Worker boundary | Governed routing and command contracts | [Routing backend](/platform/event-processor/routing-backend/); [Operations](/operations/) |
| AI / AIOps capability | Automation / AI | Optional assistance and assessment design | Separate governed capability | Governed APIs only; no direct store mutation | [AI-01 architecture](/architecture/ai-01-aiops-ai-architecture/) |

All listed entries are **Current** unless the linked evidence identifies a
design-only boundary. AI/AIOps remains optional; its future capabilities are
not a dependency of core event processing. No unsupported component is added.

## Layers and Relationships

- **Experience:** Management Console.
- **API / Management:** governed API/BFF surfaces are documented in the [OEM
  API Catalog](/platform/api/oem-api-catalog/); they are interfaces, not an
  additional runtime component in this inventory.
- **Event Processing:** Event Gateway, Event Processor, Correlation Engine,
  Policy Engine, and Enrichment Engine.
- **State:** ESS, PostgreSQL, and OpenSearch, with distinct authority roles.
- **Messaging:** Kafka.
- **Integration:** Integration Worker and provider adapters.
- **Automation / AI:** Automation Router and optional AI/AIOps capability.

## Data Authority

Kafka is the transport and bounded replay boundary. PostgreSQL is the
Operational Source of Truth. OpenSearch is a derived, rebuildable projection.
These semantics remain unchanged by this catalog.

## Traceability

- [Integrated Architecture](/architecture/oem-architecture-definition/)
- [OEM API Catalog](/platform/api/oem-api-catalog/)
- [Certified Testing Catalog](/quality/testing/)
- [Operations Platform Runbook](/operations/platform-operations-guide/)
- [Release Management](/devops-iac/release-management/)

Those pages remain the canonical owners of architecture, API, testing,
operations, and release detail; this catalog only connects the component view.
`)
await write('platform/components/_meta.js', `export default {
  'oem-component-catalog': 'OEM Component Catalog'
}\n`)

await write('platform/cli-interoperability.md', `# CLI & Interoperability Architecture

This page documents how external consumers interact with OEM through governed
interfaces. It does not implement a CLI, add backend behavior, or invent
commands.

## Core Principle

All consumers use the following boundary:

**Consumer → Authentication → Governed API → OEM Services → Data Layer**

Authentication and authorization follow the [Identity & Access Management
architecture](/security/identity-access-management/). Direct datastore access
is outside the supported interoperability model.

## CLI Model

The CLI is an operational consumer for scenarios already evidenced by the
administration inventory, including selected platform operations, Event State
Service administration, and configuration-source workflows. Existing command
syntax remains owned by its canonical service documentation; this page does not
reproduce or invent commands.

Where a capability is described as requiring CLI access but no stable command
contract is published, its command surface is **Designed**, not implemented by
this page. CLI clients must call governed APIs or approved service interfaces;
they must not bypass authorization or mutate internal stores directly.

## Interoperability Model

| Consumer | Interface | Status |
| --- | --- | --- |
| Frontend | Governed API/BFF → OEM services | Current |
| CLI | Governed API or service-owned administrative interface | Current where documented; otherwise Designed |
| Automation | Governed API and approved integration contracts | Current boundary; implementation is service-owned |
| AI Assistants | Governed APIs with IAM/RBAC context | Designed / optional |

## Authentication

CLI authentication follows the governed identity and RBAC model. A caller's
identity context is validated before service authorization, scope, tenant, and
audit decisions are applied.

## Frontend Boundary

Allowed:

**Frontend → API/BFF → Services**

Forbidden:

- **Frontend → PostgreSQL**
- **Frontend → Kafka**
- **Frontend → OpenSearch**

The same service ownership and data-authority boundaries apply to browser and
CLI consumers.

## Automation Boundary

Automation consumes governed APIs and approved command/integration contracts.
Automation does not obtain direct database, Kafka, or OpenSearch access. The
Integration Worker and adapters retain responsibility for approved external
side effects.

## API Relationship

The [OEM API Catalog](/platform/api/oem-api-catalog/) is the single inventory of
implemented, governed, designed, and mock APIs. This page does not define a new
endpoint or promote a mock interface.

## AI Relationship

Future AI assistants may consume governed interfaces with authenticated identity
context. AI remains optional, must pass RBAC, and cannot bypass authorization or
directly mutate databases, Kafka, state, or projections.

## Related Documentation

- [Identity & Access Management](/security/identity-access-management/)
- [OEM API Catalog](/platform/api/oem-api-catalog/)
- [OEM Component Catalog](/platform/components/oem-component-catalog/)
- [Administration API Inventory](/platform/administration-api-inventory/)
- [Kafka CLI reference](/platform/kafka/cli/)
`)

await write('platform/_meta.js', `export default {
  index: 'Engineering Overview',
  architecture: 'Integrated Architecture',
  'event-gateway': 'Event Gateway',
  'event-processor': 'Event Processor',
  components: 'Components',
  'cli-interoperability': 'CLI & Interoperability',
  'event-state-service': 'Event State Service',
  dashboards: 'Frontend & Dashboards',
  kafka: 'Kafka',
  api: 'APIs & Contracts',
  frontend: 'Frontend Handoffs',
  cacf: 'CACF Automation',
  integrations: 'Integrations',
  operations: 'Operations',
  git: 'Git Governance',
  labs: 'Certification Labs'
}\n`)

await write('deployment/index.md', landing('Deployment', [
  ['D6 Environment Architecture Map', '../architecture/d6-environment-evolution/'],
  ['D1 Local Deployment', '../architecture/d1-local-current/'],
  ['D2 Portable Kubernetes', '../architecture/d2-kvm-kubernetes-target/'],
  ['D3 On-Premises RHEL', '../architecture/d3-rhel-current/'],
  ['D4 QA GKE', '../architecture/d4-qa-gke-minimum-target/'],
  ['D5A Production GKE', '../architecture/d5a-prod-gke-runtime-target/'],
  ['D5B Production Composition', '../architecture/d5b-prod-gke-cicd-target/']
]))

await write('architecture/_meta.js', `export default {
  'oem-architecture-definition': 'Architecture Definition',
  'd0-logical-current': 'Logical Architecture — D0',
  'data-authority-replay': 'Data Architecture',
  'multi-surface-interaction': 'Interaction Architecture',
  'ai-01-aiops-ai-architecture': 'AI Architecture — AI-01',
  deployment: 'Deployment Operations',
  'd1-local-current': 'Deployment — D1 Local',
  'd2-kvm-kubernetes-target': 'Deployment — D2 Kubernetes',
  'd3-rhel-current': 'Deployment — D3 RHEL',
  'd4-qa-gke-minimum-target': 'Deployment — D4 QA GKE',
  'd5a-prod-gke-runtime-target': 'Deployment — D5A Production',
  'd5b-prod-gke-cicd-target': 'Deployment — D5B Composition',
  'd6-environment-evolution': 'Deployment — D6 Environment Map',
  'gcp-foundation-current': 'Cloud Architecture — GCP-01',
  'gcp-cicd-current': 'Cloud Architecture — GCP-02',
  evolution: 'Architecture Evolution',
  index: { display: 'hidden' },
  publication: { display: 'hidden' }
}\n`)

await write('platform/event-processor/correlation-service-manual-rules.md', `# Correlation Service — Manual Correlation Rules

## Overview

The Correlation Service is the Event Processor capability that evaluates normalized events against deterministic, manually configured rules. A match assigns an event to an existing correlation group or creates a new group, then records membership and lifecycle state through the authoritative Event State Service and PostgreSQL contract.

Correlation v1 is **CURRENT / DETERMINISTIC**. It is the reliable foundation for event lifecycle processing.

## What Correlation Does

Correlation evaluates normalized event attributes and tenant-scoped rule state after the Event Processor has the required policy and enrichment inputs. It derives a grouping decision, updates membership and lifecycle state, and leaves OpenSearch as a derived projection rather than operational authority.

## Core Concepts

- **Correlation rule** — a versioned rule in the shared \`/rules\` administration surface.
- **Event attributes** — normalized and evidenced enrichment fields used by evaluation.
- **Grouping key** — selected values that identify group membership.
- **Correlation group** — durable group identity and membership for a tenant and lifecycle cycle.
- **Scope and lifecycle** — decisions and state changes remain tenant-scoped and follow the event lifecycle contract.

## Rule Model

The implemented contract uses the shared \`/rules\` registry. Evidence supports rule identity/version, enabled state, priority/order, match/condition data, action parameters, tenant scope, and audit/checksum metadata where returned by the administration contract. The exact schemas remain defined by the API and implementation evidence; this page does not invent a replacement JSON schema.

## Conditions and Matching

Correlation uses the deterministic condition and attribute/group evaluation implemented by Event Processor. Supported operators are exactly those accepted by the shared rule validator. Keep's condition-builder semantics are not OEM claims.

## Grouping Strategy and Lifecycle

The documented baseline uses deterministic keys such as node, node plus component, service name, CI identity, and assignment group plus site. A normalized event is evaluated, a matching rule yields a key, the event joins an existing group or starts a new one, and membership/lifecycle state is persisted authoritatively.

## Rule Evaluation Flow

\`\`\`mermaid
flowchart LR
 E[Normalized event] --> R[Correlation rules]
 R --> C[Condition and attribute match]
 C --> K[Grouping key]
 K --> G[Existing or new group]
 G --> L[Lifecycle and membership]
 L --> P[(PostgreSQL authoritative state)]
\`\`\`

## Configuration and API / Administration

Rules are administered through the governed management API and shared \`/rules\` namespace. There is no dedicated \`/correlations\` endpoint in the current contract. Authorization, validation, versioning, and audit remain backend responsibilities.

## Examples

| Pattern | Input attributes | Grouping behavior |
| --- | --- | --- |
| Server | \`resource.node\` | Same node within the configured window. |
| Component | \`resource.node\`, \`resource.component\` | Same node and component. |
| Service | \`enrichment.service.name\` | Same service identity. |
| Dependency | \`enrichment.resource.ciId\` | Same CI identity. |
| Operational cause | \`enrichment.assignment.group\`, \`enrichment.location.site\` | Same assignment group and site. |

## Frontend Contract

The frontend may list and view rules and, only where authorized by the backend, create, edit, enable/disable, or delete them. It may represent evidenced identity, scope, grouping attributes, conditions, windows, limits, validation, version, and audit metadata. Simulation/preview is not claimed as currently implemented.

\`Frontend → Governed Management API/BFF → Correlation Service\`

Never connect the frontend directly to PostgreSQL or Kafka or implement correlation logic in the browser. See the [Correlation frontend handoff](/platform/event-processor/frontend-handoffs/correlation/).

## Deterministic Correlation vs AI-Assisted Correlation

Current correlation has no statistical similarity, ML, LLM, or AI dependency. It is deterministic rule evaluation over input, relevant state, and configuration.

### AI-Assisted Correlation — V2

**Status: DESIGN** · **Target release: V2**

AI-assisted correlation is currently in design and is planned for the V2 evolution of the Correlation Service. Candidate rule suggestions, pattern discovery, relationship recommendations, explanations, and tuning assistance remain governed recommendations; AI must not mutate stores, Kafka, or lifecycle state directly. See [AI-01](/architecture/ai-01-aiops-ai-architecture/).

| Capability | V1 Manual Correlation | V2 AI-Assisted |
| --- | --- | --- |
| Deterministic rules | Current | Preserved |
| Attribute grouping | Current | Preserved |
| Time windows | Current where configured | Preserved |
| Manual rule configuration | Current | Preserved |
| AI suggestions, discovery, explanations | Not current | Design |
| Governed approval | Current principle | Required |

## Implementation Evidence

The historical [Correlación — aceptación backend local](/platform/event-processor/correlation-backend/) page remains preserved as implementation/certification evidence, not the primary product title. See also the [rule contract](/platform/event-processor/correlation-suppression-commands/).

## Keep Reference

[Keep Manual Correlation Rules](/platform/labs/keep/) is an external reference for documentation patterns only. Keep semantics and dynamic naming syntax are not OEM claims.

## Related Documentation

- [Data Authority & Replay](/architecture/data-authority-replay/)
- [D0 Logical Architecture](/architecture/d0-logical-current/)
- [Historical certification evidence](/platform/event-processor/correlation-backend/)
`)

await write('platform/event-processor/correlation-engine-service.md', `# Correlation Engine Service

> **Classification: CURRENT**<br>
> **Model: Deterministic Hierarchical Correlation Engine**<br>
> **AI-assisted correlation: DESIGN / V2**

This is the engineering view of how the current Correlation Engine evaluates
normalized events. The [Manual Correlation Rules](/platform/event-processor/correlation-service-manual-rules/)
page remains the operator and product view; this page does not duplicate its
configuration guidance.

## 1. Purpose

The engine assigns related normalized events to a tenant-scoped correlation
group using deterministic rules, grouping keys, and lifecycle state. It has no
ML or LLM dependency.

## 2. Architecture Overview

\`\`\`mermaid
flowchart LR
  G[Event Gateway] --> K[Kafka transport / replay boundary]
  K --> P[Event Processor]
  P --> E[Correlation Engine]
  E --> S[Event State Service]
  S --> DB[(PostgreSQL\nOperational Source of Truth)]
  DB --> OS[(OpenSearch\nderived projection)]
\`\`\`

The engine is a capability of Event Processor. Kafka is transport and a bounded
replay boundary; PostgreSQL is authoritative operational state; OpenSearch is
derived and rebuildable.

## 3. Deterministic Correlation Model

The current model uses deterministic condition and attribute evaluation. It has
no statistical similarity, machine-learning, LLM, or AI dependency. Given the
same normalized input, tenant-scoped rule revision, relevant state, and
configuration, evaluation produces the same grouping decision.

## 4. Rule Evaluation

The shared \`/rules\` contract supplies rule identity and version, enabled state,
priority/order, match or condition data, action parameters, and tenant scope as
supported by the current implementation. The engine evaluates eligible rules,
selects the applicable grouping strategy, and emits a correlation decision;
validation and authorization remain service responsibilities.

Verified rule baseline:

| Rule | Meaning | Evidence-based key |
| --- | --- | --- |
| CR-001 | Server | \`resource.node\` |
| CR-002 | Component | \`resource.node\`, \`resource.component\` |
| CR-003 | Service | \`enrichment.service.name\` |
| CR-004 | Dependency | \`enrichment.resource.ciId\` |
| CR-005 | Operational Cause | \`enrichment.assignment.group\`, \`enrichment.location.site\` |

The identifiers above are engineering labels for the verified baseline. The
runtime contract remains the shared rules registry; no new endpoint is implied.

## 5. Hierarchical Matching

Matching proceeds from the configured rule and its eligible attributes to a
grouping key. A more specific key can refine a broader relationship (for
example, node plus component within a service context) while preserving the
tenant and lifecycle scope. Unsupported strategy types are not inferred from
the documentation.

\`\`\`mermaid
flowchart TD
  N[Normalized event] --> T[Tenant scope]
  T --> R[Eligible rule revision]
  R --> A[Attribute / condition match]
  A --> H[Hierarchical key selection]
  H --> M{Matching group?}
  M -- yes --> J[Join group]
  M -- no --> C[Create group]
  J --> L[Lifecycle update]
  C --> L
\`\`\`

## 6. Correlation Keys and Groups

Keys are derived from evidenced normalized attributes such as \`resource.node\`,
\`resource.component\`, \`enrichment.service.name\`, \`enrichment.resource.ciId\`,
\`enrichment.assignment.group\`, and \`enrichment.location.site\`. A correlation
group has durable identity, membership, tenant scope, and lifecycle cycle. The
event identity remains distinct from command identities such as
\`correlation:<groupId>\`.

## 7. Lifecycle Management

For each decision the engine evaluates the current lifecycle context, joins an
existing group or starts a new group, records membership, and hands the state
transition to the Event State Service contract. Group closure, history, and
quarantine follow the existing lifecycle ownership; this page does not invent a
second state machine.

\`\`\`mermaid
sequenceDiagram
  participant P as Event Processor
  participant E as Correlation Engine
  participant S as Event State Service
  participant DB as PostgreSQL
  P->>E: normalized event + rule context
  E->>E: evaluate deterministic hierarchy
  E->>S: correlation decision and membership
  S->>DB: persist authoritative lifecycle state
  DB-->>S: committed group state
  S-->>P: lifecycle result
\`\`\`

## 8. Persistence and Data Authority

- **Kafka:** transport and bounded replay boundary; not operational authority.
- **PostgreSQL:** Operational Source of Truth for durable group, membership, and
  lifecycle state.
- **OpenSearch:** derived, rebuildable search and analytics projection; not
  authoritative state.

Replay is not backup/restore, and a projection is not operational truth.

## 9. API Relationship

The [OEM API Catalog](/platform/api/oem-api-catalog/) is the single API
inventory. Current administration uses the governed shared \`/rules\` namespace;
there is no dedicated \`/correlations\` endpoint in the current contract.

## 10. Frontend Boundary

The engineering boundary is:

\`Frontend → API/BFF → Correlation Service\`

The frontend does not access PostgreSQL, Kafka, or OpenSearch directly and does
not implement correlation logic in the browser.

## 11. Examples

- **Server (CR-001):** events sharing \`resource.node\` are evaluated for the
  configured server group.
- **Component (CR-002):** \`resource.node\` plus \`resource.component\` refines the
  group within a host.
- **Service (CR-003):** \`enrichment.service.name\` identifies the service group.
- **Dependency (CR-004):** \`enrichment.resource.ciId\` identifies the related CI.
- **Operational cause (CR-005):** \`enrichment.assignment.group\` plus
  \`enrichment.location.site\` identifies the operational context.

These examples describe the verified attribute names and grouping behavior; they
do not add endpoints or claim unsupported fields.

## 12. AI-Assisted Correlation — V2

**Status: DESIGN / V2.** Future assistance may suggest rules, discover patterns,
recommend relationships, explain decisions, or help tune thresholds. Such
recommendations require governed approval and must not directly mutate rules,
Kafka, PostgreSQL, lifecycle state, or projections. AI remains optional and is
not a dependency of the current deterministic engine.

## 13. Related Documentation

- [Manual Correlation Rules](/platform/event-processor/correlation-service-manual-rules/)
- [Correlation rule contract](/platform/event-processor/correlation-suppression-commands/)
- [Event Processor rules and contracts](/platform/event-processor/rules-and-contracts/)
- [Correlation frontend handoff](/platform/event-processor/frontend-handoffs/correlation/)
- [Data Authority & Replay](/architecture/data-authority-replay/)
- [AI-01 architecture](/architecture/ai-01-aiops-ai-architecture/)
`)

await write('operations/platform-operations-guide.md', `# Operations Platform Runbook

This is the canonical operational entry point for Event Management. It links
existing architecture, configuration, validation, and recovery evidence; it
does not add unsupported procedures or commands.

## 1. Operations Overview

Operations separates installation, configuration, deployment, observability,
recovery, and troubleshooting. Operational evidence contributes to the [Quality
Status Dashboard](/quality/status/), which remains the operational quality view;
Project Status remains the executive summary.

## 2. Environment Profiles

| Environment | Operational profile | Evidence |
| --- | --- | --- |
| Local Development | Docker Compose development and validation of core services | [D1 Local](/architecture/d1-local-current/) |
| On-Prem RHEL/KVM Development | RHEL/KVM deployment profile with environment-specific VM boundaries | [D3 RHEL](/architecture/d3-rhel-current/) |
| QA GKE | GCP foundation, GKE runtime, and governed delivery relationship | [D4 QA GKE](/architecture/d4-qa-gke-minimum-target/) |
| Production GKE | Production runtime, foundation, delivery, and composition model | [D5A Runtime](/architecture/d5a-prod-gke-runtime-target/) · [D5B Composition](/architecture/d5b-prod-gke-cicd-target/) |

These links describe architecture profiles. They do not by themselves claim
certification or production readiness.

## 3. Installation

- **Documented installation:** local Docker Compose and the environment
  architecture references above.
- **Certified installation:** only the certification evidence linked from the
  Quality and Certification Lab sections is authoritative.
- **Pending procedures:** environment-specific installation steps remain pending
  where the source documentation does not provide an approved procedure.

No new installation command is introduced here.

## 4. Configuration

Use the existing Operations Configuration capabilities; this page does not
duplicate them:

[Correlation](/platform/event-processor/correlation-service-manual-rules/) ·
[Deduplication and Suppression](/platform/event-processor/correlation-suppression-commands/) ·
[Auto-Suppression](/platform/event-processor/auto-suppression/) ·
[Blackouts & Maintenance](/platform/event-processor/rest-and-blackouts/) ·
[Enrichment](/platform/event-processor/enrichment-and-inventory/) ·
[Routing](/platform/event-processor/routing-backend/) ·
[Filters & Criteria](/platform/event-processor/policy-backend/) ·
[Ticketing](/platform/event-processor/routing-backend/) ·
[Notifications](/platform/gnm/CHANGELOG/) ·
[Automation](/platform/cacf/README/)

Policies, inventory, and CMDB-related material remain owned by their existing
canonical platform pages.

## 5. Deployment

- **Local:** Docker Compose, using the documented local architecture and
  validation evidence.
- **On-Prem:** RHEL/KVM deployment profile described by D3.
- **Cloud:** GKE/Terraform/Cloud Build relationships described by D4, D5A, and
  D5B. These references distinguish foundation, delivery, runtime, and
  composition; they are not new deployment instructions.

## 6. Observability

Operational observation is based only on existing evidence: service logs,
health validation, metrics or dashboards where documented, and certification
validation results. See [Frontend & Dashboards](/platform/dashboards/product-observability/) and the
platform validation pages. No monitoring tool or alerting procedure is claimed
here without an existing source.

## 7. Recovery

Recovery follows [Data Authority & Replay](/architecture/data-authority-replay/):

- **Kafka:** transport and bounded replay boundary.
- **PostgreSQL:** authoritative operational recovery source.
- **OpenSearch:** derived projection that can be rebuilt.

Replay is not backup/restore, and OpenSearch is not operational authority.

## 8. Troubleshooting

| Problem | Validation | Resolution | Evidence |
| --- | --- | --- | --- |
| Service or route unavailable | Use the owning service health/validation page | Follow the documented service runbook | [Platform validation](/platform/event-processor/implementation-status/) |
| Configuration behavior differs | Check the governed configuration contract and revision | Use the canonical configuration page; do not bypass the API | [Operations Configuration](/operations/) |
| Lifecycle or projection discrepancy | Compare PostgreSQL authority, replay boundary, and derived projection | Follow the Data Authority & Replay semantics | [Data Authority & Replay](/architecture/data-authority-replay/) |

This index intentionally does not invent fixes, shell commands, or incident
procedures.

## 9. Operational References

- [D6 Environment Evolution](/architecture/d6-environment-evolution/)
- [Operations landing page](/operations/)
- [Quality Status Dashboard](/quality/status/)
- [Certification Labs](/platform/labs/)
- [OEM API Catalog](/platform/api/oem-api-catalog/)
`)

await write('operations/index.md', [
  '# Operations', '',
  '## Configuration', '',
  ['Correlation', '/platform/event-processor/correlation-service-manual-rules/'],
  ['Deduplication', '/platform/event-processor/correlation-suppression-commands/'],
  ['Suppression', '/platform/event-processor/correlation-suppression-commands/'],
  ['Auto-Suppression', '/platform/event-processor/auto-suppression/'],
  ['Blackouts & Maintenance', '/platform/event-processor/rest-and-blackouts/'],
  ['Enrichment', '/platform/event-processor/enrichment-and-inventory/'],
  ['Routing', '/platform/event-processor/routing-backend/'],
  ['Filters & Criteria', '/platform/event-processor/policy-backend/'],
  ['Ticketing', '/platform/event-processor/routing-backend/'],
  ['Notifications', '/platform/gnm/CHANGELOG/'],
  ['Automation', '/platform/cacf/README/'],
  ['Runbooks', 'operations/platform-operations-guide/'],
  ['Observability', 'operations/observability/'],
  ['Incidents', 'operations/incidents/'],
  ['Recovery', 'operations/disaster-recovery/'],
  ['Security', 'security/secrets-management/']
].map((line) => Array.isArray(line) ? `- [${line[0]}](${portalHref(line[1])})` : line).join('\n') + '\n')

await write('operations/_meta.js', `export default {
  index: 'Operations',
  configuration: {
    title: 'Configuration',
    type: 'menu',
    items: {
      correlation: { title: 'Correlation', href: '/platform/event-processor/correlation-service-manual-rules/' },
      deduplication: { title: 'Deduplication', href: '/platform/event-processor/correlation-suppression-commands/' },
      suppression: { title: 'Suppression', href: '/platform/event-processor/correlation-suppression-commands/' },
      'auto-suppression': { title: 'Auto-Suppression', href: '/platform/event-processor/auto-suppression/' },
      'blackouts-maintenance': { title: 'Blackouts & Maintenance', href: '/platform/event-processor/rest-and-blackouts/' },
      enrichment: { title: 'Enrichment', href: '/platform/event-processor/enrichment-and-inventory/' },
      routing: { title: 'Routing', href: '/platform/event-processor/routing-backend/' },
      'filters-criteria': { title: 'Filters & Criteria', href: '/platform/event-processor/policy-backend/' },
      ticketing: { title: 'Ticketing', href: '/platform/event-processor/routing-backend/' },
      notifications: { title: 'Notifications', href: '/platform/gnm/CHANGELOG/' },
      automation: { title: 'Automation', href: '/platform/cacf/README/' }
    }
  },
  'platform-operations-guide': 'Platform Operations Guide',
  observability: 'Observability',
  incidents: 'Incidents',
  'disaster-recovery': 'Recovery'
}\n`)

await write('integrations/integration-architecture.md', `# Integration Architecture — Integration Instances

This page defines the target model for managing integration instances and their
secret references. It is architecture documentation only: it does not implement
integrations, configure OpenBAO, or change runtime adapters.

## Integration Instance Model

An integration instance is the tenant-scoped administrative identity for one
external-system connection. Its documented fields are:

| Field | Boundary |
| --- | --- |
| Instance Identity | Stable instance identifier and owning tenant |
| Tenant Scope | Tenant/customer boundary for the instance |
| Endpoint | External-system endpoint or endpoint reference |
| Authentication Method | Chosen authentication mechanism, without secret material |
| Secret Reference | Logical reference to secret storage, never the secret value |
| Adapter | Provider adapter selected for the integration |
| Configuration | Non-secret, versioned provider settings |
| Lifecycle | Created, configured, validated, active, updated, disabled, retired |
| Audit | Actor, revision, validation, and lifecycle change evidence |

## Secret Management Boundary

The target flow is:

**Integration Instance → Secret Reference → OpenBAO → Runtime Adapter →
External System**

The instance stores a logical secret reference. OpenBAO is the target secret
boundary; the runtime adapter resolves authorized secret material at execution
time. Secrets must not be stored in Git, container images, plain configuration,
or hardcoded credentials.

OpenBAO integration is **DESIGNED / PLANNED** in this documentation. Existing
evidence does not establish a completed OpenBAO-backed production integration,
so no implementation or certification claim is made.

## Lifecycle

1. **Created:** identity and tenant scope are registered.
2. **Configured:** endpoint, adapter, and non-secret settings are provided.
3. **Validated:** the governed management path checks configuration and access.
4. **Active:** the instance is eligible for authorized runtime use.
5. **Updated:** changes create a new revision and audit record.
6. **Disabled:** runtime use is blocked without deleting history.
7. **Retired:** the instance is no longer available for new operations and its
   evidence remains auditable.

## Governance and Auditability

Instance changes require ownership, tenant scope, authorization, validation,
revision tracking, and audit evidence. Secret values remain outside the
documentation and outside ordinary configuration payloads.

## RBAC Relationship

The planned authorization boundary is:

**User → RBAC → Integration Management API → Integration Instance**

See [Identity & Access Management](/security/identity-access-management/).
Authentication and authorization remain separate concerns, and clients do not
bypass governed APIs.

## API and Component Relationships

The [OEM API Catalog](/platform/api/oem-api-catalog/) remains the single API
inventory. This page does not invent an integration-instance endpoint. The
[Component Catalog](/platform/components/oem-component-catalog/) identifies the
Integration Worker and provider adapters that execute approved commands.

## Existing Integrations

Existing integration documentation remains canonical and is not rewritten here:

- [ServiceNow](/platform/servicenow/CHANGELOG/)
- [GNM](/platform/gnm/CHANGELOG/)
- [ChatOps](/integrations/chatops/)
- [BMC Helix](/integrations/bmc-helix/)
- [ELK Pull Data](/integrations/elk-pull-data/)

The presence of a documentation placeholder does not claim a completed adapter,
secret integration, or production certification.
`)
await write('integrations/_meta.js', `export default {
  index: 'Integrations',
  'custom-api': 'Custom API',
  'integration-architecture': 'Integration Architecture — Instances'
}\n`)

await write('integrations/custom-api.md', `# Custom API

## Solution Architecture

Custom API is the provider-neutral, API-first, adapter-based and governed OEM
integration model. It extends integrations without embedding vendor behavior in
OEM Core.

External System -> Custom API / Provider Interface -> Governed Integration Contract
-> Adapter / Provider Implementation -> OEM Integration Boundary -> OEM Core.

The event path remains Gateway -> Kafka -> Processor -> integration intent ->
Worker/Adapter -> external system -> integration result -> ESS. Processor decides;
Worker/Adapter executes; ESS consolidates.

## Integration Model

Provider catalog metadata, installed configuration, provider instance identity,
credential/secret references, scopes, supported methods, capabilities,
execution behavior, health validation, and audit provenance remain separate
concepts. Provider identity is explicit through providerId and providerType;
existing AlertDto source and fingerprint relationships are preserved.

## Provider Model

The documented extension point is compatible with separate incident/ticketing,
notification and other provider categories where an existing adapter supports
them. Existing ServiceNow, GNM, GLPI and CACF material remains authoritative;
Custom API does not replace those providers.

## Provider Lifecycle

Where supported by the provider contract, lifecycle stages are configuration,
validate_config, initialization, execution, health/availability and dispose.

## Capabilities

Capabilities, methods, authentication metadata, scopes and supported operations
must be discovered explicitly. Credentials are represented by governed secret
references, never by payloads or catalog metadata.

## API Contracts

The governed [OEM API Catalog](/platform/api/oem-api-catalog/) is the API
boundary. Existing evidence identifies provider discovery through GET /providers;
no additional Custom API endpoint is asserted here.

## Endpoint Contract Matrix

| Contractual Endpoint | Real Endpoint | Status | Required Change | Owner Repository |
| --- | --- | --- | --- | --- |
| GET /providers | GET /providers | MATCH | None evidenced | event-management-platform |

## Security and Secrets

State-changing operations remain behind identity, authorization, policy,
validation and audit controls. Secret payloads must not appear in Git,
documentation, provider metadata, event payloads or logs.

## Execution and Error Handling

Adapters own bounded external execution, including provider-specific timeout,
retry and error classification where documented. No universal exactly-once
external execution is claimed, and replay does not automatically repeat external
side effects.

## Data Authority

Kafka remains the transport/replay boundary, PostgreSQL the Operational Source
of Truth, and OpenSearch a derived search/analytics projection. External
providers are not operational authority.

## Extensibility

The extension point allows ServiceNow, GNM, GLPI, Custom API and future
providers to implement governed contracts without modifying OEM Core.

## Implementation Status

The Custom API architecture is **DESIGNED**. Provider discovery is evidenced;
a complete Custom API adapter, production credentials, and production
certification are not claimed.

## Related Architectures

See [D0 Logical Architecture](/architecture/d0-logical-current/),
[Data Authority & Replay](/architecture/data-authority-replay/),
[Multi-Surface](/architecture/multi-surface-interaction/),
[AI-01](/architecture/ai-01-aiops-ai-architecture/), and [Integration
Instances](/integrations/integration-architecture/).

## Customer Documentation Template

This page is the customer-facing template for implementable integration
solutions. It is written for administrators, operators, and integration users;
internal classes, packages, and backend implementation details are intentionally
excluded.

## 1. Overview

Custom API is a planned integration pattern for connecting an approved external
system through governed OEM interfaces. Provider-specific behavior, credentials,
and production certification are not yet specified here.

## 2. Architecture

The supported boundary is:

**External System → Governed OEM API/Integration Worker → Adapter → Custom API**

The adapter and external system remain behind governed contracts. Customers do
not connect directly to PostgreSQL, Kafka, or OpenSearch.

## 3. Prerequisites

Before implementation, an administrator must have an approved tenant, endpoint,
authentication method, secret reference, adapter configuration, and validation
scope. The required provider-specific checklist is **Designed / Pending**.

## 4. Installation

CLI installation is **Designed / Pending**. No supported installation command
is currently evidenced, so this page does not invent one.

## 5. Configuration

User-facing configuration will include endpoint, authentication method, secret
reference, tenant scope, request/response settings, timeout or retry policy
where supported, and lifecycle state. Secret values must never be entered into
documentation, Git, images, or plain configuration.

## 6. API Usage

Consumers will use the governed OEM API relationship documented in the [OEM API
Catalog](/platform/api/oem-api-catalog/). Custom API request and response
examples are **Pending** an evidence-backed contract; no endpoint is invented.

## 7. Dashboard Installation

Dashboard installation and use are **Designed / Pending**. Where a dashboard is
approved, its user documentation will describe installation, views, filters,
and access without exposing frontend implementation details.

## 8. Input Data

Input fields, required headers, tenant context, and validation rules are
provider-specific and remain **Pending** a governed contract. Inputs must be
validated before an integration action is authorized.

## 9. Output Data

Output payloads, status, error behavior, and correlation references are
provider-specific and remain **Pending** evidence. Output must remain within
the governed integration and audit contracts.

## 10. Testing

The future integration test plan will cover API validation, event or data
collection validation, expected results, failure handling, and evidence capture.
No Custom API test result is claimed yet. Results belong in the [Certified
Testing Catalog](/quality/testing/).

## 11. Health & Monitoring

Health verification is **Designed / Pending** provider evidence. Once available,
users will verify configuration validity, connectivity, recent activity, and
failure status through documented governed capabilities. This page does not
invent monitoring tools or commands.

## 12. Troubleshooting

Troubleshooting procedures are **Pending** an approved contract and support
evidence. Users should not bypass the API boundary or inspect internal stores;
support guidance will link validated resolutions when available.

## 13. Release History

Release history will link [Release Management](/devops-iac/release-management/),
the canonical changelog, and approved version references. No Custom API version
or release is currently assigned.

## 14. Issue Activity Log

Issue activity will record approved documentation and validation changes through
the project governance process. This page is not a ticketing system; unresolved
work remains in the authorized project tracking process.

## Related Integrations

This template establishes the standard for future ServiceNow, GNM, ChatOps, BMC
Helix, and ELK Pull Data documentation. Existing integration pages remain
canonical and are not rewritten by this template.
`)

await write('integrations/index.md', landing('Integrations', [
  ['Custom API', 'integrations/custom-api/'],
  ['Integration Architecture — Instances', 'integrations/integration-architecture/'],
  ['CACF', '../platform/cacf/README/'],
  ['GLPI', '../platform/integrations/glpi/'],
  ['ServiceNow', '../platform/servicenow/CHANGELOG/'],
  ['GNM', '../platform/gnm/CHANGELOG/'],
  ['ChatOps', 'integrations/chatops/'],
  ['Bridge Extensions', 'integrations/bridge-extensions/'],
  ['BMC Helix', 'integrations/bmc-helix/'],
  ['ELK Pull Data', 'integrations/elk-pull-data/']
]))

await write('integrations/chatops.md', '# ChatOps\n\nIntegration documentation pending.\n')
await write('integrations/bridge-extensions.md', '# Bridge Extensions\n\nIntegration documentation pending.\n')
await write('integrations/bmc-helix.md', '# BMC Helix\n\nIntegration documentation pending.\n')
await write('integrations/elk-pull-data.md', '# ELK Pull Data\n\nIntegration documentation pending.\n')

await write('ai-automation/local-llm-runtime-ollama.md', `# Local LLM Runtime — Ollama

This page documents the target local model runtime boundary for Event
Management. It is separate from [AI-01](/architecture/ai-01-aiops-ai-architecture/):
AI-01 defines the overall AIOps architecture, while this page describes local
model execution and its validation boundaries.

## Status

**DESIGN / PLANNED — NOT CERTIFIED.** The current evidence explicitly does not
claim an implemented LLM/OLLM runtime, production model gateway, agents, or
production AI automation. No Ollama deployment or model is certified by this
page.

## Runtime Model

**User → OEM AI Interface → Governed API → Local AI Runtime → Ollama → Certified Model**

The interface and API enforce identity, authorization, context controls, and
audit boundaries before a local runtime receives a request.

## Model Lifecycle

The target lifecycle is Download → Validation → Certification → Deployment →
Execution → Upgrade → Retirement. Each transition requires evidence and an
approval boundary; a downloaded model is not automatically certified.

## Model Catalog

| Model | Purpose | Version | Validation | Status |
| --- | --- | --- | --- | --- |
| No certified model | No evidence-backed local model is currently registered | — | Pending | Not Certified |

AI-01 remains provider- and model-neutral. No Blackout, Checklist, or other
model is promoted here without inspected implementation evidence.

## Security Boundary

Allowed: local execution, controlled context, and governed access.

Forbidden: secrets in prompts, direct database access, direct state mutation, or
uncontrolled privileged access. Local execution does not bypass RBAC or service
ownership.

## RBAC Relationship

**User → RBAC → AI Interface → Model Runtime**

See [Identity & Access Management](/security/identity-access-management/).

## Correlation Relationship

Deterministic Correlation remains current. AI-assisted correlation is a V2 design:
AI may recommend, while governed human and service approval decides. AI cannot
directly mutate correlation rules, PostgreSQL, Kafka, state, or projections.

## Operations

Installation, configuration, model loading, validation, execution,
troubleshooting, upgrade, and retirement procedures remain pending until
evidence-backed local runtime procedures are available. This page does not add
commands or claim production operations.

## Related Documentation

- [AI-01 AIOps architecture](/architecture/ai-01-aiops-ai-architecture/)
- [OEM API Catalog](/platform/api/oem-api-catalog/)
- [Identity & Access Management](/security/identity-access-management/)
- [Operations Platform Runbook](/operations/platform-operations-guide/)
`)

await write('ai-automation/index.md', landing('AI & Automation', [
  ['AI-01 Architecture', '../architecture/ai-01-aiops-ai-architecture/'],
  ['Local LLM Runtime — Ollama', 'ai-automation/local-llm-runtime-ollama/'],
  ['AIOps implementation', '../platform/event-processor/aiops-engine/'],
  ['CACF / Automation', '../platform/cacf/README/']
]))

await write('quality/status/index.md', `# Event Management Platform Status

## Overall Status

**🟢 Validated**

This is a documentation status view based on latest documented validation evidence. It is not live monitoring, runtime health, observability, or ticketing.

**Last documented update:** latest repository validation and publication evidence.
**Evidence basis:** Based on latest documented validation evidence.

## Component Status

| Component | Status | Evidence |
| --- | --- | --- |
| Event Gateway | 🟢 Validated | Architecture Definition and environment documentation. |
| Event Processor | 🟢 Validated | Event Processor contracts, validation documentation, and certification evidence. |
| Event State Service | 🟢 Validated | Data authority, lifecycle, and persistence documentation. |
| Correlation Service | 🟢 Validated | Correlation Service product page and preserved backend evidence. |
| Integrations | 🟡 Attention | Integration contracts and adapter evidence exist; provider-specific production certification remains bounded. |
| Documentation Portal | 🟢 Validated | Nextra build, Pagefind, link audit, and Pages deployment evidence. |
| Automation | 🟡 Attention | CACF contracts and documentation exist; external-provider production behavior remains bounded. |
| AI Evolution | 🔵 Design | AI-01 architecture is planned/documented; production AI implementation is not claimed. |

## Latest Release

- **Version:** No semantic product version assigned in the current release records.
- **Tag:** No release tag claimed by the current documentation.
- **Scope:** Current documented architecture, portal, navigation, validation, and evidence set.

Release identity remains governed by repository commit and approved publication records until a formal release process assigns a version and tag.

## Environment Evolution

| Environment | Status | Evidence |
| --- | --- | --- |
| Local Certified | 🟢 Validated | OS_01_01 certification material and local validation records. |
| On-Prem RHEL/KVM Development | 🟡 Attention | Architecture target documented; deployment certification remains bounded. |
| QA GKE | 🟡 Attention | QA GKE architecture and validation path documented; scope remains environment-specific. |
| Production GKE | 🔵 Design | Production runtime/composition architecture documented; implementation certification is separate. |

## Certification Summary

- [OS_01_01 Certification Lab](/platform/labs/os-01-01/acceptance-checklist/)
- [Keep External Reference](/platform/labs/keep/)
- [Correlation backend evidence](/platform/event-processor/correlation-backend/)

These links reference existing canonical pages; this dashboard does not duplicate lab content.

## Recent Changes

Recent documented milestones include the architecture publication set, Nextra portal and Kyndryl theme, Operations Configuration navigation, Correlation Service product documentation, Keep external-reference integration, Certification Lab discovery, and the Global Defect Prevention Index. The canonical changelogs and evolution records remain the detailed timeline sources.

## Status Sources

- Architecture Definition and environment evolution records
- Component CHANGELOG and release records
- Validation reports and link audits
- Certification Labs and implementation evidence
- [Project Status executive summary](/project/status/)

The Quality Status Dashboard is the operational quality view. Project Status remains the executive summary. Neither page claims live monitoring or replaces observability.
`)

await write('quality/testing/index.md', `# Certified Testing Catalog

This catalog is the evidence registry for documented Event Management testing.
It records what was tested, scope, environment, result, and supporting evidence.
It is not a test execution platform, CI replacement, monitoring system, or
defect tracker.

## Status Model

Only evidence-supported statuses are used: **Certified**, **Validated**,
**PASS**, **Attention**, **Planned**, and **Not Certified**. A status is not
upgraded because an architecture is documented or because a mock succeeds.

## Catalog

| Test ID | Type | Scope | Component | Environment | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| OS-01-01 | Environment Certification | Zabbix message-bus acceptance | Event Gateway and integrations | Local Certification | Certified | [Acceptance Checklist](/platform/labs/os-01-01/acceptance-checklist/) |
| CORR-LOCAL | Functional | Deterministic correlation, groups, membership, persistence | Correlation / Event Processor | Local Certified | Validated | [Correlation backend evidence](/platform/event-processor/correlation-backend/) |
| ESS-VALIDATION | Integration | State lifecycle and administration validation | Event State Service | Local | Validated | [ESS validation](/platform/event-state-service/validation/) |
| KAFKA-CERT | Deployment | Kafka installation and certification gates | Kafka | Local / candidate | Not Certified | [Kafka installation and certification](/platform/kafka/installation-and-certification/) |
| GKE-VALIDATION | Deployment | QA runtime architecture and validation path | GKE / OEM runtime | QA GKE | Planned | [D4 QA GKE architecture](/architecture/d4-qa-gke-minimum-target/) |

## Test Types and Evidence Boundaries

The catalog classifies documented Functional, Integration, API, E2E,
Deployment, Compatibility, Security, Performance, and Environment Certification
evidence when present. No unsupported QE Agent, DEV-BOOT, Windows, or production
GKE result is added to this registry; those terms require an inspected evidence
record before they can receive a status.

## Environment Coverage

- **Local:** certified and validated records exist for OS-01-01, correlation,
  ESS, and candidate Kafka gates.
- **On-Prem RHEL/KVM:** deployment architecture is documented; no separate
  certification result is claimed here.
- **QA GKE:** D4 defines the validation path; execution evidence remains
  Planned in this catalog.
- **Production GKE:** D5A/D5B define runtime and composition architecture; no
  production certification result is claimed.

## Quality and Governance Relationships

The Certified Testing Catalog provides evidence consumed by the [Quality Status
Dashboard](/quality/status/). The dashboard remains the operational quality
view; this page is the evidence registry and does not own live status.

Failed validations may inform [Defect Prevention](/project/defect-prevention-global-index/),
but this catalog does not create automatic defect workflows or tickets.

## Search and References

Use the linked evidence for the test scope, result, and acceptance details.
Certification Labs remain a separate navigation and evidence collection; this
page indexes evidence without duplicating lab content.
`)

await write('quality/_meta.js', `export default {
  index: 'Quality',
  status: {
    title: 'Status',
    type: 'menu',
    items: {
      dashboard: { title: 'Dashboard', href: '/quality/status/' }
    }
  },
  testing: {
    title: 'Testing',
    type: 'menu',
    items: { 'certified-testing-catalog': { title: 'Certified Testing Catalog', href: '/quality/testing/' } }
  },
  'certification-lab': {
    title: 'Certification Lab',
    type: 'menu',
    items: {
      'os-01-01-acceptance-checklist': { title: 'OS_01_01 — Acceptance Checklist', href: '/platform/labs/os-01-01/acceptance-checklist/' },
      'os-01-01-operational-runbook': { title: 'OS_01_01 — Operational Runbook', href: '/platform/labs/os-01-01/operational-runbook/' },
      'os-01-01-contract': { title: 'OS_01_01 — Contract', href: '/platform/labs/os-01-01/contract/' },
      'os-01-01-field-mapping': { title: 'OS_01_01 — Field Mapping', href: '/platform/labs/os-01-01/field-mapping/' },
      'os-01-01-decisions-adr': { title: 'OS_01_01 — Decisions ADR', href: '/platform/labs/os-01-01/decisions-adr/' },
      keep: { title: 'Keep', href: '/platform/labs/keep/' }
    }
  }
}\n`)

await write('quality/index.md', landing('Quality', [
  ['Status Dashboard', 'quality/status/'],
  ['Testing', 'quality/testing/'],
  ['Defect Prevention', '../project/defect-prevention/'],
  ['Certification Labs', '../platform/labs/os-01-01/acceptance-checklist/']
]))

await write('quality/_meta.js', `export default {
  index: 'Quality',
  status: {
    title: 'Status',
    type: 'menu',
    items: { dashboard: { title: 'Dashboard', href: '/quality/status/' } }
  },
  testing: {
    title: 'Testing',
    type: 'menu',
    items: { 'certified-testing-catalog': { title: 'Certified Testing Catalog', href: '/quality/testing/' } }
  },
  'certification-lab': {
    title: 'Certification Lab',
    type: 'menu',
    items: {
      'os-01-01-acceptance-checklist': { title: 'OS_01_01 — Acceptance Checklist', href: '/platform/labs/os-01-01/acceptance-checklist/' },
      'os-01-01-operational-runbook': { title: 'OS_01_01 — Operational Runbook', href: '/platform/labs/os-01-01/operational-runbook/' },
      'os-01-01-contract': { title: 'OS_01_01 — Contract', href: '/platform/labs/os-01-01/contract/' },
      'os-01-01-field-mapping': { title: 'OS_01_01 — Field Mapping', href: '/platform/labs/os-01-01/field-mapping/' },
      'os-01-01-decisions-adr': { title: 'OS_01_01 — Decisions ADR', href: '/platform/labs/os-01-01/decisions-adr/' },
      keep: {
        title: 'Keep',
        href: '/platform/labs/keep/'
      }
    }
  }
}\n`)

await write('security/index.md', `# Security

Security documentation covers design boundaries and operational controls. The
Identity & Access Management page is a planned architecture; it is not an
implementation or certification claim.

- [Identity & Access Management](identity-access-management/)
- [Secrets Management](secrets-management/)
- [Threat Model](threat-model/)
`)
await write('security/_meta.js', `export default {
  index: 'Security',
  'identity-access-management': 'Identity & Access Management',
  'secrets-management': 'Secrets Management',
  'threat-model': 'Threat Model'
}\n`)
await write('security/identity-access-management.md', `# Identity & Access Management

> **Status: DESIGN / PLANNED**<br>
> **Implementation: NOT IMPLEMENTED**<br>
> **Testing: PENDING**<br>
> **Certification: PENDING**

This page defines a future identity and access-management architecture for
Event Management. It does not implement authentication, configure Keycloak,
integrate Kyndryl OneID Connect, or create runtime claims.

## Authentication Architecture

The planned trust path is:

\`User → Kyndryl OneID Connect → Keycloak → OEM Identity Layer → RBAC Authorization → Frontend/API/CLI → OEM Services\`

Authentication establishes who the caller is. Authorization decides what that
identity may do. They remain separate responsibilities.

### Responsibilities

- **Kyndryl OneID Connect:** the planned enterprise identity provider and user
  authentication boundary; integration details remain pending.
- **Keycloak:** the planned identity broker/token service boundary; deployment,
  realms, clients, and mappings are not configured.
- **OEM Authorization Layer:** the planned policy decision boundary that
  evaluates permissions, resources, actions, scopes, and tenant context before
  a governed API reaches an OEM service.

## Authorization Model (RBAC)

The design vocabulary is **role**, **permission**, **resource**, **action**,
**scope**, and **tenant**. A role groups permissions; a permission combines a
resource and action; scope and tenant constrain where that permission applies.

Examples such as an operator reading event state or an administrator changing
configuration are design examples only. They are not a final role catalog and
must not be treated as runtime claims.

## Authorization Flow

1. Authentication establishes the caller identity.
2. The token is validated at the governed interface.
3. Claims are extracted into an authorization context.
4. Permissions are evaluated for the requested resource and action.
5. A resource decision is made for the applicable scope and tenant.
6. The decision and relevant action are auditable according to the owning
   service contract.

### Claims (Design Examples)

Possible future claim fields include an issuer, subject, tenant, roles, and
scopes. These are examples to guide contract design only. **The final claims
contract is pending implementation.** No claim is currently issued or accepted
by this page.

## Keycloak Integration Design

Keycloak is a planned integration boundary between enterprise identity and the
OEM identity layer. Future design work must define realm/client ownership,
token validation, key rotation, logout, service-to-service identity, and audit
responsibilities. None of these behaviors is implemented by this documentation
change.

## Kyndryl OneID Connect Integration

OneID Connect is the planned upstream authentication boundary. The future
integration must define discovery, redirect, user lifecycle, assurance, and
failure handling with the identity owners. No connection, client, or production
configuration is present here.

## Frontend Boundary

The required interaction boundary is:

\`Frontend → OEM API/BFF → Authorization Layer → Services\`

Forbidden direct paths are:

- \`Frontend → Database\`
- \`Frontend → Kafka\`
- \`Frontend → OpenSearch\`

## API Relationship

The [OEM API Catalog](/platform/api/oem-api-catalog/) remains the single API
inventory. Future APIs consume authenticated identity context through governed
interfaces; they do not grant direct datastore access.

## CLI Relationship

The supported relationship is:

\`CLI → Governed API → Services\`

CLI clients must not bypass the authorization boundary or mutate internal
stores directly.

## AI Relationship

Optional AI assistants must use the same governed interfaces and RBAC decisions
as other consumers. AI has no direct privileged access to databases, Kafka,
state, or authorization stores.

## Implementation Roadmap

1. **Designed:** agree the identity boundaries, RBAC vocabulary, and API
   context requirements.
2. **Pending Implementation:** configure and integrate the selected identity
   components, then implement authorization enforcement and audit behavior.
3. **Testing:** validate token, permission, tenant, denial, expiry, and audit
   scenarios in controlled environments.
4. **Certification:** produce environment-specific evidence and obtain approval
   before any production claim.

Until those gates are complete, this IAM architecture remains **DESIGN /
PLANNED** and **NOT IMPLEMENTED**.
`)

await write('devops-iac/release-management.md', `# Release Management

This page defines the documentation model for identifying, recording, validating,
and tracking Event Management releases. It is governance documentation only; it
does not implement CI/CD, release automation, or Git strategy.

## Release Process

Each release record follows this model:

**Release → Version → Git Reference → Scope → Components → Testing Evidence →
Environment → Approval**

The record links evidence rather than copying it. A release is not promoted or
called certified without evidence for the relevant environment and approval
gate.

## Product Release State

The product release state below is derived from the certified product
repository metadata, not from the documentation repository.

### Certified Baseline

| Source | Commit | Meaning |
| --- | --- | --- |
| \`event-management-platform\` | \`abd899c2c852828f3e0cbbdcfc63a6f1793f21cc\` | Certified product documentation source used by synchronization |

### Releases

No formal product releases are recorded in the inspected certified evidence.
Changelog milestones are not promoted to releases here.

### Tags

| Tag | Commit | Purpose |
| --- | --- | --- |
| \`terraform-project-common-v0.1.0\` | \`7c0e54dce5fc\` | Existing product repository tag; purpose not explicitly documented |

### Branches

| Branch | Type / Purpose | HEAD | Relationship / Status |
| --- | --- | --- | --- |
| \`main\` | Canonical product branch | \`11715a4e\` | Existing product branch |
| \`develop\` | Existing product branch | \`8e508809\` | Purpose not explicitly documented |
| \`release/os-06-d06-gnm-core-v1.0.0\` | Release-named branch | \`909f3b37\` | Existing branch; promotion semantics not formally documented |
| \`remediation/os-12-03-webgui-integrations\` | Remediation branch | \`7ece6cbb\` | Existing branch; not a formal release claim |

### Branching / Promotion Model

The inspected repository contains main, develop, feature, release, and
remediation branches, but the certified evidence does not define one formal
branching or promotion policy. This page records observed state only.

## Product Changelog

See the [canonical Product Changelog](/project/product-changelog/) for
recorded functional/product evolution. Release Management records release,
tag, branch, and repository-state evidence; it does not duplicate that history.

## Documentation Foundation Release (documentation-only)

### Scope

This release consolidates the validated documentation foundation across
Architecture, Engineering, Operations, Quality, Security, DevOps & IaC,
AI & Automation, Project Governance, and the Custom API integration template.

### Included Capabilities

- Canonical architecture and data-authority references.
- API, component, CLI/interoperability, IAM, and correlation engineering views.
- Operations runbook and environment deployment/IaC model.
- Quality status and certified testing evidence catalogs.
- Documentation governance, release management, and defect prevention indexes.
- AI-01 architecture with Local LLM Runtime explicitly DESIGN / PLANNED.
- Custom API customer-facing integration template only.

### Validation Evidence

The release is accepted only with successful Nextra, Pagefind, MkDocs,
Mermaid, product synchronization, \`git diff --check\`, and full link-audit
validation. Critical routes are checked as part of the release gate.

### Known Limitations

No production AI/LLM implementation, final provider integrations, OpenBAO
deployment, semantic product version, or environment certification is claimed
by this documentation release.

### Future Work

Integration productization, evidence-backed local model certification, and
additional environment promotion evidence remain future work. They require
separate approved scopes.

## Product Release History

| Release | Branch | Commit/Hash | Scope | Evidence |
| --- | --- | --- | --- | --- |
| Documentation Foundation Release | main | \`a9dc50517bd35793490aa141a7fb95d60d0005a7\` | Foundation portal, governance views, and documentation standard | [Foundation validation](/project/status/) |

The table records only the release evidence currently available in the
repository. No deployment ID or environment promotion is inferred here.

## Versioning

The current documentation corpus does not assign a formal semantic product
version. Releases may be identified by their approved Git reference and scope;
no version or tag is invented here.

## Changelog

The existing changelog history remains canonical. Release records organize and
link that history under these categories:

- Added
- Changed
- Fixed
- Security
- Documentation
- Validation
- Deployment

This page does not create a second changelog or delete historical entries.

## Release Notes

Release notes should summarize the approved scope, affected components,
environment, validation result, and approval reference. They should link to the
canonical changelog and evidence records instead of duplicating their contents.

## Release Evidence

Release confidence consumes existing evidence from:

- [Quality Status Dashboard](/quality/status/)
- [Certified Testing Catalog](/quality/testing/)
- [Certification Labs](/platform/labs/)
- [Defect Prevention Global Index](/project/defect-prevention-global-index/)

These sources retain evidence ownership; Release Management provides the
traceability relationship.

## Environment Evolution

Promotion tracking distinguishes:

| Environment | Release relationship |
| --- | --- |
| Local Certified | Candidate validation and local certification evidence where recorded |
| On-Prem RHEL/KVM | Environment-specific deployment validation; no promotion claimed without evidence |
| QA GKE | QA runtime validation through the D4 profile |
| Production GKE | Production runtime/composition through D5A/D5B; certification remains evidence-dependent |

Architecture references define profiles, not proof of promotion.

## Quality Relationship

Release Management consumes testing and certification evidence. The Quality
Status Dashboard summarizes documented release confidence and remains the
operational quality view.

## Project Relationship

[Project Status](/project/status/) provides the executive release summary, while
the [Roadmap](/project/roadmap/) describes completed, current, next, and future
evolution. Neither replaces the release evidence sources.

## Approval and Ownership

Official release documentation requires evidence review, validation, approval,
and an ownership classification before publication. This page defines no
automated approval or deployment workflow.
`)

await write('devops-iac/environment-deployment-iac.md', `# Environment Deployment & IaC Architecture

This page documents how Event Management evolves across deployment environments,
and how infrastructure-as-code and delivery relate to the OEM runtime. It does
not modify infrastructure code, create deployment automation, or invent
Terraform modules.

## 1. Deployment Evolution Overview

The environment progression is:

**Local → On-Prem RHEL/KVM Development → QA GKE → Production GKE**

The product contracts and data authority remain portable while each profile
adds environment-specific infrastructure and delivery controls.

## 2. Environment Profiles

| Environment | Profile | Evidence |
| --- | --- | --- |
| Local | Docker Compose development and validation | [D1 Local](/architecture/d1-local-current/) |
| On-Prem RHEL/KVM | Development profile with RHEL/KVM operational boundaries | [D3 RHEL](/architecture/d3-rhel-current/) |
| QA GKE | GCP foundation, GKE runtime, and governed delivery relationship | [D4 QA GKE](/architecture/d4-qa-gke-minimum-target/) |
| Production GKE | D5A runtime composed with D5B foundation and delivery | [D5A](/architecture/d5a-prod-gke-runtime-target/) · [D5B](/architecture/d5b-prod-gke-cicd-target/) |

These architecture profiles do not, by themselves, claim certification or an
active deployment.

## 3. Infrastructure Model

Responsibilities remain separate:

- **Application:** OEM services, APIs, workers, contracts, and configuration.
- **Infrastructure:** network, security, compute, storage, IAM, Kubernetes, and
  environment dependencies.
- **Delivery:** source, build, artifact identity, registry, promotion,
  authorization, and deployment orchestration.

Infrastructure realizes an approved application and delivery contract; it does
not redefine product responsibilities.

## 4. Terraform Architecture

The documented Terraform relationship covers infrastructure domains where the
architecture identifies them: network, security, compute, storage, IAM,
Kubernetes, and dependencies. This page intentionally does not name modules,
providers, variables, or state backends that are not evidenced.

Terraform provisions or composes environment capabilities. It does not own OEM
business behavior, event processing semantics, or data authority.

## 5. CI/CD Delivery Model

The delivery sequence is:

**Git → Build → Immutable Artifact → Registry → Promotion → Deployment**

Git provides source identity and review history. Build produces the artifact.
The registry retains immutable identity. Promotion authorizes the same artifact
for the next environment, and deployment realizes the approved environment
profile. CI/CD responsibilities remain distinct from Terraform provisioning and
runtime service ownership.

## 6. Artifact Promotion

The delivery rule is **build once, promote the same artifact**. Artifact identity
must remain immutable and traceable to source, build evidence, configuration
references, and approval. Rebuilding separately for QA and Production would
break that provenance and is not the documented model.

## 7. Secret Management

Secret references follow the [Integration Instance Architecture](/integrations/integration-architecture/).
OpenBAO is a target secret boundary, not a completed implementation claim.
Secrets are not committed to Git, embedded in images, or placed in plain
configuration. Runtime adapters resolve authorized references through governed
boundaries.

## 8. Rollback Strategy

Rollback means a newly authorized delivery of a previous approved release. It
requires compatibility checks for application version, configuration, database
schema, and stateful services. Kafka transport/replay, PostgreSQL authority,
and OpenSearch projection recovery retain their distinct semantics.

Rollback is not a tag switch and does not bypass validation, approval, or
environment controls.

## 9. Validation and Evidence

Release decisions consume the [Release Management](/devops-iac/release-management/),
[Certified Testing Catalog](/quality/testing/), [Quality Status Dashboard](/quality/status/),
and relevant [Certification Labs](/platform/labs/) evidence. Architecture
documentation is not execution evidence; promotion remains evidence-dependent.
`)

await write('devops-iac/index.md', landing('DevOps & IaC', [
  ['Terraform reference', '../reference/terraform/'],
  ['GCP and Kubernetes IaC', '../deployment/iac-gcp-kubernetes/'],
  ['Git governance', '../platform/git/README/'],
  ['Environment Deployment & IaC Architecture', 'devops-iac/environment-deployment-iac/'],
  ['Release Management', 'devops-iac/release-management/'],
  ['Historical releases', '../development/releases/']
]))

await write('reference/terraform.md', `# Terraform Architecture

Terraform provisions documented infrastructure capabilities; it does not change
OEM application behavior or data authority.

## Solution Architecture

Terraform / GCP Infrastructure Foundation

![Terraform / GCP Infrastructure Foundation](/diagrams/terraform-gcp-solution-architecture.png)

\`\`\`mermaid
flowchart TD
  G[Git Repository] --> C[Cloud Build]
  C --> T[Terraform]
  T --> F[GCP Foundation]
  F --> K[GKE Runtime]
\`\`\`

The view is conceptual and intentionally does not invent modules, providers,
variables, state backends, or deployment commands.
`)


await write('project/defect-prevention-global-index.md', `# Defect Prevention Global Index

## Purpose

Defect Prevention is Event Management's continuous-improvement mechanism. It records discovered issues, root causes, corrective actions, preventive measures, evidence, and evolution impact. It is governance memory—not a bug tracker, ticketing system, or replacement for GitHub Issues.

## Evolution Model

\`\`\`mermaid
flowchart LR
 L[Local Certified] --> O[On-Prem RHEL / KVM Development]
 O --> Q[QA GKE]
 Q --> P[Production GKE]
\`\`\`

Prevention records preserve traceability as the platform moves from local certification through on-premises development, QA, and production environments.

## Prevention Categories

Architecture · Runtime · Operations · Engineering · Integrations · Security · Deployment · Quality · Documentation · Environment Evolution

## Global Registry

The registry links each item to existing supporting evidence. A \`Monitoring\` status is used where the corpus contains the issue/evidence but no separate detailed closure record; it avoids asserting unsupported closure.

| ID | Domain | Component | Environment | Problem | Prevention | Status |
| --- | --- | --- | --- | --- | --- | --- |
| [DP-DOCS-001](/platform/defect-prevention-documentation/) | Documentation | Documentation governance | All | Formal documentation governance remains pending. | Require ownership and approval before normative policy. | Monitoring |
| [DP-DOCS-002](/project/documentation-coverage/) | Documentation | Documentation coverage | All | Cross-cutting documentation needs traceable coverage. | Maintain the documentation coverage map. | Monitoring |
| [DP-DOCS-003](/project/defect-prevention-matrix-v1-v2/) | Documentation | V1/V2 matrix | All | Deferred capabilities can be mistaken for current behavior. | Track V1 baseline and future gates explicitly. | Monitoring |
| [DP-ARCH-001](/architecture/v1-map/) | Architecture | OEM architecture map | Local → GKE | Architecture boundaries must remain explicit across environments. | Preserve component ownership and contracts. | Monitoring |
| [DP-ARCH-002](/architecture/data-authority-replay/) | Architecture | Data authority | All | Authority and replay semantics can be conflated. | Keep PostgreSQL authority, replay, and projections distinct. | Monitoring |
| [DP-OPS-001](/platform/operations/README/) | Operations | Operational runbooks | Local → GKE | Deployment, observability, and recovery require operational traceability. | Keep runbooks and recovery guidance linked to the platform. | Monitoring |
| [DP-ENG-001](/platform/git/governance/) | Engineering | Git governance | All | Uncontrolled changes weaken evidence and release traceability. | Apply branch, review, and evidence governance. | Monitoring |
| [DP-INT-001](/platform/event-processor/rules-and-contracts/) | Integrations | Integration commands | All | External actions require explicit contracts and ownership. | Preserve governed worker and adapter contracts. | Monitoring |
| [DP-DEP-001](/architecture/d6-environment-evolution/) | Deployment | Environment evolution | Local → GKE | Environment-specific implementation can obscure portable contracts. | Track profile-specific deployment decisions. | Monitoring |
| [DP-QA-001](/platform/labs/os-01-01/acceptance-checklist/) | Quality | Certification Lab | Local Certification | Local evidence must not be mistaken for production certification. | Preserve acceptance evidence and environment boundaries. | Monitoring |

## Environment Evolution Tracking

Each prevention item should identify the affected environment and the evolution impact. Promotion decisions must retain the evidence needed to compare Local Certified, On-Prem RHEL/KVM Development, QA GKE, and Production GKE behavior without silently changing product claims.

## Recently Closed Items

Closed records are listed only when a closure record and supporting evidence exist. The current corpus contains the global prevention framework and supporting evidence links above; no additional closure is asserted here.

## Operational Guidelines

1. Record Problem, Root Cause, Resolution, Prevention, Evidence, and Evolution impact.
2. Link to canonical documentation and certification evidence.
3. Use Open, Closed, or Monitoring conservatively; do not close without evidence.
4. Keep prevention governance separate from GitHub Issues, tickets, and runtime behavior.
5. Revisit records when architecture, environment, or release contracts evolve.
`)

await write('project/status.md', `# Project Status

## Current State

Event Management has a published Nextra documentation portal, the approved architecture set, canonical publication source, Mermaid assets, Kyndryl theme, Operations configuration navigation, Keep external-reference integration, Certification Lab discovery, and the Correlation Service product documentation.

**Quality Status Dashboard is the operational status source.** This Project Status page is the executive summary and does not replace the dashboard or certification evidence.

## Environment Evolution

The documented evolution is Local Certified → On-Prem RHEL/KVM Development → QA GKE → Production GKE. Environment-specific implementation remains separate from portable product contracts.

## Component Status Summary

The architecture and documentation corpus describe Event Gateway, Event Processor, Event State Service, Kafka, PostgreSQL, OpenSearch, integrations, governed management surfaces, and deployment profiles. This summary does not assign unsupported green/yellow/red states; operational health belongs to the Quality Status Dashboard.

## Current Focus

- Maintain canonical documentation and navigation integrity.
- Preserve evidence boundaries between architecture, implementation, and certification.
- Continue environment-evolution traceability and defect prevention.

## Recent Milestones

- Architecture Definition and environment architecture set published.
- Nextra portal and Kyndryl documentation experience published.
- Operations Configuration consolidated and synchronized.
- Correlation Service product documentation published with historical evidence preserved.
- Keep integrated as an external reference and Certification Lab discovery path.
- Global Defect Prevention Index created.

## Known Deferred Items

Repository/path cutover, AI-assisted Correlation V2, advanced production deployment evolution, and other documented future work remain pending unless separately evidenced. No deferred item is presented as implemented here.
`)

await write('project/roadmap.md', `# Roadmap

## Completed

- Approved architecture set and Master Architecture Definition.
- Canonical publication source and Mermaid asset set.
- Nextra documentation portal and Kyndryl theme.
- Operations Configuration navigation consolidation.
- Correlation Service — Manual Correlation Rules documentation.
- Keep external-reference integration and Certification Lab discovery.
- Global Defect Prevention Index.

## Current

- Maintain documentation synchronization, link integrity, and evidence boundaries.
- Use the Quality Status Dashboard as the operational status source.
- Continue documenting environment evolution and prevention records.

## Next

- Review Project governance pages through Human Gate.
- Reconcile newly discovered documentation gaps with canonical evidence.
- Expand operational status integration when the Quality Status Dashboard is available.

## Future

- Repository and public-path rename work.
- AI-assisted Correlation V2 design and implementation.
- Further production deployment evolution and certification.
- Additional governance and operational automation supported by evidence.

Future items are not implementation claims.
`)

await write('project/technical-debt.md', `# Technical Debt Registry

This registry records evidence-based pending work. It is not a ticketing system.

| ID | Area | Description | Impact | Priority | Status | Target | Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TD-DOCS-001 | Repository | Repository/public-path rename remains pending. | Public references require a controlled cutover. | Medium | Open | Future release | Execute only with valid GitHub authorization and a dedicated cutover gate. |
| TD-DOCS-002 | Documentation | Quality Status Dashboard relationship is prepared but the dashboard is not yet the generated Project source. | Operational and executive status could diverge. | High | Monitoring | Next governance increment | Keep dashboard as operational authority and Project Status as summary. |
| TD-DOCS-003 | Documentation | Some historical implementation evidence remains in source-specific languages and structures. | Cross-document discovery requires canonical links. | Medium | Monitoring | Ongoing | Preserve evidence and improve navigation without rewriting history. |
| TD-ARCH-001 | Architecture evolution | Future deployment profiles and production evolution require additional certified evidence. | Environment claims must remain bounded. | Medium | Open | Future architecture work | Add only through an approved architecture and certification gate. |
| TD-AI-001 | AI | AI-assisted Correlation remains design/V2, not implemented. | Do not expose future behavior as current capability. | High | Open | V2 | Preserve governed recommendation boundary and AI-01 authority. |
`)

await write('decisions/index.md', `# Decisions

## Accepted Decisions

- Kafka is transport and replay boundary, not operational authority.
- PostgreSQL is the Operational Source of Truth; OpenSearch is a derived projection.
- Nextra is the published documentation frontend; MkDocs remains a validated fallback.
- AI is optional and subordinate to governed OEM interfaces.
- Keep is an External Reference, not an OEM runtime or certification component.

## Pending Decisions

- Repository and public-path rename.
- AI-assisted Correlation V2 implementation.
- Future production deployment evolution and additional certification evidence.
- Operational Quality Status Dashboard integration as the source consumed by Project Status.

## Superseded Decisions

- Previous marketing-style portal theme.
- Previous navigation model that exposed ambiguous or duplicated domain entries.

Historical ADR content remains preserved in its canonical source documents; this page provides governance classification only.

## ADR Index

- [ADR template](adr-template/)
- [Architecture Evolution](../architecture/evolution/)
- [Defect Prevention Global Index](../project/defect-prevention-global-index/)
`)

await write('project/governance.md', `# Documentation Governance

This page defines the ownership, classification, review, and publication
boundaries for the Event Management documentation portal. It is governance
documentation only and does not change product architecture or runtime behavior.

## Ownership

Kyndryl owns the Event Management architecture materials, engineering and
operations documentation, design assets, documentation portal content, and
related proprietary materials maintained for the product. Ownership statements
here are documentation scope statements and do not replace approved corporate
legal guidance.

## Copyright Notice

© Kyndryl. Event Management documentation and associated design assets are
maintained as Kyndryl materials unless a page identifies a different owner.
This notice does not add terms or permissions beyond approved corporate
guidance.

## Content Classification

### Internal Product Documentation

The following are internal product documentation and evidence:

- Architecture
- Engineering
- Operations
- Quality
- Certification evidence
- AI design

### External Reference Material

External references include Keep, open-source projects, and external standards.
They are references for comparison or design context, not OEM implementation
claims. [Keep](/platform/labs/keep/) remains explicitly
classified as external reference material.

## External Reference Boundary

External references remain the property of their respective owners. Referencing
an external technology or document does not transfer ownership, imply
endorsement, or turn that material into an OEM product component.

## Branding

Kyndryl trademarks, logos, visual identity, and corporate branding are Kyndryl
property. Portal presentation uses approved Kyndryl-aligned identity within the
documentation scope; it does not grant permission to reuse those marks outside
their approved context.

## AI-Assisted Documentation Governance

AI tools may assist with drafting, organization, or discovery. Official
documentation requires human validation of accuracy, evidence, ownership, and
classification before publication. Ownership of approved documentation remains
with Kyndryl. This page defines no broader AI policy.

## Contribution Model

Before official publication, a contribution must pass these gates:

1. Evidence is identified and traceable.
2. A reviewer checks technical accuracy and boundaries.
3. Required validation passes, including links and generated outputs.
4. An authorized human approves publication.
5. Ownership and internal/external classification are recorded.

## Release Relationship

Documentation releases are associated with validated evidence and the approved
publication process. This page does not prescribe release automation.

## Defect Prevention Relationship

Documentation inconsistencies may generate a Defect Prevention record. This is a
governance relationship only; it does not create automatic workflows or tickets.
`)

await write('project/_meta.js', `export default {
  index: 'Project',
  status: 'Status',
  roadmap: 'Roadmap',
  'technical-debt': 'Technical Debt',
  'product-changelog': 'Product Changelog',
  governance: 'Documentation Governance',
  'defect-prevention-global-index': 'Defect Prevention — Global Index',
  'defect-prevention': 'Defect Prevention — Existing Framework',
  'defect-prevention-matrix-v1-v2': 'Defect Prevention Matrix — V1 → V2'
}\n`)

await write('project/index.md', landing('Project', [
  ['Status', 'project/status/'],
  ['Roadmap', 'project/roadmap/'],
  ['Technical debt', 'project/technical-debt/'],
  ['Product Changelog', 'project/product-changelog/'],
  ['Documentation Governance', 'project/governance/'],
  ['Defect Prevention — Global Index', 'project/defect-prevention-global-index/'],
  ['Architecture decisions', '../decisions/']
]))

console.log('Prepared Nextra content from 163 authoritative Markdown pages.')
