# GCP Architecture Evolution History

| Architecture lifecycle | Documentation status |
|---|---|
| `HISTORICAL` | `CURRENTLY DOCUMENTED` source-history context |

The previous GCP materials are preserved as historical/combined views:

- [GCP architecture page](../gcp.md) duplicates logical architecture rather
  than documenting a distinct GCP runtime.
- [IaC, GCP and Kubernetes](../../deployment/iac-gcp-kubernetes.md) combines
  foundation, CI/CD and future Kubernetes concerns.
- Existing GCP PNG and Architecture Atlas cloud/CI-CD assets remain preserved
  visual history.

Those views can imply a GKE runtime or collapse deployment and delivery
concerns. They are not deleted. Their successors are [GCP-01 Foundation](../gcp-foundation-current.md)
and [GCP-02 Build, Delivery & CI/CD](../gcp-cicd-current.md); D4 and future D5
views retain responsibility for runtime architecture.

## Evolution path

```text
Initial logical/GCP diagrams
  → documented GCP foundation
  → combined foundation / CI-CD view
  → GCP-01 Foundation + GCP-02 Build, Delivery & CI/CD
  → future D5 production composition
```

Architecture evolution preserves predecessor diagrams and links successors;
classification does not delete history.

## GCP-01 presentation evolution

`GCP-01-golden-01` (ARCH-REDESIGN-06, 2026-10-01) applies the OEM Golden
Template to the foundation view. It separates a concise consumer-oriented
solution view from the engineering containment view and clarifies the network,
identity, Terraform, secret, artifact and object-storage responsibility
boundaries. The foundation capabilities, consumers and separation from runtime
and delivery architectures are unchanged.
