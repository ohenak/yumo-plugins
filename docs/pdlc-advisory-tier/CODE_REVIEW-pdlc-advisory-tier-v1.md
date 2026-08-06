# CODE REVIEW — pdlc-advisory-tier (v1)

Scope: Definition-of-Done verification of branch `feat-pdlc-advisory-tier` against diff base
`origin/main` (`6a4548d`), all six DoD criteria. Read-only: no production file, test, document
or generated artifact was modified by this review. Line citations are against the branch tip
(`git rev-parse --abbrev-ref HEAD` → `feat-pdlc-advisory-tier`; working tree clean but for the
untracked `.claude/`).

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-tier |
| Branch | feat-pdlc-advisory-tier |
| Review version | 1 |
| Date | 2026-08-05 |
| Verdict | **Findings** |
| Branch coverage (lowest new module) | 89.30% (`orchestrate-dev.js`); `orchestrate-queue.js` 89.46% |
| Requirements traced | 46/56 |

---

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Unwired integration | medium | `pdlc/workflows/orchestrate-dev.js:1799-1849` | `resolveAdvisoryRung`, `ADVISORY_RUNG_SKILL` and `ADVISORY_RUNG_PROMPT` are exported and fully unit-tested but have **zero production callers**. The only occurrence of the name outside its own definition is the prose comment at `:1795`. The live model-rung ladder is `dispatchViaRungLadder`, defined inside `runAdvisorySeam` at `:2959-2997` — a second, semantically *different* implementation (it classifies the rejection of the seam's real DIAGNOSE dispatch; `resolveAdvisoryRung` issues a discarded-output probe dispatch). Two ladders, one shipped, one tested. | Either delete `resolveAdvisoryRung` + its two constants and repoint `advisoryRung.test.js` at the shipped ladder, or make `runAdvisorySeam` call `resolveAdvisoryRung` so the tested code is the shipped code. Do not leave both. TSPEC §3.4's own text ("never a separate probe") argues for deletion. | Local |
| 2 | Unwired integration | medium | `pdlc/workflows/orchestrate-dev.js:2014-2026` | `refusalReasonFor(signals)` — AC-3.6's ordered first-match resolver over the frozen `ADVISORY_REFUSAL_REASONS` catalogue — has **zero production callers**. Its only other occurrence is the comment at `:1988`. Every refusal reason on the live path is a hard-coded string literal at the `terminate({...})` call sites (`:3140`, `:3156`, `:3187-3188`, `:3210`, `:3223`, `:3226`, `:3234`, `:3269`, `:3273`), so AC-3.6's "first matching trigger wins" precedence is an emergent property of straight-line control flow rather than of the catalogue that declares it. Reordering the catalogue array changes nothing on the production path — the very drift the catalogue exists to prevent. | Route the driver's terminations through `refusalReasonFor` (build the `signals` object at termination, per its own docstring), or delete it and move its `ADVISORY_REFUSAL_REASONS`-order test onto the driver. | Local |
| 3 | Unwired integration / spec divergence | **high** | `pdlc/workflows/orchestrate-dev.js:3280-3292` | `runAdvisorySeam`'s terminal `catch` returns an `escalated` disposition **by constructing the object literal directly, bypassing `terminate()`**. Consequences, all reproduced empirically against the shipped module (seam A2, high-confidence in-envelope verdict, `seamOps.apply` throwing a `TypeError`): the disposition is `{outcome:"escalated", reason:"unclassified-error", verdict:null, attempts:0}`, **`_appendFile` is called zero times** and **`_notice` is called zero times**. So: no `ADVISORY-{feature}.md` record (AC-9.1), no `docs/_queue/ESCALATIONS.md` entry (AC-10.1), no `ADVISORY ESCALATION:` report notice (AC-10.5). Additionally `reason: "unclassified-error"` is **not a member of** the frozen eight-member `ADVISORY_REFUSAL_REASONS` (`:1990-1999`), which AC-3.6 declares a *closed* set, and it contradicts TSPEC §17.3, which specifies this path carries "the **last computed refusal reason** (or `budget-exhausted` when none was computed)". `verdict: null` / `attempts: 0` also discard state the invocation actually had. This is the exact gap CR-v2's H-2 resolution claim ("`appendEscalationEntry` is now called from `terminate` on **every** `escalated` terminal disposition") does not cover: this path never reaches `terminate`. | Route the terminal catch through `terminate({...})` with the last computed reason (defaulting to `budget-exhausted` per TSPEC §17.3), preserving the last parsed `verdict` and the real `attempts`. `terminate` already owns the record write, the escalation append and the notice. | Local |
| 4 | Adjacent-surface falsification | medium | `pdlc/workflows/runtime-adapter.js:874-880` | This diff rewrote `rtAppendFile`'s dispatch prompt to assert, as fact, *"It **records the review's approval provenance — the content hash and reviewed commit** — by appending these lines to the end of `{path}`"*. The same function is bound as the single `_appendFile` transport at `:1097`, and this same branch adds **two new consumers of it that are not approval anchors at all**: the advisory record (`appendAdvisoryEntry`, `orchestrate-dev.js:2656`) and the escalation log (`appendEscalationEntry`, `:2778`). Two of three call sites are now misdescribed to the executing transport agent. This matters operationally rather than cosmetically: CLAUDE.md's own artifact-convention section documents that transport agents hesitate on appends whose stated purpose does not match what they are handed, and this text is the only purpose statement the agent sees. | Make the sentence describe the operation, not one caller's use of it (e.g. "It appends these lines to the end of `{path}` without altering anything already there"), or parameterise the purpose clause per call site. | Cross-Feature |
| 5 | Adjacent-surface falsification | low | `CLAUDE.md:177` | The new Advisory-tier section states the final report's `advisory` field is "`null` when disabled". Both writers emit **`undefined`**, not `null`: `orchestrate-dev.js:10644` and `:10676` (`advisory: advisoryTierOn ? advisorySummaryRows(...) : undefined`) and `orchestrate-queue.js:1109-1112`. A consumer written to the documented contract (`report.advisory === null`) reads false on every disabled run. | Correct the CLAUDE.md sentence to say the key is absent / `undefined` when disabled, or change the two writers to emit `null`. Prefer the doc fix — AC-1.6 asks only that the report "carries no advisory summary". | Cross-Feature |

### Criteria 1 and 3 — explicit passes

**Criterion 1 — no stubs in production code: PASS.** Every `TODO` / `FIXME` / `HACK` / `XXX` /
`placeholder` / `stub` / `dummy` hit across the four changed production sources
(`orchestrate-dev.js`, `orchestrate-queue.js`, `runtime-adapter.js`, `build-runtime.mjs`) is
either (a) inside a comment describing the mechanism, (b) inside the `dod-verify` dispatch prompt
text at `orchestrate-dev.js:7871-7916` (which necessarily names the patterns it asks an agent to
hunt for), or (c) the fence-aware `TBD`/`TODO` body detector at `:5015-5031`, which is a
completeness *oracle*, not a stub. No `NotImplementedError`, no `throw new Error("not
implemented")`, no coverage-exemption pragma. The `const waitMs = 0` stub CR-v1 recorded as H-1
is gone — replaced by `makeWaitAccumulator()` (`:2444-2453`), whose `waitMs()` is threaded into
the driver's `_waitMs` reader at all three `budgetExceeded` call sites (`:3149`, `:3180`,
`:3262`). Verified by reading the bodies, not the signatures.

