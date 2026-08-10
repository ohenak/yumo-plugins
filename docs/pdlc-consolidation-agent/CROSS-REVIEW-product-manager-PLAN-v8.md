# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 8

**Scope:** delta re-review of the v1.6 → v1.7 diff against v7's findings. Baseline
`c421ceb3` (the commit v7 recorded as `REVIEWED-COMMIT`); HEAD is `aa8cbb2f`. The diff
touches five places: the version header (v1.7 note), T07, T08, T33 and §6.1. Sections
the diff does not touch are not re-litigated; three v7 items the revision did not reach
are carried forward under their original ids and re-measured at HEAD.

## 1. Disposition of v7's findings

v7 carried no High findings and a verdict of *Approved with minor changes*,
`{"high": 0, "medium": 2, "low": 3}`. The revision closes both of v7's ordered-first
items (F-16, F-17). F-18, F-19 and F-20 were not reached.

| v7 ID | Severity | Status | Re-measured at HEAD |
|---|---|---|---|
| F-16 | Medium | **Resolved** | T33 now carries TSPEC's *instruction about* the counts, not only the counts: "**The counts in this row describe the resulting state; they are not text to write.**", followed by TSPEC §3.2's requirement that `:62`'s closing sentence be **rewritten to a count-free form** — "not a `three` → `four` substitution" — and by the reason the row's own oracle cannot catch the substitution. Both new citations check out: `TSPEC:318` is the `CLAUDE.md` row of §3.2 and carries the count-free requirement verbatim; `TSPEC:2841` is the tracked-artifact-enumeration row and carries "the prose count itself is **not** asserted". This is the clause I asked for, and it names the failure mode rather than only the rule. |
| F-17 | Low | **Resolved, and measured rather than asserted** | §6.1's parenthetical now reads "`T10 deps T08` replacing `T07 deps T12`". Re-derived at HEAD: taking the alternative chain `T03 → T07 → T08 → T10 → T12` (T07's `Deps` repointed from `T12` to `T03`, T10 gaining `T08`) returns **15** ready-sets, **15** waves, T07 → 4, T08 → 7, T10 → 8, T12 → 9 — the paragraph's own four numbers, exactly. The version note's counter-claim is also true: the literal old reading (chain kept, `T12 deps T10` removed) returns **16/16** and would falsify the headline. The edge named is now the edge measured. |
| F-18 | Medium | **Still open — and one of its two numbers has since rotted further** | See §3 below. |
| F-19 | Low | **Still open** | v1.6's note still says "four cells reverted" (`:49` at HEAD); three were. Now a historical header entry two revisions back. |
| F-20 | Low | **Still open, and the shape has spread to T07** | See F-22 below. |

## 2. Re-measurement of the changed text

Every measurable claim inside the diff, re-run at HEAD:

