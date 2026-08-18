# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-plugin-retirement/PROPERTIES-pdlc-plugin-retirement.md (v0.1)
**Date:** 2026-08-18
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | PROP-COMMIT-3's carrier cell reads `T31 → pdlc/engine/__tests__/preflight-baseline.test.js`. Per PLAN §3's file-ownership manifest, T31 owns `docs/pdlc-plugin-retirement/REPLAY-pdlc-plugin-retirement.md` (the `[manual]` replay-transcript row) — it does not own `preflight-baseline.test.js` at all (that file is owned by T01 and T13). This violates PROPERTIES §1 rule 6 in its own document ("file in carrier cell appears in PLAN §3's ownership manifest under that task"). Fix by correcting the carrier to name the task(s) that actually own `preflight-baseline.test.js` (e.g. T01/T13) or, if the intent was the replay-evidence task, cite T31 with its actual owned file. | PLAN §3, PROPERTIES §1 rule 6, PROP-COMMIT-3 |
| F-02 | High | Local | PROP-COMMIT-4's carrier cell reads `T11/T12/T13 → pdlc/workflows/__tests__/hookCompatibility.test.js`. Per PLAN §3, T11 and T12 both own `hookCompatibility.test.js`, but T13 owns only `pdlc/engine/__tests__/preflight-baseline.test.js` — T13 is not a writer of `hookCompatibility.test.js` under PLAN §3's single-writer manifest. Including T13 in this carrier cell violates the same rule 6 discipline the document states for itself, and misattributes the erratum-6 gate task's owned file. Fix by dropping T13 from this carrier (retain T11/T12) or citing T13's actual owned file separately if the erratum-gate relationship needs recording. | PLAN §3, PROPERTIES §1 rule 6, PROP-COMMIT-4 |
| F-03 | Medium | Process | F-01 and F-02 are the same defect class (carrier cell names a task that PLAN §3 does not list as owning the cited file), both concentrated in the PROP-COMMIT domain (§2.12), which is the newest/most cross-cutting property group in the document. Given the document explicitly commits to a mechanical audit rule (§1 rule 6) for exactly this failure mode, a full mechanical pass over every carrier cell against PLAN §3's file-ownership manifest (not just the two spot-checked here) is warranted before the next round, since the error pattern suggests other PROP-COMMIT or cross-referencing carrier cells may share it. | PROPERTIES §1 rule 6 |

## Questions

| ID | Question |
|----|---------|

## Positive Observations

- §4's acceptance-test coverage table is a clean, verifiable set-equality against FSPEC §6's 26 ATs (AT-1.1…AT-5.3, including the lettered AT-1.4b/AT-1.4c), and §5's REQ-area-to-AC mapping independently re-sums to the same 26 ACs found in REQ v0.16 §6 — no AC is silently dropped and no AC maps only to a `[manual]`-only evidence chain without a named artifact.
- The spot-checked carrier cells for PROP-SWEEP-1 (T14/T15 → documentOracles.test.js), PROP-SUITE-1 (T14/T15 → documentOracles.test.js), and PROP-CLEAN-8 (T07/T30 → consumerCleanup.test.js) all correctly match PLAN §3's file-ownership manifest — the citation errors found here are localized, not systemic across the whole catalogue as far as sampled.
- The document's anti-vacuity discipline (absence-as-positive-control, set-equality vs. containment, non-zero vs. exact status codes) is applied consistently and legibly across domains, and NEG-3's explicit refusal to reconcile the FSPEC L-5 (97) vs TSPEC §4.4 (99) literals faithfully preserves the open erratum rather than silently resolving it in the property layer — good discipline given the document does not own that decision.

## Recommendation

**Needs revision**

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 0}
