# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.6)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** delta re-review of the round-2 revision (`4610b312`…`cffd701b`) — round-2 disposition,
then new-issue scan over changed sections only. Lens unchanged: oracle derivability, oracle
falsifiability, enumeration completeness.

## Round-2 disposition

| v2 finding | Sev | Status | Evidence in v0.6 |
|---|---|---|---|
| F-01 AC-1.2(c) read-set contradicted its own posture | High | **Resolved** | AC-1.2(c) is now an unqualified empty read-set: the config-side opt-out is evaluated before any drift-state read and short-circuits it. Verified at HEAD — `parseDistributionCheckEnabledOptOut` (`orchestrate-queue.js:2068`) is the ternary condition at `:1072`, and `readDriftStateSafely(readFileFn, DRIFT_STATE_PATH)` (`:64`) sits only in the else-branch at `:1074`, so it is never evaluated under the posture. `.claude/pdlc.config.json` is read instead (`readAdvisoryConfigSafely`, `:1071`), which is outside `.claude/workflows/`. The AC is now falsifiable by an empty-set assertion rather than a one-exception carve-out |
| F-02 AC-3.3 map incomplete and both-directions unsatisfiable | High | **Resolved** | The `MODEL_ADVISORY` = `fable` row is present and cited correctly (`orchestrate-dev.js:1652`, dispatched `:1851`); the fallback row is cited at `:1653`, dispatched `:1861`; `MODEL_QUEUE` is scoped to the queue run (`orchestrate-queue.js:70`). Set-equality is now asserted over a named dispatch corpus rather than over one run, so both directions can hold on a conforming engine. Residual wording gap filed as F-02 below, not a re-open |
| F-03 AC-2.1 mapping neither total nor disjoint | High | **Resolved** | The table is an explicit ordered first-match list; row 4 (`auth.session-key-ignored`) supplies the state AC-2.4 exercises, previously unmatched; row 6 makes the list total. Row 2's now-redundant "no OAuth token" clause is correctly dropped, since row 1 precedes it. Residual fixture ambiguity filed as F-01 below |
| F-04 AC-1.2 cited `:1947` for the config opt-out | Medium | **Resolved** | The citation now names `:2068`/`:1071-1072`/`:1074`, and `:1947` is correctly re-described as `mapDriftState`'s row 2 (`record.checkEnabled === false`, a field *of the drift-state record*). Verified at HEAD |
| F-05 §1.2a filed AC-4.5 green while its per-dispatch clause is red | Medium | **Resolved** | AC-4.5 is split across the green and red rows; the red row names the mechanism honestly — `adapter.mjs:320` keeps one `lastApiKeySource`, surfaced as one scalar (`report.mjs:51`, `bin/pdlc.mjs:227`). All three citations verified at HEAD |
| F-06 AC-1.1 set-equality degraded to containment | Medium | **Resolved** | Rule (i) is set-equality over the run-independent core (`REQ` correctly excluded as pre-existing); rule (ii) states the two run-dependent members as *rules with a named observable source* (the run report's Phase-T decision; the run's own recorded round windows), and the closure sentence forbids anything outside (i)/(ii). AC-6.2 inherits the fix by reference ("the same structural set as AC-1.1"), so the sibling defect closes with it |
| F-07 unsupported `smoke.test.js:309` citation | Low | **Resolved** | Only `:294` remains, and its parenthetical ("halt leaves history intact, on `feat-{f}`") matches the test title at HEAD |

