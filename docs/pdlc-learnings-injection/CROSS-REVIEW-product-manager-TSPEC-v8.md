# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 8

## Scope of this round

**Delta re-review, frozen round.** The TSPEC did **not** move since the round I approved at
iteration 7: its content hash is `sha256:eff5a19b…`, byte-identical to the `APPROVAL-HASH` recorded
in `CROSS-REVIEW-product-manager-TSPEC-v7.md`, and `git log ccc739d1..HEAD --
TSPEC-pdlc-learnings-injection.md` returns no commits. There is therefore no revision-introduced
defect to find in this document — freeze criterion (i) is empty by construction.

What moved is upstream and the repository:

- **FSPEC** — `sha256:256537d8…` (recorded at v7) → `sha256:764414d0…` at HEAD, via `523e2df9`
  ("v0.9 follow-through — AC-6.2 row heading, revision-history order"). The delta is +7/−4 lines:
  the v0.9 revision-history entry is moved below the v0.8 erratum entry and re-worded, and the
  AC-6.2 traceability row's target is corrected from `§Acceptance-test preamble` to
  `§Acceptance Tests preamble`. No rule, edge case, AT text or AC mapping changed.
- **REQ** — `sha256:ff605dd3…`, byte-identical to v7. Unmoved.
- **Production code** — `pdlc/workflows/orchestrate-dev.js` gained +154/−13 lines since
  `ccc739d1` (the erratum-protocol / finding-grammar work, unrelated to this feature), which
  shifts line positions in the file this TSPEC anchors into.

So this round asks two questions only: does the FSPEC delta falsify anything load-bearing in the
TSPEC, and does the moved repository state falsify any of the TSPEC's claims about current
behaviour? I checked both against HEAD, by content rather than by position.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (v7) `OQ.2` and `ERR-4` point at §I.3 for the gate that lives in §I.2 | Low | **Open, unchanged** | The document did not move, so the pointer did not move. `TSPEC:1237` still reads "§I.3's gate", `TSPEC:1277` still reads "§I.3 and §D.2 are written on the answer", while the corrected gate paragraph is at `TSPEC:441-448` inside §I.2 Configuration (`TSPEC:417`) and §I.3 (`TSPEC:486`) is the pure selection core with no gate in it. Non-gating, carried forward. |
| F-02 (v7) §A.5's closing sentence cites §T.2 for the per-dispatch loci; §T.2 is the doubles table | Low | **Open, unchanged** | `TSPEC:359-361` unchanged; §T.2 (`TSPEC:799`) is still the `fakeGit`/`fakeFs`/scripted-`_agent` table and the per-dispatch assertions still live in §T.6's `DIVERGENT-CORPUS` (`TSPEC:987-992`). Non-gating, carried forward. |
| F-03 (v7) `OQ.2`'s bare-repository note is stale against the AT-32 mapping | Low | **Open, unchanged** | `TSPEC:1241-1244` unchanged; `FSPEC:719` still maps E-21 to AT-32 and `TSPEC:952-958` still assigns it to `learningsConfig.test.js`. Non-gating, carried forward. |

None of the three was resolved, because no revision was attempted — this round was dispatched on
upstream movement, not on an author edit. All three remain Low, all three remain precisely
enough named to close in one pass whenever the document is next opened.

## Findings

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
