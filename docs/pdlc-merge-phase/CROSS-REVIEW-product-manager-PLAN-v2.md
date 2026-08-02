# Cross-Review: product-manager — PLAN (round 2)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-merge-phase/PLAN-pdlc-merge-phase.md` (v1.1, commit `21e2b6e`)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Delta re-review of PLAN v1.1 against my round-1 cross-review only — disposition of the one blocking finding and the five advisories, plus a check that the revision broke nothing (task count, dependency graph, wave derivation, file-ownership manifest, scope). Batch mechanics, test design and code structure remain the SE/TE lenses.

## Disposition

| ID | Round-1 severity | Disposition | Evidence in v1.1 |
|----|------------------|-------------|------------------|
| 1 | **blocking** | **Resolved** | Both orphaned acceptance tests now have an owning task, and — better than the fix I proposed — each carries its oracle rather than just its name. **B2** owns **AT-M2a** with all four conjuncts spelled out in the row: the `awaiting-merge` row becoming `done` against an already-merged PR, the Evidence cell taking `{shortSha} #{n}` when `O1.mergeCommit.oid` is present and `merged #{n}` when it is not, `mergeMethod: unknown`, and the §9.4 note **not** emitted. **B3** owns **AT-M5** with AC-6.3's end-to-end pair (dependent selected on a `merged` report, *not* selected when the row is left `awaiting-merge`) and the drift-gate precondition stated correctly as a drift-state record carrying `checkEnabled: false` and empty `writeFailures` — "never the config file", which is the distinction TSPEC §13.2 drew and the one an implementer would otherwise get wrong. §2's deviation argument is now complete: every task row names the ATs it must red first, with no exception. |
| 2 | advisory | **Resolved, and resolved honestly** | K-1's owner column becomes "A6; local reading by V1, two-runner reading in Phase DOD/PUB", and §10 step 5 states plainly that the two-runner measurement "is *not* V1's to take — V1 runs before the PR exists, so there is no CI run to read". The plain-`rebase` fallback is **pre-approved, no re-review**, with the reason restated (it still fast-forwards and still drops already-applied patches). §11's checkbox tracks both halves. This is resolution (b) of the two I offered, and it is the right one: it avoids adding a fifth file to a manifest §1 fixes at four, and it puts the measurement where a CI run actually exists. DC-02 is still satisfied — the fact is measured, just later and by a named reader. |
| 3 | advisory (accepted) | **Unchanged, as intended** | Both declared deviations stand as reviewed. §2's rule-4 wording is refined for a TE finding — "every task that *consumes* a double or golden depends on F1", with R1 named as the deliberate exception because its tests extend the existing `haltAndQueue` / `runtimeBundle` / `seams.js` harnesses rather than F1's. That narrows a universal claim to a true one without weakening the `[Fake first]` obligation, and F1 still precedes every consumer, so the goldens are still captured before B2 changes `updateQueueStatus`. |
| 4 | advisory | **Resolved** | §7 gains an explicit "Declared divergence from TSPEC §13.2's test-file list" paragraph naming `mergePostMerge.test.js` as the ninth file, explaining that rule 2 forces the split (A6's helper-level coverage cannot share `mergePhase.test.js` with A7 in adjacent waves), and asserting that "no assertion is dropped, and every §13.2 bullet keeps a home" — including `evidenceCellFor`'s move from where §14 traces it. The divergence is now reviewed rather than discovered, which is all I asked. |
| 5 | advisory | **Resolved, with the right division of labour** | §11 gains a **Verifier** line: V1 records each box (new §10 step 6, which names the four boxes not implied by steps 1–5 — the 25-row count, the seven ATs, the `_recordHalt` absence, NFR-4), and **`dod-verify` in Phase DOD is the judging gate**, writing `CODE_REVIEW-pdlc-merge-phase-v{N}.md`. The sentence "V1 is not a substitute for it" is the part that matters: it keeps a self-recorded checklist from being mistaken for independent verification. |
| 6 | advisory (record) | **Still holds** | I re-walked the delta for regressions and found none. The table still parses to **17 tasks**, and the dependency graph is edge-for-edge identical to v1.0 (`F1,R1` → `A1,B1` → `A2,B2` → `A3,B3` → `A4` → `A5` → `A6,D1` → `A7` → `A8` → `A9` → `D2` → `V1`), so the twelve waves, the five-task cap and §4's no-repeated-path manifest all still hold — the revision added prose and test obligations, not structure. The two new obligations land inside existing tasks (B2, B3) whose files and batches are unchanged. No new file, no new task, no scope creep: `.github/workflows/` was correctly *not* added, and every change traces to a round-1 finding or a TE finding. |

## Recommendation

**Approved**

The blocking finding is closed at the level I wanted — owning tasks *and* stated oracles, so the ATs can red first rather than merely being listed — and all five advisories are addressed without disturbing the decomposition. Nothing in the delta is outside approved scope.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 0}
