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


### Review rounds by document type

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-RR-01 | A document type's reported value must be the **highest round index present on disk across all roles** — one number per type. Given a test-engineer review at round 5 and a product-manager review at round 3 for the same type, the row must read exactly `5`: not `8` (a sum), not a per-role breakdown, not a range. | Functional | unit-seamed | REQ-STATS-03, BR-05, AT-07; TSPEC §4.3; PLAN T-04/T-13 |
| PROP-RR-02 | The un-suffixed basename `CROSS-REVIEW-{role}-{DOCTYPE}.md` must count as round 1: a type whose only file is un-suffixed reads exactly `1`, never `0`. | Data Integrity | unit-seamed | BR-05, AT-08; PLAN T-04 |
| PROP-RR-03 | The reported value must be the driver's `deriveRoundWindow(...).startIndex` **minus one**. Falsified positively by the real-path literals: `docs/completed/pdlc-advisory-wave-gate/` reads `6` (the mutant reads `7`) and `docs/completed/pdlc-headless-engine/` reads `13` (the mutant reads `14`) — both verified present at HEAD as `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v6.md` and `CROSS-REVIEW-software-engineer-TSPEC-v13.md`. | Data Integrity | integration-fs | BR-05, AT-09, AT-10; TSPEC §6.6 kill map; PLAN T-18/T-26 |
| PROP-RR-04 | A basename beginning `CROSS-REVIEW-` whose parse fails for any reason **other than** `not_cross_review` must be excluded from every round count **and** listed by name in the malformed list. A basename whose parse returns `not_cross_review` — the feature's own `REQ-*.md`, `LEARNINGS-*.md`, `POSTMORTEM-*.md`, `HANDOFF-PROMPT.md`, `MUTATION-EVIDENCE-*.md` — must appear in neither. Both halves asserted together: an implementation that lists everything, and one that lists nothing, must each fail. | Data Integrity | unit-seamed | REQ-STATS-03, BR-06, EC-05, AT-09; TSPEC §3.2; PLAN T-04 |
| PROP-RR-05 | Grammatical-but-out-of-catalogue basenames must land in the malformed list. Over `docs/completed/pdlc-advisory-wave-gate/` — which carries exactly four `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` files at HEAD — all four basenames must be listed by name, no six-type row's count may reflect them, and the `TSPEC` row must still read `6`. | Data Integrity | integration-fs | BR-06, AT-09; PLAN T-18 |
| PROP-RR-06 | The malformed list must be derived from a **separate direct pass** of `parseReviewFilename` over the listing, not from `deriveRoundWindow`'s `skipped` array: a feature whose one document type is `unmeasurable` must still report its malformed basenames, because the driver's `ok:false` collision branch returns early and carries no `skipped`. Falsified by one fixture that is simultaneously collided and malformed. | Data Integrity | unit-seamed | BR-06, BR-07; TSPEC §3.2 note 1; PLAN T-04 |
| PROP-RR-07 | Where one role carries two files both claiming round 1 (un-suffixed plus `-v1`), that document type must report exactly `state: "unmeasurable"`, `rounds: null`, `collidingRole` equal to the colliding role's slug, and the command must still exit 0. Not `0`, not `harvested`, not an error. | Error Handling | unit-seamed | REQ-STATS-03, BR-07, EC-06, AT-25; PLAN T-04 |
| PROP-RR-08 | A collision must poison only its own row. In AT-25's fixture the other five rows must read exactly `3` (`REQ`), `2` (`FSPEC`), `5` (`PLAN`), `1` (`PROPERTIES`), `4` (`DECISIONS`) — five stated literals, not "unchanged", so a transcription tautology cannot stand in for the assertion. | Data Integrity | unit-seamed | BR-07, AT-25; PLAN T-04 |
| PROP-RR-09 | A document type with no cross-review file must report exactly `0` when no `LEARNINGS-{feature}.md` is present, and exactly `state: "harvested"`, `rounds: null` when one is. The two must be distinguishable by state alone, never collapsed. | Functional | unit-seamed | REQ-STATS-03, REQ R-6, BR-08; PLAN T-04 |
| PROP-RR-10 | The harvested test must be applied **per document type, not per feature**. Over `docs/completed/pdlc-headless-engine/` — `LEARNINGS-pdlc-headless-engine.md` present, exactly one surviving cross-review — the `TSPEC` row must read `13` while the other five read `harvested`, in one table. | Data Integrity | integration-fs | BR-08, EC-07, AT-10; PLAN T-18 |
| PROP-RR-11 | `unmeasurable` must be tested **before** `harvested`: a directory that is both collided and harvested must report `unmeasurable`, never `harvested`. This is a dedicated fixture, because AT-25's own *Given* names no `LEARNINGS` file and cannot falsify the branch order. | Data Integrity | unit-seamed | BR-07, BR-08; TSPEC §4.3, §6.6 kill map; PLAN T-04/T-26 |
| PROP-RR-12 | The review-rounds metric must always carry exactly six rows — `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS` — in that order, in both modes, over every input including an empty directory. A row set derived from the files present could not express `harvested` or `0` at all. | Contract | unit-render | BR-09, AT-01; TSPEC §4.1; PLAN T-06 |
| PROP-RR-13 | `REVIEW_DOC_TYPE_ROWS` must be set-equal, in both directions and in order, to the doc types the driver actually accepts — recovered behaviourally, because `REVIEW_DOC_TYPES` in `pdlc/workflows/orchestrate-dev.js` is declared `const`, not `export const`. The probe must use a **role slug** (`software-engineer`), not a skill id: `parseReviewFilename` returns `bad_role` before it reaches the doc-type test, so an `se-review` probe would be green for the wrong reason. | Contract | unit-pure | TSPEC §3.3, §6.4; FSPEC §7.4 A-3; PLAN T-08 |

