# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.0, Draft)
**Upstream:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.7 (approved; my `CROSS-REVIEW-test-engineer-REQ-v7.md` carried 3 non-gating Mediums)
**Date:** 2026-08-28
**Iteration:** 1

## Verification performed

Every repo path and every cross-document citation the FSPEC names was checked against HEAD on this
branch, not against the documents that name them.

| Claim in FSPEC | Checked | Result |
|---|---|---|
| Baseline v1.1 exists and carries the `M-*` ids cited (`M-1d`, `M-2e`, `M-3a`, `M-3c`, `M-4a`, `M-4b`, `M-4d`, `M-4e`, `M-5a`, `M-5c`, `M-6b`, `M-6c`) | `docs/_constraints/pdlc-decision-corpus-baseline.md` | ✓ all twelve present; `Version` 1.1 |
| E-9's arithmetic — `M-4d` carries 4 records alongside 8 `DEC-`-bearing non-records | Baseline `:85` | ✓ verbatim: 4 records (`DEC-A6-01…04`), 4 no-namespace ids + 4 back-references = 8 |
| E-4's two standing-corpus empty files are `M-4a` and `M-4b` | Baseline `:82`, `:83` | ✓ `DECISIONS-advisory-wave-gate-questions.md` (bullets, no ids) and `DECISIONS-pdlc-plugin-retirement.md` (ten `DEC-NN` headings, no namespace) |
| E-10 / BR-2's twice-opened block has `M-3c` as sole HEAD witness | Baseline `:75` | ✓ `DEC-LOOP-01` opened at `:237` and `:363`, second stating the outcome |
| E-11 has no HEAD instance (`M-5a`) | Baseline `:92`–`:93` | ✓ zero cross-file duplicate ids; `M-5c` states intent only |
| `maxEntries` floor arithmetic (`M-6b` 63, `M-6c` 70 clears it by 7) | Baseline `:101`, `:102` | ✓ `41 + 22 = 63` under the directory-glob reading |
| `DEC-LOOPECON-06`'s triple is (severity, section anchor, normalised text) — AT-12, AT-16, BR-11 | `docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md:163` | ✓ exact match, incl. the unevaluable-round clause |
| `DEC-ERRROUTE-01` exists and is about erratum minting — BR-14, AT-16 | `docs/_decisions/DECISIONS-erratum-routing.md:12` | ✓ "A confirmation round's findings must mechanically mint erratum items" |
| `REQ-LOOPECON-01b` recompute-at-dispatch precedent — §3 preamble, BR-9 | `docs/completed/pdlc-loop-economics/REQ-pdlc-loop-economics.md` | ✓ shipped and tested |
| Q-3's two disclosure tests exist | `pdlc/engine/__tests__/learnings-config-example.test.js`, `loop-config-example.test.js` | ✓ both; a third (`advisory-config-example.test.js`) exists, strengthening the precedent Q-3 cites |
| Q-3's claim that both shipped gated blocks are disclosed today | `.claude/pdlc.config.example.json` | ✓ `cascade.pinCheck` and `review.derivativeStop` are both present; `decisionLedger` is absent, as expected pre-feature |
| C-2's committed-fixture-baseline precedent (BR-4, AT-04) | `pdlc/workflows/__tests__/learningsBaselineGuard.test.js` | ✓ shipped; it pins the capture with **hand-transcribed digest literals per `caseId`** (DC-14) and a **set-equality** check over the case-id set, with a three-step mutation proof recorded in its header |

The `learningsBaselineGuard.test.js` header is worth reading before TSPEC: it is the exact shape
AT-04/AT-05 need, and it already answers half of REQ O-4.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
