# Cross-Review: test-engineer — DECISIONS (revision round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.3, sha256:56617f5a…, commit `e29a296e`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v6.md` (reviewed v0.2, sha256:85888c03…, commit `8f3db3d8`)
**Date:** 2026-08-20
**Iteration:** 7

## Context

The document's own bytes moved this round, for the first time since v4: six commits took it from
v0.2 (`8f3db3d8`, sha256:85888c03…) to v0.3 (`e29a296e`, sha256:56617f5a…), +58/−25 lines. Every one
of them names a finding from my v5 or v6 review or the PM's:

| Commit | Substance | Answers |
|---|---|---|
| `1eb66bdb` | Header re-pinned on TSPEC v0.9 / FSPEC v0.13 / REQ v0.9; the "upstream version note" rewritten to say **no live upstream gap remains** | v6 F-05 |
| `0e1a3edf` | `DEC-LI-03`'s re-evaluation trigger re-grounded on `BR-1`'s **two** conjuncts, with `A-2` quoted verbatim and the second exclusion shape (authoring-classified, target outside REQ C-1's six) named | v6 F-07 |
| `3293ade4` | `DEC-LI-06`'s Hard reversibility re-grounded on **E-32 + `D-O-6`'s counts**, and explicitly *not* AC-5.2 | v6 F-06 |
| `5423f0b1` | `DEC-LI-07`'s divergence paragraph rewritten past tense: DEC-ERR-01 **landed** at TSPEC v0.9 | v6 F-03 |
| `483a9de0` | §Decisions-deliberately-NOT-taken row 4 restated on REQ v0.9's settled two-locus answer; `ERR-6` CLOSED | v6 F-04 |
| `e29a296e` | `DEC-LI-10` gains a "what the completeness tests do not falsify" paragraph; `D-O-6` records its role as **sole falsifier** of a wrongly-`null` corpus outcome | v6 F-08 |

Upstream state at HEAD, re-measured rather than copied forward: REQ sha256:ff605dd3… (v0.9,
unchanged since v6), FSPEC sha256:ae75fa62… (v0.13, **unchanged** — identical to the sha my v6
`UPSTREAM-STATE` recorded), TSPEC sha256:22dee8ce… (**moved**, v0.7 → v0.9). The TSPEC move is not
incidental to this round: four of the six commits assert something about TSPEC at HEAD, so every one
of those assertions had to be checked against the new bytes, not against v6's recorded state.

Scope of attention, per the freeze: the changed hunks, the upstream sections they now claim things
about, and the two v6 findings the delta did not touch. I did not re-read the unchanged decision
entries, did not re-derive settled code-level claims, and opened no new decision question.

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
