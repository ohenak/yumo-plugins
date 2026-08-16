# Cross-Review: test-engineer — Codebase Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/` and the implementation on `feat-pdlc-engine-distribution` (delta `ef881565..659f8ed2`)
**Date:** 2026-08-16
**Iteration:** 3
**Scope:** Local

## Method

Delta re-review. The scope is the 12 commits in `ef881565..659f8ed2`; nothing already
settled in rounds 1–2 is re-litigated. Every claim below is an observation made at
`659f8ed2`, not a reading of a document.

1. **Suite execution.** `cd pdlc/engine && npm test` → `1..747`, `# pass 806`, `# fail 0`,
   `# skipped 2` (the two `PDLC_LIVE=1`-gated legs, pre-existing). `cd pdlc/workflows &&
   npm test` → 4516 passed, 1 failed, 70 skipped (the same `documentOracles.test.js:246`
   red over untracked local trees, unchanged — F-06 below).
2. **Mutation probes, each run twice and each read by the name of the test that
   caught it.** Five probes for the five fixes this round claims, plus three probes
   against `bin/pdlc.mjs`'s Node-floor guard. Results are tabulated below and in F-02.
   `git status --porcelain` over `pdlc/engine` was clean before and after every probe.
3. **Repeat-run flake experiment.** Five consecutive `npm test` runs on an unmodified
   tree, which is how F-01 was found: run 5 was red with no code change.
4. **Coverage re-measurement.** `npm test -- --experimental-test-coverage`, per-module
   branch column, against `PROP-REGR-6`'s eight-module enumeration
   (`PROPERTIES-pdlc-engine-distribution.md:242`).

## Round-2 findings: disposition

| Round-2 | Severity | Status | Evidence (mutation → the test that caught it) |
|---|---|---|---|
| F-01 the production entry's `launch()` call pinned by nothing | High | **Resolved**, mutation-proven | `bin/pdlc.mjs:42` → `mod.main()` reddens twice out of two: `not ok 150 - AC-5.5: the real bin/pdlc.mjs refuses a pinned-but-uninstalled version — the launcher, not main()` (`cli.test.js:250`). The leg spawns the real binary, and it is hermetic by construction — the pin-missing arm refuses before any `exec`, `PDLC_HOME` is an empty temp store, and `PDLC_RESOLVED_ENGINE: ""` is correctly neutral because `readResolvedMarker` (`bin/cli.mjs:218`) tests `!raw`, not presence |
| F-02 `redactSecret` proven as a function, unproven as a control | Medium | **Resolved**, mutation-proven | Bare `` `::error::${message}` `` at `publish-preflight.mjs:349` reddens twice: `not ok 444 - T58: reportFailure redacts the live token at the PRODUCTION call site`. The injected default is pinned too: `env = process.env` → `env = {}` also reddens, so the seam did not become the thing that is tested |
| F-03 PF-4's oracle derived its expectation from the code under test | Medium | **Resolved**, mutation-proven | Dropping `"scripts/postinstall.mjs"` from `expectedPackedSet` (`publish-preflight.mjs:240`) reddens twice: `not ok 439 - PF-4: checkPackedSet's expectation IS TSPEC §5.4's PK-* set, member for member`. The transcription at `publish-channel.test.js:687-716` matches §5.4's `PK-1…PK-23` rows (TSPEC:347-359) member for member, including PK-3's conditionality and PK-4b |
| F-04 fixture-machine functions half-unreached | Medium | Carried, unchanged | 57.71 % line / 88.57 % branch / **40.74 % funcs** at HEAD — identical to round 2. Still a decision to record, not a defect to fix; see F-05 below and Q-01 |
| F-05 T49's two parsers scanned wider than the contract | Low | **Resolved**, mutation-proven | Both parsers are now region-scoped (`publish-channel.test.js:281-330`), and the discriminating power survived the narrowing: renaming `case "verify-packed":` reddens twice, `not ok 425 - T49: the subcommand tokens publish.yml invokes are set-equal to the cases main() implements` |
| F-06 `pdlc/workflows` not locally green | Low | Carried, unchanged | Same single red, same untracked-tree cause. Not this feature's code |
| PM F-01/F-02 empty-store arm announced as a refusal | (PM) | Resolved, mutation-proven | Reverting the `store.empty-in-place` selection at `bin/cli.mjs:316-325` reddens twice: `not ok 313 - PM F-02: the resolution hop is on the path pdlc dev takes`. The two new legs assert the arm by count (`runMain` 1, `exec` 0), the marker's `mode: "unresolved"`, the announcement's three positives and the refusal wording's absence — a negative correctly paired |

