# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 11
**Mode:** Delta confirmation of erratum round 9 (commit `b4addcdd`, TSPEC v2.0 → v2.1)
**Scope:** Erratum diff only. The document was approved at v10; sections outside the diff were not re-litigated.

## Erratum Items Confirmed

| # | Raised by | Item | State |
|---|---|---|---|
| E-a | pm-review | §7.9 NFR-2 row cited `TSPEC:1832` / `TSPEC:1522` | Resolved |
| E-b | te-review | §10.3 row 4 and §13.1 row 13 said "FSPEC §4.2's fourth row" | Resolved |
| E-c | se-author | Same §7.9 NFR-2 row pointers (duplicate of E-a) | Resolved |
| E-d | se-author | 1.7 changelog + §13.1 row 1 cited NFR-2 row at §8 `:1325` | Resolved |

Each corrected pointer was re-measured against HEAD rather than taken from the commit message:

| Corrected citation | Measured at HEAD | Verdict |
|---|---|---|
| `TSPEC:1418` — NFR-2 / §7.4 row | line 1418 is the `NFR-2 / §7.4` obligation row, and 1418 falls inside §7.9 (1368) not §8 (1450), so the "wrong section" half of E-d is fixed too | correct |
| `TSPEC:1615` — `openClone` | line 1615 is `openClone(passId, config, seams): Promise<{dir} \| {failure, detail}>` | correct |
| `TSPEC:1950` — §10.3 row 1a | line 1950 is row 1a, "Corpus unlistable … `stderr` in the report body" | correct |
| `FSPEC-…:493` — empty-or-neither row | line 493 is "Present but **empty**, or a line that is neither form"; counting §4.2's data rows from the header at FSPEC:488 gives absent(1), `RELEASED:`(2), `IN-PROGRESS:` younger(3), `IN-PROGRESS:` older(4), empty-or-neither(**5**) | correct, and the "fourth is the stale `IN-PROGRESS:` reclaim (`:492`)" gloss is also correct |

The erratum's own +13-line changelog insertion shifts every pointer below it; the author applied that
shift (1405→1418, 1602→1615, 1937→1950) rather than transcribing the pre-edit measurements from the
raise. A residual sweep for `TSPEC:1325`, `:1832`, `:1522`, `:1405` and for "fourth row" finds no live
citation left — the only survivors are the 2.1 changelog naming the corrected-from values (proper) and
an unrelated distribution-manifest sentence at `:1561`.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | The 2.1 changelog entry (c) describes the stale target as "§8, `:1325` — **a blank line at HEAD**". That was true when the erratum was raised, but the same commit's 13-line changelog insertion moved content down, so at HEAD `:1325` is a regex line inside a prose paragraph, not a blank one. The corrective pointer (`:1418`) is right and no obligation is affected; only the descriptive aside about the *old* target is now self-invalidated by the edit that carried it. Suggested fix on the next touch of this file: drop the "a blank line at HEAD" clause and keep "and the wrong section" — the section claim is stable under line drift, the line-content claim is not. Worth carrying as a Process signal: **a changelog assertion about what sits at a line number is invalidated by the insertion that states it**; erratum entries should cite what a pointer *should* be, not narrate what the stale one now hits. | NFR-2 traceability (§7.9), REQ-CONS-03 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | FSPEC §4.2's heading reads "Take — **the four** outcomes at step 6" while the table carries five rows — the ordinal the te-review erratum caught is arguably downstream of that heading. This is an FSPEC-side wording defect, not a TSPEC one, and it changes no behaviour: E-11's arms are enumerated by row content, not by the heading's count. I am **not** raising it as an erratum — a bounded upstream round to fix one word in a heading costs more than it returns, and both TSPEC sites now cite `FSPEC-…:493` by line, which is drift-resistant in a way the ordinal is not. Flagging it for whoever next opens the FSPEC for a substantive reason. |

## Positive Observations

- **E-b is a real product fix, not bookkeeping.** "FSPEC §4.2's fourth row" would have had AT-M3 fixtured from the stale-`IN-PROGRESS:` reclaim row instead of the empty-or-neither row — a test that passes while proving nothing about **E-11**'s truncated-write arm. Since E-11 is exactly the case DEC/BR-14a's sentinel exists to make observable, the corrected ordinal restores acceptance-criteria fidelity rather than merely tidying a reference.
- **Both E-b sites were fixed, not just the one that was raised.** §10.3 row 4 and §13.1 row 13 carried the same wrong ordinal; the edit corrects both and adds the `FSPEC-…:493` line cite at each, so the two statements cannot drift apart later.
- **Correctly scoped as an erratum.** 19 insertions / 6 deletions, of which 13 are the changelog block. No mechanism, decision, obligation or acceptance criterion moved — the version bump to 2.1 (not 3.0) matches what actually changed.
- **The +13 shift was applied, not assumed.** The three pointers were re-measured against the post-insertion file. This is the failure mode that most often makes an erratum round produce a second erratum round, and it was avoided.

## Recommendation

**Approved with minor changes**

All four raised items are resolved and every corrected pointer resolves at HEAD. The single Low
finding (F-01) is a descriptive aside in a changelog entry, carries no obligation, and gates nothing —
fold it into the next touch of this file rather than spending an erratum round on it. TSPEC's prior
approval stands; no High or Medium findings, open or carried, in the delta or from v10.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:16cea5beda38d8c8ce67fbd04c607951aa171f096d9e534728a09070611d49e4
REVIEWED-COMMIT: b4addcdddc6dd48e60212e5e7005a9645ccd87d2
