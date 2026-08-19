# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.4)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Previous review:** `CROSS-REVIEW-product-manager-TSPEC-v4.md` (iteration 4)
**Date:** 2026-08-20
**Iteration:** 5
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. Re-read `CROSS-REVIEW-product-manager-TSPEC-v4.md`, then
`git diff 7ec5c8b9..HEAD -- docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
(193 insertions, 78 deletions). Change set taken: the v1.4 changelog block, §2.5's snapshot-ref
bullet and plumbing listing, §3.2 steps 3 and 6, §3.3's `apply` and `verifyGate` rows, §3.5's
capture bullet, §4.5's artifact row, §5.2's four new/rewritten bullets, §5.5's two-row mutation
table, §6 OQ-2 and the new OQ-14/OQ-15. Sections approved in rounds 3-4 were not re-litigated.

Every behavioural claim this round was checked against shipped code, not against the TSPEC's prose:
the driver's attempt loop opens at `pdlc/workflows/orchestrate-dev.js:3393` (`while (true)`), APPLY
is `:3521` (`seamOps.apply(verdict)`) and VERIFY is `:3544`/`:3546` in the *same* iteration, so
`apply` does run strictly before that attempt's `verifyGate`, as §3.3's new sentence claims. The
three non-gating `attempts += 1` paths the changelog leans on are real and are preemption `:3421`,
dispatch error `:3428` and malformed verdict `:3459` — each `continue`s or terminates without
reaching VERIFY, which is exactly why `attempts` is the wrong operand. The `consumesAttempt`
re-entry §5.5's second fixture depends on is `:3554`-`:3568`. Upstream boundary re-checked directly:
`FSPEC:204` and `FSPEC:410` still read "tracked and untracked files alike, generated outputs
included" with no `.gitignore` carve-out (OQ-7, re-emitted below); `REQ:441-445` (AC-5.1) delegates
the mechanism to O-1 and so carries no conflicting claim.

## Disposition of round-4 findings

| ID | Severity | Disposition | Evidence |
|----|----------|-------------|----------|
| F-01 | High | **Resolved** | Step 6 now measures **growth since the last `apply`**, with `apply` recording `ledgerAtLastApply = invocations.length` as its first statement (`TSPEC:520-545`, §3.3's `apply` row). The anchor sits above the pre-A6 pass's own `[post-wave, test]`, so the failure mode I raised — a `verifyGate` returning `{passed:true}` without running anything, granted resolution by the suffix reading — now leaves an empty slice and is refused. The anchor is code A6 owns and the driver's ordering makes it decidable (`orchestrate-dev.js:3521` before `:3546`, verified). §3.3's `verifyGate` row, §5.2's companion and §5.5 all now state the same anchored quantity — the three-way reconciliation I asked for |
| F-02 | Medium | **Resolved** | The false coverage claim is withdrawn in the paragraph that made it (`TSPEC:479-487`), and §5.2 gains the positive case instead: one run, over budget on entry, asserting `reason: "budget-exhausted"`, record + escalation entries written, `commit-tree === 1` with an `update-ref` observed, and no `_agent` call (`TSPEC:1074-1082`). Positive facts on a single run, no absence-only oracle |
| F-03 | Medium | **Resolved, and better than the fix I proposed** | The ref is wave-scoped everywhere it appears — `TSPEC:263`, `:295-303`, `:483`, `:566`, `:741`, `:910`, `:1300` — with no surviving unscoped spelling (grepped). §2.5 states the multi-wave consequence explicitly ("a run that resolves wave 1 and then escalates over budget on wave 2 ends holding both refs"), and OQ-2 records *why* the name changed rather than only *that* it did. FSPEC/REQ never name the ref, so this is TSPEC's to choose under O-1 — no upstream conflict |
| Q-01 | — | **Still open upstream** | Re-emitted as an erratum below; `FSPEC:204`, `:410` unchanged |
| Q-02 | — | **Answered and covered** | §5.2's capture-failure fixture gains a containment assertion that the failing git verb reaches the escalation entry, recorded as OQ-14 (`TSPEC:1050-1055`, `:1312`). Containment rather than equality keeps §5.5's fixed-sentence `diagnosis` oracle intact — the right shape |

## Findings

## Questions

## Positive Observations

## Recommendation

