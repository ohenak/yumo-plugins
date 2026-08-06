# CROSS-REVIEW — Final Codebase Review (Phase CR) — pdlc-advisory-tier — v1

**Reviewer role:** Final Codebase Review (Phase CR)
**Date:** 2026-08-05

Scope: branch `feat-pdlc-advisory-tier` @ `3188015`, diff range `main...HEAD`
(merge-base `6a4548d`, i.e. `6a4548d..3188015`). Reviewed: the full feature diff
(121 files) with focus on `pdlc/workflows/orchestrate-dev.js`,
`pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/build-runtime.mjs`,
`pdlc/hooks/scripts/guard-harvest-before-delete.sh`, the `advisory*.test.js`
suites, `pdlc/workflows/dist/*`, `docs/pdlc-advisory-tier/*` (REQ, FSPEC, TSPEC,
DECISIONS, PLAN, PROPERTIES, MANUAL-VERIFICATION), `CLAUDE.md` §Advisory tier and
`pdlc/RELEASE-CHECKLIST.md` §4. Read-only review; no production code, test or
generated artifact was modified.

## What was verified green

Recorded so the findings below are read against a real baseline, not a general
suspicion of the diff.

- **Runtime constraints hold.** Neither shipped bundle contains an `import(`
  token (`grep -c "import(" pdlc/workflows/dist/orchestrate-dev.bundle.js` → 0;
  same for `orchestrate-queue.bundle.js`), and neither contains any `process.`,
  `fetch(` or `require(` occurrence. `node pdlc/workflows/build-runtime.mjs
  --check` reports all four artifacts `in-sync`.
- **Every injected IO call in the advisory paths is awaited.** A scan of
  `orchestrate-dev.js` / `orchestrate-queue.js` for `_git(`, `_readFile(`,
  `_writeFile(`, `_appendFile(`, `_checkFile(`, `_runCommand(`, `_ghRun(` and
  their `*Fn` composition-root aliases in non-`await`, non-`return`, non-arrow
  position produced only two hits, both inside JSDoc prose
  (`orchestrate-dev.js:1200`, `:3312`).
- **Suite state.** `cd pdlc/workflows && npm test` → 82/83 suites pass, 3483
  passing, 70 skipped. No `advisory*.test.js` case is skipped: the un-skip sweep
  is itself asserted (`advisoryDisabled.test.js:644`), and the 70 skips are all
  pre-existing capability gates (`guardMatrix.test.js:325,334`,
  `implPhase.test.js:253,270`, `hookCompatibility.test.js:84…364`). The single
  red is `documentOracles.test.js:246` (AT-22) failing on the untracked local
  file `.tokensave/tokensave.db` — the exact known-environmental case CLAUDE.md
  documents, not a diff defect.
- **A3 and A4 are genuinely wired.** `main()` builds real SeamOps and passes the
  full driver parameter set at `orchestrate-dev.js:9989-10003` (A4) and
  `:10038-10052` (A3), threading one `advisoryRungState` memo (`:9399`) and the
  once-per-run config read (`:9391`). Both pre-existing halts are unconditional
  and byte-identical (`:10005-10012`, `:10059-10061`).
- **A1/A2 are genuinely wired on the queue side**, including seam-token routing
  (`orchestrate-queue.js:1222-1241`), dispatch through the raw (non-`MODEL_QUEUE`)
  agent (`:1251`), and the H-2b durability commit
  (`:1273-1278` → `commitAdvisoryRecord`, `:1610-1633`) — `git add --` then
  `git commit -- <path>`, pathspec-scoped, never `-a`, never pushed, with
  nothing-to-commit treated as idempotent.
- **The H2 distil step is reachable and correctly placed** — strictly between
  Phase PUB (`orchestrate-dev.js:10141`) and Phase MERGE (`:10209`), gated on
  `advisoryTierOn` (`:10169`), deleting through the guard-covered `git rm`
  channel (`:10178`), retaining-and-noticing on refusal (`:10179-10184`), and
  committing both paths (`:10186-10193`). Fail-open via the enclosing `try`
  (`:10197-10201`).
