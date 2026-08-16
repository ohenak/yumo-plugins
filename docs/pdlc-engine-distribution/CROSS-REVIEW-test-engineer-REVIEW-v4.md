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

No High findings. Nothing in this delta broke anything that was approved, and
the two blocking findings from round 3 are closed on evidence I reproduced
myself.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **`PROP-REGR-6`'s module enumeration still omits `bin/pdlc.mjs`, which sits at 66.67 % branch coverage — carried from round 3, correctly routed as an erratum but not yet landed.** Re-measured at HEAD: `bin/pdlc.mjs` 89.13 % line / **66.67 % branch** / 50.00 % funcs, uncovered `32-34` (the floor refusal) and `44-45` (the `import()` rejection path). `PROPERTIES:242` enumerates eight modules and this is not one of them, while its sibling `bin/cli.mjs` **is** (87.35 % branch). The property's own wording — "a new module at 40 % hidden behind a large well-covered package passes an average and fails this property" — describes this module. Note that F-02's new carrier does not and should not move this number: it reads `bin/pdlc.mjs` as *source text* rather than executing it (deliberately, since executing the guard would take it against a runtime above the floor by construction), so AC-2.4 is now pinned while the two arms stay uncovered. That is the right test design and it makes the enumeration question sharper, not softer: either enumerate the file and cover the two arms, or record in `PROP-REGR-6` that it is exempt because its arms are structurally unreachable in-process. Leaving it unlisted reads as an oversight rather than as a decision. | PROP-REGR-6, `PROPERTIES:242`, `bin/pdlc.mjs:30-45` |
| F-02 | Low | Local | **The new proceed-arm set-equality is one-directional: an id in `REFUSING_REFUSAL_IDS` that the resolver no longer declares is dead config no oracle reddens on.** `launch-wiring.test.js:363-381` asserts `declared \ REFUSING === ["store.empty"]`. Three of the four mutations I can imagine do redden — a rename, an added id, and a *removed* id (caught incidentally by the `declared.length >= 5` fail-closed guard). The uncovered case is a member added to `REFUSING_REFUSAL_IDS` (`bin/cli.mjs:303-308`) that no `refuse(…)` call site ever produces: the subtraction is unchanged, the count guard is unchanged, green. The operator-facing risk is low — a stale refusing id is inert rather than wrong — but it is dead config in a four-member closed set whose whole purpose is to partition an enumeration, and the fix is one line next to the existing assertion (`assert.deepEqual([...REFUSING].sort(), declared.filter(…).sort())`, or simply assert `REFUSING` is a subset of `declared`). Set-equality over the full enumeration, in both directions, is the standard the rest of this suite already holds itself to — `packaging.test.js`'s T49 checks both directions of the packed set, and `provenance-path.test.js`'s §7.4 step checks the reverse direction of the catalogue. | `launch-wiring.test.js:363-381`, `bin/cli.mjs:303-308`, PM CR v2 F-02 |
| F-03 | Low | Process | **`__tests__/_tspec-packed-set.mjs` is a new shared prerequisite module that no ownership record names.** PLAN §4 rule 4 is explicit that shared engine-side helper modules have exactly one author (`_doubles.mjs` → T03) and that later tasks add doubles inside their own test files rather than re-opening the shared module (`PLAN:470`); §4's collection note lists the leading-underscore helpers by name (`PLAN:440`). v0.14 states §3's ownership manifest is byte-unchanged — correctly, since this file arrived as a CR remediation rather than as a wave task, so there was no batch to collide in. The residue is a co-change hazard rather than a parallelism one: the next reader looking for who owns this transcription finds it in neither §3 nor §4's helper list, and the co-change obligation lives only in the file's own header comment. One sentence in §4 naming it alongside `_doubles.mjs` would close it. The header comment itself is exemplary — it states the obligation ("TSPEC §5.4 and FSPEC §5.2 move first; never this file alone") in the place an editor will actually be standing. | `PLAN:440`, `PLAN:470`, `__tests__/_tspec-packed-set.mjs:1-26` |
| F-04 | Low | Local | **`scripts/fixture-machine.mjs` function coverage is unchanged at 40.74 %**, now a recorded decision rather than an open question (PLAN DoD item 4). Carried here only so the number appears in this round's measurements alongside the decision that accepts it; no action requested. | PLAN DoD item 4, PROP-REGR-6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: since the erratum against PROPERTIES is already routed, the only open question is which answer it should carry. Is `bin/pdlc.mjs` exempt from `PROP-REGR-6` *because* its two uncovered arms (the floor refusal and the `import()` rejection) are unreachable in-process — the guard cannot fire on a runtime above the floor, and the rejection path needs a broken `cli.mjs` — with AC-2.4 pinned instead by F-02's new source-text carrier and AC-5.5's subprocess leg? If so, that is a stronger record than an enumeration entry would be, and it belongs in `PROP-REGR-6`'s own note rather than in a review file. |
| Q-02 | On F-01, the alternative: the subprocess machinery to cover both arms already exists in this suite (`cli.test.js:250` runs the real `bin/pdlc.mjs`). A leg spawning it under a doctored `process.versions.node` is not obviously cheap, but it is not obviously expensive either. Was it considered and rejected on cost, or not considered? Either answer is fine; only the first is a decision. |

