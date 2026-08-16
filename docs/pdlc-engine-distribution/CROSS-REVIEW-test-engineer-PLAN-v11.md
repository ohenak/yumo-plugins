# Cross-Review: test-engineer — PLAN (delta re-review, round 11)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.15)
**Date:** 2026-08-16
**Iteration:** 11
**Scope:** Delta re-review, v0.12 → v0.15. Decision freeze: only a defect the delta introduced, or a load-bearing claim false at HEAD, blocks. Not a whole-document re-review.

## 1. What changed

The branch was rebased since round 10, so the reviewed commit `7bce054e` is no longer an
ancestor of HEAD. Its rebased twin is `437b34ad` (identical subject and PLAN bytes), and the
delta below is `git diff 437b34ad..HEAD -- {plan}`: **83 insertions, 67 deletions**, thirteen
hunks, eight commits.

| Hunk | Change | Class |
|---|---|---|
| `:12` | version cell 0.12 → 0.15, date 2026-08-16 | header |
| `:27` | v0.10 row's carve-out anchor corrected in place (`resolve-version.test.js:397` → test name) | changelog |
| `:30–32` | new v0.13, v0.14, v0.15 rows | changelog |
| `:134–140` (§2) | "unconditionally" retired; `scriptGate`'s two halves named; un-skip guard stated as outside the branch | prose |
| `:149–155` (§2) | carve-out exemplars cited by test name per `DEC-DOC-01`, with the old anchor's defect explained | prose |
| `:182–231` (§2 task table) | **56 `Status` cells ⬚ → ✅**; no other cell in any row edited | task-table |
| `:452` (§5 point 1) | floors restated over `# pass`, with this round's re-measurement | §5 |
| `:497` (DoD item 2) | floors restated over `# pass`; "what green means for `pdlc/workflows`" paragraph added | DoD |
| `:501–502` (DoD item 4) | `fixture-machine.mjs` function-coverage decision recorded (option (b)) | DoD |
| `:510` (DoD item 10) | "modules" → "members" class sweep | DoD |
| `:523–525` (DoD item 17) | "§5.1" → "§5's point 1"; reading-obligation holder named | DoD |

Mechanically checked, since the ledger flip is the largest edit in the feature's history: parsing
both revisions' task tables row-by-row gives 59 rows in each, no row added or removed, **56 rows
differing in the `Status` cell alone and zero rows differing in any other cell** — `Batch`, `Deps`,
`Test File`, `Source File` and Description are byte-identical throughout. §3's ownership manifest
is byte-unchanged. §2.1 is outside the diff. So v0.13's and v0.15's "no row re-batched or
re-scoped" claims are true by construction, not by assertion, and round 6's set-equality and batch
arithmetic need no re-derivation.

## 2. Status of my round-10 findings

| v10 finding | Severity | State at HEAD | Evidence |
|---|---|---|---|
| Carried F-01 (v9): floors stated over `# tests`, which the skipped-block convention inflates | Medium | **Closed** | `:452` and `:497` now read `# pass`, in both carriers, with the substitution named and the measurement that motivated it (`engine-config` 16/9/7 at the time) |
| Carried F-02 (v9): `resolve-version.test.js:397` anchored a line inside the skipped `T37:` block | Medium | **Closed** | `:149–155` cites `"PROP-VER-16 is reproducible: …"` by name; the v0.10 row's copy corrected in place. Verified at HEAD: `provenance.test.js:124` and `resolve-version.test.js:400` carry exactly those titles |
| Carried F-03 (v9): "unconditionally" overstated the wave gate | Low | **Closed** | `:134–140`; verified in code below |
| Carried F-04 (v9): DoD item 17's "§5.1" was ambiguous with FSPEC §5.1 | Low | **Closed** | `:523` reads "§5's point 1" and says why |
| F-01 (v10): T50 states two discriminator arms, T59 pins three | Low | Open, deferred | `:216` unchanged; carried below |
| F-02 (v10): T09's ignore-direction block derives expected notice text | Medium | Open, deferred | code-side, unchanged; carried below |
| F-03 (v10): v0.12's "three one-passage edits" undercounts | Low | Open, deferred | `:29` unchanged; carried below |

