# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation; DECISIONS bytes unchanged)
**Scope:** Local

## Context

I approved DECISIONS at v3 (`Approved with minor changes`, 0 High / 2 Medium / 1 Low) with
`REVIEWED-COMMIT: 42515b3e` and `UPSTREAM-STATE: FSPEC sha256:a4f775bd…` — FSPEC **v0.10**, commit
`9a4b7593`. FSPEC at HEAD is `sha256:fb18dbda…` (commit `c1d7218e`, **v0.12**). REQ
(`sha256:ff605dd3…`) and TSPEC (`sha256:eff5a19b…`) are byte-identical to the versions my v3
approval was recorded against, so the whole cascade lives in FSPEC.

DECISIONS' own bytes have not moved since `42515b3e` (`sha256:85888c03…`, unchanged). The only
question is whether it is still a faithful compression of upstream as upstream now stands. Per
DEC-ERR-03 I re-read the whole span `9a4b7593..c1d7218e`, not the last commit, because my approval
was recorded against the older blob:

| FSPEC round | What moved |
|---|---|
| v0.11 (`c9f672c3`, `1b4dc3de`) | **Substantive.** `BR-1` restated as a **two-conjunct** rule — authoring-classified **and** target document among REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES (REQ C-1) — so an authoring-tagged dispatch with no C-1 target (Phase CR's optimizer round) is outside the rule. `BR-15`'s expected read set drops the corpus enumeration as a member and is stated as an enumerable set equality. AT-02 and AT-33 track both. |
| v0.12 (`3f21bd3b` … `c1d7218e`) | BR-1's complement carried through: `BR-11`, AT-03 and AT-29 quantify over dispatches **outside BR-1's rule** rather than "non-authoring" ones; `D-2` becomes a three-branch question naming the authoring-classified non-C-1 target; AT-02 gains the fixture that reds when the second conjunct is reverted; the Overview and `A-2` stop restating one conjunct when deferring to BR-1; `BR-15`'s expected side stated as a set, not a count; the header Cross-Reviews row stops hand-enumerating rounds. |

The load-bearing observation for this confirmation: the FSPEC delta moves BR-1 **toward** the gate
DEC-LI-03 already decided, not away from it. So the confirmation question is not "did a decision
get contradicted" but the narrower one DEC-ERR-03 asks — does anything DECISIONS *says about*
upstream no longer match what upstream says, or no longer say it the same way.

## Options Considered

Three readings of this cascade were live before I traced the text. Evidence picks one.

**Reading A — the delta strengthens DEC-LI-03, so confirm and move on.** FSPEC v0.11 rewrote BR-1
into exactly the two-conjunct rule DEC-LI-03 chose, and v0.12 named Phase CR's optimizer round as
the branch the second conjunct excludes — the same call site, with the same `docType: null`
evidence, that DEC-LI-03's *"gate on `dispatchKind === \"authoring\"` alone"* rejection cites.
**Rejected as the whole story.** A delta that agrees with a decision can still falsify a *sentence*
about upstream, and DEC-LI-03 quotes FSPEC `A-2` by its old wording. Confirming on agreement alone
would have skipped that.

**Reading B — the BR-1 restatement makes DECISIONS' own claim stale, halt.** DECISIONS §Scope says
*"no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here"*, and DEC-LI-03 nonetheless writes
a two-conjunct gate expression. If FSPEC previously carried a one-conjunct BR-1, then at approval
time DECISIONS *was* deciding behaviour, and FSPEC has now absorbed it — which would make the
DECISIONS entry a rule restatement rather than a rationale record. **Rejected on evidence.** BR-1
was never the whole gate: REQ **C-1** has been the two-part rule (`authoring-classified` **and**
target ∈ six types) throughout, and DEC-LI-03's *"Constraints that forced the shape"* cites C-1
directly, not BR-1. What v0.11/v0.12 did was make FSPEC state C-1's second conjunct explicitly
instead of leaving it implied. DECISIONS decided *where the gate is written* (`dispatchAndVerify`,
once) — an attachment-point choice, not a behaviour rule — and that is untouched.

**Reading C — the decisions hold; a small number of sentences *about* upstream have gone stale.**
This is what the trace supports, and it is the same failure mode I recorded at v3: DECISIONS is the
one artifact in this pipeline that narrates the *state* of its siblings, so sibling motion ages it
even when nothing it decides is wrong. At v3 that produced F-01 (AC-3.3 locus described as open,
closed upstream), F-02 (TSPEC divergence described as live, landed in TSPEC v0.6) and F-03 (stale
version pins). DECISIONS' bytes have not moved since, so all three are still on the page — carried
here as **inherited**, and F-03 has drifted further (`FSPEC v0.7` pinned against v0.12 at HEAD).
This round's delta adds one more of the same shape: DEC-LI-03's re-evaluation trigger paraphrases
FSPEC `A-2`, and `A-2` was reworded by the v0.12 edit.

I also considered filing the `A-2` paraphrase as Medium rather than Low. Rejected: unlike F-01 and
F-02, it does not tell a downstream author that a settled question is open — the exclusion default
it relies on is still exactly what `A-2` states at HEAD. It is a wording drift in a trigger clause,
not a false statement about pipeline state.

## Decision

_pending_

## Consequences

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
