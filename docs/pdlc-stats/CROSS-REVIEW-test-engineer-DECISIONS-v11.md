# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, byte-unchanged)
**Date:** 2026-08-31
**Iteration:** 11

## Context

**Upstream-cascade confirmation.** My own bytes have not moved: `sha256:48522bf9…`, byte-identical to
the `APPROVAL-HASH` recorded at v8 and re-confirmed at v9 and v10. `git diff` over
`docs/pdlc-stats/DECISIONS-pdlc-stats.md` across this round's range
(`10963e85dcf2d62fb869f704f02d9d2c76484ba7..HEAD`) is empty.

Measured on `feat-pdlc-stats` HEAD (`a2f1201b0`):

| Upstream | v10's pin | HEAD sha256 | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` (v1.6) | `f75c348f…` (v1.7) | **yes** — the erratum under confirmation |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no — byte-identical |
| TSPEC | `f2261510…` (phantom) | `a06a6032…` | no — matches v10's *body* measurement |

Both HEAD hashes match the dispatch's cited REQ `f75c348f…` and FSPEC `c7d2c832…`, so I am
confirming against exactly the versions the orchestrator named.

**The delta.** One commit, `e12b78fd8`, +12/−3, touching only the version header and one clause of
REQ-STATS-06. It withdraws the v1.6 survivor clause — *"the predicate is set-membership over C-4's
grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor even
where REQ-STATS-03 reports it malformed"* — and replaces it with the opposite disposition: such a
basename *"contributes no process bytes and counts as no file of its family remaining"*, so a feature
carrying only those reports **harvested**. C-5, R-5, REQ-STATS-01 through 05 and 07 are byte-unchanged.

**A third consecutive phantom TSPEC pin.** v10's `UPSTREAM-STATE` trailer recorded TSPEC
`f2261510…`. I hashed every revision of `TSPEC-pdlc-stats.md` on this branch's history path: it
matches none of them. This is the third round running — v8's `512a9fcf…`, v9's `235fd3dd…`, now
v10's `f2261510…` — and the third time the reviewing round has had to recover by falling back to the
hash measured in the prior round's own body (v10's body: `a06a6032…`, which *does* match HEAD, and is
how I know TSPEC did not move). Carried below as F-04, escalated; see there for why the recurrence
changes its severity.

## Options Considered

The document is frozen, so the only options open to me are dispositions of this round.

| Option | Shape | Why not / why |
|---|---|---|
| Approve on the item list ("the erratum landed as routed") | Treat the routed item's landing as sufficient | **Rejected.** DEC-ERR-03 is explicit that items landing is necessary, not sufficient. The question is whether the document is still a faithful compression of REQ **v1.7**, which is answered by re-reading the upstream text the document leans on, not by checking the erratum's own diff off a list. |
| Raise a High on the semantic flip | Treat "an upstream AC reversed its disposition after I approved" as gating on its face | **Rejected.** The gating test is whether a decision, oracle, falsifier, type or task sizing in *this document* is falsified. I traced all three of DECISIONS' upstream anchors — C-5, REQ-STATS-02, R-5 — and the flip reaches none of them. Severity must reflect real impact; a High here would be inflation. |
| Route the delta back as a DECISIONS obligation | Demand a new K-row or a new oracle for the enlarged harvested case | **Rejected**, and the document itself says why. *What these decisions do not decide* carves out "token spellings, key sets, exit codes, row order and **edge-case outcomes**" as FSPEC §4/§5 material. REQ-STATS-06's out-of-catalogue disposition is precisely an edge-case outcome. The carve-out is not a dodge — it is the pre-declared scope boundary that makes this delta orthogonal, and it was approved as such. |
| Confirm faithfulness; carry the four inherited items non-gating | Approve, leave the owed one-line repairs to the next DECISIONS touch | **Chosen** |

One thing I deliberately did **not** do: treat "the delta is orthogonal" as a reason to skip the
re-read. Orthogonality is a *conclusion* I had to earn against the current bytes of C-5,
REQ-STATS-02 and R-5, not a premise. The section below records what I actually checked.

## Decision

**The document, unchanged, remains a faithful compression of REQ v1.7 / FSPEC v1.7 / TSPEC v1.7 at
HEAD. No decision, oracle, falsifier, type or task sizing in DEC-STATS-01/02/03 is falsified by the
REQ-STATS-06 erratum. No High finding, old or new.**

