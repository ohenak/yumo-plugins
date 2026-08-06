# DECISIONS — review convergence

Project-level decision about when a cross-review loop has converged.
Recorded per `POSTMORTEM-F-pdlc-consolidation-agent.md` (rounds 6–10) Recommendation step 3,
on 2026-08-06. Read by `se-review` / `te-review` at dispatch, and by any operator adjudicating
a non-convergence halt.

---

## DEC-CONV-01: An approval carries forward; convergence is both reviewers *holding* an approval, not both approving in the same round

**Context.** Phase F of `pdlc-consolidation-agent` ran rounds 6–10 with an approval in three of
five rounds — and the approving reviewer alternated (TE round 6, SE rounds 7–8), because the
revision that satisfies one reviewer is the same revision that hands the other new text to check.
Under a same-round rule an approval is perishable: it is discarded by the next round's repair even
when the repair does not touch the approved sections. None of the three approvals was ever
withdrawn on its merits, and the window exhausted with one Medium and two Lows open — closed six
minutes after the last review landed. The loop failed on synchronisation, not on quality
(`POSTMORTEM-F-pdlc-consolidation-agent.md` RC-B).

**Decision.** Once a reviewer returns `Approved` or `Approved with minor changes` at round *N*,
that approval **stands** into rounds *N+1…* of the same phase. It is re-opened only:

- by that same reviewer, and
- only when the intervening diff touches a section the approval's `Scope` named, **or** the
  reviewer files a new finding it scores Medium or higher against the intervening diff.

A reviewer whose approval stands and who finds nothing Medium-or-higher in the delta **re-issues
its approval** (a one-line delta review affirming the standing verdict is sufficient content —
the `## Verdict` section is still written, so the file contract is unchanged). Convergence is
reached when both reviewers hold a standing approval, whatever rounds those approvals were
first issued in.

**What this does not do.** It does not lower the bar (any open High/Medium still blocks — a
Medium in a later round re-opens the approval by construction), does not force a verdict, and
does not change the cross-review file contract (append-only `-v{N}` files, trailing `## Verdict`,
one `VERDICT:` line).

**Evidence.** With carry-forward, this window converges at round 7 (TE's round-6 approval plus
SE's round-7 approval), three rounds before the budget expired, with the same reviews and the
same findings.
