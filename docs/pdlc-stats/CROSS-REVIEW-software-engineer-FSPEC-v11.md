# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7, bytes unchanged)
**Upstream re-pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — FSPEC bytes unchanged, REQ moved)

## Overview

My v10 approved this FSPEC at bytes `sha256:c7d2c832…`, pinning REQ `sha256:5f3e8051…`
(commit `1847dd9c0`, REQ v1.6). That pin is stale: the erratum commit `e12b78fd8` (REQ v1.7)
edited the REQ after my approval was recorded. This confirmation answers one question — does the
FSPEC still hold against the REQ as it now stands — and does not re-review the FSPEC, whose own
bytes did not move.

The delta is small and single-purpose. `git diff 1847dd9c0..e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`
is **12 insertions / 3 deletions across two sites**: the header changelog gains a v1.7 erratum
paragraph, and REQ-STATS-06's closing paragraph replaces one clause. Nothing else in the REQ moved —
no acceptance criterion, constraint, non-goal or risk row outside REQ-STATS-06.

The one clause that moved is load-bearing for this FSPEC, and it moved **toward** it. Under the
pinned REQ v1.6, a grammatical-but-out-of-catalogue `CROSS-REVIEW-` basename "survives even though
REQ-STATS-03 reports it malformed" — a *survivor*, which keeps its family non-absent and so blocks
`harvested`. Under v1.7 that clause is withdrawn: such a basename "contributes no process bytes and
counts as no file of its family remaining", so a feature whose only `CROSS-REVIEW-` basenames are of
that shape reports **harvested**.

That reversal is the direction this FSPEC already specified. BR-16 and AT-17 have stated the
non-survivor reading since v1.4; the pinned REQ v1.6 contradicted them, and v1.7 removes the
contradiction by adopting the FSPEC's reading. So the cascade **closes** an upstream/downstream
divergence rather than opening one. I checked each FSPEC site that leans on the moved clause below,
and re-verified the repository claim BR-16 cites at HEAD rather than trusting my own v10 arithmetic,
because the survivor question is exactly what that arithmetic turned on.

## Linked Requirements

Only **REQ-STATS-06** changed. The FSPEC's §2 requirement-trace row for it reads
`REQ-STATS-06 | process-to-spec byte ratio | §3.1 step 8; §4.2 | BR-14, BR-15, BR-16 | AT-15, AT-16, AT-17`.
Every column still resolves after the erratum:

- The **§ anchors** are unmoved — REQ-STATS-06 is still one AC with the same title and the same
  *Given/When/Then* spine; only its closing paragraph's final clause changed.
- The **rule set** is still the right one. The moved clause is a statement about BR-16's predicate
  (which files count as remaining), not about BR-14's enumeration or BR-15's rendering, and BR-16 is
  cited here.
- The **test set** is unchanged and still sufficient: AT-17 is the test that exercises the moved
  clause, and it is already in the row.

No other requirement-trace row is implicated. I checked the REQ diff for edits reachable from other
rows and there are none: REQ-STATS-02, REQ-STATS-03, REQ-STATS-04, REQ-STATS-05 and REQ-STATS-07 are
byte-identical across `1847dd9c0..e12b78fd8`. In particular REQ-STATS-05's harvested halt state —
withdrawn in v1.6, `0` restored — was already inside my pinned bytes and is not part of this cascade.

The erratum note's own scope claim ("one clause decided, no rule added … No other change") is
falsifiable against the diff, and the diff bears it out: the REQ gains no new AC, no new constraint
id, and no new obligation for this FSPEC to compress.

## Behavioral Flow

§3.1 step A8 is the only flow step the moved clause can reach. It reads: *"Compute the process-to-spec
byte ratio (BR-14…BR-16). Is either process family entirely absent alongside a `LEARNINGS-{feature}.md`?
Is the spec total zero? → `harvested`, `n/a`, or a rendered ratio. Harvested is checked before the
zero-denominator test (BR-16)."*

This still holds, and it holds without an edit, because the step is written at the altitude of the
*question asked*, not of the file-classification that answers it. The erratum changes which files
count toward "entirely absent"; it does not change that the question is asked, its ordering relative
to the zero-denominator test, or the three outcomes. A flow step that had spelled out the survivor
rule inline would have needed a matching edit here — this one delegates to BR-16 by citation, so the
correction lands in exactly one place.

§3.4's read-only stance and the mode-rendering steps are untouched by the delta and I did not
re-read them.

## Business Rules

