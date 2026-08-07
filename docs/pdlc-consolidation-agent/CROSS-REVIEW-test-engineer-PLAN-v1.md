# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** Local (with one TSPEC erratum raised separately)

## Method

Every file the task table names was resolved on disk, and every `file:line` citation in §1, §3, §6.1
and §7 was read at HEAD rather than trusted. The batch column was re-derived from the `Deps` cells
for all 34 rows. The two coverage claims §1 declares "checked against the current suite layout" were
re-measured, and the FSPEC §13 acceptance-test register was diffed against TSPEC §12.3 and against
the PLAN's own task cells.

**What verified clean.** All of these are correct as written and are not re-listed below:
`orchestrate-dev.js` `MERGE_GUARD_DEFAULTS:48`, `mergeCommandFor:319` (throw at `:350`, audit comment
at `:273`), `ADVISORY_RUNG_SKILL:1797`, `resolveAdvisoryRung:1833` (doc comment `:1800`, shipped call
site `:3132`), `gitWithLockRetry:8617` (`async function`, **not** exported — the PLAN's one
known-absent BL-PREREQ is real), `commitPaths:8669` with its unscoped `git commit -m` at `:8690`, the
wave gate at `:10136`/`:10151`/`:10225`; `runtime-adapter.js` `rtReadProbe:369` (cwd instruction
`:374`), `rtReadFile:493`, `rtShellQuote:668`, `rtWriteFile:802` with `relative to the repository
root` at `:805`, `rtCheckFile:817` (`test -s` at `:823`), `rtAppendFile:863`, `rtListFiles:905`
(`:915`, `:929`), `rtGit:945`, `rtRunCommand:1034`, `rtDevInjections:1086`; `build-runtime.mjs`
`stripModuleSyntax:45`, `wrapModule:55`, the three `readFileSync` reads at `:83-85`, the queue prelude
at `:113-123`, `QUEUE_META:127`, `QUEUE_ENTRY:185`, `bundles:448`; `runtimeBundle.test.js`
`BUNDLES:26`, `AT19_SEAM_NAMES:215` consumed at `:427`, `RLH-SCAN-01:626`, `AWAIT_SCAN_SOURCES:1040`
consumed at `:1054`; every shipped double placement (`seams.js` `LIST_FAILURE_VALUES:58`,
`fakeListFiles:132`, `fakeFs:243`, `file_empty` at `:296-299`, `fakeGit:389`; `mergeDoubles.js`
`matchKey:45`, `fakeGhRun:75`, `passingGh:163`, `GH_SURFACE_NAMES:181`, `FIXED_NOW_MS:256`,
`fakeNow:259`; `advisoryDoubles.js` `makeAgentDouble:53`; `driftGenerators.js` `seeded:76`,
`resolveSeed:134`); `package.json:18-21`'s `testPathIgnorePatterns`; `skillFiles.test.js:13-17`'s
hard-coded three-member list (so §9.1 erratum 1 is correct); every one of the ten
`nudge-consolidation.sh` citations (`:13-20`, `:25`, `:26`, `:28`, `:29-30`, `:41`, `:43`, `:47-48`);
`orchestrate-queue.js` `NOTHING_TO_COMMIT_RE:1554`, `commitQueueRow:1576`,
`commitAdvisoryRecord:1615`; `consolidate-learnings/SKILL.md:35` and `:41`;
`harvest-learnings/SKILL.md:70-78` with `Harvested from` at `:77`;
`pdlc-consolidation-vocabularies.md:7` reading `1.4 · 2026-08-06`;
`docs/pdlc-advisory-tier/PLAN-…:207-216`'s skip-discipline precedent; `.claude` untracked
(`git ls-files .claude` is empty). The batch arithmetic re-derives with **zero** mismatches across all
34 rows, and no two same-batch tasks share a manifest file. Nothing marked **(new)** exists; every
file not marked **(new)** does.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **T05 is declared green-at-authoring but is RED on HEAD, and it sits in batch 2 of a halt-on-red wave gate.** T05 asserts "set equality in both directions" between the FSPEC AT register and TSPEC §12.3. Measured now: the FSPEC v11.3 §13 register (`FSPEC:2041-2191`) carries **99** ids; TSPEC §12.3 (`TSPEC:2385-2474`) carries **96**. The three-id difference is `AT-M11`, `AT-Q13`, `AT-R7`. A both-directions set-equality test written to that contract fails the moment it is authored, and §8.2's gate runs the whole suite and halts the run — so this defect does not surface as one red case, it ends wave 2. | §4.1 T05, §8.3 |
| F-02 | High | Local | **Three register ATs have no owning task, and two of them are carried under a stale "(no FSPEC AT)" label.** `AT-M11`, `AT-Q13`, `AT-R7` appear **zero** times in the PLAN (grep). They are not orphans upstream: `AT-M11` (`FSPEC:2085`, the `RELEASED: {passId} {ISO-8601}` marker in a fresh and a stale fixture) traces to AC-1.3 at `FSPEC:2311`; `AT-Q13` (`:2126`) traces to AC-3.2 at `:2320`; `AT-R7` (`:2106`) traces to AC-1.4 at `:2312`. T21 already writes the substance of the latter two — "AC-3.2's three PR-body citations" and "FSPEC §5.3's 'and only when' negative" — but labels both **(no FSPEC AT)**, which `FSPEC:19-20` explicitly repaired ("AC-3.2's body obligation gains AT-Q13", "§5.3's 'only when' negative half gains AT-R7"). `AT-M11` has no home at all: T20's `T28 — marker predicates` block names `parseMarker`/`markerVerdict` but no `RELEASED:`-form staleness case, and T23's release table is keyed on terminal statuses, not on marker parse. Assign all three to a task and drop the two stale labels; without that, T05's oracle cannot be satisfied even after the upstream table is repaired. | §4.1 T20/T21, §4.2, §9 |
| F-03 | Medium | Local | **§2's own red-before-green rule is violated for the property suite: no edge from T25/T26/T27 to T19.** §2 states "every 🟢 row lists its 🔴 row in `Deps`". T19 authors `consolidationProperties.test.js`; T25, T26 and T27 each un-skip a block in it, and §5's cluster narrative describes the chain "`consolidationProperties` (T19 → T25 → T26 → T27)". But T25's `Deps` are `T09, T13, T14`, T26's are `T15, T16, T25`, T27's are `T17, T18, T26` — there is no path to T19, direct **or** transitive (T25's closure reaches T04, T02, T01 only). Ordering holds today only because T19 and T14 land in the same ready-set, which is arithmetic coincidence, not a declared contract; the dispatcher validates the column against the edges, and there is no edge here to validate. Add `T19` to T25's `Deps` (T26/T27 then inherit it). The same laxity, though transitively safe, applies to T31, which un-skips blocks in T06, T20, T21, T22 and T24 while listing only `T12, T23, T30`. | §2, §4.2, §5, §6.1 |
| F-04 | Medium | Local | **A mechanical DoD gate is unsatisfiable as written.** §8.3 requires "`pdlc/workflows/dist/` carries **four** bundles plus `distribution-manifest.json`". `dist/` holds `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs` and `distribution-manifest.json`, and the manifest's rows are `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` — so after T32 there are **three** `*.bundle.js` files, a `pdlc-cli.mjs`, and the manifest. §1 ("a fourth built bundle") and T32 ("the four `dist/` artifacts") conflate bundle count with artifact count. A checklist row that a correct implementation cannot satisfy is either a false halt or a row nobody runs. State it as an artifact count and name the four artifacts. | §1, §4.2 T32, §8.3 |
| F-05 | Medium | Local | **The counts §1 declares "verified against HEAD" and "checked against the current suite layout, not assumed" are wrong on three of four.** (a) "`pdlc/workflows/__tests__/` holds 74 `*.test.js` files at HEAD" — `git ls-files 'pdlc/workflows/__tests__/*.test.js' \| wc -l` returns **83**; the paired half ("none is named `consolidation*`") is correct. (b) "thirty-three tasks below … the remaining ten edit shipped files" — the table carries **34** rows (§6 itself asserts `parsePlanTasks` returns 34) and **9** of them edit shipped files (T07, T08, T09, T10, T11, T12, T13, T32, T33). (c) "fifteen jest suites", repeated in §1's deliverable table and in §8.3's grep row ("grepping the fifteen suites for `describe.skip(`") — §8.1 enumerates **16** new suites. A PLAN whose stated method is mechanical re-derivation cannot carry hand-counted cardinalities in the rows that state the method. | §1, §8.3 |
| F-06 | Medium | Local | **The hook's no-regression oracle is absence-only and passes vacuously on the only tree that runs it.** §6.3(2) and §8.3 both claim "a session with the debug variable unset produces byte-identical output to HEAD's". T09 edit (1) widens the corpus to `docs/completed/*/` and edit (2) rescopes the predicate — both change the pending count `n`, hence whether the `additionalContext` message prints at all (`nudge-consolidation.sh:43`). Measured on this repo against `docs/_decisions/.consolidation-log.md`: HEAD pending = **1** of 2; post-widening pending = **3** of 5; `THRESHOLD = 5` (`:25`), so both sides print nothing and the assertion passes because both are empty. That is exactly the absence-only oracle this PLAN rejects elsewhere. It needs a positive conjunct: a fixture corpus with ≥ 5 pending on both sides where the emitted `additionalContext` **text** is compared, plus a fixture where the widening does change `n` and the expected value is the **new** message transcribed from FSPEC, not identity with HEAD. | §6.3, §8.3 |
| F-07 | Low | Local | §3's `mergeDoubles.js` BL-PREREQ row names six symbols and supplies five line numbers; `fakeSleep` (`mergeDoubles.js:258`) is uncited. Every other citation in that row is exact. | §3 |
| F-08 | Low | Local | T32 says "`devModule`'s export list gaining the same four names", but `resolveAdvisoryRung` is already re-bound in the shipped queue prelude (`build-runtime.mjs:113-123`, `const resolveAdvisoryRung = __dev.resolveAdvisoryRung;`), so only three are new. Relatedly, §9.1 erratum 3 understates its own case: `CLAUDE.md:62`'s "Those three are the tracked, shipped outputs" is **already** false at HEAD, because `pdlc/workflows/dist/pdlc-cli.mjs` is tracked and carries a manifest row — T33 is repairing a live error, not pre-empting a future one. | §4.2 T32, §9.1 |
| F-09 | Low | Local | The writer count for `pdlc/workflows/consolidate-learnings.js` disagrees with itself three ways: §1 says "nine tasks write" it, §4.2 says "**eight** writers below (T25 … T31)" while listing seven rows below, and §5's cluster table gives the correct chain T02 → T25 → T26 → T27 → T28 → T29 → T30 → T31 — eight total, seven below. | §1, §4.2, §5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T05 asserts a set equality between two *documents* that both remain editable through Phase PROPERTIES and Phase I. Once F-01/F-02 are repaired, what stops a later FSPEC or TSPEC erratum round from re-reding T05 mid-implementation and halting a wave for a documentation edit? A pinned-version conjunct (as T24 pins the vocabularies `Version` cell at `1.4`) would at least make the failure legible as "the register moved", not "the code is wrong". |
| Q-02 | §8.3's first row requires zero `describe.skip(` across the suites at Done. T04's differential rows use `test.skip` when `PY_BIN` is empty, which is a *runtime* skip and would not be caught by that grep — but a reviewer reading the row could reasonably delete `test.skip` to satisfy it. Should the row be narrowed to `describe.skip(` in `consolidation*.test.js` with an explicit carve-out naming T04's runtime skip? |
| Q-03 | T00 branches on `.claude/pdlc.config.json` presence and claims "neither branch is vacuous". CI's fresh clone always takes the absent arm, so the present arm — which is the one asserting `postWavePathspecs` and `postWaveCommand`, the two settings §2's whole `dist/` rule rests on — never executes on either matrix leg. Is a tracked fixture config (asserted through the same shipped parser, at an injected root) not the stronger form here? |

