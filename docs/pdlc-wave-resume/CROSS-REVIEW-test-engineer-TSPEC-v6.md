# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 6 (round 4 erratum — delta confirmation)
**Scope:** Local
**Erratum edit under confirmation:** `b4a628b8..5d5bbd75`

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v1.2 (round 3); a
targeted erratum edit has since landed (`b4a628b8..5d5bbd75`, +9/-4 lines in the TSPEC). I read the
diff, re-derived the mechanical claims it makes against `origin/main`, checked the downstream
document it now cites, and re-read the upstream text the changed section leans on.

**Upstream integrity check first (DEC-ERR-03).** Both upstream hashes in the dispatch match the
bytes on this branch, and both are the *same* hashes I measured in round 3 — upstream is
byte-identical since my last confirmation, so no upstream sentence this TSPEC compresses has moved
under it:

| Upstream | Dispatch hash | Measured `shasum -a 256` | Match |
|---|---|---|---|
| `REQ-pdlc-wave-resume.md` | `17e83bfc…` | `17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f` | yes |
| `FSPEC-pdlc-wave-resume.md` | `9a6be7b5…` | `9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e` | yes |

The one upstream clause the edit newly leans on is FSPEC §341, which fixes the recognised
`implementation.*` key set at `{testCommand, postWaveCommand, postWavePathspecs, startWave}` **as a
set equality**. That is exactly what TSPEC V-13 restates and exactly what the edit's
not-expressible argument rests on. The compression is faithful.

Routed-item ledger:

| # | Routed item | Landed | Verified how |
|---|---|---|---|
| 1 | §5.8: floor re-specified as a last-**task** obligation, not a last-wave `postWaveCommand` (pm-review) | yes | §5.8 now reads "named as an obligation of the **last implementation task** (PLAN T-10, RK-2)". Residual: F-01, F-02. |
| 2 | §5.8/RT-7: `postWaveCommand` is a single global key, so per-wave scoping is not expressible (te-review) | yes | Re-measured at `origin/main`, not taken from the document — see §Data Model. |

Nothing I previously approved is broken. The edit changes prose in one subsection and one risk row;
it touches no interface, no type, no acceptance test, no oracle, no batch and no ownership claim.
Two residual imprecisions remain, both **Low**, neither gating.

## Architecture

*(pending)*

## Interfaces

*(pending)*

## Data Model

*(pending)*

## Test Strategy

*(pending)*

## Open Questions

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