### DoD rounds

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-DOD-01 | The DoD metric must report the **highest version N** among `CODE_REVIEW-{feature}-v{N}.md` files. Over `docs/completed/pdlc-loop-economics/`, which carries exactly `CODE_REVIEW-pdlc-loop-economics-v1.md` and `-v2.md` at HEAD, the value must be exactly `2` — not `3` (the driver's next-index return, `return max + 1` in `deriveDodRoundIndex`) and not a file count. | Data Integrity | integration-fs | REQ-STATS-04, BR-10, AT-11; PLAN T-18/T-26 |
| PROP-DOD-02 | A feature with no matching `CODE_REVIEW` file and no `LEARNINGS-{feature}.md` must report exactly `0`. | Functional | unit-seamed | BR-10; PLAN T-04 |
| PROP-DOD-03 | Where `LEARNINGS-{feature}.md` is present **and** no basename matching the version grammar remains, the metric must report `state: "harvested"`, `rounds: null`. Where any matching file survives, the measured highest version must win over `harvested`. Both legs asserted in one test, so an implementation that always reports `harvested` under a `LEARNINGS` file fails. | Functional | unit-seamed | REQ-STATS-04, BR-11, AT-12; PLAN T-04 |
| PROP-DOD-04 | Leftovers that begin `CODE_REVIEW-` but fail the version grammar — a `-draft` suffix, another feature's name — must contribute nothing, must **not** be reported as malformed (the DoD side has no malformed bucket), and must not hold the harvested state open. A directory carrying `LEARNINGS`, `CODE_REVIEW-{feature}-draft.md` and `CODE_REVIEW-{other}-v2.md` must read `harvested`; a directory carrying `CODE_REVIEW-{feature}-v2.md` alongside `CODE_REVIEW-{feature}-draft.md` must read `2` with an empty malformed list. | Error Handling | unit-seamed | REQ-STATS-04, BR-11, EC-16, AT-12, AT-28; PLAN T-04 |

## Oracles

*(pending)*

## Fixtures

*(pending)*

## Coverage Matrix

*(pending)*

## Gaps and Open Items

*(pending)*
