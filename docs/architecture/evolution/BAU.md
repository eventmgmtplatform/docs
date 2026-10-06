# Architecture Evolution BAU

This board tracks architecture-documentation work only. It is not an
application feature backlog.

## DONE

- MASTER-ARCH-01 assembled the approved Golden Architecture Set into the
  canonical product-wide Architecture Definition without redesigning it.
- Architecture Evolution Register established.
- D0 logical architecture canonicalized as documented architecture.
- D1 local deployment architecture canonicalized as documented architecture.
- Management Plane declared an invariant of the minimum deployable OEM
  architecture.
- Data Authority & Replay supporting view published.
- Existing D0, D1 and visual assets preserved as predecessors.
- D3 RHEL/on-prem architecture synchronized from the project-provided baseline.
- D2 KVM/Kubernetes architecture defined as a target deployment model.
- D4 QA GKE minimum architecture defined as a target deployment model.
- GCP-01 foundation and GCP-02 build/delivery architectures separated.
- D5A production GKE runtime architecture defined as a target model.
- D5B production GKE plus CI/CD composition defined as a target delivery model.
- D6 environment evolution and environment-aware installation/deployment documentation view defined.
- AI-01 planned runtime architecture normalized with explicit model, retrieval,
  agent, tool, governance and implementation-evidence boundaries.
- UMC-ENGINEERING-01 approved and documented with thin Management Gateway,
  hybrid Capability Registry, federated domain ownership, hybrid CLI,
  Control/Data/Deployment planes and sequenced vertical slices. Implementation
  remains NOT STARTED.

## IN PROGRESS

- Reconcile predecessor diagrams against the new visual grammar without
  deleting historical material.
- Register UMC-01 convergence work without beginning implementation.
- UMC-CLI-01 inventory completed: current operational, installer, deployment and
  test surfaces were classified against the UMC target; no product remediation
  was started.

### UMC-01 CONVERGENCE AREAS

- UMC-CLI — inventory and reconcile the current CLI.
- UMC-CLI-01 — current CLI inventory and UMC conformance matrix completed; gaps
  remain for future BAU convergence.
- UMC-API — inventory management APIs against the common contract.
- UMC-API-01 — current API inventory and UMC conformance matrix completed; gaps
  remain for future BAU convergence.
- UMC-WEB-01 — current Web Console/BFF inventory and conformance matrix
  completed; convergence findings remain for future BAU work.
- UMC-WEB — inventory Web Console, BFF, and controlled data-access paths.
- UMC-DATA — current PostgreSQL ownership, runtime/administrative write paths,
  migration, bootstrap, seed, backup/recovery and governed-scripting candidates
  inventoried by UMC-DATA-01; convergence gaps remain grouped below.
- UMC-DATA-01 — data administration baseline completed without database or
  product mutation. P0: database/security boundaries and direct-mutation
  governance. P1: governed-scripting contract, bootstrap/idempotency and
  persistence ownership. P2: audit/transaction consistency and backup/recovery
  integration. P3: legacy/test isolation and cleanup.
- UMC-CONFORMANCE-01 — cross-surface consolidation approved and released;
  D01–D14 are APPROVED. UMC-ENGINEERING-01 PRECONDITION = SATISFIED, but no
  implementation or follow-up workstream has started.
- UMC-ENGINEERING-01 — COMPLETE / APPROVED. No product implementation or
  downstream workstream was started.

### UMC CONSOLIDATED BAU REGISTER

