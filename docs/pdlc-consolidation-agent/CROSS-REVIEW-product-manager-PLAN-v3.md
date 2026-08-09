# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-08
**Iteration:** 3
**Scope:** delta re-review of PLAN v1.3 against my v2 findings, plus a changed-sections-only scan for
new defects. Baseline diff: `1682227b` (the commit v2 reviewed, PLAN v1.1) → HEAD `d929aab2`
(PLAN v1.3). 53 insertions, 28 deletions. Unchanged sections approved at v1/v2 are not re-litigated.

## 1. Disposition of my v2 findings

| v2 | Severity | Status | Re-measured at HEAD |
|----|----------|--------|---------------------|
| F-08 | Low | **Resolved** | §8.1 now reads "…is named **only parenthetically** in both rows and counted in neither row's five", which is what the table above it actually does. Re-counted independently: `grep -o 'consolidation[A-Za-z]*\.test\.js'` over the PLAN, de-duplicated, gives exactly **16** distinct suites. Sentence and arithmetic now agree. |
| Q-06 | (question) | **Answered** | §9.1 erratum 4 now names the landing state per id, and TSPEC v2.0 §12.3 assigns `AT-M11` → `consolidationPass.test.js`, `AT-Q13` / `AT-R7` → `consolidationRoute.test.js` — exactly the split T20/T21 proposed. No guess was needed. |

## 2. Re-measurement of the revision's own claims

The v1.3 note claims a locator-only re-pin (FSPEC 11.3 → 11.5, TSPEC 1.7 → 2.0) with no design
change. I re-measured every load-bearing cite rather than accepting the claim.

| Claim in v1.3 | Re-measured |
|---|---|
| FSPEC `Version` cell is **11.5**; TSPEC's is **2.0** | `FSPEC:12` reads `11.5`; `TSPEC:12` reads `2.0`. Exact — and this is what T05's version pin literally asserts, so the re-pin was necessary, not cosmetic. |
| FSPEC §13's register range is `:2089-2239` | `## 13. Acceptance tests` begins at `:2089`; `## 14.` begins at `:2240`. Exact. |
| The register still carries **99** ids | Enumerating `AT-…` tokens over `:2089-2239`, de-duplicated: **99**. Membership unchanged from v11.3's measurement. |
| `AT-M3 :2132`, `AT-M11 :2133`, `AT-R7 :2154`, `AT-Q13 :2174` | All four rows read at exactly those lines. AT-M3 is immediately above AT-M11, as T20 now says. |
| §15 traces AC-1.3 `:2359`, AC-1.4 `:2360`, AC-3.2 `:2368` | All three read exactly; AC-1.3's cell carries `AT-M11`, AC-1.4's carries `AT-R7`, AC-3.2's carries `AT-Q13`. |
| Retirement note at `FSPEC:44-45` | `:44` carries "(4) AC-3.2's body obligation gains AT-Q13", `:45` carries "(5) §5.3's 'only when' negative half gains AT-R7". Exact. |
| §9.1's five errata have all landed | Errata 1 and 3 land as TSPEC §12.2 rows (the two-`SKILL.md` case and the `CLAUDE.md` ↔ manifest case, both present in §12.2's table at `:2449-2450`). Errata 4 and 5 land in §12.3. |
| **T05 is now green rather than red on arrival** | Verified as T05 itself would: FSPEC §13's 99 ids vs TSPEC §12.3's (`:2477-2538`) ids, de-duplicated, compared **both directions** — `comm` returns empty on both sides. 99 ≡ 99, set-equal. The precondition v2 flagged as a wave-halt risk is genuinely met. |
| FSPEC BR-14a / E-11 / E-11b ground T20, T23, T28's rewrites | `FSPEC:2599` is BR-14a ("released by an **in-place write** of `RELEASED: {passId} {ISO-8601}` — never by removing the file"); `:2692` is E-11 (present-but-empty), `:2693` E-11b. T23's "last recorded contents match `RELEASED: {passId} {ISO-8601}`" and T28's `present` semantics are faithful transcriptions, not inventions. |
| The PLAN still self-parses | `parsePlanTasks` → **34** tasks; `parsePlanOwnership` → **34** rows, one per task, none missing; `validatePlanContract` → `{"ok":true}`; `computeTopologicalBatches` → 16 levels; every `Deps` edge resolves and no dependency sits at a `Batch` ≥ its dependent's (0 violations). No dependency cycle. |

