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

## Status of round-2 findings

All three were Lows and none gated; all three are closed at HEAD.

| Round-2 ID | Severity | Status at HEAD | Evidence read |
|---|---|---|---|
| F-12 | Low | **Resolved.** The bare `/not found/` alternative is gone from `REPOSITORY_UNRESOLVED_RE`, which now lists only `repository not found`, `does not exist`, `could not read from remote repository`, `access rights` — so git's DNS-failure stderr on the `unable to access` path no longer misclassifies E-23 as E-22. The fix came with the control I asked for: a transport-class leg whose stderr *contains* "not found" (`fatal: unable to access '…': server not found`) and must stay `api-failure`, driven through `openClone` itself rather than a hand-built state. It is a real discrimination row, not a second phrasing of the existing one. | `consolidate-learnings.js:2521-2522`; `consolidationReport.test.js:469-484` |
| F-13 | Low | **Resolved.** The four suite headers no longer describe their subjects as throwing `notImplemented`; each now names the row that implemented them (T25/T26/T28/T31) and the commit that deleted the symbol. Two of them (`consolidationPass`, `consolidationProperties`) went further than asked and state that no oracle below is weakened on account of an unimplemented subject, which is the sentence that stops the comment from re-acquiring its old excuse. Nothing in `pdlc/workflows/` references `notImplemented` outside these four historical notes. | `consolidationPass.test.js:18-19`; `consolidationProperties.test.js:12-14`; `consolidationIdentity.test.js:13-14`; `consolidationPredicate.test.js:12-13` |
| F-14 | Low | **Resolved as filed.** The finding asked for the fact to be recorded, not for the field to be wired, and that is what landed: the comment at the field states that AT-M5 is its only reader at HEAD, that step 15's commit reads `state.writeSet` and not this snapshot, and names the wiring (report item 8 or the terminal row) that would retire the note. A later reader cannot now mistake it for load-bearing output. | `consolidate-learnings.js:1233-1240` |

## Findings

Round-3 findings are about the round-3 change only — the `declined` split, the proposal-file
separator and the `promotionSources` matcher. **No Highs. Nothing here blocks.**

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-15 | Medium | Local | **A fourth proposal-file cause landed in production while the spec's "only when" enumeration still names three.** FSPEC §5.3 says the proposal file is written "when, and only when" the pass has one of three causes (§6.3 PR-open failure, AC-5.4 retirement, §9 widening) and adds, emphatically, that "the file's existence is decided by the three rows above and by nothing else". HEAD writes the file whenever `deferred.length > 0` and now renders bar-declined items in it under their own heading — a fourth cause, and one that can occur on a **`promoted`** pass, a combination §5.3's table admits nowhere. The testing consequence is the one I care about: **AT-R7 is the "only when" oracle**, and its three fixtures are all drawn from the three-row enumeration, so it verifies the closure of a set that production has since widened. A pass whose *only* deferral is a bar rejection now writes a proposal file and no test asserts that the write is intended rather than a leak. This is a document defect, not a code defect — the behaviour is what PM G-02 asked for — so it is routed as an erratum against FSPEC (see the trailer) rather than fixed here. Recommended once the erratum lands: extend AT-R7 with a fourth fixture (bar-declined only ⇒ file written under the declined heading), so the enumeration is asserted at its new size. | FSPEC §5.3 `:722-748`, §2.2 step 9 `:2522`; `consolidate-learnings.js:937-939` |
| F-16 | Low | Local | **`matchesFeatureToken`'s fallback branch is unreachable at HEAD, untested, and stricter than its own docstring.** The corpus pathspec is `:(glob)docs/*/LEARNINGS-*.md` and `:(glob)docs/completed/*/LEARNINGS-*.md`, so every consumed basename satisfies `/^LEARNINGS-(.+)\.md$/i` and the slot branch always wins; the `RegExp` fallback below it cannot run in production. It is also self-narrowing if it ever did: the boundary class is `[^a-z0-9-]`, which **excludes the hyphen**, so a hyphen-separated basename like `NOTES-feat-a.md` would not match feature `feat-a` at all — while the docstring one line above describes it as a "`[a-z0-9]`-bounded token match". The failure is benign (no match ⇒ `promotionSources` returns the whole consumed set, the honest fallback), which is exactly why nothing reds. Either drop the branch and let a non-conforming basename fall through to `all` explicitly, or keep it and correct the docstring to the class the code actually uses. | `consolidate-learnings.js:1088-1093` vs `:1080-1082`, corpus pathspec `:1258-1259` |
| F-18 | Medium | Local | **The G-01 argument was applied to one of the two reason-free deferral kinds, and the other's status is asserted nowhere.** There are two `reason: null` deferrals in `main()`: the AC-2.3 bar rejection, now marked `declined` and excluded from the derivation, and the **AC-5.4 propose-only diversion** at `:808`, which is not marked and so still darkens a pass to `promoted-degraded`. On the commit's own reasoning that ought to be examined: FSPEC §8.6 calls the diversion "the same propose-only path as making" the promotion, it fires no §6.3 fallback class and carries no reason code — the three properties that made a bar rejection a filter rather than a failure. I am not asserting the shipped value is wrong; I am reporting that **no test pins it either way**. The one suite that touches propose-only routing (T31) builds its states by hand with `status` supplied as a fixture value, so it never exercises `main()`'s step-14 derivation for this kind. The result is a status that will be decided by whoever next edits `:952`, silently. Either mark the diversion `declined` too and add its mixed-pass row beside G-01's, or add a row asserting `promoted-degraded` verbatim on an enacted+diverted pass so the asymmetry is deliberate and guarded. | `consolidate-learnings.js:808`, `:952`; FSPEC §8.6 `:1623-1634`; `consolidationReport.test.js:622-660` |
| F-17 | Low | Local | **The declined/degraded split has no property-level guard, only two example rows.** `declined` is now the flag that decides a terminal status, and the discrimination rests on two hand-built fixtures (mixed-declined ⇒ `promoted`, mixed-degraded ⇒ `promoted-degraded`). Both are good rows — see the positives — but the invariant behind them is parameterisable and stated: *a deferral with a `reason` code darkens the status; a deferral with `reason: null` and `declined: true` does not*. Over generated mixtures of enacted/declined/degraded proposals that is a property (`status === "promoted-degraded"` iff at least one deferral carries a reason code), and this feature already runs generated properties in `consolidationProperties.test.js`. As it stands a third deferral kind added later — one that sets neither flag the way the two current kinds do — is green until someone writes its example row by hand. | `consolidate-learnings.js:952`, `:797-802`, `:826`; `consolidationOperatorChannels.test.js:500-587` |

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Verdict

*(pending)*
