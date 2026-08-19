# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 1
**Scope:** Technical lens — testability at the declared level and home, executability of each property
against HEAD, PLAN-task/file-ownership traceability, oracle quality (no implementation echoes, no
absence-only oracles, set-equality not containment).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **PROP-REC-07 cannot execute at its declared level and home.** It is a `Unit` / `Contract` property homed in `advisoryEnvelope.test.js` (A6-02) asserting that `ADVISORY_SEAM_PHASES` gains `A6: {id: "I", outcome: "halted"}`. At HEAD that table is a module-private `const` — `pdlc/workflows/orchestrate-dev.js:3108` (`const ADVISORY_SEAM_PHASES = Object.freeze({`), read only at `:3338`, and referenced by no test in `pdlc/workflows/__tests__` (grep: zero hits). TSPEC §3.1's module-scope export list (`TSPEC-pdlc-advisory-wave-gate.md:502`–`:511`) adds `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS`, `ADVISORY_ROOT_CAUSES`, `A6_PROHIBITIONS` — not this table; `TSPEC:514` states the `A6` row is added but never marks it exported, and PLAN A6-05 owns the edit without adding an export. As written the A6-02 RED test would import `undefined` and fail for a reason other than the one batch 1 declares, and would stay red after A6-05. Resolve one of two ways: (a) restate PROP-REC-07 as an observable — the escalation-log entry's *Pipeline state* field reads the `I` / `halted` pair, homed in `advisoryEscalationLog.test.js` (A6-17), keeping the "derived from the table, not passed per call site" claim as the rationale; or (b) keep the unit property and route a TSPEC erratum adding `ADVISORY_SEAM_PHASES` to §3.1's export list. An erratum for (b) is emitted with this review; (a) is the cheaper fix and needs no upstream edit. | §Properties, PROP-REC-07 (`PROPERTIES:156`) |
| F-02 | Medium | Local | **PROP-CFG-03 is invisible to every gate this pipeline runs, and the document does not say so.** Its home is the new engine-channel file `pdlc/engine/__tests__/advisory-config-example.test.js` (A6-04, verified absent at HEAD). This repo's live `.claude/pdlc.config.json` sets `implementation.testCommand` to `cd pdlc/workflows && npm test -- …` only — no `pdlc/engine` leg — so neither a Phase I wave gate nor the V-wave ever collects that file; its sole executor is CI's `Engine tests (ubuntu-latest)` job. PLAN records this (`PLAN:238`); PROPERTIES does not, and §G-1/§G-2 is exactly where a reader looks for it. Without the note, batch 1's "RED-terminal, fails for the named reason" expectation reads as if A6-04's expectation were observable to the loop. Add one row to §G-2 (or a sentence in §Oracles) naming the executor and the consequence: A6-04's red and green are asserted by CI, not by the wave gate. | §Gaps G-1/G-2; PROP-CFG-03 |
| F-03 | Medium | Local | **Precedent not cited for the example-config expectation, and its blast radius is unnamed.** §Fixtures opens "nothing re-invented", but an engine-channel reader of `.claude/pdlc.config.example.json` already ships: `pdlc/engine/__tests__/ci-arrangement.test.js:39` resolves that exact path from `repoRoot` and `:799`–`:819` parses it and asserts `implementation.testCommand` matches both `/cd pdlc\/workflows\s*&&\s*npm test/` and `/cd pdlc\/engine\s*&&\s*npm test/`. Two consequences the document should absorb: (i) PROP-CFG-03 should cite that precedent and state why a second file is minted rather than the surface extended (a batch-safety answer is fine — `ci-arrangement.test.js` is unowned by this PLAN — but it should be written down); (ii) A6-06's edit to the example config is a blast-radius edit on those two live assertions, so the fixture note should pin that the `testCommand` string survives the advisory-key addition unchanged. | §Fixtures ("nothing re-invented"); PROP-CFG-03 |
| F-04 | Medium | Local | **PROP-GATE-02 leads with implementation structure rather than an observable.** It asserts the anchor's name, its `{value: -1}` initialisation, that it is "never reassigned", and that it is hung on the returned SeamOps object. That pins a shape, not a behaviour, and a conforming refactor (anchor captured in a closure, or named differently) fails it while the contract holds. The behavioural content — `invocations.slice(ledgerAnchor.value)` yields exactly the invocations of the attempt under evaluation, and no earlier one — is already available, and PROP-GATE-04's mutation fixtures carry the falsifying half. Restate PROP-GATE-02 with the slice-bounds oracle as the property and the anchor mechanics as a derivation note, so the assertion survives any implementation that satisfies TSPEC §3.2 step 6. | §Properties, PROP-GATE-02 |
| F-05 | Low | Local | **Two FSPEC edge ids are covered but untraced.** Set-differencing FSPEC's and PROPERTIES' id vocabularies: `AT-*` (47/47) and `BR-*` are set-equal — good — but `E-13`, `E-17`, `E-18` appear in FSPEC and in no property's *Traces* cell. `E-13` is correctly a non-property (FSPEC:270 declares it evidence inside existing classes, best-effort). `E-17` (proposal changes PLAN, manifest, or implementation configuration — FSPEC:279) and `E-18` (proposal commits, pushes, or tags — FSPEC:280) *are* covered behaviourally, by PROP-ENV-10's enumerated prohibition list, but nothing says so. Add `E-17, E-18` to PROP-ENV-10's Traces, and `E-13` to §G-1's non-property table, so a future set-equality sweep over FSPEC's E table does not read three ids as uncovered. | §Properties PROP-ENV-10; §G-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-SEAM-02 names six transcription sites plus four bare row-count sites. I re-derived the row-count set independently (`grep -rn "toHaveLength(5)"` over `pdlc/workflows/__tests__`, filtered to `advisory.rows`) and got exactly the four the document names — `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `advisoryHarvest.test.js:726`. Oracle I says the derivation rule, not the four literals, is what the property carries. Does the A6-03 test express the rule mechanically (a scan that fails when a fifth bare row-count appears), or does it transcribe the four sites and rely on the Oracle-I prose? The former is what Oracle I promises; the latter is what a reader of the property row would build. |
| Q-02 | PROP-REST-03 ships as `test.todo` pending the OQ-7 boundary erratum. If that erratum resolves against `git clean -fdx`, does the property's *home* stay A6-09, or does the ignored-path case move into the real-repo fixture builder that A6-01 owns? Naming the landing site now avoids a late ownership contention between A6-01 and A6-09. |

