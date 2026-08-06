# CROSS-REVIEW — Final Codebase Review (Phase CR) — pdlc-advisory-tier — v2 (delta)

**Reviewer role:** Final Codebase Review (Phase CR)
**Date:** 2026-08-05
**Round:** 2 (delta review of the v1 remediation)

Scope: delta range `decaec7..10850868` on branch `feat-pdlc-advisory-tier` — two
commits: `5759526` (`fix(pdlc-advisory-tier): CR v1 remediation — A5 composition
root, escalation log, A3 classification, S-3 report fields (H-1..H-3, M-1..M-3)`,
5 files, +1062/−21) and `1085086` (`chore(pdlc-advisory-tier): CR remediation
build outputs`, 4 generated artifacts). Reviewed against
`CROSS-REVIEW-final-codebase-pdlc-advisory-tier-v1.md` (VERDICT: Needs revision —
H-1, H-2, H-3, M-1, M-2, M-3 blocking; L-1…L-4 advisory). Judged exactly two
things: (1) whether each blocking finding is resolved in **production** code, and
(2) whether the revision broke anything v1 recorded as verified green. No new
front was opened. Read-only review; no production code, test, document or
generated artifact was modified. Line citations are against the tree at
`10850868`.

## Resolution table

| ID | Severity | Status | Production evidence |
|---|---|---|---|
| H-1 | High | **Resolved** | `runA5AdvisorySeam`, the A5 composition root, is defined in `main()` at `pdlc/workflows/orchestrate-dev.js:9670-9701`: it calls the new `gatherA5Context({_git: gitFn})` (`:8819`) for `defaultBranch` / `mergeBase` / `preSeamHead`, constructs the seam via `buildA5SeamOps({… recordWait: wait.recordWait, _git: gitFn, _ghRun: ghRunFn, _checkCi: checkCiFn})` (`:9673-9683`), and threads the full driver parameter set — `seamOps`, `config: advisoryConfigResult.config`, `rungState: advisoryRungState`, `_agent`, `_appendFile`, `_writeFile`, `_readFile`, `_git`, `_log`, `_now`, `_sleep`, `_notice`, `_waitMs` (`:9684-9700`). It is bound at Phase PUB's real call site **behind the tier flag**: `...(advisoryTierOn ? { _runAdvisorySeam: runA5AdvisorySeam } : {})` (`:10453-10455`), so tier-off leaves `raisePrAndVerifyCi`'s inert `escalated` default (`:8052`) in place. All transports resolve in scope (`checkCiFn :8881`, `writeFileFn :8888`, `appendFileFn :8889`, `ghRunFn :8892`, `advisoryConfigResult :9631`, `advisoryTierOn :9634`, `advisoryRungState :9638`). **The `const waitMs = 0` stub is gone**, replaced by `makeWaitAccumulator()` (`:2444`) — one accumulator per seam invocation (constructed inside the closure, `:9671`), `recordWait` into the seam and `waitMs()` into the driver's `_waitMs` reader, consumed by all three `budgetExceeded` call sites (`:3149`, `:3180`, `:3262` — previously the literal `0`). End-to-end oracle drives `dev.default(...)` with the tier enabled and asserts the seam actually dispatched, including the real `gh` probes (`__tests__/advisoryPubSeam.test.js:140-171`: `gh run list --branch main`, `gh run rerun`, `gh run view --log-failed`, `a5Row.invocations === 1`, `a5Row.model` defined), with a byte-identical-halt negative control at `:174-185` (`gh.calls` length 0, `result.advisory` undefined). |
| H-2 | High | **Resolved** | `appendEscalationEntry` is now called from `terminate` on **every** `escalated` terminal disposition, `orchestrate-dev.js:3053-3081` — explicitly outside the try/catch governing the seam's action (TSPEC §10.1), with a local catch that downgrades a failed log write to a report notice only (`:3072-3078`) and can therefore never revert or upgrade a disposition. `ADVISORY_ESCALATIONS.seam(...)` is pushed to the run report's notice channel unconditionally on that path (`:3081`), through the `_notice` seam (`:2929`, `:2934`). The notice sink is real: `advisoryNotice = (line) => notices.push(line)` (`:9646`), bound at A5 (`:9698`), A4 (`:10302`) and A3 (`:10352`) call sites, and on the queue side to `emit` (`orchestrate-queue.js:1259`). The §10.1 *Pipeline state* field is derived from the new frozen `ADVISORY_SEAM_PHASES` map (`:2799-2805`) and the L-2 decision sentence from the new pure `escalationDecision(...)` (`:2822`). Asserted end to end through `dev.default(...)`, not a local simulation helper: `__tests__/advisoryDodSeams.test.js:1173-1185` (A3 — `docs/_queue/ESCALATIONS.md` append plus `/^ADVISORY ESCALATION: seam A3 for test-feat/` on `result.notices`) with a disabled negative control at `:1200`, and `__tests__/advisoryPubSeam.test.js:166-167` for A5. |
| H-3 | High | **Resolved** | New pure producer `summariseA3Classification(raw)` (`orchestrate-dev.js:2239-2248`) composes the two previously-uncalled leaves — `parseA3Classification` and `governingClass` — into the halt string, returning `""` (never `null`, never a partial sentence) when the reply carries no well-formed block. It is wired as A3's `_summarise` seam at the real A3 call site (`:10356`). The driver runs it over the **raw** reply before the verdict parse, keeps the last well-formed result, and absorbs a throwing summariser as report-only (`:3164-3172`); the terminal disposition carries `classificationSummary` by conditional spread so seams without a summariser carry no key at all (`:3041-3042`). The Phase DOD halt consumer is unchanged (`:10361-10366`), so the halt stays byte-identical modulo the appended class (`.trimEnd()` on the empty case). Covered by a real-agent case that scripts the **agent reply**, not the disposition (`__tests__/advisoryDodSeams.test.js:1035-1120` — `pipelineAgent(a3ReplyText)` through `dev.default(...)` with `_runAdvisorySeam: dev.runAdvisorySeam`). |
| M-1 | Medium | **Resolved** | `advisorySummaryRows(dispositions, pubOutcome = {})` now names both booleans on the summary itself (`:2713-2714`), defaulted so every pre-existing caller and pure unit test is unchanged. `main()` carries `advisoryPubOutcome = { noChecks: false, completionCap: false }` (`:9652`), sets `noChecks` from Phase PUB's return (`:10462`) and `completionCap` from the halt error's own detail (`:10557-10558`, matching `haltError(msg, { completionCap: true })` at `:8112`); both report paths pass it (`:10644` halt, `:10676` success). Distinguishing oracles exist for both: `__tests__/advisoryPubSeam.test.js:188-200` (A5-6 — `invocations 0`, `noChecks true`, `completionCap false`) and `:203-216` (A5-9 — `completionCap true`, `noChecks false`), each additionally asserting no A5 agent turn fired. |
| M-2 | Medium | **Resolved** | All four FSPEC rows now have cases bearing their IDs in the suite PROPERTIES names, with the specific oracles v1 said were missing. `__tests__/advisoryDodSeams.test.js:1035` (T-05-2 / PROP-A3-05), `:1250` (T-05-3 / PROP-A3-07), `:1299` (T-05-4 / PROP-A3-09), `:1329` (T-06-2 / PROP-A4-03). The fixture repo now **materialises** the artifacts the assertions need rather than asserting over a tree that could not fail: `docs/_queue/QUEUE.md` is written into the fixture (`:1224`) and compared byte-for-byte (`:1278`) with an explicit "no deferral row written" conjunct (`:1284`); T-05-4 does the same for the DoD criterion file and configured thresholds (`:1315-1322`); T-06-2 asserts the escalation **entry** names the conflicting file and both hunks and carries `DOD — halted` (`:1385-1389`), which is assertable now that H-2 emits an entry. |
| M-3 | Medium | **Resolved** | The disabled A5 case no longer passes undeclared parameters. It builds A5's **real** composition-root shape in-test — `buildA5SeamOps` + `runAdvisorySeam` with `config` bound where the driver actually reads it (`__tests__/advisoryDisabled.test.js:249-283` `realA5Seam({config, agent})`) — and scripts a second agent response so the case cannot pass merely by exhausting the script (`:296-298`). The positive control v1 asked for is present and is byte-identical but for `enabled` (`:321-343`): the enabled twin dispatches (`agent.calls` length 2, one disposition, `outcome escalated`, `reason low-confidence`, `model` defined), the disabled twin does not (`agent.calls` length 1). The case now discriminates. |