### The three upstream anchors, re-read at HEAD

DECISIONS cites REQ in exactly three places. I read each in the current version rather than trusting
the document's account of it.

| Anchor | What DECISIONS compresses it to | REQ v1.7 at HEAD | Verdict |
|---|---|---|---|
| **C-5** (`REQ:121-133`, cited by symbol per DEC-DOC-01) | "every artifact classification `pdlc stats` makes must be the classification the driver makes", over `parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex` | Names four parsing rules: the `CROSS-REVIEW-*` basename grammar, its round derivation, the `CODE_REVIEW-*-v{N}` version grammar, and the POSTMORTEM `RESOLVED:` marker | **Holds.** Four rules ↔ four injected exports, unchanged. Byte-untouched by the erratum. |
| **REQ-STATS-02** | "the JSON document's top-level key set is set-equal to the printed metric set plus one schema-version field" | Says exactly that, and adds that "REQ-STATS-03/04/06's harvested state ride in their own metric's value, never as extra top-level keys" | **Holds**, and see below — this is the one clause the delta could have disturbed. |
| **R-5** | "rests a consumer-stability guarantee on that field existing" | Unchanged | **Holds.** |

### Why the flip does not reach DEC-STATS-02

This is the near miss, and it is worth stating explicitly rather than waving through. The erratum
**enlarges the input set on which the ratio metric reports `harvested`**: under v1.6 a feature whose
only `CROSS-REVIEW-` basenames were out-of-catalogue produced a *measured* ratio; under v1.7 it
produces `harvested`. A new value reaching a JSON document is exactly the shape of change that breaks
BR-21's set-equality and forces TSPEC §6.3's cross-mode oracle to carry a standing per-key exception
— the "permanent hole" DEC-STATS-02 exists to prevent.

It does not break it, for a reason that is in REQ-STATS-02's own bytes at HEAD: the harvested state
**rides in the ratio metric's own value**, not as an extra top-level key. The key set is unchanged;
only the domain of one value grew. So `schemaVersion` remains the single JSON-only field, the
`renderJson`-as-projection shape stands, and §6.3's oracle keeps its clean set-equality with no
exception. DEC-STATS-02's re-evaluation trigger — *"a second JSON-only **field** appears"* — counts
fields, not values, and has still not fired.

### Why the flip does not reach DEC-STATS-03 — and makes it more load-bearing

The new clause makes the harvested/measured verdict turn on whether *the driver's document-type
catalogue* recognises a basename. That is a direct dependency on `parseReviewFilename`'s
classification, which is the seam DEC-STATS-03 governs.

Under v1.6 a classifier divergence on such a basename would have flipped the ratio one way; under
v1.7 it flips the other. **In both readings the operator-visible token depends on the catalogue**, so
the delta does not introduce the dependency — it re-points it. And DEC-STATS-03's guard is an
identity oracle (`===` against `orchestrate-dev.js`'s own exports at the single production
construction site), which the document correctly argues "cannot be satisfied by a re-implementation
at all, so C-5 holds for **every** input, not just tested ones". A total guard covers an enlarged
input set for free. **No new oracle is owed**, which is exactly the property that made Option A worth
its cost over Option C's corpus-based equivalence — Option C would have owed a new corpus case here.

The Consequences section's *"a second consumer for the four driver exports"* bullet already records
the coupling in the form the delta needs, and K-4's construction-site-count conjunct still fences the
one way the oracle could be voided. Nothing in the obligations table is re-sized.

### What I checked that did not move

- **No new decision to absorb.** The erratum adds no `BR-`, `E-` or `AC-` row and performs no
  vocabulary rename — it withdraws a clause. There is nothing for `DEC-STATS-01/02/03` to take on.
- **DEC-STATS-01 untouched.** The delta's "evaluated over exactly the file set whose bytes the
  process side sums" is a single-traversal coupling between the predicate and the numerator. Both
  live in `computeFeatureStats` in `lib/stats.mjs` under DEC-STATS-01, so the coupling is satisfied
  by the chosen placement rather than constraining it.
- **The ten-site co-change table and K-1..K-9 are untouched** by a REQ edit that changes no
  enumeration, no member list and no count word.

## Consequences

## Delta-Confirmation Findings

## Verdict
