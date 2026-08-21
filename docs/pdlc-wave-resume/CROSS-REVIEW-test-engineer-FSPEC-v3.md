# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation, round 3)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** upstream-cascade confirmation. FSPEC's own bytes are unchanged; REQ was edited by an
erratum round after this FSPEC's approval was recorded. The single question answered here is
whether the FSPEC still holds as approved against REQ **at its current version**
(sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518).

## Overview

**What this round is.** Not a re-review of the FSPEC. The FSPEC's bytes are byte-identical to the
version approved in `CROSS-REVIEW-test-engineer-FSPEC-v2.md` (verdict: *Approved with minor
changes*, `{"high": 0, "medium": 2, "low": 3}`, `REVIEWED-COMMIT: 1dc235e0`). What moved is the
upstream: REQ went from v1.5 to v1.6 under a Phase F erratum round, so the approval on record was
taken against a REQ that no longer exists.

**Delta base.** The REQ state this FSPEC was approved against is
`1dc235e0:docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`
(sha256:a5d3e984…, pinned by the `UPSTREAM-STATE:` anchor at the foot of the v2 review). The REQ
at HEAD is sha256:ad68cd05… — verified locally with `shasum -a 256`, matching the sha in this
dispatch exactly. The diff read for this confirmation is:

```
git diff 1dc235e0..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
```

— 7 commits, 5 hunks, no acceptance criterion added, renamed or deleted.

**The five upstream hunks.**

| # | REQ section | What the erratum changed |
|---|---|---|
| E-1 | Header | Version 1.5 → **1.6**, plus a v1.6 erratum note in §1's revision log |
| E-2 | §1 (Problem) | OF-1's plan restated as **16 waves**; the replay cost is now stated **per halt** (wave-4 re-entry = seven no-op dispatches over waves 1–3; wave-2 re-entry = wave 1 only, a single task) rather than as a flat per-halt tax |
| E-3 | REQ-WVR-02 | Adds: *"The IG labels name **causes, not precedence**"* — the table's row order carries no claim about evaluation order, which is **FSPEC's to state** (citing §3.2's ancestry-before-over-count) |
| E-4 | REQ-WVR-08 | The no-commit claim is **scoped to the implementation wave loop**; Phase PT's V-wave (OF-1's 17th wave) is named as outside the record's scope and as continuing to *"dispatch, gate and commit on every invocation"* (citing FSPEC §2, EC-20) |
| E-5 | §10 (Readiness) | BL-04 recorded **open and unmet** — explicitly *"not discharged at FSPEC authoring"* — while remaining a non-gate for `ready: true` |

