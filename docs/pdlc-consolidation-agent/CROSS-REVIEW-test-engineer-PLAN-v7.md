# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 7
**Scope:** Local

## Method

Delta re-review. `git diff 6a5d6aa0..HEAD` over the PLAN returns v1.6 and exactly four
hunks: the version-header block, §2's new `Status`-column rule paragraph, and four task
rows — T03, T13, T17, T27. Of those, three are single-cell `Status` reverts
(`🔴 → ⬚`, `🔴 → ⬚`, `✅ → ⬚`) and one, T13, is a prose rewrite. No `Deps`, `Batch`,
`Task`, `Files` cell moved; no §5 manifest row moved; no §6 text moved.

Every claim the revision leans on was re-derived rather than read. Gate imported from
`pdlc/workflows/orchestrate-dev.js` at HEAD and run over the revised text:
`parsePlanTasks` → **34** tasks, `errors: []`; `parsePlanOwnership` → **34** ownership
rows; `validatePlanContract` → `{"ok":true}`; `computeTopologicalBatches` → **15**
ready-sets; `computeWaves` → **15** waves; `max(batch of Deps) + 1` re-derived and
compared to each declared `Batch` cell → **0** mismatches; same-batch same-file
collisions over the ownership manifest → **0**. Every number identical to v1.4's and
v1.5's, which is what a `Status`-only diff must return.

§2's grounding claims were checked at source, not accepted: `parsePlanTasks` is at
`orchestrate-dev.js:3761`; the "LOOSE … cosmetic" comment governing the description and
batch columns is at `:3764-3766`; `idIdx` / `depsIdx` resolve through
`PLAN_ID_HEADER_CELLS` / `PLAN_DEPS_HEADER_CELLS` at `:3797-3798`; `WAVE_STATE_PATH` is
at `:8860` and `parseWaveLedger` at `:8916`. I additionally falsified the stronger claim
("no parser, gate or dispatcher reads a `Status` cell at all") rather than trusting it:
the only two loose column predicates are `isDescCell` (`:3767`, matching
`desc|task|summary|name|title`) and `isBatchCell` (`:3773`, matching `batch|phase|wave`).
The literal `status` matches neither, so a `Status` column cannot even be mistaken for
the description or batch column. The claim holds as stated.

T13's two measurements were re-taken through `git show HEAD:` exactly as the row says
they were: `runtimeBundle.test.js:230` reads `"_envPresent", "_makeTempDir",` inside the
frozen `AT19_SEAM_NAMES` (`:219`), and `:1057` reads
`const AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js", "consolidate-learnings.js"];`.
Both halves are present, both are load-bearing (the `it.each(AWAIT_SCAN_SOURCES)` case at
`:1072` runs the scan over the third member), so the row's rewrite is accurate.

## Prior findings

| ID (v6) | Disposition |
|---|---|
| F-01 (Medium, Process) — the `Status` column was half-reconciled: three rows carried a live cell while twenty-eight rows read `⬚` over work committed on the branch | **Closed, verified, and closed the better way.** v6 offered two repairs and named a third as unavailable; the revision took neither of the two but stated a **rule** instead, which is strictly better than either — a reconciliation would have drifted again by the next wave. §2 `:189-204` now declares the column a Phase-P baseline owned by nobody during Phase I, and §4's out-of-band cells are reverted. Measured: all **34** task rows in §4.1 and §4.2 now carry `⬚`, zero rows carry any other value. The rule's two grounds were falsified independently, not read (see *Method*): no column predicate can reach a `Status` cell, and `WAVE_STATE_PATH` (`:8860`) already owns resume. The v6 question — "is this a live ledger or not?" — is answered in the document rather than in a review thread, which is where the answer had to live to stay answered. |
| F-02 (Low, Local) — T17's cell read `🔴` while `consolidationEffectiveness.test.js` was green at HEAD | **Closed, verified.** T17's cell now reads `⬚` (`:355`), and under the new rule it makes no claim about HEAD at all, so it cannot be false. This is the class of finding the rule dissolves rather than fixes: a baseline cell has no truth value to lose. |
| Q-01 — is the column a live ledger, and if not should the filled cells come back out? | **Answered, in the document.** §2's rule answers it and the four reverts enact the answer. |
| Q-02 — header round numbering (v1.5's "Round 4's findings" against `…-PLAN-v5.md`) | **Answered by convention.** v1.6's header says "Round 5's two open items" against `…-PLAN-v6.md`, i.e. headers number the *revision's* round as one behind the cross-review filename. Consistent with v1.5; no finding. |

Both v6 findings are closed. Neither closure introduced a graph, ownership or batch
change — re-measured above, every gate number is identical to v1.4's.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The v1.6 header miscounts its own diff: it reverts three cells, not four, and names a fourth row that was already `⬚`.** The header's headline reads "four cells reverted" and its body says "T03 and T17 read `🔴` **and T27 and T28 read `✅`**". Measured at the base commit this revision was cut from: `git show 6a5d6aa0:…PLAN….md` carries exactly **three** non-`⬚` cells — T03 `🔴`, T17 `🔴`, T27 `✅` — and **T28 already read `⬚`**. The `git diff 6a5d6aa0..HEAD` confirms it from the other side: it touches four task rows, of which one (T13) is a prose rewrite and only three are `Status` reverts; T28's row appears in the diff as unchanged context. This is not a design or graph defect — every gate number is unmoved and no runtime reads the column — but it is a **false measurement claim inside the block whose entire job is to record measurements**, and it is the one paragraph a later harvest or post-mortem reads to reconstruct what round 6 changed. It also happens to be exactly the failure mode §2's new rule exists to prevent, one level up: a hand-maintained count of hand-maintained cells. The fix is two edits — "three cells" in the headline, and drop `T28` from the enumeration — and the falsifier is the command above. | Version header block, `:12-13` (headline and enumeration) |
| F-02 | Low | Local | **§2's status key still enumerates five values the rule two paragraphs below forbids any row from carrying.** `:187` reads "**Status key.** ⬚ Not Started \| 🔴 Red \| 🟢 Green \| 🔵 Refactored \| ✅ Done", and `:189` then states the column is authored once, uniformly `⬚`, and is never reconciled. A key defining four values that may never legally appear is an open invitation to fill one in — the reader who wants to mark T25 green now finds both the permission and the glyph on the same screen as the prohibition. Not gating, and the key does carry residual value (the `🔴` / `🟢` glyphs are used *inside* task descriptions to label RED and GREEN tasks, which is a different axis from the column). But the two uses want distinguishing: either scope the key explicitly to the description prefix — "these glyphs label a task's TDD role in the description; the `Status` column carries only `⬚`" — or drop the key's non-`⬚` members. As it stands the rule's enforcement rests entirely on a reader having read `:189-204` before reaching for `:187`. | §2 status key `:187` against the rule at `:189-204` |

Neither finding is High. Both are prose-level and neither touches the DAG, the ownership
manifest, the un-skip chain or a single oracle. Applying the *review-oracle* standard to
this revision's own claims: the §2 rule is stated with positive grounding (two named
symbols at exact lines, both re-derived), not as an absence claim ("nothing seems to read
it"), and I falsified the absence half myself through the column predicates rather than
accepting it — which is what the finding table would have demanded of a test.

## Questions

## Positive Observations

## Recommendation

## Verdict
