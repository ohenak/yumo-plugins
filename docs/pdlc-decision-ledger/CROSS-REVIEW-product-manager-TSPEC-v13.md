# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.2)
**Date:** 2026-08-30
**Iteration:** 13 (delta re-review, DECISION FREEZE in force)
**Upstream at dispatch:** REQ v1.9, FSPEC v1.3, Baseline v1.2

## Overview

I approved this TSPEC at v0.7, v0.8, v0.9 and v1.0, and returned **Needs revision** at v12 on a
single `inherited` High that lived in `PLAN`, not here. This round re-reviews the v1.2 delta under
DECISION FREEZE.

What I did: re-read my v12 findings; ran `git diff 54b17bf84..HEAD` over the TSPEC (54b17bf84 is the
v1.1 commit v12 measured); read the three delta commits (`d7aee41ec` §4.3, `a3715ae0e` §7.3,
`3a17387d6` changelog); re-read §4.3 and §7.3 whole rather than only the changed cells; re-measured
`PLAN` at HEAD because my v12 High was a claim *about* that document; and verified in the repository
every production symbol the changed prose leans on.

**Scope of the edit.** 70 insertions, 10 deletions, three regions only — the revision-history
changelog, §4.3's framing paragraph, and §7.3's *stated once* paragraph. No AT row, no traceability
row, no corpus literal (6,305 / 10,859 / 12,059 / 441) and no upstream pin moved. Upstream is
byte-unmoved at REQ v1.9 / FSPEC v1.3 / Baseline v1.2, so nothing this TSPEC compresses has drifted
and no `ERRATUM:` is owed upstream. No product decision was re-opened and no acceptance criterion
narrowed, broadened or re-triggered.

**Bottom line up front.** All three of my v12 findings are resolved — F-01 by `PLAN` v0.8 landing at
HEAD, F-02 and F-03 by this delta, both answered better than I asked. Nothing the delta touched
broke anything that worked before. Two Mediums remain, both introduced by this delta and both fixable
in one sentence each: the changelog's disposition of F-01 is stale against `PLAN` at HEAD, and §4.3's
new enforcement rationale claims a guard fires in a case where, as §7.3 specifies it, it does not.
Neither is a blocking finding under the freeze rules — neither breaks prior behavior, and neither
makes a normative claim of this document false. **Approved with minor changes.**

## Architecture

**My v12 F-01 (High, `inherited`) is resolved at HEAD, by the document that owned it.** I re-measured
all six sites I listed at v12 against `PLAN-pdlc-decision-ledger.md` at HEAD, and every one is
corrected:

| v12 site | State at HEAD |
|---|---|
| `PLAN`:19 (revision history) | Replaced by **v0.8**, which names both items still-raised, states "this document is the stale side", and quotes §7.3's correction direction verbatim (`PLAN`:19) |
| v0.7's "rejected resolution" paragraph | Retained but explicitly demoted: "*superseded in part by v0.8: the count and home this entry records were corrected downstream-to-TSPEC-§7.3; retained as history*" (`PLAN`:25) — withdrawn as contract, kept as history, which is exactly the right disposition |
| T-11 | Now reads "**All three are declarations of this task's own test file**", "the **eight** plumbing declarations", "the **fourteen** top-level declarations" (`PLAN`:158) |
| T-18 | Now reads "This task writes **no census constant**… there is no production declaration to add here (v8 PM F-01 / TE F-01; this reverses the v0.7 instruction)" (`PLAN`:164) |
| File-ownership manifest | The census test file is "the sole home of **all three** frozen census lists… never of `orchestrate-dev.js`" (`PLAN`:213); no `orchestrate-dev.js` row claims a census constant (`grep -n "CENSUS_TOKENS"` returns no manifest row for that file) |
| §Definition of Done | six ∪ eight = fourteen, all three constants test-file constants, "none is production code or member of the owned list" (`PLAN`:496–505) |

Three commits did it — `0c3c71d7c` (T-18 instruction removed), `2a13b74a7` (ownership re-assigned to
T-11's test file), `cc386ebae` (DoD bullet). They landed 2026-08-29 09:58–09:59, four minutes after
my v12 file was committed (`ee93f2a08`, 09:55). So the finding was accurate when written and is
closed now; the cascade reached `PLAN` after all. **F-01 is resolved; it is not carried forward.**

**Why I credit the structural shape of the fix.** The erratum was routed here at round 11 and this
document answered it by installing a single-siting rule with a stated correction direction rather
than by re-stating arithmetic. `PLAN` v0.8's revision history quotes that direction sentence back
and uses it as the reason it is the stale side — which is the mechanism working end to end, not just
a coincidence of both documents converging on fourteen. That is the outcome the round-11 edit was
designed for, and it is worth recording that it produced the effect it claimed it would.

## Interfaces

**v12 F-02 (single-siting claim stronger than the mechanism) — resolved, and resolved the honest
way.** §7.3's pin paragraph no longer asserts an absence the file contradicts. It now separates three
kinds of site explicitly (TSPEC:1428–1441):

- **This paragraph is the authority** for the count.
- **The two operand rows are its enumeration** — "subordinate to this paragraph rather than a
  competing statement of it" — which is the correct reading, since the enumeration is what makes
  fourteen checkable at all.
- **The revision history records counts as history of an edit, not as claims about HEAD.**
- What stays forbidden is "a *third* kind of site": an independent restatement in another section or
  a downstream document.

It then adds the resolution rule that was missing: "When this paragraph and an operand row disagree,
this paragraph is right and the row is the defect." I asked for the claim to be softened to what it
holds; the author instead made the mechanism *decidable*, which is strictly better — a reader who
finds two numerals now knows which one to fix without a round trip. I re-grepped every count word in
the file and each occurrence now falls into exactly one of the three sanctioned categories:
`:1387`/`:1388` (operand rows, enumeration), `:31`/`:53` (changelog, history), `:1425` (the
authority). No fourth-kind site exists. **Resolved.**

**TE's round-12 F-01 also landed here and I checked it does not disturb my lens.** The pinned phrase
now reads "six functions ∪ eight constants = fourteen" with the collision against the *Forbidden
token set* row's numerically-identical-but-membership-different partition named inline (TSPEC:1425–
1430). This is a disambiguation of a citation token, not a change of count or membership; the
fourteen and the six/eight memberships are byte-identical to v1.1. No acceptance criterion is
affected.

**Downstream is now consistent with the pinned phrase.** `PLAN`:158 cites "six ∪ eight = fourteen,
cited from §7.3 and not restated elsewhere in this document"; `PLAN`:496–499 states the DoD bullet
"cites it and does not restate it"; `PROPERTIES` carries fourteen at PROP-INV-07 and PROP-INV-11.
All three downstream documents and this one now agree. There is nothing left for the erratum channel
on this axis — which is the substance of F-01 below.

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
