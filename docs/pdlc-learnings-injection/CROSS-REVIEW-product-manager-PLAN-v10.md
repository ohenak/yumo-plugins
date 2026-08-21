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

**No dependency edge moved.** All 23 `Deps` cells are byte-identical to `6a2d3007`. LI-16's
`LI-15, LI-07` and LI-12's `LI-02, LI-06` are unchanged, which matters for the round's main fix:
naming LI-16 the zero-bound production owner adds no ordering obligation, because LI-16 already sat
at batch 8 behind LI-15's constants and LI-07's red suite. The fix is an ownership *statement*, not
a re-plan — which is the right shape for a frozen round.

**The re-split arm-table cell is edge-consistent.** §Traceability's `RSN-NO-MATERIAL` row now reads
`LI-12 (red) / **LI-16** (production green) / LI-21 (config plumbing only)` (PLAN:358). Checked
against the ladder: LI-12 is batch 5, LI-16 is batch 8, LI-21 is batch 13, so red precedes green
precedes plumbing — the cell reads left-to-right in run order, and the red-before-green edge it
implies (`LI-16 → LI-07`) is already in §Dependencies. Nothing new is owed.

**The arm arithmetic survived the re-split.** This was the thing most at risk of breaking, so I
checked it directly: twelve arms, thirteen entering cases, LI-23's set equality taken over **reason
codes** rather than disjuncts (PLAN:366). Adding a third task to one cell changes the entering-task
column, not the reason-code domain, so LI-23's oracle is untouched — the document says so and the
arithmetic bears it out.

**Upstream dependency direction preserved.** The PLAN still depends on FSPEC F-O-1 and TSPEC §D.3/
§D.5 and on nothing new. Its live pins read FSPEC v0.13 / TSPEC v0.9 / REQ v0.9, all correct at HEAD
per the digest table in §Overview.

**ERR-8 is recorded without being re-decided.** The new §Open questions entry (PLAN:556-562) is the
delicate one in a frozen round, because recording an open upstream erratum invites re-deciding it.
It does not: it states TSPEC decided the question, states that LI-16's and LI-12's rows already
encode TSPEC's rule, and concludes **no task moves** — so a delta confirmation against a corrected
FSPEC finds no PLAN change owed. I verified the premise rather than trusting it: `FSPEC:255` drops
structurally at item 15 and `FSPEC:259` extracts at item 16, after the count cut, exactly the
ordering ERR-8 describes; `TSPEC:1603` still carries ERR-8 as open. The claim "OPEN at HEAD" is
true today, which is the only sense in which a PLAN can make it.

**Inherited items still open, unchanged by this round.** My v9 F-01 (case A of the amendment-commit
table keys on "before batch 7", leaving the batches 4–6 window unaddressed) was Low and non-gating
and was not routed this round; it remains open at PLAN:491 and is re-filed below as F-02. The
changelog's 0.6 row still sits ahead of its 0.5 row (PLAN:603 before PLAN:604) — pre-existing at
`6a2d3007`, not introduced here; F-03.

## Verification

**How this round was verified** (delta protocol — I did not re-read the document):

1. `git diff 6a2d3007..HEAD` on the PLAN — 24/10 lines in four sections, itemised in §Overview.
2. Extracted the `Batch`, `Deps`, owner and file columns for all 23 task rows at both revisions and
   compared them: identical. This is what licenses "nothing I approved moved" as a checked claim
   rather than a restatement of the changelog.
3. Re-derived the four upstream sha256 digests at HEAD; all four match the values I recorded at v9.
4. **Grounded every new empirical claim in code, not in documents:**
   - `maxBytes <= 0` short-circuit — `orchestrate-dev.js:2306-2307`. Exists, matches LI-16's stated
     contract.
   - no-slot `RSN-NO-MATERIAL` drop before the bounds — `orchestrate-dev.js:2367-2372`. Keyed on the
     extraction yielding no sections, with no threshold test in the selector, as LI-16 claims.
   - `renderSection` knobs — `learningsFixtures.js:64-68`. `ordinal` and `gloss` accepted; two `#`
     hardcoded; no `level` parameter. LI-02's TE F-02 answer is correct.
   - "no landed suite passes `ordinal` or `gloss`" — grepped every suite under `__tests__/`: true.
   - "…and `body`" — **false**, `learningsFixtures.js:402` passes it. F-01.
   - `maxDocuments` default `5` — `REQ:224`. LI-12's "≥ 6" is the right bound.
   - ERR-8's premise and status — `FSPEC:255`/`FSPEC:259`, `TSPEC:1603`.
   - The two commits LI-08's note names — `1920f281` (LI-02) and `5e522a52` (LI-08) both resolve.
5. Confirmed every file named in a changed task row exists or is declared new:
   `__tests__/learningsSelect.test.js`, `__tests__/learningsConfig.test.js`,
   `__tests__/learningsBlock.test.js`, `__tests__/helpers/learningsFixtures.js` and
   `pdlc/workflows/orchestrate-dev.js` all exist at HEAD.

**Not re-reviewed** (approved at v9, unchanged, per the delta protocol): §Overview, §File-ownership
manifest, §Dependencies' edge tables, §Verification's batch ladder and measured baseline, and the
task rows other than LI-02, LI-08, LI-12 and LI-16.

