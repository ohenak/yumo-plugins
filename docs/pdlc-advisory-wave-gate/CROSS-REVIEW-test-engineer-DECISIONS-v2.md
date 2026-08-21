# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.11, `sha256:ef59893d…`)
**Date:** 2026-08-20
**Iteration:** 2

## Context

Delta re-review, per the protocol. I read my v1 (`CROSS-REVIEW-test-engineer-DECISIONS-v1.md`,
`VERDICT: Needs revision`, `{"high":3,"medium":2,"low":2}`) and diffed the document against the
commit I reviewed it at — `3604d465` ("docs(pdlc-advisory-wave-gate): DECISIONS v1.10") — through
HEAD `3143290a`. Eight commits touched it (`495fdf52`, `33353a55`, `75eb393d`, `76cf7065`,
`c1844f4a`, `c81eb6cf`, `2b549db4`, `3143290a`): +226/-48 lines, all of them inside the sites my
three Highs and PM's four findings named, plus the new v1.11 preamble note.

**Upstream is byte-identical to the state I reviewed against**, so nothing in this delta is
re-grounded on moved upstream:

| Document | sha256 at HEAD | Same as v1 round? |
|---|---|---|
| REQ | `c62cfc35…` | yes |
| FSPEC | `91ef2557…` | yes |
| TSPEC | `3fa21acf…` (v1.11) | yes |
| DECISIONS (under review) | `ef59893d…` (v1.11) | changed — the delta |

Scope of attention, per the protocol: the changed hunks only. `DEC-A6-01`…`DEC-A6-04`'s decision
sentences, the option tables' outcomes, and every section I approved unchanged at v1 are not
re-litigated here. What I did do is re-run, against the working tree, every *code* claim the delta
introduces — because the repairs are exactly the claims a PROPERTIES author transcribes into an
oracle, and a repair grounded on a second wrong reading would be worse than the defect it replaces.

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
