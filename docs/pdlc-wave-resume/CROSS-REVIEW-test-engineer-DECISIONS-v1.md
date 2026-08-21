# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testing lens only — testability of each decision, observability of its re-evaluation
triggers, falsifiability of every oracle a decision prescribes, and re-derivation of every counted
cost the document stakes an alternative's rejection on.

## Verification Method

This branch carries neither the mechanism (`grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`
→ `0`) nor the wave-gate baseline, and is 1,637 commits behind (`git rev-list --count HEAD..origin/main`
→ `1637`) — both exactly as the document's own **Verification frame** states. I therefore re-derived
every counted claim against `origin/main` at `345ae358` (`git cat-file -t 345ae358` → `commit`), the
same ref the document names, and cite by enclosing test, exported symbol or comment text per DEC-DOC-01.

Line numbers below are locators against `origin/main` at `345ae358`; the enclosing test or exported
symbol is the stable citation.

**Re-derived and confirmed accurate** — these are the load-bearing claims the decisions rest on, and
they hold:

| Document claim | Command / anchor | Result |
|---|---|---|
| Three module-level pure functions, one read site, one write site | `computePlanHash` `:12230`, `parseWaveLedger` `:12267`, `formatWaveLedger` `:12325`; read `readMergeConfigSafely(readFileFn, WAVE_STATE_PATH)` `:15264`; sole `writeWaveLedger(` call `:15600` | ✅ exactly as stated |
| The shipped INTERIM comment miscounts its own surface | `:12196-12198` reads "one path constant, two pure functions, one read site and two write sites" | ✅ DEC-WVR-01's correction is right |
| Ancestry is the **third** arm; feature-mismatch and plan-changed issue zero `merge-base` calls | `recorded.feature !== featureName` `:15302`, `recorded.planHash !== planHash` `:15306`, `!(await headCorroborated(recorded.head))` `:15307`, over-count `:15313` | ✅ O-4's rejection is correctly grounded |
| The shipped ancestry test asserts by containment, so an extra call is unfalsifiable | `expect(calls).toContainEqual(["merge-base","--is-ancestor",HEAD_SHA,"HEAD"])` in `it("a complete ledger whose commit is NOT an ancestor of HEAD is ignored, and every wave runs")` | ✅ the strongest argument in the document |
| The queue's delegation payload key set is exactly `{reqPath}` | `orchestrate-queue.js`: `import realMain` `:45`, `_runPipeline: runPipelineFn = realMain` `:1240`, `runPipelineFn({ reqPath: entry.reqPath })` `:1582` | ✅ DEC-WVR-07 is honestly grounded |
| The adapter already binds the `_git` transport twice | `runtime-adapter.js:1162`, `:1202` — `_git: rtGit` | ✅ O-3's "second adapter binding" cost is real |
| `main()` carries ~35 injected seams, `_git: gitFn = defaultGit` among them | 34 underscore-prefixed params in the destructured list at `:12992`; `_git` present | ✅ hedged and accurate |
| `.gitignore` pins the path by a root-anchored rule at line 41 | `/.claude/pdlc-wave-state.json`, line 41 | ✅ |
| Nothing writes `{}` | the sole write site passes `formatWaveLedger(...)` `:15601`, whose output always carries `version`, `feature`, `planHash`, `lastGreenWave` `:12325-12338` | ✅ the premise of DEC-WVR-04 holds |
| Seven reason codes; **three** interpolate | `parseWaveLedger` arms `:12290,12296,12305` are fixed sentences; `plan-changed` `:15306-15311` is fixed; feature-mismatch, head-unreachable and over-count interpolate | ✅ DECISIONS is right and TSPEC §3.1 is wrong (erratum, already self-flagged) |

