import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const portalRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(portalRoot, '..')
const source = resolve(repositoryRoot, 'docs')
const destination = resolve(portalRoot, 'content')

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

// MkDocs accepts repository-relative image targets without a './' prefix;
// MDX resolves those as package names. Normalize images only in the generated
// mirror so the authoritative Markdown remains byte-for-byte unchanged.
const normalizeMarkdownImages = async directory => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await normalizeMarkdownImages(path)
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const markdown = await readFile(path, 'utf8')
      const normalized = markdown.replace(
        /(!\[[^\]]*\]\()(?!\.?\.?\/|\/|#|https?:|data:|<)/g,
        '$1./'
      )
      if (normalized !== markdown) await writeFile(path, normalized, 'utf8')
    }
  }
}
await normalizeMarkdownImages(destination)

const write = async (path, content) => {
  const target = resolve(destination, path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content, 'utf8')
}

const landing = (title, links) => [
  `# ${title}`,
  '',
  ...links.map(([label, href]) => `- [${label}](${href})`),
  ''
].join('\n')

await write('_meta.js', `export default {
  index: { title: 'Overview', type: 'page', theme: { sidebar: false } },
  architecture: { title: 'Architecture', type: 'page' },
  platform: { title: 'Engineering', type: 'page' },
  deployment: { title: 'Deployment', type: 'page' },
  operations: { title: 'Operations', type: 'page' },
  integrations: { title: 'Integrations', type: 'page' },
  'ai-automation': { title: 'AI & Automation', type: 'page' },
  quality: { title: 'Quality', type: 'page' },
  'devops-iac': { title: 'DevOps & IaC', type: 'page' },
  research: { title: 'Research', type: 'page' },
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

const platformReadme = await readFile(resolve(destination, 'platform/README.md'), 'utf8')
await write('platform/index.md', platformReadme)
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

await write('operations/index.md', landing('Operations', [
  ['Local runbook', './local-runbook/'],
  ['Observability', './observability/'],
  ['Incidents', './incidents/'],
  ['Disaster recovery', './disaster-recovery/']
]))

await write('integrations/index.md', landing('Integrations', [
  ['GLPI', '../platform/integrations/glpi/'],
  ['ServiceNow', '../platform/servicenow/CHANGELOG/'],
  ['GNM', '../platform/gnm/CHANGELOG/']
]))

await write('ai-automation/index.md', landing('AI & Automation', [
  ['AI-01 Architecture', '../architecture/ai-01-aiops-ai-architecture/'],
  ['AIOps implementation', '../platform/event-processor/aiops-engine/'],
  ['CACF / Automation', '../platform/cacf/']
]))

await write('quality/index.md', landing('Quality', [
  ['Testing', '../development/testing/'],
  ['Defect Prevention', '../project/defect-prevention/'],
  ['Certification Labs', '../platform/labs/os-01-01/acceptance-checklist/']
]))

await write('devops-iac/index.md', landing('DevOps & IaC', [
  ['Terraform reference', '../reference/terraform/'],
  ['GCP and Kubernetes IaC', '../deployment/iac-gcp-kubernetes/'],
  ['Git governance', '../platform/git/'],
  ['Releases', '../development/releases/']
]))

await write('research/index.md', '# Research\n\n- Keep *(content integration deferred)*\n')

await write('project/index.md', landing('Project', [
  ['Status', './status/'],
  ['Roadmap', './roadmap/'],
  ['Technical debt', './technical-debt/'],
  ['Architecture decisions', '../decisions/']
]))

console.log('Prepared Nextra content from 163 authoritative Markdown pages.')
