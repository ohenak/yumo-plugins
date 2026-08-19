# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.8)
**Date:** 2026-08-19
**Iteration:** 9
**Scope:** Delta confirmation of the Phase PR erratum round (commit `a349767b`), plus upstream re-grounding per DEC-ERR-03. Not a full re-review.

## Delta Under Confirmation

One routed item, from se-review: §3.1's module-scope export list (`:502`–`:511`) omitted
`ADVISORY_SEAM_PHASES` while the prose below it required that table to gain an `A6` row, and the
shipped table is a module-private `const` at `orchestrate-dev.js:3108` — leaving PROPERTIES'
PROP-REC-07 with no executable unit contract.

**Resolved, and resolved in the direction I would have argued for.** The edit does not widen the
interface; it states the visibility that already holds and then names the oracle that makes the
missing row observable anyway. Checks I re-derived against HEAD:

| Claim in the delta | Verified |
|---|---|
| §3's preamble licenses the construction: "Every signature below is a module-scope export … unless marked *(module-private)*" (`:513`–`:515`) | Yes — the marker now appears on `ADVISORY_SEAM_PHASES`, so its absence from the export block is grammatical, not a gap |
| Shipped table is a bare `const`, not exported, at `orchestrate-dev.js:3108` | Yes — `const ADVISORY_SEAM_PHASES = Object.freeze({…})`, five rows A1–A5, no `export` |
| Fallback at `orchestrate-dev.js:3338` writes the literal `"unknown"` for **both** fields | Yes — `phase: placement ? placement.id : "unknown"` and the `phaseOutcome` line immediately beside it |
| PROPERTIES' PROP-REC-07 is written to the escalation-entry shape, not the constant | Yes — PROPERTIES `:157` reads "escalation-log **entry**, not constant", pins `I`/`halted` for A6, holds A3–A5 at `DOD`/`halted` and `PUB`/`halted`, and asserts the `unknown` arm as a negative control |
| Its home `advisoryEscalationLog.test.js` is already on §5.1's edited-files list | Yes — TSPEC `:1198` |
| PLAN task A6-17 owns that file | Yes — PLAN `:111` (RED task, AT-06-3/-5/-6) and the ownership manifest row at `:152` |

Nothing new is minted: no new test file, no new owning task, no new export, no batch movement.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
