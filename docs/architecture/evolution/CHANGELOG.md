# Architecture Evolution CHANGELOG

This changelog is limited to the Architecture Evolution workstream. It is not a
product, service or release changelog.

## 2026-10-01 — ARCH-REDESIGN-13

### Redesigned

- Data Authority & Replay as a Golden cross-cutting architecture.
- Formalized Kafka transport/replay, PostgreSQL operational authority and
  OpenSearch search/analytics projection roles.
- Clarified replay, backup/restore and projection-rebuild recovery semantics.
- Documented replay safety and the external-side-effect boundary.

### Preserved

- Architecture semantics, service responsibilities, event contracts, data
  authority, management governance and AI authority remain unchanged.
- General reconciliation and transactional outbox remain outside certified
  implementation evidence.

## 2026-10-01 — ARCH-REDESIGN-12

### Redesigned

- AI-01 using the OEM Golden visual grammar as an optional, cross-cutting and
  vendor-neutral AI runtime architecture.
- Separated interaction, orchestration, retrieval/context, model, workflow,
  agent, tool, governance, observability and evaluation responsibilities.
- Clarified governed read/action tools, policy-driven approval, context
  provenance, provider boundaries and graceful degradation.
- Formalized the distinction between AI-01 runtime architecture and AI-02
  delivery/governance lifecycle.

### Preserved

- D0 Core, Multi-Surface governance, data authority, deployment and AIOps
  interaction contracts remain unchanged.
- Certified implementation evidence remains limited to persistent AIOps
  configuration, REST CRUD, audit and a mock provider; no LLM/OLLM, RAG,
  vector retrieval, production agent, model gateway, tool execution or AI
  memory implementation is asserted.

## 2026-10-01 — ARCH-REDESIGN-11

### Redesigned

- Multi-Surface Interaction Architecture using the OEM Golden visual grammar.
- Formalized GUI, CLI / API and AIOps / AI as governed surfaces over one OEM
  Core.
- Clarified the Governed Interface Layer and the read-versus-action boundary.
- Formalized surface equivalence, surface independence and policy-driven action
  governance.

### Preserved

- D0 Core, GUI, CLI / API, AIOps interaction, data authority, management and
  deployment contracts remain unchanged.
- AI-01 retains ownership of model, retrieval, agent and tool-orchestration
  internals; Multi-Surface remains `PLANNED` (`DOCUMENTED`).

## 2026-10-01 — ARCH-REDESIGN-10

### Redesigned

- D6 as the OEM Architecture Map and Environment-Aware Deployment Model.
- Normalized Local, RHEL, portable Kubernetes, QA GKE, Production GKE and
  Production GKE + CI/CD profiles around one D0 logical invariant.
- Clarified Installer, Terraform, Kubernetes packaging and CI/CD
  responsibilities.
- Separated Multi-Surface, AI-01 and Data Authority & Replay from environment
  progression.

### Preserved

- D0, D1, D3, D2, D4, GCP-01, GCP-02, D5A and D5B contracts remain unchanged.
- Environment profiles remain alternatives or specializations rather than a
  mandatory migration sequence.

## 2026-10-01 — ARCH-REDESIGN-09

### Redesigned

- D5B as the OEM Production GKE + CI/CD composition architecture.
- Formalized the GCP-01 + GCP-02 + D5A composition in Solution and Engineering
  views.
- Clarified the Delivery-to-Runtime boundary and end-to-end release lineage.
- Clarified how controlled change and rollback compose existing delivery and
  runtime contracts.

### Preserved

- GCP-01 foundation, GCP-02 delivery and D5A runtime contracts remain
  independently governed and unchanged.
- Artifact identity, Release Manifest, authorization, promotion, rollback,
  stateful-service and AI-independence semantics remain unchanged.

## 2026-10-01 — ARCH-REDESIGN-08

### Redesigned

- D5A using the approved OEM Golden Template.
- Refined the Production Runtime Architecture and clarified the D4-to-D5A
  operating-quality evolution.
- Separated HA from DR and made authority-aware recovery responsibilities
  visible.
