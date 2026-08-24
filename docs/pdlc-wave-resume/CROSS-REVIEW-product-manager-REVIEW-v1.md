# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the shipped diff `main...feat-pdlc-wave-resume`
**Date:** 2026-08-24
**Iteration:** 1

## Scope and method

**Note on the file name.** The task names `…-REVIEW-v1.md` as this round's path. A
`CROSS-REVIEW-product-manager-REVIEW-v2.md` already exists on this branch (committed `9c415a75`…`97e783ca`)
with no v1 beneath it. I have written to the mandated v1 path and, per the tag-selection discipline,
reconciled my Scope tags against that file's findings rather than shipping conflicting tags for the
same defect. The overlap is called out per finding.

Product lens only. Method:

- Read `REQ-pdlc-wave-resume.md` §7 (REQ-WVR-01 … REQ-WVR-10) and `FSPEC` §6 (AT-01 … AT-18) first,
  then the shipped diff `main...feat-pdlc-wave-resume` (91 files, +21778/-297).
- For every AC claiming an operator-visible artifact, traced **AC → production caller → test that
  drives that caller**, not to a builder's own unit test.
- Ran the feature's suites to ground every claim about behaviour:
  `npm --prefix pdlc/workflows test -- __tests__/waveResume __tests__/waveExecution.test.js` →
  **6 suites, 177 tests, all passing**.
- Checked runtime drift: `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`, exit 0. The
  generated `pdlc/workflows/dist/pdlc-cli.mjs` was rebuilt in the same feature branch as the source
  change, per this repo's standing rule.

**Production wiring — checked, and clean.** Every new export is reached from `main()`, not only from
tests:

| New seam | Production caller |
|---|---|
| `classifyWaveLedger` | `pdlc/workflows/orchestrate-dev.js:16266` (inside `main()`'s Phase I ledger branch) |
| `computePlanHash` | `orchestrate-dev.js:16227` |
| `parseWaveLedger` | `orchestrate-dev.js:16232` |
| `ANCESTRY_INDEPENDENT_CODES` | `orchestrate-dev.js:16272` (the lazy-probe short-circuit) |
| `WAVE_IGNORE_REASONS` / `PARSE_REASON_CODES` | inside `classifyWaveLedger`, `orchestrate-dev.js:12942`ff |
| `formatWaveLedger` / `writeWaveLedger` | `orchestrate-dev.js:16577`, inside the wave loop's `if (waveGit)` block |

There is **no zero-caller seam** in this feature and no dead config. The behavioural ACs are driven
through `main()` in `waveExecution.test.js` (96 `main(` call sites), not through the classifier alone
— the new `waveResume*.test.js` modules are deliberately unit-level and are the *supplement* to that
integration coverage, not a substitute for it. That is the right shape and I want to say so before
the findings.

## Requirement-by-requirement trace

| REQ | P | Production caller that satisfies it | Test that drives THAT caller | Verdict |
|---|---|---|---|---|
| REQ-WVR-01 automatic resume at the failed wave | P0 | `orchestrate-dev.js:16300`-ish `resume` branch sets `startWave = decision.startWave` and emits `Resuming at wave …` | `waveExecution.test.js:2279` "records each committed wave, and the next invocation resumes at the failed one" (drives `main()` twice) | ✅ met |
| REQ-WVR-02 closed disregard catalogue (IG-1..6) | P0 | `WAVE_IGNORE_REASONS` (7 codes) consumed by `classifyWaveLedger` | `waveResume.test.js:48` set-equality over `Object.keys(WAVE_IGNORE_REASONS)` against a **literal transcription** of the seven codes; announcements driven through `main()` at `waveExecution.test.js:2472`, `:2661`, `:2898` | ✅ met |
| REQ-WVR-03 verification independence | P1 | un-skip guard + gate run before any commit, `orchestrate-dev.js:16472`-ff ("A green gate is only worth something if the wave's tests actually ran") | `waveExecution.test.js:683`ff | ✅ met |
| REQ-WVR-04 operator override wins, with provenance | P1 | `explicitPointer` branch, `orchestrate-dev.js:16203`/`:16217`, both notices now suffixed `(provenance: operator-set)` | `waveExecution.test.js:2710` "an explicit implementation.startWave outranks the ledger"; boundary (`startWave: 1` ≡ omitted) at `:2913` | ✅ met |
| REQ-WVR-05 record retained, invalidated by the reader | P1 | record kept after the last wave (`orchestrate-dev.js:16583` comment + guard 4's `planHash` re-derivation at `:12978`) | `waveExecution.test.js:2803` "a matching record whose waves are all green skips Phase I whole, and the row says so" | ✅ met |
| REQ-WVR-06 completion is never commit archaeology | P1 | completion read only from `lastGreenWave`; ancestry is falsification only, one `merge-base --is-ancestor` probe at `orchestrate-dev.js:16276` | `waveExecution.test.js:2413` no-change wave still records green; `:2472`/`:2511` the probe is a real input (non-ancestor ignored **and** ancestor honoured) | ✅ met |
| REQ-WVR-07 unattended queue parity | P2 | `orchestrate-queue.js` leaves `_runPipeline` at its `realMain` default | `waveResumeQueueParity.test.js` — **structural only**; no test observes a delegated run's resume point | ⚠️ see F-04 |
| REQ-WVR-08 all waves recorded → Phase I skipped in full | P1 | `skip-phase` branch `orchestrate-dev.js:16313`-ff; distinct `⏭` report row at `:16598` reading `Skipped — all N waves previously committed and recorded green (wave ledger) (provenance: automatic)`; hatch named in the run-log line only, as the REQ requires | `waveExecution.test.js:2358` (complete ledger → zero implementation dispatches, V-wave still runs), `:2622` (honoured on a forced run, notice names the escape) | ✅ met |
| REQ-WVR-09 verified-but-uncommitted is never recorded | P0 | the ledger write at `orchestrate-dev.js:16576` sits **inside** the `if (waveGit)` block opened at `:16506` ("Only now — verified — does anything get committed (M-6)"), so a run with no git transport records nothing | `waveExecution.test.js:2679` "writes no ledger at all when there is no git transport", with a **paired positive** on the same path (`logs` must contain the `verified but NOT committed` notice — not an absence-only oracle), plus the companion arm at `:2699` proving the guard is the transport and not the gate mode | ✅ met (see F-06 for the missing second invocation) |
| REQ-WVR-10 record never becomes tracked content | P1 | `.gitignore:46` `/.claude/pdlc-wave-state.json`, root-anchored | `waveResumeRepoState.test.js:66-83` — asserts the exact line exists, that it is root-anchored, **and** that `git check-ignore -v` resolves to that exact line rather than a broader pattern. This is the ignore-rule anchoring the REQ asked for (C-1), not "nobody happened to stage it" | ✅ met |

**Closed-catalogue checks are genuine set-equality, not containment**, and the expected values are
literal transcriptions rather than derivations from the code under test:

- disregard codes — `waveResume.test.js:48`, `new Set(Object.keys(WAVE_IGNORE_REASONS))` vs a
  hand-written seven-element set;
- ancestry-independent codes — `waveResume.test.js:70`, `toEqual([null, "unreadable-json", …])`;
- the recognised `implementation.*` keys — `waveResume.test.js:83`, four-key set-equality (AT-08 iii);
- the announcement table — `waveExecution.test.js:2978`, five fixtures driven through `main()`, each
  asserted to emit **exactly one** `(provenance: …)` line, with the observed row-kind set compared
  by set-equality to a literal five-element list. A deleted announcement reds this test.

That is the standard I would ask for, and it was met without being asked.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
