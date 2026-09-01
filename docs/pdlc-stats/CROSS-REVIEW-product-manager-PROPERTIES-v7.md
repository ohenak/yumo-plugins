# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved (erratum round 5)

## Overview

PROPERTIES is unchanged at HEAD. The approved-version question is whether it is still a faithful
compression of upstream **as upstream now stands**, and two upstream documents have moved past the
version my v6 approval pinned:

| Upstream | v6 `UPSTREAM-STATE` pin | HEAD | Moved? |
|---|---|---|---|
| REQ | `f75c348f…` | `f75c348f…` | no |
| FSPEC | `a493133f…` | `a493133f…` | no |
| TSPEC | `7b119eb7…` | `f32d9cb5…` (v1.8) | **yes** |
| DECISIONS | `ca3f7219…` | `ca3f7219…` | no |
| PLAN | `6ab4d081…` | `64d8f1c5…` (v1.4) | **yes** |

The dispatch names the PLAN move. Per `DEC-ERR-03` I measured the TSPEC move as well, because
PROPERTIES cites TSPEC directly in nineteen trace cells and a scope taken from the item list rather
than from upstream-at-HEAD is the failure mode that rule exists to stop.

**The PLAN move (v1.3 → v1.4) is two edits.** (i) T-10's *justification* for its whole-file
`statSync` conjunct is re-grounded, because the baseline it was measured against expired when T-17's
`bin/cli.mjs` edits landed. (ii) The `Status` column is declared a planning-time ledger that is not
maintained during implementation. The conjunct itself, the task list, the batch structure and every
`Source File` cell are untouched.

**The TSPEC move (v1.7 → v1.8) absorbs one settled upstream decision** — REQ v1.7's withdrawal of
REQ-STATS-06's "a grammatical basename outside the driver's catalogue is a survivor" clause, decided
in BR-16's favour. TSPEC v1.8 re-stamps §4.3's contested paragraph, moves §4.3's BR-16 pin to v1.8,
pins AT-17's fourth leg hard to `harvested`, and closes §8.3's second bullet (count word two → one).
No `BR-`, `E-` or `AC-` row is added, no vocabulary is renamed, and no expected value moves.

I re-read the upstream text PROPERTIES actually leans on in both moved documents and re-measured its
claims against the repository at HEAD. One divergence is worth recording; it is Medium, and I set
out below why it is not High.

## Properties

### The one divergence: PROP-RATIO-05 and PLAN T-10 now define different oracle inputs

PROP-RATIO-05 is the source-level half of the `lstat`-not-`stat` guarantee (`REQ-STATS-06`,
`EC-19`, TSPEC §2.4/§3.1). It reads, in part:

> `bin/cli.mjs`'s **whole source** must match the boundary-anchored `/(?<![A-Za-z])statSync\s*\(/`
> **zero** times, **over the comment- and string-masked source the structural oracle reads** —
> whole-file, with no "in the `stats` seam" qualifier (PLAN T-10)

PLAN T-10 at v1.4 now says the opposite about that same clause:

> the conjunct is **not** re-opened and comment- or string-masking of the source is **not** owed —
> its falsifiability rests on the two anchors, never on the file being free of the token

So masking is *constitutive* of the property in PROPERTIES and *disclaimed as not owed* in the task
that implements it. PROPERTIES cites `(PLAN T-10)` inline in the very sentence that carries the
masking clause.

**Why this is Medium and not High.** Three things had to be true for it to be High, and none is:

1. *No requirement is narrowed or dropped.* The product guarantee — a symbolic link contributes its
   own size, never its target's — is preserved identically on both sides. `REQ-STATS-06`, `EC-19`
   and `AT-15` are untouched, and PROP-RATIO-11 still carries the behavioural evidence on the
   shipped seam.
2. *Both readings catch the real violation.* A genuine `statSync(` call site reds under the masked
   and the unmasked matcher alike. They diverge only on a `statSync(` occurrence inside a string
   literal or comment — which the unmasked form reds on and the masked form does not. The unmasked
   form is the more brittle of the two, not the more permissive; no violation escapes.
3. *The shipped oracle already satisfies PROPERTIES.* I re-measured. The conjunct at
   `pdlc/engine/__tests__/stats-cli-structure.test.js:525-529` reads
   `const masked = maskNonCode(source)` and asserts over `fsSyncCallNames(masked)`. The oracle
   PROPERTIES describes is the oracle on disk. PROPERTIES is *true* at HEAD; it is PLAN that now
   licenses a variant PROPERTIES does not describe.

The cost is forward-looking and concrete: a DoD reviewer or a later implementer reading PLAN T-10
would be entitled to strip `maskNonCode` from that conjunct as "not owed", at which point
PROPERTIES' PROP-RATIO-05 becomes a false description of the shipped oracle without any test going
red. That is a traceability defect between two approved documents, and it is cheap to close from
either end.

### PLAN's re-grounded T-10 claim is itself correct

I checked the measurement PLAN v1.4 substitutes for the expired baseline, because a re-grounding
that is itself wrong would be a High. It holds. `bin/cli.mjs` carries the token twice at HEAD:
`nodeFs.lstatSync(absPath).size` at `pdlc/engine/bin/cli.mjs:1302`, and a bare `statSync` in the doc
comment at `pdlc/engine/bin/cli.mjs:1288` ("`lstatSync`, never `statSync`"). The boundary-anchored
matcher yields zero over both: `(?<![A-Za-z])` rejects the call site, and `\s*\(` rejects the
comment occurrence, which is followed by an em-dash and not a parenthesis. PLAN's claim that the
conjunct survives the T-17 landing without re-opening is accurate, and PROP-RATIO-05's substantive
content — whole-file, boundary-anchored, zero, no seam qualifier — is exactly what PLAN still says.

