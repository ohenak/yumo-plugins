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

**No edge changed.** The revision touched one dependency *rationale* (T-18) and the
File Ownership Manifest's presentation, not the graph. The batch column, the `Deps`
column and the acyclicity property are byte-identical to the version approved on
arithmetic in round 1, so the 27-row re-derivation is not repeated.

**T-18's rationale is now internally consistent — this was round-1 F-06.** The old text
justified `T-18 → T-17` by claiming T-18 "runs the shipped command", which contradicted
the row's own suite placement (`pdlc/workflows/__tests__/statsRealPaths.test.js`, while
the Overview puts CLI-driving tests in the engine suite). The new text states the real
reason: T-18 runs workflows-side over `realStatsIo()`, and that helper is only
trustworthy once the seam it mirrors exists and is pinned — T-17 authors `statsIo()`,
T-10 pins the equivalence. The edge is therefore justified by a *dependency*, not by a
misdescription, and T-09 is correctly named as the place the shipped command is
exercised. Accepted.

**File Ownership Manifest — the split is safe, with one presentational cost.** The
single row

`| **pdlc/workflows/lib/stats.mjs** | T-12 (creates, b3), T-13 (b4), T-14 (b5), T-15 (b6), T-16 (b7) | new |`

became five rows, each naming one task, with the batch carried in a parenthetical after
the path (`**pdlc/workflows/lib/stats.mjs** (creates it, batch 3)`, `… (batch 4)`, …).
The safety property the manifest exists to protect is unchanged and still holds: the
five writers sit in five *distinct* batches (3, 4, 5, 6, 7) chained by real `Deps`
edges T-12 → T-13 → T-14 → T-15 → T-16, so no two concurrent implementers can write the
file and silently drop each other's work. The same-new-file guard is green.

The cost is that the manifest's first column no longer holds bare paths for this file:
a mechanical same-batch/same-file grouping pass keyed on the column text now sees five
distinct keys. That is a Low (F-05), not a correctness problem — the parenthetical is
outside the backticked path, so a reader and a path-extracting matcher can both recover
it — but the convention is worth stating once so a future feature does not disambiguate
by mutating the path itself.

**Batch-10 disjointness re-checked for the delta.** T-21, T-23 and T-24 all grew text in
this revision; none gained a *file*. T-21 still owns `{prepack.mjs, run.test.js,
learningsPremises.test.js, pdlc/README.md, DOMAIN-CONSTRAINTS.md}`, T-23 still owns
`{loop-distribution.test.js}` alone, T-24 still owns `{package.json,
coverageInstrumentation.test.js}`. No new overlap was introduced, and T-20's
deliberately-red gate still precedes all five clusters.

## Verification

**AT coverage — still set-equal, and the preamble is now true.** The revision changed
the ownership claim from "exactly one task" to "at least one task, and where ownership
is split the split is named in the row". That is the honest statement: AT-04, AT-18,
AT-24, AT-26 and now AT-15 are split across suites for real reasons. The AT-15 row now
reads `T-04 (size arithmetic, removal probe), T-18 (symbolic-link leg, real fs)`, which
matches both task rows. The id set is untouched — 29 ids, AT-01…AT-28 plus AT-14b,
each named at least once, none named that FSPEC does not define. Set-equality holds in
both directions, as in round 1.

