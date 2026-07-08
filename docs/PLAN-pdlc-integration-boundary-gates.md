# PLAN — pdlc-integration-boundary-gates

| Field | Value |
|---|---|
| Repo | `/Volumes/T9/workspace/yumo-plugins` |
| Base branch | `feat-phase-model-selection` (the 0.7.0 lineage the installed plugin cache runs; `main` is behind it) |
| Work branch | `feat-integration-boundary-gates` (create off base) |
| Author of plan | Fable 5 (planning + verification); implementation assigned to Opus |
| Date | 2026-07-08 |
| Motivation | regime-ledger gap post-mortem (`regime-ledger/docs/orchestrator-macro-gap-closure/overview.md`): 5 shipped integration gaps traced to (a) DoD never challenging adjacent surfaces, (b) ACs traced to node output instead of the final artifact, (c) deferrals bound to runbook steps that never ship, (d) stale orchestrate-dev docs (says four DoD criteria; skill has five) |

## Ground rules for the implementer

- **Do not touch** the untracked `pdlc/workflows/__tests__/guardMatrix.test.js` (someone else's WIP).
- **Do not rebase or modify** `feat-phase-model-selection`; branch off it.
- Additive only: the `DOD_STATUS` trailer contract gains one key; existing keys, order-insensitive parsing, and all current tests keep passing.
- Test runner: `cd pdlc/workflows && node --experimental-vm-modules node_modules/jest/bin/jest.js`
  (the package is **Jest-based**; the plan's original `npx vitest run` was a planner error —
  bare vitest fails on Jest globals. `npx vitest run --globals` also works. Corrected during
  verification 2026-07-08.) All green before done.
- Commit style: conventional commits, one commit per change-group is fine.

## Changes

### C1 — `pdlc/skills/dod-verify/SKILL.md`: add Criterion 6, harden Criterion 5

1. Rename section "The Five DoD Criteria" → "The Six DoD Criteria"; update the frontmatter
   `description` and the closing "Communication Style" paragraph ("four mechanical criteria
   guard code quality; criterion 5 guards intent" → mechanical criteria 1–4, criterion 5
   guards intent, criterion 6 guards the integration boundary; "all five"→"all six" wherever
   it appears).

2. **New "### 6. Integration-Boundary Integrity"** with two checks (this is the criterion
   that would have caught the stale-disclosure, sibling-tool, and runbook-deferral gaps):

   **(a) Adjacent-surface falsification.**
   - Does this diff make any *existing* artifact, disclosure string, comment, config
     default, or doc claim **false**? (Example class: a feature implements size caps while a
     shipped `DEFERRED_SAFETY_GUARDRAILS` constant still discloses them as "not yet
     implemented".)
   - Does a **same-shape sibling surface** remain unhandled and unacknowledged? When the
     feature modifies one member of a family — one `tools/get_*` fetch tool among several,
     one writer of an artifact that has other writers — enumerate the family (`grep`/glob)
     and require each sibling be either covered or explicitly out-of-scope in the REQ.
   - Challenger moves: for every output file the feature writes, `grep` for **other writers
     of the same file/key** and check whether a later stage overwrites the feature's value;
     for every constant/disclosure/docstring in touched modules, ask "is this still true
     after the diff?"
   - Findings scope-tag: `Cross-Feature`.

   **(b) Deferral binding.**
   - Every deferral this feature introduces or leaves in place (docs saying "deferred",
     TODO-with-successor comments, DECISIONS deferral entries) must name a successor that
     exists **as a row in the consuming repo's queue** (`docs/_queue/QUEUE.md` when present;
     otherwise a named successor REQ file must exist in `docs/`). A "runbook step",
     "operator config", or bare prose mention is **not** a successor — post-mortem showed
     those never ship.
   - Document each unbound deferral: location, the deferral text, and the missing queue
     row/REQ.

3. **Criterion 5 hardening — final-artifact tracing.** Add a challenger move to §5:
   - "Trace each AC to the **final operator-visible artifact** (the file/endpoint/record
     after the full production path, including any entry-point re-render or post-graph
     overwrite) — not to the node/builder output. Enumerate **all** writers of the traced
     output (grep the filename/key); if a later writer can overwrite the traced value, the
     AC is not delivered unless a test pins the final artifact." (Example class: writer
     node emits real `subagent_tokens`; entry-point re-render clobbers it with 0.)

