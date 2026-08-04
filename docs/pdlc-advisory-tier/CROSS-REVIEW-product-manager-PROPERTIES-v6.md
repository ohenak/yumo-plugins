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

| ID | Question |
|----|---------|
| Q-01 | Process, not product, and it needs no answer from the author: this is the second consecutive pass in which I return "Approved with minor changes" over the same two Low findings, and the document was not revised between them because — correctly — nothing obliged it to be. If the loop is still open only because some other reviewer's findings are open, the two Lows here are free to fold into whatever revision closes those. If the loop is open with nothing outstanding anywhere, then this document has converged from the product lens and the two Lows should be carried to the next touch of the file rather than spending a round. |

## Positive Observations

- **An unchanged document is the right response to two non-blocking Lows.** v5 approved with minor
  changes; neither finding was a blocker, and neither is a product-surface defect. Revising a
  1,200-line document to repunctuate two quotations would have risked more than it fixed. The author
  choosing not to churn is a correct reading of the approval bar, and I want that noted rather than
  penalised.

- **Everything I approved at v5 is verifiably still true at head.** I re-derived the three invariants a
  product reviewer would care about — 183 property rows, the untouched §12.1 AC→property matrix, and
  zero emitted errata — rather than assuming they held because the diff was empty. All three hold at
  `4df1f7b`.

- **The routing contract is still clean.** All six §13.1 items remain closure records citing the
  upstream line that carries each resolution, and the phase's one remaining erratum round is still
  unspent. That was the substance of my v4 Medium, and it has now survived two passes without
  regressing.

## Recommendation

**Approved with minor changes** — zero High, zero Medium, two Low.

The document is byte-identical to the one I approved at v5: `git diff 6bcd258..HEAD` on it is empty,
and the only additions on the branch in that range are six cross-review files. There is therefore no
changed section to scan for new issues, and nothing in this range could have broken what I approved —
a claim I did not take on trust: 183 property rows, §12.1's AC→property matrix untouched, and zero
`ERRATUM:` lines emitted, all re-derived at `4df1f7b`.

No acceptance criterion is narrowed, reinterpreted or dropped, and no scope is present that the REQ
does not carry — the same conclusion as v5, for the same document.

The two findings are the v5 Lows carried forward, both cosmetic and neither blocking: §13.1's heading
still says "routed" over a section that routes nothing, and two quotations of `TSPEC:424` paraphrase
inside quotation marks. Fold them into the next revision of this file if one happens for another
reason; neither justifies a round on its own.

No errata from me. Every upstream item this document records was already closed upstream, and each
closure still cites the line that carries it at head.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
