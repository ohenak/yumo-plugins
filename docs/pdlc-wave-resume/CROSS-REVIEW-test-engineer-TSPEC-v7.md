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

This is the lens the delta lands squarely in, so I checked it hardest.

**The pin is the right call and is now stated where the implementer will read it.** A property
suite that cites `advisoryHelperProperties.test.js` as its model while running at fast-check's
default would run 5× shallower than the block it is modelled on — the substance of PLAN round-1
F-06. §5.7 now carries the pin explicitly, in bold, with the negation spelled out ("not left to
fast-check's default"), so it can no longer be read past. P-1 (round trip), P-2 (reader totality),
P-3 (classifier totality) and P-4 (hash discrimination) all take it. That is the correct scope:
all four are laws over a parameterised input space, none is a hand-picked boundary shape, so
none has the excuse the precedent's two default-depth tests have.

**P-4's caveat survives the pin and still matters.** §5.7 keeps the bounded-corpus statement —
FNV-1a over 32 bits is not injective, so a generated collision is a finding about the corpus, not
a failed law — and PROPERTIES restates it (`PROPERTIES:367`). Raising the run count to 500
increases collision exposure across the generated corpus, which makes keeping that caveat
*in the suite preamble* more load-bearing after this delta than before it, not less. §5.7 still
requires it there. Good.

**§5.8's coverage story is now factually correct, with one unstated consequence.** The corrected
four-entry list is right, and the new gloss — the fourth entry "covers no code this feature
touches, but `--per-file` applies the floor to it independently, so a red there is not a red in
this feature's module" — is true as a statement about *attribution*. What it leaves unsaid is the
gate consequence: `--per-file` failing on **any** included file makes the whole `c8 report
--check-coverage` invocation exit non-zero, and PLAN T-10's oracle (i) is literally
"`npm run test:coverage` exits 0". So a red on `capture-learnings-baseline.mjs` would block T-10's
first oracle even though it is correctly not this feature's regression. The risk is small in
practice — CI is green at HEAD, so the fourth entry clears 85 today — but an implementer reading
§5.8's sentence could reasonably expect the gate to stay green regardless, and would then debug
the wrong module. One clause fixes it. Filed as F-02 (Low, delta, local).

Worth recording that T-10's **second** oracle is what protects this feature either way, and the
delta did not weaken it: the delta-scoped uncovered-line oracle asserts that no uncovered line
falls inside the ranges this feature introduced, checked against §4.5.1's transcribed mapping
table. That oracle is falsifiable by deletion of a single case (it fails a set-equality rather
than moving a percentage by 0.05), and it is unaffected by anything happening in the fourth c8
entry. The two-oracle design remains the right answer to round-1 F-05.

**Nothing I previously approved regressed.** §5.4's AT-05 write-side conjunct and §5.5's fifth
mutation (killing a suppressed write while `explicitPointer` is true), §2.4's exclusion column
naming the first conjunct as discriminating, and §5.5's mutation set generally are all outside
this diff and unchanged. The mutation duty rows PLAN T-02 and T-07 carry (§4.3 rows 1–4: apply,
observe RED against the named oracle, revert, record) still point at live oracles.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | §5.7 now says the precedent applies its pin "at every `fc.assert` site in that block", where PLAN T-08 says "five sites … the file's other properties take fast-check's default". Both cannot describe the same file. Was the broader phrasing intended as a simplification, or is it a transcription slip? PLAN's reading is the one that matches HEAD — I would align §5.7 to it. |
| Q-02 | §5.8 says a red in the fourth c8 entry "is not a red in this feature's module". Agreed on attribution — but should the paragraph also say that it would still fail `npm run test:coverage`, and therefore PLAN T-10's oracle (i), so the implementer knows where to look if that command goes red on a module this feature never touched? |

**No open obligations are created or discharged by this delta.** OB-F1's substance (BL-04 unmet,
AT-14 red, wave sequencing) was already recorded as unchanged in the v1.4 changelog, and §6.3
items 1–4 remain marked landed upstream at REQ v1.7 / FSPEC v1.2 — I spot-checked that those
version labels are the ones this dispatch names as current, and they are.

**Assumption stated for the record:** I did not execute `npm run test:coverage` as part of this
confirmation. My claim that the fourth c8 entry clears the 85 floor today rests on CI being green
on this branch's base, not on a local measurement. Nothing in this round's verdict depends on it —
F-02 is a documentation-clarity finding either way.

## Delta-Confirmation Findings

Both routed items landed and are correct on the load-bearing figures. Neither finding below is
High: the pin scope (all four laws at 500) and the c8 cardinality (four entries, verbatim) are
right, and no oracle, fixture, law or decision is weakened. F-01 is a fidelity slip in a HEAD
citation; F-02 is an unstated consequence in otherwise-accurate prose.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §5.7's new sentence says the precedent block "applies it at every `fc.assert` site in that block". At HEAD, `advisoryHelperProperties.test.js`'s `PROP-CTR-05 (generative): citesGateOutput …` describe has seven `fc.assert` sites and passes `runs` at five; the boundary-shape "same needle at length n and n+1" test and the `EMPTY / NON-ARRAY evidence never cites` test take fast-check's default. PLAN T-08 states this correctly ("five `fc.assert` sites there; the file's other properties take fast-check's default"), so the same sentence that asserts "the three documents agree" introduces a divergence from one of them. The pinned figure itself (500, all four laws) is right and agreed — only the characterisation of the precedent is wrong. Fix: replace "every" with "five", or with "every site in that block that states a law over a generated space". | §5.7, convention paragraph |
| F-02 | Low | delta | local | §5.8's new gloss — the fourth c8 entry "covers no code this feature touches, but `--per-file` applies the floor to it independently, so a red there is not a red in this feature's module" — is true about attribution but silent about the gate consequence: `--per-file` failing on any included file makes `c8 report --check-coverage` exit non-zero, and PLAN T-10's oracle (i) is "`npm run test:coverage` exits 0". An implementer reading only this sentence could expect the gate to stay green and then debug the wrong module. T-10's delta-scoped oracle (ii) is unaffected. Fix: one clause noting that such a red still fails the command, and that oracle (ii) is what localises the failure to this feature. | §5.8, coverage-floor paragraph |

FINDING: Medium | delta | local | §5.7 convention paragraph | §5.7 claims the cited precedent applies `numRuns: 500` "at every `fc.assert` site in that block"; at HEAD that block has seven `fc.assert` sites and only five pass `runs` — the boundary-shape and EMPTY/NON-ARRAY tests take fast-check's default. PLAN T-08 says "five sites", so the sentence asserting the three documents agree itself diverges from PLAN. The 500 figure and its application to all four laws P-1…P-4 are correct; replace "every" with "five".
FINDING: Low | delta | local | §5.8 coverage-floor paragraph | §5.8's new sentence that "a red there is not a red in this feature's module" is true about attribution but omits that `--per-file` failing on any included file still fails `npm run test:coverage`, which is PLAN T-10's oracle (i) verbatim; add a clause saying so and pointing at T-10's delta-scoped oracle (ii) as the localiser.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
