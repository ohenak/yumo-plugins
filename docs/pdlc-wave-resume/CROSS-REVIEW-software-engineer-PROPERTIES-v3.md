# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` (Version 1.2)
**Date:** 2026-08-23
**Iteration:** 3
**Scope:** delta re-review — my own v2 findings, plus new issues in the sections the revision
changed. Unchanged sections already reviewed at v2 are not re-litigated.

## Prior findings — disposition

Diffed `de65bc84..HEAD` on the document (95 insertions, 25 deletions across seven commits,
`2905403a` … `de843006`). Every prior finding was re-checked against source at `origin/main` and
against this working tree, not against the revision's own account of itself.

| v2 finding | Severity | Disposition | Evidence I re-derived |
|---|---|---|---|
| F-01 — PROP-SKIP-04 expects V-wave pathspecs the script never stages | High | **Resolved** | See below; all three conjuncts verified against source |
| F-02 — queue fixture set justified by the retired drift gate | Medium | **Resolved** | `orchestrate-queue.js` `selectNextPending` returns `{kind:"blocked-active"}` on any `in-progress` entry and `{kind:"empty", reason:"no pending entries (all done, awaiting-merge, blocked, or halted)"}` otherwise; `runQueue`'s selection block maps those to `outcome:"blocked"` and `outcome:"idle"` **before** the triage phase — exactly the two dispositions the revised § Fixtures now names. The `TRIAGE:` verdict is read by `parseTriageVerdict` with `/^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i` |
| F-03 — H-1's `events` array can be silently empty on the git axis | Medium | **Resolved** | `makeLedgerArgs`'s signature at `origin/main:pdlc/workflows/__tests__/waveExecution.test.js` is `{ ledger, config, writes, record, logs, git, runCommand = async () => ({ ok: true, output: "green" }) }` — `git` has no default, exactly as the revision now states, and `makeArgs` spreads both conditionally (`...(git ? { _git: git } : {})`). H-1 is restated as a wrapper; PROP-SAFETY-01 and PROP-RECORD-03 both gained the both-axes-present precondition |
| F-04 — PROP-COV-01 pins a gate whose current value is unrecorded | Medium | **Resolved, and it corrected me** | The `c8.include` set is **four** entries, not the three I named: `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, `**/scripts/capture-learnings-baseline.mjs` (`pdlc/workflows/package.json`, `c8.include`). I re-ran the measurement — see the row below |
| F-05 — dangling `§ Gaps, G-3` anchor | Low | **Resolved** | PROP-REPO-02's note now routes to **G-5**, and G-5 exists in § Gaps, ordered after G-4, and states the general claim it is the routing target for |

**The measured baseline, independently re-measured.** I did not take the § 11 table on trust. Running
`npx c8 --temp-directory=/tmp/c8tmp3 --reporter=text npm test -- --runInBand` from `pdlc/workflows`
in this tree today reproduces all four numbers to the digit:

| Included module | % Branch, my run | § 11's recorded value |
|---|---|---|
| `orchestrate-dev.js` | **88.75** | 88.75 ✓ |
| `orchestrate-queue.js` | 88.75 | 88.75 ✓ |
| `build-runtime.mjs` | 88.23 | 88.23 ✓ |
| `capture-learnings-baseline.mjs` | 89.47 | 89.47 ✓ |

The suite itself was `115 passed, 2 failed` of 117 — and the second failure
(`consumerCleanup.test.js`) is **mine**, not the tree's: I had a second jest process running against
the same working tree, and `consumerCleanup.test.js` passes 23/23 when run alone. So the document's
caveat is exact: `documentOracles.test.js` is the one genuinely red suite here. That is the best
kind of measured fact — one a reviewer can reproduce and does.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
