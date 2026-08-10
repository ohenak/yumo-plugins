# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 18
**Scope:** DELTA CONFIRMATION of the Phase-T erratum round (v11.7). Four raisers filed one erratum
against one site: §5.3's proposal-file table said AC-1.4 had "two named causes" where REQ v2.5 §4b
enumerates three. I read the erratum, re-derived every claim it touches against HEAD source, and
re-checked v17's two open Mediums and two Lows. I did not re-read the document.

## Delta

The revision is bounded exactly as the header declares: one erratum, three named sites, plus one
new AT row and two self-locator restatements. No AC, BR, NFR, E-row, vocabulary pin, fixture or
other AT's expected value moved. I verified that claim two ways — by reading each named site at
HEAD, and by checking that the four raisers' shared complaint has one and the same referent
(`FSPEC:757-759` in the pre-edit numbering, now `:766-768`).

The four raisers filed the same defect from four lenses (te-review twice, se-author, pm-review),
which is the healthy signature of a real inconsistency rather than a lens artefact: the count was
wrong in the FSPEC, not disputed between layers. REQ v2.5 is the authority, and it is unambiguous
at `REQ:224-228`.

## Erratum absorption

All four raised items are the same item; all are absorbed. Each row below was re-derived at HEAD,
not taken from the header's own account of itself.

| Raised item | Site | HEAD state | Disposition |
|---|---|---|---|
| §5.3's `no-op` table carries no row for REQ §4b's third cause | §5.3 second table | `:768` is a new row: "`no-op` because every enumerated basename was unreadable, so nothing was consumed (AC-1.4's third cause, REQ §4b) \| **none** \| nothing was consumed, so there is nothing to propose; the basenames stay in the un-consolidated set and the next pass retries them" | **Absorbed.** The row's *Why* column states both halves the erratum asked for — empty consumed pair **and** non-empty un-consolidated set — so the row is self-discriminating against row 1 |
| §5.3's paragraph reads "two named causes" | §5.3 prose | `:772-777` now reads "describes its **three named causes** (REQ v2.5: empty consumed set, all promotions duplicate-suppressed, every enumerated basename unreadable and nothing consumed — REQ §4b)", and separately names AC-4.3's degraded pass as the cause AC-1.4 still does not enumerate | **Absorbed**, and the second sentence is the honest part: it does not claim the REQ's enumeration is now exhaustive, it says why the FSPEC is self-consistent while the REQ's own claim is not |
| §14.4's ER-3 does not record the state | §14.4 | `:2333` reads "**Partially absorbed at REQ v2.5**", names what landed and what remains open, and gives the routing reason (correcting a REQ AC is its author's edit) | **Absorbed.** This is the correct erratum disposition under DEC-ERR-01: a partially-absorbed erratum stays open with its remainder named, rather than being closed by the layer that cannot fix it |
| §15's AC-1.4 → AT map binds no AT to the third cause | §15.1 | `:2388` reads "AC-1.4 \| §5.3, §8.5, §8.7, §12.1 \| AT-K3, **AT-K3b** (the third cause: the all-unreadable terminating `no-op`), AT-L2, AT-F13, AT-R7" | **Absorbed**, and the binding is real rather than nominal — AT-K3b exists at `:2210` with a Given, a When and a falsifiable Then |

**AT-K3b is a sound row, which is the part that matters to this lens.** I checked it against the
three failure modes this checklist cares about:

- **Not absence-only.** The oracle does not stop at "no proposal file exists". It asserts three
  positive conjuncts: terminal status `no-op`, the consumed pair appended **empty**, and AC-7.1's
  consumed-by-basename list empty **while** the un-consolidated set is non-empty. That last pairing
  is the discriminator, and it is stated as a pairing, not as two independent facts.
- **Discriminated against the sibling it is nearest to.** The row says so explicitly: AC-1.4's first
  cause has *both* sets empty, this one has one empty and one not. An implementation that collapsed
  the third cause into the first is red on this row. Without that clause the row would have been a
  precedence-chain false green — the exact shape §13's own falsifiability rules warn about.
- **Asserted in already-enumerated values.** No new reason code, no new status, no new vocabulary
  row — matching REQ v2.5's own instruction at `REQ:26-29` that this condition mints **no** reason
  code and stays distinguishable in values that already exist. I diffed the FSPEC's claim against
  the REQ's sentence directly; they agree word for word on the discriminator.

The negative half is already owned elsewhere and was not disturbed: AT-R7 (`:2181`) still carries
the "only when" direction with three fixtures, and its locator for the degraded row is now given by
name rather than by ordinal — which is the right repair, since inserting a row into §5.3's table is
precisely what would have silently invalidated an ordinal reference.

## Findings

_(filled below)_

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_
