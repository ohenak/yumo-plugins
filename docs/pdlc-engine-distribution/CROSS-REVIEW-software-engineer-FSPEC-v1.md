# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.1)
**Date:** 2026-08-13
**Iteration:** 1
**Scope:** Technical lens — feasibility, implementability, completeness of error handling,
architectural compatibility, and verification of every existing-code claim against HEAD.

## Grounding pass

Every existing-code claim in the FSPEC was checked against the tree in one pass, per the
batching rule. Results, so a later round does not re-litigate them:

| Claim (FSPEC) | Verdict at HEAD | Evidence |
|---|---|---|
| `handshake.mjs` — `readPluginVersion`, `checkCompat`, `REMEDY` (F-1 §3, §5, Q-4) | **holds** | `pdlc/engine/lib/handshake.mjs:45,144,131` |
| `skills.mjs` — `resolvePluginRoot`, `PLUGIN_ROOT_ENV` (F-1 §3, F-4 §5) | **holds** | `pdlc/engine/lib/skills.mjs:204,54` |
| §5.1's two alphabets, five rows | **holds, exactly** | `.github/workflows/pr-tests.yml:28,78,112,138,196`; matrix `:40-41,87` |
| §5.2 "twelve `lib/*.mjs` at HEAD" | **holds** (12 files) | `pdlc/engine/lib/` |
| §5.2 / AC-1.3 "no `files` field today" | **holds** | `pdlc/engine/package.json` (no `files` key) |
| §5.2 "`pdlc/engine/__tests__/` sits inside the package root" | **holds** | `pdlc/engine/__tests__/` |
| F-2 step 1 — `pdlc/README.md`'s `## Install in another repo` exists and documents the plugin install | **holds** | `pdlc/README.md:132,137-141` |
| F-4 step 2 — `engine.*` namespace reserved by DEC-HE-02 | **holds** | `docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md:37` |
| F-5 step 7 — DEC-DIST-05 is public npm, scoped | **holds** | `docs/_decisions/DECISIONS-plugin-distribution.md:115` |
| §9 Q-6 — no BL-03/O-7 transcription in the decisions file | **holds** (DEC-DIST-01…05 only) | `docs/_decisions/DECISIONS-plugin-distribution.md` |
| F-1 step 2 — range resolution cited to `satisfiesRange` | **misattributed** | see F-05 |
| F-7 step 2 / AT-6.1 — plain `sync-workflows.sh` exits 0 | **holds only from a clean consumer state** | see F-06 |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
