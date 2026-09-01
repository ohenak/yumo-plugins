# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 5 (delta re-review of the v1.2 round-3 revision)

## Overview

This is a delta re-review, not a fresh read. My v4 was an upstream-cascade confirmation over
byte-identical PROPERTIES; this round the document actually moved. The reviewed base is v4's
`REVIEWED-COMMIT: 73565854d478ab523999659b677a9a99249fab2d`; HEAD's PROPERTIES hashes
`9b1186842055a769bfdd4e467a4853dda2cba3d105733b9f068c9bd1c7da2978`, so the bytes changed and
`git diff 73565854d..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is the whole of what I
scanned: **+63 / −23** across the revision history, PROP-DISC-10, PROP-RATIO-03/05/06, a new
PROP-RATIO-11, PROP-ERR-10, two §Oracles rows, `F-EXCLUDED-ONLY`, a new `F-CLI-SYMLINK`, four
§Coverage Matrix rows, the §PLAN tasks preamble and two of its rows, the level distribution, a new
G-8 and the checklist line that counts the G-rows.

**My v4 finding is resolved.** v4 carried exactly one open item — Medium F-01, that PROP-RATIO-03's
transcription of AT-15's neither-list and the §Traceability AT-15 / BR-16 rows were stale against
FSPEC v1.7. All four halves landed: PROP-RATIO-03 now names the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` member and marks `HANDOFF-PROMPT.md` explicitly as a local
addition FSPEC does not carry; PROP-RATIO-06 gained `BR-16, AT-15` in Traces; the §Traceability
`BR-16` row now reads `PROP-RATIO-03, PROP-RATIO-06, PROP-RATIO-08, PROP-RATIO-09`; and the `AT-15`
row picked up `PROP-RATIO-06, PROP-RATIO-11`. I checked FSPEC at HEAD rather than trusting the
revision note: `FSPEC-pdlc-stats.md:901-903` routes `BR-14 | AT-15` and `BR-16 | AT-15, AT-17`, and
AT-15's *Given* (§6.6) enumerates the neither-list as `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`,
`SIZING-*.md` and the out-of-catalogue cross-review — exactly the four PROP-RATIO-03 now transcribes.
Nothing is owed on F-01.

**But the revision introduced one new defect, and it is the kind this round is not allowed to pass.**
The §PLAN tasks preamble was rewritten this round to make the table's `(new)` markers honest — a good
instinct, since implementation waves have landed since the table was first written. The rewrite
states a specific, checkable fact about the repository, and that fact is false at HEAD: it says
wave 9 has not run and `statsRealPaths.test.js` is therefore absent. Wave 9 has run and the file is
tracked. Detail in §Delta-Confirmation Findings. This is a factual contradiction with the repository
at HEAD introduced by this round's edit, so it blocks under both limbs of the frozen-round rule
rather than being deferrable.

Everything else in the delta checks out against code, and I say so section by section below. I
opened no new design question and re-litigated nothing that was settled in v1…v4.

## Properties

The changed property rows, each checked against the seam it names rather than against the revision
note that describes it.

