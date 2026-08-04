# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 5
**Scope:** product lens — delta re-review of the v1.3→v1.4 revision; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v4:** `08925cf` · **Head reviewed here:** `6bcd258`

## Prior findings — disposition

Both v4 findings are **resolved**, and I re-verified each closure against branch head rather than
against the revision's own account of itself.

| v4 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | §13.1's preamble now reads "**None is still open — all six are now closed upstream, and none is emitted as an `ERRATUM:` line**" (`PROPERTIES:1162-1163`), and items 1, 3, 4 and 6 are rewritten in item 5's closure form. I re-checked all four closures at head, not the citations' plausibility: item 1 — `TSPEC:655` gives A1's `verifyGate` as "**`null`** — A1 declares no post-action gate (§5.4's '—' row) … Deliberately **not** `async () => ({ passed: true })`", `TSPEC:657` gives A3's as "**`null`** — same shape as A1", `TSPEC:416` types it `{null \| (() => Promise<…>)} verifyGate`, `TSPEC:434` states "Those two seams also supply **`verifyGate: null`**", and `PLAN:1024` records the resolution "in favour of `null`" with `PLAN:869` stating the mutation in both directions. Item 3 — `PLAN:257`'s A-06 row now carries "`result.reason ∈ {\"prohibited-action\", \"revert-on-test-touch\", \"out-of-envelope\"} ∪ {null}` — the three-member enum `TSPEC:532` declares, **not** the eight-member `ADVISORY_REFUSAL_REASONS`", matching `PLAN:779`. Item 4 — `TSPEC:424` holds `SeamOps` at nine members with `waitMs` "deliberately not a tenth", `TSPEC:428` names the surface as "the `waitMs` argument the driver passes to `budgetExceeded`, not a `SeamOps` accessor", `TSPEC:489` gives `runAdvisorySeam` the counter. Item 6 — `TSPEC:1265-1271` now reads "a grep for the token `advisory.enabled` finds one site, not three. The assertion is a **source-text scan for `/\.enabled\b/`**" over the two named modules, "and it must return **exactly three** matches". Nothing is routed from this document; the erratum round the phase still has is unspent. |
| F-02 | Low | **Resolved** | §2.1 no longer cites the deleted `A-00`. It now cites the primary source — `pdlc/workflows/package.json:18-22`, whose `jest.testPathIgnorePatterns` is `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]` (`PROPERTIES:179-182`) — which I confirmed verbatim in the file at head. The §2.4 pre-flight step is kept as the secondary, forward-looking citation (`PLAN:138-141`, which does state that `--testPathIgnorePatterns` **replaces** the configured list), and the deletion is recorded in-line ("`A-00` was deleted in PLAN v1.2, `PLAN:1020`") so the next reader does not repeat my lookup. This is a better fix than the one I asked for: the citation it chose cannot go stale under a PLAN revision, which is exactly why the previous one did. |

## Findings

Scope of this pass: the changed sections only (`git diff 08925cf..6bcd258` on the document — 147
insertions, 71 deletions across the v1.4 header block, §2.1, §3's O-6, §5.2, §6.5, §12.3's A-34 row
and §13.1). No property was added, removed or re-levelled: `grep -c '^| PROP-'` still returns **183**,
so §1's and §12.3's 195 / 148 / 40 / 7 / 0 stand without recomputation and the changelog's own claim
(`PROPERTIES:28`) is true as written. §12.1's AC→property matrix is untouched; AC-4.6's row
(`PROPERTIES:1004`) still names PROP-PROH-01…04 and PROP-GATE-01…05 and remains accurate under the
revised A1/A3 form, because that form keeps a positive per-path assertion rather than substituting a
structural one for it.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **§13.1's heading now contradicts its own contents.** The heading reads "Upstream defects — **routed**, not absorbed" (`PROPERTIES:1160`) while the section body directly beneath it states that nothing is routed: "None is still open — all six are now closed upstream, and none is emitted as an `ERRATUM:` line" (`:1162-1163`). The section is the routing contract a downstream reader consults to know what this document handed upstream, so a heading that still promises routing is the one line most likely to be read on its own. Substance is unaffected — no erratum is emitted anywhere in the file (`grep -n ERRATUM` returns only `:26` and `:1163`, both negations). **Fix:** "### 13.1 Upstream defects — closed upstream, not absorbed", or "…— routed and now closed", whichever reads better against §13.2's and §13.3's headings. | §13.1 routing contract |
| F-02 | Low | Local | **Two quotations of `TSPEC:424` are paraphrases inside quotation marks.** §5.2 says `SeamOps` stays at "Nine members, **`waitMs` deliberately not tenth**" (`PROPERTIES:446`) and §13.1 item 4 repeats it (`:1197`); `TSPEC:424` actually reads "Nine members, and **`waitMs` is deliberately not a tenth.**" The same sentence's second quotation is faithful — "the `waitMs` argument the driver passes `budgetExceeded`" vs TSPEC's "…passes **to** `budgetExceeded`" (`TSPEC:428`) — so this is close-paraphrase, not misattribution, and the asserted contract is identical either way. It is worth a line only because this document's own standard is literal transcription from the spec (that standard is why PROP-BUD-03 survived the erratum round unchanged), and a quoted string that does not match its cited line is the one thing a later reviewer cannot verify by grep. **Fix:** transcribe `TSPEC:424` exactly in both places, or drop the quotation marks and state it as a paraphrase. | Transcription discipline (§5.2, §13.1 item 4) |

## Questions

## Positive Observations

## Recommendation
