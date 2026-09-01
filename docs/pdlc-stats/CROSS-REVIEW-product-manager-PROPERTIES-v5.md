# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 5
**Round type:** delta re-review of the v1.2 round-3 revision (+63 / −23 lines).

## Overview

This is an ordinary delta re-review, not a cascade confirmation: PROPERTIES' own bytes moved this
round. The document went from v1.1 to v1.2, `sha256:7baf9b33…` → `sha256:9b118684…`, +63 / −23 lines
across nine hunks, discharging five product-manager findings (F-01…F-05 of v3) and two
software-engineer findings from the round-3 fan-out.

Measured upstream state at HEAD against the `UPSTREAM-STATE` anchors recorded in v4:

| Upstream | Pinned in v4 | At HEAD | Moved? |
|---|---|---|---|
| REQ | `f75c348f…` | `f75c348f…` | no |
| FSPEC | `a493133f…` | `a493133f…` | no |
| TSPEC | `f2261510…` | `f32d9cb5…` | yes |
| DECISIONS | `48522bf9…` | `ca3f7219…` | yes |
| PLAN | `87b439ea…` | `6ab4d081…` | yes |

The two upstreams that govern product fidelity — REQ and FSPEC — are byte-identical to the state I
approved at v4. So the REQ-STATS-06 erratum reasoning I recorded there still holds verbatim and is
not re-litigated here. TSPEC v1.8, DECISIONS v1.7 and PLAN v1.3 moved, and the delta under review
claims to track PLAN's movement in particular (T-09 gaining the shipped-seam symbolic-link leg,
T-10 dropping the `stats`-seam qualifier, T-05/T-07 replacing T-05/T-06/T-07 on PROP-DISC-10). I
checked those three claims against PLAN at HEAD rather than taking them on trust.

Under the decision freeze I confined blocking findings to the two admitted classes: a defect this
revision introduced, and a load-bearing claim that contradicts the repository at HEAD. I found one,
and it is of the second kind — introduced by this round's edit, and falsifiable by `ls`.

Scope of the scan: the nine changed hunks, plus the specific repository and PLAN facts the new
prose asserts. I did not re-read the sections v3 already approved and this round did not touch.

## Properties

**PROP-RATIO-11 (`:200`) lands my v3 F-01 correctly, and it is a real coverage gain, not a
restatement.** The finding asked for the shipped-seam behavioural leg PLAN gave T-09. PLAN at HEAD
carries it: T-09's row now reads "**and the symbolic-link leg on the production path** — one temp
root under `--cwd` holding a directory with a small regular file plus a symlink whose target is
larger, the byte total taking the *link's own* size (EC-19)", and names itself "the only
**behavioural** evidence on the **shipped** seam"
(`docs/pdlc-stats/PLAN-pdlc-stats.md:103`). PROP-RATIO-11 transcribes exactly that, at `process`
level, and states the same gap-closing rationale: PROP-RATIO-04 runs over the `realStatsIo()`
helper and PROP-RATIO-05 is source-level, so neither is direct evidence on the seam that ships.
That is the right product argument — the user's bytes are counted by `bin/cli.mjs`, not by a test
helper, and a helper-plus-equivalence chain is not the same promise.

Grounded against code rather than only against PLAN: `main(argv = process.argv, deps)` is exported
at `pdlc/engine/bin/cli.mjs:1336`, `stats: ["json", "cwd"]` is a real flag set at
`pdlc/engine/bin/cli.mjs:190`, and the seam the property aims at is `nodeFs.lstatSync(absPath).size`
at `pdlc/engine/bin/cli.mjs:1302`. So the property's `main(["node","pdlc","stats",…,"--cwd",…])`
driving form is executable as written, and its falsifier — swapping `lstatSync` for `statSync` at
:1302 — is genuinely red only here. The property is well-founded.

**PROP-RATIO-05 (`:194`) lands F-02 and is now falsifiable where it previously might not have
been.** It drops the "in the `stats` seam" qualifier and pins the boundary-anchored
`/(?<![A-Za-z])statSync\s*\(/` at **zero** matches over the whole masked source. PLAN T-10 at HEAD
says the same and marks the matcher "normative, not illustrative", because the naive
`source.includes("statSync")` matches the *correct* `lstatSync` and could never go red
(`PLAN-pdlc-stats.md:104`). Checked against the file: `bin/cli.mjs` contains `lstatSync` (:1302) and
`existsSync` (:267, :1308) and no bare `statSync` — so the assertion is satisfiable at HEAD and the
anchor does the discriminating work claimed. Good catch by the author to make the matcher normative;
an unanchored version of this property would have been an oracle that agrees with a wrong
implementation.

**PROP-DISC-10's Traces (`:142`) reconciled to `PLAN T-05/T-07`, and that is now correct.** Verified
against PLAN: T-05 owns `discoverFeatures` reds including "EC-20 empty root"
(`PLAN-pdlc-stats.md:99`) and T-07 owns the `runStats` reds (`:101`). T-06 is the renderer task and
owns no leg of this property, so dropping it is right, and the PROPERTIES §PLAN-tasks table agrees —
PROP-DISC-10 appears under T-05 and under T-07 and not under T-06. F-04 discharged.

**PROP-RATIO-03 and PROP-RATIO-06 (`:188`, `:189`) absorb the software-engineer's F-01 without
weakening either.** PROP-RATIO-03 picks up the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`
member of AT-15's neither-list and, importantly, is honest that `HANDOFF-PROMPT.md` is "a local
addition FSPEC does not carry" — that is exactly the kind of divergence I would otherwise have had
to raise, declared by the author instead. It also correctly routes the *behavioural* claim to
PROP-RATIO-06 rather than duplicating it, keeping one claim in one place. FSPEC at HEAD confirms the
routing the rows now cite: `§8` traces `BR-16 | AT-15, AT-17` (`FSPEC-pdlc-stats.md:903`) and
`BR-14 | AT-15` (`:901`). Traces cells updated to match. Correct.

**PROP-ERR-10 (`:240`) is the strongest edit in the round.** F-03 asked for the falsifier to be
stated honestly rather than overclaimed. The revision does both halves of the job: it widens the
corpus with a real second sweep (each of `fakeStatsIo`'s `throwOn` seams faulted at two paths) *and*
it states the residual plainly — "a fourth reason reachable from no seam in either sweep is not
detected — the superset direction is as wide as the corpus, not as wide as the program". The four
seams it names are real: `listDir`, `fileSize`, `readFile` and `exists` each have a
`shouldThrow(...)` guard in `pdlc/workflows/__tests__/helpers/statsDoubles.js` (:55, :76, :85, :94),
driven by `throwOn` (:47). So the widened sweep is buildable as described, and the set-equality is
still asserted in both directions against a hand-transcribed literal — no implementation echo, no
module constant read. This is the review-standard trio (set-equality not containment, no echo,
honest falsifier) satisfied together.

Counts are internally consistent: the header moved 104 → 105 (`:108`) for the one added property,
and the level distribution sums to 105 (5 + 27 + 16 + 21 + 13 + 23), with `process` moved 22 → 23
and the prose figures 69 / 13 / 23 all agreeing. No arithmetic drift.

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
