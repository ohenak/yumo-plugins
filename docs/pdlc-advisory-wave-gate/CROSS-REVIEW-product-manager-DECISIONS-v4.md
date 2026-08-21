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

Three readings of the revision were open. The choice between them is the substance of this round.

**Reading A — the three findings are addressed, so approve clean.** F-01's stale negative claim is
gone and replaced with a three-level landing statement, each level verified accurate at HEAD; F-02's
remedy bullet now names `AC-6.3` as its upstream and says the warning is a required element of the
halt report; F-03's trigger is marked "**fired at REQ v1.16 and is spent**" and replaced with a
narrower live one. On this reading the round closes with no findings.

*Rejected.* The revision is larger than the three fixes — it adds a compression of `TSPEC v1.15
§4.5` and a compression of `PROPERTIES`' current coverage, and both compressions are new
upstream-dependent claims that did not exist when I approved at v2. New claims are in scope for a
delta re-review even when the findings they replace are resolved. Two of them are imprecise against
the documents they compress.

**Reading B — the findings are resolved; the new compressions carry non-gating defects.** The three
prior findings are closed on the evidence above, and nothing in the diff broke anything I had
previously approved. What the diff introduces is two descriptions of the landed contract that
disagree with `TSPEC §4.5` / `FSPEC BR-14` in ways a reader could act on: the Reversibility
paragraph places the pointer and the warning on two different surfaces and calls that co-location,
and the "still owed" note enumerates one of the two properties `PROPERTIES` maps to `AC-6.3`.
Neither drops an acceptance criterion — the entry states `AC-6.3`'s obligation correctly twice
elsewhere in the same section — so neither is High.

*Accepted.* This is what the evidence supports, and it is narrow: three findings, all inside the
`DEC-A6-03` hunks, none gating.

**Reading C — the Reversibility misstatement is High, because it reinterprets an acceptance
criterion.** `FSPEC BR-14` makes co-location the falsifiable observable ("a pointer in the halt
report and the warning in a runbook does not satisfy it"), and a decision record that describes the
satisfying arrangement as *field plus adjacent notice* describes an arrangement `TSPEC §4.5` does
not accept.

*Rejected, on the calibration my own persona rules demand.* Severity tracks user impact, and the
impact here is bounded by the fact that the same entry, eleven lines below, states the oracle
correctly and in stronger terms than FSPEC does: "the oracle asserts the ref pointer and the
overwrite statement on the **same rendered report field**, and must go RED both when the warning is
deleted and when it is emitted somewhere other than beside the pointer." A reader who reaches the
normative half is not misled; a reader who stops at the Reversibility aside is. That is a real
defect worth fixing, but it is an internal inconsistency in a rename-cost aside, not an AC narrowed
in the record's operative text. Medium, and it does not gate.

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
