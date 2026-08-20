# Cross-Review: test-engineer — DECISIONS (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.9, `sha256:84deee10…`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v10.md` (Approved, 0 High)
**Delta reviewed:** `8a44b84b` (v1.8 `sha256:25f8e954…` → v1.9 `sha256:84deee10…`), 20 insertions / 3 deletions
**Date:** 2026-08-19
**Iteration:** 11

## Context

This is a delta confirmation, not a re-review. The dispatch routes **no open items** — every item was
reported ABSORBED against upstream at HEAD — so the item-list channel is empty and the whole of this
round's work is the DEC-ERR-03 question: measured against REQ, FSPEC and TSPEC *as they read now*, is
this DECISIONS still a faithful compression, and did `8a44b84b` break anything my v10 approval covered?

**Upstream state, verified by hash rather than trusted from the dispatch.** All three upstream shas
computed at HEAD match the dispatch byte for byte: REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC
`1531143c…`. They are also identical to the three `UPSTREAM-STATE` anchors my v10 recorded. Upstream
has not moved one byte since the confirmation I approved DECISIONS against; the citation-fidelity
sweep I ran in v10 across all 17 `TSPEC` citation sites therefore still stands unmodified, and
re-running it would re-read identical bytes. TSPEC's version cell still reads `1.10`, which is what
DECISIONS' header and four prose sites name.

**What actually changed.** `git diff 25f8e954..84deee10` is confined to the document's header block
and preamble — 20 insertions, three deletions, in two places:

1. **Header** — the `Cross-Reviews` cell gains `CROSS-REVIEW-product-manager-DECISIONS-v9.md` and
   `CROSS-REVIEW-test-engineer-DECISIONS-v9.md`; the version cell moves `1.8` → `1.9`.
