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

_pending_

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
