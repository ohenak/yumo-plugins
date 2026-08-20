# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 2

## Verification

Delta scope: `git diff e2ccaa8..HEAD` on the document — 326 changed lines over ten commits
(`ffb05bd3` … `f10dbd43`). Only the changed sections were re-read. Every measured claim the delta
introduces was re-measured against the repository at HEAD on `feat-pdlc-learnings-injection`, not
read off a document.

| Claim the delta introduces | Re-measured at HEAD |
|---|---|
| §F.3: FSPEC BR-6's five names are `Cross-Feature Patterns`, `Non-Convergences`, `Rejected Proposals (with rationale)`, `Process Learnings`, `Open Items for Consolidation`, plus never-injected `Approval Record` | Verbatim match against FSPEC §BR-6's priority table (`FSPEC-pdlc-learnings-injection.md`, "BR-6 — What is injected from a document") — all six names and the `**never**` marker |
| §F.3 / PROP-BOUND-08: all 9 corpus documents carry the five headings in the `## N. Title` form, **9 of 9** for each; **0 of 9** carry a bare `Rejected Proposals` or bare `Open Items` | Exact-line `grep -qxF` over the 9 paths `LS_FILES_ARGV`'s two globs return: `## 1. Non-Convergences` 9, `## 2. Cross-Feature Patterns` 9, `## 3. Rejected Proposals (with rationale)` 9, `## 4. Process Learnings` 9, `## 5. Open Items for Consolidation` 9, `## 6. Approval Record` 7. The v1 measurement is now correct in both directions |
| PROP-DISPATCH-08: `dispatchAndVerify` has exactly two call sites — `reviewLoop`'s `wrapped` closure and `main()`'s `wrappedDispatch` | `grep -n "dispatchAndVerify("` returns three hits in `orchestrate-dev.js`: the definition, plus the `const wrapped = (…) => dispatchAndVerify({` closure inside `export async function reviewLoop({`, and `const episode = await dispatchAndVerify({` inside `async function wrappedDispatch({…})`. Exactly two call sites, both as named |
| PROP-DISPATCH-08: the wave path calls `agentFn("se-implement", waveImplementPrompt(task, featureName), …)` directly, and `PHASE_DISPATCH`'s comment names the four families sitting outside | Both hold: the direct `agentFn("se-implement", waveImplementPrompt(task, featureName)` call exists, and the comment above `PHASE_DISPATCH`'s constants reads *"four dispatches sit outside it — the ship-pr rebase/PR calls, the wave-mode se-implement and se-author calls, the DOD verify/remediate pair and the harvest distil call"* — the four families the property excludes, named by the module itself |
| §O.7: the per-document bound binds **9 of 9** locally, documents running 19,340–50,695 bytes of source against a 6,000-byte `maxBytesPerDocument` | `wc -c` over the 9 corpus paths returns exactly 19,340 … 50,695. Stronger than stated: extracting only the five priority sections leaves 13,196 … 41,180 bytes per document, so the bound binds 9 of 9 on **material** too, not only on source. The upper figure matches FSPEC BR-5's own "max 41,180" |
| §Fixtures: `BYTES-BINDING` = 8 documents × 7,000 injectable bytes under §4.1's declared values, expected split 3 contributing / 5 `RSN-BYTES` / 0 `RSN-COUNT` | REQ §4.1 declares `maxDocuments` 5, `maxBytesPerDocument` 6,000, `maxTotalBytes` 20,000. Each document bounds to 6,000; 3 × 6,000 = 18,000 ≤ 20,000 and a fourth would reach 24,000 — the split is arithmetically forced, and 3 < `maxDocuments` is exactly PROP-BOUND-02's claim |
| §C.4: 69 properties; fourteen new test files over fourteen PLAN manifest rows | 69 distinct `PROP-` bullets in `## Properties`, no duplicate id, matching §Overview and §C.4. PLAN §File-ownership manifest's arithmetic paragraph states "fourteen test rows over fourteen files"; the twelve suites plus `helpers/learningsFixtures.js` and `fixtures/learnings-baseline/` enumerated in §C.4 are those fourteen, and `ls pdlc/workflows/__tests__ \| grep -i learnings` is still empty at HEAD |
| §Overview pyramid: 16 / 3 / 16 = 35, `learningsRecord.test.js` straddling | TSPEC §T.5's table sums 2 + 9 + 3 + 3 + 6 + 12 = 35 with AT-20/AT-22 marked L3 — so L3 = 12 + 2 + 2 = 16, L2 = 3, L1 = 9 + 3 + 4 = 16. The document's figure and TSPEC's now agree |
| §Properties: `F-O-8` removed from PROP-BOUND-01's trace | Correct removal, not a coverage loss: `F-O-8` appears **nowhere** in FSPEC, TSPEC or PLAN — the v1 trace cited an id that does not exist upstream |

