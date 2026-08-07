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

## Positive Observations

## Recommendation

## Verdict
