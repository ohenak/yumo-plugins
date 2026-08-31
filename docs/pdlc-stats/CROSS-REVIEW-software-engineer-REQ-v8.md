# Cross-Review: software-engineer — REQ (delta re-review, iteration 8)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 8

## 1. Delta scope

**Delta base:** `af78b8c4e` (REQ v1.5, the bytes I reviewed in v7). **Head:** `1847dd9c0`, REQ v1.6,
one commit. Size 21,248 B → 21,677 B (+429).

`git diff af78b8c4e 1847dd9c0 -- docs/pdlc-stats/REQ-pdlc-stats.md` — 22 insertions, 17 deletions,
five hunks:

| Section | Change |
|---|---|
| Metadata block (`:15-24`) | v1.5 → v1.6; round note rewritten to record the withdrawal |
| NG-6 (`:75-80`) | harvested states scoped to the two families harvest removes (cross-reviews, DoD reviews); absent post-mortem = REQ-STATS-05's measured `0` |
| REQ-STATS-02 (`:145`) | key-set clause `REQ-STATS-03/04/05/06` → `REQ-STATS-03/04/06` |
| REQ-STATS-05 (`:187-192`) | harvested halt state withdrawn; `0` restored; falsified premise sentence removed; residual routed to R-6 |
| R-6 (`:262-267`) | harvested-state list drops `05`; adds the explicit accepted-residual paragraph for halts |

Nothing else moved. Unchanged sections are not re-reviewed here.

## 2. Prior findings

