# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** product fidelity of the TSPEC against REQ v1.4 and FSPEC; grounded against the branch HEAD.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | AC-9.1 makes it a *named* requirement that the A1/A2 advisory record land "under the **candidate feature's** directory." The TSPEC discharges this only implicitly: §9.1 uses a generic `docs/{feature}/ADVISORY-{feature}.md` and `appendAdvisoryEntry({ feature, … })` (TSPEC:1004), while §6.3/§6.4 never state in prose that the `feature` threaded to the queue-side seam is the *candidate being triaged* (it is derivable from §5.2's "the candidate's own REQ path from the queue row," TSPEC:529). Add one clause in §6.1 or §9.1 pinning `feature = candidate feature` for A1/A2, so AC-9.1's candidate-directory obligation is stated where a reader looks for it rather than inferred across three sections. | REQ-ADV-09 / AC-9.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §1.1 pins every `file:line` at "HEAD `5d66c48`," but the branch HEAD is now `5ebec75` (two later docs-only commits: `4f75770`, `5ebec75`). Line counts still match (`orchestrate-dev.js` 8642, `orchestrate-queue.js` 1587) and every source citation I spot-checked resolves, so citations are unaffected — but a reader running the document's own `git rev-parse HEAD` cross-check will see a mismatch. Is a self-pin refresh to the actual HEAD worth one line, or is the two-commit drift acceptable given both are docs-only? (Raised as a question, not a finding — this is citation hygiene, not product fidelity.) |
| Q-02 | REQ AC-9.4 enumerates the summary as "count of invocations, count resolved, count escalated." §9.4's `advisorySummaryRows` faithfully adds a fourth `noAction` count (tracing to FSPEC V-7's third terminal outcome) and asserts `invocations === resolved + escalated + noAction`. This is a helpful superset, not a contradiction — but should the REQ summary enumeration acknowledge `no-action` so a reader summing `resolved + escalated` is not surprised by a remainder? If so it is a REQ-side clarification, not a TSPEC change; flagging for the author's judgment rather than emitting an erratum, since no hard contradiction exists. |

## Positive Observations

- **Traceability is complete and load-bearing.** §14.1 maps every REQ-ADV-01…10 to a TSPEC section and named components; I confirmed each of the five user stories (US-01…05) is served by a concrete mechanism (resolve-unattended via the driver; analysis-already-done via the escalation record; un-widenable boundary via code-side `classifyEnvelope`, NFR-1; recorded via §9; never-declare-a-gate-passed via P-1/P-3 structural non-calls).
- **Contract fidelity holds exactly.** The `confidence` enum `{high, low}`, the eight-member `ADVISORY_REFUSAL_REASONS` (order *and* set identical to AC-3.6), the four-member envelope E-1…E-4, the exclusion set X-a…X-e, and the four prohibitions P-1…P-4 all transcribe the REQ definitions without narrowing, reinterpretation, or unmarked internal variants. `withinEnvelope` is correctly treated as advisory-only (FSPEC V-3, confirmed at FSPEC:258), reconciling AC-2.2's literal text with NFR-1.
- **The test-quality clauses this review is required to demand are already the TSPEC's own discipline.** §13.4 mandates positive-triple assertions on every prohibition (no absence-only oracles, AC-4.6), set-equality over the closed catalogues (T-03-5/T-03-8), a *transcribed literal* fixture for the disabled-run created-file set (§11.2, no implementation echo), and X-a's seven operations as seven named tests. This is exactly the rigour that protects the product's "un-widenable boundary" promise.
- **The two FSPEC errata (§16.4) are correctly handled.** Both the A2-6/R-2 ordering gap and the C-2/D-5 conflict are genuine upstream gaps; the TSPEC resolves each with a code-shaped decision *and* routes them as errata rather than folding them into scope or silently changing an acceptance criterion. The C-2 emit-suppression preserves AC-1.6/NFR-3 (a disabled run carries no advisory content) — I verified the resolution does not weaken the disabled-tier equality.
- **Ground-verification passed.** I confirmed the load-bearing citations against the tree: `MODEL_IMPLEMENTATION` (dev:1621), the `status === "failed"` A5 branch (dev:6371), `realMain`/`_runPipeline` (queue:764), both bundles carrying `devModule`+`queueModule` (build:281/288), `MERGE_ESCALATIONS` (dev:1321), `buildFinalReport` (dev:8595), Phase DOD's two halts (dev:8281/8294), the guard-block coupling (`dev:8342` literal + `dev:8348` regex), and the guard script's `CROSS-REVIEW`/`CODE_REVIEW` token grammar. The §9.3 "extend-don't-rewrite" mitigation for the guard-message coupling is accurate and correctly identifies a real regression risk.

## Recommendation

**Approved with minor changes**

The TSPEC covers every P0/P1 requirement, stays in scope, and preserves all acceptance criteria faithfully. The single Low finding (F-01) is a documentation-locality nit — the behavior it names is already correct, only its statement is diffuse. No High or Medium findings; no product decision is being made in this engineering artifact that belongs in the REQ/FSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
