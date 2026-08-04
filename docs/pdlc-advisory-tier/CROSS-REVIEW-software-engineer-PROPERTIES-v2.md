# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 2
**Scope:** Local (unless a finding row says otherwise)
**Delta base:** `3ef6e74` (the commit my v1 review was written against) → `91439f6`
(`git diff 3ef6e74 HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`: 236 insertions,
65 deletions). Only the changed sections were re-read.

## Disposition of v1 findings

All thirteen are resolved. Each was re-verified against the revised text and, where it made a claim
about the tree, against the tree.

| v1 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | High | **Resolved** | §1 now states the budget as a *shape* (Unit ≥ 70%, Integration ≤ 30%, E2E = 0) and the measured count against it. I recounted mechanically: 183 property ids appear as leading table cells, 12 more are prose-declared (`PROP-INFRA-01…04`, `PROP-XA-08`, `PROP-GATE-01…06`, `PROP-REG-08`) = **195**. Level cells over the 183 table rows tally 137 Unit / 39 Integration / 7 both; the eight prose `*Category: … Level: …*` blocks add 11 Unit (`PROP-GATE-01…05` being five) and 1 Integration (`PROP-INFRA-03`) ⇒ **148 / 40 / 7 / 0 E2E**, exactly as §1 and §12.3 now state. The 47-property Integration union and its A-10/A-11/A-12 cost signal are named. |
| F-02 | High | **Resolved** | PROP-CFG-05 now counts `readAdvisoryConfigSafely` / the `_readAdvisoryConfig` seam and explicitly forbids the `_readFile`-scoped-to-path spy, with the two pre-existing reads cited (`orchestrate-dev.js:8040`, `:1373`, constant `:43`). |
| F-03 | High | **Resolved** | PROP-DIS-06 now names its file set (`orchestrate-dev.js` + `orchestrate-queue.js`, never `dist/*.bundle.js` — this also closes v1 Q-02) and reconciles with PROP-SUM-06 by deriving the report field from the advisory `_state` rather than a fourth `enabled` read. PROP-SUM-06 carries the matching positive assertion. (One residual in the new text — F-02 below.) |
| F-04 | High | **Resolved** | PROP-REG-08 clause (b) is dropped; §10.3 now carries a paragraph citing `DECISIONS-test-oracle-mechanics.md` DEC-ORACLE-01 by name and re-homes the run-wide obligation to PLAN §9.1's own check. Clause (a) stands alone with an in-file falsification control. |
| F-05 | Medium | **Resolved** | PROP-RUNG-09 covers T-01-2 in `advisoryRung.test.js` (the file PLAN §8.1 assigns), stated as two positive conjuncts. §12.4 adds the fourth audit direction. I re-ran the set comparison: all 81 FSPEC §18.1 cases are cited (79 `T-nn-n` plus `T-04-3b` and `T-08-4b`), and the only id cited here that FSPEC does not declare is the sanctioned `T-06-7` negation. |
| F-06 | Medium | **Resolved** | PROP-BUD-03 is restated against the argument the driver hands `budgetExceeded`, with the A5 `> 0` positive control; the `SeamOps` gap is routed as §13.1 item 4. `TSPEC:474` verified — the typedef at §4.3 does declare nine members and no `waitMs`. |
| F-07 | Medium | **Resolved** | PROP-LIFE-02 now transcribes an eight-element literal asserted by `toEqual`, and says in as many words that TSPEC §4.4's `entry` row is not a member because PROP-LIFE-01 owns it. |
| F-08 | Medium | **Resolved** | PROP-REC-02 and PROP-ESC-01 are set-equality plus a separate order assertion; §2.4's new paragraph states the rule once, and P-7 was updated to match P-6. |
| F-09 | Medium | **Resolved** | PROP-INFRA-01 has a three-clause source-text oracle, homed in `advisoryPreflight.test.js` (A-01), with a falsification control. Its clause-3 symbol list matches §2.1's declared exports exactly. (One residual — F-03 below.) |
| F-10 | Low | **Resolved** | §2.4 reads "Four closed sets and **two record grammars**". |
| F-11 | Low | **Resolved** | §13.1 now reads "Four items … **Three** are emitted as `ERRATUM:` lines", item 2 being the closed one. Three emitted (items 1, 3, 4) matches. |
| F-12 | Low | **Resolved** | §2.1 names `fakeGhRun` (`mergeDoubles.js:75`) and `fakeGit` (`:189`) — both verified at those exact lines — and states that no `_git` / `_ghRun` symbol is exported there. The "sixteen suites" restatement for `driftGenerators.js` also checks out (17 files under `__tests__/` reference it, one being the helper itself). |
| F-13 | Low | **Resolved** | §12.3 labels `advisoryDisabled.test.js` "Unit + Integration"; `advisoryRung.test.js` was correctly upgraded to the same in the process. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
