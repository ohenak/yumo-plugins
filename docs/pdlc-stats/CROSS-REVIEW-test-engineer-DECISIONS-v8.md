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

**The delta resolves every routed item it was asked to resolve, and breaks nothing previously
approved.** All four verdicts, the three `DEC-STATS-*` decisions, the option table, the site table,
K-1's partition and every falsifier cell are byte-identical apart from K-3's rejoin; the diff is
+51/-13 and every added line is changelog, the two count-breakdown repairs, the superseded marker and
the K-3 rejoin. Nothing a PLAN task or a red test hangs off moved.

Two Low findings remain, both **inherited** and **nonlocal** — they predate this round's edit, sit
outside the bytes it touched, and neither is gating. I raise them because DEC-ERR-03 asks this
confirmation to measure the document against upstream at HEAD, not against the item list, and both
belong in the same erratum bundle that already owes TSPEC a repair.

**F-01 — the partition sentence introducing the site table was not brought along.** At `DEC-STATS-01`
the paragraph above the site table still reads *"Four* hold *the enumerations; five* pin *them from
two other packages"*. The arithmetic still totals ten (4 + 5 + 1), which is why no count word is
wrong — but the partition contradicts the two breakdowns this erratum repaired, which count
`pdlc/workflows/package.json` as the **fifth enumeration holder** and the four test files as the
pinners (5 + 4 + 1), and it contradicts upstream TSPEC §7.3, which uses the same 5 + 4 + 1 split.
`package.json`'s `c8.include` is a transcribed member list; it pins nothing — `coverageInstrumentation.test.js`
pins it. The sentence dates from the nine-site era (`17ddc28a0`) and survived two count moves.
Membership, the total, K-1's numbering and every falsifier are unaffected, so this is presentation,
not an oracle gap: **Low**. A two-word edit whenever DECISIONS is next opened.

**F-02 — the sweep's candidate cardinality diverges from upstream, in DECISIONS' favour.** I re-ran
the shipped command at HEAD. `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` returns
**25** files; ten transcribe a member list, fifteen import a module. DECISIONS states 25 and *"the
other fifteen"* and is **correct at HEAD**. TSPEC §7.3 (`TSPEC:1166`) states *"24 candidates"* and
*"the 14 pure consumers"* — stale by one on both terms, with the same difference, so the derived ten
is unaffected. Same shape as the six → seven divergence K-3 already records, and DECISIONS again
holds the right number; what is missing is only that this second divergence is not recorded alongside
the first, so the erratum owed upstream reads as covering one stale count when it covers two.
**Low**, cheapest to fix in the same TSPEC round as K-3's.

## Consequences

**For PLAN and the implementer.** The K-3 repair is the consequential one. With the row rejoined,
the obligations table again exposes a `Falsified by` cell for K-3 and rows for K-4 through K-9, so a
PLAN author reading it can place a red test per obligation: K-3's live half (the P9-02
`expect(include).toEqual([…])` array-equality, which reds at HEAD the moment `package.json` moves
without the test literal, position-sensitively) and its new half (the c8-run driver's import plus the
`json-summary` naming `lib/stats.mjs`, the only thing that catches a declared-but-unresolving glob
under `allow-external`). Before the repair those cells were prose outside a table and easy to skip.

**For the tenth site.** `pdlc/README.md` is now named in every breakdown, and its site-table row is
honest about carrying *"pinned by no oracle"* in place of a falsifier — `documentOracles.test.js`
reads the file but never its member list. That is the one site where a partial edit stays green, it
is recorded as such in three places (site table, K-9, *Standing costs accepted*), and it is now
countable from the prose rather than only from the table. A reader can no longer reach nine.

**Residual work, owed upstream not here.** TSPEC §2.1's six → seven and TSPEC §7.3's 24/14 are both
stale against HEAD in the same direction: DECISIONS is right, TSPEC is behind. Neither is fixable
from this dispatch — TSPEC is approved with an approved PLAN beneath it — so both should ride one
TSPEC erratum round rather than two.