**Anti-drift oracle table gained two rows, both real oracles.** The parser-identity row
now names both conjuncts rather than one, and two rows were added: the `lstat`-not-`stat`
seam (T-10, engine) and AT-15's symbolic-link leg over a real filesystem (T-18,
workflows). Each is falsifiable at HEAD — the first because `bin/cli.mjs` contains no
`lstatSync` yet, the second because a `statSync`-shaped `fileSize` returns the target's
size and reds the assertion. Neither is absence-only: both assert what the value *is*
(the link's own size; the named call present), not merely what it is not.

**Corrected measurements — both re-measured, both now right.** `pdlc/workflows/lib/`
holds three modules at HEAD (`document-oracles.mjs`, `escalation-view.mjs`,
`loop-session.mjs`), and `pdlc/workflows/__tests__/helpers/` holds 20 `.js` modules
(`adapterHarness.js` … `skipSinkTeardown.js`). Round 1 flagged "two" and "21"; the
document now states three and 20. `stats.mjs` still does not exist, so every row naming
it correctly declares it new.

**The co-change premise is now stated as a testable discriminant.** This is the most
valuable non-finding change in the revision. "Any module in `pdlc/workflows/lib/` owes
the vendoring co-change" was false at HEAD and the counterexample was already on disk;
"any module the shipped engine loads at runtime owes it" is true, and the document now
carries the counterexample as its worked exclusion in both the Overview and T-21. I
re-measured the exclusion in all five enumerations plus the built artifact and it holds
everywhere. Because T-21 promotes this text into `docs/_constraints/DOMAIN-CONSTRAINTS.md`,
its accuracy outlives this feature — which is why F-03's one-word overstatement inside
it is worth correcting before it is promoted.

**Coverage floor — unchanged and still verified at the gate command.** T-24 still
carries the per-file obligation (`lib/stats.mjs` clears branches ≥ 85) and the floor is
still enforced by `c8 report --check-coverage --per-file --branches 85` over a
membership the task actually edits, not by source-list membership. The addition of the
second P9-02 test to T-24's instruction closes round-1 F-07: the resolution oracle at
`coverageInstrumentation.test.js:278` is now named as an artifact to edit, so a glob
that is declared but does not resolve is caught rather than assumed.

**Mutation evidence — the ownership hole is closed.** Round-1 F-03 was that the
`unmeasurable`/`harvested` mutant's killing test was described nowhere and owned by no
one. T-04 now names the fixture and T-26 states in terms that it authors no test file,
naming T-04 and T-18 as the owners of the suites it runs and stating that a surviving
mutant is remediated inside the owning task's file. That converts a predictable
batch-11 stall into a pre-declared route.

**What the revision did not have to touch, and correctly did not.** The 27-row batch
arithmetic, the TDD pairing (every 🟢 row preceded by a 🔴 row against the same test
file and named ATs), the `[Fake first]` labelling of T-02, T-20's deliberately-red
co-change gate, the four-check CI enumeration and the real-path literals-as-measurements
convention are all unchanged. None was a round-1 finding and none is re-opened.

## Findings

All four are new to this round; every round-1 finding landed. None is High.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-15's symbolic-link behaviour is proved over the test helper, never over the shipped seam.** T-18's new leg runs over T-02's `realStatsIo()`; the production `statsIo()` in `bin/cli.mjs` is covered for this behaviour only by T-10's *source-level* conjunct. That combination does kill the `statSync` mutant (T-10 reds), so the round-1 High is discharged — but the only behavioural evidence that the shipped command counts a link's own size is a helper that the same PLAN asks an implementer to write. **Fix (cheap):** add the symlink case to T-09's existing real-path conjunct, which already runs `main()` over the production `statsIo` with `--cwd` — one temp root containing a symlink, asserting the byte total, gives the shipped seam a behavioural oracle for EC-19 rather than a textual one. | T-18, T-10, T-09 |
| F-02 | Medium | Local | **T-10's `statSync`-absence conjunct is unfalsifiable under a naive matcher, because `lstatSync` contains `statSync`.** The row says `bin/cli.mjs`'s source "contains no `statSync` call in the `stats` seam" without naming the matcher or delimiting the seam; `source.includes("statSync")` matches the *correct* implementation, so the oracle either never reds or always reds. HEAD makes the precise form easy: `pdlc/engine/bin/cli.mjs` contains no `statSync` and no `lstatSync` at all (its only `fs` predicate is `fs.existsSync`, `pdlc/engine/bin/cli.mjs:262`), so a whole-file, boundary-anchored assertion is available. **Fix:** state the matcher — e.g. a boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` over the whole file — and drop the undelimited "in the `stats` seam" qualifier. | T-10, Anti-drift oracle table |
| F-03 | Low | Cross-Feature | **The promoted constraint text overstates `document-oracles.mjs`'s consumers.** Both the Overview and T-21 say it "is consumed only by `documentOracles.test.js` and `advisoryWaveGate.test.js`". Only the first consumes it — `pdlc/workflows/__tests__/documentOracles.test.js:27` imports `coveredViolations` and `EXEMPTIONS` from `../lib/document-oracles.mjs`; `advisoryWaveGate.test.js:140` merely *mentions* it in a comment. The exclusion itself is correct (the module appears in none of the five enumerations, nor in `pdlc/engine/`, nor in `pdlc/workflows/dist/pdlc-cli.mjs`). Tagged `Cross-Feature` because T-21 promotes this sentence into `docs/_constraints/DOMAIN-CONSTRAINTS.md`, where an inaccurate citation outlives the feature. **Fix:** name `documentOracles.test.js` as the sole consumer. | Overview §standing cost, T-21 |
| F-04 | Low | Local | **Two quoted strings differ from the shipped text an implementer will grep for.** T-24 quotes the second P9-02 title as `"P9-02: shipped c8 config resolves the two new lib/ modules too (F4)"`; the shipped title is `"P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)"` (`pdlc/workflows/__tests__/coverageInstrumentation.test.js:278`). T-23 quotes `assertAdditiveOnly`'s message as `"delta over baseline must be exactly two members"`; the shipped message is `` `${label}: delta over baseline must be exactly the two new members, got …` `` (`pdlc/engine/__tests__/loop-distribution.test.js:73-77`). Both targets are unambiguous, so this is a grep-friction nit, not a wrong instruction. **Fix:** transcribe both verbatim. | T-24, T-23 |
| F-05 | Low | Process | **The File Ownership Manifest now disambiguates duplicate rows by appending prose to the path column.** `**pdlc/workflows/lib/stats.mjs** (creates it, batch 3)`, `… (batch 4)` … give T-12…T-16 one row each so the PLAN contract lint parses them, and the safety property still holds (five distinct batches, chained by real edges). But the first column no longer holds a bare path, so a same-batch/same-file grouping pass keyed on that column sees five distinct keys. **Fix (either):** move the batch into its own column, or state once beneath the manifest that the path is the backticked span and the parenthetical is a disambiguator — so the next feature does not disambiguate by editing the path itself. | File Ownership Manifest |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-10 now reads a file owned by T-02 (`pdlc/workflows/__tests__/helpers/statsDoubles.js`) from a test in the **engine** suite, which CI runs as `cd pdlc/engine && npm test`. There is precedent — `loop-distribution.test.js` reads the real `pdlc/workflows/` checkout — so the path resolves in a dev checkout and in the `Engine tests` job. Is it worth stating the resolution base (repo root, not `pdlc/engine/`) in T-10's row, so the equivalence conjunct does not become the first engine test to red under a packed-tarball run? |
| Q-02 | Round-1 Q-02 stands unanswered and is now slightly larger: T-11's scratch-prefix exclusion (`.tmp-*`, created by the **workflows** suite) carries a guard conjunct requiring the exclusion to be non-empty and pre-run-empty, but T-11 runs in the **engine** suite where nothing creates that prefix. Is the guard expected green in CI, or does it depend on a local `npm test`-both run? |
| Q-03 | Round-1 Q-03 stands: batch 10 lands five clusters while `assertAdditiveOnly` and T-20's oracle are red mid-batch by design. Is the wave gate's `postWaveCommand` guaranteed to run at batch end rather than between tasks, or is that dispatcher convention? A mid-batch measurement would surface T-20's intended red as a wave failure. |

## Positive Observations

- **The revision fixed the premise, not just the finding.** Round-1 F-05 was filed as a
  two-number measurement error. The author traced it back and found that the *rule* it
  supported — "a module in `pdlc/workflows/lib/` owes the vendoring co-change" — was
  false at HEAD, with the counterexample already on disk. Replacing it with runtime
  reachability, and carrying `document-oracles.mjs` as the worked exclusion into the
  constraint T-21 promotes, is a strictly better outcome than the correction I asked
  for.
- **F-01 was answered on both arms, not the cheaper one.** The round-1 finding offered
  behaviour or mechanism and said "ideally both". The revision took both: a real-fs
  falsifying leg in T-18 *and* a named-call structural conjunct in T-10, with the
  reasoning for each stated in the row rather than in a changelog.
- **T-04's disclaimer is the right shape.** Rather than quietly dropping the symlink leg,
  the row states that it is *not* claimed there and gives the reason a fake cannot see
  the difference. A future reader who wonders why the metrics suite skips EC-19 finds
  the answer at the point of doubt.
- **T-26's "authors no test file" is a small line that prevents a real stall.** Declaring
  that the `Test File` column names suites it runs, both single-owned elsewhere, keeps
  the manifest's ownership invariant intact and pre-declares where a surviving mutant
  gets fixed.
- **Every new claim in the delta is measurable, and every one I measured was true** —
  `run.mjs:90`, the two `CODE_REVIEW` files, the seven `c8.include` entries, the ninth
  assertion site at `loop-distribution.test.js:228`, the second P9-02 test at
  `coverageInstrumentation.test.js:278`, the three `lib/` modules, the 20 helpers. Only
  F-03's consumer list and F-04's two quotations drift from what is on disk, and both
  are one-word corrections.

## Recommendation

**Approved with minor changes**

The round-1 High is discharged: AT-15's symbolic-link behaviour now has a real-filesystem
falsifying test in T-18, and the `lstat`-not-`stat` mechanism is named as a structural
conjunct on the shipped seam in T-10 — the mutant that motivated the finding now dies in
two places. All eight remaining round-1 findings landed, several with better fixes than
were asked for. No High finding is open anywhere in the document, so this does not gate
implementation.

Five findings are recorded and none blocks. Two are worth folding in before the wave
starts, because both are cheap and both concern the oracles that just replaced the High:
F-02 (name a boundary-anchored matcher, since `lstatSync` contains `statSync` and the
naive matcher makes the conjunct unfalsifiable) and F-01 (give T-09's existing
production-path conjunct the symlink case, so the shipped seam has behavioural evidence
and not only textual evidence). F-03 is worth correcting before T-21 promotes the
sentence into `DOMAIN-CONSTRAINTS.md`; F-04 and F-05 are transcription and presentation.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}

APPROVAL-HASH: sha256:1b901e265ec77d630c5b3ee38aba8d6b7698a90d63dce068b613187393e01e3e
APPROVAL-HASH-NORMALIZED: sha256:1b901e265ec77d630c5b3ee38aba8d6b7698a90d63dce068b613187393e01e3e
REVIEWED-COMMIT: 628cf244654070985c2ba3b38ae66ad879387c3f
UPSTREAM-STATE: REQ sha256:60a516fb2ede925b2428dca1bc8e4e61587c52827ea55b9e4965ea57b9a8f1c9
UPSTREAM-STATE: FSPEC sha256:25af3c47c218d8987d258c6bda917cb5fecd21014ec794864c4e7b9a1cafd7f8
UPSTREAM-STATE: TSPEC sha256:512a9fcfd425725363024ec856597da6918d6d376247be2271b2d4af0c0af81f
UPSTREAM-STATE: DECISIONS sha256:04267ef0e06ddea0a0fc22b85525b79aa55c1bf43024aa5814db1547e0657287
