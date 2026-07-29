## T-45

| Property | Subject | Mutation (named before run) | Red observed | Revert verified | Task |
|---|---|---|---|---|---|
| PROP-MTM-02 (hook half) | `pdlc/hooks/scripts/check-workflow-drift.sh` | Relabel the hook's single classify pass: `pdlc_classify_all "as-found"` → `pdlc_classify_all "post-run"`. A grammar-valid but wrong pass name — the hook copies nothing, so its one pass can only be the as-found one (TSPEC §4.1, O-20(b)) | 2 failed, 13 skipped, 0 passed. First failure: `PROP-MTM-02 (hook half) — trace carries exactly one classify pass, labelled as-found › case 0 (row-1=unverified, row-2=in-sync) — single as-found pass, both readings coincide` — `expect(distinctPhases).toEqual(["as-found"])` → `- "as-found"` / `+ "post-run"` (`__tests__/driftHook.test.js:430`). Case 1 failed identically | Reverted; `npm test -- __tests__/driftHook.test.js` → 15/15 passed; `git diff` over the subject carries only the batch-12 phase-label correction described below, no mutation residue | T-45 |
| PROP-MTM-04 (hook half, conjunct 1) | `pdlc/hooks/scripts/check-workflow-drift.sh` | Fabricate the pass conjunct 1 forbids on a non-sync entrypoint: insert a second `pdlc_classify_all "post-copy" \|\| true` immediately after the as-found pass. Nothing was copied, so the pass is a pure fabrication — exactly what "on a non-sync entrypoint there is no post-copy pass at all" (PROPERTIES §7) denies | 1 failed, 14 skipped, 0 passed. First failure: `PROP-MTM-04 (hook half) — conjunct 1: supersedingState is the as-found pass's measurement › retiredPresent[].supersedingState equals R's as-found state, and no post-copy/post-run phase is fabricated` — `expect(distinctPhases).toEqual(["as-found"])` → `Array [ "as-found", + "post-copy" ]` (`__tests__/driftHook.test.js:501`) | Reverted; `npm test -- __tests__/driftHook.test.js` → 15/15 passed; `git diff` over the subject carries only the phase-label correction, no mutation residue | T-45 |
| PROP-NEG-04 (hook half) | `pdlc/hooks/scripts/check-workflow-drift.sh` | Insert `exit 0` immediately after the §4.2 step 9 drift-state write (before the "§5.2 — the warning taxonomy" block, i.e. before the `if [ "$_pdlc_baseline_status" != "resolved" ]; then` guard at the top of the warning-emission section) — short-circuits the hook so it exits before printing any W-1..W-6 line, over every one of this file's three generated trees | 3 failed, 12 skipped, 0 passed. First failure: `generic degraded case (unresolved baseline, manifest-absent) — the hook emits a matched W-1 line` — `expect(countOf(run.stderr, "W-1")).toBeGreaterThanOrEqual(1)` → `Expected: >= 1, Received: 0` (`__tests__/driftHook.test.js:539`). The row-2 (`checkEnabled:false`/W-5) and row-8 (`unverified`/`local-edit`/W-3,W-4) exception cases failed identically (`Received: 0`) | Reverted via `git checkout -- pdlc/hooks/scripts/check-workflow-drift.sh`; `git diff --exit-code` clean at the time; re-ran `npm test -- __tests__/driftHook.test.js -t "PROP-NEG-04"` → 3 passed, 12 skipped | T-45 |

## Residuals

| Property | Reason no mutation is nameable | Task |
|---|---|---|
| *(none)* | | |

### Note — production defect found and fixed while landing this task

T-45's PROP-MTM-02 and PROP-MTM-04 were first reported as residuals against a real C2 defect:
`check-workflow-drift.sh` called `pdlc_classify_all "hook"`, stamping `phase = "hook"` onto every
`classify` trace record. `phase` is the trace **pass** name — TSPEC §4.1's grammar is
`phase ::= "as-found" | "post-copy" | "post-run" | "run"`, with `classify` records restricted to the
first three (§4.2, TSPEC:784) — and it is not the entrypoint, which is carried separately by
`generatedBy` (FSPEC §6.2). C3 already passed the correct literals (`"as-found"` at
`sync-workflows.sh:227`, `"post-run"` at `:514`); only the hook entrypoint was wrong, which is why
`--check` was unaffected. The orchestrator corrected the call site to `"as-found"` — the hook makes
one pass and never copies, so that pass is the as-found one by construction, which is also what
O-20(b)'s "hook/`--check` coincide" requires. Both properties are green above, each with its own
falsification run, and neither test file needed changing: the tests already encoded the spec.
