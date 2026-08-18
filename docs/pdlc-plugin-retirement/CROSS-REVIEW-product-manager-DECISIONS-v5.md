# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (unchanged bytes)
**Date:** 2026-08-18
**Iteration:** 5 (upstream-cascade confirmation, not a full re-review)
**Scope:** Does DECISIONS still hold against REQ as it now stands? Product lens only.

## Context

DECISIONS was approved at v4 (`CROSS-REVIEW-product-manager-DECISIONS-v4.md`, verdict *Approved with
minor changes*, `REVIEWED-COMMIT: 8281ef70`), against `REQ` at
`sha256:1038b8166cc84cb48d069c3e364a2a8e9aa07daf612e2fc8d611c3100e584294`. That REQ version no longer
exists: commit `cc009367` ("REQ v0.12 erratum — C-7 dispositions held-branch interim state") edited it
after the approval was recorded. REQ at dispatch is
`sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51`, confirmed by
`shasum -a 256` on the working tree — the approval anchor is stale and must be re-earned or re-scoped.

DECISIONS' own bytes are unchanged; no decision, option, or rejection is re-litigated here. The single
question answered below is whether the document is still a faithful compression of the upstream text it
leans on, measured against REQ **at HEAD**, not against the erratum item list.

**What the REQ edit changed.** `git diff 8281ef70..HEAD` on the REQ shows one substantive insertion (plus
the version/changelog rows): a new paragraph under C-7, **"Held classes and the interim state"**
(`REQ-pdlc-plugin-retirement.md:264`–`:271`). Its load-bearing sentences:

