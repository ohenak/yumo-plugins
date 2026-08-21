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

What I checked, and the result:

| # | Check | Result |
|---|-------|--------|
| C-1 | The routed sentence is present in the REQ (`overwrit` / "re-running … overwrites" matches) | **Pass** — AC-6.3, appended clause |
| C-2 | It is an operator-visible outcome, not a contract (no ref name, no field name, no mechanism) | **Pass** — "a captured pre-A6 tree state"; `a6-snapshot` matches zero REQ lines |
| C-3 | It is traced to a user scenario | **Pass** — `*(US-02.)*`, and US-02 at `:223` is the halt-turn scenario the obligation serves |
| C-4 | It cites its authority in a parseable form (DEC-DOC-01) | **Pass** — `(DEC-A6-03)`, a spec id, not a `file:line` anchor |
| C-5 | The changelog records the edit, its provenance and its bound | **Pass** — v1.16 block, names SE/PM/TE, states "no decision reopened" |
| C-6 | Version row incremented and consistent with the changelog | **Pass** — `1.16`, row `:18`, block `:20` |
| C-7 | Nothing else in the file changed | **Pass** — `git show 30d8bf7b` is two hunks, both accounted for |
| C-8 | The clause's *Given* clause reaches the halt DEC-A6-03 describes | **Fail** — see F-01 |
| C-9 | Upstream DEC-A6-03 at HEAD is consistent with the REQ now carrying the obligation | **Fail** — see F-02 |
| C-10 | The new conjunct has a downstream behavioural home and a property | **Fail** — see F-03 |
| C-11 | No previously approved AC weakened or contradicted | **Pass** — AC-5.2's "escalation adds information, never changes control flow" is untouched, and adding a sentence to a halt report is information, not control flow |

C-8 is the one that matters most and is worth stating plainly. AC-6.3's *Given* is "the pipeline
halts after an A6 escalation", and the new clause fires only "where the halt report points the
operator at a captured pre-A6 tree state". At HEAD the only halt that points at the capture is
**E-28's** — restoration itself failed — and TSPEC §3.5 (`:1065-1066`) says that path's throw is
tagged `__isRevertFailure` and rethrown by the driver's terminal catch *"rather than mapping it to an
escalation"*. TSPEC §4.5's halt-fields row likewise enumerates the A6-touched halts it covers — a
non-resolved wave, a capture-failure escalation, a post-gate un-skip halt — and the restore-failure
rethrow is not among them, nor does any halt field carry the ref name. So on the literal reading, the
obligation's condition is never satisfied on the one path DEC-A6-03 is about, and the gap the round
was opened to close can survive the edit. The fix is small and stays at requirements altitude: scope
the clause to *any A6-touched halt* rather than to escalation halts.

## Risks

- **R-1 — The gap closes on paper and not in the product.** DEC-A6-03's re-evaluation trigger says the
  entry's known gap closes "if the halt-message obligation the PM is routing to REQ lands". A future
  reader greps the REQ, finds the sentence, and marks the gap closed — while F-01's scoping mismatch
  and F-03's absent downstream coverage mean no operator ever sees the warning. The mitigation is
  cheap: close the gap on evidence of a *test*, not on evidence of a sentence.
- **R-2 — Conditional obligations are silently vacuous.** "Where X, then also Y" imposes nothing when
  no X exists. This REQ now carries one such clause and it is the only obligation on the halt-message
  path. Worth a general note for the harvest: an AC whose condition is supplied entirely by a
  downstream document needs the downstream document to be checked in the same round, or it is
  unfalsifiable by construction.
- **R-3 — Late erratum, frozen downstream.** This edit lands in Phase D against FSPEC v1.6, TSPEC and
  PROPERTIES that are already written and approved. A new REQ conjunct with no FSPEC behaviour and no
  property is a documented divergence between layers for as long as it stands; the risk is that it is
  never propagated because the erratum round is scoped to this document.
- **R-4 — Low: wording slightly stronger than upstream.** The REQ says re-running "overwrites that
  capture"; DEC-A6-03 and TSPEC §2.5 are more precise — a re-run reaches the wave, captures again,
  and overwrites *that wave's* ref, and the promise is run-scoped. For an operator warning the
  stronger reading is the safe direction (it never under-warns), so I raise it as a risk, not a
  finding.

## Obligations

- **O-A (owner: se-author / this REQ, one bounded follow-up).** Widen AC-6.3's new clause so it binds
  on any A6-touched halt that points the operator at a captured pre-A6 tree state, not only on halts
  that follow an escalation (F-01). One clause; no decision reopened; still requirements altitude.
- **O-B (owner: DECISIONS / Phase D).** Update DEC-A6-03's "Known gap in the remedy's reach"
  paragraph, which still asserts the routing "has not landed" and pins that claim to REQ v1.15 — a
  statement false at HEAD (F-02). Its re-evaluation-trigger clause is the natural place to record
  what closing the gap now requires.
- **O-C (owner: FSPEC, then PROPERTIES).** Give the new conjunct a behavioural home — E-28 and
  AT-05-5 are the obvious sites — and a property, so it is verifiable rather than asserted (F-03).
  Until then AC-6.3's second conjunct has no owning test.
- **O-D (unchanged, restated).** O-1 continues to bind the capture's name, storage form and halt-field
  shape to the TSPEC. The REQ must not acquire the ref name in a later revision of this clause.

## Delta-Confirmation Findings

## Recommendation

## Verdict