## 3. Findings

Scope of scan: the changed sections only — the header note and upstream-version table, T03, T05,
T07, T08, T20, T21, T23, T28, T33, §8.1's counting paragraph, §8.3's traceability row, §9.1's
preamble and errata 1/3/4/5, §9.3's AT-M3 bullet, and §10's risk row.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-09 | **High** | Local | **The newly-assigned test coverage for the two `SKILL.md` edits cannot be delivered by the tasks that now claim it, because §5's file-ownership manifest was not updated with §4.** v1.3 rewrites T07, T08 and T33 so each **un-skips a block in `pdlc/workflows/__tests__/consolidationBuild.test.js`** (`:226`, `:227`, `:263`), and adds that file to their `Test File` cells. §5's manifest rows for those three tasks (`:284`, `:285`, `:310`) still own only the `SKILL.md` / `CLAUDE.md` / `RELEASE-CHECKLIST.md` paths. §5's own preamble states the consequence: "The wave commit stages **only** these paths, pathspec-scoped … so a file a task creates and does not list is created and never committed" (`:268-270`). So the un-skip edit — the only thing that makes erratum 1's and erratum 3's closure real rather than nominal — is written into the working tree and dropped at commit time. Every other un-skipping task in the PLAN gets this right (T09, T10, T11, T12, T32 each own the test file they un-skip), which is what makes the omission legible as an oversight rather than a decision. Compounding it: **T07 and T08 both sit at Batch 3 and both edit that one file**, which violates §2's stated rule verbatim — "Single-writer-per-batch, source and test alike. No two tasks carrying the same `Batch` number create or append to the same physical file" (`:120-121`). So the repair is not a one-cell paste: adding the file to both rows at Batch 3 converts a silent data-loss defect into a wave collision. One of three shapes closes it — give T08 a `Deps` edge on T07 (pushing it to Batch 4, the serialisation §5's cluster table already uses for `consolidationBuild.test.js`), or fold both un-skips into a single owner, or leave the un-skip to a later single writer and say so in the rows. Whichever is chosen, §5's rows for T07/T08/T33 must name `consolidationBuild.test.js`. | FSPEC §3.2 (the two `SKILL.md` production edits); TSPEC §12.2 rows for the two-`SKILL.md` case and the `CLAUDE.md` ↔ manifest case; PLAN §9.1 errata 1 and 3 |
| F-10 | Medium | Local | **§5's `Batch` column contradicts §4 for T07 and T08.** §4 moved both rows to Batch **3** with `Deps` = T03 (`:226-227`); §5's manifest rows still read Batch **2** (`:284-285`). This is not cosmetic in this document, because §5 closes by inviting the reader to audit serialisation "from the manifest's own `Batch` column without reading §4" (`:328-329`) — an audit run against the stale column reads T07/T08 as batch-2 peers of T03, the one arrangement the new `Deps` edge exists to forbid. §2's derivation rule (`Batch == max(batch of Deps) + 1`) makes 3 the correct value in both places. | PLAN §2 batch-derivation rule; §5 preamble |
| F-11 | Low | Local | **§5's shared-file cluster table omits the three new writers.** The `consolidationBuild.test.js` row still reads "T03 → T10 → T12 → T32" (`:322`) and the surrounding "four shared-file clusters" framing counts writers under the old shape. With v1.3, that file has up to seven writers (T03, T07, T08, T10, T12, T32, T33). The row is the document's own summary of what serialises the file, so once F-09 is repaired this ordering needs to state the new chain — otherwise the next editor re-derives the serialisation from a list that is missing half of it. | PLAN §5 |

## 4. Questions

| ID | Question |
|----|---------|
| Q-07 | T07 and T08 both retain the `[Docs, review-gated]` label and both now say the reviewer read "remains the semantic half" of the DoD. With a falsifying source-text case now assigned, is `review-gated` still the right label for these rows, or does it now read as a weaker gate than the row actually carries? Cosmetic; asked because the label was originally justified by the *absence* of a test. |

## 5. Positive Observations

- **The re-pin was performed for the right reason and says so.** The header note explains that T05's
  version-pin conjunct asserts the FSPEC `Version` cell *literally*, so leaving `11.3` in place would
  have reded T05 in batch 2 on a correct tree — the exact "the code is wrong" misread the pin exists
  to prevent. That is the mechanism being used as designed, one revision after it was introduced,
  and it is the strongest evidence in this diff that the pin was worth its cost.
- **The claim "locators only, no membership change" is true, and I checked it the hard way.** I
  re-enumerated the register at v11.5 (99), re-read all four moved AT rows and all three §15 trace
  rows at their new lines, and compared the register against TSPEC §12.3 in both directions. Nothing
  moved except line numbers. A revision that claims to be locator-only and *is* locator-only is rare
  enough to name.
- **T05's precondition is now genuinely discharged, not asserted away.** v2 approved T05 with a
  standing risk: §12.3 carried 96 and the case was red until erratum 4 landed. It has landed, and the
  set equality is green today — I ran it. Just as important, the row did **not** weaken to
  containment while waiting, which was the tempting repair and the one that would have preserved the
  gap it exists to catch.
- **Errata 1 and 3 closed at the level of the gap, not the symptom.** v1.1 held the two `SKILL.md`
  edits and the `CLAUDE.md` count with a reviewer read, and said plainly that TSPEC assigned them no
  falsifying test. TSPEC v1.8/v2.0 now assign both, and the PLAN converts the exemption into real
  test edges — the `CLAUDE.md` ↔ manifest case as a **set equality in both directions with the
  manifest itself excluded, never containment**, which is precisely the oracle shape that catches a
  deletion. F-09 is a plumbing defect in how those edges are owned, not a defect in the oracles.
- **T20, T23 and T28's rewrites removed a live contradiction rather than papering over it.** v1.1
  carried "AT-M3's truncated arm is not written" as a permanent exemption grounded in the old
  empty-marker release form. With BR-14a's sentinel adopted, the arm is reachable, and §9.3 now
  retires the open item outright instead of leaving a stale exemption that a later reader would have
  taken as licence to skip coverage. T28's `present` semantics (`file_missing` alone as absent,
  `file_empty` as present) is transcribed from TSPEC §7.3 and pairs E-11 against E-11b, so neither
  arm can pass vacuously.
