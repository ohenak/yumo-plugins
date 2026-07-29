# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md` (v2.1, Draft)
**Date:** 2026-07-28
**Iteration:** 3

**Scope (narrow verification):** This pass verifies the disposition of my own round-2 findings
(`CROSS-REVIEW-product-manager-PLAN-v2.md` — 2M/4L) against `PLAN` v2.1 (commit `924da12`) only. No
re-review at large, no new fronts outside the v2.0→v2.1 diff. Verified by reading the disposition
text in §0b, the sections it names, and `git diff 1db965f..924da12` on the PLAN file (`1db965f` =
the commit immediately before `924da12` to last touch this file). Cross-checked the F-01 control
against the live `pdlc/skills/orchestrate-queue/SKILL.md` (column-parsing rule, selection step 3d)
and the live `docs/_queue/QUEUE.md` (row 8's current `Depends-On: —`, row 4's existing
`pdlc-workflow-distribution` dependency).

## Disposition of v2 findings (verified, not accepted on assertion)

| v2 ID | Claimed | Verified |
|---|---|---|
| **F-01** (Medium) | Fixed — control moved to `Depends-On` | **Resolved.** §6.3's pending-queue paragraph, §7's PQ-1 row and §9's DoD checklist line all now state the same mechanism: L-06 adds `pdlc-workflow-distribution` to row 8's (`pdlc-review-loop-hardening`) `Depends-On` cell, a one-cell edit inside the `QUEUE.md` edit L-06 already makes. Confirmed against the shipped parser: `pdlc/skills/orchestrate-queue/SKILL.md` line 70 — "extra columns are ignored" — and the selection algorithm's step (d), the re-grounding gate, which re-diffs a queued REQ against HEAD when a declared `Depends-On` dependency merged after the REQ's authoring date, emitting `needs-human` on a stale claim. That gate reads `Depends-On`, not prose, so this control fires in the parser's actual path — the compensating control now lands where the mechanism review demanded. Row 4 (`pdlc-consolidation-agent`) already carries `pdlc-workflow-distribution` in `Depends-On` in the live `docs/_queue/QUEUE.md` — confirmed by direct read — so the claim that it needs no edit is correct. Row 8's cell is still `—` in the live file, which is exactly right: L-06 is a *future* landing-batch task in this PLAN, not something the PLAN document itself executes; the edit is correctly deferred to implementation, not made prematurely by the planning artifact. §9's DoD line no longer claims a `Notes` line is present — it asserts the `Depends-On` edit — so DoD cannot record an inert mitigation as discharged. |
| **F-02** (Medium) | Fixed — cumulative gate + resume/abort split | **Resolved.** §5's 14–21 gate now reads: "Each row's stated halt state, read cumulatively — the union of this row's own delta and every prior landing row's still-uncommitted delta back to L-02 — must match what `git status` actually shows before the batch closes; a row's delta in isolation is not what `git status` shows from batch 15 on." Every L-* row (L-02 through L-05) restates its halt state as "cumulative through this row," explicitly listing every prior row's still-open delta before adding its own, and "nothing else" is gone from all of them (confirmed by direct read of the L-02…L-05 table cells). §1's recovery text is split into two named modes — **Resume** (per-row, undoes only the halting row's delta, matching each row's own "Resume recovery" sentence) and **Abort the window** (the L-02→halting-row composite) — and the abort's `git clean` is pathspec-scoped: `git clean -fd -- .worktreeinclude pdlc/RELEASE-CHECKLIST.md`, replacing the repo-wide `-fd`. The operator recovery story is now coherent at every batch 14–21 halt point: at any row, "what `git status` shows" and "what the row says it shows" agree, and the two recovery modes are textually distinct and separately actionable. |
| **F-03** (Low) | Fixed by the same edit as TE F-01; §4.1 dedup | **Resolved.** T-02's row (§2 Phase 1) now enumerates D-1/D-2/D-3 explicitly alongside its AT list, so §6.3's table-header attribution ("asserted… by T-02") is no longer contradicted by §4.2's sole-ownership rule — confirmed by reading T-02's row text and the §6.3 header, both naming T-02 consistently. §4.1's duplicate rows for `pdlc/README.md, CLAUDE.md` and "the §6.3 dist/-path documents" are merged into one row with an explanatory parenthetical. Only one `pdlc/README.md, CLAUDE.md` row remains in §4.1. |
| **F-04** (Low) | Fixed — stale ledger-creation sentence deleted | **Resolved.** §3.1's "Where it is recorded" paragraph opens with "a tracked file" only, then proceeds directly to "**T-40 creates it** (batch 7…) and each property task appends… **T-50 (batch 13) appends its own fragment… then concatenates**" — the stale "created by the first property task to run in batch 12" sentence is gone. Matches T-40's row, §4.4 and §5's gate, all read directly. |
| **F-05** (Low) | Fixed — PL-04 gains a lifecycle disposition | **Resolved.** PL-04 now states the ledger "is **not** harvested or deleted by `harvest-learnings`… and is **deliberately retained** after Phase CR as the project's permanent falsification record." §7's obligations table gains a matching "Ledger lifecycle" row citing PL-04. Stated in both places as claimed, closing the ask that a future reader not have to infer disposition. |
| **F-06** (Low) | Fixed — do-not-merge note corrected to L-09 | **Resolved.** The note now reads "**Do not merge from batch 3 until L-09 has landed**," restates the `"red"`/`"green"` sequence per batch band correctly (red 3–6, green 7–18 pre-commit, red 19–20, green 21), and leads with the real hazard — the stale-version-under-new-bytes condition becomes **undetectable**, not loudly red, once committed — matching AC-6.6's accepted residual and `RELEASE-CHECKLIST.md` row 2. This is a stronger fix than what I asked for: it also folds in TE F-04's correction of the hazard's *mechanism*, and both corrections are consistent with each other and with §10.3's branch (a). |

