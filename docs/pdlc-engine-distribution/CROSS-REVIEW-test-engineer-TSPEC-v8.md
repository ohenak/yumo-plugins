# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.8)
**Date:** 2026-08-13
**Iteration:** 8

**Scope:** testing lens only — oracle falsifiability, expected-set completeness,
production-path vs unit-path proof, implementation echoes, TDD order. Delta
re-review: v0.7's four findings and two questions re-verified against HEAD, and
only the changed regions scanned for new defects. Sections untouched this round
are not re-opened.

## Delta: what changed and what I re-verified against HEAD

Diffed `24141260..HEAD` on the TSPEC (seven commits, v0.7 → v0.8) and re-read every
changed region: §7.2's relocated per-pass assertion, §9.3's `argv` and default-`deps`
clauses plus the split task's red test, §12.1's production-path row, §12.3's
merge-ladder addresses, §12.4's ordering bullet, and K-3.

Every `file:line` added or corrected this round I resolved at HEAD rather than trusted:

- **The Q-19 fixture recipe holds mechanically.** `runQueueLoop` is at `run.mjs:478`;
  `runQueue(args)` is entered at `:491`; `pass.refusal` stops as `"refused"` at `:495-498`;
  `blocked` at `:501-504` and `idle`/`no-queue` at `:505-508` stop on pass 1; the
  `"ran"`/`"halted"` fall-through comment is `:509`. `runQueue` returns the workflow
  module's own return value as `report` (`:454-457`), so a recording `main()` returning
  `{outcome: "ran"}` really does yield `pass.report.outcome === "ran"` and continue —
  the recipe is not a hopeful reading. `refusalFor` is `:331-335` and returns `null` on
  `startup: null` (`:332`); `requireAdapter` demands `_agent` at `:319-323`, before
  either import (`:432` precedes `:435`). `...args` in the loop signature (`:478`) does
  forward `importWorkflow` to each pass. `maxPasses: 2` therefore reaches
  `stopReason: "bound-reached"` (`:486-489`).
- **The default-`deps` pins name real exports.** `runDev` `run.mjs:381`, `runQueue`
  `:422`, `runQueueLoop` `:478` — all three are `export async function` at exactly those
  lines, so an identity pin against them is writable.
