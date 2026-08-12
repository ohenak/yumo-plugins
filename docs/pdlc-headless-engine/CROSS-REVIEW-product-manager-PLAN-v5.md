# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.4)
**Date:** 2026-08-11
**Iteration:** 5

**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Delta re-review: disposition of F-01/F-02 from `CROSS-REVIEW-product-manager-PLAN-v4.md`
and the two carried v3 findings, then new issues in changed sections only.

**Delta basis:** `git diff 06ce3342..f5ff0cd7 -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
(64 insertions, 13 deletions). Five commits, one per finding, plus the v1.4 changelog:
`034fdeb5` (T11 oracle, TE F-16), `ac573f25` (§6 parse-safety, PM F-01), `8ce0254f` (§4 T16 note +
`Batch` column, PM F-02 / TE Q-01), `e12b9624` (§8/§11 oracle attribution, PM v3 F-01), `c5efb9d6`
(§9 AT-ENG-57, PM v3 F-03), `f5ff0cd7` (v1.4 changelog). Unchanged sections not re-litigated.

## Disposition of v4 and carried v3 findings

| Finding | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| **F-01** (v4) — §6's parse-safety argument transcribed §4's *old* header and rested on a now-false "no id-like column at all" | Medium | **Resolved** | `PLAN:488-497` now transcribes the live header `Files \| Task \| Batch` and states the invariant it actually rests on: bare `task` ∉ `PLAN_ID_HEADER_CELLS`. Verified — `orchestrate-dev.js:3814` is exactly `new Set(["task id", "task-id", "task_id", "id", "#"])`, no bare `task`; `PLAN_DEPS_HEADER_CELLS` at `:3815-3824` is exactly the eight spellings §6 lists (`dependencies`, `dependency`, `depends on`, `depends-on`, `depends_on`, `deps`, `prerequisites`, `prereqs`) — set-equality, not containment. The rewrite also states the invariant as a **constraint on future edits** ("stays unparseable for as long as its id-ish cell is spelled `Task`"), which is the durable form. Closes v3 F-04 as well |
| **F-02** (v4) — §4's T16 note said "three generated paths" while §4 carries one directory entry | Medium | **Resolved** | `PLAN:331-338` now reads "one generated directory", names the three files as what §3's T16 row describes changing, and gives the reason the coarser cell is safer. `orchestrate-dev.js:3939-3940` confirms the premise: "a trailing `/` marks a directory and is KEPT — the collision rule needs it". The note now ends with a self-checkable instruction ("count the note's claim against §4's rows and you will find one, not three — deliberately"), which is what stops the next reader re-opening it |
| **v3 F-01** — §8/§11 sourced CWD sensitivity to `document-oracles.mjs`, whose own header denies it | Medium | **Resolved** | `PLAN:567-573` and `:828-831` now attribute the sensitivity to the **test**, not the module. Both ends verified: `document-oracles.mjs:2-6` states "every exported function is a pure function of a `root` directory path. No `process.cwd()`…"; `documentOracles.test.js:62` is exactly `const LIVE_ROOT = realpathSync(resolve(HERE, "../../..")); // TSPEC §13.4`. The conclusion `'documentOracles'` stays in the ignore list survives with a true premise |
| **v3 F-03** — §9's orphan sub-table called AT-ENG-57 a "near-miss" | Low | **Resolved** | `PLAN:712-716` now calls it a full member of AC-1.3's range and says why it is repeated anyway (range endpoints are easy to lose when the red→green split is read off). `FSPEC:1347` is `\| AC-1.3 \| §11.1, §11.2 \| AT-ENG-52…AT-ENG-57 \|` — endpoint, exactly as claimed |
| **Q-02** (carried) — `M-ENG-09` "met" depends on the host | — | **Answered in-document** | §5 (`:28-37` within the section) now states the obligation as one row per platform the suite actually runs on, names the operator step for the `linux` row, and marks `engine-tests` red until it lands. No longer a question |

## Findings