All four carried v9 items closed this round, each with the defect explained rather than merely
overwritten. The three v10 items were filed under the same freeze and stay deferred.

## 3. Load-bearing claims re-derived at HEAD

Every quantitative claim the delta makes was re-run, not read.

**(a) The 53-row ledger flip is supported.** All 61 distinct paths in §3's manifest (59 task rows)
exist at HEAD — none missing. `cd pdlc/engine && npm test` → **0 fail, 2 skipped**, and the two
skips are exactly the documented `PDLC_LIVE=1` opt-ins (the O-2 guard measurement and the AC-6.2
live smoke), each printing its opt-in command. `cd pdlc/workflows && npm test` → 118 suites pass,
**1 fail**, and the failure is `documentOracles.test.js:246`'s `coveredViolations(LIVE_ROOT)`
naming this checkout's untracked `.tokensave/tokensave.db` — the false red DoD item 2 now
documents, reproduced verbatim including the line number. `git status` confirms the strays
(`.claude/pdlc-wave-state.json`, `.claude/settings.json`, `.serena/`). The `[gate]` rows' evidence
holds too: `DEC-DIST-06` is at `docs/_decisions/DECISIONS-plugin-distribution.md:143`, and T05's
discharge is `pdlc/engine/LICENSE` plus `package.json:19`'s `"license": "MIT"`.

**(b) §5's five per-file floors reproduce exactly.** `node --test __tests__/<file>` at HEAD:
`engine-config` 16/16, `run` 25/25, `ci-arrangement` 28/28, `seam-contract` 12/12,
`skills-composition` 33/33, every one `# skipped 0` — character-for-character what `:452` states.
Each is at or above its floor (≥9, ≥21, ≥6, ≥12, ≥32), and `skills-composition` has 15 `test(`
call sites against the ≥14 floor, with the two `DISPATCHABLE_SET` sweeps present at `:82` and
`:166` as the floor's clause requires. This is the strongest form of the finding I filed in v9:
the document now states the reading that survives the deletion it guards *and* proves the two
readings currently coincide.

**(c) The `scriptGate` correction is accurate in both halves.** `orchestrate-dev.js:14142-14143`
computes `scriptGate = Boolean(implConfig.testCommand) && typeof runCommandFn === "function"`, so
"conditional on the configuration and the transport" is exact. The `checkWaveUnskips` call is at
`:14376`, at the same indentation level as the `if (scriptGate) { … } else { … }` block that ends
at `:14370` — **outside** it, exactly as `:139` claims. The safety argument the passage makes is
therefore load-bearing and true, not a softening of the retracted overstatement.

**(d) DoD item 4's coverage triple reproduces.** `npm test -- --experimental-test-coverage`
reports `scripts/fixture-machine.mjs` at **57.71% line / 88.57% branch / 40.74% functions** —
the document's three numbers to the digit — with uncovered ranges matching the cited residue. The
other seven enumerated modules all clear the branch floor on hermetic legs: `provenance` 100.00,
`resolve-version` 97.14, `store` 94.44, `postinstall` 100.00, `prepack` 91.67,
`publish-preflight` 88.61, `cli.mjs` 85.98. The item's "not a precedent for the seven others"
sentence is true of the tree, not just of the intent.

