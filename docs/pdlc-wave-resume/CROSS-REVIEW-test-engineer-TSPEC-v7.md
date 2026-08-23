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

The seams this document hands the implementer are untouched by the delta, with one exception
worth naming precisely: §5.7's *precedent* interface — the shape the property suite is told to
copy — is now described in more detail than before, and the added detail is where my Medium
finding sits.

The new sentence says the pin "follows the depth precedent in
`pdlc/workflows/__tests__/advisoryHelperProperties.test.js`, whose generative block declares
`const runs = { numRuns: 500 }` in `describe("PROP-CTR-05 (generative): citesGateOutput …")` **and
applies it at every `fc.assert` site in that block**."

The first two conjuncts are exactly right at HEAD: line 261 of that file is
`const runs = { numRuns: 500 };`, declared inside the `PROP-CTR-05 (generative): citesGateOutput —
normalise, then substring, floored at 24` describe. The third conjunct is not. That block contains
**seven** `fc.assert` sites and `runs` is passed at **five** of them. The two that take
fast-check's default are the boundary-shape test (the hand-picked "same needle at length n and
n+1" case, whose own comment explains why a generator cannot express it) and the
`EMPTY / NON-ARRAY evidence never cites` test. "Every site in that block" is therefore an
overstatement of the precedent.

PLAN T-08 gets this right and says so explicitly — "applied at five `fc.assert` sites there; the
file's other properties take fast-check's default". So the erratum has introduced a divergence
from the very document it claims agreement with, in the same sentence that asserts "the three
documents agree". The figure they agree on (500) is genuinely agreed; the characterisation of the
precedent is not. Filed as F-01 (Medium, delta, local) — it is a fidelity defect in a HEAD
citation, not a testability defect, because P-1…P-4 are pinned at 500 either way and the
implementer follows PLAN T-08 for the task.

Everything else in the interface surface is inherited and unchanged: `parseWaveLedger`'s three
return shapes (§4.2), `classifyWaveLedger`'s `ClassifyInput` → `{outcome, provenance, code}`
contract, `formatWaveLedger`'s two shapes, `computePlanHash`, and the H-1/H-2 harness extensions
(`events` array; `failWriteOn(path, callIndex)`) that PLAN T-07 owns. None appears in the diff.

## Data Model

No type, catalogue, enum or numeric range changed in this delta. I ran the contract-fidelity
diff anyway over the two values the erratum *did* introduce, since both are numbers that
downstream documents transcribe:

| Value | TSPEC v1.4 | Downstream / HEAD source | Agrees? |
|---|---|---|---|
| Generative run count | `numRuns: 500`, all four laws | PLAN T-08 `{ numRuns: 500 }`; PROPERTIES PROP-LAW-01…04 each `{ numRuns: 500 }` | Yes |
| `c8.include` cardinality | four entries, enumerated verbatim | `pdlc/workflows/package.json` — four entries, `**/`-anchored, `allow-external: true` | Yes |
| Per-file branch floor | 85 | `test:coverage` stage 2: `--per-file --branches 85` | Yes |

The catalogues the property laws quantify over are unchanged and still resolve: P-3 asserts
`outcome ∈ RESUME_OUTCOMES`, `provenance ∈ RESUME_PROVENANCE` and `code ∈
Object.keys(WAVE_IGNORE_REASONS) ∪ {null}`, and it grounds the closure claim in **FSPEC BR-01**.
Per DEC-ERR-03 I re-read BR-01 at FSPEC v1.2 rather than trusting the pre-round reading:
`FSPEC:224` still states that every Phase I invocation resolves to exactly one of three outcomes
and that "the set is closed: adding or removing an outcome is a deliberate change to this rule",
traced to REQ-WVR-08. §5.7's P-3 is a faithful mechanical restatement of that, and FSPEC's own
AT-13 (`FSPEC:378`, "the outcome catalogue is closed at three (BR-01)") independently pins the
same closure with the explicit warning that containment does not discharge BR-01 — which is
precisely why P-3 is stated as membership plus set-equality rather than containment. Still
faithful.

The two other upstream ids reachable from the delta's neighbourhood also verify at current
version: **EC-19** (`FSPEC:271`, concurrent invocations out of scope, traced to REQ §3) and
**OB-F6** (`FSPEC:442`, the per-feature assertion that the resume record is in no wave's
owned-path set, with the general form routed to a Phase P gate). Neither has been reworded in a
way that would strand a TSPEC citation.

## Test Strategy

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
