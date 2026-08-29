# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.0)
**Date:** 2026-08-29
**Iteration:** 11 (delta confirmation — round 10's routed items, frozen round)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39`

## Scope

I approved this TSPEC at v0.7, v0.8 and — with two minor findings — at v0.9. This round is a **delta
confirmation** against a frozen decision set: I re-read my v10 findings, ran `git diff
5189b73fb..HEAD` over the TSPEC, re-measured upstream at HEAD, and then re-read §7.3 whole rather
than only the changed cells, per DEC-ERR-03.

Upstream is byte-unmoved at exactly the pins v1.0's changelog recites. I hashed both files at HEAD:
`REQ-pdlc-decision-ledger.md` is `sha256:ce6b133f0c1d…0d3c7b7c` and `FSPEC-pdlc-decision-ledger.md`
is `sha256:2bd5c3ef055f…735aed39`, matching the dispatch pins and the document's own recital
digit-for-digit. "Nothing is absorbed and no pin advances" is therefore true as measured. The four
corpus literals (6,305 / 10,859 / 12,059 / 441) are unchanged, and the diff touches exactly two
regions — the changelog and §7.3 — as the commit message claims: 44 insertions, 4 deletions, no
other section, no AT row, no traceability row.

## The three routed items

All three name one defect from different directions: §7.3 made `DECISION_LEDGER_CENSUS_TOKENS` a
member of `DECISION_LEDGER_OWNED_DECLS`, whose honesty rule obliges every member to resolve to
exactly one top-level declaration of `orchestrate-dev.js` with a non-empty slice — while no
module-surface section declared it. Both conjuncts were red by construction.

**All three are landed, and landed by one coherent resolution rather than three patches.**

1. *(te-review — the constant is the test's own operand, like `ANCHOR_TOKENS`.)* Landed at §7.3's
   new *Where the three census constants live* paragraph (:1324–1332): the three constants are
   declarations of the census test file, the precedent's `ANCHOR_TOKENS` is cited as the exact
   analogue — a top-level constant of `loopEconomicsAnchorGuard.test.js`, not of the module that
   test scans — and the paragraph states the load-bearing consequence explicitly, that a test-file
   constant can never be a member of the owned list. This is te-review's diagnosis adopted, not
   worked around.
2. *(se-author — no module-surface section declares it; the owned list must be fully specified.)*
   Landed the other way round, and correctly so: rather than manufacturing a production declaration
   in §3/§4/§5 to satisfy the list, the constant is removed from the owned enumeration (:1337). The
   owned list is now wholly module declarations, and I checked each of the fourteen resolves to a
   module-surface home — six functions (§4.1/§4.2/§4.4, signature blocks at :699, :733, :745, :861
   and the call graph at :282–292), `DECISION_CORPUS_ARGV` (§3.1:428), `DECISION_HEADING_RE`
   (§3.2:466), `DECISION_LEDGER_DEFAULTS` (§4.1:696), `DECISION_LEDGER_PREAMBLE` and
   `DECISION_LEDGER_RULE_TEXT` (§4.3:796–838), and §5.2's three catalogues (:946–948).
3. *(pm-review + te-review — §5.2 lists only three catalogues, §4 never introduces it.)* Landed by
   the same removal, and the changelog now states that §5.2/§4 gap as the reason rather than leaving
   a reader to rediscover it.

The removal of the "the token strings live inside its own declaration" rationale is the right call
and was correctly identified as consequential: that rationale only held while the constant was
production code, and with it in the test file the census — whose scanned source is
`orchestrate-dev.js` alone — never reads the file its literals live in. The changelog says so.

**The partition arithmetic still closes exactly, which is what I re-derived rather than took on
trust.** Forbidden tokens: six (four functions, two catalogues). Exempt after the removal: eight
(two functions, six constants). Union fourteen, disjoint. Owned declarations: six functions plus
eight top-level constants — fourteen. Exact set equality holds, disjointness holds, and the
"a later symbol must be classified or the test reddens" guard survives intact. No count word
anywhere in the TSPEC contradicts the new arithmetic; I grepped every numeric claim.

Product-wise nothing moved: §7.3 is an oracle for BR-11 / REQ-DECLEDGER-08 / NG-4, and the
traceability rows at :1644 and :1666 still point at it. No acceptance criterion was narrowed, no
scope added, no product question re-opened. This is a repair that makes an existing obligation
*provable*, which is strictly better for the requirement it serves.

## Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding |
|----|----------|-----------|----------|----------------|---------|
| F-01 | Medium | delta | nonlocal | PLAN v0.7 T-11 (:152) and the census checklist item (:488–500) | The edit reverses a design PLAN states verbatim in the opposite direction, and PLAN is what implementation reads. PLAN calls `DECISION_LEDGER_CENSUS_TOKENS` "**production**, declared by T-18 — which is what makes its slice non-empty and its resolves-to-one conjunct satisfiable", and pins the partition as six ∪ **nine** = **fifteen**, citing "TSPEC v0.9 §7.3". At TSPEC v1.0 the constant is a test-file declaration and the arithmetic is six ∪ eight = fourteen. Unless PLAN is re-pinned before batches 3–8 run, T-11/T-18 will rebuild the exact defect this erratum removed. TSPEC itself is correct; the obligation is the downstream re-pin. |
| F-02 | Medium | inherited | nonlocal | PROPERTIES PROP-INV-06 / PROP-INV-07 (:377–378) | PROPERTIES still encodes the forms round 9 retired: PROP-INV-06 scopes the census to "the **three** function bodies" plus the wiring run (TE F-01's unsatisfiable shape — `gatherDecisionCorpus` and §5.2's catalogues left in the remainder), and PROP-INV-07 demands set equality against "the module's exported decision-ledger symbol names", which §7.3 names red by construction. These were already stale against v0.9, so the cascade has now missed one full round — evidence the re-pin in F-01 needs to be run deliberately rather than assumed. The falsifiers for a P0 traceability claim (BR-11) should not be unimplementable at implementation time. |
| F-03 | Medium | inherited | nonlocal | §4.3 framing constants (:821–826) | §4.3 pins "the **four** constants together must render to ≤ 1,200 bytes" but names only two — `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT`; the header and trailer appear only as literals inside the rendered-form block. If header and trailer ship as top-level constants they are feature-introduced declarations absent from `DECISION_LEDGER_OWNED_DECLS`, and §7.3's "classified or the test reddens" guard fires on conforming code. If they are inline literals, "four constants" is the wrong phrase. One sentence in §4.3 saying which resolves it; the census arithmetic depends on the answer. |
| F-04 | Medium | inherited | local | §7.3 Scanned source cell, slicing precedent (:1337) | My v10 F-01 is still open and this round did not touch it (correctly — the round was frozen to the routed items). The widened slicing is grounded in `loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`, whose `DECL_RE` (`loopEconomicsAnchorGuard.test.js:60`) matches `function` declarations only, while eight of the now-fourteen owned members are top-level `const`s. A verbatim clone silently produces empty slices for them — caught by §7.3's own non-empty guard, but as a red at implementation time rather than as a stated obligation. Recording it so it is not lost across the version bump. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Will the PLAN and PROPERTIES re-pin (F-01, F-02) be run as part of this erratum's cascade, or does it need to be scheduled explicitly? PROPERTIES having missed the v0.9 cascade suggests the latter. |

## Positive Observations

- The resolution is the honest one rather than the convenient one. Manufacturing a production
  declaration in §5.2 would have satisfied the letter of the routed items in one line; instead the
  author asked where the constant genuinely belongs, found the precedent already answers it, and
  moved the constant to match. That is the harder edit and the correct one.
- The `ANCHOR_TOKENS` analogy is cited precisely — file, kind of declaration, and the relationship
  between the constant and the module the test scans — so a future editor can check the claim rather
  than take it.
- The new paragraph states its *consequence* ("a test-file constant can never be a member of it"),
  which is what stops the defect recurring. A paragraph that only relocated the constant would have
  left the next editor free to re-add it.
- The changelog is unusually good discipline: it names all three routed items, says which diagnosis
  was adopted and why, enumerates the three edits, re-states the measured upstream, and declares the
  sections touched. I verified each of those claims and every one held.
- Scope discipline held completely under a frozen decision set — two regions touched, no corpus
  literal moved, no approved decision re-litigated, and my own two open v10 findings correctly left
  alone rather than opportunistically edited.

## Recommendation

**Approved with minor changes**

All three routed items are landed, the TSPEC at HEAD is internally consistent, and the product
obligations it serves are unchanged and better proved than before. The four findings are all Medium
and none is a defect in the edit: F-01 and F-02 are downstream re-pins this edit makes necessary,
F-03 and F-04 are pre-existing precision items in sections this round was right not to open. Nothing
here gates the phase; F-01 should be actioned before implementation batches 3–8 begin.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 0}
