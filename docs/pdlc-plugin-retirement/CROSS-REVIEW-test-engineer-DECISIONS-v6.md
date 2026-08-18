# Cross-Review: test-engineer — DECISIONS (upstream-cascade re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.4, bytes unchanged since v4/v5 approval; `REVIEWED-COMMIT` `502bb820cfdd3c198e2c016b7deab2302f650efb`)
**Upstream trigger:** REQ v0.12→v0.16, FSPEC v0.8→v0.10, TSPEC →v0.11, `docs/_constraints/pdlc-retirement-baseline.md` erratum corrections
**Date:** 2026-08-18
**Iteration:** 6 (upstream-cascade re-review)

## Context

DECISIONS' own bytes are unchanged since the v5 confirmation (`APPROVAL-HASH` `sha256:8d0c2b02…`, `REVIEWED-COMMIT` `502bb820`). Since that commit, four more upstream versions landed: REQ v0.13 (erratum 5 — wave-gate values survive), v0.14 (erratum 3 — `consolidate-learnings/SKILL.md`'s bundle reference is deleted, not rewritten, plus a new O-8 flagged as an unbound blocking gap), v0.15 (O-8 bound to a named successor, `pdlc-consolidation-rehost`), v0.16 (C-9/AC-4.3 factual restatement, no scope change); FSPEC v0.9→v0.10 folding all of the above plus BR-CLN-3a's restatement; TSPEC →v0.11 folding the same, adding a new oracle `RLH-SKILL-10`. `docs/_constraints/pdlc-retirement-baseline.md` corrects M-11h and M-11n to match.

DECISIONS itself carries five named **re-evaluation triggers** (§"Re-evaluation triggers", after `## Consequences`). Two of them have now fired in the upstream cascade under review:

- **Trigger 2a** ("Erratum 3 lands a disposition for `consolidate-learnings`'s execution host … supersedes DEC-10 entirely") — erratum 3 landed at REQ v0.14/v0.15 with exactly the disposition the trigger names as one of the superseding options: "an explicit accepted loss" bound to a named successor (`pdlc-consolidation-rehost`, `docs/_queue/QUEUE.md` Order 24).
- **Trigger 2b** ("Erratum 5 is ratified upstream … DEC-08 becomes the upstream disposition") — erratum 5 landed at REQ v0.13, folded into FSPEC class 10 and the baseline's M-11h row.

