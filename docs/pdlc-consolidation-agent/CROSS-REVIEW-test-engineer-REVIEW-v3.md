# Cross-Review: test-engineer — REVIEW (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/` and the implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 3
**Scope:** Delta re-review of the Final Codebase Review — testing lens only (oracle falsifiability, production-path coverage, enumeration completeness)

## Method

Round-3 protocol: re-read my own round-2 file, diffed the tree from the commit that closed
round 2, re-verified only what I had left open, and checked whether the round-3 revision broke
anything. Convergence question, not a fresh audit.

1. **Round-2 baseline.** Round 2 closed at `0b62dc90`
   (`docs(review): te REVIEW v2 — recommendation and verdict`), verdict *Approved with minor
   changes* on three residual Lows (F-12, F-13, F-14).
2. **Diffed from there.** `git log --oneline 0b62dc90..HEAD` is five commits: the PM's own
   round-2 file in three parts, then two remediation commits — `d0e19888`
   (`fix(consolidation): bar rejections are a filter, not a degradation`), which carries PM
   G-01/G-02/G-03 **and** my F-12/F-13, and `4ef6fe71`, which carries F-14.
3. **Re-verified at HEAD**, reading the code rather than trusting the commit subjects.
4. **Suite and artifacts.** `npm test` at HEAD: **101 suites, 3893 passed, 1 failed** — the
   failure is `documentOracles.test.js` AT-22 on `.serena/cache/…​.pkl` and
   `.tokensave/tokensave.db`, untracked local tool caches, the false red CLAUDE.md documents
   explicitly. `node pdlc/workflows/build-runtime.mjs --check` reports all five artifacts
   `in-sync`, so the bundle rebuilt with the production change.
5. **Re-verified again after the DOD round-1 remediation landed.** This file was first written at
   `654f2bec`; the branch then took 26 further commits, of which `76476315`
   (`fix(pdlc-consolidation-agent): DOD round 1 remediation`) moved 192 lines of
   `consolidate-learnings.js` and added `consolidationTotality.test.js`. I re-ran the suite at the
   new HEAD — **102 suites, 4215 passed, 70 skipped, 1 failed**, the same `documentOracles` AT-22
   untracked-cache false red and nothing else — and re-read every line this file cites. **No
   finding below changed status; all four still hold, and every `file:line` in the tables has been
   re-measured at the current HEAD** rather than left at its `654f2bec` value. Two substantive
   re-checks: the AC-5.4 diversion still pushes `reason: null` *without* `declined: true`
   (`consolidate-learnings.js:854`) and so still darkens the status at `:1002`, so F-18 is unfixed;
   and `consolidationTotality.test.js` — the largest new suite — exercises totality of the pure
   exports, not the declined/degraded discrimination, so it does not close F-17.

## Status of round-2 findings

All three were Lows and none gated; all three are closed at HEAD.

| Round-2 ID | Severity | Status at HEAD | Evidence read |
|---|---|---|---|
| F-12 | Low | **Resolved.** The bare `/not found/` alternative is gone from `REPOSITORY_UNRESOLVED_RE`, which now lists only `repository not found`, `does not exist`, `could not read from remote repository`, `access rights` — so git's DNS-failure stderr on the `unable to access` path no longer misclassifies E-23 as E-22. The fix came with the control I asked for: a transport-class leg whose stderr *contains* "not found" (`fatal: unable to access '…': server not found`) and must stay `api-failure`, driven through `openClone` itself rather than a hand-built state. It is a real discrimination row, not a second phrasing of the existing one. | `consolidate-learnings.js:2487-2488` (re-measured at HEAD); `consolidationReport.test.js:553-560` |
| F-13 | Low | **Resolved.** The four suite headers no longer describe their subjects as throwing `notImplemented`; each now names the row that implemented them (T25/T26/T28/T31) and the commit that deleted the symbol. Two of them (`consolidationPass`, `consolidationProperties`) went further than asked and state that no oracle below is weakened on account of an unimplemented subject, which is the sentence that stops the comment from re-acquiring its old excuse. Nothing in `pdlc/workflows/` references `notImplemented` outside these four historical notes. | `consolidationPass.test.js:18-19`; `consolidationProperties.test.js:12-14`; `consolidationIdentity.test.js:13-14`; `consolidationPredicate.test.js:12-13` |
| F-14 | Low | **Resolved as filed.** The finding asked for the fact to be recorded, not for the field to be wired, and that is what landed: the comment at the field states that AT-M5 is its only reader at HEAD, that step 15's commit reads `state.writeSet` and not this snapshot, and names the wiring (report item 8 or the terminal row) that would retire the note. A later reader cannot now mistake it for load-bearing output. | `consolidate-learnings.js:1260-1264` (re-measured at HEAD) |

## Findings

