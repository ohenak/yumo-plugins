# Cross-Review: test-engineer — Codebase Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/` implementation on `feat-pdlc-engine-distribution` (delta `72d48238..ef881565`)
**Date:** 2026-08-16
**Iteration:** 2
**Scope:** Local

## Method

Delta re-review. Scope is the 16 commits in `72d48238..ef881565` and the sections they
changed; unchanged sections already reviewed in v1 are not re-litigated. Every claim below
is grounded in an observation at `ef881565`, not in a document.

1. **Suite execution.** `cd pdlc/engine && npm test` → `1..743`, `# pass 800`, `# fail 0`,
   `# skipped 2` (both `PDLC_LIVE=1`-gated, pre-existing, not new skips).
   `cd pdlc/workflows && npm test` → 4515 passed, 1 failed, 70 skipped (F-05 below, unchanged).
2. **Mutation probes.** Five probes run: the two that produced round-1's F-01 and F-02, plus
   three against code this round added or rewired. Each mutation was applied in the working
   tree, the suite re-run, and the tree restored; `git status --porcelain` over `pdlc/engine`
   is clean at the time of writing.
3. **Coverage re-measurement.** `npm test -- --experimental-test-coverage`, branch column,
   read per module against `PROP-REGR-6`'s eight-module enumeration
   (`PROPERTIES-pdlc-engine-distribution.md:242`).

## Round-1 findings: disposition

| Round-1 | Severity | Status | Evidence |
|---|---|---|---|
| F-01 sentinel guard unfalsifiable | High | **Resolved** | Deleting `publish-preflight.mjs:148-152` now reddens the suite (`# fail 1`), where it was 725/725 green in round 1. The matched pair at `publish-channel.test.js:311-373` — poisoned bytes refuse, the *same* inputs with clean bytes publish — attributes the refusal to the guard and nothing else. |
| F-02 publish CLI tokens pinned nowhere | High | **Resolved** | Renaming `case "verify-packed":` (`publish-preflight.mjs:525`) now reddens (`# fail 1`). `publish-channel.test.js:299` is set-equality in both directions with a non-degeneracy control (`invoked.length >= 5`) before the `deepEqual`, so an empty-set-vs-empty-set pass is closed. |
| F-03 four of eight modules below the 85 % branch floor | High | **Resolved** | Measured at `ef881565`: `publish-preflight.mjs` 88.46 (was 78.95), `fixture-machine.mjs` 88.57 (was 83.33), `prepack.mjs` 100.00 (was 66.67), `bin/cli.mjs` 87.65 (was 75.00). With `store` 94.44, `resolve-version` 97.14, `provenance` 100, `postinstall` 100, all eight modules `PROP-REGR-6` enumerates now clear the floor. |
| F-04 fixture-machine functions half-unreached | Medium | Partly addressed | Function coverage 39.13 → 40.74 after `d9dd3295`. Still recorded, still not a blocker — see F-04 below. |
| F-05 workflows suite not locally green | Low | Unchanged | Same single failure, same root cause (`documentOracles.test.js:246`, `.tokensave/` cache), still not this feature's code. |
| F-06 uncommitted PLAN edit | Low | **Resolved** | Committed in `832b4c70`; working tree carries no tracked modification. |
| Q-02 credential on the failure path | — | Answered | `redactSecret` added (`publish-preflight.mjs:330`), applied at both `reportFailure` (`:335`) and the real channel's throw (`:468-470`). See F-02 below on its wiring proof. |

