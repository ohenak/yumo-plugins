# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.8, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 5
**Scope:** Local — delta re-review of `20276f36..f89736fb` (REQ v0.7 → v0.8) plus the
baseline's round-4 partition execution in `9174b23f`. Confirms the round-4 disposition,
looks for new testability defects inside changed material only. Unchanged,
already-approved sections are not re-litigated.

Every existing-behaviour claim below was re-derived at HEAD `f89736fb`; every command
quoted reproduces.

## Round-4 disposition

| Round-4 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The partition ran and closed. `grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled\|postWavePathspecs' $(git ls-files)` returns **133** paths at HEAD, and the class counts in `baseline:104-111` re-derive exactly: M-rows 9, M-8 25, M-11a–n 30, M-11o 2, M-11p 6, A-1 61 = 133, remainder 0. I re-counted each class independently: A-1 = 58 docs (39 `docs/completed/**`, 3 `docs/discarded/**`, 1 decision, 1 baseline, 1 `QUEUE.md`, 9 feature, 4 planning) + 3 fixture corpora = 61; M-11a–n = 30 including `pdlc/hooks/hooks.json`, the four instructional docs, 3 skills and M-11e's 10. The 24 previously-red paths are each dispositioned in `baseline:123-134`. §1.2's new "sweep is a lower bound, not the definition" paragraph is the right reading and names the two measured zero-hit dependents (M-11c, `.worktreeinclude`). |
| F-02 | Medium | **Resolved** | M-11e's extents re-measured and now agree with HEAD: `consumer-ac12/` **6** tree-wide (5 under `.claude/workflows/` + `README.md`), `covered-violations/` **4** tree-wide (`.claude/workflows/orchestrate-dev.bundle.js`, `docs/design/distribution-manifest.json`, `pdlc/workflows/dist/{distribution-manifest.json,orchestrate-queue.bundle.js}`). AC-1.2 (`REQ:295-296`) now carries "(6 tree-wide)" and "(4 tree-wide)", and the three covered-violations files that were missing in v0.7 are named in `baseline:133` as re-fixtured, with the `coveredViolations` oracle they serve stated as surviving. Re-fixture, not delete, is the right call: `documentOracles.test.js` needs a tree that still violates. |
| F-03 | Low | **Resolved** | AC-1.4 (`REQ:321-326`) now binds three things over `pdlc/OPERATIONS.md`: the count word, the named workflow files, and set-equality. Verified against the document: `pdlc/OPERATIONS.md:59` reads "six checks across `.github/workflows/pr-tests.yml` and `.github/workflows/fixture-machine.yml`", followed by six bullets — so all three conjuncts have a referent, and the count word/file names are no longer the only unguarded prose in the CI surface. |
| F-04 | Low | **Resolved** | O-3 (`REQ:532`) now reads "Resolved in this feature's TSPEC, where AC-1.1's branch is pinned; AC-1.3's literals stay in FSPEC" — matches AC-1.1 (`REQ:272-273`). A reader following O-3 to find the branch now lands in the right document. |
| F-05 | Low | **Resolved** | C-6 (`REQ:228-231`) now says "exactly one of three **classes** — M-row, M-11 row, or A-1 — … Exactly one *class*, not exactly one glob", with A-1's deliberate overlap named. Re-derived: the four `**/LEARNINGS-*.md`/`**/POSTMORTEM-*.md` hits are all inside `docs/completed/**`, so the overlap is exactly the four files the text claims and the criterion is no longer red on a clean tree. |

Independent re-derivations of v0.8 material:

- **C-7's green start still reproduces.** `env -u NODE_TEST_CONTEXT npm test` in `pdlc/engine`
  at HEAD: `# tests 842`, `# pass 840`, `# fail 0`, `# skipped 2`, exit 0 — the numbers
  BL-08 and C-7 cite.
- **The M-11h scoping is sound as far as it goes.** `orchestrate-dev.js` keeps the generic
  `postWavePathspecs` parser at `:168`, `:218`–`:245`, `:14416`, and `waveExecution.test.js`
  keeps its coverage; the retired thing really is the configured value in
  `.claude/pdlc.config.example.json`. The disposition is right. The *term-set* wording that
  encodes it is not — F-01 below.
- **R-8's re-derivation checks out.** M-8 is 27 files / 17,133 lines, `driftGenerators.js`
  reduced rather than deleted because seven surviving modules import its
  `seeded`/`resolveSeed`/`shrink` primitives. One classification snag, F-04 below.