**Re-derived and NOT confirmed** — three counted claims do not survive the command the document
gives for them. They are F-01, F-03 and F-04 below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | "44 shipped tests" is not the count the cited test file produces — the real figure is **26** test cases (`18 / 4 / 4`, not `32 / 8 / 4`). The number is the whole cost basis for rejecting O-1 and is restated as DEC-WVR-02's regression net. | Context measured-surface table; O-1; DEC-WVR-01 |
| F-02 | High | Local | DEC-WVR-03's rule ("append to **each** announcing outcome") and its Consequences count ("**exactly three** shipped whole-string assertions change") cannot both hold: the invalid-pointer notice is a fourth announcing full-run under FSPEC BR-07 and is pinned by whole-string equality today. The risk register treats a fourth as an unforeseeable mid-wave discovery when it is discoverable now. | DEC-WVR-03; O-5; Consequences; Risks |
| F-03 | Medium | Local | The "~81 lines" chain measurement does not match the anchor the document gives for it. From `if (ledger.reason) {` through the final `else`'s closing brace is **48** lines; 81 is the enclosing `if (!explicitPointer) {` block. | Context measured-surface table; DEC-WVR-02 Context |
| F-04 | Medium | Local | "The module the feature edits is the largest tracked file in the repo" is falsified by the very command cited: `pdlc/workflows/dist/pdlc-cli.mjs` is 738,924 bytes vs `orchestrate-dev.js` at 734,711. The stated runner-up ("a document at 314,472 bytes") is third, not second. | Context measured-surface table; Risks |
| F-05 | Medium | Local | DEC-WVR-04's write-side consequence — "the absence of any `{}` writer is asserted over the write site" — is an absence-only oracle with no positive conjunct named. A run that writes nothing at all satisfies it, so it cannot fail for the reason it exists. | Consequences, DEC-WVR-04 row |
| F-06 | Medium | Local | DEC-WVR-08 prescribes call-count equalities for feature-mismatch, plan-changed and ancestry, but names no oracle for the **over-count × unreachable-head** path — the only case where the lazy scheme's correctness is non-obvious, and the one no shipped fixture covers. Its re-evaluation trigger is also one-directional. | DEC-WVR-08; Consequences |
| F-07 | Low | Process | DEC-WVR-02's and DEC-WVR-05's re-evaluation triggers are stated as design intentions, not as conditions a test or monitor could detect. DEC-WVR-06, -07 and -08 show the observable form in the same document. | DEC-WVR-02, DEC-WVR-05 |

### F-01 (High) — the "44 shipped tests" cost basis does not re-derive

The Context table and O-1 both count the regression net as 32 + 8 + 4 = 44, and O-1 rejects the
`WaveResumeStore` rewrite on the strength of "invalidates the 44 shipped tests that reach them".
Counted against `origin/main` at `345ae358`, in the only test file that mentions any of these
symbols (`git grep -l` over `pdlc/workflows/__tests__/` returns `waveExecution.test.js` alone):

| Block | Document | Actual | Evidence |
|---|---|---|---|
| `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` | 32 | **18** | 15 `it` statements, one of which is a 4-member `it.each` ⇒ 14 + 4 = 18 cases |
| `describe("Phase I — implementation.startWave resumes a halted run")` | 8 | **4** | 4 `it` statements, no `it.each` |
| `describe("computePlanHash — the ledger's plan fingerprint")` | 4 | **4** | ✅ correct |
| **Total** | **44** | **26** | 23 `it` statements / 26 cases — no reading of "test" yields 44 |

Note the document also names the second block as "8 tests in the `implementation.startWave` block
(which asserts the *interaction* of the operator pointer with the record)". Only one of its four
tests involves the record at all; the interaction test the sentence describes —
`it("an explicit implementation.startWave outranks the ledger")` — lives in the *ledger* `describe`,
so the two blocks are also mischaracterised, not only miscounted.

**Why this is High rather than a nit.** The document's stated method is its warrant: "Where a *cost*
is claimed below it is a counted cost, and the count is stated with the command that produced it,
not asserted from intuition." Two of the three counts in the sentence that rejects O-1 fail that
standard by ~1.7×. Three consequences follow, all of them testing consequences:

1. **A downstream oracle transcribed from this number is born red.** DEC-WVR-02's Consequences row
   makes the ledger `describe` "the extraction's regression net", kept "entirely unchanged by that
   task". A PLAN or PROPERTIES author writing the natural gate — *the extraction task leaves N
   ledger tests green and unchanged* — transcribes 32 from here and gets a failure that says nothing
   about the extraction.
