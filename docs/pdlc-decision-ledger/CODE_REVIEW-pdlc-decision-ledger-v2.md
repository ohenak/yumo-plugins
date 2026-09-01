# CODE REVIEW — pdlc-decision-ledger (v2, re-verification of v1)

| Field | Detail |
|---|---|
| Feature | pdlc-decision-ledger |
| Branch | feat-pdlc-decision-ledger |
| Review version | 2 (delta re-verify of `CODE_REVIEW-pdlc-decision-ledger-v1.md`) |
| Date | 2026-09-01 |
| Remediation under review | `e707bb119` — *fix(pdlc-decision-ledger): DoD v1 remediation — thread `_log` + phaseId/docType/round into decision-ledger injector, populate `ruleInputs`, cover NTC-DECLEDGER-KEYTYPE run path and object-sink init (F-1..F-4)* |
| Verdict | Findings |
| Branch coverage (lowest module) | 89.01 % (`pdlc/workflows/orchestrate-dev.js`); lowest branch % in the c8 report is 87.73 % (`lib/escalation-view.mjs`), all ≥ 85 |
| Requirements traced | 38/39 (row 39 closed this round; one new boundary row opens) |

Scope: Local (all findings), except where a row says otherwise.

Evidence base (this round, HEAD `e707bb119`, clean working tree):

- `npm run test:coverage` in `pdlc/workflows`: **166/166 suites, 5263 passed / 70 skipped / 5333 total**, jest exit 0.
- `node pdlc/workflows/build-runtime.mjs --check`: **in sync** (`pdlc/workflows/dist/pdlc-cli.mjs` current; the remediation rebuilt it in the same commit).
- Delta-coverage gate (`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`), live merge-base with `origin/main` = `8f298525f99c`: **FAIL — 2 uncovered lines inside the introduced ranges** (was 9 in v1). See F-4 below.
- Load-bearing-oracle mutation checks (run in a throwaway detached worktree at the same commit, reverted after each): each remediation was individually reverted and the paired new test observed to go **RED**. Results in §1.

---

## §1 Re-verification of v1 findings