## Positive Observations

- **Both High fixes were built so that the failure they prevent reddens where a
  reader will look for it.** F-01's could have been closed with
  `--test-concurrency=1` — a smaller diff that would have hidden the hazard
  rather than removed it, and slowed the suite for everyone. Instead the leg
  moved to a scratch package root and then *asserted the invariant it now
  relies on*: `existsSync(engineRoot/vendor)` equals its pre-run value. That
  turns a class of intermittent, diff-unexplainable reds in other files into
  one deterministic red in this one. The `realpathSync` note earns its place
  too — it names a failure mode (`isMainEntry` comparing two spellings of the
  same path, leg exits 0 asserting nothing) that would have been invisible.
- **F-02's carrier has three conjuncts and needs all three.** Two extractions
  agreeing with each other is exactly the self-agreeing expectation this
  review has been pushing back on for three rounds; the third conjunct
  (`guardFloor === "20"`, and the prefix names the floor) is what grounds the
  pair in the spec instead of in itself. Both extractions fail closed with
  named messages, which is why probe (d) — deleting the guard entirely —
  reddens on an `assert.ok` rather than quietly matching nothing.
- **The stale comment was treated as the finding it was.** Round 3's F-02 was
  half about a missing oracle and half about a comment that told the next
  reader to stop looking. The revision fixes both, and the replacement comment
  states the old claim and why it was false — so the next reader inherits the
  lesson rather than just the corrected text.
- **F-05's fix moved the transcription without weakening it.** The obvious way
  to de-duplicate a spec table in tests is to derive it from the code; this
  one kept the spec as the source, kept `tspecPackedCount` derived from class
  sizes rather than from the list it checks, and put the co-change obligation
  in the shared file's header. One edit to that module now reddens both
  suites — verified, not assumed.
- **PM F-02's fix pinned a partition, not a branch.** The `: decision.announcement`
  fallback has no reachable input today, so it cannot be covered directly; the
  leg says so and asserts the reason instead, reading the resolver's own
  enumeration from source rather than from a list maintained beside it. The
  failure message tells the future author what to do ("Choose wording, then add
  it here") rather than just reporting inequality.

## Recommendation

**Approved with minor changes**

Both round-3 Highs are closed, and I did not take either on the document's word.
F-01's flake is gone by the same measurement that found it — five clean runs,
five greens, where round 3 measured one red in five — and the fix carries its
own invariant assertion, so the hazard reddens deterministically in the file
that owns it rather than intermittently in somebody else's. F-02's floor now has
a real carrier: four mutations, four named reds, including the fail-closed case
where the guard is deleted outright. The suite's green means something again,
which matters beyond this feature, because Phase PUB reads that colour.

Nothing in the delta broke anything approved. The three code changes are
additive test legs plus one production export widened for pinning
(`REFUSING_REFUSAL_IDS`), and the two PLAN edits touch only changelog and DoD
prose — no row added, removed, re-batched or re-scoped, which I checked rather
than took from the changelog's claim.

Four findings, none blocking. F-01 (Medium) is round 3's F-03 carried unchanged:
correctly routed as an erratum against PROPERTIES, simply not landed yet, and
it is a record question rather than a coverage question — F-02's new carrier
pins AC-2.4 without executing the guard, so the honest answer may well be
"exempt, and here is why". Q-01 and Q-02 offer both shapes of that answer. F-02
(Low) is one line: the proceed-arm partition checks one direction of a
set-equality this suite normally checks in both. F-03 (Low/Process) asks for a
sentence naming the new shared transcription module in PLAN §4 alongside
`_doubles.mjs`, so its owner is recorded somewhere other than its own header.
F-04 (Low) is a measurement carried for the record, with no action requested.

All four are cheap enough to fold into whatever pass addresses the PROPERTIES
erratum, and none of them should delay it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}
