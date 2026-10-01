# D3 RHEL / On-Prem Architecture History

| Architecture lifecycle | Documentation status |
|---|---|
| `HISTORICAL` | `PROJECT-PROVIDED BASELINE` |

This record preserves the project-provided R79 evolution context without
claiming completion where repository evidence is absent. Its current successor
is [D3 — DEV RHEL / On-Prem Deployment Architecture](../d3-rhel-current.md).

## Evolution context

The documented local Compose baseline preceded a need for distributed on-prem
deployment. The project-provided R79 path describes endpoint externalization,
four-role distribution, an OpenSearch-free D3 profile, an offline deployment
need and later certification progression. Kubernetes and Helm were evaluated as
a later, separate concern and are not part of D3.

## R79 historical sequence

| Phase | Project-provided purpose | Completion status |
|---|---|---|
| R79-01 | Discovery / compatibility diagnosis | `UNKNOWN` |
| R79-02 | Endpoint externalization | `UNKNOWN` |
| R79-03 | Four-role distribution | `UNKNOWN` |
| R79-04 | Readiness / negative testing | `UNKNOWN` |
| R79-05 | Distributed UC-001 without OpenSearch | `UNKNOWN` |
| R79-06 | Distributed certification checkpoint | `UNKNOWN` |
| R79-07 | Real RHEL 7.9 laboratory / OCI decision | `UNKNOWN` |
| R79-08 | Filesystem, systemd, SELinux, firewalld, secrets, logs and backup | `UNKNOWN` |
| R79-09 | Podman/runtime evaluation | `UNKNOWN` |
| R79-10 | Update / rollback / uninstall | `UNKNOWN` |
| R79-11 | Helm/Kubernetes evaluation outside original RHEL scope | `PLANNED` |

## Preservation and boundaries

The historical path is retained because it explains the D3 role model:
Database → Core → Gateway → GUI. It does not prove that each R79 phase was
completed. No current repository bundle, manifest, logs or branch has been
independently recovered for these phases.

The project-provided `DEV-BOOT-01` report and offline bundle are registered in
[D3 Current](../d3-rhel-current.md) with their evidence class. Any future
repository recovery must update this history through the
[Architecture Evolution Register](index.md), rather than rewriting this record.