## Positive Observations

- **Existing-code claims verify.** Every line-anchored claim I checked holds at HEAD: `helpers/advisoryDoubles.js:271`'s `SEAMS = ["A1","A2","A3","A4","A5"]`; `advisoryDriver.test.js:221`'s `GATE_EXCLUSIVITY_REGISTRY` and its set-equality comparison at `:846`; the four bare row-count sites at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571` and `:726`; `advisoryDodSeams.test.js:371`'s real-repo `mkdtempSync`/`execFileSync` A3 fixture; `ADVISORY_REFUSAL_REASONS`' eight members in shipped order (`orchestrate-dev.js:2297`–`:2306`) and `ADVISORY_EXCLUSIONS = ["X-a","X-e","X-d","X-b","X-c"]` (`:2311`); the wave gate-failure literal at `:14364`. This is unusually well-grounded for a first authoring pass.
- **PROP-ENV-03's trailing-slash boundary is correct against shipped code, not assumed.** `pathsCollide` (`orchestrate-dev.js:4726`–`:4731`) returns true only on equality or on a prefix match where the *prefix side ends in `/`*. So a manifest row spelled `pdlc/workflows/dist` genuinely does not cover `pdlc/workflows/dist/orchestrate-dev.bundle.js`, and asserting both spellings on one fixture pair is the right shape — a one-sided assertion would pass an implementation with no slash rule at all.
- **PROP-REST-03's `test.todo` choice is load-bearing and justified.** `orchestrate-dev.js:11150`'s skip guard is `/\b(describe|test|it)\.skip\s*\(/g`; `test.todo` is outside that regex, so the pending property does not trip the un-skip halt. Naming that hazard in §Fixtures rather than rediscovering it in Phase I is exactly the right place for it.
- **Traceability is set-shaped where it matters.** FSPEC's 47 acceptance-test ids and PROPERTIES' 47 are set-identical, and the `BR-*` vocabularies are set-identical. C-1 covers every acceptance criterion this REQ owns; the `AC-1.6` / `AC-3.6` / `AC-9.2` occurrences in REQ are citations to `REQ-pdlc-advisory-tier` (`REQ:367`, `:459`, `:483`), not criteria of this feature, so their absence from C-1 is correct rather than a gap.
- **Every named home is PLAN-owned.** Each of the twelve test files a property names appears in PLAN's file-ownership manifest under the task the property cites; the two files declared absent at HEAD (`advisoryWaveGate.test.js`, `pdlc/engine/__tests__/advisory-config-example.test.js`) are absent, and the ten existing suites plus the doubles helper are present.
- **Oracle quality is addressed head-on, not asserted.** Set-equality over containment is applied where it bites (PROP-REC-01's field set, PROP-SEAM-01, PROP-ENV-06/-07, PROP-CFG-01); absence-shaped conjuncts carry positive companions (PROP-GATE-04's `ledgerAnchor.value === 2` / `=== 4` halves, PROP-REST-08's positive escalation-entry assertions); and §G-2 names the three deliberately weak properties instead of hiding them.

## Recommendation

**Needs revision**

One High finding (F-01) gates: PROP-REC-07 as written cannot run at the level and home it declares,
because `ADVISORY_SEAM_PHASES` is not exported at HEAD and no upstream document makes it so. The
cheapest resolution is entirely inside this document — restate the property as the escalation log's
observable *Pipeline state* field, homed in `advisoryEscalationLog.test.js` (A6-17). If the author
prefers to keep it as a unit contract on the constant, the TSPEC erratum emitted with this review
must land first. F-02 through F-05 are non-gating and can be absorbed in the same revision.

Nothing else about the property set needs reopening: the traceability matrices, the oracle-quality
discipline, and the line-anchored grounding all hold against HEAD.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 1}
