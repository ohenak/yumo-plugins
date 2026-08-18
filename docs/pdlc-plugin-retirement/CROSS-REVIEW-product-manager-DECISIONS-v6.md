# Cross-Review: product-manager — DECISIONS (upstream-cascade re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (unchanged bytes)
**Date:** 2026-08-18
**Iteration:** 6 (upstream-cascade re-review)
**Scope:** Does DECISIONS still hold against REQ/FSPEC/TSPEC as they now stand? Product lens only.

## Context

DECISIONS was last approved at iteration 5 (`CROSS-REVIEW-product-manager-DECISIONS-v5.md`,
verdict *Approved minor changes*, `REVIEWED-COMMIT: 502bb820cfdd3c198e2c016b7deab2302f650efb`),
anchored to `UPSTREAM-STATE` REQ `sha256:41fb1e82…` (REQ v0.12). Since that commit, all three
upstream documents moved: REQ v0.12 → v0.16 (erratum 5: `postWaveCommand`/`postWavePathspecs`
survive; erratum 3: `consolidate-learnings/SKILL.md`'s bundle reference is deleted and its
delegation prose rewritten, new O-8 bound to successor `pdlc-consolidation-rehost` at
`docs/_queue/QUEUE.md` Order 24 with `ready: false`; round-12 factual restatements of C-9 and
AC-4.1), FSPEC v0.8 → v0.10, TSPEC → v0.11. DECISIONS itself is byte-unchanged
(`git diff 502bb820..HEAD -- DECISIONS-pdlc-plugin-retirement.md` is empty).

DECISIONS carries its own forward-looking contract for exactly this situation — five numbered
re-evaluation triggers naming the REQ/FSPEC events that would supersede a decision. Two of those
triggers cover ground this cascade touches directly:

