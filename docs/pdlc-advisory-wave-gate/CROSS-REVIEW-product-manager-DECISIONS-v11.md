# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.9, commit `8a44b84b`)
**Upstream re-measured:** REQ `sha256:817b6745…`, FSPEC `sha256:82f74a2d…`, TSPEC `sha256:1531143c…`
**Date:** 2026-08-19
**Iteration:** 11 (delta confirmation; routed items reported ABSORBED)

## Context

Round 10 approved this DECISIONS at v1.8 against TSPEC `sha256:1531143c…` (anchors:
`REVIEWED-COMMIT: 153babdb`, `UPSTREAM-STATE: TSPEC sha256:1531143c…`), with one Low finding
(F-01) owned by TSPEC's version-label discipline and no edit owed here. The dispatch for this
round reports every routed item **ABSORBED against upstream HEAD**, i.e. nothing to land.

One commit has touched this document since that approval: `8a44b84b`, "v1.9 drop relocated
integer, record round-9 erratum re-grounding (TE v9 F-01)", +20/−3. Its whole surface is three
edits, all in the front matter:

1. The status row moves `1.8 → 1.9`.
2. The Cross-Reviews cell appends `CROSS-REVIEW-product-manager-DECISIONS-v9.md` and
   `CROSS-REVIEW-test-engineer-DECISIONS-v9.md`.
3. A new `**On v1.9 (Phase-P erratum round, TE v9 F-01).**` paragraph is added below the v1.8
   note, and the v1.8 note's quoted bullet loses its integer: *"the \"twelve already-migrated
   sites\" bullet"* → *"the already-migrated-sites bullet"*.

No `## Context`, `## Options Considered`, `## Decision` or `## Consequences` byte of the decision
record itself moved; `DEC-A6-01`…`DEC-A6-04` remain byte-frozen, as they have been since v1.5.

Upstream at this dispatch is byte-identical to what round 10 measured — I re-hashed all three
files at HEAD and REQ `817b6745…`, FSPEC `82f74a2d…` and TSPEC `1531143c…` match the dispatch
hashes exactly. So the DEC-ERR-03 obligation this round is narrow but real: the delta is the only
new surface, and the question is whether v1.9's new paragraph — which makes several *claims about
upstream* — is a faithful compression of TSPEC at HEAD, not merely a plausible one.

## Options Considered

Three readings of the delta were open before I checked bytes; two are falsified, one holds.

**(a) The delta is cosmetic — a version bump and a bookkeeping cell — so confirmation is a
formality.** Rejected. The new v1.9 paragraph asserts four checkable things about upstream: that
REQ and FSPEC are unchanged from v1.8's authoring state; that TSPEC moved `4a092e85…` →
`1531143c…` *within* v1.10; that TSPEC's added text sizes `PROP-SWEEP-2(b)`'s residue in §1.3 and
routes its partition, owners and figures to PLAN's Overview HEAD-drift note and A6-00's Edit 1;
and that DECISIONS carries no hygiene note, no sweep figure and no residue disposition. Every one
is falsifiable, so each was checked rather than read.

**(b) Dropping the integer breaks the v1.8 note's account of what moved.** Rejected on bytes. The
sentence now reads "the already-migrated-sites bullet is folded into column (2) as one enumeration
read two ways". `SIZING-pdlc-advisory-wave-gate.md` line 83 titles that column *"sites already at
the post-A6 value: **twelve**, of which **ten** are oracles red at HEAD and **two** are green
inputs"* — the subject-named bullet resolves to exactly one column there, unambiguously, and the
appendix's own v1.0 changelog row still quotes the old bullet by name including its integer. The
move is fully reconstructible from the pointer; the cardinality was doing no work in the sentence.
Dropping it is a strict improvement, because the integer was a HEAD measurement sitting in the one
document whose stated purpose is to hold none.

**(c) Re-carrying upstream hashes in DECISIONS prose re-imports the short-shelf-life problem
POSTMORTEM-D §6 exists to prevent.** Rejected, and worth stating why, because the shapes look
alike. A content hash is not a measurement of the tree that drifts silently: it is a *self-dating
citation anchor*, which is exactly what POSTMORTEM-D §6 step 1 asks a document to carry in place of
a total. A stale hash announces its own staleness on the next re-grounding; a stale integer does
not. This is the same distinction that made v1.8's relocation the right call, applied in the other
direction.

## Decision

**Confirmed. The delta lands cleanly and DECISIONS remains a faithful compression of upstream at
HEAD.** Reading (c) above is the outcome; (a) and (b) are falsified on bytes, not waved through.

Claim-by-claim, on the four assertions the new paragraph makes about upstream:

