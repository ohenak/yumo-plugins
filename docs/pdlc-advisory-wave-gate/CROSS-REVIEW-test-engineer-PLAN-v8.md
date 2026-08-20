# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 8 (delta re-review of PLAN v1.7 over v7)

## Overview

One revision landed since v1.6: **v1.7**, addressing round-7's findings. I diffed `d0b7d308..HEAD`
on the PLAN, re-ran the two oracles the revision re-measures, ran the whole `pdlc/workflows` suite
on a clean tree, and re-derived the ownership consequences of the new `.gitignore` step. Scope is
this round's changed bytes: did my round-7 blocker land, and did the fix break anything.

**Round-7 findings: all four closed, and closed with evidence I could reproduce.**

| v7 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Closed** | A6-00's Edit 1 now pairs `git rm --cached` with an ignore rule, states both halves are required, and gives the reason I raised (the blobs stay on disk, `git check-ignore` returns nothing, the directory is a live write target). `.gitignore` is named in A6-00's `Source File` cell and in the file-ownership manifest. No other batch-1 task owns it (A6-01 owns `helpers/advisoryDoubles.js`, A6-04 owns `advisory-config-example.test.js`, A6-05 owns eight suites plus `orchestrate-dev.js`), so no same-batch collision. |
| F-02 | Medium | **Closed** | The conditional table is right. Measured at HEAD on a clean tree (`git status --porcelain` empty): **8 suites failed, 27 tests failed, 70 skipped, 3847 passed, 3944 total** — exactly the clean row. |
| F-03 | Medium | **Closed** | Edit 2 now requires assertion **and** title **and** block comment in the same edit, and the DoD item repeats all three. Both are still stale at HEAD, so the instruction has real work to name: the title reads `post-sweep pdlc/workflows/__tests__/*.test.js count equals TSPEC §4.4's corrected literal of 99` and the comment above the describe still says the literal "only holds once class 6 … lands". The bump target is right: the suite reports **100** test suites total. |
| F-04 | Low | **Closed** | A6-00's row is split into a verify half and an explicit `Edit 1` / `Edit 2` pair. Nothing reads as "nothing to write here" any more. |

**The re-measurement is correct, and I reproduced it.** `PROP-SWEEP-2(b)`'s residual at HEAD is
**28 paths**, not 14, and it partitions as the new table says: 14 `.claude/workflows/.pdlc-backups/*.bak`,
4 `.claude/workflows/` runtime artifacts, 10 of this feature's own tracked documents. The mechanism
claim behind the disposition is also right — `unfilteredSweep()` builds its candidate set from
`gitTrackedFiles(LIVE_ROOT)`, so untracking removes a path from the residual without deleting it —
and A-1's frozen glob list is as described: it carries `docs/pdlc-plugin-retirement/**`,
`**/LEARNINGS-*.md` and `**/POSTMORTEM-*.md`, and carries neither `docs/{feature}/` specs nor
`CROSS-REVIEW-*`, so this document is in its own residual and this file adds the 29th path.

