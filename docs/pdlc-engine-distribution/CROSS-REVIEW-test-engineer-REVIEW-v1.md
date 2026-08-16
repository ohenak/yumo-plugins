# Cross-Review: test-engineer — Final Codebase Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/` implementation on `feat-pdlc-engine-distribution` (full diff against `main`)
**Date:** 2026-08-16
**Iteration:** 1
**Scope:** Local

## Method

Every claim below is grounded in the tree at `72d48238`, not in the specs. Three
techniques were used, and where a finding rests on one it is named in the row:

1. **Suite execution.** `cd pdlc/engine && npm test` → `1..725`, 725 `ok`, 0 `not ok`,
   exit 0. `cd pdlc/workflows && npm test` → 4515 passed, 1 failed, 70 skipped (see F-05).
2. **Mutation probes.** For load-bearing oracles, the guarded behaviour was reverted in
   the working tree and the suite re-run; a mutation that leaves the suite green means
   the oracle is unfalsifiable. Two probes were run (F-01, F-02). The tree was restored
   and verified clean (`git status --porcelain` on the mutated path is empty) before
   this file was written.
3. **Measurement over assertion.** `PROP-REGR-6`'s coverage floor and `PROP-REGR-1`'s
   five preservation floors were measured with the runner
   (`npm test -- --experimental-test-coverage`, `node --test __tests__/<file>`) rather
   than read off the documents (F-03).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-3.5's sentinel guard has no falsifying test — mutation-proven.** Deleting `pdlc/engine/scripts/publish-preflight.mjs:148-152` (the `Buffer.includes(sentinel)` refusal) leaves the engine suite at 725/725 green, exit 0. Both AT-3.5 assertions are tautologies over literals the test itself authored: `publish-channel.test.js:252-256` asserts that `tarballBytes` — constructed on `:232` as `Buffer.from("built-artifact-bytes, no secrets here")` — does not contain `SENTINEL`, a constant declared on `:86`; that comparison never touches `runPublish` and holds whatever the production code does. `:257-261` asserts `log` is sentinel-free, but `log` receives only lines `runPublish` builds from `name`/`version`/`message` (`publish-preflight.mjs:105-107`, `:136`, `:154`, `:156`), so no code path can write a credential into it — unfalsifiable by construction. **No test anywhere feeds a tarball that *does* contain the sentinel and asserts refusal**, so the mechanism AC-3.5 exists for is unguarded. | PROP-PUB-4, AT-3.5, AC-3.5 |
