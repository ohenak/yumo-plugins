# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE)

## Overview

**What changed, and against what base.** The commit I confirmed at v12 (`ba120270`) is no longer an
ancestor of HEAD — the branch was rewritten — so I re-anchored on its content-equivalent, `49595a4b`
("PLAN v0.9 erratum — three-case lead-in, renderSection body claim"), and diffed forward.
`git diff 49595a4b..HEAD` on the PLAN is **8 insertions, 5 deletions across 13 lines and nothing
else**: the version cell (`0.9` → `1.1`), the three cells of P-A-7's case A/B/C table, one new DoD
clause (14), P-A-6's answer cell, and two appended changelog rows (1.0, 1.1). Everything else in the
document is byte-identical to the bytes I approved at v12.

**Verdict up front: my four routed Lows are closed, one stays open, and nothing broke.** Of my five
v12 findings, three were routed and all three landed (F-02 batch-13 gap, F-03 batches 7–8, F-04 case
B's punctuation splice). F-01 (the 0.9 changelog's wrong attribution) and F-05 (the 0.5/0.6 row
inversion) are still open — both are single-word/single-swap items I did not route as gating and do
not gate now. The delta introduced **one** new inaccuracy, a self-quote left stale by the case A
edit, Low. **No High. No Medium. Three Lows.** Approved with minor changes.

**The freeze held.** Nothing in this delta opens a decision. The case-table edits change *domain
boundaries stated in the header cells* so the batch line tiles without a gap — they do not change
what any case rules, and I diffed each ruling clause to confirm the outcome column of cases A and B
is byte-identical apart from the em-dash repair, and case C's outcome column is byte-identical
entire. DoD 14 and the P-A-6 edit are the two substantive additions and both are *disclosures* of
positions already taken elsewhere, not new positions.

**Scope of this pass.** Per the delta protocol I read only the changed regions plus the upstream text
each changed region leans on, and I verified every repository claim the new bytes make — the four
DoD 14 remediations, the dist-freshness claim in the 1.0 row, and the case-C production clauses —
against HEAD source rather than against the changelog's account of them.

## Batches

**No task row moved, and none could have.** The diff touches no line inside §Batches. I extracted the
`Batch`, `Deps`, owner and owned-file columns for all 23 `LI-*` rows at `49595a4b` and at HEAD: byte
identical. LI-08's amendment note — the row the previous erratum rewrote and I verified clause by
clause at v12 — is untouched, so the corrected `renderSection` claim ("two unexercised knobs plus a
`body` the landed suites already use") stands exactly as I approved it. The §File-ownership manifest
is likewise untouched, so single-writer ownership is unchanged.

**The one clause in this delta that makes claims about batch work is DoD 14, and every one of its
claims is true at HEAD.** It names four POSTMORTEM-D remediations carried on this branch with the
test that owns each. I checked all four against the repository rather than the changelog:

- **(a) the erratum restatement retry, "inside `erratumRound`, tested by `erratumProtocol.test.js`'s
  `RT-1g-a…e`".** The suite carries the named arms — `RT-1g-a` at
  `pdlc/workflows/__tests__/erratumProtocol.test.js:1384` ("a non-approving confirmation with zero
  FINDING: lines earns exactly one restatement re-dispatch…") through `RT-1g-e` at line 1495 ("the
  finding-grammar clause names the halting reading instead of promising leniency (POSTMORTEM-D item
  7)"). The named-arm span is real, and `RT-1g-e` names POSTMORTEM-D directly, which is the
  provenance DoD 14 asserts.
- **(b) the rewritten `findingGrammarClause()`.** Defined in `pdlc/workflows/orchestrate-dev.js`, and
  the only other occurrence in the tree is the generated bundle `pdlc/workflows/dist/pdlc-cli.mjs` —
  i.e. it is production code that reaches the shipped artifact, not a test-only helper. The
  dead-config check passes: this is a wired production seam, not a builder with zero callers.
- **(c) `pdlc/hooks/scripts/check-finding-grammar.sh`, "registered as a `PostToolUse: Write|Edit`
  hook in `pdlc/hooks/hooks.json`".** The script exists, and `hooks.json`'s `PostToolUse` matcher
  `Write|Edit` lists it as the third command after `check-scope-field.sh` and `check-req-size.sh` —
  the registration is exactly as described, matcher included. The behavioural suite is real too:
  `pdlc/workflows/__tests__/hookCompatibility.test.js:490` opens
  `describe("CR round 1 (PM F-09): check-finding-grammar.sh behaviour", …)`, the block DoD 14 names.
- **(d) the `## Delta-Confirmation Findings (erratum rounds)` sections in
  `pdlc/skills/{pm,se,te}-review/SKILL.md`.** Present in all three files (four occurrences of the
  heading string in each, i.e. the section plus its in-prose references). Three of three, as claimed.

**DoD 14's scope statement is the right shape, and it is the shape I asked for at CR round 1.** It
says plainly that REQ G-5 ("this feature changes what an author is told, never what the pipeline
requires of what they produce") holds for the injection region and does **not** hold for this branch
as a whole, because (a) changes how many dispatches an erratum round may make. It then does the thing
that keeps this inside the freeze: it records that a PLAN **cannot authorise** that narrowing, routes
the authoritative amendment to REQ as an erratum, and forbids citing (a)–(d) as precedent. A product
decision is not being made in an engineering artifact here; a product decision made elsewhere is
being disclosed, with the correct owner named. It also explicitly does not widen the DoD bar —
clauses 1–13 remain the injection region's bar and (a)–(d) carry their own named tests. I have no
finding against it. (The REQ-side amendment is already routed; I re-emit it below as an ERRATUM so
the record of this round shows it still open, not because this delta introduced it.)

## Dependencies

## Verification

## Findings

## Positive Observations

## Recommendation

## Verdict
