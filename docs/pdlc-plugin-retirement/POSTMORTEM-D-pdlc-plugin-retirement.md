# POSTMORTEM — Phase D (FSPEC erratum delta confirmation) — pdlc-plugin-retirement

**Date:** 2026-08-18
**Phase:** D (delta confirmation on the FSPEC erratum round)
**Failure class:** ERRATUM-PROTOCOL
**Document at halt:** `FSPEC-pdlc-plugin-retirement.md` v0.8 (`1eccc97c`)
**Non-approving confirmers:** se-review, te-review

RESOLVED: no

## Phase

Phase D was not an authoring phase. FSPEC v0.7 was approved (SE v9 / TE v9 "minor changes",
re-confirmed unchanged in the v10 upstream-cascade round, approval anchors `638413b4`). Four
items were then routed to FSPEC through the TSPEC §6.1 erratum channel, and three commits
(`8c5847a6`, `76e40b98`, `1eccc97c`) landed them as a targeted versioned edit producing v0.8.
Phase D asked the one question a delta round asks: **does the delta resolve the routed items
without breaking anything previously approved?** Both confirmers answered no, and the phase
halted with the erratum edit landed but its contract chain inconsistent.

The routed items were:

| # | Routed item | Landed in v0.8? | Confirmation outcome |
|---|---|---|---|
| 1 | Erratum 3 — class 11 must state the *capability* disposition for `consolidate-learnings`, not merely "delete the bundle reference" | Yes (`FSPEC:163`, `:192`–`:199`) | Contradicts REQ §A-1 and baseline M-11n; rests on a claim false at module granularity (SE F-03, TE F-01/F-02) |
| 2 | Erratum 5 — `postWaveCommand` / `postWavePathspecs` **values** survive; class 10 is prose-only | Yes (`FSPEC:162`, `:347`) | Landed downstream only; REQ C-5, REQ AC-1.2's rationale and baseline M-11h still say the opposite (SE F-01) |
| 3 | Tighten `consolidationPreflight.test.js`'s `postWavePathspecs` assertion from containment to set-equality | Yes (`FSPEC:162`) | Names the wrong file; the assertion it tightens never executes in CI (TE F-03) |
| 4 | Record the held-class accounting over §3.1's thirteen classes (TSPEC §6.4 T-5) | Yes (`FSPEC:167`–`:170`) | Accepted by both confirmers as the delta's one clean landing |

Item 4 is the shape a good erratum has: it changed a downstream document only, and nothing
upstream had a competing sentence. Items 1–3 each carried an upstream obligation the erratum
did not discharge, which is the failure this phase records.

## Iterations

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation

**Provenance**
- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: unresolved (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