2. **The rejection of O-1 loses its measured footing.** O-1 is still correctly rejected — 26
   invalidated tests plus the `.gitignore` anchor plus the no-`import` dialect is ample — but as
   written the argument is carried by a number that does not exist, which is precisely the
   "asserted from intuition" failure the Verification frame promises to avoid.
3. **It is the one class of error this document cannot absorb.** A DECISIONS record whose counts are
   approximate is indistinguishable, to a future reader, from one whose counts are wrong in a way
   that flips a decision.

**Required change.** Replace `32 / 8 / 4 = 44` with `18 / 4 / 4 = 26` in both the Context table and
O-1, state the counting rule used (test **cases**, with `it.each` members counted individually — the
choice matters, since `it` statements give 23), and correct the parenthetical describing the
`implementation.startWave` block. If a different, defensible counting rule yields a different number,
state the rule and the command; what must not survive is a figure no command reproduces.

### F-02 (High) — "each announcing outcome" and "exactly three" are not both satisfiable

DEC-WVR-03 states the rule universally — append ` (provenance: …)` to **each announcing outcome** —
and the Consequences table states the count exactly: "**Exactly three** shipped whole-string
assertions change, in the **same task** as the announcement change, each to the new whole string
transcribed as a literal." O-5 names the three. All three exist and are correctly identified:

| # | Assertion named in O-5 | Confirmed at `origin/main` |
|---|---|---|
| 1 | past-the-end notice in `it("a pointer past the last wave runs every wave, and says so")` | ✅ `expect(logs).toContain(` + full sentence — element equality on an array |
| 2 | the four-member `it.each` ignored-record notice | ✅ `expect(logs).toContain(` + full sentence, all four members |
| 3 | `phaseDetail(result, "I")` equality in `it("skips the waves before the pointer entirely — no dispatch, no gate, no commit")` | ✅ `expect(phaseDetail(result,"I")).toBe("All 3 waves complete (wave mode, script-owned gate)")` |

O-5's claim that the placement rule leaves substring matchers green also re-derives: the cited
`expect(row.detail).toContain("recorded green (wave ledger)")` in `it("a matching record whose waves
are all green skips Phase I whole, and the row says so")` is unaffected, as are the four
`startsWith` matchers and the two `some(… startsWith("Resuming at wave")) === false` negatives. That
part of the analysis is careful and correct.

**The gap is a fourth announcement, not a fourth matcher style.** The shipped operator-pointer path
emits *two* rejection notices, not one. Alongside the past-the-end notice there is:

```
Notice: implementation.startWave in ${CONFIG_PATH} is not a valid value — using the default.
```

asserted by whole-string element equality in
`it("an invalid pointer degrades to wave 1 and is named in the run's notices")` — the same
`expect(logs).toContain(` + full sentence shape as assertions #1 and #2. Structurally it is
indistinguishable from #1: an operator pointer is rejected, `startWave` degrades to 1, the run
announces why, and the run is a full run reached by an operator pointer.

FSPEC BR-07 is explicit that this class announces provenance: "…**and so does a full run reached by
an operator pointer** or by an announced disregard cause." Under DEC-WVR-03's own rule — "each
announcing outcome" — that sentence takes ` (provenance: operator-set)`, and the count is four.

**Why this is High.** It is not a miscount; it is an unclosed enumeration on a decision whose entire
value is that the enumeration is closed:

1. **The set-equality mandate is defeated by an unclassified member.** FSPEC OB-F5 and AT-13 demand
   set equality over the outcomes and their announcements, "so a deletion or an addition fails a test
   instead of passing one". An announcement that is neither in the catalogue nor explicitly excluded
   from it is a member the set-equality oracle cannot see — it will pass whether or not the
   invalid-pointer notice carries a token, which is exactly the containment behaviour OB-F5 rejects.
2. **The named mitigation is aimed at the wrong risk.** The Risks section accepts "A fourth
   whole-string assertion is discovered mid-wave", mitigated by running the full suite as the task's
   gate. But a suite run only reds if the fourth assertion *changes*; if the implementer instead
   leaves the invalid-pointer notice untouched, the suite stays green and BR-07 is silently
   under-implemented. The accepted risk is the benign half; the silent half has no mitigation.
