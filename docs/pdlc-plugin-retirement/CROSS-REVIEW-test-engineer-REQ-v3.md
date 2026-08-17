# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.6, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 3
**Scope:** delta re-review of `5d8ecd7b..13cf04b2` — round-2 finding resolution, plus new
testability defects inside the sections that commit changed. Unchanged, already-approved
sections were not re-litigated.

Every existing-behaviour claim added this round was re-derived at HEAD rather than read
back from the documents that assert it.

## Round-2 disposition

| Round-2 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.2 (`REQ:233-245`) now excludes the *measured* allow-list **A-1** of `docs/_constraints/pdlc-retirement-baseline.md:48-71` instead of an inline glob list. I re-ran A-1's own sweep command (`grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled\|postWavePathspecs' $(git ls-files)`) at HEAD: subtracting the machinery's own files, the two M-11e fixture trees, `docs/completed/**`, `docs/_queue/QUEUE.md` and this feature's own directory leaves **exactly the nine documents** A-1 enumerates — `pdlc-retirement-baseline.md`, `DECISIONS-plugin-distribution.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/design/PROMPT-dev-orchestrate-dev-optimization.md`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` and the three `docs/discarded/` files. The allow-list is complete, and `baseline:67-71` names the two files that must survive **carrying** the retired names, reconciling AC-1.2's required-empty result with BL-06/AC-2.3 explicitly. |
| F-02 | Medium | **Resolved** | AC-1.2's M-11h term is now scoped to "the wave-gate keys of M-11h **that the sweep retires**", with the key set following the post-sweep build-step disposition resolved under O-3 (`REQ:236-238`, `REQ:443-450`). The term now names only what must be gone, so a surviving `postWaveCommand` pointing at a reduced build script is neither a pass nor a fail by accident. |
| F-03 | Medium | **Resolved** | AC-1.1 now states the branch (`dist/` set-equals `{M-9}` vs. relocated single path) is pinned at C-6 re-measurement time alongside AC-1.3's literal count, "a test author never chooses the branch" (`REQ:230-232`), and O-3 carries the matching resolution owner (`REQ:449-450`). |

New material in this round that I verified independently rather than accepting:

- **C-7's green-start claim** (`REQ:199-205`) — "the engine suite is green at pre-sweep HEAD as
  of 2026-08-17" — holds. `npm test` in `pdlc/engine` at HEAD: `# tests 842`, `# pass 840`,
  `# fail 0`, exit 0. (Local caveat, not a REQ defect: an inherited `NODE_TEST_CONTEXT`
  environment variable makes the runner collect zero files and then fail
  `_assert-suite-wide.mjs` with "empty union"; `env -u NODE_TEST_CONTEXT npm test` is the honest
  invocation. Worth a line in the FSPEC's AC-1.8 replay command set, since the replay is run
  by hand on a developer machine, not by hosted CI.)
- **The oracle's subject is back in place**: CLAUDE.md carries `### Continuous integration`
  (`CLAUDE.md:66`), which `pdlc/engine/__tests__/ci-arrangement.test.js` asserts.
- **M-11l is real**: `pdlc/OPERATIONS.md` exists, created at `a9b3e78a`, and carries the
  `unverified`/`--force`, worktree and distribution-script material AC-2.1 now names.
- **M-11m is real**: `pdlc/engine/__tests__/fs-observation.test.js:83` builds an
  `orchestrate-dev.bundle.js` path under the consumer workflows dir and `:207` exercises the
  `distribution.checkEnabled: false` opt-out.
- **AC-1.7's arithmetic checks out**: `pdlc/hooks/hooks.json` registers five entries —
  `PreToolUse:Bash` → guard-harvest-before-delete; `PostToolUse:Write|Edit` → check-scope-field,
  check-req-size; two `SessionStart` entries → nudge-consolidation, check-workflow-drift. Minus
  the drift reporter leaves four, and the surviving `SessionStart` entry is exactly the case the
  new set-equality wording protects.
