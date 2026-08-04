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

Four, all in text added by this revision. Nothing in the unchanged sections is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The new PROP-GATE carve-out excludes A1 but not A3, and A3 is the same case.** §6.5's added paragraph asserts conjunct 1's `escalated` / `post-action-verification-failed` disposition "at the four seams that can apply an action (**A2…A5**)", carving out only A1 "whose `permittedActions` is `[]` and which therefore never reaches step 4". **A3's `permittedActions` is also `[]`.** TSPEC §4.3 says "(A1, A3) supplies `permittedActions: []` and an `apply` never reached" (`TSPEC:423`), the §5.5 per-seam gate table gives A3's `verifyGate` implementation as literally "unreachable (`permittedActions: []`)" beside A1's, PLAN A-23 specifies "A3's `permittedActions: []` with throwing `apply`/`revert` stubs" (`PLAN:274`), and A3's own properties confirm it: PROP-A3-05's terminal behaviour is a pipeline halt with the classification attached, not an applied action. So PROP-GATE-03 as now written requires stubbing a gate A3 never reaches and observing a disposition A3 can never produce — it fails against a correct build, and it fails in the RED batch (A-07) that authors it, discovered at A-23. The document already contains the fix one sentence away: put A3 in the same carve-out as A1 ("`resolved` unreachable on every path, each path terminating in `escalated` or `no-action` with its own O-1 triple"), and restate conjunct 1 as applying to the **three** seams that can apply an action (A2, A4, A5). | §6.5, PROP-GATE-01…05 |
| F-02 | Medium | Local | **PROP-DIS-06's "exactly three" has no matcher, and every plausible matcher gives a number other than three.** The rewritten property says "A source-text scan for **a read of** `advisory.enabled` must find exactly three sites" over `orchestrate-dev.js` + `orchestrate-queue.js`. But the three sites it enumerates do not contain that token: TSPEC §11.1 states the driver's early return as `config.enabled === false` (`TSPEC:1240-1241`), i.e. a read off the *parsed* config, and the notice-suppression and distil-step guards are the same shape. The literal token `advisory.enabled` appears only where the **raw** JSON is parsed — one site, not three. Widen the matcher to `/\.enabled\b/` and the count is four (parser + the three), not three. (There is no ambiguity from pre-existing code: `grep -n '\.enabled\b'` over both modules at HEAD returns **zero** hits, so the count is entirely determined by this feature's own sites.) The property is only as good as its matcher — state the regex as a transcribed literal and say explicitly whether the parser's raw read is inside or outside the counted set. The upstream half (TSPEC §11.1's own "grep for `advisory.enabled` returning exactly three sites") is routed as an erratum, not folded into this verdict. | §10.1 PROP-DIS-06 |
| F-03 | Medium | Cross-Feature | **The two new in-file falsification controls collide with the self-inclusive scans they falsify.** PROP-INFRA-01's oracle "reads **every** `pdlc/workflows/__tests__/advisory*.test.js`, **its own file included**" and asserts no `SeamOps`-shaped object literal, no doubles-shaped `jest.fn()` binding, and no import of the six helper symbols from anywhere but `advisoryDoubles.js` — and then proves falsifiability by running the same matchers "against a fixture string containing each of the three shapes". PROP-REG-08 gained the identical construction: a self-inclusive scan for `/\b(describe|it|test)\s*\.\s*skip\b/` plus an in-file fixture "containing each of the three shapes". Both are *source-text* scans, so a fixture literal in the same file is indistinguishable from a violation: the falsification control makes the property it falsifies fail. This is a mechanical contradiction between two clauses of one property, not a style point, and it lands in `advisoryPreflight.test.js` (A-01) — the first authored file, un-skipped from batch 1. Name the resolution: either the fixture set lives outside the scanned glob (e.g. `__tests__/fixtures/`) or the forbidden literals are assembled at runtime so no forbidden shape appears in the scanned source. Tagged Cross-Feature because it is the general hazard of any self-inclusive source-scan oracle, and the repo now has two of them. | §2.1 PROP-INFRA-01, §10.3 PROP-REG-08 |
| F-04 | Low | Local | **Two small bookkeeping slips in the new text.** (a) §12.4 says `T-06-7` "appears **once**, in PROP-A4-09" — the id occurs twice in the document, the second occurrence being §12.4's own sentence about it, so a scan implementing the audit as described finds two and must be told which one is the declaration of absence. (b) PROP-BUD-03's Home cell now reads "`advisoryVerdict.test.js` (arithmetic) + `A-22 — driver lifecycle` (the accumulated value)" — a *block* name in a column that elsewhere in §5.2 carries file names, and neither §12.3's file inventory (which maps PROP-BUD-* to `advisoryVerdict.test.js` only) nor §12.2's A-07 / A-22 rows (which list PROP-LIFE-*, PROP-PROH-*, PROP-GATE-*) mention the driver-side half. The property is still owned by A-05/A-19 in §12.2, so no task is left without an obligation, but the A-07 author has no matrix row telling them to write it. | §12.4, §5.2 PROP-BUD-03 |

## Questions

## Positive Observations

## Recommendation

## Verdict
