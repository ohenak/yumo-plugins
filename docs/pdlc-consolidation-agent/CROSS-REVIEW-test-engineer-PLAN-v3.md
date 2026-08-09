# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-08
**Iteration:** 3
**Scope:** Local

## Method

Delta re-review. `git diff 1682227b..HEAD` over the PLAN (53 insertions, 28 deletions, one commit —
`d929aab2 docs(plan): re-pin PLAN to FSPEC v11.5 (locators only, v1.3)`) was read in full. Every
locator the re-pin claims to have repaired was re-measured against the upstream files at HEAD rather
than read off the revision's account of itself. Only changed rows were scanned for new issues; the
Phase P gate functions were re-run over the whole file because the revision touches task rows.

## Disposition of v2 findings

| v2 | Severity | Status | Evidence re-measured this round |
|----|----------|--------|--------------------------------|
| F-01 | Low | **Resolved** | T05's headline now reads `🟢 **Traceability set-equality (no skip; green once §9.1 erratum 4 lands — landed at TSPEC v2.0)**` (`:224`). Label and precondition agree, and the precondition is now true rather than pending: `TSPEC:12` reads `2.0`, and de-duplicated `AT-…` tokens over §12.3 return **99**, with `AT-M11` / `AT-Q13` / `AT-R7` all present |

**The re-pin itself checks out, measured not read.** `FSPEC:12` reads `11.5`; de-duplicated `AT-…`
tokens over `:2089-2239` return **99**; `AT-M3` is at `:2132` and `AT-M11` at `:2133` (adjacent, as
the pairing argument requires), `AT-R7` at `:2154`, `AT-Q13` at `:2174` — every locator the v1.3 note
claims to have moved lands on the row it names. `TSPEC:12` reads `2.0` and §12.3 carries 99 ids. The
version-pin conjunct was the right thing to repair first: left at `11.3` it would have failed T05 in
batch 2 on a correct tree, which is the failure mode the pin exists to make legible.

## Findings

