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
| Draft | te-author | 1.2 | 2026-08-31 |

**v1.2 (round 3 revisions).** PROP-RATIO-11 added: the shipped-seam behavioural leg for EC-19 that
PLAN v1.2 gave T-09, at `process` level over an `F-CLI-SYMLINK` temp root, with T-09's trace row,
the `EC-19` and `AT-15` matrix rows and the level distribution moved with it (product-manager F-01).
PROP-RATIO-05 restated whole-file with the boundary-anchored matcher, dropping the `stats`-seam
qualifier PLAN T-10 dropped (product-manager F-02). PROP-ERR-10's falsifier restated honestly and
widened with a `throwOn`-seam sweep, with the matching §Oracles row and a new G-8 recording the
residual (product-manager F-03). PROP-DISC-10's Traces reconciled to `PLAN T-05/T-07`, matching
§PLAN tasks (product-manager F-04), and `F-EXCLUDED-ONLY` restated as directory entries rather than
"a real directory" (product-manager F-05). PROP-RATIO-03's neither-list picked up FSPEC v1.7's
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` member, and PROP-RATIO-06 — which already
pinned that behaviour — was added to the `AT-15` and `BR-16` matrix rows with `BR-16, AT-15` in its
Traces (software-engineer F-01). The §PLAN tasks preamble now says what `(new)` means, since the
first implementation waves have landed ten of the fifteen files.

**Absorbed without an edit (software-engineer F-02).** The finding asks for a §Gaps row marking
PROP-RATIO-08 leg 4 provisional on a REQ-versus-FSPEC dispute over the out-of-catalogue basename.
That dispute no longer exists at upstream HEAD: REQ v1.7's erratum withdraws REQ-STATS-06's
"a grammatical basename outside the driver's catalogue is a survivor" clause outright — "a basename
the catalogue does not recognise counts as no file of its family remaining, so a feature carrying
only those reports **harvested**" — which is the reading PROPERTIES, FSPEC BR-16 and TSPEC §4.3
already assert. PROP-RATIO-08's `REQ-STATS-06` citation is therefore accurate at HEAD and stands,
and a G-row recording a live dispute would now be false. No provisional marking is owed.

**v1.1 (round 1 revisions).** PROP-DISC-10 added for AT-18's excluded-directories-only root and
EC-20's empty report, with the `F-EXCLUDED-ONLY` fixture and the `EC-20`/`AT-18` matrix rows
repointed to it (product-manager F-01, High). PROP-ERR-10 added, pinning BR-30's `reason` catalogue
by set-equality (product-manager F-04). PROP-CLI-03 gained the verbatim `USAGE` line conjunct and
G-4 was narrowed accordingly (product-manager F-03). The `docs/` root measurement corrected to
twenty-one directories and thirteen feature directories in §Fixtures and §Oracles (product-manager
F-02, software-engineer F-01). The REQ coverage table gained an `O-2` row and a statement of why
`A-3`, `O-1` and `O-4` carry none (product-manager F-05, software-engineer F-02); EC-17's coverage
moved into PROP-DISC-04 as an explicit REQ-less-directory conjunct (product-manager F-06);
PROP-DISC-08 restated as a claim about the command rather than the volume (software-engineer F-03).

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

105 properties in thirteen domains. Categories are the skill's table (Functional, Contract, Error
Handling, Data Integrity, Integration, Security, Idempotency, Observability); levels are
TSPEC §6.2's six (`unit-pure`, `unit-seamed`, `unit-render`, `integration-fake`, `integration-fs`,
`process`).

### CLI surface and exit codes

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-CLI-01 | `parseStatsArgv` must return `{ok:true, feature, json, cwd}` for every argv drawn from the closed surface `[feature] [--json] [--cwd <path>]`, and `{ok:false, message}` for every other argv, and must never throw for any string array — including `[]`, an argv of only flags, and an argv carrying non-UTF-8-shaped tokens. | Contract | unit-pure | REQ-STATS-02, BR-01; TSPEC §3.3; PLAN T-03/T-12 |
| PROP-CLI-02 | `pdlc stats {feature} {second}` must exit 1, write a usage message naming the offending second positional to stderr, and write **nothing** to stdout, in both human and `--json` mode. | Error Handling | process | BR-01, EC-08, AT-24; TSPEC §5 row 2; PLAN T-09 |
| PROP-CLI-03 | Each of `--dev`, `--plugin-root {path}`, `--dry-run`, and `--cwd` with no following value must exit 1 with a stderr usage message and empty stdout — `--dev` and `--plugin-root` specifically, because `pdlc/engine/bin/cli.mjs:168`'s `doctor: ["plugin-root","cwd","allow-api-key-billing","dev"]` row is the neighbour a copied `stats` row would inherit them from. The same stderr must carry, verbatim on a line of its own, `  pdlc stats [feature] [--json] [--cwd <path>]` — the `USAGE` line TSPEC §3.4 requires and PLAN T-17 delivers. The conjunct is stated here rather than on PROP-CLI-05 because `USAGE` (`pdlc/engine/bin/cli.mjs`, `const USAGE = [...].join("\n")`) is module-private and reaches an observer only through `checkFlags`' stderr write; at HEAD that stderr carries five command lines (`dev`, `queue`, `decide`, `doctor`, `hello | spike:sdk`) and no `stats` line, so this half is red until T-17 lands. | Contract | process | BR-01, AT-24; TSPEC §3.4; PLAN T-09 |
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
| PROP-DISC-04 | Fleet discovery must consider immediate **directories** only. A loose file at either root must yield no row, whatever its basename claims — `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/completed/REQ-completed.md` and `docs/completed/QUEUE-HISTORY-rows-0-1.md` are all present at HEAD and none may appear. Conversely, a *directory* whose artifacts include no `REQ-{feature}.md` must appear as an ordinary measured row — `docs/pdlc-halt-hardening/`, which holds only `PLAN-pdlc-halt-hardening.md` at HEAD, must be present with its metrics, because a missing REQ is not a discovery criterion (EC-17). Both halves in one test: an implementation that admits loose files, and one that requires a REQ, each fail. | Functional | integration-fs | BR-25, AT-18, EC-17; TSPEC §4.4; PLAN T-05/T-18 |
| PROP-DISC-05 | `NON_FEATURE_DIRS` must be set-equal to `["_queue","_constraints","_decisions","design","requirements","ideas","discarded","completed"]`, asserted against a hand-transcribed literal (never against the module's own export), **and** set-equal to the non-feature directories actually present at this repository's `docs/` root, partitioned by an independent artifact-naming witness rather than by the leading-underscore predicate under test. | Contract | integration-fs | REQ-STATS-07, BR-25, BR-26; TSPEC §6.4; PLAN T-08 |
| PROP-DISC-06 | `completed` must be excluded **as a feature** and traversed **as a container**: no fleet row may be named `completed`, and every directory under `docs/completed/` must appear as a row exactly once. | Functional | integration-fs | BR-25, AT-18; PLAN T-05/T-18 |
| PROP-DISC-07 | A directory at the `docs/` root that is in neither `NON_FEATURE_DIRS` nor recognisable as a feature must surface as an `unclassified` entry — named in the human report's feature list in the same order and marked as such, and a member of the JSON document's top-level `unclassified` array — and must **not** appear as a key of `features`. It must be neither silently reported as a feature nor silently dropped. | Functional | integration-fake | BR-26, AT-19, EC-10; TSPEC §4.4; PLAN T-05/T-06 |
| PROP-DISC-08 | Feature matching must be exact against directory names: `discoverFeatures` must not case-fold, prefix-match or fuzzy-match. A listing containing two names differing only in case must yield two distinct rows, in lexicographic order, and the command must perform no case folding of its own. The claim is about the command, not about the volume it runs on: the two-name listing is supplied by `fakeStatsIo.listDir`, so the property is levelled `integration-fake` and needs no case-sensitive filesystem — on macOS's default case-insensitive APFS the second `mkdir` of such a pair fails `EEXIST` and a real-path fixture could not be built at all. | Data Integrity | integration-fake | REQ A-1, BR-04, EC-18, AT-18; PLAN T-05 |
| PROP-DISC-09 | Fleet rows must be ordered lexicographically by feature name, and two runs over an unchanged tree must produce byte-identical stdout. | Idempotency | integration-fake | BR-18; PLAN T-07/T-19 |
| PROP-DISC-10 | Fleet mode over a `docs/` root that is present, readable and holds **only** excluded directories must produce an empty report and exit 0 — never a refusal, never a gap row, never a `no_docs_root` error. Positively: the human report must carry the same header line as a populated run and an empty feature list; the JSON document must carry `features` set-equal to `{}` and `unclassified` set-equal to `[]`, both keys **present**, not omitted; exit code exactly `0`. The fixture must hold every one of `NON_FEATURE_DIRS`' eight names as a directory entry (`isDirectory` true), not a file, so an implementation that treats "nothing to report" as "nothing to read" and takes EC-09's root-failure branch fails. | Functional | integration-fake | REQ-STATS-07, BR-25, BR-27, EC-20, AT-18 (empty-root leg); PLAN T-05/T-07 |


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

### Halts

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-HALT-01 | Exactly one entry must be reported per distinct phase carrying a `POSTMORTEM-{phase}-{feature}.md` file, with `resolution` classified exactly as `parseResolvedMarker` classifies that file's bytes. Over a temp-root copy of `docs/completed/pdlc-wave-resume/`, whose `POSTMORTEM-PR-pdlc-wave-resume.md` carries the line-leading `RESOLVED: yes` (verified at HEAD, third line of the file), the halt set must be exactly `[{phase:"PR", resolution:"resolved"}]` — asserted as a literal, never re-derived by the code under test. | Functional | integration-fs | REQ-STATS-05, BR-12, AT-13; PLAN T-18 |
| PROP-HALT-02 | The companion fixture — the same file with the marker reading `RESOLVED: no` — must yield `[{phase:"PR", resolution:"open"}]`. The pair is the falsifying unit: an implementation that hard-codes either classification passes one leg and fails the pair. | Functional | integration-fs | BR-12, AT-13; PLAN T-18 |
| PROP-HALT-03 | The resolution must be fail-closed to `open` for every non-`{ok:true, resolved:true}` outcome — absent marker, duplicated markers, unparseable value, and a `readFile` throw at the call site — matching the driver's own `{ok:false}` reasons `absent`, `duplicated`, `unparseable` in `parseResolvedMarker`. Each of the four conditions asserted separately, so a guard covering one does not stand for the rest. | Error Handling | unit-seamed | BR-12, EC-14, AT-14; TSPEC §5; PLAN T-04 |
| PROP-HALT-04 | A basename beginning `POSTMORTEM-` that does not match `^POSTMORTEM-([^-]+)-{escapedFeature}\.md$` must contribute nothing and appear in no list — halts have no malformed bucket. Asserted with `POSTMORTEM-P-some-other-feature.md` added to the temp-root copy, which must leave the halt set at PROP-HALT-01's single entry. | Error Handling | integration-fs | BR-12, EC-15, AT-13; PLAN T-18 |
| PROP-HALT-05 | The phase capture must be `[^-]+`, not a lazy `.+?`: under feature `stats`, a sibling feature's `POSTMORTEM-D-pdlc-stats.md` must yield **no** halt entry, because a lazy capture would match phase `D-pdlc` and mint a halt the feature never had. The feature name must be regex-escaped with the same idiom `deriveDodRoundIndex` uses, so a feature name containing regex metacharacters is never misread as a pattern. | Security | unit-seamed | BR-12; TSPEC §4.3; PLAN T-04 |
| PROP-HALT-06 | The phase id must be taken verbatim, with no catalogue and no validation: `POSTMORTEM-I-pdlc-headless-engine.md` exists at HEAD although the driver's force-phase token list omits `I`, and its phase must be reported as `I`. | Data Integrity | integration-fs | BR-12, AT-14b; PLAN T-18 |
| PROP-HALT-07 | A feature with no post-mortem file must report an empty halt set, exit 0, and render the explicit `none` line in human mode — never a blank region, never an error, never a gap row. In JSON mode the value must be `[]`. | Functional | unit-seamed | REQ-STATS-05, BR-13, AT-14, EC-03; PLAN T-04/T-06 |
| PROP-HALT-08 | Halt entries must be ordered by phase identifier ascending under code-unit collation, asserted as a **sequence** literal, not a set. Over `docs/completed/pdlc-headless-engine/` — four post-mortems at HEAD, phases `D`, `F`, `I`, `T` — the sequence must be exactly `D, F, I, T` in the human table and in the JSON array alike; and over a constructed fixture carrying phases `P` and `PR`, exactly `P, PR`, because the two-character id is where the collation choice becomes observable. A set-shaped oracle would pass for an implementation ordered by directory listing. | Data Integrity | integration-fs | BR-13, AT-14b; PLAN T-18 |

### Byte ratio

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-RATIO-01 | The spec side must be the byte total of exactly whichever of `REQ-`, `FSPEC-`, `TSPEC-`, `PLAN-`, `PROPERTIES-`, `DECISIONS-{feature}.md` are present, and the process side the byte total of exactly the files matching the cross-review, post-mortem and `CODE_REVIEW-{feature}-v{N}.md` grammars. Neither set is configurable and no config key widens either. | Data Integrity | unit-seamed | REQ C-3, REQ C-4, BR-14, AT-15; PLAN T-04 |
| PROP-RATIO-02 | Membership must be proved by a **removal probe**, not by a containment assertion: over a fixture carrying all six spec documents and all three process families at nine distinct file sizes, removing any one of the nine must change its side's total by exactly that file's size. A set-equality-only oracle passes an implementation that omits `DECISIONS-{feature}.md` or the post-mortem family from the enumeration. | Data Integrity | unit-seamed | BR-14, AT-15; PLAN T-04 |
| PROP-RATIO-03 | A file on neither list — `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md`, and the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape FSPEC v1.7 added to AT-15's neither-list, plus `HANDOFF-PROMPT.md` as a local addition FSPEC does not carry — must leave both totals unchanged when added. Asserted as a positive-presence pair: the file is in the fixture listing **and** both totals are byte-identical to the run without it. The out-of-catalogue member's *behaviour* is pinned separately and at the same level by PROP-RATIO-06; this row is AT-15's fixture transcription. | Data Integrity | unit-seamed | BR-14, BR-16, AT-15; PLAN T-04 |
| PROP-RATIO-04 | A symbolic link in the feature directory must contribute the size of the **link itself**, not of its target: with a link whose target is an order of magnitude larger, the process total must equal the sum including the link's own size. Falsified against a real filesystem, not a fake — `fakeStatsIo` cannot distinguish `lstat` from `stat`. | Data Integrity | integration-fs | EC-19, AT-15; TSPEC §2.4; PLAN T-18 |
| PROP-RATIO-05 | `statsIo().fileSize` must be built on `lstatSync`, and `bin/cli.mjs`'s **whole source** must match the boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` **zero** times, over the comment- and string-masked source the structural oracle reads — whole-file, with no "in the `stats` seam" qualifier (PLAN T-10), because the anchor already excludes the correct `lstatSync` and the naive `source.includes("statSync")` could never red — a structural conjunct paired with PROP-RATIO-04's behavioural one, because a behavioural test alone can be satisfied on a platform where the link and its target happen to agree. | Security | process | TSPEC §2.4, §3.1; PLAN T-10 |
| PROP-RATIO-06 | A grammatically-failing `CROSS-REVIEW-` basename must contribute to **neither** side: it is listed as malformed (PROP-RR-04) and sized as nothing. Asserted over the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape, so BR-06 and BR-14 are shown to land in different metrics. This is the property that carries AT-15's fourth neither-list member and FSPEC §8's `BR-16 | AT-15, AT-17` routing. | Data Integrity | unit-seamed | BR-14, BR-06, BR-16, AT-15; TSPEC §4.3; PLAN T-04 |
| PROP-RATIO-07 | When the spec total is zero, the ratio must report `state: "unavailable"` with `ratio: null` (human token `n/a`), **and** both byte totals must still be reported, and the command must exit 0. Never a division by zero, an `Infinity`, or a `NaN`. | Error Handling | unit-seamed | REQ-STATS-06, REQ R-4, BR-15, EC-12, AT-16; PLAN T-04 |
| PROP-RATIO-08 | The ratio must report `state: "harvested"` when `LEARNINGS-{feature}.md` is present **and at least one** of the two harvest-deleted process families is entirely absent, over exactly the file set the numerator sums. All four AT-17 legs must hold: cross-reviews intact with no `CODE_REVIEW`; `CODE_REVIEW` intact with no cross-review; neither present; and `CODE_REVIEW` files **intact** alongside only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames. The fourth leg is the one that proves the condition is a disjunction rather than a DoD-side test. | Data Integrity | unit-seamed | REQ-STATS-06, BR-16, AT-17; PLAN T-04 |
| PROP-RATIO-09 | The harvested test must be evaluated **before** the zero-denominator test: a directory that is harvested *and* has zero spec bytes must report `harvested`, never `n/a`. This is the only configuration on which the two orders disagree. | Data Integrity | unit-seamed | BR-16, EC-13, AT-17 leg 3; TSPEC §6.6 kill map; PLAN T-04/T-26 |
| PROP-RATIO-10 | The human rendering and the JSON number must be the **same** rounded value by construction — one `Math.round(x*100)/100` result, printed with `toFixed(2)` in human mode — so the two modes can never disagree on a displayed ratio. Falsified by a fixture whose unrounded quotient sits at a rounding boundary. | Contract | unit-render | BR-15, AT-06; TSPEC §4.3; PLAN T-06 |
| PROP-RATIO-11 | The **shipped** seam must count a symbolic link's own size, not its target's. Driven end-to-end on the production path — `main(["node","pdlc","stats",{feature},"--json","--cwd",{tempRoot}])` over a temp root holding one feature directory with one small regular file plus one symbolic link whose target is an order of magnitude larger — the reported byte total for the side the link's basename belongs to must equal the sum computed from the link's **own** `lstat` size, and must **not** equal the sum computed from the target's size. This is the only behavioural evidence on the **shipped** seam: PROP-RATIO-04's leg runs over the `realStatsIo()` helper and PROP-RATIO-05's conjunct is source-level, so a `statSync` implementation of `statsIo().fileSize` is red here and only here without relying on the helper-plus-call-set-equivalence chain (PLAN T-09). | Data Integrity | process | REQ-STATS-06, EC-19, AT-15; TSPEC §2.4; PLAN T-09 |

