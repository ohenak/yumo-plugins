# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4
**Round type:** upstream-cascade confirmation (REQ erratum). Document bytes unchanged.

## Overview

This round is a cascade re-confirmation, not a review. PROPERTIES' own bytes did not change: the
file hashes `sha256:7baf9b33…` at HEAD, byte-identical to the `APPROVAL-HASH` recorded in
`CROSS-REVIEW-product-manager-PROPERTIES-v3.md`. What moved is REQ, and only REQ.

Measured upstream state at HEAD against the `UPSTREAM-STATE` anchors v3 recorded:

| Upstream | Pinned in v3 | At HEAD | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` | `f75c348f…` | **yes** |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no |
| TSPEC | `f2261510…` | (not re-pinned this round) | — |
| DECISIONS | `48522bf9…` | (not re-pinned this round) | — |
| PLAN | `87b439ea…` | (not re-pinned this round) | — |

The pinned REQ `5f3e8051…` is commit `1847dd9c0` (REQ v1.6). The single commit since is `e12b78fd8`,
REQ v1.7 — a one-clause erratum, +12/−3 lines, touching the metadata block and REQ-STATS-06 only.

**What the erratum decided.** REQ v1.6's REQ-STATS-06 said a grammatical basename outside the
driver's document-type catalogue was a **survivor** of its family — so a feature carrying only such
`CROSS-REVIEW-` files would report a *measured* ratio. v1.7 withdraws that: because the predicate is
"evaluated over exactly the file set whose bytes the process side sums", a basename the catalogue
does not recognise "contributes no process bytes and counts as no file of its family remaining", so
such a feature reports **harvested**. The erratum note states the withdrawn clause "contradicted its
own preceding rationale and C-5's fidelity rule, and dissented from a downstream file."

The single question this round answers: **does PROPERTIES still hold against REQ-STATS-06 as it now
stands?** It does — and more pointedly than a bare "no contradiction". PROPERTIES was the downstream
file that dissented. The erratum resolved the disagreement *in PROPERTIES' favour*, so the document
did not need to move to stay faithful; it was already asserting the reading REQ has now adopted.

## Properties

I re-read the current REQ-STATS-06 text and every PROPERTIES claim that leans on it, rather than
checking off the routed item list. Three properties sit on the changed clause.

**PROP-RATIO-08 (`PROPERTIES-pdlc-stats.md:173`) — the load-bearing one, and it is now *more*
faithful than before.** It requires `state: "harvested"` when `LEARNINGS-{feature}.md` is present and
at least one process family is entirely absent, "over exactly the file set the numerator sums" — the
same scoping phrase REQ v1.7 now uses ("evaluated over exactly the file set whose bytes the process
side sums"). Its fourth AT-17 leg is the exact configuration the erratum decided: "`CODE_REVIEW`
files **intact** alongside only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames" must
report harvested. Under REQ v1.6 that leg asserted the *opposite* of what the REQ said — those
basenames were survivors, so the ratio should have been measured. Under v1.7 the leg is exactly
right. The dissent v1.7 names is this row; the erratum closed it by moving REQ, not PROPERTIES.

**PROP-RATIO-06 (`:171`) — unchanged and consistent.** A grammatically-failing `CROSS-REVIEW-`
basename must contribute to "**neither** side: it is listed as malformed (PROP-RR-04) and sized as
nothing", asserted over the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape. That is the
byte-side half of the erratum's own reasoning ("contributes no process bytes"). PROP-RATIO-06 and
PROP-RATIO-08 together now express the full v1.7 clause: sized as nothing *and therefore* not
counted as remaining. The pairing was already there; the REQ caught up to it.

**PROP-RATIO-09 (`:172`) — untouched.** Harvested-before-zero-denominator precedence rests on BR-16
and EC-13, neither of which the erratum moved.

I also checked the properties that could have been *collaterally* falsified, since the erratum
changes what "remaining" means and that word appears in other metrics' predicates:

- **PROP-RR-05 (`:130`)** places out-of-catalogue basenames in the malformed list and still reads the
  `TSPEC` row as `6` over `docs/completed/pdlc-advisory-wave-gate/`. That is REQ-STATS-03 / C-5
  territory, which the erratum explicitly preserved (it cites the malformed treatment as the *reason*
  for the new ratio reading, not as something it changes). Still faithful.
- **PROP-RR-09/PROP-RR-10 (`:134`, `:135`)** scope the harvested test per document type for the
  review-rounds metric under BR-08. The erratum touched REQ-STATS-06 only; REQ-STATS-03's own
  harvested state is unaffected, and PROP-RR-10's real-path expectation over
  `docs/completed/pdlc-headless-engine/` is unchanged.
- **PROP-DOD-03/PROP-DOD-04 (`:146`, `:147`)** carry the parallel "leftovers must not hold the
  harvested state open" rule on the DoD side under BR-11. PROP-DOD-04 already resolves its
  near-miss basenames the same direction v1.7 now resolves the ratio's — non-conforming leftovers do
  not count as survivors. The two sides are now consistent with each other and with REQ.

No PROPERTIES claim cites REQ-STATS-06 text that no longer exists, and none reproduces the withdrawn
"survivor" wording — `grep` for `surviv` across the document returns only PROP-RR-10, PROP-DOD-03 and
fixture prose about genuinely surviving files, none of it about out-of-catalogue basenames.

## Oracles

The erratum changes an outcome, so the question for oracles is whether any oracle in PROPERTIES would
now pass an implementation REQ forbids, or fail one REQ requires.

**The AT-17 chain is intact end to end.** FSPEC is unmoved this round (`c7d2c832…` at both the v3 pin
and HEAD), and its AT-17 already states the post-erratum reading in terms: the fourth leg's basenames
are "the `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form BR-16 names", and the *Then* concludes "the fourth
not a measured ratio, because files whose bytes BR-14 refuses are equally files BR-16 does not count
as remaining (BR-16, EC-13)" (`FSPEC-pdlc-stats.md:754-756`). REQ v1.7's new sentence is a
restatement of that FSPEC clause at REQ altitude. So the chain REQ-STATS-06 → BR-16 → AT-17 →
PROP-RATIO-08 now reads the same direction at all four levels; before the erratum, REQ was the one
level out of step. PROPERTIES' `Traces to` cell for PROP-RATIO-08 (`REQ-STATS-06, BR-16, AT-17`) is
therefore still accurate, and now accurate for the right reason.

