# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.3)
**Date:** 2026-08-06
**Iteration:** 4
**Scope:** Delta re-review. Baseline `e75feca` (the bytes v3 reviewed) → HEAD; 238 insertions, 32
deletions across eight commits. Two passes: (1) each of v3's three findings, verified against the
repository rather than against the revision's prose; (2) the changed sections only, read for new
issues. Unchanged sections already approved are not re-litigated. The approval bar is unchanged —
any open High or Medium means **Needs revision**.

## Disposition of v3 findings

All three are resolved, each checked at the mechanism rather than at the revision's account of it.

| v3 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | Medium | **Resolved, exactly** | §11.2 now gives `asAsync` as a literal — `new Promise((resolve) => setTimeout(() => resolve(fn(...args)), 0))` — defers **both** the recording and the resolution, and states why a microtask could not falsify anything ("awaiting is itself microtask-scheduled"). The two-row table spelling out what the test's `await main()` continuation sees on the correct and broken implementations is the discrimination I asked to be stated, and it is right: a timer callback runs in a later event-loop phase than the whole microtask queue, so the broken path asserts before the write lands. The mutation check is required by name in §11.2 ("delete one `await` inside `finishPass`, expect RED, restore") and repeated in §12.2's T-13 row. §10.1 and §12.2 no longer overclaim the two `return await finishPass(…)` call sites — both now say they are a stack/`try` improvement, since an `async` function's `return p` already adopts `p` |
| F-02 | Low | **Resolved** | §10.1 `:1595-1600` and the T-13 row both carry the take-side precondition, and the reason is stated in the terms I used: a bare absence "is equally true of a pass that never took one (a `refused` or `skipped-cadence` fixture, or a take that did not land — §10.3 row 5a)". The double can support the *take* half — `seams.js`'s `fakeFs` accumulates `writes`/`calls` histories, not just a current-state map (`__tests__/helpers/seams.js:243-252`, `:278-283`) — so the positive conjunct is observable post-hoc. The *release* half is where F-01 below reopens |
| F-03 | Low | **Resolved, and generalised** | The ER-6 discriminator now has an unnumbered `(no FSPEC AT)` row in §12.2 naming both directions (the sameness that is the ER-6 loss, and the reason-code difference that stands in for it), a `consolidationReport.test.js` entry in §12.3, and a back-reference from §12.4. Better than asked: the same repair was applied to the two register gaps (T-11's AC-3.2 citations, T-12's "and only when" negative), and §12.2 gained the rule that made it principled — "a named gap is not a licence to ship uncovered". §12.3 also explains how the parser reads a cell carrying prose beside its ids, which is the question the new cells raise |

## Findings

Four, all in text that did not exist at v3. Two are Medium and both are of the same kind: a
mechanism the revision newly *relies* on that the document has not decided.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | T-13's conjunct (ii) cannot be written: no seam in this TSPEC can make the marker "gone", and the document never says what `releaseMarker` does. Under §7.3's own rule the only implementable release (an in-place rewrite) yields `reclaim`, not `free`, on the next pass | §10.1, §7.3, §12.2 T-13 |
| F-02 | Medium | Local | §7.1's new "an enumerated file whose body cannot be read" decision mints three observables — counted in `\|un-consolidated\|`, present in the consumed pair, named in the report body — and none of them has a §12.2 row, a §12.3 file, or a register AT | §7.1, §10.4, §12.2, §12.3 |
| F-03 | Low | Local | The hook-side enumeration pin is anchored by line number (`:28`), and the edit that gives it two patterns is the same edit that can move it | §7.1, §12.3 |
| F-04 | Low | Local | AT-P1's `docs/discarded/` exclusion is now discharged entirely by an argv literal; the fact that makes the literal correct (what `:(glob)` does) is measured in §10.4's prose and asserted by no test | §7.1, §10.4 |

## Detail

### F-01 — T-13's conjunct (ii) has no mechanism under it (Medium)

The v3 repair made conjunct (ii) concrete, and making it concrete is what exposes this: it now reads

