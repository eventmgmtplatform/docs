# D4 QA GKE Evolution Context

| Architecture lifecycle | Documentation status |
|---|---|
| `HISTORICAL` | `DOCUMENTED` decision context |

D4 adapts the portable Kubernetes deployment model to GKE as a QA target. It is
not deployment evidence. Its current architecture definition is
[D4 — QA GKE Minimum](../d4-qa-gke-minimum-target.md).

## Path to D4

1. D0 defines OEM's logical contract and planes.
2. D1 provides local Compose execution experience.
3. D2 defines portable Kubernetes containment on KVM-hosted Linux VMs.
4. D4 changes the infrastructure implementation to GCP/GKE while retaining the
   OEM workload, data and management planes.

D3 is an alternative on-prem RHEL deployment profile, not a technical D4
predecessor. D4 intentionally excludes CI/CD, production HA, full DR and full
AIOps/AI from its QA minimum scope.
