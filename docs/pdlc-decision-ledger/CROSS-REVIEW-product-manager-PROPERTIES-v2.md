# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-29
**Iteration:** 2

Delta re-review against `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`, over
`git diff bc06b9bba..HEAD` on the document (106 insertions, 38 deletions across eight commits
`6229b0b05`…`ae0a4a5f0`). Only changed sections were scanned for new issues; sections approved in
round 1 were not re-litigated.

## Prior findings — disposition

| v1 | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | All three misattributed AT rows now name the property that *states* the criterion. `AT-15` leads with **PROP-BND-10** ("absent in full, no fragment") and demotes `-05/-06/-11` to the guarantees the drop relies on; `AT-17` leads with **PROP-INV-04** ("states the criterion verbatim"); `AT-02` now reads `PROP-REND-03, PROP-FAIL-05`, which is byte-for-byte ORC-02's own `Decides` line (`:483`). `AT-16` was correspondingly re-pointed to `PROP-INV-01, -02, -03`, and PROP-INV-01 (`:372`) does state that row's criterion — the five named driver-side outcomes identical across the flag. The BND block header's AT-13/AT-15 claim is now discharged by an explicit twelve-way split (`01…04, 07, 12` at AT-13; `08, 09` at AT-14; `05, 06, 10, 11` at AT-15), which I checked covers each of the twelve exactly once and agrees with the AT rows as rewritten. |
| F-02 | Medium | **Resolved** | The `BR-11 / NG-4` row now discharges to **PROP-INV-06** (the source census cloning `loopEconomicsAnchorGuard.test.js`) with `-07`/`-08` as non-vacuity guards, and says in terms that "PROP-DISC-07 is a repo-hygiene count and discharges nothing here". The INV family's `Traces` line already cited `FSPEC` BR-11 and `REQ` NG-4, so the pointer and the coverage now agree. |
| F-03 | Medium | **Resolved, with a residue** | `T-00a` and `T-20` are both traced now, and I verified every one of `PLAN`'s 24 task ids appears in the document. `T-20` owns PROP-DISC-08, matching `PLAN`:121, which names `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` in its ownership rows. The residue is *how* T-00a and T-12a were split — F-01 below. |
| F-04 | Medium | **Resolved** | The pyramid is now a partition and the arithmetic holds in both directions: `10+11+9+6+12+11+5+10+11+6+10 = 101` by family, and `36 + 12 + 37 + 6 + 10 = 101` by level, with OFF and DISC given their own buckets instead of being left outside the breakdown. The document also says plainly where the old "47 / 11 / 37" reading went wrong. |
| F-05 | Low | **Resolved** | FAIL's `Traces` now cites `TSPEC` §6.1 **F-14** explicitly, with the case named ("no directory among the three globs, or a directory yielding zero records — PROP-FAIL-11"). |
| F-06 | Low | **Partly resolved** | The REC half is fixed — AT-01 now says ORC-01 decides `PROP-REC-01…08` and places `-09…11` at the cheaper levels the corpus oracle cannot reach, matching ORC-01's `Decides` line (`:435`). The REND half was not — F-03 below. |
| Q-01 | — | **Answered** | AT-14 now says PROP-FAIL-06 is on that row **deliberately**, and gives the reason: a corpus reading to zero records shares E-6's byte outcome, and PROP-FAIL-06 is the only conjunct separating it from a *failed* read behind identical bytes. PROP-OFF-06 was added as the property that states the criterion. |
| Q-02 | — | **Answered, and acted on** | ORC-04 (b) now requires the capture to be invoked with a resolved 40-hex sha and adds a `/^[0-9a-f]{40}$/` assertion on the recorded value. I confirmed the underlying mechanism: `runCaptureScript` forwards `mergeBaseRef` to `_captureFixtures`, which writes `mergeBaseSha: mergeBaseRef` verbatim (`scripts/capture-learnings-baseline.mjs:96,132`), so a symbolic ref would indeed be recorded as a ref string. |
| Q-03 | — | **Answered** | The twelve-module enumeration is now a table (§Module manifest) rather than a note inside PROP-DISC-07, with an owning `PLAN` task and batch per module. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