Round-3 findings are about the round-3 change only — the `declined` split, the proposal-file
separator and the `promotionSources` matcher. **No Highs. Nothing here blocks.**

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-15 | Medium | Local | **A fourth proposal-file cause landed in production while the spec's "only when" enumeration still names three.** FSPEC §5.3 says the proposal file is written "when, and only when" the pass has one of three causes (§6.3 PR-open failure, AC-5.4 retirement, §9 widening) and adds, emphatically, that "the file's existence is decided by the three rows above and by nothing else". HEAD writes the file whenever `deferred.length > 0` and now renders bar-declined items in it under their own heading — a fourth cause, and one that can occur on a **`promoted`** pass, a combination §5.3's table admits nowhere. The testing consequence is the one I care about: **AT-R7 is the "only when" oracle**, and its three fixtures are all drawn from the three-row enumeration, so it verifies the closure of a set that production has since widened. A pass whose *only* deferral is a bar rejection now writes a proposal file and no test asserts that the write is intended rather than a leak. This is a document defect, not a code defect — the behaviour is what PM G-02 asked for — so it is routed as an erratum against FSPEC (see the trailer) rather than fixed here. Recommended once the erratum lands: extend AT-R7 with a fourth fixture (bar-declined only ⇒ file written under the declined heading), so the enumeration is asserted at its new size. | FSPEC §5.3 `:722-748`, §2.2 step 9 `:2522`; `consolidate-learnings.js:984-988` (re-measured at HEAD) |
| F-16 | Low | Local | **`matchesFeatureToken`'s fallback branch is unreachable at HEAD, untested, and stricter than its own docstring.** The corpus pathspec is `:(glob)docs/*/LEARNINGS-*.md` and `:(glob)docs/completed/*/LEARNINGS-*.md`, so every consumed basename satisfies `/^LEARNINGS-(.+)\.md$/i` and the slot branch always wins; the `RegExp` fallback below it cannot run in production. It is also self-narrowing if it ever did: the boundary class is `[^a-z0-9-]`, which **excludes the hyphen**, so a hyphen-separated basename like `NOTES-feat-a.md` would not match feature `feat-a` at all — while the docstring one line above describes it as a "`[a-z0-9]`-bounded token match". The failure is benign (no match ⇒ `promotionSources` returns the whole consumed set, the honest fallback), which is exactly why nothing reds. Either drop the branch and let a non-conforming basename fall through to `all` explicitly, or keep it and correct the docstring to the class the code actually uses. | `consolidate-learnings.js:1118-1119` vs docstring `:1107-1108`, corpus pathspec `:1284-1285` (re-measured at HEAD) |
| F-18 | Medium | Local | **The G-01 argument was applied to one of the two reason-free deferral kinds, and the other's status is asserted nowhere.** There are two `reason: null` deferrals in `main()`: the AC-2.3 bar rejection, now marked `declined` and excluded from the derivation, and the **AC-5.4 propose-only diversion** at `:854`, which is not marked and so still darkens a pass to `promoted-degraded`. On the commit's own reasoning that ought to be examined: FSPEC §8.6 calls the diversion "the same propose-only path as making" the promotion, it fires no §6.3 fallback class and carries no reason code — the three properties that made a bar rejection a filter rather than a failure. I am not asserting the shipped value is wrong; I am reporting that **no test pins it either way**. The one suite that touches propose-only routing (T31) builds its states by hand with `status` supplied as a fixture value, so it never exercises `main()`'s step-14 derivation for this kind. The result is a status that will be decided by whoever next edits `:1002`, silently. Either mark the diversion `declined` too and add its mixed-pass row beside G-01's, or add a row asserting `promoted-degraded` verbatim on an enacted+diverted pass so the asymmetry is deliberate and guarded. | `consolidate-learnings.js:854`, `:1002` (re-measured at HEAD); FSPEC §8.6 `:1623-1634`; `consolidationReport.test.js:622-660` |
| F-17 | Low | Local | **The declined/degraded split has no property-level guard, only two example rows.** `declined` is now the flag that decides a terminal status, and the discrimination rests on two hand-built fixtures (mixed-declined ⇒ `promoted`, mixed-degraded ⇒ `promoted-degraded`). Both are good rows — see the positives — but the invariant behind them is parameterisable and stated: *a deferral with a `reason` code darkens the status; a deferral with `reason: null` and `declined: true` does not*. Over generated mixtures of enacted/declined/degraded proposals that is a property (`status === "promoted-degraded"` iff at least one deferral carries a reason code), and this feature already runs generated properties in `consolidationProperties.test.js`. As it stands a third deferral kind added later — one that sets neither flag the way the two current kinds do — is green until someone writes its example row by hand. | `consolidate-learnings.js:1002`, `:840-848`, `:854` (re-measured at HEAD); `consolidationOperatorChannels.test.js:500-587` |

