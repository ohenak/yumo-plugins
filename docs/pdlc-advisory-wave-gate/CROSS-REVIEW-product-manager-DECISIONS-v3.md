# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md`
**Upstream changed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.15 → v1.16)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation)
**Round type:** delta confirmation — DECISIONS' own bytes unchanged since approval at `3143290a`

## Context

**What this round is.** I approved DECISIONS at round v2 (`CROSS-REVIEW-product-manager-DECISIONS-v2.md`,
`REVIEWED-COMMIT: 3143290a`, "Approved with minor changes"). The document's own bytes have not moved
since — `git diff 3143290a HEAD -- docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md`
is empty. What moved is its upstream: REQ went from v1.15 to v1.16 in an erratum round, so my
approval was recorded against a REQ that no longer exists.

**The upstream delta.** `git diff 3143290a HEAD` on the REQ shows exactly two hunks: the version
header (1.15 → 1.16) with its v1.16 changelog paragraph, and a three-line extension to **AC-6.3**.
AC-6.3 previously required only that the halt report carry "the diagnosis and the root-cause class".
It now adds:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03). *(US-02.)*

The changelog names this precisely: "DEC-A6-03's operator-facing halt-message obligation, routed
since round 5 and previously unlanded."

**Why that lands on this document specifically.** The routed obligation originates in this DECISIONS
document. `DEC-A6-03` (§Decision) carries a subsection headed **"Known gap in the remedy's reach
(PM F-05)"** whose whole purpose is to hold the gap open *until the routing lands*, and whose text
is a version-pinned factual claim about REQ. The REQ erratum is the landing event that subsection
was written to wait for. So the question is not whether the item landed upstream — it did — but
whether DECISIONS is still a faithful compression of REQ as REQ now stands.

**Scope.** Per DEC-ERR-03, my scope is DECISIONS measured against upstream at HEAD, not the item
list. I re-read DEC-A6-03 and `### What follows from DEC-A6-03` (Consequences) against REQ v1.16
AC-6.3 at HEAD, and I re-checked FSPEC v1.6 at HEAD for the second half of the record's claim. I did
not re-open DEC-A6-01, DEC-A6-02, DEC-A6-04, or any settled option table.

## Options Considered

Three readings of "does DECISIONS still hold against REQ v1.16" were available. I state them because
the choice between them is the whole content of this round.

**Reading A — the item landed, so the cascade is satisfied.** REQ v1.16 lands exactly the item this
document routed; the decision it records (`refs/pdlc/a6-snapshot-{waveNum}`, wave-scoped, no run
discriminator) is untouched by the REQ edit; no option in the DEC-03 table is reopened. On this
reading the confirmation approves unchanged.

*Rejected.* The dispatch is explicit that the item landing is necessary, not sufficient, and
DEC-ERR-03 makes anything DECISIONS cites that upstream no longer says a finding of this round.
DEC-A6-03 does not merely *route* the obligation — it asserts, in the present tense and pinned to a
version, that the routing **has not landed**. That assertion is upstream-dependent text, and the
upstream it depends on has changed underneath it.

**Reading B — the decision holds, but the record's gap annotation is now false and load-bearing.**
The choice recorded in DEC-A6-03 survives REQ v1.16 intact: REQ still says nothing about the ref's
*name* or storage form (the changelog explicitly leaves those to TSPEC, O-1), so nothing constrains
the naming decision differently than before. What does not survive is the "Known gap in the remedy's
reach" subsection and the two sentences downstream of it that depend on the gap being open.

*Accepted.* This is the reading the evidence supports, and it is narrow: the findings below touch
one subsection, one Consequences bullet, and one re-evaluation trigger clause. Nothing else in the
document is in scope and nothing else is challenged.

**Reading C — the whole decision must be re-derived because an operator-facing obligation is now a
requirement.** AC-6.3 now imposes a product obligation on the halt path; one could argue that
changes the constraint set that "forced the shape" of DEC-A6-03 and that the option table must be
re-run.

*Rejected.* The record's own "Constraints that forced the shape" already says "The halt message must
print the ref name, so the name has to be derivable from what the halting wave knows." AC-6.3 adds a
*warning sentence beside* that name; it does not change what the name must be derivable from, and it
does not make any rejected option (fixed name, run-discriminated name) newly viable or newly
required. Re-litigating the option table would be exactly the re-opening this round forbids.

## Decision

**DECISIONS does not still hold as approved against REQ v1.16.** The decision itself does; three
pieces of upstream-dependent prose around it do not. Verdict: **Needs revision**, on one High
finding, one Medium, one Low — all delta, all local to DEC-A6-03 and its Consequences block.

### What still holds (not re-litigated)

