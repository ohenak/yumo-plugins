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

Two §Oracles rows moved and both track their properties faithfully.

**The "Derived and absence-shaped conjuncts" row (`:298`)** adds PROP-RATIO-11 to the
PROP-RATIO-04/05 cluster and spells out why the claim is asserted twice rather than once: "on the
helper (PROP-RATIO-04, `integration-fs`) and on the shipped `bin/cli.mjs` seam driven end-to-end
(PROP-RATIO-11, `process`), because a helper-level pass plus PROP-RATIO-05's call-set equivalence is
a chain, not direct evidence." That is the right justification and it is the one PLAN gives at T-18
("T-09 remains the behavioural evidence on the shipped seam", `PLAN-pdlc-stats.md:112`). Duplication
across two levels is normally worth a scope question; here it is deliberate, argued, and the two
legs falsify different failures. No finding.

**The "Reason-catalogue equality" row (`:311`)** now describes both sweeps, names the four seams,
and carries the same honesty clause as the property: "The superset direction is exactly as strong as
the union of those two sweeps and no stronger; the residual is G-8". Oracle and property say the
same thing in the same words — no drift between the two places this claim lives, which is the
failure mode this pairing usually produces.

Applying the three standards I was asked to hold this round to the changed material:

- **No implementation echoes.** PROP-ERR-10 explicitly forbids reading a module constant and
  requires a hand-transcribed literal; PROP-RATIO-11 computes its expectation from the fixture's
  known link size, not from the code under test; PROP-RATIO-05 pins a literal regex. Clean.
- **No absence-only oracles.** PROP-RATIO-11 is the one to watch, since "must **not** equal the sum
  computed from the target's size" is a negative. It is paired on the same path with the positive:
  "must equal the sum computed from the link's **own** `lstat` size". Both assertions run over the
  same `main([...])` invocation. Correctly paired. PROP-RATIO-05's "zero matches" negative is
  likewise paired with the positive conjunct that `statsIo().fileSize` must be built on `lstatSync`.
- **Completeness by set-equality.** PROP-ERR-10 asserts set-equality in both directions over the
  full three-element enumeration and states that "deleting any one of the three fails" — a deleted
  case does go red. PROP-DISC-10 asserts `features` set-equal to `{}` and `unclassified` set-equal
  to `[]` rather than checking emptiness by containment. Both meet the bar.

I found no oracle in the changed material whose pass condition the revision widened or narrowed
away from what REQ and FSPEC require, and none whose falsifier depends on a claim that has since
moved.

## Fixtures

**`F-CLI-SYMLINK` (`:406`) is a new fixture and it is correctly scoped.** It builds a `mkdtemp` root
with `docs/{feature}/` holding one small regular file and one symbolic link whose target is written
*outside* the feature directory and is an order of magnitude larger — the target being outside
matters, because a target inside the directory would itself be summed and mask the very difference
the property tests. The fixture text says so implicitly by placement; the property's expectation is
computed from the link's own size, so the two agree.

Its `--cwd` rationale is verified true, not merely plausible: the fixture text says the flagless form
would refuse because "`Engine tests` runs `cd pdlc/engine && npm test` and `pdlc/engine/` carries no
`docs/`". `pdlc/engine/` indeed has no `docs/` directory, and `stats` does accept `cwd`
(`pdlc/engine/bin/cli.mjs:190`), so the workaround is both necessary and available. PLAN T-09 makes
the same argument in the same terms (`PLAN-pdlc-stats.md:103`).

The closing note — "it is deliberately not real-path: no archive directory carries a symbolic link,
and one added later would change a measurement rather than exercise this claim" — is a good product
judgement. Adding a symlink to a real archive directory would silently move PROP-RR-03's and
PROP-DOD-01's measured literals. Keeping the symlink claim in a constructed temp root protects the
real-path fixtures' recorded expectations. This is the same separation-of-concerns the document
already applies to `F-HARVEST-FOUR`.

