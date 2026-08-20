# POSTMORTEM — Phase D — pdlc-learnings-injection

**Halt class:** ERRATUM-PROTOCOL
**Halt reason (verbatim):** Phase D halted: the delta confirmation of the FSPEC erratum round did not pass — non-approving: [se-review, te-review].
**Date:** 2026-08-19
**Branch:** `feat-pdlc-learnings-injection`

## Phase

Phase D (DECISIONS), FSPEC erratum delta-confirmation round. The erratum under confirmation is
commit `a6b42bae` (`FSPEC-pdlc-learnings-injection.md` v0.7 → v0.8, +10/−2 lines: version row,
upstream REQ pointer `v0.8` → `v0.9`, and one new erratum note). It carried a single routed item:

| Routed item | Substance |
|---|---|
| ERR-4 | `§I.2/§I.4/§OQ.2` still gate on `present && config.enabled && !sectionMalformed` with the shipping default left open; re-ground on REQ v0.9 AC-5.1a / FSPEC v0.7 BR-14 ("absent reads as §4.1 defaults, `enabled` stays `true`, no second gate key"); close OQ.2 |

Both confirmers found the item **resolved and correctly resolved**: the cited section ids are TSPEC
numbering, absent from this FSPEC (`grep` returns nothing), while FSPEC Step 0(2), D-1 and BR-14's
five-state table already say exactly what REQ v0.9 AC-5.1a says. The erratum recorded the routing
instead of inventing a behavioural change. Neither confirmer asked for one byte of the delta back.

The halt is again not about the edit's content. It is about the **channel** both confirmers answered
on — the same defect that halted Phase T two phases earlier, now on both channels at once.

## Iterations

- FSPEC cross-review v1–v6: ordinary review loop, both lenses.
- **v7 — the Phase T halt.** Erratum confirmation on `4857352e`; se-review non-approving with zero
  parseable `FINDING:` lines → fail-closed → R4. See `POSTMORTEM-T-pdlc-learnings-injection.md`.
- v8 — follow-up erratum (`fa229bde`, FSPEC v0.7). Both confirmers approved. se-review carried
  **zero** `FINDING:` lines and escaped the fail-closed rule only by approving; te-review carried one.
  A second near-miss on the same channel.
- **v9 — the halting round.** Erratum confirmation on `a6b42bae`, dispatched to both channels under
  DEC-ERR-03. Both non-approving, both with zero parseable `FINDING:` lines.
- Follow-up budget for this erratum: unspent at halt time (`attempt = 0`,
  `MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`), so the halt reason carries no spent-budget clause.

Grammar conformance across this branch is **decaying, not stable**. Line-leading `FINDING:` counts:

| Round | se-review | te-review |
|---|---|---|
| REQ v5 / v6 / v7 | 3 / 1 / 4 | 4 / 2 / 5 |
| REQ v8 | 0 (approving — near-miss) | — |
| FSPEC v7 | 0 (**Phase T halt**) | 2 |
| FSPEC v8 | 0 (approving — near-miss) | 1 |
| REQ v10, v11 | 0, 0 (approving) | 0, 0 (approving) |
| **FSPEC v9** | **0 (halt)** | **0 (halt)** |

The last conforming file on either channel is `CROSS-REVIEW-test-engineer-FSPEC-v8.md`. Four
approving rounds since then carried zero lines and were ungated purely because they approved.
