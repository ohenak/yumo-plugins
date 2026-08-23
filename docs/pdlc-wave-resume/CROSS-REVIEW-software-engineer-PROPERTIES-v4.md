# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` (Version 1.3)
**Date:** 2026-08-23
**Iteration:** 4
**Scope:** delta re-review — my own v3 findings, plus new issues in the sections this revision
changed. Sections unchanged since v3 are not re-litigated.

## Prior findings — disposition

Diffed `de843006..HEAD` on the document: 100 insertions, 43 deletions across nine commits
(`a431143c` … `91ce118c`). Every prior finding was re-checked by re-running the command in this
tree, not by reading the revision's account of itself.

| v3 finding | Severity | Disposition |
|---|---|---|
| F-06 — the "pre-rebase tree" premise is false; G-4 routes a remediation that does not exist | High | **Resolved** |
| F-07 — § 11's local-red enumeration omits `PROP-SWEEP-2(b)`, which halts every wave gate | High | **Resolved** |
| F-08 — triage fixture obligation stated stricter than the seam | Low | **Resolved** |

### F-06 — re-verified command by command

The revision replaced the grounding table wholesale. I re-ran every row:

| Row as now stated | My run | Verdict |
|---|---|---|
| `git rev-list --count HEAD..origin/main` → `0`; `merge-base --is-ancestor origin/main HEAD` exit 0 | `0`; exit 0 | ✓ |
| `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `10`; `:12864 export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` | `10`; exact line and number | ✓ |
| `.gitignore:46 /.claude/pdlc-wave-state.json` (and `:30`, its comment) | both present, at those numbers | ✓ |
| `test:coverage` `:9`, `c8` `:12`, `fast-check` `:13` in `pdlc/workflows/package.json` | all three, at those numbers | ✓ |
| `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` and `pdlc/workflows/coverage/**` tracked, introduced by `b1b846bd` on this branch | `git ls-files .claude/` returns those two plus `pdlc.config.example.json` and `settings.json`; `git log --oneline -1 -- .claude/pdlc-wave-state.json` → `b1b846bd` | ✓ |

The corrected consequence is the important half and it is stated correctly: the rebase *has* landed,
T-01's pre-flight is expected **green** here, and PROP-REPO-01's failure is its **third** conjunct
only — `check-ignore` skipping tracked paths — with `git rm --cached` as the remedy and no rebase
clearing it. G-4 now says that plainly, and says the earlier diagnosis was wrong rather than quietly
overwriting it. The `advisoryHelperProperties.test.js` row in § Test files → status was corrected in
the same pass; the file is present here (verified). **F-06 is closed.**

### F-07 — re-verified by running the suite

`npm test -- --runInBand __tests__/documentOracles.test.js` in this tree: **3 failed, 32 passed**,
and the three are exactly the three the revised § 11 now enumerates —
`none of the six machine-local artifacts are tracked`,
``the only tracked files under `.claude/` are the two shared, reviewable ones``, and
`PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty`. I re-checked the
cause: `A1_GLOBS` (`documentOracles.test.js:712`) carries `docs/pdlc-plugin-retirement/**`,
`docs/pdlc-advisory-wave-gate/**` and `docs/pdlc-learnings-injection/**` and **not**
`docs/pdlc-wave-resume/**`, and `docs/_constraints/pdlc-retirement-baseline.md` has no row for this
feature's directory. The new § 11 red table names both reds, separates their owners, and states the
`docs/pdlc-advisory-wave-gate/**` precedent verbatim; the missing owner is routed as an
`ERRATUM: PLAN` row in § Findings routed upstream. **F-07 is closed.**

### F-08 — closed at the seam

Queue fixture 2 now reads "whose last **`TRIAGE:` line** is `TRIAGE: ready`", spells out the
bottom-up scan and the `/^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i` match, and says why the
stricter phrasing was a hazard. That is the seam's behaviour, not a paraphrase of it. **Closed.**

### Questions carried into this round

Q-06 and Q-07 were both answered in the document rather than deferred: § 11 gained an explicit
"which reading of the threshold is intended" block (see F-01 below for what is still missing from
it), and the § Overview consequence now states that the pre-implementation properties are **green**
here and why that is a different, still-worthwhile claim. AT-12's traceability row was annotated
partial and PROP-SKIP-04 re-traced to "fourth conjunct, less the commit clause"; I checked
`TSPEC:755` — AT-12's fourth conjunct is indeed "Phase PT dispatches exactly one agent, invokes the
gate exactly once, and its commit is the only Phase-I-adjacent commit", and PROP-SKIP-03 covers the
first two clauses while PROP-SKIP-04 covers the `add`-list. The labelling is accurate.
