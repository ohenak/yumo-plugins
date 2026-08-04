# Cross-Review: test-engineer — PLAN (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md (v1.8)
**Date:** 2026-08-04
**Iteration:** 8
**Scope:** Delta re-review of PLAN v1.8 against the bytes I approved at v7 (`08925cf`), diff
`08925cf..HEAD`, fix commit `279bc38` — does the revision resolve my v7 finding (F-01, Low) and did
anything else move? Unchanged sections are not re-reviewed.

## 1. Prior findings — disposition

The diff since the commit I reviewed at v7 contains exactly three hunks: the version stamp
(`PLAN:16`, 1.7 → 1.8), the §8.2 T-03-6 row's **item column** (`PLAN:869`), and a new changelog row
1.8 (`PLAN:1026`). The working tree carries no uncommitted edit to the PLAN. Every disposition below
is grounded against the current bytes and the cited upstream lines, not the changelog.

| Item (v7) | Disposition | Evidence I checked |
|---|---|---|
| **F-01 (Low)** — the T-03-6 item column still read "every gate row of **TSPEC** §5.4", the wrong document label on FSPEC §18.2's quantifier | **Resolved, exactly as recommended, and with the disambiguation carried in-line.** `PLAN:869`'s item cell now reads "**every gate row of FSPEC §5.4** (FSPEC §18.2's full quantification — '§5.4' there is *FSPEC's* §5.4, the gate table at `FSPEC:361-380`; TSPEC's §5.4 is *Prohibitions — structural, not asserted* (`TSPEC:630`), and the same five gate rows are carried by TSPEC §5.5 (`TSPEC:648-660`))". All four citations check out against the files: FSPEC §5.4 is *"Prohibitions, and the gate that decides instead"* opening at `FSPEC:361` and running to `FSPEC:380` (§5.5 begins at `FSPEC:382`), and its five-row gate table carries A1 "**none**", A2 next-invocation triage, A3 "**none.** A3's product is a classification only", A4 rebase+tests, A5 rollup read; FSPEC §18.2's row is verbatim "every prohibition P-1…P-4 and every gate row of §5.4" (`FSPEC:1111`); `TSPEC:630` is indeed `### 5.4 Prohibitions — structural, not asserted`; `TSPEC:648` is `### 5.5 The gate that re-runs, per seam`, whose `verifyGate` rows sit at `TSPEC:655-659` — inside the cited `648-660` span — with A1 and A3 both **`null`**. The row now points a reader at the table that actually contains the five gate rows it quantifies over. |

**Did anything else move?** No. There is no other content hunk, and I re-ran the PLAN contract gate
over the current bytes with the shipped parsers (`pdlc/workflows/orchestrate-dev.js` —
`parsePlanTasks` `:2039`, `parsePlanOwnership` `:2257`, `validatePlanContract` `:2344`,
`computeTopologicalBatches` `:6533`): **36** tasks, **36** ownership rows,
`validatePlanContract ⇒ {"ok":true}`, **20** topological batches — identical to the values I derived
at v6 and v7. No task row, dependency edge, ownership row or batch label moved, and the enlarged
parenthetical introduces no `|` that could re-shape the §8.2 table (the 36/36 bijection re-derives
cleanly, which is the mechanical proof of that).

One note that is about my own v7 file rather than the PLAN, recorded so it is not mistaken for a
document defect: `CROSS-REVIEW-test-engineer-PLAN-v7.md:73` reads `VERDICT: Approved minor changes`,
which is outside the three-value catalogue (`Approved` / `Approved with minor changes` /
`Needs revision`). The v7 recommendation text says **Approved with minor changes**; this v8 file
supersedes it and carries a catalogue-valid verdict line.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | **None.** The single v7 item is resolved and the delta introduces nothing new. | — |

## Questions

None. Both v6 questions were answered inside the document at v1.7 and their answers are untouched by
this delta; v7 raised none.

## Positive Observations

- **The repair is the minimum edit that closes the ambiguity, and it does not merely relabel.** I
  asked for "FSPEC §5.4" (or "TSPEC §5.5"); the revision names FSPEC §5.4 *and* records why the
  quantifier reads "§5.4" at all (it transcribes FSPEC §18.2, `FSPEC:1111`) *and* states what TSPEC's
  §5.4 actually is. A future reader who lands on `TSPEC:630` looking for gate rows now finds the
  redirect to `TSPEC:648` in the same cell, so the slip cannot recur by re-derivation.
- **The delta is contained to prose in one table cell, and the mechanical contract confirms it.**
  36 tasks / 36 ownership rows / `{"ok":true}` / 20 batches re-derive unchanged, so the enlarged
  parenthetical did not perturb the task-table or ownership-manifest grammar the Phase P gate parses.
- **The gate-row content the corrected pointer now resolves to matches what A-07 is told to author.**
  FSPEC §5.4's table gives A1 "none" and A3 "none" (`FSPEC:376`, `FSPEC:378`) and TSPEC §5.5 gives
  both as `null` (`TSPEC:655`, `TSPEC:657`); §8.2's install-the-stub mutation for exactly those two
  seams therefore reads against a table that agrees with it, which was the substance of the v6 High
  finding and remains true after the citation move.

## Recommendation

**Approved.**

The one open item from v7 — the `TSPEC §5.4` → `FSPEC §5.4` label slip in §8.2's T-03-6 item column
— is resolved at `PLAN:869` in the form I recommended, with every citation in the replacement clause
verified against the upstream bytes (`FSPEC:361-380`, `FSPEC:1111`, `TSPEC:630`, `TSPEC:648-660`).
Nothing else in the document changed, and the PLAN contract re-derives mechanically unchanged: 36
tasks, 36 ownership rows, `validatePlanContract ⇒ {"ok":true}`, 20 topological batches. No High,
Medium or Low findings remain open from the testing lens.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