All three round-1 High findings are resolved, and two of them are mutation-proven rather
than asserted. The revision did not weaken any oracle I had credited in v1.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The production entry's call to `launch()` is pinned by no test — the one edge this round's largest change exists to create.** `bin/pdlc.mjs:42` reads `.then((mod) => mod.launch())`. Mutating it to `.then((mod) => mod.main())` leaves the engine suite **fully green** (`# pass 800`, `# fail 0`, identical to baseline), measured. Both entries are exported (`bin/cli.mjs:898` `main`, `:958` `launch`), so the mutant loads and runs; what it silently loses is the entire resolution ladder — under `main()` a pinned repo runs whatever is installed, `launch`'s refusal arm (`bin/cli.mjs:1001-1008`) is unreachable, and AC-5.5 fails open. `launch-wiring.test.js` drives `launch()` directly (`:154`, `:352`) and `cli.test.js:22` spawns the real `bin/pdlc.mjs`, but no leg covers a command where `launch` and `main` differ, so the two suites meet without overlapping on this edge. This is precisely the builder-not-wired shape `launch-wiring.test.js:1-12` was written to close, one level up: the file's own header says its legs "enter through `main()` or `launch()` — the two real entries", but `launch()` is the module function, and the edge from the entry on `PATH` to it is the part still unproven. | AC-5.5, PROP-LAUNCH-*, `bin/pdlc.mjs:42` |
| F-02 | Medium | Local | **`redactSecret` is proven as a function and unproven as a control.** The unit legs (`publish-channel.test.js:781`, `:797`) are good — every occurrence, not just the first; no-op on empty rather than a match on `""`. But removing the call at the production site, `reportFailure` (`publish-preflight.mjs:335`) back to the bare `` `::error::${message}` ``, leaves the suite green (`# pass 800`, `# fail 0`), measured. In production the sentinel *is* the live token (`:500` passes `process.env.NODE_AUTH_TOKEN` as `sentinel`), so the un-covered call site is the one that would print it. Both sites sit in the CLI region F-02(v1) established has no behavioural coverage; the new token set-equality pins the subcommand *names*, not this. A test injecting a fake `NODE_AUTH_TOKEN` and driving `reportFailure` (or `main()`'s failure exit) would close it. | Q-02(v1), AC-3.5, `publish-preflight.mjs:334-337` |
| F-03 | Medium | Local | **PF-4's new oracle derives its expected value from the code under test, so the release gate's member list can shrink silently.** `publish-channel.test.js:696` recovers `expected` by parsing `checkPackedSet`'s own refusal message, and the comment at `:689-691` states this is deliberate in preference to restating TSPEC §5.4. That inverts the anti-echo rule: the expectation now moves with the implementation. Measured — deleting `"scripts/postinstall.mjs"` from `expectedPackedSet` (`publish-preflight.mjs:240`) leaves the suite green, because the test's `expected` loses the member too and the surviving guards (`length > 5`, two `includes`) still hold. The blast radius is bounded, not zero: a real tarball losing that member is still caught by `packaging.test.js:43-66`, which *does* transcribe §5.4 literally — that oracle is why this is Medium and not High. What is lost is PF-4 itself as an independent check. The fix is the one `packaging.test.js` already models: transcribe §5.4's `PK-*` list into the test and assert `checkPackedSet`'s expectation against it, keeping the recovered-from-message trick only for the LICENSE set-difference leg (`:713-721`), where it is sound. | PROP-PACK-1, TSPEC §5.4, PF-4 |
| F-04 | Medium | Local | **The fixture-machine leg is now function-covered under half.** `scripts/fixture-machine.mjs` clears the branch floor at 88.57 %, but function coverage is 40.74 % (line 57.71 %), with `290-304`, `437-512`, `524-631`, `677-818` unexecuted. `d9dd3295` improved the ladder by one leg (39.13 → 40.74). Carried from round 1 unchanged in kind: the residue is reachable only through `.github/workflows/fixture-machine.yml`, which the PR gate structurally cannot run (BR-7.5 freezes `pr-tests.yml` at five jobs), so it is observed as a green workflow after merge rather than as a precondition to it. A decision to record, not a defect to fix in this round. | PROP-GATE-1…5, PROP-INSTALL-3…7 |
| F-05 | Low | Local | **T49's two parsers scan whole-file text, so both sides are wider than the contract.** `implementedSubcommands` (`publish-channel.test.js:290`) matches `^\s*case "…":` anywhere in the module, not within `main()`'s switch, and `workflowSubcommandTokens` (`:281`) matches `publish-preflight.mjs <token>` anywhere in the YAML including comments. Green today and the oracle is genuinely load-bearing (it caught the round-1 rename); the note is that a second switch in the module, or a commented-out `run:` line, would redden it for a reason that is not a contract violation. Scoping the module scan to the `switch` body would make the failure message always mean what it says. | §8.1, §8.4 |
| F-06 | Low | Process | **`PROP-REGR-5`'s "workflows suite green" remains not locally observable.** Unchanged from round 1 and still not this feature's code: `pdlc/workflows` fails one test, `documentOracles.test.js:246`, over the git-ignored `.tokensave/tokensave.db`, because `document-oracles.mjs:77` skips only `.git` and `node_modules`. No file under `pdlc/workflows/lib/` was touched on this branch. Recorded so a DoD reader does not read the red as a feature defect. | PROP-REGR-5 |

## Questions

## Positive Observations

## Recommendation

## Verdict
