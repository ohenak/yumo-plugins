# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round 9)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 11
**Scope:** Local — delta confirmation of the round-9 erratum edit only (commit `b4addcd`). The TSPEC
was approved at v10; this round re-reads only the five changed hunks and re-measures each corrected
pointer at HEAD. No re-litigation of settled decisions.

## What was checked

| # | Erratum claim | Verification at HEAD | Result |
|---|---|---|---|
| 1 | §10.3 row 1a is at `:1950`, not `:1832` | `TSPEC:1950` is the `Corpus unlistable` row carrying "the pathspec and `stderr` in the report body" | Confirmed |
| 2 | `openClone` signature is at `:1615`, not `:1522` | `TSPEC:1615` is `openClone(passId, config, seams): Promise<{dir} \| {failure, detail}>` | Confirmed |
| 3 | The empty-or-neither-form marker state is FSPEC §4.2's **fifth** row, not the fourth | `FSPEC:493` = "Present but **empty**, or a line that is neither form / undecidable / reclaimed"; `FSPEC:492` = the stale `IN-PROGRESS:` reclaim row. Data rows run `:489`–`:493`, so the cited row is the fifth | Confirmed — my v10 finding is addressed |
| 4 | Both mis-citing sites fixed (§10.3 row 4 and §13.1 row 13) | `TSPEC:1953` and `TSPEC:2603` now both read "FSPEC §4.2's **fifth** row (`FSPEC-…:493`)"; row 4 additionally names the fourth row so the distinction is legible to an AT author | Confirmed |
| 5 | The 1.7 changelog's "§8, `:1325`" is wrong; the NFR-2 row lives in §7.9 at `:1418` | `TSPEC:1325` at HEAD is mid-sentence prose in an unrelated section (not blank, but certainly not the NFR-2 row); `TSPEC:1418` is the `NFR-2 / §7.4` obligation row | Confirmed. The 2.1 entry describes `:1325` as "a blank line at HEAD", which is not literally true of HEAD (line drift since the original claim) — cosmetic only, does not affect any AT |
| 6 | §13.1 row 1's inbound-residual pointer carried the same stale `TSPEC:1325` | Now reads "§7.9's NFR-2 row, `TSPEC:1418`" — self-describing, so it survives future line drift | Confirmed |
| 7 | No residual stale pointers | `grep` for `fourth row`, `TSPEC:1325`, `:1832`, `:1522` returns only (a) the 2.1 changelog entry that *documents* the correction, and (b) `:1561`, an unrelated bundle-count sentence | Confirmed |

## Testability delta

The only testing-relevant change is #3/#4, which is exactly the defect I raised. Its impact was
real: **AT-M3** derives its two fixtures from the row the TSPEC names, and an author fixturing "the
fourth row" would have built a stale `IN-PROGRESS:` marker — which reclaims for the *wrong* reason
and would have passed a green AT-M3 while proving nothing about **E-11**'s empty arm. With the
fifth row named and line-cited, AT-M3's two fixtures (empty marker; neither-form line) are
unambiguously derivable, and the AT-M3 / AT-M11 pairing that defeats the reclaim-always and
never-reclaim mutants is intact and unchanged.

No mechanism, obligation, decision, oracle, AT, edge case, or reason-code vocabulary changed. The
E-11 / BR-14a arms, §7.3 decision 2, and row 13's rejected alternatives are byte-identical apart
from the ordinal correction. Nothing in this round could regress a previously approved property.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. All four routed errata are addressed; each corrected pointer re-measured at HEAD. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The two E-11 sites were corrected **and** given the disambiguating context ("the fourth is the
  stale `IN-PROGRESS:` reclaim at `:492`"), so an AT author reading either site alone cannot
  reproduce the original mis-fixture.
- §13.1 row 1 was re-pointed to a *named* anchor ("§7.9's NFR-2 row") alongside the line number.
  Naming the section makes the citation self-repairing under line drift — the failure mode that
  produced this whole erratum round.
- The 2.1 entry is scoped honestly: it states "no mechanism, decision or obligation changes", and
  the diff bears that out exactly.

## Recommendation

**Approved**

Prior approval stands. The erratum edit is confined to cross-reference corrections, every corrected
pointer resolves at HEAD, and the one testing-relevant defect (AT-M3's fixture derivation) is
closed.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