**No regression surface.** I re-derived the count words and the site partition rather than reading
them, resolved every REQ/FSPEC/TSPEC citation against the cited file, and re-ran the sweep command
at HEAD. Nothing previously approved was contradicted by the delta.

## Recommendation

**Approved with minor changes** — the confirmation is affirmative. The routed items land, the
document remains a faithful compression of REQ/FSPEC/TSPEC at HEAD, and the two residual findings are
Low, inherited and non-gating. Neither should hold this document; F-01 rides the next DECISIONS
touch, F-02 rides the TSPEC erratum K-3 already owes.

## Positive Observations

- The K-3 rejoin was done as a pure structural repair — *no cell text changed* — which is exactly the
  right shape for an erratum: the round is auditable as "rows became rows" and nothing else.
- The v1.6 changelog re-grounds upstream **before** describing the edit, states the measured HEAD
  hashes, and names the dispatch's phantom TSPEC anchor as a workflow-side defect rather than
  silently re-pinning to it. That is the behaviour DEC-ERR-03 is asking for.
- Refusing to edit TSPEC from this dispatch, and refusing to match a number known to be wrong, is the
  correct call twice over. Matching would have produced two documents agreeing on a mis-sized task —
  the precise failure mode that makes a stale count survive to implementation.
- The superseded-in-part marker on v1.4 preserves the historical entry instead of rewriting it, with
  the reason stated. Changelog integrity is worth more than citation uniformity here.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | nonlocal | Partition sentence above the site table still reads "Four hold the enumerations; five pin them from two other packages" (4 + 5 + 1). Totals ten, so no count word is wrong, but it contradicts both breakdowns this erratum repaired and upstream TSPEC 7.3, which count `pdlc/workflows/package.json` as the fifth enumeration holder against four pinning test files (5 + 4 + 1). `c8.include` is a transcribed member list; it pins nothing. Presentation only — membership, total, K-1 numbering and all falsifiers unaffected | Options Considered / DEC-STATS-01, paragraph introducing "Option A's ten sites" |
| F-02 | Low | inherited | nonlocal | The shipped sweep re-run at HEAD returns 25 files (ten transcribers, fifteen importers); DECISIONS states 25 / "the other fifteen" and is correct, while upstream TSPEC 7.3 states "24 candidates" and "the 14 pure consumers" — stale by one on both terms, derived ten unaffected. Same shape as the six-to-seven divergence K-3 records, but this second divergence is not recorded, so the erratum owed to TSPEC reads as covering one stale count when it covers two | Context / What the sweep found, and TSPEC 7.3 |
| F-03 | Low | inherited | nonlocal | TSPEC 2.1's `coverageInstrumentation.test.js` row still describes P9-02's title as moving six to seven; re-measured at HEAD `REQUIRED_INCLUDES` is four, so the literal is 4 + 1 + 2 = seven today and eight after this feature. DECISIONS carries the correct arithmetic and records the divergence in K-3 rather than matching it. Correctly carried unresolved by design; restated so the upstream erratum is not lost | K-3, Upstream divergence clause |

FINDING: Low | inherited | nonlocal | Options Considered / DEC-STATS-01 site-table preamble | "Four hold the enumerations; five pin them" contradicts the repaired 5 + 4 + 1 breakdowns and TSPEC 7.3; totals still ten, no oracle affected
FINDING: Low | inherited | nonlocal | Context / What the sweep found; TSPEC 7.3 | TSPEC 7.3's "24 candidates / 14 pure consumers" is stale against the 25 / 15 measured at HEAD; DECISIONS is correct and the divergence is unrecorded
FINDING: Low | inherited | nonlocal | K-3 Upstream divergence clause | TSPEC 2.1's six-to-seven title count remains stale at HEAD (seven to eight is correct); carried unresolved by design and owed upstream

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