| F-02 | High | Local | **The publish CLI layer is entirely untested, and `publish.yml`'s subcommand tokens are pinned by nothing — mutation-proven.** `publish.yml` reaches the engine only through five `run:` lines naming five subcommand strings (`:167` `preflight`, `:170` `manifest`, `:196` `write-pairing`, `:209` `verify-packed`, `:215` `publish`). Renaming `case "verify-packed":` (`publish-preflight.mjs:500`) to `case "verify-packed-MUTATED":` leaves the suite 725/725 green — the rename would fail the real publish at tag time with `unknown command`. No test file references `write-pairing`, `verify-packed` or `manifest` at all (`grep` over `pdlc/engine/__tests__/*.js` returns nothing). Coverage confirms the shape: `main()`, the five `run*Command` wrappers and `realPublishChannel()` are uncovered (`publish-preflight.mjs` lines `417-431`, `434-452`, `454-486`, `488-510`, `514-515`). This is the builder-not-wired pattern exactly: `runPublish` is well covered over an injected channel, but nothing proves the production caller — the workflow's `run:` line — reaches it. The gap is invisible because `publish.yml` runs only on tag push, so the PR gate never exercises it. | PROP-PUB-1…5, §8.1, §8.4 |
| F-03 | High | Local | **`PROP-REGR-6`'s per-module ≥85 % branch floor fails for four of the eight named modules.** Measured, not inferred, via `npm test -- --experimental-test-coverage` (branch % is column 2 per the report header at `/tmp/cov.txt:3948`): `scripts/publish-preflight.mjs` **78.95 %** (line 56.01, funcs 32.00), `scripts/fixture-machine.mjs` **83.33 %** (line 57.28, funcs 39.13), `scripts/prepack.mjs` **66.67 %** (funcs 75.00), `bin/cli.mjs` **75.00 %**. Only `lib/store.mjs` (94.44), `lib/resolve-version.mjs` (94.44), `lib/provenance.mjs` (100) and `scripts/postinstall.mjs` (100) clear the floor. PLAN §7 item 4 and PROPERTIES `PROP-REGR-6` both assert specifically that `scripts/fixture-machine.mjs`'s floor "is met by T59's **hermetic** legs alone, so a reading below 85 % locally diagnoses a missing hermetic test" — the reading is below 85 %, and by the property's own words that is a missing-test diagnosis, not a gating artefact. A property this feature ships is red at HEAD. | PROP-REGR-6, PLAN §7 item 4 |
| F-04 | Medium | Local | **The machine-leg apparatus carrying five AT-2 criteria is 39 % function-covered and runs in no gate that blocks the PR.** `scripts/fixture-machine.mjs` reports funcs 39.13 % / line 57.28 %, with lines `350-369`, `380-421`, `437-458`, `466-508`, `511-544`, `547-620` unexecuted. AT-2.1/2.3/2.4/2.5/2.6 rest on `.github/workflows/fixture-machine.yml`, which is a separate workflow from `pr-tests.yml` (whose five job names are BR-7.5's frozen contract). The capability-gate design (opt-out predicate, `SKIP_INVENTORY`, fail-closed comparator) is sound and T59 tests the comparator and the three discriminator arms hermetically — but more than half the module's functions are reached by neither T59 nor any local leg, so the residue is observed only by a workflow whose green is not a precondition of this branch merging. | PROP-GATE-1…5, PROP-INSTALL-3…7 |
| F-05 | Low | Process | **`PROP-REGR-5`'s "workflows suite is green" is not locally observable.** `cd pdlc/workflows && npm test` fails one test: `documentOracles.test.js:246` (`AT-22: coveredViolations(LIVE_ROOT) is empty`), reporting a violation for `.tokensave/tokensave.db`. Root cause is not this feature: `.tokensave/` is git-ignored (`.gitignore:2`) and `document-oracles.mjs:77` skips only `.git` and `node_modules` when walking, so any local tool cache reddens the oracle — the documented false-red in `CLAUDE.md`. No file under `pdlc/workflows/lib/document-oracles.mjs` is touched by this branch. Recorded so a DoD reader does not read the red as a feature defect, and so `PROP-REGR-5` is understood as CI-observable rather than locally observable. | PROP-REGR-5 |
| F-06 | Low | Process | **An uncommitted PLAN edit sits in the working tree.** `git status` shows `M docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md`, the diff being T51's Status cell flipped `⬚ → ✅`. The status ledger the DoD reads is therefore one edit ahead of the branch. Commit it (pathspec-scoped) so the recorded state and the branch agree. | PLAN §2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-02's cheapest closure is a static one: read `.github/workflows/publish.yml`, extract every `publish-preflight.mjs <token>` invocation, and assert set-equality against the `switch` arms in `main()` — no spawn, no network, and it reddens on either a renamed case or a new workflow step naming a token the script does not implement. Is there a reason to prefer driving `main()` over `process.argv` instead, given `isMain` (`:512`) already makes the module importable without dispatching? |
| Q-02 | `runPublishCommand` passes `sentinel: process.env.NODE_AUTH_TOKEN` (`:475`), i.e. in production the sentinel *is* the live credential. That is the right leak check, but `realPublishChannel.publish` throws `` `npm publish failed: ${result.stderr || result.stdout}` `` (`:447`) and that string is printed unscanned. If npm ever echoes the token into stderr, the guard that refuses to publish a token-bearing tarball does not cover the path that prints one. Should the failure path scan-and-redact before `reportFailure`? |
| Q-03 | For F-03, is the intended remedy to raise coverage on the four modules, or to narrow `PROP-REGR-6`'s module list to those the hermetic suite can actually reach? Either is defensible, but the property as written asserts the first and the tree delivers neither, so the choice should be recorded rather than left to whoever next reads the number. |

## Positive Observations

- **The anti-echo discipline is real, not claimed.** `packaging.test.js:43-66` transcribes
  TSPEC §5.4's `PK-*` table as literal arrays (`LIB_MODULES_AT_HEAD`,
  `LIB_MODULES_FROM_THIS_FEATURE`, `WORKFLOW_MEMBERS`) and never lists `lib/`;
  `expectedMemberCount` (`:107-109`) hard-codes `4 + 15 + 3 + 1` rather than reading the
  tarball's length; the conditional `LICENSE` member is read from the **decision record**
  (`licenceRecorded()`, `:114-122`) rather than from the file's presence on disk, so
  deleting `pdlc/engine/LICENSE` reddens the set instead of silently shrinking the
  expectation. `assertPackedSetEquals` (`:194-206`) is set-equality in both directions with
  a message naming TSPEC §5.4 as the expected side's source. This is the strongest oracle in
  the feature.
