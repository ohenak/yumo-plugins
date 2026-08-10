# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 6
**Scope:** delta re-review of the v1.4→v1.5 diff against v5's findings, changed cells and changed
prose only. Baseline `6d350ba7` (the commit v5 recorded as reviewed) → HEAD `6a5d6aa0`. Sections
untouched by the diff are not re-litigated.

## 1. Disposition of v5's findings

v5 carried no High findings and a verdict of *Approved with minor changes*, `{"high": 0,
"medium": 1, "low": 2}`. Three items were open. Each re-measured at HEAD rather than recalled:

| v5 ID | Severity | Status | Re-measured at HEAD |
|---|---|---|---|
| F-12 | Low | **Resolved** | §5's census now reads "**Twelve** further test files", names `consolidationLifecycle` (T23 → T31) among them, and closes with an explicit set-equality paragraph. Re-derived independently: grouping §5's own ownership rows by file and keeping files with more than one owning task returns **16** multi-writer files. The cluster table's four (`consolidate-learnings.js`, `consolidationBuild`, `consolidationRoute`, `runtimeBundle`) plus the twelve enumerated in the paragraph are set-equal to that 16 — no leftovers on either side. The fix is the one the finding asked for and one step better than asked. |
| F-13 | Medium | **Still open, and wider** | The Status column now carries three vocabularies over three rows while 27 landed tasks stay at baseline. See F-15. |
| F-14 | Medium | **Resolved in code, not in the row** | The finding was that T13's "widen both halves in one commit" instruction had arrived half-satisfied. At HEAD both halves are landed: `runtimeBundle.test.js:1052` reads `AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js", "consolidate-learnings.js"]` and `AT19_SEAM_NAMES` (`:215-231`) carries `_envPresent` and `_makeTempDir` with the deliberate `_now` exclusion stated in a comment. The hazard the finding named cannot recur — there is no half-widened state left. T13's row still reads `⬚`, which is the F-15 ledger problem and not a separate defect. |

## 2. Re-measurement of the revision's new claims

v1.5 states itself as "three prose-against-measurement corrections — no design change, no graph
change", and the diff also carries two Status-cell flips. Every measurable claim in it was re-run
against HEAD rather than read:

