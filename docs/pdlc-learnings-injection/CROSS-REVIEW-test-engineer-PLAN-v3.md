# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-20
**Iteration:** 3
**Base of the delta:** `94539626` (the commit at which v2 was written) → HEAD

## Overview

**Scope of this round.** Delta re-review of the seven commits between `94539626` and HEAD
(+35 / −15 lines on the PLAN). I read my v2 file, diffed the document against the commit I
reviewed, verified each of my six prior findings against the revised text and against the
repository, and scanned only the changed material for new issues. Sections I approved in v2 and
that the diff did not touch — the batch DAG, the file-ownership manifest's structure, LI-08, LI-09,
LI-11, LI-12, LI-16…LI-22, the measured coverage baseline — were not re-litigated.

**Disposition of the six v2 findings. All six are resolved.** None was resolved by wording alone;
each landed as a changed clause in the artifact the implementer transcribes from.

| v2 | Sev | What v0.3 does | Resolved |
|---|---|---|---|
| F-01 | Med | LI-23's `corpusOutcome` equality is scoped to **non-`null`** observations, with the reason stated (healthy value is `null`, three arms cannot be driven without observing it) and the wrong repair explicitly forbidden ("do **not** expect `LEARNINGS_CORPUS_OUTCOMES ∪ {null}`"); §Traceability's twelve-arm paragraph carries the same scoping | ✅ |
| F-02 | Med | The green-terminal gate row gains "**and** every pre-existing test's status is unchanged from the measured baseline, the same conjunct the other three rows carry", with batch 4's fixture-subtree risk named as the reason | ✅ |
| F-03 | Med | LI-07 restates AT-15 as **four** clauses, names the two fixtures in order, assigns (1) and (4) to LI-16 and (2)/(3) to LI-19, and says why (4) may not be dropped — "without it clause (1) is an absence-only oracle over path handling". §Traceability's AT-15 row carries the same split | ✅ |
| F-04 | Med | §The measured baseline restates the instrument: `execFileSync("git", ["status", "--porcelain"])` at the repository root, **no `-uno`**, so `-unormal` applies and a written-but-uncommitted new test file reds it | ✅ |
| F-05 | Low | `LI-T-SUITEMAP`'s closure is taken **over the directory**: enumerate `__tests__/learnings*.test.js`, compute the set of files registering ≥1 `LI-AT-` jest **title**, assert that set equal to the six, then partition. DoD 1 and batch 6's ladder row carry the same wording | ✅ |
| F-06 | Low | The `→ LI-06` edge is split: `LI-10, LI-11, LI-12 → LI-06` keeps the byte-identity reason; `LI-23 → LI-06` gets its own row stating it is **not** byte-identity but the shared L3 fixture matrix, and that the edge is slack | ✅ |

**Every resolution was re-measured against the repository, not read.** `consumerCleanup.test.js`'s
`AT-4.1` runs `execFileSync("git", ["status", "--porcelain"], {cwd: <repo root>})` and asserts
`""` with no `-uno` (`pdlc/workflows/__tests__/consumerCleanup.test.js:149-153`) — v0.3's restated
mechanism is exact. No `learnings*` file exists under `pdlc/workflows/__tests__/` at HEAD, so the
directory-wide closure has a clean field to start from. P-2a's four sites are still
`:12861`, `:12955`, `:13657` (object literal) and the positional `"authoring"` argument to
`runWrapped` inside `reviewLoop`'s FAIL path (`pdlc/workflows/orchestrate-dev.js:7659-7664`); the
other `"authoring"` occurrences are reads and `mode:` literals (`:6511`, `:6515`, `:6517`, `:6535`,
`:8886`), which the row's "object-literal `dispatchKind:` sites plus positional argument" keying
correctly excludes. P-4 holds: `enumerateCorpus` is exported at
`pdlc/workflows/consolidate-learnings.js:1349` and `LS_FILES_ARGV` is a module-private `const` at
`:1338`.

**Verdict of this round: Approved with minor changes.** No High findings, and none open from any
prior round. One Medium and three Lows, all of them consequences of the v0.3 edits themselves —
three are one-clause alignments that the revision made necessary and did not finish propagating,
and the Medium is a delegated positive assertion that no task row names.

## Batches

**Four task rows changed: LI-01, LI-07, LI-23, LI-14.** I checked each against the repository and
against the upstream text it transcribes.

