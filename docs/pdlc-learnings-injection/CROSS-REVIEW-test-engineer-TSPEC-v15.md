# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.9)
**Compared against:** `739fea34` (the commit v14 approved)
**Date:** 2026-08-21
**Iteration:** 15 (delta confirmation)

## Overview

This round was dispatched as a delta confirmation on a targeted erratum edit. **No erratum edit
landed on the TSPEC.** The file at HEAD is byte-identical to the bytes I approved in v14:

- v14's `APPROVAL-HASH: sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131`
- `shasum -a 256 docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` at HEAD → the same digest
- `git diff 739fea34..HEAD -- docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` → empty

That is the correct outcome here rather than a missing edit, because the routed item is a
**disposition, not a change request**. Its own text says so: ERR-8 is recorded against **FSPEC**,
§D.5 already states the rule the implementer follows, and "the PLAN's rows already encode the
corrected order, so no PLAN change is owed". Every clause of that disposition was already in the
pre-round bytes at `739fea34` — the commit whose subject is *"TSPEC v0.9 — round-13 changelog and
ERR-8 (FSPEC Step 5 sequencing)"* — which is the commit I approved. Nothing was owed to this
document, so nothing changed, and nothing I previously approved could have been broken by a
zero-byte delta.

**I re-measured the disposition's three factual claims rather than trusting the item text:**

| Claim | Measured at HEAD | Holds |
|---|---|---|
| TSPEC §D.5 records ERR-8 and states the implementer's rule | §D.5: *"raised as ERR-8, and the rule the implementer follows is this one: **extract for every eligible document, then apply the count and total bounds**"* | ✅ |
| The §Open questions entry describes the FSPEC defect and supplies a fix | ERR-8 entry names items 15–16, the structural-vs-extraction mismatch, E-36's no-slot drop, and the suggested item reordering | ✅ |
| The PLAN's rows already encode the corrected order | PLAN's ERR-8 row: *"Already absorbed; no task moves"* — LI-16 runs `extractInjectableMaterial` for every eligible document and `selectLearnings` drops `sections: []` before both bounds; LI-12's third `LI-AT-30` case is the oracle that reds on Step 5's literal order | ✅ |

**Upstream is unchanged since the round I approved.** The dispatch's REQ and FSPEC digests
(`ff605dd3…`, `ae75fa62…`) are byte-for-byte the ones recorded in v14's `UPSTREAM-STATE` trailer, and
`shasum` over both files at HEAD reproduces them. There is therefore no DEC-ERR-03 drift surface this
round: nothing this TSPEC cites can have stopped saying what it said, because no cited document
moved. I confirmed the one upstream passage the item turns on — FSPEC Step 5, items 15–17 — still
reads exactly as ERR-8 describes it: item 15 drops on the structural condition *then* takes the first
`maxDocuments`, item 16 extracts "for each taken document". ERR-8 is still an accurate, still-open
report, not a stale one.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
