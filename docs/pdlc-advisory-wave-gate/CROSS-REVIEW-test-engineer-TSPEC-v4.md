# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.13)
**Date:** 2026-08-20
**Iteration:** 4

## Overview

Delta re-review of v1.12 → v1.13 (`0f2a9710..033cd093`, one commit, +39/-10 lines), the completion
pass the Phase D postmortem opened after v1.12 landed BR-14's mechanism in the design half and
stopped before the oracles. Scope: my three v3 findings, plus the sections this diff touched
(header lineage cell, changelog, §1.3 residue row, §4.5 Snapshot-ref row, §5.1 file table, §5.6
preamble + AT-06-4 + new AT-06-4b, §6 OQ-2 and OQ-7). Unchanged sections already approved in
v1.2–v1.12 rounds are not re-litigated.

**Prior findings, all resolved.**

| v3 finding | Severity | State at v1.13 | Evidence |
|---|---|---|---|
| F-01 — `snapshotRef` rendering contract had zero oracles in §5 | High | **Resolved** | §5.6 AT-06-4 (line 1823) now carries all three FSPEC v1.7 conjuncts with a co-location oracle; AT-06-4b (line 1824) adds the E-34 negative arm; §5.1's `advisoryWaveGate.test.js` row (line 1437) names both |
| F-02 — §6 OQ-2 stale against §2.5's BR-14 landing | Medium | **Resolved** | OQ-2 (line 1849) now records BR-14 as landed and scopes the open half to ref-naming only |
| F-03 — §4.5's Snapshot-ref row had no pointer to §2.5's next-run overwrite | Medium/Low | **Resolved** | §4.5 Snapshot-ref row (line 1353) now states the wave-scoped/not-run-scoped distinction and names §2.5 as the trigger's home |

**Verification integrity of the delta re-measured against the tree, not the prose.** Every
current-state claim this round makes holds:

| v1.13 claim | Measured | Verdict |
|---|---|---|
| Upstream is FSPEC v1.7 `sha256:d602c440…` over REQ v1.16 `sha256:f97f4f66…` | `shasum -a 256` on both files returns `d602c440fc9f…` and `f97f4f6601406b…`; FSPEC header line 12 reads `1.7`, REQ header line 18 reads `1.16` | holds — byte-exact, not approximate |
| `advisoryRecord.test.js:496` reads the six-member `toEqual` | `advisoryRecord.test.js:496` is `expect(rows.map((r) => r.seam)).toEqual(["A1", "A2", "A3", "A4", "A5", "A6"]);`, and `:505` compares the same projection to `[...devModule.ADVISORY_SEAMS]` | holds at the exact cited lines |
| Forty-eight ATs at FSPEC v1.7 (forty-seven before AT-06-4b) | 48 unique `AT-` ids in FSPEC §6 | holds |
| OQ-7's pin spans two REQ revisions — AC-5.1 at v1.14, AC-6.2's escalation-log append at v1.15 | REQ changelog line 34 (v1.14: "AC-5.1 pins its observation point, excludes record carriers and ignored paths"), line 29 (v1.15: "AC-5.1's excluded-carrier list adds AC-6.2's escalation-log append") | holds |
| No overwrite sentence transcribed into §5.5's halt literals (TE Q-01's answer) | `grep -n 'overwrit'` across §5.1–§5.6 returns only §5.1's file row, §5.2's one-ref-per-wave prose, and the two new §5.6 rows — nothing in §5.5 | holds |

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