- **Scope is still respected in both directions.** No task in the diff implements behaviour REQ does
  not ask for, and no P0/P1 obligation lost a task. Task count is unchanged at 34, ownership is still
  one row per task, and `validatePlanContract` is still `{"ok":true}`.

## 6. Errata against upstream documents

**None.** All five defects §9.1 raised against the TSPEC have landed upstream and I re-measured each:
§12.2 carries the two-`SKILL.md` row and the `CLAUDE.md` ↔ manifest row; §12.3 assigns `AT-M11`,
`AT-Q13` and `AT-R7` and its id set is exactly the FSPEC register's 99. Nothing in this round belongs
to an upstream author.

## 7. Recommendation

**Needs revision** — one High, confined to one section.

The document work in v1.3 is sound: the re-pin is exact, T05 is genuinely green, and the two errata
that had been held open by reviewer-read exemptions now carry real oracles. What is not finished is
§5. §4 gained three un-skippers of `consolidationBuild.test.js`; §5's manifest, batch column and
cluster table were not carried along, and by §5's own stated commit semantics that costs the edit.

To close:

1. **F-09 (High)** — add `pdlc/workflows/__tests__/consolidationBuild.test.js` to §5's rows for T07,
   T08 and T33, and resolve the resulting same-batch collision between T07 and T08 (a `Deps` edge
   from T08 to T07 is the smallest change consistent with §2 and with how the file's other writers
   are serialised).
2. **F-10 (Medium)** — set §5's `Batch` cells for T07 and T08 to match §4 (3, or 3 and 4 after the
   serialising edge above).
3. **F-11 (Low)** — extend §5's `consolidationBuild.test.js` cluster row to the full writer chain.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