| Claim in changed text | Re-measured at HEAD |
|---|---|
| Version note: **34** tasks (`errors: []`), **34** ownership rows, `validatePlanContract` `{"ok":true}`, **15** ready-sets, **15** waves, **0** batch-column mismatches, **0** same-batch same-file collisions, **16** multi-writer files over **28** distinct files | **All nine correct.** Driving HEAD's PLAN text through the shipped functions: `parsePlanTasks` → 34 tasks, no errors; `parsePlanOwnership` → 34 rows; `validatePlanContract` → `{"ok":true}`; `computeTopologicalBatches` → 15; `computeWaves` → 15; every `Deps` edge points at a strictly earlier `Batch` cell (0 mismatches); no ready-set contains two owners of one file (0 collisions); the ownership manifest covers 28 distinct paths of which 16 have more than one writer. Identical to v1.4/v1.5/v1.6 for the first five, as a prose-only diff requires. |
| Status column still uniform | **Correct.** Enumerating the trailing cell of all 34 `T{nn}` rows returns `⬚` 34 times, zero exceptions — §2's Phase-P-baseline rule holds after this edit. |
| T07: `:56` carries the block/legacy predicate, `:62` the `{topic} = failure-mode-id` route | **Correct at HEAD.** `pdlc/skills/consolidate-learnings/SKILL.md:56` is the "Find the boundary" step naming the block/legacy predicate; `:62` is the `DECISIONS-{topic}.md` route carrying `{topic} = failure-mode-id`. |
| T07: "Both anchors are re-measured at HEAD by `consolidationSkillAnchors.test.js`, not asserted by hand" | **Correct, and executable.** The file exists (`pdlc/workflows/__tests__/consolidationSkillAnchors.test.js`), its `describe("anchors into consolidate-learnings/SKILL.md resolve to what they claim")` block walks every tracked citer, and the suite is green at HEAD: 35 passed, 0 failed. |
| T08: `Phases exercised` after the `Harvested from` row at `:77`, inside the `:70-79` table | **Correct.** `pdlc/skills/harvest-learnings/SKILL.md:77` is `Harvested from`, `:78` is `Phases exercised`, the table spans `:70` (header) to `:79` (`DoD rounds`). TSPEC §3.2 gives the span as `:72-79` (rows only); both include `:77` and neither is wrong. |
| §6.1: "T07's `Deps` is `T12` and T12's is `T03, T10`" | **Correct**, read off the table's own cells. |

No `Deps`, `Batch`, `Test File`, `Source File` or ownership cell moved in this diff.
No task was added, removed, split or re-scoped.

