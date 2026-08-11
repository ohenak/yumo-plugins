# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md
**Date:** 2026-08-11
**Iteration:** 7
**Scope:** Delta confirmation of Phase-F erratum round 5 (M-ENG-06 totality vs AC-4.5 clause
split). Not a re-review of the whole REQ; v6 approval stands for everything outside the diff.

## Delta Verified

Erratum edit is commit `2a4939ca`, 11 changed lines in the REQ (version row 0.8 → 0.9, a 0.9
change note, and §1.2a's echo of the totality sentence) plus the corresponding rewording of
**M-ENG-06** in `docs/_constraints/pdlc-engine-baseline.md:85-93`. No acceptance-criterion text
changed — the diff touches no `AC-` definition, no BR, no §2–§6 body.

The raised item is resolved. The fact now reads "appears in **at least one** row" and adds an
explicit rule: a criterion whose clauses differ in state is split across rows, each row naming its
clause, and every clause of a split criterion carries a state, so the split is a partition rather
than a gap. That is exactly the shape AC-4.5 already had at HEAD, so the fact now describes its
own table instead of contradicting it.

Verified against the table itself, not against the diff:

- AC-4.5 occurs in exactly two rows — the green row as `AC-4.5 **except its per-dispatch auth
  clause**` (`pdlc-engine-baseline.md:97`) and the red row as `AC-4.5's per-dispatch auth clause`
  (`:103`). Both name their clause explicitly, as the new rule requires. No third occurrence.
- Totality still holds under the weakened quantifier: all 26 `AC-{n}.{m}` ids appearing in the REQ
  resolve to at least one table row; the set difference is empty in both directions. Relaxing
  "exactly one" to "at least one" did not orphan a criterion.
- §1.2a's echo tracks the fact rather than restating the retired wording, and its "Red at HEAD"
  enumeration (AC-1.1, AC-2.1/2.2/2.4, AC-3.3, AC-3.5, AC-4.5's per-dispatch auth clause,
  AC-5.1/5.2, AC-6.2/6.3/6.4) is still cell-for-cell identical to the red row. The prior
  erratum's AC-2.3 / AC-4.4 correction is untouched and still green-rowed.

Nothing previously approved regressed: the edit is additive prose in a fact I cited in v6, and
every `file:line` I verified in v6 is outside the diff.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | "At least one row" is weaker than it needs to be: it now permits the *same whole criterion* to appear in two rows with conflicting states, which the following sentence forbids only for clause-named splits. A tighter form — "exactly one row, or one row per clause when clauses differ in state" — would keep the contradiction unrepresentable rather than merely unwritten. Not gating; the clause-naming sentence already governs the only split that exists. | `pdlc-engine-baseline.md:85-93` |

## Questions

None. The erratum answers the item it was raised for.

## Positive Observations

- The correction fixes the *fact*, not the criterion — AC-4.5's deliberate split survived intact
  and no AC text was renegotiated to satisfy a bookkeeping sentence.
- The new wording names the partition property explicitly ("every clause of a split criterion
  carries a state"), which is what makes the weakened quantifier still usable as a coverage oracle.
- Both the constraints fact and the REQ echo were updated in one commit, so §1.2a cannot drift
  from the fact it cites — the failure mode this erratum round exists to catch.

## Recommendation

**Approved**

The delta resolves the raised item and breaks nothing previously approved. F-01 is a Low
robustness note on the fact's phrasing, not a defect in the REQ, and is not worth another round.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:0588cd1b74288cd6f0a41dfcc05ff1bba5e371c6c681db24bb32fdc27c526784
REVIEWED-COMMIT: 2a4939cab5e84e4e0963ea20b7b34448d16ed1de
