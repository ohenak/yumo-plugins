# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review of the v1.12 revision)

## Context

**What this round is.** At v3 I returned this document non-approving on one High (F-01), one Medium
(F-02) and one Low (F-03) — all three about upstream-dependent prose in `DEC-A6-03` that REQ v1.16
had falsified. The author has since landed three commits on this file (`5f35bd8f`, `a147c9cf`,
`279d38a2`). `git diff 3143290a HEAD` on the document is 75 insertions / 22 deletions across four
places: the header `Upstream` cell, the v1.9 re-grounding note, a new `On v1.12` changelog
paragraph, `DEC-A6-03` (Reversibility, the gap subsection, re-evaluation triggers) and one
Consequences bullet.

**Scope of this pass.** Delta protocol: I verified my three prior findings against upstream at HEAD
and read only the changed hunks for new issues. I did not re-open `DEC-A6-01`, `DEC-A6-02`,
`DEC-A6-04`, `## Options Considered`, `DEC-A6-03`'s "Constraints that forced the shape", or any
settled option table. Nothing in the diff touches them.

**How I grounded it.** Every factual claim the revision adds is a claim about upstream or about the
shipped tree, so I checked each one rather than reading it:

- Header pins — `REQ sha256:f97f4f66…` v1.16, `FSPEC sha256:d602c440…` v1.7, `TSPEC sha256:1f6ea486…`
  v1.15: all three recomputed at HEAD and all three match, versions included.
- `REQ v1.16 AC-6.3` carries the overwrite conjunct and cites `DEC-A6-03` by id.
- `FSPEC v1.7 BR-14` states co-location as the observable in the words the record quotes; `AT-06-4`
  carries conjunct (3), `AT-06-4b` is the no-capture negative arm, and `E-34` requires no warning.
- `TSPEC v1.15 §4.5` carries the `Snapshot-overwrite notice` row rendered by
  `renderSnapshotOverwriteNotice(snapshotRef)` into halt-report `notices`, on every A6-touched halt
  with non-`null` `snapshotRef` and never on `null`.
- The "still owed" claim — `overwrit` matches nothing in `PROPERTIES-pdlc-advisory-wave-gate.md`
  (0 hits), `PROP-REC-05` asserts only the diagnosis and the root-cause class, and no test in
  `pdlc/workflows/__tests__/` asserts any overwrite string; `renderSnapshotOverwriteNotice` has no
  definition or caller anywhere under `pdlc/` yet.
- The Reversibility claim's cheap half — the ref name is computed at exactly one site,
  `pdlc/workflows/orchestrate-dev.js:12603` (`update-ref refs/pdlc/a6-snapshot-${waveNum}`); the
  only other occurrences are four test assertions in `advisoryWaveGate.test.js`. "Computed in one
  function" is true of the shipped code, not just of the design.

Every one of those holds. The revision did not paper over the cascade; it re-checked upstream and
found the split had moved two hops further than either reviewer saw.

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
