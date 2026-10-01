# D5 PROD GKE Evolution Context

| Architecture lifecycle | Documentation status |
|---|---|
| `HISTORICAL` | `DOCUMENTED` decision context |

The production GKE path is an architecture evolution, not runtime evidence.

```text
D4 QA GKE Minimum
  → D5A PROD GKE Runtime
  → D5B PROD GKE + CI/CD
```

D4 establishes minimum portability and QA scope. D5A adds production quality requirements while retaining D0 responsibilities and GCP-01 foundation attachment. D5B composes that unchanged D5A runtime with GCP-02 delivery contracts; it is a delivery extension, not a runtime semantic change.

Availability, recovery, security, stateful service strategy and operability are requirements in D5A, not claims that concrete mechanisms exist. The current definitions are [D5A — PROD GKE Runtime](../d5a-prod-gke-runtime-target.md) and [D5B — PROD GKE + CI/CD](../d5b-prod-gke-cicd-target.md).