| ID | Priority | Capability | Surfaces | Dependency | Ownership | Target workstream | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UMC-G01 | P0 | Identity, authorization and scope | All | Approved D10 | Common + domains | UMC-SECURITY-01 | READY_IN_PARALLEL |
| UMC-G02 | P0 | Resource identity/schema | All | Approved D07/D08 | Common contract | UMC-RESOURCE-01 | NEXT_PRIMARY |
| UMC-G03 | P0 | Action/capability model | All | UMC-G02 | Common + domains | UMC-ACTION-01 | REGISTERED |
| UMC-G04 | P0 | Result/error/async envelope | CLI/API/Web | UMC-G02/G03 | Common contract | UMC-RESULT-01 | REGISTERED |
| UMC-G05 | P0 | Semantic audit and correlation | All | UMC-G01–G04 | Common + domains | UMC-AUDIT-01 | REGISTERED |
| UMC-G06 | P1 | Gateway, routing and capability registry | CLI/API/Web | Approved D03/D13, UMC-G01–G05 | Common layer | UMC-CORE-01 / UMC-API-02 | REGISTERED |
| UMC-G07 | P1 | Thin CLI and offline split | CLI | UMC-G01–G06, approved D12 | CLI + Deployment | UMC-CLI-02 | REGISTERED |
| UMC-G08 | P1 | BFF mutation convergence | Web/API | UMC-G01–G06 | Web/BFF + domains | UMC-WEB-02 | REGISTERED |
| UMC-G09 | P1 | Governed scripting and bootstrap ledger | Data/CLI | UMC-G01/G04/G05, approved D09 | Deployment/Operations | UMC-DATA-02 / UMC-BOOTSTRAP-01 | REGISTERED |
| UMC-G10 | P1 | Provider lifecycle specialization | API/Web/Data | UMC-G02–G06 | Integration domain | Domain conformance | REGISTERED |
| UMC-G11 | P1 | Datasource and rule vertical slices | API/Web/Data | UMC-G02–G06 | Owning domains | UMC engineering slices | REGISTERED |
| UMC-G12 | P2 | Executable conformance profile | All | Implemented slices | Quality/Common | UMC-CONFORMANCE-02 | REGISTERED |
| UMC-G13 | P2 | Legacy/demo transition | CLI/Web/Data | UMC-G07–G12 | Owning domains | Follow-up | REGISTERED |

## MASTER DELIVERY REMAINING

- Generate the separately authorized standalone HTML, DOCX and PDF artifacts.
- Complete final repository integration and any separately approved CI/Pages
  publication.
- Keep operating-system/runtime certification and future ADR work outside the
  completed Master assembly.

The planned foundation workstreams UMC-RESOURCE-01, UMC-ACTION-01,
UMC-RESULT-01, UMC-SECURITY-01 and UMC-AUDIT-01 converge at the **UMC CONTRACT
FOUNDATION GATE**. Common implementation is not authorized before that gate.

## NEXT

- UMC-RESOURCE-01 — NEXT PRIMARY CONTRACT WORKSTREAM; precondition satisfied,
  but execution requires separate authorization.
- UMC-SECURITY-01 — PARALLELIZABLE FOUNDATION WORKSTREAM; ready in parallel,
  but execution requires separate authorization.

- Record a reviewed decision for the runtime destination and Helm.
- Recover the RHEL bundle or equivalent attributable evidence for independent
  D3 verification.
- Define Kubernetes distribution/version and control-plane/worker topology.
- Decide storage, ingress, PKI/TLS, secret integration and stateful operators.
- Define HA, backup/recovery, observability and Helm/Kustomize packaging.
- Recover and reconcile AI-01 evidence: LLM/OLLM, retrieval, agents, models,
  orchestration and OpenSearch integration.
- Reconcile the documented Multi-Surface and AI-01 boundaries against future
  implementation evidence, governance, observability and lifecycle decisions.
- Recover existing OLLM/LLM evidence and decide RAG/vector retrieval plus model-gateway/provider strategy.
- Define AI identity, tool authorization, human-approval policies and persistent AI memory.
- Define AI observability, evaluation and AI-02 delivery lifecycle including prompt/model/agent/tool versioning.
- Define runtime workload identity, GKE production topology, HA/DR,
  backup/recovery and observability for D5 composition.
- Define stateful operators, storage classes/capacity, RPO/RTO, PKI/TLS,
  ingress/load balancing, NetworkPolicy and packaging for D5A.
- Define the AI model, prompt and agent delivery lifecycle separately from D5B.
- Define a unified installer/deployment entry point, environment profiles and installer contract.
- Define Terraform integration boundary plus Kubernetes and GKE deployment adapters.
- Define validation, idempotency, rollback/uninstall and remote localhost deployment automation.
- Keep Wiki deployment automation as a separate future objective.

## PENDING DECISION

- Helm packaging and lifecycle ownership.
- Deployment packaging and reconciliation strategy: Helm, Kustomize, GitOps,
  Argo CD and Flux remain unselected.
- Deployment authorization and promotion controls.
- Runtime workload identity, image signing, SBOM generation and attestations.
- Database migration sequencing, stateful-upgrade strategy and automated rollback.
- D4/D5 GKE environment boundaries and promotion model.
- Security/IAM and backup/recovery/replay architecture views.

## BLOCKED

- D3 independent verification: the RHEL bundle, branch, manifest, logs and
  DEV-BOOT-01 evidence are not available in the current repository baseline.
