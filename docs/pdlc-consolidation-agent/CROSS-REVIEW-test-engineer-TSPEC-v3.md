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

## Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
