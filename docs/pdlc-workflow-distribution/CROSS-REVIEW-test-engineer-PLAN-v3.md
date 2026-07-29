# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md` (v2.1, Draft)
**Date:** 2026-07-28
**Iteration:** 3 (scoped verification)

**Scope:** Narrow verification only, per orchestrator instruction. This review verifies the
disposition of `CROSS-REVIEW-test-engineer-PLAN-v2.md`'s findings (1 Medium + 5 Lows) against the
v2.1 diff (commit `924da12`), the batch-column mechanics, and diff-cleanliness. It does **not**
re-review the PLAN at large and raises no new findings outside that diff. Upstream
REQ/FSPEC/TSPEC/PROPERTIES are approved and out of scope.

## Disposition of v2 findings (verified at the site)

| v2 ID | Verdict | Evidence |
|---|---|---|
| **F-01** (Medium — D-1/D-2/D-3 oracle ownership) | **Resolved.** | T-02's row (§2 Phase 1) now enumerates "**and §6.3's D-1, D-2 and D-3 oracles** (v2.1, TE F-01 — this row is the one the dispatcher hands `se-implement`, so the three cases live here, not only in §6.3's table)" — the oracles are stated in the row itself, not by cross-reference. §2 Phase 7's preamble is rewritten from "four assertions" to "**five** assertions" and names "**§6.3's D-1/D-2/D-3 oracles**" as a fifth L-06-owned expected-red class grouped with AT-22, with the parenthetical confirming these are "red from batch 2, once T-02 authors them, until L-06." §5's 14–21 gate row and §9's DoD checkbox are both updated to match ("L-06: AT-22 **and** §6.3's D-1/D-2/D-3 oracles"; "asserted by **T-02**"). All four sites (T-02 row, Phase 7 preamble, §5 gate, §9 DoD) now agree — the dispatcher-proofing is real, not partial. |
| **F-02** (Low — D-1/D-3 semantic negatives) | **Resolved.** | D-1's negative conjunct is now "**no line in the section matches both `build-runtime` and `.claude/workflows/`**" — a co-occurrence predicate a `grep`/regex can evaluate, and the parenthetical explicitly resolves the contradiction I flagged (the section is still allowed to contain the bare string `.claude/workflows/` in the untracked-consumer-copy sentence; the check is co-occurrence, not bare-string-absence). D-3 is now "**no line in `pdlc/README.md` matches `.claude/workflows/` followed by `bundle`**" — also mechanically greppable. Both are implementable without inventing a predicate. |
| **F-03(a)** (Low — stale §3.1 sentence) | **Resolved.** | The rejected-mechanism sentence ("a tracked file created by the **first** property task to run in batch 12 and appended to by each subsequent one") is deleted. §3.1 now opens directly with "a tracked file," followed by the T-40-creates / per-task-fragment / T-50-concatenates design, with an inline note citing the deletion (v2.1, PM F-04 / TE F-03(a)). No incompatible-mechanism sentence remains. |
| **F-03(b)** (Low — T-50's own ledger fragment) | **Resolved.** | T-50's task row now reads "**Writes its own `docs/…/FALSIFICATION-LEDGER-T-50.md` fragment for these three properties**… **then concatenates** every fragment (T-41…T-49 **and its own T-50**)…" §4.4's ledger-ownership table gains the row `docs/…/FALSIFICATION-LEDGER-T-50.md` (T-50's own fragment, its three queue-side properties) | `T-50→13`, and the concatenation row is corrected to "all **ten** fragments deleted" (was nine). Both the row-level assignment and the table entry are present and consistent. |
| **F-03(c)** (Low — unbounded residual count; explicitly a soft ask, "not moving the goalpost") | **Not addressed — correctly left open.** | No ceiling on the number of properties filed as residuals, and no DoD line requiring the residual list be surfaced for explicit accept, was added; §3.1's fallback paragraph and §9's DoD checklist are unchanged on this point. This was the one sub-finding I explicitly framed as optional rather than a required fix, and it is the only one of the nine round-2 Lows not dispositioned in the v2.1 revision note (which lists PM F-03/04/05/06 and TE F-02/F-03(a)/F-03(b)/F-04/F-05 — nine entries, none labelled F-03(c)). Consistent with how it was raised; not a defect in the response, and not reopened here. |
| **F-04** (Low — merge-note hazard mis-stated) | **Resolved.** | The merge note now reads: "The hazard is **not** that the oracle is loudly red throughout — for most of that span it is not. The hazard is that once any of those working-tree states is **committed**, the stale-version-under-new-`dist/`-bytes condition becomes **undetectable** by this oracle" — matching AC-6.6's accepted residual and `RELEASE-CHECKLIST.md` row 2. The pre-commit/post-commit read (red 3–6, green 7–18 pre-commit, red 19–20, green 21) is stated correctly and traces to TSPEC §10.3 branch (a) as I derived it. The merge gate itself is correctly tightened from "after L-05" to "after L-09's landing commit" (batch 22), since L-05 (batch 21) commits nothing under defer-commit — a stronger, correct conclusion than v2.0's. Phase 7's preamble carries the same corrected framing. |
| **F-05** (Low — PL-03 under-declares seven suites) | **Resolved.** | PL-03 now states T-39's probe work "also inserts PLAN-authored `it()` blocks into **seven** TSPEC-owned suites — `driftRepoRoot.test.js`, `driftBaseline.test.js`, `driftClassify.test.js`, `driftSync.test.js`, `driftFault.test.js`, `driftBackups.test.js`, and the layer-5 reuse in `driftMessages.test.js`", declared on the same PL-02 precedent, so a Phase-CR reviewer will not mistake a probe case for a TSPEC-mandated `it()` and §8's batch-5 check is not misread as exhaustive. All seven suites named match the set I raised. |
| **F-06** (Low — cosmetic: split gate table, set-equality attribution) | **Out of round-2 disposition scope, not reopened.** | F-06 was two cosmetic nits (a stray blank line splitting §5's gate table; a set-equality attribution nuance in §9) that I did not mark as requiring a fix in my v2 recommendation ("F-02's mechanical restatement… and F-03(a)'s stale-sentence deletion are the two worth doing carefully" — F-06 was not named). It is absent from the v2.1 revision note's nine-item Low list, consistent with not having been asked for. Spot-checked: the §5 gate table in the current file reads as one continuous table at the site I flagged — the blank-line split, if still present, is a non-blocking cosmetic residue I am not re-raising at this iteration (out of the scoped disposition set). |

## Mechanical re-checks (batch column, task count, diff cleanliness)

- **Task count / batch count.** Re-derived independently via a mechanical line scan (not trusting
  the revision note's claim): **61** task rows total — `P0-00` ×1, `T-01`…`T-50` ×51 (`T-08` split
  a/b counted once each), `L-01`…`L-09` ×9. Matches the revision note's "still 61 tasks / 22
  batches" and my own v2 count.
- **Spot-checked `batch == max(dep batch) + 1` on every row touched by this diff:** T-02 (batch 2,
  dep `P0-00`→1, 1+1=2 ✓); T-50 (batch 13, deps `T-38`→12, `T-40`→7, `T-41`…`T-49`→12, max=12,
  12+1=13 ✓); the L-02→L-05 chain (14→15→16→17→18→19→20→21, each row's `Deps` column names exactly
  the previous row, strictly incrementing by 1 — the v2.0 Phase-7 permutation this diff layers
  *cumulative halt-state prose* on top of is otherwise untouched). No batch-column edit was made by
  this diff at all — v2.1 only added prose (halt-state cumulation, oracle ownership, ledger
  ownership) to existing rows; the `Batch`/`Deps` columns themselves are byte-identical to v2.0
  wherever I diffed them. No rows were added or removed.
- **Diff-cleanliness.** Read the full `924da12` diff hunk-by-hunk. Every hunk maps to a named
  finding: header/cross-review-list bump, the new §0b disposition section, T-02's row (TE F-01),
  §1's two-mode recovery split + every L-* row's cumulative halt-state restatement (PM F-02), §3.1's
  deletion (PM F-04/TE F-03(a)) and T-50 fragment note (TE F-03(b)), §4.1's manifest-row merge (PM
  F-03), §4.4's ledger table row (TE F-03(b)), §5's 14–21 gate wording and merge note (PM F-02, TE
  F-04), §6.3's two oracle rows and header caption (TE F-01, TE F-02), the QUEUE.md `Depends-On`
  disposition replacing the `Notes`-line design (PM F-01), §7's PQ-1 row and the new "Ledger
  lifecycle" deliverable-inventory row (PM F-01, PM F-05), PL-03's seven-suite declaration (TE
  F-05), PL-04's lifecycle disposition (PM F-05), §8's 14–22 Phase-CR row (PM F-01, TE F-01), and
  §9's two DoD checklist lines (TE F-01, PM F-01). I found no hunk that introduces content outside
  the 12 round-2 findings (3 Mediums: PM F-01, PM F-02, TE F-01; 9 Lows: PM F-03, PM F-04, PM F-05,
  PM F-06, TE F-02, TE F-03(a), TE F-03(b), TE F-04, TE F-05) plus version/cross-review-list
  bookkeeping. No new task rows, no reordering beyond what v2.0 already established, no scope creep.

