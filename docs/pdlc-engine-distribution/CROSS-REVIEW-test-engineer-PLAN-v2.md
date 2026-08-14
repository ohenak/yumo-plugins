# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Delta re-review. Testing lens only. Round-1 findings F-01…F-16 checked for
resolution; changed sections scanned for new defects. Unchanged sections already
approved in v1 are not re-reviewed.

## Method

`git diff` from the commit v1 reviewed (`309ea810`) to HEAD: +151/−54 lines across
twelve commits. §2 grew from 55 to 59 rows; §2.1 is new; §4, §5, §6 and §7 were
rewritten around the round-1 findings. The graph was re-parsed and re-derived from
scratch rather than spot-checked, because four new rows and three new edges change
every downstream claim:

- **Batch arithmetic** (`Batch = max(batch of deps) + 1`) re-derived over all 59 rows:
  **no errors**, no missing dep ids, no duplicate ids, no cycle. Batch sizes
  1:4, 2:25, 3:7, 4:6, 5:5, 6:2, 7:2, 8:1, 9:2, 10:2, 11:3 = 59 — §6 Rule 1's
  spelled-out figures match exactly.
- **§2 ↔ §3 bijection**: 59/59, cell-for-cell, **zero differences in either direction**.
- **Same-batch same-file collisions**: none, including `package.json` (T25 b3, T05 b4),
  `run.test.js` (T33 b4, T41 b6) and `publish-channel.test.js` (T58 b2, T49 b5).
- **Transitive `Deps` path between consecutive writers of every multi-writer file**:
  holds for all of them now — the round-1 gap (T30/T35) is closed and no new one appeared.
- **§2.1 vs FSPEC §8**: genuine set-equality. FSPEC §8 enumerates 35 `AT-` ids; §2.1
  carries 35 rows; the sets are equal, and no `AT-` cited in §2 is missing from §2.1
  or vice versa.

Every claim about HEAD that changed this round was re-grounded by opening the file or
running the command, not by reading the sentence. Two counts were measured by executing
the suite (`node --test`), which is where the one High below comes from.

## Round-1 findings — disposition

