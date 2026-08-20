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

## Reviewers

| Channel | Verdict | Self-declared tags | Parseable `FINDING:` lines | Gate contribution |
|---|---|---|---|---|
| se-review (`CROSS-REVIEW-software-engineer-FSPEC-v9.md`) | Needs revision — `{"high":1,"medium":0,"low":2}` | F-01 `inherited` `nonlocal` High; F-02, F-03 `inherited` `nonlocal` Low | **0** | Synthetic `High \| delta \| nonlocal \| (untagged confirmation)` |
| te-review (`CROSS-REVIEW-test-engineer-FSPEC-v9.md`) | Needs revision — `{"high":2,"medium":0,"low":1}` | F-01, F-02 High, stated in prose as **inherited** and **nonlocal**; F-03 Low | **0** | Synthetic `High \| delta \| nonlocal \| (untagged confirmation)` |

Both reviewers wrote complete, tagged findings — as a markdown findings table whose `Scope` column
reads `Local`, with the real provenance/locality tags rendered as inline code *inside* the
finding-text cell (se-review: `` `inherited` `nonlocal` — BR-9, BR-10 and AT-20/21/22 still specify a
run-level locus… ``; te-review: a prose paragraph under the table, "Both High findings are
**inherited** and **nonlocal**"). That is semantically complete and mechanically invisible:
`parseConfirmationFindings` scans for line-leading `FINDING:` and splits on the first four pipes; it
does not read table cells, and neither reviewer's `Scope` column value (`Local`, `Process`) is even
one of the two axes the grammar wants.

## Pattern of Disagreement

**None on substance, on either axis.** Both confirmers independently reached the same disposition and
the same two defects, from opposite lenses:

| Question | se-review | te-review | Agreement |
|---|---|---|---|
| Did the routed ERR-4 item land? | Yes — TSPEC-scoped, FSPEC needed no behavioural change; verified Step 0(2), D-1, BR-14 against REQ v0.9 AC-5.1a | Yes — same, plus `grep`-verified that `§I.2/§I.4/§OQ.2` do not exist in this FSPEC and that `parseAdvisoryConfig`/`parseMergeConfig`/`parseImplementationConfig` all exist in `orchestrate-dev.js` | Identical |
| Did the delta break anything approved? | No — delta confined to header rows and the erratum note | No — same | Identical |
| BR-9 / corpus-level outcome locus | F-01 (High): "recorded once per run" contradicts REQ AC-3.2's per-authoring-dispatch locus and its "additive, is not the oracle" mirror | F-01 (High): same, plus AT-20 satisfiable by a single run-level field | Same defect, same severity |
| BR-10 / rule-input record | F-01 (folded): one run-level record with one completeness test vs REQ AC-3.3's two loci and two completeness tests | F-02 (High): same, and names AT-22 as a **false green** against a report that cannot reproduce a second dispatch's selection | Same defect, same severity |
| Header Cross-Reviews row three rounds stale | F-02 (Low) | F-03 (Low) | Identical |
| Provenance / locality of the Highs | `inherited`, `nonlocal` — "I missed it in earlier rounds rather than the ground moving underneath" | `inherited`, `nonlocal` — drift dates to REQ v0.7 (`c1180acb`) and v0.8 (`386e4f0c`) | Identical, with independent dating |

There is no reviewer-vs-reviewer disagreement to adjudicate. There are two other disagreements, and
both are with the machinery:

1. **Reviewer vs parser.** Both reviewers declared tags; neither declared them where the parser
   reads. The fail-closed rule then overwrote both declarations with their opposite (`inherited` →
   `delta`).
2. **Reviewer vs gate semantics.** te-review states "they are still gating: the rigour bar is any
   open High, old or new, anywhere in the document." The engine disagrees: `erratumGateDecision`
   filters `highDelta = severity High && provenance delta`, so an `inherited` High is **not** gating
   on the erratum channel — it routes to R2, which re-opens the owning phase's approval and lets the
   pipeline move forward. The reviewers reasoned about the outcome they wanted (a revision) and
   assumed the tags were annotation rather than parser input.
