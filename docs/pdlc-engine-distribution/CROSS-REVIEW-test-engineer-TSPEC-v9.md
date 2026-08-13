# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.9)
**Date:** 2026-08-13
**Iteration:** 9

**Scope:** testing lens only — oracle falsifiability, expected-set completeness,
production-path vs unit-path proof, implementation echoes, TDD order. Delta
re-review of v0.8's two findings; only the changed regions scanned for new
defects.

## Delta: what changed and what I re-verified at HEAD

Diffed `35246851..HEAD` (eight commits, v0.8 → v0.9) and re-read every changed
region: §3.1's `cli.mjs` row, §5.4's substitutability sentence, §7.2's per-leg
assertion table and the ≥2-pass premise, §9.3's exception 1 (argv) and
exception 2 (the five-key seam), §12.1's production-path row, §12.2's fake
table, §12.3's oracle 2, §14.1's K-3.

Roughly thirty `file:line` claims re-resolved at HEAD; the load-bearing ones:

- **The two gates are really gates.** `startupFor(argv)` is `cmdQueue`'s first
  statement (`bin/pdlc.mjs:397`) and `cmdDev`'s statement after positional
  parsing (`:362`); both `return` on `!startup.ok` (`:407`, `:374`) with no
  runner called. `liveAdapter` (`:279-298`) is called at `:383`/`:417`, before
  the runner calls at `:385`/`:434`/`:457`. So the three-key seam really did
  leave the leg's outcome to the environment, and the widening is not
  defensive over-engineering.
- **The silent-zero mechanism is real.** Auth row 5 refuses when an API key is
  present without opt-in and without login evidence (`lib/auth.mjs:88-95`, the
  only `refuses: true` row in `AUTH_ROWS`, `:61-99`); `apiKeyPolicy` is
  `["none"]` unless `--allow-api-key-billing` (`bin/pdlc.mjs:144`). Rung 0
  reads `process.cwd()` because `startupFor` passes no `cwd`
  (`lib/startup.mjs:328`, `:348`) — §9.3's "the one input argv cannot pin" is
  exactly right.
- **The named stub return shapes survive the command bodies.** I walked
  `cmdQueue`'s loop branch with §9.3's stubs: `formatStartup(startup)` spreads
  `banner` (`lib/startup.mjs:485-486`) → empty; `passes: []` makes
  `last` `undefined`, and `emitReport(last && last.report, …)` reaches
  `stampReport(undefined, engine)`, which is total (`lib/report.mjs:110-112`,
  `{...(report || {})}`) rather than a throw; `exitCode`, `outcome`,
  `loop.iterations`/`maxIterations` are each read at `:444-452`;
  `adapter.getApiKeySource()`/`getPauseLog()` at `:329-331`. The claim "none of
  this is fixture decoration" holds line by line.
- **The premise assertions have a real target.** `LOOP_STOP_REASONS` is the
  frozen four-member set at `run.mjs:317`; `{outcome: "ran"}` falls through the
  four stop branches (`:495-509`) to the `maxPasses` bound (`:486-489`).
- **The key-name split is grounded.** `_provenance` belongs on the injection
  objects (`devInjection` `run.mjs:80-91`, `queueInjection` `:114-123`), and
  the "add a second `provenance` key" repair is red at `PROP-PARITY-12`'s
  `deepEqual` over the literal seam lists (`__tests__/seam-contract.test.js:47-63`,
  `:65-73`).

## Round-8 findings: disposition

| ID | Severity | Disposition |
|----|----------|-------------|
| F-43 | High | **Resolved, and at the right level.** The seam widened from three keys to five (`{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}`), so the leg no longer depends on `process.cwd()`, `PATH`, the plugin tree or `ANTHROPIC_API_KEY`; capture counts are asserted **positively and first** (`=== 1` where reached, `=== 0` where not), so an empty capture is red rather than vacuously green; and each stub's return shape is named because the command bodies keep running into `emitReport`. The argv-plus-env alternative was weighed and recorded as rejected rather than silently dropped |
| F-44 | Medium | **Resolved.** §7.2's injection-level leg now carries two first-class assertions before the identity comparison — `captured.length === 2` and the returned `stopReason === "bound-reached"` against `LOOP_STOP_REASONS`' named member — so a changed recording-module return decays loudly |
| Q-21 | — | Answered where I asked it to be: §9.3 makes the seam-width decision and §12.1's set-equality follows it, so the PLAN author inherits a decision rather than making one |
| Q-22 | — | Answered: one file, with the asymmetry's real cost (shared process state) converted into the capture/restore rule rather than into a second ownership-manifest row |

