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

## Oracles

Every check I ran this round, with the command, so a later reader can re-run it rather than trust
this file.

| Check | Command | Result |
|---|---|---|
| PROPERTIES bytes moved since v4's approval | `shasum -a 256 docs/pdlc-stats/PROPERTIES-pdlc-stats.md` | `9b118684…` vs v4's `APPROVAL-HASH: 7baf9b33…` — changed, so a real delta round ✅ |
| Delta is exactly what I scanned | `git diff 73565854d..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` | +63 / −23, sections as listed in §Overview ✅ |
| Property count claim (`105 properties`) | `grep -oE '^\| (PROP-[A-Z]+-[0-9]+)' … \| sort -u \| wc -l` | `105` ✅ |
| Level distribution sums to the count | table rows read directly | 5 + 27 + 16 + 21 + 13 + 23 = **105** ✅; and the prose's "69 properties falsifiable without a filesystem or a process" = 5+27+16+21 = **69** ✅ |
| `process` row's new total | count of `\| process \|` property rows | 23 property rows (the 24th match is the distribution table's own row) ✅ |
| `NON_FEATURE_DIRS` is eight names | `pdlc/workflows/lib/stats.mjs:193` | eight, in the fixture's order ✅ |
| `fakeStatsIo` `throwOn` seams are four | `grep -n 'shouldThrow(' …/helpers/statsDoubles.js` | `listDir`, `fileSize`, `readFile`, `exists` — exactly the four PROP-ERR-10 names ✅ |
| `--cwd` is a shipped flag | `grep -n -- '--cwd' pdlc/engine/bin/cli.mjs` | usage line 64, parser 189 ✅ |
| `bin/cli.mjs` uses `lstatSync`, not `statSync` | `grep -n statSync pdlc/engine/bin/cli.mjs` | only `nodeFs.lstatSync(absPath).size` at 1302, plus a comment at 1288 ✅ |
| Structural oracle really masks comments/strings | `stats-cli-structure.test.js:69, 525` | `maskNonCode` exists; the test reads whole-file source through it ✅ |
| `F-CLI-SYMLINK`'s `--cwd` rationale | `ls -d pdlc/engine/docs`; `.github/workflows/pr-tests.yml:126-132` | no `pdlc/engine/docs`; the `Engine tests` job runs `npm test` with `working-directory: pdlc/engine` — so the flagless form really would refuse ✅ |
| T-09's file present at the named commit | `git log --oneline -1 2fc6d9b57` | `feat(pdlc-stats): T-09 — 🔴 CLI process-level reds` ✅ |
| T-10's file present at the named commit | `git log --oneline -1 df1441b76` | `feat(pdlc-stats): T-10 — 🔴 CLI structure reds` ✅ |
| T-09 row's "symbolic-link leg not yet in it" | `grep -n 'symlink\|lstat' pdlc/engine/__tests__/stats-cli.test.js` | no matches — the row's caveat is **true** ✅ |
| **`statsRealPaths.test.js` absent, wave 9 not run** | `git ls-files --error-unmatch …/statsRealPaths.test.js`; `git log -1 -- …` | **tracked at HEAD, landed by `9a3a70fd9` "T-18 — 🟢 Real-path acceptance tests"** ❌ **contradicts the document** |
| Status of all sixteen manifest files | `git ls-files --error-unmatch` over each | **all sixteen tracked**, including `statsProperties.test.js` (`ca8031311`, T-19) and `stats-vendoring.test.js` ❌ contradicts "ten of the fifteen" |

**What the last two rows mean.** The §PLAN tasks preamble now makes two present-tense claims about
the repository that a reader can check in one command each, and both are wrong in the same
direction: it under-reports how far implementation has got. Wave 9 is T-18 / T-19 / T-20
(`PLAN-pdlc-stats.md` File Ownership Manifest, batch 9), and T-18 and T-19 have both landed on this
branch. The document names `statsRealPaths.test.js` specifically as the worked example of a
legitimately-absent row, and that file is the one most clearly present.

**Why this is not the same class as the T-09/T-10 rows.** Those two rows do the status bookkeeping
correctly — they name the commit, and T-09's row even carries the sharp caveat that the
symbolic-link leg PROP-RATIO-11 needs is *not yet* in the shipped file, which I confirmed. The
preamble is the part that got it wrong, and it got it wrong while asserting completeness over the
whole table. A reader who trusts the preamble concludes that wave 9 is outstanding work.