No High findings. No Medium findings. Every claim the revision newly rests on reproduces at HEAD;
the two items below are citation hygiene in text I re-read line by line.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | **Four self-citations are systematically off by one — each points at the blank line above the header it quotes.** §6 says §4's header is at `:238` (`PLAN:488`); the header row `\| Files \| Task \| Batch \|` is at `:239`, and `:238` is blank. The v1.4 changelog's three §6 quotations cite `:507`, `:765`, `:796` (`PLAN:33-34`); the live headers are at `:508` (`# \| Integration point at HEAD \| What attaches`), `:766` (`# \| Question \| Disposition here`) and `:797` (`# \| Command \| Observes \| State at HEAD`) — each cited line is the blank line preceding. The **quoted header text is byte-correct in all four cases**, so no argument is affected; the defect is that a reader who follows the pointer lands one line short and cannot confirm the quote, which is exactly the check these citations exist to enable. Tagged `Process` rather than `Local` because this is the third round in which a line citation in this document went stale under its own edits (v3 F-04, v4 F-01, now this): the recurring lesson is that a self-citing document needs its own line pointers re-derived by `grep -n` in the same commit that moves lines, not carried forward. Fix: re-pin the four numbers to `:239`, `:508`, `:766`, `:797` | REQ C-9; PLAN §6, §0 |
| F-02 | Low | Local | **The v1.4 changelog's citation for §4's header (`:211`) is stale by 28 lines and lands inside §3's task table.** `PLAN:22-23`'s row says §6 now transcribes "§4's **live** header (`Files \| Task \| Batch`, `:211`)". Line 211 at HEAD is T42's task row, not the manifest header (which is `:239`); the number was correct before v1.4's own changelog block and §4 note pushed the table down ~28 lines. Distinct from F-01 in kind rather than degree: F-01's numbers are off by one and still recognisably near their targets, this one points at unrelated content, so a reader checking the changelog's claim sees a task row and may conclude the manifest was not re-formatted at all. Fix: `:211` → `:239` | REQ C-9; PLAN §0 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v4, still open and still not gating: §3's Status column has one `✅` (T00) and fifty-three `⬚`. Is that column intended to be maintained *through* Phase I as a live ledger — in which case the PLAN's bytes change after approval and the approval anchors go stale mid-wave — or is `✅` a one-off record that T00 landed before the Phase-I gate existed? A one-line convention note in §3 settles the other fifty-three cells before waves start writing. |

## Positive Observations

- **The T11 oracle change is the strongest edit in this round, and it is the one I could falsify.** I
  re-ran the measurement it rests on, on this machine, at HEAD: node v20.20.1,
  `node --test --experimental-test-coverage __tests__/` exits `0`;
  `node --test __tests__/ --experimental-test-coverage` exits `1`. Both reproduce exactly as stated.
  The row then does the thing reviewers usually have to ask for: it names the assertion shape
  (set-equality over the child's whole argv, with the forwarded flag's index pinned below
  `__tests__/`) **and explicitly rejects the weaker one** ("a containment assertion … is explicitly
  rejected, because an implementation that appends satisfies it while V5 and §8's coverage floor are
  both unrunnable"). That is an oracle written against the failure mode, not against the happy path,
  and it survives the completeness bar — the expected argv is enumerated in full, so a dropped
  `--import` fails it too.
- **The v1.3 → v1.4 numbers hold: I re-derived them rather than accepting them.** Over HEAD's PLAN:
  `parsePlanTasks` → **54** tasks; `parsePlanOwnership` → **54** owning rows carrying **76**
  path–task pairs; `validatePlanContract(tasks, ownership)` → `{"ok":true}`;
  `computeWaves` → **17** waves; duplicate path within any single wave → **0**;
  `computeTopologicalBatches` → 17. Every figure the changelog's last row asserts is the figure the
  shipped parser produces. The §4 re-format survived five more commits without losing a pair.
- **§4's new `Batch` paragraph fixes an operator-facing hazard, not just a documentation one.** It
  states that the parser reads the cell and ignores it (`orchestrate-dev.js:3932-3934` confirms:
  "A batch/wave/phase column may be present and is ignored — waves are DERIVED from ownership and
  dependencies, never read off the PLAN's own batch labels"), that eleven `b`-labels and seventeen
  derived waves are both correct about different things, and that a stopped wave is matched **by
  task id**. §5 already stated the same rule from the other side, and the two now agree instead of
  leaving the reader to reconcile 11 against 17 mid-incident.
- **Every prior finding was closed at its source rather than at its symptom.** §6 could have been
  patched by deleting the false clause; instead it now carries the invariant future editors must
  preserve. §8/§11 could have dropped the CWD sentence; instead the sensitivity is re-attributed to
  the test that actually causes it, so the argument for keeping `'documentOracles'` in the ignore
  list is now true as well as correct. §9 could have deleted the AT-ENG-57 row; instead it says why
  the row stays. That is the difference between closing a review and answering it.
- **TE F-17 was rebutted with evidence rather than silently dropped.** The changelog states the
  finding is not open at HEAD and shows the three quotations are byte-identical to the live headers.
  I checked all three: correct on text (the line numbers are F-01 above). A plan that pushes back
  with a citation is healthier than one that edits to make a reviewer go away.

## Recommendation

**Approved with minor changes.** No High findings, no Medium findings.

Both v4 findings and both carried v3 findings are closed, and closed provably rather than by
assertion — I re-executed the parser (54 tasks, 76 pairs, contract `ok`, 17 waves, 0 collisions),
re-ran the node flag-position measurement (`0` vs `1` on v20.20.1), and checked every cited
`file:line` behind the four fixes (`orchestrate-dev.js:3814`, `:3815-3824`, `:3932-3934`,
`:3939-3940`; `document-oracles.mjs:2-6`; `documentOracles.test.js:62`; `FSPEC:1347`). All hold.

Nothing in this round blocks Phase P. The two Low findings are citation pointers and can be fixed in
the same commit as any later edit:

1. **F-01** — re-pin §6's `:238` → `:239` and the changelog's `:507`/`:765`/`:796` →
   `:508`/`:766`/`:797`.
2. **F-02** — re-pin the changelog's `:211` → `:239`.
3. **Q-01** — one line in §3 on whether the Status column is a live ledger during Phase I.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