**(e) v0.15's "no `Status` cell is edited" is true of its own commit.** `1eea225f` touches zero
task rows; the 53 flips are `efbf3101`'s, which touches exactly 53. Both self-descriptions hold.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The `pdlc/workflows` absolute count survived the sweep that removed the engine's, and has already drifted.** v0.14(a) removed v0.13's `1..744` / `803 pass` precisely because a completion record whose numbers a re-runner cannot reproduce invites the re-verification it exists to save — but the same row's `pdlc/workflows` half still reads `4 516 pass`, and DoD item 2's new confirmation instruction repeats it as the number a reader should "confirm the count is otherwise". HEAD measures **4 524 pass / 1 fail** (the same documented false red). A DoD reader following the instruction literally meets a mismatch on the first line of the check that exists to stop them from doubting the red. The item's substantive criterion — green in CI, locally green modulo untracked strays, failing path names the stray — is unaffected and reproduces, so this is precision, not a false gate. *Fix, the form v0.14 already chose for the engine half:* state `1 fail, and that fail is `documentOracles.test.js:246` naming an untracked path`, with no absolute total. | `PLAN:30` (v0.13 row), `PLAN:497` (DoD item 2) |
| F-02 | Low | Local | **v0.13's "59 rows, all 59 present" conflates the manifest's row count with its path count.** §3 has 59 task rows, but the union of their `Test File` and `Source File` cells is **61** distinct paths — the row count and the checked-artefact count are not the same number, and two paths would be silently outside a check stated as "all 59". I re-derived it: all 61 exist at HEAD, so the reconciliation is *stronger* than the sentence claims, which is the harmless direction. *Fix:* "59 rows, whose cells name 61 distinct paths — all 61 present". | `PLAN:30` (v0.13 row) |
| F-03 | Low | Local | **v0.14's explanation quotes engine absolutes while retiring engine absolutes.** The passage justifies dropping `1..744` / `803 pass` by naming what HEAD measured instead — `1..747` / `806 pass` — and that replacement has itself gone stale: HEAD now reports `1..755`, 825 tests / **823 pass** / 2 skipped. The conclusion the row rests on (0 fail, 2 documented `PDLC_LIVE=1` skips) reproduces exactly, so nothing depends on the stale pair; but a sentence whose argument is "absolutes drift" is the worst place to leave one. *Fix:* keep the diagnosis, drop the second pair of numbers or mark it "measured at `e310ff3b`". | `PLAN:31` (v0.14 row, item (a)) |

No High findings. Nothing in the delta broke a claim that held at `437b34ad`; every quantitative
claim the delta makes about the tree reproduces at HEAD (§3), including the two — the five per-file
counts and the coverage triple — that a reviewer would most expect to have drifted. The three
findings are all of one class (absolute counts stated where floors or conclusions were meant), all
in changelog and confirmation prose, none in a task row, none affecting a gate.

## 5. Questions

None. Nothing in the delta needs clarification before Phase P resumes.

## 6. Positive Observations

- **The floor correction was applied in both carriers and then measured, not just restated.** The
  v9 finding asked for `# pass` over `# tests`; the revision states it in §5's point 1 *and* DoD
  item 2, names the substitution it prevents, quotes the measurement that made it concrete
  (`engine-config` at 16/9/7 against a floor of 9), and then re-runs all five files to show the two
  readings now coincide at `# skipped 0`. That last step is what turns a wording fix into evidence:
  the floors did not move, and the document proves it rather than asserting it.
- **The carve-out anchor was corrected by explaining the defect, not by overwriting it.** `:149`
  now cites both exemplars by test name, and says the old anchor pointed *inside* the skipped
  `T37:` block — so a carve-out whose whole claim was "left running" cited a skipped line. Naming
  that self-contradiction is worth more than the fix, because it generalises: line anchors are
  unstable across exactly the un-skipping this convention schedules, which is why `DEC-DOC-01`
  prefers names. The v0.10 row's copy was corrected in place rather than left to be re-found.
- **The `scriptGate` retraction strengthened the claim it corrected.** Retiring "unconditionally"
  could have left the convention looking less safe. Instead the passage names the configuration it
  presumes *and* the structural fact that makes the overstatement harmless — the un-skip guard is
  called outside the gate's branch, so it fires even where the test gate has degraded. I verified
  the nesting at `orchestrate-dev.js:14359-14376`; the safety argument is real.
- **DoD item 4 states the cost of its own decision in the units that will be paid.** "Roughly 60%
  of this module's functions are first exercised on `main`, so a defect there surfaces at item 14
  rather than pre-merge" is the sentence a reader needs to disagree with the decision, and it is
  supplied by the party who made it. Option (b) is chosen explicitly, scoped to one module, and
  declared not a precedent — with the other seven modules' floors holding at HEAD, as measured.
