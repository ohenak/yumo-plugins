# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 6
**Scope:** product lens — delta re-review of the revision since v5; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v5:** `6bcd258` · **Head reviewed here:** `4df1f7b`

## Prior findings — disposition

**The document did not change between v5 and this pass.** `git diff 6bcd258..HEAD --
docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md` is empty; the only files added on the branch
in that range are six cross-review documents (`--stat`: `CROSS-REVIEW-product-manager-PLAN-v10.md`,
`CROSS-REVIEW-product-manager-PROPERTIES-v5.md`, `CROSS-REVIEW-software-engineer-FSPEC-v8.md`,
`CROSS-REVIEW-software-engineer-PROPERTIES-v5.md`, `CROSS-REVIEW-test-engineer-FSPEC-v8.md`,
`CROSS-REVIEW-test-engineer-PLAN-v10.md` — 688 insertions, 0 deletions, no other path touched). The
last commit to touch this document is still `6bcd258`, the head I reviewed at v5.

Both v5 findings were **Low** and neither blocked approval, so an unchanged document is a consistent
outcome, not a regression. Both are re-verified as still open at head, unchanged in form:

| v5 ID | Sev | Disposition | Evidence at `4df1f7b` |
|---|---|---|---|
| F-01 | Low | **Still open — unchanged** | `PROPERTIES:1160` still reads "### 13.1 Upstream defects — routed, not absorbed" while `:1162-1163` immediately beneath still states "**None is still open — all six are now closed upstream, and none is emitted as an `ERRATUM:` line.**" Substance re-confirmed at head: `grep -n ERRATUM` over the document returns exactly two lines, `:26` and `:1163`, and both are negations ("no `ERRATUM:` line is emitted from this document"), so nothing is routed upstream from this document and the phase's remaining erratum round is still unspent. Cosmetic only. |
| F-02 | Low | **Still open — unchanged** | `PROPERTIES:446` still quotes "Nine members, **`waitMs` deliberately not tenth**" and `:1197` repeats it, against `TSPEC:424`'s actual text "Nine members, and **`waitMs` is deliberately not a tenth.**" The companion quotation still reads "the `waitMs` argument the driver passes `budgetExceeded`" (`PROPERTIES:447`, `:1198`) against `TSPEC:428`'s "…passes **to** `budgetExceeded`". Close-paraphrase inside quotation marks; the asserted contract is identical either way, so no product surface moves. |

## Findings

Scope of this pass: nothing changed, so there is no changed section to scan. Per the delta protocol I
do not re-litigate sections I approved at v5, and I re-derived only the invariants that would have to
move for the product surface to have shifted:

- **Property inventory is unmoved.** `grep -c '^| PROP-'` returns **183** at head, the same count I
  recorded at v5. §1's and §12.3's 195 / 148 / 40 / 7 / 0 level budget therefore stands without
  recomputation, and the changelog's own claim (`PROPERTIES:28`) remains true as written.
- **§12.1's AC→property matrix is untouched.** AC-4.6's row (`PROPERTIES:1004`) still names
  PROP-PROH-01…04 and PROP-GATE-01…05, which is the mapping I verified against §6.5's revised A1/A3
  form at v5. No acceptance criterion is narrowed, reinterpreted, broadened or dropped in this range,
  because no line of the document changed.
- **No erratum is emitted.** Re-confirmed at head above (F-01 row). Nothing is routed upstream from
  this document.

The two rows below are the v5 Lows carried forward verbatim, re-verified at head. I am not restating
them as new findings — they are the same two defects with the same fixes, and neither has been touched.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **§13.1's heading still contradicts its own contents** (carried from v5 F-01). The heading reads "Upstream defects — **routed**, not absorbed" (`PROPERTIES:1160`) while the body beneath states nothing is routed (`:1162-1163`). §13.1 is the routing contract a downstream reader consults to learn what this document handed upstream, and a heading is the line most likely to be read on its own. **Fix:** "### 13.1 Upstream defects — closed upstream, not absorbed". | §13.1 routing contract |
| F-02 | Low | Local | **Two quotations of `TSPEC:424` are paraphrases inside quotation marks** (carried from v5 F-02). `PROPERTIES:446` and `:1197` quote "Nine members, **`waitMs` deliberately not tenth**"; `TSPEC:424` reads "Nine members, and **`waitMs` is deliberately not a tenth.**" The companion quotation drops a "to" against `TSPEC:428`. The asserted contract is identical, so this is transcription hygiene, not misattribution — but this document's own standard is literal transcription from the spec, and a quoted string that does not match its cited line is the one thing a later reviewer cannot verify by grep. **Fix:** transcribe both lines exactly, or drop the quotation marks. | Transcription discipline (§5.2, §13.1 item 4) |

## Questions

## Positive Observations

## Recommendation

## Verdict
