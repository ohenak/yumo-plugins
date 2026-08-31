# Cross-Review: test-engineer — PLAN (round-2 delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4 (delta re-review of PLAN v1.2, which addresses `CROSS-REVIEW-test-engineer-PLAN-v2.md` F-01…F-05)

## Overview

**What this round is.** My v3 was an upstream-cascade confirmation over byte-unchanged PLAN
content. This round is a real delta: `8ed55ead..HEAD` moves 58 insertions / 47 deletions across six
commits, five of them named for my v2 findings (te F-01…F-05) and one a version-header/changelog
commit. Frozen round, so the only question I answer is whether the revision broke something that
worked before, or asserts something the repository at HEAD contradicts. Improvements I would make
differently are recorded as `DEFERRED:`, not as findings.

**What changed.** Header `1.1 → 1.2` plus a v1.2 changelog paragraph; the Overview's standing-cost
premise sentence; T-08's status cell (`⬚ → ✅`); T-09's row (new symbolic-link leg); T-10's row
(boundary-anchored matcher, qualifier dropped); T-21's worked-exclusion clause; T-23's and T-24's
quoted strings; the File Ownership Manifest (new `Batch(es)` column plus a reading note); and two
rows of the anti-drift coverage table.

**Every claim the delta introduces is true at HEAD.** I re-measured all five rather than reading
them off the PLAN or the TSPEC:

| Delta claim | Measurement | Result |
|---|---|---|
| `bin/cli.mjs` contains neither `statSync` nor `lstatSync`; its only `fs` predicate is `fs.existsSync`, `pdlc/engine/bin/cli.mjs:262` | `grep -c 'statSync' pdlc/engine/bin/cli.mjs`; `grep -n 'fs\.[a-zA-Z]*'` | **0** `statSync` occurrences; exactly one `fs.` call site — `fs.existsSync(path.join(dir, ".git"))` at **`:262`**. Both halves exact |
| The naive substring matcher is unfalsifiable; the boundary-anchored one is not | `node -e` over the real file and over a `lstatSync(p)` sample | naive `includes("statSync")` is **true** on `lstatSync(p)`; `/(?<![A-Za-z])statSync\s*\(/` is **false** on it and matches HEAD's `cli.mjs` **zero** times. The matcher does what the row says it does |
| `document-oracles.mjs` is imported only by `documentOracles.test.js`; `advisoryWaveGate.test.js` merely names it in a comment, `:140` | `grep -rn document-oracles pdlc/ --include=*.js --include=*.mjs` | one `import` — `documentOracles.test.js:27`. `advisoryWaveGate.test.js:140` is a **comment** (`// same self-reference reason \`documentOracles.test.js\` and …`). `:140` is exact |
| `assertAdditiveOnly`'s message, transcribed verbatim | `grep -n 'delta over baseline'` | source reads `` `${label}: delta over baseline must be exactly the two new members, got ${JSON.stringify(actual)}` `` — the PLAN's quote is **character-exact** up to its `…` elision |
| P9-02's second test title, transcribed verbatim, `coverageInstrumentation.test.js:278` | `grep -n 'resolves the two new'` | `:278` — `test("P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)"` — **exact**, and the line number is right |

The v2 round's diagnosis was that the prior transcription dropped the leading `the`. It is back.

**The one delta claim that is a genuine strengthening, not a correction.** te F-02's fix does more
than swap a matcher: the row now states *why* the matcher is normative ("a naive
`source.includes("statSync")` matches the *correct* `lstatSync` and so can never red — the conjunct
would be unfalsifiable"). That is the sentence an implementer needs, because the naive form is the
one a hurried hand writes and it passes forever. Adding the reason to the PLAN, not only the regex,
is what makes the fix survive a re-write. Same for the dropped `in the \`stats\` seam` qualifier —
the PLAN now justifies the whole-file scope from a measurement (`cli.mjs` has neither spelling at
HEAD), so the assertion needs no seam boundary anybody could argue about.

## Batches

**te F-01 (EC-19 has behavioural evidence on the shipped seam) — landed, and landed correctly.**
This was my strongest v2 finding: EC-19's "the link's own size, never the target's" was proven only
over T-02's `realStatsIo()` helper (a helper *this PLAN asks the implementer to write*, so the
oracle and the thing it guards could drift together) and over T-10's source-level `lstatSync`
conjunct (which proves a spelling, not a byte count). T-09's row now carries the third leg on the
production path: `main()` under `--cwd` over a temp root, one small regular file plus a symlink
whose target is "very much larger", asserting the reported byte total counts the link's own size.
The row states its own falsifier — "A `statSync` implementation of `statsIo().fileSize` reds here" —
and it states *why* the other two legs do not substitute. That is the production-path-≠-unit-path
distinction written down, which is what I asked for.