| Changed row | What the edit did | Verified against |
|---|---|---|
| **PROP-RATIO-11** (new) | Shipped-seam behavioural leg for EC-19 at `process` level: `main(["node","pdlc","stats",{feature},"--json","--cwd",{tempRoot}])` over a temp root, byte total must equal the sum from the link's **own** `lstat` size and must **not** equal the sum from the target's | **Sound.** PLAN T-09 (`PLAN-pdlc-stats.md:103`) does carry this leg — "symbolic-link leg on production path… one temp root under `--cwd`… reported byte total is the *link's own* size (EC-19)" — so the `PLAN T-09` trace is real, not aspirational. `--cwd` is a shipped flag: `pdlc/engine/bin/cli.mjs:64` spells `pdlc stats [feature] [--json] [--cwd <path>]`. FSPEC AT-15's *Given* carries the symbolic-link member and EC-19 pins link-not-target, so `EC-19, AT-15` are accurate. |
| **PROP-RATIO-05** (restated) | Dropped the "in the `stats` seam" qualifier; now whole-file, `/(?<![A-Za-z])statSync\s*\(/` **zero** times over comment- and string-masked source | **Sound, and matches the shipped oracle.** PLAN T-10 (`PLAN-pdlc-stats.md:104`) independently states the whole-file, boundary-anchored form with no seam qualifier, so the two documents agree. The anchor does what the row claims: `bin/cli.mjs:1302` is `nodeFs.lstatSync(absPath).size`, and the lookbehind rejects it because the preceding character is `l`. The masking premise is real, not assumed — `stats-cli-structure.test.js:69` defines `maskNonCode` and line 525's test reads `readCliSource()` whole-file through it. |
| **PROP-RATIO-06** (Traces widened) | Gained `BR-16, AT-15`; prose now says it carries AT-15's fourth neither-list member and FSPEC §8's `BR-16 \| AT-15, AT-17` routing | **Sound.** `FSPEC-pdlc-stats.md:903` is literally `BR-16 \| AT-15, AT-17`. The division of labour it asserts is real: PROP-RATIO-03 is AT-15's fixture transcription, PROP-RATIO-06 pins the member's behaviour, both at `unit-seamed` and both in T-04. |
| **PROP-RATIO-03** (neither-list) | Picked up the out-of-catalogue member; marks `HANDOFF-PROMPT.md` as a local addition FSPEC does not carry | **Sound**, and the explicit local-addition marking is the right call — it stops a later reader reading the row back into FSPEC as a fifth AT-15 member. |
| **PROP-ERR-10** (falsifier restated) | Corpus widened to two sweeps: FSPEC §5's refusal rows, plus each `throwOn` seam faulted at the `docs/` root and at the feature path; residual stated in-row and at G-8 | **Sound, and the seam list is exact.** `fakeStatsIo` exposes precisely four `throwOn` seams — `statsDoubles.js:55, 76, 85, 94` are `listDir`, `fileSize`, `readFile`, `exists`. The row names those four and no others. |
| **PROP-DISC-10** (fixture wording + Traces) | `NON_FEATURE_DIRS`' eight names as **directory entries** (`isDirectory` true), not "a real directory"; Traces reconciled to `PLAN T-05/T-07` | **Sound.** `NON_FEATURE_DIRS` at `pdlc/workflows/lib/stats.mjs:193-202` is exactly eight frozen names matching the fixture's list in order. The wording fix is materially right, not cosmetic: `fakeStatsIo`'s `listDir` synthesises `isDirectory` from the `dirs` array (`statsDoubles.js:60-65`), so "directory entry" is the only thing a fake root can carry. Dropping T-06 from the trace is correct — T-06 is renderer reds; T-05 carries EC-20's empty root and T-07 the outcome half. |

**On the two oracle bars I am asked to hold, the new material passes.** PROP-RATIO-11 is not an
absence-only oracle — it pairs the negative ("must not equal the target-derived sum") with the
positive on the same path ("must equal the link's-own-size sum"), and the fixture makes the two
values distinct by construction because the target is an order of magnitude larger. PROP-ERR-10
keeps set-equality in both directions over a hand-transcribed literal and explicitly refuses
containment, and it names the reason it cannot read a module constant. Neither derives its expected
value from the code under test: PROP-RATIO-11's expected sum comes from the harness's own `lstat` of
a fixture it built, not from `statsIo()`.

**PROP-ERR-10's honesty is an improvement worth naming.** The previous wording claimed "a fourth
reason released without an FSPEC edit fails" flatly. That was stronger than the corpus could
support. The restatement bounds the claim to the corpus, widens the corpus with the `throwOn` sweep
so the bound is as wide as the seam inventory allows, and records the residual at G-8 instead of
asserting it away. That is the right shape for a behaviourally-collected enum oracle.
