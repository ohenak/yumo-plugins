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

The oracles are where an upstream shift does real damage, so I checked every AT whose *Then* or
*Oracle* clause depends on edited REQ text.

**AT-12 — the wave loop skipped in full (REQ-WVR-08).** This is the AT the erratum could have
invalidated, and it survives intact. Its counting oracle asserts **zero** agent dispatches and
**zero** gate invocations *for the implementation wave loop*, and its fourth conjunct asserts the
V-wave still dispatches **exactly one** agent and invokes the gate command **exactly once**, its
commit being the run's only Phase-I-adjacent commit. REQ v1.6 now asserts precisely that split
("continues to dispatch, gate and commit on every invocation"), so the fourth conjunct is no
longer a FSPEC-local refinement of a broken upstream claim — it is the direct compression of an
upstream sentence. Had the erratum resolved the other way (V-wave folded into the record's
scope), AT-12's fourth conjunct would have inverted; it did not, and the AT needs no edit.

**AT-02 — the disregard catalogue (REQ-WVR-02).** The AT asserts set equality over the *announced
reasons*, with IG-1's arms enumerated, "not over the six cause labels", and gives the reason: a
six-label set-equality check cannot fail when one of IG-1's arms is deleted. REQ v1.6's added
sentence disclaims precedence but still owes "a **set-equality** check over IG-1..6 rather than a
containment check". These do not collide: the REQ names the floor (set equality, not containment),
the FSPEC raises it (over announced reasons, arms included). The FSPEC's oracle strictly implies
the REQ's, so a te-author building to AT-02 discharges REQ-WVR-02's obligation. Holds.

**AT-03 — the IG-5 × IG-4 discriminating fixture.** This fixture exists because §3.2's order is
ancestry-before-over-count, and v1.6 now explicitly assigns that order to the FSPEC. The fixture
remains the discriminating one and its expectation (IG-5 announced) still fails under the REQ's
numbering. Holds — and it is now testing a settled contract rather than a contested one.

**AT-18, AT-15, AT-08, AT-13** and the rest trace to criteria untouched this round. My two open
non-gating v2 findings against AT-18's counterfactual arithmetic and AT-12's fixture condition are
unaffected by the upstream move and are carried below unchanged, tagged `inherited`.

## Open Questions

§7's obligations are where the BL-04 half of the round lands.

**OB-F1 — substance right, quotation stale.** The obligation says BL-04 is **not met**, that the
authoring tree is 1,637 commits behind the default branch and carries neither the mechanism nor
`docs/_constraints/pdlc-wave-gate-baseline.md`, that §1's claims are therefore verified against
`origin/main`, and that the branch must be rebased before TSPEC authoring. Every word of that is
still true and is now *agreed by upstream*: REQ v1.6 §10 reads "BL-04 is **open and unmet** — not
discharged at FSPEC authoring: the authoring tree, 1,637 commits behind the default branch,
carries neither the resume mechanism nor `docs/_constraints/pdlc-wave-gate-baseline.md`. It is
owed before implementation…". The two documents now say the same thing, including the same
commit-count measurement.

What is stale is OB-F1's closing clause: "Raised as an erratum against the REQ, whose §10 records
BL-04 as **\"discharged at FSPEC authoring\"**." Upstream §10 no longer records that — it records
the negation of it, in those exact words. A quoted upstream sentence that upstream no longer
contains is the failure mode DEC-ERR-03 asks this round to catch, and it is worse than a dangling
pointer: a reader who takes the quotation at face value believes the REQ still asserts BL-04 is
discharged, and may re-raise the erratum that has already been adjudicated. Fix is one clause —
state that the erratum was raised and landed in REQ v1.6, which records BL-04 open and unmet.
Filed as F-01. I am deliberately *not* asking for OB-F1's substance or its discharge condition
("the branch is rebased and the mechanism is readable in the tree") to change; both are correct.

**OB-F4** is blocked on OB-F1 and cites REQ OF-1/OF-2 for promotion into the baseline as
`M-WVR-1..2`. OF-1's restatement in this round changes the *content* to be promoted (16 waves, the
per-halt decomposition), not the obligation. Because OB-F4 names OF-1 by id rather than
transcribing its numbers, it needs no edit — and the se-author discharging it at TSPEC time will
naturally read v1.6. No finding, and worth recording as the reason id-citation beat transcription
here.

