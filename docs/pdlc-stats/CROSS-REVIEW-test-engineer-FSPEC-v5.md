# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (bytes unchanged since v4 approval, commit `32a23e013`)
**Upstream changed:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.3 (sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126), erratum round 2, commit `50dffe8c8`
**Date:** 2026-08-31
**Iteration:** 5 (cascade confirmation, not a re-review)
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v4.md` — *Approved with minor changes* (0 High, 2 Medium, 2 Low)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. The FSPEC's own bytes have not moved
since the v4 approval (`REVIEWED-COMMIT: 32a23e013`). What moved is the REQ: the erratum round in
commit `50dffe8c8` landed nine targeted wording fixes, so the REQ version my approval was taken
against (sha256:71ecf5574…, recorded in v4's `UPSTREAM-STATE`) no longer exists. The single question
asked and answered here is whether the FSPEC is still a faithful compression of REQ v1.3 **as it now
stands**.

The erratum's direction is worth stating first, because it changes what "faithful" means for this
pair. Seven of the nine fixes are the REQ *accepting the FSPEC's decisions* — §7.3 raised seven
errata and the REQ resolved all seven, in the FSPEC's favour every time: C-5 now carves out
post-mortem phase discovery, REQ-STATS-03 now blesses the malformed label for
`CROSS-REVIEW-{role}-REVIEW-v{N}.md`, REQ-STATS-09 now carves out the `docs/`-root case,
REQ-STATS-07 now restricts gaps to unreadability and calls an empty directory a zero-state row,
REQ-STATS-06 now states the at-least-one-family predicate, REQ-STATS-02 now attributes the states
correctly, REQ-STATS-08 regains its separators. Convergence, not contradiction — the two documents
now agree on behaviour on every path the FSPEC decided differently and said so.

That makes the confirmation mostly clean, and the residue is exactly the class this cascade check
exists to catch. Two things did not survive the move:

1. **One rule that was deliberately left literal now diverges.** REQ-STATS-04's harvested predicate
   was rewritten from the bare `CODE_REVIEW-*` prefix to the `CODE_REVIEW-{feature}-v{N}.md` version
   grammar. BR-11 still reads the bare prefix. §7.3 justified that literalism with the sentence
   "this FSPEC introduces no divergence, and the erratum stays with the REQ" — the erratum has now
   left, and the divergence it predicted is what remains. No AT covers the discriminating fixture.
   That is F-01, and it is the only gating item.
2. **A body of in-rule prose now describes a disagreement that no longer exists.** EC-09, D-8, D-9,
   BR-27 and all of §7.3 characterise upstream text in the past tense of the pre-erratum REQ
   ("that departs from REQ-STATS-09's *Given*", "a defect of the upstream criterion", "the wording
   is raised as an erratum"). Those sentences cite upstream that no longer says what they say it
   says. No oracle turns on them, so they are Medium and Low — but a TSPEC author reading them will
   believe REQ and FSPEC disagree on a P1 path when they now agree.

Everything else I checked holds. Scope note per my role: I confirmed testability and traceability of
the changed upstream against the FSPEC's rules and ATs. I did not re-open settled design, and I did
not re-read sections no changed REQ sentence reaches.

## Linked Requirements

Nine REQ edits landed. Each is checked below against the FSPEC text that compresses it, at the
FSPEC's current bytes. "Holds" means the FSPEC's rules and ATs are still a faithful compression of
the amended sentence; it does not mean the FSPEC's prose *about* the REQ is still accurate — that is
tracked separately at F-03 and F-04.

| REQ edit (v1.3) | What it now says | FSPEC surface | Verdict |
|---|---|---|---|
| **C-5** — post-mortem phase *discovery* carved out of the fidelity rule; "that listing is this REQ's own (REQ-STATS-05); fidelity binds the `RESOLVED:` marker, not the discovery" | Discovery is the REQ's; the marker is the driver's | §1 fidelity anchor (lines 59-67), BR-12 | **Holds — exactly.** §1 already argued this in the FSPEC's own words ("nothing in the driver classifies a `POSTMORTEM-*` **listing** … that is not a C-5 divergence"). The REQ now says the same thing. The FSPEC's §7.3 bullet claiming the carve-out is still owed is what is stale (F-03), not BR-12. |
| **REQ-STATS-03** — malformed label decided; covers grammatical-but-out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}` names; "one label stands: a third bucket would be an independent rule C-5 forbids" | The FSPEC's D-8 answer, promoted into the criterion | BR-06, EC-05, D-8 | **Holds.** EC-05 already lists "a document type outside BR-09's six — including the pipeline's own `CROSS-REVIEW-{role}-REVIEW-v{N}.md`" as malformed, and D-8 chose that over a third bucket for the reason the REQ now gives verbatim. D-8's *rationale* is now stale (F-04); its *decision* is now upstream-blessed. |
| **REQ-STATS-04** — harvested restated over `CODE_REVIEW-{feature}-v{N}.md` "matching the version grammar", and the clause regains its subject | Only grammar-matching files suppress `harvested` | BR-11, AT-12, AT-28 | **Does not hold — F-01 (High).** BR-11 still says "no `CODE_REVIEW-*` file remains". The two now disagree on a real fixture and no AT discriminates. |
| **REQ-STATS-05** — unchanged in this round, but its scope widened by C-5's carve-out | Owns the post-mortem listing | BR-12, BR-13, AT-13, AT-14, AT-14b | **Holds.** BR-12 already states the basename form it matches and defers only resolution tagging; AT-13's foreign-feature leg (`POSTMORTEM-P-some-other-feature.md`) is the oracle for the listing rule the REQ now assigns here, and EC-15 states the no-malformed-bucket consequence. The carve-out gave the FSPEC's existing coverage an upstream owner; it required no new AT. |
| **REQ-STATS-06** — harvested predicate disambiguated to "at least one of the two process families is entirely absent (no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)" | The reading BR-16 derived | BR-16, §3.1 A8, AT-17, EC-13 | **Holds — word for word.** BR-16 reads "at least one of the two process families is entirely absent — that is, either no `CROSS-REVIEW-*` file remains, or no `CODE_REVIEW-*` file remains, or neither remains", and AT-17 pins it on three fixtures. The ambiguity BR-16 resolved by inference is now stated upstream, and it resolved it the same way. Note the granularity split this creates against REQ-STATS-04 — see F-01. |
| **REQ-STATS-07** — gap disposition restricted to unreadability; "a readable but empty directory is not a gap but a normal row whose metrics report their zero states" | Gap ⇔ directory cannot be read | BR-27, EC-03, §3.2 B5, AT-26 | **Holds for the empty-directory half; F-02 (Medium) on the other half.** BR-27's read-scoped subject and EC-03's zero-state row now match the criterion exactly — the narrowing the FSPEC performed is upstream text. But the phrase EC-21 leaned on ("or fail to parse") is gone, and EC-21 still degrades a *compute* failure to a gap row. |
| **REQ-STATS-09** — *Given* carved to "a repository whose `docs/` root is present and readable"; a missing root is a root failure | The FSPEC's D-9 answer, promoted | EC-09, D-9, BR-30, AT-27 | **Holds behaviourally.** The behaviour EC-09 and D-9 specify is now the behaviour the criterion demands; AT-27's eight-run cross product and its `feature`-per-mode conjunct need no change. The *prose* asserting a departure is stale (F-04). |
| **REQ-STATS-02** — malformed/unmeasurable attributed to REQ-STATS-03 only; harvested to REQ-STATS-03/04/06 | Correct attribution of the states to their owning ACs | BR-22, BR-21, §4.4, AT-05, AT-25 | **Holds.** BR-22 carries `harvested`, `unmeasurable`, `n/a` and the malformed list inside each metric's value with no sibling top-level keys; the attribution fix changes which AC is cited, not which key is emitted. §7.3's "no FSPEC behavior turns on either" was correct and remains correct. |
| **REQ-STATS-08** — conjunct (b) regains its list separators | Wording only | §3.4, BR-28, AT-24 | **Holds.** The read-only invariant, the git-write token list and AT-24's `--dry-run` argument are unaffected. |

Two traceability rows in §2.1 are worth re-reading against this table when the FSPEC is next edited:
`REQ-STATS-04 → BR-10, BR-11` (the row F-01 breaks) and `REQ-STATS-07 → BR-18, BR-23, BR-25, BR-26,
BR-27` with `AT-18, AT-19, AT-20, AT-26, AT-27` (the row F-02 puts a claim on, because AT-20's
second leg is credited to a criterion that no longer describes it).

## Behavioral Flow

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
