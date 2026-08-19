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

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 `snapshot-unavailable` occupied the reason position, extending a closed set REQ AC-3.4 forbids extending | High | **Resolved** | §2.5's field table now reads "no refusal reason — `reason: null`"; the word survives only as prose in the escalation decision sentence, the notice and §4.5's `diagnosis`. §5.6's AT-03-7 row still asserts eight members in shipped order, and a companion assertion pinning the catalogue is added to §5.2's fixture. The remedy is exactly the one AC-3.4 and BR-15 name |
| F-02 the `__preDispatch` escape was named as the capture-failure carrier, but capture precedes the driver | Medium | **Resolved, and better than asked** | §2.5, §3.2 step 4 and §3.5 now agree on one answer: capture runs at the call site, the escape is explicitly unavailable, and `runWaveGateSeam` writes the record entry, the escalation entry and the notice itself in a stated order. The reason given — capture inside `gatherEvidence` would re-capture on attempt 2 and destroy the one-snapshot-per-wave invariant — is verifiable at `:3393` and `:3554-3568`, and it is a stronger reason than the one I had |
| F-03 §4.5's halt-fields row did not say what the four fields hold on the capture-failure path | Low | **Resolved** | §4.5 gains a four-row literal table: `rootCause` `"unclassified"`, a fixed `diagnosis` sentence, `repairApplied` `false`, `repairPaths` `[]` — transcribable values, not derived ones, which is what lets §5.5 assert them |
| Q-01 does Phase T hold for the BR-9 erratum? | — | **Answered** | §6 OQ-9: no. Both dependent cases are marked upstream-pending and PLAN mints them with the expected value named as pending |
| Q-02 promote the trailing-slash trap to the constraint corpus? | — | **Answered** | §6 OQ-10: recommended, routed to Phase H for promotion, with this feature's PLAN carrying the slash as a Phase P authoring requirement |
| Q-03 does the ignored-path-only refusal stand independent of OQ-7? | — | **Answered** | §6 OQ-11: yes, in either direction |

All three prior findings are genuinely closed. The two findings below are **delta** — both were
introduced by this round's edits, in the sections that fixed the prior findings — and one Medium is
a rendering defect in how this round's new prose was attached to existing tables.

## Findings

## Questions

## Positive Observations

## Recommendation
