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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
