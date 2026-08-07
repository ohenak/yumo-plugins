# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.2)
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Delta re-review. Baseline `ea5be5a` (the bytes v2 reviewed) → HEAD; 251 insertions, 62
deletions across twelve commits. Two passes only: (1) each of v2's seven findings and four
questions, verified against the repository rather than against the revision's prose; (2) the changed
sections, read for new issues. Unchanged sections already approved are not re-litigated. The
approval bar is unchanged — any open High or Medium means **Needs revision**.

## Disposition of v2 findings

All seven are resolved, and each was re-verified against the code it cites, not against the
revision's account of it.

| v2 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | High | **Resolved, and verified id by id** | I read the FSPEC register (`FSPEC-…:2064-2077`) and diffed every re-bound cell. T-11's **AT-Q2** now matches the register verbatim ("three commits, each distinct `PDLC-PROMOTION-ID: {id}:{action}`, and `PDLC-CONSOLIDATION-PROMOTIONS` is **set-equal** three pairs") and the row says explicitly that AT-Q2, not AT-Q5, carries **both** trailer obligations. **AT-Q3** (open PR ⇒ `duplicate-suppressed`, `suppressed-by:` names the pair, `pr:` empty) and **AT-Q9** (branch deleted unmerged ⇒ trailer survives and still suppresses) are both correctly described and are the right pair for a writer↔reader round-trip. T-12 drops AT-Q9/AT-Q11 and binds the two degradation classes to **AT-Q6** (`branch-exists`) and **AT-Q8** (`api-failure`) — both match the register. AT-Q4 and AT-Q5 no longer appear in either row. The two obligations with no AT are named as gaps instead of bound to a nearby id, and I confirmed the AC→AT map: `:2269` reads `| AC-3.2 | §6.2 | AT-Q2 |`, so the citation gap is real |
| F-02 | Medium | **Resolved, at the measurement** | `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js` returns **exactly one** line, `:805`, inside `rtWriteFile` — the count the revision states. `rtReadFile` (`:493`) reaches disk through `rtReadProbe` (`:369`), whose prompt is `Run this exact command from the repository root:` followed by `if [ ! -f "${path}" ] …; wc -c < "${path}"; … shasum -a 256 "${path}"` (`:374-378`), and through the chunk read's `sed -n '…p' "${path}"` (`:282-283`) — every one a shell form that resolves an absolute path verbatim. §5.5 now has separate `_writeFile` / `_readFile` rows saying so, §5.6(a) is retitled and argues the read side positively, §9.2 and §13.1 row 11 agree, and §13.3 (i) narrows the PLAN's adapter task to one widening |
| F-03 | Medium | **Resolved, by the honest option** | T-08 is narrowed to the **predicate** in §12.2 and again in §1.1's decisions table; §10.4 records both divergence classes (ignored file in the hook's set only; staged-but-deleted in the pass's set only) as accepted exposure with the reason neither is closable; §11.3(f) states what the harness cannot falsify and adds the constraint that **no fixture may depend on git visibility**; §13.1 row 6 names which half AT-P7 holds. That last clause is the one I asked for and it is the one that will survive into the PLAN |
| F-04 | Medium | **Resolved** | `finishPass` is `async`, all three steps are `await`ed, both §10.2 call sites and §4.1's early-return form read `return await finishPass(…)`, and the after-`main()` oracle is stated and given a T-13 row plus its own file. The mechanism the oracle rests on is the subject of F-01 below, but the *specification* answers the finding |
| F-05 | Medium | **Resolved, and better than asked** | `RouteDecision` is named as the routing functions' four-member range, `Route` is reserved for the record field, the two are stated as neither subset nor superset, and §7.6 now says which oracle asserts which (`range(routeProposal) = RouteDecision` both directions; `route ∈ Route`). §12.4's ER-6 paragraph was updated to match rather than left contradicting it |
| F-06 | Low | **Resolved** | Every `:806-807` is now `:805`. I re-counted the neighbours: `rtWriteFile` spans `:802-811` (§7.3 and §10.3 row 5a updated to match), `rtListFiles`' `ls -p -A` line is `:915` and its basename validator `:929-931` (§7.1 and §13.1 row 10 updated), `build-runtime.mjs`'s doc comments are `:44` / `:54` with the declarations at `:45` / `:55`, and `MERGE_GUARD_DEFAULTS` is still `orchestrate-dev.js:48-53`. The new vocabularies citation is exact: the `Route` row is `docs/_constraints/pdlc-consolidation-vocabularies.md:57` |
| F-07 | Low | **Resolved, by withdrawal** | §11.1 deletes the tautological disjunction, says so by name, and replaces it with the all-or-nothing row count — which is falsifiable in the one case that matters (a mid-table interpreter failure or a swallowed fixture) and passes in the two legitimate ones |

Questions Q-01 – Q-04 are all answered in the document rather than in a reply. Q-01 produced a real
production edit (§7.1 moves the hook's `:29-30` early exit so `PDLC_PENDING:` is emitted on the
zero-corpus path, making `∅` a positive observation) plus a zero-corpus fixture row in §11.3(f); I
confirmed the shipped stdout contract is unchanged by it, since `n >= THRESHOLD` at `:43` is already
false for `n == 0`. Q-02 is answered by conceding the point — §11.3(e) now says the `:1573-1580`
precedent establishes *reading the file*, not matching prompt text, and that the prompt-text match is
a new shape; I checked, and `SOURCES` at `:1573-1577` is indeed the C0-control-byte scan's array.
Q-03 binds the dropped-code control to **AT-L5**, whose "no enumerated value without a §1 row"
direction genuinely covers the illegal fixture, so no id is minted and §12.3's set equality is
undisturbed. Q-04 makes `mergeProposals`' shared id **derived** from one drawn `(phase, artifact)`
pair, with the reason stated.

