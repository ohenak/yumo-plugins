# CODE_REVIEW — pdlc-learnings-injection (v2)

| Field | Value |
|---|---|
| Feature | pdlc-learnings-injection |
| Branch | `feat-pdlc-learnings-injection` |
| Review version | 2 (delta re-verify of v1 at HEAD `67523a26`) |
| Date | 2026-08-21 |
| Reviewer role | dod-verify (Constructive Verifier) |
| Verdict | **PASS** |
| Branch coverage (lowest included module) | **88.23%** — `build-runtime.mjs`; `orchestrate-dev.js` / `orchestrate-queue.js` 88.75%; `capture-learnings-baseline.mjs` 89.47% |
| Coverage gate | `npm run test:coverage` exit **0** (stage 1 aggregate + stage 2 `--per-file --branches 85`) |
| Suite | 117 suites / 4388 tests passed, 0 failed, 0 live skips in `learnings*.test.js` |
| Requirements traced | 25 / 25 clean |
| req_gaps | 0 |
| boundary_gaps | 0 |

Scope legend: **Local** = fixable inside this feature's diff; **Cross-Feature** = touches a
surface shared with another feature or an already-merged convention; **Process** = a deferral,
disclosure or gate arrangement rather than a code defect.

This is a **delta re-verify**, not a full six-criteria rescan. v1 carried exactly one open
finding (G1). The remediation diff is `415c87ab..67523a26` — three files, 149 insertions,
2 deletions. Unchanged code already verified in v1 was not re-scanned; the §2 traceability
table is carried forward with no row disturbed.

---

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|

*(Empty — no violation in criteria 1–6.)*

## §1a Prior-Round Finding Disposition (v1 → HEAD)

The row was verified to a production code path **and** an oracle whose contents would fail if
the fix broke. Because the remediation introduces a **new invariant** (doc `@param` key sets
must equal destructured key sets across the region), the load-bearing oracle was verified **by
mutation**, not by reading it.

| v1 # | Criterion | Fix location | Verified how | Status |
|---|---|---|---|---|
| G1 | 6(a) — stale `@param` on `selectLearnings` | `pdlc/workflows/orchestrate-dev.js:2425` — the `@param` record now reads `{{entries: object[], thresholds: object}}`, matching the `({ entries, thresholds })` signature at `:2427`. Bundle regenerated in the same commit (`dist/pdlc-cli.mjs:2431`). | **Mutation-verified.** Restoring `feature: string,` to the `@param` record turns `__tests__/learningsDocSignature.test.js` **RED on 3 of its 4 tests**; reverting the mutation returns it to green with a clean `git diff`. The oracle is not assertion-free and not stub-backed. | **Remediated** |

**The new invariant ships its own falsifying test.** `learningsDocSignature.test.js` (LI-T-DOC-1,
4 tests) is **derived, not transcribed**: it re-reads `orchestrate-dev.js`, locates the LEARNINGS
INJECTION REGION by its sentinel comments, and for **every** function in the region compares the
key set its JSDoc object-literal `@param` names against the key set it actually destructures.
So a *future* member that drifts reds here too — the fix closes the family, not just G1's member.
It carries two vacuity controls: a positive one (the region must be found and must contain more
than three functions, at least one bearing an object-literal `@param`), and a **negative control**
that plants G1's exact stale key back into an in-memory copy and requires the checker to name
`selectLearnings` and only `selectLearnings`. A checker that silently matched nothing — the usual
failure mode for source-derived oracles — cannot pass.

## §2 Remediation-Diff Scan (`415c87ab..67523a26`)

Scanned **only** the diff, per the delta contract.

- **Criterion 1 (stubs).** No `TODO`/`FIXME`/`HACK`/`XXX`/`NotImplementedError`/"not implemented"
  in the diff. No coverage-exemption pragma (`c8 ignore`, `istanbul ignore`, `pragma: no cover`)
  introduced. No live `describe.skip` / `test.skip` / `.todo` added — a repo-wide grep for
  live skip calls across `learnings*.test.js` returns nothing (the two `describe.skip` hits in
  `learningsConfig.test.js` are prose comments recording the RED-authoring history, unchanged
  by this diff).
- **Criterion 2 (unwired).** The diff wires no new integration. The one production change is a
  comment. The new suite is discovered by jest's default `__tests__` glob and was observed
  executing in the full run (117 suites, up from 116).
- **Criterion 3 (mock data).** The only literal data added is the negative control's planted
  `@param` string, which lives in a test file and exists precisely to be detected.
- **Criterion 4 (coverage).** `npm run test:coverage` exits **0**. Numbers are byte-identical to
  v1's — expected, since the production change is a comment and the addition is an instrument,
  not a subject. Every included module clears the 85% branch floor under stage 2 `--per-file`.
