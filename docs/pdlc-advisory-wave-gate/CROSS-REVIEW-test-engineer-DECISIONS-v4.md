# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 4

## Context

Iteration 3 was an upstream-cascade confirmation that returned **Needs revision** on one High
(`CROSS-REVIEW-test-engineer-DECISIONS-v3.md`): `DEC-A6-03` asserted, as a checked negative fact,
that the halt-message overwrite obligation "has not landed" upstream, when REQ v1.16 had already
landed it. The document has since moved v1.11 → v1.12 across three commits
(`5f35bd8f`, `a147c9cf`, `279d38a2`).

**Scope of this round.** Delta only. I read my v3 file, then diffed the document against the commit
I last reviewed:

```
git diff 3143290a..HEAD -- docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md
75 insertions(+), 22 deletions(-)
```

Four regions changed, and nothing else:

| Region | Change |
|---|---|
| Header `Upstream` cell (`:5`), version row (`:12`) | pins all three upstream hashes; v1.11 → v1.12 |
| v1.9 re-grounding note (`:42-45`) | hashes date-scoped as that round's observation, not a current pin |
| Revision note `On v1.12` (`:123-138`) | new paragraph recording the cascade round |
| `DEC-A6-03` Reversibility / gap paragraph / Re-evaluation triggers (`:372-419`) | the F-01 repair |
| `## Consequences` operator-remedy bullet (`:515-521`) | remedy is no longer record-only |

No decision moves: `DEC-A6-01`…`DEC-A6-04`'s `Decision`, `Constraints` and option tables are
byte-identical to v1.11, and `## Options Considered` is untouched — I confirmed this from the diff
hunk list, which contains no line inside those regions. My v2 findings F-08 (DEC-A6-02 cardinality
oracle) and F-09 (packed-set fixture count) remain open, accepted, non-gating and untouched; I do
not re-file them.

**Everything below is verified against the repository at HEAD, not against the document's own
citations.** Every hash in this review I recomputed; every upstream claim I re-ran the document's
own grep against.

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