Round-2 questions: Q-02 is answered in AC-4.2's new closing clause (per-run `timeout` cap, with the
disambiguating `retryable, timeout, timeout` sequence stated); Q-01 and Q-03 are unanswered and
re-asked below unchanged. Relocated facts were spot-checked in
`docs/_constraints/pdlc-engine-baseline.md`: M-ENG-01…05 and A-ENG-01 all exist, carry the
citations the REQ dropped, and the file is committed on the branch (`03b23015`), so the REQ's
cite-by-id substitution loses no evidence.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AC-2.4's *Given* does not determine which AC-2.1 row fires, so its transcribed banner literal is fixture-dependent.** AC-2.4 now asserts the banner carries `auth.session-key-ignored` (row 4). But its *Given* says only "an operator with subscription auth and `ANTHROPIC_API_KEY` also present". Under the new first-match ordering, if that subscription credential is `CLAUDE_CODE_OAUTH_TOKEN`, **row 1** fires and the expected banner is `auth.oauth-token`; only a logged-in-settings credential reaches row 4. The parenthetical "(AC-2.1 row 4)" pins the intent, but the *Given* — the part a fixture is built from — does not. One clause fixes it: name the credential form in the *Given* ("logged-in Claude Code settings state, no `CLAUDE_CODE_OAUTH_TOKEN`"), or state both variants and their two expected ids | AC-2.4, AC-2.1 |
| F-02 | Medium | Local | **AC-3.3's corpus is prose-declared as three runs but the table needs four configurations.** The prose fixes the corpus as "the union of three dry runs" (i, ii, iii). The `MODEL_ADVISORY_FALLBACK` row's *Corpus run* cell reads "iii, with `fable` resolution forced to fail" — a different configuration of run iii, since the fallback is reached only from `isModelResolutionError` (`orchestrate-dev.js:1861`), which does not occur in a plain advisory-enabled run. As written, "three runs" and the table disagree about the corpus the set-equality is asserted over, and the direction "every map row is exercised" fails on a conforming engine if a test author takes the prose literally. Say four runs (iii-a plain, iii-b with `fable` resolution forced to fail), which is what the cell already describes | AC-3.3 |
| F-03 | Medium | Local | **AC-3.3 does not state that a `--dry-run` reaches the advisory and verdict-recovery dispatch sites.** The corpus is defined in terms of dry runs, but two rows sit on paths a dry run may never enter: the advisory rung is dispatched from Phase DOD/PUB assist seams, and `haiku` verdict-recovery (`:7463`, `:9968`) fires only after a malformed verdict. If dry-run mode records intended models without traversing those branches, the "every map row is exercised" direction is unsatisfiable for reasons no engine change fixes. State what a dry run records (planned dispatch descriptors vs executed dispatches) and, if descriptors, drop "dry" from the corpus definition or name the fixtures that force the two conditional branches | AC-3.3 |
| F-04 | Low | Local | **Finding-id back-references now collide across rounds and will mislead the TSPEC/PROPERTIES author.** AC-4.1's set-equality clause is tagged "(TE F-05)", which was v1's taxonomy finding; v2's F-05 is the AC-4.5 split now recorded in §1.2a with the same tag. Same shape for "(TE F-02)" in AC-2.4 (v1's F-02 vs v2's F-02) and "(TE F-06)" in AC-1.1 vs AC-3.5. A downstream reader resolving these tags lands on the wrong finding. Qualify by round (`TE v1 F-05`) on the next edit of each line | AC-4.1, AC-2.4, AC-1.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(re-asked from round 2, unanswered — AC-3.5 unchanged)* AC-3.5 asserts set-equality between "the set of skill identifiers the modules can dispatch" and the prompt files present in the plugin. Where does the left side come from at test time? At HEAD it is `startup.mjs:20`'s frozen `EXPECTED_SKILLS` list, consumed as containment at `:102` — if the engine keeps a hardcoded list, "equality" only proves that list matches disk, never that it matches what the modules dispatch. Is a third source intended (a static scan of the modules' dispatch sites)? |
| Q-02 | *(re-asked from round 2, unanswered)* O-2 names hook/settings provenance as the largest open safety gap, while AC-5.1 requires guard refusal on **either** transport. If the SDK path turns out to accept no PreToolUse-equivalent, does AC-5.1 become a blocking gate on the primary transport, or does the fallback become mandatory for runs that can delete artifacts? |
| Q-03 | AC-4.2's per-run `timeout` cap is now stated, and the table's arithmetic re-derives correctly at `retryAttempts: 3` (3 retries → 4 attempts max; `timeout, retryable, retryable` = 3 attempts with one retry owed). Is the sixth row — the only non-terminal row in the table — meant to be a test case at all? A row whose "terminal classification" cell says *non-terminal* has no terminal oracle; it may read better as a note under the table than as a row in it. |

## Positive Observations

- The AC-1.2(c) rewrite is the strongest change in this round. It converts a permitted-exception
  oracle ("empty except for one read") into an empty-set oracle, and it does so by *finding the
  real mechanism* — the ternary short-circuit at `:1071-1074` — rather than by weakening the
  claim. The parenthetical that retires the old `:1947` citation, explaining what that line
  actually is, is exactly the kind of correction that stops a wrong citation from being
  re-introduced later.
- AC-2.1's shift from "total mapping" to an explicitly **ordered first-match list** with a
  totality row is the right repair shape. It makes the table a decision procedure a test can
  execute, and row 4 documents a state the previous version silently had no answer for.
- AC-3.3's *Corpus run* column is a good idea worth copying: it makes an enumeration oracle carry
  its own execution plan, so the reviewer can check exercisability without reconstructing which
  run reaches which branch.
- AC-4.2's arithmetic now re-derives cleanly at the declared default, and the closing clause
  answers the per-run-vs-per-position ambiguity with the exact sequence that distinguishes them.
- Relocating measured facts to `docs/_constraints/pdlc-engine-baseline.md` without losing a single
  citation, and citing them by id, keeps the REQ readable while leaving the evidence checkable.

## Recommendation

**Approved with minor changes**

All three round-2 Highs are resolved at the mechanism level, not by softening the claims, and each
repair verifies against HEAD. Nothing previously approved was broken: the §1.2a red/green table,
the §4.1 threshold discipline, the transport-neutral restatement and the AC-4.1/4.3/6.4 oracles all
survive the edit intact, and the fact relocation is lossless and committed. The four remaining
findings are wording-level: two ACs (AC-2.4, AC-3.3) need their fixtures pinned so the transcribed
literals are derivable from the *Given* alone, and the cross-round finding tags need qualifying.
None blocks TSPEC/PROPERTIES authoring — each is a one- or two-clause edit that can ride along with
the next revision.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}