### Human rendering

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-RENDER-01 | Human mode must print one block per feature carrying, in this order: a header naming the feature **and the artifact directory read**, review rounds (six rows in catalogue order), DoD rounds, halts, byte ratio. Block order asserted positionally, so a renderer that emits all four in a different order fails. | Functional | unit-render | REQ-STATS-01, BR-17, AT-01; PLAN T-06/T-15 |
| PROP-RENDER-02 | The malformed list must render as a labelled list under the review-rounds table and be **omitted entirely** when empty; the halt table must be replaced by an explicit `none` line when the halt set is empty. A blank region for either is a failure — it is indistinguishable from a metric that failed to render. | Observability | unit-render | BR-17; PLAN T-06 |
| PROP-RENDER-03 | The ratio line must carry the rendered value **and** both byte totals in parentheses, so a surprising ratio is checkable without re-deriving it. | Observability | unit-render | BR-17; PLAN T-06 |
| PROP-RENDER-04 | The non-numeric tokens must render as exactly `harvested` and `unmeasurable` in both modes and in every metric; the zero-denominator state is the single mode-divergent token — `n/a` in human mode, `unavailable` as the JSON `state`. No other state may have a mode-specific spelling. | Contract | unit-render | BR-19; PLAN T-06 |
| PROP-RENDER-05 | The fleet layout must differ from the single-feature block in exactly two ways and no third: the malformed basename list becomes a count, and per-phase halt entries become `{n} ({r} resolved)`. Asserted as an allow-list enumeration, so a third reduction fails. | Contract | unit-render | BR-18, AT-06; TSPEC §6.3; PLAN T-06 |
| PROP-RENDER-06 | Gap rows and unclassified entries must print in the same list, in the same order as normal rows, with the reason in place of the metric columns and a visible marker — never in a separate section, never omitted. | Observability | unit-render | REQ-STATS-07, BR-18, BR-27; PLAN T-06 |

