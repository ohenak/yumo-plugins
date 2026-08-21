# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review — resolution of the v1 findings, and new issues in the changed sections only

## Delta grounding

I re-read `CROSS-REVIEW-test-engineer-TSPEC-v1.md`, diffed the document against `cb249afd` (the
commit my v1 review landed on) with `git diff cb249afd..HEAD --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md`, and re-verified every code claim the changed
sections make. As in v1, this tree does not carry the mechanism, so verification is against
`origin/main` via `git show origin/main:<path>`, exactly as §1.1 instructs; line numbers below are
line numbers in the `origin/main` blob and are locators, the named symbol or enclosing test is the
citation (DEC-DOC-01).

Everything the revision newly asserts about the repository, re-checked independently rather than
read back out of the document:

| Claim | Verified |
|---|---|
| V-18 — the operator resume banner is its own `if (startWave > 1)` block, after the clamp, before `if (!explicitPointer)` | `orchestrate-dev.js:15244-15255`, between the clamp's `startWave = 1` (`:15242`) and `if (!explicitPointer)` (`:15263`); its last sentence is `Clear implementation.startWave before the next fresh run.` (`:15253-15254`) |
| V-19 — a feature- or plan-hash-mismatched record issues **zero** `merge-base` calls | the `else if` chain: `recorded.feature !== featureName` (`:15300`), `recorded.planHash !== planHash` (`:15304`), and only then `!(await headCorroborated(recorded.head))` (`:15306`) |
| §2.4 change #1 — the past-the-end notice is pinned by array-element equality | `it("a pointer past the last wave runs every wave, and says so")`, `expect(logs).toContain(...)`, `:2134-2137` |
| §2.4 change #2 — the ignored-record notice, all four members | `it.each(...)("%s is ignored with a notice, and every wave runs")` (`:2645`), `expect(logs).toContain(...)` `:2654-2657` |
| §2.4 change #3 — the operator-resume run's Phase I detail is whole-string equality | `it("skips the waves before the pointer entirely — no dispatch, no gate, no commit")`, `expect(phaseDetail(result, "I")).toBe("All 3 waves complete (wave mode, script-owned gate)")`, `:2117-2119`. The run resumes at wave 2 (`configWithStartWave(2)`, `dispatchedTaskIds` `["T2","T3"]` `:2100`), so D-3 does change it. **This one I did not find in v1; the revision did.** |
| §2.4's claim that **no other** assertion changes | Re-derived independently. `grep -n "force a full run\|Resuming at wave\|Skipping Phase I\|was ignored\|phaseDetail(" ` over the whole file yields, besides the three above, only prefix or interior-substring matchers: `:2113`, `:2163`, `:2294`, `:2296`, `:2299`, `:2348`, `:2440-2447`, `:2470`, `:2541-2543`, `:2572`, `:2618`, `:2658`, `:2682`. Every one survives a clause appended after the terminal `.` and outside every existing parenthesis. The two other `phaseDetail(result, "I")` equalities (`:538`, `:592`) are wave-1 runs of a 1-wave plan and are untouched by D-3. |
| the `⏭` row assertion survives | `expect(row.detail).toContain("recorded green (wave ledger)")` `:2682` — §2.4's new string keeps `(wave ledger)` intact and appends outside it, so this passes unchanged |
| queue delegation payload | `_runPipeline: runPipelineFn = realMain` `orchestrate-queue.js:1240`; `report = await runPipelineFn({ reqPath: entry.reqPath })` `:1582` — the key set really is `{reqPath}`, so AT-16 (ii)'s transcribed literal is correct |
| AT-06 is now satisfiable | `IMPLEMENTATION_DEFAULTS.startWave` is `1` (`orchestrate-dev.js:169-174`), `startWave: 1` sets `explicitPointer` false (`:15236`), fires neither the clamp (`:15237`) nor the banner (`:15244`) — so `startWave: 1` and an omitted key really do produce byte-identical logs, and both consult the record |
| §5.8's coverage claims | `"test:coverage": "c8 npm test -- --runInBand && c8 report --check-coverage --per-file --branches 85 ..."` (`pdlc/workflows/package.json:9`), `run: npm run test:coverage` (`.github/workflows/pr-tests.yml:85`), and `.claude/pdlc.config.example.json`'s `implementation.testCommand` is plain jest with no `c8` |
| §5.7's precedent and dependency | `"fast-check": "^4.9.0"` (`pdlc/workflows/package.json:13`); `pdlc/workflows/__tests__/advisoryHelperProperties.test.js` exists |
| A-2's unit block | `describe("computePlanHash — the ledger's plan fingerprint")` `waveExecution.test.js:2717` — PM F-06's premise does not hold, and the revision is right to answer it with evidence |
| §3.2's named consumer for `lastGreenWave` | the skip line is `wave ledger: waves 1–${startWave - 1} already green` (`orchestrate-dev.js:15377`), pinned by `expect(logs).toContain("Wave 1/3: skipped (wave ledger: waves 1–1 already green)")` (`:2293`) |
| AT-14's fixture rationale | `origin/main`'s `.gitignore:40-41` carries `/.claude/workflows/` and `/.claude/pdlc-wave-state.json` under the anchoring block `:24-32`; this tree's carries only `/.claude/workflows/` (`:29`) — so AT-14 is red here, as §5.4 and OB-F1 now state |

