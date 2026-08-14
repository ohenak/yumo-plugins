# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 5
**Scope:** Delta re-review against my v4 review (`REVIEWED-COMMIT: a4b12eb7`). The document
itself is byte-unchanged since that commit; one upstream document (PLAN) moved. Only that
delta is scanned. Not a whole-document re-review.

## 1. The delta: the document did not move, the upstream did

`git diff a4b12eb7..HEAD -- docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md`
is **empty**, and `git log` over the same range lists no commit touching the file. The document
I approved with minor changes in round 4 is the byte-identical document in front of me now.

What did move in that range is **PLAN, v0.8 → v0.9** (`9520b139`, `dc2486ad`, `5870f95b`,
`fefce120`, `06f76667`), plus three cross-review files and `docs/_decisions/DECISIONS-plugin-distribution.md`.
PLAN is this document's immediate upstream — §1 says every property is carried by a task PLAN §2
already has and names a test file PLAN §3's ownership manifest already has — so the re-review that
is actually owed here is not "did the author's edit break something" (there was no edit) but
"did the upstream's edit strand a claim this document makes about it".

The PLAN delta is 14 added / 13 removed lines across a 59-task document. I read all of them rather
than the changelog. None adds, removes, renumbers or re-batches a task; none changes §3's ownership
manifest. They are: T01's two-half prose, T16's erratum attribution moved to FSPEC v0.3 (three
places), T59 gaining both discriminator legs for T50's opt-out predicate, DoD items 14/15 narrowing
"hermetic carriers" for AT-2.1, §2.1's AT-3.8a **label** restated from "§5.2's writable classes" to
"member-for-member (members from TSPEC §5.4, classes and per-class counts from FSPEC §5.2), count
conjunct against the transcribed list", and T50's runner wording.

## 2. Prior findings: both still open, neither gating

Both round-4 findings were Low and neither has been touched, which is exactly what an empty diff
predicts. I re-checked the two sites rather than inferring them from the absent diff.

| Prior finding | Severity | State at HEAD | Verified |
|---|---|---|---|
| **F-01** changelog rows non-monotonic — 0.6 filed above 0.5 | Low | **Open, unchanged.** `:22` still carries 0.6 and `:23` still carries 0.5; the table still reads 0.1, 0.2, 0.3, 0.4, 0.6, 0.5 | Read the region directly. The Version cell (`:12`) still reads `0.6`, so nothing machine-read is wrong — the defect stays presentational, as filed |
| **F-02** §4's prose says PROP-LAUNCH-4 state (b) reports the triple that *"is AT-1.6's"* while AT-1.6's carrier is PROP-LAUNCH-5 alone | Low | **Open, unchanged.** The sentence still reads "the triple it reports there is AT-1.6's" (`:323`) | Read the region directly. §4's `AT-` table still names PROP-LAUNCH-5 as AT-1.6's sole carrier, so the authority is still unambiguous and the risk is still inference-from-prose, not a wrong trace |

Neither was gating in round 4 and neither is gating now. I am not re-raising them as new findings;
they are carried forward at the same severity so the round history stays honest about the fact that
they were never addressed rather than silently dropped.

## 3. New-issue scan over the upstream delta

The question for each PLAN edit is whether this document transcribes the thing that moved. I checked
the four that plausibly reach it, and the one place where the document states a fact about PLAN's
identity.

**§4's 35-row set-equality still holds against PLAN v0.9, checked mechanically.** I extracted every
`AT-` id from PLAN's §2.1 table and every `AT-` id from §4 of this document and compared the sets:
35 ids each side, `diff` empty. PLAN's AT-3.8a edit changed the row's **description cell**, not its
id and not its `Carried by` cell (T16, T25, T49 on both sides of the diff), so the transposition
this document copies is undisturbed.

