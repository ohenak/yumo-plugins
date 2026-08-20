# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.9)
**Date:** 2026-08-19
**Iteration:** 11 (decision freeze)

Scope of attention: the delta `cbb0a63e..HEAD` on this document — commit `523e2df9`, 8 insertions / 5 deletions, two loci only: the revision-history blockquote (v0.9 note relocated below the v0.8 note and expanded) and the AC-6.2 reverse-trace row's section reference. Everything else is byte-identical to the v0.8/v0.9 text approved at iteration 10 and is not re-litigated here.

## Prior findings

| Prior | Status | Evidence |
|---|---|---|
| v10 F-01 (Low) — BR-9's per-document prose says "one reason id from this set" while AT-19 enforces "exactly one" | **Open, unchanged** — BR-9 `:505-506`, AT-19 `:849-851`. Untouched by this delta; inherited, still non-gating. |
| v10 F-02 (Low) — AT-22's subject/predicate slip (rule-input record "equals an expected selection") | **Open, unchanged** — `:860-864`. Untouched by this delta; the no-production-selector clause and hand-transcribed fixture still make the intent recoverable. |
| v10 DEFERRED — TSPEC §I.2/§OQ.2 run-level rule-input question | Still deferred to the TSPEC round; downstream document. |

No prior finding regressed, and no prior finding was silently re-opened by the relocation of the v0.9 note.

## Delta verification

1. **Revision-history ordering.** The v0.9 paragraph was removed from `:29-32` (where it preceded the v0.8 erratum note) and re-inserted at `:39-45`, immediately beneath v0.8. The history now reads v0.6 → v0.7 → v0.8 → v0.9 in ascending order; no note was overwritten, and the v0.8 text is byte-identical across the move. The v0.9 note and the v0.8 note now share one blockquote (`>` continuation at `:38`), which renders as one block but reads correctly — both retain their bolded version lead-in.
2. **Content of the v0.9 note re-checked against the body.** Each claim it makes still holds at HEAD: corpus-level outcomes and ordering key values per authoring dispatch (BR-9 `:505`, BR-10 `:547-556`, Step 21 `:237-238`); §4.1 thresholds run-level (BR-10 `:551`); BR-10 closing at two loci with one completeness test each (AT-22 `:863-864`); mirrors additive, not oracles (`:537-538`). These match `REQ:317-319`, `REQ:320`, `REQ:336-345` at REQ HEAD (v0.9).
3. **AC-6.2 row reference.** `:149` now reads `§Acceptance Tests preamble`. The document's canonical heading is `## Acceptance Tests` (`:748`), and the preamble at `:750` is exactly where AC-6.1/AC-6.2's execution conditions are stated, naming AT-31 and AT-32's fixture-corpora requirement. The prior form (`§Acceptance-test preamble`) matched no heading in the file; the delta fixes a dangling section reference rather than changing a claim. AT-31 (`:899`) and AT-32 (`:902`) exist and are the tests the row cites, consistent with the AC-5.1a/b/c rows at `:143-145`.
4. **Nothing else moved.** `git diff --stat` confirms the two hunks above are the whole change; BR-1..BR-16, the edge-case inventory (`:679-747`), all thirty-two acceptance tests, and the Open Questions section are unchanged from the text approved at v10.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | Inherited from v10 and untouched by this delta: BR-9's per-document catalogue says a non-contributing document "carries one reason id from this set" (`:505-506`) while AT-19 asserts "exactly one per-document reason id" (`:849-850`). The test is stricter than the rule it enforces. **Fix:** restore "exactly one" to BR-9 when that paragraph is next edited. Not delta-introduced; not gating. | §BR-9 (`:505`) |
| F-02 | Low | Local | Inherited from v10 and untouched by this delta: AT-22's subject is the rule-input record but its predicate is a selection — "*when* the rule-input record of a named dispatch is read … *then* **it** equals an expected selection … (paths, in order)" (`:860-863`). The record (ordering key values plus thresholds) does not equal a selection; the reproduction derived from it does. **Fix:** "*then* reproducing the selection from it yields the expected order, transcribed literally by hand and committed in the fixture." Not delta-introduced; not gating. | §AT-22 (`:860`) |
| F-03 | Low | Process | The header Cross-Reviews row (`:12`) enumerates `v{1,2,3,4,5,6,7,8,9}`; rounds 10 and now 11 exist on disk. The v0.9 note claims this row was "corrected", which was true at authoring time and goes stale by construction each round. **Fix:** state the row as a glob (`-v{N}.md`, all rounds) so it cannot lag. Documentation-only; not gating. | §Header (`:12`) |

## Questions

None. This delta raised no new question, and v10's Q-01 remains answered in the document text (`:537-538`).

## Positive Observations

- **The delta is exactly what a frozen round should look like.** Eight insertions, five deletions, zero behavioural text. Both edits are corrections of the document's own bookkeeping — the chronology of its revision history and a section reference that resolved to nothing — and neither touches a rule, a flow step, an edge case, or an acceptance test. Nothing here re-opens a decision.
- **The relocated v0.9 note is verbatim-preserving and additive.** The v0.8 erratum text survives the move byte-identical, and the v0.9 note gained the attribution detail it lacked (which reviewer's items drove which change, and the explicit "Locus corrections only; no new behaviour" close). A reader arriving at HEAD can now reconstruct the whole locus migration from the header alone, in the order it happened.
- **The AC-6.2 fix was verified against the real heading, not asserted.** `§Acceptance Tests preamble` resolves to `:748`/`:750`, where AC-6.1 and AC-6.2's execution conditions actually live and where AT-31/AT-32's fixture-corpora requirement is stated. The prior form matched no heading in the file, so the traceability row was unresolvable for a reader following it; it is now a live reference.

## Deferred

DEFERRED: BR-9's per-document prose should regain "exactly one" to match AT-19's set-equality oracle — fold into the next non-frozen edit.
DEFERRED: AT-22's subject/predicate slip (rule-input record vs. reproduced selection) — wording only, the no-production-selector clause already pins intent.
DEFERRED: Header Cross-Reviews row should be a glob rather than an explicit round enumeration, so it cannot lag the round counter.
DEFERRED: TSPEC §I.2/§OQ.2's parked run-level rule-input question re-grounds on FSPEC v0.9's two loci in the next TSPEC round — downstream document, out of scope here.

## Recommendation

**Approved with minor changes**

No High finding. Under the decision freeze, a blocking finding must be either a defect this delta introduced or a factual contradiction with the repository at HEAD or an upstream document; this delta introduced neither. The revision-history relocation preserves the v0.8 text byte-for-byte and its v0.9 claims re-verify against REQ HEAD v0.9 (`REQ:317-319`, `REQ:320`, `REQ:336-345`); the AC-6.2 row now names a heading that exists (`:748`) and cites tests that exist (`:899`, `:902`). The three recorded findings are all Low: two are inherited from v10, untouched by this delta, and the third is a documentation row that goes stale by construction. All are recorded for the next non-frozen edit, none blocks.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:764414d0d049480ae616dd04fdc5fc44a70f268674d704766d0b191189c492e0
APPROVAL-HASH-NORMALIZED: sha256:764414d0d049480ae616dd04fdc5fc44a70f268674d704766d0b191189c492e0
REVIEWED-COMMIT: cb220f5af3e206ae6403939cb48a9ace4eb0132b
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
