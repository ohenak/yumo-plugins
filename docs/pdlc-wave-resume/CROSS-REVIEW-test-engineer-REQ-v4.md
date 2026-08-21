# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** delta re-review of the v1.4 → v1.5 revision (`f256d767..HEAD`), testing lens only.

## Verification Method

The delta is 20 insertions / 9 deletions across three sites (`git diff f256d767..HEAD --
docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`): the v1.5 header amendment note, §1's
precondition preamble plus precondition 1, §9's OQ-1 banner recipe, and §10's readiness
sentence. Every code claim the delta newly rests on was re-derived from
`git show origin/main:pdlc/workflows/orchestrate-dev.js` (16,336 lines), consistent with the
REQ header's own instruction that code claims are verified against the default branch, not
against this branch's 1,637-commits-behind tree.

Four re-derivations, all as the delta states them:

- **The banner grep now reproduces.** `grep -n "to force a"` returns exactly two hits: one
  inside the complete-record skip banner and one inside the mid-plan resume banner.
  `grep -n "to force a full run"` returns exactly one — the resume banner — because the skip
  banner splits the phrase across a template-literal line break (`to force a ` + `full run.`).
  Both the "two hits" count and the "matches only the second" attribution are literally true,
  and the two hits sit under the `Skipping Phase I (wave ledger …)` and `Resuming at wave …`
  emits respectively, exactly as the parenthetical says.
- **The write's guard, re-derivable from the quoted comment.** The comment
  `Only now — verified — does anything get committed` is a verbatim, grep-unique substring of
  the source (the file adds a trailing `(M-6)` the REQ correctly does not quote). The branch it
  opens is `if (waveGit)`; the per-task commit loop and the `writeWaveLedger(...)` call both sit
  inside it, and the `rev-parse HEAD` stamp is a nested best-effort inside that same branch.
- **The sibling claim holds structurally.** The gate-mode branch is `if (scriptGate) { … } else {
  evaluateBatchGate(…) }` — it closes at its own `else`/`}` well before the un-skip guard and
  well before the commit branch opens. The commit-and-record branch is therefore a sibling of
  the gate-mode branch, not nested inside its script-gate arm, so "commits and record are
  reached in either gate mode" is a property of the shipped brace structure, not an inference.
- **§10's readiness claim matches the artifacts it cites.** Frontmatter carries `ready: true`;
  `docs/_queue/QUEUE.md` line 45 carries `| 20 | pending | pdlc-wave-resume | …`; §5's table has
  four rows, BL-04's gating logic column reading "Checked at FSPEC authoring", which is what
  §10 now restates as "not a pickup gate".

Two regression checks over the whole file: `grep "\.js:[0-9]\|\.md:[0-9]"` still returns
nothing (G-04/DEC-DOC-01 fix did not regress), and the file is 540 lines / 39,955 bytes, inside
the 700-line / 60 KB REQ budget the `check-req-size` hook enforces.

## Round-3 Findings — Disposition

| ID | Round-3 finding | Sev | Status | Evidence |
|----|-----------------|-----|--------|----------|
| H-01 | OQ-1's recipe promised two hits for the banner string `"to force a full run"`; the branch returns one, because the skip banner wraps the phrase across a template-literal line break | Low | **Resolved** | OQ-1 now greps for `to force a` and states the count that string actually returns (two), names which banner each hit belongs to, and *keeps* the longer phrase as a stated one-hit case with the line-break reason. Re-run at the default branch: `to force a` → 2, `to force a full run` → 1. The fix is better than the one suggested in v3 — instead of substituting a different citation, it records the wrapping behaviour that made the first citation unreproducible, which is the transferable lesson. |
| H-02 | §10's readiness note certified `ready: true` over `BL-01..03` while §5 had grown a fourth row (BL-04), so the enumeration under-covered the table | Medium | **Resolved** | §10 now enumerates the whole table by id — "BL-01, BL-02, BL-03 resolved at HEAD; BL-04 open, discharged at FSPEC authoring and **not** a pickup gate" — and states the conclusion that follows (`ready: true` is accurate today). This is set-equality over §5's four rows rather than containment: adding BL-05 later forces this sentence to change. Q-01 is answered in the document, not merely in a review file. |
| H-03 | §1's headline said three preconditions "discard" the record, but precondition 1 prevents the record from ever being written — two different oracle shapes flattened into one verb | Low | **Resolved** | The preamble now reads "**one prevents it from ever being written, two discard what was written** — two shapes, two oracles". The FSPEC author sizing the gap from this sentence alone now sees that REQ-WVR-09's proof is a no-file-exists oracle while preconditions 2–3 need announced-ignore oracles. The naming of *oracles*, not just cases, is what makes the sentence usable at authoring altitude. |

No round-3 finding is carried forward. The delta introduced one new non-gating item (F-01 below)
and no new High.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