## Positive Observations

- The oracle discipline in the red rows is the strongest I have seen in this repo's PLANs, and it is
  specific rather than incanted. T03's `rtConsInjections` case demands **set equality, not
  containment**, and names the exact shipped case that shows why — `adapterProbe.test.js:253-258`
  does assert three keys by identity and would indeed stay green with a fourth omitted, which I
  confirmed by reading it. T20's unreadable-corpus case carries a **readable control member** so that
  conjuncts (1) and (3) cannot pass on an all-unreadable fixture. T21 requires the PR-body expected
  values to be transcribed **from the fixture corpus, never read off the produced record**. T19
  attaches a positive conjunct to every determinism property because order-invariance alone is
  satisfied by a constant function. T24's vocabulary oracle has a fourth leg that reads the authority
  file itself, with the explicit reasoning that the first three legs are otherwise two transcriptions
  compared with each other. Each of these is a real falsifier, stated where the author will be
  working.
- The `describe.skip`-per-green-owner discipline is correctly reasoned from the actual constraint:
  §2 cites `orchestrate-dev.js:10136-10143` and `:10225-10234`, both of which I read and both of
  which do halt the run on a failing whole-suite gate, so a RED-terminal wave genuinely is
  unavailable. The precedent citation to `docs/pdlc-advisory-tier/PLAN-…:207-216` is exact.
