# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.6)
**Date:** 2026-08-20
**Iteration:** 9 (delta confirmation of the v0.6 erratum)

## Overview

**What this round is.** I approved this PLAN at v0.5 (round 8, two Low findings, no High). A targeted
erratum has since landed — `748659c0`, `92e5d178`, `6a2d3007` — taking the document to v0.6. The
question is narrow: does the delta land the one routed item (three reviewers, one substance — LI-08's
v0.5 amendment note assigned the heading-form follow-up to the landed suites' existing owners without
naming the expected-red rows P-A-7 requires be committed before the run they govern), and is the
document still a faithful compression of upstream at HEAD?

**The delta, measured.** `git diff 9f87235e..HEAD -- PLAN-…md` is 23 insertions, 2 deletions across
four hunks: the version cell (0.5 → 0.6), one clause added mid-row to LI-08, a new
**Amendment commits on landed suites (P-A-7)** paragraph with a two-case table in
§The three gate wordings, and the v0.6 changelog row. No task row moved batch, no `Deps` edge moved,
no AT partition, fixture or file-ownership row was touched — and I re-derived that from the diff
rather than from the changelog's claim of it.

**Upstream, re-read at HEAD.** The four dispatch hashes match the files on disk byte for byte
(`shasum -a 256`: REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`), and
their version cells still read REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 / DECISIONS v0.3 — the same four
versions this PLAN pins at `:11`, `:36`, `:275`. Upstream has not moved since round 8, so the
faithful-compression verification I did there still holds for the unchanged bytes; what needed fresh
checking is the new paragraph, and I checked its claims against the ledger, against TSPEC §D.3, and
against the landed helper on disk.

**Result.** The item lands, and lands as a mechanically evaluable rule rather than as prose. Two
non-gating findings: one Medium about a second P-A-7 case on the *same* landed suites that this
paragraph's generic title and closing sentence invite a reader to consider covered, and one Low about
Case A's justification being stated only for the batches that have a ledger. No High.

## Batches

Exactly one task row changed, and it changed by one clause.

**LI-08 (RED block/material suite, batch 3) — the note now points somewhere enforceable.** The v0.5
sentence ended at "Ownership does not move, so the single-writer manifest is unchanged". v0.6 adds:
"and the expected-red rows that follow-up commit owes are named in §The three gate wordings under
**Amendment commits on landed suites**, which is what P-A-7 requires be committed before the run it
governs (v0.6 erratum)". That is the correct repair shape for the routed item. P-A-7's own words are
"a live table is amended by an edit to this PLAN, committed before the run it governs" (`P-A-7`, the
open-questions table) — the naming had to land *in this document*, not in a completion note, and it
did. The cross-reference is a section-title-plus-bold-paragraph anchor, not a raw `file:line`, so it
is a citation DEC-DOC-01 accepts.

**Nothing else in the task table moved.** `git diff` touches no other row: `[Fake first]` ordering,
the red-before-green pairing for every implementation task, the single-writer file manifest and the
same-batch same-new-file guard are byte-identical to the v0.5 bytes I approved. LI-12's three-case
`LI-AT-30` oracle — v7's High, resolved at v0.5 — is untouched, and its three conjuncts still read
key-present / reject-rows set-equal / no `RSN-COUNT`.

**The heading-form cases are still the right red.** Re-read against TSPEC at HEAD rather than
re-derived from my own round-8 notes: §D.3 states the second rule (exactly two `#`, optional ordinal
stripped and discarded, optional trailing gloss, otherwise exact case-sensitive comparison against
`BR6_SECTION_NAMES`) and names the token-overlap hazard the near-miss must defeat —
`## Cross-Feature Findings` would match `Cross-Feature Patterns` and `## Process Findings` would match
`Process Learnings` under a widened matcher (`TSPEC §D.3`, the `SECTION_HEADING_RE` discussion). LI-08's
fixture picks `## Process Findings` as its non-matching near-miss, which is that exact hazard. The
compression is faithful; the erratum did not disturb it.

**The `Status` cell contradiction I filed as v8 F-01 is still on the page.** LI-02 and LI-08 read `⬚`
while the amendment note says both "have already landed on this branch" — and PROPERTIES §C.4 at HEAD
independently confirms the landing ("Seven of the fourteen files have landed. The tasks committed so
far are LI-01…LI-04, LI-07, LI-08, LI-09 and LI-13"). It was Low then and it is Low now; this erratum
was not scoped to it, so I do not re-file it as a finding of this round beyond noting it stands.

## Dependencies

**Batch DAG — unchanged, and re-derived rather than assumed.** The delta adds no task, no file and no
edge. LI-08 stays batch 3 on dep LI-02 (batch 2): `max(2) + 1 = 3` ✓. LI-02 stays batch 2 on LI-01
(batch 1) ✓. LI-17, the task the new paragraph's Case A leans on, stays batch 9, and the ledger's
batch-9 row is still `Landed by LI-17` ✓. No id was added, so uniqueness and acyclicity are
preserved by construction.

**The follow-up commit is not a task, and the paragraph is careful about that.** It creates no row in
the task table, so it consumes no batch and adds no edge. That is the right modelling: the work is an
amendment to two already-landed files taken by their existing owners, and turning it into a task
would have moved the single-writer manifest, which is precisely what LI-08's note promises it does
not do. What P-A-7 demands instead is that the *live table* — the ledger — carry its consequence, and
that is the demand the delta satisfies.

**Case A's arithmetic checks against the ledger as written.** Case A claims that a commit landing
before batch 7 adds no row because `learningsBlock` is already ledgered as a **whole suite** red after
batches 7 and 8 and drops entire at batch 9. I read the ledger rather than the claim: the batch-7 row
lists `learningsSelect, learningsBlock, learningsCorpus, learningsRecord, learningsDispatchSet,
learningsConfig, learningsArmInventory (whole suites)`; the batch-8 row still carries `learningsBlock`
unqualified; the batch-9 row (`Landed by LI-17`) lists `LI-AT-15; learningsCorpus, learningsRecord,
learningsDispatchSet, learningsConfig, learningsArmInventory` — `learningsBlock` is gone. Whole-suite
red subsumes the heading-form cases, so the row-set genuinely is empty, and the "none may be dropped
early" clause preserves the ledger's shrink-by-exactly-what-the-batch-greens property. The arithmetic
is right.

**Case B is the case that had to be stated, and it is stated in the gate's own grammar.** A commit
landing at batch 9 or later re-reds committed green code, and the ledger then gains
`learningsBlock` → `LI-AT-11`'s heading-form cases only, for every batch from the landing batch through
the batch that greens them, **stated in test names, not the suite name** — the same discipline the
existing split rows use (`learningsSelect` → `LI-AT-15` only; `learningsRecord` → `LI-AT-22` locus 2).
That matters mechanically: the batches 7–13 gate reads "every suite still listed in that batch's
ledger row is red for its specified reason", and "`learningsBlock` is partly red" is not a predicate a
dispatcher can evaluate. Case B also states the failure mode explicitly — "a re-red landing without it
is a gate failure, not a red" — which is P-A-3's bar restated at the point of use.

## Verification

## Positive Observations

## Delta-Confirmation Findings

## Verdict
