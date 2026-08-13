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

---

## DEC-DW-01: On a skipped Phase T, `DECISIONS_WARRANTED` is read from disk, not defaulted

Recorded 2026-08-09 from a live `pdlc dev` run of `pdlc-consolidation-agent`, in which phases R,
F, T and D all skipped on recorded approvals.

**Context.** Phase T appends a `DECISIONS_WARRANTED:` trailer requirement to its creator and
optimizer prompts, and reads the answer out of the convergence loop's last result. When the phase
**skips** on a recorded approval, `converge` returns a bare `{skipped: true}` — no `loop`, no
`creatorResult` — so that read collapsed to `null` and took `parseDecisionsWarranted`'s
absent-or-malformed branch. Two consequences, both wrong in the same way: the run log warned that
the field was "absent or malformed" when no agent had been asked for it, and the value defaulted
`true`. A re-run of a fully-approved pipeline therefore authored a DECISIONS document for a
feature a previous run had correctly judged not to need one. Two different situations — an agent
that was asked and did not answer, and an agent that was never asked — were arriving as one value.

**Decision.** Split the two situations at the call site.

- **Phase T ran.** Unchanged: a missing trailer is a real omission by an agent that was explicitly
  asked, and `true` remains the right conservative default — author DECISIONS rather than silently
  lose them.
- **Phase T skipped.** Probe `docs/{feature}/DECISIONS-{feature}.md` through the same `_checkFile`
  seam the phase gates use, and read its `.ok`. Present ⇒ warranted; absent ⇒ unwarranted. The run
  log states the provenance ("Phase T skipped on recorded approval, so no trailer was emitted;
  read from the DECISIONS document on disk instead") rather than blaming an omission.

**Why disk is exact where the default was a guess.** Skipping means the TSPEC was already
approved, so the warranted question was settled on a previous run — and unlike the trailer, that
answer left a durable trace. The document either exists or it does not. Presence does not assert
the document is still adequate; Phase D's own convergence gate decides that, which is why this
branch hands it the phase rather than deciding for it.

**What this does not do.** It does not change Phase T's trailer contract, Phase D's gate, the `D`
report row or the `D` `forcePhases` token, and it does not make a skipped Phase T skip Phase D —
a skipped Phase T with a DECISIONS document on disk still enters Phase D normally.

**Evidence.** `pdlc/workflows/__tests__/decisionsWarrantedOnSkip.test.js` drives the pipeline
through `main()` over a branch whose TSPEC carries a dual round-2 approval, and turns one
variable: the DECISIONS document's presence. Both cases red on the pre-decision read (present:
no provenance notice; absent: Phase D entered, then halted on a gate for a document nobody wrote).
