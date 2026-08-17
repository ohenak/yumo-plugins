# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 1
**Scope:** Technical review — feasibility, cost, implementability, existing-code claim verification

## Verification Basis

Every existing-behaviour claim in the REQ was checked against the tree at HEAD on
`feat-pdlc-plugin-retirement`. Measurements re-taken 2026-08-17.

| REQ claim | HEAD | Verdict |
|---|---|---|
| M-1 `sync-workflows.sh` 33 KB | 32,939 B / 725 lines | ✅ |
| M-2 `lib/pdlc-drift.sh` 76 KB | 75,617 B / 1,955 lines, non-executable | ✅ |
| M-3 `check-workflow-drift.sh` 19 KB | 19,240 B / 381 lines | ✅ |
| M-4 `orchestrate-dev.bundle.js` 304 KB | **401,716 B (392 KB)** | ❌ 29% low |
| M-5 `orchestrate-queue.bundle.js` 303 KB | **401,020 B (392 KB)** | ❌ 29% low |
| M-6 `distribution-manifest.json` 1.1 KB | 1,464 B / 46 lines | ⚠️ 33% low |
| M-7 `build-runtime.mjs` 572 lines / 22.6 KB | **831 lines / 33,664 B** | ❌ 45% low |
| M-8 "83 test files in the suite" | **121 files in `pdlc/workflows/__tests__/`**; 179 `*.test.js` across workflows+engine | ❌ |
| M-9 `pdlc-cli.mjs` 476 KB | **679,956 B (664 KB)** | ❌ 39% low |
| §1.2 = the artifacts existing only for the runtime host | omits `pdlc/workflows/dist/consolidate-learnings.bundle.js` (present; emitted by M-7 at `build-runtime.mjs:715`) | ❌ |
| `.worktreeinclude`'s only row is `.claude/workflows/` | confirmed, single row | ✅ |
| `.gitignore` row ignoring the consumer copy | `.gitignore:33` (plus explanatory block `:13-32`) | ✅ |
| Two CI jobs + index-mode assertions in a third | `pr-tests.yml:122` `Generated artifacts are in sync`, `:148` `Fresh-clone bootstrap works`, `:206`/`:228-250` `Shell scripts parse` | ✅ |
| `SessionStart` drift-reporter hook entry | `pdlc/hooks/hooks.json:38-45` | ✅ |
| Queue drift gate + `distribution.checkEnabled` | `orchestrate-queue.js:1257-1320`, `:2285-2330`, `DRIFT_STATE_PATH` `:79` | ✅ |
| Document oracles police `dist/` | `document-oracles.mjs:177-178` (`DIST_REL`), `:102-104` (generated-tree exemption), `:593-594` (`git status -- pdlc/workflows/dist`) | ✅ |
| Four `RELEASE-CHECKLIST.md` sections | hits at `:12, :17, :22-23, :35, :60, :94, :102, :139, :148, :203-206, :226` | ✅ (≥4) |
| Phase MERGE guard names `pdlc/workflows/`, `.claude/workflows/` (O-4) | confirmed | ✅ |
| C-10 handshake is engine behaviour | **already shipped**: `pdlc/engine/package.json:19` `pdlcPluginCompat: "^0.23.0"`, `lib/handshake.mjs:144` `checkCompat`, `:159-168` missing-plugin refusal, `:176-177` out-of-range refusal, `:197-213` banner, `lib/report.mjs:54-79` version fields | ⚠️ pre-satisfied |
| O-7 "queue rows 6 and 7 … both `blocked`" | **row 6 = `pdlc-engineering-loop`, `pending`** (`QUEUE.md:78`); **row 7 `pdlc-install-mechanism` removed from the table 2026-08-13** (`QUEUE.md:45-46`) | ❌ |
| BL-01/BL-02 resolution = queue row `done` | both rows **removed** from the table (`QUEUE.md:34`, `:64`), never set `done` | ❌ |
| Versions in play | engine `0.2.1`, plugin `0.23.1`, compat `^0.23.0` ⇒ `>=0.23.0 <0.24.0` (`handshake.mjs:110-128`) | context for F-02 |

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
