# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 8

## Delta scope

**The document under review did not move in this window.** `shasum -a 256` of
`TSPEC-pdlc-learnings-injection.md` at HEAD is
`eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3` — byte-identical to the
`APPROVAL-HASH` my v7 recorded against `REVIEWED-COMMIT: ccc739d1`. `git log ccc739d1..HEAD --
TSPEC-…md` is empty, and `git status` is clean, so there is no delta on this artifact to
delta-review. It is still v0.6, still carrying the v7 corrections I verified.

What *did* move in this window is upstream and adjacent:

- **FSPEC** `523e2df9` (v0.9 follow-through): the whole diff is two bookkeeping edits — the v0.9
  revision-history paragraph is moved below the v0.8-erratum paragraph and expanded to name the
  round that produced it, and the AC-6.2 traceability row's target string is corrected from
  `§Acceptance-test preamble` to `§Acceptance Tests preamble` (the heading that actually exists).
  No rule, AT, error-envelope row or locus assignment changed. FSPEC now hashes
  `764414d0…`; **REQ is unmoved** at `ff605dd3…`, the same bytes v7 reviewed against.
- **Implementation** `472e505c` (bounded restatement retry; grammar-clause leniency) touched
  `pdlc/workflows/orchestrate-dev.js`, shifting line numbers by roughly +40 to +145 in the
  regions this TSPEC cites. That moves anchors, not behaviour — see §Repository checks.

Under the decision freeze, the only blockable findings are a defect this revision introduced
(there is no revision) or a load-bearing claim now falsified by the repository or upstream at
HEAD. I re-verified every claim whose ground moved. None is falsified.

## Verification of my v7 findings

| v7 ID | Severity | State at HEAD |
|---|---|---|
| F-01 | Medium | **Still open, still non-gating.** §D.1 (`:588-594`) still requires "one test per domain" over four domains including `runMirror.corpusOutcome` "as a membership test only", while §A.5 (`:340-345`) still says no §T.6 fixture may assert on the mirror. FSPEC's BR-9 wording is unchanged by `523e2df9`, so the tension is exactly the one v7 described — a PLAN-author wording repair, not a broken oracle. |
| F-02 | Medium | **Still open, still non-gating.** §I.3 (`:441-448`) still keeps `present` as a report-shape field with no behavioural oracle beyond the shape assertion at `:966-968`. Unchanged bytes, unchanged disposition. |
| F-03 | Low | **Still open.** No closure test over `Object.keys(ruleInputs)` itself; the two per-locus tests upstream requires are present (§T.2 `:645-652`). Additive, as recorded. |

No v7 finding regressed, and none was silently dropped — the bytes carrying them are the bytes I
approved. The two v7 `DEFERRED:` items are likewise still open and still deferred.

## Repository checks at HEAD

Re-run against code, by symbol rather than by position, because `472e505c` shifted the file:

- **P-2a's "four code sites carry `dispatchKind: \"authoring\"`" is still true.** At HEAD the
  keyed sites are `orchestrate-dev.js:12861` (erratum author), `:12955` (erratum land-proof
  retry), `:13657` (phase creator inside `converge`), plus the positional argument at `:7663`
  (review-loop optimizer). Four sites, same four roles the TSPEC names; only the numbers moved.
- **P-3's funnel holds:** `async function dispatchAndVerify({…})` at `:8862` — the one anchor in
  that row that did *not* drift — and the authoring branch at `:8886`.