- T23's hygiene clauses are the two that actually matter and are usually missed: doubles constructed
  **per case inside the case body**, and the microtask/macrotask drain in a **`finally`** — with the
  correct reason, that on the broken implementation the first assertion throws before an
  after-assertions drain could run. The take-side precondition ("having been the `IN-PROGRESS:` line
  earlier in the same recorded history") is what stops bare absence passing on a `refused` fixture.
- T04's executed-row counter is read by "its **own** unconditional top-level `test()` declared last
  in the file — **never an `afterAll`**", with the correct justification that jest does not run
  `afterAll` when every test in a block is skipped. That is a real and commonly-fatal detail.
- §7's integration table cites a line number and the surrounding behaviour for all fourteen shipped
  surfaces, and every one of them checks out at HEAD. The `rtCheckFile` (`test -s`, `:823`) versus
  `fakeFs.checkFile` (trimmed content, `:296-299`) divergence is identified, bounded as unreachable
  for this feature's two marker states, and fenced with a rule ("no row may assert *which* `reason`
  came back") rather than left as a latent leaky double.
- T28's "`present` is `_checkFile(...).ok === true` and is never derived from `_readFile(...) !==
  null`" names the exact false-positive it prevents (a `reclaimed-stale-lock` on every steady-state
  pass after the first, because a released marker *is* an empty file). That is a defect specified out
  of existence before it is written.
- The batch arithmetic is genuinely mechanical. I re-derived `max(batch of Deps) + 1` for all 34 rows
  independently and found zero mismatches, and no two same-batch tasks share a manifest file — the
  single-writer-per-batch rule holds throughout, including the four shared-file clusters §5 tabulates.

## Recommendation

**Needs revision**

Two High findings, either of which halts Phase I rather than failing one case. F-01 puts a
guaranteed-red test in batch 2 of a halt-on-red gate; F-02 leaves three registered acceptance tests —
including `AT-M11`, the only coverage of the `RELEASED:` marker form under AC-1.3 — with no owning
task, two of them hidden behind a "(no FSPEC AT)" label the FSPEC has already retired.

To reach approval:

1. **F-01/F-02 together.** Assign `AT-M11`, `AT-Q13` and `AT-R7` to tasks (`AT-M11` most naturally to
   T20's `T28 — marker predicates` block beside `parseMarker`/`markerVerdict`; `AT-Q13` and `AT-R7` to
   T21, whose cases already cover their substance), delete the two stale **(no FSPEC AT)** labels, and
   re-state T05's expected cardinality as **99** transcribed from FSPEC v11.3 §13 — or, better, make
   T05 read the register rather than hard-code a count, keeping only a version pin. T05's status must
   not claim green-at-authoring until the upstream table carries all 99 rows (see the erratum).
2. **F-03.** Add `T19` to T25's `Deps`.
3. **F-04.** Restate §8.3's `dist/` row as four *artifacts*, named.
4. **F-05.** Re-measure and correct the three counts (83 test files, 34 tasks / 9 shipped-file
   editors, 16 suites), including §8.3's grep row.
5. **F-06.** Replace the byte-identity claim with an above-threshold positive comparison plus a
   fixture in which the widening changes `n` and the expected output is transcribed, not compared to
   HEAD.
6. **F-07/F-08/F-09.** One-line corrections.

