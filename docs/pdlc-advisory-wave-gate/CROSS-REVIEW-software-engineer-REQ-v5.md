# Cross-Review: software-engineer — REQ (delta confirmation, erratum round 3)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md
**Date:** 2026-08-18
**Iteration:** 5 (delta confirmation of the v1.7 erratum round)
**Scope:** Local

## Method

Re-read the REQ at HEAD in full (not only the erratum diff), then diffed `119bdaf4`
(`REQ v1.7 — erratum round 3`, the only commit in this round's window) against `6565080a`.
Every claim about shipped behaviour that the round's new text rests on was re-checked against
HEAD source rather than against the raised item's summary of it:

- wave-mode derivation and the BL-03 carrier — `pdlc/workflows/orchestrate-dev.js:14039-14045`
- the BL-04 script-gate carrier in the wave arm — `pdlc/workflows/orchestrate-dev.js:14142-14154`
- the ledger skip that reaches Phase I but executes no wave — `pdlc/workflows/orchestrate-dev.js:14267-14283`
- the advisory budget race the NFR-4 window describes — `pdlc/workflows/orchestrate-dev.js:3414-3423`

Per DEC-ERR-03 this confirmation is not limited to the raised item list: anything the REQ
still asserts that HEAD or the REQ's own definitions no longer support is a finding here.

## Raised Items — Landing Assessment

## Findings

## Questions

## Positive Observations

## Recommendation
