# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.2)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v2.md` (iteration 2)
**Date:** 2026-08-20
**Iteration:** 3
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. `CROSS-REVIEW-product-manager-TSPEC-v2.md` re-read first, then
`git diff 13c9a390..HEAD -- docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
(162 insertions, 51 deletions) taken as the change set: the changelog block, §2.5, §3.1–§3.3,
§3.5, §4.5, §5.1, §5.2, §5.5, §5.6 and §6's OQ-9…OQ-11. Only those sections were scanned for new
issues; sections approved in round 2 were not re-litigated.

Every behavioural claim added this round was checked against shipped code rather than against the
document's prose:

- `ADVISORY_REFUSAL_REASONS` is still the frozen eight-member catalogue
  (`pdlc/workflows/orchestrate-dev.js:2297-2306`) — no ninth member, as §2.5 now promises.
- `renderAdvisoryEntry`'s null-verdict fallbacks are exactly as §2.5 transcribes them: Confidence
  `n/a`, Envelope `n/a`, Diagnosis `no verdict was produced`, and a bare `escalated` Disposition
  when `reason` is falsy (`:2926-2934`).
- `renderEscalationEntry` renders a null reason as `n/a` and carries the caller's `decision`
  sentence verbatim (`:3059`, `:3065`) — so the diagnostic-prose route §2.5 chose really is
  available.
- `gatherEvidence` is called inside the driver's `while (true)` attempt loop (`:3393-3396`) and
  `verifyGate`'s `consumesAttempt: true` re-enters that loop (`:3545-3568`). The document's
  correction — that the `__preDispatch` escape (`:3401-3410`) is unreachable before the driver is
  entered, and that capture must therefore run at the call site — is right, and the
  one-snapshot-per-wave argument for it is right.
- `appendAdvisoryEntry({feature, disposition, _appendFile, _now})` (`:2965`) and
  `appendEscalationEntry({disposition, ctx, _appendFile, _now})` (`:3090`) have the signatures
  §2.5 names, and `ADVISORY_ESCALATIONS.seam({seam, feature, reason})` (`:1578-1580`) really does
  put free message text in the `reason` slot.
- The record-write / escalation-write asymmetry §2.5 mirrors is the shipped one (`:3331-3345`).
- `ADVISORY_SEAM_PHASES` today has five members, A1…A5 (`:3108-3114`), so §3.1's "gains
  `A6: {id: "I", outcome: "halted"}`" is an addition the document owns, correctly stated as one.

## Prior findings — disposition

## Findings

## Questions

## Positive Observations

## Recommendation