**BR-16 already says what REQ v1.7 now says.** Its second sentence — *"It is evaluated over exactly
the file set BR-14's numerator sums, so the two never disagree: a basename failing a grammar
contributes no bytes to the process side and counts as no file remaining"* — is the same rule as the
REQ's new *"contributes no process bytes and counts as no file of its family remaining"*, in the same
direction, with the same justification (one file set, evaluated once, so numerator and predicate
cannot disagree). BR-16's next sentence draws the same consequence the REQ now draws: *"A directory
whose only `CROSS-REVIEW-` basenames are the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`
files BR-06 reports as malformed reports `harvested`, not a measured ratio."* This is a faithful
compression of the current REQ, not merely a compatible one.

**The provenance sentence still holds, and it never depended on the survivor question.** BR-16 cites
the basename *shape* from `docs/completed/pdlc-advisory-wave-gate/`, which "carries four of them
**alongside** grammar-matching cross-reviews and so reports a measured ratio itself; only the shape is
borrowed, not the verdict." My v10 verified the measured-ratio verdict by an argument that partly
rested on the out-of-catalogue files counting as survivors — the very reading v1.7 withdraws — so I
re-derived it from scratch against `origin/main` rather than carry it forward:

| Family | Count in that directory | Effect on BR-16's predicate |
|---|---|---|
| `CROSS-REVIEW-{role}-REVIEW-v{N}.md` (out-of-catalogue) | 4 | Contributes nothing; not a survivor under v1.7 |
| In-catalogue `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` | 58 | Cross-review family **not** entirely absent |
| `CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md` | 2 | DoD family **not** entirely absent |
| `LEARNINGS-pdlc-advisory-wave-gate.md` | present | First conjunct satisfied |

Neither harvest-deleted family is absent, so `harvested` does not fire and the directory reports a
measured ratio — under the new reading and the old one alike, because 58 in-catalogue cross-reviews
carry the family on their own. The four out-of-catalogue files were never load-bearing for that
verdict. The sentence is therefore not collateral damage of the erratum, and the "shape borrowed, not
verdict" distinction it draws is exactly the distinction v1.7 makes upstream.

**The `CODE_REVIEW-` half of BR-16 rests on the unchanged clause.** *"A stray
`CODE_REVIEW-{feature}-draft.md` or foreign `CODE_REVIEW-` file does not hold the DoD family open"*
derives from the REQ's grammar-scoped predicate ("no file matching its `CODE_REVIEW-{feature}-v{N}.md`
grammar"), which was in my pinned bytes and did not move. The erratum's illustrative example is
`CROSS-REVIEW-`-shaped, but the rule it states is family-neutral, so this sentence gains support
rather than losing it. BR-14's enumeration, BR-15's rendering and `n/a` token, and BR-16's precedence
over the zero-denominator test are all untouched by the delta.

BR-06 and BR-11 are consistent with the moved clause: BR-06 reports those basenames as malformed and
counts them in no row, which is precisely why BR-16 cannot count them as remaining. No business rule
needs an edit.

## Edge Cases and Error Scenarios

Three rows touch the moved clause; all three survive it.

**EC-05** (`CROSS-REVIEW-`-prefixed basename failing the grammar, explicitly "or a document type
outside BR-09's six … including the pipeline's own `CROSS-REVIEW-{role}-REVIEW-v{N}.md`") disposes of
those files as *excluded from the round count, reported malformed, exit 0*. That disposition is
REQ-STATS-03's, which the erratum did not touch, and it is the disposition v1.7 leans on when it
calls the same file "the same one REQ-STATS-03 reports malformed (C-5)". Consistent.

**EC-07** (interrupted or partial harvest — some cross-reviews deleted, others surviving) keeps the
DoD metric and the ratio "evaluated on their own evidence, independently (BR-11, BR-16)". The erratum
narrows *which* files count as surviving but leaves the independence claim and the per-document-type
split intact. Consistent.

**EC-13** (`LEARNINGS` present **and** spec bytes zero → `harvested`, not `n/a`) turns on BR-16's
precedence, not on its file classification. Untouched.

**EC-12** (`n/a` on a zero denominator with both totals still reported) is unaffected: the erratum
never widens the `n/a` case. §7.3's paragraph beginning *"Grammatical-but-out-of-catalogue basenames
are included in 'fails the grammar'"* — which names the four files in
`docs/completed/pdlc-advisory-wave-gate/` and reports them "as malformed, by name, and contributing to
no row" — reads as a direct restatement of the new REQ sentence and needs no correction.

No edge-case row is now under- or over-specified relative to the current REQ.

## Acceptance Tests

**AT-17 is the oracle for the moved clause, and it already pins the v1.7 reading.** Its fourth
directory is *"one holding `CODE_REVIEW` files intact plus, as its only `CROSS-REVIEW-` basenames, the
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form BR-16 names"*, and its *Then* requires that
directory to report `harvested` — *"the fourth not a measured ratio, because files whose bytes BR-14
refuses are equally files BR-16 does not count as remaining"*. Under the pinned REQ v1.6 this test
asserted the opposite of what the REQ said, and a strict implementer could have argued AT-17 was
wrong. Under v1.7 it is exactly right. The cascade turns a latent conflict into agreement without a
byte moving in §6.

This is worth stating plainly because it is the one place where the erratum could have gone the other
way: had v1.7 *entrenched* the survivor reading instead of withdrawing it, AT-17's fourth case and
BR-16's third sentence would both have had to be rewritten, and this confirmation would be a High
finding. It went the other way.

**AT-15 is unaffected.** Its nine-file removal probe (six BR-14 spec documents, three process
families) deliberately places the out-of-catalogue file on *neither* list, outside the nine, and
asserts BR-14's enumeration by set-equality and by removal. The erratum agrees with that placement —
"contributes no process bytes" is the numerator half of the same claim — so AT-15's arithmetic and its
BR-16 assertion both stand. **AT-16** (`n/a` on zero spec bytes) and **AT-09** (all four basenames
appear in the malformed list by name) are untouched: AT-09 asserts naming, which REQ-STATS-03 owns and
the erratum preserves.

§8's trace rows `BR-16 | AT-15, AT-17` and `BR-14 | AT-15` remain correct — the tests that assert
BR-16 are still exactly those two, and no test dropped or gained a rule.

## Open Questions

## Delta-Confirmation Findings

## Findings

## Positive Observations

## Recommendation

## Verdict
