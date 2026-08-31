# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Verification performed

Every premise this document asserts about shipped code was re-checked at HEAD rather than read back
from the document. The §Overview "Verified premises" table is **green in full**:

| Claim in PROPERTIES | Re-checked at HEAD | Result |
|---|---|---|
| `pdlc/workflows/lib/stats.mjs` is absent | `ls` | absent |
| `FLAGS_BY_COMMAND` at `bin/cli.mjs:168` carries exactly four rows | `pdlc/engine/bin/cli.mjs:168-185` — `dev`, `queue`, `doctor`, `decide` | exact |
| `VALUE_FLAGS` at `bin/cli.mjs:141` lists `cwd`, no `json` | `pdlc/engine/bin/cli.mjs:141-162` | exact |
| the `doctor` neighbour row PROP-CLI-03 quotes | `pdlc/engine/bin/cli.mjs:184` — `doctor: ["plugin-root", "cwd", "allow-api-key-billing", "dev"]` | exact |
| four driver classifiers are `export function` | `orchestrate-dev.js:7601`, `:10134`, `:10192`, `:12384` | exact |
| `REVIEW_DOC_TYPES` is module-private | `orchestrate-dev.js:10105` — `const`, not `export const`; used at `:10144` | exact |
| `emitReport` is the only producer of exit code `2` | `pdlc/engine/bin/cli.mjs:668`, and its `return 2` on `halted`/`blocked`; every other `process.exitCode` assignment in the file is `0` or `1` | exact |
| `resolveWorkflowRoot` at `pdlc/engine/lib/run.mjs:90` | `pdlc/engine/lib/run.mjs:90` | exact |
| `MODULE_NAMES` at `prepack.mjs:20` | `pdlc/engine/scripts/prepack.mjs:20` — `export const MODULE_NAMES = [` | exact |
| `fast-check` devDependency | `pdlc/workflows/package.json:13` — `"fast-check": "^4.9.0"` | exact |
| `captureRun`, `bin-guard-structure.test.js`, `learningsCaptureScript.test.js`'s `mkdtempSync` | all present | exact |

The §Fixtures real-path literals are likewise green: `docs/completed/pdlc-advisory-wave-gate/` carries
`CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v6.md` as its highest and exactly four
`…-REVIEW-v{1,2}.md`; `docs/completed/pdlc-headless-engine/` carries the sole
`CROSS-REVIEW-software-engineer-TSPEC-v13.md`, `LEARNINGS-pdlc-headless-engine.md`, and
`POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md`; `docs/completed/pdlc-loop-economics/` carries exactly
`CODE_REVIEW-pdlc-loop-economics-v{1,2}.md`; `POSTMORTEM-PR-pdlc-wave-resume.md` carries the
line-leading `RESOLVED: yes`; `docs/PLAN-pdlc-integration-boundary-gates.md`,
`docs/completed/REQ-completed.md` and `docs/completed/QUEUE-HISTORY-rows-0-1.md` are the three loose
files named.

All fifteen files §PLAN tasks marks "(new)" are absent at HEAD, and all seven it marks as amended or
edited are present — checked individually. `NON_FEATURE_DIRS`' eight names match REQ-STATS-07's
list in order.

