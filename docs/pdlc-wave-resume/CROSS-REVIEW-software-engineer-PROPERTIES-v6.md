# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Date:** 2026-08-23
**Iteration:** 6 (delta re-review — PROPERTIES v1.3 → v1.5)

## Overview

**Scope of this pass.** My v5 was a delta confirmation against TSPEC v1.4 and returned *Needs
revision* on one High (F-01) plus two Medium bookkeeping items (F-02, F-03). PROPERTIES has since
moved from v1.3 to v1.5 across nine commits (`git log --oneline -- PROPERTIES-…`, `6156ad69` …
`6eef4a83`). I diffed the document against `cedf0a74` — the commit carrying my v5 — and reviewed
only what changed, per the delta protocol. The measured delta is 66 changed lines across seven
surfaces:

| Changed surface | Answers |
|---|---|
| Header version 1.3 → 1.5; revision rows 1.4, 1.5 | bookkeeping |
| PROP-OVERRIDE-01 gains the AT-05 write-side conjunct (`PROPERTIES:171`) | **F-01** |
| PROP-OVERRIDE-05's rationale restated on the discriminating conjunct (`PROPERTIES:175`) | PM F-04 |
| PROP-COV-03 four → five mutations (`PROPERTIES:235`) | **F-01** |
| Oracle rows for PROP-OVERRIDE-01 and PROP-COV-03; mutation → oracle map gains row 5 (`PROPERTIES:337, 371, 375-385`) | **F-01** |
| § Fixtures run-depth paragraph restated as three-way agreement (`PROPERTIES:504`) | **F-02** |
| § "Findings routed upstream" ledger re-verified; PLAN-task trace gains T-11 and T-12 (`PROPERTIES:620-627, 741-760`) | **F-02**, **F-03**, plus the PLAN v1.2/v1.4 cascade |

**Result.** All three of my v5 findings are resolved, and I verified each against the repository
rather than against the revision-history prose. Two new items surfaced inside the changed text —
one Medium, one Low. Neither gates.

**Not re-litigated.** The AT-14 split, the outcome-catalogue set-equality design, the H-1 event-sink
ordering oracles, the coverage-floor scoping to `orchestrate-dev.js`, the pyramid budget, the eight
guard rows of §3.2 and the string-ownership rules are byte-identical across the diff and stay
approved.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