| ID | Sev (v1) | Status | Evidence checked |
|----|----------|--------|------------------|
| F-01 | High | **Resolved** | T10 now declares the extension and pins the HEAD count; measured `node --test __tests__/engine-config.test.js` → `# tests 9` ✓. §5.1 restated as eighteen new + five extended; the eighteen were checked against `pdlc/engine/__tests__/` — none exists at HEAD (`preflight.test.js` and `cli.test.js` are different files from `preflight-baseline`/`launcher`), and the five extended all do. *(But see F-01 below: the count stated for the newly-named fifth extension is wrong.)* |
| F-02 | High | **Resolved** | T05 is `[gate+green]`, owns `docs/_decisions/DECISIONS-plugin-distribution.md`, `pdlc/engine/LICENSE` and `pdlc/engine/package.json`, at b4 behind T25 (b3) — one `package.json` writer per batch. `git ls-files` still lists no `LICENSE`; `package.json:11` is `"license": "UNLICENSED"` ✓. §4 kind 1 carries T16 → T05, so PF-4's flip and its member are atomic. |
| F-03 | High | **Resolved** | T41 owns `run.test.js` in both §2 and §3, deps include T33 (edge named in §4 kind 4). The line citations were corrected and verified: `run.test.js:41-49` is the checkout-path equality, `:52-65` the walk, `:67-79` PROP-FORK-1 with `assert.ok`/`assert.equal` **inside** the `for…of Object.entries(WORKFLOW_MODULE_URLS)` loop — the zero-assertion hazard is real and the row now requires a non-zero member count before AF-3's equality. |
| F-04 | High | **Resolved** | T22 asserts on the recorded `_git` argv, and every entrypoint claim is true at HEAD: `commitPaths` exported `orchestrate-dev.js:10408`; `appendApprovalAnchors` not exported `:6660`, reached via exported `reviewLoop` `:6183` with a call site at `:6516`; `commitQueueRow` not exported `orchestrate-queue.js:1598` via exported `rewriteStatus` `:1522`, call site `:1572`; `commitAdvisoryRecord` not exported `:1637` via `main()`'s advisory path `:1300`; `buildA5SeamOps` exported `orchestrate-dev.js:2743`, commit at `:2837-2841`. The exportedness claims are now consistent with T01(b). |
| F-05 | High | **Resolved (with a residue — see F-03 below)** | T18's enumeration is a `git ls-files` pathspec, not a walk. Ran it: 52 tracked files, and the feature's own `docs/` artifacts are excluded. The three plugin `claude plugin install` occurrences are at `README.md:115`, `pdlc/README.md:139` and `:145` exactly as stated, and are asserted as a positive outside the set. |
| F-06 | Medium | Resolved | T01 split into an exported half (real `import` + `typeof`) and a module-internal half (source-anchored presence). Re-checked the split against HEAD: every symbol in (a) is `export`ed, every symbol in (b) is not. |
| F-07 | Medium | Resolved | T19 and T57 are marked `[standing guard]`, carved out in §2's header and §6 Rule 3, and each carries its own falsifier. Re-derived: every other `[green]` row names a `[red]` in `Deps`. |
| F-08 | Medium | Resolved | T30 → T35 edge present; transitive-writer check over all multi-writer files now passes with no pair ordered by batch number alone. |
| F-09 | Medium | Resolved | T02 → T18 edge present in §2 and named in §4 kind 3. |
| F-10 | Medium | Resolved | §5 point 2 and §7's closing paragraph now say `node.below-floor` **is not** in `lib/catalogue.mjs` at HEAD. Grepped: the file carries no `below-floor` and no `node.*` id ✓. |
| F-11 | Medium | Resolved | DoD item 4 names the command and the per-module floor. Verified the mechanism rather than the sentence: `_run-suite.mjs:13-17` documents the argv forwarding, and `node --test --experimental-test-coverage` prints a per-file `branch %` column, so "per module, not over the package" is measurable as written. |
| F-12 | Medium | Resolved as asked | T03 gains S-7 generators; T07 and T36 are marked `[generated-input]` with stated properties (ladder totality, announcement-never-empty; parse ∘ render round trip). T06, T21 and T46 stay example-only — that was the scope of the ask, not re-litigated. |
| F-13 | Medium | Resolved | T19 ships a fixture source with a sixth commit site; T23 drops class 9 (`CODE_REVIEW-*`) as its falsifier. |
| F-14 | Medium | Resolved | T12 pins the exact exit code on both paths instead of an unstated baseline, and states the positive `{unavailable, reason}` / `update.unavailable` pair beside the "never called" negative. |
| F-15 | Low | Resolved | §1.1 says eleven for stream A; re-counted from §2: T28 1 + T32 1 + T37 7 + T41 1 + T43 1 = 11, twelfth is T45's in stream B ✓. |
| F-16 | Low | Resolved | DoD item 14 makes `fixture-machine.yml` a **required** check and states the six-vs-five rollup consequence for Phase PUB. |

