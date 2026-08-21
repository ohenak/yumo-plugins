# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.10)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, erratum round 10)

## Overview

**Question answered.** The erratum edit (commits `b83ecd03`…`1972402c`, +36/−14 lines over
`b902f40b`) was dispatched with an empty item list — every routed item reported ABSORBED against
upstream HEAD. So the only question with content is DEC-ERR-03's: measured against REQ v1.15,
FSPEC v1.6, TSPEC v1.11 and DECISIONS as they stand at this dispatch, is this PLAN still a faithful
compression of what upstream now says?

**On the delta itself: yes.** The edit closes OQ-7 in all four places this document was routing it
as upstream-pending, and every one of those four restatements matches the upstream text verbatim in
substance. Upstream hashes were re-computed locally and match the four the dispatch names, so the
transcriptions were checked against exactly the bytes the orchestrator pinned.

**On the document as a whole: one High divergence, inherited and untouched by this edit.** FSPEC
v1.6 changed more than BR-9. It also re-specified `AT-02-1`'s oracle for the root-cause vocabulary
from set equality to **ordered-sequence** equality, and added a two-class arm (`E-08b`). The PLAN's
`A6-05` — the task that owns `AT-02-1` — still specifies `ADVISORY_ROOT_CAUSES` as "four members"
under a blanket "Set-equality throughout", and no task in the plan claims the two-class arm. That
is a P0 acceptance-criterion (`AC-2.2`, REQ-AWG-02) whose oracle the plan now under-specifies
relative to upstream at HEAD. It predates this edit and this edit did not touch it, so it is tagged
`inherited` — non-gating, routed back to the owning phase rather than halting.

Nothing the erratum changed broke anything previously approved: no task row, batch, wave, dependency
edge or file-ownership cell moved, and I re-checked the manifest and dependency sections to confirm.

## Batches

What the edit changed, and whether each change is faithful to upstream at HEAD.

| Delta site | Change | Upstream at HEAD | Verdict |
|---|---|---|---|
| Changelog row 1.10 | New row recording the re-grounding and the OQ-7 absorption | REQ v1.15 `sha256:c62cfc35…`, FSPEC v1.6 `sha256:91ef2557…`, TSPEC v1.11 `sha256:3fa21acf…`, DECISIONS `sha256:84deee10…` — all four re-computed locally, all four match | Faithful |
| Overview — *Not in scope here* → *Decided upstream, transcribed here* | OQ-7 restated as closed, with domain and observation point spelled out | REQ `AC-5.1`: observation point is "the moment restoration completes", record carriers `AC-6.1`/`AC-6.2`/`AC-5.2` (M-WG-7) excluded, ignored paths are "operator files A6 never wrote and never restores over" | Faithful, quotation included |
| Overview — domain bullet | "ignored paths excluded **on both sides**, so an implementation that restores one *fails* AT-05-1" | FSPEC `AT-05-1`: "Ignored paths are excluded on both sides — an implementation that restores one fails this test rather than passing it" | Faithful; this is the non-obvious half and the PLAN got it right rather than paraphrasing REQ's weaker "excluded from the comparison" |
| `A6-10` task row | Ignored-path round trip becomes a fully asserted live case, no `test.todo`, map taken at BR-9's observation point | FSPEC `BR-9` domain + observation point; TSPEC §5.2 case 4 and §2.5 | Faithful, and it asserts the exclusion positively **and** negatively — stronger than the minimum |
| *Upstream dependency that is still open* → *…was open, and is now closed* | Section retired, closes with "**No upstream dependency of this plan is open.**" | TSPEC §6 `OQ-7` "Closed upstream, answered *no*"; `OQ-9` "Moot, and it never bound"; `OQ-11` "Closed… stands on its own merits" | Faithful; the `OQ-11` independence claim the PLAN leans on is exactly what TSPEC §6 says |
| `AT-05-1` traceability row | Now names the domain, the observation point and the live ignored-path case | FSPEC `AT-05-1` | Faithful |
| DoD checklist leg | Was "either landed and transcribed, or still marked pending"; now a single positive obligation on the landed boundary | The disjunct's second arm is dead now that OQ-7 is closed | Faithful, and correctly drops the arm rather than leaving a vacuously-satisfiable check |

I confirmed by grep that no residual `pending` framing for OQ-7 survives anywhere in the document:
the only remaining occurrences are historical changelog rows (1.1–1.9), which are correct as history.

## Dependencies

*(pending)*

## Verification

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Recommendation

*(pending)*
