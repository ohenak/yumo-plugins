# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.2)
**Date:** 2026-08-09
**Iteration:** 3
**Scope:** Delta re-review under the round-3 protocol. Diffed `93e5d75b..HEAD` on the document (97
insertions, 41 deletions), read my own v2 findings first, and judged only (a) whether the v2 blocking
finding is resolved and (b) whether the revision broke anything. Unchanged sections not re-litigated.

## 1. Round-2 findings disposition

| v2 finding | Severity | Disposition | Evidence re-measured at HEAD |
|---|---|---|---|
| F-01 the AT-C register was homed on `consolidationLifecycle.test.js`/T23, which neither TSPEC §12.3 nor PLAN T20 gives it | High | **Resolved** | PROP-PASS-01…05 and PROP-PASS-11 now trail `consolidationPass.test.js` · T20 → T31 (`:1294`, `:1303-1304`, `:1313`, `:1322`, `:1330`, `:1349`); that is the file TSPEC §12.3 gives AT-C1…AT-C8 (`TSPEC:2497`) and the file PLAN T20's `T31 — pass lifecycle` block enumerates them in (`PLAN:264`). PLAN T23 states "two cases, no register id" (`PLAN:267`) and the document's §12.2/§12.3 rows for T23 now carry exactly PROP-PASS-09 (release across the terminal statuses), PROP-PASS-10 (await discipline) and PROP-DBL-03 — a one-to-one match with T23's two declared blocks plus its hygiene rule. The L1 arms PROP-TRG-03/PROP-TRG-06 now cite the TSPEC §7.2 obligation instead of AT-C5/C6/C7 (`:534-539`, `:546-551`), and the inline AT-C6 claim in PROP-TRG-06's body was dropped in a follow-up commit (`05c07075`) rather than left as a second citation channel |
| F-02 PROP-COR-12's baseline fixture path is owed to PLAN §5's ownership manifest, not only to T04's task text | Medium | **Resolved** (with one false claim in the new prose — F-02 below) | §4.3 (`:429-436`) and §13.3 erratum 3 (`:1836-1841`) now carry both halves. Re-measured: `PLAN:307` names only `pdlc/workflows/__tests__/consolidationHookParity.test.js`, and `grep -n "fixtures/" PLAN-*.md` returns **nothing** — no §5 row names any path under `pdlc/workflows/__tests__/fixtures/`. The consequence stated (authored but uncommitted under a pathspec-scoped wave commit) follows |
| F-03 §12.2 stated the spanning convention on the file axis only; §12.3's task axis was underivable | Medium | **Resolved** | §12.2 now states the convention on **both** axes and adds the per-block green rule (`:1653-1666`); §12.3's T01 row spells out why PROP-FIX-03 is filed under T04 on both axes (`:1701`), which is the case that made the two axes look inconsistent |
| F-07 (v1) hook facts pinned by name, not line index | Low | Still resolved | unchanged |

Claims I re-measured independently at HEAD, not taken from the document:

| Claim | Verdict |
|---|---|
| "the id set is byte-identical to v1.1's 118" (changelog `:25`) | **Exact.** Distinct `PROP-*` ids in `93e5d75b`'s blob and at HEAD are both 118, with an empty symmetric difference — no property was added, removed or renumbered. 118 − the 4 retired PROP-TRG ids = the 114 claimed at `:100` |
| PLAN T23 carries no register id | **Exact** — `PLAN:267` says so in its own heading, and its two blocks are the await-discipline case (T-13) and the release-across-terminal-statuses set-equality case |
| TSPEC §12.3 gives `consolidationPass.test.js` AT-C1, AT-C1b, AT-C2…AT-C8, AT-M1…AT-M6b, AT-M9, AT-M11 | **Exact** (`TSPEC:2497`) |
| AT-P7 is TSPEC-assigned to `consolidationHookParity.test.js` (PROP-COR-07's trailer) | **Exact** — that row carries AT-P7 plus two `(no FSPEC AT)` cases |
| **AT-P6 and AT-P10 are TSPEC-assigned to `consolidationPredicate.test.js`** | **Exact — and the document trails both to `consolidationPass.test.js`.** F-01 below |
| `pdlc/workflows/__tests__/fixtures/` "does not exist at HEAD" (`:432`) | **False.** F-02 below |

## 2. Findings

## 3. Questions

## 4. Positive Observations

## 5. Recommendation

## Verdict