- **The decision proper.** `refs/pdlc/a6-snapshot-{waveNum}`, wave-scoped, no run discriminator,
  never pushed, never pruned by this feature. REQ v1.16 constrains the halt report's *content*, not
  the capture's name or storage form — the v1.16 changelog says so explicitly ("the capture's name
  and storage form stay TSPEC's (O-1)"). Traceability to US-02 is unchanged and intact.
- **"Constraints that forced the shape"**, "Reversibility", and the DEC-03 option table (§Options
  Considered, lines 211–230). Untouched by the REQ delta.
- **DEC-A6-01, DEC-A6-02, DEC-A6-04** and their Consequences blocks. The REQ delta does not reach
  them; I did not re-read them and raise nothing against them.
- **The FSPEC half of the record's claim.** DEC-A6-03 says that at FSPEC v1.6 `a6-snapshot`, "copy
  the ref" and "overwrit" match nothing, and that "FSPEC E-28 and AT-05-5 still require only that
  the halt name the failed restoration". I re-checked FSPEC at HEAD
  (sha256:91ef2557…, v1.6): all three strings still match nothing. That half is still true at HEAD.

### What no longer holds

**F-01 (High).** DEC-A6-03's "Known gap in the remedy's reach (PM F-05)" states: *"**The routing has
not landed** (PM Q-02, TE): at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, "copy the ref" and
"overwrit" match nothing in either document"*, and closes *"This entry carries the gap until it
lands."* At HEAD the routing **has** landed in REQ: REQ v1.16 AC-6.3 requires the halt report, where
it points at a captured pre-A6 tree state, to warn "in the same place, that re-running this feature
overwrites that capture", citing DEC-A6-03 by name; `overwrit` now matches at REQ line 535 (and line
23 in the changelog). The record's negative-match citation is false at HEAD for one of the two
documents it names, and the headline claim "the routing has not landed" is false for the document
that was the routing's primary target — the record itself says the obligation "belongs in REQ/FSPEC".

This is not a stale-timestamp nit. The sentence is load-bearing in the product direction: it tells
every downstream reader (PLAN, implementation, DoD) that no requirement obliges the halt report to
carry the overwrite warning, and that the remedy is record-only. A reader who trusts it will not
build AC-6.3's warning and will not test for it. That is a P0-path acceptance criterion made
invisible by a document that is supposed to compress upstream faithfully — High, and it gates.

**F-02 (Medium).** `### What follows from DEC-A6-03` (Consequences) still reads: *"The documented
operator remedy, until DEC-A6-03 is revisited: copy the ref before re-running a halted feature."*
Under REQ v1.16 the remedy is no longer merely "documented" — the halt report itself must now tell
the operator that re-running overwrites the capture, which is what makes preserving it an action the
operator can take at halt time rather than one they must already know about. The bullet understates
the operator-facing surface AC-6.3 now requires and should name AC-6.3 as its upstream.

**F-03 (Low).** DEC-A6-03's re-evaluation triggers list, as a future condition, *"or the
halt-message obligation the PM is routing to REQ lands, in which case the remedy stops being
record-only and this entry's known gap closes."* That trigger has fired. Leaving a fired trigger
phrased in the future tense means the next reader has no way to tell a live trigger from a spent
one.

### What the revision must do (and must not do)

Rewrite the three passages above to describe upstream as it now stands: the routing landed in REQ
v1.16 AC-6.3; the gap it left is now the *FSPEC* half only (FSPEC v1.6 E-28 / AT-05-5 still require
only that the halt name the failed restoration, so the obligation is stated in REQ but not yet
specified downstream); and the re-evaluation trigger is spent for REQ. Cite AC-6.3 by spec id, not
by line number (DEC-DOC-01). Do **not** reopen the naming decision, the option table, or any other
DEC entry — the fix is confined to the gap annotation, one Consequences bullet, and one trigger
clause.

## Consequences

**For this round.** One open High → the confirmation is non-approving and this document returns to
its ordinary revision loop for a bounded edit. All three findings are tagged `delta` and `local`:
they were introduced by this round's upstream edit (the pre-round bytes were accurate when I
approved them at v1.15) and they sit inside the one subsection the edit bears on. None is
`inherited`, so none routes back to an earlier phase; none is `nonlocal`, so the edit's blast radius
is not widened.

**For the downstream chain.** The obligation is now stated in REQ but not specified in FSPEC. That
asymmetry is real and is the residual gap DECISIONS should now carry — it is not mine to close here,
but whoever revises DEC-A6-03 should describe it accurately rather than restating the old
"nothing anywhere" claim. If FSPEC lands E-28/AT-05-5 coverage in a later round, DEC-A6-03's gap
annotation closes entirely and the entry becomes a plain decision record.

**Positive observations (genuinely — these should survive the revision).**

