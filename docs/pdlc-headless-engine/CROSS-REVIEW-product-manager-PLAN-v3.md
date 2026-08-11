# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.2)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review: disposition of F-01…F-04 from `CROSS-REVIEW-product-manager-PLAN-v2.md`, then new issues in changed sections only.

**Delta basis:** `git diff 96ed9304..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (134 insertions, 56 deletions) across §0 changelog, §3 (T11, T17, T42), §5, §6, §8, §9, §10, §11. Unchanged sections are not re-litigated.

## Disposition of v2 findings

| v2 | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | I compared the two plan literals against HEAD's config token for token, programmatically: `.claude/pdlc.config.json:3` is `cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`, and both plan occurrences (§8's DoD item, §11's fenced block) are that exact string with `cd pdlc/engine && npm test && cd ../workflows && ` prepended — all four patterns, `'documentOracles'` included. Set-equality, as the item's own wording demands. The *reason* given for carrying it is wrong, which is F-01 below, but the value is right and the High is closed |
| F-02 | Medium | **Resolved** | §9's AC-1.5 Red cell now reads `— (no red task: clause (a)'s observable already exists at run.mjs:58 …)` (`PLAN:624`), and T10 sits only in the green column. The document now says the same thing in four places (§3's T10 row, §5's batch-2 gate, §9, and the exemption note) |
| F-03 | Medium | **Resolved** | §6 states the two-cell rule once — a table is accepted only with **both** an exact id cell and an exact deps cell — and names all four confusable tables. Verified mechanically: `PLAN:139` (§3), `:448` (§7), `:699` (§10), `:730` (§11) open with a `#` cell; only `:139` also carries `Deps`; §4's manifest is `Path | Owner(s), by batch` (`:202`), no id cell. The parser agrees (`orchestrate-dev.js:3766-3770`). The enumerations inside the rule are incomplete — F-02 below — but the rule no longer depends on the enumeration |
| F-04 | Low | **Resolved** | Every citation in §11's CI table now points at a `run:` line, and every one resolves: `:27` `unit-tests`, `:40` `os: [ubuntu-latest]`, `:68` `npm ci`, `:75` `npm test`, `:67`/`:71` `working-directory`, `:77` `artifact-freshness`, `:93`, `:99`, `:103`, `:127`, `:133`, `:148`, `:161`, `:172`, `:188`. I checked all fifteen against `.github/workflows/pr-tests.yml` at HEAD. The column is retitled `Command (run: line)` and the convention is stated above the table |

Also re-ran the Phase-P self-parse against the revised §3: `parsePlanTasks` yields **54 tasks**, `computeTopologicalBatches` yields **17 batches**, no cycle. The parse gate stays safe.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
