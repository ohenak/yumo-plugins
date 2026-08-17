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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | High | Local | **The three surviving `SKILL.md` files carry the retired names, and no criterion, inventory row or allow-list glob accounts for them — so AC-1.2 as written is unsatisfiable and G-3 is falsified by a tracked file nobody is told to edit.** Running A-1's own dependent sweep at HEAD returns, besides the machinery and the allow-listed documents, `pdlc/skills/orchestrate-queue/SKILL.md` (7 hits), `pdlc/skills/orchestrate-dev/SKILL.md` (2 hits) and `pdlc/skills/consolidate-learnings/SKILL.md` (1 hit). None of `pdlc/skills/**` appears in any M-11 row (a…m), in A-1's glob table, in AC-2.1's reader set, or in O-5's documentation inventory. Two consequences. (a) AC-1.2's required-empty search must return these hits unless the sweep edits the files, and nothing obliges it to: G-2 implies rewriting the two orchestration skills as delegators, but `consolidate-learnings/SKILL.md:11` names `pdlc/workflows/dist/consolidate-learnings.bundle.js` and is a human-invoked skill NG-1 keeps untouched — it has no disposition anywhere in the REQ. (b) G-3's bar ("a reader who never saw the old path must not be able to find instructions for it in a tracked file") already fails on `orchestrate-queue/SKILL.md:161`, which instructs the reader to run `pdlc/hooks/scripts/sync-workflows.sh` "(or `--force` when the reason names a hand-edited …)", and on `:142` (the `check-workflow-drift` SessionStart hook) and `:165` (`distribution.checkEnabled: false`). This is precisely F-19's shape one layer out: an instructional tracked file outside the inventory. Fix: add an M-11 row for the three skill files (with the retired-name line numbers), extend AC-2.1's reader set — or state that skills are covered by AC-1.2 and give `consolidate-learnings/SKILL.md` an explicit disposition — and re-derive A-1 so the skills are not silently expected to be empty. | AC-1.2, AC-2.1, G-3, O-5, §1.2 (M-11) |
| F-23 | Medium | Process | **Nothing asserts that the sweep's own grep output is fully partitioned, which is why the same omission class has now landed three rounds running.** A-1 and M-11 are hand-curated from one grep whose result set is never checked to be exhausted: every hit must fall in exactly one of {an M-row artifact, an M-11 dependent row, an A-1 allow-list glob}, and no criterion says so. Round 1 missed M-10; round 2 missed `pdlc/OPERATIONS.md`; round 3 misses `pdlc/skills/**` (F-22). C-6 asks for re-measurement but not for totality. Fix: give C-6 (or AC-1.2) a partition clause — "the re-measurement runs the dependent sweep and shows every returned path classified into an M-row, an M-11 row or an A-1 glob, with the unclassified remainder empty" — which is a set-equality over the full sweep output rather than a curated list, and fails on the next unnoticed file instead of at review time. | C-6, AC-1.2, §1.2 |
| F-24 | Medium | Local | **AC-1.1 and O-3 name different documents as the place AC-1.1's branch is pinned.** AC-1.1 now says the branch and surviving path are "pinned at C-6 re-measurement time where AC-1.3's literal count is", and AC-1.3 says that count is "transcribed into the FSPEC". O-3 says the open part is "Resolved in this feature's TSPEC; AC-1.1's branch is then pinned alongside AC-1.3's literals". FSPEC and TSPEC cannot both be the pin site, and the choice matters: the branch decides whether AC-1.1 asserts `dist/` set-equals `{M-9}` or asserts a single named relocated path, and a test author reading the wrong document finds nothing. Fix: pick one document in both places (O-3's own resolution owner is the TSPEC, so the simplest repair is AC-1.1 pointing at the TSPEC for the branch while continuing to point at the FSPEC for AC-1.3's count). | AC-1.1, AC-1.3, O-3 |
| F-25 | Low | Process | **The pre-sweep green C-7 now presupposes has no committed evidence artifact, unlike BL-08's run report.** C-7 states the suite is green at pre-sweep HEAD "as of 2026-08-17" and obliges repair of any inherited red, but Phase R may start days later and no prerequisite row captures the transcript. BL-08 already establishes the pattern (a committed report at a fixed path, cited by path + commit) for exactly this reason — AC-5.2's comparison is uncapturable afterwards, and so is "the first red the sweep sees is its own". The measurement hazard above sharpens this: a green captured from an agent session with `NODE_TEST_CONTEXT` inherited is vacuous (zero tests run, exit 0), so the artifact worth committing is the summary line (`# tests N / # pass N / # fail 0`), not a bare "green". Fix: extend BL-08 to cover the pre-sweep gate-command transcript, or add a sibling row. | C-7, AC-1.4c, AC-1.8, BL-08 |
| F-26 | Low | Local | **A-1's "Files it covers today" column is wrong for two rows, which undercuts its completeness claim, and one glob is a placeholder rather than a glob.** `docs/completed/**` and `**/LEARNINGS-*.md`, `**/POSTMORTEM-*.md` are both recorded as covering "—", but the sweep at HEAD returns ~30 files under `docs/completed/` including `LEARNINGS-pdlc-consolidation-agent.md`, `LEARNINGS-pdlc-merge-phase.md`, `LEARNINGS-pdlc-workflow-distribution.md` and `POSTMORTEM-R-pdlc-review-loop-hardening.md`. Separately, `docs/{other feature}/PLAN-*.md` is prose, not a path glob — a search tool cannot consume it, and the file it stands for (`docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md`) is already named in the same cell. Baseline-side repair; recorded here because AC-1.2 delegates its exclude list to A-1 verbatim. | AC-1.2 → baseline A-1 |