## Findings (this round)

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-1.2's new by-construction term set names two *surviving* identifiers, so the criterion cannot be satisfied at post-sweep HEAD and contradicts AC-1.1.** AC-1.2 (`REQ:279-290`) states the term set "**never** contains a surviving identifier", then enumerates, among the terms, "`pdlc/workflows/dist/` as a `postWavePathspecs` entry, and `build-runtime.mjs` as the `postWaveCommand`". Both survive the sweep by this REQ's own decisions: M-7 is dispositioned "reduced — keeps emitting M-9 only" (`baseline:35`), and AC-1.1 (`REQ:266-273`) *requires* `pdlc/workflows/dist/pdlc-cli.mjs` to still exist. Measured at HEAD, `grep -rlF 'build-runtime.mjs' $(git ls-files)` returns 99 files and `grep -rlF 'pdlc/workflows/dist/'` returns 86; subtracting the 133-path sweep leaves 17 new paths, of which 5 land in an existing class (3 in A-1's `planParse/**` glob, 2 in M-11e's `covered-violations/` tree) and **12 are owned by no class at all**. All 12 survive the sweep and legitimately keep the reference: `pdlc/workflows/runtime-adapter.js` (`:5`, `:1181`), `pdlc/workflows/package.json:21`, `pdlc/workflows/__tests__/{planOwnership,pipelineWiring,coverageInstrumentation,reportTemplates}.test.js`, `pdlc/workflows/__tests__/helpers/{adapterHarness,freshClone}.js`, `pdlc/engine/__tests__/bin-guard-structure.test.js:24,:45`, plus two live feature REQs (`docs/pdlc-adapter-read-cache/`, `docs/pdlc-advisory-wave-gate/`) and `docs/_constraints/pdlc-rcv-baseline.md` — none of which A-1 covers. The narrow reading (term = the literal command string `node pdlc/workflows/build-runtime.mjs`) does not rescue it: that string is inside **M-9 itself** (`pdlc/workflows/dist/pdlc-cli.mjs`), the one artifact AC-1.1 requires to survive, and inside the reduced `build-runtime.mjs`. So under either reading, a test author who writes AC-1.2's black-box search exactly as specified gets a permanently-red criterion, and the only way to green it is to quietly narrow the term set — the precise unfalsifiability the paragraph was added to prevent. Fix: drop both from the term set (they are survivors; the rule already excludes them) and let M-11h's retired *value* be caught where the partition already catches it — as an M-11h edit to `.claude/pdlc.config.example.json` asserted by AC-1.2's sibling, not as a repo-wide search term. | AC-1.2, AC-1.1, M-7, O-3 |
| F-02 | Medium | Local | **The term set that produced the 133-path partition is not the term set AC-1.2 defines, and no document says so.** C-6 (`REQ:235-237`) tells the re-measurer to "re-run the sweep at the sweep's base commit"; the only pinned command is `baseline:148`, whose eight alternations are the three scripts, `.bundle.js`, `distribution-manifest`, `pdlc-drift-state`, `distribution.checkEnabled` and **`postWavePathspecs`** — the one term AC-1.2 (`REQ:285`) now explicitly excludes — and which contains neither `pdlc/workflows/dist/` nor `build-runtime.mjs`, the two AC-1.2 now includes. Measured divergence at HEAD: dropping `postWavePathspecs` removes 4 paths from the 133 (`.claude/pdlc.config.example.json`, `waveExecution.test.js`, `consolidationPreflight.test.js`, `dist/consolidate-learnings.bundle.js`), and adding the two new terms adds 17 unclassified ones. The measured extents AC-1.2 quotes inherit the ambiguity: `covered-violations/` is "4 tree-wide" under the recipe grep but 6 under AC-1.2's stated terms (`fixtures/covered-violations/docs/PLAN-top-level.md` and `.../pdlc/skills/orchestrate-queue/SKILL.md` join). Independently of F-01's fix, C-6 and AC-1.2 must name **one** command, and `baseline:148` must be that command verbatim, or the round-5 "remainder empty" result is not the result AC-1.2 gates on. | C-6, AC-1.2, `baseline` re-measure recipe |
| F-03 | Medium | Local | **AC-1.2's term set is stated as an upper bound, never as an equality, so the lazy-implementer game survives the rewrite.** "the term set contains **only** the names of retired artifacts…" (`REQ:280`) forbids *widening* but permits *narrowing*; combined with "never contains a surviving identifier" it hands an implementer a standing warrant to delete any term they can argue survives — which is exactly the move v0.8 makes for `postWavePathspecs`. A search whose membership is argued rather than pinned is not a falsifiable oracle: the criterion greens by construction whenever the searcher is motivated. Fix: state it as set-equality ("the term set **is exactly** {…}, enumerated in FSPEC and re-pinned by C-6") and require the FSPEC to carry the literal command, so the person re-running it in six months reproduces the same result without re-deriving the argument. This is the same shape as AC-1.3's literal-count and AC-1.1's set-equality treatments, which already work. | AC-1.2, C-6 |
| F-04 | Low | Local | **`helpers/driftGenerators.js` is classified into two classes in the partition of record, which is what C-6 says cannot happen.** C-6 (`REQ:228-229`) requires "exactly one of three classes … and no path owned twice". `baseline:131` gives its Class cell as "M-8 / M-11p"; `baseline:105` counts it inside M-8's 7 helper files; and `baseline:36` — M-8's own row — says it "is deliberately **not** in M-8". Three statements, three owners. The 133 total is unaffected (it is counted once), but an auditor mechanically checking "exactly one class" against the disposition table reads a two-class cell and stops. Fix: give it to M-11p (the class whose disposition — reduced, not deleted — actually describes it) and restate the partition counts as M-8 **24** = 18 + 6, M-11p **7**; the total stays 133. | C-6, `baseline` Partition, M-8, M-11p |

