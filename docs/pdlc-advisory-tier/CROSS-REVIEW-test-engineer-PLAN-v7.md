# Cross-Review: test-engineer — PLAN (delta confirmation, POSTMORTEM-PR R-4)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md (v1.7)
**Date:** 2026-08-04
**Iteration:** 7
**Scope:** Delta confirmation of PLAN v1.7 (diff `7097b57..HEAD`, fix commit `584b791`) per
POSTMORTEM-PR-pdlc-advisory-tier.md R-4 — does the revision resolve my v6 findings (F-01 High,
F-02 Low) and questions (Q-01, Q-02), and did anything else move? Unchanged sections are not
re-reviewed. FSPEC v1.5 and DEC-ADV-11 (commit `c7dc98f`) are used here only as the now-authoritative
upstream statements; their own confirmation reviews are separate.

## 1. Prior findings — disposition

The diff touches exactly three hunks: the version stamp (`PLAN:16`, 1.6 → 1.7), the §8.2 T-03-6 row
(`PLAN:869`), and a new changelog row 1.7 (`PLAN:1025`). Every disposition below is grounded against
the current bytes, not the changelog.

| Item (v6) | Disposition | Evidence I checked |
|---|---|---|
| **F-01 (High)** — §8.2's T-03-6 row told A-07 to stub a gate A3 does not have | **Resolved, in exactly the requested form.** `PLAN:869` now states: (i) "**A1 and A3 are the directions that run backwards**" — the "A1 is the direction" sentence is gone; (ii) "TSPEC §5.5 and §6.3 declare both A1's and A3's `verifyGate` as **`null`** (FSPEC §5.4's gate table states the same form)" — and the upstream agrees: TSPEC §5.5's A3 row reads "**`null`** — same shape as A1: `permittedActions: []`, step 6 unreachable, `resolved` never reached" (`TSPEC:657`), and FSPEC §5.4's A3 row, restated in A1's form at v1.5, reads "**none.** A3's product is a classification only … *(Decided at the Phase PR erratum round — see DEC-ADV-11)*" (`FSPEC:378`, banner `FSPEC:18`); (iii) for A1 and A3 "the mutation is to **install** that same stub, and each case must fail when it is installed"; (iv) "Both gateless cases assert `verifyGate === null`, that `resolved` is unreachable on every path, and that the seam terminates in `escalated` or `no-action` with its own O-1 triple — PROPERTIES §6 (PROP-GATE-01…05) states this form verbatim" — which it does: `PROPERTIES:533` (PROP-GATE-01…05) and the A1/A3 stronger-form paragraph at `PROPERTIES:559-568` state exactly this assertion pair; (v) AC-4.5's parenthetical now reads "A1 none / A2 next-invocation triage / **A3 none** / A4 rebase+tests / A5 rollup read". The false instruction that would have authored A3's case red-against-correct (or vacuous) is gone; the registry parenthetical adds "A3's case takes the same install-the-stub form as A1's". |
| **F-01 sub-claim (iii)** — "A-23 lands both gates" | **Resolved.** `PLAN:869` now reads "A-23 lands A4's gate and A3's gateless seam, batch 10", which matches §3's A-23 row: A3 gets `permittedActions: []` with throwing `apply`/`revert` stubs; only A4 gets a `verifyGate` (`PLAN:274`). The self-contradiction between §8.2 and §3 is closed. |
| **F-02 (Low)** — citation slip "TSPEC §5.4's five `verifyGate` rows" | **Resolved at the site I named.** The clause now reads "FSPEC §5.4's gate table, whose five-row content TSPEC §5.5's `verifyGate` rows carry" (`PLAN:869`) — both pointers correct: FSPEC §5.4 *is* the gate table (`FSPEC:370-380`), TSPEC's per-seam `verifyGate` table is §5.5 (`TSPEC:650-660`). One instance of the same slip survives outside the clause I named — see F-01 below (Low). |
| **Q-01** — why A1's and A3's identical case bodies live in different blocks | **Answered in §8.2.** `PLAN:869` now carries: "A1's and A3's case bodies are identical in form yet deliberately live in different blocks: §3's un-skipper rule follows the last symbol a block's cases exercise (A2's `verifyGate` for `A-31`, A3's `SeamOps` for `A-23`), so neither is a deletable duplicate of the other — deleting either means deleting its registry row, which the set-equality case then fails." That is the half-sentence I asked for, plus the deletion consequence, so the duplicate-deletion hazard I described is now foreclosed in writing. |
| **Q-02** — is the gateless branch keyed off the registry or off the shipped `SeamOps`? | **Answered in §8.2, in the falsifiable form.** `PLAN:869`: "each registry row carries an explicit `gate` column (`gate: null` for A1 and A3) and the generated body branches on that column — never on inspecting the shipped `SeamOps` at test time, so a seam that silently *lost* its gate cannot drift into the gateless branch and pass." That closes the exact hole I described: a seam losing its gate now fails its case instead of being reclassified by the test into the gateless branch. |

