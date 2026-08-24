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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `over-count` (IG-4) is the one disregard code whose announced reason is never asserted through the production path. `PROPERTIES-pdlc-wave-resume.md:148` (`PROP-DISREGARD-02`, level **I**, owner T-07) requires, *for each of the seven codes*, a `main()` run asserting **the whole transcribed notice** plus `expect(dispatchedTaskIds(record)).toEqual([...])` as the positive conjunct — restated at `:324` ("the dispatch conjunct is the positive half: a notice with no run behind it would otherwise pass"). Five codes get exactly that (`waveExecution.test.js:2757`-`:2800`); `head-unreachable` gets a substring plus the dispatch conjunct (`:2472`-`:2500`); `over-count` gets neither. `waveExecution.test.js:2676` asserts only `logs.some(m => m.includes("was ignored") && m.includes("only 3"))` and `result.outcome === "success"` — no dispatch conjunct, and **no assertion mentions the recorded count at all**, although the fixture records `lastGreenWave: 4` (`:2670`). See F-01 detail below for why this is falsification-blind rather than merely terse. | PROP-DISREGARD-02; FSPEC AT-02; `waveExecution.test.js:2661`-`:2677` |
| F-02 | Medium | Local | DEC D-1 is half-landed and nothing can see it. `TSPEC-pdlc-wave-resume.md:80` requires "Replace the INTERIM commentary with the formalised contract, citing this TSPEC", and PLAN T-02 (`PLAN-pdlc-wave-resume.md:127`) carries it as comment-only work. The block header at `orchestrate-dev.js:12846` was rewritten correctly, but the second INTERIM marker survives verbatim at `orchestrate-dev.js:16224` — `// ── INTERIM wave ledger (see WAVE_STATE_PATH) — the automatic half of the` — and therefore also in the generated `pdlc/workflows/dist/pdlc-cli.mjs:16233`. `grep -rn INTERIM pdlc/workflows/__tests__/` returns only two `describe`/comment strings in `waveExecution.test.js` (frozen by RT-2) and one fixture; no oracle asserts the marker's absence from production source. This is exactly R-4's "interim/final divergence" that D-1 exists to close, shipped because a comment-only obligation was given no falsifying check. | TSPEC D-1; `orchestrate-dev.js:16224`; `dist/pdlc-cli.mjs:16233` |
| F-03 | Medium | Cross-Feature | The new census escape hatch is justified by an owner that does not exist. `documentOracles.test.js:385` adds `!name.startsWith("waveResume")` to the 102-file `*.test.js` census, and the comment at `:365` justifies it as "excluded from the census, with that PLAN's §3.3 manifest owning their census". No oracle enforces that ownership: `grep -rn waveResume pdlc/workflows/__tests__/*.test.js` outside the `waveResume*` files returns only the exclusion itself and its comment. So the five new suites are counted by *nothing* — adding a sixth `waveResume*.test.js`, or deleting one, reds no test in the repo. This is the second namespace granted this exemption (`learnings*` was the first, `:381`), and each one narrows the census oracle without adding the replacement guard the comment promises. | `documentOracles.test.js:362`-`:387`; PLAN §3.3 |
| F-04 | Medium | Process | `coverageInstrumentation.test.js` is modified by this feature (+28/−13) but is owned by no PLAN task: the string `coverageInstrumentation` appears nowhere in `docs/pdlc-wave-resume/*.md`, so it is absent from PLAN §3.3's file-ownership manifest, from the batch DAG, and from every AT and property. The edit itself also weakens the oracle: it wraps the c8 `--check` driver in a five-attempt retry gated on a stderr regex for `STALE pdlc/workflows/dist/` or `ENOENT ... pdlc-cli\.mjs` (`coverageInstrumentation.test.js:184`-`:212`), i.e. it retries past a real cross-worker race with `consolidationBuild.test.js` rather than removing it. Retry-until-green is only safe if the underlying failure is *purely* the race; an intermittent genuine dist-drift now needs to lose five times in a row to be reported. | `coverageInstrumentation.test.js:181`-`:212`; PLAN §3.3 |
| F-05 | Low | Local | Ledger fixtures compute their `planHash` by calling the shipped `computePlanHash` (`waveExecution.test.js:2366`, `:2479`, `:2518`, `:2553`, `:2583`, `:2628`, `:2666`, `:2717`, `:2934`). This is not an expectation echo — the hash sits in the *fixture*, not the assertion — but it makes the "planHash matches" precondition self-fulfilling: if `computePlanHash` changed shape, every one of these fixtures would follow it, and the honour-vs-ignore decision could never red on hash drift. `computePlanHash` itself is separately covered (`:3130`-`:3145`, `PROP-LAW-04`), so the risk is contained; pinning one literal 8-hex fixture in the honoured-record test would close it. | TSPEC §5.1 oracle rule; `waveExecution.test.js:2366` |
| F-06 | Low | Local | Freeze is a contract for four catalogues but is tested for two. `orchestrate-dev.js:12884` (`WAVE_IGNORE_REASONS`) and `:12906` (`ANCESTRY_INDEPENDENT_CODES`) are both `Object.freeze`d, and `waveResume.test.js` asserts `Object.isFrozen` for `RESUME_OUTCOMES` (`:31`) and `RESUME_PROVENANCE` (`:42`) but for neither of the other two (`:46`-`:66`, `:68`-`:79`). Two one-line additions make the freeze uniform. | `waveResume.test.js:46`, `:68` |
| F-07 | Low | Process | PROPERTIES→test traceability is mostly manual, and one id namespace collides. Of this feature's ~55 `PROP-*` ids, only `PROP-DISREGARD-04/05/06`, `PROP-SAFETY-04`, `PROP-LAW-01..04` and `PROP-PARITY-01..04` appear in test source; `PROP-RESUME-*`, `PROP-SKIP-*`, `PROP-OVERRIDE-*`, `PROP-RECORD-*`, `PROP-REPO-*`, `PROP-PRE-*` and `PROP-DISREGARD-01/02/03/07..11` are covered behaviourally but carry no id in a test name, so the mapping has to be re-derived by reading. Worse, `PROP-RECORD-06` and `PROP-RECORD-09` are already used by `learningsRecord.test.js` for a *different* feature's properties, so a grep-based trace of this feature's `PROP-RECORD-*` returns confidently wrong answers. A `// PROP-xxx-NN` tag on each owning `it`/`describe` is cheap and makes harvest mechanical. | PROPERTIES §Oracles; `learningsRecord.test.js` |

