# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/PLAN-harden-harvest-guard.md (v1.0)
**Date:** 2026-07-02
**Iteration:** 1

Upstream baseline used: REQ v1.7 · FSPEC v1.4 · TSPEC v1.1 · DECISIONS v1.2 — all four version cites in the PLAN header were checked against the documents and match.

## Coverage verification performed (evidence, not impressions)

- **M-row binding:** the PLAN's TASK-03 nine-group summary was expanded against the TSPEC § 6.3 binding table it defers to and mechanically checked: the union of the nine base groups is exactly `{M01–M32, M34–M90}` with zero duplicates and zero omissions; M33 is discharged by the parameterized G6 re-run. `M33_RERUN_IDS` in TASK-01 (`M01, M02, M04–M24, M44–M54, M60–M64, M66–M67, M73–M74, M79–M80, M82, M84–M90`) is **verbatim identical** to the REQ v1.7 M33 enumeration.
- **S-row binding:** S01–S07 land exactly once (TASK-04 authors, TASK-07 greens), with the S-row coverage meta-test (TE F-07(a)) enforcing set-equality against `S_ROWS`.
- **Requirement → task landing:** REQ-GUARD-01 → TASK-08/09/11; REQ-GUARD-02 → TASK-08 (redirection classification)/TASK-09 (verbs)/TASK-11 (mv flow incl. step 2b, M87–M89); REQ-GUARD-03 → TASK-10 (G1–G10, thresholds as env vars read at invocation); REQ-GUARD-04 → TASK-07 (P1–P3 EREs, basename filter); REQ-GUARD-05 → TASK-01–05/14; REQ-GUARD-06 → TASK-06 (degraded, DEGRADED-precedence M71/M72) + TASK-08 (PARSE_ERROR intake, M41/M78/M81 presence-not-falsiness); REQ-GUARD-07 → TASK-10 (catalog, all six reason codes); NFR-01 → TASK-11 (D1 first) + TASK-05 (P-D1 table). FSPEC-GUARD-01–06 all land (04 → TASK-06, 05 → TASK-07, 03/06 → TASK-10). No requirement is dropped, narrowed, or reinterpreted.
- **CFD dispositions:** CFD-1 (TASK-06/12 env-clear, "pick one, don't stack both" carried), CFD-3 conjuncts incl. the falsifiable `then commit` (TASK-03/10), CFD-4 `piped input` marker for M21 (TASK-03/10), CFD-6 `SELF_TEST_MIN_CASES` floor (TASK-05/12), CFD-7 dispatch-map rule + set-equality audit (TASK-03), CFD-8 gate pin (TASK-05/12) — all bound. CFD-5 is folded into CFD-1 per DECISIONS v1.2, so its absence as a separate binding is correct. **CFD-2 honored:** TASK-13 explicitly forbids opening a REQ revision for the M77 fixture parenthetical.
- **Scope:** no out-of-scope behavior is planned. The supplementary layers (`--self-test`, P-D1, P-QUOTE) are sanctioned upstream (DEC-01, CFD-6/CFD-8, TSPEC § 6.6) and are kept outside matrix-row accounting, preserving REQ-GUARD-05's exactly-one obligation. `hooks.json` unchanged (C16). Oracle discipline is prefix + required substrings, never full prose (REQ-GUARD-07).
- **DoD check:** every REQ-GUARD-05 acceptance criterion (one asserting test per M/S row, single `npm test` command, no network I/O, PROP-COMPAT-05 migration) plus the REQ-GUARD-03 threshold documentation, REQ-GUARD-04 posture, and the CFD obligations appear as DoD checkboxes.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **Batch B3 schedules mutually interfering tasks: verification of each task executes a file another same-batch task is concurrently writing.** TASK-05 writes `guardMatrix.test.js` (P-D1/P-QUOTE/self-test-binding/CFD-8 tests, red-verified "against the current script"), while TASK-06 — same batch, parallel — (a) rewrites the very script TASK-05's red-verification runs against, and (b) must execute `guardMatrix.test.js` (its Test File column: "red rows from TASK-03: M42, M43, M68–M72") to discharge its green checkpoint and its "never make a previously-green row red" obligation. So TASK-06's checkpoint runs a test file mid-edit by TASK-05, and TASK-05's 🔴 verification runs against a guard script mid-rewrite by TASK-06 — both checkpoints are unreliable while the batch is in flight. The PLAN's own batching rule ("tasks in the same batch never touch the same file") is honored only under a write-target-only reading; the claim "no two same-batch tasks share a file target" ignores that both tasks name `guardMatrix.test.js` in their Test File column. **Required change:** serialize the pair — e.g. add TASK-05 to TASK-06's Depends-on (B3 becomes TASK-05 + TASK-07; TASK-06 heads the serial chain in its own batch), or move TASK-05 into its own batch between B2 and B3. | REQ-GUARD-05 (checkpoint integrity); PLAN batching rule |
| F-02 | Low | Local | **Meta-test accounting is internally inconsistent: the DoD demands "four self-audit meta-tests" but the tasks as written produce three.** TASK-03 folds the CFD-7 dispatch-map key-equality into meta-test (1) as a third conjunct (a sanctioned CFD-7 option) and defines meta-test (2); TASK-04 defines meta-test (3). DoD bullet 2 and TASK-14 ("the four self-audit meta-tests prove the accounting") therefore name a checklist item that cannot be checked literally against the shape TASK-03 mandates. Align the wording (e.g. "four audit conjuncts across three meta-tests") or mandate a separate meta-test 4. | REQ-GUARD-05; CFD-7 |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The mechanical self-audit design (shared `guardRowIds.js`, set-equality + length checks, dispatch-map key equality) makes the M01–M90/S01–S07 exactly-one obligation structurally enforced rather than review-dependent — the strongest possible discharge of REQ-GUARD-05.
- `M33_RERUN_IDS` matches the REQ v1.7 enumeration character-for-character, and the plan names it as the single maintained comparison source per TE F-07(b).
- Fail-closed posture is preserved at every intermediate commit of the serial chain (TASK-06 placeholder exits 2; TASK-08 installs the top-level handler first) — the REQ's core product promise is never suspended mid-implementation.
- CFD-2's no-REQ-touch constraint is carried into TASK-13 verbatim, and the docs sweep confines itself to making existing hook descriptions truthful about the new fail-closed semantics — no new product surface.
- The DoD checklist is a faithful superset of the REQ acceptance criteria (single command, one test per row, hermetic/no-network, thresholds documented, advisory posture of the scope check retained).

## Recommendation

**Needs revision**

Exactly what must change:
1. **F-01 (Medium):** break the B3 mutual interference — serialize TASK-05 relative to TASK-06 (add a Depends-on edge or re-batch) so no task's red/green checkpoint executes a file or script another same-batch task is concurrently writing.
2. **F-02 (Low):** reconcile the "four self-audit meta-tests" count in DoD bullet 2 / TASK-14 with TASK-03's folded-conjunct implementation, or split out meta-test 4.