All five findings the round set out to close are closed, and every one of them is closed
by a named oracle that dies when the fix is reverted. That is the strongest disposition
table this feature has produced. The two Highs below were not raised in round 2; both
were found by measurement this round, and one of them is what makes the table above
harder to trust than it should be.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The engine suite is flaky on an unmodified tree: one test file writes build output into the shared engine root while the runner executes files in parallel, and that build output changes which modules a concurrently-running subprocess leg loads.** Measured: five consecutive `npm test` runs at `659f8ed2`, no edit between them, run 5 red — `not ok 315 - PM F-03: AC-5.6 — the ignored env var is announced, positively`, inner leg `launch-wiring.test.js:502`, `ERR_MODULE_NOT_FOUND: Cannot find module pdlc/engine/vendor/workflows/orchestrate-dev.js imported from …/orchestrate-queue.js`. The mechanism is exact and not a mystery: `run.test.js:191-215` runs `scripts/prepack.mjs` **as a process**, which vendors into `ENGINE_ROOT/vendor/workflows` (`prepack.mjs:18`) and then `rmSync`s the tree in its `finally`; `resolveWorkflowRoot` (`lib/run.mjs:88-99`) prefers that vendor root over the checkout root whenever both filenames exist; and `__tests__/_run-suite.mjs:49-53` spawns plain `node --test __tests__/`, which runs files concurrently with no serialisation. Any subprocess leg that resolves workflow modules inside the window is red for a reason that is not a contract violation. This is the suite `pr-tests.yml:109` runs, that `PROP-REGR-5` and DoD item 2 read as "green", and that Phase PUB gates the release on. It also silently corrupts mutation evidence: two of my own probes this round reported a kill that was this flake, and the guard mutation in F-02 looked killed on its first run and survived three re-runs. A gate whose red can mean "nothing", and whose red can be mistaken for "the oracle worked", is not yet a gate. Fix in the test, not the product: point the process-entry prepack leg at a scratch copy of the package — the pattern `packaging.test.js`'s `packRealTarball()` already uses for exactly this reason — or give `node --test` `--test-concurrency=1`, which costs wall time the scratch copy does not. | PROP-REGR-5, DoD item 2, `run.test.js:191-215`, `lib/run.mjs:88-99`, `_run-suite.mjs:49-53` |
| F-02 | High | Local | **AC-2.4's Node floor is carried by `bin/pdlc.mjs:30-34` and pinned by no oracle — both the floor number and the refusal text can drift silently — while a test comment states that it is pinned.** Measured, three clean runs each: `major < 20` → `major < 8` leaves the suite green (`# fail 0`, ×3), and rewriting the literal to `"pdlc needs a newer Node: "` also leaves it green (`# fail 0`, ×3). The floor exists in three places at HEAD — `package.json:6` `"node": ">=20"`, `bin/pdlc.mjs:31` `major < 20`, and `catalogue.mjs`'s `node.below-floor` template — with no co-change oracle over any pair. `PROP-LAUNCH-7`'s carrier (`bin-guard-structure.test.js`) asserts the guard's *structure* (zero static imports, three top-level statements, zero `await`), which is the right property and not this one. The gap is documented as closed where it is open: `provenance-path.test.js:65-79` says of the leg below it that "it renders the catalogue's registered template and asserts it is byte-identical to the guard's own literal (`bin/pdlc.mjs`)", but `:82-83` compares `message(…)` with an inline string and never opens `bin/pdlc.mjs`. A comment claiming an oracle that does not exist is worse than no comment: it is what makes a future reader stop looking. The fix is one leg and no new dependency — read `bin/pdlc.mjs`, extract the numeral and the literal, assert them equal to `package.json`'s `engines.node` floor and to `message("node.below-floor", …)`'s render. That is also the leg that would have caught the mutation. | AC-2.4, PROP-LAUNCH-7, DEC-EDIST-09, `bin/pdlc.mjs:30-34`, `provenance-path.test.js:65-83` |
| F-03 | Medium | Local | **`bin/pdlc.mjs` is production code this feature rewrote and the one module `PROP-REGR-6`'s floor does not cover.** Measured at HEAD: 89.13 % line, **66.67 % branch, 50.00 % funcs**, uncovered `32-34` (the refusal arm, F-02) and `44-45` (the `.catch` printer — the arm that reports a failed `import("./cli.mjs")`, i.e. the one thing a fail-closed entry exists to do loudly). `PROP-REGR-6` (`PROPERTIES:242`) enumerates eight modules and `bin/pdlc.mjs` is not among them, although the guard/body split (PK-4/PK-4b) is this feature's own change to it and its sibling `bin/cli.mjs` **is** enumerated at 87.35 %. The property's own wording — "a new module at 40 % hidden behind a large well-covered package passes an average and fails this property" — describes this module. Either enumerate it and cover the two arms, or record in `PROP-REGR-6` why the entry file is exempt; leaving it unlisted reads as an oversight rather than a decision. | PROP-REGR-6, `PROPERTIES:242`, `bin/pdlc.mjs` |
| F-04 | Medium | Local | **`scripts/fixture-machine.mjs` is unchanged at 40.74 % function coverage**, carried from rounds 1 and 2 (57.71 % line, 88.57 % branch; `290-304`, `437-512`, `524-631`, `677-818` unexecuted). The branch floor is met, so `PROP-REGR-6` is satisfied as written, and the residue is reachable only through `.github/workflows/fixture-machine.yml`, which the PR gate structurally cannot run (BR-7.5 freezes `pr-tests.yml` at five jobs). Unchanged in kind: this is a decision to record before DoD, not a defect this round can fix. See Q-01. | PROP-GATE-1…5, PROP-INSTALL-3…7 |
| F-05 | Low | Local | **TSPEC §5.4's `PK-*` set is now transcribed in two test files with nothing tying the copies together.** `publish-channel.test.js:697-716` and `packaging.test.js:43-66` each restate the same member list from the same spec section. Transcribing from the spec is right (F-03 of round 2 asked for exactly this), but a `PK-` row added or re-classed must now be hand-copied twice, and a run in which only one copy was updated is red in a way that reads as a product defect rather than a missed co-change. One shared module exporting `tspecPackedSet({ licence })`, imported by both, keeps the anti-echo property and removes the second transcription. | TSPEC §5.4, PROP-PACK-1 |
| F-06 | Low | Process | **`PROP-REGR-5`'s "the workflows suite is green" remains not locally observable**, unchanged from rounds 1 and 2: `pdlc/workflows` reports 1 failed / 4516 passed, `documentOracles.test.js:246`, over an untracked local `.tokensave/tokensave.db` that `document-oracles.mjs` walks. Not this feature's code and green in CI, but a DoD reader running the two documented commands still sees a red, and nothing in the feature's own records tells them to expect it. One line in DoD item 2's evidence would close it. | DoD item 2, PROP-REGR-5 |
| F-07 | Low | Local | **PLAN v0.13's reconciliation evidence is stale by three tests against the branch it reconciles.** The changelog row records `pdlc/engine` at "`1..744`, 803 pass / 0 fail / 2 skipped"; HEAD measures `1..747`, 806 pass — the round's own three new legs (`cli.test.js`, `publish-channel.test.js` ×2) landed in the commits immediately before the ledger commit. The 53 flipped rows are not in question; the evidence line is simply a measurement taken one commit too early, and a ledger whose stated numbers do not reproduce invites the next reader to re-verify all of it. | PLAN §changelog v0.13, `PLAN:30` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-04, unchanged from round 2's Q-02 and worth an answer before DoD rather than after: is the intended end state (a) hermetic legs reaching `fixture-machine.mjs`'s remaining functions, or (b) an explicit record that roughly 60 % of the module is verified only by the post-merge workflow? Both are defensible and the branch floor is met either way; what is not defensible is arriving at (b) by default. If (b), does the record belong in `PROP-REGR-6`'s note or in DoD item 14's evidence? |
| Q-02 | On F-01: is there a reason the process-entry prepack leg vendors into `ENGINE_ROOT` rather than into a scratch copy, given that `packaging.test.js` already builds one? If the leg is deliberately testing that `prepack` writes to *its own package root* — a real property — then the scratch copy is the fix (it has a package root of its own); if not, `--test-concurrency=1` is the smaller change. Either way, is any other test writing into the shared engine root, or is `vendor/` the only one? |
| Q-03 | On F-02: was the byte-identity check described in `provenance-path.test.js:65-79` written and later lost in a refactor, or was the comment written ahead of the leg? It matters only for the harvest — if it was lost, the lesson is about oracles disappearing under edits to their neighbours, which is a different lesson from an oracle never landing. |

