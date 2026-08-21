# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** upstream-cascade confirmation. FSPEC bytes unchanged since my v2 approval
(`REVIEWED-COMMIT: 1dc235e0`). Upstream REQ moved from v1.5 (sha256:a5d3e98…) to v1.6
(sha256:ad68cd05…) across the Phase F erratum round `1b24056a..7660f1ed`. The single question
answered here: does this FSPEC still hold as approved against REQ as it now stands?

## Overview

**What moved upstream.** Four edits landed in REQ v1.6, all inside the erratum round:

| REQ edit | Substance | Bearing on this FSPEC |
|---|---|---|
| §1 / OF-1 restated | 15-wave plan → **16-wave**; the replay tax is now stated per halt ("re-entry after the wave-4 halt paid seven no-op dispatches; re-entry after the wave-2 halt replayed wave 1 only, a single task") | None. This FSPEC quotes no wave count and no dispatch count from OF-1; its only OF-1 citation is EC-12's "pays no replay tax, since nothing below wave 1 exists to replay", which the restated sentence corroborates rather than contradicts. |
| REQ-WVR-02 gains "IG labels name **causes, not precedence**" and cites FSPEC §3.2 evaluating ancestry before over-count | The REQ now yields evaluation order to this FSPEC | **Convergent.** §3.2's "The order above is deliberately not REQ-WVR-02's IG numbering" was written against the older REQ; upstream has now ratified exactly that reading. No divergence. |
| REQ-WVR-08 scoped to the **implementation wave loop**, with Phase PT's V-wave (OF-1's 17th wave) explicitly excluded and still dispatching, gating and committing every invocation — citing FSPEC §2 and EC-20 | The erratum I raised in v2 landed | **Convergent.** §2's Vocabulary paragraph, BR-11 and EC-20 already say this in the same terms. Upstream now matches the FSPEC rather than the other way round. |
| §10 BL-04 recorded **open and unmet**, not discharged at FSPEC authoring | The second erratum I raised in v2 landed | Substantively convergent with OB-F1, which already declares BL-04 unmet — but OB-F1 **quotes the superseded REQ sentence**, and §1's derivation pin still names REQ v1.5. Both are stale-provenance findings below. |

**Answer to the one question.** Yes, with sentence-level corrections. Every behavioural claim,
outcome, rule, edge case and acceptance oracle in this FSPEC remains a faithful compression of REQ
v1.6 — in two places the REQ has moved *toward* the FSPEC, not away from it. What no longer holds
is three provenance sentences that describe upstream as it was before this round: a version pin,
a quotation of REQ §10, and two "raised as an erratum, still open" framings for errata that have
now landed. None of them changes an observable; all three mislead a downstream reader about what
upstream currently says, which is precisely the class DEC-ERR-03 makes a finding of this round.

## Linked Requirements

§2's traceability table maps FSPEC-WVR-01..07 onto REQ-WVR-01..08. I re-read every cited REQ
criterion at v1.6 and each still says what the mapping row claims:

- **FSPEC-WVR-01 → REQ-WVR-01, REQ-WVR-08.** REQ-WVR-08's edit narrows *what is skipped* (the
  implementation wave loop, not "Phase I" whole), and narrows the discharge sentence to "lands no
  wave-loop commit". The FSPEC clause it feeds — the three-outcome decision with outcome (c) as
  "skip the implementation wave loop" — is unchanged by that narrowing because §2 already defines
  *Phase I* in this document to mean the wave loop. The trace holds.
- **FSPEC-WVR-02 → REQ-WVR-02, REQ-WVR-05.** REQ-WVR-02's added sentence removes a precedence
  reading the FSPEC never relied on and adds no cause; the catalogue is still closed at IG-1..6,
  which is what BR-02 and AT-02 compress.
- **FSPEC-WVR-03..07 → REQ-WVR-03, -04, -05, -06, -07.** Untouched by this round.

One residue: §1's opening sentence pins the derivation to "`REQ-pdlc-wave-resume.md` **v1.5**".
That is the document this FSPEC was compressed from, and it no longer exists — the header table
of the REQ now reads `| Version | 1.6 |`. A downstream TSPEC author who follows the pin either
reads a version they cannot obtain or, worse, assumes the FSPEC has not been checked against the
erratum round when in fact (per this confirmation) it has. The fix is one token plus a clause
naming the round, not a re-derivation. Filed as F-02 below.

## Behavioral Flow

**§3.1 (the decision) — holds.** D-1..D-3 and the two terminal actions are stated in terms of
outcomes (a)/(b)/(c), and REQ v1.6 still closes that catalogue at three in the same words. D-5's
wording — "Phase I dispatches no wave, executes no wave gate, and produces no
**implementation-wave** commit … Phase PT's V-wave is outside this scope" — is now *literally* the
upstream sentence rather than a correction of it. Nothing to change.

**§3.2 (consulting the record) — holds, and is now upstream-ratified.** The REQ edit adds:

> The IG labels name **causes, not precedence**: this table's row order carries no claim about the
> order in which a run tests for them, which is FSPEC's to state (§3.2 there evaluates ancestry
> before over-count).