### F-01 detail — why the `over-count` gap is falsification-blind

The reason string is rendered from a `ReasonContext` the classifier builds:

```js
// orchestrate-dev.js:12989
return fullRunWith("over-count", { feature, recordedLastGreenWave, waveCount });
```

Swap those two numeric fields and the notice becomes *"it records 3 wave(s) as
green but this plan has only 9"* — an operator-facing message with the numbers
inverted, on the one path whose entire job is explaining why a resume was
refused. Every existing test stays green:

- `waveResume.test.js:270` (guard 6, unit) asserts `d.outcome` and `d.code`
  only — it never reads `d.reason`.
- `waveResume.test.js:198` (renderer, unit) feeds its *own* literal
  `{recordedLastGreenWave: 9, waveCount: 3}`, so it tests the template, not the
  wiring.
- `waveExecution.test.js:2676` (integration) matches `"only 3"`, which is the
  `waveCount` half — the half that is correct under the swap.

Nothing composes classifier→renderer for this code. Contrast `feature-mismatch`,
which *is* closed end-to-end: `waveExecution.test.js:2769` asserts
`'it records feature "other-feat", not "test-feat"'`, both names, through
`main()`.

**Change that resolves it:** move the `over-count` fixture into the `it.each`
table at `waveExecution.test.js:2757` as its sixth row, with the transcribed
whole notice —

```
Notice: the wave ledger .claude/pdlc-wave-state.json was ignored — it records 4 wave(s) as green but this plan has only 3. Running every wave from 1. (provenance: automatic)
```

— which inherits that table's `dispatchedTaskIds(record)` conjunct and its
`merge-base` call-list equality, and satisfies `PROP-DISREGARD-02` and
`PROP-DISREGARD-10` for the seventh code by construction. Then run the swap
above as the mutation check (`PROP-COV-03`), observe RED, revert, record.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `PROP-DISREGARD-02` says "for each of the seven codes"; `head-unreachable` (`waveExecution.test.js:2472`) gets the dispatch conjunct and the exactly-one-probe equality but matches its reason with `toContain("is not an ancestor of HEAD")` rather than the whole transcribed notice, so the short-SHA rendering (`String(ctx.recordedHead).slice(0, 12)`, `orchestrate-dev.js:12896`) is asserted nowhere through `main()`. Was the substring form a deliberate concession — the SHA is fixture-dependent — or the same omission as F-01? If deliberate, a `toContain(HEAD_SHA.slice(0, 12))` conjunct restores the ctx-wiring check without pinning the whole line. |
| Q-02 | F-04's retry loop names `consolidationBuild.test.js` as the racing writer. Is making that suite hermetic (mutate a temp copy of `dist/pdlc-cli.mjs` rather than the tracked file) in scope for this feature, or should it be routed as a separate queue item with the retry left as a documented stopgap? |