**Criterion 3 — no mock/fake data in production code: PASS.** No `mock*` / `fake*` / `dummy*` /
`test_*` identifier, no hardcoded sample array, no `Math.random()`-minted id, no debug flag
pinned to a test value in any of the four production sources. `MODEL_ADVISORY = "fable"` /
`MODEL_ADVISORY_FALLBACK = "opus"` (`:1652-1653`), `ADVISORY_DEFAULTS` (`:1662-1667`) and
`ENVELOPE_DEFAULTS` (`:1660`) are declared defaults, which the criterion explicitly excludes.
All fixture data (`__tests__/fixtures/created-files-26c3f1c.json`,
`__tests__/fixtures/scanFixtures.js`, `__tests__/helpers/advisoryDoubles.js`) is under
`__tests__/` and correctly excluded.
`docs/pdlc-advisory-tier/MANUAL-VERIFICATION-pdlc-advisory-tier.md` recording `RESULT:
unverified — no runtime available` was examined and is **not** a mock-data violation: it records
the absence of a measurement rather than substituting a fabricated one, which is precisely what
the criterion's "what would a real user see?" test asks for. It is bound by
`pdlc/RELEASE-CHECKLIST.md:184-194` (§4c).

**Criterion 4 — branch coverage ≥ 85%: PASS.** Measured with the v8 provider over the two
changed workflow modules (`jest --coverage --coverageProvider=v8`):

| Module | % Branch | % Stmts | % Funcs |
|---|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | **89.30** | 96.87 | 93.42 |
| `pdlc/workflows/orchestrate-queue.js` | **89.46** | 93.72 | 75.38 |
| `pdlc/workflows/runtime-adapter.js` | 0 (measurement artifact — see below) | 0 | 0 |

