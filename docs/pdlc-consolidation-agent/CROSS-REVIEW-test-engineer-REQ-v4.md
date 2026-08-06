# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 4
**Scope:** Local (Scope tags per finding below)
**Delta base:** `0b03f4d` (the tree v3 reviewed) → HEAD

Delta re-review. v3's findings F-23…F-28 are dispositioned in §Prior findings; new findings are
numbered F-29 onward so ids never collide across rounds. Only the eight commits that touched the REQ
since `0b03f4d` were read for new issues; unchanged sections approved in v1–v3 were not revisited.

## Prior findings

All six v3 findings are resolved. Each resolution was re-verified against the code the revision now
cites, not against its prose.

| v3 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-23 | High | **Resolved** | REQ-CONS-01 now carries "What is in that file at HEAD, and the migration rule" and states the predicate over **two** regions: inside a `<!-- pdlc:consumed {passId} -->` block, **or** anywhere in the *legacy region* — the text preceding the file's first `<!-- pdlc:consumed` marker. Every factual claim in that paragraph checks out: `docs/_decisions/.consolidation-log.md` exists, its `## Pass 1 — 2026-07-29` records the consumed set as a two-column table of full paths (`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md \| 2026-06-02` and the same shape for `docs/pdlc-workflow-distribution/…`), it carries no `<!-- pdlc:consumed` marker and no row status ("Promoted" appears only as a section heading). The rule is **total** over any log (a log with no block is legacy region entire), and the boundary is frozen by construction because NFR-5 now requires the consumed block to be appended *before* any other record the pass writes — so no record this feature introduces can ever land in the legacy region. That closes the hazard the delimited block was introduced for without reopening the substring hazard. Migration needs no transcription and no parse of Pass 1's prose. |
| F-24 | High | **Resolved** | "The empty-datum case, decided" names both empty states (no log file; a log like HEAD's whose rows predate the status convention), picks **elapsed**, and states the observable trio: the pass runs, trigger `cadence`, reason code `no-cadence-datum`, and that row becomes the datum. AC-1.1 carries the branch inline, §4b carries the code with its permitted-status set, and the rejected reading is stated with its consequence ("empty-means-not-elapsed makes cadence unreachable"). A fixture author now has one expected value for the most common initial state. |
| F-25 | Medium | **Resolved** | Step 1's corpus is now `docs/*/LEARNINGS-*.md` **and** `docs/completed/*/LEARNINGS-*.md`, with the depth-1 limitation of `nudge-consolidation.sh:28` named as the reason, and `docs/discarded/*/` excluded on a stated ground ("abandoned work is not evidence about a delivered pipeline"). §5 adds `:28` to the in-scope edits, which is exactly the consequence the finding asked to be carried. The "on this repo today" arithmetic is correct as written: the widened glob matches **5** files (`docs/orchestrate-dev-workflow/…`, `docs/pdlc-advisory-tier/…`, `docs/completed/{pdlc-merge-phase,pdlc-review-loop-hardening,pdlc-workflow-distribution}/…`), two of which are named in the legacy region, leaving 3 un-consolidated — below the `volumeThreshold` of 5 at `nudge-consolidation.sh:25` (verified: `THRESHOLD = 5`), so the first tick does reach the cadence test and then the F-24 bootstrap. The two `docs/discarded/` LEARNINGS are correctly outside the count. |
| F-26 | Medium | **Resolved as scoped** | §4b now carries a pipeline-phase-id row enumerating 13 ids, and every citation in it resolves: `PHASE_DISPATCH` holds exactly `R, F, T, D, P, PR, CR, DOD` (verified by key scan), and the five `recordPhase` literals are at the lines given — I `:10020`, PT `:10250`, H `:10407`, PUB `:10462`, MERGE `:10568`. AC-5.2's partition is stated and its union is set-equal to that catalogue. The residual is that the two halves are **not** disjoint as claimed — see F-29. That is a narrower defect than F-26 was, and inside F-26's own answer. |
| F-27 | Medium | **Resolved** | The permitted-status sets are now derived from a stated rule — "a code is legal with every terminal status still reachable after the point in the pass at which the code is recorded" — rather than from the status the code was first introduced under. `duplicate-suppressed` gains `promoted-degraded` with the composed scenario spelled out; `no-advisory-corpus` / `advisory-corpus-empty` gain `failed` with the ordering argument (corpus read before AC-3.5's or AC-1.6's failure is decidable). I re-derived every row against the rule: the four AC-3.5 codes correctly stop at `promoted-degraded`/`no-op` (AC-3.8b says `writes-uncommitted` never changes the terminal status, so no `failed` is reachable after a fallback), and `refused`/`skipped-cadence` are pinned explicitly. The rule is the durable part — it is what makes a future row derivable rather than guessed. |
| F-28 | Low | **Resolved** | AC-3.5 row 1 now records `credential: absent`, set-equal to AC-4.2/NFR-2/§4b's closed three-value set. |

Q-09 is answered by AC-3.8b's rewrite: the pass retries the `index.lock` class as `commitPaths` does
(`gitWithLockRetry`, `orchestrate-dev.js:8670` — verified), a commit that still fails leaves the writes
uncommitted, **does not change the terminal status**, and records reason code `writes-uncommitted`
(new §4b row). That is a positive observable, not a silence.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