3. **It forces the one edit DEC-WVR-03 forbids.** An implementer who discovers the fourth assertion
   mid-wave, holding a decision that says "exactly three", has the strongest possible incentive to
   relax that matcher to a `startsWith` rather than contradict the DECISIONS record — the precise
   move DEC-WVR-03 rules out as "a strictly larger change than this feature owes".

**Required change.** Decide the invalid-pointer notice explicitly, either way, and make the decision
mechanical rather than implicit:

- If it **does** carry `operator-set` (which is what BR-07's wording indicates): the count becomes
  four, the fourth assertion is named in O-5 alongside the other three, and its replacement string is
  specified with the same literal-transcription discipline.
- If it **does not**: DEC-WVR-03 must say so and give the criterion that separates it from the
  past-the-end notice — e.g. *provenance attaches to announcements that report a resolved start
  point, not to config-validation notices* — so the exclusion is a rule a test can check, not an
  omission.

Either way, add a consequence that the announcement catalogue is asserted by **set equality over the
announcements that carry a provenance token**, with the excluded notices enumerated as literals.
That is what makes a future fifth announcement red an assertion instead of slipping through.

The catalogue itself lives in TSPEC §2.4, upstream of this document; that omission is raised
separately as an erratum. The finding filed here is against this document's own text: a universally
quantified rule and an exact count that contradict each other, and a risk register that treats the
contradiction as unforeseeable.

### F-03 (Medium) — the "~81 lines" chain does not measure the chain the sentence names

Both the Context table and DEC-WVR-02's Context size the extraction target as "~81 lines", and the
Context table gives the boundary precisely: "the chain from `if (ledger.reason) {` through the final
`else` that sets `startWave = recorded.lastGreenWave + 1`". Measured between exactly those anchors
at `origin/main`: `if (ledger.reason) {` opens the chain, `startWave = recorded.lastGreenWave + 1`
sits in the final `else`, and that `else` closes **48 lines** later. 81 is the span of the enclosing
`if (!explicitPointer) {` block — which also contains the `readMergeConfigSafely` read, the
`parseWaveLedger` call, the `ignore` helper and the `headCorroborated` closure, none of which
DEC-WVR-02 extracts (the decision explicitly leaves the probe and the `emit` calls in `main()`).

This is Medium rather than High because it does not change the decision: 48 interleaved lines with an
`await` in the middle is still well past the threshold where AT-02 and AT-13 need a pure classifier,
and O-2's rejection stands. But it is a counted claim that fails re-derivation from the anchor the
document itself supplies, and it inflates the extraction's apparent size by ~1.7× — the same factor
as F-01, which suggests a shared measurement habit worth correcting once.

**Required change.** Either state 48 with the `if (ledger.reason) {` … final-`else` boundary as
written, or state 81 with the boundary that actually produces it (`if (!explicitPointer) {` through
its close) and note that the extracted subset is the smaller inner chain. The distinction is
load-bearing for DEC-WVR-02's regression-net claim: what must stay green and unchanged is scoped to
what the task actually moves.

### F-04 (Medium) — "the largest tracked file in the repo" is falsified by its own command

The Context table's first row claims `orchestrate-dev.js` is the largest tracked file, citing
`git ls-tree -r -l origin/main` sorted by size, and adds "the runner-up is a document at 314,472
bytes". Running exactly that command:

```
738924  pdlc/workflows/dist/pdlc-cli.mjs
734711  pdlc/workflows/orchestrate-dev.js
314472  docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md
```

`orchestrate-dev.js` is second, not first, and the document at 314,472 bytes is third, not the
runner-up. The true claim — *the largest hand-authored source file in the repo, second only to a
generated artifact built from it* — is both accurate and more pointed, since `dist/pdlc-cli.mjs` is
downstream of the very module the feature edits.

The testing consequence is small but real, and it lands in the third bullet of the Risks section:
"Editing the source module leaves `pdlc/workflows/dist/` stale, which the suite itself reds. Any wave
whose tasks touch the module must name the dist path in `implementation.postWavePathspecs`." That
mitigation is correct, and the measurement that would have motivated it — the largest tracked file
*is* a `dist/` artifact — is the one the table gets wrong. Stating the fact correctly strengthens the
rebase-churn risk rather than weakening it.

**Required change.** Restate the row as "the largest hand-authored source file in the repo (734,711
bytes / 16,336 lines), exceeded only by the generated `pdlc/workflows/dist/pdlc-cli.mjs` at 738,924
bytes", and drop or correct the runner-up clause.

