# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-12
**Iteration:** 4
**Scope:** Delta re-review. Round 3 left no High findings; this round checks only what
v1.3 changed (§0 change note, §3's T00 status cell, §4's manifest re-format) plus whether
the re-format broke anything the earlier rounds had approved. Sections untouched since
`06f5702a` are not re-reviewed. Testing lens only.

## Delta

`git diff 06f5702a..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`:
161 lines changed, in exactly three places, one commit (`06ce3342`).

1. **§0** — version row `1.2 → 1.3`, and a new change note recording why: Phase I's
   wave mode degraded, because v1.2's manifest headers (`Path` / `Owner(s), by batch`)
   are not members of `PLAN_FILES_HEADER_CELLS` / `PLAN_OWNER_HEADER_CELLS`
   (`orchestrate-dev.js:3871-3886`), so `parsePlanOwnership` returned `null`, the run
   fell back to the legacy worktree path, and T00 halted on merge-back.
2. **§4** — the manifest re-formatted to the parser's grammar: headers `Files` / `Task` /
   `Batch`, bare task ids, **one row per owning task** (v1.2 packed multi-owner cells like
   `T10 (b2), T39 (b5), T47 (b7)` into one row; those are now three rows). The T16 dist
   cell narrowed from ``` `pdlc/workflows/dist/` (both bundles + `distribution-manifest.json`) ```
   to ``` `pdlc/workflows/dist/` ```.
3. **§3** — T00's `Status` cell `⬚ → ✅`, matching `758d36c0`
   (`pdlc/engine/__tests__/preflight.test.js`, now tracked at HEAD).

No task row, dependency edge, batch label, test-file name, oracle, gate, or DoD item was
touched. This is a serialisation change to one table plus one status cell.

## Round-3 carry-forward

Round 3 recorded no High findings, so nothing was blocking. Two non-gating items were
left with the author and v1.3 did not take them up — expected, since v1.3 was a targeted
repair of a runtime parse failure, not a general revision pass. Both are re-stated in the
findings table below at unchanged severity so the round's counts stay honest; neither is
re-argued, and neither gates.

| ID (v3) | Severity | Status in v1.3 | Note |
|---|---|---|---|
| F-16 | Medium | Open, unchanged | T11's forwarding oracle is still presence-shaped ("a test asserts the forwarded flag reaches the child's argv", `:151`) where the behaviour is position-shaped. Re-measured at HEAD on node v20.20.1 this round: `node --test --experimental-test-coverage __tests__/` prints a coverage report; `node --test __tests__/ --experimental-test-coverage` exits non-zero, `Could not find '/…/--experimental-test-coverage'`. Unchanged text, unchanged severity, unchanged remedy (pin the flag's index below `__tests__/`, or set-equality over the child argv) |
| F-17 | Low | Open, unchanged | §6 still quotes §10's header inexactly |

## Checks re-run at HEAD

The change note makes four checkable claims. All four were re-measured against HEAD's
`orchestrate-dev.js` rather than read back off the document.

| Claim | Method | Result |
|---|---|---|
| The new headers parse | `parsePlanOwnership(PLAN)` at HEAD | Returns 54 owning tasks, **76** path–owner pairs. `PLAN_FILES_HEADER_CELLS` (`:3879-3886`) contains `files`, `PLAN_OWNER_HEADER_CELLS` (`:3871-3878`) contains `task`; the `Batch` column is ignored, as the docstring states (`:3932-3934`) |
| The old headers did **not** parse | Same parser over `git show 06f5702a:…PLAN` | `null`. The v1.2 diagnosis is correct, not a plausible story: `path` and `owner(s), by batch` are in neither set |
| "Content is unchanged: same 76 path–owner pairs, same batches" | **Set-equality**, both directions, over `(path, task)` and again over `(path, task, batch)` triples extracted from v1.2's cells vs v1.3's rows | 76 = 76, symmetric difference **empty** on both keys. Not containment — a dropped row would have shown |
| "`validatePlanContract` ok over 54/54 tasks, `computeWaves` yields 17 ownership-disjoint waves" | `parsePlanTasks` + `validatePlanContract` + `computeWaves` at HEAD | `{"ok":true}`; 54 tasks parsed; **17** waves; all 54 tasks appear in exactly one wave |