## Questions

| ID | Question |
|----|---------|
| Q-01 | C-6 says the re-measurement "re-runs the sweep at the sweep's base commit and closes it again". Is *closure* (remainder empty) the pinned expectation, or the number 133? They come apart: A-1's feature-doc glob grows by one file per review round, so the sweep is 133 today and 134 the moment this cross-review lands. Reading the criterion as remainder-empty is the only stable one — worth saying so in C-6, since §1.2 quotes 133 as a fact of record and a PLAN author may transcribe it as an expected value the way AC-1.3's count is transcribed. |
| Q-02 | Once F-01's fix lands and `build-runtime.mjs` leaves the term set, what catches a stale reference to the *deleted* build behaviour in a surviving file — e.g. `pdlc/workflows/package.json:21` or a surviving CI job still invoking a build step that no longer emits M-4/M-5? M-7 is "reduced", not deleted, so the sweep is silent by design here; the coverage has to come from AC-1.1's `dist/` set-equality plus AC-1.4b. Naming that hand-off in O-3 would close the gap the term-set change opens. |

## Positive Observations

- **The partition was executed, not promised, and it re-derives exactly.** I re-counted
  all six classes independently against HEAD and got the baseline's numbers to the path.
  That is the strongest artifact this REQ has produced: the "sweep is a lower bound, not
  the definition" paragraph (`REQ:82-92`) is the honest reading of what it does and does
  not prove, and naming M-11c and `.worktreeinclude` as measured zero-hit dependents shows
  the limit rather than hiding it.
- **M-11o and M-11p are exactly the rows a curated inventory could not have produced.**
  Two live modules whose header banners name deleted artifacts, and six test modules
  asserting over `dist/` that M-8's regex never reached — both classes were found *by*
  the exhaustive sweep, which is the clearest possible evidence that C-6's control earns
  its cost.
- **The M-11h scoping fixes a real hazard in the right direction.** Retiring a config
  *value* while keeping the generic parser, and saying so with line anchors that
  reproduce, avoids the failure where a name-based criterion demands deleting live code
  the engine channel vendors as source truth. The disposition is correct; F-01 is about
  how the term set encodes it, not about the decision.
- **R-8's re-derivation corrected itself downward-honestly.** Going from ~15,000/21 files
  to 17,133/27 files, and stating *why* the earlier reading was wrong (the helper set was
  omitted), is the kind of correction that makes the next number trustworthy.

## Recommendation

**Needs revision**

Four of the five round-4 findings closed cleanly and the fifth (the partition) closed with
a measured, reproducible artifact — this REQ is one paragraph away from approvable. The
blocker is narrow and local: the by-construction term-set paragraph added to AC-1.2 this
round names `build-runtime.mjs` and `pdlc/workflows/dist/`, both of which survive the sweep
by this REQ's own decisions, so the criterion is unsatisfiable at post-sweep HEAD and
collides with AC-1.1. Removing those two terms — and pinning the surviving enumeration as
a set-equality against the baseline's re-measure command (F-02, F-03) — resolves it without
touching any other criterion, and leaves the M-11h scoping decision itself intact.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
