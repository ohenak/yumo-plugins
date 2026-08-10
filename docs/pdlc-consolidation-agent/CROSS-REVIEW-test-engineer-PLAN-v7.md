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

| ID | Question |
|----|---------|
| Q-01 | T13 is now a task whose two production edits are **already at HEAD** (`runtimeBundle.test.js:230` and `:1057`, both confirmed). The row handles this well — it tells the implementer to assert both axes rather than re-add them — but it leaves one mechanical question unanswered for the wave gate: what does T13's commit *contain*? A task that finds its work done and commits nothing produces an empty pathspec-scoped commit, which `NOTHING_TO_COMMIT_RE` treatment absorbs quietly. If the intended answer is "the assertion is the existing `it.each(AWAIT_SCAN_SOURCES)` case and T13 verifies rather than writes", saying so in one clause makes the row's own definition of done checkable. No finding filed — this is a wave-execution detail, not a PLAN defect, and the row's substantive instruction (never drop the pairing) is the part that matters. |

## Positive Observations

- **The revision answered a question with a rule instead of a reconciliation, and that is
  the durable half.** v6 named two repairs; the revision took a third the review had not
  offered. Reconciling twenty-eight cells would have been correct for one commit and
  wrong again by the next wave — the finding would have returned every round for the rest
  of Phase I. Declaring the column a Phase-P baseline removes the finding's *source*.
  This is the difference between fixing an instance and closing a class, and the document
  now states which one it did.
- **The rule is grounded twice over, and the grounding survives falsification.** §2 does
  not assert "nothing reads this" — it names `parsePlanTasks` (`:3761`), quotes the
  "LOOSE … cosmetic" ruling (`:3764`), pins the exact-match header sets (`:3797-3798`)
  and names the thing that *does* own resume (`WAVE_STATE_PATH` `:8860`,
  `parseWaveLedger` `:8916`). Every one of those five citations resolves. I then tried to
  break the claim from the angle the citations do not cover — could a loose predicate
  swallow the `Status` column by accident? — and `isDescCell` (`:3767`) and `isBatchCell`
  (`:3773`) match neither the word nor any substring of it. The claim is true for a
  stronger reason than the one given.
- **§2 names the failure mode it closes, in the reader's terms.** "A uniformly `⬚` column
  honestly reports *no ledger is kept here*, whereas a column with some rows filled
  invites the reader to conclude the unfilled rows are untouched." That is precisely the
  inverted-cost observation v6 filed, restated as the document's own reasoning. A rule
  that carries its rationale survives the next person who thinks the column looks stale.
- **T13's rewrite replaced an assumption with a measurement and kept the obligation.**
  The easy revision here was to delete T13 as already done. Instead the row records both
  halves at HEAD with exact line citations, states that the `⬚` says nothing about HEAD
  (closing the loop with §2 rather than leaving two paragraphs in tension), and keeps the
  pairing obligation with its reason: "a task that finds one half done and quietly drops
  the pairing is how the half-widened state — the exact state this row exists to prevent
  — becomes permanent." That is the correct instinct for a guard task. Both cited lines
  verified through `git show HEAD:`, and the third `AWAIT_SCAN_SOURCES` member is live in
  the `it.each` at `:1072`, so the widening is not decorative.
- **The revision falsified its own null result instead of assuming it.** A `Status`-only
  diff "must" leave the graph alone — but a mis-shaped cell is exactly the edit that
  shifts a column count under the parser while looking harmless, and the header re-ran
  the gate rather than reasoning about it. My independent re-run returns the same six
  numbers (34 / 34 / `{"ok":true}` / 15 / 15 / 0), so the header's arithmetic is real.

## Recommendation

## Verdict