### JSON mode

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-JSON-01 | In `--json` mode stdout must parse as exactly one well-formed JSON document with no surrounding text, on every path except the usage-error path; every diagnostic, progress note and warning must go to stderr. | Contract | process | REQ-STATS-02, BR-20, AT-04; PLAN T-09 |
| PROP-JSON-02 | On the usage-error path stdout must be **empty** — the single exception — asserted against a captured buffer, not against an unread stream. | Contract | process | BR-20, EC-08, AT-24; TSPEC §6.2; PLAN T-09 |
| PROP-JSON-03 | The single-feature document's top-level keys must be **set-equal** to the hand-transcribed literal `["schemaVersion","reviewRounds","dodRounds","halts","byteRatio"]` — five, no more, no fewer, never containment, and never `Object.keys` of the implementation's own output. | Contract | unit-render | REQ-STATS-02, REQ R-5, BR-21, AT-05; TSPEC §6.3; PLAN T-06 |
| PROP-JSON-04 | `harvested`, `unmeasurable`, `n/a`/`unavailable` and the malformed list must ride **inside** their metric's value, never as sibling top-level keys. Asserted over a report that reaches at least one non-numeric state and carries at least one malformed basename, so the property is exercised rather than vacuous. | Contract | unit-render | REQ-STATS-02, BR-22, AT-05; PLAN T-06 |
| PROP-JSON-05 | `byDocType` must always carry all six document types with a fixed shape: `rounds` is `null` in exactly the non-`measured` states and `collidingRole` is non-`null` in exactly `unmeasurable` — the key present in every state, never absent, so a consumer branches on `state` alone. | Contract | unit-render | BR-22; TSPEC §4.1; PLAN T-06 |
| PROP-JSON-06 | Neither `feature` nor `dir` may appear in the single-feature document or in any fleet `features` entry — asserted **by name**, since these are the two `FeatureStats` fields the projection could plausibly leak and `dir` legitimately reaches the human header. | Contract | unit-render | BR-21, BR-23; TSPEC §4.2.1, §6.3; PLAN T-06 |
| PROP-JSON-07 | The fleet document's top-level keys must be set-equal to `["schemaVersion","features","unclassified"]`; `unclassified` is an array of directory names, `[]` when there are none, and never an entry inside `features`. | Contract | unit-render | BR-23, AT-19; PLAN T-06 |
| PROP-JSON-08 | Each fleet `features` entry must be discriminated by **key presence**: either exactly the four metric keys, or exactly the single key `gap` whose value is a reason string. Asserted by per-entry set-equality, never by a sentinel value inside a metric. | Contract | unit-render | BR-23, AT-20; TSPEC §4.1, §6.3; PLAN T-06 |
| PROP-JSON-09 | `schemaVersion` must be present in all three document shapes and equal to the literal `1` — asserted against the literal, not against the module's `SCHEMA_VERSION` constant, so a silent bump goes red. | Contract | unit-render | REQ R-5, BR-24, AT-05; TSPEC §6.3; PLAN T-06 |
| PROP-JSON-10 | Every metric visible in the human table must be recoverable from the JSON document and vice versa, over a corpus of reports that between them reach **every** state of every metric. A metric present in one mode and absent from the other must fail the test. | Contract | unit-render | REQ-STATS-02, AT-06; TSPEC §6.3; PLAN T-06 |

### Refusals and error shapes

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-ERR-01 | An unknown feature — absent under both `docs/{feature}/` and `docs/completed/{feature}/`, including in a repository with no `docs/completed/` at all — must exit 1 and name the feature: on stderr in human mode, and in JSON mode as a document whose top-level keys are set-equal to `["schemaVersion","error","feature"]` with `error` carrying exactly `reason` and `message`, `error.reason` exactly `not_found`, and `feature` the caller's supplied name. | Error Handling | integration-fake | REQ-STATS-09, BR-30, EC-01, AT-23; PLAN T-07 |
| PROP-ERR-02 | The not-found document must be distinguishable from a **successful** report of a real feature with no artifacts by key set alone, without inspecting any message string. | Contract | integration-fake | BR-30, AT-23, AT-26; PLAN T-07 |
| PROP-ERR-03 | A missing or unreadable `docs/` root must exit 1 across all eight combinations of {absent, unreadable} × {single-feature, fleet} × {human, `--json`}, with a positive conjunct per run: the stderr message names the root and carries a clause matching its own condition, the absent-message and unreadable-message are **not** byte-identical, and neither is EC-01's not-found message. | Error Handling | integration-fake | REQ-STATS-09, BR-30, EC-09, AT-27; PLAN T-07 |
| PROP-ERR-04 | In the four `--json` root-failure runs, stdout must parse as the three-key error object with `error.reason` exactly `no_docs_root`, `feature` the supplied name in single-feature runs and `null` in fleet runs. Stdout's **content** is asserted, not merely its non-report-ness: empty stdout must fail, and hard-coding `null` on every root failure must fail. | Error Handling | integration-fake | BR-30, EC-09, AT-27; TSPEC §4.2; PLAN T-07 |
| PROP-ERR-05 | An unreadable feature directory must split by mode: in single-feature mode, exit 1 with a stderr message and, under `--json`, the three-key error object with `error.reason` exactly `unreadable_feature` — not empty stdout; in fleet mode, a gap row naming the feature and its reason, every other feature reported normally, exit 0. Both halves asserted, since the split is the decision. | Error Handling | integration-fake | REQ-STATS-07, BR-27, BR-30, EC-11, AT-20, AT-27; PLAN T-07 |
| PROP-ERR-06 | The fleet per-feature guard must be a **catch-all** around the whole per-feature computation, not a guard around the directory read: a feature whose directory reads cleanly but whose metric computation throws must also degrade to a gap row with the fleet still exiting 0. A guard placed around `listDir` alone passes AT-20's first leg and fails this one. | Error Handling | integration-fake | EC-21, AT-20; TSPEC §5; PLAN T-07 |
| PROP-ERR-07 | A readable but **empty** feature directory must be a normal row, not a gap: six review-round rows `0`, DoD rounds `0`, an empty halt set, ratio `n/a`, exit 0, in single-feature and fleet mode alike. Emptiness is a measurement; a gap row is the admission that no measurement was possible. | Functional | integration-fake | REQ-STATS-07, BR-27, EC-03, AT-26; PLAN T-07 |
| PROP-ERR-08 | A `fileSize` throw on a file that vanished between the listing and the `lstat` must contribute `0` bytes and leave the ratio produced — a transient race must never crash the command. | Error Handling | unit-seamed | TSPEC §5; PLAN T-04 |
| PROP-ERR-09 | `runStats` must never throw for any decided scenario: for every scenario in FSPEC §5's table it must **return** `{stdout, stderr, exitCode}`. Falsified by driving each row through `fakeStatsIo`'s `throwOn` seam and asserting a returned value rather than a rejected call. | Contract | integration-fake | TSPEC §3.3, §5; PLAN T-07 |
| PROP-ERR-10 | The set of `error.reason` values observable from the refusal corpus must be **set-equal**, in both directions, to a hand-transcribed literal `["not_found","no_docs_root","unreadable_feature"]` — never containment. The corpus is two behavioural sweeps, neither reading a module constant: (a) every refusal scenario of FSPEC §5's table driven through `runStats` under `--json` (the corpus PROP-ERR-09 already builds), and (b) every seam `fakeStatsIo`'s `throwOn` exposes — `listDir`, `fileSize`, `readFile`, `exists` — made to throw at the `docs/` root and at the feature path, so a reason emitted on a fault path FSPEC §5's own rows never reach is still collected. Deleting any one of the three fails; a fourth reason reachable from either sweep fails. **The falsifier stated honestly:** a fourth reason reachable from no seam in either sweep is not detected — the superset direction is as wide as the corpus, not as wide as the program, and that residual is recorded at G-8 rather than claimed away. | Contract | integration-fake | REQ R-5, BR-30, AT-23, AT-27; PLAN T-07 |

### Read-only stance

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-RO-01 | On the **same** invocation, `pdlc stats {feature}` must both (a) do its job — emit the metric set on stdout and exit 0 — and (b) leave the tree set-equal by path and mtime between a snapshot taken immediately before and one taken immediately after. Conjunct (b) alone never suffices: a binary that prints nothing, or crashes, fails this property. | Security | process | REQ-STATS-08, BR-28, AT-21; PLAN T-11 |
| PROP-RO-02 | The same pair must hold on the failure paths: an unknown feature and an unknown flag must each leave the two snapshots set-equal **and** produce their decided output (the not-found report, the usage error) with exit 1. | Security | process | REQ-STATS-08, BR-28, AT-22; PLAN T-11 |
| PROP-RO-03 | The snapshot comparison must be between two snapshots of the same tree taken around one invocation, never against a fixed literal — an untracked tool cache or editor backup on a developer machine is not a source of flake, and this is the failure mode `coveredViolations` in `pdlc/workflows/lib/document-oracles.mjs` produces by walking the whole tree. | Contract | process | AT-21; TSPEC §6.5; DC-15; PLAN T-11 |
| PROP-RO-04 | The snapshot's exclusions must be exactly `.git/`, `node_modules/` and the suite's **declared** in-tree scratch prefixes (today exactly `.tmp-*`, held in one exported constant), and the same test must assert that the constant is non-empty and that no path under it existed before the run. The exclusion must never grow into a hole that hides a real write. The scratch write is real: `mkdtempSync(path.join(SCRATCH_ROOT, ".tmp-capture-driver-"))` in `pdlc/workflows/__tests__/learningsCaptureScript.test.js` runs under `pdlc/workflows/` while jest runs workers in parallel. | Security | process | TSPEC §6.5; PLAN T-11 |
| PROP-RO-05 | The `StatsIo` object literal `statsIo()` returns must carry exactly the four keys `listDir`, `fileSize`, `readFile`, `exists` — set-equality, so a fifth seam (the way a write first becomes possible) goes red — and the test double must carry **no** write member, so a production write attempt is a `TypeError` rather than a silent success. | Security | process | REQ C-1, BR-28; TSPEC §2.3, §6.4; PLAN T-10 |
| PROP-RO-06 | No `stats` code path may issue a network request or run a `git` write command. Asserted structurally — the seam bundle carries no `git` or network capability at all, and PROP-RO-05 pins that it never grows one — paired with PROP-RO-01/02's empirical snapshots on both a success and a failure path. | Security | process | REQ C-1, REQ R-3, BR-28, AT-21, AT-22; TSPEC §2.4, §5; PLAN T-11 |

