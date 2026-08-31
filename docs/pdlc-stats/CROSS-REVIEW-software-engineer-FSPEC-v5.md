# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.3, bytes unchanged since v4 approval)
**Upstream changed:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.3 (`50dffe8c8`, erratum round 2)
**Date:** 2026-08-31
**Iteration:** 5 (upstream-cascade confirmation, not a re-review)

## Overview

This is an upstream-cascade confirmation, not a re-review. The FSPEC's own bytes have not
changed since the v4 approval (`REVIEWED-COMMIT: 32a23e013`). The REQ it pins moved once, at
`50dffe8c8` — "REQ v1.3 — erratum round 2, nine targeted wording fixes" — after that approval was
recorded, so the REQ version the approval was taken against no longer exists.

The one question answered here: **does the FSPEC still hold against the REQ as it now stands?**

Method: re-read the v4 cross-review, ran `git show 50dffe8c8 -- docs/pdlc-stats/REQ-pdlc-stats.md`,
then re-read the current text of every REQ passage the FSPEC leans on — not just the changed
hunks — and asked whether the FSPEC is still a faithful compression of it.

Headline: the REQ erratum round landed, in one commit, **all seven** errata the FSPEC's §7.3 had
raised against it. Six of the seven landed in exactly the direction the FSPEC had decided, so the
behavioral spine is now *more* aligned than at approval time. The seventh did not: REQ-STATS-04's
harvested predicate was narrowed to the version grammar, while BR-11 still states it over the bare
`CODE_REVIEW-*` prefix, and the two now disagree on an observable output. That is the one High.

The remainder is staleness of a specific kind: §7.3, and the in-place erratum notices at BR-06,
BR-27 and EC-09, quote upstream wording that no longer exists and assert a disagreement that has
since been resolved. Those citations are wrong as of HEAD even though no behavior turns on them,
which is precisely what this confirmation is for (DEC-ERR-03).

## Linked Requirements

The REQ edit touched eight criteria and one constraint. Each row below is the current REQ text
(v1.3, sha256:c4588c8b…) measured against the FSPEC section that compresses it.

| Upstream item changed | What REQ v1.3 now says | FSPEC section leaning on it | Still faithful? |
|---|---|---|---|
| C-5 | Post-mortem phase *discovery* is carved out of the fidelity rule: "the driver builds that path from a phase it already holds and classifies no `POSTMORTEM-*` basename… That listing is this REQ's own (REQ-STATS-05)" | §1 fidelity anchor; BR-12 | **Yes — and the FSPEC's argument is now the REQ's own text.** §1's "there is no driver classification of that listing to diverge from" was the FSPEC's defence of an unlicensed match; C-5 now licenses it in the same words. Only §7.3's bullet, which still says "the REQ's own C-5 enumeration is what needs the carve-out", is stale. |
| REQ-STATS-03 | Malformed is decided, not third-bucketed, and explicitly "covers the grammatical-but-out-of-catalogue names the pipeline writes (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`); one label stands: a third bucket would be an independent rule C-5 forbids" | D-8; BR-06; AT-09 | **Yes, behaviorally exact.** D-8's decision and the REQ's decision now coincide, and the REQ reproduces D-8's own reason. BR-06's closing sentence ("a wording defect of the upstream criterion… raised as an erratum") is the stale part. |
| REQ-STATS-04 | Harvested iff LEARNINGS present **and** "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains" | BR-11; AT-12; §7.3 bullet 3 | **No — F-01.** BR-11 still reads "no `CODE_REVIEW-*` file remains in the directory". |
| REQ-STATS-06 | Harvested iff LEARNINGS present and "at least one of the two process families is entirely absent (no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)" | BR-16; AT-17; A8 | **Yes, clause for clause.** The REQ adopted BR-16's disambiguation verbatim in structure, including the three-way "or neither". The two-readings erratum is discharged. |
| REQ-STATS-07 | Gap disposition restricted to unreadability: "for any feature whose directory cannot be read, reports it by name with the reason… a readable but empty directory is not a gap but a normal row whose metrics report their zero states" | BR-27; B5; EC-03; EC-11; EC-21 | **Yes behaviorally — but BR-27 quotes the retired wording (F-03).** |
| REQ-STATS-08 | Conjunct (b) regains its separators (", issues no network request, and runs no `git` write command") | §3.4; BR-28; AT-21, AT-22 | **Yes.** The FSPEC always read it as a three-item conjunction; the REQ now punctuates it that way. Nothing to change. |
| REQ-STATS-09 | *Given* carved: "…in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure" | EC-01/EC-09; D-9; BR-04, BR-30; AT-23, AT-24, AT-27 | **Yes behaviorally, and the contradiction is gone — but EC-09 and D-9 still assert it exists (F-04).** |
| REQ-STATS-02 | States re-attributed: "REQ-STATS-03's malformed and unmeasurable states and REQ-STATS-03/04/06's harvested state ride in their own metric's value" | BR-20, BR-21, BR-22, BR-24; AT-04, AT-05 | **Yes.** The set-equality obligation is unchanged and BR-22's "states ride inside their metric's value" is untouched by the re-attribution. |

Nothing in the REQ's changed text removes a requirement the FSPEC covers, and no new criterion,
constraint or non-goal was added, so §2.1's coverage table needs no new row.

## Behavioral Flow

No flow-table cell changes meaning under REQ v1.3.

- **Flow A, A2 → A3 (root probe before feature resolution).** D-9's ordering — A2 exits on a
  missing or unreadable `docs/` root before A3 can resolve a feature — was the FSPEC's decision
  *against* REQ-STATS-09's literal *Given*. REQ v1.3 now states the same ordering as its own
  carve-out, so A2/A3 is no longer a departure to be justified; it is the criterion. The flow
  itself is right as written.
- **Flow A, A6 (DoD metric) and A8 (ratio).** A8's decision point already reads "Is either process
  family entirely absent alongside a `LEARNINGS-{feature}.md`?", which is REQ-STATS-06 v1.3 word
  for word. A6 delegates its predicate to BR-11 and therefore inherits F-01's divergence; fixing
  BR-11's clause fixes A6 without touching the table.
- **Flow B, B5.** "Could the directory not be **read**… No → a normal row, including for a
  directory that is readable and empty" is now the REQ's own sentence rather than a narrowing of
  it. B5 and REQ-STATS-07 v1.3 agree exactly.
- **§3.4 (read-only invariant).** REQ-STATS-08's re-punctuated conjunct (b) enumerates the same
  three obligations §3.4 already carries, and the liveness conjunct ("never suffices alone") is
  untouched. No change.

Carried forward and still open from v4: **F-01 of that round** (Flow C3 routes a refusal Flow A's
A4 cannot raise) and **F-03 of that round** (B5's decision point is narrower than EC-21's
catch-all). Both are Local and pre-existing; neither is aggravated or repaired by the REQ edit, and
neither is re-raised here, since this confirmation is not the channel for the FSPEC's own open
minor findings.

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Delta-Confirmation Findings

_pending_

## Open Questions

_pending_

## Recommendation

_pending_

## Verdict

_pending_
