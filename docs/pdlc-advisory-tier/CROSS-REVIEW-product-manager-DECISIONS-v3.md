# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md (v1.1)
**Date:** 2026-08-04
**Iteration:** 3

**Scope:** Delta confirmation only — DECISIONS v1.0 → v1.1 (commit c7dc98f), which adds the single new entry DEC-ADV-11 ("A3 has no post-action gate; the FSPEC ⟷ TSPEC divergence resolved in TSPEC's favour") plus the version bump and v1.1 blockquote note, dispatched per POSTMORTEM-PR-pdlc-advisory-tier.md R-1. DECISIONS was approved at CROSS-REVIEW-product-manager-DECISIONS-v2.md; settled entries DEC-ADV-01…10 are not re-litigated. The same commit's FSPEC §5.4 amendment is reviewed by FSPEC's approvers, not here.

## Delta verification

- `git log --oneline 7097b57..HEAD -- docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md` shows exactly one commit: c7dc98f. No other commit touched DECISIONS since the v2 review.
- `git show c7dc98f -- …DECISIONS…` confirms the diff is exactly: version row 1.0 → 1.1 (date 2026-08-04), the v1.1 blockquote note ("Record only; no prior entry changed"), and the DEC-ADV-11 block inserted before `## Options Considered`. No prior entry was modified.

## Citation verification (product-lens grounding)

| Claim in DEC-ADV-11 | Verified at |
|---|---|
| POSTMORTEM-PR R-1 asks for exactly this record | POSTMORTEM-PR-pdlc-advisory-tier.md:225 — "R-1 — Decide A3's gate once, at the level where the conflict lives (FSPEC ⟷ TSPEC)"; resolution table row at :311 |
| A3's `permittedActions` is `[]` per FSPEC §7.2 A3-6 | FSPEC:516 (A3-6: "A3 changes **no** production file, no test file, and no DoD criterion"); the amended FSPEC §5.4 A3 row (FSPEC:378) states `permittedActions` is `[]` citing A3-6/§7.2 |
| TSPEC §4.3 / §5.5 declare the gateless form | TSPEC:423 ("(A1, A3) supplies `permittedActions: []` and an `apply` that is never reached"); TSPEC §5.5 "The gate that re-runs, per seam" (heading TSPEC:648), A3 `verifyGate` unreachable |
| A3-1 malformedness check consumes an attempt (§4 V-4) | FSPEC:511 (A3-1: partial classification is malformed, §4 V-4), FSPEC:524 (consumes an attempt; halt on budget exhaustion) |
| AC-4.5 is conditional — a seam that never applies is outside its quantification | REQ:177 — "**AC-4.5** — Given a resolution is applied, Then a gate **re-runs**…"; REQ:198 already establishes the pre-check-is-not-a-gate precedent |
| PROPERTIES §6 asserts the both-seams gateless form and predicted the failure mode | PROPERTIES §6 (heading :444), PROP-GATE-01…05 at :533; the prediction block at PROPERTIES:562–575 (":568" falls inside it) — "Asserting conjunct 1 at A3 would require stubbing a gate A3 never reaches … it would fail against a correct build" |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | No findings. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- **Fits the document's declared scope exactly.** DEC-ADV-11 records a real alternative weighed and rejected ("A3 keeps a gate, TSPEC reverts") with the reason it fails — the gate is unsatisfiable, since every correct A3 invocation fires *because* findings remain and A3 is forbidden from changing anything — so a future agent will not re-open the divergence. That is precisely this document's "didn't do, why" charter.
- **Established format honoured.** Context / Decision / Alternatives considered / Constraints that forced this shape / Reversibility / Re-evaluation triggers — identical structure to DEC-ADV-01…10.
- **The safety story loses nothing.** The entry correctly locates A3's product-level safety in its class rules (halt on `real-defect`, escalate on `mis-scoped-criterion`, never enact a deferral — FSPEC A3-3/A3-4/A3-5) and its output validity in A3-1/§4 V-4, and correctly notes Phase DOD's verify step remains the *next invocation's* input. Dropping an unsatisfiable gate removes a row that could only ever fail or be weakened to vacuity; no acceptance criterion is narrowed, because AC-4.5's conditional wording never quantified over a seam that applies nothing.
- **The second rejected alternative is a genuine product distinction.** Refusing to relabel the A3-1 classification-validity check as a "gate" preserves the gate concept's meaning everywhere else (gates verify an *enacted* change of world state) — good terminology hygiene for every future reader of BR-6.
- **Reversibility and triggers are honest.** Re-introducing a gate is correctly tied to a scope change (non-empty `permittedActions`), and the re-evaluation trigger (A3 ever enacting anything, e.g. auto-applying a deferral) is exactly the product condition under which BR-6 would make a real gate mandatory.

## Recommendation

**Approved**

The delta is a faithful, well-grounded record of the R-1 decision, in scope and in format, with every citation verified. No High, Medium, or Low findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