`runtime-adapter.js`'s 0% is **not** a coverage gap. The adapter is deliberately not an ES module
(it is inlined verbatim by `build-runtime.mjs`), so `__tests__/helpers/adapterHarness.js` loads it
by evaluating its source text inside a `Function` with the five host globals bound. v8 cannot
attribute coverage to a source it never loaded as a module; the adapter's behaviour is exercised
by `adapterReadCache.test.js`, `mergeAdapter.test.js` and `runtimeBundle.test.js` against the
bytes that ship. Recorded so a future round does not re-open it.

Suite state: **82 of 83 suites pass; 3494 passed / 70 skipped / 3565 total.** The one failure is
`__tests__/documentOracles.test.js` AT-22, red **solely** on the untracked local file
`.tokensave/tokensave.db`, which `coveredViolations`' whole-tree walk finds carrying two of its
five patterns. Confirmed by reading the diff (the reported violation names that path and no
other) and by CLAUDE.md's own standing note on this exact class. Environmental; green in CI.

On property-based testing: the repo carries no `fast-check` (nor did it before this branch). The
advisory suites instead use exhaustive/parameterised oracles driven **off the exported frozen
catalogues** — e.g. `REASON_FIXTURES` in `advisoryDriver.test.js:263` is key-set-asserted against
`ADVISORY_REFUSAL_REASONS`, and `PROP-GATE-06` (`advisoryDriver.test.js:704-710`) asserts the
gate-exclusivity registry's key set equals `ADVISORY_SEAMS`. That is set-equality over the whole
input domain for the parameterisable surfaces here, consistent with every prior feature in this
repo, so it is not recorded as a gap.

---

## §2 Requirements Traceability

