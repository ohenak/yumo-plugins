# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.7)
**Date:** 2026-08-10
**Iteration:** 8

**Scope:** Delta re-review. Re-read my own v7 cross-review first, then diffed
`7545fea1..HEAD` on the document (four commits: `06b09fea`, `4fdc13e6`,
`f06327af`, `d1862bd9`) and judged two things only — whether v7's F-01 and F-02
are resolved, and whether the revision broke anything it touched. Unchanged
sections are not re-litigated; the delta's own claims are re-measured
independently.

## 1. Prior-finding disposition

| v7 finding | Disposition at HEAD | Evidence |
|---|---|---|
| F-01 (Medium) — `PROP-TRC-01`'s version pin transcribed literals (`11.5` / `2.0`) that HEAD had already moved past | **Resolved, and resolved at the level the finding asked for.** The pin now reads `11.7` / `2.7`, and the ambiguity Q-01 raised is answered explicitly rather than left to the implementer: *"the pinned literals in conjunct 1 are the **recorded measurement's** versions, and the contract is that pin and measurement move together, so the pin can never certify a count it did not produce."* The measurement of record was actually re-taken, not just re-labelled — **100** ids over `FSPEC:2116-2267` | `PROPERTIES:1639-1648`; `FSPEC:12` reads `11.7`, `TSPEC:12` reads `2.7` |
| F-02 (Medium) — the one-id set-equality gap against `AT-K3b` was known but written nowhere the implementer would read it | **Resolved in all three places I named.** §10.4 now says the property is *"green on write only once §13.3 erratum 8 lands"* and that *"a red at T05 before erratum 8 is the routed erratum, not a parser defect"*; §12.4's AT-K cell carries the consequence in full, including why this is **not** the permanently-red block §12.3's closing rule forbids; §11's file table row is qualified rather than left reading a bare *"green on write"* | `PROPERTIES:1650-1655`, `:1885`, `:1804` |

Both closed. Neither closure weakens a claim elsewhere, and neither was closed
by deleting the obligation.

## 2. Independent re-measurement of the delta's claims

## 3. Findings

## 4. Oracle-quality checks on what changed

## 5. Questions

## 6. Positive Observations

## 7. Recommendation

## Verdict
