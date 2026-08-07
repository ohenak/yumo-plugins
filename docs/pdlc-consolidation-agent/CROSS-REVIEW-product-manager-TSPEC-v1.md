# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.0)
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** Local (per-finding tags in the table)

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **`skipped-cadence` is routed through the single exit, which the REQ forbids.** §10.1 states `finishPass` "performs steps 14–16 **unconditionally**: append the terminal row, run §9.4's commit, release the marker … there is only one exit", and carves out no status. But `skipped-cadence` is a terminating branch (§7.2's `triggerFor` returns it), and AC-7.2 requires that tick to write **no log row**, AC-1.1 that it exit "having read no LEARNINGS body … and writes no log row", and FSPEC §2.4 that it "must not … append any record to the log, or make any git call". FSPEC §2.2 states the exception explicitly ("The one terminal branch that is **not** a jump is step 4's `skipped-cadence`"); this TSPEC drops it. As written, the mechanism appends a row per `/loop` tick — the unbounded-growth failure AC-7.2's exemption exists to prevent, and it corrupts the cadence datum every tick (REQ-CONS-01, "ticking cannot advance the datum"). `skipped-cadence` appears nowhere in the TSPEC outside the type union and `triggerFor`'s return. | AC-7.2, AC-1.1, AC-1.3 table row 6 |
| F-02 | High | Local | **A `refused` pass commits, per §10.1.** AC-1.3's Commits column for `refused` is "**no** — it writes its AC-7.2 row but commits nothing" (restated at FSPEC §4.3 and §4.4, with the reason: a pathspec stages a whole file, so a refused commit would capture the winner's log at an arbitrary mid-pass instant). §10.1's unconditional `finishPass` runs §9.4's commit on every termination, including step 6's `refused`. The marker release is guarded by `PassState.markerHeld` (§6.1) but the commit and row have no analogous guard stated. | AC-1.3 |
| F-03 | High | Local | **A retirement or revision of a consuming-repo promotion would be *applied*, not proposed.** AC-5.4: a promotion that landed in `DOMAIN-CONSTRAINTS.md` or `DECISIONS-{topic}.md` "has its retirement written into `CONSOLIDATION-PROPOSAL-{passId}.md` for operator approval, **never** applied by the pass" (FSPEC §8.6 row 2). The TSPEC's routing mechanism is `routeOf(target: string): Route` (§7.6) — a pure function of the target path **only**, which returns `constraints` for `DOMAIN-CONSTRAINTS.md` and `decisions` for `DECISIONS-*.md`, i.e. the consuming-repo *append* route. Neither §7.6 nor §7.5's `remediationChoice` nor §4.1's call graph states that a proposal whose `action` is `revise` / `retire` diverts to the proposal file. An implementer following §7.6 removes or rewrites a promoted constraint in the consuming repo — the exact "never applied" prohibition AC-5.4 makes the whole propose-only symmetry rest on. | AC-5.4, AC-5.3 |
| F-04 | High | Local | **The two operator-facing artifacts have no named mechanism.** Every log/report surface gets a named pure renderer (§7.9: `renderConsumedPair`, `renderFailureModeRecord`, `renderEffectivenessTable`, `renderTerminalRow`, `renderReportBody`). The **PR body** and the **proposal file** get none — no function, no §4.1 graph node, no §12.2 discharge row, no §12.3 test file. Three ACs land on those bytes and are therefore unassigned: AC-3.2 (body cites the source LEARNINGS by feature name, the failure mode, and the AC-2.3 pattern evidence); AC-3.7(c) and the REQ-CONS-03 preamble (the body carries `PDLC-CONSOLIDATION-PASS` and a `PDLC-CONSOLIDATION-PROMOTIONS` trailer **set-equal to the proposals the PR enacts** — the NFR-4 duplicate key); AC-3.5 (the proposal file carries "the full proposed diff inline" plus the failure class "recorded by name"). The asymmetry is load-bearing, not cosmetic: §7.6's `enactedByPr` *reads* `PDLC-CONSOLIDATION-PROMOTIONS`, so the pass's own idempotence depends on a writer this document never names, and §9.2 mentions the body only as "written to a file in the clone" for `--body-file`. | AC-3.2, AC-3.5, AC-3.7, NFR-4 |
| F-05 | Medium | Cross-Feature | **§12.4's vocabulary-conformance claim is not true, and the gap is not recorded as an erratum.** §12.4 asserts "No value used in this document lacks a `pdlc-consolidation-vocabularies.md` §1 row at `Version` 1.4", listing three known gaps (ER-1, ER-2, ER-5). But §7.6's own prose gives `routeOf` a fourth outcome — "routes every other consuming-repo path to the proposal file" (FSPEC §5.1 row 4, "proposal file only") — and the declared return type `Route = "constraints" \| "decisions" \| "PR" \| "degraded"` (§6.1) cannot express it, so `FailureModeRecord.route` (§6.2, a closed eight-field record required on every kind) is unwritable for that promotion. The `Route` union is transcribed correctly from vocabularies §1 line 28, so the defect is upstream — but this layer used the value, claimed full conformance, and raised no erratum. See the ERRATUM line in the review message. | AC-5.4, REQ §4b |
| F-06 | Low | Local | **Two `build-runtime.mjs` citations point at comment lines rather than declarations.** §3.1 cites "`stripModuleSyntax` / `wrapModule` (`build-runtime.mjs:44`, `:56`)"; at HEAD `:44` is the doc comment `/** Strip ES module syntax … */` (the declaration is `:45`) and `:56` is `return [` inside `wrapModule`, whose declaration is `:55`. Every other `file:line` in the document verified exactly. | — |

## Questions

<!-- filled below -->

## Positive Observations

<!-- filled below -->

## Recommendation

<!-- filled below -->
