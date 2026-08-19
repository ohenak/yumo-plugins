# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.3)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v3.md` (iteration 3)
**Date:** 2026-08-20
**Iteration:** 4
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. `CROSS-REVIEW-product-manager-TSPEC-v3.md` re-read first, then
`git diff a2ade58c..HEAD -- docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
(90 insertions, 21 deletions) taken as the round's change set: the v1.3 changelog block, §2.5's
disposition row, §3.2 steps 3/4/6, §3.3's `gatherEvidence` and `verifyGate` rows, §5.2's two
bullets, §5.5's `(g)`/`(h)` rows and mutation-fixture bullets, and §6's OQ-12/OQ-13. Sections
approved in round 3 were not re-litigated.

Every behavioural claim added this round was checked against the shipped code, not the prose:

- `renderAdvisoryEntry` destructures exactly the six members §2.5 now names, and interpolates
  `modelValue` unguarded (`pdlc/workflows/orchestrate-dev.js:2924`, `:2934`, `:2947`) — so
  `model: "n/a", fallback: false` renders `| Model | n/a |` with no renderer change, exactly as
  §2.5 and §3.2 step 4 claim.
- The capture verbs are capture-unique: `commit-tree` appears only on the capture path, while
  restore drives `read-tree`/`clean`/`reset` (`TSPEC:232-238`), so §5.2's new `commit-tree === 1`
  count is a sound proxy for the one-snapshot-per-wave invariant and the raw `_git` count it
  replaced was not.
- The four clauses that GFM was dropping now sit inside their cells: `TSPEC:504` and `:511` carry
  3 pipes against a 2-column header, `:1061` and `:1062` carry 5 against a 4-column header.
- The snapshot ref is a single fixed name, `refs/pdlc/a6-snapshot` (`TSPEC:233`, `:831`), written
  by "every A6 invocation that reached the snapshot step".
- The ledger is per wave and the **first pass appends to it**: `runWaveGateSequence` pushes one
  token before each command call whether or not it passes (`TSPEC:196-205`), and §2.3's call-site
  sketch passes the same `invocations` array to the first pass and to every re-gate.

That last fact is what F-01 below turns on.

## Prior findings

## Findings

## Questions

## Positive Observations

## Recommendation
