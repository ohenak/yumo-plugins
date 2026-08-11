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

| ID | Question |
|----|---------|
| Q-01 | The single-platform restatement is well argued, but it moves a C-9 obligation onto a host nobody schedules: the `darwin` row exists only because the maintainer's Mac happens to run the wave, and it disappears the day a wave runs on Linux. Is the operator content that `M-ENG-09`'s coverage is a function of *where Phase I ran*, rather than a fixed set the DoD can state up front? §8's item is now honest but not decidable in advance — a reader cannot tell how many rows "met" means without knowing the wave host. |
| Q-02 | `.github/workflows/pr-tests.yml:37-39` still carries the comment explaining the matrix as "the maintainer's macOS (bash 3.2 …) **and** Linux CI (bash 5). Testing both is what keeps the 3.2 constraints honest", nine days after `410f3a07` removed `macos-latest` from that very matrix. That is repo state, not this plan's defect, and I am not asking the plan to own it — but T17 edits this file and the plan quotes `:40` as authority. Should T17's row carry a one-line "and correct the stale matrix comment while in the file", or is the deliberate answer "not this feature's scope"? |
| Q-03 | Carried unresolved from v2 Q-02: §8's ≥ 85 % branch-coverage floor over the four new modules is still a feature-local number no REQ states and no other pdlc feature carries. Intended as a feature-local commitment, or a repo-wide bar for harvest to promote into `docs/_constraints/`? The answer changes what the next plan inherits. |

## Positive Observations

- **The `'documentOracles'` fix is the whole fix, not the visible half.** I compared both plan literals to `.claude/pdlc.config.json:3` programmatically rather than by eye, and they are HEAD's string with the engine suite prepended, token for token, in *both* §8 and §11. The plan also generalised the lesson correctly — "dropping a pattern is as much a blast radius as dropping a suite" — which is the sentence that stops the next author re-opening this. Only the supporting citation is wrong (F-01), and that is a two-word repair.
- **The `macos-latest` correction was taken as evidence, not as a reviewer's assertion.** The plan does not merely drop the second platform; it names the commit that dropped it (`410f3a07`, which I confirmed exists, dated 2026-08-02, message "ci: drop macos-latest from the unit-test matrix"), states that re-adding it would reverse a standing decision on a repo-wide file "for a reason no AC states", and threads the consequence through T17, T42, §5, §8, §9's C-9 note, §10's O-ENG-T1/T4/T5 and §11. Seven places, one story, no residue — I looked for a surviving "two-platform" claim and found none.
- **O-ENG-T5 got sharper, not just edited.** It was "the unmeasured third platform"; it is now "platforms that run the suite without a CI job", which is the honest generalisation once the matrix is single-platform — a `darwin` wave host and a contributor's machine are the same case, and the plan says so while still refusing to decide the general question mid-wave. That is the right line between planning and operating.
- **The V5 correction found a real hermeticity hole, and the plan closed it at the source.** Spelling the coverage run `npm test -- --experimental-test-coverage` and making T11's runner forward unrecognised arguments (with a test that a forwarded flag reaches the child's argv) is better than the alternative it replaces: a bare `node --test __tests__/` would have measured a run with no `PDLC_TEST_RUN_ID`, no bootstrap import and no suite-wide step. Verified the premise: `pdlc/engine/package.json:13` is `node --test __tests__/`, carrying no coverage flag, so V5 genuinely is a per-invocation flag rather than a change to what CI runs.
- **AC-1.5's Red column now tells the truth, and the truth is checkable.** `run.test.js:64` asserts only `url.startsWith("file://")` today and `run.mjs:52-55` already builds the URLs from a repo-relative path, so T10's strengthened assertion does pass on landing — "no red task" is the accurate cell, and the batch-2 exemption is stated in the gate rather than left for a wave agent to infer as a defect.
- **The parse-safety argument survives its own enumeration now.** Stating the two-cell rule first and the four tables second is the right order: I added a hypothetical `Deps` column to §10 mentally and the paragraph already tells the future author what breaks. F-04 is a completeness nit on the spellings, not a hole in the argument's shape.

## Recommendation

**Approved with minor changes** — no High findings.

The one High from v2 is closed properly: `'documentOracles'` is carried through in both places, set-equal to HEAD's repo-wide value, with the blast-radius reasoning generalised so the next author does not re-open it. The three Medium/Low from v2 are closed too, and the round's larger change — removing `macos-latest` from every claim and re-keying the `M-ENG-09` obligation on `process.platform` — is evidence-backed and consistently threaded.

Nothing below blocks Phase P. In descending order of what I would fix before implementation starts:

1. **F-01** — cite `documentOracles.test.js:62`, not `document-oracles.mjs`, as the source of CWD sensitivity (§8 and §11). The module's header explicitly disclaims `process.cwd()`.
2. **F-02** — make §4's manifest parseable (`Task | Owned files` orientation), or record deliberately that Phase I runs the legacy worktree path for this feature. Currently the plan reads as if the script-owned wave gate applies, and `parsePlanOwnership` returns `null`.
3. **F-03** — drop or re-caption the AT-ENG-57 row in §9's orphan sub-table; `FSPEC:1337` claims it as AC-1.3's range endpoint.
4. **F-04** — replace §6's partial spelling lists with a citation of `PLAN_ID_HEADER_CELLS` / `PLAN_DEPS_HEADER_CELLS`.

The batch order, §5's gate wording, §9's AT set-equality (re-confirmed unchanged this round) and the errata list all stay as they are. The Phase-P self-parse over the revised §3 is clean: 54 tasks, 17 batches, no cycle.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}


APPROVAL-HASH: sha256:0a44d0521b94342423c38c57281accef204c4b605dbcd70ba71a25ade3123b3e
REVIEWED-COMMIT: 06f5702a12730f8acead077450919a43bdd43b48
