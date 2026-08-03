# Cross-Review: test-engineer — Final Codebase Review

**Reviewer:** test-engineer
**Reviewed:** remediation commit `69e3d9d`, branch `feat-pdlc-merge-phase`, HEAD `69e3d9d`
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** line

I re-ran both mutations myself rather than accepting the remediation report, and added the
delete-one-row probe. Both mutations reverted; tree verified clean and `build-runtime.mjs --check`
back to PASS.

## Re-verification (executed)

| Probe | Result |
|---|---|
| **Garble `MERGE_ESCALATIONS.tree` + `.queue`** (`working tree not updated after merging` → `TREE-GARBLE…`; `but the queue row for` → `QUEUE-GARBLE…`) | **2 tests red**, both named: `MERGE_ESCALATIONS.tree — the exact FSPEC §9.3 sentence` and `… .queue — the exact FSPEC §9.3 sentence`. In v1 this identical mutation left the whole 3000-test suite green |
| **Delete one row case** (`rowTest("row 14 …` → `test("row 14 …`, so its id is never harvested) | **red**, naming `row completeness (TSPEC §13.3)` with a set-difference diff (`- Expected - 1 / + Received + 0`) |
| Full suite after restore | 62 suites, **61 green, 2941 passed** (up 12 from v1's 2929), 70 skipped — all pre-existing files. Sole red remains `documentOracles.test.js:246` AT-23, the documented `.tokensave` environmental false positive |
| `build-runtime.mjs --check` | PASS — all four `dist/` rows `in-sync` |

## Dispositions

| ID | Sev (v1) | Disposition | Evidence |
|----|----------|-------------|----------|
| 1 | blocking | **Closed, and verified by mutation.** `rowTest` (`mergePhase.test.js:147`–`:152`) harvests each case's row id **out of the test's own name** via `/^row (\d+a?)\b/` — deliberately not a second, independently-typed id per case that could drift from the name, which is the right call. `:418`–`:424` asserts `new Set(COVERED_ROWS)` equals `new Set(ROW_TABLE_IDS)`. Collection is synchronous and the completeness case is registered after every `rowTest`, so `COVERED_ROWS` is complete before any test runs — the ordering is sound. My delete-one-row probe reds it, so a dropped row is now a failure rather than an absence, which is exactly what TSPEC §13.3 asked for | `mergePhase.test.js:141`–`:152`, `:418`–`:424` |
| 2 | blocking | **Closed, and verified by mutation.** `mergePostMerge.test.js:431`–`:447` adds `describe("MERGE_ESCALATIONS.tree / .queue — literal text (FSPEC §9.3)")` with one exact-sentence assertion per template, following the `:411` / `mergePhase.test.js:552` pattern I cited. My v1 garble now reds both by name. The two templates FSPEC §9.3 pins verbatim are falsifiable for the first time | `mergePostMerge.test.js:431`–`:447` |
| 3 | advisory | **Closed.** `describe("MERGE_NOTES — literal text (remaining catalogue members)")` at `mergePostMerge.test.js:460` anchors the six remaining note templates, joining `aheadOfRemote`'s existing anchor at `:410` | `mergePostMerge.test.js:460` |
| 4 | advisory | **Closed correctly.** `ROW_TABLE_IDS` (`:141`–`:145`) is scoped to the **24** ids reachable through `phaseMerge`, with row 23 exempted by explicit cross-reference in both the module docblock (`:130`–`:140`) and the assertion's own comment (`:421`–`:422`). Row 23 remains genuinely exercised in `haltAndQueue.test.js:374`–`:385`. This is the shape I asked for — the new assertion is not itself quietly wrong | `mergePhase.test.js:130`–`:145`, `:416`–`:424` |

## Nothing new broke

The remediation also carried two PM findings that touch `orchestrate-dev.js` (21 insertions), so I
checked them through the testing lens rather than waving them past:

- **`notes` hoisted above the `try`** so a note pushed before a later throw still reaches the caller
  on the row-`internal` outcome. Directly covered by a dedicated case —
  `mergePhase.test.js:687`, *"a note accumulated before an internal throw survives on the
  row-internal outcome"*, asserting `outcome.row === "internal"` at `:710` alongside the surviving
  note.
- **`aheadOfRemote` gated on `tree.ok && defaultBranch && !(rec && rec.detail)`.** Covered by
  `describe("… aheadOfRemote gating")` at `:430` with two cases, and — importantly for this lens —
  each pairs its absence assertion with a **positive** conjunct rather than standing alone:
  the §2.5 non-overwrite case asserts `toContain(MERGE_NOTES.nonOverwrite(FEATURE, detail))` next to
  its `not.toContain`, and the row-3/`O4`-unknown case asserts `mergeStatus === "merged"` and
  `row === "3"` next to the no-`null`-interpolation check. No absence-only oracle was introduced.

Test count moved 2929 → 2941 (+12), consistent with the two escalation anchors, six note anchors,
the completeness case and the three new gating/throw cases. No suite that was green went red.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| 5 | Low | Local | The row-23 exemption comment calls the cross-referenced coverage a *"PROP-M-17 row-23 **self-count**"* (`mergePhase.test.js:137`, `:422`). `haltAndQueue.test.js:374`–`:385` is a covering test with real positive assertions (`Object.hasOwn` × 3, `mergeStatus === "skipped"`, both SHAs `null`) but it is **not** a self-count — there is no case-count assertion there. The exemption is sound in substance and the coverage is real; only the word overstates what the cited test does. A one-word comment fix, explicitly **not** worth a review round on its own — fold it into any later touch of that file | `mergePhase.test.js:137`, `:422` |

## Positive Observations

- Deriving the harvested row id from each case's **own name** rather than from a parallel id argument is the detail that makes this device durable: there is no second source of truth to drift, and a malformed name throws at collection time (`:149`) instead of silently contributing nothing.
- Both fixes were verified by the same mutations I used to find the gaps, which is the cleanest possible closure — the v1 evidence and the v2 evidence are the same experiment with opposite outcomes.
- The remediation resisted the tempting shortcut on finding 1: asserting `COVERED_ROWS.length === 25` would have been a count that a duplicated row id could satisfy. Set-equality against the id list catches a dropped row *and* a mistyped one.

## Recommendation

**Approved**

Both blocking findings are closed and I confirmed each by re-running my own mutation rather than
reading the diff: the garble that previously shipped green now reds two named tests, and removing a
row case now reds the completeness assertion. Both advisories are closed, the row-23 exemption is
scoped correctly, and the two PM-driven source changes that rode along each landed with their own
falsifiable case, including positive conjuncts alongside every absence assertion. The suite is
2941 green against the one known environmental red, and `dist/` is in sync. One Low remains — a
single overstated word in a comment — which does not warrant another round.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 1}
