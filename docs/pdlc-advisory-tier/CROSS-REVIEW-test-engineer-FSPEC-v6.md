# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md (v1.5, commit c7dc98f)
**Date:** 2026-08-04
**Iteration:** 6

**Scope:** Delta confirmation only, per POSTMORTEM-PR-pdlc-advisory-tier.md R-1/R-4. This round
judges exactly one targeted edit — commit c7dc98f (FSPEC v1.4 → v1.5), which restates §5.4's A3
gate row in A1's form (A3 declares no post-action gate). I approved the FSPEC at
CROSS-REVIEW-test-engineer-FSPEC-v5.md; settled decisions are not re-litigated. DEC-ADV-11 and
the PLAN §8.2 fix are reviewed in separate rounds, not here.

## Delta verification

- `git show c7dc98f -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` shows exactly three
  changes: the §5.4 A3 gate row (FSPEC:378), the metadata version cell (1.4 → 2026-08-04 / 1.5),
  and the v1.5 blockquote note beneath it. No other line of the FSPEC changed.
- `git log --oneline 7097b57..HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` lists
  c7dc98f alone — no other commit has touched the FSPEC since my v5 review.

## Assessment of the edit (testing lens)

**(a) T-03-6's obligation stays falsifiable — and becomes satisfiable.** The prior row's gate
state ("no findings remaining") was unsatisfiable by construction: A3-6 (FSPEC:516) fixes that A3
changes no production file, no test file, and no DoD criterion, so a re-run of Phase DOD's verify
step reads a tree A3 never touched and can only repeat the very findings the classification is
about. No correct A3 invocation could ever reach the stated gate state, which made the original
row's T-03-6 obligation vacuous or untestable. The amended row (FSPEC:378) is testable in the
gateless form A1 already carries: the assertion is that no gate exists (`permittedActions: []`,
the driver never reaches the VERIFY step, `resolved` unreachable at A3), and the falsifying
mutation is installing a trivially-passing stub gate — TSPEC §5.5 names
`async () => ({ passed: true })` as exactly the shipped form that must not appear (TSPEC:655 for
A1, TSPEC:657 for A3's "same shape as A1"). The row's testable content lives in that
install-the-stub mutation, not in a bare "there is no gate" absence assertion; and T-03-6
(FSPEC:391) still requires the positive §4 V-8 triple on the same path, so the oracle is not
absence-only. The safety anchors the row cites each carry their own positive tests: A3-3 →
T-05-2 halt (FSPEC:534), A3-4 → T-05-3 no-deferral-enacted with proposed rows present
(FSPEC:535), A3-5 → T-05-4 escalation with no criterion changed (FSPEC:536).

**(b) Consistent with the surrounding contract.**
- TSPEC §7.2 (TSPEC:865) already declares A3 `verifyGate: null` and §5.5 (TSPEC:657) states the
  identical rationale; §4.3 (TSPEC:434-438) covers both gateless seams. The FSPEC now says the
  same thing at its own altitude — the divergence POSTMORTEM-PR R-1 names is closed in TSPEC's
  favour, as directed.
- T-05-1 … T-05-6 (FSPEC:533-538) never referenced the old gate state; none needed amendment.
- A3-1's whole-picture malformedness rule (FSPEC:511, grounded in §4 V-4 at FSPEC:267) remains
  A3's real output-validity check, untouched.
- T-08-9/T-08-10 disposition accounting (FSPEC:755-756) already scores A3's example run as
  `no-action` (1/0/0/1) — consistent with `resolved` being unreachable at a gateless seam.
- Traceability rows citing T-03-6 (FSPEC:886, 899, 902) and the mutation table row (FSPEC:1111)
  are unchanged and still bind every §5.4 gate row, including the amended one.

**(c) No test id, acceptance case, seam rule, prohibition, or other row changed** — confirmed
against the diff; the blockquote note's own claim to that effect is accurate.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings on the delta. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The amended row does not merely delete the unsatisfiable gate — it states *why* no gate can
  exist (nothing applied ⇒ nothing to verify) and re-anchors safety on rules that each carry a
  positive, falsifiable test (A3-3/A3-4/A3-5 → T-05-2/T-05-3/T-05-4). That is the right shape:
  the invariant moved from an unreachable state assertion to mechanisms a test can turn RED.
- The parenthetical pointer to DEC-ADV-11 and TSPEC §5.5/§7.2 makes the cross-document agreement
  checkable from the row itself.
- One pre-existing note, outside this delta and not a finding (unchanged section, approved at
  v5): TSPEC §5.5's A1 row cites "FSPEC T-03-6(b)" but the FSPEC never sub-labels T-03-6 into
  (a)/(b); the install-the-stub mutation is named only in TSPEC. Recorded for the TSPEC's own
  reviewers' awareness; it does not affect this edit.

## Recommendation

**Approved**

The delta is exactly what R-1 prescribes, it repairs a genuinely untestable gate state into a
falsifiable gateless form already proven at A1, and it changes nothing else.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:7edebd8c03ce3a22dbbabb0221628055ff1e656e3630458e1fdb9a00c2c8fc8c
REVIEWED-COMMIT: 08925cf1964979ef3261ed6aca99361da33d2b31
