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

Per DEC-ERR-03 this confirmation is scoped to the FSPEC measured against its upstream at that
upstream's *current* version, not to the item list. The upstream named for this dispatch is the REQ
at `sha256:44d0e188…`. That hash matches the REQ's bytes at HEAD (`shasum -a 256` on the working
file) **and** matches the `UPSTREAM-STATE: REQ` line in the v10 approval anchor. The upstream has
not moved since this document was last approved, so no re-derivation was forced; I re-read the
load-bearing passages anyway.

| FSPEC leans on | REQ v0.12 at HEAD says | Faithful? |
|---|---|---|
| §5.1's set is the membership authority, trigger-derived, count not fixed | `O-B` (`REQ:86`): "membership is **trigger-derived, not a fixed count** … the expected set the FSPEC owns (§5.1) … is the authority on membership (T-7), and the words here are a gloss"; `T-7` (`:269`) "an enumeration, not a count" | Yes — and §5.1's six rows plus BR-7.1's trigger-derived scope are exactly the shape O-B delegates |
| BR-7.5's additive publish workflow, no member weakened/renamed | `C-5` (`:235-238`) verbatim | Yes |
| BR-7.7's union-over-all-PR-gate-files | `C-6` (`:239-241`): "Publishing is gated on the same evidence a PR is. A tag whose commit does not pass **the full gate** publishes nothing" | Yes — "the full gate" is trigger-derived per O-B, so as soon as `fixture-machine.yml` became a PR-gate file, C-6 *entails* the union. BR-7.7 is the compression, not an addition |
| §5.1's seed provenance | `M-ENG-10` measurement, dated 2026-08-13, cited by O-B and T-7 | Yes — BR-7.4 keeps it a dated, non-gating seed, matching "no number stated here is authoritative" |

The REQ's own v0.12 changelog (`:20-25`) records that its erratum was raised because "the gloss said
*five* while the FSPEC's §5.1 expected set now carries six rows". That is the same defect the routed
items name — the REQ leg of it was already fixed at `20c87cd3`, and the FSPEC leg never existed.
Only the PLAN leg remains open. This document remains a faithful compression of its upstream.

## 4. Findings

No finding against the FSPEC. Both findings are about where the erratum was sent, not about this
document's content.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Process | The erratum round was routed to the FSPEC, but both items are defects in `PLAN-pdlc-engine-distribution.md` (rows T17 `:192`, T49 `:222`) and the anchors given confirm it. No FSPEC edit could land them; none did. Re-file against the PLAN — see the `ERRATUM: PLAN:` lines below. Not High against *this* document, because re-opening the FSPEC would dispatch its author to edit text that is already correct (BR-7.7 `:548`, AT-3.4 `:784-786`), and the round budget would be spent producing churn | routing, not a section |
| F-02 | Low | Process | The item text cites bare line anchors (`:192`, `:222`) with no filename. DEC-DOC-01 asks for a raw `file:line` anchor; a file-qualified anchor would have made the mis-route visible at dispatch time rather than one confirmation round later. Recommend erratum items always carry the file path, since the item travels to a *different* document than the one it was found in | DEC-DOC-01 |

### Re-filed against the PLAN

Batched in one pass rather than one per round, per the existing-code-claim convention — the two
routed items plus two more instances of the same stale framing found while checking them, so the
PLAN lands one fix instead of four:

```
ERRATUM: PLAN: T17's row (PLAN:192) describes the tag gate as a "`publish.yml`/`pr-tests.yml` gate-command set-equality". FSPEC BR-7.7 and the shipped carrier assert a union over ALL PR-gate files' gate jobs (ci-arrangement.test.js:686-695 iterates PR_GATE_FILES), which at HEAD is pr-tests.yml AND fixture-machine.yml. Restate as the union over §5.1's file column, trigger-derived, not a two-file pair. EXPECT-TOKEN: PR-gate files
ERRATUM: PLAN: T49's row (PLAN:222) describes `gate` as "the five PR-gate job bodies duplicated". §5.1 carries six rows across two files since 2026-08-16; publish.yml's gate job duplicates every PR-gate job's body, not five. Drop the fixed count — REQ O-B (REQ:86) makes membership trigger-derived and states no number here is authoritative.
ERRATUM: PLAN: Batch-safety rule 6 (PLAN:467) says "FSPEC §5.1 asserts set-equality over the five rendered job names in `.github/workflows/pr-tests.yml`". False at HEAD: §5.1's set-equality is over the union of all `on: pull_request` files' job names. The rule's actual content — that no task in §2 may add a job to pr-tests.yml — survives the correction; only its premise needs restating.
ERRATUM: PLAN: DoD item 14 (PLAN:524) opens "its five rendered job names still satisfy FSPEC §5.1's set-equality". Five names alone no longer satisfy a six-member set-equality. The item's own tail already says the poll "sees six where it saw five", so the item contradicts itself internally; fix the opening clause to say pr-tests.yml's names remain its five CONTRIBUTIONS to the set.
ERRATUM: PLAN: T50's row (PLAN:231) calls pr-tests.yml's "five rendered names ... BR-7.5's contract". BR-7.5's contract is trigger-membership, and fixture-machine.yml — the very file T50 creates — is now a member (§5.1 row 6), so the parenthetical describes the state T50 itself ends.
ERRATUM: TSPEC: §12.1's sequencing note (TSPEC:1991) carries the same stale two-file framing — "the `publish.yml`/`pr-tests.yml` command equality". Same correction as PLAN T17: the equality is over the union of PR-gate files' gate-job commands (§8.5, BR-7.7).
```

None of these are implementation defects. `ci-arrangement.test.js`, `publish.yml` and
`fixture-machine.yml` at HEAD already do the right thing, and both PLAN rows are marked `✅`. This
is stale plan prose describing shipped work incorrectly — cheap to fix, but worth fixing, because
the PLAN is what a later reader reconstructs intent from.

## 5. Questions

## 6. Positive Observations

## 7. Recommendation
