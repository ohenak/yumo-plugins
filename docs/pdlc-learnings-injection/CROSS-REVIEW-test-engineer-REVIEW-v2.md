# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/` + the feature diff against `main`
**Scope:** implementation review of pdlc-learnings-injection (Phase CR, iteration 2 — delta re-review)
**Date:** 2026-08-21
**Iteration:** 2

## Method

Delta protocol. The base of this re-review is `6b72d587`, the commit v1 reviewed; the delta is
`git diff 6b72d587..HEAD`, 9 files, +1315/-88. No document under `docs/pdlc-learnings-injection/`
changed in that range apart from the two v1 cross-review files, so every upstream divergence v1
routed is still open upstream and is re-emitted as an `ERRATUM:` line rather than folded into this
verdict.

Every claim below was re-checked against the working tree, not the revision's commit messages.
Four instruments:

1. **Full suite on the tree** — `cd pdlc/workflows && npm test`:
   `Test Suites: 1 failed, 110 passed, 111 total`, `Tests: 1 failed, 70 skipped, 3978 passed,
   4049 total`. v1 recorded three reds; two are gone (E-1). The one remaining is
   `documentOracles.test.js` › `AT-22 coveredViolations(LIVE_ROOT) is empty`, whose 199 received
   rows are all under `.claude/worktrees/agent-*/…` — the parallel-reviewer worktrees this
   oracle walks because it skips only `.git/` and `node_modules/` (CLAUDE.md's standing
   debugging note). Environmental, not the feature's, and unchanged from v1.
2. **Kill-testing every repaired oracle.** Each v1 High was re-verified by restoring the exact
   defect v1 filed and re-running: a repair is accepted only if the suite goes red, and the
   backup is restored and `git diff --stat orchestrate-dev.js` confirmed empty after each. Four
   mutants, four kills — E-1 through E-4.
3. **A leak mutant for the inertness ACs.** AC-4.3's negative claim is only worth what it can
   detect, so an injected `sourcePath` was leaked into `report.notices` at `buildFinalReport`'s
   assembly to confirm the rewritten oracles see it (E-4).
4. **Bundle freshness** — `node pdlc/workflows/build-runtime.mjs --check` now exits 0
   (`in-sync  pdlc/workflows/dist/pdlc-cli.mjs`), against a non-zero exit and a deterministic
   `consolidationBuild.test.js` red in v1.

Scope discipline: only the changed sections were read for new issues. Sections v1 approved were
not re-litigated.

**Closing pass (anchors re-verified at HEAD `558d0d96`).** Every `file:line` anchor in this review
was re-resolved against the working tree in a final pass; the `orchestrate-dev.js` anchors were
written against a pre-`e010c2b2` numbering and have been corrected in place. The verified anchors
are: the BR-1 decision `const injectHere =` at `orchestrate-dev.js:10293`, its composition-site
probe `_recordDocType(docType, injectHere, dispatchKind)` at `:10302`, the post-`selection`
injection call at `:10340-10349`, the reviewer prompt literal `This is iteration ${iteration}.`
at `:10711`, the single-predicate `RSN-NO-MATERIAL` branch at `:2458`, the unconditional
`RSN-COUNT` push at `:2519`, and the unguarded `doc.orderKey` interpolation at `:2548`. No claim,
severity, or count changed in this pass — only the anchors that carry them. `hasAnySectionHeadingLine`
is absent from the tree except as the historical note at `:2451`, and the deleted `propagateBytes`
guard survives only as the commented-out line at `:2498`, both consistent with F-04 and F-07 being
resolved by deletion rather than by re-shaping.

## Delta Verification — v1's five High findings

All five are **resolved**, each confirmed by a kill, not by reading the change.

**F-01 (AC-4.3 had no live oracle) — RESOLVED.** `LI-AT-29`'s five `?? null` reads of keys
`buildFinalReport` never emits are gone; the oracle now reads the gate inputs where they live —
`report.phases`, `.artifactPaths`, `.notices`, `.outcome`, `.testSummary`, `.harvestStatus`
(`learningsDispatchSet.test.js:483-524`) — with four non-vacuity controls beside it
(`phases.length > 0`, a numeric `iterations`, an `Approved (N iterations)` detail, non-empty
`artifactPaths`). `LI-AT-35` carried the identical defect and was repaired the same way
(`:1155-1174`). AC-3.4's negative half no longer serialises an absent key: it now excludes the
`learningsInjection` key by rest-spread and asserts the source path appears nowhere in the
remaining report, paired with the positive half — the path IS in BR-8's rows (`:576-594`).
E-4 confirms all three are falsifiable.