### F-05 (Medium) — DEC-WVR-04's write-side consequence is an absence-only oracle

DEC-WVR-04's premise re-derives cleanly: `parseWaveLedger` maps `""` and `"{}"` to
`{state: null, reason: null}`, and the sole write site passes `formatWaveLedger(...)`, which always
emits `version`, `feature`, `planHash`, `lastGreenWave`. The decision to keep the tolerance and add
no writer is well argued and correctly rejects both O-6 arms.

The prescribed oracle is the problem. The Consequences row reads: "A test, not a code change: the
`{}` and `""` inputs are asserted to reach the silent no-record outcome, **and the absence of any
`{}` writer is asserted over the write site**." The first half is a positive, falsifiable assertion,
and TSPEC's `parseWaveLedger` three-arm set assertion already discharges it well. The second half is
absence-only: *no write equals `{}`*. A run that writes nothing at all satisfies it. A run whose
write site never executes satisfies it. A regression that removes the write site entirely satisfies
it. The assertion cannot fail for the reason it was written.

Per the project's oracle rules, every negative assertion needs a positive conjunct on the same path —
what *does* happen instead. Here the positive conjunct is already available and costs nothing:

**Required change.** Restate the consequence as a positive assertion over the write site's actual
output, with the negative as a derived conjunct rather than the whole oracle — e.g. *every ledger
write observed on a run that commits at least one wave parses to an object whose key set is exactly
`{version, feature, planHash, lastGreenWave}` (plus `head` when a transport is injected), and no
observed write is `{}` or `""`*. Set equality over the key set, not containment, so a future writer
that emits a cleared shape or drops a field reds the assertion. That version fails when the write
site is removed; the one as written does not.

### F-06 (Medium) — the lazy probe's only non-obvious path has no named oracle

DEC-WVR-08 is the best-argued decision in the document, and its rejection of O-4 re-derives exactly:
ancestry is the third arm, so feature-mismatch and plan-changed issue zero `merge-base` calls today,
and the shipped ancestry assertion uses `toContainEqual`, so an eager extra call would indeed have
been unfalsifiable. The Consequences row correctly upgrades those to equalities: "zero `merge-base`
calls on the feature-mismatch and plan-hash-mismatch fixtures, exactly one on the ancestry fixture."

Those three fixtures cover the paths where the answer is obvious. The path where it is not is
**over-count with an unreachable head**, and no oracle is named for it. Work it through the scheme
DEC-WVR-08 prescribes: classify optimistically with `headOk: true`; a record whose `lastGreenWave`
exceeds `waveCount` yields `full-run` with code `over-count`; `over-count` is **not** in
`ANCESTRY_INDEPENDENT_CODES`, so the probe fires and the record re-classifies with `headOk: false`,
producing `head-unreachable`. That is correct, and it is correct *because* the shipped guard order
places ancestry above over-count — the very ordering the document's closing section lists as not to
be re-litigated. But the correctness is entirely non-obvious from the code, and it is the one arm no
shipped fixture exercises: `it("a ledger recording more waves than the plan has is ignored, not
honoured")` asserts by containment (`m.includes("was ignored") && m.includes("only 3")`) on a record
whose head is reachable.

The consequence is a silent-regression channel. A future reader optimising the lazy scheme would
naturally add `over-count` to `ANCESTRY_INDEPENDENT_CODES` — it is a full-run code like the others,
and doing so saves a subprocess. That change flips the announced reason for an over-count record with
an unreachable head from `head-unreachable` to `over-count`. Both codes remain in the seven, so
AT-02's set-equality assertion stays green; the two call-count equalities named here stay green; and
the containment-based over-count test stays green. Nothing reds.

DEC-WVR-08's re-evaluation trigger does not catch it either: it names "the ancestry verdict becomes
needed by a guard **above** the plan-hash guard", i.e. movement upward. The regression above is
movement downward — ancestry ceasing to be needed by the guard below it.

