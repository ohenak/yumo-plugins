# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.1)
**Date:** 2026-08-13
**Iteration:** 1
**Scope:** Testing lens — testability of §4's rules, §5's expected sets, §7's edge cases and §8's
acceptance tests. Every repo path and every "at HEAD" claim below was checked against the working
tree, not against the REQ's or the FSPEC's account of it.

## Grounding performed

| FSPEC claim | Checked against | Result |
|---|---|---|
| §5.1 authored/rendered check names (5 rows) | `.github/workflows/pr-tests.yml:28,78,112,138,196`; matrix `:40-41`, `:87` | **Correct, literally** — including `Generated artifacts **are** in sync`, which is the wording that actually ships. Rendered column consistent with `os: [ubuntu-latest]`, `node: ['20']` |
| §5.2 "the twelve `lib/*.mjs` files" | `pdlc/engine/lib/` | **Correct count** — adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport |
| §5.2 CLI entry `bin/pdlc.mjs`; no `files` field (M-ENG-11) | `pdlc/engine/package.json:6-8`, whole file | **Correct** — `bin: {pdlc: "bin/pdlc.mjs"}`, no `files` key |
| F-1 steps 2–5 "[shipped]" symbols | `handshake.mjs:93` `satisfiesRange`, `:45` `readPluginVersion`, `:131` `REMEDY`, `:144` `checkCompat`; `skills.mjs:54` `PLUGIN_ROOT_ENV`, `:204` `resolvePluginRoot`; `startup.mjs:384` | **Correct** — every named symbol exists at the cited name |
| F-2 step 1 "`pdlc/README.md`'s `## Install in another repo` section" | `pdlc/README.md:132` | **Correct** heading, and it documents the plugin install today (`:138-139`) |
| F-7 step 2 bootstrap pair | `pdlc/workflows/build-runtime.mjs`, `pdlc/hooks/scripts/sync-workflows.sh` | **Correct**, both exist |
| §5.2 "Workflow modules … presence is not optional" | `pdlc/engine/lib/run.mjs:53` — `new URL("../../workflows/orchestrate-dev.js", …)` | **Not true at HEAD**: the modules the engine executes live *outside* the package root. See F-01 |
| F-5 step 7 publish channel (DEC-DIST-05) | `pdlc/engine/package.json:2,4`; `docs/_decisions/DECISIONS-plugin-distribution.md:115-119` | Manifest is `"private": true` and unscoped `pdlc-engine`; the decision requires a **scoped public** package. See F-07 |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
