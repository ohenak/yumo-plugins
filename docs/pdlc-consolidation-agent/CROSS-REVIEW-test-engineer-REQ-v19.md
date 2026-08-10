# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.3)
**Date:** 2026-08-10
**Iteration:** 19
**Scope:** Local (per-finding below)
**Delta base:** `39001869` (the tree reviewed at v18) → HEAD

This is a delta re-review of the v2.3 anchor-epoch sweep — the revision that answers v18's
F-61, F-62, F-63, F-55, F-57 and F-59. 45 insertions / 39 deletions in one file across
seven commits (`0cca9502`…`c93f5032`). The delta question is the same one v18 asked and the
sweep now claims to have answered at set scope rather than paragraph scope: **did every
citation family actually move, and did the sweep break anything previously approved?**
Every anchor below was re-measured at HEAD.

## What changed

Seven commits, one document. The version row moves `2.2 · 2026-08-09` → `2.3 · 2026-08-10`,
the v2.1 and v2.2 erratum notes are retired into a single v2.3 note plus a new standing
**"Code anchors: one epoch"** preamble that pins every `file:line` to the post-`b22834b7` tree
and commits to naming the *role* a line plays. That preamble is the right durable fix for the
v18 F-60 process finding: it makes the anchor set a re-measurable unit rather than a set of
independently-rotting strings.

I re-measured all 31 code anchors the REQ carries. Resolved families:

| REQ claim | HEAD state | Correct |
|---|---|---|
| `nudge-consolidation.sh:73-74` — pending filter | `:73-74` is exactly the `legacy`/`block_lines` basename test | yes |
| `nudge-consolidation.sh:60` / `:60-61` — `CORPUS_GLOBS` | `:60` is `CORPUS_GLOBS = (…)`, `:61` the `glob.glob` comprehension | yes |
| `nudge-consolidation.sh:63` — log path | `:63` is `log = os.path.join(proj, "docs", "_decisions", …)` | yes |
| `nudge-consolidation.sh:67-68` — whole-log read | `:67-68` is the `open(log …)` / `fh.read()` pair | yes |
| `nudge-consolidation.sh:85-87` — emit-and-exit tail | `:85-86` `print(json.dumps(…))`, `:87` `sys.exit(0)` | yes |
| `runtime-adapter.js:941` (`rtListFiles`), `:951` | `:941` is the declaration, `:951` the `ls -p -A … \| grep -v '/$'` line | yes |
| `orchestrate-dev.js:2060` `resolveAdvisoryRung`, `:2086` fallback line, `:1879-1880` rungs, `:1896` `ADVISORY_SEAMS`, `:2935` `advisorySummaryRows`, `:9476`/`:9497` `commitPaths`, `:959` `guardVerdict` | each lands on the named symbol or line | yes |
| `orchestrate-queue.js:1583` `commitQueueRow`, `:1584` add, `:1587-1592` commit, `:1622` `commitAdvisoryRecord` | each exact | yes |
| `QUEUE.md:304` | `:304` is the self-modification-guard bullet | yes |

Unchanged-and-still-correct anchors I spot-checked rather than assumed: `nudge-consolidation.sh:25`
(`THRESHOLD = 5`), `:4` (header), `orchestrate-dev.js:48-53` (`MERGE_GUARD_DEFAULTS`, four paths),
`consolidate-learnings/SKILL.md:56` and `:64` and `:75`, `harvest-learnings/SKILL.md:70-79`,
`hooks.json:3`/`:14`/`:29`, `QUEUE.md:11`. All resolve.

`docs/_constraints/` did not move in this delta (`git diff --stat 39001869..HEAD -- docs/_constraints/`
is empty), so the two version pins the REQ carries stay decidable without re-judgment.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
