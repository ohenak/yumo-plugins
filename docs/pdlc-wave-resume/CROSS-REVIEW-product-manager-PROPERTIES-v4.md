# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 4
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review: prior findings plus the changed sections only.

## Grounding

**Tree and base.** `git rev-parse --abbrev-ref HEAD` prints `feat-pdlc-wave-resume`. The branch is
content-ahead of `origin/main` (`git rev-list --count HEAD..origin/main` → `0`,
`git rev-list --count origin/main..HEAD` → `487`), so I reviewed this tree rather than reporting a
stale base.

**Delta reviewed.** `git diff 753aaa54 HEAD -- docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
— `753aaa54` is the commit carrying my v3 cross-review — is 211 diff lines across nine commits
(`a431143c` … `91ce118c`). It touches: the header/revision-history block, § Overview's grounding
table and its consequence paragraph, PROP-SKIP-04's requirement trace, § 11's threshold paragraph and
local-red enumeration, PROP-COV-02's denominator note, § Fixtures' queue fixture 2, the AT-12
coverage-matrix row, the test-file status table's `advisoryHelperProperties` row, gap G-4, and two new
routed-findings rows. **No property was added, deleted or weakened**, which I checked directly rather
than taking from the revision history: the only property-row diff in the whole delta is
PROP-SKIP-04's `Requirement ref` cell, and the only oracle-row diff is PROP-COV-02's rationale cell.
That is what keeps this a delta review and not a fresh one.

**I re-ran the delta's factual claims rather than reading them.** Every one of the following is a
claim this revision newly asserts, and every one reproduces in this tree:

| Claim (PROPERTIES) | My check | Result |
|---|---|---|
| Rebase has landed; branch ahead, not behind | `git rev-list --count HEAD..origin/main`; `git rev-list --count origin/main..HEAD` | `0`; `487` ✓ |
| `WAVE_STATE_PATH` present here at `:12864` | `grep -n 'export const WAVE_STATE_PATH' pdlc/workflows/orchestrate-dev.js` | `12864:export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` ✓ |
| Ignore rule here at `.gitignore:46` (comment at `:30`) | `grep -n pdlc-wave-state .gitignore` | `30:` comment, `46:/.claude/pdlc-wave-state.json` ✓ |
| `c8`/`fast-check`/`test:coverage` present here | `pdlc/workflows/package.json` | `test:coverage` script, `"c8": "^10.1.3"`, `"fast-check": "^4.9.0"` ✓ |
| Two `.claude/` paths + coverage report tracked, by `b1b846bd` on this branch | `git ls-files .claude/ pdlc/workflows/coverage`; `git log --oneline -1 -- .claude/pdlc-wave-state.json` | `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` (+ the two shared files), `pdlc/workflows/coverage/**`; `b1b846bd` ✓ |
| `orchestrate-dev.js` is 17,176 lines here and at `origin/main` | `wc -l`; `git diff --stat origin/main HEAD -- …orchestrate-dev.js` | `17176`; empty diff ✓ |
| `advisoryHelperProperties.test.js` present here, not only at `origin/main` | `ls pdlc/workflows/__tests__/advisoryHelperProperties.test.js` | present ✓ |
| `documentOracles.test.js` fails **three** tests, and exactly the three named | full run of that file | `3 failed, 32 passed, 35 total`; the two `.claude/`-tracking tests and `PROP-SWEEP-2(b)` ✓ |
| `docs/pdlc-wave-resume/**` is not on `A1_GLOBS`, while three sibling feature dirs are | `documentOracles.test.js:712–724` | `docs/pdlc-plugin-retirement/**`, `docs/pdlc-advisory-wave-gate/**`, `docs/pdlc-learnings-injection/**`; no wave-resume entry ✓ |
| Queue triage reads the last *matching* `TRIAGE:` line, case-insensitively | `pdlc/workflows/orchestrate-queue.js:341–355` | `parseTriageVerdict` scans `for (let i = lines.length - 1; i >= 0; i--)` against `/^TRIAGE:\s*(ready\|blocked\|needs-human)\b\s*(.*)$/i` ✓ |

The last row is the one I most expected to find over-claimed and did not: the fixture's restatement
("the last **`TRIAGE:` line**", `:468–473`) is exactly what the seam implements, and the earlier "last
line" wording really was stricter than the code.

## Prior findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
