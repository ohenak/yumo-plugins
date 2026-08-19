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

## Prior findings (round 3)

| ID | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Addressed, but the replacement rule is wrong** — see F-01 below | §3.2 step 6 no longer denies resolution to a two-attempt run: the suffix reading resolves `[post-wave, test, post-wave, test]` (`TSPEC:475-478`), and §5.2 gains the positive companion I asked for, with literal expected `invocations` and a `waveBudget.resolved` increment (`TSPEC:973-979`). The half I raised is fixed. But the new quantity drops the dispatch anchor, and with it the ability to refuse the defect the rule exists for |
| F-02 | Medium | **Resolved** | All four clauses moved inside their cells; pipe counts now match their headers at `TSPEC:504`, `:511`, `:1061`, `:1062`. Nothing was lost in the move — each clause reads the same as it did past the pipe |
| F-03 | Medium | **Resolved, and correctly grounded** | §2.5 names the disposition object in full and says *why* `model: "n/a"` rather than leaving it to the renderer: `renderAdvisoryEntry` destructures six members and interpolates `model` unguarded (`orchestrate-dev.js:2924`, `:2934`). §3.2 step 4 repeats the same literal, and §5.2's capture-failure fixture transcribes the rendered cell as `n/a`, not `undefined` |
| Q-01 | — | **Still open upstream** | OQ-7's erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1 has not landed: `FSPEC:204` and `:410` still read "tracked and untracked files alike, generated outputs included" with no `.gitignore` carve-out. Re-emitted this round |
| Q-02 | — | **Answered** | §6 OQ-12 (`TSPEC:1197`) closes it by construction rather than by convention: A6 is only entered on an already-red gate, every non-`resolved` terminal returns `{resolved: false}`, and the call site rethrows the wave's halt — so `ADVISORY_SEAM_PHASES.A6`'s fixed `outcome: "halted"` cannot be a false record |

## Findings

## Questions

## Positive Observations

## Recommendation
