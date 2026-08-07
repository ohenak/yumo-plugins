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

_placeholder_

## 3. Pre-flight gate and baseline status

_placeholder_

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
