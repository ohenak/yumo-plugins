# Cross-Review: product-manager — TSPEC (delta confirmation, erratum round 10)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md
**Date:** 2026-08-11
**Iteration:** 12
**Scope:** Delta confirmation only — erratum round 10 (`deriveRoundWindow` citation re-grounding). Not a re-review of the whole TSPEC.

## Delta examined

Erratum edit under review: commit `b8bae50a` — *docs(tspec): re-ground deriveRoundWindow citation to HEAD (erratum round 10)*, 12 insertions / 2 deletions, one file.

| Erratum item | Raised by | Edit that addresses it | Confirmed |
|---|---|---|---|
| E-01 | se-review | §7.3 (was line 1789, now 1799): `` `deriveRoundWindow` (`orchestrate-dev.js:2151`) `` → `` (`orchestrate-dev.js:6366`) `` | Yes |
| E-02 | te-author | Same line; same re-grounding (duplicate report of E-01) | Yes |

Both errata named one defect: a stale line anchor. One edit resolves both.

## Verification against HEAD

- `grep -n 'deriveRoundWindow' pdlc/workflows/orchestrate-dev.js` → `6366:export function deriveRoundWindow(basenames, docType) {`. The new anchor is exact, not approximate.
- `orchestrate-dev.js:2151` at HEAD is `return { inside: false, reason: "out-of-envelope", matched: outside };` inside the envelope check — confirming the old anchor was stale, as both errata reported.
- Residual-anchor sweep: `2151` now appears exactly once in the TSPEC, inside the v1.10 changelog where it is quoted as *the stale value being corrected*. No live citation still points at it.

## Product-lens assessment of the delta

- **No requirement surface moved.** The supported claim in §7.3 is unchanged in substance: the transport double must derive the round index from the directory listing the same way the module does, or the parity oracle is vacuous. That claim traces to the same acceptance criteria it traced to at v11; the edit changed only where a reader is pointed to verify it.
- **No scope creep.** The diff is confined to the version row, an additive v1.10 changelog block, and one inline anchor. Nothing was added that REQ/FSPEC does not already cover, and nothing previously approved was removed, narrowed, or reinterpreted.
- **Upstream pins held.** The changelog states REQ v0.10 and FSPEC v1.7 unchanged, consistent with the v1.9 entry above it. No upstream approval is invalidated by this edit, so no upstream re-confirmation is owed.
- **Changelog discipline is correct.** v1.10 records both raisers, quotes the stale anchor, gives the corrected one, and states explicitly that the supported claim is unaffected. A future reader auditing this citation can reconstruct why it moved without reading this cross-review.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | None. The delta resolves E-01 and E-02 and breaks nothing previously approved. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The correction was made as a citation re-grounding rather than a rewrite of §7.3's argument — the right response when the finding is "the anchor moved," not "the claim is wrong." Prior approval stays meaningful.
- Quoting the stale anchor inside the changelog while correcting the live one is the behaviour that made my residual-anchor sweep cheap and unambiguous.
- Both errata were recognised as one defect and closed with one edit, rather than two edits racing on the same line.

## Recommendation

**Approved** — the erratum delta resolves both reported items and invalidates nothing previously approved. My v11 approval of TSPEC v1.9 carries forward to v1.10.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