### Anti-drift and wiring

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-DRIFT-01 | The four members of the bundle `statsParsers()` returns must be `===`-identical to `pdlc/workflows/orchestrate-dev.js`'s own exports — reference identity, not behavioural equivalence, so a local re-implementation that agrees on today's corpus still fails. Asserted against the **exported** `statsParsers` from `bin/cli.mjs`, never against a bundle the test builds. | Integration | process | REQ C-5, DEC-STATS-03; TSPEC §2.5, §6.4; PLAN T-10 |
| PROP-DRIFT-02 | The object `cmdStats` passes to `runStats` must be that same bundle, so the recording double can never become the production path — the pass-through conjunct without which PROP-DRIFT-01 pins a function nobody calls. | Integration | process | TSPEC §6.4; PLAN T-10 |
| PROP-DRIFT-03 | The four-classifier object literal must occur **exactly once** in `pdlc/engine/bin/cli.mjs`'s source, inside `statsParsers` — a set-equality over occurrences, not an "at least one" check, because a second construction site voids PROP-DRIFT-01 without failing it. The precedent for a positive structural count over this file exists: `pdlc/engine/__tests__/bin-guard-structure.test.js` pins `bin/pdlc.mjs` to an exact statement shape. | Contract | process | DEC-STATS-01 K-4; TSPEC §6.4; PLAN T-10 |
| PROP-DRIFT-04 | Each of the four driver classifiers must hold no state across calls **within one freshly-imported module instance**. The three object-returning classifiers must return `deepEqual` **and non-aliased** results when called twice on the same input, so a memoised return is distinguishable from a recomputed one; `deriveDodRoundIndex` returns a `number`, for which non-aliasing is meaningless, so it carries an **A-B-A** conjunct instead — call on A, then on a B whose correct index differs, then on A, asserting the third result equals the first. The fresh instance is load-bearing: a cache populated by an earlier test in the same worker would make the first call itself a hit and the conjuncts vacuous. | Contract | unit-pure | DEC-STATS-03; TSPEC §6.4; PLAN T-10 |
| PROP-DRIFT-05 | `lib/stats.mjs` must appear in `prepack.mjs`'s `MODULE_NAMES` (`pdlc/engine/scripts/prepack.mjs:20`, `export const MODULE_NAMES = [`), `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` and `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`; and `tspecPackedCount`'s vendored class size must equal `MODULE_NAMES.length + 1`, **derived** from `MODULE_NAMES` rather than transcribed, the `+ 1` being `VENDOR-MANIFEST.json`, which `runPrepack` writes rather than copies. Editing any one enumeration without the others must go red. | Integration | process | DEC-STATS-01, DC-18; TSPEC §2.1, §6.4; PLAN T-20…T-25 |
| PROP-DRIFT-06 | `lib/stats.mjs` must be a member of `pdlc/workflows/package.json`'s `c8.include` **and** of `coverageInstrumentation.test.js`'s P9-02 literal at the same index — the shipped assertion is `toEqual`, array-equality, so a correct-as-a-set but wrongly-positioned entry is red — and the module must meet the per-file c8 branch floor of 85 %. | Observability | process | TSPEC §6.1; PLAN T-24 |
| PROP-DRIFT-07 | The baseline symbols this feature builds on must exist before any dependent work starts: the four classifier exports in `orchestrate-dev.js` and `resolveWorkflowRoot` in `pdlc/engine/lib/run.mjs:90`. An absent symbol must be a blocking pre-flight failure, not a discovery made mid-implementation. | Contract | unit-pure | PLAN T-01 |

### Property-based (generative)

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-PBT-01 | **Partition.** For any generated basename list, every basename must land in exactly one of: counted for one document type, listed as malformed, or neither — never two. Falsifies a `not_cross_review` filter that leaks into the malformed list. | Data Integrity | unit-seamed | BR-06; TSPEC §6.6 PROP-1; PLAN T-19 |
| PROP-PBT-02 | **State totality.** For any generated directory listing, every `DocTypeRounds`, `DodRounds` and `ByteRatio` produced must carry a `state` drawn from its declared union, with `rounds`/`ratio` `null` in exactly the non-`measured` states and `collidingRole` non-`null` in exactly `unmeasurable`. Falsifies a key-absent shape. | Contract | unit-seamed | BR-22; TSPEC §6.6 PROP-2; PLAN T-19 |
| PROP-PBT-03 | **Order independence.** For any generated directory content, `runStats` over a `fakeStatsIo` whose `listDir` returns a generated **permutation** of that content must produce stdout byte-identical to the sorted-order run, and both the `byDocType` key order and the human row order must equal `REVIEW_DOC_TYPE_ROWS` exactly. Stated over a permutation, not over two identical calls: JavaScript object keys and `Set` iteration are insertion-ordered, so a repeat-call property is green for an implementation whose row order is whatever the filesystem returned. The second conjunct pins the order to the constant, so a stably *wrong* order also fails. | Idempotency | integration-fake | BR-09, BR-13, BR-18; TSPEC §6.6 PROP-3; PLAN T-19 |
| PROP-PBT-04 | Generators must be bounded: basename lists and file-size draws are bounded in length and magnitude, and any generated size product feeding the ratio carries an `assume` that the computed quotient is finite, so a generative run cannot red on an arithmetic artefact rather than on the claim. | Contract | unit-seamed | TSPEC §6.6; PLAN T-19 |

### Negative properties — what must not happen

| ID | Property | Category | Level | Traces to |
|---|---|---|---|---|
| PROP-NEG-01 | `pdlc stats` must **not** create, modify, delete or move any path, including a temporary file, on any path through the code — success, refusal or unexpected fault. | Security | process | REQ C-1, BR-28; PLAN T-11 |
| PROP-NEG-02 | It must **not** fold a malformed cross-review into any round count, and must not report a non-`CROSS-REVIEW-` file as malformed. | Data Integrity | unit-seamed | REQ R-1, BR-06; PLAN T-04 |
| PROP-NEG-03 | It must **not** sum the live and archived directories for one feature, and must not read the archived copy at all when the live one exists. | Data Integrity | integration-fake | REQ R-2, BR-02; PLAN T-05 |
| PROP-NEG-04 | It must **not** report a measured `0` for a harvested document type, DoD metric or ratio — the state that corrupts a baseline over `docs/completed/`, where most features are already harvested. | Data Integrity | unit-seamed | REQ R-6, BR-08, BR-11, BR-16; PLAN T-04 |
| PROP-NEG-05 | It must **not** emit a partial or truncated JSON document on any refusal path, and must not emit a success document with empty metrics in place of an error object. | Contract | integration-fake | REQ-STATS-09, BR-30; PLAN T-07 |
| PROP-NEG-06 | It must **not** omit any discovered feature from a fleet report for any reason — a gap, an unclassified directory and an unreadable directory are all rows. | Functional | integration-fake | REQ-STATS-07, BR-27; PLAN T-07 |
| PROP-NEG-07 | It must **not** define an independent parsing rule for any classification the driver already owns: no local cross-review grammar, no local `RESOLVED:` matcher, no local DoD version grammar. Enforced by PROP-DRIFT-01/03, since a source-level absence check alone is unfalsifiable. | Contract | process | REQ C-5, REQ O-2; PLAN T-10 |
| PROP-NEG-08 | It must **not** exit `2` on any path, and must not reach `emitReport`. | Contract | process | BR-29; PLAN T-09 |

## Oracles

Where a property could be satisfied by a wrong implementation, the oracle is specified here rather
than left to the implementer. Each row names the failure mode it closes.

### Falsifiability rules applied to this feature

| Rule | Where it binds | The oracle it forces |
|---|---|---|
| **Absence checks are unfalsifiable alone** | every non-numeric state | PROP-RR-07, PROP-DOD-03, PROP-RATIO-08 each assert three positive conjuncts — the exact `state` string, the accompanying `rounds`/`ratio` `null`, and the retained explanatory field (`collidingRole`, `processBytes`/`specBytes`). `state !== "measured"` is never the assertion. |
| **Preservation oracles need positive presence** | PROP-DISC-01, PROP-DISC-03, PROP-RATIO-03 | each asserts the ignored content is **in the fixture** (the archived directory / the subdirectory / the extra file is listed) **and** that the output is byte-identical to the run without it. A byte-identity check alone is vacuous on a fixture that never carried the content. |
| **Every regex-alternation branch needs a positive control** | PROP-RR-04, PROP-DOD-04, PROP-HALT-04 | the driver's `parseReviewFilename` failure reasons (`bad_role`, `bad_doc_type`, `bad_round`, `trailing_junk`, `not_cross_review`) each get a fixture basename, and each of `bad_*` must appear in the malformed list while `not_cross_review` must not. `count <= 1`-shaped checks are paired with a fixture proving the pattern *can* match. |
| **Identical-envelope behaviours need call-count oracles** | PROP-DISC-01, PROP-CLI-07 | "the archive was not read" and "no ambient state was read" produce the same report either way, so the oracle is `fakeStatsIo`'s recorded call list — the archived path must appear in **no** `listDir`/`exists`/`fileSize` argument — not a shape assertion on the output. Applied symmetrically: the same call-list assertion covers `readFile`, which must be called on `POSTMORTEM-*` paths and nothing else. |
| **Exact-value oracles over a real corpus need a derived count** | PROP-DRIFT-05 | the vendored class size is asserted as `MODULE_NAMES.length + 1`, derived from the enumeration, not hand-transcribed — the `EXPECTED_TEST_COMMAND` lesson from `pdlc-loop-economics`'s LEARNINGS F-4, applied before it recurs. |
| **Derived and absence-shaped conjuncts belong at the seam that can falsify them** | PROP-RATIO-04/05/11, PROP-RO-01…06, PROP-CLI-02/03 | `lstat`-vs-`stat`, "no write anywhere" and "stdout is empty" are structurally invisible below the real filesystem and the real CLI edge, so they sit at `integration-fs` and `process`, never at `unit-seamed` over `fakeStatsIo`. `lstat`-vs-`stat` is asserted at both: on the helper (PROP-RATIO-04, `integration-fs`) and on the shipped `bin/cli.mjs` seam driven end-to-end (PROP-RATIO-11, `process`), because a helper-level pass plus PROP-RATIO-05's call-set equivalence is a chain, not direct evidence. |
| **A new blocking cause behind a precedence chain needs a defeating fixture** | PROP-RR-11, PROP-RATIO-09 | the branch orders `unmeasurable`-before-`harvested` and `harvested`-before-zero-denominator are each falsifiable only on the single configuration where the two orders disagree; a fixture reaching only the earlier branch passes with the feature unimplemented. |
| **Bounded generators** | PROP-PBT-04 | `fast-check` strategies bound list length and file-size magnitude and `assume` finiteness on any computed quotient. |

