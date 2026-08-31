# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.4)
**Upstream at dispatch:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.10 (sha256:9bc8bc32…)
**Date:** 2026-08-31
**Iteration:** 6 (erratum round — delta confirmation, not a full re-review)

## Overview

The erratum edit is commit `75e8bca19`, 13 insertions / 2 deletions, one file. It does two
things: advances the header upstream pin `REQ … **v1.9** → **v1.10**`, bumps the version row to
`1.4 | 2026-08-31`, and adds a `v1.4 erratum` changelog paragraph recording that the routed
`TSPEC v0.7` item has no locus in this document and is routed on to se-author unedited. No `BR-`,
`E-`, `AC-`/`AT-`, obligation or vocabulary row is touched; no measured value moves.

The routed item was reported ABSORBED, and that report holds: the stale `TSPEC v0.7` recitals are
in `DECISIONS-pdlc-decision-ledger.md` (`DECISIONS…:36`, `:97-98`, `:398`), and this FSPEC names no
TSPEC version anywhere — the only occurrence of the string `v0.7` in the FSPEC is inside the new
changelog paragraph naming the *other* document's loci. The routing is truthful rather than
vacuous: the loci exist, and they are somebody else's.

Per DEC-ERR-03 my scope is FSPEC-measured-against-upstream-at-HEAD, not the item list, so the rest
of this confirmation re-checks whether the document is still a faithful compression of REQ v1.10.
It is. Verification is recorded per section below.

## Linked Requirements

**Pin arithmetic checks out.** `shasum -a 256` on the REQ matches the dispatch pin exactly
(`9bc8bc32…f10d`), and that file's version row reads `1.10`, so the FSPEC's new `**v1.10**` names
the REQ that is actually on disk. The Baseline row still reads `v1.2`, matching REQ's own Baseline
row (`REQ…:13`), and `docs/_constraints/pdlc-decision-corpus-baseline.md:7` is `Version | 1.2`.
Both pins resolve.

**The changelog's characterisation of REQ v1.10 is accurate, and I checked it rather than took
it.** The FSPEC claims REQ v1.10 "names no new `BR-`/`E-`/`AC-` or vocabulary row and moves no
measured value (it reworded C-5's slack rationale, … corrected the REQ's own *Cross-Reviews* row,
and re-sited a v1.9 note)." REQ's v1.10 paragraph (`REQ…:22-32`) carries exactly those three
REQ-local items plus two explicitly-not-ours ones. No acceptance criterion, business rule or
glossary entry is added.

**Every id the FSPEC cites still resolves upstream.** I swept all `REQ-DECLEDGER-*`, `C-*`, `US-*`
and `M-*` ids cited in the FSPEC against the REQ and the Baseline. All `M-*` ids resolve in
Baseline v1.2. `O-7`/`O-8` are FSPEC-owned obligations beyond REQ's set, which is the ordinary
FSPEC expansion I approved at v5, not a dangling citation.

## Behavioral Flow

Untouched by the delta and still faithful. `FSPEC…:138` states the resolved defaults the flow
applies — `enabled` `false`, `maxEntries` `70`, `maxBytes` `12500` (REQ C-5) — and REQ C-5's table
(`REQ…:193-194`) still carries `70` and `12500` at HEAD. The values the flow leans on did not move
under it, which is precisely what the changelog asserts and what I re-measured.

