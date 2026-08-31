# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

## Overview

Round 2 is a **delta re-review**. Round 1 recommended *Needs revision* on one High
(F-01, AT-15's symbolic-link leg owned solely by a fake that cannot see the
`lstat`/`stat` difference) plus five Medium and three Low findings. The v1.1 revision
is 51 insertions / 25 deletions over `PLAN-pdlc-stats.md` — a changelog paragraph,
edits to the rows T-01, T-02, T-04, T-09, T-10, T-18, T-21, T-23, T-24, T-26, five
File-Ownership-Manifest rows for `lib/stats.mjs`, the T-18 dependency rationale, the
co-change premise in the Overview, the AT-coverage preamble and AT-15 row, two new
anti-drift oracle rows, two corrected "Claims verified" measurements and one DoD
checklist line.

Scope of this round, per the delta protocol: **only the changed sections**, plus a
check that each round-1 finding actually landed. Unchanged sections approved in round 1
(the batch-column arithmetic over all 27 rows, the same-new-file guard, the AT
set-equality, the CI check enumeration) are not re-litigated. Every claim the delta
makes about repository state was re-measured at HEAD rather than trusted from the
document.

**Round-1 findings — landing status.**

| Round-1 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** (with a residual, F-01 below) | T-18 gains the real-fs symlink leg; T-10 gains the `lstat`-not-`stat` source conjunct; AT-15 now maps to T-04 **and** T-18 |
| F-02 | Medium | **Resolved** | T-01 now cites `pdlc/engine/lib/run.mjs`; confirmed `export function resolveWorkflowRoot` at `pdlc/engine/lib/run.mjs:90`, and `bin/cli.mjs` carries no re-export |
| F-03 | Medium | **Resolved** | T-04 names the dedicated `LEARNINGS`-sibling fixture; T-26 declares it authors no test file, so the manifest's single-owner rows hold |
| F-04 | Medium | **Resolved** | T-10 carries both conjuncts, the second stated as pass-through (not a rebuilt object), with the reason T-09 cannot substitute |
| F-05 | Medium | **Resolved** | "Claims verified" now reads three `lib/` modules and 20 helper modules — both re-measured correct (`pdlc/workflows/lib/` = `document-oracles.mjs`, `escalation-view.mjs`, `loop-session.mjs`; `__tests__/helpers/` = 20 `.js` files) |
| F-06 | Medium | **Resolved** | T-18's rationale now states the seam (workflows-side over `realStatsIo()`, T-09 exercises the shipped command) and T-02 carries the equivalence pin |
| F-07 | Low | **Resolved** | T-24 names the second P9-02 test, its driver import list, title and comment (`coverageInstrumentation.test.js:278`) |
| F-08 | Low | **Resolved** | T-09's conjunct takes `--cwd <repoRoot>`, with the `cd pdlc/engine` reason stated inline |
| F-09 | Low | **Resolved** | T-23 counts nine edits and names the ninth: P7-02's `postFixMembers` concatenation (`loop-distribution.test.js:228-231`) and `assertAdditiveOnly`'s message (`:73-77`) |

No round-1 finding is left open. The revision introduced four new items, all Medium or
Low; they are recorded below and none gates.

## Batches

Eleven task rows changed. Each was re-read against HEAD; the `Batch` and `Deps`
columns were untouched by the revision, so the round-1 arithmetic still holds and is
not re-derived here.

**T-01 (corrected citation) — verified.** `resolveWorkflowRoot` is exported at
`pdlc/engine/lib/run.mjs:90` (`export function resolveWorkflowRoot({ fs = defaultFs } = {})`),
and `grep` over `pdlc/engine/bin/cli.mjs` finds no re-export. The row's parenthetical
now states both halves — where the symbol is, and why asserting it on `cli.mjs`'s
export surface would red the gate spuriously. A pre-flight gate that reds on a true
premise is worse than no gate, so this correction matters more than its size.

