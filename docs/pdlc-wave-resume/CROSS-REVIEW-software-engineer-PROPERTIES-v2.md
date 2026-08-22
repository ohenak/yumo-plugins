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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | PROP-SKIP-04's oracle expects V-wave pathspecs on the script's `git add` list. The script never stages the V-wave — it commits its own work — so the expected value is `[]` and the property collapses into the absence-only oracle its own falsifiability note claims it avoids. | § Properties row PROP-SKIP-04; § Oracles row PROP-SKIP-04 |
| F-02 | Medium | Cross-Feature | The queue fixture set is justified by a drift gate that was retired from `orchestrate-queue.js`. `distribution.checkEnabled: false` is a no-op for the queue at `origin/main`, so "without all three the queue returns `outcome: \"blocked\"`" is false and the precondition oracle guards nothing. | § Fixtures → "Queue fixtures (all three required)" |
| F-03 | Medium | Local | Harness extension H-1 describes `makeLedgerArgs` as owning the `_runCommand` and `_git` doubles. Both are caller-supplied parameters and `_git` is unset by default, so an `events` array can be silently empty on the git axis — a vacuous pass for PROP-SAFETY-01 and PROP-RECORD-03, the two ordering properties. | § Fixtures → "The two harness extensions this feature owns", H-1 |
| F-04 | Medium | Local | PROP-COV-01 asserts `npm run test:coverage` exits 0 without recording the measured baseline it rides on. The c8 `include` set is three modules and stage 2's `--per-file --branches 85` applies to all three, so T-10 can red for reasons wholly outside this feature's diff. | § Properties PROP-COV-01; § Oracles row PROP-COV-01 |
| F-05 | Low | Local | Dangling internal cross-reference: PROP-REPO-02's falsifiability note routes its general claim to "§ Gaps, G-3", but G-3 is "No E2E tier". No gap in § Gaps covers that routing. | § Oracles row PROP-REPO-02 vs. § Gaps G-1…G-4 |

---

### F-01 (High) — PROP-SKIP-04's expected value does not exist at HEAD

The property reads: *"the `_git` spy's `add` argv list must contain no path owned by any wave task,
and the V-wave's own commit must be the only Phase-I-adjacent commit observed"*, and the oracle
instantiates it as:

```
expect(gitCalls.filter(a => a[0] === "add").map(a => a[2])).toEqual([<V-wave paths only>])
```

with the falsifiability note *"Equality over the pathspec list distinguishes 'the wave loop committed
nothing' from 'nothing was committed at all', which a bare count cannot."*

Three problems, in descending order of consequence:

1. **There are no V-wave paths on that list.** The V-wave block in `orchestrate-dev.js` at
   `origin/main` dispatches `agentFn("se-implement", propertiesTestPrompt(featureName), { model:
   MODEL_IMPLEMENTATION })`, calls `withDispatchRetry`/`evaluateWaveDispatch`, then runs
   `runCommandFn(implConfig.testCommand)` — and stops. It issues **no** `commitPaths` and **no**
   `_git(["add", …])`. The enclosing comment states the design explicitly: *"the set of test files it
   creates is a property of the PROPERTIES document and of the repo's test layout, not something this
   script can derive … So the V-wave is the one wave-mode dispatch that still commits its OWN work."*
   The commit is made by the dispatched agent, which under test is `makeAgent(record)` — a double
   that touches no git seam. So `<V-wave paths only>` is the empty list.
2. **Which makes the oracle `toEqual([])` — an absence-only oracle.** The note's claimed
   discrimination is exactly the one it cannot make: "the wave loop committed nothing" and "nothing
   was committed at all" both render as `[]`. This is the document's own rule 2 violated by the
   property that is categorised `Security` and that carries REQ-WVR-08 and G-2.
3. **`.map(a => a[2])` is not "the staged pathspecs" in any case.** The canonical wave commit is
   `commitPaths`, which issues `gitWithLockRetry(["add", "--", ...paths], …)`, so `a[2]` is the
   *first* pathspec of each call and every subsequent one is dropped; the A6 snapshot path issues
   `gitWithLockRetry(["add", "-A"], …)`, for which `a[2]` is `undefined`. PROP-REPO-03's oracle reads
   the same argv list correctly — `.filter(a => a[0] === "add").flat()` — so the document contradicts
   itself on how to decode one seam.