- Preserved the runtime/CI-CD boundary and prepared the D5B composition.

### Preserved

- D0 responsibilities, the D4 workload contract, production service ownership,
  Management Plane, data authority, recovery semantics and AI independence
  remain unchanged.
- D5A remains the production runtime architecture; GCP-02 remains the separate
  build and delivery architecture.

## 2026-10-01 — ARCH-REDESIGN-07

### Redesigned

- GCP-02 using the approved OEM Golden Template.
- Separated infrastructure delivery from the application build and delivery
  lane in the Solution and Engineering Architecture views.
- Made immutable artifact identity, Release Manifest, authorization, promotion,
  rollback and D5B composition boundaries explicit.

### Preserved

- Terraform, Cloud Build, Artifact Registry, SHA-256 digest, Release Manifest,
  identity, secret and promotion responsibilities remain unchanged.
- GCP-02 remains delivery architecture, separate from the GCP-01 foundation and
  D4/D5A runtimes.

## 2026-10-01 — ARCH-REDESIGN-06

### Redesigned

- GCP-01 using the approved OEM Golden Template.
- Introduced a concise Solution Architecture for D4, D5A and GCP-02 consumers
  and a detailed Engineering Architecture for the shared GCP foundation.
- Clarified environment isolation and the network, identity, Terraform, secret,
  artifact and object-storage responsibility boundaries.

### Preserved

- The custom VPC, management/workloads/data subnet model, firewall boundaries,
  Private Google Access, purpose-specific identities, Secret Manager, Artifact
  Registry and Cloud Storage purposes remain unchanged.
- GCP-01 remains a foundation architecture, not runtime, delivery or evidence of
  deployed cloud resources.

## 2026-10-01 — ARCH-REDESIGN-05

### Redesigned

- D4 using the approved OEM Golden Template.
- Introduced a concise Solution Architecture and refined the Engineering Architecture for the minimum GKE QA runtime.
- Clarified D2 → D4 portability and separated GCP Foundation capabilities from the GKE/OEM runtime.
- Clarified QA/runtime, CI/CD, AI/AIOps, and D4 → D5A boundaries.

### Preserved

- D0 responsibilities, D2 workload contract, D4 workload model, Management Plane, canonical event flow, data authority, and deployment contract remain unchanged.
- GCP Foundation, CI/CD, and AI architecture remain separate domains.

## 2026-10-01 — ARCH-REDESIGN-04

### Redesigned

- D2 using the approved OEM Golden Template.
- Introduced a concise Solution Architecture and refined the Engineering Architecture for explicit KVM, Linux VM, Kubernetes, and OEM workload containment.
- Separated D3 role placement from Kubernetes workload placement.
- Clarified D2 portability into D4 GKE while preserving invariant OEM workloads and logical planes.

### Preserved

- D0 responsibilities, D2 containment, Kubernetes responsibility, Management Plane, canonical event flow, data authority, and D2 → D4 portability remain unchanged.
- Packaging technology remains controlled by a separate ADR; Helm and stateful-service operators are not implicit architecture requirements.

## 2026-10-01 — ARCH-REDESIGN-03

### Redesigned

- D3 using the approved OEM Golden Template.
- Introduced a concise Solution Architecture and a detailed Engineering Architecture with explicit distributed RHEL role containment.
- Clarified the distinction between deployment/readiness dependency and event flow.
- Expressed the Search / Analytics Projection tier as a modular capability in the D3 profile.

### Preserved

- D0 responsibilities, the four-role D3 model, service placement, data authority, Management Plane, event flow, readiness dependency, and deployment contract remain unchanged.
- The canonical D0 event and management flow remains visible alongside the D3 distributed-role containment view.

## 2026-09-30 — ARCH-REDESIGN-02

### Redesigned

- D1 using the approved D0 Architecture Golden Template.
- Added a concise Solution Deployment Architecture and refined the Engineering Runtime Architecture.
- Formalized the Minimum Deployable OEM and Local Development Tooling as separate containment boundaries.

### Preserved

