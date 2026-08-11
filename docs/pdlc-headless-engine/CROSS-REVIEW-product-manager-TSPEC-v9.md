# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.7)
**Upstream read:** `REQ-pdlc-headless-engine.md` (v0.10 — AC-3.5 `:502-512`, C-11 `:284`), `FSPEC-pdlc-headless-engine.md` (v1.6 — ladder `:293-301`, EC-START-10/11 `:406-407`, BR-GUARD-6 `:918-924`, AT-ENG-11a `:967`, BR-START-4 `:382-392`)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v8.md` (0 High, 2 Medium, 1 Low)
**Diff reviewed:** `fd3cc0d1^..HEAD` — TSPEC +236/−47 across eight commits
**Date:** 2026-08-11
**Iteration:** 9
**Scope:** delta re-review — disposition of v8's three findings, then the changed sections only

## 1. Disposition of prior findings

All three resolved, and two of the three resolved by a stronger edit than I asked for.

| Prior | Disposition |
|---|---|
| **F-01 (Medium)** — §9.2's three CI-related open questions still reasoned from a two-platform matrix §7.6 had already corrected | **Resolved** (`150f3244`). O-ENG-T1 now says "a fifth job on the existing matrix, which is **one platform** at HEAD — `os: [ubuntu-latest]` (`pr-tests.yml:40`)" (`:2369-2375`), verified against HEAD: `pr-tests.yml:40` is `os: [ubuntu-latest]`, single value ✓. O-ENG-T4's "two values, matching §7.6's matrix" gloss is gone, replaced by "takes a distinct value per host the suite runs on — and deliberately does **not** track §7.6's matrix, which is one platform" (`:2384-2385`) — which is the more accurate statement, not just the non-false one. O-ENG-T5 re-based on "the one platform §7.6's matrix runs (`ubuntu-latest`) and on the maintainer's macOS" (`:2394-2395`). The premise now matches §7.6 in all three places. |
| **F-02 (Medium)** — §5.3's engine-fatal reconciliation stated in the present tense against a `catch` that does not exist at HEAD | **Resolved in four places, not the two I named** (`426556e6`). §5.3 now reads "the engine **gains** a top-level catch … **this is designed behaviour, not observed: at HEAD `pdlc/engine/lib/run.mjs` contains no `catch` clause at all**, only the `try` at `:159`" (`:1333-1340`); §7.4 row 4 carries the same marking (`:1912-1917`); §8.1's AC-4.4 row now reads "(the catch this feature adds there, §8.3)" (`:2198`); §8.3's `run.mjs` row leads with it (`:2228`). Re-verified at HEAD: `grep -n catch pdlc/engine/lib/run.mjs` returns nothing; the only `try` is `:159`; `runDev` `:187` and `runQueue` `:228` are declarations ✓. The document's own designed-vs-observed discipline is now applied to its own load-bearing claim. |
| **F-03 (Low)** — §5.3 anchored a producer claim on the consumer's line | **Resolved.** §5.3 now reads "**returned** … (constructed and returned at `orchestrate-dev.js:1847` and `:1857`; the caller reads it at `:3143-3149`)" (`:1341-1343`), which is both halves rather than the swap I suggested, and it matches §7.4's parallel bullet. |

## 2. What else changed, and what I checked

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
