# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 5 (round 3 erratum — delta confirmation)
**Scope:** Local
**Erratum edit under confirmation:** `0c70e900..b4a628b8`

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v4; a targeted erratum
edit has since landed (four commits, `0c70e900..b4a628b8`, +26/-7 lines in the TSPEC). I read the
diff, re-derived every factual claim it touches against `origin/main` at `345ae358`, and re-read the
upstream text the changed sections now lean on at its current version.

Upstream integrity check first (DEC-ERR-03). Both upstream hashes in the dispatch match the bytes on
this branch:

| Upstream | Dispatch hash | Measured `shasum -a 256` | Match |
|---|---|---|---|
| `REQ-pdlc-wave-resume.md` | `17e83bfc…` | `17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f` | yes |
| `FSPEC-pdlc-wave-resume.md` | `9a6be7b5…` | `9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e` | yes |

Every routed item landed. Two of the landings are exact and independently re-measured (the file-size
claim in RT-1; the seam-cost claim in DEC-WVR-02); two are correct in substance but carry a residual
imprecision of their own, and those are this round's two findings — both **Low**, both **delta**,
both **local**, neither gating.

Routed-item ledger:

| # | Routed item | Landed | Verified how |
|---|---|---|---|
| 1 | §3.1 / §6.1 "four of the seven interpolate" off-by-one | yes | Re-derived from the shipped renderers on `origin/main`; see §Data Model. Residual: F-01. |
| 2 | §6.4 RT-1 "the single largest file in the repo" | yes | `git ls-tree -r -l origin/main \| sort -k4 -nr` — byte counts match to the digit. |
| 3 | §2.4 announcement table omits the invalid-`startWave` notice | yes | Exclusion row added and named. Residual: F-02. |
| 4 | §2.4 catalogue closed **by rule**, not by omission | yes | Rule stated as a blockquote before the exclusion row. Residual: F-02. |
| 5 | §6.1 DEC-WVR-02 alternative (b) "adds a runtime capability" | yes | `_git: rtGit` binds in **both** adapter bundles on `origin/main`. |
| 6 | §3.2 duplicated clause "on the decision on the decision" | yes | Clause removed; no other occurrence remains in the TSPEC. |

Nothing I previously approved is broken. The edit is additive prose plus three corrected sentences;
it touches no interface, no type, no acceptance test, no oracle, and no batch or ownership claim.

## Architecture

_(pending)_

## Interfaces

_(pending)_

## Data Model

_(pending)_

## Test Strategy

_(pending)_

## Open Questions

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
