# POSTMORTEM — Phase T (erratum protocol) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC** → DECISIONS → PLAN` |
| Downstream | `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PLAN-v6.md`, `CROSS-REVIEW-test-engineer-PLAN-v6.md` (delta confirmation, erratum round 4) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

**Date:** 2026-08-19
**Halt class:** `ERRATUM-PROTOCOL`
**Halt text:** Phase T halted — the delta-confirmation round for the PLAN erratum round returned non-approving from both lenses: `[pm-review, te-review]`.
**Document at halt:** `PLAN-pdlc-advisory-wave-gate.md` v1.4 (`d912eea9`)

RESOLVED: no

---

## 1. Phase

Phase T authored and revised the TSPEC for the pdlc advisory wave gate; TSPEC converged at **v1.10** and was approved by both lenses in round 11 (`7f81a59d` PM approved-with-minor, `921128f1` TE approved). The halt did **not** occur on the TSPEC itself.

TSPEC §1.3/§6 routed one decision downstream into the already-approved PLAN: commit `e3b9d5a3` had landed the test-side A6 seam-cardinality transcription ahead of Phase I, leaving the advisory suites red at HEAD, and TSPEC left "revert vs. keep-and-re-derive" to PLAN. That opened **erratum round 4** on `PLAN-pdlc-advisory-wave-gate.md`, taking it v1.3 → **v1.4** (`a189cf59` … `d912eea9`).

Under the erratum protocol, a routed erratum closes only when its delta-confirmation round is approving from every lens that reviewed the host document. Round 6 was that confirmation round. Both lenses returned **Needs revision** (`8f16ec9f` PM, `dca04c99` TE), so the erratum did not close and Phase T halted with class `ERRATUM-PROTOCOL`.

Scope note: the PLAN's routed items were all judged **discharged** by both reviewers. The non-approving verdicts rest on collateral defects the erratum edit either introduced or failed to absorb from the upstream that moved underneath it (REQ v1.8 → v1.9, TSPEC v1.6 → v1.10 while PLAN sat at v1.3).

## 2. Iterations

## 3. Reviewers

## 4. Pattern of Disagreement

## 5. Best-Guess Root Cause

## 6. Recommendation

---

## Appendix A — prior Phase T halt (review-cap, resolved)

---

**Provenance**

- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