## 3. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-21 | Medium | Process | **T33 now cites TSPEC §12.2 twice, at two different lines, and one of them is stale.** The revision added `TSPEC:2841` (correct: the tracked-artifact-enumeration row) but left the row's earlier `TSPEC:2450` citation in place two sentences later, still introduced as "TSPEC §12.2". At HEAD, `TSPEC:2450` is the `fakeGit`/PRNG passage — the §12.2 text it used to name has moved to `:2841`, which is exactly where the new sentence points. So one row now tells an implementer that one section lives at two incompatible addresses, and the fresher of the two was added in the same edit that left the older one. The quoted material is right and the instruction is right; only the address is wrong. Fix: replace `TSPEC:2450` with `TSPEC:2841`, or drop the line number and cite §12.2 by section, which is the form that cannot rot. | PLAN §4.2 T33 (`:390`); `TSPEC:2841`, `TSPEC:2450` |
| F-18 | Medium | Local | **Carried from v6 and v7, and now both of T13's line citations are wrong, not one.** v7 recorded that T13's opening sentence cites `AWAIT_SCAN_SOURCES` at `:1040` while the row's own re-measurement two sentences later says `:1057`. Re-measured at HEAD: the declaration is at `runtimeBundle.test.js:1122`, so **both** numbers are now false, and `AT19_SEAM_NAMES` is at `:219` against the row's `:215`. The declaration moved between `c421ceb3` and HEAD under the DOD remediation commits, which is the point: a line index in a PLAN row is a claim about a tree that keeps moving while the PLAN is still being reviewed. The row's operative instruction is unharmed — T04 already tells implementers to locate declarations **by name and never by line index** — so the risk is a reader's trust, not a wrong edit. Fix (cheapest durable form): delete the four line numbers from T13 and cite both symbols by name only. | PLAN §4.2 T13 (`:358`); `runtimeBundle.test.js:219`, `:1122` |
| F-24 | Medium | Local | **T05's version pins name FSPEC 11.5 and TSPEC 2.0; at HEAD they read 11.7 and 2.6.** T05 instructs the implementer to assert, as conjunct (i), that "FSPEC's `Version` cell reads `11.5` and TSPEC's reads `2.0`". Measured: `FSPEC:12` reads **11.7**, `TSPEC:12` reads **2.6**. Written literally at Phase I, that conjunct ships red on the first run, and it reds in the shape T05 designed for a *different* cause — "the register moved" — so the implementer would go hunting for a traceability defect that is not there. The row is outside this diff and the drift was caused by upstream errata rounds, not by this revision; I record it rather than gate on it because the fix belongs to whichever revision touches T05 next. Fix: state the pins as "re-measure the two `Version` cells at implementation time and pin what you read", or refresh to 11.7 / 2.6 and expect to refresh again. | PLAN §4.2 T05 (`:351`); `FSPEC:12`, `TSPEC:12` |
| F-22 | Low | Local | **T07's revised opening states landed state inside the task table — the shape F-20 named, now in a second row.** The new text reads "`:56` (was the `Date Completed` date boundary) **now carries** the block/legacy predicate". At HEAD that is true, because T07's production edit already landed (`9823d2cc`). But the sentence is a report about a tree, in the column that §2 has just finished ruling must carry design intent and never landed state; on any tree where the edit is absent it reads as a false statement about the file rather than as the instruction it is. The parenthetical "(was the `Date Completed` date boundary)" is genuinely useful and should stay — it is what makes the anchor move legible. Fix: one verb — "`:56` … **carries** the block/legacy predicate" as the target state, or "as of v1.7's authoring, `:56` already carries …" if the observation is worth keeping. | PLAN §2 (`:220-291`), §4.2 T07 (`:353`) |
| F-23 | Low | Local | **T07 names a test file that appears in no ownership row and in no other row of the PLAN.** `consolidationSkillAnchors.test.js` is cited as the mechanism that keeps T07's two anchors honest. The file exists and is green at HEAD (35 tests), so nothing halts — but §5's manifest does not list it, and no task claims it, so a reader cannot tell from the plan whether keeping it green is anyone's task obligation or simply the wave gate's business. Since the file post-dates the PLAN (it arrived under DOD remediation) the honest answer is the latter. Fix: one clause in T07 — "…by `consolidationSkillAnchors.test.js`, which this feature does not edit; the wave gate runs it" — so the citation is visibly a read, not a write. | PLAN §4.2 T07 (`:353`), §5 |
| F-20 | Low | Local | **Carried from v7, unchanged.** T13 still hard-codes a HEAD observation ("re-measured at HEAD, both halves are in fact already present") inside the table §2 ruled must not carry landed state. The row's instruction — assert both regardless — is stable and correct; only the observation beside it will read falsely the moment the tree moves. Fix: mark it as an as-of-authoring observation. | PLAN §2 (`:220-291`), §4.2 T13 (`:358`) |
| F-19 | Low | Local | **Carried from v7, unchanged, now historical.** v1.6's header entry still says "four cells reverted"; three were (T03, T17, T27 — T28 was already `⬚`). It is two revisions back and the table it describes is correct, so this is a record-keeping fix only. | PLAN §1, v1.6 note (`:49`) |

No High finding arose. Nothing was added to the plan and nothing dropped; no ownership
moved; no task's obligation changed except T33's, which **gained** the instruction v7
asked for. The graph re-derives identically to v1.4 / v1.5 / v1.6.

## 4. Questions

| ID | Question |
|----|---------|
| Q-12 | The anchor warranty `consolidationSkillAnchors.test.js` provides covers the `consolidate-learnings/SKILL.md:NNN` family and the harvest metadata table span. F-18 and F-21 are both citations *outside* that family — `runtimeBundle.test.js:NNNN` and `TSPEC:NNNN` — and both rotted while this document was under review. Is widening the warranty to those two families worth a task, or is the intended answer that PLAN rows should stop carrying line indices for anything that is not already mechanised? I lean to the second, because it costs one editing pass and no runtime; either answer closes the recurrence, and picking one is what stops a fourth round of the same finding. |
| Q-13 | T33 now states the count-free requirement *and* still states "five tracked files, four manifest rows" as vocabulary. That reads correctly to me, but the reason the substitution was tempting in the first place is that the numbers sit in the same paragraph as the sentence to be rewritten. Would the row be safer with the vocabulary sentence moved after the count-free instruction rather than before it? Presentation only — the obligation is now unambiguous either way. |