- **Criterion 5 (requirements).** No behavioural change; no §2 row's implementation or test path
  moved. `selectLearnings`'s signature and body are untouched by this diff.
- **Criterion 6 (boundary).** See §3.

No regression, no new stub, no new mock datum, no new unwired integration.

## §3 Integration-Boundary Verification

- **Adjacent-surface falsification — none introduced.** The diff's production change *removes* a
  falsehood rather than creating one. Re-running v1's mechanical `@param`-vs-signature comparison
  across the whole region — now automated as LI-T-DOC-1 — returns an empty drift list, so the
  four-member family (`selectLearnings`, `renderLearningsBlock`, `gatherLearningsCorpus`,
  `buildLearningsInjector`) is consistent. v1's note 2 instruction ("re-run the comparison if the
  fix touches any other signature") is satisfied and is now permanently enforced by an oracle.
- **Sibling surface: the bundle.** `orchestrate-dev.js` and `dist/pdlc-cli.mjs` are a
  two-member writer family; both were updated in the same commit and
  `node pdlc/workflows/build-runtime.mjs --check` reports **`in-sync`** (exit 0). The
  rebuild-and-stage obligation (DEC-08) is met — a source-only edit would have halted the wave gate.
- **Sibling surface: the suite-map closure.** Adding a file to `__tests__/learnings*.test.js`
  runs straight at `learningsSuiteMap.test.js`'s directory-wide closure, which partitions the 35
  `LI-AT-` ids over exactly six AT-bearing suites. The new suite titles its tests `LI-T-DOC-1`,
  registering **zero** `LI-AT-` ids, so it is correctly excluded from the contributing set —
  the same convention `learningsSuiteMap`, `learningsArmInventory` (`LI-T-ARMS`) and
  `learningsErratumBinding` (`LI-ERR-`) already follow. `LI-T-SUITEMAP` passes; the closure,
  the disjointness check and the 35-member union are all still green.
- **Deferral binding — none introduced.** The diff adds no "deferred", no TODO-with-successor,
  no DECISIONS deferral entry. v1's two closed deferrals (F11, F12) remain closed and remain
  guarded by `learningsErratumBinding.test.js` `LI-ERR-04`/`LI-ERR-05`.
- **Report/prompt writers — undisturbed.** `report.learningsInjection` still has exactly one
  writer and the prompt suffix exactly one appender; this diff touches neither.

**Observation, not counted.** The new suite's header comment cites
"CODE_REVIEW v2 §1 G1", but G1 was recorded in CODE_REVIEW **v1** §1 (this document, v2, records
it in §1a). The repo's convention elsewhere names the document the finding lives in — e.g.
`advisoryHelperProperties.test.js:1` ("CODE_REVIEW v1 §1 finding 3"). This is a provenance
imprecision in a **test-file comment**: it falsifies no pre-existing surface (criterion 6(a)
governs surfaces the diff makes false, and this comment is new), and test files are outside the
criteria 1–3 scan surface. It is therefore recorded here rather than counted as a finding —
the same disposition v1 §3 gave the inherited `package.json` "CODE_REVIEW v2 §1-1" citation.
A future editor may correct it opportunistically; nothing on the branch depends on it.

## §4 Requirements Traceability (carried forward from v1)

The remediation was documentation-only and moved no row. All 25 REQ acceptance criteria remain
traced to both a production path and a failing-capable oracle; the `Gap?` column is `No` for
every row, unchanged from v1. The full table stands as recorded in
`CODE_REVIEW-pdlc-learnings-injection-v1.md` §2 and is not re-transcribed here.

**Rows the remediation touched:** none. G1 was a JSDoc line adjacent to row 5's implementation
path (`selectLearnings` window logic, `dev:2427+`); the function's signature, body and tests are
byte-identical across the diff, so row 5's trace is undisturbed and remains `Gap? = No`.

**Writer enumeration re-confirmed.** `report.learningsInjection` is assigned once
(`orchestrate-dev.js:14106`), threaded to six `buildFinalReport` call sites and read at `:17130`;
no later stage rebinds it. The traced artifacts remain the final operator-visible ones.

| # | Source | Criterion / AC | Gap? | Severity | Scope |
|---|---|---|---|---|---|
| 1–25 | REQ AC-1.1 … AC-6.2 | see v1 §2 for per-row implementation and test paths | No (all 25) | — | — |

## Notes

1. Nothing on this branch requires further work. G1 is remediated to the evidence bar
   (production path **and** a mutation-proven oracle), and the fix generalised the check to the
   whole `@param` family rather than patching one line.
2. Nothing in this review was fixed. This document is evaluation only.
