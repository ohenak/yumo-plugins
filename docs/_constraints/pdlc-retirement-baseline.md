# Measured baseline — pdlc-plugin-retirement surface

Measured at commit `5a7904ca`, 2026-08-17, on `feat-pdlc-plugin-retirement`. Cited by id from
`REQ-pdlc-plugin-retirement.md` (§1.2) and re-derived, not trusted, before the first deletion
commit (that REQ's C-6). Every row is re-derivable with the command in **How to re-measure**.

Corrections re-measured at commit `63166245`, 2026-08-17: M-8's file count (21, not 22 — the
enumeration in its own cell lists 21), M-11k's documentation surface (CLAUDE.md's deep-dive prose
moved to `pdlc/OPERATIONS.md` at `a9b3e78a`; its `### Continuous integration` section restored at
`63166245`), plus new rows M-11l and M-11m. All other rows still re-derive exactly at that commit.

## M-rows — artifacts that exist only to serve the workflow-runtime host

| ID | Artifact | Measured (2026-08-17) | Disposition |
|---|---|---|---|
| M-1 | `pdlc/hooks/scripts/sync-workflows.sh` | 32,939 B / 725 lines | delete |
| M-2 | `pdlc/hooks/scripts/lib/pdlc-drift.sh` (sourced library, non-executable by design) | 75,617 B / 1,955 lines | delete |
| M-3 | `pdlc/hooks/scripts/check-workflow-drift.sh` | 19,240 B / 381 lines | delete |
| M-4 | `pdlc/workflows/dist/orchestrate-dev.bundle.js` | 401,716 B | delete |
| M-5 | `pdlc/workflows/dist/orchestrate-queue.bundle.js` | 401,020 B | delete |
| M-6 | `pdlc/workflows/dist/distribution-manifest.json` | 1,464 B / 46 lines | delete |
| M-7 | `pdlc/workflows/build-runtime.mjs` | 831 lines / 33,664 B | reduced — keeps emitting M-9 only |
| M-8 | Candidate dedicated test modules (`bootstrap`, `drift*` ×16, `queueDriftGate`, `runtimeBundle`, `worktreeInclude`, `hookCompatibility`) | 21 files / 15,109 lines, of 119 `*.test.js` in `pdlc/workflows/__tests__/` | delete or re-home per REQ R-8 |
| M-9 | `pdlc/workflows/dist/pdlc-cli.mjs` — the document-state probe CLI | 679,956 B | **survives** (REQ NG-2, G-5) |
| M-10 | `pdlc/workflows/dist/consolidate-learnings.bundle.js` | 417,952 B | delete — a workflow-runtime bundle like M-4/M-5 |

`pdlc/workflows/dist/` holds exactly these five files at the measured commit: M-4, M-5, M-6, M-9,
M-10. That set-equality is what the REQ's AC-1.1 asserts against.

## M-11 — named dependents outside the artifacts themselves