- **The guard extension preserves the parsed coupling.** The refusal message
  keeps the exact `pdlc guard: refusing to delete CROSS-REVIEW files in [%s]`
  prefix and bracket shape that `orchestrate-dev.js` string-tests and
  regex-extracts, adding only the trailing `[class: …]` token
  (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:57-69`).
- **Disabled-tier inertness is proven with a positive control**, not by absence
  alone: `advisoryDisabled.test.js:451-471` compares a disabled run's created-file
  set for set-equality against the hand-captured literal in
  `pdlc/workflows/__tests__/fixtures/created-files-26c3f1c.json`, re-asserting the
  fixture's `scenario` header first so staleness fails distinctly. The
  absent-section and malformed-config variants reuse the same oracle
  (`:472-520`).
- **Adjacent surfaces are not falsified.** `raisePrAndVerifyCi`'s new parameters
  both default to no-ops (`orchestrate-dev.js:7867-7868`), and the `escalated`
  default is the only value that preserves the pre-existing halt — a `no-action`
  default would spin. The `a5.model !== undefined` conjunct (`:7907`) closes the
  remaining spin: a seam that never dispatched cannot re-poll.
  `MERGE_ESCALATIONS` is untouched and `ADVISORY_ESCALATIONS` is a sibling frozen
  object (`:1337`, `:1351`), asserted at `advisoryEscalationLog.test.js:412-419`.

## High

### H-1 — Seam A5 is never constructed in production: REQ-ADV-08 (AC-8.1 … AC-8.6) is undelivered

`buildA5SeamOps` (`pdlc/workflows/orchestrate-dev.js:2403`) has **zero production
call sites**. Every reference in the tree is a test
(`__tests__/advisoryPubSeam.test.js:132, 453, 559, 740, 836`) or a copy of the
definition inside the generated bundles. Its two capability probes,
`probeDefaultBranchChecks` (`:2368`) and `probeWorkflowRerun` (`:2385`), are
likewise reachable only from inside `buildA5SeamOps`, so they too never run in
production.

The real Phase PUB call site invokes the seam with three fields only:

- `orchestrate-dev.js:7898` — `const a5 = await _runAdvisorySeam({ seam: "A5", feature, prUrl });`
- `orchestrate-dev.js:10148` — `main()` binds `_runAdvisorySeam: runAdvisorySeamFn`, which
  defaults to the real `runAdvisorySeam` (`:8639`).

`runAdvisorySeam` therefore receives no `seamOps`, no `config`, no `rungState`, no
`_agent`, no `_appendFile` and no `_git`, and short-circuits on its first line:

- `orchestrate-dev.js:2811-2813` — `if (!config || config.enabled === false) return { outcome: "no-action", …, model: undefined, seam };`

Consequence: with `advisory.enabled: true` in `.claude/pdlc.config.json`, A5 still
never dispatches, never diagnoses a red rollup, never writes an `ADVISORY-*` entry
for A5, and never re-polls. The `a5.model !== undefined` guard (`:7907`) is what
keeps this silent — it is a correct safety guard, but here it is masking a missing
composition root rather than an inert tier. The operator-visible artifact is an
A5 summary row that reads `invocations: 1, noAction: 1` on every CI-red run
whether the tier is on or off. This is exactly the "unwired integration" class
Phase DOD exists to catch. Contrast A3/A4, which do build SeamOps
(`:9992`, `:10041`).

The gap is visible in the tests themselves:
`__tests__/advisoryPubSeam.test.js:559-586` constructs a local `_runAdvisorySeam`
closure that calls `dev.buildA5SeamOps({…})` and forwards the full driver
parameter set — i.e. the test supplies the composition root that production omits,
so every A5 case is green against wiring that does not ship.

Related, same root cause: A5's rollup-wait budget carve-out is a hardcoded stub.

- `orchestrate-dev.js:2916` — `const waitMs = 0; // the A5-only rollup-wait carve-out sink is out of this task's scope (§4.3, §4.5)`

`waitMs` feeds `budgetExceeded` at `:2981`, `:2998`, `:3080`; `budgetExceeded`
(`:1982-1984`) subtracts it from elapsed time precisely so a check-rollup wait does
not consume the seam budget. The sink that would make it non-zero is
`buildA5SeamOps`'s `recordWait` parameter (`:2409`, called at `:2462`, `:2465`),
which — per H-1 — is never given a production closure. A literal `0` with an
"out of this task's scope" comment in shipped production code is a stub with no
queued successor.

**Remediation.** Build A5's SeamOps in the composition root (or inside
`raisePrAndVerifyCi` from injected seams), thread `config`, `rungState`, `_agent`,
`_appendFile`, `_writeFile`, `_readFile`, `_git`, `_now`, `_sleep` and a real
`recordWait` counter, and add one integration case that drives `dev.default(...)`
(not `raisePrAndVerifyCi` directly) with the tier **enabled** and asserts the seam
actually dispatched.