**Direction of the oracle is unchanged, so no test flips colour.** Because PROPERTIES already
asserted the v1.7 outcome, an implementation built against PROPERTIES as written satisfies REQ v1.7.
The erratum removes a latent conflict in which a conforming implementation could have been red
against PROP-RATIO-08 while green against REQ-STATS-06; it does not create a new one.

**The disjunction framing survives.** PROP-RATIO-08's stated purpose for leg 4 — "the one that proves
the condition is a disjunction rather than a DoD-side test" — still holds under v1.7, and the erratum
strengthens it: with out-of-catalogue basenames no longer counting as survivors, leg 4 is now a
genuine instance of "cross-review family entirely absent while `CODE_REVIEW` is intact", which is
precisely the disjunct it was written to exercise. Under v1.6's survivor reading the leg was
arguably not an instance of the disjunction at all.

I found no oracle in the document whose falsifier depends on the withdrawn clause, and no oracle
whose pass condition the erratum widens or narrows.

## Fixtures

Two fixtures encode the changed clause, and both remain correct.

**`F-HARVEST-FOUR` (`PROPERTIES-pdlc-stats.md:331`)** builds the four AT-17 legs, its fourth being
`CODE_REVIEW` present alongside out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`, driving
PROP-RATIO-08 and PROP-RATIO-09. Its expected outcome is `harvested` — the v1.7 outcome. No fixture
edit is implied by the erratum.

**`docs/completed/pdlc-advisory-wave-gate/` (`:357`)** is the real-path fixture carrying four
`CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` basenames alongside a genuine
`CROSS-REVIEW-test-engineer-TSPEC-v6.md`. It is pinned for PROP-RR-03 and PROP-RR-05 — the
review-rounds and malformed-list expectations — not for the ratio, so the erratum does not disturb
its recorded expectations. Worth noting for the implementer rather than as a finding: this directory
carries a *surviving* in-catalogue cross-review, so it is not an instance of the new harvested rule
and cannot be repurposed as one; the constructed `F-HARVEST-FOUR` leg remains the only place leg 4 is
exercised. PROPERTIES already keeps those two concerns in separate fixtures.

The G-6 real-path gap row (`:540`) records its measurement date and re-measurement command, and its
`…-REVIEW-v1.md` note concerns `not_cross_review` classification, which the erratum does not touch.

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_