## Delta tags

```
FINDING: High | delta | local | AC-1.2 / AC-2.1 / O-5 | the three surviving pdlc/skills/*/SKILL.md carry retired names; no M-11 row, allow-list glob or reader-set entry covers them, and consolidate-learnings/SKILL.md has no disposition at all
FINDING: Medium | delta | local | C-6 / AC-1.2 | no clause requires the dependent sweep's output to be fully partitioned into M-rows, M-11 rows and A-1 globs, so the omission class recurs each round
FINDING: Medium | delta | local | AC-1.1 / O-3 | FSPEC and TSPEC both named as the place AC-1.1's dist/ branch is pinned
FINDING: Low | delta | local | C-7 / BL-08 | pre-sweep green asserted as a dated fact with no committed transcript, unlike BL-08's report
FINDING: Low | delta | nonlocal | baseline A-1 | "Files it covers today" wrong for docs/completed/** and the LEARNINGS/POSTMORTEM globs; one entry is prose, not a glob
```

## Questions

| ID | Question |
|----|---------|
| Q-10 | Does `consolidate-learnings/SKILL.md`'s bundle reference (`:11`) survive the sweep as a rewritten sentence (the skill still exists and still runs, just not from a bundle) or does the line go entirely? The answer decides whether F-22's repair is an M-11 row plus an AC-2.1 entry, or an A-1 allow-list entry — and they are opposite. |
| Q-11 | Is the pre-sweep hook listing AC-1.7 set-equals against derived from git history at replay time, or captured into an artifact like BL-08's report? History is sufficient for a tracked manifest, but the criterion never says, and AC-3.3's skill-set comparison has the same gap. |

## Positive Observations

- F-21's repair is the right shape: rather than writing around a red tree, `63166245` put the
  oracle's subject back where the oracle looks (`CLAUDE.md:66`) and left `pdlc/OPERATIONS.md:59`
  pointing at it as rationale-only prose. The engine suite re-derives green at HEAD, so C-7's
  "stays green" now has a real starting point instead of a stated one.
- AC-1.7's restatement closed the last absence-only oracle in §6.1 the way the siblings already
  had — set-equality against a pre-sweep listing, with the surviving `SessionStart` sibling named
  in the criterion itself so a whole-event deletion fails loudly rather than passing.
- A-1's "two allow-listed files must survive still carrying the retired names" paragraph is the
  strongest addition this round: it makes AC-1.2 and AC-2.3 provably co-satisfiable instead of
  leaving a reader to discover the tension during implementation.
- The `pdlc/OPERATIONS.md` repair went in at section granularity (M-11l enumerates the five
  headings, `## The engine channel` deliberately excluded), which is what makes AC-2.1's reader
  test checkable rather than a judgement about a whole file.

## Recommendation

**Needs revision**

All three round-2 Highs are genuinely closed, and two of them were closed by changing the tree,
not the prose — the strongest signal this round. The strategy, sequencing and evidence gates are
not in question and were not re-litigated.

One High remains, and it is the same inventory-omission class for the third consecutive round:
`pdlc/skills/**` carries the retired names, sits outside every M-11 row, allow-list glob and
reader set, and `consolidate-learnings/SKILL.md` has no disposition at all — so AC-1.2 cannot
pass as written and G-3 is already false on a tracked file. The edit is small (one M-11 row, one
AC-2.1 entry or one A-1 glob, per Q-10) but it is not mechanical: which of the two it is depends
on whether the line survives. F-23 is the durable half of the same story — adding a partition
clause to C-6 turns the next omission into a failing check instead of a review finding.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 2}
