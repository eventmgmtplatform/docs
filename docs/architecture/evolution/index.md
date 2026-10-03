# Architecture Evolution

Architecture evolution must be observable. A diagram is not silently removed
when its meaning is replaced: it is preserved, classified, linked to its
successor and explained with the evidence and decision context that caused the
change.

## Lifecycle model

| State | Meaning |
|---|---|
| `CURRENT` | Canonical architecture currently used as the documented baseline. |
| `HISTORICAL` | Preserved record of an earlier documented architecture. |
| `SUPERSEDED` | Preserved architecture whose semantics have been replaced by a successor. |
| `TARGET` | Intended architecture, not evidence of a deployed runtime. |
| `PLANNED` | Work identified but not yet defined as a target implementation. |
| `UNKNOWN` | Evidence is insufficient to make an architectural claim. |

Validation qualifiers such as `DOCUMENTED`, `VALIDATED` and `PARTIAL` may add
context; they never replace the lifecycle state.

## Register

| Architecture | Version | Environment | Status | Date | Predecessor | Successor | Change reason | Evidence | ADR |
|---|---|---|---|---|---|---|---|---|---|
| Open Event Management — Architecture Definition | MASTER-ARCH-01 | CANONICAL ASSEMBLY / Cross-environment | `CURRENT` (`DOCUMENTED`) | 2026-10-01 | 13 approved Golden architectures | None | Canonical product-wide assembly; semantic change: NO; supersedes Golden architectures: NO. Golden architectures remain authoritative detailed definitions. | [Master Architecture](../oem-architecture-definition.md) | Golden source ADRs remain authoritative |
| General Solution / V1 logical architecture | UNKNOWN | Logical / local partial | `HISTORICAL` | UNKNOWN | UNKNOWN | [D0 Current](../d0-logical-current.md) | Console/data-store coupling, absent Management BFF/API, ambiguous data authority and mixed local/Kubernetes semantics require an explicit successor. | [Architecture overview](../index.md), [V1 map](../v1-map.md) | UNKNOWN |
| Local runtime topology | UNKNOWN | Local Docker Compose | `HISTORICAL` | UNKNOWN | UNKNOWN | [D1 Current](../d1-local-current.md) | The successor makes host containment, the minimum management plane and development-only tooling explicit. | [Runtime topology](../runtime-topology.md) | UNKNOWN |
| D0 — OEM Logical Architecture | D0-golden-01 | Environment independent | `CURRENT` (`DOCUMENTED`) | 2026-09-30 | General Solution / V1 logical architecture | None | ARCH-REDESIGN-01 presentation and readability normalization; architecture semantics and contract unchanged. | [D0](../d0-logical-current.md) | UNKNOWN |
| D1 — Local Deployment Architecture | D1-golden-01 | Ubuntu/Linux + Docker Compose | `CURRENT` (`DOCUMENTED`) | 2026-09-30 | Local runtime topology and Compose assets | None | ARCH-REDESIGN-02 Golden Template adoption and solution/runtime presentation normalization; deployment semantics and contract unchanged. | [D1](../d1-local-current.md) | UNKNOWN |
| Data Authority & Replay Architecture | DATA-AUTHORITY-golden-01 | Environment independent | `CURRENT` (`DOCUMENTED`) | 2026-10-01 | data-authority-01, D0 and synchronized ESS flow documentation | Master Architecture | ARCH-REDESIGN-13 Golden normalization, authority/replay/recovery clarification and cross-cutting contract formalization; architecture semantics and data-authority contract unchanged. General reconciliation and transactional outbox remain outside certified implementation evidence. | [Data Authority & Replay](../data-authority-replay.md) | [Processor ADRs](../../platform/event-processor/decisions-adr.md) |
| D3 — On-Premises RHEL Deployment Architecture | D3-golden-01 | Enterprise virtualization + RHEL VMs | `CURRENT` (`DOCUMENTED`) | 2026-10-01 | [R79 historical evolution](d3-rhel-history.md) and D3-sync-01 | None | ARCH-REDESIGN-03 Golden Template adoption, solution/engineering view separation, and distributed-role visualization; deployment semantics and contract unchanged. | [D3 Current](../d3-rhel-current.md) | UNKNOWN |
| D2 — KVM + Kubernetes Deployment Architecture | D2-golden-01 | KVM + Linux VMs + Kubernetes | `TARGET` (`DOCUMENTED`) | 2026-10-01 | [D2 decision context](d2-kvm-kubernetes-history.md), D0, D1 and D3 as alternative deployment experience | D4 QA GKE target | ARCH-REDESIGN-04 Golden Template adoption, Kubernetes containment clarification, portable orchestration representation, and solution/engineering view separation; deployment semantics and contract unchanged. | [D2](../d2-kvm-kubernetes-target.md) | UNKNOWN |
| D4 — QA GKE Minimum Deployment Architecture | D4-golden-01 | QA on GCP / GKE | `TARGET` (`DOCUMENTED`) | 2026-10-01 | [D4 evolution context](d4-qa-gke-history.md), D0 and D2 | D5A Production GKE Runtime | ARCH-REDESIGN-05 Golden Template adoption, D2 → D4 portability clarification, GCP foundation/runtime separation, and QA boundary clarification; deployment semantics and contract unchanged. | [D4](../d4-qa-gke-minimum-target.md) | UNKNOWN |
| GCP-01 — OEM GCP Foundation | GCP-01-golden-01 | GCP | `CURRENT` (`DOCUMENTED`) | 2026-10-01 | [Combined GCP history](gcp-architecture-history.md) and GCP-01-01 | [GCP-02](../gcp-cicd-current.md), D4/D5 runtime views | ARCH-REDESIGN-06 Golden Template adoption, shared-foundation consumer view and responsibility-boundary clarification; foundation semantics and contract unchanged. | [GCP-01](../gcp-foundation-current.md) | UNKNOWN |
| GCP-02 — OEM GCP Build, Delivery & CI/CD | GCP-02-golden-01 | GCP | `CURRENT` (`DOCUMENTED`) | 2026-10-01 | GCP-01 and GCP-02-01 | D5B production composition | ARCH-REDESIGN-07 Golden Template adoption, infrastructure/application lane separation, artifact identity and release-authorization clarification; delivery semantics and contract unchanged. | [GCP-02](../gcp-cicd-current.md) | UNKNOWN |
| D5A — Production GKE Runtime | D5A-golden-01 | PROD GCP / GKE | `TARGET` (`DOCUMENTED`) | 2026-10-01 | [D5 production context](d5-prod-gke-history.md), D0, D2, D4, GCP-01 and D5A-target-01 | D5B PROD GKE + CI/CD | ARCH-REDESIGN-08 Golden Template adoption, production-quality visualization, HA/DR separation, authority-aware recovery clarification and runtime/delivery separation; production runtime semantics unchanged. | [D5A](../d5a-prod-gke-runtime-target.md) | UNKNOWN |
| D5B — Production GKE + CI/CD Composition | D5B-golden-01 | PROD GCP / GKE | `TARGET` (`DOCUMENTED`) | 2026-10-01 | GCP-01, GCP-02, D5A and D5B-target-01 | D6 Environment Evolution | ARCH-REDESIGN-09 Golden Template adoption, composition normalization, Delivery-to-Runtime contract clarification and release-lineage visualization; composition semantics unchanged. | [D5B](../d5b-prod-gke-cicd-target.md) | UNKNOWN |
| D6 — Environment Evolution & Deployment Model | D6-golden-01 | Cross-environment | `CURRENT` (`DOCUMENTATION VIEW`) | 2026-10-01 | D0 through D5B and D6-current-01 | None | ARCH-REDESIGN-10 Golden Template adoption, environment-map normalization, deployment-mechanism clarification and cross-cutting architecture separation; source environment contracts unchanged. | [D6](../d6-environment-evolution.md) | UNKNOWN |
| AI-01 — OEM AIOps / AI Architecture | AI-01-golden-01 | Cross-environment | `PLANNED` (`DOCUMENTED`) | 2026-10-01 | Partial independent AIOps evidence and AI-01-01 | AI-02 delivery/governance lifecycle | ARCH-REDESIGN-12 Golden Template adoption; AI responsibility separation, governed-tool boundary, vendor-neutral model abstraction and implementation-evidence boundary clarified; AI semantics unchanged. | [AI-01](../ai-01-aiops-ai-architecture.md) | UNKNOWN |
| OEM Multi-Surface Interaction Architecture | MULTI-SURFACE-golden-01 | Cross-environment | `PLANNED` (`DOCUMENTED`) | 2026-10-01 | D0 API-first core and MS-01 | None | ARCH-REDESIGN-11 Golden Template adoption, interaction-surface normalization, governance-boundary clarification and surface-equivalence formalization; interaction semantics and contract unchanged. | [Multi-Surface](../multi-surface-interaction.md) | UNKNOWN |
| OEM Universal Management Contract | UMC-01 | Cross-environment | `DESIGNED` (`DOCUMENTED`) | 2026-10-03 | Multi-Surface, D0 and Data Authority | UMC conformance implementation | New cross-cutting resource/action management contract across CLI, API, Web Console and governed PostgreSQL scripting; semantic architecture change: YES. | [UMC-01](../universal-management-contract.md) | UNKNOWN |
| AI-02 — AI Delivery & Governance Lifecycle | UNKNOWN | Cross-environment | `PLANNED` | 2026-09-28 | AI-01 | UNKNOWN | Register lifecycle work separately from D5B application-container CI/CD. | [Future architecture register](future-architecture-register.md) | UNKNOWN |

## Evidence, ADR and change relationships

The register links a change to the documentation and evidence that supports it.
It does not certify a target runtime, an external provider or a cloud deployment.
ADRs remain the decision record; this register records which architecture view
they affect. The dedicated [CHANGELOG](CHANGELOG.md) records published
architecture-definition changes and [BAU](BAU.md) tracks only this architecture
documentation workstream.

## Preservation policy

Predecessor Markdown, Mermaid and visual assets remain available during an
evolution. `HISTORICAL` and `SUPERSEDED` describe meaning, not deletion.
Physical archival, renaming or removal requires a later reviewed decision and a
successor link.