**Did anything else move?** No. The diff contains no other content hunk, and I re-ran the contract
gate against the current bytes: `parsePlanTasks` ⇒ **36** tasks, `parsePlanOwnership` ⇒ **36** rows,
`validatePlanContract` ⇒ **`{"ok":true}`**, `computeTopologicalBatches` ⇒ **20** batches — the
expected values, unchanged from v6. No task row, dependency edge, ownership row or batch label moved.
(My v6 F-03 — PROPERTIES §12.3/§13.1 staleness — needed nothing from the PLAN and has since been
closed in PROPERTIES v1.3, commit `08925cf`; recorded here only so it is not re-raised.)

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **One leftover instance of the v6 F-02 citation slip, in the row's item column.** The T-03-6 row's first cell still reads "**every gate row of TSPEC §5.4**" (`PLAN:869`, item column). TSPEC §5.4 is *Prohibitions — structural, not asserted*; the phrase transcribes FSPEC §18.2's own quantifier — "every prohibition P-1…P-4 and every gate row of §5.4" (`FSPEC:1111`), where "§5.4" means *FSPEC's* §5.4, the gate table — with the wrong document label attached. Should read "FSPEC §5.4" (or "TSPEC §5.5"). Pre-existing, outside this delta, and harmless in practice: the corrected dual citation now sits in the same cell, so a reader cannot land wrong for long. Fix on the next touch; no re-parse consequence — the parser reads `#`/`Deps` grammar, not this table. | §8.2 item column, `PLAN:869`; `FSPEC:1111`; `TSPEC:630` vs `:650-660` |

## Questions

None. Both v6 questions are answered inside the document (see §1).

## Positive Observations

- **The fix is the transcription I asked for, not a paraphrase.** The gateless assertion pair —
  `verifyGate === null`, `resolved` unreachable on every path, termination in `escalated`/`no-action`
  with the O-1 triple — lands in §8.2 in the same words PROPERTIES §6 uses (`PROPERTIES:559-568`), and
  names PROP-GATE-01…05 as its source. A-07 now authors from a row that agrees verbatim with the
  document the cases will be verified against.
- **Q-02's answer is stronger than the question required.** I asked whether the branch was keyed off
  the registry; the revision commits to an explicit `gate` column *and* states the failure mode the
  alternative would have allowed ("a seam that silently lost its gate cannot drift into the gateless
  branch and pass"). The rationale travelling with the rule is what stops a future simplification from
  re-opening the hole.
- **The delta is exactly as narrow as the v6 recommendation demanded.** One §8.2 cell, the version
  stamp, one changelog row; the changelog's own claim ("36 tasks, 36 ownership rows, 20 batches") is
  the one I re-derived mechanically, and it holds.

## Recommendation

**Approved with minor changes.**

All four v6 items — F-01 (High), F-02 (Low), Q-01, Q-02 — are resolved at `PLAN:869` in the form my
v6 recommendation specified, each grounded against the now-authoritative upstream (FSPEC v1.5 §5.4,
TSPEC §5.5/§6.3, PROPERTIES §6, DEC-ADV-11). Nothing else in the document moved, and the PLAN
contract re-verifies mechanically (36 tasks, 36 ownership rows, `{"ok":true}`, 20 batches). The single
remaining item is a one-word document-label slip in the same row's item column (F-01 above, Low),
already disambiguated by the corrected citation beside it — fix on the next touch, no round needed.

## Verdict

VERDICT: Approved minor changes
{"high": 0, "medium": 0, "low": 1}