**Required change.** Add a third call-count equality to DEC-WVR-08's Consequences row: an over-count
record with an **unreachable** head issues exactly one `merge-base` call and announces
`head-unreachable`, not `over-count` — a single fixture that pins both the laziness and the guard
order in one assertion. Extend the re-evaluation trigger to be bidirectional: *the ancestry verdict
becomes needed by a guard above the plan-hash guard, or ceases to be needed by a guard below it*.

### F-07 (Low, Process) — two re-evaluation triggers are not observable

A re-evaluation trigger earns its place when a test, a monitor or a mechanical check could detect the
condition. Five of the eight here meet that bar, and three are exemplary: DEC-WVR-07's "the queue's
delegation payload grows a second key" is detected directly by AT-16's key-set equality assertion;
DEC-WVR-06's "a reason is added that cannot be rendered from `ReasonContext`" reds the seven-code set
equality; DEC-WVR-01's "the dialect gains module imports" is checked by the runtime bundle's
structural constraints. Two are not:

- **DEC-WVR-02:** "the announcements themselves need to become pure values (e.g. a structured run
  log)" — a design aspiration. No observation of the running system would raise it.
- **DEC-WVR-05:** "waves ever execute out of plan order, or partially" — closer, but nothing named
  would detect it. The condition is observable in principle: the serial loop
  `for (let waveIndex = 0; waveIndex < waves.length; waveIndex++)` with its single `startWave`
  cut-off is what makes a completed-wave set necessarily a prefix, and an assertion that the executed
  wave numbers form a contiguous ascending run from `startWave` would red the day that stops holding.

Filed `Process` rather than `Local`: the observable-trigger bar is a property of how this project
writes DECISIONS documents, not of this feature, and the three good examples above are the pattern
worth promoting during harvest.

**Suggested change.** Give DEC-WVR-05 the observable form (the contiguous-prefix assertion over
executed wave numbers). For DEC-WVR-02, either name an observable proxy or mark the trigger
explicitly as a design aspiration so a future reader does not wait for a signal that will never
arrive.

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-02: is the invalid-pointer notice (`implementation.startWave … is not a valid value — using the default.`) intended to carry `operator-set`? FSPEC BR-07's "a full run reached by an operator pointer" reads as yes; TSPEC §2.4's table omits it. Whichever answer, what is the criterion a test can apply to decide whether a given notice is in the provenance catalogue? |
| Q-02 | For F-01: what counting rule produced 32 and 8? Neither `it` statements (15 and 4) nor test cases (18 and 4) nor `expect` calls yields them, so I could not reconstruct the intended basis to check whether the figure is stale rather than wrong. |
| Q-03 | DEC-WVR-05 freezes the record at `version: 1` and the Consequences row says "no PLAN task may add a field". Is that enforced by an oracle — e.g. set equality over the keys `formatWaveLedger` emits, in both the `head`-present and `head`-absent shapes — or is it a prohibition on the PLAN author only? Set equality over both shapes would make it mechanical and costs one assertion. |
| Q-04 | DEC-WVR-03 extends the executed Phase I report row with the resume point and provenance. The `✅` detail for a run starting at wave 1 stays the shipped string, and the resume variant is a different sentence. Is there an oracle that the two are mutually exclusive — that no run emits a detail matching both shapes? An absent one is how a future refactor ends up emitting the resume sentence for a wave-1 run with `N–M` reading `1–3`, which no named assertion would catch. |

## Positive Observations

- **The Verification frame is the right response to a stale branch, and it is executed honestly.**
  Naming the 1,637-commit gap, the absent mechanism and the absent baseline up front, then pinning
  every claim to `origin/main` at `345ae358` *by exported symbol, enclosing test and comment text*
  rather than by bare `file:line`, is exactly the DEC-DOC-01 discipline — and it is what let me
  re-verify the document after a rebase would have invalidated any line-number-only citation. The
  three findings I raise against counted claims are findings only because the document made itself
  checkable; a document that asserted these costs vaguely would have been harder to review, not
  easier to approve.
- **O-4's rejection is the strongest oracle argument in the feature so far.** Noticing that the
  cheaper alternative's real defect is *unfalsifiability* — the shipped ancestry assertion uses
  `toContainEqual`, so an extra `merge-base` call could not have redded anything — and then upgrading
  the replacement oracles from containment to equality, is precisely the reasoning DC-03 asks for.
  It rejects the simpler option for a testing reason and pays a named price (one extra pure
  classifier call) to get a falsifiable one.