- **Trigger 2b** ("Erratum 5 is ratified upstream … DEC-08 stops being a sweep-local reading of
  class 10 and becomes the upstream disposition") — **fired cleanly.** REQ v0.13 and FSPEC class
  10 (`FSPEC:162`, "Prose only … values stay") now say exactly what DEC-08's own Option A already
  argued for ("the wave-gate config values do not retire with `dist/`"). DEC-08's chosen option,
  its oracle-shape argument (tighten `postWavePathspecs` to set-equality) and its rejection of
  Option B all still read correctly against REQ v0.13. No finding here — this is the review
  confirming a trigger that resolved itself without needing a DECISIONS edit.
- **Trigger 2a** ("Erratum 3 lands a disposition for `consolidate-learnings`'s execution host —
  DEC-10's block on classes 7 and 11 lifts, and the option the disposition chooses … supersedes
  DEC-10 entirely") — **fired, and not yet acted on.** REQ O-8 (v0.14, bound in v0.15) is exactly
  the disposition DEC-10 was waiting for: accepted loss of the unattended, machinery-backed pass,
  the in-session pass is human-performed, `SKILL.md`'s delegation prose is rewritten to say so
  honestly, and the machinery-backed pass is bound to a named successor REQ that ships
  `ready: false` so the operator veto still holds. FSPEC (§7.2 row 5: "**Decided upstream** …
  Applied here") and TSPEC (T-5: "**Resolved upstream, ordering obligation remains**") have both
  already been rewritten to reflect this. DECISIONS has not — DEC-10's Option A, its "Price of A"
  paragraph, its Decision-table row, and its Consequences-table row all still describe classes 7
  and 11 as blocked pending a disposition that no longer is pending. By DECISIONS' own stated
  contract, that supersedes DEC-10 entirely; the document needs an edit to say what superseded it
  to, not just a re-anchor.

DEC-07's class-6 gate (erratum 6) was checked too: FSPEC's `hookCompatibility.test.js` disposition
is still marked "contested … not yet corrected" (`FSPEC:158`), so that gate is still genuinely
open and DEC-07 is unaffected by this cascade.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **DEC-10 still presents classes 7 and 11 as blocked on an undecided upstream question; REQ O-8 answered that question in v0.14 and bound its successor in v0.15.** DEC-10's Option A reads "classes 7 and 11 do not land until erratum 3 has an upstream disposition." The Decision-table row (DEC-10) reads "No sweep commit removes the pass's host until product answers" and "document-level criterion arrives only [after] erratum 3's disposition." The Consequences-table row still frames the loss as an open, undecided gap ("the surviving `nudge-consolidation` hook advertise[s] it" with no mention of a resolution). All three describe a still-pending decision. But REQ O-8 (`REQ-pdlc-plugin-retirement.md`, v0.14 §A-1 / O-8 entry, bound v0.15) has already chosen: accepted loss of the unattended pass, human-performed in-session under the rewritten skill, machinery-backed pass bound to `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md` (`docs/_queue/QUEUE.md` Order 24, `ready: false`). FSPEC §7.2 row 5 already marks this "Decided upstream … Applied here," and TSPEC T-5 already reads "Resolved upstream, ordering obligation remains: … REQ C-7 still requires ordering: class 7 (bundle deletion) and class 11 (both halves of the skill rewrite) land together." DECISIONS' own re-evaluation trigger 2a says this event "supersedes DEC-10 entirely" — the trigger fired but the document was not revised to match. This is not cosmetic: DECISIONS' "Downstream obligations" paragraph instructs PLAN to carry "DEC-10's block (classes 7 and 11 gated on erratum 3)" as a real dependency edge against an *external, still-undecided* question — but the question is decided, and what PLAN actually needs is a *same-commit ordering* edge between class 7 and class 11 (per TSPEC T-5 and REQ C-7), a materially different graph shape. If PLAN is authored against DEC-10 as currently written, it risks encoding a block-on-external-decision edge that no longer describes reality instead of the same-commit ordering edge REQ/FSPEC/TSPEC now call for. Fix: rewrite DEC-10 to record the landed disposition as the chosen resolution (REQ O-8's accepted-loss / bound-successor shape), update the Decision-table and Consequences-table rows to match, and restate the "Downstream obligations" paragraph and trigger 2a's own text so PLAN is told to carry a same-commit ordering edge (class 7 + class 11), not an open block pending disposition. | REQ O-8 (`REQ-pdlc-plugin-retirement.md` v0.14/v0.15); FSPEC §7.2 row 5; TSPEC T-5, SUCC-2 |
| F-02 | Medium | Local | **DEC-10's "Price of A" paragraph quotes FSPEC's class-10 ordering cell with wording FSPEC no longer carries.** It reads: class 10 lands "'After class 7 (the retired value names a deleted output)'" — a verbatim quote attributed to `FSPEC-pdlc-plugin-retirement.md:162`. FSPEC class 10 was rewritten by erratum 5 (correctly anticipated by DEC-08's own trigger 2b, see Context above) to "Prose only … values stay on branch [because it] retains `pdlc/workflows/dist/`" — there is no retired value and no deleted output at that citation anymore. The quote is now inaccurate under DEC-DOC-01 (cite-and-reuse, not re-derive): a reader following the citation to confirm the transitive-gate arithmetic will not find the quoted text. This does not change DEC-10's blocked-class count (still correctly stated as six of thirteen via classes 7–12, independent of class 10's wording), so it is a citation-fidelity issue, not a re-decision. Fix: replace the quoted fragment with class 10's current disposition ("Prose only … values stay") or drop the direct quote and cite the row without repeating stale language. | FSPEC §3.1 class 10 (`FSPEC:162`); DEC-DOC-01 |

FINDING: High | delta | nonlocal | DEC-10 (Option A, "Price of A" paragraph, Decision-table row, Consequences-table row, Downstream-obligations paragraph, trigger 2a text) | Still describes classes 7 and 11 as blocked on an undecided erratum-3 disposition; REQ O-8 (v0.14, bound v0.15) already answered it and FSPEC/TSPEC already reflect the answer, but DECISIONS' own trigger 2a ("supersedes DEC-10 entirely") fired without a document edit.
FINDING: Medium | delta | local | DEC-10 "Price of A" paragraph, quoted FSPEC class-10 text | Quotes FSPEC `:162` as "the retired value names a deleted output," which erratum 5's landed resolution (FSPEC class 10 now "Prose only … values stay") no longer says at that citation.

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC T-5 recasts the class-7/class-11 relationship as a same-commit ordering requirement rather than a block on an external decision. When DEC-10 is rewritten, should PLAN's dependency-DAG edge type for this pair be distinguished from DEC-07's still-genuinely-open erratum-6 block (class 6), so a reader of PLAN can tell "ordering because REQ C-7 requires it" apart from "blocked because upstream hasn't decided yet"? The two are no longer the same kind of gate and DECISIONS is the document that should say so before PLAN inherits either. |

## Positive Observations

- **The re-evaluation-trigger mechanism works when it's read.** Trigger 2b (erratum 5) resolved
  itself cleanly: DEC-08's Option A already argued for exactly the outcome REQ v0.13 and FSPEC
  class 10 landed on, and no DECISIONS edit was needed. That is the trigger design paying off —
  the gap here is that trigger 2a's firing wasn't yet caught the same way.
- **REQ O-8's shape matches what DEC-10 said would make Option C available.** DEC-10 explicitly
  reserved judgment: "If the product side decides the loss is acceptable, that is a REQ edit that
  makes C available; it is not a call engineering makes inside the sweep." REQ O-8 is exactly that
  REQ edit — recorded operator direction, bound successor, vetoable via `ready: false` — landing on
  the product side, not inside the sweep. The document's own reasoning anticipated this correctly;
  it just hasn't been updated to record that it happened.
- **DEC-07's class-6 gate is unaffected and still correctly open.** Erratum 6 remains contested in
  FSPEC, so no drift there — the cascade's scope is precisely bounded to erratum 3 and erratum 5,
  matching triggers 2a and 2b and no others.
- **The blocked-class arithmetic (seven of thirteen: 6 on erratum 6, 7–12 on erratum 3) is still
  internally consistent** even though F-01's fix will change *why* 7–12 are ordered — the count
  itself does not need to change, only the description of the gate's nature.

## Recommendation

**Needs revision.** DEC-10 must be rewritten to record REQ O-8's landed disposition (per
DECISIONS' own trigger 2a, which fired and supersedes DEC-10 as currently written), and its
Decision-table row, Consequences-table row, and downstream-obligations language must be brought
into agreement with FSPEC §7.2 row 5 and TSPEC T-5 so PLAN inherits a same-commit ordering edge
rather than a block on an already-decided question. The stale FSPEC quote in the same paragraph
(F-02) should be corrected in the same pass since it sits in the section being rewritten anyway.

No contradiction found with `docs/_constraints/DOMAIN-CONSTRAINTS.md` or any promoted decision in
`docs/_decisions/`.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