`PLAN_THREE_WAVES` gives each task exactly one owned path, so problem 3 happens not to bite for this
fixture; problems 1 and 2 bite regardless, and an implementer meeting them has only two moves, both
bad: write `toEqual([])` and ship a weakened oracle silently, or fabricate a V-wave pathspec the
script never stages.

**What must change.** Re-express PROP-SKIP-04 against an observable the script actually produces
under outcome (c). Two candidates, either sufficient:

- **Positive conjunct on the same call list.** Assert the *full* `add` argv list set-equally against
  what outcome (c) really produces (`[]` for the script), and pair it in the same test with a
  positive assertion that the git seam was live and reached — e.g. the branch-guard
  `["rev-parse", "--abbrev-ref", "HEAD"]` call is present — so a disconnected `_git` reds instead of
  passing. That is what rule 2 asks for and what R-3 promises but does not deliver here.
- **Move the conjunct to the agent axis.** The thing REQ-WVR-08 actually wants observed is *no wave
  task's work was landed*: assert `dispatchedTaskIds(record)` is `[]` (already PROP-SKIP-01) **and**
  that the single dispatch observed is the V-wave's `propertiesTestPrompt`, identified by its prompt
  rather than by a commit. Then delete the pathspec claim, or restate it as "the script issues zero
  `git add` under outcome (c)" with the flattening `PROP-REPO-03` uses.

Either way the phrase "the V-wave's own commit" must stop appearing as something the git spy can see.
The same premise is inherited from TSPEC §5.4 AT-12's fourth conjunct, so I am routing that half
upstream as an erratum rather than asking this document to contest it.

### F-02 (Medium) — the queue fixture rationale rests on a retired mechanism

§ Fixtures says all three queue fixtures are required because *"Without **all three**,
`orchestrate-queue` returns `outcome: "blocked"` and asserts nothing"*, and names fixture 2 as
`.claude/pdlc.config.json` carrying `distribution.checkEnabled: false`, *"so the drift gate does not
refuse the invocation before `QUEUE.md` is read"*.

The drift gate was deleted from `orchestrate-queue.js`. Evidence:

- `git grep parseDistributionCheckEnabledOptOut origin/main` resolves only inside
  `docs/completed/**` — `pdlc-headless-engine`'s PROPERTIES/REQ (citing the now-gone
  `orchestrate-queue.js:2068`) and `pdlc-plugin-retirement`'s TSPEC, which names
  `validateDriftRecord`, `mapDriftState`, `readDriftStateSafely` and
  `parseDistributionCheckEnabledOptOut` as *"every one of them owned by the deleted drift gate
  (class 3)"*.
- `orchestrateQueue.test.js:919` at `origin/main` now pins the deletion:
  `expect(source).not.toContain("distribution" + ".checkEnabled")` and
  `expect(source).not.toContain("DRIFT_STATE" + "_PATH")`.
- The only `outcome: "blocked"` in today's `orchestrate-queue.js` is the in-progress-entry
  disposition (`reason: \`an entry is in-progress: …\``), which fixture 1 — the `pending` row —
  already controls.

Consequence for the properties, and it is bounded: fixture 2 is inert rather than harmful, so
PROP-PARITY-01…04 will still land. But the stated reason the fixture set is complete is false, and
the sentence *"The queue suite asserts `result.outcome !== "blocked"` as a precondition of its own
oracles, so a fixture regression reds rather than silently emptying the test"* claims protection the
precondition no longer provides against the risk it names.

This is inherited verbatim from TSPEC §5.4 AT-16 and PLAN T-04, so the fix belongs upstream and I am
routing it there. What is **this** document's to answer is narrower: its § Overview pledges that
"shipped-behaviour claims in this document are cited against `git show origin/main:…`", and this one
is not — it is the single mechanism claim in the document that was transcribed rather than checked.
Drop fixture 2 or keep it with a truthful reason (it is harmless configuration, not a gate opt-out),
and re-anchor the precondition on the disposition that can actually fire.