| v1.9 claim | Upstream at HEAD | Holds? |
|---|---|---|
| REQ `sha256:817b6745…` and FSPEC `sha256:82f74a2d…` unchanged from v1.8's authoring state | Re-hashed at HEAD; both match, and both match this dispatch's stated hashes | Yes — verified, not assumed |
| TSPEC moved `4a092e85…` → `1531143c…` *within* v1.10 | TSPEC at HEAD hashes to `1531143c…`; its status row still reads `1.10` and the added text sits inside the v1.10 changelog paragraph as `**Phase-P erratum (this dispatch):**` | Yes — including the "within v1.10" qualifier |
| That added text "sizes `PROP-SWEEP-2(b)`'s residue in §1.3 and routes its partition, owners and figures to PLAN's Overview HEAD-drift note and A6-00's Edit 1" | TSPEC verbatim: "It now states `PROP-SWEEP-2(b)`'s measured residual — 28 tracked paths in three classes at PLAN's dated 2026-08-19 measurement, of which untracking the 14 `.bak` blobs closes 14 — and routes the partition, the owners and the figures to PLAN's Overview HEAD-drift note and A6-00's Edit 1, which own them" | Yes — the compression names the same two owners and drops the figures, which is the point |
| DECISIONS "carries no hygiene note, no sweep figure and no disposition of the residue" | `grep` for `28`, `\b14\b`, `bak`, `backup` over DECISIONS returns one hit, `FSPEC E-28`, a requirement id and not a count. PLAN's A6-00 Edit 1 and Overview HEAD-drift note carry the 28 / three-class / 14-closable partition; SIZING carries the twelve | Yes — no double carriage anywhere |

The absorption is therefore genuinely a recorded no-op, and the record says so in those words
rather than implying an edit happened.

**Nothing I previously approved is broken.** The four decision entries are untouched, so the
product content this review has always been protecting is unmoved: the no-op-by-default guarantee
(`ADVISORY_DEFAULTS.enabled` stays `false`, REQ C-2), the `waveBudgetPerRun: 0`-vs-`enabled: false`
distinction (FSPEC E-33 / AT-01-4 vs AT-01-6), the wave-scoped snapshot ref (OQ-2), the E-6
third-`commitPaths` commit shape (OQ-8). I re-read the `## What follows for the whole feature`
bullets at HEAD: the only integer left in the document is column (1)'s **four** — three production
constants plus `advisoryRecord.test.js`'s five-member seam literal — which is a design cardinality
an implementer must not get wrong, not a tree measurement, and it is explicitly fenced off from the
short-shelf-life totals in the same bullet.

Round 10's F-01 survives the delta unchanged and is re-recorded below as inherited: TSPEC's bytes
still moved under an unchanged `v1.10` label, and DECISIONS still cites that label. The delta
mildly *improves* the situation rather than worsening it — the new paragraph names both byte
states by hash (`4a092e85…` → `1531143c…`) in the same sentence as the version label, so a reader
who lands on the v1.9 note gets the disambiguation the label alone cannot give. The fix still
belongs to TSPEC's changelog discipline; no DECISIONS edit is owed.

## Consequences

- **No document edit is owed by this confirmation.** DECISIONS stays at v1.9. The single finding
  is Low, inherited, and lands on TSPEC's version-label discipline; addressing it does not require
  reopening a decision entry, and it gates nothing.
- **The v9/v10 approval anchors carry forward unchanged on the upstream axis.** Round 10 already
  re-stamped `UPSTREAM-STATE: TSPEC sha256:1531143c…`, and upstream has not moved since. This
  round's anchors record the same three hashes against the new `REVIEWED-COMMIT`, so the next
  reader can tell the document edge — not upstream — is what moved.
- **Product fidelity is unchanged.** Nothing in the delta touches the four decisions' product
  content. A repo that configures nothing still gets a byte-identical run.
- **The relocation keeps paying.** This is the second consecutive round where a delta that would
  once have collided with locally-carried counts cost nothing to confirm: with the sizing block in
  `SIZING-…md`, the only surfaces exposed to re-measurement are role-level citations, and they held
  again. The v1.9 edit extends that discipline one step further by evicting the last quoted integer.
- **One shape to watch, not a finding.** v1.9 establishes a convention of recording upstream hashes
  in DECISIONS prose per erratum round. It is the right anchor type, but it accumulates: at v1.12
  the front matter would carry four such paragraphs. Worth a harvest note on whether re-grounding
  records belong in the changelog cell rather than as body paragraphs — raised as Q-01, not filed
  as a finding, because nothing is wrong at HEAD.

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