Two things I checked before accepting it. First, the leg is genuinely behavioural: it runs
`main([...])` over the production `statsIo`, not over a double, so it is not a fourth restatement of
the source-level conjunct. Second, it does not collide with T-18: T-18's leg runs the workflows-side
`realStatsIo()` over a real fs (`integration-fs`, PROPERTIES PROP-RATIO-04), T-09's runs the engine
CLI end-to-end. Different suites, different seams, both real filesystems — additive, not duplicated.

**te F-02 (boundary-anchored matcher) — landed.** T-10's `lstat`-not-`stat` conjunct is now
whole-file, boundary-anchored, and self-justifying. Verified above that the regex behaves as claimed
and that HEAD's `cli.mjs` gives it zero matches, so the conjunct is red-on-day-one in the honest
sense: it passes at HEAD vacuously and becomes load-bearing the moment T-17 writes `lstatSync`.

**te F-03 (sole consumer) — landed, and the citation is exact.** Both the Overview premise and
T-21's promoted-constraint text now say `documentOracles.test.js` is the **sole importer** and that
`advisoryWaveGate.test.js` "merely mentions it in a comment and is **not** a consumer". Measured:
one import at `documentOracles.test.js:27`, one comment at `advisoryWaveGate.test.js:140`. This
matters beyond tidiness — the worked exclusion is the whole argument for scoping the promoted
DOMAIN-CONSTRAINT to *runtime reachability* rather than to `pdlc/workflows/lib/` membership, so an
overstated consumer list would have weakened the constraint T-21 promotes.

**te F-04 (verbatim quoted strings) — landed for both strings; one line anchor is off by a line.**
The quoted text is exact in both cases (see the Overview table). T-24's anchor, `:278`, is exact.
T-23's anchor, `loop-distribution.test.js:73-77`, is not: the message literal sits at **`:77`** and
the `assert.equal(` that carries it spans **`:74-78`**, so the cited range starts on a closing brace
(`:73`) and stops one line short of the call's close. The implementer reading `:73-77` still lands
on the right five lines and the quote itself disambiguates, so this costs nothing operationally —
but a line anchor is a claim, and this one is wrong by a line at each end. **F-02, Low, delta,
local.**

**te F-05 (manifest column) — landed, and I re-derived the whole column rather than spot-checking.**
Every `File` cell is now a bare path; the batch lives in its own `Batch(es)` column; and the reading
note explains the rule for the next feature ("add a column, never decorate a path"). I extracted the
task table's `Batch` column mechanically and compared it row-for-row against the manifest:
T-01/T-02 → 1; T-03…T-11 → 2; T-12 → 3; T-13 → 4; T-14 → 5; T-15 → 6; T-16 → 7; T-17 → 8;
T-18/T-19/T-20 → 9; T-21…T-25 → 10; T-26/T-27 → 11. **All 36 manifest rows agree with the task
table.** T-11's two files both carry `2`, T-21's five all carry `10`, T-26 and T-27 both carry `11`.
No divergence.

**Same-new-file guard, re-run because the manifest was restructured.** The restructuring is exactly
the kind of edit that can silently create a same-batch/same-file collision, so I re-derived it
rather than inheriting v1's clearance. `pdlc/workflows/lib/stats.mjs` is the only multi-row file and
its five rows sit in five **distinct** batches (3, 4, 5, 6, 7), serialized by the T-12 → T-13 →
T-14 → T-15 → T-16 chain. Every other path appears once. Batch 2's eleven rows are eleven distinct
files; batch 10's thirteen rows are thirteen distinct files. **No collision.** The new column makes
this checkable by a grouping pass instead of by eye, which is the point of the fix.