| v1 # | Criterion | Status | Production path (file:line) | Falsifying test | Mutation check |
|---|---|---|---|---|---|
| F-1 | Unwired integration — `_log` not threaded | **Closed** | `orchestrate-dev.js:15706–15713` — `main()` now passes its own `_log` into `buildDecisionLedgerInjector`, emitting `decision-ledger: phase {phaseId} {docType} (feature {f}) — corpus {outcome}`; a probe of the real `main()`-driven run shows **7** such lines (`R REQ`, `F FSPEC`, `T TSPEC` ×2, `P PLAN`, `PR PROPERTIES`, `CR -`) | `decisionLedgerMain.test.js:587–597` (T-18, asserts ≥1 `decision-ledger:` line on the run's own `_log` collector) | Deleting the `_log` property from `main()`'s injector construction → **RED** (1 failed / 9) |
| F-2 | Production seam passed only `{ feature }` | **Closed on the production path; see F-6 for the spec-side residue** | `orchestrate-dev.js:9994–9998` — `await _injectDecisionLedger({ feature, phaseId: phase, docType: roundDocType, round: iteration })`; all three identifiers are genuinely in `reviewLoop` scope and carry real values (probe: `phaseId` ∈ {R,F,T,P,PR,CR}, `docType` ∈ {REQ,FSPEC,TSPEC,PLAN,PROPERTIES,null-for-CR}, `round` ∈ {1,2}) — matching TSPEC §5.1's `phaseId: string \| null`, `docType: string \| null`, `round: number` | `decisionLedgerMain.test.js:599–621` (T-18) | Reverting the call site to `({ feature })` → **RED** (1 failed / 9) |
| F-3 | `sink.ruleInputs` never populated | **Closed** | `orchestrate-dev.js:15719–15727` — set once per run under `if (decisionLedgerInjectorFn)`, from `decisionLedgerConfigParsed.config`, mirroring the learnings analogue at `:15657–15663`; probe confirms `report.decisionLedger.ruleInputs = {thresholds:{maxEntries:70,maxBytes:12500}}` | `decisionLedgerMain.test.js:623–635` (T-18) | Renaming the assigned property to `ruleInputsMUT` → **RED** (1 failed / 9) |
| F-4 | Delta-coverage gate red (9 uncovered lines) | **Partially closed — gate still FAIL, 2 NEW lines** | see F-5 row below for the closed leg; see F-4 (new) below | — | — |
| §2 row 39 / PROP-CFG-08 F-5 leg | Run-level `NTC-DECLEDGER-KEYTYPE` never exercised through `main()` | **Closed** | `orchestrate-dev.js:15589–15596` | `decisionLedgerMain.test.js:552–580` (T-18, **set-equality** on `{NTC-DECLEDGER-KEYTYPE}`, plus the `maxEntries` detail substring and the flag-off byte-identity of `tPrompts`) | Neutralising the `invalidKeys.length > 0` guard to `if (false)` → **RED** (1 failed / 9) |
| F-4 leg (b) | Object-sink `dispatches` pre-init line unreachable from `main()` | **Closed** | `orchestrate-dev.js:2890` | `decisionLedgerInjector.test.js:454–473` (T-17, direct unit call with `sink = {}`) | Removing the `if (!Array.isArray(sink.dispatches)) sink.dispatches = [];` line → **RED** (1 failed / 20) |

### New findings in the remediation diff

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| F-4 (carried, new loci) | Coverage gap (delta gate still red) | medium | `pdlc/workflows/orchestrate-dev.js:15711`, `:15712` | `check-wave-resume-delta-coverage.mjs` now reports **FAIL — 2 uncovered lines in the introduced ranges**. v1's nine lines are all covered; these two are **new, introduced by the F-1 remediation itself**. Both are never-taken `??` fallback arms inside the new `_log` emitter, confirmed from `coverage/coverage-final.json`: branch `3825` (line 15711, cols 54–60 — the `"-"` arm of `dispatchPhaseId ?? "-"`) count `0`, and branch `3827` (line 15712, cols 42–48 — the `"-"` arm of `dispatchFeature ?? "-"`) count `0`. The gate counts a line uncovered when *either* a statement on it is zero-hit *or* a branch location on it was never taken (`check-wave-resume-delta-coverage.mjs:155–164`), so branch-only holes fail it. `dispatchDocType ?? "-"` is covered (count 7 — the CR-phase dispatch supplies `docType: null`); the shipped learnings analogue at `:15635–15641` carries the identical dead fallbacks, but it sits outside this feature's introduced ranges and so does not fail the gate. | Either (a) exercise the two arms — a dispatch whose `phaseId`/`feature` are genuinely nullish, most cheaply at the `buildDecisionLedgerInjector` unit level (`decisionLedgerInjector.test.js`) by handing the injector a `_log` spy and calling it with `{}`; or (b) drop the two impossible `??` fallbacks and keep only `dispatchDocType ?? "-"` (the sole nullish case the seam actually produces), which also removes the dead defensive code. Do not relax or re-pin the gate. | Local |
| F-6 (new) | Integration boundary — adjacent-surface falsification (criterion 6a) | low | `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md:389`, `:393`, `:984`, `:996`, `:1015`; `pdlc/workflows/__tests__/decisionLedgerLoop.test.js:7` | The F-2 fix closed the §5.1 half of v1's "declared and shipped must not disagree", but makes the **§4.4/§4.5/§7.4 half false**. TSPEC §4.4 (`:984`) and §4.5 (`:996`) still declare the seam as `null \| ((args: { feature: string }) => Promise<string>)`, §4.5's call-site snippet (`:1015`) is still `await _injectDecisionLedger({ feature })`, and the §7.4 call-graph diagram (`:389`, `:393`) still renders `injectDecisionLedger({feature})` — none of which is what ships after `e707bb119`. (The implementation's own JSDoc at `orchestrate-dev.js:2843` already declared `{feature, phaseId?, docType?, round?}` before the remediation, so this is a TSPEC-internal inconsistency, not a code one.) `decisionLedgerLoop.test.js:7` quotes the stale §4.5 type in its header comment and is the same disclosure family. No oracle pins these loci, so the suite stays green while the spec reads false to the next implementer. | Route a TSPEC erratum widening the §4.4/§4.5 seam type to `{ feature: string; phaseId?: string \| null; docType?: string \| null; round?: number }`, update §4.5's call-site snippet and the §7.4 diagram's two `injectDecisionLedger({feature})` nodes to the shipped argument set, and re-word `decisionLedgerLoop.test.js:7`'s quotation to match. No production change. | Local |

Criteria 1–3 on the remediation diff: **clean**. `git show e707bb119` touches four files — `orchestrate-dev.js` (+26/−1, two hunks read in full), the generated `dist/pdlc-cli.mjs`, and two test files. No `TODO`/`FIXME`/`HACK`, no `throw new Error("not implemented")`, no `placeholder`/`stub`/`dummy` identifiers, no hardcoded sample data, no new API clients or config seams. The two new production expressions are a live emitter and a config-derived `ruleInputs` object, both reached on the served path.

---

## §2 Requirements Traceability (carried forward from v1; only remediation-touched rows updated)

Rows 1–38 of `CODE_REVIEW-pdlc-decision-ledger-v1.md` §2 carry forward unchanged (`Gap? = No`), with these updates:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 34 | PROPERTIES PROP-WIRE (12) | Composition-root and loop wiring | `orchestrate-dev.js:9994–9998`, `:15694–15735`, `:18991–18994` | `decisionLedgerLoop.test.js`, `decisionLedgerMain.test.js` (T-18 ×4) | No — but see F-6 for the stale TSPEC §4.4/§4.5/§7.4 seam declaration this row's implementation now contradicts | low | Local |
| 39 | PROPERTIES PROP-CFG-08 (F-5 leg) | Run-level **set-equal** `{NTC-DECLEDGER-KEYTYPE}` on a wrong-typed key, named in the notice detail | `orchestrate-dev.js:15589–15596` | `decisionLedgerMain.test.js:552–580` | **No** (closed this round; mutation-verified) | — | Local |
| 40 (new) | TSPEC §5.1 `DecisionLedgerDispatchRecord` | `phaseId` / `docType` / `round` carry the dispatching round's real values | `orchestrate-dev.js:9995–9998` → `:2874–2884` (the `const record = { feature, phaseId, docType, round, … }` literal) | `decisionLedgerMain.test.js:599–621` | No | — | Local |
| 41 (new) | TSPEC §5.1 `DecisionLedgerSink.ruleInputs` | Thresholds in force disclosed once per enabled run | `orchestrate-dev.js:15719–15727` | `decisionLedgerMain.test.js:623–635` | No | — | Local |
| 42 (new) | TSPEC §7.2 observability row (`:1247`) | Per-dispatch `_log` line live in production, not only under doubles | `orchestrate-dev.js:15706–15713` | `decisionLedgerMain.test.js:587–597` | No | — | Local |

---

## Notes for the remediator

- **Only two items block a `passed` verdict**: F-4's two remaining delta-gate lines (`orchestrate-dev.js:15711–15712`) and F-6's stale TSPEC seam declaration. Neither is a behaviour defect — the shipped run does the right thing and is now pinned by four load-bearing tests.
- **Ordering suggestion**: do F-4 option (b) first (delete the two impossible `??` fallbacks). That is a one-line edit that both closes the gate and removes the dead defensive code, and it does not need a new test. If you prefer option (a), the injector-level `_log` spy is the cheaper locus than `main()`.
- **Remember `dist/`**: any edit to `orchestrate-dev.js` must be followed by `node pdlc/workflows/build-runtime.mjs` and staged in the same commit (`--check` is a required CI check).
- **Non-blocking observation, not a finding**: `decisionLedgerMain.test.js`'s `ENABLED_CONFIG_TEXT` uses `maxEntries: 70, maxBytes: 12500`, which are exactly `DECISION_LEDGER_DEFAULTS` (`orchestrate-dev.js:2468–2472`). The F-3 test therefore falsifies "`ruleInputs` is populated" (verified by mutation) but could not distinguish "populated from the parsed config" from "populated from the defaults". If a future round wants that discrimination, use non-default thresholds in one arm.
- **Push state**: this branch is `ahead 816, behind 758` of `origin/feat-pdlc-decision-ledger`. This review is committed locally only; pushing would need a force-push and is deliberately not done here.
