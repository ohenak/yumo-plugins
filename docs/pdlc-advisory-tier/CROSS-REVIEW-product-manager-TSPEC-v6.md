# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-04
**Iteration:** 6
**Scope:** Delta confirmation of the Phase P erratum round only (TSPEC v1.1 → v1.2, commits `d20d833`, `ef2404f`). Not a re-review of the document; sections outside the two edited passages were approved at v5 and are not re-litigated.

## Delta reviewed

Four routed erratum items, collapsing to **two distinct defects** (three of the four are the same `governingClass([])` gap raised by se-author twice and te-review once; the fourth is the invented `T-06-8` id).

| # | Routed item | Edit that answers it | Where |
|---|---|---|---|
| 1 | `governingClass([])` left undefined by §7.2 A3-7 (se-author ×2, te-review ×1) | A3-7 gains a paragraph stating the contract is defined over **non-empty input only** and that the empty input is **unreachable by construction**, with the reachability argument spelled out and an explicit statement that no return value is named on purpose | `TSPEC:858-866` (commit `d20d833`) |
| 2 | §7.4 names test case `T-06-8`, outside FSPEC §18.1's T-06-1…T-06-6 catalogue (se-author) | The id is dropped. §7.4 now states the test **carries no FSPEC case id**, names the catalogue bound, refers to it prose-side as "the A4 no-`testCommand` phase-integration test", and pins the obligation to PLAN task A-10 (landed with A-25) with an explicit instruction that no `T-06-7`/`T-06-8` be invented downstream | `TSPEC:918-930` (commit `ef2404f`) |

Also in the delta: the front-matter version moves 1.1 → 1.2 (date 2026-08-04) and §18 gains a row describing both edits.

**Verification performed against source, not accepted on assertion:**

- **A3-1 says what §7.2 now claims it says.** `TSPEC:852-853`: "`complete` is false when the classified-finding count is below the finding count in the evidence; an incomplete classification is malformed (V-4)". The reachability argument in the new paragraph is a faithful restatement of a rule already in this document — it invents no new gate to make the empty case unreachable.
- **The catalogue bound is exact.** `FSPEC:1088` — `| T-06 | §8.4 seam A4 | 6 | T-06-1 … T-06-6 |`, and `FSPEC:585-590` lists exactly those six cases. "T-06-1 … T-06-6" is not an approximation.
- **`T-06-8` is gone from the live text.** A repo-wide grep over `docs/pdlc-advisory-tier/` finds the string only in the TSPEC §18 changelog row (describing its removal) and in prior cross-review files. No spec, plan, or property document carries the invented id.
- **The PLAN already holds the obligation the TSPEC now delegates to it.** `PLAN:261` (A-10) enumerates the A4 seam cases including "absent-`testCommand` revert+escalate"; `PLAN:838` maps `T-06 | T-06-1 … T-06-6 | 6 | advisoryDodSeams.test.js | A-10 | A-23, A-25`; and `PLAN:880-882` independently records that "T-06's group carries no seventh or eighth case". The pointer resolves — this is not an obligation handed to a document that does not accept it.
- **P-9 stays correctly scoped.** `PLAN:784` scopes P-9 to "every **non-empty** multiset of findings" and states the empty input is deliberately out of the property. The TSPEC's new paragraph explicitly endorses that scoping rather than forcing P-9 to widen, so the two documents now agree by construction instead of by an open erratum.

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
