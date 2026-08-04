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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. Both erratum items are resolved, and nothing in the delta regresses a section approved at v5. | — |

**Regression check (what the delta could have broken, and did not):**

- **§7.2 A3-7's ordering statement is byte-unchanged.** The edit is purely additive — nine lines
  appended after the existing ordering sentence and the T-05-6 pointer. The property PLAN P-9
  transcribes (`real-defect > mis-scoped-criterion > deferral-candidate`) still reads identically at
  `TSPEC:856`, so the PLAN's line citation and every test derived from it stay valid.
- **A3-1's own contract is untouched.** The new paragraph *cites* A3-1's completeness rule rather than
  restating or widening it, so no second, drifting copy of the V-4 malformed condition was created.
- **§7.4's substance is unchanged.** The diff replaces the id token with a descriptive name in the two
  places it appeared and adds the "carries no FSPEC case id" clause. The test's oracle set — real
  Phase DOD body at `dev:8281`, scripted rebase conflict → A4 dispatch → `testCommand: null`
  `implConfig`, pre-existing `haltError` at `dev:8283-8287`, seam `outcome === "escalated"` with reason
  on the report, `_runAdvisorySeam` fake plus a real `parseImplementationConfig` result — survives
  verbatim, as does the explicit scope note that this proves phase wiring and the Seam-unit level
  proves the routing branch. That two-level split was the reason I approved §7.4 at v5 and it is intact.
- **Traceability is not weakened by dropping the id.** The test remains addressable — by PLAN task
  (A-10 red, A-25 green) and by name — so the DoD trace still has a handle. FSPEC's AT-2/AT-4 mappings
  (`FSPEC:1118`, `:1120`), which never referenced a T-06-7/8, are unaffected.
- **Version discipline held.** The header row moved to `1.2 / 2026-08-04` and §18 gained a matching
  changelog row describing both edits — so the erratum round is auditable from the document itself.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Not a TSPEC finding, but worth a PLAN-side sweep in its own erratum pass: PLAN still describes both items as *open against TSPEC* — §6.5 P-9 (`PLAN:784`) says "raised as an erratum against TSPEC; if TSPEC names an answer, P-9 widens to include it", §10.1 open item 6 (`PLAN:1031`) repeats it, and `PLAN:882` says "the id discrepancy is raised as an erratum against TSPEC". TSPEC v1.2 has now answered both — the answer being *no value is specified, because the input is unreachable*, so P-9 does **not** widen and A-10's naming is already correct. The PLAN text is not wrong about behaviour, only stale about status. Closing those three spots (and moving open item 6 to resolved) would prevent a later reader re-raising the same erratum. |

## Positive Observations

- The empty-input answer is the right *kind* of answer for a spec: instead of inventing a return value
  that a test would then enshrine as if it were a requirement, §7.2 states the reachability argument
  and explicitly declines to name one, with the reason spelled out. That keeps the PROPERTIES layer
  honest — P-9 asserts only what an upstream document actually says.
- The reachability claim is grounded in citable lines of the same document (A3-1's completeness rule at
  `TSPEC:852-853`), so a reviewer can falsify it rather than take it on trust. If A3-1's completeness
  rule is ever relaxed, this paragraph is exactly where the unreachability argument breaks — a good
  place for the tripwire to sit.
- §7.4 fixed the id by *removing* the invention rather than by adding `T-06-7`/`T-06-8` to FSPEC. That
  is the correct direction: the FSPEC catalogue stays the single authority for case ids, and a
  TSPEC-level test obligation is carried where TSPEC-level obligations belong — in the PLAN task table.
- Both edits are additive/substitutive and narrowly scoped, with a §18 changelog row that names each
  change and its rationale. This is exactly what an erratum round should look like: nothing re-opened,
  nothing re-litigated, and the delta legible without re-reading the document.

## Recommendation

**Approved**

Both erratum items are resolved on their merits, and the delta breaks nothing I approved at v5. My
prior approval of TSPEC-pdlc-advisory-tier v1.1 stands, and extends to v1.2. Q-01 is a PLAN-side
staleness note, carries no severity, and is not a condition of this approval.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