Two counting checks, and one disagrees — see F-02. The property inventory itself is internally
consistent: the thirteen domains sum to 102 (8+9+13+4+8+10+6+10+9+6+7+4+8), the six test levels sum
to 102 (5+27+16+19+13+22), and §Test-level distribution's "67 without a filesystem or a process"
is 5+27+16+19. Every one of PLAN's twenty-seven task rows (T-01…T-27) appears in §PLAN tasks. The
coverage matrix reaches BR-01…BR-30, AT-01…AT-28 plus AT-14b, and EC-01…EC-21 with no id missing.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **AT-18's second constructed root is dropped from the proof system while the coverage matrix reports it covered.** FSPEC AT-18 closes with an explicit *And* over **two** constructed roots: "one holding only excluded directories yields no feature rows … exit 0 (EC-20); one holding two directories whose names differ only in case yields two distinct rows (EC-18, BR-04)". EC-20's own row spells the expected output out — "An empty report — a header and no feature rows — and exit 0. Empty is a valid measurement; the operator sees that the query ran." The second root is discharged by PROP-DISC-08. The **first has no property and no fixture**: §Fixtures' constructed table carries `F-UNCLASSIFIED`, `F-FLEET-GAP` and `F-NO-ROOT` but no excluded-directories-only root, and the matrix's `EC-20 \| PROP-DISC-04` and `AT-18 \| PROP-DISC-04, PROP-DISC-06, PROP-DISC-08` rows cannot falsify it — PROP-DISC-04 and PROP-DISC-06 are `integration-fs` properties over *this* repository's `docs/`, which holds thirteen feature directories and therefore can never present the empty case. The gap is not named in §Gaps either, so it is silently dropped rather than owned. User impact is the reason this is High and not Medium: a `docs/` root holding only non-feature directories is precisely what a freshly-initialised consuming repo has, so `pdlc stats`' first-run output in every new repo is unproven — nothing here distinguishes "a header and no rows, exit 0" from a crash, an empty stdout, or a `no_docs_root` refusal. **Fix:** add a constructed fixture over `fakeStatsIo` (an `F-EXCLUDED-ONLY` root carrying only `NON_FEATURE_DIRS` members, `docs/completed/` empty) and one property asserting the **positive** conjuncts — the header renders, the feature list is empty, JSON `features` is `{}` and `unclassified` is `[]`, exit code `0` — then repoint the `EC-20` and `AT-18` matrix rows at it. | REQ-STATS-07; FSPEC AT-18, EC-20, BR-25 |
| F-02 | Medium | Local | **The `docs/`-root measurement is off by one in both places it is stated.** §Fixtures' real-path table reads "twenty directories: the eight excluded … and twelve feature directories", and §Oracles' exclusion-set row reads "Verified green at HEAD: the eight excluded names are exactly the non-feature directories present, and twelve live feature directories satisfy the witness". At HEAD there are **twenty-one** directories under `docs/` and **thirteen** feature directories — the omitted one is this feature's own `docs/pdlc-stats/`. The oracle itself is sound: I checked all thirteen against the stated independent artifact-naming witness (at least one file basename ending `-{dirname}.md`, or no files at all) and all thirteen pass, `docs/pdlc-stats/` included (six matching basenames among sixty-four files). So no test goes red — but a "verified green at HEAD" warranty that is arithmetically wrong is the one claim a reader of this document is entitled to take on trust, and an implementer transcribing "twelve" as a sanity count would be wrong. **Fix:** twenty-one and thirteen in both sentences. | REQ-STATS-07, BR-25, BR-26 |
| F-03 | Medium | Local | **The `USAGE` line has no oracle, and no gap row.** §Overview names the subject under test as "four additive edits to `pdlc/engine/bin/cli.mjs` (TSPEC §3.4: a `FLAGS_BY_COMMAND` row, a `case` in `main()`'s `switch`, a `USAGE` line, and the `cmdStats` / `statsIo` / `statsParsers` functions)"; TSPEC §3.4's table requires "add the `pdlc stats [feature] [--json] [--cwd <path>]` line" and PLAN T-17 delivers it. Three of the four edits are pinned — PROP-CLI-05 the row, PROP-CLI-04 the `switch` case, PROP-DRIFT-01/-02/-03 the functions — the `USAGE` line is pinned by nothing. PROP-CLI-02 and PROP-CLI-03 assert only that "a usage message" reaches stderr, which `checkFlags` produces from the **existing** `USAGE` constant (`pdlc/engine/bin/cli.mjs`, `checkFlags` writes `USAGE` per TSPEC §5 row 1), so both stay green with the line never added. The result is a shipped subcommand absent from `pdlc --help` with the whole suite green — the discoverability half of REQ O-3. **Fix:** cheapest is a conjunct on PROP-CLI-05 (structural, T-10's file already reads `bin/cli.mjs`'s source) asserting `USAGE` contains the literal `pdlc stats`; if the author judges it out of scope, it belongs in §Gaps beside G-4 rather than unlisted. | REQ O-3; TSPEC §3.4; PLAN T-17 |
| F-04 | Medium | Local | **BR-30's `reason` catalogue is asserted case-by-case but never by set-equality.** FSPEC BR-30 closes it: "`reason` is one of `not_found`, `no_docs_root` and `unreadable_feature`". PROP-ERR-01 pins `not_found`, PROP-ERR-04 pins `no_docs_root`, PROP-ERR-05 pins `unreadable_feature` — so a **deleted** case fails, but a **fourth** reason arrives with every test green. That is exactly REQ R-5's field-drift risk class, and the error object is explicitly "a released shape under REQ R-5" per BR-30, so it earns the same protection the success document already gets. It is also the one enumeration in the document that escapes the set-equality discipline applied everywhere else — PROP-JSON-03 (five top-level keys), PROP-JSON-07 (three), PROP-CLI-05 (`["json","cwd"]`), PROP-DISC-05 (`NON_FEATURE_DIRS`), PROP-RR-13 (`REVIEW_DOC_TYPE_ROWS`), PROP-RENDER-05 (two fleet reductions). **Fix:** one conjunct on PROP-ERR-01 or a new PROP-ERR-10 asserting the set of `error.reason` values the implementation can emit is set-equal to the hand-transcribed literal `["not_found","no_docs_root","unreadable_feature"]`, recovered over the decided scenarios PROP-ERR-09 already drives. | REQ R-5; FSPEC BR-30 |
| F-05 | Low | Local | **The coverage matrix's REQ table is not a set-equality over the REQ's id space.** It carries `A-1`, `A-2` and `O-3` but omits `A-3`, `O-1`, `O-2` and `O-4` with no statement of scope, while its own preamble claims "Every upstream clause maps to at least one property, and every property maps to at least one clause". `O-2` is the sharper case: PROP-NEG-07's *Traces to* column cites `REQ C-5, REQ O-2`, so the matrix omits an id the property rows themselves use — the two directions disagree. **Fix:** either add the four rows with an explicit disposition (`A-3` and `O-1`/`O-4` are plainly not property-bearing; `O-2` is, via PROP-NEG-07/PROP-DRIFT-01), or state the table's scope as "acceptance criteria, constraints, risks, and the assumptions/obligations that bear properties" so the omission is a decision rather than a hole. | REQ A-3, O-1, O-2, O-4 |
| F-06 | Low | Local | **EC-17's matrix row points at a property whose text does not carry it.** EC-17 is "a feature directory holding artifacts but no `REQ-{feature}.md` … reported as a normal feature with whatever metrics its files support — a missing REQ is not a discovery criterion", and this repository really has one (`docs/pdlc-halt-hardening/`, verified: one file, `PLAN-pdlc-halt-hardening.md`). The matrix maps `EC-17 \| PROP-DISC-04`, but PROP-DISC-04's stated property is about directories-only discovery and loose files and says nothing about a REQ-less directory. The coverage is real — it lives in §Fixtures' invariant "`docs/pdlc-halt-hardening/` among them" — but a reader following the matrix lands on a property that cannot falsify the case. **Fix:** repoint the row at PROP-DISC-06 (which owns "appears as a row exactly once") or add the REQ-less-directory conjunct to PROP-DISC-04's text. | FSPEC EC-17 |

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