### The TSPEC move leaves PROPERTIES faithful

TSPEC v1.8 settles the out-of-catalogue basename question in BR-16's favour: such a file contributes
no process bytes and counts as no file of its family remaining, so a feature whose only
`CROSS-REVIEW-` basenames are of that shape reports `harvested`. PROPERTIES already carries the
winning reading in all three places it could have carried the withdrawn one:

- **PROP-RATIO-03** puts the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape on the
  *neither* list — totals unchanged whether present or absent. That is the settled rule, not the
  withdrawn "survivor" rule, which would have made it contribute process bytes.
- **PROP-RATIO-06** asserts the grammatically-failing basename is listed as malformed yet sizes
  nothing, showing BR-06 and BR-14 landing in different metrics.
- **PROP-RATIO-08**'s fourth AT-17 leg reads `CODE_REVIEW` files intact alongside only
  out-of-catalogue cross-reviews → `harvested`. That is the hard pin TSPEC v1.8 just re-stamped.

No property, no oracle, no fixture and no trace cell needs to move for the TSPEC re-stamp. The
count-word change in §8.3 (two → one) and the BR-16 pin move (v1.7 → v1.8) are not cited anywhere in
PROPERTIES, so no stale version pin is inherited.

### Nothing else in PROPERTIES leans on what moved

I checked the remaining PLAN citations. PROPERTIES cites PLAN tasks in trace cells (T-04, T-06,
T-09, T-10, T-17, T-18, T-26) and in the §PLAN tasks coverage matrix. Every one of those citations
is to a task's *identity and scope*, not to its status or to T-10's justification prose. The
erratum touched neither.

## Oracles

PROPERTIES' §Oracles material — the kill map and the level assignments — is unaffected by both
upstream moves, and I verified this rather than assuming it.

**The kill map's mutants are anchored on TSPEC §6.6, which v1.8 did not touch.** PROP-RR-03's
real-path literals still read `6` for `docs/completed/pdlc-advisory-wave-gate/` and `13` for
`docs/completed/pdlc-headless-engine/`, with the mutants at `7` and `14`. TSPEC v1.8's edits are
confined to §0's changelog, §4.3 and §8.3; §6.6 is byte-identical, so no expected kill value moved.

**PROP-RATIO-09's zero-denominator oracle keeps its meaning under the settled rule.** It traces
`BR-16, EC-13, AT-17` and TSPEC §6.6. The settled reading makes the out-of-catalogue-only directory
a genuine zero-denominator case, which is the case PROP-RATIO-09 already asserts. Had REQ v1.6's
withdrawn "survivor" reading won, this oracle would have needed a new expected value; it did not
win, and PROPERTIES was already written to the side that did.

**Level assignments are untouched by the PLAN move.** PROP-RATIO-05 is `process`-level and lands on
T-10; PROP-RATIO-11 is `process`-level and lands on T-09; PROP-RATIO-04 is `integration-fs` over
`realStatsIo()` and lands on T-18. The erratum moved no task's ownership, so the three-way division
of symbolic-link evidence — helper-level behavioural, shipped-seam behavioural, source-level
structural — stands exactly as approved in v6.

The one qualification is the F-01 divergence above: the *input* PROP-RATIO-05's oracle reads is now
described differently by PROPERTIES and by PLAN. The oracle's level, ownership, falsifier and
pairing with PROP-RATIO-04 are all unaffected.

## Fixtures

No fixture is affected by either move, and the two that could have been are the ones I checked.

**`realStatsIo()` still matches the shipped seam.** §Fixtures describes it as "the same four calls
`bin/cli.mjs`'s `statsIo()` makes — `readdirSync(…, {withFileTypes:true})`, `lstatSync(…).size`,
`readFileSync`, `existsSync`", and says PROP-RATIO-05's structural conjunct pins the construction-site
call set "including `lstatSync`, never `statSync`" so helper and shipped seam cannot diverge. T-17's
landing is exactly the event that could have broken this, and it did not: `statsIo().fileSize` at
HEAD is `nodeFs.lstatSync(absPath).size`, and the call-set-equivalence conjunct at
`pdlc/engine/__tests__/stats-cli-structure.test.js:546-551` asserts the shipped and double call sets
sort equal with `statSync` absent from both. The fixture description is still true of the code.

**`F-CLI-SYMLINK` is unchanged in purpose.** PROP-RATIO-11 drives it end-to-end through
`main(["node","pdlc","stats",{feature},"--json","--cwd",{tempRoot}])`. The PLAN erratum did not touch
T-09, which owns it, and the TSPEC erratum did not touch §2.4, which specifies the behaviour.

**`F-EXCLUDED-ONLY` and the out-of-catalogue fixtures survive the TSPEC settlement.** These are the
fixtures the withdrawn "survivor" reading would have re-valued. Under the settled BR-16 rule they
keep the expected values PROPERTIES already records — the out-of-catalogue file listed, sizing
nothing, and the directory holding only such files reporting `harvested`. No fixture needs a new
expectation and none needs to be added.

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