## Regression spot-checks (v1's "verified green", re-confirmed)

- **`raisePrAndVerifyCi`'s escalated default and model-guard are untouched.** `_runAdvisorySeam = async () => ({ outcome: "escalated" })` (`orchestrate-dev.js:8052`) and `if (a5 && a5.outcome !== "escalated" && a5.model !== undefined) continue;` (`:8092`) are unchanged by the remediation diff; the anti-spin property v1 verified still holds, and it is now doing safety work rather than masking a missing root.
- **PROP-DIS-06 holds.** The `.enabled`-read source-text oracle (`__tests__/advisoryDisabled.test.js:630-634`) is green; the composition root reuses the existing `advisoryTierOn` memo (`:9666-9669` comment, `:10453`) rather than adding a fourth read.
- **Bundles rebuilt in the same range, constraints intact.** `1085086` rebuilds all four artifacts; `node pdlc/workflows/build-runtime.mjs --check` reports all four `in-sync` (exit 0); `grep -c "import(" ` returns **0** for both `dist/orchestrate-dev.bundle.js` and `dist/orchestrate-queue.bundle.js`.
- **The disabled-run created-file fixture is untouched.** `git diff --stat decaec7..HEAD -- pdlc/workflows/__tests__/fixtures/` is empty, so the set-equality oracle at `advisoryDisabled.test.js:451-471` still compares against the same hand-captured literal (`created-files-26c3f1c.json`) it did at v1 — the disabled path's inertness was re-proved, not re-baselined.
- **New IO in the delta is awaited.** `gatherA5Context`'s three `_git` probes (`:8821`, `:8834`, `:8843`), `buildA5SeamOps` (`:9673`), `runAdvisorySeamFn` (`:9684`) and `appendEscalationEntry` (`:3056`) are all `await`ed; every probe degrades to `null`/a notice rather than throwing out of Phase PUB.

