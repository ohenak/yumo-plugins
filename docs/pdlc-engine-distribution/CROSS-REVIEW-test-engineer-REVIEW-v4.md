# Cross-Review: test-engineer — Codebase Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/` and the implementation on `feat-pdlc-engine-distribution` (delta `659f8ed2..077cc9a2`)
**Date:** 2026-08-16
**Iteration:** 4
**Scope:** Local

## Method

Delta re-review. The scope is the 13 commits in `659f8ed2..077cc9a2` — five docs
commits carrying round 3's own two cross-reviews, one code commit (`e310ff3b`)
closing this round's findings, and two PLAN edits (`01c2f3e8`, `077cc9a2`).
Nothing settled in rounds 1–3 is re-litigated. Every claim below is an
observation made at `077cc9a2`, not a reading of a document.

1. **Flake experiment, repeated verbatim from round 3.** Five consecutive
   `cd pdlc/engine && npm test` runs on an unmodified tree: `# pass 808`,
   `# fail 0`, `# skipped 2` (the two documented `PDLC_LIVE=1` legs), **five
   times out of five**. Round 3 measured 1 red in 5 on the same experiment.
   `git status --porcelain pdlc/engine` clean afterwards.
2. **Mutation probes, seven of them, each reverted and the tree re-checked
   clean.** Four against F-02's new carrier, one against F-05's shared
   transcription (run against *both* importing suites), one against PM F-02's
   set-equality leg, one against F-01's vendor-root invariant. Results in the
   disposition table.
3. **Coverage re-measurement.** `npm test -- --experimental-test-coverage`,
   per-module column, read against `PROP-REGR-6`'s eight-module enumeration
   (`PROPERTIES:242`): `bin/pdlc.mjs` 89.13 % line / **66.67 % branch** /
   50.00 % funcs; `scripts/fixture-machine.mjs` 57.71 / 88.57 / **40.74**,
   both identical to round 3.

## Round-3 findings: disposition

Both Highs are closed, and closed the expensive way — the fix and its falsifier
landed together, so I could revert each fix and watch a named test die.

| Round-3 finding | Severity then | Disposition now | Evidence |
|---|---|---|---|
| F-01 — suite flaky: process-entry prepack leg vendored into the shared `pdlc/engine/vendor/` while `node --test` ran files in parallel | High | **Resolved**, measured and mutation-proven | The leg now spawns `prepack.mjs` against a scratch package root with the same `pdlc/engine` + `pdlc/workflows` shape (`run.test.js:222-262`), exactly as `packRealTarball()` already did, and pins the invariant rather than assuming it: `existsSync(engineRoot/vendor)` must equal its pre-run value (`run.test.js:267-277`). Re-introducing an in-place write reddens deterministically **in this file**: adding one `mkdirSync(engineRoot/vendor)` inside the leg gives `not ok 5 — prepack run as a process … (AF-2)`. Five clean runs, five greens (round 3: 1 red in 5). The `realpathSync` on the scratch root is the right call and the comment says why — an un-realpath'd `argv[1]` would make `isMainEntry` decline to fire and leave the leg asserting nothing while exiting 0 |
| F-02 — AC-2.4's Node floor carried by `bin/pdlc.mjs` and pinned by no oracle, behind a comment claiming it was pinned | High | **Resolved**, mutation-proven ×4 | New leg `provenance-path.test.js:96-164` reads all three carriers from their own files and asserts they agree. Four probes, four reds, each by name (`not ok 4 — AC-2.4: the Node floor and its refusal text agree …`): (a) `major < 20` → `major < 8`; (b) refusal prefix rewritten; (c) `package.json` `engines.node` `>=20` → `>=22`; (d) guard deleted outright — the last one is the fail-closed case, and it fails on the named `assert.ok` rather than matching nothing. Conjunct 3 (`guardFloor === "20"` plus "the prefix names the floor") is what stops the two extractions agreeing with each other about the wrong number. The stale comment is gone and the replacement describes only what is asserted |
| F-03 — `PROP-REGR-6` omits `bin/pdlc.mjs` (66.67 % branch) from its enumeration | Medium | **Carried, unchanged** — routed, not landed | `PROPERTIES:242` is byte-unchanged; PLAN v0.14 states the item is "raised as an erratum against PROPERTIES rather than decided here". Correct routing, so this is not a defect in the round's work; it is simply still open. Re-emitted as an erratum below. Re-measured at HEAD: 89.13 / **66.67** / 50.00 |
| F-04 — `scripts/fixture-machine.mjs` 40.74 % function coverage, undecided | Medium | **Resolved as a record** (Q-01 answered) | PLAN DoD item 4 now states option (b) explicitly, names the residue (`290-304`, `437-512`, `524-631`, `677-818`) as the container/`npm pack`/real-spawn drivers, states the cost in plain words ("roughly 60 % of this module's functions are first exercised on `main`"), scopes it to this module and declares it not a precedent for the other seven (`PLAN:487`). That is the shape a decision record should have: not "it's fine", but "here is what it costs and where the loss surfaces". Numbers unchanged, as expected — the finding was never that the number should move |
| F-05 — TSPEC §5.4's `PK-*` set transcribed twice with nothing tying the copies | Low | **Resolved**, mutation-proven in both directions | One transcription in `__tests__/_tspec-packed-set.mjs`, imported by `packaging.test.js:26-31` and `publish-channel.test.js:80`. Dropping PK-23 from the single module reddens **both** suites in one edit: `not ok 3 — T49: packed tarball equals TSPEC §5.4's expected set member-for-member` and `not ok 20 — PF-4: checkPackedSet's expectation IS TSPEC §5.4's PK-* set`. The anti-echo property survives the move (the set still comes from the spec, never from a listing or from `checkPackedSet`'s refusal), and `tspecPackedCount` is still derived from class sizes rather than from `tspecPackedSet().length` |
| F-06 — `pdlc/workflows` not locally green (untracked-tree false red) | Low | **Resolved as a record** | DoD item 2 now names the false red, states it is not evidence against the item, forbids closing it by widening the oracle, and gives the reader a three-step confirmation (`PLAN:485`). The durable fix is correctly scoped out of this feature |
| F-07 — PLAN v0.13's reconciliation evidence quoted counts HEAD does not reproduce | Low | **Resolved** | v0.13's row now states `0 fail / 2 skipped` and no absolute total (`PLAN:29`) — the form that stays true as legs are added — and v0.14 records why the numbers moved |
| PM F-02 — proceed-arm id partition unpinned | (PM) | **Resolved**, mutation-proven | `launch-wiring.test.js:340-381`: the resolver's own `refuse("id"` enumeration, read from its source, minus `REFUSING_REFUSAL_IDS`, must equal `{store.empty}`. Renaming `store.empty` in the resolver reddens the suite by name. The `declared.length >= 5` guard makes the subtraction non-vacuous |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
