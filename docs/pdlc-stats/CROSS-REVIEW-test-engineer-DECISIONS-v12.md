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

How I disposed of this round, and what I rejected:

| Option | What it would mean | Disposition |
|---|---|---|
| Re-open the K-3 arithmetic now that implementation exists on the branch | Treat `c8.include` measuring **eight** at branch HEAD as falsifying K-3's *"seven at HEAD"* | **Rejected.** The design's measurement basis is the pre-feature tree. `git show main:pdlc/workflows/package.json` has exactly seven `c8.include` entries and `main:…/coverageInstrumentation.test.js:264` still prints *"exactly the six modules"* — K-3's `4 + 1 + 2` = seven and "this feature makes it eight" are both true against that basis. Nothing in the delta is falsified. |
| Raise High on the branch's implementation mis-sizing the P9-02 title | The landed test title reads *"seven"* while the literal it asserts holds eight | **Rejected as a DECISIONS finding.** It is a code defect in `pdlc/workflows/__tests__/coverageInstrumentation.test.js:264`, not a defect of this document — and it is the *exact* failure K-3 predicted. Recorded as `DEFERRED` for the implementation phase, not folded into this verdict. |
| Re-derive the whole site table from scratch | Treat a moved preamble as licence to re-audit all ten rows | **Rejected.** Delta protocol: the preamble hunk changed two count words; I verified those two words against the table and the sweep, and the sweep command itself, and stopped there. |
| Confirm the four repairs landed, carry the residue as non-gating notes | Approve v1.7; record the measurement-basis and pin-recurrence observations | **Chosen** |

One thing I deliberately did not do: accept "the changelog says it re-grounded" as evidence that it
re-grounded. Every hash and version word in the new entry was measured against the files at HEAD
(table in **Context**), and the two repaired count words were re-derived from the table below them.

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