### Oracle specifications

| Oracle | Construction | Fails when |
|---|---|---|
| **Parser identity** | assert `Object.values(await statsParsers())` members are `===` the corresponding named exports of a freshly-imported `orchestrate-dev.js`, against the **exported** `statsParsers` from `bin/cli.mjs`; second conjunct captures the bundle `cmdStats` hands `runStats` and asserts the same identities | a grammar is re-implemented locally, or a wrapper is slipped between the construction site and production (PROP-DRIFT-01, PROP-DRIFT-02) |
| **Doc-type catalogue agreement** | probe `parseReviewFilename("CROSS-REVIEW-software-engineer-{T}-v1.md")` over a candidate set — the six rows plus every other all-caps token the pipeline's vocabulary carries (`REVIEW`, `IMPLEMENTATION`, `LEARNINGS`, `POSTMORTEM`, `CODE_REVIEW`, `QUEUE`, `DOD`, `HANDOFF`) — collect the `ok:true` results and assert **set-equality** with `REVIEW_DOC_TYPE_ROWS`, in both directions and in order | the driver's private catalogue grows or shrinks without the FSPEC edit §7.4 A-3 requires. A fixed six-accepted/one-rejected probe cannot detect a *seventh* accepted type, which is the drift this oracle is the sole mitigation for. The role slug is load-bearing: `se-review` is a key of the role map, not a value, so a probe built from it returns `bad_role` for every doc type and both halves pass for the wrong reason (PROP-RR-13) |
| **Exclusion-set equality** | list `docs/` at the real repository root, keep directories only, assert (1) every name in `NON_FEATURE_DIRS` is present as a directory, and (2) every directory *not* in it satisfies an **independent artifact-naming witness** — it carries at least one file whose basename ends `-{dirname}.md`, or it carries no files at all | a ninth non-feature directory appears. Verified green at HEAD: the `docs/` root holds twenty-one directories, of which the eight excluded names are exactly the non-feature directories present, and all thirteen live feature directories — this feature's own `docs/pdlc-stats/` among them — satisfy the witness. The witness is deliberately **not** §4.4's leading-underscore predicate — an oracle partitioning with the predicate under test agrees with any predicate, including a wrong one (DC-14) (PROP-DISC-05) |
| **Construction-site count** | read `bin/cli.mjs`'s own source and assert the four-classifier object literal occurs exactly once | a second construction site appears (PROP-DRIFT-03) |
| **No-write capability** | assert `Object.keys(statsIo())` is set-equal to `["listDir","fileSize","readFile","exists"]` | a fifth seam is added (PROP-RO-05) |
| **Reason-catalogue equality** | collect the distinct `error.reason` strings over **two** sweeps — every refusal row of FSPEC §5's table driven through `runStats` under `--json`, **and** each of `fakeStatsIo`'s four `throwOn` seams (`listDir`, `fileSize`, `readFile`, `exists`) made to throw at the `docs/` root and at the feature path — then assert set-equality with the hand-transcribed literal `["not_found","no_docs_root","unreadable_feature"]` in both directions. The superset direction is exactly as strong as the union of those two sweeps and no stronger; the residual is G-8 | a fourth reason reachable from a decided scenario or from a seam fault ships without an FSPEC edit, or one of the three is deleted and the case-by-case assertions of PROP-ERR-01/-04/-05 leave the enum itself unpinned (PROP-ERR-10) |
| **Classifier purity** | in a freshly-imported module instance: two calls per object-returning classifier, `deepEqual` **and** `!==`; A-B-A for `deriveDodRoundIndex` | a driver export acquires a memo table, an accumulating high-water mark or any retained `let` — the one `DEC-STATS-03` trigger every other conjunct here is blind to, since reference identity survives a cache untouched and the recording double inherits shared state rather than exposing it (PROP-DRIFT-04) |
| **Cross-mode correspondence** | over a corpus of `StatsReport` values reaching every state of every metric: extract the metric set from `renderHuman` and from `renderJson` and assert correspondence, with the two D-7 fleet reductions enumerated as an allow-list | a third reduction appears, or a metric renders in one mode only. Necessary but **not** sufficient — it compares two renderings of one report and cannot see a key the projection leaks — so it is paired with PROP-JSON-03/06/09's key-set, leakage and version conjuncts (PROP-JSON-10) |
| **Read-only snapshot pair** | walk the repository root recording path + mtime, excluding `.git/`, `node_modules/` and the declared scratch prefixes; run; re-walk; assert set-equality of the two snapshots **and** the liveness conjunct (metric set on stdout with exit 0, or the refusal with exit 1) | a write lands, or the command does nothing. Comparing two snapshots of the same tree, never a fixed literal, is what keeps an untracked cache from flaking it (DC-15) (PROP-RO-01…04) |
| **Real-path literals** | every real-path expectation is written as a literal with a comment carrying the measurement date and the command that re-measures it | the archive moves and a red test cannot say whether the implementation or the corpus changed. A derivation in place of a literal would agree with a wrong implementation (DC-14) |

### Mutation kill map

Each mutation must turn a **named** test red; "some test goes red" is not a checkable claim. Evidence
lands in `docs/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` (PLAN T-26).

| Mutation | Killed by | Why that test and not another |
|---|---|---|
| drop `- 1` from `deriveDodRoundIndex(...) - 1` | PROP-DOD-01's real-path literal over `docs/completed/pdlc-loop-economics/` — reads `2`, mutant reads `3` | `3` is the value the property names explicitly as the one it must not be; the driver's `return max + 1` makes this the default wrong answer |
| drop `- 1` from `deriveRoundWindow(...).startIndex - 1` | PROP-RR-03's literals — `6` over `docs/completed/pdlc-advisory-wave-gate/` (mutant `7`) and `13` over `docs/completed/pdlc-headless-engine/` (mutant `14`) | both directories verified at HEAD; two independent corpora, so a single archival change cannot silently disarm the mutant |
| swap `unmeasurable` before/after `harvested` | PROP-RR-11's dedicated unit fixture — AT-25's round-1 collision **plus** `LEARNINGS-{feature}.md` in the same directory | AT-25's own *Given* names no `LEARNINGS` file, so the conjunct is added at the unit level rather than claimed from the AT; that fixture is the only configuration on which the two orders disagree |
| swap BR-16's harvested test before/after BR-15's zero-denominator test | PROP-RATIO-09, over AT-17's third fixture — harvested *and* zero spec bytes | the only fixture distinguishing the two orders; every other AT-17 leg passes under either |


## Fixtures

### Test doubles (PLAN T-02 — `pdlc/workflows/__tests__/helpers/statsDoubles.js`, new)

| Double | Substitutes | Contract |
|---|---|---|
| `fakeStatsIo(tree, {throwOn})` | `StatsIo` | `tree` maps absolute paths to `{dirs, files}` or to file contents. Every member is total except where `throwOn` names a call site, which is how PROP-ERR-05/06 and PROP-DISC-07 are driven without real permission bits. **No write member exists**, so a production write attempt is a `TypeError`, not a silent success (PROP-RO-05). It records every call and its arguments, which is what makes PROP-DISC-01's and PROP-CLI-07's call-count oracles possible. |
| `recordingParsers(real)` | `StatsParsers` | wraps the **real** driver exports and records call arguments. A narrow stub is opt-in per assertion; the real bundle is the ambient default, so a test cannot silently drift onto a hand-written grammar (REQ C-5). |
| `realStatsIo()` | `StatsIo` | the real-`node:fs` bundle used by the `integration-fs` properties. It is **not** a second implementation: it is the same four calls `bin/cli.mjs`'s `statsIo()` makes — `readdirSync(…, {withFileTypes:true})`, `lstatSync(…).size`, `readFileSync`, `existsSync` — and PROP-RATIO-05's structural conjunct pins the construction-site call set (including `lstatSync`, never `statSync`) so helper and shipped seam cannot diverge. |
| `_stats-scratch-prefixes.mjs` | — | the single exported constant holding the suite's declared in-tree scratch prefixes (today exactly `.tmp-*`), consumed by PROP-RO-04's snapshot walk and its guard conjunct (PLAN T-11, new). |

### Constructed fixtures (over `fakeStatsIo`)

| Fixture | Shape | Properties it serves |
|---|---|---|
| `F-BOTH-LOCATIONS` | one feature present under `docs/{f}/` **and** `docs/completed/{f}/`, with different artifacts in each | PROP-DISC-01, PROP-NEG-03 |
| `F-SUBDIR` | feature directory carrying a subdirectory of artifact-shaped names (the shape `docs/completed/pdlc-loop-economics/_evidence/` really has) | PROP-DISC-03 |
| `F-COLLISION` | one role carrying `CROSS-REVIEW-{role}-TSPEC.md` **and** `CROSS-REVIEW-{role}-TSPEC-v1.md`, with the other five types at indices `REQ` 3, `FSPEC` 2, `PLAN` 5, `PROPERTIES` 1, `DECISIONS` 4 | PROP-RR-07, PROP-RR-08 |
| `F-COLLISION-HARVESTED` | `F-COLLISION` **plus** `LEARNINGS-{feature}.md` | PROP-RR-11 — the mutation-killing fixture for the branch order |
| `F-MALFORMED-MIX` | one grammatical cross-review, one basename per driver failure reason (`bad_role`, `bad_doc_type`, `bad_round`, `trailing_junk`), and unrelated artifacts (`LEARNINGS-*.md`, `HANDOFF-PROMPT.md`, `MUTATION-EVIDENCE-*.md`) | PROP-RR-04, PROP-NEG-02 |
| `F-DOD-LEFTOVERS` | three directories: `LEARNINGS` + surviving `CODE_REVIEW-{f}-v4.md`; `LEARNINGS` + none; `LEARNINGS` + `CODE_REVIEW-{f}-draft.md` + `CODE_REVIEW-{other}-v2.md` | PROP-DOD-03, PROP-DOD-04 |
| `F-RATIO-NINE` | all six spec documents and all three process families at **nine distinct file sizes**, plus files on neither list, plus one process-side symbolic link | PROP-RATIO-01, PROP-RATIO-02, PROP-RATIO-03 (the link leg runs at `integration-fs`, PROP-RATIO-04) |
| `F-HARVEST-FOUR` | four directories, each with `LEARNINGS-{f}.md`: cross-reviews intact / no `CODE_REVIEW`; `CODE_REVIEW` intact / no cross-review; neither, and no spec documents; `CODE_REVIEW` **intact** plus only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames | PROP-RATIO-08, PROP-RATIO-09 |
| `F-EMPTY` | a readable but empty feature directory | PROP-ERR-07, PROP-ERR-02 |
| `F-PHASES-P-PR` | post-mortems for phases `P` and `PR` on one feature | PROP-HALT-08's collation leg |
| `F-UNCLASSIFIED` | a `docs/` root carrying a directory in neither the exclusion set nor recognisable as a feature | PROP-DISC-07 |
| `F-FLEET-GAP` | a fleet root where one feature's `listDir` throws, and a second where the metric computation throws after a clean read | PROP-ERR-05, PROP-ERR-06 |
| `F-EXCLUDED-ONLY` | a `docs/` root that is present and readable and holds exactly `NON_FEATURE_DIRS`' eight names as **directory entries** (`isDirectory` true, never files) — `_queue`, `_constraints`, `_decisions`, `design`, `requirements`, `ideas`, `discarded`, `completed` — and nothing else: no feature directory, no loose file, and an empty `completed/` | PROP-DISC-10 (AT-18's empty-root leg, EC-20) |
| `F-NO-ROOT` | {`docs/` absent} and {`docs/` unreadable} roots | PROP-ERR-03, PROP-ERR-04 |