| Claim in the changed text | Re-measured at HEAD |
|---|---|
| §5: sixteen multi-writer files, four in the cluster table plus twelve in the paragraph | **Correct.** Deriving from §5's own rows via `parsePlanOwnership` returns 34 ownership entries over 28 distinct files, of which exactly **16** carry more than one owning task. The twelve named in the paragraph are set-equal to the 16 minus the cluster table's four. `consolidationProperties` (T19 → T25 → T26 → T27) is the four-writer member the "two to four writers each" wording covers. |
| §4.2: 34 tasks, 34 ownership rows, `{"ok":true}`, 15 ready-sets, 15 waves, 0 mismatches, 0 collisions | **Correct.** `parsePlanTasks` → 34, `parsePlanOwnership` → 34, `validatePlanContract` → `{"ok":true}`, `computeTopologicalBatches` → 15, `computeWaves` → 15. Identical to what v4 and v5 recorded — the diff did not move the graph, which is what the revision claimed and what it was right to falsify rather than assume. |
| §6.1: the rejected front-of-cluster ordering returns the same 15 ready-sets and 15 waves, with T07/T08 at waves 4 and 7 and T10/T12 out to 8 and 9 | **Correct on the numbers.** Reconstructing the alternative in memory (T07 deps `["T03"]`, T08 deps `["T07"]`, T10 gains `T08`, `T12 deps T10` retained) and re-deriving batch labels: **15** ready-sets, **15** waves, T07 → 4, T08 → 7, T10 → 8, T12 → 9 — exactly the swap the paragraph describes, against a baseline of T10 → 4, T12 → 7, T07 → 8, T08 → 9. The one edge the parenthetical names is misidentified; see F-17. |
| T33: the manifest gains its **fourth row** and `dist/` its **fifth tracked file**; at HEAD four paths, three rows | **Correct.** `git ls-files pdlc/workflows/dist/` returns four paths (`distribution-manifest.json`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`); the manifest's `rows[].id` at HEAD is exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`. The off-by-one explanation the row now gives — the manifest carries no row for itself — is the real reason, and the quotation of `TSPEC:2450` is verbatim, including "**minus `pdlc/workflows/dist/distribution-manifest.json` itself**, asserted **set-equal**". v4's "fifth artifact" wording is properly retired. |
| T27's cell flipped `⬚` → `✅` | **True.** `consolidate-learnings.js` at HEAD exports `phasesExercised` (`:867`), `effectivenessTable` (`:936`), `parseEscalations` (`:1165`) and `seamCandidates` (`:1210`), and T27's three un-skip obligations are discharged — no `describe.skip` token survives in `consolidationEffectiveness.test.js`, `consolidationAdvisory.test.js` or `consolidationProperties.test.js`. |
| T17's cell flipped `⬚` → `🔴` | **True as of the commit that wrote it** (`dad8f7dd`), and **already stale at HEAD**: T17's suite carries no `describe.skip` block any more, because T27 un-skipped it one commit later. A row reading `🔴` for a block that is green is the same ledger defect as a row reading `⬚` for work that landed. Folded into F-15 rather than raised twice. |

Nothing in the diff touches a `Deps`, `Batch`, `Test File` or `Source File` cell. I checked the two
ways a prose-only revision can still do damage — a changed sentence that a downstream row reads as
its precondition, and a changed number that a gate function parses — and neither applies: the gate
functions read `dependencies` and `planBatch`, and no `orchestrate-dev.js` code path reads the
Status column at all.

## 3. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-15 | Medium | Process | **The Status column is now a three-vocabulary ledger that is false for 27 of 34 rows** (carries v5's F-13, which the revision did not address and this diff widened). Measured at HEAD: 28 task ids appear in landed `feat(…)`/`chore(…)` commit subjects on this branch, and the module code and un-skips for T25–T30 are verifiably present. The column reads: T03 `🔴`, T17 `🔴`, T27 `✅`, and **`⬚ Not Started` for the other 31 rows** — including T00, T01, T02, T04, T05, T06, T07, T08, T09, T10, T11, T12, T13, T25, T26, T28, T29 and T30, every one of which has landed. T17's `🔴` is additionally stale in the other direction: its block was un-skipped by T27 one commit after the flip. So a reader cannot tell a true `⬚` (T31, T32, T33 — genuinely not started) from a false one (T30, whose `openClone` and seam-resolution work is at HEAD), and cannot tell a live `🔴` from a superseded one. §2 (`:162`) defines the key but no section says who writes the column or when; the runtime does not — implementation waves commit code under `implementation.postWavePathspecs` and never edit the PLAN, and no code path in `orchestrate-dev.js` reads the column. The fix is still one of two, and picking one is what closes this: (a) bring the whole column up to date in a single pass so it means one thing throughout and keep it current per wave, or (b) revert T03, T17 and T27 to `⬚` and add one sentence to §2 stating that the column records the Phase-P baseline and that landed state is read from git, never from the table. | PLAN §2 (`:162`), §4.1, §4.2 |
| F-16 | Medium | Local | **T33's revised cell states the counts but not the instruction TSPEC gives about counts, and its own oracle cannot catch the difference.** The cell now says the row delivers "five tracked files, four manifest rows" and explains the off-by-one — all correct. What it never says is what TSPEC actually asks the implementer to write: `TSPEC:169` requires `CLAUDE.md:62`'s closing sentence to be "rewritten to a **count-free form**… not a `three` → `four` substitution that would be stale again on the next artifact", and `TSPEC:2450` closes "The prose count itself is **not** asserted: §3.2's edit removes it in favour of a count-free sentence, precisely so there is no number left for a test to pin." An implementer working from the PLAN row alone reads five numbered claims and would reasonably write "Those five are the tracked, shipped outputs" — the exact substitution TSPEC rejects — and **the set-equality oracle would stay green**, because it compares the enumerated paths to `rows[]` and deliberately reads no count. This is the one place in the row where a wrong outcome is invisible to the row's own test. One clause fixes it: "the closing sentence at `:62` is rewritten count-free (TSPEC §3.2), not renumbered; the five/four figures here describe the resulting state, they are not text to write." | PLAN §4.2 T33; TSPEC §3.2 (`:169`), §12.2 (`:2450`) |
| F-17 | Low | Local | **§6.1's new rejected-alternative paragraph names the wrong replaced edge, so a reader who re-derives from the parenthetical gets a different answer than the paragraph reports.** The text reads "(T03 → T07 → T08 → T10 → T12, with `T10 deps T08` replacing `T12 deps T10`)". Those two halves disagree: the chain keeps `T10 → T12`, i.e. keeps `T12 deps T10`, while the parenthetical says that edge goes away. Measured both readings. Keeping `T12 deps T10` and adding `T10 deps T08` reproduces the paragraph's own numbers exactly — 15 ready-sets, 15 waves, T07 → 4, T08 → 7, T10 → 8, T12 → 9. Removing `T12 deps T10` as the parenthetical instructs returns **16** ready-sets and **16** waves with T08 → 8 and T12 → 7, which would make the paragraph's headline claim ("exactly as today") false. The edge actually replaced is `T07 deps T12`. Since the whole point of the paragraph is that the rejection is measured rather than argued, the one edge it names should be the one it measured: "with `T10 deps T08` replacing `T07 deps T12`". | PLAN §6.1 |

No other finding arose from the diff. Every quantitative claim the revision added holds under
independent re-derivation, and no task's obligation, ownership or ordering moved, so no P0 or P1
requirement changed hands in this round.

## 4. Questions

| ID | Question |
|----|---------|
| Q-08 (carried, still unanswered) | Who owns the Status column during Phase I? v5 asked and v1.5 answered by flipping two more cells, which is an answer in practice but not one written down. If the intent is "the column is a Phase-P baseline", option (b) in F-15 is one sentence and ends the drift permanently; if the intent is "it is a live ledger", it needs a named writer and a per-wave obligation, because 27 stale rows accumulated in eight waves without one. |
| Q-09 | Does anything downstream read T17's `🔴` as a live signal — a wave gate, a DoD check, a harvest step — or is it purely a reader's cue? I found no code path that parses the column, but the question decides whether F-15 is cosmetic or load-bearing, and the answer belongs in §2 next to the key. |

## 5. Positive Observations

- **The census fix went past the finding to the shape the document demands of its own tests.**
  F-12 asked for one word and one file name. The revision supplied those and then added a paragraph
  stating the census is set equality, not containment, and naming the derivation a reader can run —
  group §5's rows by file, keep the files with more than one owner, count to sixteen. I ran exactly
  that derivation and got sixteen with no leftovers on either side. A document that applies its own
  oracle-quality rule to its own prose is unusual and worth naming.
- **T33's correction retired a wrong number instead of adjusting it.** "Fifth artifact" became
  "fourth row, fifth tracked file", with the off-by-one explained by the manifest carrying no row
  for itself, both figures re-measured at HEAD, and `TSPEC:2450` quoted verbatim rather than
  paraphrased. Four paths and three `rows[].id` values are what HEAD returns. The row now says the
  same thing its oracle says, in the oracle's own words.
- **§4.2 recorded a re-run that was expected to change nothing, and said so.** "The diff should not
  have moved the graph" is precisely the claim most likely to be assumed rather than checked, and
  the revision checked it: 34/34/`{"ok":true}`/15/15, which is what I measure. The same discipline
  produced the 16 the census is now pinned to.
- **§6.1 answers a design question with a measurement.** Round 4 asked whether the front-of-cluster
  ordering had been considered; the answer is that it was, that it returns the same 15 and 15, that
  it is a swap rather than a saving, and that its cost is an illegible `T10 → T08` edge between a
  `.gitignore` entry and a skill prompt. I reconstructed the alternative and got the paragraph's
  numbers exactly. Modulo the misnamed edge in F-17, this is the right way to close a "did you
  consider" question — a rejected alternative recorded with its measurement, so the next reader does
  not re-open it.

## 6. Errata against upstream documents

**None.** F-16 is a gap in the PLAN's own T33 row against a TSPEC clause that is correct as written
(`TSPEC:169`, `:2450` both state the count-free requirement plainly); the defect is that the PLAN row
does not carry it, so it is fixed in the document in front of me. Nothing else in the diff depends on
REQ, FSPEC, TSPEC, DECISIONS or PROPERTIES text, and the one upstream citation the revision added is
a verbatim quotation I re-read at HEAD and confirmed.

## 7. Recommendation

**Approved with minor changes.**

v5 raised no High findings, and this revision introduces none. All three of v1.5's stated corrections
hold under independent re-measurement — the census is set-equal to the 16 the manifest derives,
T33's four-rows/five-files figures match `git ls-files` and the manifest's `rows[]` at HEAD, and the
rejected ordering returns the 15/15 and the wave swap it claims. The two Status flips are true of the
commits that wrote them. Scope held: nothing was added, nothing dropped, no `Deps`, `Batch` or
ownership cell moved, and the graph re-derives identically at 34/34/`{"ok":true}`/15/15.

Three non-gating items, in the order I would fix them:

1. **F-15 (Medium, carried from v5's F-13)** — the Status column is false for 27 of 34 rows and
   carries a stale `🔴` besides. Pick one of the two fixes and write the rule into §2 so the next
   eight waves do not repeat it.
2. **F-16 (Medium)** — T33's row states the counts but not TSPEC's count-free instruction, and its
   own set-equality oracle reads no count, so the wrong outcome would ship green. One clause.
3. **F-17 (Low)** — §6.1's parenthetical names `T12 deps T10` as the replaced edge; the graph that
   reproduces the paragraph's own numbers keeps it and replaces `T07 deps T12` instead.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

