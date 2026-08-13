# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.7)
**Date:** 2026-08-13
**Iteration:** 7

**Scope:** testing lens only — oracle falsifiability, expected-set completeness,
production-path vs unit-path proof, implementation echoes, TDD order. Delta
re-review: v0.6's three findings and two questions verified against the
revision, then only the changed regions scanned for new defects. Sections
untouched this round are not re-opened.

## Delta: what changed and what I re-verified at HEAD

Diffed `7ef292cc..HEAD` on the TSPEC (eight commits, v0.6 → v0.7) and re-read
every changed region. Each `file:line` in the new prose was re-resolved at HEAD
rather than trusted:

- The whole v6 F-36 mechanism rests on four facts about `bin/pdlc.mjs`, and all
  four hold: the runners arrive as one static ESM binding line
  (`import { runDev, runQueue, runQueueLoop, … } from "../lib/run.mjs"`,
  `pdlc/engine/bin/pdlc.mjs:30`), `cmdDev` (`:352`) and `cmdQueue` (`:396`)
  carry no `export`, and the file ends in a bare `main().catch(…)` (`:505`).
  So "importing the module runs the CLI against the importer's `argv`" is a
  true statement about HEAD, not a rhetorical one.
- The three hand-off sites are where §7.2 says: `runDev({reqPath, forcePhases,
  cwd, adapter, startup})` (`:385`), `runQueueLoop({queuePath, cwd, adapter,
  startup, maxPasses})` (`:434`) and `runQueue({queuePath, cwd, adapter,
  startup})` (`:457`).
- The `deps`-shaped precedent is real: `importWorkflow = defaultImportWorkflow`
  is a defaulted destructured parameter in both `runDev` (`run.mjs:387`) and
  `runQueue` (`:427`), which is exactly the shape §3.1 and §9.3 borrow.
- `runQueueLoop({maxPasses = null, ...args})` (`run.mjs:478`) still calls
  `runQueue(args)` per pass (`:491`) — the fact F-39 below turns on.
- The `cli.test.js:22` subprocess precedent is real
  (`spawnSync(process.execPath, [BIN, …])`).

Round-6 disposition:

| ID | Severity | Status this round |
|----|----------|-------------------|
| F-36 | High | **Resolved.** §3.1, §5.4, §9.3, §12.1, §12.3 and K-3 now name one mechanism — exported `main(argv, deps)` behind an entry guard plus a default-valued runner seam — and §9.3 records the two rejected alternatives instead of leaving the choice to the implementer. The "moves unchanged" bullet is reconciled rather than contradicted: the two exceptions are enumerated and priced |
| F-37 | Medium | **Resolved.** §12.4 states the edge in its own voice: the split task creates `bin/cli.mjs`, the wiring task depends on it and owns the path in a later batch, and the manifest's one-owner-per-batch rule is named as the reason |
| F-38 | Low | **Resolved.** §7.2's hand-off row now marks `:385`/`:434`/`:457` (and the S-6, §12.1, K-3 copies) HEAD-relative and tells the reader to resolve by name after the split |
| Q-17 | — | **Answered, and I agree with the answer.** No fourth structural clause for `cli.mjs`; the import-based tests are the pin. F-40 below is about *when* that pin lands, not whether it is the right pin |
| Q-18 | — | **Answered, but the answer collides with F-36's mechanism** — see F-39 |

