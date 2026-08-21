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

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
