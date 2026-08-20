# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.3)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v4.md` (v1.2)
**Delta reviewed:** `9a569157..HEAD` (four commits, DECISIONS only)
**Date:** 2026-08-19
**Iteration:** 5

## Context

Both v4 findings were non-gating (one Medium, one Low), and the round that followed spent its four
commits on them plus two citation repoints and one status correction routed from the PM's v4. Scope
held to the delta: `git diff 9a569157..HEAD` touches this file only, 56 insertions and 27 deletions,
no decision line altered. I re-read only the changed passages and re-grounded every anchor they cite
against HEAD source rather than against the upstream documents' description of HEAD.

Four things in the delta are checkable, and I checked all four: the two repointed TSPEC citations,
the re-derived envelope enumeration, and the new engine-channel ordering claim — which is the one
statement in this round that asserts something about a *running* test rather than about a document.

## Options Considered

The delta's substantive choice was how to record a status that keeps expiring. v1.2 said the engine
channel's expectation was still ahead of the config edit; at HEAD the reverse holds. The author
could have re-stated the corrected status here (a third round of transcribing upstream state into
this record), or stated only what the decision fixes and named the carrier for the rest. The
revision takes the second option and says so in-line: "This record deliberately stops restating that
status: TSPEC §5.1's status caveat and §1.3 are the carriers of repo state for this feature." That
is the shape I asked for in v4's durable observation, taken without being asked for it directly.

## Decision

## Findings

## Questions

## Positive Observations

## Consequences

## Recommendation

## Verdict