## 5. Positive Observations

- **F-16 was closed at the level of the failure mode, not the sentence.** I asked for one
  clause carrying TSPEC's count-free instruction. The revision carries the instruction,
  quotes the rejected substitution verbatim, *and* explains why the row's own oracle is
  blind to it (`TSPEC:2841`: the prose count "is **not** asserted … precisely so there is
  no number left for a test to pin"). An implementer now cannot write "Those five are the
  tracked, shipped outputs" without having read the sentence that forbids it.
- **§6.1's fix is a measurement, not a correction.** The version note does not merely
  assert the right edge; it re-derives both readings and reports what each returns —
  15/15 for the edge now named, 16/16 for the edge previously named. I re-ran both and got
  the same two answers. A rejected alternative that carries its own falsifier is worth more
  than the paragraph it sits in.
- **T07 replaced a hand-asserted anchor with a mechanised one.** The old row asserted
  `:35` and `:41` by hand; the new row points at a suite that re-measures them and is green
  at HEAD. That is the durable answer to the whole class of finding this review keeps
  raising — and it is why F-18 and F-21 are worth closing the same way rather than by
  renumbering.
- **The gate was re-run on a diff that could not have moved it, and two new invariants
  were added to the re-run.** 0 same-batch same-file collisions and 16 multi-writer files
  over 28 distinct files are both new in this note, both correct, and both check the
  property §5's manifest exists to protect. Checking numbers that obviously cannot have
  changed is the discipline that catches the round where they did.

## 6. Errata against upstream documents

**None.** All six findings are defects in the document in front of me. F-21 is the closest
call and is not an erratum: `TSPEC:2841` carries §12.2's exclusion clause correctly, and
PLAN's `TSPEC:2450` is simply an address the PLAN did not refresh. F-24 likewise: FSPEC
11.7 and TSPEC 2.6 are the upstream documents' current, legitimate versions; it is the
PLAN's pin that is stale, not the upstream text that is wrong.

## 7. Recommendation

**Approved with minor changes.**

v7 raised no High findings and this revision introduces none. Both items I ordered first
are closed, and closed in the stronger form: T33 now carries TSPEC's instruction about the
counts and not only the counts, and §6.1 names the edge it measured. Scope is intact —
nothing added, nothing dropped, no `Deps`, `Batch`, `Test File`, `Source File` or ownership
cell moved — and the graph re-derives 34 / 34 / `{"ok":true}` / 15 / 15 with 0 collisions.

Six non-gating items, in the order I would fix them:

1. **F-21 (Medium)** — T33 cites TSPEC §12.2 at both `:2841` (right) and `:2450` (stale, now
   the `fakeGit` passage). One address, or drop the number.
2. **F-18 (Medium, carried from v6)** — T13's `:1040` / `:1057` pair is now wholly stale;
   the declaration is at `runtimeBundle.test.js:1122`, and `AT19_SEAM_NAMES` at `:219`.
   Cite by name, as T04 already instructs.
3. **F-24 (Medium)** — T05 pins FSPEC `11.5` / TSPEC `2.0`; HEAD reads `11.7` / `2.6`.
   Written literally, that conjunct reds on the first run for the wrong reason.
4. **F-22 (Low)** — T07's "now carries" reports landed state in the table §2 ruled must not
   carry it. One verb.
5. **F-23 (Low)** — T07 names `consolidationSkillAnchors.test.js`, which no ownership row
   claims; say it is a read, not a write.
6. **F-20 (Low, carried)** and **F-19 (Low, carried)** — T13's as-of-authoring marker, and
   v1.6's "four cells" for three.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 4}

APPROVAL-HASH: sha256:a8fe9eef791cdaabd1f514287050724c7ec982cfb22227833d7fccb91b046b9f
REVIEWED-COMMIT: aa8cbb2fff8ce07a9deb09643c1518b25ed70f7a