Mechanical checks over the whole document, since the delta rewrote the coverage matrix: all 25 REQ
acceptance criteria still carry ≥1 property after the five padded rows were struck; every property
in `## Properties` appears in §C.3's red/green ownership table (allowing for its range notation), so
the "Properties with **no** owning task | 0" row still holds at 69; and the new bidirectionality rule
§C.2 declares holds on 22 of its 25 rows (the three exceptions are F-01 below).

## Disposition of v1 findings

| v1 | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | §F.3 now transcribes the five names from FSPEC BR-6's table verbatim, including `Rejected Proposals (with rationale)` and `Open Items for Consolidation`, states the numbered `## N. Title` form BR-6 calls out, and replaces the falsified sentence with the true measurement (9 of 9 for each of the five; 0 of 9 for the bare forms) — which I re-measured and confirm. PROP-BOUND-05's third name is corrected. The structural half is closed too: **PROP-BOUND-08** drives `extractInjectableMaterial` over a real corpus document read from the live `LEARNINGS_CORPUS_ARGV` output, asserts the returned section set equal to the intersection of BR-6's names with the headings that document carries, requires that set non-empty, and asserts the document's own heading lines present in the fixture text. That is exactly the arm a fixture-and-matcher pair drifting to a common wrong spelling cannot green. It is owned red LI-08 / green LI-17 and carries no AT id, so §T.5's 35-member partition and `LI-T-SUITEMAP`'s disjointness are untouched |
| F-02 | High | **Resolved** | **PROP-META-06** now mechanises AC-6.1's first clause: over PROP-META-05's static directory walk, every enumerated `learnings*.test.js` file must be shown to construct a scripted double and none may reference a live transport symbol, asserted as set equality over the enumerated files with the walk's non-empty file set as positive control. §C.2's AC-6.1 row is rewritten clause by clause — clause 1 to PROP-META-06, clause 2 to PROP-ORDER-05's two-process comparison — and the misattributed "PROP-META-01 (no live-run comparison)" is gone. PROP-ORDER-05's text does assert what clause 2 requires (two compositions, two separate process invocations); only its trace line still omits the AC id (F-01 below, Low) |
| F-03 | Medium | **Resolved** | §Overview reads **69 properties** and §C.4 reads 69 with its provenance ("66 at v1, plus PROP-DISPATCH-08, PROP-BOUND-08, PROP-META-06"). I counted 69 distinct bullets, no duplicates |
| F-04 | Medium | **Mostly resolved** | All five padded rows are struck, the strike is declared in §C.2's preamble with the bidirectionality rule stated as a rule, and no AC lost its last property — I checked all 25. Three rows still violate the newly declared rule; refiled as F-01 below at Low, since the rule is now written down and the residue is trace-line bookkeeping, not a coverage hole |
| F-05 | Medium | **Resolved** | PROP-RECORD-09 is now instrumented on the same static walk, with the enumerated file set asserted non-empty and set-equal to PROP-META-05's operand as its positive control, and re-homed to LI-14 green-on-authoring (§C.3 updated on both sides: LI-10/LI-19 no longer claim it). §O.1 gains rows for all three static-scan absences plus a paragraph naming their shared vacuity mode. §G.2.3 keeps the prose as commentary rather than as the only home |
| F-06 | Low | **Resolved** | §C.4 now enumerates fourteen rows over fourteen files and says "fourteen", matching PLAN §File-ownership manifest's own arithmetic paragraph, and separately names the two existing files no task edits |
| F-07 | Low | **Resolved** | The pyramid reads 16 / 3 / 16 = 35 with the suite-by-suite derivation and an explicit note that `learningsRecord.test.js` straddles. Matches TSPEC §T.5 |
| F-08 | Low (Process) | **Resolved** | §F.4's four raw `file:line` anchors are gone, replaced by symbol names and, for the probe pattern, the verbatim import line. I found no new raw anchors anywhere in the delta — PROP-DISPATCH-08 states its HEAD measurement by symbol and by quoted comment text |

Three of my four v1 questions are answered in the delta as well: Q-01's framing-byte conflict and
Q-03's mutation-ledger ownership are both now stated as declared gaps in §G.2 (Q-03 explicitly names
PROP-META-04's three-step proof as a one-time **human** procedure recorded in LI-06's completion
note, which is the right place for a reader auditing residual risk), and Q-04's re-capture rule is
now pointed at from §G.2.4 as well as §F.2. Q-02 remains open and is restated below.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
