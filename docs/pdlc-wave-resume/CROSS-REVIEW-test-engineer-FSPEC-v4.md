# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation, round 4)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** upstream-cascade confirmation. The FSPEC's own bytes are unchanged; REQ was edited by a
Phase T erratum round after this FSPEC's approval was recorded. One question is answered: does the
FSPEC still hold as approved against REQ **at its current version**
(sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f)?

## Overview

**What this round is.** Not a re-review of the FSPEC. Its bytes are byte-identical to the version
approved in `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (verdict: *Approved with minor changes*,
`{"high": 0, "medium": 1, "low": 3}`, `REVIEWED-COMMIT: c37b80df`) — verified by
`git diff c37b80df..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md`, which is empty. What
moved is upstream: REQ went v1.6 → v1.7 under a **Phase T** erratum round, so the approval on record
was taken against a REQ that no longer exists.

**Delta base, pinned both ends.** The REQ state the v3 confirmation approved against is
`c37b80df:docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` (sha256:ad68cd05…, pinned in that file's
`UPSTREAM-STATE:` anchor). REQ at HEAD is sha256:17e83bfc…. Both verified locally with
`shasum -a 256`; the HEAD sha matches the one in this dispatch exactly. The diff read is:

```
git diff c37b80df..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
```

Three commits, three hunks, 13 insertions and 4 deletions. No acceptance criterion was added,
renamed, deleted, re-numbered, or re-prioritised.

**The three upstream hunks.**

| # | REQ section | What the erratum changed |
|---|---|---|
| E-1 | Header + §1 revision log | Version 1.6 → **1.7**; a v1.7 erratum note naming the round's two items |
| E-2 | §5 (Blockers), BL-04 row | The row now states the check's outcome as **unmet** — "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)" — instead of reading as discharged at FSPEC authoring |
| E-3 | §11, OB-1 | The worktree conclusion **stands**; its evidence is re-labelled: the include list that carries `.claude/workflows/` into a worktree is **consumer-local, untracked on the default branch — a consumer fact, not a repo fact** — so the ledger's consumer-local path is absent there and the run fails open to a full run |

**Direction of travel.** All three hunks move REQ *toward* this FSPEC, and two of them land items the
FSPEC itself routed. E-2 completes the correction the FSPEC asked for in OB-F1 (§10 was fixed in the
Phase F erratum round; §5's row was the last place REQ still read as discharged, and it now agrees).
E-3 downgrades an evidence claim from repo fact to consumer fact — a *weakening* of upstream's
warrant, which is the direction that can silently break a downstream compression if the downstream
had leaned on the strong form. It did not: the FSPEC never cites `.worktreeinclude`, never asserts a
repo-level worktree fact, and EC-17 traces to REQ **OB-3** and D-DIST-07, not to OB-1
(`grep -n "worktree" FSPEC` returns EC-17 alone). E-1 is bookkeeping.

**Net.** No clause of this FSPEC is contradicted by the new upstream text. What the round leaves is
the same small class of **stale quotations** already on record from v3 — three places where the FSPEC
quotes or characterises REQ text that REQ no longer carries. Two of the three are now stale in a
second place as well, which changes their evidence, not their severity.

## Linked Requirements

_pending_

## Behavioral Flow

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