DECISIONS' own text says trigger 2a's firing "supersedes DEC-10 **entirely**." Since the document's bytes have not moved, DEC-10 still reads as an active, unsuperseded blocking decision — this is the primary defect this round surfaces.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-10 is superseded by its own trigger 2a, but the document still presents it as live and its factual claims now contradict the landed disposition.** Trigger 2a says erratum 3 landing "supersedes DEC-10 entirely" once the disposition is a named successor / interactive rewrite / accepted loss — REQ O-8 chose exactly the accepted-loss-bound-to-successor branch (REQ v0.14/v0.15). Yet DEC-10's Decision-table row still reads "Net effect on the tree: No sweep commit removes the pass's host until product answers; `SKILL.md`'s bundle reference is rewritten only once there is a surviving path to name" — REQ v0.14 has since said the reference is **deleted, not rewritten**, and the same correction extends to the skill's delegation-contract prose (a second obligation DEC-10 never names). DEC-10's "Owning oracle: **None yet** … a document-level criterion arrives only with erratum 3's disposition" is also stale: the disposition landed and TSPEC's `RLH-SKILL-10` (`skillFiles.test.js`, §5.2) is now that owning oracle. A PLAN/PROPERTIES author who transcribes DEC-10 literally (per DECISIONS' own cross-cutting rule 2, "transcribe, don't re-measure") builds the wrong M-11n assertion — a rewrite oracle instead of a delete-plus-delegation-prose oracle — and misses `RLH-SKILL-10` entirely. | DEC-10 section; Decision table row DEC-10 |
| F-02 | Medium | Local | **DEC-01/DEC-02's owning-oracle cells mis-attribute the current block to "DEC-10's erratum-3 gate," which no longer exists.** DEC-01 reads "gated: it cannot go green before class 7 lands, so DEC-10's erratum-3 gate holds it red"; DEC-02 reads "gated: the reduction rides class 7." Per FSPEC's current held-classes paragraph, classes 7–12 are in fact still held, but **transitively through class 6's still-open erratum 6**, not through erratum 3 (erratum 3 is disposed at FSPEC §3.3 step 4). The net practical outcome for AC-1.1/AC-5.3 (still red) happens to be unchanged, but the named mechanism is wrong, and a reader using DEC-01's cell to decide *when* the gate lifts (re-evaluation trigger tracking) would watch the wrong erratum. | Decision table rows DEC-01, DEC-02 |
| F-03 | Medium | Local | **"Downstream obligations" paragraph (end of Re-evaluation triggers section) instructs PLAN to gate on a condition that is now doubly wrong.** It reads "PLAN must also carry DEC-10's block (classes 7 and 11 gated on erratum 3) and DEC-07's (class 6 gated on erratum 6) as real dependency edges." Two defects compound here: (a) inherited from v4/v5 (unfixed) — the closure is classes **7–12**, not the narrow pair "7 and 11," as DEC-10's own price paragraph, the Decision table's DEC-01 cell, and FSPEC's held-classes paragraph all state; (b) new this round — "gated on erratum 3" is now false, since erratum 3 resolved and DEC-10 is superseded per trigger 2a (F-01). A PLAN author who reads only this sentence adds a dependency edge referencing an already-resolved condition and misses the real one (class 6 / erratum 6, transitively, per FSPEC `:167`–`:172`). | Downstream-obligations paragraph, end of Re-evaluation triggers section |
| F-04 | Low | Local | **DEC-08's context prose still frames erratum 5 as awaiting ratification.** It reads "erratum 5 asks upstream to ratify; class 10 is scoped accordingly [because] the erratum is carried [as] a re-evaluation trigger below." REQ v0.13 has since ratified it, and FSPEC class 10 already reads "Prose only (TSPEC §6.1 erratum 5, folded upstream…REQ v0.13)." DEC-08's chosen option (A) and its oracle shape (tightening `postWavePathspecs` to set-equality) are unchanged by the ratification — this is a faithfulness/freshness nit, not a substantive divergence, since trigger 2b's "if instead upstream confirms both values retire" branch did not fire. | DEC-08 context paragraph |
| F-05 | Medium | Local | **Inherited from v5 F-01, unfixed:** the gated-merge Consequences paragraph and DEC-01's oracle cell still call the held-class interim state "red" ("AC-1.1's `dist/` set-equality stays red while classes 7–12 held"). REQ has read (since v0.12, unchanged through v0.16) that this state is **not** a C-7 red — it is an incomplete feature on an unmerged branch, disposed by ordering (never registration). The fix v5 proposed (clause-level: "unsatisfied / not yet assertable" in place of "red," at the gated-merge paragraph and DEC-01's cell) still has not landed. | Consequences "gated merge looks like" paragraph; Decision table DEC-01 cell |
| F-06 | Low | Local | **Inherited from v5 F-02, unfixed:** the gated-merge paragraph still does not transcribe REQ's no-skip-list / no-expected-failure-register rule and never cites C-8, though nothing in DECISIONS currently violates that rule. | Consequences "gated merge looks like" paragraph |
| F-07 | Low | Process | **The delta-confirmation protocol has no step that forces a document edit once a self-declared re-evaluation trigger fires.** DECISIONS names five explicit triggers and, in trigger 2a's own words, says firing "supersedes DEC-10 entirely" — yet three delta-confirmation rounds (v5, and this one) have re-verified the document's *conclusions* against upstream text without checking whether a trigger's firing obligates a rewrite rather than a re-confirmation. Recommend: when a cascade re-review's `git diff` shows a named trigger's condition satisfied upstream, that should route to the document's ordinary revision loop (a "Needs revision" outcome), not stay inside delta-confirmation. | Re-evaluation triggers section (process observation) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Once F-01/F-03 land, should DEC-10 be rewritten in place (same ID, new content reflecting the accepted-loss-bound-to-successor disposition) or retired with a forwarding note to a new DEC-11? DECISIONS' own convention elsewhere (DEC-06, DEC-07) keeps a decision's ID stable while its Options/Owning-oracle content is corrected by erratum; I'd expect the same pattern here, but the "supersedes DEC-10 entirely" language in trigger 2a reads more like a replacement than an edit. |
| Q-02 | Erratum 6 (class 6 / `hookCompatibility.test.js`) remains open at FSPEC v0.10 — is a further cascade round expected once it lands, or does that correction wait for the next DECISIONS authoring pass regardless of trigger-firing timing? Asking so PLAN/PROPERTIES authors know whether to treat DEC-07's block as still fully current (it is, as of this round) or provisional. |

