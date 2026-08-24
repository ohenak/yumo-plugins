# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the feature's shipped diff (`main...feat-pdlc-wave-resume`)
**Date:** 2026-08-23
**Iteration:** 2

## Scope and method

**Note on iteration.** The task names `CROSS-REVIEW-product-manager-REVIEW-v1.md` as my previous
round, but no such file exists on this branch (`ls docs/pdlc-wave-resume/` lists cross-reviews for
REQ, FSPEC, TSPEC, DECISIONS, PLAN and PROPERTIES only; `git log --all -- '…-REVIEW-*'` returns
nothing). There is no prior REVIEW round to delta against, so this is a **full** product-lens
codebase review written to the mandated v2 path.

Method, product lens only:

- Read `REQ-pdlc-wave-resume.md` §7 (REQ-WVR-01 … -10) and `FSPEC` §6 (AT-01 … AT-18) first, then
  the shipped diff `main...feat-pdlc-wave-resume`.
- Traced each AC to a **production caller**, not to a builder's own unit test:
  `classifyWaveLedger` is called from `main()` at `pdlc/workflows/orchestrate-dev.js:16286`, and the
  five announcing rows plus two report rows are emitted from `main()` (lines 16207, 16220, 16292,
  16308, 16320, 16594, 16605), so the announcements ACs are driven through the served path.
- Ran the feature's suites: `npm test -- __tests__/waveResume*.js __tests__/waveExecution.test.js
  __tests__/documentOracles.test.js` → **7 suites, 212 tests, all pass**.
- Ran the CI gate the pipeline actually polls: `npm run test:coverage` → exit **0**,
  `orchestrate-dev.js` per-file branches **88.87 %** (floor 85).
- Checked runtime drift: `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`.
- Compared PLAN §2.1's nine tasks against the branch's implementation commits.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | PLAN batch 4 never ran: **T-10 is unimplemented**, and the PLAN ships with its placeholders intact. | PLAN T-10; TSPEC RT-7/§5.8; REQ-WVR-03 |
| F-02 | Medium | Process | Nothing in the tree records that a PLAN task was left unrun, so the phase advanced to CR on an incomplete plan silently. | PLAN §2.2 batch gates |
| F-03 | Medium | Local | The new automatic-resume behaviour and its deletion hatch appear in no operator-facing document. | REQ-WVR-04 |
| F-04 | Low | Local | AT-09's re-invocation conjunct is not asserted in the AT-09 fixture; it is covered only by an adjacent arm. | REQ-WVR-09 (P0), FSPEC AT-09 |

### F-01 (High, Local) — PLAN batch 4 / T-10 is unimplemented and the PLAN ships with placeholders

PLAN §2.1 enumerates nine tasks (T-01, T-02, T-03, T-04, T-07, T-08, T-10, T-11, T-12; §4.6 confirms
"measured nine"). The branch carries implementation commits for **seven** of them:

```
git log --oneline main..HEAD --format='%s' | grep '^feat(pdlc-wave-resume): T-'
→ T-08, T-07, T-04, T-03, T-02, T-11, T-01     (7 rows; no T-10)
```

T-12 needs no commit — it is index-only, and its work is already true at the merge base
(`git ls-tree -r main --name-only .claude/` → exactly `pdlc.config.example.json` and
`settings.json`; `git ls-tree -r main --name-only | grep -c 'pdlc/workflows/coverage'` → `0`). So
T-10 is the one task with owed work that did not land.

T-10 owns two oracles in the two test files it is assigned (`waveResume.test.js`,
`waveExecution.test.js`): **(i)** c8's per-file branch number for `orchestrate-dev.js` asserted
`>= 85`, and **(ii)** the delta oracle — assert that no uncovered line reported by c8 falls inside
the line ranges this feature introduced, against the mapping table in PLAN §4.5.1. Neither exists:

```
grep -n "85\|coverage\|c8" pdlc/workflows/__tests__/waveResume.test.js \
                             pdlc/workflows/__tests__/waveExecution.test.js
→ (no output)
```

The consequence is visible in a tracked, shipped document. PLAN §4.5.1's mapping table — the one
PLAN itself calls the oracle ("its completeness — not a percentage — is the oracle") — still reads
`*(filled in by T-10, one name per arm, in `waveResume.test.js`)*` in its rows
(`PLAN-pdlc-wave-resume.md:489`). Two of §4.5's DoD checkboxes (`npm run test:coverage` …, "§4.5.1's
table is complete") are therefore unverifiable as written, and a maintainer reading the PLAN after
the feature ships is told the table will be filled in by a task that never ran.

What is **not** at risk, stated plainly so severity is not read as broader than it is: the floor
itself holds. `npm run test:coverage` exits 0 and reports `orchestrate-dev.js` at 88.87 % branches
against the 85 floor, so T-10's oracle (i) is duplicated by the CI check `Unit tests
(ubuntu-latest, node 20)`. Oracle (ii), the delta net that would red on a future edit leaving one of
this feature's new classifier or announcement branches uncovered, has no substitute anywhere.

Why High rather than Medium: the approved PLAN is the implementation contract, this is a whole batch
of it, CR is the last product gate before the feature ships, and the fix is bounded — run batch 4 as
written, then fill §4.5.1's table with the measured arm→test names. Leaving it open would ship a
document that describes work as pending inside a feature declared complete.

**What to change:** implement T-10 in the two files it owns, per PLAN §2.1's T-10 row — assert
`orchestrate-dev.js`'s per-file branch number `>= 85` (whole-command exit status reported, not
asserted) and add the delta arm over c8's uncovered-line list — then replace every
`*(filled in by T-10…)*` cell in PLAN §4.5.1 with the measured covering-test name, and tick §4.5's
two coverage checkboxes.

## Questions

## Positive Observations

## Recommendation

## Verdict
