# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** upstream-cascade confirmation. FSPEC bytes unchanged since my v2 approval
(`REVIEWED-COMMIT: 1dc235e0`). Upstream REQ moved from v1.5 (sha256:a5d3e98…) to v1.6
(sha256:ad68cd05…) across the Phase F erratum round `1b24056a..7660f1ed`. The single question
answered here: does this FSPEC still hold as approved against REQ as it now stands?

## Overview

**What moved upstream.** Four edits landed in REQ v1.6, all inside the erratum round:

| REQ edit | Substance | Bearing on this FSPEC |
|---|---|---|
| §1 / OF-1 restated | 15-wave plan → **16-wave**; the replay tax is now stated per halt ("re-entry after the wave-4 halt paid seven no-op dispatches; re-entry after the wave-2 halt replayed wave 1 only, a single task") | None. This FSPEC quotes no wave count and no dispatch count from OF-1; its only OF-1 citation is EC-12's "pays no replay tax, since nothing below wave 1 exists to replay", which the restated sentence corroborates rather than contradicts. |
| REQ-WVR-02 gains "IG labels name **causes, not precedence**" and cites FSPEC §3.2 evaluating ancestry before over-count | The REQ now yields evaluation order to this FSPEC | **Convergent.** §3.2's "The order above is deliberately not REQ-WVR-02's IG numbering" was written against the older REQ; upstream has now ratified exactly that reading. No divergence. |
| REQ-WVR-08 scoped to the **implementation wave loop**, with Phase PT's V-wave (OF-1's 17th wave) explicitly excluded and still dispatching, gating and committing every invocation — citing FSPEC §2 and EC-20 | The erratum I raised in v2 landed | **Convergent.** §2's Vocabulary paragraph, BR-11 and EC-20 already say this in the same terms. Upstream now matches the FSPEC rather than the other way round. |
| §10 BL-04 recorded **open and unmet**, not discharged at FSPEC authoring | The second erratum I raised in v2 landed | Substantively convergent with OB-F1, which already declares BL-04 unmet — but OB-F1 **quotes the superseded REQ sentence**, and §1's derivation pin still names REQ v1.5. Both are stale-provenance findings below. |

**Answer to the one question.** Yes, with sentence-level corrections. Every behavioural claim,
outcome, rule, edge case and acceptance oracle in this FSPEC remains a faithful compression of REQ
v1.6 — in two places the REQ has moved *toward* the FSPEC, not away from it. What no longer holds
is three provenance sentences that describe upstream as it was before this round: a version pin,
a quotation of REQ §10, and two "raised as an erratum, still open" framings for errata that have
now landed. None of them changes an observable; all three mislead a downstream reader about what
upstream currently says, which is precisely the class DEC-ERR-03 makes a finding of this round.

## Linked Requirements

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