## Questions

| ID | Question |
|----|---------|
| Q-06 | Is the AC-5.4 propose-only diversion's `promoted-degraded` status a decision or an accident (F-18)? If it is a decision, the difference from a bar rejection is worth one sentence at `:952` — both are reason-free, and only one is now filtered out. |
| Q-07 | *(carried, unchanged)* Q-05 from round 2 — `sync-workflows.sh --check` exiting non-zero while naming no drifted row — is still outside this feature's diff and still worth someone's attention when the drift ladder's reporting is next touched. Not a gate on this branch. |

## Positive Observations

- **G-01's fix is grounded in the vocabulary, not in the reviewer's preference.** The comment at
  `:946-952` cites `duplicate-suppressed` as the controlling precedent — a verdict decided per
  proposal *before* any route is attempted, which FSPEC §6.3 at `:898-899` already excludes from the
  failure table. The change reasons from an existing precedent rather than inventing a rule for the
  case at hand, which is why it reads as a narrowing rather than a weakening.
- **The status row came with its own control, unprompted.** The mixed-declined row asserts
  `promoted` verbatim, and a second row asserts `promoted-degraded` verbatim on an
  enacted-plus-genuinely-degraded pass whose deferral carries a reason code
  (`consolidationOperatorChannels.test.js:551-587`). Without that control the fix would be
  indistinguishable from deleting the derivation — which is the standard failure mode of "make this
  status stop appearing" remediations, and it did not happen here.
- **Non-vacuity conjuncts are in the fixture, not assumed.** The mixed pass asserts a `constraints`
  record exists *and* `deferred` has length 1 *before* asserting the status
  (`consolidationOperatorChannels.test.js:534-539`), so the `promoted` assertion cannot pass on a
  build that silently dropped the declined cluster instead of deferring it — precisely the outcome
  the AC-2.3 bar exists to prevent.
- **G-02's oracle is a discrimination, not a containment.** The proposal-file test splits the file
  on the separator and asserts the declined detail is present **below** and absent **above**
  (`:604-613`), with a comment saying why a whole-file `toContain` would pass on the interleaved
  file the finding is about. That is the third time this branch has reached for the split-and-assert
  shape rather than the easy containment.
- **F-12's control is the transport phrasing, not another repository phrasing.** The new leg feeds
  git's real DNS-failure stderr (`fatal: unable to access '…': server not found`) through
  `openClone` itself and requires `api-failure`, so the E-23 → E-22 boundary is now pinned by a case
  that would have been red against the old regex — a falsifying test for the fix, in the same
  revision as the fix.
- **G-03's row asserts both directions on one line.** The cited sources line must contain
  `LEARNINGS-feat-a.md` and `LEARNINGS-feat-beta.md` and must not contain `LEARNINGS-feat-alpha.md`
  (`:657-661`), read off the rendered body rather than from the matcher — a black-box oracle over
  the operator-visible artifact, with the prefix-related third file present in the corpus so the
  negative half is not vacuous.

## Recommendation

**Approved with minor changes**

All three round-2 Lows are closed, and closed the way they were filed — F-12 with a falsifying
control rather than a regex edit alone, F-13 in all four headers, F-14 as the record it asked for.
Nothing regressed: the suite is green apart from `documentOracles` AT-22, whose violations are the
untracked local tool caches CLAUDE.md documents as a known false red, and
`build-runtime.mjs --check` reports all five artifacts in sync, so the shipped bundle carries the
production change rather than lagging it.

The round-3 remediation itself is sound work in this lens. The status narrowing is argued from an
existing vocabulary precedent, and it landed with the control that distinguishes "narrowed" from
"deleted" — the single most common way a status-suppression fix goes wrong, avoided without being
asked.

Four findings, none blocking:

1. **F-15 (Medium)** is a document defect, not a code defect: production now writes the proposal
   file for a fourth cause on a `promoted` pass, while FSPEC §5.3's "and only when" enumeration
   still names three and AT-R7 verifies the closure of the smaller set. Routed upstream as an
   erratum; the AT-R7 fourth fixture follows the erratum rather than preceding it.
2. **F-18 (Medium)** is the sibling case: the AC-5.4 propose-only diversion is the other reason-free
   deferral, it was not marked `declined`, and no test pins the status it produces either way.
3. **F-16 (Low)** is a dead, untested branch whose docstring and boundary class disagree.
4. **F-17 (Low)** wants the declined/degraded discrimination expressed as a property over generated
   mixtures, not only as two example rows.

None of the four hides a defect in shipped behaviour, and none is worth another round on its own.
F-15's erratum should land before the branch ships, since it is the document a future reader will
consult to decide whether the proposal file's existence is a bug.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