Every REQ acceptance criterion and NFR. `Gap? = YES` only where either the implementation path or
a test that could fail is missing. Test-side evidence: all 81 `T-nn-n` case ids declared in the
FSPEC are referenced somewhere under `pdlc/workflows/__tests__/` (verified by set difference), so
gaps below are ones where the *cited test does not exercise the production path*, not ones where
no case bearing the id exists.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | `MODEL_ADVISORY` names the Fable rung | `orchestrate-dev.js:1652` | PROPERTIES declares PROP-RUNG-01 (source scan for a bare literal) and PROP-RUNG-09 (workflow-level positive control naming `MODEL_ADVISORY` on the summary) owned by `advisoryRung.test.js`; that file contains 8 cases (`:46-200`) and **neither exists**. `grep -rn fable __tests__/` matches only `advisoryRung.test.js`'s own local transcription at `:37`. | **YES** | medium | Local |
| 2 | REQ AC-1.2 | `MODEL_ADVISORY_FALLBACK` used only on non-resolution, never implicit | shipped path: `dispatchViaRungLadder`, `orchestrate-dev.js:2974-2996` | `advisoryRung.test.js:97-121` (T-01-3) tests `resolveAdvisoryRung` (`:1822`), which is **not on any production path** (finding 1). The shipped branch `:2980-2995` is **uncovered** by the v8 run. | **YES** | high | Local |
| 3 | REQ AC-1.3 | Fallback emits `ADVISORY_MODEL_FALLBACK`, records, reports, proceeds | `orchestrate-dev.js:2981-2986` (emit + memo); record/report via `renderAdvisoryEntry:2614` + `advisorySummaryRows:2680` | same as row 2 — the emit assertion at `advisoryRung.test.js:98-121` targets the unwired copy; the shipped emit at `:2981` is uncovered | **YES** | high | Local |
| 4 | REQ AC-1.4 | Neither rung resolves ⇒ loud failure, no third fallback | `orchestrate-dev.js:2987-2994` (`haltError` naming both rungs) | `advisoryRung.test.js:123-148` (T-01-4) targets the unwired copy (`:1843`); the shipped halt at `:2989` is uncovered | **YES** | high | Local |
| 5 | REQ AC-1.5 | One constant per rung, referenced by every dispatch site in both modules | `orchestrate-dev.js:1652-1653`; queue side reaches it via `runAdvisorySeam` (`orchestrate-queue.js:1245`) | PROP-RUNG-01's declared source scan does not exist (row 1) | **YES** | medium | Local |
| 6 | REQ AC-1.6 | `enabled:false` ⇒ exact pre-feature behaviour, no artifacts, no summary | `orchestrate-dev.js:2940-2942` (driver early return before any dispatch); `:10644`, `:10676`; `orchestrate-queue.js:1109-1112` | `advisoryDisabled.test.js:381-471` (T-10-3, created-file set-equality against `fixtures/created-files-26c3f1c.json`), `:553` | No | — | — |
| 7 | REQ AC-1.7 | Four knobs in one `advisory` section of `.claude/pdlc.config.json` | `parseAdvisoryConfig`, `orchestrate-dev.js:1682`; `ADVISORY_DEFAULTS:1662`; `ADVISORY_CONFIG_PATH:1655` | `advisoryConfig.test.js` (T-01-1, T-01-6) | No | — | — |
| 8 | REQ AC-2.1 | `AdvisoryVerdict` carries seven fields | `parseAdvisoryVerdict`, `orchestrate-dev.js:1894` | `advisoryVerdict.test.js` | No | — | — |
| 9 | REQ AC-2.2 | Not-in-envelope **or** not-high ⇒ no action, escalate | `orchestrate-dev.js:3223-3226` | `advisoryDriver.test.js` PROP-LIFE-03 | No | — | — |
| 10 | REQ AC-2.3 | Malformed verdict ⇒ escalation, consumes one attempt | `orchestrate-dev.js:3187-3188` | `advisoryDriver.test.js`, `advisoryVerdict.test.js` | No | — | — |
| 11 | REQ AC-2.4 | Budget overrun ⇒ escalate, never spin | `budgetExceeded`, `orchestrate-dev.js:1982`; call sites `:3149`, `:3180`, `:3262` | `advisoryDriver.test.js` (T-02-4, T-02-5) | No | — | — |
| 12 | REQ AC-3.1 | Envelope declared in config, not agent-extendable | `ENVELOPE_DEFAULTS:1660`; `classifyEnvelope:2105` reads `ctx`, never the verdict's own `withinEnvelope` | `advisoryEnvelope.test.js` (T-03-8) | No | — | — |
| 13 | REQ AC-3.2 | Out-of-envelope change refused; a written one reverted | `orchestrate-dev.js:2105-2135`, revert via `doRevert:3001` | `advisoryEnvelope.test.js`, `advisoryDriver.test.js` PROP-LIFE-06 | No | — | — |
| 14 | REQ AC-3.3 | Four permitted actions, each with a decidable rule | E-1/E-2: `probeWorkflowRerun:2412`, `probeDefaultBranchChecks:2395`, `buildA5SeamOps:2455`; E-3: `buildA4SeamOps:2330`; E-4: `buildA2SeamOps` (`orchestrate-queue.js:794`) | `advisoryPubSeam.test.js`, `advisoryDodSeams.test.js`, `advisoryQueueSeams.test.js` | No | — | — |
| 15 | REQ AC-3.4 | Closed exclusion set (a)–(e) | `ADVISORY_EXCLUSIONS:2005`; `touchesTestArtifact:2048`; `touchesDodCriterion:2069`; `classifyEnvelope:2105-2135` | `advisoryEnvelope.test.js` | No | — | — |
| 16 | REQ AC-3.5 | Test-artifact touch ⇒ whole revert, escalate; each of the seven ops asserted | `TEST_TOUCH_OPERATIONS:2026-2035`; `:2112` | `advisoryEnvelope.test.js` | No | — | — |
| 17 | REQ AC-3.6 | Every refusal ⇒ the same triple; closed **ordered** eight-reason set | `ADVISORY_REFUSAL_REASONS:1990`; `terminate:3013-3081` | Partly. **Two defects:** (a) the terminal catch at `:3280-3292` produces an escalation carrying `"unclassified-error"` — outside the closed set — with **no** record and **no** escalation entry (finding 3); (b) `refusalReasonFor:2014`, the ordered resolver, is never called (finding 2). The set-equality test asserts the constant, not the production path. | **YES** | high | Local |
| 18 | REQ AC-4.1 | Never marks/weakens a DoD criterion | `touchesDodCriterion:2069`; A3 `permittedActions: []` (`buildA3SeamOps:2260`) | `advisoryDriver.test.js:618-637` (P-1) | No | — | — |
| 19 | REQ AC-4.2 | Never sets `ready: true` | `classifyEnvelope` membership + A2 declared scope (`orchestrate-queue.js:794`) | `advisoryDriver.test.js:639-662` (P-2) | No | — | — |
| 20 | REQ AC-4.3 | Never declares CI passed; `ciStatus` only from the GHA rollup | `raisePrAndVerifyCi` reads `_checkCi` only (`orchestrate-dev.js:8083-8092`); disposition carries no `ciStatus` | `advisoryDriver.test.js:664-676` (P-3); `advisoryPubSeam.test.js` | No | — | — |
| 21 | REQ AC-4.4 | Never merges a PR, never alters a queue `Status` cell | no merge/queue capability in any `SeamOps`; `phaseMerge` untouched | `advisoryDriver.test.js:678-702` (P-4) | No | — | — |
| 22 | REQ AC-4.5 | A gate re-runs after every applied resolution | per-seam `verifyGate` (`buildA2/A4/A5SeamOps`); `verifyGate: null` for A1/A3 | `advisoryDriver.test.js` gate-exclusivity registry + PROP-GATE-06 (`:704-710`) | No | — | — |
| 23 | REQ AC-4.6 | Each prohibition test asserts the **AC-3.6 positive triple on the same path** | — | `advisoryDriver.test.js:617-703`. All four cases (P-1…P-4) assert only conjunct 1 (`outcome === "escalated"`) plus catalogue membership of `disposition.reason`. **O-1 conjunct 2** (`PROPERTIES:277-280` — the *same* reason string byte-equal in the `ADVISORY-{feature}.md` `Disposition` row **and** the `ESCALATIONS.md` `Refusal reason` row) is asserted on **no** path in the suite: `grep -rn "Refusal reason" __tests__/` returns nothing. **O-1 conjunct 3** (the pre-advisory halt/skip still fired) is likewise unasserted — these are fake-`SeamOps` driver cases with no pipeline around them. | **YES** | medium | Local |
| 24 | REQ AC-5.1 | A1 adjudicates only a `needs-human` abstention; never overturns `blocked`; pre-check runs first | `precheckDependencies` (`orchestrate-queue.js:672`, called `:1197` **before** triage); `honourA1Verdict:709`; `:1214-1218` `blocked` returns before A1 | `advisoryQueueSeams.test.js` | No | — | — |
| 25 | REQ AC-5.2 | A2 re-diffs load-bearing citations, emits a re-grounding proposal | `buildA2SeamOps` (`orchestrate-queue.js:794`) | `advisoryQueueSeams.test.js` | No | — | — |
| 26 | REQ AC-5.3 | Location-only corrections in envelope; vanished symbol or requirement change escalates | A2 `permittedActions` + `classifyEnvelope` | `advisoryQueueSeams.test.js` | No | — | — |
| 27 | REQ AC-5.4 | At most one candidate picked per invocation, in queue order | `orchestrate-queue.js:1300-1317`, `:1338` (both `return runPicked(...)`) | `advisoryQueueSeams.test.js` | No | — | — |
| 28 | REQ AC-5.5 | Triage stop carries a machine-readable seam token; unrecognised ⇒ A1 | `parseTriageVerdict` (`orchestrate-queue.js:307`); routing `:1220-1222` | `advisoryQueueSeams.test.js` | No | — | — |
| 29 | REQ AC-6.1 | A3 classifies each remaining finding with evidence | `parseA3Classification:2169`; `buildA3SeamOps:2260`; root `:10338-10357` | `advisoryDodSeams.test.js:1035-1120` (T-05-2) | No | — | — |
| 30 | REQ AC-6.2 | All-`deferral-candidate` ⇒ propose bound deferrals and escalate, never enact | `governingClass:2209`; A3 `permittedActions: []` | `advisoryDodSeams.test.js:1250` (T-05-3) — asserts a byte-identical `QUEUE.md` and "no deferral row written" (`:1278`, `:1284`) | No | — | — |
| 31 | REQ AC-6.3 | Any `real-defect` ⇒ halt as today, classification attached | `summariseA3Classification:2239`, wired `:10356`; halt `:10364-10366` | `advisoryDodSeams.test.js:1035-1120` | No | — | — |
| 32 | REQ AC-6.4 | `mis-scoped-criterion` escalates | `governingClass:2209`; `touchesDodCriterion:2069` | `advisoryDodSeams.test.js:1299` (T-05-4) | No | — | — |
| 33 | REQ AC-7.1 | A4 inspects conflicting files vs branch-created set | `gatherA4Context:8750`; `buildA4SeamOps:2330`; root `:10280-10303` | `advisoryDodSeams.test.js` | No | — | — |
| 34 | REQ AC-7.2 | All-branch-created + high confidence ⇒ resolve, complete rebase, record file-by-file | `buildA4SeamOps:2330` (`apply`/`verifyGate`); `:10305-10313` | `advisoryDodSeams.test.js:1329` (T-06-2) | No | — | — |
| 35 | REQ AC-7.3 | Any shared-file conflict ⇒ escalate with hunks summarised | `classifyEnvelope` E-3 rule | `advisoryDodSeams.test.js:1385-1389` | No | — | — |
| 36 | REQ AC-7.4 | Applied resolution ⇒ tests re-run; failure reverts and escalates | A4 `verifyGate` via `_runCommand` (`buildA4SeamOps:2330`); `:3234`, `:3273` | `advisoryDodSeams.test.js` | No | — | — |
| 37 | REQ AC-8.1 | A5 retrieves the failing job log and diagnoses | `buildA5SeamOps:2455` (`gh run view --log-failed`); root `runA5AdvisorySeam` `:9670-9701` | `advisoryPubSeam.test.js:140-171` | No | — | — |
| 38 | REQ AC-8.2 | In-envelope ⇒ minimal fix, push, re-poll, up to `attemptBudget` act→re-poll cycles | `orchestrate-dev.js:8083-8092` (re-poll loop) + `:3262-3273` | `advisoryPubSeam.test.js` | No | — | — |
| 39 | REQ AC-8.3 | Never DoD-passed on bytes the DoD gate did not verify | `dodVerifiedCommit` captured `:10371-10377`, carried on the report | `advisoryPubSeam.test.js` | No | — | — |
| 40 | REQ AC-8.4 | Pre-existing default-branch failure ⇒ identify and escalate, comparison **before** E-2 | `probeDefaultBranchChecks:2395`; `buildA5SeamOps:2466` (probe before dispatch); pre-dispatch refusals `:2527-2535` | `advisoryPubSeam.test.js:140-171` (real `gh run list --branch main` probe asserted) | No | — | — |
| 41 | REQ AC-8.5 | Log unretrievable ⇒ escalate | `buildA5SeamOps` pre-dispatch `{__preDispatch:{outcome:"escalated"}}` (`:2527-2535`) | `advisoryPubSeam.test.js` | No | — | — |
| 42 | REQ AC-8.6 | No-checks ⇒ seam does not fire, existing pass stands, named in the summary | `advisoryPubOutcome.noChecks` set `:10462`, consumed `advisorySummaryRows:2712` | `advisoryPubSeam.test.js:188-200` (A5-6) | No | — | — |
| 43 | REQ AC-9.1 | **Every** advisory invocation appends a record | `appendAdvisoryEntry:2656` via `terminate:3027` | `advisoryRecord.test.js:127-160`. **Not total:** the terminal catch at `:3280-3292` returns without `terminate`, so an unclassified-failure invocation writes no record (finding 3, reproduced). | **YES** | high | Local |
| 44 | REQ AC-9.2 | Action-without-record is a defect; failed record write reverts, reason `record-write-failed` | `orchestrate-dev.js:3026-3032` | `advisoryDriver.test.js` (`record-write-failed` fixture) | No | — | — |
| 45 | REQ AC-9.3 | Record distilled to LEARNINGS and deleted after PUB, before MERGE, via the guard-covered channel | Phase H2, `orchestrate-dev.js:10479-10512` (`git rm`, `commitPaths`, push), strictly between PUB (`:10446`) and MERGE (`:10519`); guard extension `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35-70` | `advisoryHarvest.test.js` (PROP-HARV-01…05) | No | — | — |
| 46 | REQ AC-9.4 | Report advisory summary: five seams, zero counts included, model + fallback | `advisorySummaryRows:2680-2715`, driven off `ADVISORY_SEAMS:1669`; `:10644`, `:10676`; `orchestrate-queue.js:1109-1112` | `advisoryRecord.test.js:560-575`; `advisoryPubSeam.test.js:188-216` | No | — | — |
| 47 | REQ AC-10.1 | **Every** escalation appends an entry with eight fields incl. pipeline state | `renderEscalationEntry:2724`, `appendEscalationEntry:2778`, `ADVISORY_SEAM_PHASES:2799`, called from `terminate:3053-3081` | `advisoryEscalationLog.test.js`; `advisoryDodSeams.test.js:1173-1185`; `advisoryPubSeam.test.js:1079`. **Not total** — same terminal-catch bypass (finding 3). | **YES** | high | Local |
| 48 | REQ AC-10.2 | The decision sentence, one line, at the top | `escalationDecision:2822`; rendered first at `:2745` | `advisoryEscalationLog.test.js` | No | — | — |
| 49 | REQ AC-10.3 | Existing halt/skip behaviour unchanged | halts unchanged at `:10307-10311`, `:10364-10366`; queue `continue` at `:1324`, `:1334` | `advisoryDodSeams.test.js:1200`; `advisoryPubSeam.test.js:174-185` (byte-identical-halt negative controls) | No | — | — |
| 50 | REQ AC-10.4 | Append-only, newest-last, one entry per escalation | `appendEscalationEntry:2778` (append only, never read) | `advisoryEscalationLog.test.js:265-320` (PROP-ESC-03/04) | No | — | — |
| 51 | REQ AC-10.5 | Merge notice catalogue untouched; advisory notices under a distinct prefix sharing `ESCALATION:` | `ADVISORY_ESCALATIONS:1351`, adjacent to and not editing `MERGE_ESCALATIONS`; notice emitted `:3081` | `advisoryEscalationLog.test.js:431-436`; T-09-5. **Not total** — the terminal catch emits no notice (finding 3). | **YES** | medium | Local |
| 52 | REQ NFR-1 | Envelope enforced in script, never only in prompt | `classifyEnvelope:2105` decides membership from `ctx`, ignoring the verdict's own `withinEnvelope` (V-3) | `advisoryEnvelope.test.js` | No | — | — |
| 53 | REQ NFR-2 | Every REQ-ADV-04 prohibition has an explicit failing test | `advisoryDriver.test.js:617-703` | Tests exist but are weaker than AC-4.6 requires — see row 23 | **YES** (dup of row 23) | medium | Local |
| 54 | REQ NFR-3 | Additive: disabled run identical on named artifacts | `orchestrate-dev.js:2940-2942` | `advisoryDisabled.test.js:381-471`, `:553` | No | — | — |
| 55 | REQ NFR-4 | Seam budget excludes check-rollup wait; overrun ⇒ `budget-exhausted` | `makeWaitAccumulator:2444`; `budgetExceeded:1982`; `_waitMs` threaded `:2935`, `:9671` | `advisoryDriver.test.js` (T-02-5); `advisoryPubSeam.test.js` | No | — | — |
| 56 | REQ NFR-5 | No new credentials; never merges | only `_git` / `_ghRun` / `_agent`, all pre-existing transports; no merge capability in any `SeamOps` | `advisoryDriver.test.js:678-702` (P-4) | No | — | — |

