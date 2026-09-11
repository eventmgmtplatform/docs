# IaC, GCP y Kubernetes
```mermaid
flowchart TB
 GIT[Git]-->CI[CI validation/build]-->AR[Artifact Registry]
 TF[Terraform]-->GCP[GCP Foundation]
 GCP-->VPC[VPC / subnets / firewall]
 GCP-->IAM[IAM / Service Accounts]
 GCP-->GCS[GCS]
 GCP-->SM[Secret Manager]
 GCP-->AR
 AR-->K8S[Kubernetes / GKE]
 K8S-->CORE[oem-core]
 K8S-->INT[oem-integrations]
 K8S-->CON[oem-console]
 K8S-->INIT[oem-init jobs]
 K8S-->TOOL[oem-toolbox on demand]
```
## Diagramas de referencia

![Arquitectura GCP para Gestión de Eventos](diagrams/Arquitectura%20GCP%20para%20Gesti%C3%B3n%20de%20Eventos.png)

![Arquitectura Docker Compose](diagrams/Arquitectura%20Docker%20Compose%20para%20gesti%C3%B3n%20de%20eventos.png)

![Diseño frente a estado actual](diagrams/Arquitectura%20Docker%20Compose%20-%20Dise%C3%B1o%20vs.%20Estado%20Actual.png)

## GCP foundation
OS_08_13 documenta VPC/subredes management-workloads-data, firewall, Secret Manager, Artifact Registry, buckets application/backups/shared/logs, Cloud Build y service accounts de despliegue/entrega, tratada como baseline certificada sin drift en su checkpoint.

## Kubernetes
Deployments separados; Jobs idempotentes; ConfigMaps; secret provider; startup/readiness/liveness; requests/limits; PDB/HA donde aplique; NetworkPolicy/RBAC como hardening; Helm/Kustomize/manifiestos versionados; rollback y backup/restore certificados antes de producción.

## Portabilidad
Los módulos cloud-specific deben aislarse. Network, identity, registry, secrets, storage, compute/orchestration y observability pueden mapearse a AWS, Azure u on-prem sin cambiar los contratos del core.