| Row | Claim checked | Result |
|---|---|---|
| LI-01 | The premise suite drops the change-surface **absence** claims and keeps them as a one-time pre-flight (PM F-07) | ✅ — and this is the right call under my lens too: three of the four absences are falsified by this PLAN's own tasks at batches 1–4, so a standing assertion would red at batch 3 and halt every batch after it. Nothing is lost: `LI-T-IGNORE` conjunct (1) is the *positive* standing oracle over the same fact after LI-04 |
| LI-01 | P-2a as a **set equality over the four call sites**, keyed by enclosing function and argument position, so a fifth site reds at batch 1 (PM Q-04) | ✅ — the keying is well-defined and exact at HEAD. Three object-literal `dispatchKind: "authoring"` properties (`:12861`, `:12955`, `:13657`) plus the positional argument at `:7663`; `mode: "authoring"` at `:6517`/`:6535` and the reads at `:6515`/`:8886` are correctly outside the keyed set |
| LI-07 | AT-15 is **four** clauses, with (4) the positive half | ✅ — a literal transcription of `FSPEC:836-841`, and the row now states the falsifiability argument I made for it ("without it clause (1) is an absence-only oracle over path handling"). Naming `DISCARDED-NESTED` and `DISCARDED-DIRECT` "in that order" closes the fixture question the enumeration used to leave open |
| LI-23 | Non-`null` scoping on the `corpusOutcome` equality | ✅ for the equality; ⚠️ for the delegation it rests on — see F-01 below |
| LI-14 | Directory-wide closure, keyed on **registered test titles** | ✅ for the mechanism; ⚠️ for two consequences it does not finish propagating — see F-02 and F-03 |