**T-02 (`realStatsIo()` equivalence pin) — sound, with one ordering note.** The row now
constrains the helper to the same four calls the shipped seam makes
(`readdirSync(…, {withFileTypes:true})`, `lstatSync(…).size`, `readFileSync`, `existsSync`)
and hands the enforcement to T-10. T-02 sits in batch 1 and `statsIo()` does not exist
until T-17 (batch 8), so the helper is written against a seam that is specified but
unbuilt — correct for a `[Fake first]` row, and the pin is a *red* conjunct in T-10
(batch 2) that stays red until T-17 lands. Ordering is consistent.

**T-04 (AT-15 scope narrowed, mutant fixture named) — good.** The row now explicitly
disclaims the symbolic-link leg with the reason (a fake returns the fixture's declared
size), which is exactly the round-1 argument, and routes it to T-18. The
`unmeasurable`/`harvested` mutant's killing fixture is now named in prose — AT-25's
round-1 collision plus a `LEARNINGS-{feature}.md` sibling — and identified as the only
configuration in which the two branch orders disagree, so the implementer does not have
to rediscover it from TSPEC §6.6 during a batch-11 mutation run.

**T-09 (`--cwd`) — verified.** `docs/completed/pdlc-loop-economics/` carries exactly two
`CODE_REVIEW-pdlc-loop-economics-v{1,2}.md` files, so the DoD-rounds `2` literal remains
a true measurement, and the `--cwd <repoRoot>` form is now the one the row states. The
inline reason (`Engine tests` runs `cd pdlc/engine && npm test`; `pdlc/engine/` carries
no `docs/`) is stated where an implementer will read it.

**T-10 (three additions) — the load-bearing row of this revision.** It now carries the
parser-identity pass-through conjunct, the `lstat`-not-`stat` source conjunct and the
`realStatsIo()` equivalence conjunct on top of purity, construction-site count and
no-write capability. Two observations:

- The two new source-level conjuncts are genuinely falsifiable at HEAD: `bin/cli.mjs`
  contains **no** `statSync` and **no** `lstatSync` today (its only `fs` predicate is
  `fs.existsSync` at `pdlc/engine/bin/cli.mjs:262`), so an assertion that the shipped
  `statsIo().fileSize` names `lstatSync` reds until T-17 writes it, and reds again if a
  later edit substitutes `statSync`.
- The `statSync`-absence half needs a boundary-aware match, because `lstatSync`
  *contains* the substring `statSync`. As written ("contains no `statSync` call in the
  `stats` seam") the row leaves both the matcher and the seam boundary to the
  implementer, and the naive `source.includes("statSync")` is unfalsifiable — it matches
  the correct implementation. F-02 below.
- The equivalence conjunct compares a helper's source against the shipped seam's source.
  Two texts pinned to each other can drift together; what stops that is the *separate*
  literal conjunct anchored to TSPEC §3.1's `lstat().size — never follows a link`. The
  row has both, in the right order, which is why this is not a finding.

**T-18 (symlink leg + seam statement) — resolves F-01's behavioural half.** The new leg
builds a temp directory holding one small regular file and a symlink whose target is
much larger, and asserts the byte total counts the link's own size. That is a positive,
falsifiable oracle over a real filesystem, and it is not absence-shaped. The residual is
*which* seam it runs over — see F-01 below.

**T-21, T-23, T-24, T-26 — verified against the shipped sources.** T-21's scoped
constraint text is measurably true: `document-oracles.mjs` appears in none of
`prepack.mjs`'s `MODULE_NAMES`, either `WORKFLOW_MEMBERS` copy,
`fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`, or `package.json`'s `c8.include`
(re-read: seven entries, ending `lib/loop-session.mjs`, `lib/escalation-view.mjs`), and
it appears nowhere in `pdlc/engine/` or in the built `pdlc/workflows/dist/pdlc-cli.mjs`
— so the runtime-reachability framing is the correct discriminant, not directory
membership. T-23's ninth site exists as described (`loop-distribution.test.js:228-231`
concatenates `WORKFLOW_MEMBERS.filter(…)` with `NEW_LIB_MEMBERS_VENDORED`;
`assertAdditiveOnly`'s length message sits at `:73-77`). T-24's second P9-02 test is
`coverageInstrumentation.test.js:278`, whose driver imports `loop-session.mjs` and
`escalation-view.mjs` by name at `:283-284`. T-26's "authors no test file" declaration
keeps the manifest single-owner and states where a surviving mutant is remediated.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation
