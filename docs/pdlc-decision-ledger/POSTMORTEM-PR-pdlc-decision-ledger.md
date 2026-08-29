# Post-Mortem: Phase PR — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`PLAN-pdlc-decision-ledger.md` v0.8) |
| Downstream | PROPERTIES (blocked), IMPL (blocked) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1..9}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |
| Author | te-author |
| Date | 2026-08-29 |
| Edition | **2** — supersedes the edition written for the v0.4 halt of the same phase; that halt's record is retained in §Iterations |

RESOLVED: no

## Phase

**PR** — PLAN authoring and review, specifically the **erratum round** that produced `PLAN` v0.8.
PLAN v0.7 carried an approving verdict from both reviewers with residual items, so the
`DEC-ERRROUTE-01` erratum channel opened a bounded, targeted-edit round. The round was additionally
subject to `DEC-ERR-03` re-grounding, because TSPEC moved twice underneath it (v0.9 → v1.0 → v1.1)
while both reviewers wrote against v1.0.

The phase halted at the **delta confirmation** gate. The confirmers were asked whether the routed
erratum set is now reflected in the document; both answered no. Non-approving: `pm-review`,
`te-review`. Classification: **ERRATUM-PROTOCOL**.

The halt is *not* review-loop exhaustion — `MAX_REVIEW_ROUNDS` was never reached — and *not* a
substantive disagreement about the plan's design. It is again a **delivery** failure: the round
landed two of its three routed items and left the third byte-unchanged.

**This is the second occurrence of exactly this shape in this phase, on this document.** The first
(PLAN v0.4, routed item `T-00a`/`T-12a`) is recorded in edition 1 of this file. Its Recommendation 3
— an engine gate that fails closed when a routed locus is byte-unchanged in the round's diff — was
never implemented. Four rounds later, the same channel dropped the same *kind* of item for the same
reason. That fact is the single most important input to §Best-Guess Root Cause, and it changes the
recommendation's status from "candidate" to "blocking".

## Iterations

**Nine rounds.** Three full review rounds, one re-review pair, four erratum delta confirmations and
one upstream-cascade confirmation. Verdicts are as recorded in the cross-review files on the branch.

| Round | PLAN version | Kind | product-manager | test-engineer |
|---|---|---|---|---|
| 1 | v0.1 | Full review | Approved with minor changes | Needs revision |
| 2 | v0.2 | Full review | Approved with minor changes | Needs revision |
| 3 | v0.3 | Full review | Approved with minor changes | **Approved with minor changes** |
| 4 | v0.4 | Erratum delta confirmation | **Needs revision** | **Needs revision** |
| 5 | v0.5 | Erratum delta confirmation | Needs revision | Needs revision |
| 6 | v0.6 | Erratum delta confirmation | Approved with minor changes | Needs revision |
| 7 | v0.7 | Erratum delta confirmation | Approved with minor changes | **Approved with minor changes** |
| 8 | v0.7 (bytes unchanged) | Upstream-cascade confirmation (TSPEC moved, PLAN did not) | **Needs revision** | **Needs revision** |
| 9 | v0.8 | Erratum delta confirmation | **Needs revision** — the halt | **Needs revision** — the halt |

Two things in this table matter more than the verdicts.

**Round 4 is the first edition's halt.** It failed on a routed item left byte-unchanged. Rounds 5–7
recovered from it and reached a second two-reviewer approval at v0.7. Round 9 then failed the same
way. The pipeline traversed the identical failure twice, five rounds apart, with the corrective
recommendation sitting written and unimplemented in this very file between the two.

**Round 8 is not a defect of the document.** PLAN's own bytes were byte-identical to the v0.7 both
reviewers had just approved; TSPEC moved (v0.9 → v1.0) and the cascade confirmation correctly
reported the document as stale against its upstream. That is the mechanism working. It is also what
loaded round 9 with a `DEC-ERR-03` re-grounding obligation *on top of* its three raised items — and
TSPEC moved again (v1.0 → v1.1) before v0.8 was written, so the round had to re-derive against an
upstream neither reviewer had read.

**What round 9 did land.** The round was not idle. It re-pinned the header to TSPEC v1.1 and
re-measured all four upstream digests; it corrected the census constants at five sites from
"production declaration in `orchestrate-dev.js`, partition six ∪ nine = fifteen" to TSPEC §7.3's
"test-file declarations of `decisionLedgerCensus.test.js`, partition six ∪ eight = fourteen"; it
removed T-18's constant-writing instruction; it deleted the verbatim §7.3 sentence TE had objected
to; and it dropped version labels from in-body citations. Routed items 2 and 3 landed in full. Only
routed item 1 did not.

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