Nothing previously approved is re-litigated below; the four findings are all in
regions this round changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-39 | High | Local | **The ≥2-pass identity assertion is placed at the one level where it cannot run: the recorder that makes the process-entry leg writable is the same object that would have done the looping.** Two passages added this round say the per-pass check lives in the process-entry leg. §7.2: "The loop leg of §12.1 writes a single assertion form, `captured[i].provenance === p` … the fixture drives **≥2 passes** — `maxPasses: 2` (the bound `runQueueLoop` reads at `run.mjs:478`)". §12.1: the leg "calls the exported `main(argv, deps)` … passes **recorders** for the three runners … with the loop case driven at `maxPasses: 2` and asserting **every pass** carries the same frozen value by identity". These cannot both hold. In that leg `runQueueLoop` **is** a recorder, so the real `runQueueLoop` (`run.mjs:478`) never executes, `maxPasses` is inert data sitting in a captured argument object, `runQueue` is never reached per pass, and `captured` has exactly **one** entry. `captured[i].provenance === p` over a one-element array is true for every implementation, including one that rebuilds provenance on each pass — the precise defect §7.2's "a PLAN task must **not** re-derive the value inside the loop" instruction exists to forbid, and the precise vacuity Q-18 was asking to avoid. A task author transcribing this writes a loop-over-one and reports Q-18 answered. Note also that the CLI flag is `--max-iterations`, not `--max-passes` (`bin/pdlc.mjs:39`, `__tests__/cli.test.js:150`), so an `argv`-driven fixture cannot even set the bound by that name. The fix is a relocation, not a new mechanism: the per-pass identity assertion belongs on the **injection-level** leg §12.1 already describes — drive the **real** `runQueueLoop({maxPasses: 2, provenance, importWorkflow})` with the recording workflow module that leg already substitutes, and assert identity across the two captured pass argument objects. The process-entry leg then keeps exactly what it can prove: the `runQueueLoop` argument object it captured carries `provenance` (which is the `:434` defect that started this thread). Say which leg owns which assertion, and the loop bound stops being decorative | §7.2 (the new "One assertion, applied per pass" paragraph), §12.1 (production-path level), §12.3 (oracle 2) |
| F-40 | Medium | Local | **The split task ships both behaviour changes and no test; its pin lands a batch later.** §9.3 declines a fourth structural clause for `cli.mjs` on the grounds that "a later edit that restored a bare `main()` call would break every process-entry test at once and loudly" (Q-17), and §12.4 places the split task **first** and the process-entry leg with the **wiring** task. So in the split task's own batch, the entry guard and the `deps` seam — the two places §9.3 concedes this feature changes behaviour in a file it otherwise moves verbatim — are implemented with nothing red-first naming them, against a `[Fake first]` rule §12.4 opens by restating ("every implementation task depends on a red-test task naming the same test file"). The cheap fix is also the strongest reading of Q-17: give the split task its **own** red test — importing `bin/cli.mjs` is inert (asserts positively that `process.exitCode` is unchanged and that no `USAGE` text was written, not merely that "nothing happened"), and `main` is exported and callable. Both assertions fail against HEAD's shape, which is what makes them a red test rather than a formality | §12.4 (the new `bin/cli.mjs` ordering bullet), §9.3 (the Q-17 bullet) |
| F-41 | Medium | Local | **Nothing pins that `deps`' defaults are the real runners, and every new test passes recorders.** §9.3 says "Production behaviour is unchanged because the defaults *are* the static imports" — an unverified claim, and the classic mis-wired-default false green: a `deps = {runDev, runQueue, runQueueLoop: runQueue}` typo leaves the whole process-entry leg green (it always supplies its own recorders) and ships a `pdlc queue --loop` that runs one pass. The shipped subprocess tests do not cover the gap either — I checked all of them: `queue --dry-run` and `dev --dry-run` return before dispatch (`cli.test.js:70`, `:78`), `queue --loop --max-iterations 0` is asserted to be refused *before the loop starts* (`:149-153`), `--max-iterations abc` likewise (`:156`), and the missing-plugin cases refuse at the startup rung (`:86`, `:102`, `:114`). So no test at any level observes the real `run*()` bindings being reached through the defaults. One clause fixes it: the leg asserts the exported default `deps` object has **exactly** the three keys `{runDev, runQueue, runQueueLoop}` (set-equality against the literal key set named in §3.1, so a dropped or renamed key fails) and that each value is identical to the correspondingly-named export of `lib/run.mjs` | §9.3 (exception 2), §3.1 (`bin/cli.mjs` row), §12.1 |
| F-42 | Low | Local | **§12.3's O3 precondition cites the wrong guards.** The new enumeration reads "an **O3** that is `ok` with **`unresolved: 0`** (guards 17–18, `:1152-1175`)". At HEAD guards 17 and 18 are at `orchestrate-dev.js:1232` and `:1245`; the cited range `:1152-1175` spans guards 9–11 (PR `CLOSED`, O2 not observed, `ciRule`) — a different precondition, and one the same sentence already lists separately for O2. Every other address in that enumeration resolves (guard 2 `:1076`, guard 4 `:1090`, guards 7–8 `:1128`/`:1146`, guard 11 `:1168`, guards 12/14/15 `:1183`/`:1200`/`:1212`, guards 19–21 `:1256`/`:1260`/`:1273`), which is why this one reads as a slip rather than a misunderstanding — the prose's semantics are right. Correct the range to `:1232-1255` | §12.3 (oracle 2, merge-fixture precondition list) |

