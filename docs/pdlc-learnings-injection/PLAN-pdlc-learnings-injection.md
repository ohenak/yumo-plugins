---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# PLAN — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **PLAN** — `TSPEC-pdlc-learnings-injection.md` (v0.6); `FSPEC-pdlc-learnings-injection.md` (v0.10); `REQ-pdlc-learnings-injection.md` (v0.9); `DECISIONS-pdlc-learnings-injection.md` |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN[-v{N}].md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-20 |

## Overview

### What is being built

TSPEC §A.1's new region of `pdlc/workflows/orchestrate-dev.js` — twelve symbols (constants,
config parser, pure selection core, IO shell, renderer, injector factory), one attachment in
`dispatchAndVerify`, one conditionally-spread report key in `buildFinalReport` — plus the seven
new jest suites TSPEC §T.5 assigns, one new fixture helper, one committed pre-feature prompt
baseline and the script that captures it.

**This PLAN cites; it does not restate.** Every task row names the TSPEC section that owns the
thing being built. Where a row and the TSPEC disagree, the TSPEC wins and the row is the defect.
Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6 and is referenced by id (`AC-`, `BR-`,
`AT-`, `§`), never copied. What a row states that no upstream document does is *process*: when the
work happens, who owns which file, which test comes first, and what stops.

The work decomposes into **22 tasks across 14 batches**. The shape is dominated by one fact:
almost every production change lands in a single physical file, `pdlc/workflows/orchestrate-dev.js`
(666 KB, 15,311 lines at HEAD), which by batch-safety rule 2 makes the **source lane fully
serial** — one source-writing task per batch, batches 7–14 — while the test, fixture and script
lanes fan out beside it in batches 2–6. TSPEC records this as obligation **T-O-1**, and the
§File-ownership manifest is the mechanical audit it asks for.

### The change surface, verified at HEAD

Every path this PLAN names was checked on `feat-pdlc-learnings-injection`:

| Path | State at HEAD | Owner |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | exists — `MERGE_CONFIG_PATH` (`:48`), `parseAdvisoryConfig` (`:1964`), `reviewLoop` (`:7266`), `dispatchAndVerify` (`:8862`), `main` default export (`:12022`), `buildFinalReport` (`:15240`) | modified |
| `pdlc/workflows/consolidate-learnings.js` | exists — `LS_FILES_ARGV` module-private (`:1338`), `enumerateCorpus` exported (`:1349`) | **read-only**, never modified |
| `pdlc/workflows/__tests__/helpers/seams.js` | exists — `fakeFs` (`:245`), `fakeGit` (`:413`) | read-only |
| `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` | exists — re-exports `mergeDoubles.js`'s `fakeGit` (`:35`) | read-only |
| `pdlc/workflows/__tests__/helpers/learningsFixtures.js` | **new** | LI-02 |
| the seven suites of TSPEC §T.5, plus `learningsSuiteMap.test.js` and `learningsCaptureScript.test.js` | **all new** — no file of any of these names exists under `pdlc/workflows/__tests__/` | LI-03, LI-07…LI-14 |
| `pdlc/workflows/__tests__/fixtures/learnings-baseline/` | **new** (the `fixtures/` directory exists; this subtree does not) | LI-06 |
| `scripts/capture-learnings-baseline.mjs` | **new, and so is its directory** — the repository root has no `scripts/` at HEAD. TSPEC §T.3 pins the path; this PLAN schedules its creation rather than relocating it | LI-05 |
| `.gitignore` | exists (599 B); `git check-ignore -v .baseline-worktree` exits non-zero, which is TSPEC §T.3's measured finding and LI-03's red | LI-04 |
| `pdlc/workflows/dist/pdlc-cli.mjs` | exists (671 KB), generated | **no task** — see below |

**`dist/` has no owning task, and that is deliberate.** The consuming arrangement runs
`node pdlc/workflows/build-runtime.mjs` as the wave gate's `postWaveCommand` and stages
`pdlc/workflows/dist/` via `postWavePathspecs` (`.claude/pdlc.config.example.json`), so the
regenerated artifact is produced and staged **once per wave by the gate**, not by a task. Listing
it as a task-owned source file would create a same-batch multi-writer on the one file every source
task touches. No task edits `dist/` by hand; a hand edit is a halt condition (§Verification).

### Test-name namespacing — mandatory

Every jest test this feature adds is named **`LI-AT-{N}`**, never bare `AT-{N}`. The collision is
measured, not hypothetical: `pdlc/workflows/__tests__/documentOracles.test.js` at HEAD carries
`test("AT-22 [red-until-L-06]: …")` and `test("AT-23: coveredViolations(fixture root) …")` from a
prior feature, and this feature's AT-22 and AT-23 are different assertions entirely. TSPEC-local
cases follow the same rule: `LI-T-PIN-1`, `LI-T-RETRY-1…3`, `LI-T-IGNORE`, `LI-T-WORKTREE`,
`LI-T-SUITEMAP`. Throughout this document a bare `AT-{N}` refers to **FSPEC's** numbering; the jest
name is always the `LI-` form.

### Out of scope for this PLAN

The three PROPERTIES obligations TSPEC carries forward — T-O-4 (`orderCorpus` permutation and
strict-weak-ordering), T-O-5 (`selectLearnings` totality) and T-O-6 (`extractInjectableMaterial`
byte/char-safety) — are the test engineer's, authored in PROPERTIES and scheduled by the
orchestrator's Phase P, not by a task row here. T-O-3's live-run measurement is the operator's,
against REQ O-1.

## Batches

## File-ownership manifest

## Dependencies

## Traceability

## Verification

## Open questions and upstream errata