## Findings

No High, Medium, or Low findings against the v2.0→v2.1 diff. Diff-cleanliness check: `git diff
1db965f..924da12 -- docs/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md` touches
exactly: the header table (Cross-Reviews list, version bump 2.0→2.1 — bookkeeping); the new §0b
revision-note section (bookkeeping, itself the disposition record); §1's recovery-mode split (F-02);
T-02's row gaining the D-1/D-2/D-3 clause (TE F-01, which PM F-03 folds into); §3.1's ledger-creation
sentence (F-04); §4.1's manifest dedup (F-03) and its `dist/**` row's TE F-04 wording (out of PM
scope, unchanged in substance); §4.4's T-50 fragment row (TE F-03(b), not a PM finding, present
because it shares the T-50 table cell TE's fix touches); §5's landing-gate wording, the L-02…L-05
halt-state/recovery cells, and the do-not-merge note (F-02, F-06); §6.3's table-header note and the
D-1/D-3 oracle wording (TE F-02, not a PM finding, co-located in a table PM's F-01/F-03 also edit)
and the pending-queue-REQ paragraph (F-01); §7's PQ-1 row and new Ledger-lifecycle row (F-01, F-05);
§7.1's PL-03 (TE F-05, not a PM finding) and PL-04 (F-05); §8's Phase-CR batch 14–22 row (derived
restatement of F-01/F-02, not new content); §9's DoD checklist lines (F-01, F-04). Every hunk in the
diff traces to one of the twelve reviewer-qualified dispositions in §0b (six PM, six TE) or to the
version/note bookkeeping that records them. No unrelated edit, no silent scope creep, no untouched
finding.

## Questions

None outstanding. v2's Q-01/Q-02/Q-03/Q-04 were already answered and accepted at v2; nothing in the
v2.1 diff reopens them.

## Positive Observations

- **PO-1 — F-01's fix does more than restate the ask; it reuses an existing mechanism rather than
  inventing a new field.** Routing the mitigation through `Depends-On` means the compensating
  control rides an already-shipped, already-tested gate (`orchestrate-queue`'s re-grounding step)
  instead of adding new parser behavior this feature would then have to justify and test. That is
  the minimal-surface-area fix, not merely a working one.
- **PO-2 — F-02's fix closes the gap at the level of principle, not casework.** Rather than patching
  each L-row's wording ad hoc, §1's mode split (resume vs. abort-the-window) gives every future row
  a template to restate cumulatively, and the abort's pathspec-scoped `clean` generalizes correctly
  regardless of how many rows are added or reordered later.
- **PO-3 — the diff is honest about which findings are whose.** §0b tags every disposition with its
  originating reviewer and finding id, including the two PM/TE folds (F-03/TE-F-01, TE-F-03(a)/F-04),
  so a reader auditing this revision does not have to guess which reviewer asked for which edit.

## Recommendation

**Approved**

All six PM findings from v2 (2 Medium, 4 Low) are resolved and independently verified against the
live document, the live queue file, and the live `orchestrate-queue` SKILL.md. The diff is clean —
every changed hunk traces to a disclosed disposition or its accompanying bookkeeping. No new finding
is raised in this narrow verification pass.

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
