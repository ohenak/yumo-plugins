# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.7)
**Date:** 2026-08-20
**Iteration:** 8
**Scope:** Delta confirmation of the Phase P erratum round — do the five routed items land, and is the TSPEC still a faithful compression of REQ/FSPEC HEAD?

## Upstream re-grounding

Both upstream documents are byte-identical to the state named in the dispatch, so no absorption is owed and no citation can have gone stale underneath this round:

| Doc | Dispatch sha256 | HEAD sha256 | Match |
|---|---|---|---|
| REQ | `a10396e8…d9645` | `a10396e8…d9645` | yes |
| FSPEC | `82f74a2d…961c3e` | `82f74a2d…961c3e` | yes |

## Routed item disposition

| # | Item | Status | Evidence I re-derived (not read from the doc) |
|---|---|---|---|
| 1 | §1.3 omits `advisoryDisabled.test.js` row-count and `.enabled` sites, and `advisoryQueueSeams.test.js:627` | **Landed** | §1.3 now names **four** `toHaveLength(5)` sites. Verified each anchor in HEAD: `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571` and `:726` all are `rows).toHaveLength(5)`. `.enabled` count block verified at `advisoryDisabled.test.js:634`–`:658`, asserting `toHaveLength(3)` |
| 2 | §3.2 step 2's "duplicated tier gate" contradicts the once-only read; use `advisoryTierOn` | **Landed** | Step 2 now separates the duplicated **gate** from the never-duplicated **read**, takes `advisoryTierOn` as a parameter, and states no `.enabled` access of its own. `grep -n '\.enabled\b'` over both shipped files returns exactly three sites — `orchestrate-dev.js:3258`, `:13678`, `orchestrate-queue.js:1318` — precisely the three §3.2 names, and precisely PROP-DIS-06's expected count |
| 3 | §4.4/E-33 calls `waveBudgetPerRun: 0` "documented" but §5.1 names no documentation carrier | **Landed** | §4.4 now names a carrier and explicitly records **no `pdlc/README.md` edit in scope**. Verified the stated reason: `pdlc/README.md` contains zero occurrences of `advisory`, and `docs-uniqueness.test.js:122`–`:123` line-pin `pdlc/README.md` at lines **139** and **145** — so an inserted README line would shift both pins and redden the Engine job. The reasoning is not just asserted, it is correct |
| 4 | §5.1's map still names `ci-arrangement.test.js`; PLAN v1.1 re-homes to a new file | **Landed** | §5.1's map (and §4.4) now name `pdlc/engine/__tests__/advisory-config-example.test.js` as a **new file**, with `ci-arrangement.test.js` explicitly withdrawn. Verified `ci-arrangement.test.js` contains zero occurrences of `advisory`/`waveBudgetPerRun`, and the new file does not exist at HEAD — so "new file, authored not adjusted" is accurate |
| 5 | §5.6's "PLAN red-test AT" rule should be AT set-equality, not per-AT cardinality | **Landed** | §5.6 now discharges by **set-equality of AT ids**, with the batch-safety rationale stated. I re-derived the set mechanically: FSPEC §6 carries **47** distinct AT ids, §5.6's table carries **47** rows, and `comm` reports an empty difference in **both** directions. The "A6-15 alone covers nineteen" claim also checks out — PLAN A6-15's Covers list is exactly 19 ids |

All five items land. The two claims most likely to be hand-waved — the AT set-equality and the README line-pin argument — both survive mechanical re-derivation.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §5.1 states its file table and §1.3's "name the same test-side files, checked equality in **both directions** rather than containment". This round's §1.3 edit added `advisoryQueueSeams.test.js` (item 1) without adding the matching §5.1 row, so the stated equality is now false: `advisoryQueueSeams.test.js` ∈ §1.3, ∉ §5.1. Coverage is not actually lost — PLAN A6-03's ownership manifest already owns the file and flips `:627` — so this is a false stated invariant in the map future authors read, not a test hole. Note the reverse direction is also untrue and was so before this round (`advisoryWaveGate`, `waveExecution`, `advisoryEscalationLog` ∈ §5.1, ∉ §1.3), which suggests the rule wants restating as "§5.1 ⊇ §1.3's test-side edit list, plus behavioural homes" rather than adding rows to force literal equality | §5.1 (TSPEC:1142–1147, 1149–1161); §1.3 |
| F-02 | Low | Local | §3.2 step 2 attributes the "Read once, reused everywhere below…" design-intent comment to `orchestrate-dev.js:13675`–`:13677`. The comment occupies `:13676`–`:13677`; `:13675` is the `parseAdvisoryConfig(advisoryConfigRaw)` call. One-line overreach on a supporting citation only — every operative anchor in the same paragraph (`:13678`, `:3258`, `:1318`, `:634`–`:658`) is exact. PLAN A6-18 copies the same `:13675`–`:13677` range, so fixing it in one place should carry to the other | §3.2 step 2 (TSPEC:1044 vicinity) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: is the intent that §5.1 is the superset (PLAN's whole test-side manifest) and §1.3 the transcription-surface subset? If so the fix is one sentence in §5.1, not a new table row — and it makes the rule true in both directions for the first time. |

## Positive Observations

- The §3.2 step 2 repair is the strongest edit in the round. Separating the tier **gate** (legitimately duplicated, because AC-1.4's inertness claim covers A6's snapshot) from the tier **read** (never duplicated) resolves the contradiction without weakening the inertness argument, and it names the exact failure mode — any `.enabled` token, comments and strings included, would make PROP-DIS-06 count four. That is a falsifiable, mechanically-checkable constraint handed to the implementer.
- §4.4's README disposition is a model of a well-discharged erratum. Rather than asserting "no README edit needed", it gives the mechanism: zero `advisory` occurrences, no section to join, wave loop commits exactly `task.files`, and two line-pins that would break. I checked all four and they hold.
- §5.6's shift from cardinality to coverage is the right correction from a test-engineering standpoint. A row-per-AT red-test rule would have collided head-on with the single-writer-per-batch constraint, and the doc says so explicitly rather than quietly relaxing the bar.
- Re-pointing the config-schema expectation onto a purpose-named new file keeps the assertion inside a delivery-blocking CI job while leaving `ci-arrangement.test.js`'s single-oracle scope intact — no oracle gets a second, drifting concern bolted on.

## Recommendation

**Approved with minor changes**

No High finding. The five routed items all land, every anchor and count I re-derived against HEAD checks out, and the two upstream documents are unmoved. F-01 is a stale cross-reference created by this round's own edit and worth a one-line fix; F-02 is a citation nit. Neither blocks the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
