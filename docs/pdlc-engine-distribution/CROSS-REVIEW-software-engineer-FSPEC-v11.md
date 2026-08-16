# Cross-Review: software-engineer — FSPEC (round 11, delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 11
**Scope:** Delta confirmation of an erratum round routed to the FSPEC. Two questions only: did the
routed items land, and is the FSPEC still a faithful compression of its upstream at that upstream's
current version? Settled sections not re-litigated.

## 1. What changed

**Nothing, in this document.** The FSPEC's newest commit is `730aa0b6` — the same commit the v10
approval anchor records as `REVIEWED-COMMIT`. `git diff 730aa0b6..HEAD --
docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` is empty, and the working tree
carries no unstaged FSPEC edit (`git status --short` shows only untracked `.claude/` and
`.serena/` local state). No erratum edit was made to the FSPEC in this round.

That is the correct outcome, not a stall, because **both routed items are anchored in the PLAN, not
in this document**:

| Routed item | Anchor given | What is actually at that anchor |
|---|---|---|
| T17's row, "`publish.yml`/`pr-tests.yml` two-file set-equality" | `:192` | `PLAN-pdlc-engine-distribution.md:192` — T17's row, which reads "`publish.yml`/`pr-tests.yml` gate-command set-equality" |
| T49's row, "the five PR-gate job bodies" | `:222` | `PLAN-pdlc-engine-distribution.md:222` — T49's row, which reads "`gate` (the five PR-gate job bodies duplicated, never `uses:`)" |

Neither line number resolves to anything of the kind in the FSPEC: `:192` is the blank line before
F-3's heading and `:222` is F-4's "Silence is never a permitted outcome" sentence, neither of which
mentions job bodies or a set-equality at all. `grep -n 'T17\|T49'` over the FSPEC returns nothing
(it names no PLAN task ids anywhere, correctly — that is PLAN's vocabulary); the same grep over
the PLAN returns both rows verbatim. The item text and the anchors agree with each other and both
name the PLAN. The routing named the wrong document.

## 2. Verification against HEAD

The routed items assert a contradiction between the stale rows and three things: FSPEC v0.8's
BR-7.7, PROPERTIES v0.9's PROP-PUB-7, and the shipped carrier. I checked all three in the tree.

**(a) The FSPEC already says the union, and says it unambiguously.** `BR-7.7` (`:548`) reads: "The
tag gate re-runs **every** PR-gate job's commands, not one file's" and, in its body, "true only if
`publish.yml`'s `gate` job's run-command set equals the union of **all** PR-gate files' gate jobs'
commands". `AT-3.4` (`:780-787`) carries the matching oracle conjunct: "the tag gate's commands
set-equal those files' gate-job commands (BR-7.7)", where "those files" is bound one clause earlier
to the `pull_request`-triggered files under `.github/workflows/`. `BR-7.1` (`:505`) derives that
file scope from triggers rather than listing it, and `BR-7.5` states the exclusion reason is the
trigger, not the filename. `grep -in 'five' ` over the whole FSPEC returns **no** hits — there is no
residual five-member or two-file language anywhere in this document to correct.

**(b) The shipped carrier implements the union, not a two-file special case.**
`pdlc/engine/__tests__/ci-arrangement.test.js:64` declares `PR_GATE_FILES` as a map, `:686-690`
builds `expectedCommands` by iterating **every** entry of it and every job id within each, and
`:695` asserts set-equality of that union against `publish.yml`'s `gate` block. `:558-560` closes
the loop the other way — the trigger-derived file set must set-equal `PR_GATE_FILES`'s keys, so a
new `on: pull_request` file cannot join the repo without joining the map. `:99-102` is the trigger
predicate itself. The FSPEC's claim about the carrier is true at HEAD.

**(c) `publish.yml`'s gate job matches.** `.github/workflows/publish.yml:32-33` declares
`gate: name: Gate (PR checks re-run at the tag)` with inline steps and no job-level `uses:`, which
is what `ci-arrangement.test.js:678-684` asserts.

So the defect the items name is real, it is a **documentation** defect only (the implementation and
its oracle are already correct and the PLAN rows are marked `✅`), and it lives entirely in the two
PLAN cells. Editing the FSPEC could not have resolved it, and did not need to: this document was
already the *source* the items measure the PLAN against.

## 3. Upstream re-grounding

## 4. Findings

## 5. Questions

## 6. Positive Observations

## 7. Recommendation