**OB-F2, OB-F3, OB-F5, OB-F6** trace to untouched material. The §7 "Round 1 revision note" carries
the second half of F-03: it describes both errata as "raised", with no indication that both have
since landed.

## Recommendation

**Approved with minor changes.** The FSPEC still holds as approved against REQ v1.6. Two of the
four upstream edits moved the REQ toward this document; the other two cost it nothing, because it
compressed OF-1's shape rather than its arithmetic and cited it by id. Three sentences describe a
version of upstream that no longer exists and should be corrected in a single pass; none of them
touches an observable, a rule, an edge case or an oracle.

## Delta-Confirmation Findings

No High findings. Three `delta` findings are stale-provenance sentences created by the upstream
move; three `inherited` findings are my still-open non-gating v2 findings, restated so this round
is a complete statement of what is open against the FSPEC.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | OB-F1 quotes REQ §10 as recording BL-04 "discharged at FSPEC authoring"; REQ v1.6 §10 records the opposite. The obligation's substance is correct and now agrees with upstream — only the quotation is stale. | §7, OB-F1 |
| F-02 | Low | delta | local | §1 pins the derivation to "REQ-pdlc-wave-resume.md v1.5"; the upstream is now v1.6 and that version no longer exists. | §1 Overview |
| F-03 | Low | delta | nonlocal | EC-20 and §7's Round-1 revision note describe both errata as open ("an upstream question, raised as an erratum against REQ-WVR-08"); both were adjudicated in REQ v1.6, in the FSPEC's favour. | EC-20; §7 Round 1 revision note |
| F-04 | Medium | inherited | nonlocal | EC-15a fixes the partial-write behaviour but pins nothing about the failed-write notice's content, and the shipped notice asserts the opposite ("a later invocation will simply start from wave 1"). Carried from v2 F-01, unaffected by this round. | EC-15a, BR-15, AT-15 |
| F-05 | Medium | inherited | nonlocal | AT-18's discriminating-value sentence mis-computes the counterfactual: a per-run record skips waves 1–2, not "only wave 3". The Then clause is right. Carried from v2 F-02. | AT-18 |
| F-06 | Low | inherited | nonlocal | AT-12's "exactly one agent dispatch" conjunct is fixture-conditional — the V-wave dispatch is wrapped in a retry envelope — and the first-call-succeeds condition is unstated. Carried from v2 F-03. | AT-12 |

FINDING: Medium | delta | local | §7 OB-F1 | quotes REQ §10 as recording BL-04 "discharged at FSPEC authoring"; REQ v1.6 §10 now records BL-04 open and unmet, so the quoted upstream sentence no longer exists — state instead that the erratum landed and upstream agrees
FINDING: Low | delta | local | §1 Overview | derivation is pinned to "REQ-pdlc-wave-resume.md v1.5"; upstream is now v1.6 after the Phase F erratum round, so the pin names a version a downstream author cannot obtain
FINDING: Low | delta | nonlocal | EC-20 and §7 Round 1 revision note | both describe the V-wave scoping and BL-04 errata as open/raised; REQ v1.6 adjudicated both in the FSPEC's favour, so the framing invites a reader to re-raise a settled question
FINDING: Medium | inherited | nonlocal | EC-15a / BR-15 / AT-15 | the failed-write notice's content is unconstrained, so an implementation can land EC-15a's resume behaviour while keeping today's notice, which announces a false cost, and every AT still passes (v2 F-01, still open)
FINDING: Medium | inherited | nonlocal | AT-18 | the discriminating-value sentence names the wrong counterfactual skip set: a per-run record skips waves 1–2, not "only wave 3" (v2 F-02, still open)
FINDING: Low | inherited | nonlocal | AT-12 | the "exactly one agent dispatch" conjunct holds only for a fixture whose transport does not fail on the first call, and that condition is unstated (v2 F-03, still open)

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 3}

APPROVAL-HASH: sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d
APPROVAL-HASH-NORMALIZED: sha256:892e0c54c996442b451a9f41dd3175e5ba6f8f5ef2c2e9f12613be00e0928fe1
REVIEWED-COMMIT: c37b80df2aaf22d808c8c34ea24b70167e9e52a1
UPSTREAM-STATE: REQ sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518
