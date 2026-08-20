# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/` (REQ v1.9, FSPEC, TSPEC v1.10, PLAN v1.8, PROPERTIES v1.2) and the branch's implementation at HEAD
**Date:** 2026-08-20
**Iteration:** 2

## Evidence

Everything below was measured on the branch at HEAD (`feae01ac`), not read off a document. The
delta under review is `a0fa1bca..HEAD` — 21 commits, `+3051/-75` across
`pdlc/workflows/orchestrate-dev.js` (`+277`), six advisory test suites, one new suite
(`__tests__/advisoryWaveGateMain.test.js`, 385 lines) and the regenerated
`pdlc/workflows/dist/pdlc-cli.mjs`. No document under `docs/pdlc-advisory-wave-gate/` changed in
this round, so this is a re-review of the *code* against the same REQ/TSPEC/PLAN/PROPERTIES bytes
v1 read.

| What was measured | Command | Result |
|---|---|---|
| Advisory + wave suites | `npm test -- __tests__/advisory __tests__/waveExecution` | 17 suites, **661 passed, 1 todo, 0 failed** |
| Whole workflow suite | `npm test` | 101 suites, 4114 tests: **2 failed**, 4041 passed, 70 skipped, 1 todo |
| The two reds | `npm test -- __tests__/documentOracles` | `AT-22 [red-until-L-06]` and `PROP-SWEEP-2(b)` — **the same two v1 measured**, the residuals PLAN v1.7/v1.8 declares inherited and unreachable on this branch. No new breakage. |
| Runtime artifact | `node build-runtime.mjs --check` | in sync — `dist/pdlc-cli.mjs` was rebuilt (`e715c0ca`), so DEC-08's rebuild-and-stage gate holds |
| Coverage gate runnability (v1 F-10) | `ls node_modules/.bin \| grep c8` | `c8 -> ../c8/bin/c8.js` — present; `c8@^10.1.3` was already declared in `devDependencies` (`package.json:12`), so v1's finding was a local install state, not a manifest gap |
| Branch freshness | `git rev-list --left-right --count HEAD...origin/feat-pdlc-advisory-wave-gate` | `1045 / 298` — still diverged; local HEAD is the newer side and carries the implementation (v1 F-12, unchanged, no pull attempted in the shared tree) |

The bar this round: v1 filed six High findings, all of the same shape — *the AC says the shipped
artifact carries X, and neither the code nor a test produces X*. Each is re-checked below against
the production call site, not against the commit message that claims it.

## Prior-finding disposition

