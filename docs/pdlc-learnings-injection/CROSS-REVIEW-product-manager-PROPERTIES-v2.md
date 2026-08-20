# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 2

## Verification

Delta scope: `git diff e2ccaa8..HEAD` on the document — 326 changed lines over ten commits
(`ffb05bd3` … `f10dbd43`). Only the changed sections were re-read. Every measured claim the delta
introduces was re-measured against the repository at HEAD on `feat-pdlc-learnings-injection`, not
read off a document.

| Claim the delta introduces | Re-measured at HEAD |
|---|---|
| §F.3: FSPEC BR-6's five names are `Cross-Feature Patterns`, `Non-Convergences`, `Rejected Proposals (with rationale)`, `Process Learnings`, `Open Items for Consolidation`, plus never-injected `Approval Record` | Verbatim match against FSPEC §BR-6's priority table (`FSPEC-pdlc-learnings-injection.md`, "BR-6 — What is injected from a document") — all six names and the `**never**` marker |
| §F.3 / PROP-BOUND-08: all 9 corpus documents carry the five headings in the `## N. Title` form, **9 of 9** for each; **0 of 9** carry a bare `Rejected Proposals` or bare `Open Items` | Exact-line `grep -qxF` over the 9 paths `LS_FILES_ARGV`'s two globs return: `## 1. Non-Convergences` 9, `## 2. Cross-Feature Patterns` 9, `## 3. Rejected Proposals (with rationale)` 9, `## 4. Process Learnings` 9, `## 5. Open Items for Consolidation` 9, `## 6. Approval Record` 7. The v1 measurement is now correct in both directions |
| PROP-DISPATCH-08: `dispatchAndVerify` has exactly two call sites — `reviewLoop`'s `wrapped` closure and `main()`'s `wrappedDispatch` | `grep -n "dispatchAndVerify("` returns three hits in `orchestrate-dev.js`: the definition, plus the `const wrapped = (…) => dispatchAndVerify({` closure inside `export async function reviewLoop({`, and `const episode = await dispatchAndVerify({` inside `async function wrappedDispatch({…})`. Exactly two call sites, both as named |
| PROP-DISPATCH-08: the wave path calls `agentFn("se-implement", waveImplementPrompt(task, featureName), …)` directly, and `PHASE_DISPATCH`'s comment names the four families sitting outside | Both hold: the direct `agentFn("se-implement", waveImplementPrompt(task, featureName)` call exists, and the comment above `PHASE_DISPATCH`'s constants reads *"four dispatches sit outside it — the ship-pr rebase/PR calls, the wave-mode se-implement and se-author calls, the DOD verify/remediate pair and the harvest distil call"* — the four families the property excludes, named by the module itself |
| §O.7: the per-document bound binds **9 of 9** locally, documents running 19,340–50,695 bytes of source against a 6,000-byte `maxBytesPerDocument` | `wc -c` over the 9 corpus paths returns exactly 19,340 … 50,695. Stronger than stated: extracting only the five priority sections leaves 13,196 … 41,180 bytes per document, so the bound binds 9 of 9 on **material** too, not only on source. The upper figure matches FSPEC BR-5's own "max 41,180" |
| §Fixtures: `BYTES-BINDING` = 8 documents × 7,000 injectable bytes under §4.1's declared values, expected split 3 contributing / 5 `RSN-BYTES` / 0 `RSN-COUNT` | REQ §4.1 declares `maxDocuments` 5, `maxBytesPerDocument` 6,000, `maxTotalBytes` 20,000. Each document bounds to 6,000; 3 × 6,000 = 18,000 ≤ 20,000 and a fourth would reach 24,000 — the split is arithmetically forced, and 3 < `maxDocuments` is exactly PROP-BOUND-02's claim |
| §C.4: 69 properties; fourteen new test files over fourteen PLAN manifest rows | 69 distinct `PROP-` bullets in `## Properties`, no duplicate id, matching §Overview and §C.4. PLAN §File-ownership manifest's arithmetic paragraph states "fourteen test rows over fourteen files"; the twelve suites plus `helpers/learningsFixtures.js` and `fixtures/learnings-baseline/` enumerated in §C.4 are those fourteen, and `ls pdlc/workflows/__tests__ \| grep -i learnings` is still empty at HEAD |
| §Overview pyramid: 16 / 3 / 16 = 35, `learningsRecord.test.js` straddling | TSPEC §T.5's table sums 2 + 9 + 3 + 3 + 6 + 12 = 35 with AT-20/AT-22 marked L3 — so L3 = 12 + 2 + 2 = 16, L2 = 3, L1 = 9 + 3 + 4 = 16. The document's figure and TSPEC's now agree |
| §Properties: `F-O-8` removed from PROP-BOUND-01's trace | Correct removal, not a coverage loss: `F-O-8` appears **nowhere** in FSPEC, TSPEC or PLAN — the v1 trace cited an id that does not exist upstream |

Mechanical checks over the whole document, since the delta rewrote the coverage matrix: all 25 REQ
acceptance criteria still carry ≥1 property after the five padded rows were struck; every property
in `## Properties` appears in §C.3's red/green ownership table (allowing for its range notation), so
the "Properties with **no** owning task | 0" row still holds at 69; and the new bidirectionality rule
§C.2 declares holds on 22 of its 25 rows (the three exceptions are F-01 below).

## Disposition of v1 findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
