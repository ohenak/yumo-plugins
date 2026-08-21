# Cross-Review: product-manager — DECISIONS (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 9
**Scope:** Local

## Context

My v8 review returned **Needs revision** on one High finding: `DEC-LI-08`'s two framing literals
(694 bytes at one document, 1,012 at five, ceiling "roughly 21,012") were not reproducible on the
renderer they named, and `D-O-4` restated them. Everything else in that round's delta verified
clean. Four commits have landed on the document since the bytes I reviewed (`6f28eded`):
`dbbfcb07` (restate the framing cost as a formula over a named fixture), `79675345` (`D-O-4` cites
the formula instead of restating literals), `6548c08a` (scope the grounding pin; re-pin upstream on
FSPEC v0.14 / REQ v0.10), `a370ba06` (bump to v0.5 with the round-7 changelog) and `9baf60b5` (note
that FSPEC v0.14 leaves the accounting basis untouched). The delta is 36 insertions and 11
deletions in one file: the header `Upstream` row and changelog cell, a new paragraph in §"Scope,
grounding pin, and how to read this document", the rewritten **Upstream version note**, the
rewritten framing passage inside `DEC-LI-08`, and the rewritten `D-O-4` row. Nothing else moved, so
per the delta protocol I scanned only those passages.

Upstream at HEAD has moved since v8, exactly as v8 predicted it would: REQ is now **v0.10**
(`REQ-pdlc-learnings-injection.md:18`), FSPEC **v0.14** (`FSPEC-pdlc-learnings-injection.md:18`),
TSPEC unchanged at **v0.9** (`TSPEC-pdlc-learnings-injection.md:18`). The document's re-pinned
header row matches all three. The freeze standard applies: I judged each delta passage only on
whether it broke something that worked at `6f28eded` and whether it contradicts the repository at
HEAD. Every numeric claim in this round was checked by executing the shipped renderer, not by
reading prose.

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