**`F-EXCLUDED-ONLY` (`:357`) restated as directory entries lands F-05.** The wording moved from "as
directories" to "as **directory entries** (`isDirectory` true, never files)", and PROP-DISC-10's row
made the matching change. This matters because the fixture runs at `integration-fake` over
`fakeStatsIo`, whose `listDir` returns `{name, isDirectory, isFile, isSymbolicLink}` records
(`pdlc/workflows/__tests__/helpers/statsDoubles.js:31`) — there is no real directory to create, so
"a real directory" was the wrong instruction for the level the property sits at. The new wording is
executable against the double as built. Verified the enumeration is still exactly right:
`NON_FEATURE_DIRS` at `pdlc/workflows/lib/stats.mjs:193-202` holds exactly the eight names the
fixture lists — `_queue`, `_constraints`, `_decisions`, `design`, `requirements`, `ideas`,
`discarded`, `completed` — in that order. The "eight" in both the fixture and the property is a
measured fact at HEAD, not a stale count.

No fixture in the changed set encodes an expectation that the moved upstreams invalidate.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | High | delta | local | §Coverage Matrix → PLAN tasks, preamble (`:509-516`) | The new preamble asserts `statsRealPaths.test.js` "is legitimately absent because wave 9 has not run". All three of wave 9's files exist and are tracked at HEAD. |

**F-01 in full.** This round rewrote the §PLAN-tasks preamble to explain what `(new)` means now that
implementation has begun, and closed it with a self-audit sentence:

> No row names a file that is neither shipped nor declared new in PLAN's File Ownership Manifest —
> `statsRealPaths.test.js` is legitimately absent because wave 9 has not run.

Both halves of that sentence are false at HEAD.

PLAN's File Ownership Manifest assigns wave 9 three files (`PLAN-pdlc-stats.md:178-180`):
`pdlc/workflows/__tests__/statsRealPaths.test.js` (T-18), `pdlc/workflows/__tests__/statsProperties.test.js`
(T-19) and `pdlc/engine/__tests__/stats-vendoring.test.js` (T-20). All three are present and tracked
at HEAD — 8.4K, 8.8K and 3.9K respectively. `statsRealPaths.test.js` was added by commit `9a3a70fd9`,
whose subject is "feat(pdlc-stats): T-18 — 🟢 Real-path acceptance tests over the live archive". So
wave 9 *has* run, and the one file the sentence names by name as absent is the one that most
plainly exists.

This is not staleness that overtook the author. `9a3a70fd9` landed at 15:51, and the commit carrying
this preamble (`1be839ea8`) landed at 17:04 — over an hour later, with the T-18 commit already an
ancestor. The claim was falsifiable by `ls` at the moment it was written.

The reason I am treating this as blocking rather than as a note is that the revision made this exact
distinction load-bearing and then applied it asymmetrically. The same edit updated two sibling rows
to say the opposite for files in the *same* situation: T-09's row became "(present at HEAD,
`2fc6d9b57`)" and T-10's became "(present at HEAD, `df1441b76`)". T-18's row was left reading
"`pdlc/workflows/__tests__/statsRealPaths.test.js` (new)" and the preamble was written to certify
that reading as correct. The table's "status at HEAD" column now reports two files accurately and a
third inaccurately, with prose vouching for the inaccurate one.

The product consequence is traceability, which is my lens. T-18 carries eleven properties —
PROP-RR-03, -05, -10; PROP-DOD-01; PROP-HALT-01, -02, -04, -06, -08; PROP-RATIO-04; PROP-DISC-04 —
covering acceptance criteria AT-09, AT-10, AT-11, AT-13, AT-14b, AT-15 and AT-18. A reader using
this table to answer "what evidence exists for these acceptance criteria today" is told the tests
are unwritten when they are shipped. That misdirects two downstream consumers concretely: an
implementer picking up wave 9 would create a file that already exists, and a DoD verifier scoping
remaining work would count eleven properties as outstanding that are not.

**What to change.** Correct the preamble sentence to state what is true at HEAD — wave 9 has run and
all three of its files are present — and update the T-18 row's status cell to "(present at HEAD,
`9a3a70fd9`)" to match the form already used for T-09 and T-10. If the author prefers a status
column that does not need re-truing on every wave, replacing per-row commit annotations with a
single dated "measured at commit X" line above the table would serve the same purpose and decay more
gracefully; that is a suggestion, not a requirement. Requirement ref: the table discharges the
REQ-STATS traceability set via PLAN T-18; the specific criteria affected are AT-09/-10/-11/-13/-14b/
-15/-18.

