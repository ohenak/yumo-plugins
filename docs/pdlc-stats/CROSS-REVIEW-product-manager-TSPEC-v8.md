# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.6, erratum round 6)
**Date:** 2026-08-31
**Iteration:** 8
**Round type:** Delta confirmation (erratum)

## Overview

**Scope.** Three commits since the bytes I reviewed at v7 (`7747eb78f..HEAD`: `3bf753b78`,
`127963b7e`, `4943a8777`), +77/-13 lines in three places — the §0 changelog, §4.3's `BR-16`
paragraph, and §8.3's open-erratum list. I re-read my v7 file, diffed the document, and re-grounded
on REQ / FSPEC **HEAD** (`REQ` v1.6 `sha256:5f3e8051…`, `FSPEC` v1.7 `sha256:c7d2c832…`) rather than
on the round's dispatch list, per `DEC-ERR-03`. I did not re-review unchanged sections.

**Both v7 findings are discharged, and discharged on evidence rather than assertion.**

- **`F-01` (High, inherited) — closed.** §4.3 no longer reads FSPEC `BR-16` as naming
  `docs/completed/pdlc-advisory-wave-gate/` a harvested directory. It now states the citation is a
  basename *shape*, records the HEAD measurement, and re-pins `BR-16` from v1.4 to **v1.7**. I
  measured the archive myself: the directory holds **62** `CROSS-REVIEW-*` files, of which **4** are
  the out-of-catalogue `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` form and
  **58** match `BR-14`'s grammar. §4.3's "62 / 4 / 58, `crossReviews.length` is 58, the harvested
  disjunct does not fire" is exact, and its added sentence — "a real-path test written against this
  directory must expect a measured ratio, not `harvested`" — closes the precise hazard I raised: the
  wrong worked example that would have recommended widening membership to a bare `CROSS-REVIEW-*`
  glob, the mutation `BR-14`/`BR-16` exist to kill.
- **`F-02` (Medium, delta) — closed.** The v1.6 changelog withdraws the false attestation in plain
  terms, names both moves (`FSPEC v1.5 → v1.7`, `REQ v1.4 → v1.6`), and states the mechanism:
  "citing a current hash is not the same check as diffing it against the previously grounded one".
  That is the process lesson `Q-02` asked for, recorded at the site where it failed.

**Nothing I approved at v6 regressed.** The `halts: HaltEntry[]` type, the five-key JSON literal,
§4.3's sketch, §7's expectations, §6's oracles and every count are byte-identical.

**One new Medium and one new Low, both inside the changed passage; no open High.** The round's
handling of the newly surfaced REQ-versus-FSPEC conflict is correct in kind — implement the
immediate upstream, route the reconciliation, do not guess — but it states the conflict's blast
radius narrower than upstream HEAD supports.