- **O-5's placement rule is a genuine piece of engineering, and it was checked rather than asserted.**
  "After the sentence's terminal punctuation and outside every existing parenthesis" is the rule that
  makes the change additive to every prefix and substring matcher, and the document verifies it
  against a specific surviving assertion by name. I confirmed all four `startsWith` matchers and both
  `some(…) === false` negatives are untouched. F-02 is about an announcement missing from the
  catalogue, not about this rule, which is sound.
- **DEC-WVR-07 refuses to fake a test, and names the gap in the artifact rather than in prose.** The
  queue genuinely delegates `runPipelineFn({ reqPath: entry.reqPath })` with `_runPipeline` defaulted
  to `realMain`, and all three ways of asserting more were rejected for the right reason: each would
  have produced an assertion true by construction. Putting the residual gap into AT-16's own text, so
  a reader cannot mistake it for full parity, is the DC-08 successor-surface discipline applied where
  it is least comfortable — against a REQ that asked for more than the boundary can carry.
- **DEC-WVR-06 separates the closed catalogue from the wording it renders.** Freezing the *codes* and
  treating sentences as renderers is what makes FSPEC OB-F5's set equality an assertion over a
  contract instead of over fixture data — and keeping the three `parseWaveLedger` arms' exact shipped
  sentences as their renderers means the change is provably assertion-neutral there.
- **The document corrected an upstream count instead of propagating it.** O-8 flags TSPEC §3.1's
  "four of the seven reasons interpolate" as an erratum and states the correct figure. I re-derived
  it: three reasons interpolate, carrying four interpolated values. Catching an upstream off-by-one
  while writing a derived document, and routing it rather than silently fixing it, is the behaviour
  the erratum mechanism exists for.
- **The Consequences section is written for the PLAN author, not for the record.** One row per
  decision, each naming what the implementation inherits — task boundaries ("its own task, before any
  announcement change"), oracle shapes ("asserted as **equalities**"), and prohibitions ("no matcher
  is relaxed"). That is the form that survives into a PLAN without re-interpretation.
- **"What a future reader should not re-litigate" closes the document well.** Naming the settled
  ground explicitly, each item tied to an alternative recorded above and to a re-evaluation trigger,
  is what keeps round 2 from reopening round 1. F-07 asks two of those triggers to become observable;
  the structure itself is right.

## Recommendation

**Needs revision** — two High findings.

The decisions themselves are, with one exception, sound and correctly grounded: I re-derived ten
distinct claims about shipped code and found them accurate, including every claim on which the
rejection of O-3, O-4, O-6, O-7 and O-9 turns. The engineering judgement in DEC-WVR-02, -06, -07 and
-08 is good and should not be revisited.

What must change before Phase P:

1. **F-01** — correct the regression-net count from 44 to the figure the cited file produces (26
   cases / 23 `it` statements; `18 / 4 / 4`, not `32 / 8 / 4`), in both the Context table and O-1,
   and state the counting rule. Correct the parenthetical describing the `implementation.startWave`
   block, whose four tests do not include the pointer-versus-record interaction test it names.
2. **F-02** — resolve the contradiction between "append to each announcing outcome" and "exactly
   three shipped whole-string assertions change". Either the invalid-pointer notice carries
   `operator-set` and the count is four with the fourth assertion named and its replacement
   specified, or it is excluded by a stated criterion a test can apply. Add the set-equality
   consequence over the announcements that carry a provenance token.

The Medium findings (F-03 chain measurement, F-04 largest-file claim, F-05 absence-only write-side
oracle, F-06 the unoracled over-count × unreachable-head path) should be addressed in the same
revision — F-05 and F-06 in particular, since both prescribe or omit oracles that the PROPERTIES
author will inherit directly, and both have a concrete replacement stated above that costs one
assertion each. F-07 is a Low `Process` finding for harvest.

One upstream defect is routed as an erratum rather than folded into this verdict: TSPEC §2.4's
announcement table omits the invalid-pointer notice, and TSPEC §3.1's "four of the seven reasons
interpolate" is an off-by-one that this document already caught and corrected.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 4, "low": 1}
