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

No High. The erratum is fully absorbed, the new AT row is falsifiable and correctly discriminated,
and nothing seventeen prior rounds approved was broken. One new Low is introduced *by this round*;
v17's two Mediums and one Low carry forward unchanged.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **New this round: both self-locators the header claims to have "re-derived at HEAD here" are short by a line or two.** The header (`:26`) supersedes v11.6's values with "§4.2 → §4.3 `:578-579`, AT-P7 → §15.3 `:2476`". At HEAD, §4.3's release-ordering sentence ("it runs at step 16 after the terminal row is appended") is at `:580-581` — `:578-579` lands on the `refused` and `skipped-cadence` rows of the preceding table. §15.3's `nudge-consolidation.sh` change-register row is at `:2477`; `:2476` is the table separator. The same two numbers are re-cited inside the document at `:550` and inside AT-P7's cell at `:2147`. This is genuinely Low and not Medium: the REQ's own anchor doctrine (`REQ:20-22`) holds that "the role name is the durable locator; the number is the convenience", and a shifted number is a defect only where the named role no longer resolves — both roles resolve, one and two lines away. What earns the finding is not the drift but the **warranty**: the header asserts these two were re-derived at HEAD *in this round*, and a re-derivation claim that is off is a slightly false statement about a mechanical fact. The insertions were +14 and +18 lines; the header applied +12 and +17. Repair is one edit: `:580-581` and `:2477` at the three citation sites. | Header (`:26`), §4.2 (`:550`), §13.5 AT-P7 (`:2147`) |
| M-01 | Medium | Local | **Carried from v17, unaddressed and still open — and its own line numbers have now shifted again.** The `nudge-consolidation.sh` citer family remains pre-edit against a hook this feature's implementation (`b22834b7`) rewrote: globs are `:60-61` not `:28`, the `pending` binding `:73-74` not `:41`, the log read and `except: logtext = ""` `:66-70` not `:36-39`, the `THRESHOLD` comparison `:81` not `:43`. Only `THRESHOLD = 5` at `:25` still holds. This round's insertions moved the *citing* sites too, so v17's own locator list is now stale: AT-P7 is `:2147` (was `:2130`), §15.3's row `:2477` (was `:2459`), the §3.1 shipped-behaviour table `:400` (was `:386`). Still Medium and still non-gating for the same reason v17 gave: no expected value is wrong, and AT-P7 pre-declares its numbers will drift with the edit — a test author is pointed at wrong lines, never toward a wrong assertion. It is worth noting that this is now the **second** round in which the citing sites moved without the citations being re-measured; the repair gets cheaper the sooner it runs. | §3.1 (`:400`), §13.5 AT-P7 (`:2147`), §15.3 (`:2477`) |
| M-02 | Medium | Local | **Carried from v17, unaddressed.** AT-P7's cell still explains its empty-corpus case by "the block early-exits at `if not learnings: sys.exit(0)` (`:29-30`)", and still scopes itself to the post-edit block. At HEAD the post-edit block has no such early exit; `pending` is unconditionally bound and is simply `[]` on an empty corpus. The expected value (empty set, not an error) remains right, so no oracle is wrong — the stated *reason* is false against the code it names. Same for the "read out of the namespace the block was executed in" channel, which shipped as a `PDLC_CONSOLIDATION_DEBUG=1` stderr emission read by `consolidationHookParity.test.js`. The spec's intent is honoured; its literal is not what shipped. Folds into M-01's re-measurement. | §13.5 AT-P7 (`:2147`) |
| L-02 | Low | Local | **Carried from v17 L-01 (v16 L-02, v15 L-02), accepted-not-repaired by explicit decision.** AT-Q7c's seven-member literal stays pinned to TSPEC §9.3's current contents, so a fifth recorded widening restages the erratum that produced it. Recorded as a known drift point; the cell states the shape rule before the instantiation, so a reader finding the literal short knows which side governs. No change requested. | §13.5 AT-Q7c |

v17's L-02 (the deliberate AT-Q7 / AT-Q7c asymmetry, filed only so a later reviewer would not
"fix" it) is not re-filed — it requested no change and nothing this round touched it. I confirm the
asymmetry is still deliberate and still correct.

## Questions

| ID | Question |
|----|---------|
| Q-01 | M-01 has now survived two rounds in which the citing sites themselves moved. Is the intent to re-measure the `nudge-consolidation.sh` family once at the end of Phase T (so it is done against a settled line map), or is it waiting on something? If the former, say so in the header note — a reader who finds eight stale anchors and no statement of intent cannot tell deferral from oversight, and the next reviewer will file it a third time. |

## Positive Observations

- **The erratum was absorbed at exactly the three sites it named, and no further.** No AT expected
  value, fixture, oracle strength, BR, NFR or vocabulary pin moved. That is what makes this
  confirmable in a delta pass rather than requiring a re-read, and it is the behaviour the erratum
  protocol is for.
- **AT-K3b is the finding's real answer, not a paper one.** The erratum could have been closed by
  editing "two" to "three" in one paragraph. Instead the round added a row for the cause, wrote an
  acceptance test that can fail, and bound it in §15's map — so the third cause is now *provable*,
  not merely *mentioned*. From this lens that distinction is the whole point of the round.
- **The discriminator is stated as a pairing.** "Consumed-by-basename list empty **while** the
  un-consolidated set is non-empty" is what separates the third cause from the first, and stating it
  as one conjoined assertion rather than two facts is what stops an implementation collapsing the
  two causes from passing. This is the second time this document has chosen a positively-asserted
  discriminator over an absence oracle without being asked to.
- **ER-3 was kept open rather than closed.** Recording "partially absorbed" with the remainder named,
  and routing the rest to the REQ's author with a stated reason, is the correct handling. Closing
  ER-3 outright would have been the easy and wrong move.
- **AT-R7's ordinal locator was converted to a name in the same edit that would have invalidated it.**
  Nobody asked for that. It is exactly the class of second-order breakage that erratum rounds
  usually ship, and it was seen and handled.

## Recommendation

**Approved with minor changes**

The erratum is fully and correctly absorbed at all four raised framings, which are one item. The
new AT row is falsifiable, positively discriminated against its nearest sibling, and consistent with
REQ v2.5 word for word on the no-reason-code point. Nothing seventeen prior rounds approved was
broken, and the round proactively repaired a locator its own insertion would have invalidated.

Nothing blocks. The one new Low is a two-line-off re-derivation claim in the header; the two carried
Mediums are the same mechanical anchor sweep v17 asked for, which no longer gets cheaper by waiting.
Fold L-01 into that sweep, answer Q-01 in the header note, and the citation surface is settled for
the rest of Phase T.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:9fbdf6e7d25468127aace762afed45b2aa12549263c3b108625d087d0eecdbaf
REVIEWED-COMMIT: b5ab7503e9fa5d1ba7c46cc5a56a6c98bb657c0c