## Findings

No new findings. This is a scoped verification pass; findings outside the round-2 disposition set
are explicitly out of scope per the orchestrator's instruction and are not raised here (see F-03(c)
and F-06 dispositions above, both correctly left open as non-required).

## Questions

None outstanding from this reviewer's v2 review (Q-01, Q-02 were about batch-12 concurrent-mutation
serialization and red-observation scoping, neither of which this diff's scope — oracle ownership and
prose corrections — was expected to touch, and neither is reopened here).

## Positive Observations

- **The one required Medium (F-01) is fixed at the dispatcher-facing site, not just the reference
  site.** Adding D-1/D-2/D-3 to T-02's own row — rather than only strengthening §6.3's prose — is
  exactly the fix I asked for: the dispatcher hands `se-implement` the row, not the cross-referenced
  section, so this closes the actual failure mode (a silently-dropped obligation), not just the
  documentation gap.
- **F-04's correction is stronger than what I asked for.** I flagged the "red from batch 3 through
  batch 20" claim as imprecise; the fix not only corrects the claim but also tightens the merge gate
  itself from "after L-05" to "after L-09" — a substantively safer rule that follows directly from
  the corrected undetectability reasoning, not a cosmetic wording change.
- **F-03(c) was left open with the correct judgment call.** It was framed in my v2 review as a
  non-blocking suggestion ("not moving the goalpost"), and the revision note's own accounting (nine
  Lows dispositioned, matching exactly PM's four and eight of my five sub-items minus the one I
  didn't ask to be fixed) shows deliberate, honest scoping rather than an oversight.
- **All greppable-predicate rewrites (F-02) resolve their own edge case.** D-1's predicate correctly
  distinguishes the co-occurrence pattern from the bare string the edit itself introduces — this
  could easily have been gotten wrong (a naive absence check would have made the edit fail its own
  oracle), and the fix explicitly reasons through that trap.

## Recommendation

**Approved**

All disposition items in scope for this iteration are resolved: the one Medium (F-01) is fixed at
the correct site (T-02's row, not just §6.3), all five of my Lows are either resolved (F-02, F-03(a),
F-03(b), F-04, F-05) or correctly and consistently left open as non-required (F-03(c), F-06). The
batch column is unchanged and mechanically verified (61 tasks / 22 batches, spot-checked
`batch == max(dep)+1` on every row this diff touches). The diff is clean — every hunk in commit
`924da12` maps to one of the 12 round-2 dispositions or version/cross-review bookkeeping; no new
task rows, no unrelated restructuring, no scope creep.

---

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
