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
| PROP-RATIO-03 | A file on neither list — `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md`, `HANDOFF-PROMPT.md` — must leave both totals unchanged when added. Asserted as a positive-presence pair: the file is in the fixture listing **and** both totals are byte-identical to the run without it. | Data Integrity | unit-seamed | BR-14, AT-15; PLAN T-04 |
| PROP-RATIO-04 | A symbolic link in the feature directory must contribute the size of the **link itself**, not of its target: with a link whose target is an order of magnitude larger, the process total must equal the sum including the link's own size. Falsified against a real filesystem, not a fake — `fakeStatsIo` cannot distinguish `lstat` from `stat`. | Data Integrity | integration-fs | EC-19, AT-15; TSPEC §2.4; PLAN T-18 |
| PROP-RATIO-05 | `statsIo().fileSize` must be built on `lstatSync`, and `bin/cli.mjs`'s `stats` seam must contain no `statSync` call — a structural conjunct paired with PROP-RATIO-04's behavioural one, because a behavioural test alone can be satisfied on a platform where the link and its target happen to agree. | Security | process | TSPEC §2.4, §3.1; PLAN T-10 |
| PROP-RATIO-06 | A grammatically-failing `CROSS-REVIEW-` basename must contribute to **neither** side: it is listed as malformed (PROP-RR-04) and sized as nothing. Asserted over the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape, so BR-06 and BR-14 are shown to land in different metrics. | Data Integrity | unit-seamed | BR-14, BR-06; TSPEC §4.3; PLAN T-04 |
| PROP-RATIO-07 | When the spec total is zero, the ratio must report `state: "unavailable"` with `ratio: null` (human token `n/a`), **and** both byte totals must still be reported, and the command must exit 0. Never a division by zero, an `Infinity`, or a `NaN`. | Error Handling | unit-seamed | REQ-STATS-06, REQ R-4, BR-15, EC-12, AT-16; PLAN T-04 |
| PROP-RATIO-08 | The ratio must report `state: "harvested"` when `LEARNINGS-{feature}.md` is present **and at least one** of the two harvest-deleted process families is entirely absent, over exactly the file set the numerator sums. All four AT-17 legs must hold: cross-reviews intact with no `CODE_REVIEW`; `CODE_REVIEW` intact with no cross-review; neither present; and `CODE_REVIEW` files **intact** alongside only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames. The fourth leg is the one that proves the condition is a disjunction rather than a DoD-side test. | Data Integrity | unit-seamed | REQ-STATS-06, BR-16, AT-17; PLAN T-04 |
| PROP-RATIO-09 | The harvested test must be evaluated **before** the zero-denominator test: a directory that is harvested *and* has zero spec bytes must report `harvested`, never `n/a`. This is the only configuration on which the two orders disagree. | Data Integrity | unit-seamed | BR-16, EC-13, AT-17 leg 3; TSPEC §6.6 kill map; PLAN T-04/T-26 |
| PROP-RATIO-10 | The human rendering and the JSON number must be the **same** rounded value by construction — one `Math.round(x*100)/100` result, printed with `toFixed(2)` in human mode — so the two modes can never disagree on a displayed ratio. Falsified by a fixture whose unrounded quotient sits at a rounding boundary. | Contract | unit-render | BR-15, AT-06; TSPEC §4.3; PLAN T-06 |

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

## Oracles

*(pending)*

## Fixtures

*(pending)*

## Coverage Matrix

*(pending)*

## Gaps and Open Items

*(pending)*