The re-pin is clean. The regression is elsewhere: the same revision promoted T07, T08 and T33 from
"no executable oracle" to "un-skips a block", and gave each of them a **Test file** column entry —
without giving any of them the ownership row that makes such an edit survive its wave.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **T07, T08 and T33 un-skip blocks in a file none of them owns, so the un-skip is never committed.** All three rows now say they un-skip a block in `pdlc/workflows/__tests__/consolidationBuild.test.js` (`:226`, `:227`, `:263`) and carry it in their Test-file column. §5's manifest gives T07 only `pdlc/skills/consolidate-learnings/SKILL.md` (`:284`), T08 only `harvest-learnings/SKILL.md` (`:285`), T33 only `CLAUDE.md`, `pdlc/RELEASE-CHECKLIST.md` (`:310`). §5 states the consequence in its own words — "The wave commit stages **only** these paths, pathspec-scoped … so a file a task creates and does not list is created and never committed" — and the shipped gate is exactly that: the wave commit is pathspec-scoped to the task's owned files (`pdlc/workflows/orchestrate-dev.js:10151`), never `-a`. For **T33 the loss is total**: it is alone in batch 12, no co-batch task owns the file, so the `T33 — CLAUDE.md ↔ manifest` block ships still `describe.skip`-ed after the last task in the PLAN — and §8.3's first checklist row, which greps the sixteen suites for `describe.skip(` and requires **zero**, then fails with no task left to fix it. For T07/T08 the edit survives only by accident, because T10 sits in the same batch and does own the file, which is worse than losing it: correctness depends on an unrelated task's pathspec. Add the file to all three ownership rows (and see F-02 before doing so for T07/T08). | §4.1 T07, T08; §4.2 T33; §5 |
| F-02 | High | Local | **One `describe.skip` block, two green owners, one batch — "un-skips its half" is not a mechanical operation.** T03 declares `T07/T08 — skill prompts` as a **single** block (`:222`, "Six blocks", one block per green owner). T07 says "**Un-skips its half of** T03's `T07/T08 — skill prompts` block" and T08 says "Same test edge (its half of T03's … block)". A single `describe.skip(` token cannot be half-removed: whichever task runs first either un-skips the block — reding the other half, since the other `SKILL.md` edit has not landed — or leaves it skipped, and the second task's un-skip is a no-op or a conflict. Both tasks are batch 3 (`:226`, `:227`), i.e. dispatched **concurrently**; once F-01 is fixed they become two same-batch writers of one file, which is the collision `computeWaves` partitions to prevent and which last-writer-wins silently. Two repairs are available and either works: split T03's block into `T07 — skill prompt` and `T08 — skill prompt` (one block per green owner, as §2 and §10's risk row already require), or serialise with a `T08 deps T07` edge. As written, §10's "the blocks are named for their green owner so a partial un-skip is visible by grep" is not true of this block. | §4.1 T03, T07, T08 |
| F-03 | Medium | Local | **§1 and §8.3 still assert the oracle does not exist, in the same revision that says it landed.** `:105-109` reads "§12.2/§12.3 assign them no falsifying test … both edits would ship with no oracle of any kind. §9 records the erratum; T07/T08 carry a review-only Definition of Done **in the meantime**", and §8.3's heading over the T07/T08/T33 rows still reads "**Reviewer-read (no executable oracle exists — see §9)**". The revision's own §9.1 row 1 now reads "**Landed at TSPEC v1.8**", row 3 "**Landed at TSPEC v2.0**", and I confirmed both upstream: `TSPEC:166-167` carry the two `SKILL.md` rows and `:169` the `CLAUDE.md` row, `:2449-2450` assign them. A DoD checklist that mis-states which of its rows are machine-checked is the one artifact a reviewer reads to decide whether a row is done by reading or by running. Restate both as "reviewer read **in addition to** the source-text case owned by T03". | §1; §8.3 |
| F-04 | Low | Local | **§5's Batch column disagrees with §4's for T07 and T08.** §4 gives both batch **3**, deps `T03` (`:226`, `:227`) — correct, since T03 is batch 2. §5's manifest gives both batch **2** (`:284`, `:285`). The dispatcher reads §4, so nothing executes wrongly, but §5 explicitly offers its own column as the checkable artifact ("Every one of those pairs sits in a strictly increasing batch, which is checkable from the manifest's own `Batch` column without reading §4") — and against the stale column T07/T08 read as co-batch with T03, which creates the file. One-cell fix, twice. | §5 |

**Mechanical re-derivation, run rather than asserted.** Importing the four gate exports from
`pdlc/workflows/orchestrate-dev.js` and applying them to the current file: `parsePlanTasks` = **34**
tasks, `parsePlanOwnership` = **34** rows, `validatePlanContract(tasks, ownership)` = `{"ok":true}`,
`computeTopologicalBatches` = **16** ready-sets (15 last round; T07/T08 moving from batch 2 to 3 is
what added one), batch-column mismatches against `max(batch of Deps) + 1` = **0** across all 34 rows,
and same-batch file collisions across the §5 manifest = **0**. The zero collisions are the
*declared* answer, not the real one: F-01 is precisely the case where the manifest under-declares, so
the gate cannot see the conflict F-02 describes. `validatePlanContract` is green for the same reason
— it checks that every task has a row and every row a task, not that a row names every file its task
writes.

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-02, which repair do you intend — splitting T03's block in two, or a `T08 deps T07` edge? The split is the one that keeps §10's "one block per green owner, so a partial un-skip is visible by grep" literally true, and it costs T03 nothing since the four verbatim conjuncts are already two-and-two across the two files. The edge is cheaper but leaves one block whose green depends on two tasks. |
| Q-02 | T33 is the only un-skipper in its batch, and its block asserts `CLAUDE.md`'s enumeration set-equal to the manifest's `rows[]`. T32 (batch 11) re-stamps the manifest; T33 (batch 12) edits `CLAUDE.md`. Once F-01 is fixed and the block runs, is the intent that it is red for the whole of batch 11 — i.e. after T32 adds the fifth artifact and before T33 documents it? If so the row should say so, in the shape T05's precondition sentence uses, because a wave gate that halts on red would otherwise stop at T32 with a failure that names `CLAUDE.md`. |
| Q-03 | §4.2's cluster table lists the writers of `consolidationBuild.test.js` as `T03 → T10 → T12 → T32`, "T10 deps T03; **T12 deps T10** — the edge exists for this reason alone". If T07, T08 and T33 join that cluster (F-01), does the same reasoning demand edges from them too, or is batch separation (T07/T08 at 3 with T10, T33 at 12) sufficient? My reading is that T33 is safely separated and T07/T08 are not. |

## Positive Observations

- The re-pin does the thing that is easy to skip: it re-measures instead of re-transcribing. Every
  locator I checked — `FSPEC:12` at `11.5`, `AT-M3 :2132` adjacent to `AT-M11 :2133`, `AT-R7 :2154`,
  `AT-Q13 :2174`, the register at `:2089-2239` returning 99 de-duplicated — lands where the note says.
  The v1.3 preamble also explains *why* a locators-only change was worth a revision at all (T05's
  version-pin conjunct asserts the FSPEC `Version` cell literally, so a stale pin reds batch 2 on a
  correct tree), which is the argument a future reader needs to decide whether to bump or investigate.
- The §9.1 table was converted from a list of open defects into a measurement record rather than
  deleted. Rows 1, 3, 4 and 5 keep the original measurement *and* record where it landed, and row 5
  keeps the superseded reading beside the current one (`TSPEC:2395` read 96 at v1.8; `:2485` reads 99
  since v2.0). Erratum tables that get truncated once resolved are how the same defect returns.
- The AT-M3 / AT-M11 pairing survived the FSPEC's release-form change intact, and the open-question
  section was demoted honestly: "AT-M3's truncated arm — **no longer open, and no longer listed as
  open**", with the mechanism (BR-14a's `RELEASED:` sentinel makes a zero-byte marker *present*, so
  E-11 is reachable again and does not collapse into E-11b). T28's row was widened to match, naming
  both verbs and both arms. That is the correct direction: the oracle changed because the contract
  changed, not because the test was failing.
