# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.7)
**Date:** 2026-08-20
**Iteration:** 10 (delta re-review of v0.6 → v0.7, under DECISION FREEZE)

## Overview

**What this round is.** I approved this PLAN at v0.5 (round 8, findings TE F-01/F-02, both Low) and
again at v0.6 (round 9, delta confirmation, one Medium and one Low, no High). A round-8 revision has
since landed — `7c82eb2a`, `96fe5bf1`, `fe29af1c`, `f73046ad` — taking the document to v0.7. Decision
freeze is in force, so this round asks two questions only: were my prior blocking findings resolved
(there were none open), and did the revision break anything that was standing.

**The delta, measured.** `git diff 6a2d3007..HEAD -- PLAN-…md` is 24 insertions, 10 deletions across
seven hunks: the version cell (0.6 → 0.7), a clause added to LI-02, a clause plus a re-ordering inside
LI-08's amendment note, two clauses added to LI-16, a fixture-precondition paragraph added to LI-12,
the fail-open arm table's zero-bound cell and its following prose, a new ERR-8 row in §Open questions,
a numeric correction inside the 0.5 changelog row, and the 0.7 changelog row. I re-derived this from
the diff rather than trusting the changelog's claim of it: **no task row moved batch, no `Deps` edge
changed, no AT partition, fixture or single-writer manifest row was touched.**

