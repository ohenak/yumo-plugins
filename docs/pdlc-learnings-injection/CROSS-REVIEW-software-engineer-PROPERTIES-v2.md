# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 2
**Delta base:** `9bea4fe8` (the commit at which v1 was written) → `f10dbd43` (HEAD)

## Delta Scope

`git diff 9bea4fe8..HEAD` on the document is **+243 / −83** over eleven revision commits. The changed
regions are: the Overview (property count, premise-table framing, pyramid split), Group A
(PROP-DISPATCH-03 rescoped, PROP-DISPATCH-08 added), Group B (PROP-CORPUS-01 home/subject), Group D
(PROP-BOUND-01 trace, PROP-BOUND-05 heading names, PROP-BOUND-07 literals, PROP-BOUND-08 added),
Group F (PROP-RECORD-09 instrumented), Group I (PROP-ISOLATE-02, PROP-FOOTPRINT-04), Group J
(owning-suite names, PROP-META-06 added), §O.1, §O.2, §O.7, §F.1, §F.3, §F.4, §C.2, §C.3, §C.4,
§G.2 and §G.3. Unchanged sections I approved at v1 were not re-read.

Every claim below was re-measured at HEAD on `feat-pdlc-learnings-injection`, not read off a document.

| New or changed claim | Result |
|---|---|
| `dispatchAndVerify` has exactly two call sites | **Confirmed** — `orchestrate-dev.js` `wrapped` (inside `reviewLoop`) and `wrappedDispatch` (inside `main`); every other occurrence of the identifier is prose in a comment |
| The wave path calls `agentFn("se-implement", waveImplementPrompt(task, featureName), …)` directly | **Confirmed** — exactly one such call site, and `waveImplementPrompt` is a real function in the same module |
| All 9 corpus documents carry the five BR-6 headings in numbered form | **Confirmed** — a literal match on `## 1. Non-Convergences`, `## 2. Cross-Feature Patterns`, `## 3. Rejected Proposals (with rationale)`, `## 4. Process Learnings`, `## 5. Open Items for Consolidation` returns **5 of 5 in 9 of 9** documents; **0 of 9** carry a bare `## Rejected Proposals` or `## Open Items` |
| §F.3's quotation of FSPEC BR-6 is verbatim, including the F-O-1 delegation | **Confirmed** — FSPEC BR-6's priority table and its "Which heading forms count as which section is F-O-1's" sentence match word for word |
| TSPEC's F-O-1 discharge covers only the document-shape predicate | **Confirmed** — TSPEC §D.3 is `LEARNINGS_HEADING_RE` / `looksLikeLearningsDocument`; §D.5 never states the section matcher. The §G.3 erratum is well-founded |
| `LEARNINGS_TARGET_DOCTYPES` is defined inside LI-15's sentinel span | **Confirmed** — PLAN LI-15 places the three frozen catalogues and `LEARNINGS_TARGET_DOCTYPES` in the region LI-11's static scan is asserted over |
| §4.1's declared thresholds are `maxDocuments: 5`, `maxBytesPerDocument: 6000`, `maxTotalBytes: 20000` | **Confirmed** — REQ §4.1 rows |
| `BYTES-BINDING`'s stated split (3 contribute / 5 `RSN-BYTES` / 0 `RSN-COUNT`) is arithmetically right | **Confirmed** — 8 × 7,000 each bounded to 6,000; 3 × 6,000 = 18,000 ≤ 20,000, the 4th overruns, contributing count 3 < `maxDocuments` 5 |
| The pyramid split 16 / 3 / 16 = 35 matches TSPEC §T.5 | **Confirmed** — §T.5 gives `learningsDispatchSet` 12 (L3), `learningsConfig` 2 (L3), `learningsRecord` 6 with AT-20/AT-22 at L3, `learningsCorpus` 3 (L2), `learningsSelect` 9 + `learningsBlock` 3 (L1); the straddle is real and correctly described |
| PLAN's manifest carries fourteen new test rows over fourteen files | **Confirmed** — PLAN §File-ownership manifest's own arithmetic paragraph says "fourteen test rows over fourteen files", and §C.4's enumeration now names exactly those fourteen |
| `F-O-8` no longer appears anywhere | **Confirmed** — zero occurrences |
| Property count is 69 | **Confirmed** — 69 distinct bullet-leading `PROP-*` definitions across Groups A–J |
| Every one of the 69 appears in §C.3's red or green column, with no undefined id | **Confirmed** — mechanical set difference in both directions is empty |
| No AC in §C.2 lost its last property | **Confirmed** — all 25 AC rows are non-empty after the five strikes |

## Prior Findings — Disposition

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
