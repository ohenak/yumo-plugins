# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-12
**Iteration:** 4
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.
Delta re-review: disposition of F-01…F-04 from `CROSS-REVIEW-product-manager-PLAN-v3.md`, then new
issues in changed sections only.

**Delta basis:** `git diff 06f5702a..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
(89 insertions, 72 deletions) across §0 (version row + v1.3 change note), §3 (T00 status cell), and
§4 (the file-ownership manifest, re-formatted). Two commits touch the PLAN: `758d36c0` (T00 test
lands) and `06ce3342` (v1.3). Unchanged sections are not re-litigated.

## Disposition of v3 findings

| v3 finding | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 — §8/§11 justify `'documentOracles'` by citing `document-oracles.mjs` as reading `process.cwd()`, which that module's own header denies | Medium | **Open, unchanged** | v1.3 touches §0, §3's T00 cell and §4 only; `PLAN:525` still reads "`pdlc/workflows/lib/document-oracles.mjs` reads `process.cwd()`" and `PLAN:779` still says the oracles "resolve paths from `process.cwd()`", while `document-oracles.mjs:2-6` states "exported functions take a `root` directory path. No `process.cwd()`, no `import.meta.url`-derived paths, no ambient state". The conclusion (keep the pattern) stays right; the cited cause stays wrong. Not gating |
| F-02 — §4's manifest headers (`Path` / `Owner(s), by batch`) match neither of the shipped parser's cell sets, so Phase I degrades to the legacy worktree path | Medium | **Resolved** | Ran the shipped parser over both revisions in one process: `parsePlanOwnership` on `06f5702a`'s text returns `null` (no manifest at all, exactly the degradation predicted); on HEAD it returns 54 ownership rows. `validatePlanContract(parsePlanTasks(HEAD).tasks, ownership)` ⇒ `{ok: true}`; `computeWaves` ⇒ 17 waves. The plan's own change note claims 54/54 and 17 waves — both literals match what the parser actually produced |
| F-03 — §9's orphan-AT sub-table admits AT-ENG-57 on a premise FSPEC contradicts | Low | **Open, unchanged** | `PLAN:665` still frames AT-ENG-57 as a "near-miss" absence while `PLAN:639` carries `AC-1.3 … AT-ENG-52…AT-ENG-57` and `FSPEC:1337` reads the same closed range. Nothing downstream breaks (AT-ENG-57 is owned by T31 red → T47 green). Not gating |
| F-04 — §6 transcribes partial header-cell spelling lists instead of naming the two constants | Low | **Open, and now also stale** | `PLAN:453-454` is unchanged and its transcription of §4's own header is now wrong at HEAD; folded into F-01 below rather than counted twice |

## Findings

No High findings. The one change this round is the fix v3 asked for, and it verifies end to end.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§6's parse-safety argument still describes §4's *old* header, and the sentence it hangs on is now false.** `PLAN:453-454` reads: "§4's ownership manifest is safe for a stronger [reason], having no id-like column at all (`Path \| Owner(s), by batch`)." At HEAD §4's header is `Files \| Task \| Batch` (`PLAN:211`) — the transcribed header no longer exists, and the manifest *does* now carry a task-id-ish cell. The **conclusion survives** and I checked why: `PLAN_ID_HEADER_CELLS = new Set(["task id", "task-id", "task_id", "id", "#"])` (`orchestrate-dev.js:3814`) does not contain bare `task`, so §4 is still not swallowed as a task table — empirically, `parsePlanTasks` over HEAD returns exactly 54 tasks, not 130. But §6's *stated reason* ("no id-like column at all") is the wrong safety argument for today's text, and a future editor who trusts it will mis-generalise. The v1.3 change note says "Content is unchanged", which is true of §4's pairs but not of §6's description of §4. Fix, two sentences in §6: transcribe the live header, and state the real invariant — §4 stays unparseable as a task table because `task` ∉ `PLAN_ID_HEADER_CELLS` **and** because it carries no cell from `PLAN_DEPS_HEADER_CELLS` (`orchestrate-dev.js:3814`, `:3815-3824`); adding a `Deps`/`Dependencies`/`Depends on`/`Depends-on`/`Depends_on`/`Deps`/`Prerequisites`/`Prereqs`-spelled column would break Phase-P self-parse. Naming the two constants also closes v3's F-04 | REQ C-9; PLAN §4, §6 |
| F-02 | Low | Local | **§4's fourth note and §3's T16 row now disagree with §4's own cell about how many paths T16 owns.** The note at `PLAN:307` still says "T16 owns three generated paths you never hand-edit", and §3's T16 row (`PLAN:166`) still enumerates `dist/orchestrate-dev.bundle.js`, `dist/orchestrate-queue.bundle.js` and `dist/distribution-manifest.json` in its Source-File cell; §4's manifest now carries the single entry `pdlc/workflows/dist/`. The v1.3 change note discloses the narrowing and the narrowing is the *right* call — `computeWaves` treats a directory as colliding with any entry under it, and `implementation.postWavePathspecs: ["pdlc/workflows/dist/"]` is directory-scoped too, so the coarser cell is strictly safer. This is a wording residue, not a defect: reconcile the note to "one generated directory, three files inside it" so a reader counting rows against the note does not go looking for two missing manifest rows | REQ C-9; PLAN §4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §3's T00 status cell is now `✅` (`PLAN:150`) and the task's file exists and is green — I ran `node --test pdlc/engine/__tests__/preflight.test.js`: 9 pass, 0 fail, matching `758d36c0`'s "Green on landing". T00 is therefore the first task whose Status cell records *implementation* state rather than plan state. Is the Status column intended to be maintained through Phase I as a live ledger (in which case the PLAN keeps changing under later review rounds and approval anchors go stale each wave), or is `✅` a one-off because T00 landed pre-Phase-I as the gate? A one-line convention in §3 would settle it for the next fifty-three cells. |
| Q-02 | Carried from v3 and still open: §8's `M-ENG-09` obligation is keyed on `process.platform`, so what "met" means depends on which host runs the wave. With T00 now landed on the maintainer's machine and the rest of Phase I ahead, is the operator content for the `darwin` row to be whatever falls out, or should DoD fix the host set up front? |

## Positive Observations

- **The fix was verified the way it should be — by running the shipped parser, not by eyeballing the header.** I re-ran both revisions through one process: `parsePlanOwnership` on `06f5702a`'s text returns `null`, on HEAD it returns 54 rows. That `null` is the whole v3 F-02 finding reproduced exactly, and it confirms the change note's causal story ("v1.2's headers parsed as no manifest at all, so Phase I fell back to the legacy worktree path") rather than merely asserting it. The plan diagnosed a real degradation from its own halt and fixed the cause.
- **"Content is unchanged: same 76 path–owner pairs" is literally true, and I checked it as set-equality, not spot-check.** I extracted `(path, task, batch)` triples from both revisions and diffed the sets: 76 in v1.2, 76 in v1.3, `only-in-old` empty, `only-in-new` empty. A re-format of a 70-row table is exactly where a row quietly dies; none did. The one deliberate exception (T16's dist cell) is called out in the change note by name rather than left for a reviewer to find.
- **The transposition solved the multi-owner problem correctly.** v1.2 packed multi-owner paths into one cell (`T10 (b2), T39 (b5), T47 (b7)`); the parser's files-cell reader takes backticked spans from *one* row, so that shape could never have expressed three owners. v1.3 splits them into one row per owning task — the ten multiply-written files each appear as separate rows, and `validatePlanContract` explicitly tolerates that overlap ("File OVERLAP between rows is NOT a problem … waves are what separate the writers", `orchestrate-dev.js:4025-4028`). The author read the parser's semantics, not just its header list.
- **The `Batch` column was kept even though the parser ignores it, and the change note says so.** That is the right trade: waves are derived, so the column is documentation, and stating "carried but ignored by the parser, waves being derived" stops a future reader from either trusting it as input or deleting it as noise.
- **Wave-mode preconditions now hold end to end, which is the product outcome that mattered.** `validatePlanContract` ⇒ `{ok: true}` over 54/54 tasks and `computeWaves` ⇒ 17 ownership-disjoint waves, matching the change note's two literals. Phase I will run the script-owned gate rather than the legacy worktree path — which is what REQ C-9's batch-safety guarantees were written against.

## Recommendation

**Approved with minor changes** — no High findings.

v3's one gating-adjacent finding (F-02, the unparseable manifest) is closed properly and provably:
the old text returns `null` from the shipped parser, the new text returns 54 rows, the contract
validates 54/54, and 17 ownership-disjoint waves derive. The re-format preserved all 76 path–owner
pairs as a set, with the single deliberate narrowing disclosed. Nothing below blocks Phase P, and
the plan is now in the shape Phase I needs to take the script-owned wave gate.

In descending order, what I would fix before implementation starts:

1. **F-01** — update §6's transcription of §4's header and restate the safety reason in terms of
   `PLAN_ID_HEADER_CELLS` / `PLAN_DEPS_HEADER_CELLS` (`orchestrate-dev.js:3814`, `:3815`). This also
   closes v3's F-04. The conclusion is right today; the stated reason no longer is.
2. **v3 F-01 (still open)** — cite `documentOracles.test.js:62`'s live-root setup, not
   `document-oracles.mjs`, as the source of CWD sensitivity (§8 and §11). The module's header
   explicitly disclaims `process.cwd()`.
3. **F-02** — reconcile §4's fourth note and §3's T16 Source-File cell with the narrowed
   `pdlc/workflows/dist/` manifest entry.
4. **v3 F-03 (still open)** — re-caption AT-ENG-57 in §9's orphan sub-table; `FSPEC:1337` makes it a
   full member of AC-1.3's range.

Re-ran the Phase-P self-parse against HEAD: 54 tasks, 17 batches, no cycle, ownership contract `ok`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:5174a8ec0092f8603e0529878732962025c4e319285d4f6753f02b957136906f
REVIEWED-COMMIT: 06ce3342
