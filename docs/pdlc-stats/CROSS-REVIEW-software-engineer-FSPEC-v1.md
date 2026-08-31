# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.0)
**Date:** 2026-08-31
**Iteration:** 1

## Verification performed

Every existing-code and repository-path claim in the FSPEC was checked against HEAD in one pass.

| FSPEC claim | Where checked | Result |
|---|---|---|
| `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker` all live in `pdlc/workflows/orchestrate-dev.js` (§1 fidelity anchor) | `orchestrate-dev.js:10134`, `:10192`, `:12384`, `:7601` | Confirmed — all four exported from that module |
| The un-suffixed `CROSS-REVIEW-{role}-{DOC}.md` form is round 1, per the driver (BR-05, AT-08) | `orchestrate-dev.js:10148` (`round: n === undefined ? 1 : Number(n)`) and the docstring at `:10126` | Confirmed |
| A role carrying both the plain and the `-v1` form for one doc type is a collision the convention refuses, naming the role (BR-07, EC-06) | `orchestrate-dev.js:10216-10225` (`malformed_round_one_duplicate`, carries `role`) | Confirmed |
| The DoD derivation returns highest-plus-one, so reporting it unchanged is off by one (BR-10, D-2) | `deriveDodRoundIndex`, `orchestrate-dev.js:12384` ff. — returns `max + 1`, and `1` for an empty listing | Confirmed |
| An absent or unparseable `RESOLVED:` marker classifies fail-closed (BR-12, EC-14) | `parseResolvedMarker`, `orchestrate-dev.js:7601-7615`; docstring at `:7593` maps `absent`/`duplicated` onto `unresolved` | Confirmed |
| The closed-flag surface behaves as the existing commands do (BR-01) | `FLAGS_BY_COMMAND` `pdlc/engine/bin/cli.mjs:168`; `validateFlags` `:198` — unknown flag and value-flag-without-value both yield a usage-error string | Confirmed |
| Exit `2` is reserved by the existing CLI for a pipeline halt (BR-29) | `pdlc/engine/bin/cli.mjs:20-22` (exit-code header) and `:693` (`outcome === "halted" \|\| "blocked"` → 2) | Confirmed |
| BR-25's exclusion set is set-equal to the non-feature directories at the `docs/` root | Directory listing of `docs/`: `_constraints`, `_decisions`, `_queue`, `completed`, `design`, `discarded`, `ideas`, `requirements` — eight, matching BR-25's eight | Confirmed |
| `docs/PLAN-pdlc-integration-boundary-gates.md` and `docs/completed/REQ-completed.md` are both present and neither is a feature (BR-25, AT-18) | Both present | Confirmed. `docs/completed/QUEUE-HISTORY-rows-0-1.md` is a third loose file the FSPEC does not name; harmless, same treatment |
| `docs/completed/pdlc-loop-economics/` carries `_evidence/` (BR-03) and `CODE_REVIEW-…-v1.md` and `-v2.md` (AT-11) | Directory listing | Confirmed — AT-11's expected `2` is correct |
| `docs/completed/pdlc-headless-engine/` has `LEARNINGS`, one surviving TSPEC cross-review, none for the other five types (AT-10) | Directory listing — the survivor is `CROSS-REVIEW-software-engineer-TSPEC-v13.md` | Confirmed; the measured index is `13` (see F-05) |
| `docs/completed/pdlc-wave-resume/` carries `POSTMORTEM-PR-pdlc-wave-resume.md` (AT-13) | Present; exactly one line-leading `RESOLVED:` marker, value `yes` | Confirmed; the classification is `resolved` (see F-05) |
| `docs/pdlc-halt-hardening/` carries only a PLAN (EC-17) | Directory listing — `PLAN-pdlc-halt-hardening.md` only | Confirmed |
| The post-mortem **basename grammar** is the pipeline's own (BR-12, EC-15) | `orchestrate-dev.js:8618`, `:9402`, `:15293` — the driver **constructs** `docs/{feature}/POSTMORTEM-{phase}-{feature}.md` and probes it per phase; it never parses a `POSTMORTEM-*` listing | **Not confirmed** — see F-03 |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
