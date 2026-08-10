# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 7

**Scope:** delta re-review of the v1.5 → v1.6 diff against v6's findings. Baseline `6a5d6aa0`
(the commit v6 recorded as `REVIEWED-COMMIT`); HEAD `c421ceb3`. Sections the diff does not
touch are not re-litigated; the two v6 items the revision did not reach are re-measured at HEAD
and carried forward with their original ids.

## 1. Disposition of v6's findings

v6 carried no High findings and a verdict of *Approved with minor changes*, `{"high": 0,
"medium": 2, "low": 1}`. The revision answers v5's two open items by name (PM F-13, PM F-14);
v6's F-15 is the same defect re-stated wider, so it is closed by the same edit. v6's F-16 and
F-17 were raised after v1.5 and the revision does not reach them.

| v6 ID | Severity | Status | Re-measured at HEAD |
|---|---|---|---|
| F-15 | Medium | **Resolved, and resolved as a rule** | The Status column is uniform again: enumerating the last cell of every `T{nn}` row in §4 returns `⬚` for all **34** rows, and the base commit's three out-of-band cells (T03 `🔴`, T17 `🔴`, T27 `✅`) are the only ones the diff touches. §2 (`:189-205`) now states the rule that makes the uniformity mean something rather than merely look tidy — the column is a Phase-P baseline, owned by nobody during Phase I, and landed state is read from git and the wave ledger. This is option (b) of the two I offered, taken in the stronger form: a stated rule instead of a one-time reconciliation. Grounding checked, not taken on trust — see §2 below. |
| F-16 | Medium | **Still open, unchanged** | T33 (`:355`) is byte-identical to v1.5's. It still states the five-files/four-rows figures and still never states the instruction `TSPEC:169` and `TSPEC:2450` give about them. v1.6's note records T33 as "stands as landed", which is true of TE F-03's wording point and does not reach this one. Carried forward below with its original id. |
| F-17 | Low | **Still open, unchanged** | §6.1's parenthetical (`:479`) still reads "`T10 deps T08` replacing `T12 deps T10`". The edge inventory two tables up (`:409`) confirms the reading: the cluster's real edges are `T12 deps T10`, `T07 deps T12`, `T08 deps T07`, so the alternative chain `T03 → T07 → T08 → T10 → T12` keeps `T12 deps T10` and displaces `T07 deps T12`. Carried forward below. |

## 2. Re-measurement of the changed text

The diff is four things: the version note, §2's new rule paragraph, three Status cells reverted
to `⬚`, and T13's row rewritten. Every measurable claim inside them, re-run at HEAD:

