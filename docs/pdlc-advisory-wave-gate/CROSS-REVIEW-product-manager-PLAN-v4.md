# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.13, commit `c6b96b1b`)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review against v1.12, commit `28dd256b`)

## Delta Verification

**Scope of the round.** `git diff --stat 28dd256b..HEAD` on the PLAN is **25 insertions, 6 deletions in one
file**: the lineage row's v3 cross-review list, the v1.13 changelog row, A6-18's `advisoryWaveGateMain.test.js`
paragraph (TE v3 F-01), batch-safety rule 2 (my v3 F-01), and two DoD legs (TE v3 F-02, TE v3 F-01). No task
row, batch column, wave, dependency edge or file-ownership cell moved — verified by diffing those regions:
11 tasks, 7 waves, manifest of 11 owning rows unchanged.

| Check | Method | Result |
|---|---|---|
| My v3 `F-01` (rule 2 was containment, not set-equality) | Projected the manifest (PLAN 359–370) to distinct paths and matched each against rule 2's clauses (PLAN 405–426) | **15/15 paths enumerated**, each in exactly one clause; the closing sentence states the set-equality discipline. **Resolved** |
| Every manifest path exists on disk (or is declared new) | `ls` over all 15 | All present at HEAD (`waveExecution.test.js`, `advisoryEscalationLog.test.js`, `documentOracles.test.js`, `helpers/advisoryDoubles.js`, `.claude/pdlc.config.example.json`, `pdlc/engine/__tests__/advisory-config-example.test.js`, the eight advisory suites, `orchestrate-dev.js`) |
| TE v3 F-01's corrected fifth value — capture *succeeds* on that fixture | Read the harness `_git` double (`pdlc/workflows/__tests__/advisoryWaveGateMain.test.js:109-138`) against `captureTreeSnapshot`'s verb sequence (`pdlc/workflows/orchestrate-dev.js:12566-12615`) | Confirmed: `rev-parse HEAD` → ok (`:122`), `add -A` → ok (`:112`), `write-tree` / `commit-tree` → ok (`:123`), `update-ref` and `reset --mixed` → ok through the terminal `return { ok: true, stdout: "" }` (`:138`). No `fail(...)` arm is reachable, so the capture returns `{head, tree, snap}` and `snapshotRef` is non-`null` |
| …and the ref is wave **1** | `expect(result.haltReason).toContain("Wave 1 test gate failed")` (`advisoryWaveGateMain.test.js:368`), untouched by this task | Holds — `refs/pdlc/a6-snapshot-1` is the value TSPEC §4.5's "Value when the capture succeeded" row (`TSPEC:1458`) prescribes |
| The capture runs before the seam on an applying wave | `captureTreeSnapshot` call site at `orchestrate-dev.js:3403`, above `runAdvisorySeam`, per TSPEC §3.2 step 4 | Holds; the fixture's run dispatches A6 at least once (`advisoryWaveGateMain.test.js:369`), so the wave applies |
| The claimed zero collateral cost of the now-due overwrite notice | `grep -c notices pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` → **0**; every notice oracle is a filter over `inapplicabilityStatements(logs)` (`:182-186`, used at `:209`, `:227`, `:246-247`, `:256`, `:273`, `:284`) | Holds. `PROP-SEAM-07`/`-08`/`-09`/`-10` all exist in that file (`:201`, `:215`, `:230`, `:277`) — the four ids the row names are real, and none is a whole-array count |
| DoD's un-skip negative arm is expressible on the shipped surface | `waveExecution.test.js:982`, `:1034-1035`, `:1093-1094` use `a6.calls.length` and `result.haltAdvisory`; the omitted-argument shape is the shipped `throw haltError(testGateMessage, a6.disposition ? { advisory: a6.haltFields } : undefined)` (`orchestrate-dev.js:15399`) | Holds — "the `advisory` argument is omitted" names the real production conditional, and `haltAdvisory` stays absent (`orchestrate-dev.js:16248`) |
| Consistency of the corrected value across the document | `grep -n "snapshot-1\|haltAdvisory"` over the PLAN | Three sites agree — A6-18's row (`:339`), the DoD widening leg (`:585-593`), the changelog (`:25`). The Overview's mention (`:56`) states only the four→five widening and names no value, so it did not need editing |
| Nothing else broke | Diffed the AT table, batch gates, dependency section and manifest regions | Unchanged; 48-AT set-equality claim and AT-06-4/AT-06-4b rows (`:555-556`) still carry both arms and both owners |

**The one correction the round turns on, checked in code rather than in prose.** The v1.12 text told the
implementer to write `snapshotRef: null` into a suite whose capture cannot fail. Had that shipped, batch 6 —
whose gate has no expected-red channel — would have gone red on the exact assertion the widening was added to
protect. The v1.13 text now prescribes `refs/pdlc/a6-snapshot-1` and, per the anti-echo rule, requires it be
composed spec-side as `"refs/pdlc/a6-snapshot-" + waveNum` rather than read back from the module under test.
Both halves are correct at HEAD.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