**T-08's status cell `⬚ → ✅` — checked against the tree, and it is honest.** A red-test task marked
Done while its declared dependency T-02 is still `⬚` is exactly the shape that hides a false green,
so I read the artifact. `pdlc/workflows/__tests__/statsAntiDrift.test.js` exists and is **tracked**
(135 lines), imports `parseReviewFilename` from the real `../orchestrate-dev.js` at top level, and
imports nothing from T-02's `helpers/statsDoubles.js` — so T-08 genuinely does not depend on T-02's
artifact and the ledger is not claiming work that could not have happened. The file's header states
that the `lib/stats.mjs` halves load by dynamic `import()` inside `.skip`-wrapped bodies "until T-12
lands, at which point the owning task un-skips this exact block (never writes a new test beside
it)". That is the right arrangement — the skip is scoped to the deferred half, the file still loads,
and the un-skip has a named owner. No finding.

## Dependencies

**No dependency edge moved, so the batch DAG is not re-litigated.** The delta edits five task
descriptions, one status cell and a table's column layout. It adds no task, removes none, and
changes no `Deps` cell. I confirmed this directly from the diff: every `| T-nn |` row that changed
kept its trailing `Batch` and `Deps` fields byte-identical. The arithmetic I checked mechanically at
v1 (`batch == max(dep batch) + 1`, acyclic, unique ids, every dependency resolving) therefore still
holds unchanged, and re-deriving it would be re-litigating an approved section.

**One edge deserved a second look because T-09's scope grew.** T-09 sits in batch 2 with deps
`T-01, T-02`, and the delta gives it a new obligation — a real-filesystem symlink under a temp
`--cwd`. Does the enlarged task still fit its batch? Yes, and for a reason worth writing down: the
new leg depends on nothing this PLAN builds. It drives `main()` and the production `statsIo`, both
of which T-17 supplies in batch 8, so the leg is *red* in batch 2 exactly as the rest of T-09's row
is red — that is the task's declared colour (🔴). It needs no fixture from T-02 and no constant from
T-12. The edge set is unchanged because the dependency set genuinely is.

**TDD order is preserved by the delta, not merely undisturbed by it.** The new evidence was added
to a red-test task (T-09, batch 2), eight batches ahead of the implementation task that makes it
pass (T-17, batch 8). The alternative — bolting the symlink check onto T-17 — would have shipped
the oracle and the code it guards in the same batch, which is the failure mode `[Fake first]` and
the red-before-green rule exist to prevent. The author put it in the right place.

**The batch-10 narration line I flagged in v3 (F-01) is untouched.** PLAN's batch-10 gate note still
says `assertAdditiveOnly` "goes red as soon as the first enumeration moves", while TSPEC §6.4 now
scopes the trigger to the four enumerations that oracle actually *reads* (sites 1–4). T-24's
`c8.include` edit is in batch 10 and is not one of them, so an implementer who lands T-24 first sees
green where the sentence promised red. This is inherited, not delta — the round did not touch the
sentence — and it stays Low for the reason v3 gave: the batch gate is measured at batch end, and
T-21, T-22 and T-25 all do move sites 1–4 within the same batch. **F-04, Low, inherited,
nonlocal.**

**T-04's contested AT-17 leg (v3 F-02) is also untouched.** TSPEC §4.3 still carries the live
REQ-STATS-06 v1.6 (`measured`) versus FSPEC BR-16 v1.7 (`harvested`) disagreement, §8.3 still routes
it, and T-04's row still gives its implementer no signal to read §8.3 before writing that fourth
conjunct. Inherited, unchanged by this delta, and non-gating for the same reason as before: the leg
exists, is owned, and has a defined expectation today. **F-05, Low, inherited, nonlocal.**

## Verification

**The delta touched the coverage tables, so I re-read both.** The anti-drift table gains two things:
T-10's `lstat` row is rewritten to carry the boundary-anchored matcher and the "never the naive
substring, which `lstatSync` satisfies" gloss, and a **new row** is added — "AT-15/EC-19
behaviourally on the **shipped** seam — `main()` over the production `statsIo` with `--cwd` on a temp
root containing a symlink | T-09 | engine". Both edits are faithful to the task rows they summarise.

**The acceptance-test coverage table was not updated to match.** Its AT-15 row still reads
`T-04 (size arithmetic, removal probe), T-18 (symbolic-link leg, real fs)` — T-09 is absent, even
though the anti-drift table two subsections later attributes AT-15/EC-19's shipped-seam leg to T-09
and T-09's own task row now carries it. The two tables disagree about who owns AT-15. This does not
lose coverage and does not mislead the implementer, who reads the task row: the table's own preamble
says every AT is owned by "**at least one** task", so naming T-04 and T-18 is not false. But the
delta created the divergence, in a section the delta edited, and the fix is one cell. **F-01, Low,
delta, local.**

