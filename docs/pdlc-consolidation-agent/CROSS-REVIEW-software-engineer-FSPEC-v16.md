# Cross-Review: software-engineer — FSPEC (round 16, delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 16
**Scope:** Delta confirmation only. Prior approval: `CROSS-REVIEW-software-engineer-FSPEC-v15.md`
(`Approved`, `REVIEWED-COMMIT: 2f18dbd7`). Delta under review: `2f18dbd7..76476315`, a single
three-line hunk in §8.4. Unchanged sections are not re-reviewed.

## 1. What changed

`git diff 2f18dbd7..HEAD -- FSPEC` is 3 insertions, 2 deletions — one hunk, one sentence, in §8.4
("Making the id observable in the corpus, and its limit"). The change landed inside the DOD round-1
remediation commit `76476315`, not in a dedicated erratum round.

| Hunk | Lines | Change | Class |
|---|---|---|---|
| 1 | `:1524-1526` | The `failure-mode-id` convention's citation into `pdlc/skills/harvest-learnings/SKILL.md` moves from the metadata table `:70-78` to the §5 Open Items convention `:103-108`, with an explicit *not*-clause naming the metadata table as where §8.3's separate `Phases exercised` row lands | citation correction |

Zero AC, BR, NFR, E-row, AT row, rule or fixture changed. Net line delta is **+1**, which matters
only for intra-document self-locators (§3 below).

The correction is real, not cosmetic: as it stood, §8.4 asserted that the *lookup* convention is
added to the LEARNINGS **metadata table**, while §8.4's own preceding sentence (`:1508`) says the
`failure-mode-id` line is added to the **§5 Open Items convention**, and §15.3's change register row
(`:2454`) splits the two edits the same way. The document contradicted itself in two places about
which of two SKILL regions receives which of two edits; the delta resolves it in favour of the two
that already agreed.

## 2. Is the corrected claim true at HEAD?

Both halves of the new sentence are line-checked against the shipped skill at HEAD, not against the
FSPEC's own account of it.

| Claim in the delta | HEAD evidence | Verdict |
|---|---|---|
| `:103-108` is the §5 Open Items convention | `pdlc/skills/harvest-learnings/SKILL.md:103` is `## 5. Open Items for Consolidation`; `:104` carries the convention prose ("copy that list's id verbatim onto the item — never re-slug, abbreviate, or mint a new id"); `:106-108` is the fenced `failure-mode-id: {id}` block that closes it | exact — the span opens on the heading and closes on the fence, with nothing of another section inside |
| `:70-78` is the metadata table, and is where `Phases exercised` lands | `SKILL.md:70-71` is the `| Field | Detail |` header and separator; `:78` is `| Phases exercised | {list of phases this feature's pipeline ran, …} |` | exact — `:78` is the `Phases exercised` row itself, so the span's upper bound is load-bearing rather than approximate |
| The convention is a *lookup*, "never a re-derivation" | `SKILL.md:104` conditions the copy on the failure mode having been "named in the handed open-promotion list (FSPEC §8.3, §8.4)" and forbids minting — i.e. the id's provenance is the handed list, never the agent | agrees with §8.4's four-step table (steps 1–4, `:1529-1534`), in particular step 3's "copy the id **verbatim** … character-for-character from the log row" |

The two spans are disjoint (`70-78` ∩ `103-108` = ∅), so the *not*-clause is a true statement about
HEAD and not merely a restatement of intent: there is no region of the skill that could satisfy both
citations, which is exactly why the pre-delta text was wrong rather than loosely worded.

The correction also protects a real oracle. §8.4's whole argument is that `recurred` is reachable
only because a *producing* side writes the id, and AT-F15 (`:2207`) is a receive-side test over "a
LEARNINGS whose §5 Open Item carries one `failure-mode-id` line". Had the FSPEC continued to name
the metadata table as the convention's home, an implementer following the FSPEC would have put the
line in a region AT-F15's fixture does not read, and the fixture would have been red on code that
followed the spec. This is the same defect class as the v11.5 erratum (a document sentence that
would make a conforming implementation fail its own AT), caught one layer earlier.

## 3. Regression check against the v15 approval

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
