# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.2)
**Upstream read:** `REQ-pdlc-headless-engine.md`; `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-07)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v2.md` (2 High, 1 Medium, 1 Low)
**Diff reviewed:** `dee5787c..HEAD` on the TSPEC (+263/−36)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** delta re-review — v2 findings and the sections v1.2 changed; unchanged sections not re-litigated

## Disposition of v2

Both Highs are closed, and closed at the root rather than in the assertions that consumed them —
which is what I asked for. Every citation the fixes rest on I re-read at HEAD.

| v2 finding | Subject | v1.2's answer | Status |
|---|---|---|---|
| F-01 High | §7.4's model-map harness asserted over a key (`(phase, model)` pairs) the run cannot produce; AC-3.3's reverse direction unowned | §7.4 restated as AC-3.3's own two directions — forward containment over model values, reverse a per-row witness table with all seven rows transcribed literally; rows 1/2 asserted as the *quantifiers* they are, row 4 discriminated by `seq` ordering plus the forced resolution error, rows 6/7 by `corpusRun` + `skill` | **Resolved, and it now matches AC-3.3's own wording rather than a stronger paraphrase.** `REQ:483-486` defines the equality as exactly "every dispatch descriptor's model value … appears in the map, and every map row is exercised by at least one descriptor" — containment plus per-row witness *is* the criterion, not a weakening of it. Witnesses check out: row 1 `pdlc-engine-baseline.md:132`; row 4's fallback is a second `dispatchAt` on the rejection path (`orchestrate-dev.js:1841` inside `dispatchAt`, `:1851` primary, `:1861` fallback), so the fable descriptor really does immediately precede the opus one by `seq`; row 5's queue triage really is `se-author` under `MODEL_QUEUE` (`orchestrate-queue.js:1216`, `:1053`, `:70`) announced under `"Queue: Triage"` (`:1170`) which normalises to `"Queue"` |
| F-02 High | `DispatchCounts.byPhase` keyed on `label`, which is `null` at every dispatch site, so FSPEC §12.2's per-phase row would be one bucket | §4.1 takes the phase from the `_phase` seam held as adapter run state and stamps it on the descriptor; §4.4 rekeys `byPhase`, `RetryRow` and `authSources` on it and keeps `label` only where it is honestly a log tag; §8.3 gains the adapter row and justifies the workflows-untouched claim | **Resolved.** The `_phase` call sites are all real and all shaped `"{Phase}: {detail}"` — `orchestrate-dev.js:9516`, `:9951`, `:10066`, `:10136`, `:10248`, `:10289`, `:10314`, `:10445`, `:10500`, `:10573`; `orchestrate-queue.js:1065`, `:1130`, `:1144`, `:1170`, `:1400` — so the prefix-to-first-colon normalisation is total over them. The adapter's `_phase` does only log today (`adapter.mjs:357-359`), and the stale comment (`:266-268`) is now on §8.3's edit surface. The delegated pipeline keeps its phase provenance because the engine wraps `_runPipeline` and injects `adapter._phase` (`run.mjs:114-121`), which the queue itself could not have supplied (`orchestrate-queue.js:1420` passes `{ reqPath }` alone) — one detail I had not checked in v2 and that holds |
| F-03 Medium | `loop.stopReason` silent on `runQueueLoop`'s refusal and non-`ran` exits | Third member `"stopped"` plus `loop.lastOutcome`, with AC-1.3's two kept as the only members reachable on a zero-exit loop | **Resolved.** `run.mjs:277-278` (`refused`), `:280` (`outcome \|\| "unknown"`), `:282` (`max-passes`) are all now named. AC-4.5's "names which of AC-1.3's two stop reasons ended the loop" (`REQ:570`) still reads true |
| F-04 Low | `loop.maxIterations` stated as `null` while the value in flight is `Infinity` | Conversion made explicit where the block is assembled, with a test on the in-memory object rather than the round-tripped JSON | **Resolved as asked** |

## Findings

