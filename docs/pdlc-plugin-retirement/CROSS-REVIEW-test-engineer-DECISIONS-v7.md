# Cross-Review: test-engineer — DECISIONS (delta confirmation)

**Reviewer:** test-engineer, DECISIONS v0.5, 2026-08-18, iteration 7
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.5, commits `2754279a`, `c2baaa4c`)
**Delta reviewed:** `git diff 822352f8..HEAD -- docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 7 (delta confirmation)

## Delta Confirmation

Iteration 6 filed one High (F-01) and five Medium/Low findings (F-02…F-07) against DECISIONS v0.4's stale DEC-10 framing. This round's diff shows a two-commit response (`2754279a`, `c2baaa4c`) that lands every routed item:

- **F-01 (High, resolved).** DEC-10's heading, Context, Options A/B/C, and Price paragraph are rewritten in place. Option C ("accept the capability loss, ship, bind the machinery-backed pass to a named successor") is now the chosen option, explicitly per REQ O-8; Option A is retained as a discharged historical record ("the original decision, since discharged … per this document's own re-evaluation trigger 2a, that supersedes Option A"). The two-part `SKILL.md` edit is stated correctly — bundle reference **deleted, not rewritten**, delegation-contract prose restated — matching FSPEC class 11 (`FSPEC-pdlc-plugin-retirement.md:163`) and TSPEC's `RLH-SKILL-10` (`TSPEC-pdlc-plugin-retirement.md:757`, confirmed present). The Decision-table DEC-10 row now cites `RLH-SKILL-10` as owning oracle for the SKILL.md edit and PLAN's batch-DAG check for the class-7/class-11 same-commit edge, replacing the stale "None yet" cell.
- **F-02 (Medium, resolved).** DEC-01's and DEC-02's owning-oracle cells (Decision table) now read "held transitively by class 6's erratum-6 gate (DEC-07), not by DEC-10," replacing the retired "DEC-10's erratum-3 gate holds it red" language.
- **F-03 (Medium, resolved).** The downstream-obligations paragraph (Consequences, PLAN-obligations section) now instructs PLAN to carry two distinct edges: DEC-07's block (class 6 on erratum 6, transitively holding 7–12 per FSPEC §3.1's held-classes note) and DEC-10's same-commit ordering edge (class 7 + class 11, REQ C-7/TSPEC T-5) — correctly naming the class-6/erratum-6 gate as the live blocker instead of the discharged erratum-3 gate, and correctly scoping DEC-10's edge down to an ordering-only obligation.
- **F-05 (Medium, resolved; inherited from v5 F-01).** The DEC-01 Decision-table cell and the "What a gated merge looks like" paragraph now both read "unsatisfied, not yet assertable," replacing "red." This matches FSPEC's held-classes note, which itself states the held class "leaves AC-1.1 unsatisfied on [the] unmerged branch … not [a] C-7 [red]" (`FSPEC-pdlc-plugin-retirement.md:170`–172).
- **F-04, F-06, F-07 (Low, acknowledged and deferred).** The v0.5 changelog entry explicitly names these three as "acknowledged but deferred — their cells are not otherwise touched this round," and the diff confirms DEC-08's ratification prose, the no-registration DEC-07/DEC-01 cross-cutting-rule-2 example, and the re-evaluation-triggers section are untouched. This is consistent with the approval rule: only the High finding mandated revision, and Low findings may legitimately roll forward without blocking approval.

I re-derived the FSPEC citations the rewritten DEC-10 price paragraph relies on directly against `FSPEC-pdlc-plugin-retirement.md`: class 7's ordering note ("After class 6, no surviving test asserts over [a] deleted bundle," `:159`) and the held-classes note ("classes 7–12 stay blocked transitively behind class 6's own hold [until] erratum 6 [is] disposed, [because] class 7 lands after class 6 [and] classes 8–12 chain off class 7," `:167`–170) both match the DECISIONS paraphrase. I also confirmed TSPEC v0.11's own changelog independently marks §6.1 erratum 3 "RESOLVED UPSTREAM" and restates §6.3 T-5 as the ordering obligation (`TSPEC-pdlc-plugin-retirement.md:21`–24), so DECISIONS v0.5 is not out ahead of its upstream — TSPEC already landed the same resolution.

No new defects were introduced by this round's edit: the rewritten DEC-10 price paragraph correctly scopes itself to the same-commit ordering edge only, the Decision-table and Consequences-table rows for DEC-10/DEC-01/DEC-02/DEC-07 are mutually consistent, and the re-evaluation-triggers section (2a) was left as-is, which is correct since trigger 2a's own text already anticipated exactly this disposition and does not need re-editing now that it has fired.

## Findings

None.

## Questions

None outstanding — Q-01 and Q-02 from v6 are answered by this round: Q-01 (DEC-10 rewritten in place vs. retired-with-forwarding-note) is resolved in favor of in-place rewrite, consistent with DEC-06/DEC-07's established convention; Q-02 (erratum 6 / class 6 still open) remains correctly reflected as still-open in this round's text and is not conflated with the now-resolved erratum 3.

## Positive Observations

- The rewrite is scoped precisely to what trigger 2a's firing required: DEC-10's own price paragraph, its Decision/Consequences table rows, and the two owning-oracle cells that cited "DEC-10's erratum-3 gate" — nothing else was touched, and nothing that needed touching was missed.
- The Price paragraph does the harder editorial work correctly: it distinguishes the ordering edge DEC-10 now owns (same-commit, C-7/T-5) from the transitive hold DEC-07 owns (class 6/erratum 6), rather than simply deleting the stale six-of-thirteen framing and leaving a gap. The Consequences-table DEC-07 row goes further and explains *why* the same six-of-thirteen count now reads under a different cause ("priced under DEC-10 while erratum 3 was undecided; … priced here now that erratum 3's disposition has landed").
- "Red" → "unsatisfied, not yet assertable" is applied consistently across every cell it appeared in (DEC-01 Decision-table cell and the gated-merge-looks-like paragraph), not just the one Cross-Review pointed at, avoiding a repeat of the phrase surviving in a sibling cell.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:579292fe88bbb0b3860ab609b228a9d5d3e7db20b8158b158e0b5de48a4a35bd
APPROVAL-HASH-NORMALIZED: sha256:b9666fca2144b94c9ed4ddb06b3fabe4a25311dc40c3a15a1d09124a6e834af7
REVIEWED-COMMIT: c2baaa4c84e5545313e03e8df22a0c55883ee277
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
UPSTREAM-STATE: FSPEC sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
UPSTREAM-STATE: TSPEC sha256:1554c7d0349ef5d4337c4e5e705bc0c4b867bd3cb46b5191f315d560b87c23b8
