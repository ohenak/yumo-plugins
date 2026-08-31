# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/FSPEC-pdlc-stats.md (v1.4)
**Upstream at dispatch:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.4, sha256:60a516fb2ede…f1c9)
**Date:** 2026-08-31
**Iteration:** 6 (delta confirmation)
**Round type:** erratum delta confirmation — previously approved at v5

## Overview

**Answer to the confirmation question: yes on the routed items, with reservations that are not
gating.** All nine routed items land, and the way they land is the right way: BR-11 and BR-16 now
state their harvested conditions over the *documented basename grammars* rather than bare globs,
which is exactly how REQ v1.4 states them, and AT-12 and AT-17 grew falsifying legs for the two
leftover shapes (`CODE_REVIEW-{feature}-draft.md`, a foreign-feature `CODE_REVIEW-`, and the
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`) that the old wording left undecided. BR-16's
new "evaluated over exactly the file set BR-14's numerator sums" is the sentence that closes the
BR-14/BR-16 disagreement rather than papering over it. BR-25 names the archive root's second loose
file; I verified the archive root holds exactly `REQ-completed.md` and `QUEUE-HISTORY-rows-0-1.md`
and the `docs/` root exactly `PLAN-pdlc-integration-boundary-gates.md`, so the enumeration is now
complete rather than illustrative.

Nothing I previously approved is broken by the delta. No acceptance test became wrong, no traceability
row lost its cover, and no metric's behavior moved.

**The reservations are about fidelity to upstream, not behavior (DEC-ERR-03).** Re-reading REQ v1.4
end to end, the re-grounding this round performed is narrower than its own changelog claims. REQ v1.3
(commit `50dffe8c8`, "nine targeted wording fixes") closed *nine* wording defects, of which this FSPEC
round absorbed only the three harvested-predicate ones. The remaining six were the subject of the
FSPEC's §7.3 errata list, BR-27's narrowing clause, EC-09's departure note and D-9's rationale — and
every one of those passages now describes an upstream that no longer exists:

| FSPEC passage asserts | REQ v1.4 actually says |
|---|---|
| §7.3: C-5 defines no post-mortem-listing classification (High, open) | C-5: "Discovering *which* phases have a post-mortem is carved out … That listing is this REQ's own (REQ-STATS-05)" |
| §7.3: whether the malformed label is intended "is the REQ's to decide" (High, open) | REQ-STATS-03: "one label stands: a third bucket would be an independent rule C-5 forbids", naming `CROSS-REVIEW-{role}-REVIEW-v{N}.md` |
| §7.3 / EC-09 / D-9: REQ-STATS-09's *Given* sweeps in the no-`docs/`-root case | REQ-STATS-09: "in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure" |
| §7.3 / BR-27: REQ-STATS-07 says "reports it by name as missing/malformed" | REQ-STATS-07: "for any feature whose directory cannot be read, reports it by name with the reason … a readable but empty directory is not a gap but a normal row whose metrics report their zero states" |
| §7.3: REQ-STATS-02 over-distributes states; REQ-STATS-08 lost its separators | both repaired in v1.3 |

That is a fidelity defect, not a behavior defect: in every one of these cases the FSPEC's *behavior*
is what the REQ now mandates, so the documents agree and the tests are unaffected. What is wrong is
that the FSPEC still quotes deleted upstream text verbatim (BR-27), still frames its own decisions as
departures from a criterion that has since been carved to match (EC-09, D-9), and still holds two
**High** errata open against a REQ that resolved them. The erratum channel is fail-closed machinery
in this pipeline; leaving two phantom Highs in it is a real cost, and harvest will read them.

All findings are Medium or Low, so this confirmation approves. The `Provenance` split matters here:
the §7.3 rewrite is this round's edit re-affirming staleness (`delta`), while BR-27/EC-09/D-9 carried
it in from the pre-round bytes untouched (`inherited`).

## Linked Requirements

Re-checked at REQ v1.4, not taken from the pre-round bytes.

| Routed item | Where it landed | Faithful to REQ v1.4? |
|---|---|---|
| BR-11 vs REQ-STATS-04 version grammar (pm, se, te) | BR-11 now: "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains (REQ-STATS-04)", plus an explicit leftovers clause | Yes — REQ-STATS-04 line-for-line: "where `LEARNINGS-{feature}.md` is present **and** no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains" |
| BR-16 over `CROSS-REVIEW-*` vs documented grammar (pm, se, te) | BR-16 now names BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` and `CODE_REVIEW-{feature}-v{N}.md` grammars | Yes — REQ-STATS-06 names C-4's grammars identically |
| BR-16 vs BR-14 one-file-set disagreement (pm, se, te) | BR-16: "evaluated over exactly the file set BR-14's numerator sums" | Yes, and it is the right closure: it makes the numerator and the harvested test one predicate |
| Out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` counts as "remaining"? (pm, se, te) | BR-16 says no; AT-17 gained a fourth fixture | Yes — REQ-STATS-03 itself declares those names fail the grammar ("covers the grammatical-but-out-of-catalogue names the pipeline writes"), so "no file matching the grammar remains" is satisfied. This is inherited upstream, not invented here |
| BR-25 second archive-root loose file (se ×2) | BR-25 now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` | Yes, and verified against the tree: the archive root holds exactly those two files |

**Upstream drift check (DEC-ERR-03).** The header pin moved `v1.2 → v1.4` and the changelog says
"re-grounded on REQ v1.4", but only REQ-STATS-04/06's harvested predicates were re-grounded. The other
six v1.3 fixes (C-5's post-mortem-discovery carve-out, REQ-STATS-03's "one label stands",
REQ-STATS-09's *Given* carve-out, REQ-STATS-07's gap/zero-state disposition, REQ-STATS-02's state
attribution, REQ-STATS-08's separators) are unabsorbed. Every §2.1 / §2.2 traceability row still
resolves — no criterion lost its business rule or its acceptance test — so this is a prose-fidelity
gap, not a coverage gap. Findings F-01, F-04, F-05, F-06.

One row I re-derived rather than trusted: §2.2 maps C-5 to "BR-05, BR-06, BR-10, BR-12". C-5 at v1.4
now carves post-mortem *discovery* out of the fidelity rule, and BR-12 already splits discovery
(this command's own match) from resolution tagging (the driver's). The row is still correct at v1.4 —
BR-12 honors what remains of C-5 — so no finding beyond F-06's citation-freshness point.

## Behavioral Flow

Only one flow cell changed: A6's decision point moved from "Any `CODE_REVIEW-*` file present?" to
"Any `CODE_REVIEW-{feature}-v{N}.md` file present?". That is the correct edit — the old cell was the
flow-level restatement of the same over-broad predicate BR-11 carried, and leaving it would have left
an implementer reading the flow table a second, contradicting rule. A8's cell was already phrased over
"either process family", so it needed no edit and got none.

Steps A5–A8's independence claim is unchanged and still holds under the new predicates: BR-11 and
BR-16 each test their own family, so a directory whose cross-reviews are gone and whose DoD reviews
survive still reports `harvested` rows against a measured DoD number. AT-12's new third leg and
AT-17's new fourth leg are both consistent with that independence rather than in tension with it.

No finding in this section.

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
