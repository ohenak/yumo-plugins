# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.16)
**Date:** 2026-08-20
**Iteration:** 6 (delta confirmation, erratum round)

## Problem / Context

I approved this REQ at v1.15. One erratum edit has landed since: commit `30d8bf7b`
(`REQ v1.16 — land DEC-A6-03 halt-message obligation`), 12 insertions / 2 deletions, touching exactly
two places — the version row plus a v1.16 changelog paragraph, and one appended clause on **AC-6.3**
under `REQ-AWG-06`.

The routed item, raised this round by SE, PM and TE alike, was DEC-A6-03's operator-facing
halt-message obligation: at halt an operator learns the pre-A6 capture's *name* and nothing about the
ordinary next action after a halt — re-running the feature — destroying it. The obligation had been
routed to REQ/FSPEC since round 5 and never landed; at v1.15 `a6-snapshot`, "copy the ref" and
"overwrit" matched nothing in the REQ.

At v1.16 AC-6.3 now reads, appended to its existing diagnosis clause: *"Where the halt report points
the operator at a captured pre-A6 tree state, it also warns, in the same place, that re-running this
feature overwrites that capture — so an operator who intends to inspect it preserves it first, rather
than losing it to the ordinary next action after a halt (DEC-A6-03)."*

That is the routed sentence, in the REQ, at requirements altitude, traced to US-02. The text landed.
This confirmation therefore turns on the two questions the item list does not settle: whether the
clause as worded actually binds on the halt DEC-A6-03 describes, and whether the REQ is still a
faithful compression of the upstream it now leans on (DEC-ERR-03).

## Goals

This round answers one question: **does the delta resolve the four routed items without breaking
anything I previously approved?** Concretely:

1. Confirm the halt-message obligation is present in the REQ, at requirements altitude, traced to a
   user scenario, and not smuggling TSPEC contract material (the ref's name, its storage form).
2. Confirm the clause binds on the halt path DEC-A6-03 actually names — the obligation landing as
   *text* is necessary, not sufficient.
3. Re-read the upstream this REQ now leans on at HEAD — DEC-A6-03 in
   `DECISIONS-pdlc-advisory-wave-gate.md`, and the TSPEC/FSPEC surfaces the clause presupposes — and
   test whether the REQ is still a faithful compression of it (DEC-ERR-03).
4. Confirm nothing else moved: no decision reopened, no previously approved AC rewritten.

## Non-Goals

- Re-reviewing the whole REQ. Every section outside AC-6.3 and the changelog block is unchanged
  bytes I approved at v1.15, and I did not re-litigate it.
- Reviewing FSPEC, TSPEC or PROPERTIES on their own terms. They enter only where this REQ's new
  clause depends on them, and any finding I raise about them is reported here as a routing signal for
  the owning phase, not as a review of those documents.
- Reopening DEC-A6-03's substance. Wave-scoped ref naming with no run discriminator is a settled
  decision with recorded re-evaluation triggers; my findings are about the *record's* currency, not
  about the decision.
- Product framing of the warning's wording. Whether the operator sentence should be sharper is the
  PM's lens.

## Constraints

- **Altitude (REQ).** AC-6.3 may state only the observable outcome. The capture's name
  (`refs/pdlc/a6-snapshot-{waveNum}`), its storage form and the halt field carrying it are bound to
  the TSPEC by this REQ's own O-1. The landed clause respects this: it says "a captured pre-A6 tree
  state", never the ref name. Verified — `a6-snapshot` still matches zero lines in the REQ at v1.16,
  which is the correct outcome, not a miss.
- **Erratum discipline.** The edit must land the routed item and nothing else. Verified against
  `git show 30d8bf7b`: two hunks, both accounted for; no other AC, BR, constraint or measured fact
  changed.
- **Upstream at HEAD (DEC-ERR-03).** The REQ's citation surface here is `DEC-A6-03` — a spec id, not
  a `file:line` anchor, so DEC-DOC-01 is satisfied. The obligation to check is semantic: does
  DEC-A6-03 at HEAD still say what this REQ now implies it says?
- **Approval rule.** Any High finding forces Needs revision. I found none; see the findings table for
  what I did find and why each is Medium.

## Acceptance Criteria

## Risks

## Obligations

## Delta-Confirmation Findings

## Recommendation

## Verdict
