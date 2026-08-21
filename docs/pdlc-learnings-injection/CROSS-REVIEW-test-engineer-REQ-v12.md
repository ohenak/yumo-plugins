# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 12
**Round type:** delta re-review under DECISION FREEZE — one erratum delta (v0.9 → v0.10)
**Scope:** whether erratum v0.10's AC-2.4 attribution clause is true of the repository at HEAD, whether it disturbs anything approved through v11, and whether the clause is writable as a falsifiable test today.

## Problem / Context

Round 11 was a no-delta confirmation: it approved the REQ at v0.9 with two Low findings and
showed the routed item belonged to TSPEC. This round carries a real REQ delta. Erratum v0.10
(dispatched from DoD round 1, `CODE_REVIEW-pdlc-learnings-injection-v1.md` F11) lands two hunks
and nothing else:

1. the header row — version `0.9` → `0.10`, date `2026-08-19` → `2026-08-21`, and a changelog
   sentence naming the erratum;
2. four lines appended to **AC-2.4**, making the report attribution *cause-defined*: a document
   the count bound (AC-2.2) already cut is reported under that cause even when the total bound
   also bound on the documents that remained, and only documents the total bound drops are
   reported under it — "the reason ids of AC-3.2 name causes, not coincidences".

`git diff 4db24c50 -- docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` is 25 lines
end to end; no other REQ section changed. The delta is the REQ half of the F11 remedy, whose
other halves are FSPEC BR-6 (v0.14) and the removal of the implementation's `propagateBytes`
guard. F11's whole complaint was that the shipped code implemented a split rule that no upstream
document stated, so the only question this round can turn on is a factual one: **does the clause
now written into AC-2.4 match what the code at HEAD actually does, and does the FSPEC it cites
actually say what it is credited with saying?** I re-derived both from the working tree rather
than from the erratum's own summary.

## Goals

- Establish that AC-2.4's new attribution clause is true of `selectLearnings` at HEAD, by reading
  the selection code, not the FSPEC's description of it.
- Establish that the co-authority the clause cites — "what FSPEC v0.14's BR-6 now states" — exists
  in the current FSPEC bytes at that version, so a test author reading either document lands on
  one behaviour.
- Establish that the clause is *falsifiable today*: that a test exists which reds if the retired
  reading is restored, and that its oracle is set-equality over the full rejection enumeration
  rather than containment.
- Confirm the delta disturbed nothing approved through v11 — that the two hunks are additive and
  no other AC's reading moved under them.
- Carry v11's two open Low findings forward honestly rather than letting a delta round drop them.

## Non-Goals

- Re-litigating REQ sections unchanged since v11. Under the delta protocol only AC-2.4 and the
  header are in scope, plus the fidelity sweep over what the new clause leans on.
- Reviewing FSPEC v0.14 or the implementation as artifacts. I read both as *evidence about the
  REQ's truth*; findings against them are not this file's verdict, and none arose.
- Reviewing whether F11's remedy was the right remedy. That decision is settled upstream
  (CODE_REVIEW v1 F11, DoD round 1) and the freeze puts it out of scope.
- TSPEC-altitude mechanics — seam design, fixture construction, assertion placement. The one
  test-design observation this round produced is recorded as `DEFERRED:`, not as a finding.

## Constraints

- **Decision freeze.** A finding blocks only if (i) this delta broke something that worked, or
  (ii) a load-bearing claim contradicts the repository at HEAD or an upstream document. Neither
  applies; everything else is `DEFERRED:`.
- **Rigour bar.** Any open High, old or new, means Needs revision. There is none. v11's two open
  findings are Low and both remain open, unaltered by this delta.
- **REQ altitude.** AC-2.4 states an observable outcome — which reason id appears against which
  path in the report. That is black-box testable from the REQ alone, so the clause sits at the
  right altitude; it names a cause, not a code branch.
- **Working tree, not a commit.** The REQ delta is uncommitted at review time
  (`git status --porcelain` shows ` M` on the REQ alongside the FSPEC, TSPEC and the workflow
  sources); the reviewed bytes are the working-tree bytes, diffed against `4db24c50`, the
  `REVIEWED-COMMIT` anchor v11 recorded.

## Delta disposition

## Verification at HEAD

## Acceptance Criteria

## Findings

## Questions

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
