# Cross-Review: software-engineer — REQ (delta re-review, round 7)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 7

## 1. Delta scope

**Delta base:** `e33637af2` (REQ v1.4, the bytes I reviewed at v6). **Head:** REQ v1.5, five commits
(`9317412b1`, `f76393b1e`, `84a5c95e2`, `e6fc64e3f`, `af78b8c4e`). Unlike round 6, the document
**did** move this time: 20,256 B → 21,248 B (+992, inside the round's stated +1000 byte bound).

Changed sections, from `git diff e33637af2 HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md`:

| Section | Change |
|---|---|
| Metadata block | v1.4 erratum note replaced by the v1.5 round note; Cross-Reviews row generalised to `-v{N}` |
| G-3 (`:46-49`) | restated: feature-level label reserved for unreadable directories; absent/unparseable artifacts surface inside their own metric |
| NG-6 (`:73-77`) | now names post-mortems among harvest-deleted artifacts; adds "`LEARNINGS` is only ever the discriminator, its `Harvested from` row is never parsed" |
| REQ-STATS-02 (`:143-145`) | harvested state extended to REQ-STATS-03/04/**05**/06 |
| REQ-STATS-05 (`:184-190`) | **new harvested state** plus its justifying premise |
| REQ-STATS-06 (`:198-204`) | falsified "post-mortems survive" premise dropped; numerator share no longer asserted |
| R-6 (`:260-262`), O-1 (`:267-268`) | propagation of the above |

I reviewed only these. Unchanged sections already approved were not re-litigated.

## 2. Prior findings — both closed

**F-01 (High, v5/v6): closed as filed.** The falsified premise is gone. REQ-STATS-06 no longer
asserts "harvest deletes cross-reviews and DoD reviews while post-mortems survive"; it now says only
"a family harvest deletes is gone from the numerator" and explicitly declines to assert the share
("How much of the numerator harvest removes is not asserted here", `:201-202`). Its predicate is
restated over "review families" rather than "the two harvest-deleted process families", so the
sentence no longer stands or falls on the unsettled upstream contract. That was exactly the fix
path I asked for, taken without waiting on a `docs/_decisions/` entry — a good call, since none has
landed (`ls docs/_decisions/` at HEAD still shows no entry on harvest deletion scope).

**F-02 (Low, v6): closed by replacement.** The v1.4 erratum note whose "foreign-feature file"
rationale I flagged is gone, replaced by the v1.5 round note (`:20-22`). Nothing inherited it.

The document is genuinely better this round. But the edit that closed F-01 in REQ-STATS-06
introduced a new claim in REQ-STATS-05, and that claim does not survive checking against the repo.

## 3. New finding in the changed section

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