**F-01 (v7, High, delta/local) — RESOLVED.** v1.5's REQ-STATS-05 grounded a harvested halt state on
"harvest is observed to delete post-mortems as well as reviews", inferred from one `Harvested from`
row. My v7 survey falsified it: 9 of 13 harvested features under `docs/completed/` still hold
post-mortems, and `harvest-learnings/SKILL.md:28`, `:59` and `:129` scope deletion to `CROSS-REVIEW-*`
and `CODE_REVIEW-*` only. v1.6 takes path 1 of the three I offered — the survive side — verbatim:
the premise sentence is gone (`:187-190`), `0` is restored, and no harvested state is drawn for
halts. I re-verified the deletion scope at HEAD: `harvest-learnings/SKILL.md:28` ("then delete the
`CROSS-REVIEW-*` and `CODE_REVIEW-*` files in a second commit"), `:59` (step 8, same two families)
and `:129` (checklist, same two). `hooks/scripts/guard-harvest-before-delete.sh:3,35,43` guards those
two families plus `ADVISORY-*`, and names no `POSTMORTEM-*`. NG-6's new sentence is therefore an
accurate statement of shipped behaviour, not an inference.

**F-02 (v7, Low, delta/local) — RESOLVED by removal.** The inline shipped-behaviour observation
(the named directory's contents and one file's `Harvested from` row) that I asked to be relocated to
`docs/_constraints/` as a cited measured fact is deleted outright in v1.6. Nothing inherited it: the
document now carries no inline line-cited code claim, so the measured-fact relocation is moot rather
than deferred.

## 3. New issues in changed sections

I checked the five changed hunks for internal consistency, for knock-on breakage into the sections
they reference, and for any new claim about shipped behaviour.

**Consistency of the withdrawal is complete.** The harvested-state enumeration now reads
`REQ-STATS-03/04/06` in both places that carry it — REQ-STATS-02's JSON key-set clause (`:145`) and
R-6 (`:262`) — and `grep -n "REQ-STATS-05\|halt"` over the whole document finds no surviving claim
that halts carry a harvested state. REQ-STATS-03 (`:164-168`) and REQ-STATS-04 (`:177-179`) keep
their harvested states, which is right: those are exactly the two families the SKILL removes.
REQ-STATS-06's ratio harvested state (`:198-204`) is predicated on the same two families, so it is
unaffected by the withdrawal. No dangling reference, no half-propagated edit.

**REQ-STATS-02's set-equality oracle survived the edit.** The clause still binds the top-level JSON
key set to be set-equal to REQ-STATS-01's printed metric set, with per-metric states riding inside
their own metric's value (`:143-148`). Removing `05` from the harvested list narrowed a parenthetical,
not the enumeration under test, so "a metric added to human mode without a JSON field fails" still
holds over the full metric set and a deleted case still fails.

**No new absence-only oracle.** REQ-STATS-05's rewritten text pairs its negative ("no harvested state
is drawn here") with the positive on the same path ("halts report `0`" and "any surviving post-mortem
yields measured entries as above"), and R-6 states what the `0` unions. That is the shape I ask of
negative assertions, and the REQ meets it.

**The residual R-6 accepts is real, not hypothetical — and correctly sized as accepted.** I verified
the worst case at HEAD: `docs/completed/pdlc-consolidation-agent/` holds no `POSTMORTEM-*` file at
all, while `docs/_decisions/DECISIONS-review-severity-bars.md` carries six citations of
`POSTMORTEM-*-pdlc-consolidation-agent.md`. So `pdlc stats` will report `0 halts` for a feature that
demonstrably halted. v1.6 does not hide this: R-6 (`:264-267`) states the union explicitly and warns
the consumer baselining over `docs/completed/` not to read `0` as a clean run. Given both universal
readings of harvest behaviour were falsified in turn, reporting the measured fact and naming the
residual is the defensible choice, and it is the choice I recommended. I record the remaining gap as
F-01 below at **Low**, non-gating: no AC surfaces the caveat in the command's own output, so a JSON
consumer sees an unqualified `0` with the warning living only in the REQ. That is a legitimate FSPEC
question, not a REQ defect, and it does not need to be settled to leave R.

**Altitude clean.** The changed text states outcomes only — what is reported, what a value means. No
signature, algorithm, token spelling or field name crept in; O-1 still owns the token spellings
(`:271-274`).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | R-6 (`:264-267`) accepts that halts `0` unions "never halted" with "post-mortem files gone" and warns the consumer in prose, but no AC gives the command a way to say so in its own output — a `--json` consumer sees an unqualified `0`. Verified live: `docs/completed/pdlc-consolidation-agent/` has no `POSTMORTEM-*` while `docs/_decisions/DECISIONS-review-severity-bars.md` cites six. Suggest FSPEC decide whether the halts value carries an accepted-residual note; no REQ change needed. | R-6, REQ-STATS-05 |
| F-02 | Low | Process | `harvest-learnings/SKILL.md` is self-inconsistent about its own `Harvested from` row: `:77` composes it from `CROSS-REVIEW + CODE_REVIEW + POSTMORTEM`, while `:126` calls that row "the record of what step 8 deleted" and step 8 (`:59`) removes only the first two families. The REQ no longer depends on this (NG-6 forbids parsing the row), so it is not gating here, but it is the trap that produced two falsified premises across rounds 6 and 7 and is worth fixing at the source. | NG-6 (`:79-80`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (F-01, for FSPEC not for this round.) Should the halts value carry an accepted-residual marker in `--json`, or is R-6's prose warning the whole mitigation? Either answer is fine by me; I only want it decided once, in FSPEC, rather than rediscovered by the first consumer. |
| Q-02 | (Carried, non-blocking, answered in the affirmative by this edit.) `LEARNINGS-{feature}.md` presence remains the discriminator for the two review families only — is there any future metric that would want a third discriminator? Nothing in the current metric set does. |

## Positive Observations

- **F-01 closed exactly as scoped, with no collateral.** The withdrawal touched five hunks and every
  one of them was necessary: the two enumeration sites, the AC, NG-6 and R-6. `grep` finds no
  orphaned reference to a harvested halt state. This is the cheapest correct version of the fix.
- **The document chose the honest option over the tidy one.** A harvested halt state would have made
  all four metrics symmetric; the corpus does not support it, and v1.6 accepts the asymmetry and
  names the residual instead of manufacturing a state to hide it. R-6's "**accepted, not
  mitigated**" is the right register — it tells a downstream reader the gap is known, bounded and
  deliberate.
- **NG-6 is now a verifiable sentence.** "The two families `harvest-learnings` removes — cross-reviews
  and DoD reviews" checks out against `harvest-learnings/SKILL.md:28,59,129` and
  `hooks/scripts/guard-harvest-before-delete.sh:3,43`. Round 6 and round 7 each shipped an
  unverifiable universal about harvest; round 7's edit ships one that a grep settles in seconds.
- **Byte discipline held again:** +429 B, no unrelated churn in the diff, round note accurately
  describes the change.

## Recommendation

**Approved with minor changes** — my one open High (F-01 of v7) is closed, and the edit that closed
it broke nothing. The two findings above are Low and non-gating: F-01 is an FSPEC-shaped question
about how the accepted residual surfaces in output, and F-02 is a process note against an upstream
SKILL prompt the REQ has deliberately stopped depending on. Neither needs a REQ revision, and I do
not want another round spent on them here.

Worth recording for harvest: two consecutive rounds shipped a universal claim about harvest
behaviour inferred from a single directory, and both were falsified by a survey that took under a
minute. The durable rule is the one this round finally applied — before asserting what a pipeline
mechanism does, read the mechanism's own SKILL and count the corpus; do not generalise from one
artifact's metadata row.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