## Positive Observations

- **The extraction is exactly the shape that makes testing cheap.** Pulling the
  decision into a pure, total `classifyWaveLedger` (`orchestrate-dev.js:12942`)
  with the IO — one lazy `merge-base --is-ancestor` probe — left in `main()`
  means the eight-row guard table is a table-driven unit test
  (`waveResume.test.js:206`-`:330`) instead of eight orchestrator runs. The
  optimistic-then-reclassify protocol (`orchestrate-dev.js:16262`-`:16283`)
  keeps that purity without an eager probe.
- **The lazy-probe contract is pinned by call-list equality, not containment.**
  `waveExecution.test.js:2503`-`:2506` asserts
  `calls.filter(a => a[0] === "merge-base")` **equals** the single expected
  argv, and `:2801` asserts it equals `[]` on the ancestry-independent
  fixtures. The comment at `:2501` says explicitly why `toContainEqual` alone
  would not kill the eager-probe mutation. That is the difference between a
  performance claim and a tested one.
- **Fail-open is asserted positively everywhere I checked.** The
  no-transport and throwing-transport arms (`:2545`-`:2610`) assert the resume
  banner is *present* and the resumed subset *was* dispatched, rather than
  "no ignore notice appeared". IG-6's silence carries the
  `dispatchedTaskIds(record)` conjunct (`:2898`). Absence-only oracles are
  genuinely absent from this diff.
- **The announcement table is closed by set equality**, not by a per-message
  containment check (`waveExecution.test.js:2978`, "exactly the five §2.4
  provenance rows fire, each once") — so deleting an announcement reds *there*
  rather than silently.
- **Generative and example-based layers are both present and neither is
  cargo-culted.** `waveResumeProperties.test.js` states four laws
  (round-trip, totality of `parseWaveLedger`, totality of `classifyWaveLedger`,
  hash discrimination) at `numRuns: 500`, and its header (`:1`-`:16`) argues
  explicitly why it does not subsume the named-example tables.
- **AT-14 is proved against the repository, not against a document.**
  `waveResumeRepoState.test.js:64`-`:88` reads the real `.gitignore` and the
  real `git check-ignore` source, which is why my independent run of
  `git check-ignore -v` agreed with it.
- **Coverage clears the floor with headroom and the gate really runs.**
  `npm run test:coverage` exits 0; `orchestrate-dev.js` reports **88.87 %**
  branch against the `--per-file --branches 85` gate in
  `pdlc/workflows/package.json`, with `--check-coverage` and an explicit
  `include` list naming the file — not source-list membership.
- **No dist drift.** `build-runtime.mjs --check` reports `in-sync`, so the
  generated `dist/pdlc-cli.mjs` was rebuilt in the same commits as the source.

## Recommendation

**Needs revision**

One High finding (F-01), so this is mandatory rather than a judgement on the
work — the suite is, on the whole, the strongest oracle set I have reviewed on
this pipeline. The gap is narrow and the fix is mechanical.

To reach approval:

1. **F-01 (required).** Add the `over-count` row to the `it.each` disregard
   table at `waveExecution.test.js:2757` with the whole transcribed notice, so
   it inherits that table's dispatch and `merge-base` conjuncts; delete or fold
   in the weaker standalone test at `:2661`. Run the field-swap mutation on
   `orchestrate-dev.js:12989`, observe RED, revert, record it in the task
   report per `PROP-COV-03`.
2. **F-02 (strongly recommended, one line each).** Replace the residual
   `INTERIM` marker at `orchestrate-dev.js:16224`, rebuild `dist/`, and add a
   source-text assertion in `waveResumeRepoState.test.js` that
   `orchestrate-dev.js` contains no `INTERIM wave ledger` — scoped to the
   production source so RT-2's byte-freeze on `waveExecution.test.js` is
   untouched.
3. **F-03 (strongly recommended).** Make the census exemption honest: assert in
   `waveResumeRepoState.test.js` — which already parses the PLAN — that the
   on-disk `waveResume*.test.js` set **set-equals** PLAN §3.3's manifest.
4. **F-04.** Either route the `coverageInstrumentation.test.js` edit to an
   owning task (`ERRATUM: PLAN`) or revert it and fix the race hermetically.

F-05, F-06 and F-07 are cleanups and need not gate.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 3}