**Upstream, re-read at HEAD.** The four dispatch hashes are byte-identical to what I recorded at round
9 (`shasum -a 256`: REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`), and
their version cells still read REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 / DECISIONS v0.3 — the same four
versions this PLAN pins at `:36`, `:152`, `:275`. Upstream has not moved, so the faithful-compression
verification from rounds 8 and 9 still holds for the unchanged bytes. What needed fresh checking is
the five substantive additions, and I checked each against the upstream text **and** against the
shipped code rather than against the changelog.

**Result.** All five additions check out against upstream, and where they make claims about HEAD, four
of the five check out against the code. One clause — LI-08's "`renderSection` accepts `ordinal`,
`gloss` and a free-form `body`, all three unexercised by any landed suite" — is false for `body` at
HEAD (`pdlc/workflows/__tests__/learningsBlock.test.js:77-82` and
`pdlc/workflows/__tests__/learningsSelect.test.js:375` all pass it). That is a Medium: the sentence's
conclusion ("the amendment adds callers, not knobs") is unaffected and nothing downstream reads the
"unexercised" clause. No High.

**One thing I found that is not this document's defect, and does not touch its verdict.** LI-16's new
sentence is a *faithful* compression of TSPEC §D.5. The **landed implementation** of that rule is not:
`selectLearnings` at `pdlc/workflows/orchestrate-dev.js:2367` gates the `RSN-NO-MATERIAL` drop on
`extraction.sections.length === 0 && hasAnySectionHeadingLine(entry.text)` — a second branch condition
TSPEC explicitly forbids. That is an implementation defect against an already-landed task, out of
scope for a frozen PLAN round. It is written up in §Verification and carried as a `DEFERRED:` line so
the orchestrator can route it, rather than folded into this verdict.

## Batches

Four task rows changed. Each is a clause, none is a row move.

**LI-16 (GREEN the pure selection core, batch 8) — named the owner of §D.5's zero-bound half.** The
row gains two claims. First, `extractInjectableMaterial` owns the short-circuit: "`maxBytes <= 0` is
tested _before_ the cut and returns `{material: "", bounded: false, bytes: 0, sections: []}` for every
`text`, including one carrying all five sections; `bounded` is `false` because nothing was taken, so
nothing was cut". That is a near-verbatim transcription of TSPEC §D.5's first bullet
(`TSPEC-…md:1005-1012`) — same return literal, same `bounded` reasoning, same "including one carrying
all five sections" edge. Second, `selectLearnings` owns the drop: "one branch keyed on *yields no
material*, covering both of §T.7's disjuncts — the structural one (E-33) and the zero-bound one
(E-36) — with **no** zero-bound special case in the selector". That is TSPEC §D.5's second bullet
(`:1013-1017`), which reads "The rule is keyed on *yields no material* … covers both disjuncts with
one branch … There is no second branch and no zero-bound special case in the selector." The
compression is faithful, clause for clause.

The row's supporting negative claim — "no other task's enumerated edits reach it: LI-12 is a test task
and LI-21 edits only `main()` and `buildFinalReport`" — checks out on the page: LI-12's `Source` cell
is `—` (`:152`), and LI-21's row enumerates `main()` and `buildFinalReport` only (`:161`). So the PM's
round-8 finding was real, and naming LI-16 is the right repair: LI-16 is the only task whose enumerated
edits reach either function.

**LI-12 (RED configuration suite, batch 5) — conjunct (iii) gains its fixture precondition.** This is
the best change in the delta from my lens, because it converts a mutation-killing conjunct that could
have been vacuous into one that cannot be. `LI-AT-30`'s third conjunct is "**no** document carries
`RSN-COUNT`", the conjunct that falsifies a slot-burning implementation. The new paragraph states the
precondition it needs: "the third case's corpus must hold **more eligible non-self documents than the
`maxDocuments` in force** — REQ §4.1's default is `5`, so ≥ 6 documents unless the case declares a
smaller `maxDocuments`." I verified the constant rather than the sentence: `REQ-…md:224` reads
`| learningsInjection.maxDocuments | 5 documents per dispatch |`. ≥ 6 is the correct threshold at that
default. Below it, the count cut never binds and (iii) passes against the mutant it exists to kill —
exactly the "a test that can only pass is not yet a test" failure, caught before it was written. The
precondition is expressed through LI-02's existing spec surface, so it costs no new fixture shape and
does not touch the manifest.

**LI-02 (`[Fake first]` fixture helper, batch 2) — the `###` variant is pinned as body text.** The
spec surface now reads "a `###` sub-heading **emitted as body text through the helper's existing
`body` knob, not as a heading-level knob** — `renderSection` hardcodes the two-`#` prefix and grows no
`level` parameter". Verified on disk: `learningsFixtures.js:68` is
``const heading = `## ${ordinalPrefix}${section.name}${glossSuffix}`;`` — a literal two-`#` prefix,
and the function signature `renderSection(section)` (`:64`) carries no level parameter. This closes the
open half of my round-8 F-02, and closes it the way I asked: by naming which knob produces the variant
rather than leaving an implementer to invent one.

**LI-08 (RED block/material suite, batch 3) — the amendment note is reconciled and re-ordered.** Two
repairs. The note moved to the **end** of the AT enumeration — at v0.6 it sat between `LI-AT-11` and
`LI-AT-12`, orphaning `LI-AT-12` mid-list; `LI-AT-12`'s clause now sits with its siblings and the note
follows all of them. And the `Status`-cell contradiction I filed as round-8 F-01 is resolved by
distinguishing the two records rather than by editing either: the note names the landing commits
(`1920f281` for LI-02, `5e522a52` for LI-08 — both verified present in `git log`) and states that
`Status` is the dispatcher's ledger, so "file existence is a fact about HEAD, `Status` is a fact about
the wave's bookkeeping". That is the right resolution shape — it does not have the PLAN's author write
a column he does not own.

**One clause in that note is false at HEAD.** "The knobs themselves already exist — `renderSection`
accepts `ordinal`, `gloss` and a free-form `body`, all three unexercised by any landed suite". The
first two hold: `grep -rn "ordinal\|gloss" pdlc/workflows/__tests__/` returns hits only inside
`learningsFixtures.js` itself (`:57-59`, `:65-68`), never a caller. `body` does not:
`learningsBlock.test.js:77-82` passes `body:` on all six of its section specs, and
`learningsSelect.test.js:375` passes `{ name: "Not A BR-6 Section", body: "Nothing here BR-6
recognises." }`. The clause's *conclusion* survives — the amendment does add callers rather than knobs,
and it now adds even fewer than the sentence claims, since `body` is not merely present but already
exercised — so this is F-01, Medium, non-gating.

**Nothing else in the task table moved.** `git diff` touches no other row. `[Fake first]` ordering,
red-before-green pairing for every implementation task, the single-writer file manifest and the
same-batch same-new-file guard are byte-identical to the v0.6 bytes I approved at round 9.

## Dependencies

**Batch DAG — re-derived mechanically, not assumed.** The delta adds no task, no file and no edge, but
the dispatcher reads the `Batch` column and this is the check that is cheap to do and expensive to
skip, so I re-derived every row from its declared `Deps` with `batch == max(dep batch) + 1`:

| Task | Deps | max(dep batch) + 1 | Column | ✓ |
|---|---|---|---|---|
| LI-01 | — | 1 | 1 | ✓ |
| LI-02, LI-03, LI-13 | LI-01 (1) | 2 | 2 | ✓ |
| LI-04 | LI-03 (2) | 3 | 3 | ✓ |
| LI-05 | LI-02 (2), LI-03 (2) | 3 | 3 | ✓ |
| LI-07, LI-08, LI-09 | LI-02 (2) | 3 | 3 | ✓ |
| LI-06 | LI-04 (3), LI-05 (3) | 4 | 4 | ✓ |
| LI-10, LI-11, LI-12, LI-23 | LI-02 (2), LI-06 (4) | 5 | 5 | ✓ |
| LI-14 | LI-07…LI-12 (3,3,3,5,5,5) | 6 | 6 | ✓ |
| LI-15 | LI-06 (4), LI-13 (2), LI-14 (6) | 7 | 7 | ✓ |
| LI-16 | LI-15 (7), LI-07 (3) | 8 | 8 | ✓ |
| LI-17 | LI-16 (8), LI-08 (3) | 9 | 9 | ✓ |
| LI-18 | LI-17 (9), LI-09 (3) | 10 | 10 | ✓ |
| LI-19 | LI-18 (10), LI-10 (5), LI-07 (3) | 11 | 11 | ✓ |
| LI-20 | LI-19 (11), LI-11 (5) | 12 | 12 | ✓ |
| LI-21 | LI-20 (12), LI-12 (5), LI-23 (5) | 13 | 13 | ✓ |
| LI-22 | LI-21 (13) | 14 | 14 | ✓ |

Twenty-two ids, all unique; every `Deps` entry resolves to a declared id; no cycle (every edge points
strictly backwards in batch). Fourteen batches, matching the header. No desync.

**Red-before-green is intact across the changed rows.** LI-16 (batch 8) is the green whose red is
LI-07 (batch 3), and its `Deps` carries that edge explicitly; the PLAN's own dependency-rationale
table states the pairing at `:284` (`LI-16 → LI-07 … red-before-green — each green task names the red
suite it satisfies`). The delta added production behaviour to LI-16 without adding a test, which is
the correct direction only because the red already exists: the zero-bound oracle is LI-12's third
`LI-AT-30` case at batch 5, three batches ahead of LI-16 and eight ahead of LI-21. So the new
production ownership has a preceding red that names it, and the delta did not create an
implementation task without one.

**The arm table's re-split does not move an edge.** The zero-bound cell went from `LI-12 / LI-21` to
`LI-12 (red) / **LI-16** (production green) / LI-21 (config plumbing only)` (`:358`). That is a
correction to an *entering-task* annotation, not a `Deps` change — LI-16 already depended on LI-07 and
LI-15, and LI-12 already sat at batch 5. The following prose (`:366`) is consistent with it: the arm
count stays twelve, thirteen entering cases, and LI-23's set equality is still taken over reason codes
rather than disjuncts, so the arm inventory's oracle is untouched by the re-split. I confirmed the
arithmetic on the page rather than accepting the claim: the `RSN-NO-MATERIAL` row is the only row with
two disjuncts, and 12 + 1 = 13.

**The `Status` column now carries one 🟢 (LI-21) against thirteen ⬚, and that is not a batch problem.**
LI-21 sits at batch 13 while LI-16 at batch 8 still reads ⬚, which looks inverted until you read the
column's declared semantics: the v0.7 amendment note states it is the dispatcher's bookkeeping, not a
record of what is on disk. `git log` confirms LI-14 through LI-21 have all landed (`960c229c`,
`d462ddd8`, `2cbacada`, `e9fc93fd`, `5becd6b5`, `c261941e`, `92b7ea0c`), so the column is simply
behind on twelve rows and current on one. The document is now explicit that this is expected, which is
what my round-8 F-01 asked for. It is not a batch-order violation, and the DAG above is unaffected.

**The follow-up amendment commit still creates no row, and the P-A-7 paragraph is untouched.** The
delta does not modify §The three gate wordings, so the "Amendment commits on landed suites (P-A-7)"
rule I confirmed at round 9 stands byte-identical — Case A's empty row-set, Case B's re-red rows in
test-name grammar, and the additivity premise. My two round-9 findings against that paragraph (F-01
Medium on its generic title's reach, F-02 Low on Case A's batches 2–6 silence) were not addressed by
this revision, which was scoped to round 8. Both remain open and both remain non-gating; I re-record
them below rather than re-argue them.

## Verification

**ERR-8 is real, is open at HEAD, and is recorded rather than re-decided.** The new §Open questions row
claims FSPEC's Step 5 "drops on the *structural* condition at item 15, takes the first `maxDocuments`
of the rest, and extracts material only at item 16 — **after** the count cut". I read FSPEC rather than
the summary: `FSPEC-…md:255-258` is "Drop any eligible document carrying none of BR-6's priority
sections, with `RSN-NO-MATERIAL` — it consumes no slot — then take the first
`learningsInjection.maxDocuments` of the rest", and `:259-261` is "For each **taken** document, extract
its injectable material per BR-6". The ordering defect is exactly as described, and it is still on the
page at the hash this dispatch pins. The row's handling is right for a frozen round: it records that
LI-16 and LI-12 already encode TSPEC's corrected rule, states "**Already absorbed; no task moves**",
and explicitly declines to re-decide ("This PLAN does **not** re-decide the question — TSPEC decided
it"). That is the correct posture — the erratum belongs to FSPEC's author, and I re-raise it as an
`ERRATUM: FSPEC` line rather than as a finding here.

**The oracle that is claimed to catch a literal Step-5 implementation does catch it.** The row asserts
"LI-12's third `LI-AT-30` case is the oracle that reds if an implementer follows Step 5's literal
order instead." I checked the mechanism rather than the claim. Under Step 5's literal order at
`maxBytesPerDocument: 0` with ≥ 6 eligible documents: item 15 drops nothing structurally (the fixtures
carry BR-6 headings), takes the first 5, drops the remaining ≥ 1 with `RSN-COUNT`; item 16 then
extracts nothing for the 5. The resulting `rejected[]` carries `RSN-COUNT` rows and is *not* set-equal
to every non-self path at `RSN-NO-MATERIAL`. Conjunct (ii) reds and conjunct (iii) reds. Under TSPEC's
order, every document is dropped `RSN-NO-MATERIAL` before the count bound and both conjuncts pass. The
oracle discriminates the two orderings — and it discriminates them *only because* the new fixture
precondition (≥ 6 documents) is in force. Below 6, both orderings produce the same `rejected[]` and the
oracle is blind. So the two additions are load-bearing on each other, and the delta landed both.

**Conjunct (ii) is a set equality, not a containment, and the delta did not weaken it.** `:152` still
reads "`rejected[]` is **set-equal** to every enumerated non-self corpus path, each with reason exactly
`RSN-NO-MATERIAL`, and none `bounded` — set equality, never "at least one"". A deleted case fails. And
conjunct (i) is positive on the presence of the `learningsInjection` key with empty BR-8 rows, so the
three-conjunct oracle is not an absence-only shape: it says what *does* happen (enabled run, key
present, rows present and empty, every path rejected for a named reason) rather than only what does
not.

**No expected value in the changed rows is derived from the code under test.** LI-16's return literal
`{material: "", bounded: false, bytes: 0, sections: []}` is transcribed from TSPEC §D.5 `:1006`, not
read off the implementation. LI-12's `≥ 6` is derived from REQ §4.1's `5` (`REQ-…md:224`), a spec
constant. LI-08's `LI-AT-12` byte counts are still declared "hand-computed from the fixture over
**material only**, ignoring every delimiter (§D.5)" — unchanged, and still the right rule.

**The one clause I could falsify on disk, and one I could not.** F-01's "all three unexercised" is
falsified above. Everything else the delta asserts about HEAD holds: the two landing commits exist,
`renderSection` hardcodes `## ` and takes no level parameter, no caller passes `ordinal` or `gloss`,
REQ's `maxDocuments` default is 5, and FSPEC's Step 5 items 15/16 are ordered as ERR-8 describes.

**The changelog's own arithmetic.** The 0.5 row's "four stale version pins" is corrected to "three",
with the justification that the 0.1 changelog row is a historical record that correctly keeps the pins
it was written against. Counting on the page: `:36`, `:152` and `:275` are the three live pins reading
FSPEC v0.13 / TSPEC v0.9; `:599` is the 0.1 historical row reading FSPEC v0.10 / TSPEC v0.6. Three is
right, four was an overcount, and correcting a historical changelog row's arithmetic in place (with
the correction annotated) rather than silently is the honest form.

---

**An implementation defect found while grounding LI-16's claim — not a defect of this document.**

I verified LI-16's new sentence against the shipped code as well as against TSPEC, because LI-16 has
already landed (`d462ddd8`). TSPEC and this PLAN agree; the code does not.

- `pdlc/workflows/orchestrate-dev.js:2306-2309` implements the short-circuit exactly as specified:
  `if (typeof maxBytes !== "number" || maxBytes <= 0) return { material: "", bounded: false, bytes: 0,
  sections: [] };`. That half is correct.
- `pdlc/workflows/orchestrate-dev.js:2367-2374` implements the drop as
  `if (extraction.sections.length === 0 && hasAnySectionHeadingLine(entry.text))`, with a comment
  reading "A document with no section headings at all is not this case — it is simply a zero-material
  eligible document." `hasAnySectionHeadingLine` (`:2276-2278`) tests `SECTION_HEADING_RE` (`:2242`),
  which matches **any** level-2 heading, not a BR-6 name.

That second conjunct is precisely the "second branch" TSPEC §D.5 `:1017` forbids ("There is no second
branch and no zero-bound special case in the selector"), and it changes behaviour: a LEARNINGS document
carrying **no** `##` heading at all carries none of BR-6's priority sections, so FSPEC E-33
(`FSPEC-…md:762`) and TSPEC `:907` both require `RSN-NO-MATERIAL` consuming no slot. At HEAD it is
instead made eligible with zero material and **burns a `maxDocuments` slot**.

No landed test catches it, and the reason is worth recording: `learningsSelect.test.js:375`, the AT-28
fixture, is `{ name: "Not A BR-6 Section", body: … }` — a document that *does* carry a `##` heading, so
it takes the same path under both readings. The oracle is green against a divergent implementation.
The falsifying test that is missing is one AT-28 case whose document carries no `##` heading at all,
asserting `RSN-NO-MATERIAL` **and** that a later-ordered document still occupies the slot it did not
consume.

This is out of scope as a blocking finding here: it is not a defect this PLAN's delta introduced, and
this document's claim is the *correct* one. It is carried as a `DEFERRED:` line and surfaced in my
final message so the orchestrator can route it to the implementation phase.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | LI-08's amendment note claims `renderSection` "accepts `ordinal`, `gloss` and a free-form `body`, **all three unexercised by any landed suite**". False for `body` at HEAD: `pdlc/workflows/__tests__/learningsBlock.test.js:77-82` passes `body:` on all six section specs and `pdlc/workflows/__tests__/learningsSelect.test.js:375` passes `{ name: "Not A BR-6 Section", body: "Nothing here BR-6 recognises." }`. The clause's conclusion is unaffected — the amendment still adds callers rather than knobs, and in fact adds fewer than claimed, since the `###`-as-body case reuses a knob that is not merely present but already exercised. **Fix:** "…`ordinal` and `gloss`, both unexercised by any landed suite, and a free-form `body` the landed suites already use" | §Batches → LI-08, amendment note (v0.7) |
| F-02 | Medium | Local | *(carried from round 9, unaddressed — this revision was scoped to round 8.)* The "Amendment commits on landed suites (P-A-7)" paragraph's generic title and its "carry **no** row of their own in either case" closing sentence read as a ruling over `learningsBlock.test.js` / `learningsSelect.test.js` generally, while its scope is the heading-form fixture knob alone. PROPERTIES §C.4 routes a second live P-A-7 re-red on those same landed files (PROP-BOUND-05/07/08 and the Group D amendments) to this PLAN for row-naming; those rows are unnamed here. **Fix:** qualify the closing sentence to "across *this* follow-up commit", and add a case row once the PROPERTIES erratum returns | §The three gate wordings → Amendment commits on landed suites |
| F-03 | Low | Local | *(carried from round 9, unaddressed.)* Case A's window is "before batch 7" but its justification cites only the batches 7–8 whole-suite ledger rows and the batch-9 drop. A commit landing in batches 2–6 is inside the window and those batches carry no ledger. The "no row" outcome is correct but the reader must derive the silence. **Fix:** one clause — "and in batches 2–6 no ledger exists to amend, since the ledger's universe begins at batch 7" | §The three gate wordings → Amendment commits on landed suites, Case A |

**Deferred under decision freeze** (recorded, not decided, not gating):

DEFERRED: Landed `selectLearnings` (`pdlc/workflows/orchestrate-dev.js:2367`) gates the `RSN-NO-MATERIAL` drop on `extraction.sections.length === 0 && hasAnySectionHeadingLine(entry.text)` — the second branch TSPEC §D.5:1017 forbids; a document with no `##` heading at all is E-33 (FSPEC:762) but at HEAD becomes eligible with zero material and burns a `maxDocuments` slot. This PLAN's LI-16 row states the rule correctly; the implementation diverges from it.

DEFERRED: AT-28's landed oracle (`learningsSelect.test.js:375`) uses a document that *does* carry a `##` heading, so it is green against the divergence above; the missing case is a headingless document asserting `RSN-NO-MATERIAL` plus a positive assertion that a later-ordered document still occupies the unconsumed slot.

DEFERRED: The `Status` column is behind on twelve rows (LI-14…LI-20 have landed at `960c229c`…`c261941e` but read ⬚, while LI-21 reads 🟢). v0.7 now explains the column is the dispatcher's, so this is bookkeeping lag rather than a document defect — worth a single dispatcher reconciliation pass before ship.

## Questions

| ID | Question |
|----|---------|
| Q-01 | LI-12's new precondition says "≥ 6 documents **unless the case declares a smaller `maxDocuments`**". If the case does declare a smaller bound, the precondition becomes "more than that bound" — is the intent that the implementer picks one form, or that the ≥ 6 default form is the one `LI-AT-30`'s third case actually ships? A single sentence naming the shipped form would remove the choice. Non-blocking; the invariant is stated correctly either way. |

## Positive Observations

- **The delta fixed a would-be vacuous oracle before it was written.** LI-12's conjunct (iii) is the
  conjunct that kills the slot-burning mutant, and without a corpus larger than `maxDocuments` it
  passes against that mutant for free. Naming the precondition in the task row — where the implementer
  reads it — rather than trusting them to derive it is exactly the "a test that can only pass is not
  yet a test" discipline, applied at PLAN altitude where it is cheapest.
- **The two additions are load-bearing on each other, and both landed in the same revision.** LI-16's
  ordering rule and LI-12's fixture precondition only discriminate TSPEC's ordering from FSPEC Step 5's
  when both are in force. A revision that landed one would have shipped an oracle that cannot see the
  defect it names.
- **The `Status` contradiction was resolved by distinguishing two records, not by editing a column the
  author does not own.** "File existence is a fact about HEAD, `Status` is a fact about the wave's
  bookkeeping" is the right resolution of my round-8 F-01 — it removes the contradiction without the
  PLAN's author writing the dispatcher's ledger.
- **ERR-8 is recorded with its consequence computed, not just flagged.** The row does the work: it
  states which rule the PLAN's rows encode, names the oracle that reds under the wrong ordering, and
  concludes "no task moves" so a delta confirmation against a corrected FSPEC finds nothing owed. A
  bare "FSPEC has an ordering bug" would have left that derivation to the next reviewer.
- **The changelog corrected its own past arithmetic in place and annotated it.** "four" → "three" with
  the reason (the 0.1 row is a historical record that correctly keeps its original pins) is a small
  thing done honestly; silently editing a historical row, or leaving the overcount, would both have
  been worse.
- **The delta stayed inside its scope.** Seven hunks, two of them a version cell and a changelog row.
  No task moved batch, no `Deps` edge changed, no AT partition or manifest row was touched — and I
  confirmed that from the diff and from a full re-derivation of all twenty-two batch values, not from
  the changelog's claim of it.

## Recommendation

## Verdict
