# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (bytes unchanged since v2 approval)
**Upstream re-read:** FSPEC `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (sha256:a4f775bd…, v0.10)
**Date:** 2026-08-19
**Iteration:** 3 (upstream-cascade confirmation)

## Context

My v2 approval of DECISIONS was recorded against `UPSTREAM-STATE: FSPEC sha256:57b71e0c…`
(commit `fa229bde`, FSPEC **v0.7**). FSPEC at HEAD is sha256:a4f775bd… (commit `9a4b7593`, **v0.10**) —
three erratum/follow-through rounds landed on top of the version I read:

| Commit | FSPEC version | Substance |
|---|---|---|
| `a6b42bae` | v0.8 | Re-grounded on REQ v0.9; records the `present && config.enabled && !sectionMalformed` gate / shipping-default item (`ERR-4`) as **TSPEC-scoped**; explicitly no behavioural change here |
| `cbb0a63e` | v0.9 | **Locus change.** BR-9's corpus-level catalogue and BR-10's ordering key values move from *once per run* to **per authoring dispatch**; BR-10 splits into two loci (per-dispatch ordering keys, run-level thresholds) with **two** completeness tests; a run-level mirror is declared "additive, not the oracle: nothing asserts on it"; AT-20/AT-21/AT-22 rewritten to name the locus and to exercise AT-18's changing-corpus fixture |
| `523e2df9`, `9a4b7593` | v0.9/v0.10 | Header Cross-Reviews row; AC-6.2 traceability row's rule column narrowed to `§Acceptance Tests preamble` (AT-31/AT-32 stay in the test column) |

DECISIONS' own bytes have not moved. The one question of this round: **is DECISIONS still a faithful
compression of FSPEC as it now stands?** REQ (sha256:ff605dd3…) is the same version my v2 approval was
taken against, so REQ-derived claims in DECISIONS are undisturbed; TSPEC is downstream of this document
and is not an input to its fidelity.

The load-bearing surface is narrow. FSPEC v0.9's locus change touches exactly the material DECISIONS
leans on in three places: DEC-LI-06's citation of **E-32** (per-dispatch observation), `D-O-6`'s
multi-dispatch call-count and `RSN-UNLISTABLE`-at-dispatch-5 obligation, and the fourth row of
**§Decisions deliberately NOT taken**, which is the only place DECISIONS speaks to AC-3.3's run-level
vs per-dispatch locus. I re-read all three against FSPEC at HEAD rather than against the item list.

## Options Considered

_TBD_

## Decision

_TBD_

## Consequences

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
