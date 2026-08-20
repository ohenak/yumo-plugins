# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.4)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v5.md` (v1.3)
**Delta reviewed:** `082be248..HEAD` (one commit, `ff07bc84`, DECISIONS only — 56 insertions, 30 deletions)
**Date:** 2026-08-19
**Iteration:** 6

## Context

Both v5 findings were non-gating (one Medium, one Low) and both lived in the same bullet pair. The
round spent one commit, `ff07bc84`, rewriting that pair — and it did more than close my two: it
re-derived the **seam** half of the enumeration too, which PM v5 F-01 had opened and which no
previous round had measured at HEAD. Scope held to the delta: `git diff 082be248..HEAD` touches this
file only, no decision line altered, no verdict or supersession text moved.

Four things in the delta are checkable against the repository, and I checked all four: the seam
literal's surviving-site claim, the envelope's five-transcription enumeration and its
"none of these is an oracle" characterisation, the seven already-migrated sites, and the two TSPEC
§1.3 quotations the bullets lean on. I re-read only the changed passages and re-grounded every
anchor in HEAD source rather than in the upstream documents' description of HEAD.

## Options Considered

The delta's substantive choice was how far to re-derive. My v5 findings asked only that the
envelope enumeration stop saying "still moves" about five sites that no gate touches — a two-clause
fix. The author could have made exactly that edit and left the seam half alone, which is what v1.3
did in the other direction (re-deriving the envelope half only). The revision took the wider option
and says why in-line: v1.2 sized the seam half "against a pre-`e3b9d5a3` repository", so the two
literals "read in two different tenses inside one paragraph, the seam list reading as checked
because its neighbour had been". That diagnosis is correct and the wider option was the right one —
the seam half was six times wrong, not slightly wrong (six sites claimed, one survives).

The cost of the wider option is the one this review has to price: a paragraph re-derived in a single
pass inherits whatever was wrong in the *reviews* it is closing, and one of my own v5 findings was
under-measured. F-01 below is that inheritance.

## Decision

## Findings

## Questions

## Positive Observations

## Consequences

## Recommendation

## Verdict
