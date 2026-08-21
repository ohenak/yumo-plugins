# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md (v1.7)
**Upstream measured against:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md v1.16 (sha256:f97f4f66…6fab7)
**Delta reviewed:** `33634b3d..0fc601b2` (5 commits, +16/-7)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation)

## Overview

This is a **delta confirmation**, not a fresh review. I approved this FSPEC's structure in
earlier rounds and filed v4 F-01 (High) — AC-6.3's new preservation-warning conjunct unrepresented
in §4/§5/§6 — plus v4 F-02 (Medium, carried from v3) on the stale upstream pin.

**The routed item has landed, and it landed at the right altitude.** The v1.7 edit places the
obligation on BR-14 as a conditional clause, names its two arms in §3 step 10 and in E-34, defers
E-30 to BR-14's contents rather than re-enumerating them, and gives AT-06-4 a third *Then* conjunct
with a falsifying companion AT-06-4b. No ref name, no storage form, no lifetime — all correctly left
to REQ O-1. v4 F-01 is **resolved**.

I re-read REQ v1.16 §AC-6.3, AC-5.1, AC-5.2 and O-1 at the dispatched hash (verified: sha256 matches
byte-for-byte) rather than trusting the changelog. The FSPEC remains a faithful compression of the
REQ text it now leans on, with two exceptions recorded below, neither of them High and neither of
them a reason to hold the phase.

## Linked Requirements

§2's preamble still reads *"Every clause below traces to `REQ-pdlc-advisory-wave-gate` v1.13."*
REQ is at **v1.16** at HEAD — three erratum rounds on, two of which edited text this FSPEC compresses
(AC-5.1's excluded-carrier list, AC-1.1/R-5's post-change reading, and now AC-6.3). This round's own
v1.7 changelog cites *"REQ v1.16's second AC-6.3 conjunct"* eight lines above a concordance preamble
that claims v1.13, so the document now contradicts itself about which upstream it compresses.

This is v4 F-02 / v3 F-02, still open. It is **inherited** — the stale pin was in the pre-round bytes
and the edit did not touch §2 — and it stays Medium: the concordance rows themselves are correct
against v1.16, so the defect is a misleading pin rather than a coverage gap. It should be corrected in
whatever edit next touches this file; it does not warrant a round of its own. Filed as F-01 below.

The concordance's coverage claim for AC-6.1…AC-6.4 is now **true**, which it was not at v1.6 — that
was the substance of v4 F-01 and it is discharged.

## Behavioral Flow

**§3.2 step 10 — correct and non-controlling.** The rewrite keeps the step's load-bearing claim
("Halt, unchanged": same reason M-WG-3, same `halted` queue row M-WG-7) and adds the two arms as a
report-content distinction only. Nothing in the new sentence introduces a branch in control flow, so
the step's title stays honest and BR-14's "escalation adds information, never control flow" is not
weakened. The arms are stated as *report contents*, which is the right seam: the pipeline halts
identically either way.

I checked that step 10's new text does not create a second normative home for the obligation that
could drift from BR-14. It does not — step 10 names the arms and defers the clause's content to
BR-14 by citation, which is the same discipline E-30 was rewritten to adopt.

## Business Rules

**BR-14 is the right owner and the clause is well-drafted.** Measured against REQ AC-6.3 at HEAD:

| AC-6.3 clause (REQ v1.16) | BR-14 v1.7 |
|---|---|
| halt report carries diagnosis + root-cause class | present, unchanged |
| "Where the halt report points the operator at a captured pre-A6 tree state" | conditional antecedent preserved verbatim in substance |
| "it also warns, in the same place" | **"the same report, in the same place"**, with co-location named as *the* observable |
| "that re-running this feature overwrites that capture" | verbatim in substance |
| rationale: operator preserves it first | present |
| capture name/storage stay O-1's | present, and extended to lifetime |

Three drafting choices are worth naming as good ones. First, *"Co-location is the observable — a
pointer in the halt report and the warning in a runbook does not satisfy it"* converts the AC's "in
the same place" into something an oracle can fail on, which is exactly the compression an FSPEC owes
a REQ. Second, the negative scope statement (the clause binds the halt report only; BR-13's advisory
record carries no such warning) forecloses the over-broad reading that would have made E-30 and BR-13
carriers too. Third, adding *lifetime* to the O-1 deferral is a small extension beyond REQ's "name
and storage form" but a correct one — how long the capture lives is mechanism, and pinning it here
would have been an altitude violation.

**One citation-hygiene note.** BR-14 cites `(DEC-A6-03)`. That decision record at HEAD still reads
*"**The routing has not landed** (PM Q-02, TE): at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, 'copy the
ref' and 'overwrit' match nothing in either document"* and *"This entry carries the gap until it
lands"* — a statement that is now false, and false specifically because of this edit. DEC-A6-03's own
re-evaluation triggers anticipate this ("or the halt-message obligation the PM is routing to REQ
lands, in which case … this entry's known gap closes"). The FSPEC is not wrong to cite it; the
DECISIONS record needs a one-paragraph erratum closing the gap. Filed as F-03 (Low) — the fix lands
in DECISIONS, not here.

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