> the marker, **observed present in the write double during the pass**, gone after `main()` resolves
> (§10.1; the same words in §12.2's T-13 row)

I tried to write that assertion and could not, because the document never says what step 16 does.
Three checks, all against the repository:

1. **There is no delete seam.** §5.3's protocol declares `_readFile`, `_writeFile`, `_appendFile`,
   `_listFiles`, `_git`, `_agent` and no removal verb, and the adapter has none to widen to:
   `runtime-adapter.js` ships `rtWriteFile` (`:802`), `rtAppendFile` (`:863`), `rtListFiles`
   (`:905`), `rtGit` (`:945`) and no unlink of any kind.
2. **`_git` cannot do it either.** §13.1 row 9's invoking-tree domain (`:1440`) obliges `add` and
   `commit` and permits four *read* verbs; `rm` / `clean` are in no set, and the marker is untracked
   and `.gitignore`d by this feature's own §3.3, so `git rm` would not apply to it anyway.
3. **The REQ already decided the shape, and it is not a delete.** AC-1.3 says taking and releasing
   the marker "are **in-place rewrites of a whole small file**"
   (`REQ-pdlc-consolidation-agent.md:155-156`). So the only implementable release is
   `_writeFile(markerPath, …)` — after which the file is *present*, not gone.

That is not merely a wording problem in the test row, because §7.3's own rule turns the in-place
rewrite into a behaviour change: `markerVerdict` maps a **present but unparseable** marker to
`reclaim`, never `free`, and "the `present` flag is what separates that case from an absent file
(`free`)" (§7.3). A released marker whose content no longer parses is exactly present-and-
unparseable, so on the reading where `present` comes from `_readFile !== null`, **every steady-state
pass after the first reclaims a stale lock** and records `reclaimed-stale-lock` on a completely
normal run. On the other reading — `present` from `_checkFile().ok`, which distinguishes
`file_empty` from `file_missing` (`runtime-adapter.js:817-831`) — an empty rewrite reads as absent
and the behaviour is right. The document does not say which, and §7.3's signature
(`markerVerdict(parsed, present, nowMs, staleLockMinutes)`) leaves the provenance of `present` open.

**Required — two sentences, both in §7.3, and one clause in §12.2:**

- what `releaseMarker` calls and what it leaves on disk (my reading of AC-1.3 is `_writeFile` of
  empty content, but that is the author's call, not mine);
- where `present` comes from, stated as the seam call, and — if it is `_checkFile` — that
  `file_empty` is treated as absent, which is the conjunct that keeps a released marker from
  re-entering the `reclaim` arm;
- then restate T-13's conjunct (ii) in terms of that observable ("the write double's last recorded
  contents for the marker path are the released form", or whatever the decision makes true), so the
  positive-then-negative pair is checkable. As written, "gone" describes a state no seam produces.

This is Medium and not High because conjunct (i) — the terminal row present in the append double —
is untouched and still falsifies the await invariant the row exists for, so T-13 is not a test that
can only pass. What is unwritable is its AC-1.3 half, which is the half the v3 repair added.

### F-02 — §7.1's unreadable-corpus-entry decision owes three assertions and has no row (Medium)

The new §7.1 block ("An enumerated file whose body cannot be read, decided") settles a genuinely
open question and settles it the convergent way. But it mints three observable obligations:

1. the entry **counts toward `|un-consolidated|`** for the AC-1.2 volume test;
2. it **appears in the consumed pair**;
3. its basename is **named in the report body** as an entry the pass could not read.

I looked for who owes each and found nobody. §12.2 has no row for it; §12.3's
`consolidationPredicate.test.js` line carries AT-P1…AT-P11, and **AT-P8 is the unreadable *log*
file**, not an unreadable LEARNINGS body (`FSPEC-…:2025`); no register AT anywhere has a corpus
member whose `_readFile` returns `null` (I grepped the FSPEC for it). §10.4 class (ii) now points at
§7.1 for the behaviour, and §7.1 points at nothing.

Obligation 3 is operator-visible text and obligation 2 carries the convergence argument the block
rests on — "excluding it would leave it un-consolidated forever … the 'nudged forever, never
clearable' shape §10.4 already treats as the worst outcome". That argument is exactly the kind that
regresses silently: an implementation that drops the unreadable entry from the pair still passes
every row in §12.2, and the log then re-offers it on every pass. Obligation 1 is the same shape
in the other direction — a count that silently excludes unreadable entries makes the volume trigger
fire late, and nothing reds.

**Required:** one `(no FSPEC AT)` row in §12.2 and its §12.3 file entry, in the shape this revision
has now used three times, with the assertion stated as a pair rather than an absence — one fixture
whose corpus has an unreadable member and a readable one, asserting the unreadable basename is in
the consumed pair **and** named in the report body **and** counted, with the readable member as the
control. §12.2's own new sentence — "a named gap is not a licence to ship uncovered" — is the rule I
am applying; this block is a gap that has not even been named.

### F-03 — the hook-side pin is anchored by line number (Low)

§7.1 specifies the second pin as "reading the tracked `pdlc/hooks/scripts/nudge-consolidation.sh`
and asserting that `:28`'s expression is exactly the two patterns". At HEAD, `:28` is
`learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))` — one pattern (verified;
`:25` is `THRESHOLD = 5`, `:29-30` the early exit this feature relocates, `:41` the predicate,
`:43` the threshold test). The very edits this feature makes to that heredoc — a second glob, the
relocated exit, the `PDLC_PENDING:` line — are the edits most likely to shift the line index, and a
pin that resolves the wrong line is either vacuously green or noisily red for no defect.

**Required:** state the pin as a match over the `glob.glob(` expression's pattern set (all
`"docs/…"` string literals reachable from the enumeration statement), not over a line index. Keep
"exactly two, no third" — that is the falsifier and it is right; only the anchor needs to change.

### F-04 — what makes AT-P1's argv literal correct is asserted nowhere (Low)

I agree with the shape of AT-P1's new oracle: conjunct 1 is a literal transcription of the argv, not
an echo of the code, and conjunct 2 is the positive membership case, so the row is not absence-only.
And §7.1 is right that "a discarded line is filtered out" must not be asserted, because no filter
exists to assert.

The residue is that the sentence carrying the REQ's named exclusion — "abandoned work is not
evidence about a delivered pipeline" (`REQ-…:113-114`) — is now a claim about `git`, made in prose.
I reproduced §10.4's measurement at HEAD and it holds exactly as written: with `--exclude-standard`
and without it, `git ls-files --cached --others -- ':(glob)docs/*/LEARNINGS-*.md'
':(glob)docs/completed/*/LEARNINGS-*.md'` returns the same **5** paths and **0** under
`docs/discarded/`; dropping the `:(glob)` prefixes returns **7**. So the document's correction of
its own earlier claim is verified. But a measurement in a document is not an oracle, and this suite
already shells out to real subprocesses at L4.

**Suggested (not blocking):** one L4 case in `consolidationHookParity.test.js` running that exact
argv in the repository and asserting `0` results under `docs/discarded/` and `≥1` under
`docs/completed/`. It costs one `execFileSync`, it is the only thing in the plan that would notice
if pathspec semantics ever stopped meaning what §10.4 measured, and it converts the pin's
correctness from prose into a red.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §11.2's `asAsync` resolves on a `setTimeout(…, 0)` that is still pending when T-13's assertions run on the broken implementation. Jest will therefore fire that timer after the test body has finished — an open handle, and a write into a double that a later case may share. Is the row expected to drain it (`await new Promise(r => setTimeout(r, 0))` after the assertions, or fake timers advanced explicitly), and is the double instance per-case rather than module-level? Neither changes the discrimination; both change whether the suite is quiet. |
| Q-02 | §11.1's executed-row counter is asserted in an `afterAll`. On the degradation path §11.3(f) describes (no `python3`, or the hook unrunnable), does the harness `test.skip` every row — leaving `executed === 0`, the legitimate case — or does it skip the *file*? If a notice is emitted but rows still run against a degraded probe, `executed === TABLE.length` is reached with no real comparison behind it, which is the one way the all-or-nothing invariant could still be green on nothing. |
| Q-03 | §12.2 now carries three unnumbered `(no FSPEC AT)` rows, and §12.3 explains how the id parser ignores their prose. Is there anything asserting the converse — that a row *intending* to claim no id has not accidentally named one (say by citing AT-L5 in a sentence, which the report row does deliberately)? The parser is idempotent there, so this is a question about intent drift, not about the current text. |

## Positive Observations

- **F-01's repair went past the fix to the reason.** §11.2 does not merely swap `Promise.resolve`
  for `setTimeout`; it states the general fact — "a microtask deferral cannot survive a caller that
  awaits at all, because awaiting is itself microtask-scheduled" — gives the two-row table of what
  the test's continuation sees under each implementation, and then explains why the *recording* is
  deferred with the resolution rather than performed eagerly. That last paragraph closes the reading
  of "same recording behaviour" that would have made the row vacuous by construction, which is the
  half of my finding that was easiest to miss. Durable signal well beyond this feature.
- **The revision volunteered the scope limit I had only used as an argument.** §10.1, §11.2 and
  §12.2 all now say that the two `return await finishPass(…)` call sites are a stack/`try`
  improvement rather than a behavioural one, and that T-13 "does not claim the other two". A test
  row that states which of the three defects it can actually see is rarer than it should be, and it
  will stop a later reader from deleting the intra-`finishPass` `await` on the theory that "T-13
  covers awaits".
- **F-03's repair generalised into a rule.** Rather than adding the one row I asked for, §12.2 added
  the principle ("a named gap is not a licence to ship uncovered"), applied it to both register gaps,
  and distinguished the erratum from the local case as complementary rather than alternative. The
  §12.3 paragraph on how the parser reads a cell that carries prose is the load-bearing detail that
  keeps the set-equality honest while the cells grow.
- **§10.4 corrects its own earlier claim, out loud, and with a measurement.** "That is **false, and
  it contradicted §7.1 point 2 of this same document**" — followed by the exact command and its
  result. I re-ran it and it holds. The two costs are then stated asymmetrically (class (ii) not
  closable at this layer; class (i) closable at exactly one price) instead of merged into one
  impossibility claim, which is what makes the residue auditable.
- **Row 12's re-argument answers the question it was actually asked.** "A predicate differential is
  not a consolation prize for the enumeration equality — the two-region predicate is where every edge
  case the FSPEC enumerates lives (E-04, E-05, E-09, the region boundary), and it is the half a
  maintainer will actually change." That is the right justification for editing a shipped hook, and
  it survives row 6's narrowing rather than being weakened by it.
- **The fixture rule was moved into the code.** §11.3(f)'s "no fixture may depend on git visibility"
  is now specified to live in `consolidationDoubles.js`'s header, beside the precedents — and those
  precedents are real: `seams.js:1-41` ("**No test file defines an ad-hoc seam object**") and
  `advisoryDoubles.js:1-14` ("The single canonical source of every test double … PROP-INFRA-01
  scans the suite's own source text to enforce that"). A constraint a contributor must not violate,
  placed where they are working.

## Recommendation

**Needs revision**

Two Mediums are open, and both are narrow:

1. **F-01** — decide what `releaseMarker` does and where `markerVerdict`'s `present` comes from,
   then restate T-13's conjunct (ii) against that observable. As written the conjunct asserts a
   state ("gone") that no declared seam can produce, and the plausible in-place-rewrite reading
   collides with §7.3's present-but-unparseable ⇒ `reclaim` rule.
2. **F-02** — give §7.1's unreadable-corpus-entry decision a `(no FSPEC AT)` row and a §12.3 file
   entry, with the three obligations asserted as a pair against a readable control.

The two Lows are one-clause edits and do not block: F-03 (anchor the hook-side pin on the
expression, not the line index) and F-04 (one real-`git` case to turn §10.4's measurement into an
assertion).

Everything I raised at v3 is closed at the mechanism, and the `asAsync` repair in particular is
better than the fix I asked for. Both new Mediums are second-order consequences of good repairs —
the take/release conjunct became concrete enough to reveal that the release itself was never
specified, and the unreadable-entry question was answered so completely that the answer now owes
assertions. Neither is a redesign.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 2, "low": 2}