**The AT-3.8a relabel moves toward this document, not away from it.** PLAN v0.9 now describes the
packed-set check as member-for-member with members from TSPEC §5.4, classes and per-class counts from
FSPEC §5.2, and the count conjunct asserted against the transcribed list. That is already what
PROP-PACK-2 asserts (`:212`-region: the count is asserted against the transcribed `PK-*` list, 23 or
24 once N-2's licence record lands, and reading it off the tarball is forbidden). The upstream caught
up to the property; no edit is owed here.

**T59's new discriminator legs and DoD 14/15's narrowed carriers do not contradict anything asserted.**
PROP-GATE-1…PROP-GATE-5 trace to DoD items 14 and 15 by item number (`:327`), not by transcribed
text, and this document nowhere restates T59's leg list — it names T59 only as a carrier. Narrowing
prose behind a citation this document does not quote cannot strand it. Same for T01: §6's
infrastructure paragraph (`:389`) names T01 as one of the two tasks deliberately carried by no
property, which is a statement about T01's *role*, and the v0.9 edit changed T01's oracle prose
without changing that role.

**One real staleness, and it is the document's own claim about upstream.** §1's Upstream cell (`:5`)
pins `PLAN-pdlc-engine-distribution.md` at **(v0.8)**. PLAN's header now reads **0.9** (`PLAN:12`).
Every other pin in that cell is still exact at HEAD — REQ v0.11, FSPEC v0.7, TSPEC v0.12,
DECISIONS v0.3 — so this is a single stale cell, not a drifted document. I am filing it Low rather
than Medium because I checked the content question before the bookkeeping one: the v0.9 delta
changes nothing this document transcribes, so the pin is wrong about a version number without being
wrong about anything derived from it. It still matters, because DEC-ERR-01's re-grounding step has
the next author diff `Version` cells to decide what to absorb, and a cell that reads 0.8 against a
0.9 upstream will make a real absorption look like a no-op.

**The three standing bars are undisturbed, by construction.** No assertion changed, so no oracle
could have been weakened: no expectation imports or derives from code under test, every negative
conjunct in §2 and §3 still sits beside the positive it falsifies (PROP-LAUNCH-9's `=== 0` dispatch
count and its byte-identity check against a **non-empty** pre-state; PROP-NEG-18's transcription of
the same), and the only set-equality claim in the document — §4's 35 rows — I re-verified against the
moved upstream above rather than assuming an empty diff protected it.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | Upstream cell pins PLAN at **v0.8**; PLAN's header reads **0.9** at HEAD (`PLAN:12`, commits `9520b139`…`06f76667`). Nothing derived is wrong — the v0.9 delta is 14/13 lines of wording and attribution, no task, batch or ownership-manifest change, and §4's 35-row set-equality against PLAN §2.1 still passes `diff` — but DEC-ERR-01's re-grounding has the next author diff `Version` cells to decide what to absorb, and a stale cell makes a real move look like a no-op. Re-pin to v0.8 → v0.9 and, if a changelog row is added, state the four no-op absorptions explicitly | §1 Upstream cell, `:5` |
| F-02 | Low | Local | *(Carried forward from round 4, unaddressed.)* Changelog rows non-monotonic: 0.6 (`:22`) filed above 0.5 (`:23`). Version cell (`:12`) is correct, so nothing machine-read misreads the document's version. If F-01 adds a 0.7 row, fix the ordering in the same edit | Changelog, `:22-23` |
| F-03 | Low | Local | *(Carried forward from round 4, unaddressed.)* §4's prose says PROP-LAUNCH-4's resolution state (b) reports the triple that *"is AT-1.6's"* (`:323`), true of the triple's *shape* per `FSPEC:694-697`, but AT-1.6's carrier is PROP-LAUNCH-5 alone. The sentence sits inside the no-`AT-`-row paragraph, where a reader may infer a second carrier from prose. Suggest *"the three members AT-1.6 pins"* | §4, `:323` |

Three Low findings, none gating. **No High and no Medium is open against this document**: round-2's
F-01 (Medium) and F-02 (Low) were resolved at v0.6 and verified in round 4; the v0.6 content is
unchanged since; the only new finding is an upstream version pin.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | The two open TSPEC errata this document is explicitly conditional on — `node.below-floor`'s registration (§9 Q-1, PROP-CAT-2 / PROP-CAT-4) and the fixture-machine legs' home (§9 Q-2, PROP-GATE-5) — are still recorded as open in PLAN §7 at v0.9. Both say implementation must not begin against the unresolved form, and both block a named task (T45, T50). Is the intent that Phase I starts with those tasks gated, or that the errata are discharged in a TSPEC edit before the first wave dispatches? This is a sequencing question for the orchestrator, not a defect in this document — the conditionality is stated correctly on both properties |

## 6. Positive Observations

- **The empty diff is the right outcome for this round, not a stalled one.** Round 4 closed both
  round-2 findings and left two Lows the author was explicitly told were sweepable "next time the
  document is opened for another reason". The document was not opened for another reason, and it was
  not opened just to look busy. A no-op round on a document whose only open findings are cosmetic is
  the correct use of the review budget.
- **The upstream moved and the derived claims held, which is evidence about how this document was
  built.** PLAN gained five commits under a document that transcribes its task ids, its test-file
  ownership and its §2.1 transposition, and nothing stranded. That is because §1's reading rules put
  member names in TSPEC, classes and counts in FSPEC, and carriers in PLAN §2.1 — each fact sourced
  from exactly one upstream home — so a reword in one home cannot silently contradict a transcription
  from another. The AT-3.8a case is the clean demonstration: PLAN's label changed to say what
  PROP-PACK-2 had been asserting for three versions.
- **The set-equality survived a mechanical re-check, not a reassurance.** I re-extracted both `AT-`
  id sets after the upstream moved rather than trusting round 4's check plus an empty diff. 35 each
  side, `diff` empty. This is the check the document's own §4 preamble invites, and it passes against
  the moved upstream.

## 7. Recommendation

**Approved with minor changes**

The document is byte-unchanged since the commit I approved in round 4, so no prior finding could
have been broken and no new assertion could have been introduced. The re-review that mattered was
against the moved upstream (PLAN v0.8 → v0.9), and it comes back clean on content: §4's 35-row
set-equality against PLAN §2.1 re-verified mechanically, carriers for the one relabelled row (AT-3.8a
→ T16, T25, T49) unchanged, T59 / DoD 14-15 / T01 edits landing behind citations this document does
not transcribe, and PLAN's AT-3.8a relabel converging on what PROP-PACK-2 already asserted. Three
Low findings remain — a stale PLAN version pin and the two cosmetic items carried forward from round
4 — and all three are one edit's work, best swept together the next time the document is opened.
No High is open. The document remains ready for Phase I, subject to Q-01's two upstream errata being
discharged before T45 and T50 dispatch.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