## Positive Observations

- **DEC-08 called erratum 5's outcome correctly in advance.** DEC-08's chosen option (A, leave both config values unchanged, tighten the surviving assertion to set-equality) is exactly what REQ v0.13 and FSPEC class 10 ratified. The only defect (F-04) is that the surrounding prose still narrates this as a pending question rather than a settled one — the engineering call itself needed no correction.
- **DEC-04's name-only, all-or-nothing classification and DEC-09's two-arm `satisfiesRange` oracle requirement are untouched by the entire upstream cascade** — neither REQ v0.13–v0.16 nor the FSPEC/TSPEC deltas touch AC-4.x or the version-handshake criteria, and DECISIONS' testability reasoning there (conservatism via name predicate; positive-and-negative arm to avoid a truthy-shaped false pass) still holds without qualification.
- **Cross-cutting rule 2 ("transcribe, don't re-measure") is the right rule for exactly this failure mode** — F-01's defect is precisely a transcription gone stale after an upstream correction, which is the scenario rule 2 exists to police. No change to the rule itself is needed; the document just needs to apply it to its own DEC-10 cell.
- **The re-evaluation triggers section is unusually testable as written** — each trigger names a concrete upstream event (an erratum number, a specific correction) rather than a vague "if requirements change" catch-all, which is exactly what let this round mechanically confirm that triggers 2a and 2b have fired. That precision is what makes F-01/F-02/F-03/F-04 identifiable as clean, falsifiable findings rather than a vague freshness worry.

## Recommendation

**Needs revision.**

> One High finding (F-01) is present, which mandates Needs revision per the approval rules.

What's owed, cheapest fix first:

1. Rewrite DEC-10 (F-01) to reflect the landed O-8 disposition: bundle reference deleted (not rewritten), delegation-contract prose also edited, capability loss accepted and bound to `pdlc-consolidation-rehost`, and `RLH-SKILL-10` recorded as the owning oracle. This one edit resolves F-01 and gives F-02/F-03 a correct decision to point back to.
2. Correct DEC-01/DEC-02's owning-oracle cells (F-02) to name the current transitive gate (class 6 / erratum 6) instead of "DEC-10's erratum-3 gate."
3. Correct the downstream-obligations sentence (F-03) to state the closure as 7–12 (not "7 and 11") and to route PLAN's dependency edge through the corrected DEC-10/class-6 gate, not erratum 3.
4. Cheap, can ride the same edit: DEC-08's context prose (F-04), the gated-merge "red" framing and DEC-01 cell (F-05, inherited), the no-registration transcription (F-06, inherited).

## Verdict

FINDING: High | delta | local | DEC-10 section; Decision table row DEC-10 | Superseded by its own trigger 2a but still presented as live; factual claims (rewritten vs. deleted) and owning-oracle cell now contradict the landed REQ O-8 disposition
FINDING: Medium | delta | local | Decision table rows DEC-01, DEC-02 | Owning-oracle cells cite "DEC-10's erratum-3 gate," which no longer exists; current block runs transitively through class 6 / erratum 6
FINDING: Medium | delta | local | Downstream-obligations paragraph | Instructs PLAN to gate classes "7 and 11" on erratum 3 — wrong closure (inherited) and wrong, now-resolved erratum (new)
FINDING: Low | delta | local | DEC-08 context paragraph | Still frames erratum 5 as pending ratification; REQ v0.13/FSPEC class 10 already ratified it, conclusion unchanged
FINDING: Medium | inherited | local | Consequences "gated merge looks like" paragraph; Decision table DEC-01 cell | v5 F-01 still unfixed: held-class interim state still called "red"; REQ says not C-7 red, unsatisfied/not-yet-assertable
FINDING: Low | inherited | local | Consequences "gated merge looks like" paragraph | v5 F-02 still unfixed: no-registration rule not transcribed, never cites C-8
FINDING: Low | delta | process | Re-evaluation triggers section | Delta-confirmation protocol has no step forcing a document edit once a named trigger fires; recommend routing fired-trigger rounds to the revision loop

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 3}