| Claim in the changed text | Re-measured at HEAD |
|---|---|
| §2: `parsePlanTasks` (`orchestrate-dev.js:3761`) reads the id, `Deps` and batch cells and nothing else | **Correct.** `export function parsePlanTasks` is at `:3761`. The description/batch cells are "LOOSE — they are cosmetic" in the comment at `:3764`. The id and deps headers are matched by exact set membership at `:3797-3798` against `PLAN_ID_HEADER_CELLS` (`:3845`) / `PLAN_DEPS_HEADER_CELLS` (`:3846`). |
| §2: no parser, gate or dispatcher reads a `Status` cell at all | **Correct.** Grepping `orchestrate-dev.js` for a status read returns two hits, neither of them this table: `:1257`'s `git status --porcelain` and `:2911`'s comment about the **queue's** Status cell, which is `QUEUE.md`, a different document with a different writer. Nothing indexes a PLAN status column. |
| §2: resume is already owned by the wave ledger at `WAVE_STATE_PATH` (`:8860`), `parseWaveLedger` (`:8916`) | **Correct.** `export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json"` at `:8860`; `export function parseWaveLedger` at `:8916`. The surrounding header block states the fail-open contract, which is what makes "a second hand-kept ledger could only disagree with the first" a real argument rather than a rhetorical one. |
| Version note: four cells reverted; T03 and T17 read `🔴` **and T27 and T28 read `✅`** | **Wrong on both counts, and the table is right.** Enumerating the last cell of every task row at the base commit returns exactly **three** non-`⬚` values — T03 `🔴`, T17 `🔴`, T27 `✅`. T28 already read `⬚`. The diff correspondingly changes three cells. The edit is correct; only the note's arithmetic is not. F-19. |
| T13: `runtimeBundle.test.js:230` carries `"_envPresent", "_makeTempDir"` | **Correct**, via `git show HEAD:` as the row says. |
| T13: `:1057` reads `AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js", "consolidate-learnings.js"]` | **Correct** — the declaration is at `:1057`, with all three members. |
| T13's opening sentence: `AWAIT_SCAN_SOURCES` (`:1040`), `AT19_SEAM_NAMES` (`:215`) | **Both stale, and the first now contradicts the row's own later measurement.** `AWAIT_SCAN_SOURCES` is at `:1057`, not `:1040`; `AT19_SEAM_NAMES` is at `:219`, not `:215`. The row re-measured one half of its citations and left the other, so one sentence pair gives two line numbers for the same symbol. F-18. |
| Version note: **34** tasks (`errors: []`), **34** ownership rows, `validatePlanContract` `{"ok":true}`, **15** ready-sets, **15** waves, **0** batch mismatches | **Correct, re-run rather than assumed.** Driving HEAD's PLAN text through the shipped functions: `parsePlanTasks` → 34, `parsePlanOwnership` → 34, `validatePlanContract` → `{"ok":true}`, `computeTopologicalBatches` → 15, `computeWaves` → 15. Identical to v1.4's and v1.5's recorded numbers, as a Status-only diff must leave them. |

No `Deps`, `Batch`, `Test File` or `Source File` cell moved in this diff — I checked the full
row set, not only the three hunks. T13's rewrite is prose inside the description cell, which is
the one cell `parsePlanTasks` declares cosmetic, so the graph could not have moved and did not.

