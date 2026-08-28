# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.3, `1d951e5ee`)
**Date:** 2026-08-28
**Iteration:** 4
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v3.md`. Diff base `ba52b2460`
(v1.2, the bytes v3 reviewed) → `1d951e5ee` (v1.3). The diff is 89 lines and touches: the header
table, §2 G-1's scope paragraph, §5 REQ-DECLEDGER-01's Given/Then, REQ-DECLEDGER-04's
parenthetical, REQ-DECLEDGER-08's Given, and §7 O-1. Unchanged sections already approved in
earlier rounds are not re-litigated.

## Round-3 finding disposition

| v3 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-16 | High | **Partly resolved (residue re-filed as F-20)** — two of its three legs land. (a) The false exemplar is gone: `DEC-AWG-Q1` is now correctly described as a citation occurring once in prose (`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:14` is still the sole `DEC-AWG` hit in the repo), and the file is explicitly a zero-line contributor. (c) The arithmetic and the rule now agree in intent: G-1 states "C-5's 41 is this count", and C-5's `41` reproduces at HEAD — `grep -rhoE '^#{1,6} +DEC-…' docs/_decisions/*.md` yields exactly 41 heading lines, 41 unique ids, none with a non-numeric final segment. (b) is where the residue sits: the new predicate admits *line-leading list items*, and at HEAD four such lines exist inside a file G-1 simultaneously declares records nothing (F-20). |
| F-17 | Medium | **Resolved** — G-1 now pins `NUMBER` as numeric and demotes `DEC-AWG-Q1` to a citation, so one grammar stands where two contradicted. Verified against HEAD: every one of the 41 heading-carried ids under `docs/_decisions/` matches `DEC-{NS}-{digits}`, so the numeric matcher and the corpus agree. The residual factual slip in the same sentence is F-21, non-gating. |
| F-18 | Medium | **Resolved** — AC-01's Given now reads "and the in-scope set is within C-5's bounds", and its Then re-bases set equality on "G-1's in-scope set; over-budget omission is REQ-DECLEDGER-07's alone". The two criteria no longer overlap: AC-01 owns the equality, AC-07 owns the budget boundary. This is exactly the one-clause fix, and it removes the case where a fixture exceeding `maxEntries` made AC-01's expected set depend on a rule routed to TSPEC. |
| F-19 | Low | **Resolved** — REQ-DECLEDGER-08's Given now carries the positive conjunct: the `false` run's dispatch is byte-identical to C-2's baseline (REQ-DECLEDGER-02) and the `true` run's carries the rendered index (REQ-DECLEDGER-01), "asserted not merely allowed". The excluded leg is now falsifiable in both directions rather than carved out. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-20 | High | Local | **G-1's new record predicate and G-1's own disposition of `.consolidation-log.md` contradict each other at HEAD, so AC-01's expected rendered set is still two different numbers depending on which sentence a tester transcribes.** The predicate says a decision is in scope where "the id opens the line as its subject (a heading **or a line-leading list item**), and `NUMBER` is numeric". Three sentences later the same paragraph says the three `CONSOLIDATION-PROPOSAL-*.md` files "and `.consolidation-log.md` under `docs/_decisions/` cite ids but **record none**, and are on this path [zero lines]. C-5's 41 is this count." At HEAD the second sentence is false under the first. `docs/_decisions/.consolidation-log.md:275`, `:277`, `:279`, `:281` are four line-leading list items whose first token *is* the id with a numeric final segment — `` - `DEC-ERRROUTE-01` — regime-ledger … ``, `DEC-ERRROUTE-03`, `DEC-TERM-02`, `DEC-ORACLE-06` — each followed by a one-line statement, i.e. record-shaped by every clause of the stated rule. (`grep -rnE '^ *[-*] +\`?\**DEC-[A-Za-z0-9]+-[0-9]+' docs/_decisions/` returns exactly these four, and zero in the three `CONSOLIDATION-PROPOSAL-*.md` files, which are correctly disposed.) So a tester who applies the predicate renders 45 lines; a tester who trusts the disposition renders 41. Nor does the document break the tie elsewhere: all four ids *are* also `##` headings in sibling files (`DECISIONS-erratum-routing.md:12`, `:38`; `DECISIONS-loop-termination.md:28`; `DECISIONS-test-oracle-mechanics.md:126`), and the only dedupe G-1 states is **within one file** ("cited again later in its own file without contributing a second line"), while REQ-DECLEDGER-06 explicitly scopes the id-as-key to reviewer prose and disclaims driver-side identity. Cross-file duplicate record-shaped lines therefore have no stated outcome — and if they render, AC-01 also has no stated answer for *which* statement text and citation the duplicate line carries. This is the same failure mode as F-16: the only way to green a set-equality check is to read the renderer, which AC-01's own "set equality, not containment" wording forbids. The fix is one clause at REQ altitude, not a re-scope — either (i) restrict the carrier to a heading and say `.consolidation-log.md` contributes zero because its entries are list items, or (ii) keep list items and add the missing rule ("an id already opened by a record elsewhere in scope contributes one line, from that record; a later record-shaped line naming it is a citation"), which also disposes of `.consolidation-log.md` at 41 for a *stated* reason rather than by assertion. Either way C-5's 41 then follows from the rule instead of standing beside it. | §2 G-1; §4 C-5; §5 REQ-DECLEDGER-01 |
| F-21 | Medium | Local | **G-1's markup enumeration and O-1's routing now overlap, so "the in-scope set is not routed — G-1 states it" is only true if TSPEC may not change the carrier forms.** G-1 fixes the carriers ("a heading or a line-leading list item"); O-1, rewritten in this same diff, routes "which markup forms count as record carriers" to TSPEC while asserting the in-scope set itself is not routed. Both cannot hold: the set is a function of the carrier forms, as F-20 demonstrates with a four-line swing on the real corpus. For a test author this decides whether AC-01's expected set is derivable from the REQ alone (it must be — that is what AC-01 promises) or only after TSPEC lands. One sentence resolves it: state that G-1's two carrier forms are the contract and that O-1 routes only *recognition detail within* those forms (e.g. `-` vs `*` bullets, backticked vs bare ids, heading numbering), not membership. | §2 G-1; §7 O-1 |
| F-22 | Low | Local | **"the sole non-numeric token" is false at HEAD, though nothing downstream depends on it.** G-1 calls `DEC-AWG-Q1` "the sole non-numeric token". `DEC-LI-NN` also occurs, twice, in a feature's own decision record — `docs/completed/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md:54` and `:107` ("Each `DEC-LI-NN` carries Context, Decision, …") — i.e. inside the second source class G-1 names, not merely in `docs/_decisions/`. The outcome is unaffected: both tokens are prose citations and both fail the numeric rule, so the set is the same either way. But a tester grepping HEAD to confirm the numeric grammar hits a counterexample the REQ says does not exist, and this round's High in v3 was itself a false HEAD exemplar. Cheapest fix is to drop the superlative: "`DEC-AWG-Q1`, occurring once in prose as a range shorthand …, is a citation". | §2 G-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-20: was `.consolidation-log.md` disposed as a zero-line contributor because its entries are *list items in a log of promotions* (a class distinction the predicate does not carry), or because its ids are already recorded elsewhere (a dedupe rule the predicate does not carry)? The two answers imply different rules for a synthetic fixture, which is where AC-01 will actually be tested. |
| Q-02 | F-21: may a TSPEC author add a carrier form (a table row whose first cell is the id, say — `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:50` is one) without a REQ revision? If yes, AC-01's set equality is not REQ-derivable; if no, O-1 should say so. |

## Positive Observations

- **The record-versus-citation distinction is now stated as a black-box property, at the right
  altitude.** "The id opens the line as its subject … and `NUMBER` is numeric" is a predicate a
  test author can transcribe literally into a fixture without knowing anything about the
  renderer, and it is the axis that was missing in v1.2 — carrying an id versus stating one.
  Everything in F-20 is an edge of this predicate, not a challenge to its shape.
- **Three of the round's four HEAD claims reproduce exactly.** C-5's `41`, the "three
  `CONSOLIDATION-PROPOSAL-*.md` files record none" disposition, and the `DEC-AWG-Q1`-as-prose
  reading each verify by grep at HEAD, and the 41 heading ids are 41 *unique* ids with no
  duplicate to break set equality. After two rounds where the load-bearing exemplar was false,
  this round's arithmetic is checkable and checks out.
- **AC-01's Given/Then split (F-18) is the cleanest possible fix.** Adding "within C-5's bounds"
  to the Given and handing over-budget omission wholly to REQ-DECLEDGER-07 gives each criterion
  one oracle: AC-01 is a set-equality test over a bounded fixture, AC-07 is a boundary test. No
  test now has to model two rules at once, and neither criterion can pass vacuously through the
  other's fixture.
- **REQ-DECLEDGER-08 now asserts the excluded leg positively (F-19).** "byte-identical to C-2's
  baseline" for `false` and "carries the rendered index" for `true` replaces a negative
  carve-out with two positive conjuncts on the same path — precisely the shape that stops an
  A/B-equivalence test passing while the dispatch leg is silently broken.
- **REQ-DECLEDGER-04's rewording keeps the fail-open fixture honest.** "files with no decision
  record are not this path — G-1" tracks the new predicate exactly, so a partial-failure test
  cannot be written against a no-record fixture that would pass vacuously through the ordinary
  empty-result path.

## Recommendation

**Needs revision** — one High (F-20), and the revision is one clause. G-1 needs the tie-breaker
between its carrier predicate and its own `.consolidation-log.md` disposition: either restrict
the carrier to headings, or keep list items and state the cross-file rule that makes an id's
second record-shaped line a citation. Once that sentence exists, C-5's 41 is *derived* rather
than asserted, and AC-01's set-equality oracle becomes writable from the document alone — which
is the entire promise AC-01 makes.

F-21 (one sentence separating G-1's carrier contract from O-1's recognition detail) and F-22
(drop one superlative) are non-gating and each cost a line. Everything else in the changed
sections landed cleanly: three of the four round-3 findings are fully resolved, the fourth is
two-thirds resolved, and no unchanged section regressed.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
