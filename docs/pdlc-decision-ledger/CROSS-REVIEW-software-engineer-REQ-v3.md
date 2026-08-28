# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-28
**Iteration:** 3
**Scope:** delta re-review of `git diff 34beffcbc..ba52b2460` on the REQ; prior findings in
`CROSS-REVIEW-software-engineer-REQ-v2.md` re-checked. Unchanged sections already approved are not
re-litigated.

## Prior-Round Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | G-1 now states the unit explicitly — "**its unit is the individual decision, not the file**: a decision is in scope when it carries a decision id in the project's `DEC-{NAMESPACE}-{NUMBER}` convention (O-3)" — and adds the fail-open complement "A file with no decision id contributes zero lines: an ordinary empty result, not a failure" (§2 G-1). REQ-DECLEDGER-04's degradation clause was re-cut to the same unit ("Where **one decision of several** fails to render … no-id files are not this path — G-1"), so the two no longer read against each other. With the unit pinned to the id-bearing decision, the in-scope set at HEAD is computable: 41 id-bearing decisions across the 11 `DECISIONS-*.md` files under `docs/_decisions/` that carry them, 0 from the four files that carry none (`CONSOLIDATION-PROPOSAL-2026-07-29.md`, `-2026-08-19-1.md`, `-2026-08-27-1.md`, `DECISIONS-advisory-wave-gate-questions.md`), so AC-01's set-equality expectation is now derivable rather than reader-dependent. |
| F-02 | Medium | **Resolved** | `maxEntries` moved `40` → `60` with a measured rationale, and both numbers verify at HEAD: id-bearing decisions under `docs/_decisions/` = **41**, largest feature record = **14** (`docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md`; runners-up 11 for `pdlc-learnings-injection` and `pdlc-advisory-tier`), 41 + 14 = 55 < 60. A-1 and R-5 were both re-cut to say `maxEntries` is measured while `maxBytes` remains an analogy, so the three sites now agree. |
| F-03 | Medium | **Resolved** | REQ-DECLEDGER-03 now states the application basis: "The test reads the **cited record**, not the line alone: the line need not carry the decision's own citations." That closes the gap between REQ-DECLEDGER-01's "no other field is required" and the novelty test's exemplars. |
| F-04 | Low | **Resolved** | G-4's measurement basis is now "read against **G-1's in-scope decision ids**" rather than `docs/_decisions/` alone, so the retrospective metric and the indexed set are the same set. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The new bullet-carrier exemplar is false at HEAD.** G-1 now reads "whatever carries the id (heading or bullet: at HEAD `DEC-AWG-Q1`…`Q5` are bullets in `DECISIONS-advisory-wave-gate-questions.md`)". That file contains exactly one `DEC-` token, in prose, as a range shorthand: `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:14` — "(DEC-AWG-Q1…Q5 map onto Q-1…Q-5 below)". Its five bullets are `- **Q-1**` (`:19`), `- **Q-2**` (`:59`), `- **Q-3**` (`:84`), `- **Q-4**` (`:99`), `- **Q-5**` (`:132`) and carry **no** decision id; the literals `DEC-AWG-Q2`, `DEC-AWG-Q3`, `DEC-AWG-Q4` occur nowhere in the repository (`grep -rc` over `docs/` = 0 in every file). So the rule is sound but its only worked example is not an instance of it: at HEAD this file is a zero-line contributor under G-1's own "A file with no decision id contributes zero lines", not a bullet-carrier. Fix is one clause, not a re-scope: either drop the parenthetical, or replace it with a real bullet-carrying id (e.g. `DEC-HEADLESS-*` entries in `docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md`) and say plainly that `DECISIONS-advisory-wave-gate-questions.md` contributes zero lines at HEAD. Not gating: the in-scope set stays derivable either way, and O-1 already routes carrier recognition to TSPEC — but a TSPEC author or an AC-01 fixture built from this exemplar would be built against a shape that does not exist. | §2 G-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With G-1's unit pinned to the id-bearing decision, `DECISIONS-advisory-wave-gate-questions.md` contributes zero index lines at HEAD (F-01) even though it self-declares "**Project-level decision record.**" (`:5`). Is that the intended outcome — an operator wanting those five in the index must first mint ids in the `DEC-{NAMESPACE}-{NUMBER}` convention — or should the REQ say so explicitly so nobody reads the omission as a rendering defect under REQ-DECLEDGER-04? |
| Q-02 | REQ-DECLEDGER-01's set equality is now over the **rendered** set ("the in-scope set after REQ-DECLEDGER-07's budgeting"), while O-1 routes *which* lines are dropped when the budget binds to TSPEC. That is consistent — the oracle is writable at any corpus below budget — but it means the AC is only exercisable in its strong form under budget. Is a below-budget corpus the intended fixture posture for AC-01, with over-budget behaviour tested against REQ-DECLEDGER-07 alone? |

## Positive Observations

- The unit fix is the right shape: G-1 pins the unit (individual id-bearing decision), states the zero-line case as an ordinary result rather than a failure, routes carrier recognition to TSPEC via O-1, and REQ-DECLEDGER-04 was re-cut to the same unit in the same edit. Three sites moved together, which is why the round closes rather than shifting the ambiguity downstream.
- `maxEntries` `40` → `60` is now a measured default, and it verifies: 41 id-bearing decisions under `docs/_decisions/` + 14 in the largest feature record = 55, with headroom. R-5 and A-1 were both narrowed to say only `maxBytes` remains an analogy — the REQ no longer over-claims measurement it does not have.
- REQ-DECLEDGER-08's replay criterion got more honest, not weaker: naming the reviewer output a recorded fixture and scoping the comparison to the **accounting** leg makes the no-change guarantee actually replayable, where comparing whole runs would have been trivially false at the dispatch-construction leg.
- REQ-DECLEDGER-06's "the observable is the **prompt text** … the reviewer's prose is the intended effect, not an asserted outcome" is the correct falsifiability line for a reviewer-side mechanism, and it keeps `DEC-LOOPECON-06`'s exact-match triple (shipped at `pdlc/workflows/orchestrate-dev.js:6740-6798`) as the sole driver-side key — no second identity to maintain.

## Recommendation

**Approved with minor changes**

Every High and Medium finding from v2 is resolved, and the resolutions verify against HEAD rather than
against the document's own prose. One new Medium (F-01) — a false bullet-carrier exemplar in G-1 — is
recorded and non-gating: the in-scope set stays derivable without it, and the fix is a single clause the
FSPEC author can land in passing.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
