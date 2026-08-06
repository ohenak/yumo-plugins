# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v9.0)
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`, confirmed present). Baseline for the diff is
`f264860` — the commit v8 was written against; the revision is eight commits, `4f32af4`…`84fdb30`.
Prior findings M-01, L-01, L-02 are verified for disposition; new observations are drawn **only**
from changed text.

## Prior findings — disposition

All three v8 findings are **resolved**, and both v8 questions are answered inside the document. Each
was checked against the revised text and, where it made a claim about another section or about this
repository, against the cited target.

| v8 ID | Sev | Disposition | Evidence in v9.0 |
|----|---|---|---|
| M-01 | Medium | **Resolved, and the branch I argued for was the branch taken** | §6.4 gained a dedicated paragraph, "**A record short of `passId` does not un-suppress**" (`:831-846`): the predicate "is **decidable without `passId`** … an enacting record with `route != degraded` makes the pair `enacted` and the proposal **suppressed**, and nothing is appended", with only the evidence spelling degrading to "an explicit unavailable statement rather than a guessed value — `pass:undefined` is never written, and the entry is never dropped, which would read as 'not suppressed'". The contradiction is gone in **both** directions: §6.4's carrier row now enumerates four fields *and* states the normative split ("`failure-mode-id`, `action` and `route` are the three the `enacted` predicate below is a function of; `passId` is indexed **only** to spell the evidence", `:819`), and §8.1's reader row (`:1168`) states the same split with two named arms. The rule's downstream statements were carried through rather than left stale: §10.3's `suppressed-by:` row (`:1748`), BR-26 (`:2493`), BR-33a (`:2512`) and E-12b (`:2567`) all now carry "a rendering of the second spelling, not a third". The arm also has a home — §14.5 LD-4 — so it is neither silently uncovered nor silently claimed. I re-derived the safety direction against REQ NFR-4 (`REQ-pdlc-consolidation-agent.md:506-507`, key = the pair) rather than from the prose: the chosen branch is the one that keeps NFR-4's key sufficient |
| L-01 | Low | **Resolved, in the durable form** | The `(`:1712`)` line-number self-citation is gone; §8.1's §6.4 row now reads "§10.3's `suppressed-by:` row is normative for the two spellings" (`:1168`). I checked the target: `:1748` is the `suppressed-by:` row and does carry both spellings. A section-and-row anchor is the repair that survives the next edit, which is why this is closed rather than re-filed |
| L-02 | Low | **Resolved, and generalised past what the finding asked** | BR-33a's AT cell (`:2512`) no longer enumerates three arms: it states "The AT cell enumerates by **set-equality over §8.1's reader table**, so every arm has exactly one home", puts the `artifact` arms and the **`passId` arm** in the PROPERTIES-owned class with §14.5 pointers (LD-1, LD-4), and disposes of the remaining two field names in a closing clause. E-12b (`:2567`) absorbed the same arm. The enumeration is set-equal to the table's arms again — my L-01 below is about the accuracy of that closing clause, not about the enumeration being short |
| Q-01 | — | **Answered in the document, as asked** | The bookkeeping paragraph (`:1177-1184`) now scopes its own count: "**Four is the count of the readers of the bookkeeping fields, not of the record**: all seven readers of the record are enumerated once, in the reader table above, and the other three (§10.2 order 2, §8.3, §8.5) index no bookkeeping field." I checked the three named: §10.2 order 2's cell is "the record as written", §8.3's is `failure-mode-id` + `artifact`, §8.5's is `artifact` — none of the four bookkeeping fields, so the gloss is true as written |
| Q-02 | — | **Answered in the row, as a pin** | AT-F21's Given (`:2098`) now states "**All three records carry a `passId`**, pinned present", and says why in the same clause: §6.4 indexes it only to spell evidence, "so pinning it keeps conjunct (5) decidable and keeps this fixture on the two arms it does cover — the short-`passId` arm is deliberately **not** exercised here and is PROPERTIES-owned per DEC-LAYER-01 (BR-33a, E-12b)". That is the right resolution of the question: the fixture is scoped explicitly rather than left ambiguous, and the unexercised arm is named with an owner instead of falling between the covered and deferred sets |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
