# PLAN — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-06 |

## 1. Overview

Build the consolidation pass specified by `TSPEC-pdlc-consolidation-agent` v1.7: **one new workflow
module** (`pdlc/workflows/consolidate-learnings.js`), the two adapter seams it needs, a fourth
built bundle, and fifteen jest suites that falsify it. Twenty-three of the thirty-three tasks below
touch only files this feature creates; the remaining ten edit shipped files, and each of those is a
**single** owning task for the reason TSPEC §13.3 gives — one physical file, one writer.

**What ships**

| Deliverable | Where | TSPEC |
|---|---|---|
| the pass | `pdlc/workflows/consolidate-learnings.js` (new) | §3.1, §4, §7, §9, §10 |
| two new seams + a composition root | `pdlc/workflows/runtime-adapter.js` (`rtEnvPresent`, `rtMakeTempDir`, `rtConsInjections`, `rtWriteFile`'s absolute-path widening) | §5.3, §5.6(a) |
| the resolver widening | `pdlc/workflows/orchestrate-dev.js` (`resolveAdvisoryRung`'s optional `skill`, `gitWithLockRetry` exported, two `mergeCommandFor` surfaces) | §8.1, §4.2, §9.2 |
| a fourth bundle | `pdlc/workflows/build-runtime.mjs` → `dist/consolidate-learnings.bundle.js` + a `distribution-manifest.json` row | §8.2, §8.3 |
| the hook's observation channel | `pdlc/hooks/scripts/nudge-consolidation.sh` (`CORPUS_GLOBS`, the two-region predicate, the `pending` fall-through, the env-gated `PDLC_PENDING:` stderr line) | §3.2, §7.1, §13.1 row 12 |
| the ignore rule | `.gitignore` (`docs/_decisions/.consolidation-lock`, comment line adjacent) | §3.3 |
| two prompt contracts | `pdlc/skills/consolidate-learnings/SKILL.md`, `pdlc/skills/harvest-learnings/SKILL.md` | §3.2 |
| fifteen suites + one doubles module | `pdlc/workflows/__tests__/consolidation*.test.js`, `__tests__/helpers/consolidationDoubles.js` | §11, §12.3 |

**Verified against HEAD before this PLAN was written.** Every file in the table above either exists
today (confirmed by `ls`) or is declared new by the task that creates it, and the §5 manifest marks
which is which. The four reused symbols TSPEC §4.2 names are present at HEAD:
`resolveAdvisoryRung` (`pdlc/workflows/orchestrate-dev.js:1833`, already `export`ed),
`MERGE_GUARD_DEFAULTS` (`:48`), `mergeCommandFor` (`:319`, already `export`ed) and
`gitWithLockRetry` (`:8617`, **not** exported today — T11 exports it). `ADVISORY_RUNG_SKILL` is at
`:1797`. On the adapter side `rtShellQuote` is at `runtime-adapter.js:668`, `rtWriteFile` at `:802`,
`rtCheckFile` at `:817`, `rtAppendFile` at `:863`, `rtListFiles` at `:905`, `rtGit` at `:945` and
`rtDevInjections` at `:1086` — the placements TSPEC §5.2 and §13.1 row 13 cite. In
`build-runtime.mjs`, `stripModuleSyntax` is at `:45`, `wrapModule` at `:55`, `QUEUE_META` at `:127`,
`QUEUE_ENTRY` at `:185` and the `bundles` array at `:448`, so T32's edit lands beside existing
declarations rather than inventing machinery.

**Two coverage claims checked against the current suite layout, not assumed.**
(a) `pdlc/workflows/__tests__/` holds 74 `*.test.js` files at HEAD and **none** is named
`consolidation*`, so all fifteen suites in §4 are new files with no merge hazard against a shipped
suite. (b) The two static-scan sets this feature must widen exist where TSPEC §11.3(c) says:
`AT19_SEAM_NAMES` is declared at `__tests__/runtimeBundle.test.js:215` and consumed at `:427`, and
`AWAIT_SCAN_SOURCES` at `:1040` (`["orchestrate-dev.js", "orchestrate-queue.js"]`) and consumed at
`:1054` — neither carries `consolidate-learnings.js`, `_envPresent` or `_makeTempDir` today, which is
exactly the gap T13 closes.

**One coverage claim checked and found *false*, and it is raised upstream rather than absorbed.**
TSPEC §3.2 makes two `SKILL.md` files production edits, and §12.2/§12.3 assign them no falsifying
test. The nearest shipped candidate does not reach them: `__tests__/skillFiles.test.js` ranges over a
hard-coded three-member list — `se-review`, `te-review`, `pm-review` (`:13-17`) — and asserts only
their VERDICT-trailer text. So both edits would ship with no oracle of any kind. §9 records the
erratum; T07/T08 carry a review-only Definition of Done in the meantime and say so in the row.

## 2. Ground rules — status key, RED discipline, batch derivation

**Status key.** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**Batch derivation is mechanical.** `Batch == max(batch of Deps) + 1`; a task with no `Deps` is
batch 1. The dispatcher validates the column against the `Deps` edges and halts on a mismatch, so
the number is a contract, not a lane label. Every number in §4 was re-derived from the row's own
`Deps` cell after the table was written.

**Single-writer-per-batch, source and test alike.** No two tasks carrying the same `Batch` number
create or append to the same physical file. Where a file has several writers — most of all
`pdlc/workflows/consolidate-learnings.js`, which nine tasks write — they are serialised by real
`Deps` edges, which forces the batch split by the rule above. §5's manifest is what makes the
disjointness mechanically auditable.

**How red is carried without a red wave, and why it has to be.** Phase I's gate is script-owned and
unconditional: after every wave the script runs `.claude/pdlc.config.json` →
`implementation.testCommand` and throws a halt when it does not pass
(`pdlc/workflows/orchestrate-dev.js:10136-10143` — `const gate = await
runCommandFn(implConfig.testCommand); if (!gate || gate.ok !== true) { throw haltError(…) }`; the
V-wave repeats it at `:10225-10234`). `testCommand` is one string covering the whole suite — this
repo's is `cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` — so a wave that ends with
any red test **ends the run**, and a genuinely RED-terminal batch is unavailable here.

The discipline is therefore the one this repo already shipped for the advisory tier
(`docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md:207-216`): a 🔴 task **authors its cases inside
`describe.skip` blocks**, one block per green owner, named for that owner
(`describe.skip("T25 — corpus and predicate", …)`). Skipped cases are *reported as skipped*, not as
passed, so the wave gate stays green and truthful. The 🟢 owner's **first** obligation is to
un-skip its own block, and its **last** is that the block passes. A 🟢 task that un-skips a block it
does not own is a rule violation, because that block's symbols do not exist yet.

Red-before-green is therefore still real and still an explicit edge: **every 🟢 row lists its 🔴 row
in `Deps`**, and the 🔴 row references the same test file and names the ATs it authors. The
falsification is observed at un-skip time — the green owner un-skips before implementing, sees the
block fail, then implements. Where a row owes a stronger demonstration (T23's mutation check) the
row says so.

**`[Fake first]`.** Test-double and skeleton creation precede every production-implementation task
for the same component. T01 (the doubles module) and T02 (the module's export surface, frozen
catalogues and throwing stubs) are batch 1 and are edges of everything downstream, per batch-safety
rule 4.

**Paths are subpackage-qualified.** Every `Test File` / `Source File` / manifest cell is written
from the repository root (`pdlc/workflows/__tests__/consolidationPass.test.js`, never
`consolidationPass.test.js`), so the cells are machine-parseable and no bare basename appears.

**The four `dist/` artifacts are not owned by any task.** `pdlc/workflows/dist/` is a per-wave chore
commit driven by `.claude/pdlc.config.json` → `implementation.postWavePathspecs`
(`["pdlc/workflows/dist/"]`, with `postWaveCommand` = `node pdlc/workflows/build-runtime.mjs`), which
is exactly what TSPEC §13.3 asks for. Putting them in a task's `files` cell would double-commit them,
since the wave commit stages `task.files` pathspec-scoped (`orchestrate-dev.js:10151`).

## 3. Pre-flight gate and baseline status

This feature extends a prior-phase baseline: TSPEC §4.2 reuses four `orchestrate-dev.js` symbols
rather than re-authoring them, §11.2 reuses seven shipped test doubles rather than writing new ones,
and §11.3(c) widens two frozen sets that live in a shipped suite. Every one of those is a
**BL-PREREQ**: absent at HEAD, the task that depends on it fails for a reason that looks like its own
bug. **T00 is therefore the first task in the table** and asserts existence only — never the shape a
later task creates.

| BL-PREREQ | Asserted how | Present at HEAD |
|---|---|---|
| `resolveAdvisoryRung`, `mergeCommandFor`, `MERGE_GUARD_DEFAULTS` | imported from `pdlc/workflows/orchestrate-dev.js`; each is already `export`ed | yes — `:1833`, `:319`, `:48` |
| `gitWithLockRetry` | **source-text presence**, not import: it is declared `async function` with no `export` at `:8617`, so T11 must add the keyword before T30 can import it | yes as a declaration, **no** as an export |
| `ADVISORY_RUNG_SKILL` | source-text presence — T11's widening defaults `skill` to it | yes — `:1797` |
| `rtWriteFile`, `rtCheckFile`, `rtAppendFile`, `rtListFiles`, `rtGit`, `rtShellQuote`, `rtDevInjections` | source-text presence in `pdlc/workflows/runtime-adapter.js` (the file is inlined by the build and exports nothing) | yes — `:802`, `:817`, `:863`, `:905`, `:945`, `:668`, `:1086` |
| `stripModuleSyntax`, `wrapModule`, `QUEUE_META`, `QUEUE_ENTRY`, the `bundles` array | source-text presence in `pdlc/workflows/build-runtime.mjs` | yes — `:45`, `:55`, `:127`, `:185`, `:448` |
| `AT19_SEAM_NAMES`, `AWAIT_SCAN_SOURCES` | source-text presence in `pdlc/workflows/__tests__/runtimeBundle.test.js`, **plus** the negative T13 turns positive: neither set carries `consolidate-learnings.js`, `_envPresent` or `_makeTempDir` today | yes — `:215`, `:1040` |
| `fakeFs`, `fakeListFiles`, `fakeGit`, `LIST_FAILURE_VALUES` | imported from `__tests__/helpers/seams.js` | yes — `:243`, `:132`, `:389`, `:58` |
| `fakeGhRun`, `matchKey`, `fakeNow`, `FIXED_NOW_MS`, `fakeSleep`, `GH_SURFACE_NAMES` | imported from `__tests__/helpers/mergeDoubles.js` | yes — `:75`, `:45`, `:259`, `:256`, `:181` |
| `makeAgentDouble` | imported from `__tests__/helpers/advisoryDoubles.js` | yes — `:53` |
| `seeded`, `resolveSeed` | imported from `__tests__/helpers/driftGenerators.js` | yes — `:76`, `:134` |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` `Version` cell reads `1.4` | file read, cell matched | yes — `:7` (`1.4 · 2026-08-06`) |

**One BL-PREREQ is already known-absent, and that is the point of asserting it.** `gitWithLockRetry`
is not exported. T30 imports it (TSPEC §4.2), so T11 adds `export` to the declaration at
`orchestrate-dev.js:8617`. T00 records the absence as **blocking work already scheduled** rather
than promoting it — the promotion rule applies to a symbol nothing in this PLAN repairs.

**The gate branches on `.claude/pdlc.config.json` and asserts a positive in each branch.**
`git ls-files .claude` returns nothing at HEAD: the file is **untracked**, so CI's fresh clone does
not have it while the maintainer's tree does. An unguarded read would go red on
`.github/workflows/pr-tests.yml`'s matrix and halt Phase PUB for a reason unrelated to the diff. So
T00 asserts: (i) file present ⇒ `implementation.postWavePathspecs` contains
`pdlc/workflows/dist/` and `implementation.postWaveCommand` is `node pdlc/workflows/build-runtime.mjs`
— the two settings §2's dist rule depends on; (ii) file absent ⇒ the documented degradation, i.e.
Phase I falls back to the legacy self-report gate, asserted through the shipped parser rather than
skipped. Neither branch is vacuous and neither depends on the operator's tracking decision.

**The gate asserts existence, never shape.** It does not assert that `resolveAdvisoryRung` accepts a
`skill` parameter (T11 creates that), that `rtConsInjections` exists (T12 creates it), or that the
scan sets carry the new members (T13 adds them). A pre-flight that asserted the post-condition of a
task in its own PLAN would be red on a correct tree until that task landed.

## 4. Batches — task table

_placeholder_

## 5. File-ownership manifest

_placeholder_

## 6. Dependencies and ordering notes

_placeholder_

## 7. Integration points

_placeholder_

## 8. Verification and Definition of Done

_placeholder_

## 9. Handed downstream and open items

_placeholder_