**Traced: 46/56.** Gaps: rows 1, 2, 3, 4, 5, 17, 23, 43, 47, 51 (row 53 is a duplicate of row 23
and is not double-counted).

---

## §3 Criterion 6 — Integration-Boundary Integrity

**(a) Adjacent-surface falsification.** Two findings, both recorded in §1: finding 4
(`runtime-adapter.js:874-880` — the append transport's purpose statement is now false for the two
new advisory consumers it gained in the same diff) and finding 5 (`CLAUDE.md:177` — `null` vs
`undefined`). Everything else checked and **clean**:

- **Writers of every output the feature writes were enumerated.** `ADVISORY-{feature}.md`:
  written only by `appendAdvisoryEntry` (`:2656`), committed by `commitAdvisoryRecord`
  (`orchestrate-queue.js:1615`) and by Phase H2's `commitPaths` (`:10496`); no later stage
  overwrites it — H2 deletes it, which is AC-9.3's specified terminal state.
  `docs/_queue/ESCALATIONS.md`: written only by `appendEscalationEntry` (`:2778`), and
  `advisoryEscalationLog.test.js:265-282` (PROP-ESC-03) asserts positively that nothing in the
  tier reads it. `docs/_queue/QUEUE.md`: the advisory tier never writes it (AC-4.4), and
  `advisoryDodSeams.test.js:1278` pins that byte-for-byte.
