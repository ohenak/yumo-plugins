# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-merge-phase/PLAN-pdlc-merge-phase.md` (v1.0, commit `2f58d55`)
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** Product-lens review of the 17-task decomposition against TSPEC v1.2, FSPEC v1.3 and REQ v1.1 — obligation coverage (TSPEC §14 and §13.2/§13.4/§13.5 walked row by row against the task table), the two declared deviations, V1's checklist as the DoD gate, and scope compliance. Batch mechanics, test design and code structure are the SE/TE lenses, not mine.

## Findings

### 1. [blocking] Two of FSPEC §12's seven acceptance tests have no owning task

`AT-M2a` and `AT-M5` appear exactly once in this document — in §11's Definition of Done, which requires all seven to be "present and passing". Neither is named in any §12 task row:

- **AT-M2a** (AC-5.2's recovery path: an `awaiting-merge` row becoming `done` against an already-merged PR, the Evidence cell taking `{shortSha} #{n}` *or* `merged #{n}` per `O1.mergeCommit.oid`, `mergeMethod: unknown`, and the §9.4 note **not** emitted) is placed by TSPEC §13.2 in `mergeQueueWriteback.test.js`. B1's red-first list names AT-M1 and the no-downgrade rule; B2's names the byte-identity differential, the non-overwrite conjuncts and AT-M2. A7 names the row-3 fixture but not AT-M2a's assertions.
- **AT-M5** (AC-6.3's end-to-end effect: the dependent selected after `merged`, not selected when the row is left `awaiting-merge`, with the drift-gate precondition TSPEC §13.2 restates as a drift-state record carrying `checkEnabled: false` and empty `writeFailures`) is placed by TSPEC §13.2 in `mergeQueueDriver.test.js`. B3's red-first list names AT-M4, the `undefined mergeStatus` fallback, Q-02's boundary and the report pass-through — not AT-M5.

This matters more here than it would in a PLAN of the ordinary shape, because §2's deviation rests on it: the argument for dropping separate red-test rows is that "every task row names the acceptance tests it must red first", which is the property the SKILL's rule exists to secure. Where a row does not name one, the substitute does not hold for it. It also defeats §10's recovery rule — "a failure at any step re-opens the owning task" — since neither AT has one. AT-M5 is the only end-to-end evidence for the user-visible outcome this whole feature exists to produce (US-01/US-05: the dependent advances with no human turn), so it is the last obligation that should be implicit.

**Fix (two cells):** add AT-M2a to B2's red-first list (or A7's, if the already-merged fixture is judged the better home) and AT-M5 to B3's. No new task, no batch change, no dependency change.

### 2. [advisory] V1 cannot execute the K-1 measurement as written

§8 K-1 correctly refuses to infer `git rebase --empty=drop`'s ≥ 2.26 requirement from documentation (DC-02), and §10 step 5 tells V1 to "record in V1's commit message the two `git --version` readings from CI". V1 owns no files (§4) and runs before the PR exists — Phase PUB raises it after DoD and Harvest — so at V1 time there is no CI run to read, and producing one would need a step in `.github/workflows/pr-tests.yml`, a fifth file absent from §1's manifest. As written the obligation is unexecutable rather than merely unscheduled. Two clean resolutions, either acceptable to me: (a) name `.github/workflows/pr-tests.yml` as D2's file and add the one-line `git --version` step, making the measurement a CI artefact the DoD phase reads; or (b) re-scope §10 step 5 to "record the local reading and defer the two-runner measurement to the first CI run, with the plain-`rebase` fallback pre-approved if either runner is older". The behavioural risk is already contained — the fallback still fast-forwards and still drops already-applied patches — so this is about the obligation being dischargeable, not about the merge being unsafe.

### 3. [advisory] The two declared deviations are both acceptable, and the second is a genuine contribution

I am recording these as accepted rather than as findings so the disposition is explicit.

- **No separate red-test rows (§2).** Acceptable. The rule protects red-before-green ordering across concurrent agents; rule 2 already serialises every same-file task into its own batch, and `orchestrate-dev.js` is touched by nine tasks, so the split would double 17 rows to 34 and 12 batches to ~23 without introducing any concurrency for the extra edge to order. The PLAN states the deviation rather than complying in form, names the mechanical fix if PLAN-lint rejects it, and preserves the underlying property through per-row red-first AT lists — which is exactly why finding 1 must close before this argument is complete.
- **Task table last (§3).** Acceptable, and the evidence is better than the claim needed: two shipped PLANs in `docs/completed/` are shown parsing to 289 and 247 "tasks" and throwing on cycle detection, and the header-capture hazard (`forbids` matching `includes("id")`, `depends on` matching `includes("depend")`) was found against this document's own risk register and fixed by rewording. §11's last checkbox re-runs `parsePlanTasks` + `computeTopologicalBatches` after any edit above §12, which keeps the deviation from decaying. This is durable, cross-feature signal about the parser, not just a local layout choice — worth carrying into harvest.

### 4. [advisory] Test-home drift from TSPEC §13.2, undeclared

The PLAN introduces `mergePostMerge.test.js` (A6), which is not among TSPEC §13.2's eight named test files, and moves `evidenceCellFor` — which TSPEC §14 traces to `mergeQueueWriteback` — into it. The split is sensible: A6's unit-level `executeMerge`/`deleteRemoteBranch`/`updateDefaultBranch` coverage would otherwise collide with A7's `mergePhase.test.js` in the same file, which rule 2 forbids in the same batch. But it is a divergence from a reviewed document made silently. One line in §7 declaring it — "TSPEC §13.2's `mergePhase` coverage splits into `mergePhase` (phase-level) and `mergePostMerge` (helper-level); no assertion is dropped" — makes it reviewed rather than discovered, and lets the DoD phase trace §14's rows without wondering.

### 5. [advisory] §11's Definition of Done has no named verifier

§10's five-step checklist is explicitly owned by V1; §11's twelve boxes are not assigned to anyone. Several are not implied by the five steps — the 25-row count assertion, the seven ATs, "no seam named `_recordHalt` remains anywhere", "no new agent dispatch anywhere in the diff (NFR-4)". They will most likely be caught by Phase DOD's `dod-verify`, but the PLAN reads as if V1 is the gate. Add a sixth V1 step: "walk §11's checklist and record each box in the commit message" — which also gives finding 1's two ATs a verification home once they are assigned.

### 6. [advisory] Coverage walk — result, for the record

I traced every TSPEC §14 row, all eight O-M obligations and TSPEC §13.4/§13.5 against the task table. Apart from finding 1, nothing is dropped: O-M1 → R1; O-M2 → A5/B2/D1; O-M3 and O-M4 → A5; O-M5 → A1; **O-M6 → A9**, the one obligation the TSPEC assigned to the PLAN and the PLAN correctly owns; O-M7 → A7 (with A5's counts); O-M8 → A6. Every §14 row has a task: AC-1.2/1.2a/1.2b → A2/A5, AC-1.3 → A7, AC-1.6 and AC-6.1a → A4/A7, AC-2.3/2.5 → A4/A6, AC-2.6 → A6, AC-3.3–3.7 → A3, AC-4.2/4.3 → A4/A7, AC-5.2–5.8 → B1/B2/A6/A7, AC-5.6 and AC-6.3 → B3, AC-6.2a → A7, REQ-MERGE-07 → A1, NFR-1/2/4/5 → A4/A5/A6/A7/D1. §13.4's six existing-test updates are all placed (R1, A8, A9), and §13.5's four properties map to F1+B2 (no-evidence identity against goldens captured **before** B2 changes `updateQueueStatus`, which the `F1 → B1 → B2` chain enforces), A1 (config totality), A3 (guard additivity) and B2 (idempotence). **No scope creep found**: §7's absorbed `not-confirmed` catalogue extension is inside TSPEC §4.1's declared frozen-and-enumerable design and adds no behaviour, and V1 step 3's `sync-workflows.sh --check` is correctly marked advisory and touches only the untracked consumer copy.

## Verdict

VERDICT: REVISE
{"high": 1, "medium": 0, "low": 5}