Fixture strings are the normative spellings verbatim: `harvested`, `unmeasurable`, `n/a`,
`unavailable`, `measured`, `not_found`, `no_docs_root`, `unreadable_feature`, `gap`,
`schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio`, `byDocType`, `malformed`,
`collidingRole`, `processBytes`, `specBytes`, `features`, `unclassified` — each taken from FSPEC
§4.4 / BR-19 / BR-30 rather than paraphrased, and the six document-type row labels from
`REVIEW_DOC_TYPE_ROWS` as the driver's own catalogue spells them
(`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS`). Role slugs in fixture basenames are the
driver's `REVIEWER_ROLE_SLUGS` values — `software-engineer`, `product-manager`, `test-engineer` —
never a reviewer skill id such as `se-review`.

### Real-path fixtures — measured at HEAD, 2026-08-31

Every literal below was verified against the working tree at the HEAD this document was authored
against. Each is a **measurement of the archive as it stands**, re-measured if the archive changes;
a derivation in its place would agree with a wrong implementation.

| Path | Measured fact | Asserted literal | Properties |
|---|---|---|---|
| `docs/completed/pdlc-advisory-wave-gate/` | highest grammatical TSPEC cross-review is `CROSS-REVIEW-test-engineer-TSPEC-v6.md`; exactly **four** `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` files | `TSPEC` row `6`; four basenames in `malformed`; no row's count reflects them | PROP-RR-03, PROP-RR-05 |
| `docs/completed/pdlc-headless-engine/` | sole surviving cross-review `CROSS-REVIEW-software-engineer-TSPEC-v13.md`; `LEARNINGS-pdlc-headless-engine.md` present; `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md` present | `TSPEC` row `13`, other five rows `harvested`; halt phase sequence literal `D, F, I, T` | PROP-RR-03, PROP-RR-10, PROP-HALT-06, PROP-HALT-08 |
| `docs/completed/pdlc-loop-economics/` | exactly `CODE_REVIEW-pdlc-loop-economics-v1.md` and `-v2.md`; carries `_evidence/` subdirectory | DoD rounds `2` (not `3`, not a count) | PROP-DOD-01 |
| `docs/completed/pdlc-wave-resume/`, **copied into a temp root** with `POSTMORTEM-P-some-other-feature.md` added to the copy | `POSTMORTEM-PR-pdlc-wave-resume.md` carries the line-leading `RESOLVED: yes` on its third line | halt set exactly `[{phase:"PR", resolution:"resolved"}]`; the foreign-feature file contributes nothing | PROP-HALT-01, PROP-HALT-04 |
| the same copy with the marker rewritten `RESOLVED: no` | — | `[{phase:"PR", resolution:"open"}]` | PROP-HALT-02 |
| this repository's `docs/` root | twenty-one directories: the eight excluded (`_constraints`, `_decisions`, `_queue`, `completed`, `design`, `discarded`, `ideas`, `requirements`) and thirteen feature directories (this feature's own `docs/pdlc-stats/` among them); one loose file `docs/PLAN-pdlc-integration-boundary-gates.md`; `docs/completed/` carries loose `REQ-completed.md` and `QUEUE-HISTORY-rows-0-1.md`; `docs/pdlc-halt-hardening/` holds only `PLAN-pdlc-halt-hardening.md` | **invariants, not counts**: every feature directory appears exactly once; `docs/pdlc-halt-hardening/` among them; no row named `completed`; the three loose files yield no row | PROP-DISC-04, PROP-DISC-05, PROP-DISC-06, PROP-DISC-08 |

The fleet fixture is deliberately stated as invariants: a feature-count literal is falsified by every
routine archival and buys nothing this feature needs, while "exactly once" and "never `completed`"
are the properties BR-02 and BR-25 actually own.

**Fixtures that are deliberately not real-path.** AT-12's third directory (`-draft` and foreign
`CODE_REVIEW-` leftovers) and AT-17's fourth (`CODE_REVIEW` intact, only out-of-catalogue
`CROSS-REVIEW-` basenames) are constructed over `fakeStatsIo`: they carry no archive measurement to
re-measure, and naming them here keeps a later FSPEC edit to either leg visibly a testing concern.

### Process-level harness

Process-level properties reuse `captureRun` from `pdlc/engine/__tests__/loop-cli.test.js`, which
already records `process.exitCode` before the call, reads it after and restores the saved value —
necessary because `checkFlags` and `cmdStats` set the exit code on the **shared** test process and a
`1` left behind would be inherited by the next case and by the worker's own status. The helper's
shape is extended in one respect: it swaps `console.log`/`console.error`, while `cmdStats` writes
through `process.stdout.write`/`process.stderr.write` and `checkFlags` uses `console.error`, so both
pairs are swapped for the duration of the call. "Stdout is empty" (PROP-CLI-02, PROP-JSON-02) is
then an assertion about a captured buffer, not about a stream nobody read. No test spawns a process:
importing `bin/cli.mjs` is inert under its `import.meta.url` entry guard.

`F-CLI-SYMLINK` is the one temp-root fixture the process level builds for itself (PLAN T-09): a
`mkdtemp` root holding `docs/{feature}/` with one small regular file of a known size and one
process-side member that is a **symbolic link** whose target — written outside the feature
directory — is an order of magnitude larger. It is run through `main([...])` with `--cwd` pointing
at that root, because `Engine tests` runs `cd pdlc/engine && npm test` and `pdlc/engine/` carries no
`docs/`, so the flagless form would refuse at exit 1. It serves PROP-RATIO-11 only, and it is
deliberately not real-path: no archive directory carries a symbolic link, and one added later would
change a measurement rather than exercise this claim.


## Coverage Matrix

Every upstream clause maps to at least one property, and every property maps to at least one clause.
Gaps are named in §Gaps and Open Items rather than left for a reader to discover.

### REQ acceptance criteria, constraints, risks

| REQ clause | Properties |
|---|---|
| REQ-STATS-01 (human report) | PROP-RENDER-01…06, PROP-RR-12, PROP-DOD-02, PROP-HALT-07, PROP-RATIO-01 |
| REQ-STATS-02 (`--json`) | PROP-JSON-01…10, PROP-CLI-01 |
| REQ-STATS-03 (review rounds) | PROP-RR-01…13, PROP-NEG-02, PROP-NEG-04 |
| REQ-STATS-04 (DoD rounds) | PROP-DOD-01…04, PROP-NEG-04 |
| REQ-STATS-05 (halts) | PROP-HALT-01…08 |
| REQ-STATS-06 (byte ratio) | PROP-RATIO-01…11, PROP-NEG-04 |
| REQ-STATS-07 (fleet, explicit gaps) | PROP-DISC-04…10, PROP-ERR-05, PROP-ERR-06, PROP-ERR-07, PROP-RENDER-06, PROP-NEG-06 |
| REQ-STATS-08 (read-only, both conjuncts) | PROP-RO-01…06, PROP-NEG-01 |
| REQ-STATS-09 (unknown feature) | PROP-ERR-01, PROP-ERR-02, PROP-ERR-03, PROP-ERR-10, PROP-NEG-05 |
| C-1 read-only surface | PROP-RO-05, PROP-RO-06, PROP-NEG-01 |
| C-2 directory preference | PROP-DISC-01, PROP-DISC-02, PROP-NEG-03 |
| C-3 spec-document set | PROP-RATIO-01, PROP-RATIO-02 |
| C-4 process-artifact set | PROP-RATIO-01, PROP-RATIO-02, PROP-RATIO-06 |
| C-5 parsing fidelity | PROP-DRIFT-01…04, PROP-RR-13, PROP-NEG-07 |
| R-1 permissive parser | PROP-RR-04, PROP-NEG-02 |
| R-2 double counting | PROP-DISC-01, PROP-NEG-03 |
| R-3 `git` reach | PROP-RO-06, PROP-RO-05 |
| R-4 zero denominator | PROP-RATIO-07 |
| R-5 JSON field drift | PROP-JSON-03, PROP-JSON-09, PROP-ERR-10 |
| R-6 harvested reads as zero | PROP-RR-09, PROP-RR-10, PROP-DOD-03, PROP-RATIO-08, PROP-NEG-04 |
| A-1 literal basename | PROP-DISC-08 |
| A-2 computed fresh, no cache, no persisted stats file | PROP-NEG-01, PROP-RO-05 (no write seam exists, so no stats file can be persisted) |
| O-2 no divergence from the driver's classification | PROP-DRIFT-01…04, PROP-RR-13, PROP-NEG-07 |
| O-3 subcommand of the `pdlc` entry point | PROP-CLI-04, PROP-CLI-05, PROP-CLI-06 |

