# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.4)
**Date:** 2026-08-28
**Iteration:** 5
**Scope:** delta re-review of `1d951e5ee..20a551c7f` on the REQ; the findings in `CROSS-REVIEW-software-engineer-REQ-v4.md` re-checked against HEAD. Unchanged sections already approved are not re-litigated.

## Prior-Round Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The in-scope set is now derived from a stated rule and reproduces C-5's 41 exactly. Three clauses did it: the carrier is a **heading** only (`REQ:64-66`), the file scope is `DECISIONS-*.md` (`:62-63`) which drops `.consolidation-log.md` and the three `CONSOLIDATION-PROPOSAL-*.md`, and **distinct id / first record wins** (`:66-69`) which collapses the twice-opened headings. Replayed at HEAD: heading-carried distinct ids under `docs/_decisions/` = **41** across the 12 `DECISIONS-*.md` files (0/1/4/2/2/7/2/12/1/1/6/3 by path order); `DECISIONS-pdlc-engineering-loop.md` yields 13 heading matches but 7 distinct, `DEC-LOOP-01`…`06` each opening a heading twice (`:237,249,259,282,322,337` and `:363,397,420,465,508,582`) exactly as G-1 cites. AC-01's set-equality expectation is now writable from the document alone. |
| F-02 | Medium | **Resolved** | The unnamespaced-feature case is now stated rather than derived: `DECISIONS-pdlc-plugin-retirement.md` is named a zero-line contributor "by design here, normalisation being O-3's to own" (`:71-73`). HEAD confirms zero heading matches under the `DEC-{NAMESPACE}-{NUMBER}` grammar in that file. |
| F-03 | Low | **Resolved** | The exemplar now matches the predicate literally. G-1 says the id opens the heading's content "after any heading marker or section number" and cites `## 3. DEC-CONS-01: …` (`:65-66`) — HEAD line `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:65`. The clause and the cited line agree token for token. |
| Q-01 | — | **Answered in text** | Determinism is stated: "files in path order" (`:67`). |
| Q-02 | — | **Answered and re-measured** | Under the corrected predicate the largest feature record is 14 (`DECISIONS-pdlc-headless-engine.md`); `DECISIONS-pdlc-loop-economics.md` drops to 10 because its extra ids are citations, not headings. C-5's "41 + 14 = 55" is therefore correct as written at HEAD, and the 60 default keeps 5 lines of headroom. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **A feature directory holding a second `DECISIONS-*.md` is unhandled, and the two readings of G-1's file scope disagree on C-5's floor by 8.** G-1 scopes sources as "a `DECISIONS-*.md` file under `docs/_decisions/` **or** the feature's own `DECISIONS-{feature}.md`" (`REQ:62-63`) — a glob for the project directory, an exact filename for the feature. At HEAD one feature carries two: `docs/completed/pdlc-headless-engine/` holds `DECISIONS-pdlc-headless-engine.md` (14 heading-carried ids) **and** `DECISIONS-headless-engine-obligations.md` (8: `## DEC-HE-01`…`08` at `:11,37,62,87,108,130,155,184`). The eight `DEC-HE-*` ids are recorded nowhere else in the repo, so under the literal reading they are invisible to their own feature's index — a fourth zero-contributor class, and the only one G-1's enumeration does not name alongside `DEC-AWG-Q1`, the proposals/log, and the unnamespaced feature. Under the glob reading the feature contributes 22 and the floor becomes 41 + 22 = **63**, above the 60 default — precisely the "a default under the standing corpus drops a line on day one" outcome C-5's own rationale gives as its reason for 60. One clause fixes it either way: say `DECISIONS-*.md` in the feature directory and re-take C-5's floor as 63 (default 70), or say the exact filename and add this file to the enumerated zero-contributors. Not gating — the literal reading is decidable and C-5's arithmetic is self-consistent under it — but the TSPEC author will pick a glob unless told not to. | §2 G-1; §4 C-5 |
| F-02 | Low | Local | **The first-record-wins tiebreak's ordering half is inert at HEAD, so nothing at HEAD falsifies it.** G-1 makes "files in path order" load-bearing (`REQ:67`) for the cross-file case — "any later line naming an already-recorded id — **same file or another**". At HEAD no id has heading records in two different files: 141 distinct heading-carried ids total across all 25 `DECISIONS-*.md` files, and the per-file first-record counts sum to 141 with no cross-file collision. The within-file half is exercised (`DEC-LOOP-01`…`06`). The clause is right and cheap to keep, but a PROPERTIES author should know the cross-file leg needs a synthetic fixture — there is no HEAD instance to transcribe. | §2 G-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: was `DECISIONS-headless-engine-obligations.md` weighed? If the intent is that an obligations-style companion record is out of scope, saying so costs one clause and closes the enumeration; if it is in scope, C-5's 60 needs re-taking before TSPEC transcribes it. |

## Positive Observations

- **The set is now derived, not asserted.** v1.3 stated a predicate and a number and left the reader to reconcile them; v1.4 states three orthogonal clauses — carrier form, file scope, distinct-id key — and the number falls out. I re-ran it independently over the tree and got 41 without consulting the REQ's own figure. That is the difference between a set-equality oracle and an implementation echo, and it is the finding that has gated three rounds.
- **Every HEAD exemplar in the delta is true, and each one earns its place.** `DEC-CONS-01` at `:65` demonstrates the section-number clause; `DEC-LOOP-01`…`06` demonstrates first-record-wins on real duplicates rather than a hypothetical; the log's "four line-leading corroboration items" is exact — `DEC-ERRROUTE-01`, `DEC-ERRROUTE-03`, `DEC-TERM-02`, `DEC-ORACLE-06` at `.consolidation-log.md:275,277,279,281` — and the "already recorded in sibling files besides" half checks out too, all four having heading records under `docs/_decisions/` (`DECISIONS-erratum-routing.md`, `DECISIONS-loop-termination.md`, `DECISIONS-test-oracle-mechanics.md`). Four independent claims, four verified.
- **Narrowing the carrier to headings retired a defect that was not in the finding list.** G-1 requires the source citation to name the record's heading (`:56-57`). While bullets were carriers, a bullet-recorded decision had no heading to render — the unrenderable-field problem raised in round 2. Heading-only makes the required field total by construction, and v1.4 simplified `:56` from the conditional "where the record places the decision under a heading" to the flat "the record's heading" in the same edit. That is the edit noticing its own consequence.
- **O-1's boundary moved in the right direction.** "Membership is *not* routed: G-1 fixes the carrier form and the first-record-wins key, so adding a carrier form — a table row, a list item — is a REQ revision, not a TSPEC choice" (`:311-314`). This converts a soft altitude claim into a testable one: a TSPEC that recognises list items is now checkably out of contract.

## Recommendation

**Approved with minor changes**

The round-4 High is resolved on its merits, not narrowed away: the in-scope set is derivable from the document alone and reproduces C-5's 41 against HEAD, so AC-01's set-equality expectation is satisfiable and REQ-DECLEDGER-01's citation field is renderable for every member. F-01 (second `DECISIONS-*.md` in a feature directory; the two readings differ on C-5's floor by 8) and F-02 (cross-file tiebreak has no HEAD instance) are recorded for the next revision or for TSPEC to inherit, and neither blocks.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