**Two blockers, both in the bytes this round added, both about the same new step.** The revision
fixed the mechanism I raised and then mis-assigned two facts around it: who owns the four runtime
artifacts (F-01), and what an ignore row naming `.claude/workflows/` does to a green oracle (F-02).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | The residual table's class 2 says the four consumer-runtime artifacts "**predate this branch**" and routes them to the coupled sweep as inherited. They do not predate it: all four were **added to the index by `e3b9d5a3`**, the same drift commit as the 14 `.bak` blobs. Verified twice — `git ls-tree 1efb9a3b -- <path>` (the merge-base with `main`) returns empty for `.pdlc-drift-state.json`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js` and `pdlc-cli.mjs`, while `git ls-tree HEAD` returns a blob for each; `git diff --name-status e3b9d5a3^ e3b9d5a3` reports `A` for all four. The feature's own TSPEC already says so, in the paragraph *"State of these surfaces at HEAD (re-grounded, PM F-02 / TE F-01)"*: `e3b9d5a3` carried *"a sweep of tracked `.claude/workflows/.pdlc-backups/*.bak` **and bundle artifacts**"*. Three consequences, all in the permissive direction. (a) The DoD records as **inherited and not closable here** a red whose membership this branch created — the strongest shape of false-green, because the checklist line instructs the implementer not to treat it as a regression. (b) The closable count is wrong: the same untrack act that closes 14 closes **18 of 28**, leaving 10 (this feature's own live documents), which is the only class that genuinely cannot be closed. (c) `.claude/workflows/.pdlc-drift-state.json` is one of the four, and the document's own clean-tree paragraph says *"if that file is instead untracked or excluded upstream, AT-4.1 stops being a per-wave hazard and this paragraph can be retired"* — so the misattribution is also what keeps the per-wave hazard alive. I found no oracle requiring any of the four to be tracked (grepped `ls-files` / `--error-unmatch` across `pdlc/` and `.github/`; the only tracked-ness assertion is AC-6.4's covered-violations fixture inventory, which names none of them). Re-partition by measurement, restate the closable/unclosable split as 18/10, and say which act A6-00 takes on each of the four — subject to F-02. | Overview HEAD-drift note, PROP-SWEEP-2(b) class table row 2 and its "Dispositions" paragraph; DoD's PROP-SWEEP-2(b) item |
| F-02 | High | Local | A6-00's Edit 1 — *"add `.claude/workflows/.pdlc-backups/` to `.gitignore`"* — reddens a test that is **green at HEAD**. `documentOracles.test.js`'s T21 block carries `.gitignore carries no row whose only purpose is the consumer runtime copy, and its ~20-line rationale block is gone with it`, and its first assertion is a blunt substring check: `expect(gitignore).not.toEqual(expect.stringContaining(".claude/workflows/"))`. It is not purpose-scoped despite its title, so **any** row naming that path fails it. I confirmed the current state by running the suite: of `documentOracles.test.js`'s 25 tests exactly 3 fail (`AT-22`, the T15 count, `PROP-SWEEP-2(b)`) and this one passes. Edit 1 as written therefore converts a green oracle to red — a regression this branch causes, outside the "named inherited set" the DoD now permits, failing the `test:coverage` leg and `.github/workflows/pr-tests.yml`'s unit-tests job for a **new** reason. The root `.gitignore` already records the collision avoidance: its comment reads *"Anchored so the covered-violations fixture's nested `.claude/` tree is untouched"* above `/.claude/pdlc.config.json`, a form that carries no `.claude/workflows/` substring. Note the remedy is constrained from two sides: a substring-free pattern is needed for T21, and it must also avoid L-2's seven sweep terms, one of which is `\.bundle\.js` — so an `*.bundle.js` ignore row for F-01's paths would put `.gitignore` itself into `PROP-SWEEP-2(b)`'s residual. Pick a form that satisfies both (e.g. a bare `.pdlc-backups/` directory rule), or delete the blobs from disk instead of ignoring them, or route the T21 amendment to the coupled sweep's owner and say so — but the plan must name which, because Edit 1 as written cannot be executed without breaking a passing test. | A6-00 row, Edit 1; DoD's untrack-and-ignore item; batch-1 gate wording, clean-tree precondition |
| F-03 | Medium | Local | The DoD's full-suite leg is now read as *"no red outside the named inherited set"* rather than as a bare exit-0. That is the honest state, but as written it is a human-applied leniency over an absence-shaped condition, and F-02 is the proof of what it misses: a newly-reddened `documentOracles` test would sit inside the same suite the leg has just been told to read leniently. Make it mechanical and positive. The falsifiable form is a **set-equality over failing test titles** — after A6-00, the full-suite run must fail on exactly `{AT-22 [red-until-L-06]…, PROP-SWEEP-2(b)…}` and nothing else — plus, for `PROP-SWEEP-2(b)`, an assertion that its printed residual set-equals the enumerated inherited paths (after F-01, the 10 document paths, which are enumerable by pattern: `docs/pdlc-advisory-wave-gate/**` plus this feature's `CROSS-REVIEW-*`). Containment or "read leniently" cannot fail; set-equality can. | DoD, `test:coverage` item and the two inherited-red items |
| F-04 | Low | Local | A6-21's re-anchored red-before-green cell reads *"the wave loop's `if (scriptGate) {` arm still carries its unconditional `throw haltError(…)`"*. Two small inaccuracies in an anchor the implementer is meant to reproduce as a red: the throw is not unconditional — it sits under `if (!gate \|\| gate.ok !== true)` inside that arm — and `orchestrate-dev.js` has **two** `if (scriptGate) {` arms, the wave loop's and the V-wave's, whose halt message begins `V-wave ${vWaveNum} PROPERTIES test gate failed`. The re-anchoring away from the bare `:14364` pin is right per DEC-DOC-01; just say "throws on any gate failure, with no expected-red channel" and distinguish the wave-loop arm by its message literal (`Wave ${waveNum} test gate failed`). | Red-before-green steps table, A6-21 row |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: do `.claude/workflows/`'s two `.bundle.js` artifacts, `pdlc-cli.mjs` and `.pdlc-sync-manifest.json` need to stay tracked for anything — the install/upgrade shell tests, `fixture-machine.yml`, or a two-repo scenario? I found no oracle asserting their tracked-ness, and `runtime-adapter.js`'s `RT_CLI_PATH = ".claude/workflows/pdlc-cli.mjs"` is an on-disk lookup that untracking does not disturb, but the workflow-distribution feature owns that tree and should confirm before A6-00 untracks four paths it did not author. |
| Q-02 | F-02: which remedy does the plan want — a substring-free ignore rule (`.pdlc-backups/`), deleting the blobs from disk so no ignore row is needed at all, or routing an amendment of T21's `.gitignore` assertion to the coupled sweep? The third is the only one that also makes room for ignoring F-01's four runtime paths by name, so the two findings probably want a single answer. |

## Positive Observations

- **The re-measurement is the right instinct and it was done properly.** v1.6 asserted a residual of 14 from a commit's file list; v1.7 ran the oracle and got 28. I reproduced the 28 and the partition. Replacing an inferred number with a measured one, and publishing the partition rather than the total, is exactly the standard DEC-DOC-01 asks for.
- **The conditional whole-suite table is a better artifact than the number it replaced.** Naming the enumeration as the invariant and the total as state-dependent, then telling the implementer which figure their own precondition produces, means a 28/9 reading now diagnoses itself. My clean-tree measurement matched the table exactly.
- **The DoD stopped promising a green it cannot reach.** Even though F-01 shows the split is drawn in the wrong place, the move from "PROP-SWEEP-2(b) closes for free" to "this branch does not promise it green" is the correct direction, and the reasoning given — that promising an unreachable green is how residue is discovered at PUB — is the right one.
- **A6-04's downgrade to *discharged by verification* is accurate.** I read the shipped `pdlc/engine/__tests__/advisory-config-example.test.js`: its header comment carries the purpose-named rationale the row describes, and its assertions are exactly what the row claims — `typeof advisory.enabled === "boolean"` (present, not pinned to a value) plus a non-negative-integer `waveBudgetPerRun`. `git diff --name-status e3b9d5a3^ e3b9d5a3` confirms two added test files, not one.
- **The batch column and DAG survived another revision.** No `Batch` or `Deps` cell moved this round; the only manifest change is `.gitignore` joining A6-00, which introduces no same-batch same-file collision.

## Recommendation

**Needs revision**

Round 7's blocker is closed and closed well — the untrack-and-ignore step, the conditional
whole-suite table, the three-way T15 bump and the split A6-00 row all land. The two new blockers are
narrow and both sit in the new step's surroundings. Re-partition `PROP-SWEEP-2(b)`'s residual by
measurement rather than assumption — 18 of 28 are this branch's to close, not 14, and
`.pdlc-drift-state.json` being one of them retires the per-wave clean-tree hazard as a side effect
(F-01). Then choose an ignore form that does not redden T21's currently-green `.gitignore` oracle,
or drop the ignore row in favour of deleting the blobs, and say which (F-02). Making the DoD's
full-suite leg a set-equality over expected-failing test titles (F-03) would have caught F-02 by
construction, and F-04 is a one-line anchor correction. With those, batch 1's inherited-red gate is
checkable end to end and I expect to approve.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