Three REQ ids carry no property row, by design rather than by omission: **A-3** ("authored in an orchestrated, non-interactive dispatch") is an assumption about this document's own production, not about the command; **O-1** routes JSON field spellings, column layout and rendering tokens to FSPEC/TSPEC, and the properties assert those documents' settled spellings rather than the routing decision itself; **O-4** places payload size, cross-repo aggregation and dispatch count out of scope, so there is nothing to falsify. Every other REQ id — the nine `REQ-STATS-*`, `C-1…C-5`, `R-1…R-6`, `A-1`, `A-2`, `O-2`, `O-3` — has at least one row above.

### FSPEC business rules

| BR | Properties | BR | Properties |
|---|---|---|---|
| BR-01 | PROP-CLI-01…05 | BR-16 | PROP-RATIO-03, PROP-RATIO-06, PROP-RATIO-08, PROP-RATIO-09 |
| BR-02 | PROP-DISC-01, PROP-DISC-02, PROP-NEG-03 | BR-17 | PROP-RENDER-01…03 |
| BR-03 | PROP-DISC-03 | BR-18 | PROP-DISC-09, PROP-RENDER-05, PROP-RENDER-06, PROP-PBT-03 |
| BR-04 | PROP-DISC-08 | BR-19 | PROP-RENDER-04, PROP-RR-07, PROP-RATIO-07 |
| BR-05 | PROP-RR-01, PROP-RR-02, PROP-RR-03 | BR-20 | PROP-JSON-01, PROP-JSON-02, PROP-CLI-08 |
| BR-06 | PROP-RR-04, PROP-RR-05, PROP-RR-06, PROP-RATIO-06, PROP-NEG-02, PROP-PBT-01 | BR-21 | PROP-JSON-03, PROP-JSON-06 |
| BR-07 | PROP-RR-07, PROP-RR-08, PROP-RR-11 | BR-22 | PROP-JSON-04, PROP-JSON-05, PROP-PBT-02 |
| BR-08 | PROP-RR-09, PROP-RR-10, PROP-RR-11 | BR-23 | PROP-JSON-07, PROP-JSON-08, PROP-DISC-07 |
| BR-09 | PROP-RR-12, PROP-RR-13, PROP-PBT-03 | BR-24 | PROP-JSON-09 |
| BR-10 | PROP-DOD-01, PROP-DOD-02 | BR-25 | PROP-DISC-04, PROP-DISC-05, PROP-DISC-06 |
| BR-11 | PROP-DOD-03, PROP-DOD-04 | BR-26 | PROP-DISC-05, PROP-DISC-07 |
| BR-12 | PROP-HALT-01…06 | BR-27 | PROP-ERR-05, PROP-ERR-06, PROP-ERR-07, PROP-NEG-06 |
| BR-13 | PROP-HALT-07, PROP-HALT-08 | BR-28 | PROP-RO-01…06, PROP-NEG-01 |
| BR-14 | PROP-RATIO-01, PROP-RATIO-02, PROP-RATIO-03, PROP-RATIO-06 | BR-29 | PROP-CLI-06, PROP-NEG-08 |
| BR-15 | PROP-RATIO-07, PROP-RATIO-10 | BR-30 | PROP-ERR-01…05, PROP-NEG-05 |

### FSPEC acceptance tests and edge cases

| AT | Properties | EC | Properties |
|---|---|---|---|
| AT-01 | PROP-RENDER-01, PROP-RR-12 | EC-01 | PROP-ERR-01 |
| AT-02 | PROP-DISC-01 | EC-02 | PROP-DISC-01 |
| AT-03 | PROP-DISC-03 | EC-03 | PROP-ERR-07 |
| AT-04 | PROP-JSON-01 | EC-04 | PROP-DISC-03 |
| AT-05 | PROP-JSON-03, PROP-JSON-04, PROP-JSON-09 | EC-05 | PROP-RR-04, PROP-RR-05 |
| AT-06 | PROP-JSON-10, PROP-RENDER-05, PROP-RATIO-10 | EC-06 | PROP-RR-07, PROP-RR-08 |
| AT-07 | PROP-RR-01 | EC-07 | PROP-RR-10, PROP-DOD-03 |
| AT-08 | PROP-RR-02 | EC-08 | PROP-CLI-02, PROP-CLI-03, PROP-JSON-02 |
| AT-09 | PROP-RR-03, PROP-RR-04, PROP-RR-05 | EC-09 | PROP-ERR-03, PROP-ERR-04 |
| AT-10 | PROP-RR-03, PROP-RR-10 | EC-10 | PROP-DISC-07 |
| AT-11 | PROP-DOD-01 | EC-11 | PROP-ERR-05 |
| AT-12 | PROP-DOD-03, PROP-DOD-04 | EC-12 | PROP-RATIO-07 |
| AT-13 | PROP-HALT-01, PROP-HALT-02, PROP-HALT-04 | EC-13 | PROP-RATIO-09 |
| AT-14 | PROP-HALT-03, PROP-HALT-07 | EC-14 | PROP-HALT-03 |
| AT-14b | PROP-HALT-06, PROP-HALT-08 | EC-15 | PROP-HALT-04, PROP-HALT-05 |
| AT-15 | PROP-RATIO-01…04, PROP-RATIO-06, PROP-RATIO-11 | EC-16 | PROP-DOD-04 |
| AT-16 | PROP-RATIO-07 | EC-17 | PROP-DISC-04 |
| AT-17 | PROP-RATIO-08, PROP-RATIO-09 | EC-18 | PROP-DISC-08 |
| AT-18 | PROP-DISC-04, PROP-DISC-06, PROP-DISC-08, PROP-DISC-10 | EC-19 | PROP-RATIO-04, PROP-RATIO-05, PROP-RATIO-11 |
| AT-19 | PROP-DISC-05, PROP-DISC-07, PROP-JSON-07 | EC-20 | PROP-DISC-10 |
| AT-20 | PROP-ERR-05, PROP-ERR-06, PROP-JSON-08 | EC-21 | PROP-ERR-06 |
| AT-21 / AT-22 | PROP-RO-01…04, PROP-RO-06, PROP-NEG-01 | | |
| AT-23 | PROP-ERR-01, PROP-ERR-02, PROP-ERR-10 | | |
| AT-24 | PROP-CLI-01…04, PROP-JSON-02 | | |
| AT-25 | PROP-RR-07, PROP-RR-08 | | |
| AT-26 | PROP-ERR-07 | | |
| AT-27 | PROP-ERR-03, PROP-ERR-04, PROP-ERR-05, PROP-ERR-10 | | |
| AT-28 | PROP-DOD-04 | | |


### PLAN tasks

Every row of PLAN §Batches' task table, with the properties it discharges and the test file it
writes. All fifteen new test files were confirmed **absent** when this table was first written, so
each is planned-new rather than assumed-existing; the five files this feature *amends* were
confirmed **present**. `(new)` therefore means **created by this feature**, not absent today: the
first implementation waves have since landed several of them (the workflows `stats*` suites, and
`stats-cli.test.js` / `stats-cli-structure.test.js` at `2fc6d9b57` and `df1441b76`), and the rows
below say so where the distinction carries a claim. No row names a file that is neither shipped nor
declared new in PLAN's File Ownership Manifest — `statsRealPaths.test.js` is legitimately absent
because wave 9 has not run.

