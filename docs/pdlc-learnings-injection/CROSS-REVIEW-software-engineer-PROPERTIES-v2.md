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

| v1 | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §F.1's `BYTES-BINDING` row is now "8 documents of 7,000 injectable bytes each" with §4.1's values spelled out and the expected split stated as a literal (3 contribute / 5 `RSN-BYTES` / 0 `RSN-COUNT`), matching PROP-BOUND-02 and TSPEC §T.4. The arithmetic checks. The row also now names what the two-document shape could not falsify — back-fill needs a document ranked below the byte cut — which is the clause PROP-BOUND-04 depends on |
| F-02 | High | **Resolved** | PROP-FOOTPRINT-04 is restated as "no filesystem module reference is reachable from this span" rather than an enumerated token list, and carries both controls: positive (the region must contain `LEARNINGS_TARGET_DOCTYPES`, which PLAN LI-15 does place inside the sentinels) and negative (the same scanner must red on a planted `fs.writeFileSync`). It now has a row in §O.1, and §O.1 gained a paragraph naming the shared vacuity mode of the three static-scan absences. See F-03 below for one residual on the anchor's uniqueness |
| F-03 | High | **Resolved** | PROP-DISPATCH-03's operand is now stated — the `dispatchAndVerify` episodes whose `(dispatchKind, docType)` pair fails `injectHere`, observed on the `_recordDocType` probe — and the four unreachable families are moved into the new structural PROP-DISPATCH-08, which asserts the two-call-site set equality and that the four families call `agentFn` directly. Both halves of that claim re-measured true at HEAD. §O.2's pairing row is updated to say the rejected population is asserted **non-empty** rather than assumed, which is the conjunct that stops the byte-identity half going vacuous |
| F-04 | Medium | **Resolved** | Overview reads **69 properties**; §C.4 reads 69 with the three additions named; I counted 69 |
| F-05 | Medium | **Resolved** | All five prose-named suites now carry their owning file and task in the property text (`learningsPremises.test.js` LI-01, `learningsCaptureScript.test.js` LI-03/04/05, `learningsBaselineGuard.test.js` LI-06, `learningsSuiteMap.test.js` LI-14, `learningsPredicatePin.test.js` LI-13). §C.4's "Two named test files" lead-in is replaced by an enumeration of all fourteen manifest rows, and PROP-CORPUS-01 now distinguishes its **home** (`learningsPredicatePin.test.js`, new) from its **subject** (`consolidationPredicate.test.js`, existing, never edited) in the property's own parenthetical |
| F-06 | Medium | **Resolved** | `F-O-8` is gone; PROP-BOUND-01 cites `F-O-7` |
| F-07 | Medium | **Resolved** | PROP-BOUND-07's two conjuncts are restated as hand-computed literals transcribed at fixture-authoring time, with the identity-echo failure mode and M-5 named explicitly, and the framing cost stated as its own literal so the test proves the two numbers differ. PROP-BOUND-03's generated-inequality distinction is preserved in §O.9 |
| F-08 | Medium | **Resolved** | PROP-ISOLATE-02 now enumerates five named scored artefacts, asserts set equality member-for-member across the two arms **and** non-emptiness of each set on both arms, and replaces the prose SKILL.md clause with a SHA-256 digest equality over `git ls-files pdlc/skills/**` against a hand-transcribed manifest. It has a §O.1 row |
| F-09 | Low | **Resolved** | §F.4 cites `fakeFs`, `fakeGit` and the `advisoryDisabled.test.js` import by symbol and by verbatim quotation; no raw `file:line` anchors remain in it. It also gained the `learningsPredicatePin.test.js` exception, which is a genuine clarification I did not ask for |
| F-10 | Low | **Resolved** | §G.2 gap 4 now carries PROP-META-04's three-step human mutation proof, its LI-06 completion-note home, and its checkable standing counterpart |
| F-11 | Low | **Resolved** | §O.7 marks `87 of 89` as inherited from FSPEC BR-5 with its two-repository basis named and the TE re-derivation acknowledged, and states the locally checkable form (9 of 9 here, 19,340–50,695 bytes against a 6,000-byte bound) as the one the argument rests on |
| Q-01…Q-04 | — | **Answered** | Q-01 by §C.3's LI-16/LI-17 split rows; Q-03 by the Overview's new "capture-time measurement, not a standing invariant" paragraph naming both scheduled falsifications. Q-02 and Q-04 are not answered in the text and are not gating; Q-02 is re-asked below |

All three v1 High findings are resolved, and none of the five Mediums is left open.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
