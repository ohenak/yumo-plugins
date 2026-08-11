# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.7)
**Date:** 2026-08-11
**Iteration:** 4
**Scope:** delta re-review of the round-3 revision (`cffd701b`…`3c9cfc3e`) — round-3
disposition, then new-issue scan over changed sections only. Lens unchanged: oracle
derivability, oracle falsifiability, enumeration completeness.

## Round-3 disposition

| v3 finding | Sev | Status | Evidence in v0.7 |
|---|---|---|---|
| F-01 AC-2.4's *Given* did not pin the AC-2.1 fixture | Medium | **Resolved** | AC-2.4 now names the state exactly — "logged-in Claude Code settings state with `CLAUDE_CODE_OAUTH_TOKEN` absent from the environment" — and states *why* it selects row 4 rather than row 1 (`auth.oauth-token`). The expected banner id is now derivable from the *Given* alone, which is what the finding asked for |
| F-02 AC-3.3's prose declared three runs where the table needed four configurations | Medium | **Resolved**, and further than asked | The corpus is now five named configurations in M-ENG-07, with run iii (`fable` resolves) and run iv (resolution forced to fail) split into separate rows. The fallback path's condition verifies at HEAD: `isModelResolutionError` guards the fallback dispatch (`orchestrate-dev.js:1861`), so run iii alone cannot reach it |
| F-03 AC-3.3's `--dry-run` corpus could not reach the conditional dispatch sites | Medium | **Resolved at the mechanism, not by wording** | The corpus is redefined over **recorded dispatch descriptors** ("the model value a dispatch carries when composed"), not executed calls, and the single `haiku` row splits into its two real sites with the provocation each needs. Both verify at HEAD: `:7463` fires only from `recoverVerdict`, called at `:5992`/`:6001` under `if (verdict.malformed)`; `:9968` sits in the else-branch after `parsePlanTasks` returns no tasks (`:9960-9966`). Run v(a)/v(b) supply exactly those two provocations |
| F-04 finding-id back-references were unqualified across rounds | Low | **Resolved** | Every back-reference now carries its round — `TE v1 F-05`, `TE v2 F-02`, `TE v2 F-06`, `SE v1 F-11`, `SE v2 Q-05` and the rest, throughout the document and in the frontmatter comment |

Round-3 questions: Q-02 is answered by AC-4.2's new seventh row (`retryable`, `timeout`,
`timeout` → terminal at 3) and the row-6 continuation clause. Q-01 and Q-03 are re-asked below,
Q-01 unchanged.

**Citation re-verification.** Every literal the round touched or relocated was re-checked at
HEAD: `MODEL_DEFAULT` (`orchestrate-dev.js:1603`), `MODEL_IMPLEMENTATION` (`:1646`),
`MODEL_ADVISORY = "fable"` (`:1652`, dispatched `:1851`), `MODEL_ADVISORY_FALLBACK` (`:1653`,
dispatched `:1861`), both `haiku` sites (`:7463`, `:9968`), `MODEL_QUEUE`
(`orchestrate-queue.js:70`). A `grep` for `haiku` over the module returns exactly those two
lines, so M-ENG-07's seven rows are set-equal to the modules' pinned models, not merely
contained in them. AC-1.1's new claims also hold: Phase H deletes harvested files only after the
LEARNINGS commit is confirmed on remote (`:7609`), and `PHASE_DOD_ENABLED` is a module constant
(`:23`) reachable only through the `_phaseDodEnabled` seam (`:8937`) — no consumer-config switch,
as the AC states.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AC-1.1's new POSTMORTEM member contradicts its own *when*.** The *when* fixes a run that "runs end-to-end through the phases enabled by that repo's config", but clause 1(ii) now argues `POSTMORTEM-{phase}-{f}.md` is "reachable on a passing oracle" because clause 4 admits `halted`. Both cannot hold on one run: a run that halts in, say, Phase T never creates `PLAN`, `PROPERTIES` or `LEARNINGS`, so clause 1(i)'s set-equality over the phase-declared core fails on exactly the run that makes the POSTMORTEM member reachable. A TSPEC author pinning the AC-1.1 fixture must guess which run is meant, and the two choices need different expected sets. Fix in one clause: either scope clause 1(i) to "the phases the run actually reached, as the run report records" (which makes both clauses satisfiable together and keeps `halted` legal), or state that the *Given* fixes a non-halting run and that the POSTMORTEM member is a rule asserted vacuously here and exercised by AC-4.3's halt fixture instead | AC-1.1 clauses 1(ii), 4 |
| F-02 | Medium | Local | **AC-4.2's closing sentence claims a completeness the table does not have.** "Every observable sequence a test transcribes is a row" reads as a closed enumeration, and this REQ elsewhere earns that reading — AC-4.1 and AC-6.4 assert genuine set-equality over their catalogues. But legal sequences exist that are not rows: `retryable`, `retryable`, `timeout` (3 attempts, budget owes a fourth), and `timeout`, `retryable`, `timeout` (terminal by the cap at 3). A test author who builds a set-equality oracle over the eight rows fails a conforming engine on either. The eight rows are worked examples of two rules — the shared-budget rule and the per-run `timeout` cap — and those two rules are the real oracle. Call the table "worked examples, not a closed enumeration" and point the set-equality at the rules, or add the missing sequences | AC-4.2 |
| F-03 | Medium | Process | **The AC-3.3 fixture literals now live in a document that declares itself ungated.** AC-3.3's set-equality transcribes its expected values from M-ENG-07, and `docs/_constraints/pdlc-engine-baseline.md`'s header says "**Read-only reference, not a reviewed pipeline artifact.** No cross-review is written against it and nothing gates on it." That is now false in the direction that matters for testing: a load-bearing expected-value table gates on it, and the header simultaneously instructs readers not to re-litigate it. The relocation itself is good (the map verifies correct at HEAD, and the REQ got smaller), but the transcription source for an oracle should be inside the reviewed set or explicitly marked as gating. Fix: have AC-3.3 state that M-ENG-06/M-ENG-07 are load-bearing fixtures reviewed as part of this REQ's rounds, and correct the baseline header's "nothing gates on it" to name the exception. Tagged `Process` because the same pattern will recur for every fact pm-author §5e relocates | AC-3.3; `docs/_constraints/pdlc-engine-baseline.md` header |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(re-asked from rounds 2 and 3, AC-3.5 unchanged again)* AC-3.5 asserts set-equality between "the set of skill identifiers the modules can dispatch" and the prompt files present in the plugin. What supplies the left side at test time? At HEAD the engine holds a frozen 17-name list (`startup.mjs:20`) consumed by containment (`:102`), so an equality against that list proves the list matches disk, never that it matches what the modules dispatch. Is a third source intended — a static scan of the modules' dispatch sites — or is the frozen list itself the contract, in which case the AC is asserting something weaker than it says? |
| Q-02 | *(re-asked from rounds 2 and 3)* O-2 names hook/settings provenance as the largest open safety gap, while AC-5.1 requires guard refusal on **either** transport. If the SDK path turns out to accept no PreToolUse-equivalent, does AC-5.1 become a blocking gate on the primary transport — meaning the fallback becomes mandatory for any run that deletes artifacts? |
| Q-03 | M-ENG-07's run v pins two response fixtures, v(a) a malformed reviewer `VERDICT` trailer and v(b) a PLAN the in-script parser rejects. Recovery at `:5992`/`:6001` is best-effort — `recoverVerdict` returns `null` when the re-emit is itself malformed, and the loop proceeds. Should the corpus fix the recovered response too, so run v exercises the `haiku` descriptor on both the recovered and the still-malformed branch, or is the descriptor's presence enough for AC-3.3's purposes regardless of what recovery returns? |