**Scope:** `Local`. The fix is one sentence and one table cell in this document. I considered
`Process` — a "documents that annotate live repository state go stale between rounds" lesson is
tempting — but the failure here was not staleness, it was a claim contradicting the tree at the
moment of writing, and no pipeline change would have caught it that a re-read would not.

Nothing else in the nine changed hunks raises a finding. The other four discharged findings
(F-02…F-05 of v3) and both software-engineer findings land correctly, as recorded above.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The §PLAN-tasks table now mixes two annotation styles — "(new)" for unshipped files and "(present at HEAD, `{sha}`)" for shipped ones — so its accuracy has to be re-established every wave. Would you rather carry a single "status measured at commit X" line above the table and drop the per-row annotations? Not blocking; F-01's fix stands either way. |
| Q-02 | PROP-RATIO-11 and PROP-RATIO-04 both assert the `lstat`-not-`stat` claim, at `process` and `integration-fs` respectively. §Oracles argues the duplication is deliberate and I accept the argument. Is there a point after implementation at which PROP-RATIO-04 becomes redundant and could be retired, or do you intend both to stand permanently? A harvest-channel question, not a revision request. |

## Positive Observations

- **F-03 was answered with the harder of the two available fixes.** Asked to state PROP-ERR-10's
  falsifier honestly, the author could have simply softened the claim. Instead the corpus was
  genuinely widened with a second behavioural sweep across all four `throwOn` seams *and* the
  remaining residual was written down at G-8. Widening the evidence and admitting what is still
  uncovered is strictly more work than either alone, and it leaves the property both stronger and
  truthful about its limits.
- **The document declared its own divergence from FSPEC rather than letting a reviewer find it.**
  PROP-RATIO-03 names `HANDOFF-PROMPT.md` as "a local addition FSPEC does not carry". Unmarked
  divergence from an upstream contract is exactly the class of defect I am meant to catch as a High
  finding; catching it yourself and labelling it converts a finding into a fact a reader can check.
- **PROP-RATIO-05's matcher was made normative for a stated reason.** The note that
  `source.includes("statSync")` matches the correct `lstatSync` and "could never red" identifies a
  structural oracle that would have passed vacuously forever. That is a defect class that ordinarily
  survives review, because a vacuous assertion looks identical to a satisfied one.
- **The new fixture reasons about the blast radius of its own existence.** `F-CLI-SYMLINK`'s note
  that a real-path symlink "would change a measurement rather than exercise this claim" protects
  PROP-RR-03's and PROP-DOD-01's recorded literals from a future well-meaning edit. Anticipating how
  a later contributor could break a neighbouring property is unusually far-sighted for a fixture
  note.
- **The revision closed seven findings across two reviewers without collateral movement.** REQ and
  FSPEC are byte-identical to the v4 state, property counts reconcile exactly (105 = 5+27+16+21+13+23),
  and every Traces cell I spot-checked against PLAN and FSPEC at HEAD was accurate. The single defect
  is in a status annotation, not in a property, an oracle or a trace.

## Recommendation

**Needs revision**

One High finding, and it is narrow: the §PLAN-tasks preamble states that wave 9 has not run and that
`statsRealPaths.test.js` is absent, when all three wave-9 files are present and tracked at HEAD and
the T-18 commit predates the preamble commit by an hour. The property set, the oracles and the
fixtures are sound — I raise no finding against any of them.

Exactly what to change, and nothing more:

1. Rewrite the preamble's closing sentence (`:514-516`) to state that wave 9 has run and its three
   files — `statsRealPaths.test.js`, `statsProperties.test.js`, `stats-vendoring.test.js` — are
   present at HEAD.
2. Change the T-18 row's status cell (`:546`) from `(new)` to `(present at HEAD, 9a3a70fd9)`, matching
   the form already used for T-09 and T-10.

No other edit is owed by this review. Both Questions are non-blocking and may be answered in the
revision note or deferred to harvest.

DEFERRED: Consider replacing the per-row "(new)" / "(present at HEAD, {sha})" annotations in the §PLAN-tasks table with a single "status measured at commit X" line, so the table does not need re-truing after every implementation wave (Q-01).

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