| Sub-id | Dependent |
|---|---|
| M-11a | `.github/workflows/pr-tests.yml` jobs `artifact-freshness`, `fresh-clone-bootstrap`, and the index-mode assertions inside `script-syntax` |
| M-11b | `.github/workflows/publish.yml`'s tag-triggered `gate` job — `build-runtime.mjs --check`, the rebuild-diff, the two-command bootstrap, `sync-workflows.sh --check`, and the executable-bit assertions naming all three scripts |
| M-11c | `pdlc/engine/__tests__/ci-arrangement.test.js` — `GATE_JOB_IDS` (job-id set), the CLAUDE.md CI-table set-equality, its prose **count word**, and the `publish.yml`-gate command set-equality |
| M-11d | `pdlc/engine/__tests__/smoke.test.js` — drift-gate blocking case and the `distribution.checkEnabled: false` clearances |
| M-11e | Tracked fixture trees `pdlc/engine/__tests__/fixtures/consumer-ac12/.claude/workflows/` (5 files) and `pdlc/workflows/__tests__/fixtures/covered-violations/.claude/workflows/` (1 file) |
| M-11f | `pdlc/workflows/__tests__/documentOracles.test.js` D-2 — asserts `CLAUDE.md` *contains* `check-workflow-drift.sh` and `sync-workflows.sh` |
| M-11g | `lib/document-oracles.mjs` — packaging and advertised-version checks over `pdlc/workflows/dist/`, and the drift scan's generated-tree exemptions |
| M-11h | `.claude/pdlc.config.example.json` — `implementation.postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`) and `implementation.postWavePathspecs` (`["pdlc/workflows/dist/"]`), documented in CLAUDE.md |
| M-11i | Queue drift gate and its `distribution.checkEnabled` key in `orchestrate-queue.js`; the `SessionStart` drift-reporter entry in `pdlc/hooks/hooks.json` |
| M-11j | `.worktreeinclude` (single row `.claude/workflows/`); `.gitignore`'s `/.claude/workflows/` row **and its 20-line rationale comment above it** |
| M-11k | `pdlc/RELEASE-CHECKLIST.md` (≥4 sections), both READMEs, CLAUDE.md's bootstrap/sync/drift/worktree/distribution-channel prose and its `### Continuous integration` section, header prose in the workflow modules |
| M-11l | `pdlc/OPERATIONS.md` — tracked instructional deep-dive created at `a9b3e78a`: `## Workflow scripts`, `## sync skips a row: \`unverified\` and \`--force\``, `## Worktrees` (self-created-worktree caveat), `## Distribution scripts` (names M-1, M-2, M-3 and their roles), `## Engine channel` |
| M-11m | `pdlc/engine/__tests__/fs-observation.test.js` — builds an `orchestrate-dev.bundle.js` path under the consumer workflows dir, and exercises the `distribution.checkEnabled: false` opt-out |

## A-1 — retired-name allow-list (measured 2026-08-17 at `63166245`)

The dependent sweep below (last command in **How to re-measure**) returns, besides the
machinery's own files, the two fixture trees of M-11e, this feature's own artifacts and the
delivered-feature archive and `docs/_queue/QUEUE.md`, exactly nine other tracked documents. They are historical or
superseding records, not instructions, so they are excluded from the REQ's AC-1.2
required-empty search by these path globs:

| Glob | Why excluded | Files it covers today |
|---|---|---|
| `docs/completed/**` | delivered-feature archive | — |
| `docs/discarded/**` | abandoned drafts, kept as record | 3 files |
| `docs/_decisions/**` | decision record; a superseded decision must name what it supersedes | `DECISIONS-plugin-distribution.md` |
| `docs/_constraints/pdlc-retirement-baseline.md` | this file — the measured inventory itself | this file |
| `**/LEARNINGS-*.md`, `**/POSTMORTEM-*.md` | post-mortem record of work already done | — |
| `docs/_queue/QUEUE.md` | queue prose, governed instead by the REQ's AC-2.3 | `QUEUE.md` |
| `docs/pdlc-plugin-retirement/**` | this feature's own artifacts | — |
| `docs/PLAN-*.md`, `docs/design/**`, `docs/{other feature}/PLAN-*.md` | planning documents of already-shipped features | `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/design/PROMPT-dev-orchestrate-dev-optimization.md`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` |

**Two allow-listed files must survive still carrying the retired names**:
`docs/_decisions/DECISIONS-plugin-distribution.md` (its superseding entry, required by the
REQ's BL-06 and AC-2.3, necessarily names the channel it supersedes) and this file (the REQ's
C-6 re-measurement and AC-1.3 depend on it). Without the allow-list those two obligations and
the required-empty search could not both be satisfied.

## How to re-measure

```sh
git rev-parse --short HEAD
wc -c pdlc/hooks/scripts/sync-workflows.sh pdlc/hooks/scripts/lib/pdlc-drift.sh \
      pdlc/hooks/scripts/check-workflow-drift.sh pdlc/workflows/dist/*
wc -l pdlc/workflows/build-runtime.mjs
ls pdlc/workflows/dist/                                   # M-row set-equality
ls pdlc/workflows/__tests__/*.test.js | wc -l              # suite size
git ls-files pdlc/workflows/__tests__ \
  | grep -E '/(bootstrap|drift[A-Za-z0-9]*|hookCompatibility|queueDriftGate|runtimeBundle|worktreeInclude)\.test\.js$' \
  | xargs wc -l                                            # M-8 file count and line total
grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled\|postWavePathspecs' \
  $(git ls-files)                                          # dependent sweep
```
