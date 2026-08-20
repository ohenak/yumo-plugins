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

## Questions

## Positive Observations

## Recommendation

## Verdict