- **`npm pack` is real and hermetic.** `packRealTarball` (`:142-189`) runs a real
  `npm pack` (never `--dry-run`) against a scratch copy of the package plus a sibling
  `pdlc/workflows/`, precisely so `prepack`'s in-place `vendor/` rewrite cannot race the
  checkout — the wave-12 defect is documented in place at `:129-141`. Good engineering,
  and the comment tells the next reader why the indirection exists.
- **BR-3.9's real-channel publish verified live, not taken on trust.** `npm view
  @kaneho/pdlc-engine@0.1.0 pdlcPairing` returns
  `{engineVersion: '0.1.0', pluginCompat: '^0.23.0', pluginVersionAtTag: '0.23.0',
  tag: 'engine-v0.1.0', commit: '30773d0c…'}`, and `git cat-file -t 30773d0c…` resolves to
  a commit on this branch. `EVIDENCE-BR-3.9.md` is an accurate record of a real event, and
  AC-1.5's published pairing record (PROP-PUB-9) is genuinely observable on the channel.
- **`PROP-REGR-1`'s five preservation floors all hold, measured.** `node --test` per file:
  `engine-config` 16 (floor 9), `run` 22 (floor 21), `skills-composition` 33 (floor 32),
  `ci-arrangement` `1..6` / `# tests 16` (floor 6 executed from 2 sites),
  `seam-contract` 12 (floor 12). The two files a task rewrites in place —
  `ci-arrangement.test.js` and `seam-contract.test.js` — did not silently shed assertions,
  which is exactly the risk the floors were written to catch.
- **Message-catalogue set-equality is enforced in both directions.**
  `_assert-suite-wide.mjs:205` and `:210` push failures for an emitted-but-unregistered id
  *and* a registered-but-never-emitted id, so registration cannot drift from emission.
- **Un-skip discipline held.** No `test.skip(` or `describe.skip(` survives in
  `pdlc/engine/__tests__/` or `pdlc/workflows/__tests__/` outside string literals and
  fixtures under test. The committed-red-then-unskip convention was followed through to the
  end, which is not the norm and is worth saying.

## Recommendation

**Needs revision**

Three High findings. None of them is a design problem — the specs get all three of these
right, and the packaging oracle shows the team knows exactly how to write a falsifiable
test. What is missing is coverage of the *publish* path specifically, which is also the one
path the PR gate structurally cannot exercise, and that combination is why the gap survived
eleven review rounds of documents.

Exactly what would resolve each:

1. **F-01** — add one leg to `publish-channel.test.js`: call `runPublish` with
   `tarballBytes: Buffer.from("...".concat(SENTINEL, "..."))` and assert
   `result.conclusion === "failure"`, `result.published === false`,
   `channel.calls.publish.length === 0`, and `result.message` matching `/sentinel|AC-3.5/i`.
   That is the positive conjunct PROP-PUB-4 already calls for, and it reddens the mutation
   probe in F-01. The two existing tautological assertions at `:252-261` should stay only if
   the poisoned-tarball leg lands alongside them; on their own they are padding.
2. **F-02** — add a static coupling test (see Q-01): parse `.github/workflows/publish.yml`,
   collect the subcommand token from every `publish-preflight.mjs <token>` `run:` line, and
   `deepEqual` the sorted set against the sorted `case` labels in `main()`. Set-equality both
   directions, so a renamed case *and* an unimplemented workflow step each fail. This is
   cheap, hermetic, and it is the only thing standing between a rename and a broken release.
3. **F-03** — either raise the four modules over the floor or narrow `PROP-REGR-6`'s module
   list, and record which (Q-03). Closing F-01 and F-02 moves `publish-preflight.mjs`
   substantially on its own, since the uncovered ranges those findings name are the bulk of
   the module's shortfall.

F-04 is worth a decision but not a blocker; F-05 and F-06 are records, not work.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 1, "low": 2}
