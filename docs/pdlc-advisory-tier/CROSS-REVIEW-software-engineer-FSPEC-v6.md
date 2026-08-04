# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md (v1.5)
**Date:** 2026-08-04
**Iteration:** 6

**Scope:** Delta confirmation of FSPEC v1.5 (commit c7dc98f) per POSTMORTEM-PR-pdlc-advisory-tier.md R-1/R-4. The FSPEC was approved at CROSS-REVIEW-software-engineer-FSPEC-v5.md; this round judges only the single targeted edit — §5.4's A3 gate row restated in A1's gateless form, resolving the FSPEC ⟷ TSPEC divergence (TSPEC §5.5/§7.2 already declared A3's `verifyGate` null) in TSPEC's favour, per te-review F-01 High at CROSS-REVIEW-test-engineer-PLAN-v6.md. DEC-ADV-11 records the decision and is reviewed separately. Settled decisions are not re-litigated.

## Delta verification

- `git show c7dc98f -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` shows exactly three hunks: the version-table bump `1.4 → 1.5` with date `2026-08-04` (FSPEC:16), the v1.5 blockquote note (FSPEC:18-21), and the one §5.4 A3 row (FSPEC:378). Nothing else in the file changed.
- `git log --oneline 7097b57..HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` lists exactly one commit: c7dc98f. No other commit touched the FSPEC since the v5 review.

## Consistency checks (all grounded, all pass)

| Check | Evidence | Result |
|---|---|---|
| Form matches the approved A1 row | A1 row (FSPEC:376): "**none.** … has no independent post-action gate; its safety rests on …", `—` in the state column. New A3 row (FSPEC:378) follows the same structure: no gate, named safety rules (A3-3, A3-4/A3-5), `—` state cell | Consistent |
| §5.4 preamble quantification | FSPEC:372 — "After any **applied** resolution, a gate re-runs". A3 never applies a resolution (A3-6, FSPEC:516: "A3 changes **no** production file, no test file, and no DoD criterion"), so the preamble is vacuously satisfied, exactly as for A1 | Consistent |
| A3-1…A3-7 (§7.2) | FSPEC:511-517 unchanged; A3-3 (halt on `real-defect`, :513), A3-4/A3-5 (escalate, :514-515) are exactly the safety rules the new row cites; A3-6 (:516) grounds `permittedActions: []` | Consistent |
| T-05 acceptance rows | FSPEC:533-538 unchanged. T-05-5 (:537, tree byte-identical after any A3 invocation) remains the mechanical oracle that a gate row could never have supplied — TSPEC:891-892 makes the same point | Consistent |
| V-7 dispositions | FSPEC:270 — `resolved`/`escalated`/`no-action` closed set unchanged; with no gate, A3 never reaches `resolved`, matching TSPEC:657 ("`resolved` never reached") | Consistent |
| BR-2 / BR-6 | FSPEC:1024 (BR-2, pre-apply gates) untouched; FSPEC:1028 (BR-6) — "Every **applied** resolution is followed by the seam's own gate" — conditionally quantified, vacuous at A3, same as at A1 | Consistent |
| AC-4.5 conditional quantification | REQ:177 — "Given a resolution **is applied**, Then a gate re-runs" — A3 never satisfies the Given; REQ:198 already models A1's pre-condition-not-post-gate pattern | Consistent |
| TSPEC divergence resolved in TSPEC's favour | TSPEC:431-438 (§4.3: A1/A3 supply `permittedActions: []` and `verifyGate: null`), TSPEC:657 (§5.5 A3 row: `null`), TSPEC:863-865 (§7.2: `permittedActions` `[]` (A3-6), `verifyGate` `null`). TSPEC v1.3 unchanged per R-1 | Consistent |
| No test id, seam rule, or prohibition changed | Diff touches no P-1…P-4 row (FSPEC:365-370), no T-* id, no A*-* rule, no BR-*, no V-* | Confirmed |

## Soundness of the no-gate argument

The original row ("Phase DOD's verify step" / "no findings remaining") was unsatisfiable by every correct invocation: A3 fires precisely when the DoD loop has exhausted with findings remaining (FSPEC:533 T-05-1's Given), and A3-6 forbids it changing any file — so a verify-step re-run reads a tree A3 never changed and can only repeat the findings the classification is *about*. A seam whose gate can never pass would either never reach `resolved` (making the row dead text) or force an incorrect implementation to fabricate a pass. Declaring no gate — with safety resting on A3-3's unconditional halt (TSPEC:852-854: "its branch has no `if (resolved)` at all; the halt is unconditional") and A3-4/A3-5's escalations, enforced by T-05-5's tree comparison — is the technically sound resolution, and it is the form TSPEC had already implemented.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. The delta is exactly the sanctioned one-row edit, internally consistent with every FSPEC anchor checked above, and resolves the divergence in the direction the TSPEC's structural argument requires | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The row does not merely delete the gate; it explains *why* no gate can exist (`permittedActions: []` ⇒ driver never applies ⇒ nothing to verify) and names where safety actually rests, mirroring the A1 row's rigor.
- The parenthetical citation trail (DEC-ADV-11; TSPEC §5.5/§7.2) makes the erratum-round provenance auditable from the row itself.
- Correctly distinguishes Phase DOD's verify step as the *next invocation's* input rather than this seam's gate — the same input/gate separation REQ:198 established for A1's pre-check.

## Recommendation

**Approved**

The v5 approval stands; the v1.5 delta is confirmed.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