**Claims-verified-at-HEAD block: re-measured, all five enumerations still true.** These predate the
delta, but the delta's premise sentence leans on them, so I measured rather than inherited:

| Claim in PLAN | Measured at HEAD | Verdict |
|---|---|---|
| `prepack.mjs` `MODULE_NAMES` — four entries, ending `lib/escalation-view.mjs` | `:20-25`, four entries, last is `"lib/escalation-view.mjs"` | exact |
| `publish-preflight.mjs` `WORKFLOW_MEMBERS` — five `vendor/workflows/…` entries | `:220-226`, five | exact |
| `fixture-machine.mjs` `WORKFLOW_MODULE_NAMES` — four entries | `:426-431`, four | exact |
| `_tspec-packed-set.mjs` `tspecPackedCount` — `4 + 15 + 5 + 1` | `:99`, `return 4 + 15 + 5 + 1 + (licence ? 1 : 0)` | exact |
| `package.json` `c8.include` — seven `**/`-anchored entries | `json.load(...)` → **7** | exact |
| `document-oracles.mjs` in **none** of the four enumerations | absent from all four above | exact |
| `pdlc/workflows/lib/` holds three modules; `stats.mjs` **does not exist** | `git cat-file -e HEAD:…/lib/stats.mjs` → *exists on disk, but not in HEAD* | exact **as written** — the claim is HEAD-scoped, and at HEAD it holds |

That last row is worth a sentence. `pdlc/workflows/lib/stats.mjs` is now present in the working tree
as an untracked file, produced by the in-flight implementation wave. The PLAN's claim is explicitly
scoped "at HEAD" and every manifest row still declares the file `new`, so nothing in the document is
false — but a later reader running `ls` rather than `git cat-file` will think it is. Recording as
`DEFERRED:`, not as a finding: the document says what it means, and the divergence is the wave's
state, not the PLAN's error.

**Oracle quality of the one new test the delta specifies.** I applied the three bars this round asks
for to T-09's symlink leg:

- *Implementation echo?* Borderline but acceptable at PLAN altitude. "The reported byte total counts
  the link's own size" would become an echo if the implementer wrote
  `expect(total).toBe(small + lstatSync(link).size)` — deriving the expectation from the same syscall
  the seam under test uses. The safe form takes the link's size as a literal fixture constant. The
  PLAN does not specify the assertion's shape, and assertion-shape is TSPEC/PROPERTIES altitude, so
  this is not a PLAN defect; I flag it as a `DEFERRED:` note for whoever writes the test.
- *Absence-only oracle?* No. The row asserts a positive quantity (the total equals the link's own
  size contribution), not `total != targetSize`. It also names its falsifier explicitly.
- *Set-equality where an enumeration is at stake?* Not applicable — this is a scalar arithmetic
  oracle, and the enumerations in this PLAN (doc-type catalogue, exclusion set, construction-site
  count, `c8.include` `toEqual`, read-only snapshot) already carry set-equality, unchanged by the
  delta.

**Downstream trace now under-names the evidence.** `PROPERTIES-pdlc-stats.md:169`'s PROP-RATIO-04
traces EC-19/AT-15 to "PLAN T-18" alone and argues the property must be "falsified against a real
filesystem, not a fake". T-09's new leg satisfies that argument at least as strongly — it is the
production CLI over a real temp filesystem. PROPERTIES is downstream of PLAN, so this is not an
erratum against a document this one derives from; it is a trace row the next PROPERTIES touch should
widen. `DEFERRED:`.

**Coverage floor and the green gate are unmoved.** T-24 still carries the per-file obligation
(`lib/stats.mjs` branches ≥ 85) and the `c8.include` pair oracle (declared literal + resolved c8
run) is still T-24's in the anti-drift table. The delta corrects T-24's quoted title without
touching either. T-26's four mutants and their named killing tests are byte-unchanged.

