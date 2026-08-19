# DECISIONS — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` (`docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` v1.5) |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | none yet |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.0 | 2026-08-20 |

## Context

A6 is the sixth advisory seam: it fires at exactly one place — Phase I's wave loop, at the moment
the script-owned test gate goes red — snapshots the tree, attempts one bounded in-envelope repair,
re-runs the wave's own gate sequence, and either keeps the repair or restores the snapshot
byte-identical and halts with a diagnosis attached. TSPEC v1.5 settles the design; this document
records the four load-bearing choices inside it that had a live alternative, so that a later reader
finds the rejected option and its reason here rather than reverse-engineering it from a test oracle.

Two of the four are the entries TSPEC §6 nominates explicitly ("Two entries warrant a DECISIONS
document for this feature"): the restoration mechanism (§2.5) and the E-6 promotion commit shape
(OQ-8, raised as PM F-06). Two more are recorded because they are configuration- and
operator-visible and were re-litigated across review rounds: the snapshot ref's name (OQ-2, PM F-02
and PM F-03) and the admission of `waveBudgetPerRun: 0` as a legal configured value (OQ-1, E-33).

Constraints that shaped all four, none of them this feature's to change:

- **One module, one bundle.** The workflow runtime loads a single built artifact
  (`pdlc/workflows/dist/orchestrate-dev.bundle.js`); every advisory-tier symbol A6 reuses —
  `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry` — lives in
  `pdlc/workflows/orchestrate-dev.js`. A new file is not an option, so "add a module" never appears
  as an alternative below.
- **No new transport.** A6 gets `_git`, `_runCommand`, `_readFile`, `_appendFile` and `_agent`
  already threaded through Phase I (NFR-3). Anything a decision needs, it needs from those.
- **The wave contract forbids agent commits.** `waveImplementPrompt` tells wave agents
  `Do NOT git commit`, so at gate time the index equals HEAD and the uncommitted working tree *is*
  the wave's work — the asset every restoration option is judged against.
- **Advisory tier ships disabled** (`ADVISORY_DEFAULTS.enabled: false`). A decision that only
  changes behaviour under `advisory.enabled: true` costs a default-configured repo nothing, which
  is why the reversibility ratings below are as cheap as they are.

## Options Considered

## Decision

## Consequences
