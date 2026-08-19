# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 3 (delta re-confirmation — PROPERTIES bytes unchanged; TSPEC moved v1.7 → v1.8)

## Scope of this round

This is an upstream-cascade confirmation, not a re-review. PROPERTIES' own bytes are unchanged since
the v2 approval (`REVIEWED-COMMIT: 7f8dcda6`). The anchor recorded
`UPSTREAM-STATE: TSPEC sha256:c0ee14a4…`, which is TSPEC at commit `61a9605d` (v1.7); HEAD is
`a349767b` (v1.8, `sha256:79777fa6…`). The delta is therefore exactly one commit and one
document region.

I read my own v2 cross-review, then `git show a349767b -- .../TSPEC-…md` in full (43 insertions,
3 deletions: a changelog block plus a rewrite of §3.1's `ADVISORY_SEAM_PHASES` paragraph). The
other four upstream documents are byte-identical to the hashes on my anchor — I re-hashed REQ
against the dispatch-supplied `sha256:a10396e8…` and it matches, and the FSPEC/DECISIONS/PLAN
anchors are unmoved — so nothing in this pass concerns them.

The one question I answer: does PROPERTIES still hold as a faithful compression of TSPEC as it now
stands? I re-read the whole of the edited §3.1 region at HEAD, PROP-REC-07 at HEAD, every
PROPERTIES row that cites TSPEC §3.1 or §5.6, and the two shipped line anchors the new TSPEC text
introduces.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | PROPERTIES' Overview still scopes itself to **"TSPEC v1.6 (§2–§5)"** (`PROPERTIES-pdlc-advisory-wave-gate.md:25`, echoed in the v1.0 changelog row at `:12`), while TSPEC HEAD is v1.8. The cited version predates my own approval too — v1.7 was already the approved state — so this is not a regression from this round's edit, and no *substantive* claim in PROPERTIES depends on it: every §3.1 and §5.6 assertion I re-checked matches HEAD prose. It is a stale provenance label on an otherwise accurate document, and cheapest to fix while the document is open. | Overview → Scope; changelog v1.0 row |

FINDING: Low | inherited | nonlocal | Overview → Scope (`:25`) | Version label cites TSPEC v1.6; TSPEC HEAD is v1.8. Pre-existed the v1.7 approval, no dependent claim is wrong, label-only.

No High and no Medium findings. The single Low is not gating.

## Questions

## Positive Observations

## Recommendation

## Verdict
