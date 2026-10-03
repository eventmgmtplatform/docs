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

## IN PROGRESS

- Reconcile predecessor diagrams against the new visual grammar without
  deleting historical material.
- Register UMC-01 convergence work without beginning implementation.

### UMC-01 CONVERGENCE AREAS

- UMC-CLI — inventory and reconcile the current CLI.
- UMC-API — inventory management APIs against the common contract.
- UMC-WEB — inventory Web Console, BFF, and controlled data-access paths.
- UMC-DATA — inventory administrative, migration, and bootstrap scripts.
- UMC-RESOURCE-MODEL — map existing resources to the designed envelope.
- UMC-SECURITY — define identity, authorization, secret-reference, and tenant boundaries.
- UMC-AUDIT — define result and audit-event conformance.
- UMC-CONFORMANCE — define cross-surface equivalence tests.
- UMC-BOOTSTRAP — define idempotent initialization conformance.
- UMC-INTEROPERABILITY — define the configurable BFF/data-access mode.

## MASTER DELIVERY REMAINING

- Generate the separately authorized standalone HTML, DOCX and PDF artifacts.
- Complete final repository integration and any separately approved CI/Pages
  publication.
- Keep operating-system/runtime certification and future ADR work outside the
  completed Master assembly.

## NEXT

- Execute UMC-CLI-01, UMC-API-01, UMC-WEB-01, and UMC-DATA-01 inventories.

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