4. **Trailer update.** In the "Violations found" block, extend the JSON to:
   `{"stubs": N, "mock_data": N, "unwired_integrations": N, "coverage_below_threshold": BOOL, "branch_coverage_pct": N, "req_gaps": N, "boundary_gaps": N}`
   and add the key description: `boundary_gaps` — count of criterion-6 findings
   (adjacent-surface falsifications + sibling omissions + unbound deferrals). Execution
   steps + output format sections updated accordingly (5 paragraphs → 6).

### C2 — `pdlc/workflows/orchestrate-dev.js`: prompt + parser (additive)

1. `dodVerifyPrompt(...)`:
   - Extend the numbered scan list with criterion 6 (both checks, one or two lines each,
     mirroring C1 phrasing compactly).
   - Extend criterion 5's line with the final-artifact clause: "trace to the FINAL
     operator-visible artifact (after any entry-point re-render/overwrite); enumerate all
     writers of the traced output".
   - Final line: "End with the DOD_STATUS trailer including req_gaps and boundary_gaps in
     the JSON."
2. `parseDodStatus(...)`: add `boundary_gaps` additively —
   - `fallback`, `failedZeros`: `boundary_gaps: 0`; `passed` block: `boundary_gaps: 0`.
   - Parsed branch: same `Number.isInteger(...) && >= 0` clamp pattern as `req_gaps`.
   - Update the JSDoc `@returns` type.
3. Sweep the file's comments for "four criteria"/"five criteria" phrasing and correct to
   six (grep; the DOD section header comments).

### C3 — `pdlc/skills/orchestrate-dev/SKILL.md`: stale DoD summary

The "Definition of Done Verification (Phase DOD)" section currently enumerates **four**
criteria; the skill has had five since v0.7.0 and gains a sixth here. Replace the inline
4-item list with the 6-item list (one line each), or — preferred — a one-line pointer:
"six criteria — see `dod-verify` SKILL.md" plus the 6 names, so the two files cannot drift
apart silently again.

### C4 — `pdlc/skills/pm-author/SKILL.md`: deferral rule at authoring time

Add step **5c — Deferral binding obligation** (sibling of 5a/5b): "Any capability this REQ
explicitly defers must be bound, at REQ acceptance, to a successor that exists as a queue
row (draft acceptable) or a named successor REQ file. 'Runbook step', 'operator config',
or prose intent is not a successor. An unbound deferral is a blocking gap." Add the
matching checkbox to the Requirements Document quality checklist.

### C5 — `pdlc/README.md`: no-REQ-commit convention (one paragraph)

Add an "Operator conventions" note: changes touching an **entry point, a repo-default
config, or a shared artifact writer** go through the queue (or minimally a standalone
`dod-verify` pass) — the two worst post-mortem gaps shipped in ad-hoc `feat(...)` commits
with no REQ/PLAN/DoD.

### C6 — `pdlc/plugin.json`: version `0.7.0` → `0.8.0`.

### C7 — Tests (`pdlc/workflows/__tests__/`)

1. `dodPhase.test.js` — extend the `parseDodStatus` suite, mirroring the `req_gaps`
   patterns exactly:
   - parses `boundary_gaps` when present;
   - defaults to 0 when omitted (backward compat — old-format trailers still parse);
   - clamps negative to 0;
   - `passed` and malformed-JSON paths carry `boundary_gaps: 0`.
