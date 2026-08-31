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

## 3. New finding in the changed section — REQ-STATS-05's premise is falsified by the corpus

REQ-STATS-05 now grounds its harvested state on a shipped-behaviour claim plus one cited example
(`REQ-pdlc-stats.md:184-187`):

> Absence alone never decides the count, because harvest is observed to delete post-mortems as well
> as reviews: `docs/completed/pdlc-advisory-tier/` retains its LEARNINGS and no post-mortem, yet that
> LEARNINGS' `Harvested from` row names two it deleted.

I checked the cited example and then the rest of the corpus. The example is accurately described;
the generalisation drawn from it is not, and the inference that licenses it is invalid.

**The cited example is real.** `docs/completed/pdlc-advisory-tier/` holds `LEARNINGS-`,
`REQ-`, `FSPEC-`, `TSPEC-`, `PLAN-`, `PROPERTIES-`, `DECISIONS-` and `MANUAL-VERIFICATION-` only —
no `POSTMORTEM-*`, no `CROSS-REVIEW-*` — and its `Harvested from` row
(`LEARNINGS-pdlc-advisory-tier.md:11`) does name `POSTMORTEM-T-pdlc-advisory-tier.md` and
`POSTMORTEM-PR-pdlc-advisory-tier.md`. Two, as stated.

**But the `Harvested from` row does not evidence deletion.** The decisive counter-example is a
sibling in the same directory. `docs/completed/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md`'s
`Harvested from` row likewise names `POSTMORTEM-T-pdlc-advisory-wave-gate.md` and
`POSTMORTEM-D-pdlc-advisory-wave-gate.md` — **and both files are still on disk at HEAD**:

```
$ ls docs/completed/pdlc-advisory-wave-gate/ | grep POSTMORTEM
POSTMORTEM-D-pdlc-advisory-wave-gate.md
POSTMORTEM-T-pdlc-advisory-wave-gate.md
```

So the row records what harvest *read*, not what it *deleted* — which matches
`harvest-learnings/SKILL.md:34` ("List ... **and every** `POSTMORTEM-*.md`", i.e. inventory) and
`SKILL.md:122` (the read checklist), against `SKILL.md:28`/`:59`/`:129`, which scope deletion to
`CROSS-REVIEW-*` and `CODE_REVIEW-*` only. The REQ's inference — row names it, therefore harvest
deleted it — is the one reading the corpus rules out.

**The corpus majority is the survive side.** Across all thirteen harvested features under
`docs/completed/` (every one has exactly one `LEARNINGS-*.md`), nine retain post-mortems:

| Post-mortems retained alongside LEARNINGS | Count |
|---|---|
| `pdlc-engine-distribution`, `pdlc-headless-engine` | 4 each |
| `pdlc-learnings-injection`, `pdlc-plugin-retirement` | 3 each |
| `pdlc-advisory-wave-gate`, `pdlc-engineering-loop` | 2 each |
| `pdlc-review-loop-hardening`, `pdlc-wave-resume`, `pdlc-workflow-distribution` | 1 each |
| `pdlc-advisory-tier`, `pdlc-consolidation-agent`, `pdlc-loop-economics`, `pdlc-merge-phase` | 0 |

Nine of thirteen retain post-mortems *after* harvest. "Harvest is observed to delete post-mortems"
is therefore not the observed behaviour; it is the exception, and the two zero-cases that did lose
files lost them without the `Harvested from` row being able to prove harvest did it
(`pdlc-consolidation-agent`'s row names no post-mortem at all, yet
`docs/_decisions/DECISIONS-review-severity-bars.md:4,42,64,90,193` cites five
`POSTMORTEM-*-pdlc-consolidation-agent.md` files that are gone — removed by something the REQ's rule
cannot see).

**Why this blocks rather than being a prose nit.** The premise is not decorative — it is the sole
stated warrant for inverting REQ-STATS-05's outcome, and the AC now hard-codes the inversion
(`:187-190`): "where `LEARNINGS-{feature}.md` is present **and** no `POSTMORTEM-{phase}-{feature}.md`
file remains, halts report **harvested**, never `0`; a plain `0` is reserved for ... no post-mortem
**and** no LEARNINGS." Since a harvested feature by definition has LEARNINGS, `0` becomes
unreachable for every harvested feature. On the dominant survive-side behaviour, a harvested feature
with no post-mortem genuinely never halted, and the correct measured answer `0` was available on
disk — v1.4's "no post-mortem file is zero halts" was right for those nine. v1.5 replaces a correct
measured value with an unmeasurable label across exactly the corpus (`docs/completed/`) that R-6
(`:260-262`) and G-1 exist to baseline. That is the same class of harm R-6 names, pointed the other
way: not a harvested feature reading as a genuine zero, but a genuine zero that can no longer be
reported at all.

The fix is not to revert to v1.4's premise either — that one was falsified too (F-01). Both universal
readings are wrong because the corpus is mixed. Concretely, one of:

1. **Take the survive side, which the corpus supports 9:13**, and restore `0` for
   LEARNINGS-present-with-no-post-mortem, keeping the rest of v1.5 (G-3, REQ-STATS-06, NG-6's
   never-parse-the-row rule) as-is. Cheapest, and consistent with `SKILL.md:28`/`:59`/`:129`.
2. **State the mixed observation honestly and pick a discriminator that does not depend on it** —
   e.g. keep `0`, and let the harvested label come from the review families, which
   REQ-STATS-06 already establishes are reliably deleted.
3. Settle it upstream first (the F-01 path), then assert whichever side wins.

Whichever is chosen, the sentence at `:184-187` must stop citing the `Harvested from` row as
evidence of deletion, because `pdlc-advisory-wave-gate` falsifies that reading directly.

**Scope note.** This is a defect in the document in front of me, not upstream, so I am filing it as
a finding rather than an erratum. The upstream `harvest-learnings/SKILL.md` self-contradiction from
v6 does persist at HEAD, but the REQ no longer needs it settled to be correct — path 1 above is
available today.

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
