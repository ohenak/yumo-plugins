# Cross-Review: test-engineer — Implementation Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/` implementation diff (`main...feat-pdlc-wave-resume`)
**Date:** 2026-08-24
**Iteration:** 1

## Scope and Method

Testing lens only, over the implementation diff `main...feat-pdlc-wave-resume`
(one production file, `pdlc/workflows/orchestrate-dev.js`; its generated twin
`pdlc/workflows/dist/pdlc-cli.mjs`; five new suites and three edited ones).

What I actually ran, rather than read:

| Check | Result |
|---|---|
| `cd pdlc/workflows && npm test` | 122 suites, 4467 passed, 70 skipped, 0 failed |
| `node pdlc/workflows/build-runtime.mjs --check` | `in-sync` — no dist drift |
| `git ls-files .claude/` | only `pdlc.config.example.json`, `settings.json`; the ledger is untracked (T-12 landed) |
| `git check-ignore -v .claude/pdlc-wave-state.json` | `.gitignore:46` — AT-14's anchor is real, not just documented |

Traceability sweep: every `AT-01`..`AT-18` id from `FSPEC-pdlc-wave-resume.md`
§5 appears in at least one suite. `AT-01/04/05/06/07/09/10/11/12/13/15/18` are
driven through `main()` in `waveExecution.test.js`; `AT-02/03/08/13` also have
unit halves in `waveResume.test.js`; `AT-14` in
`waveResumePreflight.test.js` and `waveResumeRepoState.test.js`; `AT-16` in
`waveResumeQueueParity.test.js`; `AT-17` in `waveResumeRepoState.test.js`.

**Production-path check (the one that matters here).** The classifier is pure
and unit-tested, but the artifact every acceptance criterion is written about —
the announced notice, the resume banner, the Phase I report row — is assembled
in `main()`. I traced each announcement to a test that drives `main()` rather
than `classifyWaveLedger`. All three report-row branches are driven through
`main()` (`waveExecution.test.js:2123`, `:2343`, `:2421`), and the ordinary
wave-1 string is still pinned verbatim (`:542`, `:596`), so D-3 did not
silently reword the pre-feature row. One announcement — the `over-count`
disregard reason — reaches `main()` in a test whose oracle is too weak to see
its content; that is F-01 below.

Fixture hygiene: I checked for implementation echoes in the expectation
position and found none. `waveResume.test.js` transcribes every catalogue
member, every parse sentence and every reason string as a literal
(`:46`-`:80`, `:101`-`:124`, `:170`-`:203`), and `formatWaveLedger`'s two
shapes are compared against locally-built `JSON.stringify` literals rather
than against the function's own output (`:127`-`:148`). The generative suite
(`waveResumeProperties.test.js`) pins `numRuns: 500` at `:31` with no fixed
seed, which is what TSPEC §5.7 asks for.

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