§3.2's six-question table places question 5 (ancestry, IG-5) above question 6 (over-count, IG-4)
and says so explicitly in the paragraph headed "The order above is deliberately not REQ-WVR-02's
IG numbering". The two documents now agree on both the fact and on which document owns it. I
re-verified the shipped chain is still the one both describe: `feature` → `planHash` →
`headCorroborated` → `lastGreenWave > waves.length` in the resume-decision block of
`pdlc/workflows/orchestrate-dev.js` on `origin/main` (ancestry before over-count), unchanged since
my v2 verification. No finding.

One thing worth stating plainly because it could be misread as a conflict and is not: the REQ says
its row order "carries no claim" about evaluation order, while FSPEC §3.2 says "only this table's
order is normative (BR-03)". Those are the same statement from the two ends — the REQ disclaims
precedence, the FSPEC asserts it for its own table. There is no version of REQ v1.6 under which
§3.2 must change.

**§3.3–§3.5 — untouched upstream.** The operator-override precedence, the high-water completion
property, and the queue-parity clause trace to REQ-WVR-04, -05, -06 and -07, none of which this
round edited. I did not re-review them, per the delta protocol.

## Business Rules

Only BR-11 sits under the erratum's shadow, and it lands on the right side of it.

**BR-11 vs REQ-WVR-08 at v1.6.** The rule reads: "Under outcome (c) the implementation wave loop
dispatches nothing, executes no wave gate, and produces no commit. REQ-WVR-03 is discharged
because the wave loop lands nothing, not because a verification was skipped … The rule is scoped
to the wave loop (§2 Vocabulary): Phase PT's V-wave is outside it and replays on every invocation
(EC-20)." Upstream now says, in its own words, "no wave of the **implementation wave loop**
executes, so that loop runs no gate and **lands no new commit** … The claim is scoped to that
loop: Phase PT's appended verification wave, OF-1's 17th wave, is outside the resume record's
scope and continues to dispatch, gate and commit on every invocation (FSPEC §2, EC-20)." Same
scope, same discharge argument, same exclusion, and the REQ's violation clause ("an
implementation that lands a wave-loop commit under this outcome violates REQ-WVR-03") matches
BR-11's. This is the erratum I raised in v2 landing exactly as routed — the FSPEC needs no edit,
because it was already the more precise of the two.

**BR-02 (disregard catalogue closed at six).** REQ-WVR-02's edit added prose, not a cause. Six
still means six, and IG-6's deliberate silence is still upstream's word. Holds.

**BR-01, BR-03, BR-07, BR-08, BR-10, BR-12, BR-15 and the remainder.** Trace to REQ criteria this
round did not touch; not re-reviewed.

One second-order note, not a finding: because upstream now carries the wave-loop scoping itself,
BR-11's parenthetical justification is no longer load-bearing as a *correction*. If the author
touches BR-11 for any other reason, the citation may be simplified to "REQ-WVR-08 (v1.6)". I am
not asking for that edit — the rule as written is correct and re-opening a converged rule for
style is exactly what the erratum protocol exists to avoid.

## Edge Cases and Error Scenarios

Two rows cite the edited upstream material.

**EC-12 — the wave-1 halt (cites REQ §1, OF-1).** REQ §1 was rewritten in this round: the plan is
now 16 waves, and the replay tax is decomposed per halt. EC-12 says "Nothing is recorded … the
next invocation is EC-01: a silent full run. The re-entry is correct but pays no replay tax, since
nothing below wave 1 exists to replay." The new upstream sentence — "Each halt costs the task
count of every wave below it" — makes EC-12's claim a *consequence* rather than an assertion
alongside it: below wave 1 there are no waves, so the cost is zero. The citation still resolves and
still supports the row. **No finding**; this is the case where a restated upstream strengthens a
downstream row without touching it.

I checked for the trap this class of edit usually sets — a downstream document that transcribed
the superseded numbers. It did not: `grep -n "15-wave\|16-wave\|seven\|no-op"` over the FSPEC
returns nothing outside §2/BR-11's "dispatches nothing" phrasing. The FSPEC compressed OF-1 to its
shape, not its arithmetic, which is why the count change costs it nothing.

**EC-20 — the V-wave replays.** The behaviour, the oracle-relevant detail and the scoping all
match REQ v1.6 (see Business Rules above). One sentence in the row does not: "Whether the V-wave
should be recordable is not this FSPEC's to decide — it is an upstream question, **raised as an
erratum against REQ-WVR-08**." That erratum has now been adjudicated: REQ v1.6 decided it, by
scoping REQ-WVR-08 to the wave loop and placing the V-wave outside the resume record's scope
altogether. The row describes an open question that is closed. A TSPEC author reading EC-20 today
would go looking upstream for a pending decision and find a settled one — and might reasonably
conclude the FSPEC predates the settlement and cannot be trusted on this point, which is the
opposite of the truth. Filed with the §7 twin as F-03.

**EC-01..EC-19, EC-21 and the remainder.** Trace to untouched criteria; not re-reviewed.

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
