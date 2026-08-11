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

No High findings. All four v2 findings are closed; the four below are in text this round added.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The new justification for carrying `'documentOracles'` cites a file that states the opposite.** §8 and §11 both say the pattern is load-bearing because "the document oracles are CWD- and untracked-file-sensitive (`pdlc/workflows/lib/document-oracles.mjs` reads `process.cwd()`)". The module's own header says the reverse: "every exported function is a pure function of a `root` directory path. **No `process.cwd()`**, no `import.meta.url`-derived paths, no ambient state" (`document-oracles.mjs:4-6`); two roots may be probed in one process by design. The *conclusion* is right and I would not want it changed — the sensitivity is real, it just lives in the **test**: `documentOracles.test.js:62` sets `LIVE_ROOT = realpathSync(resolve(HERE, "../../.."))`, the actual repo root, so the oracle suite reads the live working tree and untracked files can redden it. The risk of leaving the wrong cause in place is a future author "fixing" `document-oracles.mjs` to drop a `process.cwd()` call that is not there and concluding the ignore pattern can go. Fix: cite `documentOracles.test.js:62` (the live-root probe) instead of the module, in both places | REQ C-9; DC-07 |
| F-02 | Medium | Cross-Feature | **§4's ownership manifest does not parse, so Phase I will not run the same-tree waves §5's gates assume.** I ran the shipped parser over the document: `parsePlanOwnership` returns `null`. The manifest is oriented path→owner with the header `Path \| Owner(s), by batch` (`PLAN:202`), and the parser requires a task-ish cell (`task`, `task id`, `owning task`, `id` — `orchestrate-dev.js:3871-3878`) **and** a files-ish cell (`files`, `owned files`, `files created or appended`, … — `:3879-3886`) in the same header row; "Path" and "Owner(s), by batch" match neither set. Per CLAUDE.md, a PLAN with no parseable manifest degrades Phase I to the **legacy worktree path**, where the agent self-reports and the script does not own the gate. That silently undercuts this round's own §5 wording, which leans harder than v1.1 on per-wave gate semantics ("full suite green *on the platform the wave runs on*", the batch-2 red-terminal exemption). Honest caveat: §4's header is unchanged since v1, so this is pre-existing rather than newly broken, and it is not gating — but §5's revised gates make it matter more than it did. Fix: add a transposed companion table (`Task \| Owned files`) or retitle the columns to a pair the parser accepts, and re-run `parsePlanOwnership` as part of the Phase-P self-parse the plan already documents | REQ C-9; PLAN §4, §5 |
| F-03 | Low | Local | **§9's orphan-AT sub-table admits AT-ENG-57 on a premise FSPEC contradicts.** The retitled heading is "Acceptance tests FSPEC §14.1's AC rows **do not claim as members**" (`PLAN:647`), and the new sentence explains AT-ENG-57's presence as "appears in FSPEC's AC-1.3 row only parenthetically". It does not: `FSPEC:1337` reads `AC-1.3 \| §11.1, §11.2 \| AT-ENG-52…AT-ENG-57` — AT-ENG-57 is the **endpoint of the range**, a full member, not a parenthetical, and the plan's own §9 row for AC-1.3 (`PLAN:622`) carries the identical range. Nothing downstream breaks (the AT is owned twice over, by T31 red → T47 green), but a table whose stated membership rule is "not claimed by any AC row" now contains an entry that is claimed, on a false reading of the source. Fix: either drop the AT-ENG-57 row, or keep it and say plainly "listed for locatability; AC-1.3's range already claims it" | REQ AC-1.3; FSPEC §14.1 |
| F-04 | Low | Process | **§6's two-cell rule enumerates the accepted spellings, and both enumerations are short.** The rule now says the parser accepts "an exact id cell (`#`, `ID`, `Task ID`)" and "an exact dependencies cell (`Deps`, `Dependencies`, `Depends on`, `Prerequisites`)", and the forward-looking constraint names those same four deps spellings. The shipped sets are larger: ids also include `task-id` and `task_id` (`orchestrate-dev.js:3814`), deps also include `dependency`, `depends-on`, `depends_on` and `prereqs` (`:3815-3823`). A future author adding a `Prereqs` or `Depends-On` column to §7, §10 or §11 would read this paragraph, believe the case considered, and break the Phase-P self-parse — the exact failure mode the rewrite was meant to close. Fix: cite the two constants by name and line rather than transcribing partial lists, e.g. "the spellings in `PLAN_ID_HEADER_CELLS` / `PLAN_DEPS_HEADER_CELLS` (`orchestrate-dev.js:3814`, `:3815`)" | REQ C-9; PLAN §6 |

## Questions

## Positive Observations

## Recommendation

## Verdict
