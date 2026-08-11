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

This round also folds in TE F-40/41/42/43 and answers Q-18/Q-19. The bulk of the new material is
§3.3's rewritten guard and the new §7.8. I re-grounded the load-bearing claims against HEAD rather
than reading them:

- **§3.3's PHASE_DISPATCH role-field census (class 2, "28")** — measured independently over
  `orchestrate-dev.js:3337-3437`: 5 non-null `creator`, 7 `optimizer`, 7 two-member `reviewers`
  arrays = 14, 1 `verifier`, 1 `remediator` → **28 ✓**, and the cited range ends exactly at `:3437` ✓.
  Class 4's eleven dispatch call sites I verified individually in v8; unchanged this round.
- **§3.3's "no string predicate exists" argument** — the decisive case checks out: `:6229-6231`
  carries keys `"se-review"`/`"pm-review"`/`"te-review"` and values `"software-engineer"`/
  `"product-manager"`/`"test-engineer"` on the same three lines, syntactically indistinguishable ✓.
  The `meta.name` counter-examples at `orchestrate-dev.js:3316` and `orchestrate-queue.js:45` are
  real ✓. The structural reframing is the right repair, and it is argued from measurement.
- **§7.8's upstream anchors** — every one lands: `FSPEC:299` is the rung 4a ladder row ✓; `:406` is
  EC-START-10 ✓; `:407` is EC-START-11, and its "the next candidate decides, and rung 4a refuses only
  if none runs" is faithfully rendered as "rung 4a **passes**" in the branch table ✓; `:918-921` is
  BR-GUARD-6's candidate set `python3, python, py` plus "never widens or narrows that set
  independently" ✓; `:922-924` is "by **running** a candidate, not by finding it on `PATH`" ✓;
  `:967` is AT-ENG-11a, and it carries **both** branches, which is why §7.8 owing two tests is right ✓.
  `REQ:284` is C-11 ✓.
- **§7.8's seam argument** — `_runCommand` is supplied to the workflow modules from `run.mjs:88` and
  appears nowhere in `lib/startup.mjs` ✓, so "not on the startup path and cannot be reached from
  `lib/startup.mjs`" is true, and declaring `probeGuardInterpreter({runProbe})` is not a redundant
  seam. `spawnSync(candidate, ["-c", "import sys"])` matches the shipped script's probe verbatim
  (`guard-harvest-before-delete.sh:16`) ✓ — the command is right; only its line anchor is not (F-01).
- **§6.4's rung disambiguation** — "runs with the ladder's billing-posture rung (5)" checks out:
  `FSPEC:301` is rung 5 = **billing posture** ✓. Separating EC-GUARD-4 from rung 4a in §6.4, §8.3 and
  §4.3 closes the one place a reader could have conflated two different refusals.
- **§7.5's sixth conjunct and §8.3's count** — §8.3's `_assert-suite-wide.mjs` row now says "six
  suite-wide assertions (four set-equality properties + the pre-phase predicate, + §7.5's
  corpus-scoping conjunct)" = 4+1+1 = **6 ✓**, internally consistent with §7.5's text. The conjunct
  itself is set-equality, not containment, and it fails in both directions (unnamed sixth
  configuration red; corpus configuration that recorded nothing red) — which is what Q-18 asked for.
- **§7.8's "nothing dispatched" oracle** — asserted positively (`accumulator.length === 0` on a run
  that reached the ladder) and paired with a companion control asserting a dispatching run records a
  non-zero count. That is the absence-only oracle rule applied without being asked ✓.
- **§6.5's M-ENG-09 clause (Q-19)** — presence **and** consistency, with all three cases spelled out
  (`yes` + hook shipped green; `no` + hook shipped red; `no` after tightening green). No longer green
  on a negative measurement the code has not answered ✓.

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