**What I deliberately did not re-derive.** I did not re-run the archive measurements, the PLAN trace
resolution for unchanged rows, or the §Traceability rows the edit did not touch. Those were verified
in v3 and reconfirmed in v4, and this round's diff does not reach them.

## Fixtures

Two fixture edits landed this round; both are sound.

**`F-EXCLUDED-ONLY` restated as directory entries.** The old wording asked for the eight
`NON_FEATURE_DIRS` names "as directories"; the new wording says "**directory entries**
(`isDirectory` true, never files)". This is the more precise statement for the level the property
actually runs at. PROP-DISC-10 is `integration-fake`, so the fixture is a `fakeStatsIo` tree, and
that double synthesises entries with an explicit `isDirectory` boolean rather than consulting a
filesystem (`pdlc/workflows/__tests__/helpers/statsDoubles.js:60-72`). "A real directory" was
ambiguous about whether the property needed `integration-fs`; "directory entry, `isDirectory` true"
is exactly the discriminator the discovery filter reads. It also keeps the falsifier the row
depends on intact: an implementation that takes EC-09's root-failure branch still fails, because
the entries are present and readable.

**`F-CLI-SYMLINK` is new, and its constraints are justified rather than asserted.** A `mkdtemp` root
holding `docs/{feature}/` with one small regular file plus one process-side symbolic link whose
target — written *outside* the feature directory — is an order of magnitude larger. Three things
about it are right:

- **The target lives outside the feature directory.** If it lived inside, it would be summed as a
  member in its own right and the two candidate totals would no longer be cleanly distinguishable.
  The row says so, and it matters for the property to falsify.
- **`--cwd` is required, with a stated reason I confirmed.** `Engine tests` runs
  `working-directory: pdlc/engine` + `npm test` (`.github/workflows/pr-tests.yml:126-132`) and there
  is no `pdlc/engine/docs/`, so the flagless form would refuse at exit 1 and the test would assert
  nothing about `lstat`. This is the kind of CI-shaped constraint that is cheap to state now and
  expensive to discover in a red pipeline.
- **It is deliberately not real-path, and says why.** No archive directory carries a symbolic link,
  and adding one would change a measurement rather than exercise the claim. That reasoning protects
  the real-path measurements PROP-RR-03/-05 and the AT-09/-10/-11 legs depend on.

**The level placement is defended, not assumed.** The §Oracles design row now reads
`PROP-RATIO-04/05/11` and spells out why `lstat`-vs-`stat` is asserted twice: PROP-RATIO-04 runs
over T-02's `realStatsIo()` helper and PROP-RATIO-05 is source-level, so a helper-level pass plus
PROP-RATIO-05's call-set equivalence is a *chain* rather than direct evidence on the shipped seam.
That chain is real — `stats-cli-structure.test.js:531-551` is precisely the equivalence conjunct
asserting `statsIo()` and `realStatsIo()` make an identical `node:fs` call set — so PROP-RATIO-11
closes a genuine gap rather than duplicating cover. This is the right reason to add a `process`-level
property, and I would have raised its absence had the author not added it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | The §PLAN tasks preamble, rewritten this round, makes two present-tense claims about the repository that are false at HEAD. It says "the first implementation waves have since landed **ten of the fifteen** files" and that "`statsRealPaths.test.js` is legitimately **absent** because **wave 9 has not run**". Wave 9 has run: `statsRealPaths.test.js` is tracked at HEAD, landed by `9a3a70fd9` ("T-18 — 🟢 Real-path acceptance tests over the live archive"), and T-19's `statsProperties.test.js` landed at `ca8031311`. Checking every file in PLAN's File Ownership Manifest with `git ls-files --error-unmatch`, **all sixteen are tracked**, not ten. The paragraph exists solely to state repository status and to assert completeness over the table ("No row names a file that is neither shipped nor declared new"), and its one worked example is the file most clearly present — so the error is in the load-bearing clause, not in decoration. Concretely: correct the count, and either drop the `statsRealPaths.test.js` sentence or restate it as present at `9a3a70fd9`. The T-18/T-19/T-20 rows still marked `(new)` are consistent with the preamble's own definition of `(new)` ("created by this feature, not absent today") and need no edit if the preamble is fixed. | §PLAN tasks → preamble ("All fifteen new test files were confirmed absent when this table was first written…") |

