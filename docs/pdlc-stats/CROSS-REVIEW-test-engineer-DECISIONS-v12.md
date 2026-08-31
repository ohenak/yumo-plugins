# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.7)
**Date:** 2026-08-31
**Iteration:** 12

## Context

**Delta re-review under DECISION FREEZE.** v11 was an upstream-cascade confirmation over
byte-unchanged bytes (`sha256:48522bf9…`, `REVIEWED-COMMIT: 930d65c49`). This round the document
*did* move: three commits — `39d7d46f7`, `82a2f8ec7`, `f3ab46e72` — land v1.7 at
`sha256:ca3f7219…`, +43/−8 across four hunks and nothing else.

The delta is scoped exactly to the four items I carried in v11 and nothing beyond them:

| v11 finding | What v1.7 does | Hunk |
|---|---|---|
| F-01 (Medium) — K-3's divergence clause cites TSPEC text TSPEC no longer says | K-3 replaced with *"Upstream divergence resolved in TSPEC v1.7 — no longer owed (retires TE F-05, PM F-01)"* | `DECISIONS:623` |
| F-02 (Medium) — v1.6 grounding attestation stale by three REQ versions | v1.6 entry marked *"(Version-scoped: pins in this entry state upstream as it stood at v1.6, not HEAD)"*; new v1.7 entry re-grounds on HEAD | `DECISIONS:14–46`, `:74` |
| F-03 (Low) — site-table preamble said "Four hold; five pin" against its own 5+4+1 | preamble now reads **"Five** hold enumerations; **four** pin"* | `DECISIONS:243` |
| F-04 (Medium) — non-resolving `UPSTREAM-STATE` TSPEC pins | v1.7 entry records it as a workflow-side defect routed to harvest, states no conclusion rests on it, and that every affected round re-grounded against HEAD per `DEC-ERR-03` | v1.7 changelog |

Upstream at branch HEAD, measured, not taken from the document:

| Doc | HEAD sha256 | HEAD version | v1.7 changelog claims | Match |
|---|---|---|---|---|
| REQ | `f75c348f…` | v1.7 (`REQ:18`) | v1.7, `f75c348f…` | yes |
| FSPEC | `a493133f…` | v1.8 (`FSPEC:16`) | v1.8, `a493133f…` | yes |
| TSPEC | `f32d9cb5…` | v1.8 (`TSPEC:16`) | v1.8, `f32d9cb5…` | yes |

All three pins in the new changelog entry resolve to real revisions at HEAD — the first round in
four where the document's own upstream statement is verifiable end to end.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
