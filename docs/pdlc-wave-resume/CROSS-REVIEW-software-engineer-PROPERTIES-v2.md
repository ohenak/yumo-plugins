# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` (Version 1.1)
**Date:** 2026-08-22
**Iteration:** 2
**Scope:** engineering lens only — feasibility, implementability, oracle strength, and fidelity of
every claim this document makes about code that already exists.

## Round note — why this is a full pass, not a delta pass

The delta protocol asks me to open `CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` first. **That
file does not exist** — `ls docs/pdlc-wave-resume/` carries `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`
and no software-engineer PROPERTIES round. The only commit touching the document since v1 is
`416eeec3`, a two-line lineage-header edit (`Version 1.0` → `1.1`, `Cross-Reviews` cell), so there is
no revision delta to diff either. I therefore reviewed the document in full at HEAD rather than
report a vacuous delta pass, and every finding below is grounded in `origin/main` source rather than
in the upstream documents.

## Grounding

Every claim below was re-derived from source, not from the upstream documents. Commands were run
against `origin/main` (this branch is 1637 commits behind it, exactly as the document's own
grounding table says) and against the working tree.

| Claim under test | Check | Result |
|---|---|---|
| PROP-PRE-01's five required exports exist | `git show origin/main:pdlc/workflows/orchestrate-dev.js` → `IMPLEMENTATION_DEFAULTS` `:169`, `WAVE_STATE_PATH` `:12214`, `computePlanHash` `:12230`, `parseWaveLedger` `:12267`, `formatWaveLedger` `:12325` | all five resolve — holds |
| `pdlc/workflows/package.json` carries `test:coverage`, `c8`, `fast-check` | `git show origin/main:pdlc/workflows/package.json` | holds; `c8 ^10.1.3`, `fast-check ^4.9.0`, `test:coverage` present |
| `docs/_constraints/pdlc-wave-gate-baseline.md` is tracked | `git ls-tree origin/main docs/_constraints/` | holds |
| Guard order is feature → planHash → ancestry → over-count | `orchestrate-dev.js` ledger block, `else if (recorded.feature !== featureName)` … `else if (!(await headCorroborated(recorded.head)))` … `else if (recorded.lastGreenWave > waves.length)` | holds — the `over-count` fixture's "omit `head`" note is correct, `headCorroborated` returns `true` on a falsy `recordedHead` before touching the transport |
| `parseWaveLedger`'s three silent arms are `null`, `""`, `"{}"` | `if (text == null)` / `if (trimmed === "" \|\| trimmed === "{}")` | holds — the IG-6 fixture row is exact |
| PROP-RECORD-09's five-key set | `formatWaveLedger` composes `{version, feature, planHash, lastGreenWave, head}` | holds, including the four-key no-`head` shape |
| PROP-RESUME-04's wave-1 baseline detail | `recordPhase("I", "Implementation", "✅", \`All ${waves.length} waves complete (wave mode, ${scriptGate ? "script-owned gate" : "self-report gate"})\`)` | holds byte-for-byte |
| PROP-RESUME-03's skip line | `\`Wave ${waveNum}/${waves.length}: skipped (\` + \`wave ledger: waves 1–${startWave - 1} already green\` + \`)\`` | holds, U+2013 confirmed |
| PROP-PARITY-02's delegation payload | `orchestrate-queue.js`: `await runPipelineFn({ reqPath: entry.reqPath })` | holds — `Object.keys(arg)` is `["reqPath"]` |
| PROP-PRE-02's transcribed literal | `.claude/pdlc.config.json` in this tree vs. PLAN §3.4 | holds — `cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/'`, identical |
| Harness helpers reusable | `waveExecution.test.js` at `origin/main`: `CONFIG_WITH_TEST_COMMAND` `:161`, `PLAN_THREE_WAVES` `:2052`, `configWithStartWave` `:2066`, `makeLedgerArgs` `:2204`, `ledgerWrites` `:2236`, `describe("computePlanHash — the ledger's plan fingerprint"` `:2717` | all six resolve — holds |
| The five new test files do not exist | none resolves under `pdlc/workflows/__tests__/` in tree or at `origin/main` | holds |
| **The queue drift gate still exists** | `git grep parseDistributionCheckEnabledOptOut origin/main` → only `docs/completed/**`; `orchestrateQueue.test.js:919` asserts `expect(source).not.toContain("distribution" + ".checkEnabled")` | **does not hold** — see F-02 |
| **The V-wave's commit is observable on the git seam** | `orchestrate-dev.js` V-wave block: `agentFn("se-implement", propertiesTestPrompt(featureName), …)` then the gate; **no `commitPaths` call**, and the comment says "the V-wave is the one wave-mode dispatch that still commits its OWN work" | **does not hold** — see F-01 |

**PLAN task coverage.** PLAN §2.1 lists `T-01, T-02, T-03, T-04, T-07, T-08, T-10`; the document's
"PLAN tasks → properties" table carries one row per task, all seven, none extra. `T-05`/`T-06`/`T-09`
are named as retired rather than left silent. Every named test file either resolves at `origin/main`
(`waveExecution.test.js`, 2,761 lines) or is declared new by the PLAN row that owns it. That half of
the brief is clean.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