### F-03 (Medium) — H-1's `events` array can be silently empty on the git axis

H-1 reads: *"Optional `events` array; when supplied, the `_runCommand` and `_git` doubles each append
`["runCommand", cmd]` / `["git", …argv]` to it **in addition to** their own unchanged logs."*

`makeLedgerArgs` does not own those doubles. Its signature takes `git` and `runCommand` as
**caller-supplied parameters** — `git` with no default at all, `runCommand` with a green default —
and passes them straight through to `makeArgs`, which wires them conditionally:

```
...(git ? { _git: git } : {}),
...(runCommand ? { _runCommand: runCommand } : {}),
```

So (a) the extension must *wrap* whatever double the caller passed rather than instrument one it
owns, and (b) when a case omits `git` — which is the default, and which PROP-DISREGARD-09's
"no transport" arm depends on — `_git` is never injected and the `events` array records **only**
`runCommand` entries. An ordering assertion over such an array is trivially satisfiable: a one-element
list is in order.

PROP-SAFETY-01 (gate precedes record) and PROP-RECORD-03 are the two properties that consume
`events`, and both are ordering claims across the two axes. As written they can pass on a fixture that
never wired `_git`, which is precisely the failure mode R-3 names for call-count oracles and does not
name for ordering ones.

**What must change.** State that H-1 wraps the caller-supplied doubles, and give the consuming
properties a shape precondition: assert the `events` array contains at least one `"git"` entry and at
least one `"runCommand"` entry *before* asserting their relative order, so an unwired seam reds
instead of passing. Naming the wrapping is also what makes the extension implementable without a
second reading of `makeArgs`.

### F-04 (Medium) — PROP-COV-01 pins a gate whose current value is unrecorded

PROP-COV-01's oracle is *"`npm run test:coverage` exits 0"*. At `origin/main` that script is two
stages, and stage 2 is `c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0
--statements 0` over a c8 `include` of **three** modules — `orchestrate-dev.js`,
`orchestrate-queue.js`, `build-runtime.mjs` — with stage 1 additionally enforcing aggregate
`branches 85 / lines 90 / functions 90 / statements 90`.

None of the five CI checks named in the repo's CLAUDE.md is a coverage check, so the script's current
exit status is not held green by anything. The document never records the measured per-file branch
percentage of any of the three modules, which means PROP-COV-01 is a floor with no baseline: T-10 can
red on `orchestrate-queue.js` or `build-runtime.mjs` for reasons that have nothing to do with this
feature's ~20 branches, and the task has no way to tell "this feature regressed coverage" from "the
floor was already below 85 before we arrived".

The document is alert to the adjacent problem — PROP-COV-02's note correctly reasons that a
16,336-line denominator makes PROP-COV-01 insensitive to this feature — but insensitivity in the
*passing* direction is not the risk; an inherited red in the failing direction is.

**What must change.** Record the measured per-file branch percentage for each of the three included
modules at `origin/main` as a dated measured fact (the same form § Overview uses for its other
grounding rows), and state which of them PROP-COV-01 is a *regression guard* over versus which it
merely inherits. If any is already under 85, say so and scope PROP-COV-01 to the module this feature
touches — a red T-10 the feature cannot fix is a blocked task, not an oracle.

### F-05 (Low) — dangling `§ Gaps, G-3` cross-reference

PROP-REPO-02's falsifiability note routes its general claim — *"no PLAN may ever own consumer-local
state"* — to "Phase P (§ Gaps, G-3)". § Gaps carries G-1 (EC-18 bounded), G-2 (EC-17 half-covered),
G-3 (no E2E tier) and G-4 (PROP-REPO-01 red pre-rebase). None of them is that routing. Either add the
gap the note points at or drop the anchor; a reader following it lands on the E2E tier and concludes
the note is confused.

Filed Low per DEC-DOC-01's neighbourhood: the citation is to a heading id rather than a raw
`file:line`, so this is an accuracy nit, not a citation-convention violation.

## Questions

## Positive Observations

## Recommendation

## Verdict
