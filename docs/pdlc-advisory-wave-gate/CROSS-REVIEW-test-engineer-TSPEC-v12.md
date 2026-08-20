# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 12 (delta confirmation on a previously approved document)

## Scope

This is a **delta confirmation**, not a re-review. TSPEC was approved at v1.10; a single targeted
erratum edit landed in commit `1f2a4fbf` (*"docs(tspec): size PROP-SWEEP-2(b) residue in 1.3 and
route it to PLAN"*). The question answered here is narrow: does the delta resolve the routed item
without breaking anything previously approved, and — per DEC-ERR-03 — does the document still
faithfully compress the upstream it leans on, read at the upstream's *current* bytes?

Routed item under confirmation: §1.3's repository-hygiene note sized the residue commit `e3b9d5a3`
left as the tracked `.claude/workflows/.pdlc-backups/*.bak` blobs alone, which under-states the
`PROP-SWEEP-2(b)` residual and names no owner for the part this branch cannot close.

The erratum is confined to two places, both prose, both in-scope:

| Site | Edit | Design claim moved? |
|---|---|---|
| Changelog, v1.10 entry | Appends a *"Phase-P erratum (this dispatch)"* sentence recording the sizing and the routing | No |
| §1.3, after the revert-vs-re-derive routing paragraph | New paragraph *"Sizing the hygiene residue, and where it is owned"* | No |

No table, oracle, seam contract, cardinality pin or transcription surface elsewhere in the document
was touched. `git diff` over the erratum commit shows exactly two hunks, both additive.

## Design

Nothing in the document's design content changed, and I re-checked the two structures the new
paragraph sits next to, because a paragraph inserted into §1.3 could have displaced or contradicted
them:

- The eight-row HEAD-drift surface table in §1.3 (the `A6` transcription residue: seam list,
  envelope defaults, config defaults, per-seam report rows, gate-exclusivity registry, harvest /
  property seam lists, the four bare row-count sites, and the `.enabled` occurrence count) is
  byte-unchanged and still reads the same at HEAD.
- The revert-vs-re-derive routing paragraph immediately above the insertion is unchanged, and the
  new paragraph is consistent with it rather than a second, competing routing: it routes *sizing
  and ownership* to PLAN's Overview HEAD-drift note and A6-00's Edit 1, which is where PLAN v1.7 and
  v1.9 actually put them. I verified both landing sites exist in PLAN at HEAD and carry the
  partition, the owners and the figures the paragraph defers to.
- The new paragraph's back-reference (*"The `.bak` blobs named above"*) resolves: the blobs are named
  earlier in the same §1.3, so the paragraph is not orphaned by a later section reorder.

The design-neutrality claim in the changelog (*"Sizing and routing only … no design claim moves"*)
holds as written.

## Seams

The delta names one oracle seam, and I exercised it rather than trusting the prose. The paragraph
cites `PROP-SWEEP-2(b)` in `pdlc/workflows/__tests__/documentOracles.test.js`, the case titled
*"the unfiltered sweep minus A-1's frozen glob list is empty"*. That case exists at HEAD, its title
is quoted verbatim, and its shape is as described: it assembles the seven-term sweep over
`git ls-files`, subtracts A-1's fifteen frozen globs via a local glob-to-RegExp helper, and asserts
the remainder set-equals the empty list. The citation is accurate and the seam is the right one to
size the residue against.

I re-ran that subtraction against the live tree to check the paragraph's three-class partition:

| Class | Paragraph says | Measured at review-time HEAD |
|---|---|---|
| 1 — backup blobs | 14 `.claude/workflows/.pdlc-backups/*.bak` | **14** — matches exactly |
| 2 — consumer-runtime artifacts | 4 named paths, *"all four branch-introduced by the same commit"* | **4** — matches; none of the four is present in the tree at merge-base `1efb9a3b`, which is PLAN's deciding provenance leg |
| 3 — this feature's own documents | `TSPEC`, `PLAN`, `DECISIONS`, `PROPERTIES` and its `CROSS-REVIEW-*` files | **14** at review time — the four named documents plus ten cross-review files |

The partition itself is sound: every residual path at HEAD falls into exactly one of the three
classes, and no fourth class exists. The class-2 flat provenance claim is also defensible — PLAN
carries a caveat that two of the four artifacts have an earlier superseded add on an ancestor of
the merge-base, but the *deciding* leg (tracked-at-merge-base) says branch-introduced for all four,
and that is the leg the paragraph's claim rests on. No finding there.

## Data Model

The only "data" the delta introduces is a set of counts, so I treated them as claims under test.

- **14 closable** — matches the measured class-1 size exactly, and matches A6-00's Edit 1, which
  untracks those blobs *and* adds the bare directory rule to `.gitignore`. The closure claim is
  arithmetically and mechanically true.
- **28 total, "at PLAN's dated 2026-08-19 measurement"** — this is date-stamped and explicitly
  attributed to PLAN rather than asserted as an invariant, which is the right shape. At review time
  the same subtraction reports **32**, because five cross-review files have been committed since the
  measurement. The paragraph anticipates this and states the growth mechanism, so the figure is not
  misleading; it is, however, already stale on the same calendar day (F-02).
- **"the other 14 are not closable on this branch"** — true at the dated measurement, 18 at review
  time. Same drift, same cause. PLAN's own v1.9 round deliberately stopped restating `28`/`14` in the
  DoD for exactly this reason and pointed at the Overview instead; TSPEC's paragraph re-introduces
  the absolute pair one layer up. It is narrative rather than a gate, and it does defer ownership in
  the very next sentence, so this is Low, not gating (F-02).
- **"grow by one per *committed* cross-review file"** — over-stated. Only cross-review files that
  quote one of L-2's seven grep terms enter the sweep. At HEAD, ten of the feature's committed
  cross-review files are in the residual and several others are not (this file, written to avoid
  quoting those terms verbatim, will not be) (F-03).

## Verification

## Findings

## Obligations

## Positive Observations

## Recommendation