- **The `argv` clause matches HEAD's convention.** `const [, , cmd, ...rest] =
  process.argv` is `bin/pdlc.mjs:479`; the `default:` branch prints `USAGE` to **stderr**
  and sets `process.exitCode = 1` at `:498-501` (so §9.3's "no `USAGE` on stderr"
  assertion names the right stream); `--max-iterations` → `maxPasses` is `:425-426`,
  `:439`; the flag is USAGE line `:39` and is in `queue`'s closed flag set (`:94-103`),
  as are `--plugin-root` and `--cwd`.
- **F-42's correction is right, and so are the four incidental ones.** Guard 4 `:1092`,
  guards 7–8 `:1128-1150`, guard 11 `:1169`, guard 12 `:1184`, guards 17–18
  `:1232-1255`, guards 19–21 `:1256-1284` — each comment sits where v0.8 now says.
- **The split task's red is real.** `grep -c "^export" pdlc/engine/bin/pdlc.mjs` is `0`
  and the file ends in `main().catch(…)` (`:505`), so both assertions fail at HEAD.
  `pdlc/engine/__tests__/provenance-path.test.js` does not yet exist — a genuinely new
  file, so §12.4's one-owner-per-batch reading is available.

## Round-7 findings: disposition

| ID | Severity | Disposition |
|----|----------|-------------|
| F-39 | High | **Resolved.** The per-pass identity assertion is moved onto the injection-level leg, which drives the real `runQueueLoop({maxPasses: 2, …})` over the recording module; §12.1 now says in its own voice what the process-entry leg does **not** assert and why (one captured entry ⇒ trivially true). The `--max-iterations` vs `maxPasses` naming point is absorbed rather than dropped |
| F-40 | Medium | **Resolved.** §12.4 gives the split task its own red test in its own batch, and §9.3 states both assertions positively — `process.exitCode` compared against a value captured before the import, and a captured stderr with no `USAGE` — not as an absence |
| F-41 | Medium | **Resolved.** `cli.mjs` exports its default `deps`; the pin is set-equality against the literal key set plus per-key identity against `run.mjs`'s exports. That is the shape I asked for, and it is the only thing anywhere that observes the shipped defaults |
| F-42 | Low | **Resolved**, and the correction went further than the one range I flagged: four neighbouring addresses were re-derived in the same pass |
| Q-19 | — | **Answered, and the answer is verifiable** — see the delta section above |
| Q-20 | — | **Answered.** One named file, `provenance-path.test.js`, created by the split task and extended by the wiring task |

Nothing previously approved is re-litigated below. Both findings are in regions this
round changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-43 | High | Local | **The newly-named `argv` cannot reach the recorders, and nothing in the leg asserts that they were reached — so the leg observes nothing on any machine where a startup rung fails.** §9.3's new clause names the fixture concretely: `main(["node", "pdlc", "queue", "--loop", "--max-iterations", "2"], deps)`. Follow that call at HEAD: `main` dispatches to `cmdQueue(rest)` (`bin/pdlc.mjs:496`), whose **first** statement is `const startup = startupFor(argv)` (`:397`) — the real `runStartupChecks` (`:139-146`), not a seam. That ladder resolves a plugin root, requires the cwd to be a git repo, reads the dispatchable skills, probes for a guard interpreter on `PATH` (`startup.mjs:400-427`), and resolves an auth posture from `process.env` plus login evidence under `home` against `apiKeyPolicy: ["none"]` (`bin/pdlc.mjs:144`, `startup.mjs:430-434`). If any rung fails, `cmdQueue` prints the refusal and **returns at `:407`** — the recorder is never called. If it passes, `:417` builds a **live** transport and adapter (`liveAdapter`, `:279-297`), also not behind `deps`, before the `runQueueLoop` call at `:434`. The `deps` seam covers the three runners and nothing above them. Two consequences: (a) with the argv as written — no `--plugin-root`, no `--cwd` — whether this leg exercises anything is decided by the runner's environment (`PDLC_PLUGIN_ROOT`, an `ANTHROPIC_API_KEY` that the `["none"]` policy refuses, a `bash` on `PATH`), so it can be green on the maintainer's laptop and refuse in CI, or the reverse; and (b) on the refusal path `captured` is **empty**, and §7.2's transcription instruction — "one comparison inside a loop over the captured calls" — is then vacuously true, which is the same silent-zero vacuity F-39 just removed one level down. Fix is two clauses, no redesign: **(1) every leg asserts its capture count positively before asserting anything about the contents** — the process-entry leg, exactly one recorded call per command invocation and all three sites covered across the three invocations; **(2) the fixture pins the startup inputs it depends on** — `--plugin-root` and `--cwd` are both already in `queue`'s and `dev`'s closed flag sets (`bin/pdlc.mjs:93-103`), so name them in the argv, and say what the leg does about the env-sensitive auth rung (pin `process.env` for the call, or widen `deps` to carry the startup/adapter constructors). Then a refusal is a deterministic red with a legible reason, not an empty capture that passes | §9.3 (`argv` clause, exception 1), §12.1 (production-path row, process-entry leg), §7.2 ("One assertion, applied per pass") |
| F-44 | Medium | Local | **The ≥2-pass premise is prose, not an assertion, so the recipe can decay silently exactly once more.** §7.2 now derives, correctly, that `{outcome: "ran"}` plus `startup: null` plus an `_agent`-carrying adapter stub reaches `stopReason: "bound-reached"` at `maxPasses: 2` (all four citations check out — `run.mjs:486-489`, `:495-498`, `:501-509`, `:319-323`). But the leg's assertions, as specified, are the identity comparisons over `captured`; nothing asserts the premise those comparisons rest on. If a later edit to the recording module's return shape makes pass 1 stop the loop — `{outcome: "idle"}` is one character's difference and stops as `"exhausted"` (`run.mjs:505-508`) — `captured` holds one entry, the identity comparison is trivially true again, and the suite stays green. One clause closes it: the leg asserts `captured.length === 2` **and** the returned `stopReason === "bound-reached"` (a value, from `run.mjs`'s closed four-member `LOOP_STOP_REASONS`, `:317`) as first-class assertions, so the fixture's own premise is falsifiable rather than assumed. This is cheap and it is what makes the Q-19 recipe durable instead of correct-on-the-day-it-was-written | §7.2 (injection-level leg bullet), §12.1 (production-path row) |

## Questions

| ID | Question |
|----|---------|
| Q-21 | If F-43's fix goes the "widen `deps`" way rather than the "pin the argv and env" way, `deps` stops being three runners and becomes four or five keys — which directly changes F-41's set-equality expected set. Whichever way it goes, the two clauses must be written together, or the split task's red test pins a key set the wiring task then has to edit. Worth one sentence in §9.3 saying which of the two shapes is chosen, so the PLAN author is not the one deciding it |
| Q-22 | §12.1 now says the wiring task **extends** `provenance-path.test.js` with both the process-entry and injection-level legs. Those two legs have quite different setups (one needs a passing startup rung and a live-ish adapter, the other needs only an `_agent` stub and the `importWorkflow` seam). Is one file still the right call, or does the setup asymmetry argue for the loop leg living beside the other `importWorkflow`-seam tests? Not a finding — the manifest is legal either way — but the answer affects how much per-test setup the wiring task carries |

## Positive Observations

- **F-39's fix relocated the assertion *and* wrote down why the old placement was
  vacuous.** §12.1 does not quietly delete the claim; it states that the process-entry
  leg's recorder is called once, that a per-pass comparison there is true of every
  implementation including the defective one, and that `maxPasses: 2` would be
  decorative fixture data. A reader who inherits this document learns the failure mode,
  not just the current shape.
- **The Q-19 answer is a mechanism, not a reassurance.** Four separate stop conditions
  are enumerated with the return values that avoid them, and I could re-derive each from
  `run.mjs` without consulting the TSPEC's prose. Notably `{outcome: "ran"}` really does
  survive `runQueue`'s wrapping (`run.mjs:454-457`) — the recipe holds at the level it is
  actually applied, which is the part that usually breaks.
- **F-41's pin is set-equality against a literal, exactly as asked.** Key set equals
  `{runDev, runQueue, runQueueLoop}` — a dropped or renamed key fails — and each value is
  `===` the named `run.mjs` export. That is a completeness check, not a containment
  check, and it lands on the level that introduces the seam rather than a level later.
- **F-40's red test is stated as two positive observations.** `process.exitCode`
  compared against a value captured *before* the import, and a captured stderr with no
  `USAGE` text, rather than "nothing happened" — the document explicitly notes that the
  absence form would pass against a file that does not exist. That reasoning is the
  general lesson, written where the next author will read it.
- **F-42 was over-fixed in the right direction.** I flagged one bad range; the revision
  re-derived five neighbouring addresses and labelled the old one as the CLOSED-PR/CI-rule
  span rather than silently swapping digits. All six now resolve at HEAD.

## Recommendation

**Needs revision** — one High finding.

All four round-7 findings are genuinely resolved, and F-39's fix in particular is the
kind I hoped for: the assertion moved to the level that can falsify it, the old
placement's vacuity written down rather than erased, and Q-19's premise answered with a
recipe I could re-derive line by line from `run.mjs`. I re-resolved roughly twenty
citations across the changed regions and found no slips this round.

The blocker is one layer up from where we have been looking. Naming the `argv` concretely
was the right move, and it made visible what the abstract description hid: `cmdQueue`
runs the real startup ladder and builds a live adapter *before* it reaches the seam the
leg substitutes, so with the argv as written the recorder may never be called at all —
and on that path `captured` is empty and a loop-over-captured assertion passes. That is
the same silent-zero shape F-39 removed at the pass level, reappearing at the invocation
level. The fix is two clauses and no redesign: assert the capture count positively before
asserting its contents, and pin the startup inputs the leg depends on (`--plugin-root`
and `--cwd` are already permitted flags, so the argv can carry them).

Worth taking in the same pass: F-44's two premise assertions (`captured.length === 2`,
`stopReason === "bound-reached"`), which cost one line and stop the Q-19 recipe from
decaying back into a one-pass fixture the next time someone edits the recording module.
Q-21 matters for sequencing — whichever way F-43 is fixed, it must be decided in §9.3 and
not by the PLAN author, because it changes F-41's expected key set.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