## Resolution of v1 findings

All four v1 High findings are resolved. Ten of the fourteen are closed outright; three are closed
with a small residue I record below as new Low/Medium rows rather than as reopened findings.

| v1 | Sev | Status | Evidence in the revision |
|----|-----|--------|--------------------------|
| F-01 | High | **Resolved** | §2.4 respecifies the suffix as a clause appended *after the sentence's terminal punctuation and outside every existing parenthesis*, which is the (a) option I asked for — and then does the (b) work anyway: the sub-section *The three shipped assertions that do change* names each by enclosing test with its replacement transcribed as a literal. Three constraints are stated mechanically: no matcher is relaxed, no other assertion in the ledger `describe` changes, and the three edits land in the same task as the announcement change. D-11 records it as a scope row. RT-3 is rewritten from "breaks none" to "partly realised, handled by enumeration", with a named residual (a fourth breakage) and a mitigation (run the full suite as that task's own gate). I re-derived the "no other assertion changes" claim independently and it holds. The revision also found a third breakage I missed — the `phaseDetail` equality at `:2117` — which is the outcome this finding wanted. |
| F-02 | High | **Resolved** | The probe stays lazy and the laziness is now a contract, not an incident. §2.2 gives the call-site sketch, §2.3's normative flow carries it, §1.2's *what is not changed* list adds "the laziness of the ancestry probe", DEC-WVR-08 records the rejected eager alternative with the reason it would have been unfalsifiable, and §5.5 item 4 names the eager-probe mutation and states that only `toEqual` on the filtered call list kills it. The oracle is the one I asked for: AT-03 asserts `toEqual([])` on the feature-mismatch and plan-hash-mismatch fixtures and `toEqual([["merge-base","--is-ancestor",HEAD_SHA,"HEAD"]])` on the ancestry fixture, and AT-11 adds `toEqual([])` for a record with no `head`. Equality, not containment — which is the whole point, since the shipped `toContainEqual` (`:2447`) cannot fail on an extra call. I checked the control flow for soundness: the dereference `parsed.state.head` is safe, because every code in `ANCESTRY_INDEPENDENT_CODES` other than the mismatch pair is reached with `parsed.state === null`, and the mismatch pair short-circuits — the document states this and it is correct. The re-entry at guard 5 (above guard 6) preserves the shipped `head-unreachable`-beats-`over-count` ordering. |
| F-03 | High | **Resolved** | AT-06 now compares `CONFIG_WITH_TEST_COMMAND` + `startWave: 1` against `CONFIG_WITH_TEST_COMMAND` with the key omitted — one input differing, both with `scriptGate === true`, so the gate-degradation notice appears in neither and whole-array log equality is reachable. Verified against `IMPLEMENTATION_DEFAULTS` (`:169-174`) and the clamp/banner conditions (`:15236-15244`): the two runs really are byte-identical. The positive conjunct I asked for is there and is the right one — both runs must show the record *honoured* (`Resuming at wave 2 of 3 (wave ledger` with ` (provenance: automatic)`, and `dispatchedTaskIds` equal to `["T2","T3"]`) — so two equally-broken runs cannot compare equal. |
| F-04 | High | **Resolved** | AT-16 no longer leaves the seam unnamed. `_runPipeline`'s default (`realMain`) is named, both false-green routes are named and rejected in DEC-WVR-07 with reasons, the queue-side fixtures are enumerated by name (a one-row `pending` `QUEUE.md`, `distribution.checkEnabled: false` so the drift gate does not refuse the invocation, a Phase-0 triage `_agent` double), and there is a falsification arm (forward any extra key ⇒ (ii) reds while AT-01..05 stay green). Most importantly the row states plainly what it does **not** prove — "it does not observe a real delegated Phase I resolving a record" — and locates the behavioural half on the direct path. That is the honest scoping this finding asked for. The `{reqPath}` key set is correct against `orchestrate-queue.js:1582`. Arms (i) and (iii) are weaker than the row's framing implies; that is new F-02 below, Medium, not a reopening. |
| F-05 | Medium | Resolved | §2.3 gains the `if startWave > 1` operator banner between the clamp and the `!explicitPointer` guard, V-18 pins its position, and AT-05 now names the announcement the token must be found on (`Resuming at wave 2 of 3 (implementation.startWave)`) and asserts on that filtered element, so a token appearing elsewhere does not satisfy it. |
| F-06 | Medium | Resolved | §5.7 adds `waveResumeProperties.test.js` with the four laws (round trip, reader totality, classifier totality, hash discrimination), the FNV-1a non-injectivity caveat stated in the suite, and the convention copied from the shipped property suite rather than invented. §5.3 gains the generative row. |
| F-07 | Medium | Resolved | §5.8 names the floor as a command (`npm run test:coverage` from `pdlc/workflows`, `--per-file --branches 85`) rather than as include-list membership, places it on the last implementation wave's `postWaveCommand`, and RT-7 carries the risk with a stated backstop. §5.6 now separates the `version` *field* exemption from the `formatWaveLedger` *branch*, which was the sub-point. |
| F-08 | Medium | Resolved | §5.2 downgrades "limited to fixtures" to "most new doubles are fixtures" and names H-1 (ordered event sink for AT-04's interleaving) and H-2 (scriptable failing `_writeFile` for AT-15 arm 2), both additive and default-off, with the reason the shipped harness cannot express each. The same-file authoring-order consequence is routed to the PLAN in §5.3. |
| F-09 | Medium | Resolved | AT-12 gains a report-row conjunct asserting the `⏭` detail **equal** to the transcribed literal, so deleting the provenance clause from the skip row reds there. |
| F-10 | Medium | Resolved | AT-14 gains three conjuncts (line equality, leading-`/` anchoring, `git check-ignore -v` resolving to *that* line), and the ordering precondition is stated twice as a precondition rather than a caveat — in AT-14 ("the wave carrying AT-14 must not be dispatched before the rebase") and in OB-F1, with the halt mechanics spelled out. The forbidden weakenings are named, including the `some(line => line.includes(...))` form an unanchored rule would satisfy. |
| F-11 | Low | Resolved | §3.2 gives `ReasonContext` one constructor (the classifier), states `code !== null ⇒ ctx` present, and renames `recordedWaves` to `recordedLastGreenWave` after the field the over-count sentence interpolates. |
| F-12 | Low | Resolved with residue | A consumer is named — the per-wave skip line, verified at `orchestrate-dev.js:15377` and pinned at `:2293`. Residue recorded as new F-05 (Low). |
| F-13 | Low | Resolved | §5.1 restates the no-echo rule at the point of temptation: an expected announcement is transcribed from §2.4/§3.1, never obtained by calling `WAVE_IGNORE_REASONS[code](ctx)`. |
| F-14 | Low | Resolved | AT-13 gains a table-driven case over §2.4's six announcement rows with **set** equality against the five announcing rows, and IG-6 asserting silence positively. |

Questions from v1: Q-01 answered by DEC-WVR-08 (lazy, deliberately); Q-02 by DEC-WVR-07 and AT-16's
named residual gap; Q-03 by §5.3's explicit PLAN obligation on `waveExecution.test.js` single
ownership; Q-04 by §5.4's new seven-row code-reachability table, whose `over-count` row correctly
omits `head` so guard 5 passes without a transport call; Q-05 by §5.8 ("yes").

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
