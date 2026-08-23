# Cross-Review: test-engineer — TSPEC (delta confirmation, round 5 erratum)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.4)
**Date:** 2026-08-23
**Iteration:** 7 (delta confirmation)

## Overview

**What this round is.** I approved this TSPEC at v6. A targeted erratum edit landed as
`57c5948c` ("pin generative run count at 500 and correct c8 include to four entries"), with the
changelog/version bump following in `31df4eda`. The question here is narrow: does that delta
resolve the two routed items without breaking anything I previously approved — and, per DEC-ERR-03,
is this document still a faithful compression of REQ v1.7 / FSPEC v1.2 in the material it now
leans on.

**Routed item 1 — §5.7 run count.** Landed, and correct on the load-bearing figure. §5.7's
convention paragraph now reads `fc.assert(fc.property(…), { numRuns: 500 })` with the pin called
out in bold as *not* fast-check's default, and states that all four laws P-1…P-4 take the pin.
I checked the two downstream documents at HEAD: PLAN T-08 pins
`fc.assert(fc.property(…), { numRuns: 500 })` and PROPERTIES pins the same figure on all four of
PROP-LAW-01…04 (`PROPERTIES:364-367`, run-depth restatement at `§`-level prose near line 497).
PROPERTIES' own open-items table (line 731) recorded this as *"Still open … no `numRuns` or `500`
appears anywhere in TSPEC"* and routed it as an `ERRATUM: TSPEC` line; that routing is now
discharged. The three documents agree on 500.

**Routed item 2 — §5.8 c8 include list.** Landed, and verbatim-correct. I read
`pdlc/workflows/package.json` at HEAD: `c8.include` is exactly
`["**/pdlc/workflows/orchestrate-dev.js", "**/pdlc/workflows/orchestrate-queue.js",
"**/pdlc/workflows/build-runtime.mjs", "**/scripts/capture-learnings-baseline.mjs"]`, four entries,
with `allow-external: true` set alongside. §5.8 now transcribes all four, in the anchored `**/`
form the config actually uses — an improvement on the pre-round bare-filename rendering, which
was wrong twice over (three entries, and unanchored). The stated reason for `allow-external` —
that the fourth entry is outside `pdlc/workflows/` — matches the config's own `//c8` comment. The
`test:coverage` script string quoted immediately above it (`c8 npm test -- --runInBand && c8 report
--check-coverage --per-file --branches 85 …`) also matches HEAD verbatim.

**Net.** Both routed items are resolved. Two findings, neither High: one Medium where the new §5.7
prose overstates how the cited precedent applies its own pin, and one Low where §5.8's new
`--per-file` sentence is true as written but leaves a consequence for PLAN T-08's oracle (i)
unstated. Neither touches a decision, a law, a fixture, or an oracle.

## Architecture

Nothing architectural moved in this delta, and I confirmed that rather than assuming it.
`git show 57c5948c` touches exactly one file and exactly two hunks — the closing convention
paragraph of §5.7 and the coverage-floor paragraph of §5.8 — for a net +14/−4. No section
heading was added, removed or renumbered; no guard-table row, catalogue, protocol step or
decision id appears in the diff. §2.2's optimistic-then-reclassify lazy-probe protocol, §3.2's
eight-row ordered guard table, and the frozen catalogues (`RESUME_OUTCOMES`,
`RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS`, `ANCESTRY_INDEPENDENT_CODES`) are byte-unchanged.

The one architectural claim inside the delta's blast radius is §5.8's characterisation of where
the 85% branch floor is enforced: **at merge, by CI, not by the wave gate**. That was already in
the pre-round bytes and I re-verified it at HEAD rather than inheriting it on trust —
`.github/workflows/pr-tests.yml` runs `npm run test:coverage` in the `Unit tests` job, while
`.claude/pdlc.config.example.json`'s `implementation.testCommand` is plain jest with no `c8`.
Both halves of that contrast still hold, and the delta preserved the sentence carrying them.

The provenance chain for §5.8 also still resolves. The paragraph attributes the floor to
`TE F-07`; I opened `CROSS-REVIEW-test-engineer-TSPEC-v1.md` and F-07 is indeed the Medium,
`Cross-Feature`-scoped finding about a per-file 85% branch gate that binds at CI merge but not
at the wave gate. The `TE F-06` reference carried nearby resolves to
`CROSS-REVIEW-test-engineer-PLAN-v1.md` F-06, which is the run-count finding this erratum
ultimately settles. Neither is a nonexistent-authority citation.

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
