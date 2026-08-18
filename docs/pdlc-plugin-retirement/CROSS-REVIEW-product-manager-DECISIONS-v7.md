# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 7 (delta confirmation)
**Scope:** Delta confirmation — does the round-6 response resolve F-01/F-02 without introducing new issues? Product lens only.

## Context

v6 (`CROSS-REVIEW-product-manager-DECISIONS-v6.md`, verdict *Needs revision*) filed:

- **F-01 (High):** DEC-10 still framed classes 7/11 as blocked on an undecided upstream question after REQ O-8 (v0.14/v0.15) had already answered it and landed a disposition.
- **F-02 (Medium):** DEC-10's "Price of A" paragraph quoted FSPEC's class-10 ordering cell with wording FSPEC no longer carries (FSPEC class 10 rewritten to "Prose only" by erratum 5).

se-author landed DECISIONS v0.5 across commits `2754279a`/`c2baaa4c`. `git diff 822352f8..HEAD -- docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` shows 62 insertions / 33 deletions confined to §DEC-10 (Context, Option A/B/C, "What C actually costs"), the DEC-01/DEC-02 Decision-table rows, the DEC-10 Decision-table row, the DEC-10 Consequences-table row, and the "Downstream obligations" closing paragraph.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **Re-evaluation trigger 2a's own prose was not updated and now contradicts the rewritten DEC-10 body.** Trigger 2a (line 282) still reads: "Erratum 3 lands a disposition for `consolidate-learnings`'s execution host — DEC-10's block on classes 7 and 11 lifts, and the option the disposition chooses … supersedes DEC-10 entirely." DEC-10's body, Decision-table row, Consequences-table row, and Downstream-obligations paragraph have all been rewritten this round to drop the word "block" in favor of a same-commit ordering edge (REQ C-7 / TSPEC T-5) — but trigger 2a still describes DEC-10 as carrying a "block" that "lifts" when the disposition lands, and still frames the disposition as a future/pending event ("Erratum 3 lands a disposition") even though REQ O-8 (v0.14/v0.15) already landed it and DEC-10 has already been rewritten to match. v6's F-01 fix instruction named "trigger 2a's own text" alongside the Decision-table, Consequences-table, and Downstream-obligations paragraph as needing to carry the "same-commit ordering edge, not open block pending disposition" framing; the Decision-table, Consequences-table, and Downstream-obligations paragraph were corrected, but trigger 2a's text was left unlanded. A reader consulting the trigger list in isolation (its usual purpose — deciding whether a still-open condition warrants re-evaluation) would conclude DEC-10 still describes an open block, which is no longer true. Fix: reword trigger 2a to describe what already happened (disposition landed, Option C chosen, DEC-10 rewritten to the same-commit ordering edge) rather than a still-pending lift condition — or, if the trigger is being kept as a discharged/historical entry, mark it explicitly as fired/discharged so it reads consistently with the rest of the document. | DEC-10; DECISIONS "Re-evaluation triggers" §2a |

## Questions

None.

## Positive Observations

- **F-01's substantive fix is correctly and thoroughly landed.** DEC-10's Option A is now explicitly marked "(original decision, discharged)"; Option C is now the chosen option, grounded in REQ O-8's landed disposition (accept capability loss, bind named successor `pdlc-consolidation-rehost`, `docs/_queue/QUEUE.md` Order 24, `ready: false`); the "What C actually costs" paragraph correctly reframes classes 7/11 as a same-commit ordering edge (REQ C-7 / TSPEC T-5) rather than an external block; the Decision-table row, Consequences-table row, and closing "Downstream obligations" paragraph all consistently distinguish DEC-07's still-genuinely-open erratum-6 block (class 6, transitively 7–12) from DEC-10's already-decided same-commit ordering edge (class 7 + class 11) — directly answering v6's Q-01.
- **F-02 is fully resolved.** The stale FSPEC `:162` quote ("the retired value names deleted output") no longer appears anywhere in the document; DEC-08's citation of FSPEC class 10 now correctly reflects the erratum-5 rewrite ("Prose only", `FSPEC:162`), and DEC-10's own paragraph no longer duplicates or misquotes it.
- **DEC-01/DEC-02's owning-oracle cells were correctly re-attributed.** Both rows now name DEC-07's erratum-6 gate as the operative transitive block on class 7 (and hence classes 8–12), rather than the retired "DEC-10's erratum-3 gate" framing v6 flagged — this is exactly the fix v6's F-01/F-05 (TE) asked for and it lands cleanly in both rows.
- **`RLH-SKILL-10` is correctly introduced as the new owning oracle** for the two-part `SKILL.md` edit, with the PLAN's batch-DAG check separately named as the owner of the class-7/class-11 same-commit `Deps` edge — a clean split between assertion-owned and graph-owned obligations.

## Recommendation

**Approved with minor changes.** Both routed findings from v6 (F-01, F-02) are substantively resolved in the document body, tables, and downstream-obligations paragraph — the product-facing framing of DEC-10 now correctly reflects REQ O-8's landed disposition. One residual Medium: re-evaluation trigger 2a's own prose was not updated in this pass and still describes DEC-10 as carrying an open "block" pending a "lift" — stale relative to the rewritten DEC-10 it refers to. This is a documentation-consistency gap, not a re-opening of the product decision itself, so it does not block approval; it should be picked up in the next revision pass.

No contradiction found with `docs/_constraints/DOMAIN-CONSTRAINTS.md` or a promoted decision in `docs/_decisions/`.

FINDING: Medium | delta | nonlocal | DECISIONS "Re-evaluation triggers" §2a | Trigger 2a still describes DEC-10 as carrying a block that "lifts" when erratum 3's disposition lands, and frames that disposition as still-pending; DEC-10's body/Decision-table/Consequences-table/Downstream-obligations paragraph were all rewritten this round to drop the block framing and record the disposition as landed (REQ O-8), but trigger 2a's own text — named in v6's F-01 fix alongside those other sections — was left untouched.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

APPROVAL-HASH: sha256:579292fe88bbb0b3860ab609b228a9d5d3e7db20b8158b158e0b5de48a4a35bd
APPROVAL-HASH-NORMALIZED: sha256:b9666fca2144b94c9ed4ddb06b3fabe4a25311dc40c3a15a1d09124a6e834af7
REVIEWED-COMMIT: c2baaa4c84e5545313e03e8df22a0c55883ee277
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
UPSTREAM-STATE: FSPEC sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
UPSTREAM-STATE: TSPEC sha256:1554c7d0349ef5d4337c4e5e705bc0c4b867bd3cb46b5191f315d560b87c23b8