All five round-1 Highs are resolved. The one High below is **new content from this
round**, not a re-statement.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`skills-composition.test.js` does not have twelve tests at HEAD; it has 32.** T57 says "its twelve tests at HEAD survive verbatim", §5.1 repeats "`skills-composition.test.js` (12 tests at HEAD, T57)" and DoD item 2 makes it checkable — "`skills-composition.test.js` its twelve". Measured, not read: `node --test __tests__/skills-composition.test.js` reports `# tests 32 / # pass 32`. The file has **14** `test(` call sites, two of which sit inside loops over the 10-member `DISPATCHABLE_SET` (`skills-composition.test.js:82` AT-ENG-20, `:166` AT-ENG-21), expanding to 32 at runtime. So the stated number is wrong under either counting convention. This matters because the count *is* the guard: round-1 F-01 established "state the HEAD count so a whole-file write is detectable", and the plan applied it correctly to `engine-config.test.js` (stated 9, measured `# tests 9` ✓). With 12 stated for a 32-test file, an implementer who whole-file-writes twelve tests plus T57's new ones **satisfies DoD item 2 as written while deleting twenty passing tests, and the suite stays green** — the exact defect class the criterion exists to catch. Fix: state the runner-reported number (32), or state it as "14 `test(` call sites expanding to 32 at runtime", in all three places (T57, §5.1, DoD item 2). | §2 T57, §5.1, §7 item 2 |
| F-02 | Medium | Local | **§2.1 and §2 disagree about eight carrier pairs.** §2.1 is set-equal to FSPEC §8 (verified, 35/35 both directions) — the defect is between the two PLAN tables. Six §2.1 rows name a carrier whose §2 row never cites that `AT-`: AT-3.1 → T58, AT-5.1 → T28, AT-5.3 → T29, AT-5.3 → T38, AT-5.3b → T24, AT-5.3b → T39. Two §2 rows cite an `AT-` whose §2.1 row omits them: T31 cites AT-3.8a (§2.1 lists T16, T25, T49), T33 cites AT-6.1 (§2.1 lists T44 alone). No criterion is orphaned — every affected `AT-` retains at least one carrier that does cite it — so this is not a coverage hole, but the implementer of T28 reads T28's row and not §2.1, and a carrier that does not know it is a carrier is how a criterion silently loses its only stated oracle in a later edit. Fix: reconcile in one direction, and state which table is the source of truth for the trailing citation lists. | §2.1, §2 T24/T28/T29/T31/T33/T38/T39/T58 |
| F-03 | Medium | Local | **T18's pathspec excludes only the repo-root `docs/`, so fixture trees are inside the audited set.** Ran the stated command: `git ls-files -- 'README.md' 'pdlc/README.md' 'pdlc/engine/README.md' '*.md' ':(exclude)docs/'` returns 52 files, which include `pdlc/engine/__tests__/fixtures/consumer-ac12/docs/ac12-widget/REQ-ac12-widget.md`, `pdlc/engine/__tests__/fixtures/README.md` and the whole `pdlc/workflows/__tests__/fixtures/` corpus — `:(exclude)docs/` is anchored at the repo root and does not reach a nested `docs/` inside a fixture. Today none of those quotes an engine install command, so the oracle is green; but fixture corpora are precisely where a *future* task plants a sample `npm i -g @{scope}/pdlc-engine` line, and AT-2.2's uniqueness assertion would then go red for a reason that has nothing to do with documentation drift. That is the same false-red hazard round-1 F-05 was about, one level down. Fix: add `':(exclude)*/fixtures/*'` (or `':(exclude)*/__tests__/*'`) to the pathspec, or restrict the set to the three named READMEs plus `CLAUDE.md`. | §2 T18 |
| F-04 | Low | Local | **§4 kind 1 claims to be "the full list" of red-before-green edges but omits T47 → T48.** T47 is `[red]`, T48 is `[green]`, and T48's `Deps` names T47 — mechanically the same shape as the 24 pairs in the table. §4 kind 5 does explain the edge (key-set assertion before the keys are added), so nothing is missing from the graph; the overstated claim is what a reviewer re-deriving Rule 3 trips on, since the cross-check "kind-1 table = set of red→green edges" fails by one. Fix: either add the row or soften §6 Rule 3's wording to "every `[green]` task names its `[red]`; kind 1 lists the pairs where the red *specifies* the green". | §4 kind 1, §6 Rule 3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round-1 Q-02 is answered by the tree, not just by T44's prose: `.claude/pdlc.config.json` already carries `"postWavePathspecs": ["pdlc/workflows/dist/"]` and `"postWaveCommand": "node pdlc/workflows/build-runtime.mjs"`. T44 states the precondition as something to record — is it worth stating that it is **already satisfied at HEAD**, so an implementer does not go looking for a config edit that is not in any task's file set? |
| Q-02 | DoD item 4 lists eight modules for the ≥85% branch floor, including `scripts/fixture-machine.mjs`. T59 unit-tests the recorder hermetically and T50 runs the machine only in the new capability-gated workflow. Is the floor for that module intended to be met by T59's hermetic legs alone (the local coverage run cannot execute the spawn legs), and if so should item 4 say so, so a below-floor reading is diagnosed as a missing hermetic test rather than as a skipped container leg? |

