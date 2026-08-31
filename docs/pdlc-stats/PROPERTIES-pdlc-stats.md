---
feature: pdlc-stats
---

# PROPERTIES — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` (`docs/pdlc-stats/REQ-pdlc-stats.md`, `FSPEC-pdlc-stats.md`, `TSPEC-pdlc-stats.md`, `DECISIONS-pdlc-stats.md`, `PLAN-pdlc-stats.md`) |
| Downstream | IMPL tests (PLAN T-03…T-11, T-18, T-19, T-20, T-26) |
| Cross-Reviews | `CROSS-REVIEW-{role}-PROPERTIES[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | te-author | 1.0 | 2026-08-31 |

## Overview

**What this document is.** The proof system for `pdlc stats [feature] [--json] [--cwd <path>]`:
every property an implementer must be able to falsify before the feature is done, each traced to a
REQ acceptance criterion, an FSPEC business rule or acceptance test, and a TSPEC section. It adds no
behavior. Where a property looks like a new rule, it is a restatement of an upstream clause in
falsifiable form; where the upstream is silent, §Gaps and Open Items says so rather than inventing.

**Subject under test.** Six exported pure functions plus two frozen constants in the new
`pdlc/workflows/lib/stats.mjs` (TSPEC §3.3: `parseStatsArgv`, `discoverFeatures`,
`computeFeatureStats`, `runStats`, `renderHuman`, `renderJson`; `REVIEW_DOC_TYPE_ROWS`,
`NON_FEATURE_DIRS`), and four additive edits to `pdlc/engine/bin/cli.mjs` (TSPEC §3.4: a
`FLAGS_BY_COMMAND` row, a `case` in `main()`'s `switch`, a `USAGE` line, and the
`cmdStats` / `statsIo` / `statsParsers` functions). Neither file exists in the `stats` form yet:
`pdlc/workflows/lib/stats.mjs` is absent at HEAD, and `pdlc/engine/bin/cli.mjs:168`'s
`FLAGS_BY_COMMAND` carries exactly four rows (`dev`, `queue`, `doctor`, `decide`) with no `stats`.

**Verified premises.** Everything this document assumes about shipped code was checked at HEAD, not
read from a document:

| Premise | Evidence |
|---|---|
| The four driver classifiers exist and are exported | `pdlc/workflows/orchestrate-dev.js` — `parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, each declared `export function` |
| `parseReviewFilename` validates the role before the doc type | its `bad_role` return precedes the `REVIEW_DOC_TYPES.includes(docType)` test, so a probe built from a skill id (`se-review`) never reaches the doc-type check (TSPEC §6.4) |
| The driver's doc-type catalogue is module-private | `const REVIEW_DOC_TYPES = Object.freeze(["REQ","FSPEC","TSPEC","PLAN","PROPERTIES","DECISIONS"])` — declared `const`, not `export const`, so `REVIEW_DOC_TYPE_ROWS` must be a local constant plus a drift oracle (TSPEC §3.3) |
| `parseResolvedMarker` is fail-closed on absent / duplicated / unparseable markers | it returns `{ok:false, reason:"absent"}`, `"duplicated"` and `"unparseable"` respectively, and `{ok:true,resolved}` only for a lone `yes`/`no` (case-folded) |
| `deriveDodRoundIndex` returns the **next** index | its final statement is `return max + 1`, which is why every metric conversion is `- 1` (FSPEC BR-10) |
| `cwd` is already a value flag; `json` is not | `VALUE_FLAGS` (`pdlc/engine/bin/cli.mjs:141`) lists `cwd` and no `json` |
| `doctor` accepts `--dev` and `--plugin-root` | `doctor: ["plugin-root","cwd","allow-api-key-billing","dev"]` — the neighbour row AT-24 exists to stop being copied |
| The capture helper the process-level tests reuse exists | `captureRun` in `pdlc/engine/__tests__/loop-cli.test.js` |
| The structural-count precedent exists | `pdlc/engine/__tests__/bin-guard-structure.test.js` |
| The in-tree scratch write the read-only oracle must tolerate exists | `mkdtempSync(path.join(SCRATCH_ROOT, ".tmp-capture-driver-"))` in `pdlc/workflows/__tests__/learningsCaptureScript.test.js` |
| `fast-check` is available for the property-based tests | `pdlc/workflows/package.json` devDependency `"fast-check": "^4.9.0"` |
| The vendoring enumeration this feature co-changes is real | `export const MODULE_NAMES = [` in `pdlc/engine/scripts/prepack.mjs:20` |

**Test pyramid budget.** No E2E test is proposed and none is needed: the widest level this feature
reaches is TSPEC §6.2's *Process* level, which runs `main([...])` in-process with stdout/stderr
captured — no spawn, no network, no fixture repository outside a temp root. The distribution is
therefore many unit properties (argv, metric branch table, renderers, discovery), a moderate
integration band (`runStats` over `fakeStatsIo`, and `runStats` over the real `node:fs` seam against
this repository's archive), and six process-level properties that exist only because flag closure,
stdout emptiness and exit codes are not observable below the CLI edge.

**Standing constraints this feature inherits.** From `docs/_constraints/DOMAIN-CONSTRAINTS.md`:
DC-01 (a contract crossing a component boundary is closed and total) drives PROP-CLI-01 and
PROP-ERR-01; DC-04 (an oracle is a pure function of an injected root) drives the `fakeStatsIo`
discipline in §Fixtures; DC-14 (an oracle never sources its expected value from the code under test)
drives every hand-transcribed literal in §Oracles; DC-15 (an oracle that walks the live tree
measures the host, not the diff) drives PROP-RO-01's snapshot-pair construction; DC-18 (a claim
carried by N documents needs an N-document guard) drives PROP-DRIFT-05's vendoring co-change
oracle; DC-06 (remediation is verified by mutation, not by diff) drives §Oracles' kill map.

**Reading the property rows.** Each carries an id, the falsifiable statement, its category and test
level, and the upstream clause it derives from. `Level` is the *cheapest* level that can falsify it
— pushing a property down is a claim, and where a property is placed higher than it looks like it
needs, §Oracles says why.

## Properties

*(pending)*

## Oracles

*(pending)*

## Fixtures

*(pending)*

## Coverage Matrix

*(pending)*

## Gaps and Open Items

*(pending)*
