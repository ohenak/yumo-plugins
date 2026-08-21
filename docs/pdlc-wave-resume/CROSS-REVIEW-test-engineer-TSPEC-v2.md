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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