### H-2 — The escalation output is never emitted: REQ-ADV-10 (AC-10.1 … AC-10.5) is undelivered

`appendEscalationEntry` (`orchestrate-dev.js:2717`) and the notice catalogue
`ADVISORY_ESCALATIONS` (`:1351`) have **zero production call sites**. A repo-wide
scan of `pdlc/` excluding `dist/` returns only the definitions and
`__tests__/advisoryEscalationLog.test.js`. `ESCALATIONS_PATH`
(`:2658`, `docs/_queue/ESCALATIONS.md`) is consequently never written by any
pipeline path, and no `ADVISORY ESCALATION: …` notice ever reaches a run report.

The driver's single terminal builder writes only the per-feature record:

- `orchestrate-dev.js:2884-2912` — `terminate(...)` calls `appendAdvisoryEntry` (`:2898`) and returns; there is no escalation-log branch on any outcome, `escalated` included.
- The only other return path is the disabled short-circuit at `:2812`.

TSPEC §10.1 specifies the missing call site explicitly
(`docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md:1229` — "`appendEscalationEntry`
is called **outside** the try/catch that governs the seam's action"), and
`§10 → ADV-09 → REQ-ADV-10` is the traceability row
(`TSPEC…:1486`). CLAUDE.md's new advisory section (added by this diff) already
advertises `docs/_queue/ESCALATIONS.md` as a shipped artifact, so the maintainer
documentation describes behaviour the code does not have.

**Oracle quality.** The covering suite does not detect this because it supplies
the absent call site in-file:

- `__tests__/advisoryEscalationLog.test.js:329-342` — a local
  `simulateEscalationLogStep(...)` helper wrapping `appendCall()` in a
  try/catch, introduced by a comment that calls it a "transcribed call-site
  mechanism … a pure re-expression of that one control-flow fact". It is an
  implementation echo of a control flow that does not exist; PROP-ESC-05 /
  T-09-8 are green against the test's own scaffold.

**Remediation.** Call `appendEscalationEntry` from `runAdvisorySeam` on every
`escalated` disposition, outside the action try/catch, downgrading its own throw
to a report notice; push `ADVISORY_ESCALATIONS.seam({ seam, feature, reason })`
onto the run report's `notices`. Then assert both through `dev.default(...)` with
the tier enabled, not through a local simulation helper.

### H-3 — AC-6.3's classification never reaches the DoD halt

The Phase DOD halt reads a field no code path produces:

- `orchestrate-dev.js:10056-10057` — `const classificationSummary = (a3 && a3.classificationSummary) ?? "";`
- `orchestrate-dev.js:10060` — the halt message interpolates it.

The disposition object is built in exactly two places, and neither sets
`classificationSummary`: the disabled short-circuit (`:2812`) and `terminate`'s
return (`:2904-2912`, whose keys are `seam, outcome, reason, verdict, attempts,
model, fallback`). `grep -n classificationSummary orchestrate-dev.js` returns only
the three consumer lines above — there is no producer.

Correspondingly, the two pure functions that would compute it,
`parseA3Classification` (`:2169`) and `governingClass` (`:2209`), have **zero
production call sites**: `buildA3SeamOps` (`:2233-2264`) only assembles a prompt
and returns `permittedActions: []`; nothing parses the agent's reply into a
class. So AC-6.3 ("the halt carries the classification") resolves, in production,
to appending the empty string.

**Oracle quality.** Both covering cases inject the field from a scripted double,
so they would pass against any implementation, including this one:

- `__tests__/advisoryDodSeams.test.js:913-920` — `_runAdvisorySeam: async ({ seam }) => ({ …, classificationSummary: "real-defect: coverage below threshold (evidence: file.js:10)" })`
- `__tests__/advisoryDodSeams.test.js:939` — the negative twin, same fake.

There is no case in which the **real** `runAdvisorySeam` + real `buildA3SeamOps`
produce a non-empty classification on the halt string. PROP-A3-05 / PROP-A3-08 /
PROP-A3-11 name `advisoryDodSeams.test.js` as their test
(`docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md:711`), but the
end-to-end conjunct is untested.

**Remediation.** Have A3's `diagnose`/verdict path run `parseA3Classification` +
`governingClass` over the agent reply and surface the result on the disposition;
add one case that drives `dev.default(...)` with the tier enabled and a scripted
**agent** (not a scripted disposition) and asserts the halt string carries the
governing class.

## Medium

### M-1 — TSPEC §9.4 S-3 unimplemented: `noChecks` / `completionCap` never reach the advisory summary

TSPEC §9.4 S-3 (`docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md:1189-1190`) and
PLAN A-26 (`docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md:277`, "`noChecks` /
`completionCap` threaded to the summary") both require these two booleans on the
report, so A5-6 (no checks ever registered) and A5-9 (completion cap) are
distinguishable from a seam that simply did not fire.

Both values are produced but discarded:

- `orchestrate-dev.js:7891`, `:7939` — `noChecks` on the return value.
- `orchestrate-dev.js:7924-7928` — `completionCap: true` on the halt-error detail.
- `orchestrate-dev.js:10151-10152` — `main()` reads only `prUrl` and `ciStatus` off `pubResult`.
- `orchestrate-dev.js:2621-2650` — `advisorySummaryRows(dispositions)` takes only the disposition list; its rows carry `seam, invocations, resolved, escalated, noAction, model, fallback` and its `total` the four counters. No `noChecks`, no `completionCap`.
- `orchestrate-dev.js:10331`, `:10363` — `advisory: advisoryTierOn ? advisorySummaryRows(advisoryDispositions) : undefined` on both the halt and success report paths.

An operator reading the run report therefore cannot tell "no checks configured"
from "checks completed and the seam had nothing to do".

### M-2 — Four FSPEC acceptance cases have no test bearing their ID, and their distinguishing assertions are absent

Cross-referencing every `T-\d\d-\d+` token in the FSPEC against the
`advisory*.test.js` suites leaves four FSPEC rows unreferenced anywhere in the
test tree: **T-05-2, T-05-3, T-05-4, T-06-2**
(`docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md:534, 535, 536, 590`). Their
properties name `advisoryDodSeams.test.js` as the owning suite
(`PROPERTIES…:711` PROP-A3-05, `:713` PROP-A3-07, `:715` PROP-A3-09, `:725`
PROP-A4-03), and that file has no matching case.

The gap is not purely bookkeeping — the specific oracles those rows demand are
missing:

- **T-05-3 / PROP-A3-07** requires a positive control that "no queue row changed
  and no deferral row was written anywhere". `grep -n "QUEUE.md\|queue row"
  __tests__/advisoryDodSeams.test.js` returns nothing. The nearest case,
  `advisoryDodSeams.test.js:400-450`, asserts `git status --porcelain` and
  `git rev-parse HEAD` are unchanged on a temp fixture repo that contains only
  `file.txt` — it never materialises a queue file, so it cannot fail for a queue
  write.
- **T-05-4 / PROP-A3-09** requires the DoD criterion file to be asserted
  byte-identical. Same fixture, same absence — no criterion file exists in the
  fixture tree.
- **T-06-2 / PROP-A4-03** requires that the escalation entry summarise the
  conflicting hunks. Per H-2 no escalation entry is written at all, so this
  conjunct is unassertable as shipped.

### M-3 — The disabled-tier A5 case establishes no precondition and no positive control

`__tests__/advisoryDisabled.test.js:236-247` passes `config: disabledConfig()` and
`_readAdvisoryConfig: async () => ({ … })` to `dev.raisePrAndVerifyCi`. That
function declares neither parameter (`orchestrate-dev.js:7857-7869` — the
destructured signature is `feature, _agent, _checkCi, _log, _now, _sleep,
noChecksTimeoutMs, pollIntervalMs, completionTimeoutMs, _runAdvisorySeam,
_advisoryRecord`), so both extras are silently dropped. The case's stated
precondition — "the tier is disabled" — is never actually established; it passes
because `runAdvisorySeam` receives no config at all, which is H-1's defect rather
than the disabled path.

The case is therefore non-discriminating: it would pass byte-for-byte with
`advisory.enabled: true`. T-10-1's claim for A5 ("no advisory dispatch **when
disabled**") has no positive control showing that an **enabled** A5 does dispatch.
The A1/A2/A3-A4 siblings in the same describe block
(`advisoryDisabled.test.js:141, 175, 205`) do not share this problem.

## Low

### L-1 — `distilAdvisoryRecord` is named in the PLAN's export inventory but does not exist

`docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md:686` and `:723` both list
`distilAdvisoryRecord` among the symbols `orchestrate-dev.js` must carry (the
latter inside a shell check-list). `grep -rn distilAdvisoryRecord pdlc/` returns
nothing. This is PLAN drift rather than a functional gap: TSPEC §9.3
(`TSPEC…:1128-1139`) specifies the distil step as an **agent dispatch**, and the
implementation matches that pseudocode exactly (`orchestrate-dev.js:10177`
`await agentFn("harvest-learnings", advisoryDistilPrompt(featureName))`). Worth
correcting the PLAN inventory so the next reader does not hunt for a missing
export.

### L-2 — BL-01 remains open with no queued successor

`docs/pdlc-advisory-tier/MANUAL-VERIFICATION-pdlc-advisory-tier.md` honestly
records `RESULT: unverified — no runtime available` and states "BL-01 stays open
until that dispatch is performed and recorded". The honesty is right (an inferred
result would have been mock data), and the file names precisely what would settle
it. But the branch adds no queue row or checklist item carrying the obligation
forward — `docs/_queue/QUEUE.md`'s only change on this branch is row 14 flipping
`pending → halted`, and `pdlc/RELEASE-CHECKLIST.md` §4 covers only 4a (the D-6
fixture header) and 4b (the guard coupling), not the `"fable"` rung dispatch.
Consider a §4c checkbox so the open baseline is re-asked at release time.

### L-3 — `documentOracles.test.js` AT-22 is red locally on an untracked file

`__tests__/documentOracles.test.js:246` fails with
`.tokensave/tokensave.db` in the violation list. This is the exact
untracked-file failure mode CLAUDE.md documents ("If a document oracle is red
locally but green in CI, check for untracked files before you touch the code").
Not attributable to this diff; noted only so a later reader does not mistake it
for one.

### L-4 — `guardRefused` recovery path is exercised, but the `[class: …]` suffix has no consumer

`guard-harvest-before-delete.sh:64-68` now emits a trailing
`[class: ADVISORY]` token, described in TSPEC §9.3 as "a **suffix token** the new
distil step reads". `orchestrate-dev.js:10179-10180` only tests `guardRefused(del)`
and echoes `firstLine(del.stderr)` into a notice — it never parses the class. The
token is harmless (it rides through in the notice text) and the coupling
regression is real, but the stated consumer does not exist.

## Verdict

Three High and three Medium findings are open. Two of the five advertised seams'
requirements (REQ-ADV-08 seam A5, REQ-ADV-10 escalation output) and one acceptance
criterion (AC-6.3) are libraries with no production caller, and in each case the
covering tests supply the missing call site themselves, so the suite is green
against wiring that does not ship. The tier's off-by-default posture means none of
this is a regression risk to existing runs — the shipped behaviour is inert and
the pre-existing halts are byte-identical — but the feature as specified is not
delivered.

VERDICT: Needs revision
