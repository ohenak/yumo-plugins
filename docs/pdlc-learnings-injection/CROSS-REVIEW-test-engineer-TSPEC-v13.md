# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.8)
**Upstream measured against:** FSPEC v0.13 (`sha256:ae75fa62…86a1d`), REQ v0.9 (`sha256:ff605dd3…e84dd`) — both verified byte-for-byte at HEAD
**Erratum range:** `d2ab13bb..4e16392d` (9 commits)
**Date:** 2026-08-20
**Iteration:** 13 (delta confirmation)

## Overview

Both routed items landed, and they landed with the measurement behind them rather than a bare
rule. §D.3 is retitled *The two heading-recognition rules (discharges F-O-1, both halves)* and
gains `BR6_SECTION_NAMES`, `SECTION_HEADING_RE`, `GLOSS_RE`, the three matching rules, the section
extent, and the duplicate/absence rule; the §T.6 obligations table restates F-O-1 as **both** rules
and names where each is discharged. The pm-review item ("the recognition rule for BR-6's five
priority headings is unspecified") and the te-author item ("the section matcher is specified
nowhere") are both discharged in the section upstream assigns them to.

I re-measured the erratum's factual claims rather than reading them:

- **Upstream identity.** Both dispatch shas match the files at HEAD exactly. FSPEC's header reads
  v0.13; the TSPEC header's upstream pin now reads v0.13 (v12 F-09 closed), and the five passages
  that pinned "FSPEC v0.9" now cite BR-9/BR-10/E-21…E-34 with a verbatim-unchanged note.
- **F-O-1's widening.** FSPEC:1009 assigns TSPEC "two heading-recognition rules … the predicate for
  'presents as a LEARNINGS document' (BR-3), **and** the rule by which a heading counts as one of
  BR-6's named sections", and BR-6 defers "which heading forms count as which section is F-O-1's,
  not text to be matched literally from here". §D.3 now answers exactly that, and answers it in
  full — the ordinal, the gloss, the case rule, the extent, duplicates, absences.
- **§D.3's corpus measurement.** I re-ran §I.1's own glob and counted the level-2 headings across
  all 9 documents. The claim is exact: 9 of 9 write `## 1. Non-Convergences`,
  `## 2. Cross-Feature Patterns`, `## 3. Rejected Proposals (with rationale)`,
  `## 4. Process Learnings`, `## 5. Open Items for Consolidation`; 7 add `## 6. Approval Record`;
  `docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md` carries the one deviation,
  `## 6. Phase PUB Retroactive Cross-Review (2026-06-24)`, exactly as §D.3 says. The load-bearing
  observation — that the documents' own ordinals put Cross-Feature Patterns **second** while BR-6
  ranks it **first**, so priority may never be read off the heading — is true of all 9 and is the
  single most valuable thing this delta adds: it names a real inversion bug before anyone writes
  the matcher.
- **The zero-bound absorption.** FSPEC:497 ("Where the bound is **zero**, no material is
  admissible … dropped before the total bound with `RSN-NO-MATERIAL` (BR-9) and consumes no slot"),
  E-36 and AT-30's third clause are all present upstream and are compressed faithfully into §I.2,
  §I.3, §D.5, §T.6 and T-O-6.
- **AT-02's fourth shape.** FSPEC:812 enumerates four fixtures, the fourth being "a run containing
  an authoring-classified dispatch whose target is none of the six C-1 document types — so
  reverting BR-1's second conjunct reds this test". §T.6 now carries it, names
  `learningsDispatchSet.test.js` as sole owner, and states the mutation oracle. v12 F-05 closed.

Every one of my v12 findings is discharged: F-01 (§T.6's `RSN-NO-MATERIAL` arm restated over
*yields no material*), F-02 (§D.3's second rule), F-03 (AT-30 is three zeros, with E-36's per-row
oracle), F-04 (`bounded` at a zero bound decided `false`), F-05 (AT-02's fourth fixture and owner),
F-06 (`present` removed), F-07/F-08 (the stale `converge()` and seam line anchors replaced by
symbol citations — I re-checked the anchors that remain, and `parseAdvisoryConfig:1980-1983`,
`dispatchAndVerify:8862`, the PLAN-lint clause at `:8972-8978`, `rtCachePut:459-465`,
`rtReadFile:494` and `LS_FILES_ARGV:1338-1346` all land on the cited code at HEAD), F-09 (header
pin).

One divergence from upstream survives the round and is sharpened by it rather than caused by it:
§I.3 points **AT-11's** section-set equality at the `sections[]` return field, where FSPEC states
that equality over "the set of section names appearing **in its block material**", with an
Approval-Record-absence conjunct the TSPEC carries nowhere. That is F-01 below, tagged
`inherited` — it was in the pre-round bytes and does not ask FSPEC to move.

## Architecture

**What the delta moved, structurally.** The erratum did one thing of architectural consequence
beyond the two routed items: it moved the `RSN-NO-MATERIAL` drop from a *structural* test (the
document carries none of `BR6_SECTION_NAMES`) to an *outcome* test (extraction returns
`sections: []`), and put that drop **before** the count and total bounds. §D.5 states this
explicitly — "one branch covering both of BR-9's disjuncts, the structural one (E-33) and the zero
per-document bound (E-36) … there is no second branch and no zero-bound special case in the
selector."

I read that as the right compression, and it is what BR-9's catalogue entry at FSPEC:560 now says
("Eligible, but yields no material — it carries none of BR-6's priority sections, **or** the
per-document bound is zero and admits none") and what D-12 asks ("Does the document yield any
material?"). It also collapses what would otherwise be two branches whose difference no fixture can
observe. Worth recording for the implementer, since the two documents now sequence the work
differently: FSPEC's **Step 5** procedure still drops on the structural condition at item 15 and
performs extraction at item 16, *after* the count bound has been applied, so a reader implementing
Step 5 literally would extract only the `maxDocuments` documents that survived the count cut and
would never observe the zero-bound drop for the rest. TSPEC's rule requires extraction for every
eligible document before the count bound binds. **The observable outcomes are identical** — at any
non-zero bound "yields no material" and "carries no BR-6 heading" are the same predicate, and at a
zero bound BR-6/E-36 explicitly demand the no-slot behaviour Step 5's ordering could not produce —
so this is not a behavioural divergence and I am not gating on it. It is a sequencing gap in
upstream's procedural prose that the PLAN author will trip over; F-03 records it at Low.

**The obligation ledger is now self-consistent.** The §T.6 obligations table's F-O-1 row names both
rules and both discharge sites (`LEARNINGS_HEADING_RE`; `BR6_SECTION_NAMES` + ordinal + gloss +
exact), and §D.3's heading advertises "both halves". The failure mode v12 F-02 named — an
obligation recorded as discharged by a section that discharges half of it — is closed on both
sides, so a downstream reader auditing the table against the section cannot be misled.

**Nothing previously approved is broken by the delta.** I re-read the sections the erratum touched
against their pre-round bytes: §I.2's `parseLearningsConfig` divergence table (the `present` column
collapses to "identical", and `sectionMalformed`'s "true only when the section **is** present"
sentence preserves the AC-5.1a distinction the field was carrying), §D.5's byte-accounting pools
(unchanged — the erratum only re-grounds them on BR-6's now-explicit basis), §T.5's suite/AT
inventory (still 2+9+3+3+6+12 = 35, and I recounted it), and ERR-4/ERR-6's closure prose. No
oracle that was falsifiable before this round is weaker after it.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
