# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v9.0)
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `f264860` (the last FSPEC commit before my v8 was written);
diff `f264860..HEAD` — 74 insertions, 21 deletions across 8 FSPEC commits (`4f32af4`, `612056e`,
`d112f96`, `2e5820f`, `3c6e2e7`, `2e1ea70`, `7937c17`, `84fdb30`). Only the changed sections were
re-read for new issues.

## Prior findings — disposition

Both v8 findings were re-checked against the revision and against HEAD. **Both are closed as filed**,
and all three v8 questions are answered — two by text, one by a new section that makes the question
moot.

| v8 | Verdict | Evidence |
|---|---|---|
| F-01 (Low) — §8.1's §6.4 reader cell cited §10.3 at `:1712` (the `rung:` row) for the `pass:{passId}` evidence that actually lives in the `suppressed-by:` row | **Resolved, and by the durable repair rather than the arithmetic one.** I asked for `:1712` → `:1717` and noted the better fix was to cite the row by field name. The row was rewritten wholesale (`:1168`) and the line number is simply gone: it now reads "§10.3's `suppressed-by:` row is normative for the two spellings". No line-number citation into §10.3 remains anywhere in §8.1, so this class of drift cannot recur from that direction. I re-checked the target: `:1748` is the `suppressed-by:` row and it does carry the `pass:{passId}` grammar |
| F-02 (Low, Process) — three explicitly PROPERTIES-owned deferrals, discoverable only by grep, no register | **Resolved past what I asked for.** §14.5 (`:2200-2219`) is a four-row register — LD-1 (the `artifact` arms), LD-2 (BR-33b's `target`-follows clause), LD-3 (the two-action-one-subject pass), LD-4 (§6.4's new `passId` arm) — with exactly the three columns the downstream author needs (what is owed, where the observable is stated, what a defective implementation does), plus a set-equality obligation on the table itself: "a deferral added later is a row added here, and a section that names one without a row is a defect of this table" (`:2206-2208`). I checked that obligation by grepping every `PROPERTIES-owned` site: `:1270` (LD-3), `:1341` (LD-2), `:2041` (LD-2), `:2098` (LD-4), `:2512` / `:2567` (LD-1, LD-4). Every one maps to a row, so the set-equality holds. Three of the five sites also gained back-anchors this round; the fourth did not, filed as F-02 below — a discoverability gap in the new register's own convention, not a breach of its set-equality |
| Q-01 — is §8.2's three-row list the enumeration of §13's *classes* on this axis, or a sample of rows? | **Answered in the text, and the third class I had to find by hand is now named.** `:1265-1270`: "the rows named here are the two **classes** §13's rows fall into on this axis, not a sample of rows", with AT-R6b and AT-Q7/AT-Q7c named as each class's representative — and the counterexample candidates I checked manually (AT-F9, AT-F10, AT-F18) are now named in the document with the reason they are not counterexamples: they place a `revise`/`retire` beside an earlier `promote` **across passes**, while the merge scoped here is intra-pass. That is the half-clause I asked for plus the audit I paid for last round, so the next reviewer does not pay it again |
| Q-02 — is the >2-candidate elided set in scope for the PROPERTIES row §8.2's third note opens? | **Answered by folding it into LD-2**, exactly as suggested. `:2214` carries it explicitly, cited to this review: "The >2-candidate case belongs to this row too (SE v8 Q-02) … a report that names one elided path and stops is the defect". One downstream owner for the whole tie-break surface, as asked |
| Q-03 — is the intended invariant set-equality on the table's **cells**, not only its rows? | **Answered: yes, and stated normatively** (`:1158-1162`). That answer is correct as an intent and is the right invariant to want. As written it is also falsified by two readers in this document — filed as F-01 below. The question is answered; the answer needs one more pass |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
