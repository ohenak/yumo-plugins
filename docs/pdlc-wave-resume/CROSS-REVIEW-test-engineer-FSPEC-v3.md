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

_pending_

## Behavioral Flow

_pending_

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