- **Same-shape sibling families were enumerated.** All five members of `ADVISORY_SEAMS` have a
  composition root bound at a real call site — A1/A2 `orchestrate-queue.js:1223-1262`, A4
  `orchestrate-dev.js:10280-10303`, A3 `:10338-10357`, A5 `runA5AdvisorySeam:9670-9701` bound at
  Phase PUB `:10453-10455`. `advisoryDriver.test.js:704-710` enforces this by set-equality
  against `ADVISORY_SEAMS`, so a sixth seam reds the suite. The escalation-notice family
  (`MERGE_ESCALATIONS` / `ADVISORY_ESCALATIONS`) is handled per AC-10.5 — the merge catalogue is
  byte-unchanged and both prefixes carry the shared `ESCALATION:` token.
- **Recorded derivations re-measured.** `build-runtime.mjs --check` exits 0 with all four
  artifacts `in-sync`; `grep -c "import("` is 0 in both bundles, as are `process.` / `require(` /
  `fetch(` — the runtime's structural constraints hold at the current tip, not merely at the
  commit where the manifest was written.
- **Deliberately assessed and *not* recorded as findings.** (i) CR-v2's note that
  `docs/_queue/ESCALATIONS.md` is appended but never git-committed: this is specified, not
  omitted — TSPEC §10.1 prescribes an append and no commit, and TSPEC:1510 declares the file
  "new at runtime, in consuming repos — not tracked here". The append is wired and asserted
  end-to-end (`advisoryDodSeams.test.js:1173-1185`, `advisoryPubSeam.test.js:1079`), and the
  secondary worry that an untracked copy would trip `coveredViolations` does not hold: that
  oracle matches five specific stale-doc patterns (`lib/document-oracles.mjs:67-73`), none of
  which an escalation entry can contain. Not a criterion-2 or criterion-6 defect. (ii) CLAUDE.md's
  "Those three are the tracked, shipped outputs" omits `pdlc/workflows/dist/pdlc-cli.mjs` — but
  that file exists on `origin/main` (last touched there by `d186bfa`), so the claim was already
  stale before this branch. Pre-existing; out of scope for this diff. (iii) CR-v2's note on
  `ADVISORY_SEAM_PHASES` keying its members `id` rather than `phase` to dodge
  `dodPhase.test.js`'s source-scanning locator (`:2793-2798`): a real source-text coupling, but
  documented at the definition and falsifying no shipped surface. Advisory only.