No High findings. The one Medium is a contradiction the revision introduced between a section it
changed (§3.4) and one it did not (§4.1) — worth naming because the field they disagree about is an
operator-facing tunable, but it is a sentence and an oracle half, not a design gap.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§3.4 and §4.1 now disagree about whether `timeoutMs` reaches a dispatch, and the weaker of the two readings leaves the operator's timeout tunable with no oracle.** §3.4's new two-part contract justifies containment-plus-`cwd`-presence on the grounds that "`model`, `timeoutMs` and `maxTurns` are each assigned only when defined (`adapter.mjs:278-281`)" — true at HEAD, where no module passes `timeoutMs` and the transport falls back to `defaultTimeoutMs` (`transport.mjs:152`). But §4.1's descriptor (unchanged this round) declares `timeoutMs: number, // dispatch.timeoutMinutes × 60 000 (§4.6)` — always present, engine-supplied — and §4.6's row says "`timeoutMs` arrives per dispatch". Both cannot hold. The product consequence sits on the report: `tunables.timeoutMinutes` is published as the *effective* value (§4.5, AC-4.5's FSPEC-added row, BR-CLI-3), and under §3.4's reading nothing asserts that value ever reaches a dispatch — the operator's `--timeout` could be delivered only as a constructor default, or not at all, and the boundary test would stay green either way. This is the same class as v2's F-04 (`Infinity`/`null`), which the revision fixed by stating the value at the point it is built. **Fix:** one sentence deciding which is true — if §4.1 is right, the presence half is `{ model, cwd, timeoutMs }` on every dispatch, not `cwd` alone, and `maxTurns` is the single declared-but-unreachable key; if §3.4 is right, §4.1 and §4.6 need correcting and the timeout tunable needs an oracle somewhere else. | AC-4.5, BR-CLI-3 |
| F-02 | Low | Local | **`byPhase` buckets merge across features in a `queue --loop` run, and the design does not say so.** §4.1's normalisation is per-run state and §4.4's counts bucket on it, so pass 2's `"Phase T"` dispatches land in pass 1's bucket. The queue does announce `` phaseFn(`Pipeline: ${entry.feature}`) `` (`orchestrate-queue.js:1400`) but that normalises to the constant `"Pipeline"`, so the feature name — the only thing that would separate the passes — is discarded by the very rule that makes waves collapse correctly. AC-4.5 asks for per-phase counts and says nothing about per-feature, so this is not a criterion gap; it is a report a multi-feature operator will misread, since `{ "Phase T": 12 }` after four features looks like one feature's phase went four times over budget. **Fix:** one sentence in §4.4 stating that counts are run-scoped and aggregate across loop passes (and, if cheap, that `loop.iterations` is the divisor a reader needs). | AC-1.3, AC-4.5 |
| F-03 | Low | Local | **§3.3's `SKILL_HARVEST` comment names one dispatch site; there are two.** The constant block cites `// :10542` for `harvest-learnings`, but the Phase-H dispatch at `orchestrate-dev.js:10448` (`wrappedDispatch({ skill: "harvest-learnings", … })`) is the primary one — `:10542` is the advisory-distil call. This is the same omission the revision fixed for `SKILL_SE_IMPLEMENT` this round (`:10028`, `:10068` added), so it is a sweep that stopped one identifier short. Nothing downstream breaks — the derived set is unaffected by site count, and §8.3's "bare skill literals replaced by those constants at their dispatch sites" already covers it generically — but an implementer reading the comment as the site list will leave `:10448` a bare literal and fail §3.3's own no-bare-literal test. **Fix:** add `:10448` to the comment. | AC-3.5 |

*(Checked and clean, so recorded here rather than as findings: §3.3's exemption allow-list is genuinely closed at HEAD — the only non-dispatch literals among the ten identifiers are `MAP`'s three keys at `orchestrate-dev.js:6229-6231`, which is exactly the table's one row. §3.3's rung-4 arithmetic is right: `EXPECTED_SKILLS` is 17 (`startup.mjs:19-38`), 10 dispatchable + 2 supplements + 5 operator-invoked, matching `REQ:509-512`.)*

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.1's `"(no phase)"` bucket is well designed as a visible failure, but the design says "at HEAD no such dispatch is expected" without naming who checks. Is a non-zero `"(no phase)"` count a *test* assertion in §7.4's suite-wide set, or an eyeball on the report? Both are defensible — the first makes it a gate, the second keeps it an observation — but as written a reader could implement either. |
| Q-02 | Row 4's witness reads "immediately preceding descriptor by `seq` is the same skill on `fable`". `resolveAdvisoryRung` memoises through `_state.resolved` (`orchestrate-dev.js:1845`), so only the *first* advisory dispatch of run iv produces the fable→opus pair; every later one is a bare `opus` dispatch with an arbitrary predecessor. The witness is existential, so it still holds — but if a future harness turns it into a quantified check over all `ADVISORY_RUNG_SKILL` descriptors it will be red on correct code. Worth a half-sentence noting the memo, so the reason the predicate is existential is on the record. |

## Positive Observations

- **Both Highs were fixed where they originated, not where they hurt.** The path of least resistance
  on F-01 was to loosen the model-map oracle until it passed; on F-02, to declare `byPhase` "best
  effort". The revision instead measured `opts.label` at every call site, found it `null`, and moved
  the phase onto a seam that already knew it. §4.1's measurement paragraph — 13 `label:` occurrences
  in `orchestrate-dev.js`, eight of them `PHASE_DISPATCH` row fields, none a dispatch argument — is
  the kind of sentence that makes a reviewer's re-check cheap, and it survived re-checking.
- **The `_phase`-as-run-state fix keeps §8.3's workflows-untouched promise true, and §8.3 now says
  why.** That closing paragraph ("had the modules been asked to pass labels, the workflow-module rows
  above would have to list the dispatch sites too, and this sentence would be false") converts a
  constraint that was previously an assertion into one with a stated mechanism. It is also the
  cheaper design on delivery: the alternative would have touched `pdlc/workflows/`, forcing a bundle
  rebuild and a self-modification-guard interaction in Phase MERGE.
- **§7.4's witness table is the right shape, and it argues its own limits.** Naming *why* the pair
  form was unwritable — row 1 is a quantifier, rows 1/4 are descriptor-identical, rows 6/7 carry no
  phase — is more useful than the fix itself, because it is the reasoning that stops the next author
  from "restoring" the stronger-looking assertion. Keeping rows 1 and 2 as *every*-quantified is what
  preserves the property AC-3.3 exists for (a phase that silently stops pinning), and the document
  says so explicitly rather than leaving it to be inferred.
- **§7.0's run-id correction is stated as a measured mistake, with the tempting bad repair named.**
  "It fails **by construction on every run**, and the tempting repair under time pressure is to scan
  all run directories and drop the emptiness guard" is exactly the note that keeps a future
  implementer from walking into it. Minting the id in a runner before any child exists is the right
  place; the inheritance self-test asserting *one* directory holding *both* files' records is a real
  positive assertion, not an absence check.
- **My Q-01 and Q-02 came back as a recorded open question and a recorded decision rather than as
  prose.** O-ENG-T5 names the two candidate answers and why the choice is a maintainer's; §3.3's
  narrowing paragraph states plainly that after `EXPECTED_SKILLS` is deleted nothing asserts the five
  operator-invoked skills are readable, and that this is the answer rather than an oversight. A
  question answered as "here is the decision and its cost" is worth more than one answered away.

## Recommendation

## Verdict