- D0 responsibilities, D1 containment, service ownership, data authority, Management Plane, and local runtime contract remain unchanged.

## 2026-09-30 — ARCH-REDESIGN-01

### Redesigned

- D0 editorial and visual presentation using the OEM Architecture Golden Template.
- Added a concise Solution Architecture view for committee, customer, and executive technical audiences.
- Retained and clarified the Engineering Architecture view and its plane, event, management, and authority contracts.

### Established

- Reusable architecture-page structure and Mermaid visual grammar for D1 through AI-01.
- Architecture semantics, responsibilities, authority model, event contracts, and management boundary remain unchanged.

## 2026-09-28 — WRITE-09

### Added

- AI-01 planned AIOps/AI architecture and presentation-oriented Multi-Surface architecture.
- Governed interface/tool boundary, read-versus-action separation and vendor-neutral model-provider boundary.
- AI-02 delivery and governance lifecycle registration.

### Clarified

- GUI, CLI/API and AIOps/AI are governed interaction models over one OEM Core.
- OpenSearch remains search/analytics projection and future retrieval attachment, not intelligence itself.
- AI actions require authorized tools/APIs; model inference has no implicit operational authority.

### Pending, not completed by WRITE-09

- LLM/OLLM evidence recovery, RAG/vector decision, model gateway strategy, AI identity, tool authorization, human approval, AI memory, observability, evaluation and prompt/model/agent/tool versioning.

## 2026-09-28 — WRITE-08

### Added

- D6 Environment Evolution, current landscape and environment-aware installation/deployment model.
- Status comparison for Local, RHEL, KVM/Kubernetes, QA GKE, PROD GKE and PROD GKE + CI/CD.
- Explicit installation-versus-Terraform responsibility boundary and conceptual future unified entry point.

### Presentation readiness documentation repair

- Added the two local documentation evidence targets required by inherited MkDocs links: the M06 test registry and UC-001 visual-validation procedure.

### Pending, not completed by WRITE-08

- Unified installer/deployment entry point, environment profiles, installer contract, Terraform integration boundary, Kubernetes/GKE adapters, validation, idempotency, rollback/uninstall and remote localhost deployment automation.
- Wiki deployment automation remains a separate future objective.

## 2026-09-28 — WRITE-07

### Added

- D5B PROD GKE + CI/CD Architecture as a `TARGET` delivery composition.
- Explicit source/governance, infrastructure delivery, application supply-chain and runtime-delivery boundaries.

### Clarified

- D5A remains the unchanged production runtime architecture; D5B composes it with GCP-02.
- Terraform, Cloud Build, Artifact Registry, immutable digest, Release Manifest and deployment authorization have distinct responsibilities.
- Promotion, rollback, database migrations and stateful upgrades are contracts or pending decisions, not completed operations.

### Pending, not completed by WRITE-07

- Deployment packaging/reconciliation, controller choice, approval and promotion controls, workload identity, signing, SBOM, attestations, migration engine, stateful upgrade strategy and automated rollback.
- D6 Environment Evolution and the separate AI model, prompt and agent delivery lifecycle.

## 2026-09-28 — WRITE-06

### Added

- D5A PROD GKE Runtime Architecture as `TARGET`.
- D5 production evolution context leading to future D5B.

### Clarified

- Production runtime is separated from CI/CD.
- Production qualities, stateful recovery requirements and HA versus DR are architectural requirements, not implementation claims.
- Management Plane and multi-surface readiness are preserved.
- AIOps remains optional and separate from OpenSearch projection/runtime.

### Pending, not completed by WRITE-06

- GKE production topology, HA/DR, stateful storage/operators, recovery, observability, workload identity, ingress, PKI/TLS and packaging.
- D5B CI/CD composition and D6 Environment Evolution.

## 2026-09-28 — WRITE-05

### Added

- GCP-01 OEM GCP Foundation Architecture.
- GCP-02 OEM GCP Build, Delivery & CI/CD Architecture.
- GCP architecture history that preserves the prior combined diagrams.

### Clarified

