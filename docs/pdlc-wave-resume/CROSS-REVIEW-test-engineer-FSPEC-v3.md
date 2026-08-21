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

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Obligations

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