Two further checks the note does not claim, run because the re-format is exactly where a
silent testing regression would hide:

| Check | Method | Result |
|---|---|---|
| Waves are genuinely ownership-disjoint (the manifest's whole purpose — last-writer-wins between two agents appending the same new test file is invisible to a green gate) | Re-derived every wave's task set, unioned each task's owned paths, looked for a repeat inside a wave | **0 collisions** across all 17 waves. The premise §4 states in prose ("read it column-wise and no batch shows one path twice") now holds under the waves the runtime will actually build, not only under the declared batches |
| No *other* table in the PLAN qualifies as a manifest and quietly contributes rows (§3 carries `Task`, and a `Files`-ish column would fuse the two tables) | Header sets vs §3's `# / Task / Test File / Source File / Batch / Deps / Status`; pair count vs §4's row count | `test file` and `source file` are in neither set; parsed pairs (76) equal §4's row count exactly, so no foreign table contributed |
| T00's `✅` is a true statement, not a hopeful one | `node --test __tests__/preflight.test.js` in `pdlc/engine` | 9 tests, 9 pass, 0 fail. §3's legend (`:143`) defines `✅ Done`; the file is tracked at HEAD |

## Findings

No new findings. The re-format changed serialisation, not content, and I could not
falsify that on either key I tried. The two rows below are round 3's open items carried
at unchanged severity, not re-opened arguments.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-16 | Medium | Local | **T11's coverage-forwarding oracle is presence-shaped where the behaviour is position-shaped.** Carried from round 3, unchanged text. Re-measured this round on node v20.20.1: the forwarded flag works only in node-option position, before `--test`'s path list; appended after `__tests__/` node reads it as a path and exits non-zero. An implementation that appends still satisfies "the forwarded flag reaches the child's argv", so V5 and §8's coverage floor can both be unrunnable with T11 green. Remedy unchanged: say in T11's row *where* forwarded node flags go, and pin the assertion to position (or set-equality over the child argv) rather than containment. Not gating — the failure is loud, and no coverage number is read off a run that never started | §3 T11 (`:151`); §8 coverage item; §11 V5 |
| F-17 | Low | Local | **§6 misquotes one of the four confusable table headers it names**, in the same document that contains the header. Carried from round 3, unchanged. The point of the enumeration is that exact-cell spelling is load-bearing, so an inexact quotation is the one kind of error a later editor will "correct" in the wrong direction. Either quote §10's header exactly or cite section numbers without quoting | §6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round 3's Q-02 is now settled by measurement, so this is the follow-on rather than a re-ask. §5 says the runtime "**will** run more waves than eleven"; it runs **17**, and the manifest's `Batch` column — now parsed and deliberately ignored (`orchestrate-dev.js:3932-3934`) — still reads `b1`…`b11`. So the document carries two numbering systems side by side, and the one printed in the wave-gate output is the one §4 does *not* use. §5's "match on the stopped wave's task id, not its batch number" is exactly the right instruction; is it worth one clause in §4 too, where the `b`-labels are, saying the column is retained for human column-wise auditing and is not what the runtime counts? Purely a legibility question at 2 a.m., not a correctness one |
| Q-02 | The v1.2 → v1.3 failure mode was silent in the direction that matters: a manifest that does not parse does not fail loudly, it *degrades* to the legacy worktree path, and the degradation only surfaced when T00 hit merge-back. T08's row already asserts CI arrangement; is any task asserting that **this PLAN's own manifest parses** — i.e. a test that feeds the real `PLAN-pdlc-headless-engine.md` (or a fixture copy of its §4 header row) to `parsePlanOwnership` and asserts non-`null` plus `validatePlanContract().ok`? T48's run i pins wave mode with a *fixture* PLAN, which proves the runtime, not this document. One small red test over the real file would have caught v1.2 before Phase I did, and would keep catching it if a future edit re-styles the headers. Not filed as a finding because it is arguably a repo-hygiene test rather than a feature AC — but it is cheap, and this feature is the one that learned why it matters |
| Q-03 | Carried, still open, still not gating: T04's totality property generates "arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes)". Is that corpus pinned anywhere — a shared `throwables` fixture — or left to the implementer? A hand-rolled generator that only emits `Error` instances passes the property while proving nothing |
| Q-04 | Carried from round 3: is the ≥85 % branch floor read per-module or over the whole `lib/` aggregate? An aggregate can sit above 85 % while `lib/transport-cli.mjs` sits below it, which satisfies §8's sentence without meeting its intent |

## Positive Observations

- **The change note states the mechanism, not the symptom.** "Phase I halted" would have
  been the easy sentence. Instead §0 names the parse (`parsePlanOwnership`), the exact
  header cells that failed to match, the fallback that followed (legacy worktree path),
  and where it surfaced (T00's merge-back). That is a note a reader can falsify — I did,
  in both directions: v1.2's table returns `null`, v1.3's returns 54 tasks.
- **The re-format was verified before it was claimed, and the claim is the kind that can
  fail.** "`validatePlanContract` ok over 54/54, `computeWaves` yields 17" is a numeric,
  re-runnable assertion, not "the manifest now parses". Both numbers reproduce exactly.
- **Content preservation survives a set-equality check, not just a containment one.** This
  is the review I most expected to find something in: 68 packed rows became 76 flat rows
  by hand, and a dropped `T47 (b7)` from a three-owner cell would be invisible to any
  eyeball scan and to a row count. Symmetric difference is empty on `(path, task)` **and**
  on `(path, task, batch)`. The batch labels came through the flattening intact, which is
  the part that would have quietly re-introduced a same-batch collision.
- **The T16 dist cell narrowed in the right direction.** Under the new grammar the old cell
  ``` `pdlc/workflows/dist/` (both bundles + `distribution-manifest.json`) ``` would have
  yielded *two* owned paths, the second a bare filename with no directory prefix — a path
  that collides with nothing and protects nothing. Narrowing to the directory keeps the
  manifest file covered by prefix and keeps the collision rule's trailing-`/` convention
  (`orchestrate-dev.js:3939-3940`) meaningful. That is a parser-aware edit, not a tidy-up.
- **The disjointness premise now holds under the waves that will actually run.** §4's prose
  argues it per declared batch; the runtime partitions derived ready-sets. Those are not
  the same partition (b2 alone spans waves 2 and 3), so the prose argument could have been
  true while the run collided. Re-derived: 0 collisions across 17 waves.
- **T00's `✅` is backed by a passing test at HEAD, and the legend defining `✅` is in the
  document.** Status columns rot precisely because nobody says what the tick asserts. This
  one is checkable in one hop, and it checks out (9/9).

## Recommendation

**Approved with minor changes**

No High findings, and none opened by the delta. v1.3 does one thing — re-serialise §4 into
the grammar `parsePlanOwnership` actually accepts — and it does it without moving content:
76 path–owner pairs in, 76 out, symmetric difference empty on both the `(path, task)` and
`(path, task, batch)` keys. The two claims that could have been wishful (`validatePlanContract`
ok over 54/54; 17 ownership-disjoint waves) both reproduce at HEAD, and the disjointness the
manifest exists to guarantee holds under the derived waves as well as the declared batches:
0 collisions. T00's status flip is true — the test is tracked and passes 9/9.

Two items remain in the implementer's hands, both carried unchanged from round 3, in order
of value:

1. **F-16** (Medium) — say in T11's row that forwarded node flags go in node-option
   position, before `--test`'s path list, and pin the assertion to position (or set-equality
   over the child argv) rather than presence. `node --test __tests__/ --experimental-test-coverage`
   still exits non-zero on node 20; V5 and §8's coverage floor both depend on the other
   spelling.
2. **F-17** (Low) — quote §10's header exactly in §6, or cite section numbers instead.

Q-02 is the one I would most like an answer to even though it is not a finding: the defect
this revision repairs was invisible until Phase I ran, because a malformed manifest degrades
rather than fails. A red test that feeds this PLAN's own §4 to `parsePlanOwnership` and
asserts `validatePlanContract().ok` would have caught v1.2 at authoring time and would keep
catching the next re-style. Q-01 asks for one clause in §4 about the retained `b`-labels;
Q-03 and Q-04 are unchanged carries.

No erratum this round. Round 3's TSPEC erratum is discharged: TSPEC now carries the
single-platform statement at `:2141`, `:2159`, `:2406`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:5174a8ec0092f8603e0529878732962025c4e319285d4f6753f02b957136906f
REVIEWED-COMMIT: 06ce3342
