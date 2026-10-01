# D2 KVM + Kubernetes Decision Context

| Architecture lifecycle | Documentation status |
|---|---|
| `HISTORICAL` | `DOCUMENTED` decision context |

This record explains why D2 exists as a target architecture definition. It is
not implementation or certification evidence. Its current successor is
[D2 — DEV KVM + Kubernetes](../d2-kvm-kubernetes-target.md).

## Context

- D1 establishes the local Compose execution model.
- D3 records a distributed RHEL/on-prem VM profile with four logical roles.
- D2 introduces Kubernetes as a portable orchestration model on Linux VMs
  hosted by KVM, without converting D3 roles into Kubernetes node roles.
- D4 QA GKE is the intended future consumer of D2's portable workload and plane
  model; it changes managed infrastructure, not OEM logical responsibilities.

## Decision boundary

D2 preserves D0: Management Plane, application responsibilities, Kafka topics,
PostgreSQL authority, OpenSearch projection and Kafka transport/replay role.
The target changes only deployment/runtime organization.

Helm is not an approved D2 mechanism. Packaging remains an ADR decision among
Helm, Kustomize, raw manifests and operator-managed resources. Kubernetes
distribution, topology, storage, ingress, PKI/TLS, secrets, HA, recovery and
observability remain pending decisions.

## D2-golden-01 — ARCH-REDESIGN-04

On 2026-10-01, D2 adopted the OEM Golden Template with separate solution and
engineering views, explicit KVM → Linux VM → Kubernetes → OEM containment, and
a portable orchestration representation.

The redesign preserves D0 responsibilities, the D2 containment and Kubernetes
contract, the Management Plane, data authority, canonical event flow, and D2 →
D4 portability. It also preserves the prior Helm and operator decision boundary:
packaging technology and stateful-service operator selection remain separate
implementation decisions.
