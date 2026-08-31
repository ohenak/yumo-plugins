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

61 properties in twelve domains. Categories are the skill's table (Functional, Contract, Error
Handling, Data Integrity, Integration, Security, Idempotency, Observability); levels are
TSPEC §6.2's six (`unit-pure`, `unit-seamed`, `unit-render`, `integration-fake`, `integration-fs`,
`process`).

### CLI surface and exit codes

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-CLI-01 | `parseStatsArgv` must return `{ok:true, feature, json, cwd}` for every argv drawn from the closed surface `[feature] [--json] [--cwd <path>]`, and `{ok:false, message}` for every other argv, and must never throw for any string array — including `[]`, an argv of only flags, and an argv carrying non-UTF-8-shaped tokens. | Contract | unit-pure | REQ-STATS-02, BR-01; TSPEC §3.3; PLAN T-03/T-12 |
| PROP-CLI-02 | `pdlc stats {feature} {second}` must exit 1, write a usage message naming the offending second positional to stderr, and write **nothing** to stdout, in both human and `--json` mode. | Error Handling | process | BR-01, EC-08, AT-24; TSPEC §5 row 2; PLAN T-09 |
| PROP-CLI-03 | Each of `--dev`, `--plugin-root {path}`, `--dry-run`, and `--cwd` with no following value must exit 1 with a stderr usage message and empty stdout — `--dev` and `--plugin-root` specifically, because `pdlc/engine/bin/cli.mjs:168`'s `doctor: ["plugin-root","cwd","allow-api-key-billing","dev"]` row is the neighbour a copied `stats` row would inherit them from. | Contract | process | BR-01, AT-24; TSPEC §3.4; PLAN T-09 |
| PROP-CLI-04 | `pdlc stats --json` and `pdlc stats {feature} --cwd {path}` must be **accepted** (exit 0 on a reportable tree), so PROP-CLI-03's refusals are not satisfied by a `stats` row that refuses everything. | Functional | process | BR-01, AT-24; PLAN T-09 |
| PROP-CLI-05 | `FLAGS_BY_COMMAND.stats` must be set-equal to `["json","cwd"]` — no more, so a later `--force` cannot arrive without an FSPEC edit; and `json` must **not** be a member of `VALUE_FLAGS`, so `--json` consumes no following token. | Contract | unit-pure | BR-01; TSPEC §3.4; PLAN T-10/T-17 |
| PROP-CLI-06 | Every `stats` invocation must set `process.exitCode` to exactly `0` or `1`; the value `2` must never be produced on any path, and no `stats` code path may call `emitReport` — the only producer of `2` in `pdlc/engine/bin/cli.mjs`. | Contract | process | BR-29; TSPEC §3.5; PLAN T-09/T-10 |
| PROP-CLI-07 | `cmdStats` must resolve `cwd` exactly once, at its own edge, from `--cwd` or `process.cwd()`; no function below `cmdStats` may read `process.cwd()`, `process.env` or any other ambient process state. Falsified by a test that runs `runStats` with an injected root while `process.cwd()` points elsewhere and asserts the report is of the injected root. | Contract | integration-fake | TSPEC §3.4; DEC-STATS-01; PLAN T-07/T-17 |
| PROP-CLI-08 | An unexpected throw anywhere beneath `cmdStats` — including from the dynamic import inside `statsParsers()` — must produce a one-line stderr message and exit 1, never a stack trace on stdout and never a truncated JSON document on stdout. | Error Handling | process | TSPEC §3.4, §5 last row; PLAN T-09 |

### Discovery and directory resolution

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-DISC-01 | When `docs/{feature}/` exists, the report must be computed from it and the archived copy must not be read at all: the report over a tree carrying both locations must be **byte-identical** to the report over the same tree with `docs/completed/{feature}/` removed, and the header must name `docs/{feature}`. Byte-identity, not a negative probe — a merged read that deduplicates by basename would pass an "archive not mentioned" check. | Data Integrity | integration-fake | REQ C-2, BR-02, AT-02, EC-02; PLAN T-05/T-14 |
| PROP-DISC-02 | When `docs/{feature}/` is absent and `docs/completed/{feature}/` exists, the report must be produced from the archived directory and the header must name it. | Functional | integration-fake | BR-02; PLAN T-05 |
| PROP-DISC-03 | Only files **directly in** the resolved directory may contribute to any metric: the report over a feature directory carrying a subdirectory of artifact-shaped names must be byte-identical to the report over the same directory with that subdirectory absent. The real shape exists — `docs/completed/pdlc-loop-economics/_evidence/` — so this is not hypothetical. | Data Integrity | integration-fake | BR-03, AT-03, EC-04; TSPEC §4.3; PLAN T-07 |
| PROP-DISC-04 | Fleet discovery must consider immediate **directories** only. A loose file at either root must yield no row, whatever its basename claims — `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/completed/REQ-completed.md` and `docs/completed/QUEUE-HISTORY-rows-0-1.md` are all present at HEAD and none may appear. | Functional | integration-fs | BR-25, AT-18; TSPEC §4.4; PLAN T-05/T-18 |
| PROP-DISC-05 | `NON_FEATURE_DIRS` must be set-equal to `["_queue","_constraints","_decisions","design","requirements","ideas","discarded","completed"]`, asserted against a hand-transcribed literal (never against the module's own export), **and** set-equal to the non-feature directories actually present at this repository's `docs/` root, partitioned by an independent artifact-naming witness rather than by the leading-underscore predicate under test. | Contract | integration-fs | REQ-STATS-07, BR-25, BR-26; TSPEC §6.4; PLAN T-08 |
| PROP-DISC-06 | `completed` must be excluded **as a feature** and traversed **as a container**: no fleet row may be named `completed`, and every directory under `docs/completed/` must appear as a row exactly once. | Functional | integration-fs | BR-25, AT-18; PLAN T-05/T-18 |
| PROP-DISC-07 | A directory at the `docs/` root that is in neither `NON_FEATURE_DIRS` nor recognisable as a feature must surface as an `unclassified` entry — named in the human report's feature list in the same order and marked as such, and a member of the JSON document's top-level `unclassified` array — and must **not** appear as a key of `features`. It must be neither silently reported as a feature nor silently dropped. | Functional | integration-fake | BR-26, AT-19, EC-10; TSPEC §4.4; PLAN T-05/T-06 |
| PROP-DISC-08 | Feature matching must be exact against directory names: no fuzzy, prefix or case-insensitive matching anywhere. On a case-insensitive filesystem two directories differing only in case must yield two distinct rows, and the command must perform no case folding of its own. | Data Integrity | integration-fake | REQ A-1, BR-04, EC-18, AT-18; PLAN T-05 |
| PROP-DISC-09 | Fleet rows must be ordered lexicographically by feature name, and two runs over an unchanged tree must produce byte-identical stdout. | Idempotency | integration-fake | BR-18; PLAN T-07/T-19 |


## Oracles

*(pending)*

## Fixtures

*(pending)*

## Coverage Matrix

*(pending)*

## Gaps and Open Items

*(pending)*