`FSPEC…:156` step 5 ("If the rendered set exceeds `maxEntries` rows or `maxBytes` bytes, whole
lines …") continues to track REQ-DECLEDGER-07's outcome-only framing without reaching into the
omission-selection rule that O-1 routes to TSPEC. No altitude drift introduced by the delta.

## Business Rules

This is the one place REQ v1.10's reword could plausibly have desynchronised the FSPEC, so I
checked it directly. REQ v1.10 reworded C-5's `maxBytes` rationale: the 3,204-byte slack over
`M-7b`'s 9,296 is now stated as the allowance covering the rendered index's **per-line *and*
block** framing (`REQ…:194`), and REQ `:196` says `maxBytes` bounds "**the rendered index text
alone**".

FSPEC BR-12 (`FSPEC…:300-301`) reads: `maxEntries` bounds the number of rendered lines;
`maxBytes` bounds "the bytes of the index block as it appears in the prompt — not its …". That is
the same object REQ's reworded clause scopes the bound to, so the compression is still faithful —
the reword narrowed the *rationale's* prose, not the bound's referent, and BR-12 never recited the
slack arithmetic in the first place. Grepping the FSPEC for `3,204` / `3204` / `9,296` / `9296`
returns nothing, so there is no stale derivation to re-tense. The sole `8000` occurrence
(`FSPEC…:39`) is inside the v1.2 changelog recording the historical replacement and is explicitly
tensed as the value that *was* replaced — correct as history, not a live default.

## Edge Cases and Error Scenarios

E-7 and E-8 are the two the recent errata built up, and both still hold against REQ v1.10. E-7
(`FSPEC…:342`) treats either bound resolving to `0` as zero in-scope decisions, "not an error, not
a fallback to the default", and cites REQ C-5 typing both keys **non-negative**. REQ C-5 at HEAD
still types both non-negative and still says of `maxEntries` that "`0` is a valid admits-nothing
value, not a malformed one falling back to `70`" (`REQ…:193-194`). E-8's whole-line omission
(`FSPEC…:343`) matches REQ `:311` ("omitted whole, never truncated mid-line, without aborting the
rest"). REQ v1.10 touched neither clause, and the FSPEC's v1.3 reasoning that produced E-7's
`maxBytes` leg is unaffected by the pin advance.

## Acceptance Tests

AT-01 is where REQ's routed AC-01 obligation landed, and REQ v1.10 re-affirms that routing
("AC-01's id-only expected-value basis stays routed to FSPEC, as v1.7 recorded"), so I re-checked
that the landing still matches the REQ text it answers.

REQ-DECLEDGER-01 (`REQ…:213-216`) demands "**equality of the rendered line set — not containment,
and not equality over ids alone**", with the expected value being the Baseline's enumeration cited
by id (`M-1d`, `M-2e`, at v1.2's `Verified at` commit) and asserted against a **frozen fixture
copy**. FSPEC AT-01 (`FSPEC…:363-374`) says "the rendered line set equals the expected set —
**equality of rendered lines, not containment and not equality over ids alone**", sources the
expected set as `M-1d`'s 41 project-level ids union the single `M-2e` row for the dispatch's
feature, and `FSPEC…:357-358` pins the frozen-fixture-at-`Verified at`-commit discipline. The
compression is exact, including the motivating cases (`M-4d`'s non-record headings, `M-3c`'s
twice-opened block) that make id-only comparison insufficient.

The `45`/`48` line counts and the `maxEntries` `70` headroom claim in AT-01 still hold, since `70`
did not move.

## Delta-Confirmation Findings

No findings.

The delta resolves the round's item — by correctly establishing there was nothing here to resolve
and routing it on — without breaking anything approved at v5. Re-measured against REQ v1.10 at
HEAD, the document remains a faithful compression: every pin resolves, every cited id resolves,
and the one upstream reword (C-5's slack rationale) touches prose this FSPEC never recited while
leaving the bound's referent identical to BR-12's.

## Open Questions

None gating this confirmation.

One observation for the orchestrator, deliberately **not** filed as a finding because it is not
this document's text: `DECISIONS-pdlc-decision-ledger.md:98` and `:398` pin their worked example at
"REQ **v1.9** / FSPEC **v1.3**", which HEAD has now moved past (REQ v1.10 / FSPEC v1.4). Those are
the same DECISIONS loci the routed `TSPEC v0.7` item already sends to se-author, so the re-tensing
lands naturally in that already-scheduled edit rather than needing a separate raise. Noting it here
so it is not lost, not to gate this round.

## Recommendation

**Approved**

The erratum is exactly what it claims to be — an upstream pin advance plus a routing record, with
no downstream consequence to absorb. Nothing previously approved is disturbed, and the document is
still faithful to REQ v1.10 as measured at HEAD.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
