# Cross-Review: software-engineer — REQ (delta confirmation, frozen round)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.9)
**Date:** 2026-08-19
**Iteration:** 10 (delta over commit `386e4f0c` → HEAD)

## Scope of this round

Non-empty delta this time: `git diff 386e4f0c HEAD -- docs/…/REQ-…md` is 14 insertions / 8
deletions across four hunks — the changelog row, §1.2 claim 2, AC-3.1's closure sentence,
AC-3.2's run-level-mirror parenthetical, and AC-5.1b's precedent clause. Per the delta
protocol I re-read my v9 file, diffed, verified each changed clause against HEAD source,
and scanned only the changed sections. Unchanged sections are not re-litigated.

Decision freeze respected: nothing new is opened below. The only blocking grounds available
this round are (i) a defect the delta introduced and (ii) a load-bearing claim contradicted
by the repository at HEAD. Neither is present.

## Carried findings — disposition

| Prior finding | Resolved? | Evidence |
|---|---|---|
| **v9 F-01 / Medium / Cross-Feature** — §1.2 claim 2 attributed a fail-open-on-unlistable outcome to DEC-CONS-05 | **Yes** | The DEC-CONS-05 attribution is gone from the fail-open clause. The replacement states the shipped behaviour correctly on both halves: `enumerateCorpus` is total, returning `{unlistable, detail}` rather than throwing (`pdlc/workflows/consolidate-learnings.js:1347-1354`), and the pass around it sets `state.status = "failed"` and returns through `finishPass` (`:588-594`). The REQ now names this feature's divergence explicitly and grounds it in `G-4 Fail-open, always` (`REQ:106+`, id confirmed at `REQ:118`) and `C-7 Fail-open unconditional and total` (`REQ:196`) — both cited ids exist and say what the sentence claims. This is the behavioural restatement the TE's v9 asked for, not a reference swap. |
| **v9 F-02 / Low / Process** — a round was dispatched over a zero-byte delta | **Yes (not recurring)** | This round's delta is non-empty; the observation was about round mechanics, not the document, and does not carry. |
| **v9 Q-01** — is the run-level mirror's value well-defined or unconstrained? | **Answered** | AC-3.2 now reads "a run-level mirror, if carried, is additive, is not the oracle, and has a deliberately unconstrained value that nothing asserts on" (`REQ:328`). Checked downstream for contradiction: the TSPEC carries no assertion over a run-level mirror (only `mirror` occurrence is an unrelated fixture name, `TSPEC:788`), so no completeness test can grow one over it. |
