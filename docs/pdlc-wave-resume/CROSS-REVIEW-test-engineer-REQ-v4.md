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

New findings only; round-3 findings are dispositioned above, not restated. One delta-introduced
item, non-gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §10 now enumerates all four §5 rows, but §5's own dated preamble ("Correction, 2026-08-13") still speaks only of BL-01, BL-02 and BL-03 — the same subset-of-a-growing-table shape H-02 named, one section earlier. BL-04's *status* (open) is stated only in §10; §5's row states its gating logic but not whether it is satisfied. A reader who stops at §5 gets a complete-looking status summary that silently omits a row. | §5 preamble vs §5 table row BL-04 |

### F-01 — §5's preamble enumerates three of four prerequisite rows (Low, Local)

The correction block at the top of §5 is dated 2026-08-13 and BL-04 was added in round 3, so
this is defensible as a dated historical note rather than an error — that is why it is Low and
not Medium. But it reads as a current status summary ("BL-01 and BL-03 are already resolved …
BL-02's file also already exists on main"), and it sits immediately above a table that now has
four rows. The document has already paid for this exact pattern once at §10.

The cheapest fix is one clause, not a rewrite: either date-scope the preamble explicitly ("as
of 2026-08-13, when the table had three rows") or add BL-04's current status to it so the
summary and the table stay in set-equality. The substance is correct wherever it is stated — the
finding is about which sections a reader can trust as complete.

Applying the write-the-test-right-now check: an acceptance test derived from §5 alone would set
up three prerequisites and consider the fixture complete. One derived from §10 would set up
four and know that only three gate pickup. The two readings do not conflict on facts, only on
completeness, which is why this does not gate.

## Questions

## Positive Observations

## Recommendation

## Verdict