## Positive Observations

- **The five round-1 Highs were fixed by editing the graph, not the prose around it.**
  Every one of them was verifiable by re-running the same mechanical check that produced
  it, and every one passed: the new edges exist in `Deps`, the new rows exist in both
  tables, the file ownership is disjoint per batch.
- **The four added rows did not disturb any mechanical invariant.** 59/59 bijection,
  batch arithmetic exact for all 59, no same-batch same-file collision, transitive
  writer ordering complete. Re-deriving after a four-row insertion is where plans
  usually break; this one holds.
- **§2.1 is genuinely set-equal to FSPEC §8, not containment.** 35 rows, 35 FSPEC ids,
  equal in both directions, and no `AT-` appears twice. It is also written to stay out
  of `parsePlanTasks`' way — no id cell, no `Deps`-shaped cell — and §6 Rule 8 states
  that constraint explicitly rather than relying on it.
- **The corrected citations are correct.** `run.test.js`'s three tests are where §5.4
  now says they are, and PROP-FORK-1's assertions really are inside the
  `Object.entries` loop, so the zero-assertion hazard T41 is told to close is real and
  not theoretical. `checkMessageCatalogue` really does fail on both arms
  (`_assert-suite-wide.mjs:196-213`), and `lib/catalogue.mjs` really has no `node.*` id.
- **T05's atomicity is the right shape.** Recording a decision that flips an expected-set
  member, and supplying the member, in one task is what keeps PF-4 from being red across
  nine batches — and the row says *why* no test file of its own is needed (PK-3 reads the
  decision record, not the tree under audit), which is the kind of reasoning that stops a
  later reviewer from "fixing" it by adding an oracle that would be circular.
- **T22 now proves wiring at the level that can fail.** Recorded `_git` argv through a
  named reachable entrypoint for each of C-a…C-e, with the not-exported helpers reached
  through their exported callers — no source-text grep anywhere. This is the
  builder-not-wired discipline applied correctly to a five-site fan-out.
- **DoD item 4 verifies the gate command, not just the floor.** It names the run,
  explains why it is hermetic (`_run-suite.mjs`'s argv forwarding), and says in words
  that a package-wide average is not the criterion. Confirmed the mechanism prints
  per-file `branch %`, so the criterion is checkable exactly as written.
- **DoD item 14 closes the loop F-16 opened**: the new workflow is *required*, and the
  consequence is stated in the terms Phase PUB actually observes
  (`gh pr view --json statusCheckRollup` sees six where it saw five).

## Recommendation

**Needs revision**

One High, and it is a three-token edit. All five round-1 Highs are resolved and the
graph is mechanically sound after a four-row insertion — batch arithmetic, bijection,
collision and transitive-writer checks all pass over 59 rows, and every corrected
`file:line` citation was reopened at HEAD and found accurate.

What blocks approval:

1. **F-01** — `skills-composition.test.js` has **32** tests at HEAD (14 `test(` call
   sites, two of them looping over 10 identifiers), not twelve. Correct the number in
   T57, §5.1 and DoD item 2. As written, DoD item 2 is satisfiable by a whole-file write
   that deletes twenty passing assertions while the suite stays green — which is the
   defect round-1 F-01 named and which this round otherwise fixed correctly for
   `engine-config.test.js`.

The three non-gating items are one-line edits: reconcile §2.1's carrier lists with §2's
trailing citations (F-02), tighten T18's pathspec so fixture trees are outside the
audited set (F-03), and reconcile §4 kind 1's "full list" claim with T47 → T48 (F-04).

One erratum is raised against FSPEC and reported to the orchestrator separately: FSPEC's
F-7 prose (`FSPEC:289`) cites "§8's AT-7.2", but §8 enumerates no AT-7.2 — the criterion
it means is AT-6.2. PLAN §2.1 and T51 are written against AT-6.2 and are correct; the
dangling id is upstream.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
