# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.7)
**Date:** 2026-08-11
**Iteration:** 8 (erratum delta confirmation, not a re-review)

**Scope:** the Phase-T erratum round only — `git diff b4f1a921^..b4f1a921` on
`docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md`, one item raised by four reviewers with
one subject: BR-START-1's "no probe of any kind ... while the ladder is running" (§4.1) literally
contradicted BR-GUARD-6's rung-4a requirement to observe interpreter availability **by running** a
candidate (§9.1); the intended scope was *billable* probes and the qualifier was never added when
rung 4a was inserted. One question is under review: does the delta resolve that item without
disturbing anything previously approved? Text outside the diff was re-checked for disturbance
only, never re-argued.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The same unqualified claim survives in §15.2's cost table, which is the table an AT reads.** BR-START-1 is now correct, but §15.2's row still reads `startup ladder rung 1–4 \| plugin reads only, zero tokens` (`FSPEC:1432`). Rung 4a executes a subprocess on the host, so "plugin reads only" is false there in exactly the way "no probe of any kind" was false in §4.1, and the range "1–4" does not name 4a at all — a reader deriving the cost of a rung-4a refusal (EC-START-10, exit `1`) finds no row for it. This matters more than a prose slip because **AT-ENG-X2 quantifies over this table**: "across every refusal path in §15.2 that is marked *zero tokens*, assert that no dispatch was attempted at all" (`FSPEC:1597-1598`). A row that does not exist is a refusal path the property does not cover, so rung 4a's zero-spend guarantee — the one the erratum was about — is the one startup refusal AT-ENG-X2 currently skips. Fix is one row edit: retitle to `rung 1–4a` and replace "plugin reads only" with "plugin reads plus rung 4a's local interpreter execution; no billable probe" | §15.2 (`:1432`), AT-ENG-X2 (`:1597`) |
| F-02 | Low | Local | **§15.1's ladder enumeration was not swept for 4a either.** Step 2 spells the ladder out longhand — "plugin resolved → manifest read → version handshake → skill prompts readable → billing posture" (`FSPEC:1415`) — with no rung 4a between the fourth and fifth arrows. Same family as v7's F-03 (§4.6 AT-ENG-06's "rungs 1–5", still unswept), different location: both are written-out enumerations that predate the rung and silently drop it. No behaviour is misstated, and no test reads §15.1, so this is Low; worth folding into the same pass as F-01 rather than opening a round of its own | §15.1 step 2 (`:1415`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. The delta answers the round's one item in full. F-01 needs an edit, not an answer, and does not block TSPEC work against the text as written |

## Positive Observations

- **The fix repairs the contradiction at its root, not at its symptom.** The cheap edit here was to
  soften BR-GUARD-6's "by **running** a candidate" into something vaguer and let the two clauses
  stop colliding. The author did the opposite: BR-GUARD-6 is byte-identical (verified — the delta
  is two hunks, neither inside §9.1), and BR-START-1 gained the qualifier its own justification
  already implied. The rule that was wrong is the rule that changed.
- **The added sentence draws a testable line, not a hedge.** "Local checks the ladder performs on
  the host's own bytes are not probes in this sense and are not dispatches — rung 4a observes
  interpreter availability by running a candidate (BR-GUARD-6), which bills nothing"
  (`FSPEC:311-313`). Two separable predicates for a test author: *not billable* and *not a
  dispatch*. That second half is load-bearing and easy to have omitted — without it, AT-ENG-X2's
  oracle ("no dispatch was attempted at all", `:1598`) would have been ambiguous the moment rung 4a
  spawns a subprocess, and a test author would have had to guess whether a local `python3 -c` run
  counts. The clause decides it in the document instead of in someone's fixture.
- **Scope discipline held.** `git diff --stat` on the delta is 14 insertions, 4 deletions, one
  file, two hunks: the version header plus change note, and BR-START-1's paragraph. No rung
  renumbered, no EC, AT, BR or AC text touched, nothing deleted. The v7 findings' subjects
  (AT-ENG-11a's table placement, BR-GUARD-6's set-fidelity oracle) are untouched and remain
  non-blocking, as filed.
- **The change note states a verifiable claim and it verifies.** "BR-GUARD-6 is byte-identical;
  rung 4a's row, EC-START-10/11 and AT-ENG-11a are unchanged. No decision is reopened"
  (`:22-24`) — checked against the diff rather than taken on trust, and true in all four parts.
  A change note that can be falsified by `git diff` and isn't is worth more than a longer one.
- **No test in §9 or §14 needs rewriting because of this edit.** AT-ENG-11a's two fixtures (refusal
  when no candidate runs; pass when a later candidate runs behind a present-but-not-runnable one)
  are unaffected: they always asserted local execution behaviour, and the erratum only makes the
  billing rule agree with them. The erratum costs the downstream test surface nothing, which is the
  right shape for a one-clause correction.

## Recommendation

**Approved with minor changes**

The erratum resolves the round's one item, and resolves it in the direction that preserves
testability: BR-GUARD-6's observation method — the part a test actually drives — is untouched, and
the billing rule that contradicted it now carries the *billable* qualifier its own "zero tokens
billed" justification always implied. The added sentence goes one step further than the erratum
strictly required by declaring that local checks "are not dispatches", which is what keeps
AT-ENG-X2's oracle unambiguous now that a rung spawns a subprocess. Nothing previously approved was
disturbed: two hunks, no deletions outside the replaced paragraph, no rung renumbered.

One Medium finding, not blocking and not about the delta's substance: §15.2's cost table still
carries the pre-erratum characterisation ("rung 1–4 | plugin reads only"), and because AT-ENG-X2
quantifies over that table's zero-token rows, rung 4a's zero-spend refusal is currently outside the
property's range — a one-row edit closes it. F-02 is the matching enumeration sweep in §15.1. No
High findings, and no settled decision re-litigated.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:4dfe0b85572c696110f14512ccd8c375363d377e2986cbf8fc8b1d01cd46401b
REVIEWED-COMMIT: b4f1a921bd4321df98cd8adce0a12f1ec7c2a63e