- **P-11/P-12's sibling parser holds verbatim:** `if (!isPlainObject(parsed) || !("advisory" in
  parsed)) return degraded(false)` at `:1980`, `ADVISORY_DEFAULTS` with `enabled: false` at
  `:1944-1949`, `export function parseAdvisoryConfig` immediately below it, and
  `parseImplementationConfig` at `:191` — the precedent REQ v0.9's fail-open resolution leans on.
- **The read/list/git seam contracts hold by symbol:** `defaultReadFile` (`:11553`),
  `defaultListFiles` (`:11626`), and the injectable `_readFile`/`_listFiles` defaults in
  `reviewLoop`'s destructure (`:7286-7287`). The *anchors* printed in §Architecture rows P-7, P-8,
  P-10 and in §T.6 (`:11513`, `:11658`, `:15167`, `:12110`, `:12915`) now point at unrelated lines
  after the shift; the behaviours they assert are still present at the renamed positions.
- **`advisoryDisabled.test.js:70` is still `import mainDev, * as dev from "../orchestrate-dev.js"`**
  — §T.5's import-pattern claim survives the code move.
- **FSPEC's two-loci contract is intact after `523e2df9`:** "The rule inputs sit at **two loci**"
  (`FSPEC` BR-10 body) and "BR-10 closes at two loci with one completeness test each" (revision
  history). §T.2's split — per-dispatch `orderKeys` set equality on `dispatches[i]`, run-level set
  equality over `Object.keys(ruleInputs.thresholds)` — still transcribes upstream exactly.
- **The bare-repository premise is still true:** `.claude/` carries only `pdlc.config.example.json`
  and no consumer `learningsInjection` section, so AC-1.1's fixture premise stands.
- **TSPEC front matter cites FSPEC v0.9 and REQ v0.9**, which are the versions at HEAD; the FSPEC
  edit did not bump the version, so no citation went stale.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Carried from v7 F-01, unresolved (document unmoved).** §D.1's fourth field domain (`runMirror.corpusOutcome`, "a membership test only") and §A.5's "no fixture in §T.6 may assert on it" cannot both be followed literally; a membership assertion is an assertion, and against an implementation that dropped the mirror it reads `undefined` and reds. Not blocking — the TSPEC carries the mirror, so the test is green against the design it governs — but PLAN reads two instructions and needs one. Resolution unchanged: guard the mirror domain test on the mirror being carried, or drop the fourth domain. | §D.1 `:588-594` vs §A.5 `:340-345` |
| F-02 | Medium | Local | **Carried from v7 F-02, unresolved (document unmoved).** `present` is carried in the returned shape with no consumer and no behavioural oracle beyond the shape assertion at §T.5 `:966-968`, while §I.3 states the gate is `config.enabled` **alone**. Either name a real consumer (the `NTC-MALFORMED`-vs-absent-section reporting split) or say plainly that `present` survives as parser-diagnostic state, tested only for shape. | §I.3 `:441-448`, §T.5 `:966-968` |
| F-03 | Low | Local | **Carried from v7 F-03.** No closure test over `ruleInputs`' own key set; nothing reds if a future rule input lands as a sibling of `thresholds` rather than inside it. Upstream requires two per-locus tests and gets them, so this is additive. | §T.2 `:645-652`, §D.2 `:598-612` |
| F-04 | Low | Process | **Positional anchors into `orchestrate-dev.js` drifted under `472e505c` and will drift again.** §Architecture P-2a/P-7/P-8/P-10, §T.6 and §Open Questions cite raw `file:line` anchors (`:13515`, `:11513`, `:11658`, `:15167`, `:12110`, `:12915`, …) that no longer point at the code they name; I re-verified every one of those claims by symbol and all hold, so nothing load-bearing is false — but per `DECISIONS-review-severity-bars.md` DEC-DOC-01 a raw `file:line` anchor that is not runtime-measured evidence is a `Process`/Low finding, and this is precisely the failure mode it predicts. When PLAN transcribes these rows, cite the symbol (`dispatchAndVerify`, `defaultReadFile`, `ADVISORY_DEFAULTS`) and keep the line as a hint only. | §Architecture P-2a `:48`, P-7 `:55`, P-8 `:56`, P-10 `:58`; §T.6 `:985`, `:1001` |
| F-05 | Low | Local | **Front-matter Cross-Reviews row stops at v6.** The header table lists `…-TSPEC-v1.md` through `…-TSPEC-v6.md`; the v7 pair (`CROSS-REVIEW-product-manager-TSPEC-v7.md`, `CROSS-REVIEW-test-engineer-TSPEC-v7.md`) exists on this branch and is not listed, and this v8 will not be either. Bookkeeping only — the round history the workflow reads is keyed by filename, not by this row. | Front matter, `:12` |

DEFERRED: §T.2's BR-10 locus-1 row still folds two distinct set equalities into one cell — worth two rows when PLAN transcribes it (carried from v7).
DEFERRED: §D.1's "four field domains" and §T.2's "three catalogues" still sit one line apart with no half-sentence explaining why the counts differ (carried from v7).
DEFERRED: convert the `orchestrate-dev.js` positional anchors to symbol citations at PLAN-transcription time rather than re-pinning them here (F-04's non-frozen half).

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v7 and still unanswered in the bytes: does the `DIVERGENT-CORPUS` fixture's dispatch 5 produce BR-8 rows "present and empty" **and** `corpusDiverged: true` — i.e. do both the corpus-outcome branch and the divergence comparison run on a dispatch whose listing failed? §A.5's rule defines `corpusDiverged` over `{corpusOutcome, orderKeys}`, so it should hold; one explicit sentence would save the implementer the derivation. Non-gating. |

## Positive Observations

- **The artifact held its ground through an upstream edit and a code move.** FSPEC re-ordered its
  revision history and fixed an AC-6.2 heading string; `orchestrate-dev.js` gained ~145 lines. I
  re-derived every claim whose ground shifted, by symbol, and the TSPEC's substantive assertions —
  four authoring dispatch sites, the single `dispatchAndVerify` funnel, the `parseAdvisoryConfig`
  precedent, the seam contracts, the two-loci BR-10 split — are all still true.
- **The v7 corrections are stable, not re-litigated.** The per-dispatch oracle loci, the split
  BR-10 completeness tests, and the `DIVERGENT-CORPUS` fixture's positive-conjunct shape are
  unchanged; nothing drifted back toward a run-level oracle or a containment-shaped closure.
- **The three open findings are all wording repairs.** None changes a fixture, a suite assignment,
  or the 2+9+3+3+6+12 = 35 AT closure — which I re-added and which still balances.

## Recommendation

**Approved with minor changes.** There is no delta on this document to fault: it is byte-identical
to the v7-approved bytes. The freeze's two blockable categories are both empty — no revision
introduced a defect, and no load-bearing claim is contradicted by the repository or by upstream at
HEAD, including the claims whose ground moved under `523e2df9` (FSPEC bookkeeping) and `472e505c`
(implementation), each re-verified above. F-01 and F-02 are the same non-gating wording repairs I
recorded in v7; F-03/F-04/F-05 are Low. Zero High findings, so this document is converged from the
testing lens and ready for PLAN.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