| v1 ID | Sev | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | E-6's three conjuncts are now script-checked. `parseA6Promotion` (`orchestrate-dev.js:2404-2416`) reads `PROMOTES:`/`PROMOTES-TASK:` by the same last-wins, trim-tolerant discipline as `parseA6RootCause`, and `buildA6SeamOps.classifyReply` (`orchestrate-dev.js:3183-3210`) evaluates all three — later-wave task id, symbol in that row's `description`, symbol in the captured gate output — before the driver reads the live `permittedActions`/`declaredScope` at GATE. A holding promotion narrows the E-6 half from the union over every later wave to `laterTask.files` (`:3204`); a failing one splices `E-6` out of `permittedActions` (`:3208-3209`), so the refusal comes out of the shipped X-c clause with no A6-private matcher. `advisoryWaveGate.test.js:2042-2160` carries the four tests PROP-ENV-08 asks for: the all-hold positive (asserting the record's `Wave`/`Root cause`/`Repair paths`/`Promotes`/`Promotes task` rows), one arm per failing conjunct on the same fixture shape (`out-of-envelope`, `repairApplied: false`, `invocations` empty — refused at GATE, before ACT), and the X-d companion where the symbol half holds but the change lands on `d.js`, a *different* later task's file the pre-CR union admitted. |
| F-02 | High | **Resolved** | `A6_PROHIBITIONS` now has exactly one production reader: `A6_PROHIBITION_PATHS` maps each letter to the paths it removes (`orchestrate-dev.js:1988-1993`), `a6ProhibitedPaths` walks the catalogue (`:2000-2004`), and `buildA6SeamOps` subtracts the result both at scope construction (`:3114`) and at the directory-row widening step (`:3128`), so a manifest that assigns the failing wave `PLAN-{feature}.md` or `.claude/pdlc.config.json` cannot re-admit them. The eleven per-operation tests are at `advisoryWaveGate.test.js:2201-2276` (six path arms, three `(h)` argv-ledger arms) and `:2306-2350` (the two `(i)` arms) — 6 + 3 + 2 = 11, each with a paired positive: the same manifest, the same seam, a repair confined to `a.js`, resolving with `repairPaths === ["a.js"]`. The `(h)` arms are the pattern I asked for: the absence of `git commit`/`push`/`tag` is proved on a run that *did* resolve, and paired with the positive `commit-tree` present, so the oracle is not "nothing happened". |
| F-03 | High | **Resolved** | The record now carries wave and class, and they come from the production assembler, not the renderer's unit test. `buildA6SeamOps.annotate` (`orchestrate-dev.js:3231-3247`) returns `{wave, rootCause, repairPaths?, promotionTask?, promotionSymbol?}`; `runAdvisorySeam` spreads it onto both the resolved and the terminal disposition (`:4033-4040`, `:4051`, `:4068`) with no `if (seam === "A6")` anywhere; `renderAdvisoryEntry` emits each row only when present (`:3626`, `:3633-3644`). The set-equality oracle over the *whole* field set — including the negative half, "A1–A5's five-row table is unchanged" — is `advisoryRecord.test.js:634-694`, and the production-caller proof is `advisoryWaveGate.test.js:2067-2076`, which reads `| Wave | 1 |` / `| Root cause | plan-ordering-defect |` off the bytes a real `runWaveGateSeam` wrote. Its comment states the mutation explicitly: dropping either line from the assembler leaves the builder's unit test green and only that assertion red. |
| F-04 | High | **Resolved** | `renderEscalationEntry` gained a `Root cause` row emitted only when the seam annotated one (`orchestrate-dev.js:3765`), and the capture-failure path — which builds its own disposition rather than going through `terminate` — supplies the same two fields itself (`:3425-3431`). The class is now captured *before* the citation check (`:3161`), which closes the divergence v1 did not even see: a malformed-verdict escalation used to read `plan-ordering-defect` on the halt report and `unclassified` on the log. `advisoryEscalationLog.test.js:683-722` asserts the A6 entry's field set by **set-equality** against a transcribed nine-label literal (`AWG_A6_FIELD_ORDER`, `:615-627`), parameterised over three real classes plus the `unclassified` totality arm; PROP-REC-07 is at `:765-798` with an unregistered-seam `unknown — unknown` negative control and an A5/A6-in-one-log discriminator; PROP-REC-04 at `:805-841` compares the failed-write run's `result` to the clean run's by `toEqual` and pins exactly two notices; PROP-REC-06's counting oracle at `:860-895` runs four escalations across two features and two classes and asserts 2/1/1/**0**, parsing only the log's own bytes. |
| F-05 | High | **Resolved** | AC-1.5's cardinality now has all four arms, in the new `advisoryWaveGateMain.test.js`. `inapplicabilityStatements` (`:184-189`) counts over the **whole** emitted log surface with no authorship filter, exactly as PLAN A6-18 specifies. Arm (i) BL-03 alone (`:201-212`) — one statement, naming only the manifest; arm (ii) BL-04 alone (`:251-262`) — one, naming only the gate half and the config key; arm (iii) both absent (`:277-289`) — still exactly one, naming both causes (PROP-SEAM-08), plus the companion proving the wave-mode notice is not *also* emitted; arm (iv) the zero-count discriminator (`:264-275`) — a run where A6 applies emits `[]`, which is the arm that catches a carrier emitting the notice unconditionally. PROP-SEAM-09's disabled-vs-enabled comparison is by `toEqual`, not containment (`:229-249`). |
| F-06 | High | **Resolved** | `advisoryWaveGateMain.test.js:305-385` runs `mainDev` with **no** `_runWaveGateSeam` injection on both halves: the resolution run (red first gate, green re-gate) asserts one real A6 dispatch counted off the agent double, `advisory.rows` reading `{invocations: 1, resolved: 1, escalated: 0}`, `haltAdvisory` absent, and `ADVISORY-{feature}.md` present in the set the real `_appendFile` created with `ESCALATIONS.md` absent; the escalation run asserts `outcome: "halted"` and `haltAdvisory` **`toEqual`** `{rootCause: "plan-ordering-defect", diagnosis: …, repairApplied: false, repairPaths: []}` — values produced by the real seam from the real reply, never handed to the loop by the fixture. That is the identity-versus-oracle gap DC-07 names, closed. |
| F-07 | Medium | **Resolved** | PROP-CTR-10's companion is at `advisoryWaveGate.test.js:1405-1450`: the gate command burns six times the whole seam budget on a fake clock while every dispatch→verdict window stays at zero, and the run must still resolve — with `agent.calls.length === 2` and `testCalls === 2` proving both slow gate calls really ran. The block records its own mutation check (replacing the VERIFY check's `elapsedMs: 0` with a seam-start reading turns it red). The paired positive — a never-settling dispatch escalating `budget-exhausted` at `attempts: 1` — sits on the same A6 fixture (`:1470-1500`), not on the borrowed A2 one. |
| F-08 | Medium | **Resolved** | The four refusal properties now have A6 fixtures rather than isolated `classifyEnvelope` calls: PROP-ENV-04 at `advisoryWaveGate.test.js:2352-2375` (a wave owning its own test file refuses `revert-on-test-touch`, X-a before X-d, with `invocations` empty), PROP-ENV-05 at `:2377-2396` (guard path, X-e), PROP-ENV-09 at `:2306-2350` (the partly-in/partly-out arm asserts *both* files are gone from the restored tree, so the in-envelope half does not survive either), PROP-ENV-12 at `:2398-2424` (out-of-set `PROPOSED-ACTION`, X-c). The two `(i)` arms write during the dispatch, after `captureTreeSnapshot`, so the restoration observation is real rather than an artefact of the snapshot. |
| F-09 | Medium | **Mostly resolved** — see F-01 (v2) | Property ids are now cited in block titles across the advisory suites. Grepping all 71 distinct `PROP-*` ids in PROPERTIES against `pdlc/workflows/__tests__` and `pdlc/engine/__tests__` finds **6** with no occurrence, down from 34: `PROP-GATE-10`, `PROP-NFR-03`, `PROP-NFR-04`, `PROP-REST-04`, `PROP-REST-09`, `PROP-SEAM-02`. Five of those are covered under an AT title (`waveExecution.test.js:986`, `:1018`, `:1092`); one is a real gap, filed below. |
| F-10 | Low | **Not a defect** | `c8@^10.1.3` is declared at `package.json:12` and is installed at HEAD; `npm run test:coverage` runs. v1's `command not found` was a local `node_modules` state, not a manifest gap. Withdrawn. |
| F-11 | Low | **Resolved** | `buildA6SeamOps.verifyGate` now pushes each ledger token **before** running the command (`orchestrate-dev.js:3262-3263`, `:3268-3269`), matching `runWaveGateSequence`. `advisoryWaveGate.test.js:2524-2600` pins it on a throwing transport and on a red one, and asserts the two are indistinguishable on the ledger — the falsifying test the invariant needed, in the same revision as the fix. |
| F-12 | Low | **Open (unchanged)** | `1045 / 298` against `origin/feat-pdlc-advisory-wave-gate`. Local HEAD is the side carrying the implementation; the remote tip is not an ancestor. Recorded for the orchestrator; not touched from this shared tree. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Process | `PROP-NFR-03` / `AT-07-1` — NFR-1's "every boundary is enforced by the workflow script, never only by prompt" — still has no test. No file under `__tests__/` contains a `BR-1…BR-16` partition, let alone the set-equality against a transcribed literal the property demands | PROPERTIES §11 PROP-NFR-03, AT-07-1, NFR-1 |
| F-02 | Low | Local | `A6_PROHIBITION_PATHS`' key set is not pinned against `A6_PROHIBITIONS`: a letter with no mapping is silently skipped, and no test goes red | `orchestrate-dev.js:1988-2004` |
| F-03 | Low | Local | E-6's conjunct 2 reads `laterTask.description`, a field no A6 test obtains from `computeWaves`; the field-name coupling is proven only on hand-built fixture tasks | `orchestrate-dev.js:3192`, `:11736` |
| F-04 | Low | Process | v1 F-12 carried forward: the local branch and `origin/feat-pdlc-advisory-wave-gate` have diverged `1045 / 298` | Git workflow |

### F-01 (Medium, Process) — the one property whose absence is a completeness gap, not a naming gap

Of the 71 `PROP-*` ids in PROPERTIES, six do not occur anywhere under `pdlc/workflows/__tests__` or
`pdlc/engine/__tests__` after this round's citation sweep (down from 34 in v1). Five are covered
under an AT title and I could confirm each by reading the block:

- `PROP-GATE-10` → `waveExecution.test.js:986` (all-green run: zero A6 calls, commits
  byte-identical to the pre-A6 baseline) and `:1018` (`AT-07-3`: A6 fires once, the wave's own
  per-task commits still land) — the two halves NFR-5 asks for.
- `PROP-REST-04` → `waveExecution.test.js:1092` (`AT-05-4`) with its paired negative at `:1122`.
- `PROP-REST-09` → the pre-A6 halt-literal assertions in the same block.
- `PROP-SEAM-02` → the six-row set-equality assertions in `advisoryRecord.test.js` /
  `advisoryDriver.test.js`.
- `PROP-NFR-04` → the module-scope/purity block (`advisoryWaveGate.test.js`, A6-07).

`PROP-NFR-03` is the exception, and it is a genuine gap rather than an unlabelled test. The
property asks for something no shipped block does: *"BR-1…BR-16 must be partitioned into the
agent-proposable set and the non-proposable set, the partition asserted by **set-equality** against
a transcribed literal, each proposable rule exercised by a stub agent double returning a violating
proposal and refused by the script."* `grep -n "BR-1[0-6]" __tests__/advisoryWaveGate.test.js`
returns nothing; the file's nine `BR-` mentions are all prose comments naming a single rule
(`:214` BR-3, `:625` BR-2, `:1093` BR-7, `:1227` BR-15, `:2429` BR-14).

Why this is Medium and not High: after this round the individual boundaries this property
generalises *are* each script-enforced and each falsified by its own arm — E-6's three conjuncts
(PROP-ENV-08), the four prohibition letters (PROP-ENV-10's eleven arms), the four envelope clauses
on an A6 fixture (PROP-ENV-04/05/09/12), the citation floor (PROP-CTR-05), the class vocabulary
(PROP-CTR-02). What is missing is the *enumeration* over them: a set-equality that fails when a
sixteenth rule joins FSPEC and nobody adds its arm. That is the "completeness by set-equality, not
containment" bar, and it is the last enumerated contract on this feature that is checked only by
containment.

The `Process` tag is deliberate: v1's F-09 showed that an id present in PROPERTIES with no
occurrence in any test is indistinguishable from a covered one without reading 4 000 tests, and
this round proved the fix is cheap — cite the id in the block title. The durable lesson for the
pipeline is the rule the sweep applied: *every* property id gets cited in the title of the block
that carries it, and the ids left uncited are then, by construction, exactly the uncovered ones.
One residual of the sweep is worth naming so the next feature avoids it: two features' ids collide
on the `PROP-REC-*` prefix, and the suites resolved it by prefixing this feature's with `AWG`
(`advisoryEscalationLog.test.js:597-599`, `advisoryRecord.test.js:589-591`). That convention works
but is undocumented outside those comments.

### F-02 (Low, Local) — the catalogue-walk claim is one degree weaker than its comment

`a6ProhibitedPaths` walks `A6_PROHIBITIONS` and looks each letter up in `A6_PROHIBITION_PATHS`,
falling back to `[]` when the key is absent or not a function
(`orchestrate-dev.js:2001-2003`). The comment at `:1984-1986` states the load-bearing claim:
*"dropping a letter from `A6_PROHIBITIONS` drops its subtraction, which is what makes the constant
load-bearing."* That direction is genuinely tested — remove `f` or `g` and the six path arms at
`advisoryWaveGate.test.js:2205-2226` go red. The other direction is not: **adding** a letter to
`A6_PROHIBITIONS` with no entry in `A6_PROHIBITION_PATHS` silently subtracts nothing, and every
test stays green, because `A6_PROHIBITIONS`' own set-equality test
(`advisoryEnvelope.test.js:344-348`) asserts only the four-letter literal and never compares it to
the map's keys. `a6ProhibitedPaths` is exported but referenced by no test at all
(`grep -rn "a6ProhibitedPaths" __tests__` → no match).

What would close it: one unit test asserting
`expect(Object.keys(A6_PROHIBITION_PATHS)).toEqual([...A6_PROHIBITIONS])` (exporting the map, or
asserting `a6ProhibitedPaths("f")`'s output set-equal to the transcribed two-path literal), so the
letter catalogue and its subtraction table cannot drift apart in either direction.

### F-03 (Low, Local) — conjunct 2's field name is proven only on fixture-built tasks

E-6's second conjunct reads `String(laterTask.description || "").includes(promotion.symbol)`
(`orchestrate-dev.js:3192`). I verified the field survives to production: `computeWaves` builds
each wave task as `{ ...t, files }` (`orchestrate-dev.js:11736`), `t` carries `description` from
the task table (the same field `:10398` interpolates into the implementer prompt), so a real run's
`waves[j][k].description` is the PLAN row text the conjunct wants. But every E-6 test hand-builds
`{ id, files, description }` (`advisoryWaveGate.test.js:2024-2029`), and the one production-path
suite (`advisoryWaveGateMain.test.js`) drives only E-5 — its `WAVE_PLAN` has a single task and a
single wave, so `isLastWave` is true and E-6 is narrowed away before any conjunct runs. A rename of
`description` anywhere upstream would leave conjunct 2 permanently false — E-6 would silently never
promote — with the whole suite green. Cheapest close: extend the `mainDev` fixture to a two-wave
PLAN and drive one E-6 resolution through it, asserting the `| Promotes task |` row on the record
the real `_appendFile` wrote.

## Questions

## Positive Observations

## Recommendation

## Verdict