## Findings

Three new, all in text that did not exist at v2.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | `asAsync` defers by a **microtask**, which cannot falsify a missing `await`: the caller's own `await main()` drains the microtask queue first, so T-13 — the sole oracle for §10.1's await-discipline invariant — is green either way | §11.2, §10.1, §12.2 T-13 |
| F-02 | Low | Local | T-13's second conjunct ("the marker is absent from the write double") passes vacuously on any fixture where the marker was never taken; it needs a take-side precondition to be a falsifier | §12.2 T-13, §10.1 |
| F-03 | Low | Local | The ER-6 discriminator control is specified in §7.6 and relied on in §12.4, but has no §12.2 row and no §12.3 id — the one table the PLAN reads to learn which test owes an obligation does not carry it | §7.6, §12.2, §12.4 |

## Detail

### F-01 — `asAsync`'s microtask deferral cannot falsify a missing `await` (Medium)

§10.1 makes the strongest possible claim about T-13: it is "the only row that distinguishes *written*
from *scheduled*", because §11.3(c)'s identifier scan cannot see a module function and every other L2
suite drives sync doubles. I accept that framing — it is why the F-04 repair is right. But the
mechanism the row rests on is specified in §11.2 as:

> `asAsync` takes any of them and returns a function with the same recording behaviour whose result
> is a promise resolved on a **later microtask tick**, so a caller that forgets `await` observes the
> pre-write state.

That does not hold, under either reading of "the same recording behaviour".

**If the recording is synchronous and only the result is deferred**, the missing `await` is invisible
by construction: `appendTerminalRow` is a void write whose only observable is the double's
accumulated text, and that text is already updated at call time.

**If the recording itself is deferred by one microtask**, the ordering still defeats the test. Take
the broken implementation §10.1 exists to catch — `finishPass` calls `appendTerminalRow(state)`
without `await`:

1. The double runs, hits its `await Promise.resolve()`, queues continuation **C1**, returns a pending
   promise that `finishPass` drops.
2. `finishPass` proceeds and returns `report(state)`; `main()`'s promise resolves.
3. The test's `await main()` resumes — but only on a microtask, which is queued **after C1**.
4. C1 runs first and records the append. The assertion then sees the terminal row present. **Green.**

Any subsequent `await` inside `finishPass` (step 15's commit is one) only widens the gap. The general
fact is that a microtask deferral cannot survive a caller that awaits at all, because awaiting is
itself microtask-scheduled.

There is a second reason to be careful here, and it sharpens rather than softens the finding. Of the
three `await`s the repair adds, the two at §10.2's call sites are **not** behaviourally observable:
`return finishPass(...)` from an `async function` adopts the returned promise, so a caller that
awaits `main()` already waits for `finishPass` to settle — `return p` and `return await p` differ
only in stack/`try` semantics. So the *only* defect T-13 can catch is the intra-`finishPass` one, the
un-awaited `appendTerminalRow` — precisely the case the microtask double greens. The row would ship
as a test that can only pass, guarding an invariant the document itself says nothing else guards.

**Required:** specify the deferral as a **macrotask** — `setTimeout(…, 0)` / `setImmediate` — or,
better, as an explicitly held deferred the test resolves *after* it asserts. With a macrotask, the
discrimination is exact and worth stating in the document: on a correct implementation `await
appendTerminalRow` waits for the timer and the row is present; on a missing `await` the test's
microtask-scheduled continuation runs before the timer fires and the row is absent. And state the
mutation check the row deserves as its own falsifier: delete one `await` in `finishPass`, expect RED.

### F-02 — T-13's marker conjunct is absence-only and can pass vacuously (Low)

The row's two conjuncts are "(i) the terminal row is present in the log double's accumulated text and
(ii) the marker is absent from the write double". (i) is a positive presence assertion and carries
the row. (ii) is a bare absence, and absence of a marker is also what you observe from a pass that
never took one — a `refused` fixture, a `skipped-cadence` fixture, or a take that did not land
(§10.3 row 5a). So (ii) is satisfied by the wrong world as readily as the right one.

It is Low because (i) is sufficient for the row's stated purpose and because the fixture is presumably
a full promoting pass. But the fix is one clause and it makes the AC-1.3 half of the row real: assert
the marker's take *and* its release on the same path — the write double records the marker's content
during the pass, and it is gone after `main()` resolves. That is the positive-then-negative pair the
§11.3 oracles elsewhere in this document already use.

### F-03 — the ER-6 discriminator has no traceability row (Low)

§7.6 adds a genuinely good control: two fixtures that both write `route: "degraded"` — one *routed*
propose-only (a `revise` on a `DOMAIN-CONSTRAINTS.md` target), one *degraded* (`branch-exists`) —
whose report bodies differ by the presence of a named reason code, asserted in both directions. §12.4
then leans on it hard: "the interim is falsifiable rather than merely argued".

But it appears in no §12.2 row and claims no id in §12.3, whose `consolidationReport.test.js` line is
exhaustively AT-L1…AT-L5 + AT-N1…AT-N4. The document has just spent a revision establishing that
§12.2's Falsified-by column is what tells a PLAN task which assertion it owes, and it solved exactly
this problem twice in the same pass — T-13 got its own row plus a `(no FSPEC AT)` file line, and the
dropped-code arm was bound to AT-L5. This control got neither, so the obligation lives only in §7.6's
prose, which is the layer a PLAN task is least likely to read for assertions.

**Required:** give it a §12.2 row in the same `(no FSPEC AT)` form as T-13 (or fold it into the
dropped-code row that already sits in that file), so the traceability table and the ER-6 argument
agree about who owes it.

## Questions

## Positive Observations

## Recommendation

## Verdict
