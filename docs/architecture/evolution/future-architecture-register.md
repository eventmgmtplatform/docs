# Future Architecture Register

This register records architecture domains that are intentionally not designed
or implemented by the current baseline.

## AI-01 — OEM AIOps / AI Architecture

| Lifecycle | Scope | Required discovery |
|---|---|---|
| `PLANNED` (`DOCUMENTED`) | AIOps / AI architecture | [AI-01](../ai-01-aiops-ai-architecture.md) defines the future boundary while preserving partial AIOps evidence; recover LLM/OLLM, RAG/retrieval, agents/tools, orchestration, models, policy/governance, observability and OpenSearch integration evidence. |

OpenSearch is a Search / Analytics Projection capability; it is not AIOps by
itself. Future AI read/context access must use governed OEM search, history and
approved context interfaces. Operational actions must pass through governed OEM
APIs or approved tools with authorization, audit and policy controls. AI must
not directly mutate PostgreSQL authoritative state, Kafka internal state or
OpenSearch system state unless a future ADR defines a controlled mechanism.

## OEM Multi-Surface Interaction Architecture

| Lifecycle | Scope | Principle |
|---|---|---|
| `PLANNED` (`DOCUMENTED`, `MULTI-SURFACE-golden-01`) | GUI, CLI/API and AIOps interaction surfaces | [Documented multi-surface architecture](../multi-surface-interaction.md): alternative governed interactions over the same OEM Core, not separate OEM products. |

```text
GUI       CLI/API       AIOps / AI
     \       |       /
      Governed API / Tool Layer
                |
             OEM Core
Gateway / Processor / Worker / ESS
       |          |          |
    Kafka    PostgreSQL  OpenSearch
```

Customers may use GUI-centric, API/CLI-centric, AIOps-centric or combined
interaction patterns. The architectural requirement is stable backend contracts:
GUI, CLI and AIOps must consume governed interfaces rather than independent
backdoors into the platform.

ARCH-REDESIGN-11 normalized the documented interaction surfaces, governance
boundary, read/action distinction and capability equivalence without changing
the planned lifecycle or interaction contract.

## AI-02 — AI Delivery & Governance Lifecycle

| Lifecycle | Scope | Required discovery |
|---|---|---|
| `PLANNED` | Model, prompt, agent and tool delivery/governance lifecycle | Define identity/versioning, evaluation gates, promotion, rollback, audit and policy lifecycle separately from D5B container CI/CD. |