**F-02 (BR-1's second conjunct had no falsifying test) — RESOLVED.** Restoring the mutant
(`const injectHere = dispatchKind === "authoring";`, `orchestrate-dev.js:10293`) now reds two
tests (E-1). The new `reviseOnceInPhases` script option (`learningsDispatchSet.test.js:118-158`)
is what put the case AC-1.2 names — Phase CR's optimizer, `dispatchKind: "authoring"` with
`docType: null` — into the dispatch universe at all; under the all-approve script it was absent,
which is why the mutant survived in v1. The new AC-1.2 test asserts both halves separately: the
production `injectHere` is false for every such dispatch (the seam), and the CR optimizer's
composed prompt carries no block (the served artifact), plus two controls — the case occurred,
and the run did inject elsewhere (`:895-931`).

**F-03 (the committed baseline was never compared to a composed prompt) — RESOLVED.**
`learningsBaselineGuard.test.js:167-354` reads the fixture bytes off disk
(`baselineBytes(caseId, i)`) and compares them to prompts composed by branch code at HEAD, across
all four non-injecting states of PLAN §DoD item 4 (DISABLED / EMPTY / UNLISTABLE /
ADMITS-NOTHING) × two capture scenarios. Kill-tested (E-3): a one-character change to the
reviewer prompt literal (`orchestrate-dev.js:10711`) reds four of these tests. The subject is
branch code and the expected value is merge-base bytes on disk — an expected value that cannot
be derived from the code under test, which is exactly what v1 asked for.

**F-04 (`RSN-NO-MATERIAL` carried an unspec'd second conjunct) — RESOLVED.**
`hasAnySectionHeadingLine` is deleted and the branch is the single predicate TSPEC §T.6 states
(`orchestrate-dev.js:2458`). Re-introducing the conjunct reds a dedicated new test —
`learningsSelect` › `LI-AT-28 (second disjunct shape) — a document with NO section heading line
at all is dropped RSN-NO-MATERIAL on the same branch, consumes no slot, and never displaces a
contributor` (E-2). The three ordering ATs whose corpora were heading-less
(`LI-AT-04`/`09`/`10`) now build documents carrying a BR-6 priority section and each carries the
control `selected.every((d) => d.bytes > 0)` (`learningsSelect.test.js:94`, `:222`,
`:271`), so the orderings they assert now order documents that actually contribute a byte.

**F-05 (the shipped runtime bundle had drifted; a committed test was red at HEAD) — RESOLVED.**
`build-runtime.mjs --check` exits 0 and `consolidationBuild.test.js` is green in the full run.
`edac08ed` is the rebuild commit and `pdlc/workflows/dist/pdlc-cli.mjs` carries the
`isLearningsSelfPath` hunk, satisfying DEC-08's rebuild-and-stage rule.

## Delta Verification — v1's Medium and Low findings

**F-06 (multi-section per-document cut had no oracle) — RESOLVED.** `learningsBlock.test.js:148-198`
adds the two-section LI-AT-12 case with the bound landing eight bytes inside section 2's heading.
Expected values are hand-computed from the fixture and shown as arithmetic (50 + 2 + 44 = 96;
cut at 60), the material is asserted as a literal string, and `sections` is asserted by
`toEqual` — set equality in priority order, so a change from "cut the assembled string" to "omit
the overflowing section whole" reds. The unbounded control (`bytes: 96`, `bounded: false`)
proves the 60 is the cut's doing. The FSPEC/TSPEC divergence this exposes is still open upstream
and re-emitted as `ERRATUM: FSPEC`.

**F-07 (an implementation-invented reason-id rule, and an expected value tuned to it) — RESOLVED.**
The `propagateBytes` guard is deleted; overflow documents are unconditionally `RSN-COUNT`
(`orchestrate-dev.js:2519`), which is what BR-5 and AC-3.2's cause-defined ids actually say.
`LI-AT-13`'s comment no longer justifies `4973` by keeping the byte failure off the window's last
slot (`learningsSelect.test.js:291-305`), and a new companion test holds the corpus fixed while
moving the first byte failure between window index 4 and index 2, asserting the full
path→reason map by `toEqual` at both positions (`:380-465`) — set equality over the whole
enumeration, so a deleted or relabelled row reds. `LI-AT-07`'s expectations were corrected in the
same pass: `RSN-COUNT` rows are now `8 - maxDocuments` rather than the zero the deleted guard had
been hiding (`:124-146`).

**F-08 (the composition-site set-equality test's clause (b) was a tautology) — RESOLVED.** The
probe now carries the production decision — `_recordDocType(docType, injectHere, dispatchKind)`
(`orchestrate-dev.js:10302`) — and `acceptedDocTypes` is populated from `injectHere === true`
rather than from the test's own re-application of the hand-transcribed literal
(`learningsDispatchSet.test.js:675-684`). The literal survives as the *expected* value of a set
the production code computed. Two controls were added
(`observedDocTypes.length > acceptedDocTypes.length`, and `null` is among the observed). This is
the repair that makes F-02's mutant die at this seam as well as at the dedicated AC-1.2 test
(E-1). The three-argument signature is backward-compatible: the shipped default is a
one-argument `() => {}` and every pre-existing caller is unaffected (full suite green).

**F-09 (a null ordering key renders the literal `null` in the prompt) — STILL OPEN, still Low.**
`orchestrate-dev.js:2548` interpolates `doc.orderKey` unguarded, so a document with material but
no parseable `Date Completed` renders `completed null` into an author's prompt. Unchanged in this
delta and carried forward below as F-01. TSPEC §OQ.1 does not state the rendering for that case;
re-emitted as `ERRATUM: TSPEC`.

### Collateral checks on the revision's other changes

The delta also lands three PM-round repairs that touch code this lens covers; none regresses
anything v1 approved.

- **Injection moved after `selection`** (`orchestrate-dev.js:10340-10349`) so the dispatch record's
  `mode` is this episode's actual mode. Verified: `mode` is consumed only by the record
  (`buildLearningsInjector`'s `record` object), never by `renderLearningsBlock`, so no composed
  prompt byte moves — which is why the F-03 baseline oracles above still hold on all four states.
  The call is still once per episode and still outside the `for(;;)` loop, and the BR-1 decision
  and its probe remain at the original site before any review-state I/O. Its test drives
  `mainDev` and asserts set equality over `selectMode`'s two-member codomain with both members
  observed in one run (`learningsDispatchSet.test.js:600-644`).
- **AC-5.2's read/write halves** (`learningsDispatchSet.test.js:1084-1148`). The two BR-15 prefix
  clauses that were true by construction of `isCorpusPath` are replaced by an arm-difference
  instrument, with a control asserting the disabled arm really does open `docs/_decisions/` so the
  cancellation is meaningful. The write half is a set equality over both arms' `_writeFile`/
  `_appendFile` paths with no exemption list, plus the four named BR-15 forms.
- **`check-finding-grammar.sh` executed, not inventoried** (`hookCompatibility.test.js:434-544`):
  five cases spawning the real script by bare path through the real hook envelope, each pairing
  the negative (`nudgeOf(result)` is null) with a positive on the same path.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The baseline oracle's ADMITS-NOTHING arm cannot tell itself apart from EMPTY.** The block's own commentary says arm (4) "is the only arm where the injector actually opens a file and renders" and that "AC-6.2's named regression is undetectable without it" (`learningsBaselineGuard.test.js:196-200`), but nothing in that arm asserts the corpus document was enumerated, opened, or rejected. Verified (E-5): replacing arm (4)'s `stdout` with `""` — degrading it to a second EMPTY arm — leaves all 20 tests green. The premise the arm's value rests on is unasserted, so a change to `LEARNINGS_CORPUS_ARGV`, to the glob, or to `isLearningsEnumerateCall` silently deletes the arm's coverage while the file stays green. Fix: give arm (4) a per-arm control — record the `_readFile` paths and assert `docs/completed/li06-prior/LEARNINGS-li06-prior.md` was opened on that arm and on no other, or thread a sink and assert `corpusOutcome === null` with one `RSN-NO-MATERIAL` rejection row. | AC-5.1a, AC-6.2; `learningsBaselineGuard.test.js:255-268` |
| F-02 | Low | Local | **A null ordering key still renders the literal `null` into an author's prompt.** Carried unchanged from v1's F-09: `renderLearningsBlock` interpolates `doc.orderKey` unguarded (`orchestrate-dev.js:2548`), so a document with BR-6 material but no parseable `Date Completed` — the exact shape `LI-AT-10` establishes as eligible — produces `<<< … — feature X, completed null >>>`. Not a correctness defect of the selection rules and not gating; it is operator-visible text with no oracle over it because TSPEC §OQ.1 does not state the rendering for that case (re-emitted as `ERRATUM: TSPEC`). Once §OQ.1 states it, one assertion in `learningsBlock.test.js` closes it. | AC-1.4; `orchestrate-dev.js:2548` |

**Scope note.** Both findings are `Local`: F-01 is a control missing from one test block in this
feature, and F-02 waits on an upstream sentence about this feature's own rendered form. Neither
restates a DOMAIN-CONSTRAINT nor recurs across phases.

**No High findings are open.** v1's five are each killed by mutation (E-1..E-4), and the changed
sections introduced none.

## Evidence

**E-1 — F-02's mutant now dies.** With `orchestrate-dev.js:10293-10295` replaced by
`const injectHere = dispatchKind === "authoring";`:

```
✕ LI-20: the docType set observed at the composition site equals … and the accepted set equals
  LEARNINGS_TARGET_DOCTYPES — both set equality, never containment
✕ LI-20: AC-1.2 — Phase CR's optimizer is an authoring dispatch with docType null; injectHere is
  false for it and its composed prompt carries no block
Tests: 2 failed, 18 passed, 20 total
```

In v1 the same mutant left the whole repository green. File restored; `git diff --stat` empty.

**E-2 — F-04's conjunct cannot be reinstated.** Restoring a second conjunct on
`orchestrate-dev.js:2458` (`&& /^##\s/m.test(entry.text)`) reds exactly the test written for it:

```
● learningsSelect … › LI-16: LI-AT-28 (second disjunct shape) — a document with NO section
  heading line at all is dropped RSN-NO-MATERIAL on the same branch, consumes no slot, and never
  displaces a contributor
Tests: 1 failed, 120 passed, 121 total
```

**E-3 — F-03's baseline is a live oracle.** Changing one byte of the base reviewer prompt
literal (`orchestrate-dev.js:10711`, `This is iteration ${iteration}.` → `..`) reds the
`PHASE-R-REVIEW-PROMPTS` comparison on all four non-injecting states:
`Tests: 4 failed, 16 passed, 20 total`. In v1 no test read a fixture file at all.

**E-4 — the inertness ACs detect a leak.** Leaking an injected `sourcePath` into
`report.notices` at `buildFinalReport`'s assembly reds three tests at once:

```
✕ LI-20: LI-AT-29 — enabled vs. disabled: verdicts, completeness scores, round-window counters,
  approval anchors and erratum routes are equal member for member
✕ LI-21: LI-AT-23 — the author-emitted channels a run requires equal the recorded pre-feature
  baseline set …
✕ LI-20: LI-AT-35 — completeness criteria, required headings, verdict grammar, round windows and
  approval anchors are exactly those in force without the feature
Tests: 3 failed, 17 passed, 20 total
```

All three were unfalsifiable in v1 (five absent report keys, `null === null`).

**E-5 — F-01's gap.** Replacing the ADMITS-NOTHING arm's enumeration `stdout` with `""`
(`learningsBaselineGuard.test.js:260`) leaves `Tests: 20 passed, 20 total`.

**E-6 — suite state.** `npm test` in `pdlc/workflows`: `Tests: 1 failed, 70 skipped, 3978 passed,
4049 total`. The single red is `documentOracles.test.js:76` › AT-22, whose received rows are all
`.claude/worktrees/agent-*/docs/completed/**` paths — untracked parallel-reviewer worktrees the
`coveredViolations` walk does not skip. Not feature-attributable; identical in kind to v1's E-1.
`node pdlc/workflows/build-runtime.mjs --check` → `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`,
exit 0.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: is a per-arm control on ADMITS-NOTHING best written as a read-log assertion (the corpus path was opened on that arm only) or as a sink assertion (`corpusOutcome === null`, one `RSN-NO-MATERIAL` row)? The second also pins *why* the arm injects nothing, which is what makes it a different code path from EMPTY. |
| Q-02 | v1's Q-01 is answered — the gate inputs are read where they live and the production report was not grown to fit the oracle. v1's Q-02 is answered — the fixture is wired to a comparison across four states. v1's Q-03 is answered by deletion. Only v1's Q-04 remains open, and it is upstream: with `propagateBytes` gone, does FSPEC/REQ agree that a document cut by the count bound carries `RSN-COUNT` regardless of the window's byte outcome? The implementation and its tests now both assume so, and the two `ERRATUM` lines below ask upstream to say it. |

## Positive Observations

- **Every High repair was verified by its own falsifier, not by its own assertion.** Each of the
  four code-level repairs reds when the defect is restored (E-1..E-4). That is the standard this
  lens asks for and it was met without prompting — the AC-1.2 test's own comment even states the
  mutant it exists to kill.
- **The composition-site probe repair is the structurally right one.** Passing `injectHere` to
  `_recordDocType` moved the test from "re-derive the decision" to "observe the decision", which
  is what turned one tautology into the falsifier for two separate tests. The hand-transcribed
  literal was kept as the expected value rather than replaced by an import — no implementation
  echo was introduced while removing one.
- **`reviseOnceInPhases` widened the dispatch universe rather than faking a dispatch.** The case
  AC-1.2 names is now reached by driving the real pipeline to a "Needs revision" round, off the
  reviewer prompt's own opening line, instead of by constructing a synthetic call. The two
  scenarios that need it say why in-line.
- **The baseline oracle is the strongest instrument added in this round.** Subject = branch code
  at HEAD, expected value = merge-base bytes on disk, across four non-injecting states × two
  capture scenarios, with a dedicated "the instrument fires" test asserting the fixture is
  non-trivial and that an altered prompt would not compare equal. F-01 is a control missing from
  one arm of an otherwise exemplary block.
- **The F-07 companion test is a model of a cause-based oracle.** It holds the corpus fixed,
  moves the failure position, and asserts the complete path→reason map by `toEqual` at both
  positions — set equality over the full enumeration, with the arithmetic behind `4973` shown so
  the expected values are transcribed rather than observed.
- **Negative claims are consistently paired now.** AC-3.4's "nowhere else in the report" is paired
  with "the path IS in BR-8's rows"; BR-15's two prefix clauses are paired with "the disabled arm
  does open `docs/_decisions/`"; the CR optimizer's "carries no block" is paired with "this run
  did inject somewhere". The absence-only oracles v1 flagged are gone.

## Recommendation

**Approved with minor changes**

All five High findings from v1 are resolved, each confirmed by restoring the defect and observing
a red (E-1..E-4). The revision introduced no new High finding in the changed sections, and the
one repository red that remains is the environmental `coveredViolations` walk over untracked
agent worktrees, not this feature's (E-6). The shipped runtime bundle is back in sync, so the
DoD's rebuild-and-stage rule (DEC-08) is satisfied.

Two non-gating items are recorded: F-01 (Medium) — give the baseline oracle's ADMITS-NOTHING arm
a control so it cannot silently degrade into a second EMPTY arm; F-02 (Low) — the unguarded
`orderKey` interpolation, which waits on a TSPEC sentence. Neither blocks; both are cheap and
F-01 is worth taking in the optimizer loop, since it protects the strongest instrument this
feature added.

Three upstream divergences this implementation surfaces remain open in documents this review does
not own, and are emitted as `ERRATUM:` lines rather than folded into this verdict: FSPEC BR-6's
section-granular per-document cut versus TSPEC §D.3's assembled-string cut; the absence of any
upstream statement of the reason id for a document cut by the count bound when the total bound
also fails inside the window; and TSPEC §T.4's claim that each bound is asserted not to bind where
the other does, which the `BYTES-BINDING` fixture (8 documents against `maxDocuments: 5`)
contradicts. TSPEC §OQ.1's silence on rendering a null `orderKey` is the fourth.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