**Oracle quality of the round's one new oracle clause.** LI-AT-30's conjunct (iii) now has the
precondition that makes it falsifiable. Checked against the three standards this review is held to:
the expected value is a literal transcription from REQ §4.1 (`5`) rather than derived from the code
under test; the conjunct is not absence-only — (iii)'s "no document carries `RSN-COUNT`" is paired
on the same path with (i)'s positive "the key is present with empty BR-8 rows" and (ii)'s
**set-equal** `rejected[]` over the full enumerated corpus, so a deleted case fails rather than
passes. That is exactly the shape a completeness contract needs.

**Product-lens verdict on the delta.** The round's substance is ownership and falsifiability, both
of which are product concerns in the end. Before v0.7, the behaviour a user sees at
`maxBytesPerDocument: 0` — an enabled run that reports empty rows rather than silently burning
document slots — was owed by no task in the plan and asserted by a conjunct that could not fail.
Either gap alone would let the wave ship green with that promise unproven. Both are closed, and
closed without moving a single batch, which is what a frozen round should look like.

**No scope creep, no reinterpretation.** The delta adds no behaviour, changes no acceptance
criterion's meaning, moves no AT between tasks and invalidates no fixture. Its changelog row claims
exactly that, and the four-column diff bears the claim out.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Delta-introduced precision slip.** LI-08's amendment note says `renderSection`'s `ordinal`, `gloss` and `body` are "all three unexercised by any landed suite". `ordinal` and `gloss` are indeed unexercised, but `body` is passed by the shipped AT-29 contamination corpus (`__tests__/helpers/learningsFixtures.js:402`). The sentence's conclusion — the amendment adds callers for **two** existing knobs, not four new knobs — is unaffected and in fact strengthened. Fix: say "`ordinal` and `gloss` unexercised, `body` already exercised by the AT-29 corpus" | AC-2.4 / F-O-1 second rule (LI-08 task row) |
| F-02 | Low | Local | **Inherited, unrouted (v9 F-01).** §The three gate wordings → *Amendment commits on landed suites*, case A keys on "before batch 7", but batches 4–6 also run in that window under the green-terminal and RED-terminal wordings, neither of which has a clause for new red cases spliced into a suite that landed red two batches earlier; the stated red reason (`extractInjectableMaterial` does not implement F-O-1's second rule) is the batch-7/8 reason, not the pre-batch-7 one. No gate is made unsafe. One clause fixes it: cases landing in batches 4–6 read under that batch's own wording as part of the already-red `learningsBlock` suite | PLAN §The three gate wordings, case A (PLAN:491) |
| F-03 | Low | Local | **Inherited, pre-existing at `6a2d3007`.** §Changelog's 0.6 row (PLAN:603) sits ahead of its 0.5 row (PLAN:604); the new 0.7 row is correctly appended last. Reorder 0.5 before 0.6 so the table reads monotonically | §Changelog |

DEFERRED: LI-15…LI-20's `Status` cells read ⬚ although their feature commits landed (`d462ddd8` … `c261941e`), while LI-21 reads 🟢 from `92b7ea0c` — the column is the dispatcher's ledger and the flip was not made by this revision, but the ledger is now internally inconsistent and worth a dispatcher-side sweep.
DEFERRED: §Open questions' ERR-8 status row is long enough to read as an argument rather than a status; a two-line summary with the detail beneath would serve a reader scanning for "does this PLAN owe a change" (answer: no).

## Questions

| ID | Question |
|----|---------|
| Q-01 | If FSPEC's author closes ERR-8 by adopting TSPEC's suggested item ordering, does this PLAN's §Open questions row get retired in the same round, or does it stay as the record of why no task moved? The row currently reads as permanent; a retirement trigger would keep §Open questions from accreting closed items. |

## Positive Observations

- The zero-bound fix does the harder half: it does not merely name an owner, it states **why no
  other task could be the owner** (LI-12 has no production column; LI-21's enumerated edits are
  `main()` and `buildFinalReport`). That reasoning is independently checkable in one diff, and it
  is what turns an assignment into a claim a reviewer can falsify.
- LI-AT-30's precondition is written as a *product* bound — "more eligible non-self documents than
  the `maxDocuments` in force", with REQ §4.1's default given as the concrete number — rather than
  as a magic fixture size. It stays correct if the default ever changes, and it says which document
  owns the number.
- The ERR-8 entry resists the temptation a frozen round creates: it records an open upstream defect,
  demonstrates the PLAN already encodes the corrected rule, and explicitly declines to re-decide the
  question. That is the right disposition, and it pre-answers the delta confirmation that a
  corrected FSPEC will trigger.
- The changelog row is unusually honest about negative space, and this time the negative space is
  verifiable in one command: I compared all four contract columns across 23 rows and found them
  identical.

## Recommendation

**Approved with minor changes.**

All five of my v9 findings are resolved, each verified against the repository rather than against
the document's account of itself. The revision broke nothing I had approved: the batch ladder,
`Deps` edges, file ownership, AT partition and fixture set are byte-identical, and the arm table's
twelve-arm / thirteen-case arithmetic and LI-23's reason-code set equality survived the one cell
that was re-split. Upstream is unchanged at all four digests, so no cascade entered this round.

No High finding. Three Low findings are recorded and none blocks: F-01 is a supporting-clause
inaccuracy the delta introduced whose conclusion holds regardless, and F-02 and F-03 are inherited
items outside this round's routing scope. Two observations are recorded as DEFERRED rather than
folded into the verdict, per the freeze.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