- "C-7 governs the repo's own CI checks at each commit. It does not govern this REQ's completion
  criteria, which are evaluated when the sweep is complete (AC-1.1's *given* says so)."
- "while a deletion class is held pending an upstream disposition, AC-1.1 being unsatisfied is simply an
  incomplete feature on an unmerged branch — it is **not** a C-7 red, it is **not** registered anywhere
  as an expected or tolerated failure, and it does not forbid the ungated classes from landing as their
  own commits."
- "Where a check that observes a held class would otherwise run red in repo CI before that class lands,
  the resolution is ordering — the check becomes live with the class it covers — never registration."
- "The branch does not merge on a green subset: completion is all criteria satisfied at HEAD, held
  classes included."

Every one of those sentences lands on ground DECISIONS already occupies: DEC-10's gate, the decision
table's `gated` oracle cells, and the **What a gated merge looks like** paragraph (`:237`) are all
statements about exactly this interim. So the cascade is live, and the confirmation is not a formality.

## Options Considered

Three readings of the cascade were available, and the evidence decides between them rather than taste.

- **A — The edit is inert for DECISIONS; re-anchor and move on.** Rejected. The new REQ paragraph is not
  additive colour: it *negates* a characterisation DECISIONS makes twice in its own words ("stays red",
  "holds it red"). An erratum that says "it is **not** a C-7 red" while the downstream document says the
  criterion "stays red … per REQ C-7" leaves two texts asserting opposite things about the same interim.
  Re-anchoring without recording that would ship the divergence into PLAN and PROPERTIES, which read
  DECISIONS, not the REQ, for the merge shape.

- **B — The edit invalidates DEC-10 and the gated set; DECISIONS must be re-decided.** Rejected on the
  text. The new paragraph explicitly preserves the shape DEC-10 chose: held classes are permitted
  ("it does not forbid the ungated classes from landing as their own commits"), and the merge rule is
  identical to DECISIONS' ("The branch does not merge on a green subset" ≡ `:237`'s "the branch does not
  merge on a green subset"). Nothing in the erratum touches the *choice* to block on erratum 3, the
  blocked-set arithmetic (six of thirteen, plus class 6 on erratum 6), or any owning-oracle assignment.
  DEC-01 through DEC-10 stand as chosen.

- **C — The decisions hold; two sentences of vocabulary no longer match upstream and must be re-phrased**
  (chosen). The substance of DECISIONS is now *more* aligned with REQ than before: DECISIONS already
  routes the interim through ordering ("PROPERTIES places the classes 7–12 ATs behind the same edge",
  `:237`; "PLAN must … carry DEC-10's block … as real dependency edges, not prose notes"), which is
  precisely the resolution REQ:270 now mandates. What no longer holds is the *description*: calling the
  held-interim state a red, and attributing that red to C-7, is a claim REQ at HEAD now denies in terms.
  That is a Medium fidelity finding, not a re-decision.

## Decision

**DECISIONS still holds against REQ at HEAD.** Every chosen option, every rejection reason, every
owning-oracle assignment and the whole gate arithmetic survive the erratum unchanged; the erratum in fact
ratifies DEC-10's interim shape and states DECISIONS' merge conclusion in the same words. The approval is
re-earned on substance.

Two sentences must be re-phrased before the document is a faithful compression of C-7 as it now reads.
They are recorded as one Medium finding (F-01) plus one Low pointer finding (F-02) in **Findings**; neither
changes an option, a count, or a downstream obligation's scope, so the verdict is *Approved with minor
changes* rather than *Needs revision*.

Clause-by-clause confirmation against the new REQ paragraph:

| New REQ clause (`REQ:264`–`:271`) | DECISIONS site | Still faithful? |
|---|---|---|
| C-7 governs per-commit repo CI, not completion criteria | `:237` "each ungated class is independently green per REQ C-7" | Yes — DECISIONS applies C-7 per commit, per class |
| AC-1.1 unsatisfied while held is an incomplete feature, **not a C-7 red** | `:237` "AC-1.1's `dist/` set-equality stays red while classes 7–12 are held"; `:162` "DEC-10's erratum-3 gate holds it red" | **No — F-01** |
| Not registered as an expected or tolerated failure | no skip-list, expected-failure inventory or tolerated-red register appears anywhere in DECISIONS | Yes — nothing to retract |
| Held classes do not forbid ungated classes landing as their own commits | `:237` "Classes 1–5 are ungated and land on engineering's schedule; class 13 is ungated too" | Yes |
| Resolution is ordering, never registration | `:150` "PLAN must carry the gate as a real dependency edge over class 7's predecessors … PROPERTIES must place the ATs for classes 7–12 behind that edge"; `:237` same | Yes — this is the ordering resolution, already load-bearing |
| Branch does not merge on a green subset; completion is all criteria at HEAD | `:237` "the feature is not \"done\" and the branch does not merge on a green subset" | Yes — verbatim agreement |
| AC-1.1's *given* is "sweep complete at HEAD" (`REQ:296`) | `:162` oracle cell scopes AT-1.1 to the completed sweep, gated on class 7 | Yes |

The gate itself is untouched by the erratum: DEC-07's class-6 block on erratum 6 and DEC-10's classes-7–12
block on erratum 3 are neither lifted nor narrowed by REQ v0.12, and none of DECISIONS' re-evaluation
triggers (2, 2a, 2b, 2c) name an event this edit constitutes.

## Consequences

- **For DECISIONS:** a one-line vocabulary correction at two sites (`:237`, `:162`). No option text, no
  rejection reason, no count, no owning-oracle assignment moves. The correction is cheap because the
  document's *mechanism* was already ordering-based; only its label for the interim was "red".
- **For PLAN:** unchanged. The class-7 predecessor edge and the class-6 edge remain the required shape,
  and REQ:270 now independently mandates them ("the check becomes live with the class it covers"). If PLAN
  were instead to schedule AT-1.1 live before class 7, REQ v0.12 makes that a defect on its own terms.
- **For PROPERTIES:** unchanged, and now doubly anchored — placing classes 7–12 ATs behind the erratum-3
  edge is both DECISIONS' downstream obligation (`:150`, `:237`) and REQ's stated resolution.
- **Risk if F-01 is left unfixed:** a downstream author reading "AC-1.1's set-equality stays red … per REQ
  C-7" can reasonably conclude a red check is expected on the branch, and the natural way to survive an
  expected red is to register or tolerate it — precisely the shape REQ:268 and C-8 forbid. The finding is
  Medium rather than Low for that reason, and Medium rather than High because DECISIONS' adjacent
  sentences already prescribe the ordering fix, so the document does not actually instruct anyone to
  register anything.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **DECISIONS calls the held interim a red, and attributes that red to C-7; REQ at HEAD now says it is not a red.** `:237` reads "each ungated class is independently green per REQ C-7, but AC-1.1's `dist/` set-equality **stays red** while classes 7–12 are held", and the DEC-01 row's owning-oracle cell at `:162` reads "green once class 7 lands, and DEC-10's erratum-3 gate **holds it red**". REQ:267–:268 now states the opposite in terms: AC-1.1 being unsatisfied while a class is held "is simply an incomplete feature on an unmerged branch — it is **not** a C-7 red", and REQ:265–:266 explains why (C-7 governs per-commit CI; AC-1.1 is evaluated at sweep completion per its own *given*, `REQ:296`). The conclusion both documents draw is identical, so nothing downstream needs re-planning — but the word is now wrong and it is the word a PLAN or PROPERTIES author will inherit. Fix: at `:237` replace "stays red while classes 7–12 are held" with "is not yet satisfied while classes 7–12 are held — an incomplete feature on an unmerged branch, not a red (REQ C-7, *Held classes and the interim state*)"; at `:162` replace "holds it red" with "holds it unsatisfied — the oracle becomes live with class 7". | REQ C-7 `:264`–`:271`; AC-1.1 `:296`; DEC-01, DEC-10 |
| F-02 | Low | Local | **No DECISIONS site cites the new C-7 paragraph, so the next reader re-derives the interim disposition instead of transcribing it.** DEC-10's price paragraph (`:150`) and the gated-merge paragraph (`:237`) are the two places the interim is described, and both cite only FSPEC §3.1 ordering rows and REQ C-7 in the abstract. REQ now owns an explicit disposition for exactly this state, and the pipeline's transcribe-don't-re-measure rule (rule 2, the one this document applied to FSPEC's ordering cells in v0.4) applies equally here. Fix: add the `REQ:264` anchor to the gated-merge paragraph where "not a red / ordering, never registration" is asserted, so the claim carries its upstream referent the way the FSPEC ordering quotes now do. | REQ C-7 `:264`; DEC-10 |