## Positive Observations

- The corpus redefinition is the round's best change and it is a mechanism fix, not a wording
  fix. Moving from "three dry runs" to "recorded dispatch descriptors of five named
  configurations" makes the second direction of the set-equality — every map row exercised —
  satisfiable without billed traffic, which is exactly what AC-6.1 needs and what the previous
  two rounds could not deliver.
- Splitting the single `haiku` row into two sites with distinct provocations turned a row that
  no run could reach into two rows a fixture can force, and both provocations are real: the
  malformed-trailer branch and the unparseable-PLAN branch are the only two `haiku` dispatches
  in the module.
- AC-1.1 clause 1 is now genuinely closed. Enumerating every filename prefix the module writes
  under `docs/{f}/` — `REQ`, `FSPEC`, `TSPEC`, `DECISIONS`, `PLAN`, `PROPERTIES`,
  `CROSS-REVIEW`, `CODE_REVIEW`, `POSTMORTEM`, `LEARNINGS`, `ADVISORY` — returns nothing
  outside rules (i) and (ii). The closure sentence is now true rather than aspirational.
- Fixing the observation window at creation events is the subtler half of the same fix, and it
  is the right half: without it, clauses 1–3 would have failed on every successful run that
  reached Phase H, since harvest deletes the very files clause 2 asserts over.
- The round is size-negative while widening two enumerations. Relocating M-ENG-06 and M-ENG-07
  and citing by id kept every evidence line checkable — I re-verified nine citations through the
  baseline file without once needing the deleted REQ text.

## Recommendation

**Approved with minor changes**

All four round-3 findings are resolved, and two of them (F-02, F-03 on the AC-3.3 corpus) were
resolved at the mechanism rather than by re-wording — the corpus now reaches every map row
without a live call, which was the actual blocker behind both. Nothing previously approved
broke: AC-1.2(c)'s empty read-set, AC-2.1's ordered first-match list, AC-4.1's and AC-6.4's
set-equality catalogues, and AC-6.1's hermeticity gate survive the edit intact, and the
relocations to `docs/_constraints/pdlc-engine-baseline.md` are lossless — every citation I spot-
checked through the baseline file verifies at HEAD.

The three remaining findings are all one- to three-clause edits and none blocks TSPEC or
PROPERTIES authoring. F-01 and F-02 ask for scoping sentences that a TSPEC author would
otherwise have to invent while pinning fixtures, so they are worth folding into the next
revision rather than deferring; F-03 is a durable process concern about relocated facts becoming
oracles, and belongs in the harvest signal whether or not the header is corrected here.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 0}

APPROVAL-HASH: sha256:3a5cb4ea8904b1e35042d97b5a6356a30065d612db646b8f7c95698a7e984ea1
APPROVAL-HASH-NORMALIZED: sha256:cccf168cf5fb888b497ec8318c456f1b2de66f26b29231793b481f03baf2461f
REVIEWED-COMMIT: 3c9cfc3e8e068e1f45d2e645571bfc88798c3ed4
