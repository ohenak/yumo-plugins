# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.6)
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** upstream-cascade confirmation (TSPEC moved; DECISIONS re-confirmed)
**Last reviewed commit:** `420edb564f4e0453c216f15d91fd8dd36f83307c` (v1.5, approved at iteration 6)
**Reviewed at:** HEAD
**Upstream at dispatch:** REQ `sha256:9bc8bc32…05f10d` (v1.10) · FSPEC `sha256:48691453…a11256` (v1.4) · TSPEC `sha256:2c84d525…3c911be49b` (v1.3)

## Context

**What moved upstream.** `TSPEC-pdlc-decision-ledger.md` advanced **v1.2 → v1.3** across two commits
(`df2b10154`, `757922341`). The whole diff is 38 changed lines and does exactly two things. First,
the header `Upstream` pin advances from `REQ v1.9 / FSPEC v1.3` to `REQ v1.10 / FSPEC v1.4` and a
changelog entry is added. Second — the only body change — three citations that named FSPEC by
*version numeral* are re-cited **by id**: `§4.1`'s `nonNegativeInt` rationale and `§6.1`'s F-13 row
both move `FSPEC v1.3's E-7` → `FSPEC **E-7**`, and `§7.6`'s AT-14 row moves `FSPEC v1.3's cases` →
`FSPEC **E-7**'s cases`. Sections touched: header, §4.1, §6.1's F-13 row, §7.6's AT-14 row, the
changelog. Nothing else. No measured value, no id, no assertion, no test-level assignment moves.

**What moved in this document.** The dispatch states this document's own bytes did not change. That
is not what is on disk: `1c0881dae` advanced it **v1.5 → v1.6** after my iteration-6 approval, whose
anchors record `REVIEWED-COMMIT: 420edb564` (v1.5). The v1.6 edit is the routed erratum for the
stale-`TSPEC v0.7` item — the same item my v6 F-01 filed as `Medium`/`inherited` — and its two loci
are the `## Context` measurement-rule passage (`DECISIONS:110`) and the DEC-DECLEDGER-10/-12
re-evaluation-trigger row (`DECISIONS:412`). Both now read **"at HEAD"** and carry no version list.
I reviewed that delta too rather than take the dispatch's premise on trust; it is in scope, correct,
and closes my v6 F-01. Recorded below as F-02 so the anchor mismatch is not lost.

**The question this round answers.** Do this document's decisions still hold against TSPEC as it now
stands? Per DEC-ERR-03 the scope is upstream **at HEAD**, not the routed-item list, so I re-read the
upstream text each surviving citation leans on at its current version rather than diffing.

### Verification log — every TSPEC-dependent claim, checked at TSPEC HEAD (v1.3)

| Claim in DECISIONS | Checked at HEAD | Verdict |
|---|---|---|
| DEC-DECLEDGER-15 row (`DECISIONS:385`) pins its mechanism at **TSPEC §4.1** — the one touched section this document points at | `TSPEC:810-818` (§4.1) still specifies `nonNegativeInt` on both thresholds, still states `0` is a **valid** admits-nothing value on **either**, still routes the `maxBytes` axis via E-8 ⇒ E-6. Only the pointer numeral changed | **Holds** |
| DEC-DECLEDGER-15 / trigger row (`:413`): "FSPEC E-7 and REQ C-5 now agree; `0` valid on either key" | `FSPEC:342` (E-7, v1.4): either bound `0` ⇒ E-6's outcome, "**Not an error**, not a fallback to the default, not a halt", "REQ C-5 types both **non-negative**". `REQ:193-194` (v1.10): `maxEntries` `70` and `maxBytes` `12500`, both **non-negative** | **Holds** |
| DEC-DECLEDGER-10/-12 trigger (`:412`): at TSPEC HEAD §3.6, §4.3, §7.3, D-10, §9.2 all read against `12500` — `12500 − 1200 = 11,300`, ~4,995 project-level headroom, `M-6b`'s 441, `ERR-2` resolved, 8,000 tensed retired | `TSPEC:719-720` (§3.6) `12500 − 1200 = 11,300`, 6,305 leaves **~4,995**; `TSPEC:281` and `:1379` carry the 441 margin; `TSPEC:1848` marks **ERR-2 (RESOLVED upstream, REQ v1.8)**; `TSPEC:686-687`, `:717`, `:773` tense every surviving `8000` as retired | **Holds** |
| `## Consequences` (`:426`): "two of the four errata TSPEC §9.2 carries are still open: `ERR-3` and `ERR-4`, both FSPEC-owned" | `TSPEC:1838` / `:1848` carry `RESOLVED` markers (ERR-1, ERR-2); `TSPEC:1886` (ERR-3, AT-02 citation format) and `TSPEC:1895` (ERR-4, AT-03 fixture mutation) carry none. `TSPEC:307` "ERR-1…ERR-4 stand" | **Holds** |
| DEC-DECLEDGER-16 → PROPERTIES row (`:401`): the admitted/refused comparison forms are pinned "per TSPEC §7.3's conjuncts" | `TSPEC:1335` (`6,305 ≤ 11,300`) and `TSPEC:1379` (`10,859 ≤ maxBytes − 1200`) still pin each half where measurable; `TSPEC:1830` still states in terms that "the block total 12,059 is not asserted as an equality". §7.3 untouched by the erratum | **Holds** |
| DEC-DECLEDGER-09 → PROPERTIES row (`:399`): feature-owned falsifier over the `// === DECISION LEDGER WIRING START/END ===` run and "TSPEC §7.x's census slices" | §7.3's census specification is untouched at v1.3; the sentinel region and the scanned-source slicing read as they did when I verified them at v1.2 | **Holds** |
| PLAN row (`:394`) citing TSPEC §9.3 T-1; G-4 non-binding (`:182`) citing TSPEC §2.5; §7.3's 141-record fixture (`:162`) | §2.5, §7.3 and §9.3 are all outside the erratum's five touched sections; `TSPEC:693`, `:746` still describe the deliberately over-sized 141-record fixture | **Holds** |

### The one place the erratum could have bitten, and did not

The erratum's whole content is a citation-form migration from version numeral to id. This document
was **already** on the target side of that migration: every one of its four FSPEC citations
(`DECISIONS:305`, `:313`, `:385`, `:413`) names `E-7` by id and none carries a numeral. So the
upstream move is convergent with this document's existing practice, not divergent from it — the very
outcome `DEC-DOC-01` predicts. Nothing in DECISIONS cites TSPEC's §6.1 F-13 row or §7.6's AT-14 row
at all, so two of the four touched body sites have no downstream dependency here to break.

I also swept this document for surviving upstream numerals that could have gone stale when REQ
advanced v1.9 → v1.10 and FSPEC v1.3 → v1.4. Ten remain. Five are changelog history (`:19`, `:21`,
`:22`, `:52`, `:109`), which the v1.6 entry explicitly rules a record of what an edit did rather than
a claim about HEAD. The other five (`:152`, `:310`, `:385`, `:412`, `:413`) are **provenance-of-
landing** claims — "REQ v1.8's raise", "REQ v1.8 retyped", "both landed in REQ v1.8" — which name
where a change entered history and stay true however far REQ advances, provided the landed substance
is unchanged. I verified that substance at REQ v1.10 rather than assuming it: `12500` and the
non-negative typing are both still there at `REQ:193-194`. No current-position claim about an
upstream version survives anywhere in this document.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