No High findings. The two findings are descriptive; neither changes a chosen option, the blocked-class
count (seven of thirteen: 6 on erratum 6, 7–12 on erratum 3), or a downstream obligation's scope.

FINDING: Medium | delta | nonlocal | DECISIONS §"What a gated merge looks like" `:237` and DEC-01 table row `:162` | Calls the held interim state a "red" and attributes it to REQ C-7; REQ at HEAD (`:267`) now says it is explicitly not a C-7 red but an incomplete feature on an unmerged branch.
FINDING: Low | delta | nonlocal | DECISIONS `:150` and `:237` | Neither site cites REQ's new C-7 "Held classes and the interim state" paragraph (`REQ:264`), leaving the interim disposition re-derived rather than transcribed.

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ:270 says a check that would otherwise run red before its class lands becomes live *with* the class it covers. DEC-01's owning oracle (AT-1.1, `dist/` set-equality) and DEC-02's `consolidationBuild.test.js` T32 `--check` assertion are both marked **gated: class 7** at `:162`–`:163`. Is "gated" in those cells intended to mean *the assertion does not exist in the tree until the class-7 commit* (which is what REQ:270's "becomes live with the class" describes), or *the assertion exists and is ordered behind class 7 in PLAN's DAG*? Both readings satisfy the erratum, but only the first survives a mid-sweep CI run on the branch; PLAN needs one answer to write the class-7 commit's contents. |
| Q-02 | Q-01 from v4 (whether class 13 is ungated in practice or held behind class 12's documentation story) remains open and is untouched by this erratum. Flagging that it is still unanswered so it is not lost across the re-anchor. |

## Positive Observations

- **The erratum ratifies DECISIONS rather than overturning it.** REQ v0.12's closing sentence — "The
  branch does not merge on a green subset: completion is all criteria satisfied at HEAD, held classes
  included" — is DECISIONS' `:237` conclusion, reached independently in the engineering document one round
  earlier. A downstream document whose reasoning an upstream erratum later adopts verbatim is the healthy
  direction for this cascade to run.
- **The ordering resolution was already in the document.** REQ:270 mandates ordering over registration;
  DECISIONS `:150` had already told PLAN to carry the gate "as a real dependency edge over class 7's
  predecessors — not a prose note" and PROPERTIES to place the classes 7–12 ATs behind that edge. Nothing
  downstream has to be rebuilt to comply with the new paragraph, which is why this confirmation is a
  vocabulary fix rather than a re-decision.
- **DECISIONS carries no skip-list, expected-failure inventory or tolerated-red register.** The erratum's
  strongest new prohibition (REQ:268–:269) finds nothing to retract in this document. The v1–v4 discipline
  of naming gates as dependency edges, never as tolerated failures, is what made that true in advance.
- **The gate arithmetic re-verified clean.** Seven of thirteen classes gated (6 on erratum 6, 7–12 on
  erratum 3) at `:150`, and the same partition at `:237`; the erratum touches neither the membership nor
  the count, and no re-evaluation trigger (2, 2a, 2b, 2c) is fired by this edit.

## Recommendation

**Approved with minor changes.** DECISIONS still holds against REQ at
`sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51`. The approval anchor may be
re-issued against this REQ state. Two textual corrections should land in the next DECISIONS touch, and
neither gates the phase:

1. `:237` — stop calling the held interim a "red" and stop attributing it to C-7; use REQ:267's own
   framing ("an incomplete feature on an unmerged branch").
2. `:162` — same correction in the DEC-01 owning-oracle cell ("holds it red" → "holds it unsatisfied; the
   oracle becomes live with class 7"), and cite `REQ:264` where the interim is described.

No finding contradicts `docs/_constraints/DOMAIN-CONSTRAINTS.md` or any promoted decision in
`docs/_decisions/`; `DECISIONS-plugin-distribution.md`, which DEC-08 leans on, is unchanged this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