FINDING: High | delta | local | §PLAN tasks preamble | Rewritten preamble claims wave 9 has not run and `statsRealPaths.test.js` is absent; the file is tracked at HEAD (`9a3a70fd9`, T-18) and all sixteen manifest files are tracked, not ten of fifteen.

**Provenance `delta`, not `inherited`:** the entire paragraph is new in this round's diff. The
pre-round bytes said "All fifteen new test files were confirmed **absent** at HEAD" — also stale,
which is exactly why the author rewrote it — but the specific false claims about wave 9 and
`statsRealPaths.test.js` did not exist before this edit. The round replaced one stale sentence with
a differently-wrong one, so this is the delta's own defect.

**Locality `local`:** it sits inside the §PLAN tasks section this round changed, in the very lines
the diff added.

**Why High rather than Medium.** Under the frozen-round rule a finding may block only if the delta
introduced it, or if a load-bearing claim contradicts the repository at HEAD. This satisfies both
limbs independently. I would ordinarily weigh status bookkeeping as Medium, and I want to be
explicit that no property's assertion, oracle or trace is wrong because of it. What lifts it is
that the paragraph's *only job* is to state repository status accurately, it was added this round
to fix exactly this class of staleness, and it asserts completeness while naming a present file as
absent. An implementer reading it concludes that wave 9 is outstanding work. The fix is two
sentences and needs no decision from anyone.

**Nothing else in the delta is gating.** I found no other contradiction with HEAD, and every other
changed row verified against the code it names, as recorded in §Oracles.

DEFERRED: T-11's row still reads "(both new)" for two files tracked since `54652b40f`; consistent with the preamble's definition of `(new)`, so no edit is owed once F-01 is fixed, but a commit anchor there would match the T-09/T-10 rows' precision.
DEFERRED: PROP-RATIO-05 pins the literal regex `/(?<![A-Za-z])statSync\s*\(/` while the shipped oracle (`stats-cli-structure.test.js:259`) extracts full `<word>Sync(` call names into a set — semantically equivalent, and the shipped form is arguably the better oracle, but the property and the implementation spell the mechanism differently.
DEFERRED: PLAN T-10's baseline note that "HEAD's `bin/cli.mjs` carries neither `statSync` nor `lstatSync` anywhere" is stale now that T-17 landed `lstatSync` at `bin/cli.mjs:1302`; it reads as a statement of the pre-implementation baseline, so I am not raising it as an upstream erratum.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With wave 9 landed, is PROP-RATIO-11 expected to arrive as an amendment to T-09's already-shipped `stats-cli.test.js` rather than as part of a first red wave? The property and PLAN T-09 both read as if T-09 is still ahead; the sequencing is an orchestration matter, not a PROPERTIES defect, so I have not filed it as a finding. |

## Positive Observations

- PROP-ERR-10's restatement replaces an overclaim with a bounded claim plus a widened corpus plus a
  recorded residual (G-8). That is the honest shape for a behaviourally-collected enum oracle, and
  it resisted the easy fix of reading the reason enum from a module constant — which would have been
  the oracle that agrees with a wrong implementation.
- PROP-RATIO-11's justification is the strongest new prose in the document: it identifies that
  helper-level evidence plus a call-set equivalence conjunct is a *chain*, not direct evidence on
  the shipped seam, and adds the one `process`-level leg that breaks the chain. I verified the
  equivalence conjunct it refers to actually exists.
- `F-CLI-SYMLINK`'s `--cwd` requirement carries its CI reason inline. That is a real constraint I
  confirmed against `pr-tests.yml`, and stating it in the fixture saves an implementer a red run.
- The T-09 row's caveat that the symbolic-link leg is *not yet* in the shipped file is precise and
  true. The document is capable of accurate status bookkeeping — which is why F-01 is worth fixing
  rather than tolerating.
- My v4 F-01 was resolved in all four of its halves, and the resolution was checked against FSPEC
  rather than assumed.

## Recommendation

**Needs revision**

One High finding (F-01), delta-introduced and local: correct the §PLAN tasks preamble's file count
and drop or restate the `statsRealPaths.test.js` sentence. No property, oracle, fixture or trace
needs to change. Everything else in this round's delta verified against code and stands.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