**The directory closure is stronger than the fix I asked for, and it is sound at batch 6.** I
walked its arithmetic. The glob `__tests__/learnings*.test.js` matches twelve files by the end of
batch 6 — `Premises` (b1), `CaptureScript`, `PredicatePin` (b2), `Select`, `Block`, `Corpus` (b3),
`BaselineGuard` (b4), `Record`, `DispatchSet`, `Config`, `ArmInventory` (b5), `SuiteMap` (b6) — and
does **not** match `helpers/learningsFixtures.js`, which is one directory down. Six of those twelve
register `LI-AT-` titles; the other six register `LI-T-` titles only. The equality therefore closes
at six and stays closed for the life of the wave, since no task after batch 6 authors a new test
file (the manifest's remaining rows are all `orchestrate-dev.js`). The "no new `Deps` edge is
needed" argument is also correct in the direction that matters: a file that does not yet exist can
only fail to *contribute* a member, never add a spurious one, and the six that must be present are
exactly LI-14's six declared dependencies.

**The self-exclusion argument holds.** `learningsSuiteMap.test.js` matches its own glob and its
hand-transcribed literal mentions all 35 `LI-AT-` ids, so a textual scan would put the suite in its
own expected set and the equality would close at seven. Keying on *registered jest titles* — the
suite registers only `LI-T-SUITEMAP` — is what keeps it out, and the row says so explicitly. That
is the one detail an implementer would most plausibly get wrong, and it is stated.

**What the closure newly makes load-bearing, and does not say.** With the set taken over the
directory, the *naming* of every non-AT suite's tests is now a gate input: an `LI-AT-`-prefixed
title in `learningsPremises.test.js` or `learningsBaselineGuard.test.js` reds `LI-T-SUITEMAP` at
batch 6. Four of the six non-AT suites declare their test names in their rows — `LI-T-IGNORE` /
`LI-T-WORKTREE` (LI-03), `LI-T-PIN-1` (LI-13), `LI-T-ARMS-1…3` (LI-23), `LI-T-SUITEMAP` (LI-14).
LI-01's and LI-06's rows do not. Filed as F-02, Low.

**No same-batch same-new-file collision was introduced, and TDD order is unchanged.** No task rows
were added or removed this round (still 23), no `Test File` or manifest cell changed, and the two
rewritten green attributions (LI-16 for AT-15's clauses 1 and 4, LI-19 for 2 and 3) both name a
suite whose red predecessor — LI-07 — is already a declared dependency of both. Every
implementation task still has a preceding red-test row referencing the same suite.

## Dependencies

**The batch column did not move, and I confirmed that rather than assuming it.** No task row was
added, removed, or had its `Deps` cell edited this round; the only change under §Dependencies is
the edge-rationale table, where one row was split into two. My v2 re-derivation over all 23 rows
therefore still stands unchanged — 23 ids unique, every dependency resolving to a declared row,
graph acyclic, `batch == max(dep batch) + 1` for every row.

**The split edge rationale is now true of both subjects (F-06).** v0.2 read
`LI-10, LI-11, LI-12, LI-23 → LI-06 | data | the L3 byte-identity claims (AT-23, AT-24, AT-31)`.
v0.3 splits it:

- `LI-10, LI-11, LI-12 → LI-06 | data | the L3 byte-identity claims (AT-23, AT-24, AT-31) compare
  against committed baseline prompts` — true of all three subjects; AT-23/24/31 all live in
  `learningsDispatchSet.test.js` (LI-11) and the record/config suites share the capture.
- `LI-23 → LI-06 | data | **not** byte-identity — LI-23 carries no FSPEC AT and asserts nothing
  about bytes; its reason is the L3 fixture matrix the twelve arms are driven through … The edge is
  slack: LI-23 sits in batch 5 either way` — which is the correction I asked for, stated more
  precisely than I stated it, and with the slackness declared so a future reader does not mistake
  the edge for an ordering constraint that could be tightened.

**LI-14's wider read introduces no new edge obligation, and the row's argument for that is sound.**
This was the one place the F-05 fix could have quietly changed the DAG. It does not: the closure
reads twelve files but *asserts* only that the AT-registering set equals six, and all six are
already declared `Deps` of LI-14 (LI-07…LI-12). The four extra files read at batch 6 —
`Premises` (b1), `CaptureScript`, `PredicatePin` (b2), `BaselineGuard` (b4) — are all in strictly
earlier batches, so they exist whether or not an edge names them, and an absent file could only
under-contribute. The batch column is correct at 6 with the existing six edges.

**One consequence for later batches, checked and clean.** A directory-wide set equality that closes
at batch 6 must keep closing through batch 14, or `LI-T-SUITEMAP` becomes a new red inside the
mixed-gate ledger. It keeps closing: batches 7–14 are the eight `orchestrate-dev.js` edits (LI-15…
LI-22) and the manifest gives none of them a test-file row, so no thirteenth `learnings*.test.js`
file appears after batch 6. The ledger correctly never lists `learningsSuiteMap`.

## Verification

**The green-terminal gate now carries the conjunct its siblings carry (F-02 closed).** All three
non-trivial gate wordings now share one invariant — "every pre-existing test's status is unchanged
from the measured baseline" — and the fourth (batch 14) is the unqualified full-suite green. The
row also states *why*, naming batch 4 as the batch that commits a fixture subtree into a tree
`coveredViolations` walks in full (`pdlc/workflows/lib/document-oracles.mjs`, skipping only `.git/`
and `node_modules/`). A batch that greens its own suite and reds three others now fails the gate at
batches 1, 4 and 6 as it already did at 2, 3, 5 and 7–13.

**The porcelain mechanism is now exact (F-04 closed), and I re-measured it.**
`pdlc/workflows/__tests__/consumerCleanup.test.js:149-153` is

```js
const tracked = execFileSync("git", ["status", "--porcelain"], {
  cwd: path.resolve(__dirname, "..", "..", ".."),
  encoding: "utf8",
});
expect(tracked).toBe("");
```

No `-uno`, so `-unormal` applies and untracked paths appear as `??`. v0.3's restatement — "a new
test file that has been **written but not committed** reds it exactly as an uncommitted edit to a
tracked file does — and 'fourteen new files, one of them written a moment ago' is the state an
implementer is in for most of this feature" — is the correct mechanism, and it draws the right
operational conclusion from it. The misleading word "tracked" is gone.

**The expected-red ledger still reconciles after the AT-15 re-split.** This was the one place the
F-03 fix could have desynchronised a gate. It does not. AT-15 remains **one test in one suite**;
LI-16 now greens two of its four clauses instead of one, but the test as a whole still stays red
until LI-19, so the batch-8/9/10 rows correctly keep listing `LI-AT-15` and the batch-11 row
correctly says "`LI-AT-15` greens here". The ledger still shrinks monotonically by exactly what
each task claims and still reaches empty at batch 13.

**DoD 1's closure clause matches LI-14's row, and DoD 4's broken sentence join is repaired.** DoD 1
now reads "green over the hand-transcribed partition **and over the directory-wide closure** — the
set of `__tests__/learnings*.test.js` files registering an `LI-AT-` title equals the six AT-bearing
suites", which is the same assertion in the same terms as the task row. DoD 4 regained its lost
"The claim is:" and now parses as one sentence.

**Batch 6's ladder row was updated to the directory-wide read; the gate wording row was not.** The
final commit of this round fixed the ladder row (`§Traceability`'s batch ladder) to say
`LI-T-SUITEMAP` "statically parses the `learnings*.test.js` directory". The green-terminal gate row
in §Verification still justifies batch 6 as green-on-authoring by "`learningsSuiteMap.test.js` over
**six** suite files that already exist". That justification is now narrower than the assertion the
suite makes: green-on-authoring at batch 6 depends on all *twelve* matching files, not six — on the
other six registering no `LI-AT-` title. The conclusion is still true, and I verified it is
(the other six register `LI-T-` names), but the stated reason no longer covers the assertion.
Filed as F-03, Low.

**P-A-3's ledger universe is stated in files, and two of those files have no test status.** The new
answer says "the ledger's universe is exactly the fourteen `learnings*` files the §File-ownership
manifest owns". The manifest's test section does have fourteen rows — but two of them,
`__tests__/helpers/learningsFixtures.js` and `__tests__/fixtures/learnings-baseline/`, are a helper
module and a fixture directory: neither registers a jest test, so neither can be red or green and
neither can enter or leave a ledger row. The ledger's actual universe is the **twelve**
`learnings*.test.js` suites. The substantive answer to PM Q-05 — PROPERTIES is outside the
universe, and a PROPERTIES suite may land on this branch only green or else by name in the ledger
— is right and is a good tightening. Filed as F-04, Low, for the count.

**P-A-5 is the answer I hoped for.** A mid-feature re-capture's second manifest row goes into *this
document*, committed before the re-capture runs, because "a contract the dispatcher cannot read
enforces nothing". That makes a re-capture auditable by the same mechanism as everything else
rather than by a completion note nobody diffs, and it is consistent with the manifest already being
the single-writer authority.

**Nothing in the coverage material changed**, so my v2 measurement stands: 98 suites, 3828 passed,
`orchestrate-dev.js` at 88.14 % branch, `--per-file --branches 85` exiting 0, and the finding that
the bare `npm run test:coverage` never reaches stage 2. DoD 11, DoD 12 and H-8 are untouched.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | LI-23 scopes its `corpusOutcome` equality to non-`null` and delegates the healthy `null` to "`learningsRecord.test.js`'s BR-9 per-dispatch rows (LI-10 / LI-19)", but neither LI-10's row nor TSPEC §D.2's `DIVERGENT-CORPUS` row names a healthy-`null` assertion. The positive half of the pairing that justifies the scoping is not stated anywhere an implementer transcribes from | LI-23; LI-10; §Traceability twelve-arm table |
| F-02 | Low | Local | The directory-wide closure makes `LI-T-`-prefixed test naming a gate input for all six non-AT suites, but LI-01's and LI-06's rows do not declare their test names (LI-03, LI-13, LI-14, LI-23 all do). An `LI-AT-`-prefixed title in either reds `LI-T-SUITEMAP` at batch 6 | LI-01; LI-06; LI-14 |
| F-03 | Low | Local | The green-terminal gate row still justifies batch 6 as "`learningsSuiteMap.test.js` over **six** suite files that already exist"; after the F-05 fix the suite reads twelve and its green-on-authoring depends on the other six registering no `LI-AT-` title. The batch ladder row was updated; this one was not | §Verification, the three gate wordings |
| F-04 | Low | Local | P-A-3 gives the ledger's universe as "the fourteen `learnings*` files the manifest owns"; two of those fourteen rows are a helper module and a fixture directory, which register no jest test and cannot carry a red/green status. The universe is the twelve `learnings*.test.js` suites | §Open questions, P-A-3 |

### F-01 (Medium) — the delegated positive assertion is not named in any row

The non-`null` scoping is right, and v0.3 states the reasoning better than my finding did: `null`
is the healthy value of the field (`TSPEC:612`, `corpusOutcome: null, // | "RSN-UNLISTABLE" |
"RSN-EMPTY"`), three of the twelve arms cannot be driven without observing it, and expecting
`LEARNINGS_CORPUS_OUTCOMES ∪ {null}` would stop the expected value being a literal transcription of
the frozen catalogue. The row forbids that repair explicitly, which is exactly right.

What carries the weight of the scoping being *safe* is the next clause: "Scoping it out is not a
coverage loss — the healthy `null` is asserted by `learningsRecord.test.js`'s BR-9 per-dispatch
rows (LI-10 / LI-19)." I went looking for that assertion and could not find it named:

- LI-10's row says the suite asserts "`dispatches[i].corpusOutcome`, `dispatches[i].orderKeys`,
  `corpusDiverged` true on exactly dispatches 3 and 5" over `DIVERGENT-CORPUS`. It names the
  divergence oracle and the `RSN-UNLISTABLE` dispatch; it does not say any dispatch is asserted to
  carry `null`.
- TSPEC §D.2's `§A.5 per-dispatch observation` row (`TSPEC:651`) says "each row carries **its own**
  observation (dispatch 5 `RSN-UNLISTABLE`, dispatches 3–4 the grown key set)" — again naming only
  the non-`null` and the ordering halves.

The fixture makes it *reachable*: `DIVERGENT-CORPUS` is five authoring dispatches whose `_git`
reply gains a path after dispatch 2 and fails at dispatch 5, so dispatches 1–4 are healthy and
their `corpusOutcome` is `null`. So the coverage very likely exists in the implementer's head. But
this is precisely the shape the review bar exists for: a negative-scoped oracle (`observed
non-null values equal the catalogue`) is justified by a positive assertion on the same path, and
that positive assertion has to be somewhere a test gets written from. As the rows stand, an
implementer could write `learningsRecord.test.js` asserting only dispatch 5's `RSN-UNLISTABLE` and
the key sets, satisfy every named clause of LI-10, and ship a feature in which **no test anywhere
asserts that a healthy dispatch records `corpusOutcome === null`**. That is a real hole: it is the
value the field carries on the overwhelming majority of runs, and an implementation that recorded
`undefined`, `""` or omitted the key entirely on healthy dispatches would be green everywhere.

**What to change:** one clause in LI-10's row — *"including the healthy value: `dispatches[i]
.corpusOutcome === null` asserted on dispatches 1, 2 and 4, which is the positive half LI-23's
non-`null` scoping delegates here"* — and, if you want the delegation legible from the other end,
the same pointer in LI-23's sentence ("…asserted by `learningsRecord.test.js`'s dispatch-1/2/4
rows"). No new task, no new fixture, no batch change: `DIVERGENT-CORPUS` already produces the
dispatches, and LI-10 already owns the suite.

### F-02 (Low) — the closure makes test naming load-bearing in two rows that do not state it

`LI-T-SUITEMAP` now computes "the set of `__tests__/learnings*.test.js` files registering at least
one `LI-AT-` jest test title" and asserts it **equal** to six. That is the right form. Its
consequence is that the *absence* of `LI-AT-` titles in the other six matching files is now a gate
input rather than a stylistic matter. Four of those six declare their names in their rows —
`LI-T-IGNORE`/`LI-T-WORKTREE`, `LI-T-PIN-1`, `LI-T-ARMS-1…3`, `LI-T-SUITEMAP` — and would be hard
to get wrong. Two do not: LI-01 describes `learningsPremises.test.js` as "one structural assertion
per premise" without naming the tests, and LI-06 describes the digest guard without naming its
tests. Neither carries a FSPEC AT, so nobody *should* reach for an `LI-AT-` name — but the PLAN's
own convention section says `LI-AT-{N}` is the AT naming and is silent on what a non-AT test is
called, and batch 1 and batch 4 are both green-terminal batches where a naming slip surfaces only
two and then five batches later, at batch 6, as a `LI-T-SUITEMAP` red whose message points at the
wrong file. **Fix:** state the names in both rows (`LI-T-PREMISE-{n}`, `LI-T-BASELINE-{n}` or
whatever the author prefers), or add one sentence to the naming convention: *"only the six
AT-bearing suites use `LI-AT-` titles; every other test in the feature is named `LI-T-*`, and
`LI-T-SUITEMAP` enforces that."* The second is one sentence and covers all six at once.

### F-03 (Low) — one of the two batch-6 justifications was updated, the other was not

`§Traceability`'s batch ladder now reads "`LI-T-SUITEMAP` statically parses the
`learnings*.test.js` directory, whose six AT-bearing suites all exist at the end of batch 5 (TE
F-05), and has no symbol under test". §Verification's green-terminal gate row still reads
"`learningsSuiteMap.test.js` over **six** suite files that already exist (batch 6)". The gate row is
the one a dispatcher reads to decide whether batch 6 passed, and its justification for
green-on-authoring is now narrower than what the suite actually asserts — the suite reads twelve
files, and its greenness depends on six of them *not* contributing. **Fix:** copy the ladder row's
phrasing into the gate row. One clause, and the two statements of the same fact agree again.

### F-04 (Low) — "fourteen files" counts two things that cannot be red

P-A-3's answer to PM Q-05 is a good tightening and I want it kept. The count in it is off by the
two manifest rows that are not suites: `__tests__/helpers/learningsFixtures.js` (a helper module,
and LI-02's row explicitly forbids jest globals in it) and `__tests__/fixtures/learnings-baseline/`
(a committed fixture subtree). Fourteen is the right count of *manifest rows*; the ledger's
universe is the **twelve** `learnings*.test.js` suites, which is also exactly the set the batch-13
row shrinks to empty over. **Fix:** *"the ledger's universe is exactly the twelve
`learnings*.test.js` suites the §File-ownership manifest owns (its other two test rows are a helper
module and a fixture subtree, which register no jest test)"*.

## Questions

Both of my v2 questions are answered in v0.3 — Q-01 by P-A-4 (LI-02's declared path surface already
covers every arm, and a thirteenth fixture shape would belong in LI-02, which LI-23 already depends
on), Q-02 by P-A-5 (the second manifest row is an edit to this PLAN, committed before the
re-capture runs). Both answers are bars rather than preferences, and both are enforceable by the
mechanism they name. One new question, not gating.

| ID | Question |
|----|---------|
| Q-01 | P-A-3 admits the case where a PROPERTIES suite lands red on this branch before batch 14 and says "its rows enter the ledger by name for the batches in which they are red". The ledger is a table inside this document. Does that mean the PLAN is re-versioned mid-wave to add those rows (as P-A-5 requires for the manifest), or is the amendment recorded elsewhere? The two live tables would then have the same rule, which is worth stating once rather than twice |

## Positive Observations

- **Every one of the six findings was resolved at the clause an implementer transcribes from.** F-03
  did not become "AT-15 has more clauses than stated" — it became a four-clause enumeration with
  both fixtures named in order, both green attributions assigned, and the falsifiability argument
  for clause (4) written into the row ("without it clause (1) is an absence-only oracle over path
  handling"). That argument is now in the PLAN rather than in my review, which is where it does
  work.
- **F-01's fix does the harder thing and forbids the easy repair.** The row could have said "scope
  it to non-`null`" and stopped. Instead it says why `LEARNINGS_CORPUS_OUTCOMES ∪ {null}` must not
  be used — "`null` is not a catalogue member and the expected value would stop being a literal
  transcription of the frozen catalogue, which is the whole point of the assertion". An implementer
  hitting the red at batch 13 will reach for exactly that repair, and the row pre-empts it.
- **F-05 came back stronger than I asked for.** I suggested enumerating the directory and asserting
  the file set. v0.3 does that *and* solves the problem I had not thought through: the suite map's
  own transcribed literal mentions all 35 `LI-AT-` ids, so a textual scan would include the suite in
  its own expected set. Keying on **registered jest titles** rather than textual mentions is the
  detail that makes the closure work, and it is stated in the row rather than left for the
  implementer to discover as a red.
- **PM F-07's resolution is the right answer under the testing lens too.** Dropping the four
  absence claims from the standing premise suite is not a weakening: three of the four are falsified
  by this PLAN's own tasks between batches 1 and 4, so asserting them would have reddened at batch 3
  and halted the wave on a correct implementation — the same failure mode as v2's F-01, one document
  section over. And nothing is lost, because `LI-T-IGNORE` conjunct (1) is a *positive* standing
  oracle over the same fact once LI-04 lands.
- **P-2a's promotion to a set equality is the cheapest possible early warning.** A fifth authoring
  call site is the change most likely to silently widen this feature's blast radius, and asserting
  the four sites by enclosing function and argument position at **batch 1** surfaces it seven
  batches before LI-11's composition-site equality would. I re-measured the keying against HEAD: it
  admits exactly the four intended sites and excludes the two `mode: "authoring"` literals and the
  two reads, which is not obvious and is stated precisely enough to implement.
- **P-A-5 makes the manifest honest.** "A contract the dispatcher cannot read enforces nothing" is
  the correct principle, and applying it means a re-capture is auditable by the same mechanism as
  every other write rather than by a completion note nobody diffs.
- **Nothing regressed.** No task row was added or removed, no `Deps` cell or manifest cell changed,
  the batch DAG is untouched, the AT-15 re-split does not desynchronise the expected-red ledger
  (AT-15 is still one test, still red until batch 11), and the directory-wide closure introduces no
  new edge obligation and no thirteenth test file after batch 6. I checked each of those rather than
  assuming them.

## Recommendation

## Verdict
