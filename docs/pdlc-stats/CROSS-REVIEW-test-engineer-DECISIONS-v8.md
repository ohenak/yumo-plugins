# Cross-Review: test-engineer — DECISIONS (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, erratum round 7)
**Date:** 2026-08-31
**Iteration:** 8 (delta confirmation of a previously approved document)

## Context

This is a **delta confirmation**, not a re-review. DECISIONS was approved; a targeted erratum
(`c10c8688d`, `0b4729034`, `3b2d38076`, `7adc96661` — v1.5 → v1.6) was asked to land five routed
items, one of them mine. The question answered here is whether the delta resolves those items
without breaking anything previously approved, **and** whether the document is still a faithful
compression of its upstream as upstream stands at HEAD (DEC-ERR-03) — the item list is necessary,
not sufficient.

**Upstream re-grounded before reading the delta.** Measured at HEAD on `feat-pdlc-stats`:

| Upstream | HEAD sha256 | Dispatch pin | State |
|---|---|---|---|
| REQ | `60a516fb…` | `60a516fb…` | matches |
| FSPEC | `25af3c47…` | `25af3c47…` | matches |
| TSPEC | `cb351bb3…` | none supplied | v1.4, unmoved since v1.5 absorbed it |

The document's own v1.6 changelog claims exactly this and is correct. Its note that the dispatch's
previously-cited `sha256:512a9fcf…` matches no revision of TSPEC on this branch reproduces here too;
that is a workflow-side anchor defect, not a document defect, and I record it rather than file it.

Every cross-document citation in the document was resolved against the cited file, not trusted:
`REQ C-5` (REQ:110), `REQ R-5` (REQ:246), `REQ G-4` (REQ:51), `TSPEC §2.1/§2.5/§6.1/§6.3/§6.4/§7.3/§8.4`
and the sibling `docs/completed/pdlc-engine-distribution/` §5.4 / §5.2 references all exist and say
what the document says they say. No nonexistent-authority citation.

## Options Considered

What I checked, and how, for each routed item:

**(1) Count breakdowns [Medium | delta | local — raised by pm-review].** Verified by reading both
breakdowns and re-deriving the partition against the site table. The *What the sweep found* paragraph
now enumerates the five enumeration holders (`prepack.mjs`, `publish-preflight.mjs`,
`fixture-machine.mjs`, `_tspec-packed-set.mjs`, `pdlc/workflows/package.json`), the four test files
that pin them, **and** `pdlc/README.md`'s prose member list — ten named items for a count word of ten.
`DEC-STATS-01`'s *Reversibility: hard* clause carries the same 5 + 4 + 1. Both agree with the ten-row
site table, with K-1's site numbering (site 5 = `package.json`, 6 = `loop-distribution.test.js`,
7 = `coverageInstrumentation.test.js`, 8 = `run.test.js`, 9 = `learningsPremises.test.js`,
10 = `pdlc/README.md`), with K-9's ownership of sites 8–10, and with TSPEC §7.3's own
*"five enumerations … plus four test files … and `pdlc/README.md`'s prose enumeration"*. **Resolved.**

**(2) K-3 row termination [my item, raised as te-review F-04].** This was the structural one and it is
the one I care about, because an unterminated row silently deletes a column PLAN reads. Verified
mechanically, not by eye: every line of the *Obligations these decisions create* table now parses to
six pipe-delimited fields, and K-1 through K-9 are nine contiguous rows — no literal text stranded
outside the table, no interleaved paragraph. The *Upstream divergence* paragraph now sits inside K-3's
obligation cell where it belongs, and K-3 presents an `Owner` cell (`same task`) and a populated
`Falsified by` cell naming the live P9-02 `toEqual` array-equality assertion and the new c8-run/
`json-summary` conjunct. A red test now has a stated place to be written. Cell text is unchanged.
**Resolved.**

**(3) v1.4 changelog entry [Low | inherited | nonlocal — raised by both reviewers].** The entry gains
a superseded-in-part marker recording that v1.5 made `pdlc/README.md` the tenth site-table row, and
leaves the historical text and its `file:line` forms as written. That is the right disposition and it
is the one I argued for: a changelog records the document at its own version, and `DEC-DOC-01` governs
body citations, which v1.5 already converted. **Resolved as agreed.**

**(4) TSPEC §2.1 `coverageInstrumentation.test.js` six → seven [Low | inherited | nonlocal].** Carried
unresolved by explicit design, with reasons stated in the v1.6 changelog. Re-measured at HEAD:
`REQUIRED_INCLUDES` holds four entries, so the P9-02 literal is `4 + 1 + 2` = seven today and eight
after this feature; TSPEC §2.1 (`TSPEC:50`, `TSPEC:191`) still describes the move as six → seven.
DECISIONS carries the correct arithmetic and records the divergence in K-3 rather than matching a
number it knows to be wrong. Not editing an approved TSPEC with an approved PLAN beneath it from this
dispatch is correct. Still open upstream; restated below so the erratum owed to TSPEC is not lost.

## Decision

## Consequences

## Recommendation

## Delta-Confirmation Findings

## Verdict
