# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 1
**Scope:** Local

## Summary

The design is verifiable in most of its load-bearing places, and several decisions are made
precisely so an oracle can exist: the invocation ledger (§2.4) recorded rather than reconstructed,
the citation floor in `citesGateOutput` (§3.3), `producedPaths` unioning the untracked half, and the
in-place `declaredScope` mutation. All shipped symbols the document cites exist and behave as
described — `ADVISORY_EXCLUSIONS`' order (`pdlc/workflows/orchestrate-dev.js:2311`), the
`__preDispatch` escape shape (`:3401-3409`), `positiveInt`'s `v >= 1` (`:1991-1997`),
`doRevert` on every `verifyGate` failure (`:3548`), `__isRevertFailure` rethrow (`:3577`).

Three gaps gate this round: one FSPEC acceptance test whose oracle has no design surface, an edit
set in §5.1 that is smaller than §1.3's own list, and a Test Strategy with no AT-to-test mapping,
which leaves completeness a containment check.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-05-4's halt-report conjunct is unsatisfiable as designed.** §4.5 attaches `haltError` fields `{rootCause, diagnosis, repairApplied, repairPaths}` on "Every non-resolved wave (AC-6.3)". AT-05-4's halt is the *post-gate un-skip halt after a **resolved** A6 wave* — `orchestrate-dev.js:14386` throws `haltError(formatUnskipViolations(...))` with no second argument — so the report cannot "state that a repair remains applied and name its paths". §4.5's first consequence bullet answers only the *advisory record* half and §5.2 only the *no-restoration* half; the halt-report half is unaddressed. Specify that a resolved A6 wave retains `{repairApplied:true, repairPaths}` in wave scope and that every post-gate halt in that wave (un-skip guard at minimum) carries them, so the AT has one oracle over one halt report. | §4.5, §5.2, AT-05-4 |
| F-02 | High | Local | **§5.1's file table under-scopes the edit set §1.3 declares.** §1.3 names six transcribed surfaces that must go red; three live in files §5.1 does not list: `__tests__/advisoryRecord.test.js:496` and `:544` (`["A1","A2","A3","A4","A5"]`), `__tests__/advisoryHarvest.test.js:573`, `__tests__/consolidationProperties.test.js:250`. PLAN's file-ownership manifest is derived from §5.1, so these files land in no task's owned set and go red inside an unrelated wave — the exact "unexplained red suites in the middle of a wave" §1.3 itself flags. Add the three rows. | §5.1 vs §1.3 |
| F-03 | High | Local | **No AT-to-test-home mapping; 19 of the FSPEC's 42 ATs are unreferenced anywhere in this TSPEC.** Some are inherited-behaviour rows, but these are A6-owned new code with no other home: **AT-04-5** (the E-6 promotion commit visible on the branch — the entire §3.6 mechanism, brand-new code, referenced by zero test in §5), **AT-05-2** (content-level restoration oracle), **AT-07-1** (the total BR-1…BR-16 partition through a stub double — the FSPEC's single largest test obligation), AT-03-5, AT-03-6, AT-06-1…AT-06-5, AT-01-6, AT-02-7, AT-02-8. §5.1/§5.2 enumerate themes, which is containment; the FSPEC's AT set is the required set. Add a traceability table (AT id → test file → one-line oracle) covering every AT the FSPEC does not explicitly delegate to a shipped suite. | §5.1, §5.2 |
| F-04 | Medium | Local | **The snapshot/restore oracle and its fixture are unnamed, and the default is an implementation echo.** §5.2's round-trip claims (untracked file gone, `.gitignore`d file kept) and AT-05-2's path-to-content-hash map are only executable against a real temporary git repository; precedent exists at `__tests__/advisoryDodSeams.test.js:372,1217,1235`. Against an injected fake `_git` the only available assertion is the argv list the code itself emits — an echo that cannot falsify BR-9. Name the real-repo fixture and the content-hash-map oracle in §5.2, and say explicitly that a `git status`-level comparison is refused (AT-05-2's own reason). | §5.2, §3.5 |
| F-05 | Medium | Local | **§5.4's coverage claim does not hold for A6.** The gate is `c8 … --per-file --branches 85` over `c8.include` = `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` (`pdlc/workflows/package.json`, `test:coverage` and the `c8` block). A6 is not a "new module surface" — every symbol lands in `orchestrate-dev.js`, ~15k lines, whose per-file percentage absorbs a dozen uncovered A6 branches without moving. "Reach the floor incidentally" is therefore not a gate. Replace with an explicit enumeration of A6's branches (four root-cause classes × authorising/non-authorising, three envelope members, three restoration triggers, two confidence values, capture-failure and restore-failure arms) asserted one by one. | §5.4 |
| F-06 | Medium | Local | **Directory-row coverage has an unpinned precondition.** `ownedSetCovers` reuses `pathsCollide` (`orchestrate-dev.js:4726-4731`), which grants prefix coverage only when the row **ends in `/`**. §3.4's claim that "a manifest row naming a directory (`pdlc/workflows/dist/`) covers files beneath it" is true only for that spelling; a manifest row written `pdlc/workflows/dist` refuses every produced file beneath it as `out-of-envelope`, silently. State the precondition and name a test over both spellings — the slash-less row is the realistic operator error and no AT covers it. | §3.4 |
| F-07 | Medium | Local | **`apply`'s "the tree changed" oracle is undefined, and ignored-path repairs fall through it.** §3.3 says `apply` returns `{ok:true}` iff the tree changed, without saying by which observation; §3.3's `producedPaths` (`git diff --name-only` ∪ `git ls-files --others --exclude-standard`) is blind to `.gitignore`d paths, which §2.5 deliberately keeps out of both capture and restore. A repair writing only into an ignored path is invisible to the step-5 CHECK **and** survives restoration. Name the observation `apply` uses, name the expected disposition for an ignored-path-only repair, and give it a test. | §3.3, §2.5 |
| F-08 | Medium | Local | **AT-01-5's exactly-one-statement oracle is one edit away from reading two.** §2.6 hoists the config read and the `scriptGate` *computation* above `if (!waveMode)` (`orchestrate-dev.js:14041`, `:14123-14152`) and widens the legacy notice — but never says the `if (!scriptGate)` **emit** stays inside the wave-mode branch. If it is hoisted with its computation, a no-manifest run with no `testCommand` emits two inapplicability statements and AT-01-5 fails on a correct design. State that the emit stays in the wave-mode branch, and name the test that counts statements on both arms. | §2.6 |
| F-09 | Medium | Local | **`A6_MIN_CITATION_CHARS` is a load-bearing refusal boundary that is neither declared nor boundary-tested.** §3.3 uses the value 24 in prose only; §3.1's constants block does not declare or export it, so no test can transcribe it, and §5.2 names no boundary case. A citation of 23 normalised characters costs one attempt and a citation of 24 does not — pin both, and declare the constant beside `A6_PROHIBITIONS`. | §3.1, §3.3 |
| F-10 | Low | Local | §3.3's `conditionHolds` row reads `true`. The driver calls `await seamOps.conditionHolds()` (`orchestrate-dev.js:3488`); a literal `true` throws. Write `async () => true`, as `buildA3SeamOps` does (`:2585`). | §3.3 |
| F-11 | Low | Local | §3.6 specifies the promotion's `commitPaths` call by `paths`, `what` and `provenance` but omits `message`, which the shipped writer requires (`orchestrate-dev.js:14405-14411`, `:14417-14425`). Give the literal message, so AT-04-5's oracle can identify the commit by more than its pathspec. | §3.6 |
| F-12 | Low | Local | §4.5 says the advisory record is "deleted at Phase PUB". The cited baseline says it is deleted by Phase H2's distil (`docs/_constraints/pdlc-advisory-corpus-baseline.md:27`). The conclusion (only escalations are durably countable) is unaffected; the citation should match the source it names. | §4.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | A6's `verifyGate` re-runs the gate sequence but not `checkWaveUnskips`, which runs later (`orchestrate-dev.js:14371-14386`). A repair that greens the gate by skipping a test therefore passes A6 and is caught post-gate as a *retained* repair (AT-05-4's shape), not as a refusal. Is that the intended disposition, and which AT pins it? |
| Q-02 | `promotions` is a `Map<taskId, …>` (§3.6, §4.3). What is the intended behaviour when two different waves promote into the same later task — overwrite, or union of paths/symbols? The later task's prompt clause and AT-04-5's commit oracle read differently under each. |
| Q-03 | §3.2 step 3 asserts that the pre-dispatch budget escape performs "no rung resolution". Confirmed against `:3401-3409` for the driver's own path — but §3.2 places the wave-budget check inside `runWaveGateSeam` *before* `runAdvisorySeam`. Which of the two carries the check in the implementation? The disabled-tier byte-identity properties (§5.2) will assert against one of them. |

## Positive Observations

- §2.4's decision to *record* the invocation sequence rather than reconstruct it from log text is
  exactly right, and it is what makes AT-04-2's three worked sequences assertable at all.
- `citesGateOutput` (§3.3) turns BR-3 from a prose rule into a decidable predicate with a stated
  normalisation and a stated floor — a rule an agent cannot satisfy by paraphrase.
- `producedPaths` unioning `git ls-files --others` is the kind of detail that usually surfaces as a
  false green six months later; naming it as "not optional" with its reason is good practice.
- §5.3's honesty about what is verified by reading rather than asserting is the correct treatment of
  inherited behaviour — it avoids re-implementing the thing under test in the test.
- §2.5's rejection of `git stash`, with the reason (capture must not mutate the tree it protects),
  is the single most load-bearing design decision here and it is argued, not asserted.

## Recommendation

**Needs revision**

Three High findings. F-01 leaves an FSPEC acceptance test without a design surface; F-02 ships a
PLAN whose manifest is smaller than the edit set the TSPEC itself declares; F-03 leaves the majority
of the FSPEC's ATs without a named home, so PLAN cannot derive its red-test rows per AT. All three
are additive edits to §4.5, §5.1 and §5.2 — no design change is implied by any of them.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 6, "low": 3}
