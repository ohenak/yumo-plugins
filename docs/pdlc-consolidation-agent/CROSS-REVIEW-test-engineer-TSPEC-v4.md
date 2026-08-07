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

## Questions

## Positive Observations

## Recommendation

## Verdict
