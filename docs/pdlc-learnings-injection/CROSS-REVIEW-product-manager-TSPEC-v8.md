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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | Inherited from v7, unchanged: `OQ.2` (`TSPEC:1237`) and `ERR-4`'s closure (`TSPEC:1277`) attribute the corrected gate to §I.3, but the gate paragraph is at `TSPEC:441-448` inside §I.2 Configuration (`TSPEC:417`); §I.3 (`TSPEC:486`) is the pure selection core and contains no gate. **Fix:** restore "§I.2" at both sites. | REQ AC-5.1a, AC-5.1b |
| F-02 | Low | Local | Inherited from v7, unchanged: §A.5's closing sentence (`TSPEC:359-361`) cites §T.2 for where the per-dispatch loci are asserted; §T.2 (`TSPEC:799`) is the doubles table and the per-dispatch assertions live in §T.6's `DIVERGENT-CORPUS` (`TSPEC:987-992`). **Fix:** cite §T.6 and §D.2. | REQ AC-3.2, AC-3.3 |
| F-03 | Low | Local | Inherited from v7, unchanged: `OQ.2`'s bare-repository note (`TSPEC:1241-1244`) is stale against the AT mapping — FSPEC maps E-21 to AT-32 (`FSPEC:719`) and §T.5 assigns AT-32 to `learningsConfig.test.js` (`TSPEC:952-958`). **Fix:** drop or re-point the note. | REQ G-1, AC-1.1, AC-5.1a |
| F-04 | Low | Process | **New this round, caused by repository movement, not by an edit.** `orchestrate-dev.js` gained +154 lines since `ccc739d1`, so the TSPEC's raw `file:line` anchors into it above roughly line 12000 have drifted by ~40–140 lines: `main`'s destructure is now `orchestrate-dev.js:12022` (TSPEC §P-1 area cites `:11982`), `_recordQueueRow`'s defaulted recorder now `:12053` (cited `:12013`), `wrapperSeams` now `:12421` (cited `:12381`), the erratum author now `:12861` and the land-proof retry now `:12955` (P-2a cites `:12821`, `:12915`), the `converge` phase creator now `:13657` (P-2a cites `:13515`), Phase CR's `docType: null` call now `:14698` (cited `:14551-14556`), and `buildFinalReport`'s conditional advisory spread now `:15309` (P-10 cites `:15167`). **Every underlying claim is still true at HEAD by content** — I re-verified each by symbol, not position (`grep -n '"authoring"'` returns exactly the four sites P-2a names; `...(advisory ? { advisory } : {})` exists once; `dispatchAndVerify` is unmoved at `:8862`; `parseAdvisoryConfig`'s malformed reading is unmoved at `:1980-1983`; `roundDocType = docType === undefined ? …` unmoved at `:7306`). Per DEC-DOC-01 a raw `file:line` anchor is a `Process`-scope Low, and drift is exactly the failure mode that decision anticipates. **Fix (whenever this document is next opened, not as a gate):** re-anchor on symbol names — `main`, `_recordQueueRow`, `wrapperSeams`, `dispatchAndVerify`, `buildFinalReport` — rather than positions. | REQ AC-1.1 (P-2a/P-3/P-10 grounding claims) |

No High findings. Nothing in the FSPEC v0.9 follow-through delta falsifies a TSPEC claim: E-21/E-22/E-23/E-34 still map to AT-32/AT-31/AT-32/AT-32 (`FSPEC:719-725`), matching the TSPEC's four-row config-state table and its two-AT ownership claim (`TSPEC:464-469`); AC-3.2→BR-9→AT-19/20/21 and AC-3.3→BR-10→AT-22 are unchanged (`FSPEC:136-137`); AT-20 and AT-22 still carry the "two completeness tests, one per locus" and "AT-18's changing-corpus run" halves (`FSPEC:852-865`) that §D.2's split BR-10 rows (`TSPEC:645-648`) and §T.5's L3 assignment (`TSPEC:943`) are written on. The one substantive FSPEC edit — `§Acceptance-test preamble` → `§Acceptance Tests preamble` on the AC-6.2 row — is a heading-name fix inside FSPEC and has no TSPEC-side referent.

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
