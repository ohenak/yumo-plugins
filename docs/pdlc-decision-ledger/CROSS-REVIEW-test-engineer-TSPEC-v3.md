# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.3, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 3

Delta re-review. Diff taken from `a874d5948` (the tree v2 read) to HEAD: +157/−25 lines across seven
commits (`7493418b1`, `28b806205`, `9a08be0cb`, `047ba901f`, `c59eb73a5`, `1081b6f2f`, `64cb78029`).
v2 left one High (F-01, §7.4 clause (b)) and one Medium (F-02, §3.6's unpinned corpus promise).
**Both are resolved, and both fixes are the right shape.** I re-read only the changed sections and
re-executed every number the revision touched against the repository.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Process | §7.5 still carries the pre-correction sentence "The model **is built from the production line renderer** applied per record" (line 1063) immediately above the paragraph that forbids exactly that ("The model does not reuse the renderer, or the no-truncation conjunct would be an echo", line 1067). Two incompatible instructions for one oracle, and the wrong one is stated first. This is the **same failure mode as v2's F-01**: the round-1 fix added the correction (`4352d6d8c`) without deleting the sentence it superseded (`76f28dde4`) | §7.5:1063–1065 vs §7.5:1067–1076 |
| F-02 | Medium | Local | §7.3's new shipped-default assertion (D-10) is built over **the project-level-only block**, where nothing is omitted at all (6,305 + ≤1,200 = ≤7,505 < 8,000; 41 < `maxEntries` 70). Its third conjunct — `omitted[]` contains no `origin === "project"` id — is therefore **vacuously true for every possible drop order**, contradicting the stated purpose "what fails if a future change re-orders the drop loop so a project-level line goes first". The byte conjunct is sound; the order conjunct is not | §7.3:910–919, §3.6:420–428 |
| F-03 | Low | Local | §9.2's "The largest feature directory (`pdlc-headless-engine`, `M-6b`'s 63-line floor) would need **12,059** bytes to render whole" attributes to one feature directory a number that is project-level + that directory (41 + 22 = 63 lines; 6,305 + 4,553 + 1 = 10,859, + 1,200 framing = 12,059 — all four verified). The directory alone is 22 lines / 4,553 bytes | §9.2:1255–1258 |
| F-04 | Low | Local | §3.6 and ERR-2 both say ~495 bytes is "roughly **two** feature-level lines", now under a re-measured 152–261 range whose means are 183/191/206 — 495/183 ≈ 2.7. "Two" was the right word under the retired 137–160 figure; under the corrected one it reads as three at the mean, two only at the largest observed line | §3.6:411, §9.2:1253–1256 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7.3's census now excludes the `main()` wiring as a run between two new literal sentinel comments (`// === DECISION LEDGER WIRING START/END ===`). §2.3 depends on this feature's symbols landing **outside** the *learnings* sentinel region so PROP-DIS-06's `/\.enabled\b/` count stays live over them. The two regions are differently named and the learnings slicer matches its own literals, so I read this as safe — is that also your reading, and is it worth one sentence in §2.3 saying so, given a future reader may see "sentinel region" and assume the slice applies? |

