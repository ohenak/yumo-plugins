# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation; FSPEC bytes unchanged since the v3 approval)

## Scope of this round

Upstream-cascade confirmation, not a re-review. I approved this FSPEC at v3 (`APPROVAL-HASH:
sha256:91ef2557…`, `REVIEWED-COMMIT: 0361675e`) against `UPSTREAM-STATE: REQ
sha256:c62cfc35…` — REQ v1.15. REQ has since moved to sha256:f97f4f66… (v1.16), so the approval was
taken against an upstream version that no longer exists. FSPEC's own bytes are unchanged: `git log`
shows its last commit as `9f80247a`, before the REQ edit.

The single question answered here: **is FSPEC still a faithful compression of REQ as it now stands?**
Per DEC-ERR-03 I measured the document against the upstream text at HEAD, not against the routed item
list — anything FSPEC cites that REQ no longer says, or now says differently, is in scope whether or
not it was routed. Settled decisions from rounds v1–v3 are not reopened, and unchanged FSPEC sections
whose upstream text the delta did not touch were not re-read.

## Upstream delta examined

`git diff 0cef7148..30d8bf7b -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` —
12 insertions, 2 deletions, in exactly two places:

| # | REQ site | Change |
|---|----------|--------|
| 1 | Version row + changelog | `1.15` → `1.16`; a v1.16 changelog paragraph describing the round as landing one item, DEC-A6-03's operator-facing halt-message obligation, routed since round 5 and previously unlanded |
| 2 | **AC-6.3** | Two sentences appended: where the halt report points the operator at a captured pre-A6 tree state, it also warns **in the same place** that re-running this feature overwrites that capture, so an operator intending to inspect it preserves it first (DEC-A6-03). The capture's name and storage form stay TSPEC's (O-1) |

No other AC, business rule, constraint, obligation, NFR or measured-fact id moved. I diffed the
whole file, not just the routed hunks: nothing FSPEC compresses outside AC-6.3 changed in this round.
The added text is stated as an operator-visible outcome and defers the ref name and storage form to
O-1, so it does not import TSPEC-altitude material into the REQ — the altitude is right.

## Does FSPEC still hold against REQ at HEAD?

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