- Terraform defines/provisions infrastructure; Cloud Build builds artifacts.
- Artifact Registry and immutable digest identity are distinct from deployment.
- Release Manifest is a runtime-independent control contract, not deployment.
- Automation identities and secret references are separated from credentials.
- D5 composition is prepared without asserting production runtime or delivery.

### Pending, not completed by WRITE-05

- D5A, D5B, D6, runtime workload identity, GKE production topology, HA/DR,
  backup/recovery, observability and Helm ADR.

## 2026-09-28 — WRITE-04

### Added

- D4 QA GKE Minimum Deployment Architecture as `TARGET`.
- D2 → D4 portability and GKE minimum-scope definition.
- AI-01 and OEM Multi-Surface Interaction Architecture registrations as
  `PLANNED` future domains.

### Clarified

- D4 preserves Management Plane and the D0 data contract.
- AIOps/AI is outside D4 minimum; OpenSearch remains a search/analytics
  projection rather than AI itself.
- GUI, CLI/API and AIOps are governed interaction alternatives over the same
  OEM Core.

### Pending, not completed by WRITE-04

- GKE implementation, CI/CD, production HA, DR and advanced SRE automation.
- AI-01 discovery, LLM/OLLM recovery, OpenSearch/AIOps integration, AI
  governance, observability and lifecycle.

## 2026-09-28 — WRITE-03

### Added

- D2 DEV KVM + Kubernetes architecture definition as `TARGET`.
- D2 decision context and D2 → D4 portability relationship.

### Clarified

- D2 preserves the D0 Management Plane and data contract.
- OpenSearch returns as the Search / Analytics Projection in the D2 target.
- D2 Kubernetes and D3 RHEL four-role VMs are alternative deployment profiles.
- Helm remains a pending ADR, not a D2 implementation requirement.

### Pending, not completed by WRITE-03

- Kubernetes implementation, distribution/version, topology, stateful storage,
  ingress, PKI/TLS, secret provider, HA, recovery and observability.
- D4 QA GKE, D5A, D5B, D6 and Helm ADR.

## 2026-09-28 — WRITE-02

### Added

- D3 DEV RHEL / on-prem deployment architecture synchronized into the Wiki.
- Four-role deployment model: Database, Core, Gateway and GUI.
- R79 historical evolution record with explicit uncertainty preservation.

### Clarified

- Management Plane remains part of the minimum deployable OEM architecture.
- OpenSearch is excluded from the D3 deployment profile without changing D0.
- D3 RHEL/on-prem and D2 KVM/Kubernetes are separate architecture definitions.
- Offline deployment and DEV-BOOT-01 are recorded as `PROJECT-PROVIDED
  BASELINE`; repository verification is not implied.

### Pending, not completed by WRITE-02

- Recover or independently inspect the RHEL bundle, branch, manifest, logs and
  certification evidence.
- D2 KVM/Kubernetes, GCP, D4, D5A, D5B, D6 and Helm ADR.

## 2026-09-28 — WRITE-01

### Added

- D0 canonical logical architecture as a `CURRENT` documented baseline.
- D1 local deployment architecture as a `CURRENT` documented baseline.
- Data Authority & Replay Boundary supporting view.
- Architecture Evolution Register and preservation policy.
- Explicit minimum-deployment Management Plane: Event Management Console plus
  Management BFF/API.

### Clarified

- PostgreSQL is the Operational Source of Truth.
- OpenSearch is the Search / Analytics Projection.
- Kafka is the Decoupled Event Transport + Replay Boundary.
- Existing D0 and D1 diagrams remain preserved as predecessors; they are not
  silently rewritten or deleted.

### Pending, not completed by WRITE-01

- D3 RHEL synchronization.
- D2 KVM/Kubernetes architecture.
- Separate GCP Architecture and GCP + CI/CD Architecture views.
- D4 QA GKE, D5A PROD GKE and D5B PROD GKE + CI/CD.
- D6 Environment Evolution.
- Helm ADR.
- Security/IAM boundary and backup/recovery/replay supporting views.