## Positive Observations

- **Every fix this round arrived with the leg that falsifies it, and each one dies
  under the exact mutation it was written for.** Five reverts, five named reds, each
  reproduced twice. `reportFailure`'s remediation goes further than asked: exporting the
  printer and injecting its env made the production call site reachable *and* left the
  default (`env = process.env`) itself pinned, so the seam did not quietly become the
  thing under test instead of the thing it proves.
- **The F-01 leg picked the one command where the two callees differ observably.**
  `launch()` and `main()` are both exported, so almost any other invocation would pass
  under either — a pinned-but-uninstalled repo is the narrow case where only `launch()`
  can produce the refusal, and the leg asserts the ladder's text, the launcher's own
  fail-closed line, and the absence of the handshake refusal the mutant reaches instead.
  A negative correctly paired with two positives on the same run.
- **PF-4's expectation now moves with the spec and the recovered-from-message trick was
  kept exactly where it is sound.** The absolute membership check reads TSPEC §5.4; the
  set-difference legs still recover both sides from the refusal, which is a relationship
  between two recovered sets rather than an expectation agreeing with itself. The
  distinction is drawn in the comment at `publish-channel.test.js:691-696`, so the next
  reader inherits the reasoning rather than the pattern.
- **The empty-store fix corrected the product, not the test.** Branch 7's proceed arm was
  announcing itself with the refusal's words; the round added a catalogue id for the
  arm that proceeds instead of teaching a test to tolerate the wrong sentence — and then
  covered it by arm count, by marker `mode`, and by the refusal wording's absence.