- **DoD item 17 now names a holder and a durable instrument for the gap it admits.** The item has
  said since v0.10 that `checkWaveUnskips` is necessary but not sufficient; it now says who reads
  the diff (the `[green]` implementer first, Phase DOD as backstop), why the gate's reviewer is
  explicitly *not* the holder, and what would convert the reading obligation into a red — a
  per-file `# pass` floor recorded at each `[red]` commit. Recording the instrument as follow-on
  rather than scheduling it inside a frozen round is the right call and is stated as such.
- **The ledger flip is auditable in the way it claims to be.** Row-by-row parsing of both
  revisions shows 56 status-only edits and zero edits to any other cell, and every path in the
  manifest exists at HEAD with both suites in the state the row describes. The one recorded
  failure is the documented false red, reproduced down to `documentOracles.test.js:246`.

## 7. Deferred observations (recorded, not blocking)

DEFERRED: State T50's present arm explicitly in item (i), so the cell the implementer transcribes carries all three outcomes rather than two plus an inference (v10 F-01).
DEFERRED: Assert T09's ignore-direction notice text against a transcribed literal rather than a re-derived `message(id, params)` call (v10 F-02).
DEFERRED: Reconcile v0.12's "three one-passage edits" count with its own enumeration of four edited cells plus DoD item 14 (v10 F-03).
DEFERRED: Drop or re-anchor the `4 516 pass` absolute in v0.13's row and DoD item 2, per v0.14's own precedent for the engine half (F-01).
DEFERRED: State v0.13's manifest check as 59 rows / 61 distinct paths (F-02).
DEFERRED: Drop or date-stamp v0.14's replacement `1..747` / `806 pass` pair (F-03).
DEFERRED: No counter covers the blocks the convention adds to the eighteen new files; item 17's per-file `# pass` floor is the named instrument if the convention outlives Phase I (carried from v9/v10).
DEFERRED: The guard's `ownersByFile` fallback still means an untitled skipped block in a completed task's file whose owner is nobody is silently ignored — one sentence in §2 (carried from v9/v10).

## 8. Recommendation

**Approved with minor changes.**

All four findings I carried into this round are closed, and closed at the level of the defect
rather than the wording: the floors now read `# pass` and are re-measured, the carve-out cites
names with the old anchor's contradiction explained, the wave-gate account is conditional and
proves the un-skip guard survives degradation, and item 17's section reference is disambiguated
with a holder named for its reading obligation.

The delta's largest edit — 56 rows flipping to ✅ — is the one I checked hardest, and it holds:
59 rows in and 59 out, status cells the only difference anywhere in the table, all 61 manifest
paths present, engine suite 0 fail / 2 documented skips, workflows suite 1 fail that is the
documented untracked-stray false red at the exact line the document cites. The five per-file
counts and the three coverage figures reproduce to the digit.

Three findings, none High, none a defect the delta introduced. All three are the same class —
an absolute count left where a floor or a conclusion belongs — and F-01 is only notable because
this round's own v0.14 row establishes the correct treatment and applies it to one suite of two.
None gates Phase P.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:899a9ed60229d9e79468b2e617b2505932730e850ac39a8655c5962903ae43f6
APPROVAL-HASH-NORMALIZED: sha256:904f119ba9e606ad52ca162aa71a21e08ebb478c4bc54198a153b50bb6d3cad8
REVIEWED-COMMIT: 1eea225fc45f80a94f492799293034f6d969b6af
UPSTREAM-STATE: REQ sha256:04d2c39df40e7ef7092fb4081ac4bcf29df47ea23305ba88d2c4da567666157f
UPSTREAM-STATE: FSPEC sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4
UPSTREAM-STATE: TSPEC sha256:5bef8afa3b9d6af5a72d58dfbc41b028a65e72c4c6ffb5972288690d111e75ad
UPSTREAM-STATE: DECISIONS sha256:05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66
