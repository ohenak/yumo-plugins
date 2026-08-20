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