2. If any existing test pins the `dodVerifyPrompt` text or the SKILL.md contents
   (`skillFiles.test.js`, `orchestrateDevSkill.test.js` — check), update those pins to the
   new six-criteria text rather than weakening them.
3. `cd pdlc/workflows && npx vitest run` — everything green.

### C8 — Consumer-copy sync (other repo, do LAST)

Per the documented manual-copy convention (`orchestrate-dev` SKILL.md §Workflow Script
Path): copy the updated `pdlc/workflows/orchestrate-dev.js` over
`/Volumes/T9/workspace/regime-ledger/.claude/workflows/orchestrate-dev.js` **byte-identical**.
Do NOT commit in regime-ledger — leave the copy in the working tree; the operator/verifier
handles that repo's commit separately (it has its own in-flight branches).

## Out of scope

- Any behavior change to the remediation loop, iteration caps, model selection, or Phase
  PUB/CI logic.
- Renaming existing trailer keys or criteria 1–5 semantics.
- The plugin cache under `~/.claude/plugins/cache/` (operator refreshes after the version
  bump; note-only).
- `guardMatrix.test.js` (untracked WIP).

## Acceptance criteria (verifier checklist — Fable 5 runs this)

Verified 2026-07-08 by Fable 5 (implementation: Opus, commits `1dfff39`/`e39d12e`/`3cc1aea`).

- [x] AC-1: `dod-verify/SKILL.md` has six criteria; criterion 6 contains both checks (a)
      adjacent-surface + sibling enumeration, (b) deferral-needs-queue-row; criterion 5
      contains the final-artifact/all-writers clause; trailer JSON documents
      `boundary_gaps`. *(Verified: §6 at line 124, both checks; §5 clause at line 115;
      trailer + key description at lines 224/234; zero stale five/four phrases.)*
- [x] AC-2: `dodVerifyPrompt` mirrors all of AC-1 (6 items + final-artifact clause +
      boundary_gaps in the trailer instruction). *(Verified in source.)*
- [x] AC-3: `parseDodStatus` returns `boundary_gaps` on all five return paths (fallback /
      passed / failed-no-JSON / failed-bad-JSON / failed-parsed — the last two share
      `failedZeros`), clamped like `req_gaps`; old-format trailers still parse with 0.
      *(Verified: lines 661/697/722/744 + JSDoc.)*
- [x] AC-4: `orchestrate-dev/SKILL.md` points to dod-verify SKILL.md as single source of
      truth + names the six. *(Verified.)*
- [x] AC-5: `pm-author/SKILL.md` has step 5c + the deferred-capability checklist item.
      *(Verified.)*
- [x] AC-6: README "Operator conventions" present; plugin.json at 0.8.0. *(Verified.)*
- [x] AC-7: Jest suite green — 276/276 tests pass; the single failing *suite* is the
      pre-existing untracked WIP `guardMatrix.test.js` (module-not-found on its own missing
      fixture, unrelated). New boundary_gaps tests present: present/omitted-compat/
      negative-clamp/passed-path + prompt-instruction + field-presence pins. *(Ran by
      verifier.)*
- [x] AC-8: regime-ledger consumer copy byte-identical (`diff` empty), tracked-modified,
      uncommitted. *(Verified.)*
- [x] AC-9: diff vs base = exactly the C1–C8 file set + this plan; `guardMatrix.test.js`
      untouched; base `feat-phase-model-selection` still at `1e3bcde`. *(Verified.)*

## Post-verification operator steps (not automated)

1. Push `feat-integration-boundary-gates` + open PR in `yumo-plugins` (target:
   `feat-phase-model-selection` or `main` per your branch strategy — main is behind the
   0.7.0 lineage).
2. Refresh the installed plugin cache to 0.8.0 (reinstall/update; cache dir is versioned).
3. Commit the synced consumer copy in `regime-ledger`
   (`.claude/workflows/orchestrate-dev.js`) on a housekeeping branch.
