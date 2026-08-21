# POSTMORTEM — Phase PR — pdlc-learnings-injection

**Halt class:** ERRATUM-PROTOCOL
**Halt reason (verbatim):** Phase PR halted: the delta confirmation of the PLAN erratum round did not pass — non-approving: [pm-review, te-review].
**Date:** 2026-08-21
**Branch:** `feat-pdlc-learnings-injection`

## Phase

Phase PR (pre-PR erratum channel), PLAN erratum delta-confirmation round. The erratum under
confirmation is the v1.2 edit of `PLAN-pdlc-learnings-injection.md`, which was opened with four
routed items:

| Routed item | Substance | Landed? |
|---|---|---|
| (1) | P-A-7 case C cited `92b7ea0c`, `d462ddd8`, `2cbacada` — all pre-rebase and unreachable from HEAD; PROPERTIES had re-pinned to `e7fa8d87`, `be2456c8`, `a4998e13` | yes |
| (2) | Case C read as a forward-looking rule although all four `learningsBlock.test.js` heading-form amendments and both Group D `learningsSelect.test.js` amendments are green at HEAD (26/26, 0 skips) — the table should record an outcome | yes |
| (3) | §File-ownership manifest listed fourteen test files against eighteen `learnings*` files tracked at `09c7c62f`; the four `2fc6fcd3` remediation files are owned by no LI task and appear in no row | partly |
| (4) | §File-ownership manifest omits the second-owner rows P-A-5 requires for `2fc6fcd3`'s re-capture of `fixtures/learnings-baseline/**` and `learningsBaselineGuard.test.js` | partly |

The halt is **not** about items (1) and (2) — both confirmers accept them as landed, and neither
filed against them. The halt is about items (3) and (4): the new §Post-batch remediation subsection
describes `2fc6fcd3` as having "touched six test-side surfaces" and enumerates exactly six rows,
where `git show --name-status 2fc6fcd3` lists **45 changed files**. The enumeration is short, and
the shortfall is not confined to fixture noise: it includes a second production write to
`orchestrate-dev.js`, a second write to `scripts/capture-learnings-baseline.mjs`, a rewrite of
`pdlc/workflows/package.json`'s `c8` block, and six ladder-owned suites taking a second write with
no P-A-5 second-owner row.

The distinguishing feature of this halt: the erratum edit did what it was asked, and the act of
doing it exposed that the commit it was describing had never been read in full by any layer. The
routed item named four new files; the commit added five. The routed item named two second writers;
the commit made nine. Both confirmers independently walked the commit rather than the routed list,
and both came back with the same arithmetic.

## Iterations

- PLAN cross-review iterations v1–v11 (ordinary review loop, both reviewer lenses), plus Phase CR
  round 1 (v1.0) and the round-11 delta confirmation (v1.1).
- Prior erratum rounds on this same document: **v0.6** (P-A-7 amendment-commit paragraph), **v0.8**
  (case B re-scoped to batches 9–12, case C created), **v0.9** (two targeted corrections),
  **v1.2 — the halting round**.
- Follow-up budget for this erratum: unspent at halt time.

Prior context on the same branch, same halt class: `POSTMORTEM-T` (FSPEC v7, one non-approving
channel, zero parseable `FINDING:` lines) and `POSTMORTEM-D` (FSPEC v0.8, inherited-only findings
mis-scored as delta). Both of those were **channel** failures — the confirmation was about how a
finding was expressed or scored. This one is not: both confirmations are well-formed, correctly
tagged `delta` vs `inherited`, correctly scoped `local` vs `nonlocal`, and both parse cleanly. The
protocol worked exactly as designed and caught a substantive defect. That is a different failure
class than its two predecessors on this branch, and it should not be filed with them.

## Reviewers

| Channel | Verdict | Findings | High | Medium | Low | Delta / inherited |
|---|---|---|---|---|---|---|
| pm-review | non-approving | 6 | 2 | 1 | 3 | 2 delta, 4 inherited |
| te-review | non-approving | 4 | 2 | 0 | 2 | 1 delta, 3 inherited |
| se-review | not dispatched this round | — | — | — | — | — |

Both channels are non-approving, and both non-approvals rest on a **High / delta / local** finding
about the same subsection — §File-ownership manifest → Post-batch remediation. Under DEC-ERR-03 a
delta-local High is the strongest signal the channel can send: it says the edit this round made is
itself wrong, not that something around it was already wrong. Two independent channels raising it
on the same subsection is not a coin-flip; it is a converged reading.

The inherited findings differ in count but not in character. pm-review's inherited High and
te-review's inherited High are the **same finding** on `pdlc/workflows/package.json` — arrived at
from different directions (pm from the manifest's prose exemption, te from DoD 11's stage-2 table)
and stated with different consequences (pm: "the exemption and DoD 11's silence rest on a premise
HEAD contradicts"; te: "a DoD verifier would check an exemption that no longer exists"). Neither
channel saw the other's text.

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation

## Traceability

## Resolution