2. **Preamble** — the sentence describing the v1.8 relocation loses its integer ("the *twelve*
   already-migrated sites" bullet → "the already-migrated-sites bullet"), and a new paragraph
   **On v1.9 (Phase-P erratum round, TE v9 F-01)** records the two repairs plus the upstream
   re-grounding that preceded them.

Not one byte moved inside `## Context`, `## Options Considered`, `## Decision` (`DEC-A6-01`…
`DEC-A6-04`) or `## Consequences`. The four decision entries remain byte-frozen across their
tenth consecutive round. No design claim, no oracle, no testability surface is in the delta at all,
which bounds this confirmation to two checks: does the delta land what it says it lands, and does
what it *asserts about other documents* hold at those documents' current bytes.

## Options Considered

Three ways to discharge an empty-item-list confirmation were available:

- **Rubber-stamp the empty list.** The dispatch itself forecloses this: items landing is necessary,
  not sufficient, and an empty list means *more* of the burden sits on the DEC-ERR-03 check, not less.
- **Re-run v10's full citation sweep.** Rejected as wasted work once the three upstream hashes were
  confirmed identical to v10's recorded anchors — re-reading identical bytes cannot produce a
  different answer, and the sweep's result is already on the record in v10.
- **Verify the delta's own assertions against their sources, then check that the frozen surface stayed
  frozen** (chosen). The v1.9 paragraph is unusual: it is almost entirely a set of *claims about other
  documents* — about TSPEC's erratum, about what that erratum owed DECISIONS, about what PM v9's two
  findings ask for. Those claims are exactly the class DEC-ERR-03 is about, and none of them is
  self-verifying. Each was checked against the cited file at HEAD.

Executing the chosen reading:

**Claim 1 — the relocated integer is gone from the v1.8 paragraph.** Confirmed: `:30` now reads "the
already-migrated-sites bullet is folded into column (2)". `SIZING-pdlc-advisory-wave-gate.md:83` is
the sole live carrier of the figure ("**twelve**, of which **ten** are oracles red at HEAD and **two**
are green inputs"), exactly as the delta claims. This is the repair TE v9 F-01 asked for, in the
literal wording it proposed.

**Claim 2 — the Cross-Reviews cell records the round-9 reviews.** Confirmed: both v9 filenames exist
on disk and both are now named in the cell.

**Claim 3 — REQ and FSPEC "are unchanged from the state v1.8 was authored against".** Confirmed by
hash against v10's anchors and against the dispatch.

**Claim 4 — TSPEC moved `4a092e85…` → `1531143c…` within v1.10, and its added text sizes
`PROP-SWEEP-2(b)`'s residue in §1.3 and routes partition, owners and figures to PLAN's Overview
HEAD-drift note and A6-00's Edit 1.** Confirmed — this is the same interval I sized in v10, and the
one-sentence compression of it here matches what I read there hunk for hunk, including that the
routing targets are PLAN's Overview note and A6-00 Edit 1 rather than anything DECISIONS owns.

**Claim 5 — "Nothing in that erratum is owed here: DECISIONS carries no hygiene note, no sweep figure
and no disposition of the residue."** This is the load-bearing claim of the absorption and the one a
reader is most likely to take on trust, so I falsified it directly rather than reading it. `grep -n
'PROP-SWEEP\|residue\|hygiene\|\.bak'` over DECISIONS returns exactly two hits, `:45` and `:47`,
both inside the v1.9 paragraph making the claim itself. No sweep figure, no class partition, no `.bak`
count and no disposition appears anywhere else in the document. The no-op absorption is real.

**Claim 6 — PM v9 F-01 asks PLAN to cite the appendix rather than restate column (1)'s count, and
PM v9 F-02 is a harvest item about the missing evidence-appendix artifact class.** Confirmed against
`CROSS-REVIEW-product-manager-DECISIONS-v9.md:49` ("Cheapest fix … PLAN's Overview cite the appendix
number instead of restating it") and `:50` (Low, Process, "the pipeline has no artifact class for
'measurement appendix'"). Both are correctly characterised, and correctly excluded from this
document's edit surface — neither is a DECISIONS change.

**The frozen surface.** `git diff --stat` plus a hunk-by-hunk read confirms no line inside
`## Decision` or `## Consequences` changed. Everything my v9 and v10 approvals rest on is
byte-identical.

## Decision

**The delta resolves what it set out to resolve and breaks nothing I previously approved.** No High,
Medium or Low finding is raised by this confirmation, so no `FINDING:` line is emitted.

Two things I looked at hard and deliberately did **not** file, with the reasoning on the record so the
next round does not have to rediscover it:

**1. The word "twelve" still exists in DECISIONS — at `:36`, inside the v1.9 paragraph, as a
quotation of the text it removed.** My v9 F-01 objected to an integer living in the one document whose
stated purpose is to hold none, on the grounds that it "will read as a current claim to anyone who
does not parse it as a quotation". The narrow version of that objection technically survives the fix:
the number moved from `:30` to `:36` rather than leaving the file.

I am not filing it, and I want the reason to be binding rather than polite. The new instance is
italicised, introduced as what the *previous revision said*, immediately followed by "The integer is
dropped" and by "`SIZING-…` remains the sole carrier of that number". It is a quotation under erasure —
the surrounding sentence tells the reader in the same breath that the figure is not this document's to
carry. More importantly, the remedy has a regress: any edit that strips the quotation must itself be
recorded in an erratum paragraph that describes what was stripped, and the natural way to describe it
is to quote it. This round is the point to stop, and the way to stop is to not file the finding rather
than to file it and mark it wontfix. If a future compaction ever collapses the v1.8/v1.9 preamble
paragraphs into one, the quotation should disappear with them; until then it stays.

**2. The Cross-Reviews cell records rounds 1–9, while round 10 exists on disk.**
`CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v10.md` landed before `8a44b84b` and are not
in the cell. This is a real omission in the narrow sense, but the edit is titled and scoped as the
round-9 erratum, my v10 was an upstream-cascade confirmation against unchanged bytes, and the cell has
never been a gate input — the `APPROVAL-HASH` / `REVIEWED-COMMIT` / `UPSTREAM-STATE` anchors carry the
traceability that matters mechanically. Filing a Low here would buy a metadata edit that immediately
goes stale again the moment this file (v11) is committed. Recorded as Q-01 instead.

Neither observation is a testability defect, and neither touches a decision entry, an oracle, or a
downstream contract.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The Cross-Reviews cell lags reality by one round by construction: any edit that records round N is itself reviewed in round N+1, whose filenames it cannot contain. Is the cell meant to be a complete index (in which case it is permanently one round stale and should say so) or a record of the rounds the *current revision responds to* (in which case v1.9's cell is exactly right and a future reader should not read the gap as an omission)? A one-clause convention note would settle it for every artifact in the pipeline, not just this one. |
| Q-02 | Carried forward unresolved from v10: two byte-distinct TSPECs (`4a092e85…`, `1531143c…`) both answer to the human-readable label "v1.10", and DECISIONS names its upstream by that label in five places. Nothing is wrong downstream today and the sha anchors catch it mechanically, but the label no longer distinguishes what the anchor does. This is the round's best harvest candidate. |

## Consequences

**For this document.** DECISIONS v1.9 is approved against REQ `817b6745…`, FSPEC `82f74a2d…` and
TSPEC `1531143c…`. The approval anchor advances from `sha256:25f8e954…` to `sha256:84deee10…`; the
three `UPSTREAM-STATE` anchors are unchanged from v10 because upstream is unchanged from v10.

**For the testing surface.** Nothing moved. `DEC-A6-01`…`DEC-A6-04` are byte-frozen through ten
rounds, and every property they constrain — the dangling-snapshot capture and restoration oracle, the
`commitPaths`-owned E-6 promotion, the wave-scoped ref name with no run discriminator, and
`waveBudgetPerRun: 0` as a supported affordance validated by `nonNegativeInt` — is unaffected by this
delta. No PROPERTIES entry, no test level assignment and no fixture derived from this document needs
revisiting on account of `8a44b84b`.

**For the erratum machinery.** This round is evidence that the absorbed-item path works as intended:
the upstream erratum genuinely owed DECISIONS nothing, the document said so explicitly rather than
silently, and the claim was falsifiable by grep in one command. A no-op recorded in prose that a
reviewer can check in seconds is strictly better than a no-op left implicit — the pattern is worth
keeping.

## Positive Observations

- **The fix landed in the exact wording the finding proposed, and the sole-carrier claim was made
  explicit.** v9 F-01 suggested "the already-migrated-sites bullet is folded into column (2)"; `:30`
  now reads precisely that, and the paragraph names `SIZING-…md` as the one place the figure lives.
  That second half is what stops the finding recurring — a fix that only deletes leaves the next
  author free to re-add.
- **The absorption is stated with its evidence, not asserted.** "DECISIONS carries no hygiene note, no
  sweep figure and no disposition of the residue" is a claim shaped so a reviewer can falsify it with
  a single grep. It survived that grep. Claims written to be checkable are the cheapest thing an
  author can do for a reviewer, and this document keeps doing it.
- **Re-grounding was done before editing, and said so.** The paragraph records which upstream hashes
  were re-read and which moved, which is why this confirmation could be bounded rather than a full
  sweep. That discipline is what converted a potentially expensive DEC-ERR-03 check into three hash
  comparisons.
- **The frozen core stayed frozen under an edit that touched the same file.** Ten rounds of preamble
  churn with zero drift inside `## Decision` is the property that makes the decision entries citable
  by PLAN and PROPERTIES at all.
- **The round's other two findings were correctly routed away.** PM v9 F-01 belongs to PLAN and F-02
  to harvest; the paragraph says so and does not manufacture a DECISIONS edit to look responsive.

## Recommendation

## Verdict
