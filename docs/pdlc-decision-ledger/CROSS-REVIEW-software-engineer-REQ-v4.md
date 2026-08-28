# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.3)
**Date:** 2026-08-28
**Iteration:** 4
**Scope:** delta re-review of `ba52b2460..1d951e5ee` on the REQ; prior findings in
`CROSS-REVIEW-software-engineer-REQ-v3.md` re-checked. Unchanged sections already approved are
not re-litigated.

## Prior-Round Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The false bullet-carrier exemplar is gone. G-1 now reads `DEC-AWG-Q1` correctly as a citation — "the sole non-numeric token, occurring once in prose as a range shorthand" — which HEAD confirms: exactly one occurrence in that file, `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:14`, inside prose, and `DEC-AWG-Q2`…`Q4` appear nowhere in the repository. The file is now correctly named a zero-line contributor. |
| Q-01 / Q-02 | — | **Answered in text** | AC-01 now scopes its Given to "the in-scope set is within C-5's bounds" and routes over-budget omission to REQ-DECLEDGER-07 alone, which is the clean split the question asked for. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The new record-vs-citation predicate does not hold at HEAD, and contradicts the REQ's own zero-line claim one sentence later.** G-1's predicate is markup-shaped — "the id opens the line as its subject (a heading or a line-leading list item), and `NUMBER` is numeric" (§2 G-1, REQ `:62-63`). Two HEAD corpora satisfy that predicate while being citations or repeats: (a) `docs/_decisions/.consolidation-log.md:275,277,279,281` are line-leading list items whose subject is a backticked numeric id — `- \`DEC-ERRROUTE-01\` — regime-ledger …`, likewise `DEC-ERRROUTE-03`, `DEC-TERM-02`, `DEC-ORACLE-06` — under the heading "Corroborated, not re-promoted" (`:269`); each of those four ids is *already* recorded in its own `DECISIONS-*.md`, so the predicate yields **45 lines with 4 duplicate ids**, not the 41 the same paragraph asserts, and directly falsifies "`.consolidation-log.md` … cite ids but record none, and are on this path" (`:69-70`). (b) `docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md` opens a heading for each of `DEC-LOOP-01`…`06` **twice** (`:237,249,259,282,322,337` and again `:363,397,420,465,508,582`) — 13 record-carrier lines for 7 distinct ids. Neither case is rescuable by O-1: the markup of a corroboration list item is byte-identical to a record list item, and a repeated heading is a repeated heading. Since the REQ states plainly that "the in-scope set itself is *not* routed — G-1 states it" (O-1, `:307-308`), the missing rule is REQ-owned, and AC-01's set-equality expectation (`:169-171`) is not satisfiable as written at HEAD. Fix is one clause, not a re-scope: key the in-scope set by **distinct decision id, first record line wins**, and scope the source files to `DECISIONS-*.md` (which drops `.consolidation-log.md` and the three `CONSOLIDATION-PROPOSAL-*.md` by construction and preserves C-5's 41 — verified by count at HEAD). | §2 G-1, AC-01, C-5 |
| F-02 | Medium | Local | **A feature whose decisions use unnamespaced ids contributes zero lines, and the REQ does not say so.** G-1 requires `DEC-{NAMESPACE}-{NUMBER}` (`:60`), but `docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` records its thirteen decisions as `### DEC-01 — …` (`:37,45,53,61,76`, …) with no namespace segment. That whole feature record contributes zero lines — a silent, total omission rather than the "file with no decision record" case G-1 names. Either state that unnamespaced per-feature ids are out of scope by design (fine, and honest), or let O-3 own the migration explicitly; today a reader has to derive the exclusion. | §2 G-1, O-3 |
| F-03 | Low | Local | **The heading exemplar does not literally satisfy the predicate sentence.** G-1 says the id "opens the line as its subject", then cites `DEC-CONS-01` as a record that "may open a numbered heading" — at HEAD that line is `## 3. DEC-CONS-01: credential seam returns boolean, never secret` (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:65`), where `## 3.` precedes the id. The intent is clear and the exemplar is otherwise correct (later mentions at `:50`, `:838`, `:867` are a table row and prose, so no second line). Say "opens the line's content, after any heading marker or section number" and the sentence matches its own example. | §2 G-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | If F-01's fix is "distinct id, first record wins", which file wins when the same id is recorded in two files (none at HEAD, but the corpus grows)? A deterministic order — path sort — is enough to keep AC-01 replayable, and is one clause in G-1 rather than a TSPEC choice, because the *set* is REQ-owned. |
| Q-02 | C-5's `maxEntries` floor is "41 + largest feature record (14) = 55". Under the corrected predicate the largest feature record is still 14 (`DECISIONS-pdlc-headless-engine.md`), but `DECISIONS-pdlc-loop-economics.md` carries **17** distinct ids with only 10 record-carrier lines at HEAD — so the floor moves to 58 if F-02's class of under-recorded ids is later normalised. Is 60 still the intended default with that little headroom, or is the measurement worth re-taking after F-01 lands? |

## Positive Observations

- The record-vs-citation distinction is the right axis. v1.2's problem was that "carries an id" could not separate a decision from a mention of one; v1.3 names the discriminator (subject position, numeric `NUMBER`) and re-cuts REQ-DECLEDGER-04's degradation clause to the same unit in the same edit ("files with no decision record are not this path — G-1", `:213`). F-01 is a gap in the predicate's coverage, not a wrong choice of predicate.
- The `DEC-AWG-Q1` re-cut is now verifiable and verified: one occurrence, prose, range shorthand, non-numeric suffix — three independent reasons it is not a record, and the REQ states all three rather than asserting the conclusion.
- AC-01's Given/Then split is materially better. Scoping the Given to "within C-5's bounds" and pushing over-budget omission to REQ-DECLEDGER-07 alone means the set-equality oracle is a real oracle instead of a compound one, and the two ACs can no longer both claim the same failure.
- REQ-DECLEDGER-08's replay criterion moved from permissive to asserted — "the dispatch-construction leg differs in exactly one way, asserted not merely allowed" (`:269-271`), pinning the `false` run byte-identical to C-2's baseline and the `true` run to the rendered index. That converts an absence-only guarantee ("driver-side outcomes are identical") into a paired positive assertion on the same path, which is exactly the shape the no-change claim needed to be falsifiable.

## Recommendation

**Needs revision**

One High (F-01): G-1's new predicate admits four corroboration lines in
`docs/_decisions/.consolidation-log.md` and six duplicate headings in
`DECISIONS-pdlc-engineering-loop.md`, so the in-scope set at HEAD is 45-with-duplicates under the
REQ's own rule while the same paragraph asserts 41, and AC-01's set-equality expectation is
unsatisfiable. The fix is a uniqueness clause plus a `DECISIONS-*.md` file scope in G-1 — no
re-scope, no new AC, and C-5's 41 survives it unchanged. F-02 and F-03 are recorded, not gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