## Questions

| ID | Question |
|----|---------|
| Q-19 | If F-39 is fixed by moving the per-pass assertion to the injection-level leg, that leg drives the **real** `runQueueLoop` with a recording workflow module — which means the loop's own stop conditions now sit inside the fixture. `runQueueLoop` breaks on `pass.refusal` and on the pass outcome (`run.mjs:478-495`), so the recording module's `main()` return shape decides whether two passes actually happen. Worth one clause naming what the recorder returns (a pass that neither refuses nor terminates), otherwise the "≥2 passes" fixture silently becomes a one-pass fixture again for a different reason and the assertion is vacuous a second time |
| Q-20 | §12.4 now says the process-entry leg lands with the **wiring** task. If F-40's inert-import test lands with the **split** task, the two tasks write to the same engine-side test file in different batches — fine for the manifest, but is the file named the same in both rows? A PLAN that gives them different files ends with the entry guard pinned twice and the `deps` defaults (F-41) pinned nowhere; naming the single file here saves the PLAN author the choice |

## Positive Observations

- **F-36 was answered with a mechanism, its price and its rejected
  alternatives.** §9.3 does not just assert the new shape — it names both
  exceptions to "moves unchanged", explains why each is needed, records that
  export-without-seam leaves the argument object unobservable and that the
  subprocess-plus-artifact oracle needs a fixture this feature does not
  otherwise need, and routes the cost into K-3. That is the shape of an answer
  a PLAN author can implement without re-deciding anything.
- **The `deps` seam borrows a shape the repo already ships.** Pointing at
  `importWorkflow = defaultImportWorkflow` (`run.mjs:387`, `:427`) rather than
  inventing a new injection idiom means the reviewer of the implementation has
  a precedent to compare against, and I verified both call sites are exactly
  that shape.
- **F-38's fix is better than what I asked for.** I asked for one
  parenthetical; §7.2 instead states the rule — *resolve them by name, not by
  address* — and names all four sites that carry HEAD-relative numbers. That
  generalises to the next reader instead of patching one row.
- **§12.4's ordering bullet gives the reason, not just the order.** "The
  file-ownership manifest admits exactly one owner per file per batch … a PLAN
  that lists the path under both tasks in one batch is rejected by the
  manifest" tells a PLAN author what will fail and why, so the edge survives a
  re-plan rather than being copied as a ritual.
- **The merge-fixture preconditions are transcribed from the ladder, not
  derived at test-writing time.** Enumerating the guards a fixture must clear —
  with the emptiness guard kept as the backstop — is exactly the no-echo
  discipline: the expectation is written down here, and the code under test is
  not consulted to produce it. Every address but one resolves (F-42).

## Recommendation

**Needs revision** — one High finding.

All three round-6 findings are genuinely resolved, and F-36 in particular was
answered at the level I asked for: the process-entry leg now has a named,
priced, executable mechanism, and the alternatives it beat are on the record.
I re-derived every citation in the changed regions against HEAD and found one
slip (F-42) out of roughly twenty.

The blocker is that the mechanism and this round's Q-18 answer were written
into the same document without being reconciled. Recorders at process entry
mean the real `runQueueLoop` never runs, so `maxPasses: 2` is inert and the
per-pass identity assertion evaluates over a single captured call — true for
every implementation, including the per-pass rebuild the instruction in §7.2
forbids. The leg's *primary* assertion (all three call sites are handed
`provenance`) is unaffected and remains the strong falsifier for the `:434`
defect; what degrades to trivially-true is the sub-assertion added to answer my
own last question. That is a one-paragraph relocation, not a redesign: put the
identity check on the injection-level leg that already substitutes a recording
workflow module, and let the process-entry leg assert what it can observe.

Worth taking in the same pass: F-41's default-`deps` clause (nothing at any
level currently observes the real runners being reached — I checked all
fourteen shipped CLI tests), F-40's red test for the split task so the entry
guard is pinned in the batch that introduces it, and F-42's one-range
correction. Q-19 and Q-20 are cheap clauses that keep the relocated fixture
from going vacuous for a second reason.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
