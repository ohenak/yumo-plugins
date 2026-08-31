# Cross-Review: test-engineer — DECISIONS (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/DECISIONS-pdlc-stats.md (v1.5)
**Date:** 2026-08-31
**Iteration:** 7 (erratum delta confirmation)
**Round type:** Delta confirmation — previously approved at v6

## Context

Two routed items, both `DEC-DOC-01` citation repairs raised by se-author:

- `K-3` cites `coverageInstrumentation.test.js:264` and `:261` as raw `file:line` anchors.
- `K-9` cites `pdlc/README.md:231` as a raw `file:line` anchor.

The commits under confirmation are `51347279e` (the erratum) and `eb3c24e4a` (v1.5 changelog and
version bump). Scope of this confirmation is the delta **plus** re-grounding on upstream at HEAD per
`DEC-ERR-03`, not the item list alone.

**Upstream re-grounding.** REQ is `sha256:60a516fb…`, matching the dispatch. TSPEC at HEAD is
`sha256:cb351bb3…`; the dispatch's `sha256:512a9fcf…` matches no revision of TSPEC on this branch, and
v1.5's changelog says so explicitly and re-grounds against HEAD. That is the correct `DEC-ERR-03`
handling and I confirm it. FSPEC is `sha256:25af3c47…`. I re-read TSPEC §2.1 and §6.4 against every
claim this document leans on; the one live divergence (§2.1's *"six → seven"*) is named and routed
below rather than silently matched, which is what the round was asked to do.

## Options Considered

Both items admit the same two resolutions, and the document picked correctly in each case:

| Item | Option taken | Alternative rejected |
|---|---|---|
| `K-3` | Cite P9-02 by its verbatim test title and cite the stale comment by its verbatim text | Keep the line anchor and add a "line numbers may drift" caveat — still forbidden by `DEC-DOC-01`, and self-invalidating since the feature edits that file |
| `K-9` | Cite `pdlc/README.md`'s `## pdlc CLI` section plus the verbatim vendoring sentence | Cite the section only — insufficient, since the section holds several enumerations and the reader must find the one that goes stale |

The rationale the erratum gives — *a line anchor into a file this feature itself edits is invalidated
by the edit itself* — is the right general rule and is stated where a later reader will find it.

## Decision

**Both routed items land, and every replacement citation verifies verbatim at HEAD.** I did not take
the citations on trust — I grepped each one:

| New citation | Verified against HEAD | Result |
|---|---|---|
| P9-02's title *"P9-02: the include set is exactly the six modules the feature owns, no more and no fewer"* | `coverageInstrumentation.test.js` | Exact string match |
| The comment *"REQUIRED\_INCLUDES' three entries, CAPTURE\_SCRIPT\_INCLUDE, and…"* | `coverageInstrumentation.test.js`, immediately above P9-02 | Exact string match, and the positional claim "immediately above" holds |
| `pdlc/README.md`'s `## pdlc CLI` section, sentence *"The four workflow modules it dispatches (…) are vendored into the package at pack time"* | `pdlc/README.md` | Exact string match; the heading is literally `## pdlc CLI` |

I also re-derived K-3's arithmetic rather than reading it, because the row's whole point is that the
shipped numbers are wrong: `REQUIRED_INCLUDES` holds **four** entries at HEAD (the fourth,
`scripts/check-wave-resume-delta-coverage.mjs`, added by a CODE\_REVIEW finding after the comment was
written), and `pdlc/workflows/package.json`'s `c8.include` is **seven** entries. So `4 + 1 + 2 = 7` at
HEAD and **eight** with this feature. K-3's re-measure is correct, and TSPEC §2.1's *"six → seven"* is
indeed stale by one in the other direction. Carrying the correct arithmetic here and raising the
repair upstream — rather than matching a number known to be wrong — is the right call from a testing
lens: two documents agreeing on a wrong count is how a mis-sized task reaches PLAN unchallenged.

**But the edit broke the table it repaired.** K-3's row no longer terminates. Every intact row in the
*Obligations these decisions create for PLAN and implementation* table carries four cells (five pipe
delimiters); K-3's row now carries two pipes and stops after the arithmetic, and the following
paragraph — the *"Upstream divergence, owed to TSPEC"* note — has K-3's `Owner` and `Falsified by`
cells trailing inside it. See F-01. This is delta-introduced: the pre-erratum K-3 was one intact row.

**No other regression.** I swept every table in the document for pipe-count irregularity; K-3's is the
only one. The site table's new tenth row is well-formed, K-1's partition arithmetic now covers sites
1–10 with no overlap and no gap, and K-8's seven → eight headline matches TSPEC §2.1's count of
P7-02's `vendoredClassWord` ternary. `DEC-STATS-01/02/03`, the option verdicts and every falsifier
claim I approved at v6 are unchanged.

## Consequences

PLAN is the immediate consumer of the obligations table: it derives one owning task per K-row and
reads the `Falsified by` column to place the red test that precedes each implementation task. With
K-3 unterminated, a reader — human or renderer — sees an obligation with no falsifier, and K-4
through K-9 fall outside the table entirely, including K-9, the row carrying site 10 and the
`DOMAIN-CONSTRAINTS` promotion this round turned on. The bytes are all still present, so nothing is
*lost*; what is lost is the column structure that makes each obligation's oracle findable. That is a
one-line repair (rejoin K-3's cells, move the divergence note below the table or fold it into the
cell) and worth one bounded follow-up round rather than shipping into PLAN.

The residual raw anchors I checked and am **not** filing against: `publish-preflight.mjs:205-219`,
`:200-203` and `loopProperties.test.js:370` all anchor runtime-measured evidence where the position
*is* the claim (where the NUL bytes sit, how far the deliberate production-side copy extends), and
they point into files this feature does not edit, so the erratum's own rationale does not reach them.
`DEC-DOC-01`'s carve-out covers these. The one genuine residue is the v1.4 changelog's surviving
`pdlc/README.md:231` — see F-02, non-gating.

## Positive Observations

- Citing the stale comment by its *text* rather than its line is strictly better than the original
  even ignoring drift: the comment's content is what goes stale, so the citation now names the thing
  under repair instead of pointing at where it currently sits.
- Re-measuring `REQUIRED_INCLUDES` at HEAD instead of inheriting the count, and then *declining* to
  match TSPEC's known-wrong number while raising it upstream, is exactly the discipline that keeps a
  mis-sized task from reaching PLAN with two documents in false agreement.
- v1.5's changelog retracts v1.4's *"cannot disagree again"* claim in plain terms. A document that
  records where its own earlier confidence was misplaced is easier to trust on its remaining claims.
- The `DEC-ERR-03` handling of the unmatched TSPEC hash is stated in the document rather than left to
  the reviewer to discover.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | K-3's row in the obligations table is unterminated. Intact rows carry four cells (five pipes); K-3 now carries two pipes and ends after *"This feature makes it eight."*, and the following *"Upstream divergence, owed to TSPEC"* paragraph carries K-3's `Owner` (`same task`) and `Falsified by` cells trailing inside it. The table therefore ends at K-3: K-4 through K-9 render as literal text outside it, and K-3 — the row under repair — presents with no falsifier column. PLAN reads this table to place red tests per obligation. Fix: rejoin K-3 into a single four-cell row and move the divergence note to a paragraph *below* the table (or fold it into the row's first cell), then re-check that all nine rows carry five pipes | `## Consequences` → *Obligations these decisions create for PLAN and implementation*, K-3 |
| F-02 | Low | inherited | nonlocal | The v1.4 changelog entry still cites `pdlc/README.md:231`'s prose member list, and still asserts *"it is **not** a tenth site-table row"*. Both are superseded: v1.5 makes it the tenth row, and the anchor points into a file this feature edits — the exact case the erratum's own rationale calls self-invalidating. Historical changelog entries legitimately record superseded state and v1.5 explicitly retires the framing, so this is not gating; if the entry is touched anyway, drop the `:231` | `v1.4 (cross-review round 4)` changelog entry |

FINDING: High | delta | local | `## Consequences` → *Obligations these decisions create for PLAN and implementation*, K-3 | K-3's row is unterminated — two pipes where intact rows carry five; its `Owner` (`same task`) and `Falsified by` cells are stranded inside the following *"Upstream divergence, owed to TSPEC"* paragraph, terminating the table at K-3 and leaving K-4 through K-9 rendering as literal text outside it, with K-3 itself presenting no falsifier column that PLAN can read to place its red test
FINDING: Low | inherited | nonlocal | `v1.4 (cross-review round 4)` changelog entry | The entry still cites `pdlc/README.md:231` as a raw `file:line` anchor into a file this feature edits, and still asserts it is *"not a tenth site-table row"*; v1.5 makes it the tenth row, so both are superseded — non-gating, since historical changelog entries legitimately record superseded state

## Recommendation

**Needs revision** — one delta-introduced High.

The two routed items are resolved and every replacement citation verifies verbatim at HEAD; the
document is still a faithful compression of TSPEC at `cb351bb3`. The revision needed is structural
only: restore K-3 to a single four-cell row. No behavioural claim, verdict or falsifier needs to
change.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