- T28's `present` rule is now stated in terms that can be tested: "`present` reads `file_missing`
  alone as absent, `{ok:true}` and `file_empty` alike as present, and is never derived from
  `_readFile(...) !== null`, whose single `null` cannot name the reason that decides the arm". Naming
  the *reason a forbidden derivation is unfalsifiable* is more durable than forbidding it.
- §7's suite count was left at sixteen and the counting sentence tightened rather than the number
  moved — `consolidationReport` "named **only parenthetically** in both rows and counted in neither
  row's five". The arithmetic now reads the same way from the table as from the prose.

## Recommendation

**Needs revision**

The re-pin itself is correct and I could not fault it: every locator re-measures, the register is 99
at FSPEC v11.5, TSPEC §12.3 assigns all 99 at v2.0, and my one open v2 Low is resolved. The gate
functions re-run clean — 34 / 34 / `{ok:true}` / 16 batches / 0 batch mismatches / 0 declared
collisions.

The two Highs are both consequences of one un-recorded step. The revision correctly noticed that
errata 1 and 3 landed and that T07, T08 and T33 therefore have executable oracles — but it wrote that
discovery into the **description and Test-file columns only**, and left §5's ownership manifest, §5's
writers-in-order cluster, §1's "no oracle of any kind" paragraph and §8.3's "no executable oracle
exists" heading all describing the previous world. The result is a PLAN in which three tasks perform
an edit no wave will commit (F-01) and two same-batch tasks each un-skip half of one indivisible
block (F-02). F-01's T33 case is the sharp one: it is the last task in the PLAN, nothing follows it
to rescue the edit, and §8.3's zero-`describe.skip` row is the gate that would catch it — after every
wave has run.

All four findings are edits to this document, three of them one cell each; no design decision is
reopened, and F-02 offers two acceptable repairs rather than prescribing one. No upstream defect was
found this round — the FSPEC and TSPEC both carry what the PLAN says they carry — so I emit no
errata.

## Verdict

VERDICT: Needs revision

{"high": 2, "medium": 1, "low": 1}

