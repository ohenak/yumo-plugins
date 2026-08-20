# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 1

## Verification Performed

Every premise below was re-measured against the working tree at
`e2ccaa8` on `feat-pdlc-learnings-injection`, not read off a document.

**Overview premise table — all confirmed.**

| PROPERTIES claim | Result |
|---|---|
| `dispatchAndVerify` destructures `dispatchKind` and `docType` | Confirmed — `orchestrate-dev.js`, `async function dispatchAndVerify({...})`, params include `docType` and `dispatchKind` |
| A literal grep for `dispatchKind: "authoring"` returns 3, not 4 | Confirmed — exactly 3 object-literal sites, in `erratumRound` (the `erratumAuthorPrompt` dispatch and the land-proof retry) and in `converge`'s creator; the fourth is the positional `"authoring"` argument to `runWrapped(optimizer, optPrompt, doc, "authoring", …)` inside `reviewLoop`, and `wrapped` forwards `docType: roundDocType` |
| Phase CR reaches the composition site with `docType: null` | Confirmed — the `reviewLoop` call in `main()`'s Phase CR block passes `phase: "CR"` with `docType: null`, and `roundDocType` is that `null` |
| Phase H reaches it with `docType: "LEARNINGS"` | Confirmed — exactly one `docType: "LEARNINGS"` site, alongside the sole `dispatchKind: "harvest"` |
| `consolidate-learnings.js` keeps `LS_FILES_ARGV` module-private and exports `enumerateCorpus(_git)` | Confirmed |
| The engine vendors only `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` | Confirmed in `pdlc/engine/scripts/prepack.mjs` |
| `defaultReadFile` returns `null` on a caught error; `rtReadFile` throws | Confirmed — both shapes are real |
| `buildFinalReport` takes `notices = []` and spreads `advisory` conditionally | Confirmed |
| `MERGE_CONFIG_PATH = ".claude/pdlc.config.json"` | Confirmed |
| The corpus at HEAD is 9 documents, all well-formed | Confirmed — the exact predicate returns 9 paths; all 9 open `# LEARNINGS — {feature}` and all 9 carry a **bare** ISO `Date Completed` value on line 7 |
| Zero line-initial gate tokens in the shipped corpus | Confirmed — no corpus document carries a line-initial `VERDICT:`, `ERRATUM:` or `REVISION-COMPLETE:` line |
| `git check-ignore -v .baseline-worktree` exits 1 | Confirmed |
| `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` | Confirmed in `pdlc/workflows/lib/document-oracles.mjs` |
| No `learnings*` test file exists; no root `scripts/` directory | Confirmed for both |
| `orchestrate-dev.js` is 15,311 lines; the gate is `--per-file --branches 85` | Confirmed |

**Traceability closure — mechanically checked.**

- **REQ ACs:** all 25 (`AC-1.1 … AC-6.2`) appear in §C.2. No AC uncovered, no invented AC.
- **FSPEC BRs:** all 16 (`BR-1 … BR-16`) are cited. No BR uncovered.
- **FSPEC edge cases:** every `E-*` cited resolves to an FSPEC `E-*`. No dangling id.
- **`C-*`, `NG-*`, `G-*`, `DC-*`, `DEC-*`:** every id cited resolves upstream.
- **ATs:** FSPEC and TSPEC each carry exactly 35 `AT-*`; §C.1 maps all 35, and the suite split `2+9+3+3+6+12` sums to 35.
- **PLAN tasks:** PLAN's table carries exactly `LI-01 … LI-23`; §C.3 lists all 23, and **every one of the 66 defined properties appears in a red or green column** — no orphan property.
- **Property count:** 66 distinct `PROP-*` ids are defined across Groups A–J, matching §C.4's `66` and contradicting the Overview's `47` (F-04).
- **Catalogues:** TSPEC's frozen sets are 6 reject reasons, 2 corpus outcomes, 2 notices — matching PROP-RECORD-03, PROP-RECORD-04 and PROP-CONFIG-07. `RSN-TRUNCATED` appears only as the negative PROP-CORPUS-07 forbids, correctly paired with positive acceptance clauses.
- **Test files:** `consolidationPredicate.test.js` and `helpers/seams.js` (`fakeFs`, `fakeGit`) and `helpers/consolidationDoubles.js` all exist at HEAD; the twelve `learnings*.test.js` suites, `helpers/learningsFixtures.js`, `fixtures/learnings-baseline/` and `scripts/capture-learnings-baseline.mjs` are all explicitly planned as new in PLAN's file-ownership manifest. **No property names a test file the PLAN does not create** — but four of the twelve are never named here at all (F-05).

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