## Wave gate

`cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'` →
**82 suites passed / 82 total; 3434 passed, 70 skipped, 3504 total.** No failures.
The 70 skips are the pre-existing capability gates v1 already characterised; no
`advisory*.test.js` case is skipped.

## New in the remediation

None at High severity. The delta introduces no new production caller outside the
advisory paths, changes no pre-existing halt string, and leaves every tier-off
path byte-identical (proved by the negative controls at
`advisoryPubSeam.test.js:174-185` and `advisoryDodSeams.test.js:1200`).

Two observations, recorded as advisory only — neither is blocking and neither
warrants opening a front at round 2:

- `ADVISORY_SEAM_PHASES`' members are keyed `id` rather than the obvious `phase`
  purely to avoid `dodPhase.test.js`'s source-scanning locator finding it before
  `PHASE_DISPATCH.DOD` (`orchestrate-dev.js:2793-2798`). The workaround is
  documented at the definition and the suite is green, but the coupling is a
  source-text one and will surprise the next reader who renames it.
- `docs/_queue/ESCALATIONS.md` is appended through the `_appendFile` seam and is
  never git-committed by the pipeline (unlike the advisory record, which
  `commitAdvisoryRecord` commits). That is consistent with TSPEC §10.1, which
  specifies an append and no commit; noted only because a long-lived consuming
  repo will accumulate an untracked file that `coveredViolations` walks.

## Carried forward from v1 (advisory, unchanged)

L-1 (`distilAdvisoryRecord` named in the PLAN export inventory but never
implemented — PLAN drift, `PLAN-pdlc-advisory-tier.md:686`, `:723`), L-2 (BL-01
open with no queued successor), L-3 (`documentOracles.test.js` AT-22 red locally
on the untracked `.tokensave/tokensave.db` — environmental, and excluded from this
round's gate by the instructed `testPathIgnorePatterns`), and L-4 (the guard's
`[class: …]` suffix has no parsing consumer) are unaddressed by this delta. All
four remain non-blocking; L-1 in particular is worth a one-line PLAN correction
before harvest so the next reader does not hunt for a missing export.

## Verdict

Every blocking finding from v1 is resolved in production code, not in test
scaffolding: A5 now has a real composition root bound at Phase PUB behind the tier
flag with a live wait accumulator replacing the `waitMs = 0` stub; the escalation
log and its report notice fire from `terminate` on every escalated disposition;
A3's classification is produced by `summariseA3Classification` and reaches the DoD
halt; `noChecks` / `completionCap` reach the summary; the four unreferenced FSPEC
cases exist with fixtures that can actually fail; and the disabled A5 case now
binds config and carries an enabled positive control. In each case the covering
oracle was moved off the test's own scaffold onto `dev.default(...)` with a
scripted agent, which is what makes the green meaningful. Nothing v1 verified
green was broken — the pre-existing halts, the anti-spin guard, the disabled-run
file-set fixture and the runtime constraints all re-verify — and the full wave gate
is green. No High or Medium finding remains open; the four Lows are advisory.

VERDICT: Approved
