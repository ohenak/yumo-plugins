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

Four things a +1-line prose edit could break. I checked each at HEAD.

**(a) Did the sibling citations of the same skill drift out of agreement?** No — and this is the
check that decides whether the fix was scoped correctly rather than merely applied correctly. The
FSPEC cites `harvest-learnings/SKILL.md` in exactly four places (`:1498`, `:1525`, `:1552`, `:2454`).
`:1498` cites `:70-78` for the `Phases exercised` row (correct, §2 above); `:2454`'s change-register
row splits the two edits into "metadata table (`:70-78`)" and "the §5 Open Items convention" (already
correct before the delta, and now agreeing with `:1525` verbatim); `:1552` carries no line locator
and is a statement about compliance not being assertable at this layer. All four now say the same
thing. No fifth site was left behind.

**(b) Did the +1 shift break an intra-document self-locator?** One, at the margin. The FSPEC carries
exactly two `§N.M \`:NNNN\``-style self-locators (both repaired in v11.5): §4.2's producers table
citing §4.3 at `:557-558`, and AT-P7 citing §15.3's change register at `:2449`.

- §4.3 `:557-558` is **before** the edit and is unmoved. Re-derived at HEAD: `:557-558` is "it runs
  at step 16 after the terminal row is appended", which is precisely the release-ordering claim
  §4.2's row cites it for. Still exact.
- §15.3 `:2449` is **after** the edit and moved by one. At HEAD `:2446` is `### 15.3`, `:2448` is the
  `| Path | Change | Section |` header, `:2449` is the `|---|---|---|` separator, and the
  `nudge-consolidation.sh` row it was repaired to point at in v11.5 is now `:2450`. The locator still
  lands **inside** the change-register table it names, so AT-P7's reference resolves to the right
  construct and no AT transcribing it goes red — but it no longer points at the row. Filed **Low**
  (F-01), non-gating, same class as v14 F-01b.

Every other backtick locator in the document points into *other* files — `orchestrate-dev.js`
(`:1797`, `:1833`, `:1841`, `:1844-1849`), `build-runtime.mjs` (`:448-471`), `pdlc-cli.mjs`
(`:291`), `nudge-consolidation.sh` (`:25`, `:28`, `:29-30`, `:36-41`, `:41`, `:43`),
`consolidate-learnings/SKILL.md` (`:35`, `:41`), `harvest-learnings/SKILL.md` — and is unaffected by
a shift in this file.

**(c) Did anything approved in v15 change meaning?** No. The hunk touches one sentence of §8.4's
prose rationale. §8.4's evidence table (`:1511-1514`), its four-step lookup table, §8.3's set-equality
obligation (`:1500-1503`), §8.1's reader rows, AT-F15, AT-P7's oracle, BR-09 and every AC/BR/NFR/E-row
are byte-identical across the delta. The v11.5 erratum's subject — AT-Q7c's invoking-tree bound in
§13.5 — is untouched, so the v15 finding-free confirmation still stands on its own terms.

**(d) Does the corrected sentence contradict anything it now sits next to?** No. It agrees with
`:1508` (the line lands in §5), with `:1497-1498` (the row lands in the metadata table), and with
`:2454` (both, split the same way). The one thing it adds beyond the repair — the parenthetical
naming the metadata table as §8.3's home — is a cross-reference, not a new obligation, and creates no
second place to keep in sync: it points at `:1497`'s existing claim rather than restating a literal.

**One provenance observation.** The header (`:12`) still reads version `11.5`, date `2026-08-07`, and
no erratum note records this edit — the document's own convention is that each round bumps the
version and appends a note describing what changed and which review raised it. The edit arrived via
the DOD remediation commit rather than an erratum round, which is how it slipped the convention.
Filed **Low** (F-02): the document is correct, but its change history no longer accounts for all of
its bytes, and the next reviewer diffing v11.5-as-recorded against v11.5-on-disk finds an
unexplained hunk.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
