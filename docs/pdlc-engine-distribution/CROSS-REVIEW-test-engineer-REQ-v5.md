# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10)
**Date:** 2026-08-13
**Iteration:** 5
**Scope:** Testing lens, erratum delta-confirmation. Diff `2a1f910d..HEAD` on the REQ, plus a
re-grounding pass over what the changed text now leans on: FSPEC F-3 step 5 / BR-2.1 / BR-2.2 /
BR-4.7 / E-18 / AT-3.5, `DECISIONS-headless-engine-obligations.md` DEC-HE-02, and
`docs/_constraints/pdlc-engine-baseline.md` at HEAD.

## Erratum item disposition

All four raised items landed. Verified against the document and its upstream, not the changelog:

| Item | Landed as | Grounding checked |
|---|---|---|
| NG-6 restated as scope, not verb (se-review) | NG-6 (`:169-175`) now opens "The scope of this non-goal is **install and upgrade**, not every engine activity", enumerates the forbidden verbs (create, sync, write, read, version-check) *under that scope*, and states the run's read of `engine.*` as outside it | Matches FSPEC BR-2.2 (`:321-324`, "Install and upgrade touch consumer config not at all") and BR-4.7 (`:374-375`, "A **run** reads … only the `engine.*` namespace … and never writes it") word-for-word in substance |
| NG-6/O-2 reconciled honestly on scope (pm-author) | Same edit; the run-side half cites O-2 and AC-5.1, so the two statements point at each other rather than at a verb distinction | AC-5.1 (`:397-404`) does require the pinned version to execute, so the read is a real behaviour and not a hypothetical |
| O-2's "reading is not writing (NG-6 forbids only the latter)" misstatement (se-review) | The gloss is gone (`:524-530`); replaced by "This does not cross NG-6: that non-goal scopes install and upgrade, which touch no consumer file at all, while a run may read the operator-authored pin" | DEC-HE-02 (`docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md:37-49`) says the per-consumer `.claude/pdlc.config.json` is "the **only** config file the engine reads", with `engine.*` reserved — the REQ's compression is faithful |
| AC-3.5 absence-only oracle (te-review) | AC-3.5 (`:339-346`) keeps the absence scan, names why absence alone is vacuous, and adds positives (a) secret present ⇒ publish authenticates, release cut; (b) absent/empty ⇒ workflow fails at the publish step naming the missing secret, nothing published | The shape is right; the carriers are not yet named anywhere — F-02 and F-03 below |

No collateral change: the diff is exactly the version bump, the changelog paragraph, NG-6, O-2 and
AC-3.5. The changelog's "No other change" is true as written. Size is 605 lines / 50,881 bytes,
inside the 700-line / 60 KB REQ budget, so the `check-req-size` hook stays quiet.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
