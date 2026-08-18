# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.2)
**Date:** 2026-08-17
**Iteration:** 2

**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v1.md`: prior findings
verified, then only the sections this round changed (`git diff 95908057..HEAD`, 260 insertions /
55 deletions) scanned for new issues.

## Prior findings — disposition

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §4.2 no longer claims the cleanup step introduces no retired term; it now names both files that carry L-2 terms and the reason each is unavoidable, and rejects runtime name-construction on BR-CLN-4 grounds. §4.3 pins the A-1 extension as **two named paths, not a glob**, §6.1 erratum 4 routes it upstream, and §6.3 T-4 makes class 13 blocking until the rows land. Verified the gap is real and still open upstream: `docs/_constraints/pdlc-retirement-baseline.md` §A-1 covers `docs/completed/**`, `docs/discarded/**`, `docs/_decisions/**`, the baseline file, `**/LEARNINGS-*.md`/`**/POSTMORTEM-*.md`, the two fixture corpora and `QUEUE.md` — nothing under `pdlc/hooks/scripts/`. |
| F-02 | High | **Resolved** | §2.2 now carries a "Consequence for the wave gate (class 10)" block deciding both values **survive**, with the staleness argument spelled out; §2.9's class-10 row is corrected to prose-only; §6.1 erratum 5 routes the REQ C-5 / M-11h assumption upstream. Verified: `.claude/pdlc.config.example.json` carries `postWaveCommand = "node pdlc/workflows/build-runtime.mjs"` and `postWavePathspecs = ["pdlc/workflows/dist/"]`; `build-runtime.mjs:530` `CLI_SOURCES = ["orchestrate-dev.js", "cli.mjs"]`, so the stale-artifact path §2.2 describes is the real one. |
| F-03 | High | **Resolved** | §6.3 T-5 is a blocking obligation: classes 7 and 11 may not land until erratum 3 has an upstream disposition, with the reason stated (class 7 removes the only host, class 11 is instructed to *name* it). This is the mechanism the finding asked for — the skill cannot ship host-less unnoticed. |
| F-04 | Medium | **Resolved** | §2.6 op 3 and §4.7 now agree and match the tree. Re-verified by `grep -rn "driftGenerators" pdlc/workflows/__tests__`: twelve static `*.test.js` importers, six deleted (`driftBackups:46`, `driftBaseline:56`, `driftFault:37`, `driftHook:69`, `driftOrdering:36`, `queueDriftGate:60`), six surviving (`approvalHash:39`, `completeness:55`, `forcePhases:30`, `pacingWrapper:60`, `roundDerivation:36`, `scanLines:28`), plus `helpers/mergeDoubles.js:14` and the dynamic site `consolidationPreflight.test.js:173`. **Eight surviving consumers** — set-equal to the membership `docs/_constraints/pdlc-retirement-baseline.md:45` records. The withdrawn claim is named as withdrawn rather than quietly replaced. |
| F-05 | Medium | **Resolved** | §3.2 now states rows 4 and 5 are TSPEC-introduced surface, not upstream criteria; §6.1 erratum 7 routes product ownership upstream with both dispositions named (AC-4.5, or drop `--dry-run` and TT-2 with it); §5.2 rows TT-1/TT-2 give both rows oracles. TT-2 carries the positive conjunct ("every entry still present **and byte-identical**"), not an absence-only assertion. |
| F-06 | Medium | **Resolved** | §4.4 and §6.1 erratum 6 route membership and count as one correction, with the reason the two cannot be split ("correcting the number while leaving the module inside M-8 would leave AC-1.3 asserting a deletion the sweep does not perform"). FSPEC L-5's arithmetic is as cited — `119 − 22 = 97` at ASM-2. |
| F-07 | Low | **Resolved** | §4.6's table gains the repo-engine row (`0.2.1` — **unpublished**; newest tag `engine-v0.2.0`) and a paragraph separating the published-gate reading from the tree state. Verified: `pdlc/engine/package.json:3` is `0.2.1`, `:18` `pdlcPluginCompat: "^0.23.0"`, `git tag --list 'engine-v*'` ends at `engine-v0.2.0`. |

All seven v1 findings are addressed, and every repository claim I re-checked in the revised text
holds at HEAD. The two findings below are new, both introduced by this round's edits.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Cross-Feature | **The re-homed mode-bit coverage covers the one new script and drops the three surviving shipped hooks, so AC-3.3's "every hook still fires" loses its only mechanical oracle.** §4.4's new `bootstrap.test.js` paragraph promises the plural — "§5.2 therefore re-homes the mode-bit and never-126 assertions **for the surviving shipped scripts**" — but §5.2's row TT-3 delivers the singular: "**the script** is spawned by path … the index mode bit is `100755` … the on-disk file is executable in a fresh clone", scoped entirely to `cleanup-consumer-workflows.sh`. `FIVE_SCRIPTS` (`pdlc/workflows/__tests__/bootstrap.test.js:55`–`:61`) is `check-workflow-drift.sh`, `sync-workflows.sh`, `check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh` — two die with the sweep, **three survive and are exactly hooks AC-3.3 names** (harvest guard, scope-field warning, consolidation nudge). `bootstrap.test.js` is the only file in the repo asserting either constraint: `grep -rn "100755" pdlc/workflows/__tests__/*.test.js` returns `bootstrap.test.js:267`–`:268` alone, and the only other `126` reference is `driftOrdering.test.js`, itself deleted. Post-sweep, a lost mode bit on any of the three surviving hooks ships silently and the hook simply stops firing (CLAUDE.md's fresh-clone rule: "a 126 means the mode bit was lost"). The document already states the correct standard — "deleting `bootstrap.test.js` must not remove that coverage without replacement" — and then replaces less than it removes. Fix: widen TT-3's `it.each` to the **surviving** shipped-script set (the three AC-3.3 hooks plus `cleanup-consumer-workflows.sh`) as a set-equal enumeration, so a script added to `pdlc/hooks/scripts/` without a mode bit fails rather than passing unlisted. | REQ AC-3.3, AC-1.7, G-2/US-04 |
| F-02 | High | Local | **§4.5 clause 1(b) stops field-set enumeration at the root of all eight excluded collections, which discards AC-5.2's "no phase or gate disappeared" for the two collections whose keys are fixed, not run-variable.** The new rule reads: "**enumeration stops at the root of every excluded run-variable collection** … the key path `engine.<name>` is enumerated and its interior is not", applied uniformly to `authSources`, `startup`, `dispatches`, `retries`, `pauses`, `denials`, `loop` and `outcomes`. The stated justification only covers dynamic keys — "`engine.dispatches.bySkill.<skill-name>` … a pre-sweep run that dispatched a different skill set would otherwise fail clause 1" — which is true of the *leaf* names and false one level up. `pdlc/engine/lib/report.mjs:73` defaults `outcomes` to `{ ran: 0, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 }` and `:64` defaults `dispatches` to `{ bySkill: {}, byPhase: {} }`; the module contract at `:18`–`:23` states these are "zero-valued shape (`dispatches`/`outcomes`), **never a missing key**". Those six outcome kinds and two dispatch axes are therefore present in every correct run and are precisely what AC-5.2 means by "No field, phase or gate disappeared with the deleted machinery (NG-3)" — a sweep that dropped an outcome kind is the failure the criterion exists to catch, and under 1(b) as written it passes clause 1 and is exempt from clause 2. AC-5.2's own wording ("compared for presence, not content") does not license this: the fixed sub-keys are shape, not content. Fix: state the stop at the **run-variable key level**, not the collection root — enumerate `engine.outcomes`'s six keys and `engine.dispatches.{bySkill,byPhase}`, stop below `bySkill`/`byPhase`, and keep the array-path rule for the six list-valued collections. | REQ AC-5.2, NG-3; FSPEC AT-5.2 |
| F-03 | Low | Local | **§4.4's five-scripts arithmetic is wrong in the sentence that motivates the re-home.** "Four of the five shipped scripts it covers are deleted or unchanged by this sweep" does not partition `FIVE_SCRIPTS` (`bootstrap.test.js:55`) under any reading: two are deleted (`check-workflow-drift.sh` class 4, `sync-workflows.sh` class 5) and three survive unchanged (`check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh`) — 2 + 3, never 4 + 1. The miscount is what makes the singular TT-3 look sufficient (F-01), so the two corrections land together: state 2 deleted / 3 surviving, then scope TT-3 to the survivors. | REQ AC-3.3, R-8 |

FINDING: High | delta | local | §5.2 row TT-3 / §4.4 bootstrap paragraph | mode-bit and never-126 coverage re-homed for the new cleanup script only; the three surviving AC-3.3 hook scripts lose the repo's only `100755`/non-126 oracle with `bootstrap.test.js`
FINDING: High | delta | local | §4.5 clause 1(b) | field-set enumeration stops at the collection root for `outcomes` and `dispatches`, whose keys are fixed and guaranteed present, so a disappeared outcome kind or dispatch axis passes AC-5.2's set-equality
FINDING: Low | delta | local | §4.4 bootstrap paragraph | "four of the five shipped scripts are deleted or unchanged" mis-partitions `FIVE_SCRIPTS`; the split is 2 deleted / 3 surviving

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's widened TT-3: should the surviving shipped-script set be enumerated **literally** in `consumerCleanup.test.js`, or derived from `pdlc/hooks/hooks.json`'s four surviving `command` paths plus the cleanup script? The derived form keeps the enumeration set-equal to what the plugin actually ships (a hook added without a mode bit fails), but couples the mode-bit oracle to the hooks manifest that L-4's set-equality already pins. A literal list is simpler and matches `FIVE_SCRIPTS`'s current shape, at the cost of going stale silently. |
| Q-02 | §5.2 cites `consolidationHookParity.test.js` (`:152`, `:215`, `:364`) as already covering `nudge-consolidation.sh` "rather than duplicated". Verified the file's subject is that hook (`HOOK_PATH`, `:36`), but the three anchors are a helper docstring, a helper body and one assertion — not the three named oracles a reader expects. Should the row cite the covering **assertion titles** instead, as §4.4's L-6 row 1 table now does for `orchestrateQueue.test.js`? That table is the better pattern and would make AT-3.3 clause 2 red on a rename rather than silently uncovered. |

## Positive Observations

- **§4.7's correction is exemplary practice.** The withdrawn claim is stated as withdrawn, with the reason each of the five mistaken members was mistaken (`driftRepoRoot` comment-only; four advisory/properties modules not consumers at all), the measurement command is given so a reader can re-run it, and the conclusion is checked against the baseline it previously contradicted — eight surviving consumers, set-equal to `pdlc-retirement-baseline.md:45`. It also names what did **not** change (the surviving export set) so no downstream reader over-corrects.
- **§5.2's AT-3.1 rewrite fixes an absence-only oracle without being asked.** The static half is now conjunctive — invocation line present verbatim, resolution ladder present, refusal text names the install command, **and** no selection/dispatch/verdict text remains — with the failure mode spelled out: "An empty or truncated file fails (a)–(c) instead of passing (d) vacuously". That is the right instinct applied to the exact shape of test that false-greens.
- **TT-5 is set-equality, not containment.** "the emitted file set **set-equals `{pdlc-cli.mjs}`** (a surviving bundle or a silently-emitted manifest fails)" closes the gap where §3.1's emission contract was asserted only by construction. The paired positive (`wrote`/`in-sync` row) and negative (`STALE` + exit 1) arms make it an oracle rather than a smoke test.
- **§4.4's L-6 row 1 table converts a claim into a citation.** Transcribing the four `orchestrateQueue.test.js` titles with their sites means R-8's "discharged by measurement" can be re-checked by a reader and reds if one is renamed — and §5.3 lists them as protected, which closes the loop the v1 text left open.
- **T-4 and T-5 are the right kind of obligation.** Both are stated as *blocking a specific class from landing*, with the failure they prevent named (AC-1.2 red by construction; a skill shipping with no execution host). An obligation an implementer can act on beats a risk paragraph, and §6.3 now reads as a gate rather than a list of worries.
- **§3.2's honesty about its own scope.** Declaring rows 4 and 5 "surface this TSPEC introduces, not upstream criteria", covering them with tests anyway ("an untested safety flag is worse than no flag"), and routing product ownership upstream is exactly the disposition a PM wants for engineering-side scope — neither dropped nor quietly annexed.

## Recommendation

**Needs revision**

Two High findings, both introduced by this round and both narrow. Required changes:

1. **F-01** — Scope §5.2's TT-3 to the **surviving** shipped-script set (the three AC-3.3 hooks plus `cleanup-consumer-workflows.sh`), enumerated set-equally, so `bootstrap.test.js`'s deletion replaces as much coverage as it removes.
2. **F-02** — Restate §4.5 clause 1(b)'s stop at the run-variable **key** level: enumerate `engine.outcomes`'s six fixed keys and `engine.dispatches.{bySkill,byPhase}`, stop below the dynamic skill/phase names, so AC-5.2 still fails when a phase or gate disappears.
3. **F-03** (non-gating, lands with F-01) — Correct §4.4's five-scripts split to 2 deleted / 3 surviving.

Nothing else in the diff needs to change; the seven v1 findings are closed and the sections they touch verify against the tree.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 0, "low": 1}