**Direction of travel.** E-3, E-4 and E-5 are the upstream halves of findings this FSPEC itself
raised and routed (§3.2's ordering note, EC-20/BR-11's wave-loop scoping, OB-F1's BL-04 erratum).
The erratum moved the REQ *toward* the FSPEC, so the compression relation is stronger after the
edit than before it — no clause of the FSPEC is contradicted by the new upstream text. What the
edit does create is a small class of **stale quotations**: three places where the FSPEC quotes or
characterises REQ text that the erratum has now rewritten, including one quotation of a sentence
that no longer exists anywhere in the REQ. Those are the findings of this round (F-01..F-03), all
Low. One pre-existing Medium (v2 F-01, EC-20's commit conjunct) is re-surfaced as `inherited`
because the erratum copied the overstated half **into** the REQ, which changes where the fix has
to land — see §Edge Cases.

## Linked Requirements

The FSPEC's §2 traceability table maps seven FSPEC clauses onto REQ-WVR-01..08. The erratum
touched the **body** of two criteria (REQ-WVR-02, REQ-WVR-08) and no criterion's id, priority,
phase or existence. The traceability table therefore still resolves: every id it cites is present
at HEAD, and no criterion at HEAD is left uncovered.

| REQ id at HEAD | Touched by erratum? | FSPEC clause that leans on it | Still faithful? |
|---|---|---|---|
| REQ-WVR-01 | no | FSPEC-WVR-01 (§3.1, D-1..D-3) | yes (unchanged bytes both sides) |
| REQ-WVR-02 | **yes (E-3)** | FSPEC-WVR-02 (§3.2 question table, BR-03, AT-02) | **yes — strengthened**, see §Behavioral Flow |
| REQ-WVR-03 | no directly; its *discharge* prose moved with E-4 | BR-11, EC-09, EC-20, AT-12 | yes, see §Business Rules |
| REQ-WVR-04 | no | §3.3 operator override, EC-10 | yes |
| REQ-WVR-05 | no | FSPEC-WVR-02 announcements, OB-F5 | yes |
| REQ-WVR-06 | no | §3.2 question 5 carve-out | yes |
| REQ-WVR-07 | no | BR-16, AT-16 | yes |
| REQ-WVR-08 | **yes (E-4)** | FSPEC-WVR-01 outcome (c), BR-11, EC-09, EC-20, AT-12 | **yes — strengthened**, see §Business Rules |

**One traceability-adjacent defect, and it is a version pin, not a mapping error.** §1 states the
FSPEC *"derives entirely from `REQ-pdlc-wave-resume.md` **v1.5** and adds no requirement of its
own."* The REQ at HEAD is v1.6. The sentence is a provenance claim about a document version that
this FSPEC no longer derives from — the exact class of stale citation DEC-ERR-03 puts in scope for
this round. It is Low, not Medium: nothing downstream keys off the version literal, no clause
content is wrong, and the fix is a two-character edit. But it should be made in the same touch as
F-02/F-03 rather than left for the TSPEC author to trip over while diffing the two documents.
Filed as **F-01**.

**Non-finding, recorded so the next reader does not re-derive it.** The erratum added no new
acceptance criterion, so there is no uncovered-AC gap to open here. I re-checked the closed
catalogues the FSPEC pins set equality over (OB-F5): the six disregard causes IG-1..6 are still
six at HEAD, the resume-outcome catalogue is still *"closed at three"*, and the recognised
`implementation.*` key set is untouched by the erratum. AT-02, AT-08 and AT-13's set-equality
targets therefore keep the same cardinality they were written against — a cardinality change in
any of those three would have been a High here, and there is none.

## Behavioral Flow

Only one flow is implicated by the erratum: §3.2, *Consulting the record*. E-3 rewrote the
paragraph of REQ-WVR-02 that the FSPEC's ordering note answers.

**REQ at HEAD now says** (REQ-WVR-02, closing paragraph): *"The IG labels name **causes, not
precedence**: this table's row order carries no claim about the order in which a run tests for
them, which is FSPEC's to state (§3.2 there evaluates ancestry before over-count)."*

**FSPEC §3.2 says** (bolded paragraph closing the question table): *"The order above is
deliberately not REQ-WVR-02's IG numbering. The REQ enumerates IG-4 (over-count) before IG-5
(ancestry); the evaluation order here places ancestry before over-count… The IG labels name
causes, not precedence; only this table's order is normative (BR-03)."*

The two now agree verbatim on the load-bearing phrase and agree on which document owns the
ordering claim. Before the erratum, the FSPEC was asserting a divergence *against* an upstream
that was silent about it; after the erratum, upstream ratifies the divergence and points at
§3.2 as the normative source. This is the strongest possible outcome for a cascade round: the
compression is now bidirectionally checkable.

**Testability consequence, re-verified.** The ordering claim is what makes AT-03's fixture pair
discriminating — a record that is simultaneously over-count *and* names an unreachable commit
must announce the **ancestry** reason (IG-5), not the over-count one (IG-4), and that is the only
oracle able to tell the shipped chain from the REQ's numbering. E-3 does not weaken it; it removes
the reading under which a te-author could have argued the REQ's numbering was normative and
written the oracle the other way round. I re-confirmed the shipped chain still orders
feature → plan → ancestry → over-count in `origin/main:pdlc/workflows/orchestrate-dev.js`
(`headCorroborated` consulted before the `lastGreenWave > waves.length` comparison), so §3.2's
table, AT-03's expected reason and the REQ's new sentence are three consistent statements of one
fact.

**Question 5's three-answer structure is untouched.** E-3 says nothing about the no-commit-named
arm, so §3.2's "reachable / unreachable / no commit named at all — which passes" trichotomy and
its `pre-\`head\` record: honoured as before` grounding stand exactly as approved in v2. EC-21 and
AT-03 need no change.

**§3.1 and §3.3 were not reached by any hunk.** D-1..D-3, the explicit-pointer precedence and the
clamp behaviour are upstream-unchanged; per the delta protocol I did not re-read them.

## Business Rules

E-4 is the hunk with real content, and BR-11 is the rule that carries it.

**REQ-WVR-08 at HEAD:** *"no wave of the **implementation wave loop** executes, so that loop runs
no gate and **lands no new commit**… The claim is scoped to that loop: Phase PT's appended
verification wave, OF-1's 17th wave, is outside the resume record's scope and continues to
dispatch, gate and commit on every invocation (FSPEC §2, EC-20)… An implementation that lands a
wave-loop commit under this outcome violates REQ-WVR-03."*

**FSPEC BR-11:** *"Under outcome (c) the implementation wave loop dispatches nothing, executes no
wave gate, and produces no commit… The rule is scoped to the wave loop (§2 Vocabulary): Phase PT's
V-wave is outside it and replays on every invocation (EC-20)."*

Same scope, same violation condition, same excluded phase. The erratum landed precisely the
correction the FSPEC's §7 round-1 note said it had routed, and the resulting REQ sentence is now a
faithful upstream of BR-11 rather than the contradiction it was at approval time. **BR-11 is
confirmed.**

**Two consequences worth recording for the te-author.**

1. The v2 disposition of my v1 F-01 rested on the FSPEC having scoped the claim *while the REQ had
   not*, with the mismatch parked as an erratum. That asymmetry is now gone, which means the
   PROPERTIES author no longer needs a note explaining why the two documents differ. Nothing to
   change in the FSPEC; recorded so the difference is not "restored" by a later editor.
2. E-4 pins the V-wave as **OF-1's 17th wave**. The FSPEC never numbers it, and does not need to —
   but the number is only consistent with E-2's restatement of OF-1 as a **16-wave** plan. I
   checked the FSPEC for any surviving 15-wave arithmetic and there is none: the FSPEC quantifies
   replay cost nowhere except EC-12 and EC-15a, both of which are stated relationally ("nothing
   below wave 1 exists to replay"; "the number of consecutive failed writes at the end of the
   run"). Relational statements survive the recount unchanged. Had the FSPEC transcribed the old
   "15-wave / seven no-op dispatches per halt" literal, that would have been a `delta` finding
   here; it did not, and that is a point in the authoring's favour.

**BR-03, BR-10, BR-15, BR-16, BR-17 are untouched upstream** and are not re-litigated. BR-15's
per-wave recording claim was verified against the shipped write site in v2 and no hunk of this
erratum touches C-2/C-3, its upstream.

## Edge Cases and Error Scenarios

**EC-09 — confirmed.** Its outcome-(c) description ("skipped in full, announced with the reason
and the hatch, one report row with a distinguishing status") is a clause-for-clause compression of
REQ-WVR-08's outcome-(c) paragraph, which the erratum edited only in its *discharge* sentence. The
compressed half is unchanged upstream.

**EC-12 — confirmed against the recount.** EC-12 cites `REQ §1, OF-1` for "a halt at wave 1 pays
no replay tax". E-2's new §1 text says re-entry after the **wave-2** halt "replayed wave 1 only, a
single task". These are consistent, not contradictory: EC-12's case is a halt *at* wave 1, below
which there is nothing. The citation still resolves to text that supports the claim.

**EC-20 — confirmed as a compression; its Medium defect is now mirrored upstream.** EC-20 says the
V-wave *"dispatches, gates and commits on every invocation"*. E-4 now says the V-wave *"continues
to dispatch, gate and commit on every invocation"* and cites `FSPEC §2, EC-20` as its source. So
the FSPEC is a faithful compression of the REQ — the two agree exactly — and there is **no cascade
finding** on fidelity grounds.

What has changed is where the defect I already filed has to be fixed. My v2 **F-01 (Medium)** held
that the *commit* third of that triple is not script-owned: the dispatch and the gate are
mechanical (`phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`, and the `runCommandFn(implConfig.testCommand)`
call under the script gate), but the script commits nothing for the V-wave — the commit is an
instruction inside `propertiesTestPrompt` ("All tests must pass before committing. Commit and
push.") and is never verified afterwards. Under outcome (c) with the PROPERTIES suite already
written and green, the agent may correctly add nothing, so any oracle asserting "the V-wave
produces a commit" is flaky by construction.

The erratum has copied that overstatement **into the REQ**, so what was one Medium in one document
is now the same Medium asserted in two, with the REQ citing the FSPEC as its authority. That does
not gate this confirmation — it is `inherited`, it was in the pre-round bytes, and the round's edit
did not create it. It does mean the eventual fix is a two-document edit, and that a te-author who
reads only the REQ will now find the flaky oracle stated there with no caveat. Filed as **F-04
(Medium, inherited)** so the routing is explicit rather than assumed to have been handled by the
erratum.

**EC-15/EC-15a, EC-16, EC-17, EC-21 — untouched upstream, not re-read.** EC-15a's replay-cost
clause is relational and survives E-2's recount (see §Business Rules). EC-16's per-feature
ownership arm traces to REQ OB-3, which no hunk touched.

## Acceptance Tests

The cascade question for §6 is narrow: does any AT's **oracle** or **discriminating value** depend
on REQ bytes the erratum rewrote? Three ATs touch the edited material.

| AT | Depends on | Effect of the erratum | Status |
|---|---|---|---|
| AT-02 | REQ-WVR-02's closed six-cause catalogue | E-3 added a precedence disclaimer; the catalogue is still IG-1..6 and still closed by the same sentence | **unchanged** — the set-equality target keeps its cardinality |
| AT-03 | The ancestry-before-over-count order | E-3 ratifies it upstream and defers to §3.2 | **strengthened** — the fixture pair (over-count *and* unreachable ⇒ announce IG-5) is now backed by both documents |
| AT-12 | REQ-WVR-08's outcome-(c) discharge | E-4 scopes the no-commit claim to the wave loop, matching AT-12's call-count oracle | **confirmed**, with the v2 caveats still open |

**AT-12 in detail, because it is the one the erratum re-touches.** Its first three conjuncts —
zero agent dispatches on the wave loop, zero wave-gate invocations, no implementation-wave commit —
are exactly what REQ-WVR-08 now claims, and all three are script-owned and falsifiable. Its
*fourth* conjunct, the V-wave one, carries the two Mediums I raised in v2 and neither is resolved
by this erratum:

- the commit half is agent-dependent, not script-owned (v2 F-01; now mirrored upstream — F-04 here);
- the "dispatches exactly **one** agent" literal is measured through `withDispatchRetry`, which
  re-dispatches once on a transport fault and would make the count 2 with no behaviour change in
  this feature (v2 F-02). E-4's *"continues to dispatch… on every invocation"* neither introduces
  nor repairs that; the precondition still needs naming so te-author pins a non-faulting agent seam.

Both remain Medium and non-gating; I do not re-file v2 F-02 here, since the erratum did not touch
its material and it is already on the record for the FSPEC's own revision loop. F-04 *is* re-filed
because the erratum changed where its fix must land.

**AT-18 — re-checked and clean.** Its discriminating value rests on completion being a
**plan-absolute high-water mark** (a recorded wave number counted from the plan's first wave, not
from the run's), verified in v2 against the plan-absolute `waveNum` at the write site. E-2's
15→16 recount is a fact about OF-1's observed plan, not about the counting convention, so AT-18's
fixture ("resume point of wave 4, not wave 3") is untouched. This was the AT most at risk from a
wave-count edit and it survives it.

**No AT gained or lost an upstream anchor.** Every `REQ-WVR-*` and `REQ §N` citation in §6 resolves
at HEAD.

## Obligations

Two stale characterisations of upstream live in §7, both created by this erratum landing. Neither
changes a behaviour or an oracle; both are DEC-ERR-03 findings because they are statements about
what the REQ says, and the REQ no longer says them.

**F-02 — OB-F1's closing clause is now false.** OB-F1 reads: *"Raised as an erratum against the
REQ, **whose §10 records BL-04 as 'discharged at FSPEC authoring'**."* E-5 rewrote exactly that
sentence: §10 at HEAD says BL-04 is *"**open and unmet** — not discharged at FSPEC authoring"*, and
spells out the reason the FSPEC gave (tree 1,637 commits behind; neither the mechanism nor
`docs/_constraints/pdlc-wave-gate-baseline.md` present). The quoted phrase exists nowhere in the
REQ at HEAD. This is the erratum **succeeding** — the FSPEC asked for it and got it — but the
obligation row still describes the pre-erratum world, and a reader who checks the citation finds
the opposite of what OB-F1 claims. The fix is one clause: record the erratum as landed, and keep
OB-F1 open on its actual substance, which is the *branch base*, not the REQ's wording. Low.

**Important: OB-F1 itself does not close.** E-5 changed what the REQ *records*; it did not rebase
the branch. The tree is still 1,637 commits behind, the mechanism and the baseline file are still
absent, every shipped-behaviour claim in §1 is still verified against `origin/main`, and the
positional citations are still not re-verifiable here. OB-F1's discharge condition ("the branch is
rebased and the mechanism is readable in the tree") is unmet, and **OB-F4 stays blocked on it**.
The one thing that changed is that the REQ now agrees the prerequisite is unmet instead of
claiming it was discharged — which removes the contradiction between the two documents but adds no
capability. AT-14's branch precondition (the `.gitignore` rule is absent in this tree, so the test
is RED until the rebase) is likewise unaffected and must not be weakened to "observed quiet".

**F-03 — §7's round-1 revision note quotes a deleted sentence.** It reads: *"Two upstream defects
were routed rather than fixed in place: REQ-WVR-08's '**Phase I produces no new commit**' (falsified
by Phase PT's V-wave) and the REQ's discharge of BL-04."* Both halves are now historical: the first
quotes a string E-4 deleted (REQ-WVR-08 at HEAD says "lands no new commit", scoped to the
implementation wave loop), and the second describes a discharge E-5 withdrew. As a *revision-note*
statement of what round 1 did, it was true when written; as a citation a downstream reader will
follow, it points at text that is gone. Restate both in the past tense with the landing recorded.
Low.

**OB-F2, OB-F3, OB-F5, OB-F6 — unaffected.** None cites the edited material. OB-F5's three
set-equality catalogues keep their cardinality (see §Linked Requirements), so the PROPERTIES
obligation it creates is unchanged in scope.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | §1 pins the upstream as "REQ-pdlc-wave-resume.md **v1.5**"; the REQ at HEAD is v1.6. Stale version provenance for a document this FSPEC declares it derives from entirely. | FSPEC §1, "derives entirely from … v1.5" |
| F-02 | Low | delta | local | OB-F1 states the REQ's "§10 records BL-04 as 'discharged at FSPEC authoring'". §10 at HEAD says the opposite — "open and unmet — not discharged at FSPEC authoring". The quoted phrase no longer exists upstream; the erratum landed the FSPEC's own ask and the row was not updated to record it. OB-F1's substance (branch base unmet) remains open and correct. | FSPEC §7, OB-F1 |
| F-03 | Low | delta | local | §7's round-1 revision note quotes REQ-WVR-08's "Phase I produces no new commit" as an open routed defect; E-4 deleted that string (HEAD: "lands no new commit", scoped to the implementation wave loop) and E-5 withdrew the BL-04 discharge. Both routed errata have landed; the note still reads as though neither had. | FSPEC §7, "Round 1 revision note" |
| F-04 | Medium | inherited | local | EC-20 / AT-12's fourth conjunct assert the V-wave "commits on every invocation". The commit is not script-owned — it is an instruction inside `propertiesTestPrompt`, never verified, and a correct agent may add nothing under outcome (c) — so the oracle is flaky by construction (v2 F-01, unresolved). E-4 has now copied the overstatement into REQ-WVR-08 citing EC-20 as its authority, so the fix is a two-document edit and a te-author reading only the REQ finds it uncaveated. | FSPEC EC-20, AT-12; REQ-WVR-08 |

FINDING: Low | delta | local | FSPEC §1 upstream pin | §1 says the FSPEC "derives entirely from REQ-pdlc-wave-resume.md v1.5"; the REQ at HEAD is v1.6, so the provenance pin names a version this FSPEC no longer derives from
FINDING: Low | delta | local | FSPEC §7 OB-F1 | OB-F1 quotes REQ §10 as recording BL-04 "discharged at FSPEC authoring"; §10 at HEAD says "open and unmet — not discharged at FSPEC authoring", so the quoted phrase exists nowhere upstream (the erratum landed the FSPEC's ask; the row was not updated to say so)
FINDING: Low | delta | local | FSPEC §7 round-1 revision note | The note quotes REQ-WVR-08's deleted string "Phase I produces no new commit" and describes the BL-04 discharge as still standing; both routed errata have landed, so both citations now point at text the REQ no longer carries
FINDING: Medium | inherited | local | FSPEC EC-20 and AT-12 fourth conjunct | The V-wave "commits on every invocation" conjunct is agent-dependent, not script-owned (the commit is an unverified instruction in propertiesTestPrompt), making the oracle flaky by construction; the erratum has mirrored the overstatement into REQ-WVR-08, so the fix now spans both documents

## Verdict

**FSPEC still holds as approved against REQ v1.6.** No High finding, `delta` or `inherited`. The
erratum moved the REQ toward this FSPEC on all three substantive hunks — it ratified §3.2's
ancestry-before-over-count ordering, scoped REQ-WVR-08's no-commit claim to the implementation wave
loop exactly as BR-11 does, and recorded BL-04 as unmet exactly as OB-F1 asked — so the compression
relation is stronger after the edit than before it. What the landing leaves behind is three Low
stale citations inside the FSPEC (a v1.5 version pin and two §7 notes that quote REQ text the
erratum rewrote or deleted) and one inherited Medium that the erratum has now mirrored upstream
(the V-wave "commits" conjunct in EC-20/AT-12), all recorded above for the FSPEC's own revision
loop. None of them blocks the TSPEC or PROPERTIES from proceeding.

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d
APPROVAL-HASH-NORMALIZED: sha256:892e0c54c996442b451a9f41dd3175e5ba6f8f5ef2c2e9f12613be00e0928fe1
REVIEWED-COMMIT: c37b80df2aaf22d808c8c34ea24b70167e9e52a1
UPSTREAM-STATE: REQ sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518
