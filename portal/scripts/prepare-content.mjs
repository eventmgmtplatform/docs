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
  'reference-architectures': 'Reference Architectures',
  index: { display: 'hidden' },
  publication: { display: 'hidden' }
}\n`)

await write('architecture/reference-architectures/_meta.js', `export default {
  keep: 'Keep'
}\n`)

await write('architecture/reference-architectures/keep/_meta.js', `export default {
  index: 'Overview',
  architecture: 'Architecture',
  'ai-llm': 'AI / LLM',
  'oem-comparison': 'OEM Comparison',
  references: 'References'
}\n`)

await write('architecture/reference-architectures/keep/index.md', `# Keep Overview

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

await write('architecture/reference-architectures/keep/architecture.md', `# Keep Architecture

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

await write('architecture/reference-architectures/keep/ai-llm.md', `# Keep AI / LLM

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

await write('architecture/reference-architectures/keep/oem-comparison.md', `# Keep vs OEM Comparison

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

await write('architecture/reference-architectures/keep/references.md', `# Keep References

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
await write('platform/labs/index.md', '# Certification Labs\n\nReference and validation labs for the Event Management platform.\n')
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
      overview: { title: 'Overview', href: '/architecture/reference-architectures/keep/' },
      architecture: { title: 'Architecture', href: '/architecture/reference-architectures/keep/architecture/' },
      'ai-llm': { title: 'AI / LLM', href: '/architecture/reference-architectures/keep/ai-llm/' },
      'oem-comparison': { title: 'OEM Comparison', href: '/architecture/reference-architectures/keep/oem-comparison/' },
      references: { title: 'References', href: '/architecture/reference-architectures/keep/references/' }
    }
  }
}\n`)
await write('platform/_meta.js', `export default {
  index: 'Engineering Overview',
  architecture: 'Integrated Architecture',
  'event-gateway': 'Event Gateway',
  'event-processor': 'Event Processor',
  'event-state-service': 'Event State Service',
  dashboards: 'Frontend & Dashboards',
  kafka: 'Kafka',
  api: 'APIs',
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
  'reference-architectures': 'Reference Architectures',
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

[Keep Manual Correlation Rules](/architecture/reference-architectures/keep/) is an external reference for documentation patterns only. Keep semantics and dynamic naming syntax are not OEM claims.

## Related Documentation

- [Data Authority & Replay](/architecture/data-authority-replay/)
- [D0 Logical Architecture](/architecture/d0-logical-current/)
- [Historical certification evidence](/platform/event-processor/correlation-backend/)
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
  ['Runbooks', 'operations/local-runbook/'],
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
  'local-runbook': 'Runbooks',
  observability: 'Observability',
  incidents: 'Incidents',
  'disaster-recovery': 'Recovery'
}\n`)

await write('integrations/index.md', landing('Integrations', [
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

await write('ai-automation/index.md', landing('AI & Automation', [
  ['AI-01 Architecture', '../architecture/ai-01-aiops-ai-architecture/'],
  ['AIOps implementation', '../platform/event-processor/aiops-engine/'],
  ['CACF / Automation', '../platform/cacf/README/']
]))

await write('quality/index.md', landing('Quality', [
  ['Testing', '../development/testing/'],
  ['Defect Prevention', '../project/defect-prevention/'],
  ['Certification Labs', '../platform/labs/os-01-01/acceptance-checklist/']
]))

await write('quality/_meta.js', `export default {
  index: 'Quality',
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
        href: '/architecture/reference-architectures/keep/'
      }
    }
  }
}\n`)

await write('devops-iac/index.md', landing('DevOps & IaC', [
  ['Terraform reference', '../reference/terraform/'],
  ['GCP and Kubernetes IaC', '../deployment/iac-gcp-kubernetes/'],
  ['Git governance', '../platform/git/README/'],
  ['Releases', '../development/releases/']
]))


await write('project/index.md', landing('Project', [
  ['Status', 'project/status/'],
  ['Roadmap', 'project/roadmap/'],
  ['Technical debt', 'project/technical-debt/'],
  ['Architecture decisions', '../decisions/']
]))

console.log('Prepared Nextra content from 163 authoritative Markdown pages.')
