# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** delta re-review of the v1.1 revision — whether v1's blocking findings are resolved and
whether the revision introduced anything new that breaks. Diffed against `54b0e667` (the commit
carrying v1 of this review); unchanged sections are not re-reviewed. Every claim below is grounded
in HEAD source on `feat-pdlc-headless-engine`, cited `file:line`, or in a measurement run here.

## Prior findings — disposition

All seven v1 High findings are resolved, and I checked each against HEAD rather than against the
changelog:

| v1 | Disposition | Verification |
|---|---|---|
| F-01 High — `resolveTransport` selector contradicted FSPEC §3.2 | **Resolved.** §3.4 now states there is no selector, `kind` is constant, `"cli"` is reachable only by direct unit construction, and §4.5's field carries one value | consistent with `FSPEC:193-196`; §6.4 no longer disagrees with §3.4 |
| F-03 High — module-scoped accumulator is per test *file*, outcome harness vacuously green | **Resolved in principle**, new defect in the replacement mechanism — see F-18. §7.0 replaces it with per-pid JSONL files unioned by a post-`&&` step, and makes an empty union a failure | measured again here: `node --test` still runs one child per file (pids differ) |
| F-04 High — guard-parity oracle had no execution mechanism, clauses absence-shaped | **Resolved.** §6.3 step 3 ("perform the deletion the verdict permits") is the missing half, and the three-row falsifier table gives each clause a counterpart | the allow-path control is what makes clause (b) falsifiable, exactly as asked |
| F-05 High — `agent-reported-failure` had no predicate, any predicate broke R-ARCH-2 | **Resolved.** Literal regex, stated in the spec, owned by layer 2; `outcome.mjs` receives a boolean. The `VERDICT:`-is-not-a-failure paragraph is the right guard | the "mentions the token mid-line ⇒ `ok`" falsifier is the transcription check I wanted |
| F-06 High — queue's declared set wrong; rung-4 scope unstated | **Resolved and correct.** `se-author` is the Phase-0 triage dispatch (`orchestrate-queue.js:1216`), the advisory identifier reaches the queue via `runAdvisorySeamFn` (`:1252`) with `_agent: rawAgentFn` (`:1258`) → `ADVISORY_RUNG_SKILL` (`orchestrate-dev.js:1797`, dispatched `:1841`), and rung 4 now checks the union | all four citations resolve exactly |
| F-07 High — source-scan derivation reached only 3 of 10 identifiers | **Resolved, and mechanically verified.** I ran §3.3's derivation against HEAD's exported `PHASE_DISPATCH`: the five role keys yield `{dod-verify, pm-author, pm-review, se-author, se-implement, se-review, te-author, te-review}` (8), plus `ship-pr` and `harvest-learnings` from the named constants = **exactly 10**. `verifier` and `remediator` are real keys (`orchestrate-dev.js:3434`, `:3435`) | derivation executed against the module, not read |
| F-08 High — AC-1.2 had no observation instrument | **Resolved.** §7.7 designs one, and the two positive clauses plus the "recording is non-empty" and "planted `.claude/workflows/` read must fail clause 3" controls are what stop clause 3 being absence-only. The populated-fixture point is the detail that makes it real | §2.5's decision not to override the modules' IO seams is correctly load-bearing here (`orchestrate-dev.js:8492`) |

All seven v1 Mediums and both Lows are addressed too: `BR-TRANS-*` removed in favour of `R-TRANS-1`
(F-02); §4.1 relabelled adapter-internal with §3.4 named as the boundary (F-09, but see F-20); the
timeout backoff arm stated with a testable 30 s at attempt 0 (F-10); `--import` replacing "installed
by the bootstrap" (F-11); the three generated `dist/` rows and the same-task rebuild obligation added
to §8.3 (F-12); the scanner's positive control and named pattern (F-13); M-ENG-09 as a durable record
with an unrecorded-is-red gate (F-14); and the three off-by-N citations corrected — `report.mjs:50`,
`adapter.mjs:278`, `orchestrate-queue.js:1041` all resolve now (F-15), and AC-1.5 repointed to §2.4
with `run.mjs:52`/`:58` and `__tests__/run.test.js:48`/`:64`, all four exact (F-16).

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
