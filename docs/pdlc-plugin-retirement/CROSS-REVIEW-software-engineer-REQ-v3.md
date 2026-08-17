# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.6, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 3

**Scope:** Delta re-review of the v0.5 → v0.6 diff (`a9b3e78a..HEAD`, REQ touched at `13cf04b2`;
baseline errata at `4cc285de`; CLAUDE.md CI section restored at `63166245`). Round-2 findings
re-checked against the tree, then only changed sections scanned for new issues.

## Round-2 Disposition

All three round-2 High findings are resolved on the tree, not only in prose.

| Round-2 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-19 (`pdlc/OPERATIONS.md` absent from the sweep inventory) | High | **Resolved** | Baseline gains **M-11l**, enumerating the file's retired sections; §1.2 cites M-11a…M-11m; G-3 names `pdlc/OPERATIONS.md` in the one-story doc set; AC-2.1's reader set names it explicitly with "those sections are removed, not left behind a pointer"; O-5 and R-7 both name it. Re-derived: `pdlc/OPERATIONS.md` carries `## Workflow scripts and the runtime build:5`, `## When sync skips a row: \`unverified\` and \`--force\`:72`, `## Worktrees:85`, `## Distribution scripts:128`, `## The engine channel (\`pdlc/engine\`):136` — matching M-11l's enumeration. |
| F-20 (surviving-hook criterion was absence + partial positive) | High | **Resolved** | AC-1.7 now reads "its registered hook-entry set **set-equals** the pre-sweep listing minus exactly one entry, the drift reporter", and names the second `SessionStart` entry as the reason. Verified against `pdlc/hooks/hooks.json`: five entries, two under `SessionStart` — `nudge-consolidation.sh:34` (survives) and `check-workflow-drift.sh:42` (retires). AC-3.3 now positively asserts the consolidation nudge reaches the human session; O-1's default was widened to match. |
| F-21 (engine suite red at the pre-sweep baseline C-7 presupposes) | High | **Resolved** | `63166245` restored `### Continuous integration` to `CLAUDE.md:66`, leaving `pdlc/OPERATIONS.md:59` as rationale-only prose that points at it. Re-measured at HEAD: `npm test` in `pdlc/engine` exits 0 — `# tests 842 / # pass 840 / # fail 0 / # skipped 2`, the two skips being the registered capability skips of T50, not the arrangement oracle. C-7 now states the green start as a measured fact plus a repair obligation; AC-1.4c is restated against it and folds in M-11m. |

Round-2 Medium/Low: none were open. Round-2 Q-08 is answered by C-7's new sentences; Q-09 is
answered by AC-2.1's "removed, not left behind a pointer" plus M-11l's section-level enumeration,
which leaves `## The engine channel` out of the retired set.

**Measurement hazard worth recording (Process, see F-25).** My first three attempts to run the
engine suite reported success with no TAP output at all, because this session's environment
carries `NODE_TEST_CONTEXT=child-v8`; `node --test` then declines to run files ("run() is being
called recursively within a test file") and exits 0, so the runner's step 3 passes vacuously and
only `_assert-suite-wide.mjs` fails, with the misleading `empty union` message. The suite is
genuinely green only under `env -u NODE_TEST_CONTEXT npm test`. Any AC-1.8 replay or AC-1.4c
per-commit run driven from an agent session inherits this and can record a vacuous green.

## Findings

## Delta tags

## Questions

## Positive Observations

## Recommendation

## Verdict
