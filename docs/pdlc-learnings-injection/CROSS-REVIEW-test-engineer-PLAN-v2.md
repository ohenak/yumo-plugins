# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.2)
**Date:** 2026-08-20
**Iteration:** 2
**Base of the delta:** `5acb37f6` (the commit at which v1 was written) → `94539626` (HEAD)

## Overview

**Scope of this round.** Delta re-review of the twelve commits between `5acb37f6` and `94539626`
(+185 / −67 lines on the PLAN). I read my v1 file, diffed the document against the commit I
reviewed, verified each of my twelve prior findings against the revised text and the repository,
and scanned only the changed material for new issues. Sections I approved in v1 and that the diff
did not touch — LI-08, LI-09, LI-11, LI-12, LI-16…LI-18, LI-20, the read-only manifest, P-Q-1…4 —
were not re-litigated.

**Disposition of the twelve v1 findings.** All five Highs are resolved, all four Mediums are
resolved, all three Lows are resolved.

| v1 | Sev | What v0.2 does | Resolved |
|---|---|---|---|
| F-01 | High | §Verification replaces the "full suite green" gate for batches 7–13 with a per-batch expected-red ledger, stated in `LI-AT-` test names wherever a suite splits across two green tasks, shrinking to empty at batch 13 | ✅ |
| F-02 | High | LI-14 is restated **green-terminal** (static parse of six suite files, no symbol under test); LI-15's "Greens `LI-T-SUITEMAP`" clause is deleted and replaced by "**only** `LI-T-PIN-1`"; batch 6's terminal state and the §Traceability row agree | ✅ |
| F-03 | High | LI-03 now names the instrument: a dedicated temp git repository as the script's `cwd`, **real** `git`, the throw injected through the script's fixture/import seam rather than `_git`, and the `worktree list` conjunct read from the temp repo's real `.git/worktrees/` state, explicitly not degradable to an argv assertion | ✅ |
| F-04 | High | LI-06 carries a three-step mutation proof — byte flip, deleted `{caseId}`, spurious `{caseId}` — each targeting a different clause, performed before the commit, recorded verbatim in the completion note, "a step that does not red is a halt, not a pass" | ✅ |
| F-05 | High | LI-01 owns `__tests__/learningsPremises.test.js`, one structural assertion per premise, in the file-ownership manifest at batch 1; the engine-failure triage is separated out as a written CI-evidence record | ✅ |
| F-06 | Med | `LI-T-IGNORE` becomes three conjuncts — root ignored, nested `.baseline-worktree` **not** ignored, `fixtures/learnings-baseline/` **not** ignored — which is the paired oracle LI-04's root anchoring lacked | ✅ |
| F-07 | Med | New **LI-23** authors `learningsArmInventory.test.js`: the twelve arms driven in one file, observed reason codes asserted **set-equal** to the three frozen catalogues; DoD 3 is discharged by the suite, LI-22's walk demoted to a human cross-check | ✅ |
| F-08 | Med | New DoD 12 states the capture script's coverage exemption, why `c8.include` cannot reach a root-level script, and the three oracles standing in for a floor | ✅ |
| F-09 | Med | §The measured baseline now carries the stage-2 per-file numbers and the finding that the bare `npm run test:coverage` never reaches stage 2; DoD 11 and new H-8 are stated against 88.14 % | ✅ |
| F-10 | Low | The change-surface table names all fourteen new test files and both LI-06 artifacts | ✅ |
| F-11 | Low | The arithmetic is restated as 24 rows over 17 files and reconciles with the tables | ✅ |
| F-12 | Low | P-2a is restated as "three object-literal sites plus one positional argument at the review-loop optimizer call" | ✅ |

**Everything above was re-measured, not read.** P-2a's shape is exactly as v0.2 now states it:
`dispatchKind: "authoring"` object literals at `pdlc/workflows/orchestrate-dev.js:12861`, `:12955`
and `:13657`, and the positional `"authoring"` argument at `:7663`, which is the `runWrapped(
optimizer, optPrompt, doc, "authoring", authorSessionKey(...))` call inside `reviewLoop`'s FAIL
path — the review-loop optimizer call, as the row says. `MODULE_NAMES` is
`["orchestrate-dev.js", "orchestrate-queue.js"]` at `pdlc/engine/scripts/prepack.mjs:20` (P-1).
`git check-ignore -v .baseline-worktree` still exits 1 at the root, so LI-03's conjunct (1) is red
at HEAD as claimed.

**Verdict of this round: Approved with minor changes.** Four Medium and two Low findings, none
gating. The four Mediums are all in material the revision newly added — three of them are one-
clause transcription fixes an implementer would otherwise have to decide alone, and the fourth is
a gate row that is missing the conjunct its three sibling rows carry.

## Batches

_pending_

## Dependencies

_pending_

## Verification

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
