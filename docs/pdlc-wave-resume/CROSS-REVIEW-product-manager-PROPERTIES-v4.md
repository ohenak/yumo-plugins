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

All three of my v3 findings are closed. None was High, so nothing was gating; I checked them anyway,
because a Medium closed in words rather than in bytes is the way a traceability defect survives a
round.

| v3 finding | Status at HEAD |
|---|---|
| **F-01 (Medium, Local)** — the AT-12 coverage-matrix row claimed complete coverage after the delta conceded one conjunct is unobservable | **Resolved, and in the stronger of the two forms I suggested.** `PROPERTIES:538` now reads `PROP-SKIP-01, -02, -03, -04 — **partial**: AT-12's fourth conjunct also asserts that the V-wave's commit is the only Phase-I-adjacent commit, which is not an observable of this suite (the V-wave issues no `add` and its commit is made by the dispatched agent, which the `makeAgent(record)` double replaces). That clause is routed upstream, not covered here — see § Gaps / Findings routed upstream`. A reader consulting the matrix for AT-12 coverage now meets the gap and its reason in the same cell, without having to find the routed-findings table first. Committed `61207b09`. |
| **F-02 (Medium, Local)** — TSPEC §5.8's three-module `c8.include` list was corrected locally instead of routed, breaking the erratum discipline the same delta applied twice | **Resolved.** A routed-findings row now exists (`:738`), naming `TSPEC:838`'s three-entry list against `package.json`'s four `**/`-anchored entries, marked `Open, and newly raised this round (PM F-02)` and carrying `**Yes** — one `ERRATUM: TSPEC` line`. I re-verified the underlying fact: `TSPEC:838` still reads `include: ["orchestrate-dev.js", "orchestrate-queue.js", "build-runtime.mjs"]`, and `pdlc/workflows/package.json`'s `c8.include` still carries the fourth `**/scripts/capture-learnings-baseline.mjs` entry. The local correction at § 11 was left standing, which is what I asked for. Committed `8ed988c1`. |
| **F-03 (Low, Local)** — PROP-SKIP-04's trace pointed at conjuncts it does not assert | **Resolved, exactly as suggested.** `PROPERTIES:165` now traces `AT-12 (fourth conjunct, less the commit clause — routed)` where it read `AT-12 (first three conjuncts)`. The three conjuncts PROP-SKIP-01 owns are no longer double-claimed, and the routed clause is legible from the row itself — which was the point of doing F-01 and F-03 together. Committed `61207b09`. |

**Nothing I approved in v3 was broken by the revision.** The two things I would have caught if it
had been: the property set is byte-identical apart from PROP-SKIP-04's trace cell (checked above),
and PROP-COV-01's measured baseline table at `:245–250` — the four figures I reproduced by running
c8 in v3 — is unchanged, so the verification I did last round still stands for this one.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
