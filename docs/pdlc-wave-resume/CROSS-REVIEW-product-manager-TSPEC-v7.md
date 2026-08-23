# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.4)
**Date:** 2026-08-23
**Iteration:** 7 (delta confirmation, erratum round 5 — Phase PR)
**Scope:** Delta confirmation. Previously approved v6 (TSPEC v1.3); re-confirming the round-5 erratum edit against upstream REQ v1.7 / FSPEC v1.2 at HEAD (DEC-ERR-03).

## Scope

This is a **delta confirmation**, not a review. I approved this TSPEC at round v6 with three
non-gating findings. Round 5's erratum edit has since landed as eight commits (`730d8deb`,
`14a41739`, `48cf9810`, `ce3c867e`, `f82560b9`, `0c3bb682`, `57c5948c`, `31df4eda`), 29 insertions
against 12 deletions in a 950-line document. The two items this dispatch names were the two that
were re-emitted at v2 and were still unactioned; both now land.

| Routed item | Raised by | Landed? |
|---|---|---|
| §5.7 left the generative run count at "fast-check's default" while PLAN T-08 pins `numRuns: 500` and PROPERTIES follows PLAN | pm-review (me), te-author | **Yes** |
| §5.8 said `c8.include` carries three modules where `pdlc/workflows/package.json` carries four, the fourth being `**/scripts/capture-learnings-baseline.mjs` | pm-review (me), te-author, se-review | **Yes** |

The same edit also discharges all three of my own v6 findings, which were not in this dispatch's
item list but sit inside the same delta:

| My v6 finding | Where it landed | Confirmed |
|---|---|---|
| F-01 (Medium, inherited) §2.5 called the operator-pointed write "unspecified upstream" after FSPEC §3.4 landed | `730d8deb` — §2.5 restated as a ratification, quoting the clause | ✓ |
| F-02 (Medium, inherited) §6.3 still read "raised, not fixed here" after all four errata landed | `14a41739` — §6.3 rewritten as a resolved ledger with current version labels, and no `ERRATUM:` line re-emitted | ✓ |
| F-03 (Low, inherited) §6.2 OB-F1 re-raise justification and §1.3's stale REQ citation | `48cf9810` — re-raise struck, §1.3 repointed at REQ OB-1's HEAD framing; OB-F1's substance (BL-04 unmet, AT-14 red, wave sequencing) untouched | ✓ |

**Beyond the item list (DEC-ERR-03).** The items landing is necessary, not sufficient. I re-read the
upstream text this TSPEC leans on at its current version — REQ v1.7, FSPEC v1.2 — and re-measured
the two repo facts the delta now asserts. One finding follows, on new bytes.