DEFERRED: T-09's symlink leg should pin the link's own size as a literal fixture constant rather than re-reading it via `lstatSync` in the expectation — TSPEC/PROPERTIES altitude, not a PLAN defect.
DEFERRED: `PROPERTIES-pdlc-stats.md:169` PROP-RATIO-04 traces EC-19/AT-15 to PLAN T-18 only; T-09 now carries the same evidence on the shipped seam.
DEFERRED: `pdlc/workflows/lib/stats.mjs` now exists untracked in the working tree while the PLAN's (correct, HEAD-scoped) claim says it does not exist.

## Delta-Confirmation Findings

All five v2 findings (te F-01…F-05) are resolved. No High finding is open, delta or inherited. Two
Low findings are new to this round, three are carried forward unchanged.

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The acceptance-test coverage table's AT-15 row still names only T-04 and T-18, while the delta added T-09's shipped-seam AT-15/EC-19 leg to both the anti-drift table and T-09's task row. The two tables disagree about AT-15's owners. Non-gating: the preamble says "at least one task", so the row is incomplete rather than false, and the implementer reads the task row. Fix is one cell | PLAN §Verification, Acceptance-test coverage, AT-15 |
| F-02 | Low | delta | local | T-23 cites `loop-distribution.test.js:73-77` for `assertAdditiveOnly`'s message. The quoted text is character-exact, but the literal sits at `:77` and its `assert.equal(` spans `:74-78` — the range starts on a closing brace and stops a line short. Costs nothing operationally; a line anchor is still a claim | PLAN §Batches, T-23 |
| F-03 | Low | inherited | nonlocal | T-23 counts **nine** assertion edits on `loop-distribution.test.js`; TSPEC §2.1's row for the same file still says **eight**. PLAN is a superset and names the extra edit with its rationale, so no coverage is lost — transcription divergence in the upstream, predating this round | PLAN §Batches, T-23 |
| F-04 | Low | inherited | nonlocal | Batch-10 gate note says `assertAdditiveOnly` "goes red as soon as the first enumeration moves"; TSPEC §6.4 scopes the trigger to the four enumerations the oracle *reads* (sites 1–4), and T-24's `c8.include` edit is in batch 10 but is not one of them. An implementer landing T-24 first sees green where red was promised. Bounded: T-21, T-22 and T-25 all move sites 1–4 in the same batch, and the gate measures at batch end | PLAN §Batch gates, batch 10 |
| F-05 | Low | inherited | nonlocal | T-04 owns AT-17, whose fourth leg is the single assertion site touched by the live REQ-STATS-06 v1.6 (`measured`) versus FSPEC BR-16 v1.7 (`harvested`) dispute (TSPEC §4.3, routed at §8.3). The row gives its implementer no signal to read §8.3 before writing that conjunct | PLAN §Batches, T-04 |

FINDING: Low | delta | local | PLAN §Verification, Acceptance-test coverage, AT-15 | AT-15's row names only T-04 and T-18, but the delta gave T-09 a shipped-seam AT-15/EC-19 leg and recorded it in the anti-drift table; the two coverage tables now disagree about AT-15's owners. Fix: add `T-09 (shipped seam, end-to-end)` to the AT-15 cell.
FINDING: Low | delta | local | PLAN §Batches, T-23 | The verbatim `assertAdditiveOnly` message is transcribed exactly, but its line anchor `loop-distribution.test.js:73-77` is wrong at both ends — the literal is at `:77` and the `assert.equal(` call spans `:74-78`. Fix: cite `:74-78` (or `:77` for the literal alone).
FINDING: Low | inherited | nonlocal | PLAN §Batches, T-23 | T-23 says nine assertion edits on `loop-distribution.test.js` where TSPEC §2.1 says eight; PLAN is a superset and names the ninth with rationale, so no coverage is lost. Recorded so a later reader does not misread it as this round's damage.
FINDING: Low | inherited | nonlocal | PLAN §Batch gates, batch 10 | "Reds as soon as the first enumeration moves" reads wider than TSPEC §6.4's edited scope (the four enumerations `assertAdditiveOnly` reads, sites 1–4); T-24's `c8.include` edit is in batch 10 and is not one of them. Fix: scope the sentence the way §6.4 now does.
FINDING: Low | inherited | nonlocal | PLAN §Batches, T-04 | AT-17's fourth leg is the only assertion site touched by the live REQ-STATS-06 v1.6 / FSPEC BR-16 v1.7 dispute (TSPEC §4.3, §8.3). Fix: one clause on T-04 naming that leg as a re-stamp site when §8.3's reconciliation lands.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 5}