## 3. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-16 | Medium | Local | **Carried from v6, unchanged.** T33's cell states the counts but not the instruction TSPEC gives about the counts, and the row's own oracle cannot catch the difference. The cell says the row delivers "five tracked files, four manifest rows" and explains the off-by-one correctly. It never says what `TSPEC:169` actually asks the implementer to write: that `CLAUDE.md:62`'s closing sentence be **rewritten in a count-free form**, not have `three` substituted by `four` — and `TSPEC:2450` closes "the prose count itself is **not** asserted", precisely so no number is left for a test to pin. An implementer working from the PLAN row alone reads five numbered claims and would reasonably write "Those five are the tracked, shipped outputs", producing the wrong outcome invisibly to the set-equality oracle, which reads paths and not prose. One clause fixes it: "the closing sentence at `:62` is rewritten count-free (TSPEC §3.2), not renumbered; the five/four figures describe the resulting state, not the text to write." | PLAN §4.2 T33 (`:355`); TSPEC §3.2 (`:169`), §12.2 (`:2450`) |
| F-18 | Medium | Local | **T13's revision re-measured half its citations and left the other half, so the row now names two different lines for the same symbol.** The new text is right — `:230` and `:1057` both check out through `git show HEAD:`. But the row's opening sentence, untouched, still reads "`AWAIT_SCAN_SOURCES` (`:1040`) gains `"consolidate-learnings.js"`; `AT19_SEAM_NAMES` (`:215`) gains `_envPresent` and `_makeTempDir`". Measured at HEAD, `AWAIT_SCAN_SOURCES` is at `:1057` and `AT19_SEAM_NAMES` at `:219`. The `:1040`/`:1057` pair sits in one row, for one symbol, in one file. Bounded harm — T04's row already tells implementers to locate declarations by name and never by line index — but a row whose stated purpose is "read the tree before assuming" should not carry an unread citation, and the contradiction invites a reader to distrust the measurement that is in fact correct. Fix: re-point `:1040` → `:1057` and `:215` → `:219`, or drop the two opening line numbers entirely and let the row's own re-measurement carry them. | PLAN §4.2 T13 (`:323`); `runtimeBundle.test.js:219`, `:1057` |
| F-19 | Low | Local | **The v1.6 note miscounts the change it is describing and names a row that was never in the defective state.** The note says "four cells reverted" and that "T03 and T17 read `🔴` and T27 and T28 read `✅`". Measured at the base commit `6a5d6aa0`, exactly three cells were non-`⬚` — T03 `🔴`, T17 `🔴`, T27 `✅` — and T28 read `⬚`. The diff reverts three. The rule §2 states is unaffected and the table is now correct, so nothing downstream is at risk; but the note is the document's own record of what happened, it is the artifact harvest reads, and this is the second consecutive round in which a paragraph's headline number disagrees with the thing it describes (cf. F-17). "Three cells reverted — T03, T17, T27" is the whole fix. | PLAN §1 version note (`:14-40`) |
| F-20 | Low | Local | **T13 hard-codes a HEAD observation into the very table §2 has just ruled must not carry landed state.** §2 says the `Status` column is a baseline that is "never reconciled against the tree afterwards" and that "is T*n* landed?" is answered by `git cat-file -e HEAD:{path}` and the ledger. T13's new text then answers exactly that question in the table: "re-measured at HEAD both halves are in fact already present". The row's operative instruction — *assert both axes regardless of what you find* — is stable and correct, and is what makes the row safe if a later commit reverts one half. The measurement beside it is not stable and will read falsely the moment the tree moves. One sentence reconciles the two: mark the measurement as an as-of-authoring observation ("as of v1.6's authoring; verify, do not trust") rather than a statement about HEAD, so the row and §2's rule say the same thing about where landed state lives. | PLAN §2 (`:189-205`), §4.2 T13 (`:323`) |
| F-17 | Low | Local | **Carried from v6, unchanged.** §6.1's rejected-alternative parenthetical names the wrong replaced edge, and a reader who re-derives it gets different numbers from the ones the paragraph reports. The text reads "(T03 → T07 → T08 → T10 → T12, with `T10 deps T08` replacing `T12 deps T10`)". The two halves disagree: the chain keeps `T10 → T12`, i.e. keeps `T12 deps T10`, while the parenthetical says that edge goes away. The edge inventory at `:409` settles it — the cluster's edges are `T12 deps T10`, `T07 deps T12`, `T08 deps T07`, so the alternative displaces `T07 deps T12`. Keeping `T12 deps T10` and adding `T10 deps T08` reproduces the paragraph's own numbers exactly (15 ready-sets, 15 waves, T07 → 4, T08 → 7, T10 → 8, T12 → 9); removing `T12 deps T10` as the parenthetical instructs does not. The point of the paragraph is that the rejection is measured rather than argued, so the one edge it names should be the one measured: "`T10 deps T08` replacing `T07 deps T12`". | PLAN §6.1 (`:479`) |

No High finding arose. Nothing was added to the plan, nothing dropped, no ownership moved, no
task's obligation changed, and no P0 or P1 requirement changed hands in this round. The graph
re-derives identically to v1.4's and v1.5's.

## 4. Questions

| ID | Question |
|----|---------|
| Q-10 | §2's rule says an out-of-band `Status` edit "is to be reverted, not extended". Is anything expected to enforce that, or is it a convention a reader upholds? I found no code path that reads the column, so nothing mechanical can catch a future flip; if the answer is "convention", the sentence is complete as written and this is closed. If a check is wanted, the natural home is the same source-text shape T03's blocks already use. |
| Q-11 | v1.6 answers PM Q-08 and TE Q-01 with one sentence, which is the right shape. Does the same rule extend to the `🔴`/`🟢` glyphs that open each task's **description** cell? Those are design intent (what state the task lands the suite in) rather than ledger, so I read them as unaffected — but they use the same key §2 defines two lines above, and a reader who takes the new rule literally may wonder whether they too are baseline-only. One clause distinguishing "the key labels intent in the description cell; the `Status` column is the baseline" would close it. |

