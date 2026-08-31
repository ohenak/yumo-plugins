# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Summary

Reviewed through the testing lens only: testability of the design, oracle falsifiability,
completeness of the test strategy against FSPEC's decided observables, and TDD/coverage posture.
Architecture choice (§2.1's three-option table), module placement economics and the vendoring
cost argument are the software-engineer's lens and are not contested here.

Every claim this review makes about existing repository behavior was checked against HEAD, and the
`file:line` anchor is given in the finding. Four High findings all sit in §6.4/§6.5 — the four
anti-drift oracles and the read-only oracle. Those five oracles carry the whole verification weight
of REQ C-5, BR-26 and BR-28; as written, two of them assert something false at HEAD, one cannot
detect the drift it exists to detect, and one is flaky against this repository's own test suite.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
