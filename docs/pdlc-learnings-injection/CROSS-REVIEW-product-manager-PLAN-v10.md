# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.7)
**Date:** 2026-08-20
**Iteration:** 10 (delta re-review, DECISION FREEZE in force)

## Overview

**Question asked:** v0.6 → v0.7 answers the five findings I left open at v9 (three Medium, two Low)
plus two TE findings. Are my blocking-eligible findings resolved, and did the revision break
anything I had already approved?

**Answer:** all five of my prior findings are resolved in substance, verified against the repository
at HEAD rather than against the changelog's account of itself. Nothing I approved at v9 moved: no
task changed batch, no `Deps` edge changed, no AT partition, fixture or file-ownership row was
touched — I diffed all four tables and they are byte-identical. **No High finding. Approved with
minor changes.**

**Delta shape.** `git diff 6a2d3007..HEAD` on the PLAN: 24 insertions, 10 deletions across four
authoring commits (`7c82eb2a` §Batches, `96fe5bf1` §Traceability, `fe29af1c` §Open questions,
`f73046ad` §Changelog) — exactly the four sections the round routed to, and no fifth.

**Prior-finding disposition, each checked at HEAD:**

| v9 finding | Sev | Resolution at v0.7 | Verified against |
|---|---|---|---|
| F-04 zero-bound **production** half had no owner task | Medium | **Resolved.** LI-16's row now names it explicitly: `maxBytes <= 0` tested before the cut returning `{material: "", bounded: false, bytes: 0, sections: []}`, plus `selectLearnings`'s no-slot `RSN-NO-MATERIAL` drop. The exclusion argument is stated and true — LI-12's production column is `—` (PLAN:152) and LI-21's enumerated edits are `main()` and `buildFinalReport` (PLAN:172) | `orchestrate-dev.js:2306-2307` (short-circuit) and `:2367-2372` (no-slot drop) both exist and match the described contract |
| F-03 `LI-AT-30` conjunct (iii) vacuous without a corpus precondition | Medium | **Resolved.** LI-12 now states it: the third case's corpus holds more eligible non-self documents than the `maxDocuments` in force, ≥ 6 at the default — and declares it through LI-02's existing spec surface, so no new fixture shape | `REQ:224` gives `learningsInjection.maxDocuments` default `5`; ≥ 6 is the correct bound |
| F-02 errata list omitted ERR-8 | Medium | **Resolved, and better than asked.** "remaining" → "**other** open errata (ERR-1, ERR-2, ERR-5)" (PLAN:564), and ERR-8 gets its own §Open questions entry plus a status row, because it is addressed to *this* author | ERR-8 is open at `TSPEC:1603`; its premise holds at HEAD — `FSPEC:255` item 15 drops structurally, `FSPEC:259` item 16 extracts *after* the count cut |
| F-05 LI-08's amendment note orphaned `LI-AT-12` mid-enumeration | Low | **Resolved.** `LI-AT-12` now closes the AT enumeration and the note follows it | PLAN:147, read in full |
| F-06 0.5 changelog row overcounted stale pins as "four" | Low | **Resolved**, with the reason recorded (the 0.1 row is a historical record and correctly keeps its own pins) | PLAN:604 |

**Upstream is stable.** I re-derived all four upstream digests at HEAD and they are unchanged from
the values I recorded at v9 — REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS
`56617f5a…`. No cascade entered this round; every difference is the author's answer to review.

## Batches

**The task ladder did not move.** I extracted the `Batch`, `Deps`, owner and file columns for all 23
rows from `6a2d3007` and from HEAD and compared them: identical. The changelog's closing sentence —
"No task moved batch, no `Deps` edge changed, no AT partition, fixture or manifest row was touched"
(PLAN:605) — is true as written, not merely asserted.

**Three task rows changed prose; none changed contract.**

- **LI-16 (PLAN:156)** gains the zero-bound production half. This is the round's substantive fix and
  it is correct in both directions: the two functions it claims exist at `orchestrate-dev.js:2306`
  and `:2367`, and the *reason* the row gives for claiming them ("no other task's enumerated edits
  reach it") is checkable and checks out. The row also states the branch shape — one branch keyed on
  *yields no material*, covering both §T.7 disjuncts, with **no** zero-bound special case in the
  selector. That matches the landed code, which rejects on `sections: []` rather than on a threshold
  test (`orchestrate-dev.js:2367-2372`).
- **LI-12 (PLAN:152)** gains conjunct (iii)'s fixture precondition. Product-relevant because (iii)
  is the conjunct standing in for a user-visible promise — a corpus at `maxBytesPerDocument: 0`
  produces an *enabled* run with empty rows, not a silent slot-burning selection. Below the stated
  bound the assertion could not fail under any implementation, so the promise was unproven. Now it
  is provable, and the precondition costs no new fixture shape.
- **LI-02 (PLAN:140-ish, fixture-helper row)** states the `###` variant is emitted as body text
  through the existing `body` knob because `renderSection` hardcodes the two-`#` prefix and grows no
  `level` parameter. Verified: `learningsFixtures.js:64-68` builds the heading as
  `` `## ${ordinalPrefix}${section.name}${glossSuffix}` `` — literal two `#`, no level parameter.

**One small inaccuracy the delta introduced.** LI-08's rewritten amendment note says `renderSection`
accepts "`ordinal`, `gloss` and a free-form `body`, **all three** unexercised by any landed suite".
Two of the three are right — I grepped every landed suite and no caller passes `ordinal` or `gloss`.
But `body` **is** exercised at HEAD: the shipped AT-29 contamination corpus passes it
(`__tests__/helpers/learningsFixtures.js:402`, `sections: [{ name: "Cross-Feature Patterns", body:
contaminatedBody }]`). The sentence's conclusion is unharmed — it goes on to say the amendment adds
"callers for **two** knobs that are already there", which is exactly right, and `body` already
having a caller only strengthens "adds callers, not knobs". So this is a precision slip in a
supporting clause, not a false load-bearing claim: F-01, Low.

**LI-08's note now closes the enumeration.** My v9 F-05 asked for this and it landed: the order is
`LI-AT-05` → `LI-AT-11` → `LI-AT-12` → amendment note. The note also reconciles the ⬚ `Status` cells
with the two landed commits by naming them and by naming the distinction (file existence is a fact
about HEAD; `Status` is the dispatcher's bookkeeping). Both commits exist: `1920f281` is LI-02,
`5e522a52` is LI-08.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