## 5. Positive Observations

- **The fix was taken as a rule, not as a reconciliation — which is the difference between
  closing a finding and closing the failure mode.** I offered two options and expected the
  cheaper one. The revision took the cheaper one *and* stated why it can never drift again: the
  column is a baseline nobody owns, because nothing reads it and because something else already
  owns resume. That is a stronger answer than either option I wrote, and it retires the finding
  rather than the symptom.
- **The rule is grounded in code, in the form that makes it checkable.** Four citations, all of
  which I re-ran: `parsePlanTasks` at `:3761`, the "LOOSE … cosmetic" comment at `:3764`, the
  exact header sets at `:3797-3798`, and the ledger at `:8860`/`:8916`. A rule about a document
  justified by what the runtime does with the document is exactly the right kind of argument, and
  it is why F-15 is closed rather than deferred.
- **T13 states the obligation in a form that survives the tree being ahead of the plan.** The
  row could have said "both halves are already done" and quietly become a no-op. It says the
  implementer's job is to **assert** both, and it names the failure mode that motivates it — a
  task finding one half done and dropping the pairing is how a half-widened scan becomes
  permanent. That is the instruction being made robust to its own precondition, which is what
  v6's F-14 was asking for and slightly more than it asked for.
- **The note re-ran the gate on a diff that could not have moved it, and said so.** 34 / 34 /
  `{"ok":true}` / 15 / 15, on a Status-and-prose diff. Checking the number that obviously cannot
  have changed is the discipline that catches the round where it did.

## 6. Errata against upstream documents

**None.** All five findings are defects in the document in front of me. F-16 is the closest call
and is not an erratum: `TSPEC:169` and `TSPEC:2450` state the count-free requirement plainly and
correctly — I re-read both at HEAD — and the defect is that PLAN's T33 row does not carry it.
Nothing else in the diff depends on REQ, FSPEC, TSPEC, DECISIONS or PROPERTIES text; the new
citations are all into `orchestrate-dev.js` and `runtimeBundle.test.js`, which I verified
directly rather than through any upstream document.

## 7. Recommendation

**Approved with minor changes.**

v6 raised no High findings and the revision introduces none. The one Medium I asked to be closed
as a rule is closed as a rule, and grounded: the Status column is uniform across all 34 rows,
§2 states why it must stay that way, and every code citation supporting that rule holds at HEAD.
Scope is intact — nothing added, nothing dropped, no `Deps`, `Batch`, `Test File`, `Source File`
or ownership cell moved, and the graph re-derives to 34 / 34 / `{"ok":true}` / 15 / 15.

Five non-gating items, in the order I would fix them:

1. **F-18 (Medium)** — T13's opening sentence cites `:1040` and `:215` while the same row's new
   text measures `:1057` and `:230`; the true lines are `:1057` and `:219`. Two numbers.
2. **F-16 (Medium, carried from v6)** — T33 states the counts but not TSPEC's count-free
   instruction, and its own set-equality oracle reads no count, so the wrong outcome greens.
   One clause.
3. **F-19 (Low)** — the v1.6 note says "four cells" and names T28; three cells were reverted and
   T28 was already `⬚`.
4. **F-20 (Low)** — T13 asserts a HEAD observation inside the table §2 just ruled must not carry
   landed state; mark it as-of-authoring.
5. **F-17 (Low, carried from v6)** — §6.1's parenthetical names `T12 deps T10` as the replaced
   edge; the alternative keeps it and replaces `T07 deps T12`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
