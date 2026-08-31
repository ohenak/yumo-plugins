# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.8)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.7 (sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862)
**Date:** 2026-08-31
**Iteration:** 12 (delta confirmation)

## Overview

This is a **delta confirmation**, not a fresh review. I approved this FSPEC at v11. The erratum
edit under confirmation is commit `311910dce` — 11 insertions, 2 deletions, confined to the
document's metadata block and history preamble:

1. `Upstream` pin corrected `REQ-pdlc-stats.md` (v1.4) -> (v1.7).
2. Version row `1.7` -> `1.8`.
3. A new erratum paragraph recording that the routed REQ-STATS-06 / BR-16 conflict was **absorbed**
   upstream — REQ v1.7 withdrew the offending clause and decided the case BR-16's way — so no rule
   text in this FSPEC changed.

No business rule, behavioural flow, edge case, acceptance test or open-question row was touched.
The dispatch reported every routed item ABSORBED against upstream HEAD, and the diff is consistent
with that report: it is a re-grounding record, not a rule edit.

Per DEC-ERR-03 my scope is this FSPEC measured against **REQ v1.7 as it now reads**, not against
the item list. I therefore re-read the upstream clauses this document leans on at their current
version and re-verified the shipped-corpus facts BR-16 cites, rather than only diffing the delta.
Upstream hash verified locally: `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` returns
`f75c348f…7a8862`, matching the dispatch pin exactly.

## Linked Requirements

Upstream re-verification against REQ v1.7 at HEAD. I re-read each REQ clause this FSPEC compresses
and diffed it against the FSPEC text that carries it.

| Upstream clause (REQ v1.7) | What it now says | FSPEC carrier | Faithful? |
|---|---|---|---|
| REQ-STATS-06, harvested predicate | `LEARNINGS-{feature}.md` present **and at least one** of the two review families entirely absent -> `harvested`, not measured | BR-16 | Yes |
| REQ-STATS-06, out-of-catalogue basename | A basename the driver's catalogue does not recognise "contributes no process bytes and counts as no file of its family remaining"; a feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested** | BR-16, sentences 2–3 | Yes — the survivor reading is gone from both sides |
| REQ-STATS-06, zero denominator | spec bytes zero -> not-available, never divide-by-zero or crash | BR-15 (`n/a`) | Yes |
| REQ C-3 (spec set, fixed) | six document types, not operator-configurable | BR-14, spec side | Yes, enumeration matches member for member |
| REQ C-4 (process set, fixed) | three basename grammars, not operator-configurable | BR-14, process side | Yes |
| REQ-STATS-05 (as amended v1.6) | no post-mortem file -> halts report `0`; **no harvested halt state** (NG-6); R-6 records the conflation as accepted residual | BR-13 ("empty halt set"), EC-03, §4.4 (`halts` is the exception, needs no `state` field) | Yes |
| REQ-STATS-02 | JSON top-level set-equal to REQ-STATS-01's set plus one schema-version field; malformed / unmeasurable / harvested ride **inside** a metric's value, never as extra top-level keys | §4.4 five-key enumeration `schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio` | Yes |
| REQ-STATS-04 | DoD harvested condition | BR-11 | Yes |

The pin jump v1.4 -> v1.7 crosses three upstream revisions, so I did not take the erratum note's
"no rule changed" on trust — I checked the two intervening REQ commits that could have stranded
this document:

- **REQ v1.5** (`af78b8c4e`) dropped the residual "two harvest-deleted families" premise in
  REQ-STATS-06, leaving "at least one of the two". BR-16 already reads "at least one of the two
  harvest-deleted process families is entirely absent" — aligned, not stranded.
- **REQ v1.5 -> v1.6** (`9317412b1` then `1847dd9c0`) added a harvested halt state and then
  withdrew it, restoring measured `0`. Net zero against this FSPEC: BR-13 and EC-03 never adopted
  the intermediate state, so the withdrawal leaves them correct rather than stale.

That is the material risk in a three-version pin jump, and it is clean. The stale-pin correction is
therefore a genuine record fix: the document's *bytes* were already grounded on the current upstream
reading; only its declared pin lagged.

## Behavioral Flow

Untouched by the delta. §3.1's step sequence and §3.2's step table carry no byte of this edit, and
nothing in REQ v1.7 moved under them.

The one step that could have been disturbed is **A8** ("Compute process-to-spec byte ratio
(BR-14…BR-16)"), because its decision column is the flow-level restatement of the clause REQ v1.7
decided. It reads: *either process family entirely absent alongside `LEARNINGS-{feature}.md`? spec
total zero?* -> `harvested`, `n/a`, or a rendered ratio, with harvested checked before the
zero-denominator test. That ordering is exactly BR-16's precedence and exactly REQ-STATS-06's, and
the out-of-catalogue case reaches it through the same predicate rather than a parallel branch. No
drift.

Step **A7** (halts) still reads "No files -> an empty halt set, not an error", which is REQ-STATS-05
as amended at v1.6. The flow never encoded the withdrawn harvested halt state, so it needed no edit
and got none.

Implementability is unchanged from my v11 approval: the ratio step remains a pure function of one
directory listing plus per-file sizes, with no ordering dependency on any other metric, and the
harvested predicate is evaluated over the same file set the numerator sums — one traversal, one
classification pass. That single-pass property is what makes BR-16's "the two never disagree"
claim cheap to hold in code rather than an invariant someone must remember to maintain.

## Business Rules

This is where the routed conflict lived, so I read BR-14, BR-15 and BR-16 in full against REQ v1.7
rather than diffing them (the diff is empty — that is the claim under test).

**BR-16 is now consistent with upstream on all three of its sentences.** It states the harvested
condition ("at least one of the two harvest-deleted process families is entirely absent"), then the
co-evaluation guarantee ("evaluated over exactly the file set BR-14's numerator sums, so the two
never disagree: a basename failing a grammar contributes no bytes to the process side and counts as
no file remaining"), then the worked case (a directory whose only `CROSS-REVIEW-` basenames are the
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form reports `harvested`, not a measured
ratio). REQ v1.7's REQ-STATS-06 now says the same thing in the same direction. The contradiction
that motivated this erratum — upstream calling that basename a survivor while BR-16 called the
family gone — no longer exists in either document. Absorbed, correctly, and this FSPEC needed no
rule change to absorb it: it was the side upstream moved toward.

**BR-14's enumerations still match C-3 and C-4 member for member.** Six spec basenames, three
process grammars, both tagged fixed-by-REQ and not operator-configurable. I diffed the lists
literally; no member added, dropped, or respelled on either side.

**BR-15's `n/a` token and two-decimal rendering** are FSPEC-owned (REQ O-1 defers precision and
token spellings here), so upstream has nothing to contradict. The precedence relative to BR-16 —
harvested tested before the zero denominator — is asserted in BR-16, EC-13 and step A8 alike, which
is the redundancy I asked for in an earlier round and it survived this edit intact.

**BR-11 (DoD harvested)** and **BR-13 (no halts is zero halts)** are the two rules most exposed to
the v1.5/v1.6 upstream churn. Both read correctly against REQ v1.7: BR-11's condition is
REQ-STATS-04's, and BR-13 reports an empty halt set with no harvested alternative, which is
REQ-STATS-05 after v1.6's withdrawal.

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