- DEC-A6-03 is the reason this cascade was catchable at all. The entry did what a decision record
  should do with an in-flight routing: it named the gap, named who was routing it, said where the
  obligation belonged, and refused to leave the routing implied — *"an uncited in-flight routing is
  indistinguishable from a dropped one."* That sentence is why the item was still visible at round 5
  and why REQ v1.16 could land it. Keep the practice; only the tense needs fixing.
- The entry's honesty about the remedy's reach ("documented in TSPEC §2.5 and in this record —
  neither of which an operator reads at halt time") is exactly the product-lens reasoning that
  produced AC-6.3. It should be preserved as the *rationale* for AC-6.3 rather than deleted along
  with the stale claim.
- The decision's separation of concerns held under upstream change: because DEC-A6-03 kept the ref
  *name* in TSPEC's altitude and pushed the *operator-facing obligation* up to REQ, a REQ erratum
  could land the obligation without disturbing the naming decision at all. That is the boundary
  working as designed.
- `### What follows from DEC-A6-03`'s framing of the cost — "What an overwrite costs is
  inspectability of a pre-repair tree, never content" — remains accurate under REQ v1.16 and is the
  sentence that keeps the severity of the overwrite honest. Do not soften it while editing the
  bullet above it.

**Cross-feature signal.** None promoted from this round. The mechanism that caught this — a decision
record pinning a negative claim about upstream to specific upstream versions — is worth noting as a
practice that makes cascades detectable, but it is already covered by the erratum/cascade protocol
and needs no new constraint.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | "The routing has not landed" and the negative-match citation "at REQ v1.15 ... `overwrit` match nothing in either document" are false at HEAD: REQ v1.16 AC-6.3 lands the halt-message obligation and cites DEC-A6-03 by name. Downstream readers are told no requirement obliges the overwrite warning. | DEC-A6-03 → "Known gap in the remedy's reach (PM F-05)" |
| F-02 | Medium | delta | local | The remedy is still described as "documented ... until DEC-A6-03 is revisited"; under REQ v1.16 AC-6.3 the halt report itself must carry the overwrite warning, so the bullet understates the required operator-facing surface and omits its upstream AC. | Consequences → "What follows from DEC-A6-03", remedy bullet |
| F-03 | Low | delta | local | Re-evaluation trigger "or the halt-message obligation the PM is routing to REQ lands" is phrased as a future condition but has fired at REQ v1.16; a spent trigger left in the future tense is indistinguishable from a live one. | DEC-A6-03 → "Re-evaluation triggers" |

FINDING: High | delta | local | DEC-A6-03 "Known gap in the remedy's reach (PM F-05)" | The entry asserts "The routing has not landed" and pins it to a negative-match citation at REQ v1.15; at HEAD REQ is v1.16 and AC-6.3 requires the halt report to warn, in the same place it names the captured pre-A6 tree state, that re-running the feature overwrites that capture (citing DEC-A6-03). The claim is false for REQ and load-bearing: it tells PLAN/implementation/DoD readers that the remedy is record-only and that no AC obliges the warning.
FINDING: Medium | delta | local | Consequences "What follows from DEC-A6-03" remedy bullet | "The documented operator remedy, until DEC-A6-03 is revisited: copy the ref before re-running a halted feature" understates REQ v1.16 AC-6.3, under which the warning is a required element of the halt report itself rather than documentation the operator must already have read; the bullet should name AC-6.3 as its upstream.
FINDING: Low | delta | local | DEC-A6-03 "Re-evaluation triggers" | The trigger "or the halt-message obligation the PM is routing to REQ lands, in which case ... this entry's known gap closes" has fired at REQ v1.16 but is still written as a future condition, leaving no way to distinguish spent triggers from live ones.

## Recommendation

**Needs revision** — one open High finding (F-01), per the mandatory rule.

Exactly what must change, and nothing more:

1. **F-01** — In DEC-A6-03's "Known gap in the remedy's reach (PM F-05)", replace "**The routing has
   not landed** … match nothing in either document" with the state at HEAD: the obligation landed in
   **REQ v1.16 AC-6.3**, which requires the halt report to warn, where it names a captured pre-A6
   tree state, that re-running the feature overwrites it; the residual gap is FSPEC-only (v1.6 E-28
   / AT-05-5 still require only that the halt name the failed restoration). Cite by spec id, not
   line number (DEC-DOC-01).
2. **F-02** — In "What follows from DEC-A6-03", rewrite the remedy bullet so the overwrite warning
   is a required element of the halt report per AC-6.3, not documentation-only guidance.
3. **F-03** — Mark the "halt-message obligation … lands" re-evaluation trigger as fired at REQ v1.16.

Out of bounds for this revision: the naming decision, the DEC-03 option table, the "Constraints that
forced the shape" paragraph, and every other DEC entry. Preserve the rationale sentences called out
under Positive Observations — the fix is a tense-and-fact correction, not a deletion.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