Nothing previously approved is re-litigated below. Both findings sit in regions
this round changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-45 | Medium | Local | **The division of labour that justifies stubbing `liveAdapter` is half-true: no shipped test reaches `liveAdapter` at all, so "the real adapter keeps its coverage in the subprocess tests" names coverage that does not exist.** §9.3's rejection paragraph closes with "the shipped subprocess tests (`__tests__/cli.test.js`) remain the place the real ladder and the real adapter are exercised, which is the division of labour those tests already have", and §12.2's fake row repeats it with three addresses (`__tests__/cli.test.js:86`, `:102`, `:114`). The **ladder** half checks out — but all three cited tests are *refusal* tests (`--plugin-root` pointed at an empty dir; `:86`, `:102`, `:114`), which return at `bin/pdlc.mjs:407`/`:374` **before** `liveAdapter` is ever called. I walked the rest of the file: every other test either takes the `--dry-run` branch (`:379`, `:411`), which builds `inertTransport` (`:149`) and returns, or is a usage error, `doctor`, or `hello`. `liveAdapter` (`:279-298`) has **no** caller in any test — `grep -l "liveAdapter\|createTransport" __tests__/` misses `cli.test.js` entirely, and `transport-cli.test.js` unit-tests `createTransport` directly, never through a command body. This is not a regression the feature introduces (the leg never covered it either) and it falsifies no specified oracle, hence Medium not High — but it is a stated safety net a PLAN author or implementer may reasonably lean on. Fix is one clause, not new work: say that the **ladder** keeps its subprocess coverage at those three addresses, and that `liveAdapter` is **uncovered at HEAD and stays so** — a known gap this feature does not widen — rather than implying it is covered elsewhere | §9.3 (exception 2, the rejected-alternative paragraph), §12.2 (gate-stubs row) |
| F-46 | Low | Local | **Two citation slips in the new gate material, both landing inside the right function but on the wrong line.** (1) §9.3 says "`--cwd` reaches `liveAdapter` only (`bin/pdlc.mjs:283`)" — `:283` is `env: process.env` inside the `createTransport` call; the `--cwd` read is `:280` (`path.resolve(readFlag(argv, "cwd") || process.cwd())`). (2) §9.3 and §12.1 both give the dev-side `liveAdapter` call site as `:382`; it is `:383` (`:382` is the `formatStartup` loop). Neither changes a claim — the surrounding prose is correct — but v0.8's F-42 established that this document's addresses get re-derived rather than nudged, and both are one edit | §9.3 (exception 2, gate bullets), §12.1 (production-path row) |

## Questions

| ID | Question |
|----|---------|
| Q-23 | The two gate values are pinned `===` `cli.mjs`'s **own** exports, which catches the swap (`startupFor: liveAdapter`) but cannot see a `startupFor` that stopped calling `runStartupChecks` — unlike the three runners, pinned across a module boundary to `run.mjs`'s exports. §9.3 acknowledges the swap case; is it worth one sentence naming the residual gap too, so a later reader does not read the five pins as five equally strong ones? Not a finding — the pin is as strong as a same-module pin can be |
| Q-24 | With the gates stubbed, the process-entry leg still executes `emitReport`, which reads `process.env.ANTHROPIC_BASE_URL` (`bin/pdlc.mjs:333`) and writes a JSON line to stdout. Nothing asserts on it, so this is harmless — but is stdout also captured/restored alongside `stderr` and `process.exitCode`, or deliberately left to the runner's own capture? §9.3's rule names two of the three |

## Positive Observations

- **F-43 was fixed by moving the seam, not by adding an assertion around the
  hazard.** The revision could have pinned env vars and called it hermetic;
  instead it found the two gates, widened the seam past them, and wrote down
  the silent-zero shape it was closing — naming it as TE F-39 "one level out",
  which is exactly the right diagnosis. The rejected alternative is recorded
  with its actual cost (four ambient preconditions for a leg whose question is
  what the command body put in an argument object), so the next reader can
  reopen the decision on evidence rather than re-derive it.
- **Naming each stub's return shape is the detail that makes the leg
  writable.** A recorder returning `undefined` throws *inside* the command body
  rather than failing an assertion — a genuinely confusing failure mode — and
  §9.3 pre-empts it field by field. I checked every field against the lines
  that read them and found no decoration and no omission; `stampReport`'s
  totality (`lib/report.mjs:111`) is what saves the `passes: []` case, and the
  spec's shape happens to be exactly right there.
- **The per-leg key table turns a likely copy-paste bug into a documented
  fork.** `captured[i].provenance` at process entry versus
  `captured[i]._provenance` at injection level, plus the observation that the
  plausible repair is itself red at `PROP-PARITY-12` — that is the rare kind of
  guidance that predicts the wrong turn and prices it.
- **F-44's fix asserts the premise on the leg that depends on it.**
  `captured.length === 2` plus a comparison against a *named member* of a
  closed set, chosen so a decayed fixture lands on a different member rather
  than on a missing field. That distinction — wrong value, not absent value —
  is why the assertion cannot rot into an absence oracle.
- **PM Q-01's answer generalises into a rule rather than a fix.** Capture and
  restore `process.exitCode` and `stderr` in a `finally` around every `main()`
  call, and use a dynamic `await import()` so the inert-import observation
  happens inside its measurement window. Stating that test registration order
  is *not* load-bearing is the property worth having in a file two tasks in two
  batches write, and it is stated as a property, not as a convention.

## Recommendation

**Approved with minor changes** — no High findings.

Both round-8 findings are resolved, and F-43's fix is the one I hoped for: the
seam moved past the two gates that actually stand between `main()` and any
runner, capture counts are asserted before capture contents, and the
silent-zero failure mode is written down rather than merely avoided. I
re-resolved about thirty citations across the changed regions and walked
`cmdQueue`'s loop branch statement by statement with §9.3's stubs in hand —
the recipe executes, including the `passes: []` case that would have thrown
against a less total `stampReport`. Nothing previously approved regressed.

The two findings left are both improvable-in-place, neither gates
implementation. F-45 is a justification sentence that names coverage which does
not exist (`liveAdapter` has no test caller at HEAD); the honest version —
"ladder covered at those three addresses, adapter uncovered and not widened by
this feature" — is stronger than the current one, because it stops an
implementer from trusting a net that is not there. F-46 is two line numbers.
Both fit in one pass with F-45's clause and F-46's two addresses; neither
requires re-opening a decision.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
