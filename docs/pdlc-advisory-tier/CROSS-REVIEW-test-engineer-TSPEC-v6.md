# Cross-Review: test-engineer — TSPEC (erratum delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-04
**Iteration:** 6
**Scope:** Delta confirmation only — the Phase P erratum edits (commits `d20d833`, `ef2404f`, TSPEC v1.1 → v1.2). Sections unchanged since the v5 approval were not re-reviewed.

## Delta Verification

| Erratum item | Raised by | Where the delta lands | Resolved? |
|---|---|---|---|
| E-1 — §7.2 A3-7 (`TSPEC:856`) specifies `governingClass`'s ordering but leaves `governingClass([])` undefined | se-author | `TSPEC:858-866` (commit `d20d833`) | **Yes** |
| E-2 — same item: name the empty-input result, or state that no seam path reaches it | te-review (v5 F-06) | same | **Yes** |
| E-3 — same item: §6.5 P-9 is scoped to non-empty multisets rather than pinning a value the spec does not state | se-author | same, closing paragraph | **Yes** |
| E-4 — §7.4 names test case `T-06-8`, outside FSPEC §18.1's T-06-1 … T-06-6 catalogue | se-author | `TSPEC:920-930` + `§18` v1.2 row (commit `ef2404f`) | **Yes** |

**E-1 / E-2 / E-3.** The edit takes the *unreachability* branch rather than inventing a return value,
which is the right choice for a spec — and, crucially, it is a **checkable** claim rather than an
assertion. The reachability argument is grounded in this same document: `governingClass` is called
only on the `classes` array of a `parseA3Classification` result already accepted by A3-1, and A3-1
(`TSPEC:852-853`) sets `complete: false` — malformed, V-4 — when the classified-finding count is below
the evidence's finding count, so an empty `classes` against a non-empty finding set cannot survive;
A3 itself only fires with findings outstanding. Both legs of that argument exist in the document at
the cited lines, so the claim is verifiable and not circular.

For the testing lens the consequence is the one I asked for in v5: the spec now says explicitly that
it names no return value for `governingClass([])` **and why** ("pinning one would specify behaviour no
seam path can observe"), and directs the suite to hold the ordering property over non-empty inputs
only. PLAN §6.5's P-9 (`PLAN:784`) is therefore correct as written rather than merely tolerated — its
"the empty input is deliberately out of the property" clause is now a transcription of a spec
statement instead of a gap it was working around. No property loses falsifiability: total-order
antisymmetry and transitivity over the generated non-empty class set are unaffected, and the empty
case is excluded by contract rather than by omission, so a future implementer who returns something
arbitrary for `[]` is not silently blessed — the spec says no path can observe it.

**E-4.** `T-06-8` is gone from §7.4; the test is now named descriptively ("the A4 no-`testCommand`
phase-integration test") and §7.4 states outright that FSPEC §18.1's T-06 catalogue is exactly
T-06-1 … T-06-6 and that this TSPEC does not extend it. I verified the catalogue independently:
`FSPEC:585-590` lists exactly six T-06 rows, and `FSPEC:1088` states the count as 6. A repo-wide grep
for `T-06-7` / `T-06-8` now returns only the §7.4 sentence forbidding them and the §18 changelog entry
recording the fix — no downstream document (PLAN included) carries an invented id. The obligation
itself survives the rename: PLAN A-10 (`PLAN:261`) carries the absent-`testCommand` revert+escalate
case and `PLAN:875-882` keeps both proofs (Seam-unit routing under A-10 → A-23, phase wiring under
A-10 → A-25) with the explicit "neither subsumes the other" note. So the id was dropped without
dropping coverage — which was the whole risk in this finding.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
