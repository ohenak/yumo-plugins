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

None. I had none at v4 and this revision raised none: every claim it makes about an upstream document
is one I could check against a line at branch head, and every one I checked held.

## Positive Observations

- **The four closures were re-derived, not transcribed from my review — and one of them corrects me.**
  I asked the author to re-check my citations rather than copy them, and the document did: item 1 cites
  `TSPEC:655`/`:657`/`:416`/`:434` where I had cited `TSPEC:740`/`:865`, item 4 cites `TSPEC:424`/`:428`/
  `:489`, item 6 cites `TSPEC:1265-1271`. Those are the lines that carry the text at head — my v4
  numbers were read off an earlier revision of the TSPEC and have since moved. A reviewer's citation
  being silently corrected by the author is the outcome I wanted from that instruction.

- **The `A-00` fix chose a better source than the one I proposed.** I asked for
  `(PLAN §2.2, enforced by the §2.4 operator pre-flight step)`; §2.1 instead makes
  `pdlc/workflows/package.json:18-22` the primary citation and demotes §2.4 to the forward-looking
  secondary, with the reason stated in-line: "The citation deliberately names the `package.json` block
  first: it cannot go stale under a PLAN revision, and the earlier pointer to task `A-00` did"
  (`PROPERTIES:183-185`). That is a fix to the *class* of defect, not to the instance — the failure
  mode I reported twice was a citation into a document that revises, and this removes the dependency
  rather than repointing it.

- **§6.5's new structural conjunct strengthens AC-4.6 coverage without changing any AC's meaning.** The
  A1/A3 rows now carry two conjuncts — the behavioural one (`resolved` unreachable on every path, each
  path terminating with its own O-1 triple) plus `seamOps.verifyGate === null` asserted directly — with
  the reason stated plainly: at a seam with `permittedActions: []` a shipped passing stub is
  behaviourally indistinguishable from the correct build, so no behavioural oracle can catch it
  (`PROPERTIES:606-616`). This is a mutation control where previously there was none, and it lands
  exactly on the representation TSPEC v1.3 and PLAN v1.6 settled (`TSPEC:655`, `PLAN:869`). From the
  product side the AC mapping is unchanged — §12.1's AC-4.6 row still names PROP-GATE-01…05
  (`PROPERTIES:1004`) and the positive-outcome requirement is still met per path, not traded away for
  the structural check. §3's O-6 summary states the two directions in the same terms (`:343-352`), so
  the two places a reader might look agree.

- **The §12.3 A-34 dangling reference was fixed as a side effect, correctly.** That row used to point at
  "§13 item 4", which after the §13.1 rewrite would have pointed at a closure record about `waitMs`. It
  now reads "§13.2's `A-34's manual runtime verification` row and §13.3's risk 1" (`PROPERTIES:1082`) —
  both of which exist (`:1229`, `:1235`). Catching a cross-reference that a *different* edit in the same
  revision would have invalidated is the kind of care that keeps a 1,200-line document navigable.

## Recommendation

**Approved with minor changes** — zero High, zero Medium, two Low.

Both v4 findings are closed at branch head, and I verified the closures against the upstream lines
rather than against the revision's account of them. §13.1 is no longer a stale routing contract: all
six items are closure records, no `ERRATUM:` line is emitted from this document, and the phase's one
remaining erratum round is unspent — which was the whole substance of my Medium. §2.1 no longer cites
a deleted task, and does so by removing the dependency on a revising document rather than repointing
into it.

Nothing in this revision touched the product surface. 183 property rows, unchanged; the 195 / 148 /
40 / 7 / 0 level budget, unrecomputed because nothing moved; §12.1's AC→property matrix, untouched. No
acceptance criterion was narrowed, reinterpreted or dropped, and no scope was added that the REQ does
not carry. The one substantive change — §6.5's and §3's structural `verifyGate === null` conjunct at
A1 and A3 — *adds* an obligation rather than trading one away: the AC-4.6 positive-outcome requirement
is still asserted per path, and the new conjunct closes a mutation the old form could not catch.

The two remaining findings are Low and cosmetic, and neither blocks: §13.1's heading still says
"routed" over a section that routes nothing, and two quotations of `TSPEC:424` paraphrase inside
quotation marks. Fix both in the next touch of this document if there is one; neither is worth a round
on its own.

No errata from me. Every upstream item I checked in this pass was already closed upstream, and this
document now records each closure with the line that carries it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