| Task | Test file (status at HEAD) | Properties |
|---|---|---|
| T-01 pre-flight | `pdlc/workflows/__tests__/statsPreflight.test.js` (new) | PROP-DRIFT-07 |
| T-02 doubles | `pdlc/workflows/__tests__/helpers/statsDoubles.js` (new) | infrastructure — §Fixtures; asserts nothing itself, by PLAN's own declaration |
| T-03 argv reds | `pdlc/workflows/__tests__/statsArgv.test.js` (new) | PROP-CLI-01 |
| T-04 metric reds | `pdlc/workflows/__tests__/statsMetrics.test.js` (new) | PROP-RR-01, -02, -04, -06…-09, -11; PROP-DOD-02…-04; PROP-HALT-03, -05, -07; PROP-RATIO-01…-03, -06…-09; PROP-ERR-08; PROP-NEG-02, -04 |
| T-05 discovery reds | `pdlc/workflows/__tests__/statsDiscovery.test.js` (new) | PROP-DISC-01, -02, -06, -07, -08, -10 (discovery half); PROP-NEG-03 |
| T-06 render reds | `pdlc/workflows/__tests__/statsRender.test.js` (new) | PROP-RENDER-01…-06; PROP-RR-12; PROP-JSON-03…-10; PROP-RATIO-10 |
| T-07 outcome reds | `pdlc/workflows/__tests__/statsOutcome.test.js` (new) | PROP-DISC-03, -09, -10; PROP-ERR-01…-07, -09, -10; PROP-CLI-07; PROP-NEG-05, -06 |
| T-08 anti-drift (workflows half) | `pdlc/workflows/__tests__/statsAntiDrift.test.js` (new) | PROP-RR-13, PROP-DISC-05 |
| T-09 CLI process reds | `pdlc/engine/__tests__/stats-cli.test.js` (present at HEAD, `2fc6d9b57`; the symbolic-link leg PLAN v1.2 adds is not yet in it) | PROP-CLI-02, -03, -04, -06, -08; PROP-JSON-01, -02; PROP-RATIO-11; PROP-NEG-08 |
| T-10 CLI structural reds | `pdlc/engine/__tests__/stats-cli-structure.test.js` (present at HEAD, `df1441b76`) | PROP-DRIFT-01…-04; PROP-RO-05; PROP-RATIO-05; PROP-CLI-05; PROP-NEG-07 |
| T-11 read-only reds | `pdlc/engine/__tests__/stats-read-only.test.js`, `…/_stats-scratch-prefixes.mjs` (both new) | PROP-RO-01…-04, -06; PROP-NEG-01 |
| T-12 green: argv + constants | amends T-03/T-08 files | turns PROP-CLI-01, PROP-RR-13, PROP-DISC-05 green |
| T-13 green: metrics | amends T-04's file | turns the T-04 set green |
| T-14 green: discovery | amends T-05's file | turns the T-05 set green |
| T-15 green: renderers | amends T-06's file | turns the T-06 set green |
| T-16 green: `runStats` | amends T-07's file | turns the T-07 set green |
| T-17 green: `bin/cli.mjs` | amends T-09/T-10/T-11 files; edits `pdlc/engine/bin/cli.mjs` (exists) | turns the T-09…T-11 sets green |
| T-18 real-path tests | `pdlc/workflows/__tests__/statsRealPaths.test.js` (new) | PROP-RR-03, -05, -10; PROP-DOD-01; PROP-HALT-01, -02, -04, -06, -08; PROP-RATIO-04; PROP-DISC-04 |
| T-19 property-based | `pdlc/workflows/__tests__/statsProperties.test.js` (new) | PROP-PBT-01…-04 |
| T-20 vendoring oracle | `pdlc/engine/__tests__/stats-vendoring.test.js` (new) | PROP-DRIFT-05 (lands deliberately red) |
| T-21 co-change cluster | amends `pdlc/engine/__tests__/run.test.js`, `pdlc/workflows/__tests__/learningsPremises.test.js` (both exist); edits `prepack.mjs`, `pdlc/README.md`, `docs/_constraints/DOMAIN-CONSTRAINTS.md` | PROP-DRIFT-05 |
| T-22 packed-set + sibling docs | amends `pdlc/engine/__tests__/_tspec-packed-set.mjs` (exists) | PROP-DRIFT-05 |
| T-23 distribution baselines | amends `pdlc/engine/__tests__/loop-distribution.test.js` (exists) | PROP-DRIFT-05 |
| T-24 coverage config | amends `pdlc/workflows/package.json` + `coverageInstrumentation.test.js` (both exist) | PROP-DRIFT-06 |
| T-25 publication path | edits `publish-preflight.mjs`, `fixture-machine.mjs`; asserted by T-20's file | PROP-DRIFT-05 |
| T-26 mutation evidence | amends T-04's and T-18's files; writes `docs/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` | §Oracles' kill map — PROP-DOD-01, PROP-RR-03, PROP-RR-11, PROP-RATIO-09 |
| T-27 operator documentation | writes no test file (PLAN's own declaration) | none — see §Gaps G-4 |

### Test-level distribution

| Level | Properties | Count |
|---|---|---|
| unit-pure | PROP-CLI-01, -05; PROP-RR-13; PROP-DRIFT-04, -07 | 5 |
| unit-seamed | PROP-RR-01…-02, -04, -06…-09, -11; PROP-DOD-02…-04; PROP-HALT-03, -05, -07; PROP-RATIO-01…-03, -06…-09; PROP-ERR-08; PROP-PBT-01, -02, -04; PROP-NEG-02, -04 | 27 |
| unit-render | PROP-RR-12; PROP-RENDER-01…-06; PROP-JSON-03…-10; PROP-RATIO-10 | 16 |
| integration-fake | PROP-DISC-01…-03, -07…-10; PROP-ERR-01…-07, -09, -10; PROP-CLI-07; PROP-PBT-03; PROP-NEG-03, -05, -06 | 21 |
| integration-fs | PROP-DISC-04…-06; PROP-RR-03, -05, -10; PROP-DOD-01; PROP-HALT-01, -02, -04, -06, -08; PROP-RATIO-04 | 13 |
| process | PROP-CLI-02…-04, -06, -08; PROP-JSON-01, -02; PROP-RO-01…-06; PROP-RATIO-05, -11; PROP-DRIFT-01…-03, -05, -06; PROP-NEG-01, -07, -08 | 23 |
| E2E (spawned) | none | 0 |

The shape is the intended pyramid: 69 properties falsifiable without a filesystem or a process, 13
needing the real archive because `lstat` semantics and real basenames are the claim, 23 at the CLI
edge because flag closure, stdout emptiness, exit codes, wiring identity, the shipped `lstat` seam
and the read-only stance are not observable below it, and no spawned end-to-end test at all.

## Gaps and Open Items

Named rather than papered over. None is a blocker for implementation; each says who owns it.

| ID | Gap | Disposition |
|---|---|---|
| G-1 | **`discoverFeatures`' positive recognition predicate is provisional.** TSPEC §4.4 states plainly that FSPEC BR-26/EC-10 name the "unclassified" outcome for a directory "in neither exclusion set nor recognizable feature" but state **no positive recognition predicate**, and that EC-03/AT-26 rule out the obvious candidate (artifact presence), since a readable-but-empty directory is a normal measured row. The leading-underscore predicate ships as the observable, and PROP-DISC-07 tests the *reporting* half only. A bare-named future non-feature directory would be reported as a feature with zero-state metrics. Blast radius is one function and its unit tests (TSPEC §4.4's own table). | Owned by the FSPEC erratum TSPEC §8.3 already raises. No property here asserts the predicate itself, deliberately: asserting a provisional rule would have to be rewritten when the erratum lands. PROP-DISC-05's oracle is the safety net — it goes red the moment a ninth directory appears. |
| G-2 | **`REVIEW_DOC_TYPE_ROWS` drift beyond the probe's candidate set.** PROP-RR-13 recovers the driver's accepted doc types behaviourally over a candidate set of all-caps tokens. A seventh accepted type *outside* that set is not detected. | Residual and bounded by FSPEC §7.4 A-3, which already makes a new driver doc type an FSPEC edit. Exporting `REVIEW_DOC_TYPES` from `orchestrate-dev.js` would close it directly and is the better long-term shape; it is not taken here because widening a completed sibling's frozen module surface carries the co-change cost TSPEC §2.1 prices. |
| G-3 | **Fleet-mode performance has no property.** Nothing here bounds runtime over a `docs/` tree of arbitrary size; TSPEC §2.3 argues sequential computation "has no measurable cost on local disk" but no oracle checks it. | Deliberate. The REQ states no performance criterion, and a wall-clock assertion in a jest suite is a flake generator, not a measurement. Recorded so a future REQ that *does* care knows it starts from zero coverage. |
| G-4 | **PLAN T-27 (operator documentation) has no oracle.** `pdlc/OPERATIONS.md` gains `pdlc stats`'s flag semantics, exit codes and read-only stance, and `pdlc/README.md` defers detail — neither is asserted by any test in this feature. The one operator-facing string PLAN T-17 ships inside the binary — the `USAGE` line `  pdlc stats [feature] [--json] [--cwd <path>]` — is **no longer** part of this gap: PROP-CLI-03 pins it verbatim on the stderr `checkFlags` writes. What remains ungated is the prose in `pdlc/OPERATIONS.md` and `pdlc/README.md` only. | Flagged, not fixed here: the shape of a documentation oracle (a deferring doc must name a doc that actually carries the content) is the `pdlc-engineering-loop` remediation pattern, and adding one is a PLAN/TSPEC decision, not a property this document can invent. `dod-verify`'s adjacent-surface sweep is the standing catch. |
| G-5 | **PROP-DRIFT-05 covers four of TSPEC §2.1's ten co-change sites directly**, plus a fifth (`c8.include`) through PROP-DRIFT-06. The remaining sites — `run.test.js`'s manifest `deepEqual`s, `learningsPremises.test.js`'s P-1 count, `pdlc/README.md`'s prose enumeration, and the two sibling `docs/completed/pdlc-engine-distribution/` documents — are asserted by pre-existing tests or by nothing. | The prose enumeration in `pdlc/README.md` and the two sibling documents have no mechanical guard; PLAN T-21 promotes a repo-scoped grep sweep to `docs/_constraints/DOMAIN-CONSTRAINTS.md` in its place. Recorded here because a promoted constraint is a review instrument, not an oracle (DC-18's residue). |
| G-6 | **Real-path literals are archive measurements and will go stale.** PROP-RR-03, PROP-RR-05, PROP-RR-10, PROP-DOD-01, PROP-HALT-01/02/04/06/08 all pin values measured at HEAD on 2026-08-31 and re-verified by executing the driver's own classifiers over the archive (`deriveRoundWindow` returns `startIndex` 7 and 14 for the two TSPEC corpora; `deriveDodRoundIndex` returns 3 for `pdlc-loop-economics`; `parseResolvedMarker` returns `{ok:true,resolved:true}` for `POSTMORTEM-PR-pdlc-wave-resume.md`; `parseReviewFilename` returns `bad_doc_type` for a `…-REVIEW-v1.md` basename and `not_cross_review` for `LEARNINGS-x.md`). | Mitigated, not removed: each literal carries its measurement date and re-measurement command in the test's own comment, so a red test names its own remedy. Replacing a literal with a derivation is forbidden (DC-14). |
| G-7 | **`docs/completed/` children are not filtered by any exclusion set.** BR-25 fixes the exclusion set at the `docs/` root only; a non-feature directory appearing under `docs/completed/` would be reported as a feature. None exists at HEAD. | Faithful to the upstream, which scopes the exclusion set to the `docs/` root. Recorded so the omission is a decision on the record rather than an oversight, and so a future `docs/completed/_archive-notes/` is a known case rather than a surprise. |
| G-8 | **PROP-ERR-10's superset direction is as wide as its corpus, not as wide as the program.** The `error.reason` set is collected behaviourally over two sweeps — FSPEC §5's decided refusal rows, and each of `fakeStatsIo`'s four `throwOn` seams faulted at the `docs/` root and at the feature path. A fourth reason emitted only from a path neither sweep reaches would not be caught, so "a fourth reason released without an FSPEC edit fails" holds **within the corpus**, not universally. | Accepted and stated in the property itself rather than papered over: the alternative — reading the reason enum from a module constant — is the oracle that agrees with a wrong implementation, and TSPEC's seam inventory is what bounds the corpus. Closing it fully needs an exported reason catalogue, which is a TSPEC decision this document cannot take. The two sweeps are the widest behavioural collection available at `integration-fake`. |

### Quality checklist

- [x] Every REQ acceptance criterion, constraint and risk has at least one property (§Coverage Matrix)
- [x] Every property traces to a REQ clause, an FSPEC rule/AT/EC and a TSPEC section
- [x] Every property carries a category and the cheapest falsifying test level
- [x] Negative properties included; every blocked/degraded invariant asserts an exact state value, a named reason and a retained explanatory field — never `state != "measured"`
- [x] Coverage-mode gates and routing branches carry workflow-level properties: the four branch orders (§Oracles' kill map) are each falsified by a fixture that defeats the earlier branch, and the fleet/single-feature routing split is asserted at `integration-fake` and `process`, not by a guard-only unit test
- [x] Fixture strings are the normative spellings verbatim, and role slugs are the driver's `REVIEWER_ROLE_SLUGS` values rather than skill ids
- [x] Every oracle passes the falsifiability checklist (§Oracles' first table)
- [x] Every PLAN task row is traced, and every named test file confirmed present or planned-new at HEAD
- [x] Coverage matrix shows no unexplained gaps — the eight that exist are G-1…G-8 with owners
