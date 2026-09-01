# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** implementation diff of `feat-pdlc-stats` against `main` (production code: `pdlc/workflows/lib/stats.mjs`, `pdlc/engine/bin/cli.mjs`), verified against `docs/pdlc-stats/REQ-pdlc-stats.md` v1.7 and `FSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Scope and Method

Product lens only: does the shipped code deliver REQ-STATS-01…09 as written, without scope creep,
and is each operator-visible artifact proven at the production caller that assembles it?

What I read and ran:

- `pdlc/workflows/lib/stats.mjs` (601 lines, new) and the `pdlc stats` additions to
  `pdlc/engine/bin/cli.mjs` (`USAGE` line, `FLAGS_BY_COMMAND.stats`, `statsParsers()`,
  `statsIo()`, `cmdStats`, the `case "stats"` arm).
- The nine test files added or touched under `pdlc/engine/__tests__/` and
  `pdlc/workflows/__tests__/`.
- `REQ-pdlc-stats.md` v1.7 §5 (all nine ACs) and §4 (C-1…C-5), and `FSPEC-pdlc-stats.md` §8
  (BR-01…BR-30) and §6 (AT-01…AT-28) for the token/layout choices REQ O-1 delegates.
- The driver parsers the feature is required to defer to (REQ C-5):
  `deriveRoundWindow` (`pdlc/workflows/orchestrate-dev.js:10192`),
  `deriveDodRoundIndex` (`orchestrate-dev.js:12384`),
  `parseResolvedMarker` (`orchestrate-dev.js:7601`).

What I executed:

- `cd pdlc/engine && npm test` — 921 pass, 0 fail, 2 skipped.
- `cd pdlc/workflows && npm test` — 163 suites, 5116 pass, 0 fail.
- The real binary, end to end, against this repository and against hand-built fixture trees
  outside it (`node pdlc/engine/bin/cli.mjs stats …`), to confirm each AC's operator-visible
  output rather than inferring it from a unit test.

Every finding below cites either a changed line or a command I ran and its output.

## Requirement-by-Requirement Trace

For each AC: the production caller that assembles the operator-visible artifact, the test that
drives **that** caller, and my own live run.

| AC (P) | Production assembler | Test driving that caller | Live check | Verdict |
|---|---|---|---|---|
| REQ-STATS-01 human table (P0) | `cmdStats` → `runStats` → `renderSingleHuman` (`pdlc/workflows/lib/stats.mjs:514`) | `pdlc/engine/__tests__/stats-cli.test.js:284` — `main(["node","pdlc","stats",fixture.featureName,"--cwd",fixture.root])` | `node pdlc/engine/bin/cli.mjs stats pdlc-stats` printed all four metric blocks | Met |
| REQ-STATS-02 `--json` (P0) | `cmdStats` → `runStats` → `renderJson` (`stats.mjs:585`) | `stats-cli.test.js:298` in-process **and** `stats-cli.test.js:193-196` real `spawnSync` of `bin/cli.mjs`; key set pinned at `pdlc/engine/__tests__/stats-read-only.test.js:214-218` | one well-formed document on stdout, nothing else | Met; oracle gaps F-02, F-03 |
| REQ-STATS-03 review rounds (P0) | `computeReviewRounds` (`stats.mjs:220-244`), deferring to `deriveRoundWindow` (`pdlc/workflows/orchestrate-dev.js:10192`) | driven through `main()` at `stats-cli.test.js:284/298` | live run reported `REQ 9 / FSPEC 12 / TSPEC 11 / PLAN 7 / PROPERTIES 7 / DECISIONS 12`, and listed `CROSS-REVIEW-product-manager-REVIEW-v1.md` plus the two `-IMPLEMENTATION-` files as `malformed` | Met |
| REQ-STATS-04 DoD rounds (P0) | `computeDodRounds` (`stats.mjs:248-253`) via `deriveDodRoundIndex` (`orchestrate-dev.js:12384`) | same | `DoD rounds 0` on this feature | Met except F-05 |
| REQ-STATS-05 halts (P0) | `computeHalts` (`stats.mjs:257-273`) via `parseResolvedMarker` (`orchestrate-dev.js:7601`) | same | `Halts none` here; `Halts=2 (2 resolved)` for `pdlc-advisory-wave-gate` in the live fleet run | Met |
| REQ-STATS-06 byte ratio (P0) | `computeByteRatio` (`stats.mjs:277-300`) | same | `Byte ratio 4.22 (process 1856978 B / spec 439983 B)` | Met |
| REQ-STATS-07 fleet mode (P1) | `discoverFeatures` (`stats.mjs:339`) + `buildReport`'s fleet branch (`stats.mjs:431-440`) → `renderFleetHuman` (`stats.mjs:549`) | **none** — see F-01 | `node pdlc/engine/bin/cli.mjs stats` produced the fleet report, exit 0 | Behaviour met, **unproven at the production caller** (F-01) |
| REQ-STATS-08 read-only (P0) | `statsIo()` (`pdlc/engine/bin/cli.mjs`, four members, no write member) | `stats-read-only.test.js:199-218` (AT-21), `:222-239` (AT-22a), `:242-256` (AT-22b) | snapshot pair green in the suite | Met for the covered legs; F-04, F-06 |
| REQ-STATS-09 unknown feature (P0/P1) | `buildReport`'s `not_found` arm (`stats.mjs:411-418`) | `stats-cli.test.js:225` (human) and `:233` (`--json`); `stats-read-only.test.js:227` pins the exact error key set, `reason`, and echoed feature | exit 1, error object, no partial success document | Met |

**Scope compliance.** I found no behaviour in the shipped code that the REQ/FSPEC does not authorise.
`--cwd` is not in REQ-STATS-01's `pdlc stats {feature}` wording, but it is an accepted flag under
FSPEC BR-01's closed surface and is what makes the read-only snapshot tests addressable; it is
authorised, not creep. The flag set is genuinely closed — `--dev`, `--plugin-root` and `--dry-run`
are each refused (`FLAGS_BY_COMMAND.stats = ["json","cwd"]`, `bin/cli.mjs`), pinned at
`stats-cli.test.js:124/133/142`.

**Engine channel.** `pdlc stats` is only useful to an operator if it ships. `lib/stats.mjs` is
vendored in all three places that decide that: `pdlc/engine/scripts/prepack.mjs:25`,
`pdlc/engine/scripts/publish-preflight.mjs:226`, `pdlc/engine/scripts/fixture-machine.mjs:431`.
Operator documentation landed too — `pdlc/README.md:228` and `pdlc/OPERATIONS.md:262-284`.

**No P0 or P1 requirement is silently omitted.** Every one of the nine is implemented and
observably correct on a live run. Every finding below is about proof, or about one edge the code
reads differently from its own rule — none is a missing capability.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