**(b) Deferral binding.** **Clean.** Every deferral this feature introduces is bound:

| Deferral | Binds to | Bound? |
|---|---|---|
| D-ADV-01 (widen the envelope) | `pdlc-consolidation-agent` | Yes — `docs/_queue/QUEUE.md` row `Order 15` |
| D-ADV-02 (advisory in spec authoring) | declared **Closed, not deferred** | n/a |
| D-ADV-03 (learned confidence calibration) | `pdlc-consolidation-agent` | Yes — row 15 |
| D-ADV-04 (review-thread comments) | declared **Closed, not deferred** | n/a |
| D-ADV-05 (per-seam model selection) | `pdlc-consolidation-agent` | Yes — row 15 |

BL-01 (the `"fable"` alias unverified) is a dependency blocker, not a deferral of function: the
tier ships correctly on either rung by AC-1.2/AC-1.3 construction, with AC-1.4 keeping a wholly
unresolvable configuration a loud failure. It is recorded in
`MANUAL-VERIFICATION-pdlc-advisory-tier.md` (`RESULT: unverified — no runtime available`, with
the discharge procedure) and bound at `pdlc/RELEASE-CHECKLIST.md:184-194` (§4c). Accepted; **not**
counted as an unbound deferral. Note, though, that findings 1–3 give BL-01 a sharper edge than the
release checklist assumes: the ladder an operator would discharge §4c against
(`dispatchViaRungLadder`, `:2959-2997`) is not the ladder the suite is green on
(`resolveAdvisoryRung`, `:1822`).