- **The workflows-side agreement leg is the right shape.** `devModeKinds.test.js:583-620`
  drives two provenance values differing only in resolved mode through the same
  placement and asserts each message carries its own rendering and never the other's,
  after first asserting the two renderings differ. Neither a literal nor a stale carried
  value can satisfy it — presence lifted to agreement, which is what the finding asked.
- **T49's narrowing kept its teeth.** Scoping a parser is usually where an oracle quietly
  stops discriminating; here the round-1 rename still reddens after the scan was bounded
  to `main()`'s switch body and to non-comment YAML.

## Recommendation

**Needs revision**

Two High findings — neither of them a regression, and neither of them about the work
this round did. Every round-2 finding is closed, and closed the expensive way: the fix
and its falsifier landed together, and I could revert each fix and watch a named test
die. On the delta itself I have nothing blocking to say.

What blocks is what the delta made visible. F-01 is the more important of the two, and
it is not really a test-quality finding — it is a finding about whether this suite's
green means anything. A test file vendoring build output into the shared engine root
while `node --test` runs files in parallel makes any concurrent subprocess leg
intermittently red (measured: 1 red in 5 unmodified runs), which is bad on its own;
worse, it makes red ambiguous, and this round's evidence is entirely made of reds. Two
of my own probes reported kills that were this flake. Whatever else ships, the gate
that Phase PUB will read has to be one whose colour is a fact.

F-02 is smaller and cheaper: AC-2.4's floor is a number and a sentence in
`bin/pdlc.mjs`, both currently free to drift, in a file whose neighbouring comment says
they are held in sync. It is High because the criterion has no other carrier, not
because the fix is hard — one leg reading three sources and asserting them equal.

To resolve, exactly two changes:

- **F-01** — give the process-entry prepack leg a scratch package root (as
  `packRealTarball()` already does) so no test mutates `pdlc/engine/vendor/`, or serialise
  the run with `--test-concurrency=1`. Then re-run the five-clean-runs experiment and
  record the result; the fix is only proven by repetition.
- **F-02** — one leg over `bin/pdlc.mjs`'s source pinning the floor numeral to
  `package.json`'s `engines.node` and the refusal literal to `message("node.below-floor", …)`,
  and correct `provenance-path.test.js:65-79`'s comment to describe what its leg
  actually asserts.

F-03 through F-07 do not block. F-03 and F-04 are the same decision seen from two ends —
which modules the coverage floor is for — and both want a recorded answer before DoD
rather than a scramble during it. F-05 is a co-change hazard worth closing while both
transcriptions are fresh, F-06 is a line of evidence for the DoD reader, F-07 is a
number in a changelog. All five are cheap enough to fold into the same revision as the
two Highs, and none of them should delay it.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 3}
