# Cross-Review: software-engineer — PROPERTIES (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 2 (delta confirmation, round v2)

## Overview

**Scope of this round.** A delta confirmation over the v1.4 erratum edit to PROPERTIES
(`1e297117..HEAD`, +26/−10 lines), measured against upstream at the SHAs this dispatch names — REQ
`c62cfc35`, FSPEC `91ef2557`, TSPEC `3fa21acf`, DECISIONS `84deee10`, PLAN `f7de7fcb`. I re-read the
upstream text the changed rows now lean on (FSPEC §3.3's flow table, BR-9, BR-15, E-34; TSPEC §5.2
cases 3–5, §5.5's ignored-path-only row; PLAN's A6-14 and A6-18 red steps) rather than trusting the
document's transcription, per DEC-ERR-03.

**Answer to the question asked:** yes. All five routed items land, each on the form upstream actually
states at HEAD, and nothing I approved in v1 is broken by the edit. My one v1 High (F-01,
PROP-ENV-13's "one attempt must be consumed") is resolved on the strongest available replacement.
Two Low findings survive — one inherited PLAN-task-id drift the edit did not fix, one label
inconsistency the edit introduced — and one new Low records a residual the document itself routes to
se-author. None gate.

**Files changed by the delta:** the changelog (new v1.4 row), PROP-ENV-13 (§C), PROP-REST-03 and
PROP-REST-08 (§E), Fixtures hazard 2, the §C-3 PLAN-home matrix (two rows), and §G-3 (new item 3).
No other property statement, category, level or oracle form moved — I diffed to confirm the
changelog's claim to that effect, and it holds.

## Properties

<!-- pending -->

## Oracles

<!-- pending -->

## Fixtures

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->

## Delta-Confirmation Findings

<!-- pending -->

## Verdict

<!-- pending -->