`boundary_gaps` = **2** (findings 4 and 5). Sibling omissions: 0. Unbound deferrals: 0.

---

## Notes for the remediator

Suggested order — finding 3 first, then 1 and 2 together, then 4 and 5.

1. **Finding 3 is the only High and it is small.** Replace the object literal at
   `orchestrate-dev.js:3283-3291` with a `terminate({...})` call. Two things to get right: the
   reason must be the *last computed* one per TSPEC §17.3 (default `budget-exhausted`), which
   means hoisting a `lastReason` binding beside the existing `summary` binding at `:2938`; and
   `terminate` is currently *inside* the `try`, so calling it from the `catch` needs care that a
   throw from within it does not re-enter. Its own record-write failure path (`:3026-3032`)
   already handles the only realistic inner throw. Reproduce first: dispatch `runAdvisorySeam`
   for seam A2 with a high-confidence in-envelope verdict and a `seamOps.apply` that throws a
   `TypeError`, then assert `_appendFile` was called twice (record + escalation) and `_notice`
   once — today all three counts are zero.
2. **Findings 1 and 2 are one decision, not two.** Both are "the tested symbol is not the shipped
   symbol". Deleting `resolveAdvisoryRung` is the cheaper resolution and is what TSPEC §3.4's own
   wording implies, but it strands `advisoryRung.test.js` — so the deletion is only complete once
   T-01-2/-3/-4/-5/-7 are re-pointed at `runAdvisorySeam` driven with an `_agent` double that
   rejects with `unrecognised model alias "fable"`. That single change also closes traceability
   rows 2, 3 and 4, and covers `orchestrate-dev.js:2980-2995`, currently the largest uncovered
   error path in the advisory code. `refusalReasonFor` is the same shape and the same choice.
3. **Rows 1, 5 and 23 are test-side only** — no production change is needed. Row 23 wants the two
   missing O-1 conjuncts added to P-1…P-4 (or to one new case that drives a real seam end to end
   and asserts the reason string byte-equal in the disposition, the `ADVISORY-{feature}.md`
   `Disposition` row and the `ESCALATIONS.md` `Refusal reason` row). Rows 1 and 5 want
   PROP-RUNG-01's source scan and PROP-RUNG-09's workflow-level positive control, both of which
   PROPERTIES already specifies in full and neither of which exists.
4. **Do not re-open** the three items listed as deliberately assessed in §3(a), nor
   `runtime-adapter.js`'s 0% coverage reading, nor `documentOracles.test.js` AT-22 (untracked
   `.tokensave/tokensave.db`; green in CI). Each was checked and is recorded here so the next
   round does not spend the budget again.
5. **Rebuild `pdlc/workflows/dist/` in the same commit** as any production change above, per
   CLAUDE.md, and re-run `node pdlc/workflows/build-runtime.mjs --check`.

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 3, "coverage_below_threshold": false, "branch_coverage_pct": 89, "req_gaps": 10, "boundary_gaps": 2}
