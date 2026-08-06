# POSTMORTEM — Phase R — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → **POSTMORTEM-R** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md` (10 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (pm-author) | 1.0 | 2026-08-05 |

RESOLVED: no

## Phase

**Phase R — REQ authoring and cross-review convergence.**

Document under review: `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
(697 lines / 60,246 bytes at the v5 read — inside the 700-line / 60 KB REQ budget).
Branch: `feat-pdlc-consolidation-agent`.

The phase halted because the review loop reached `MAX_REVIEW_ROUNDS = 5` with both reviewers
still returning `VERDICT: Needs revision`. The halt is a round-budget exhaustion, **not** a
finding that the REQ is wrong: round 5 closed with **0 High** findings from both reviewers, and
every v5 finding was subsequently addressed on the branch (commits `4e2c002`, `7640bd2`,
`cc601c3`, `e75a115`, header `0445706`) — but no round 6 exists in which a reviewer could
observe those fixes.

## Iterations

**5 — limit reached** (`MAX_REVIEW_ROUNDS = 5`).

| Round | SE verdict | SE findings | TE verdict | TE findings | Net |
|---|---|---|---|---|---|
| v1 | Needs revision | 8 H, 6 M, 2 L | Needs revision | 6 H, 5 M | 16 + 11 open |
| v2 | Needs revision | 2 H, 5 M, 2 L | Needs revision | 4 H, 3 M, 2 L | all v1 findings resolved; 9 + 9 new |
| v3 | Needs revision | 2 H, 2 M, 3 L | Needs revision | 2 H, 3 M, 1 L | all v2 findings resolved; 7 + 6 new |
| v4 | Needs revision | 0 H, 1 M, 2 L | Needs revision | 0 H, 2 M, 2 L | all v3 findings resolved incl. Highs |
| v5 | Needs revision | 0 H, 3 M, 1 L | Needs revision | 0 H, 2 M, 3 L | 3/3 and 4/4 v4 findings resolved |

Severity trajectory: **14 High → 6 High → 4 High → 0 High → 0 High.** No High finding has been
raised in the last two rounds. No round ever re-raised a prior round's finding as unresolved:
the disposition tables in v2–v5 record 100% closure of the preceding round's findings in every
round, and the Medium counts in v5 (3 SE / 2 TE) are ripples of one decision taken *in* v5, not
residue.

Neither reviewer ever emitted an `ERRATUM:` line — no upstream document (MASTER-PLAN,
`pdlc-advisory-tier`, `pdlc-merge-phase`, `DOMAIN-CONSTRAINTS`) was found defective in any round.

## Reviewers

| Role | Skill | Files | Final verdict |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | `CROSS-REVIEW-software-engineer-REQ-v{1..5}.md` | Needs revision (0 H, 3 M, 1 L) |
| Test Engineer | `pdlc:te-review` | `CROSS-REVIEW-test-engineer-REQ-v{1..5}.md` | Needs revision (0 H, 2 M, 3 L) |

Author across all five rounds: `pdlc:pm-author`.

## Pattern of Disagreement

**There is no reviewer-vs-reviewer disagreement, and no author-vs-reviewer disagreement on
substance.** That is the defining feature of this halt and the reason it needs an operator rather
than a sixth round of the same loop.

### 1. The reviewers agree — including on the same findings, independently

The two v5 blocker sets overlap almost exactly. SE F-02 and TE F-34 are the same defect
(a `refused` pass committing `.consolidation-log.md` necessarily commits the winner's live
`IN-PROGRESS:` marker, falsifying the REQ's twice-stated "the marker is never committed" at
`:123` and `:336`). SE F-03(b) and TE F-33 are the same defect (§4b's `no-cadence-datum` row omits
`refused`, which §4b's own composition rule admits). SE F-04(a) and TE F-36 are the same
one-line citation slip (`phase: "CR"` is at `:10257`, cited as `:10255-10256`). Where the sets
differ they are complementary, not contradictory: SE F-01 (the merged-PR suppression key is the
sorted consumed set, so it cannot fire after an abandonment where the set has grown) is
unique to SE; TE F-37 (a `refused` row is a second record that can precede the first consumed
block) is unique to TE.

Both reviewers also applied the REQ's own §5a stopping rule to themselves, in writing, and both
concluded — reluctantly and with reasons — that their remaining Mediums fall inside §5a's
"belongs at the REQ layer" list rather than being routable downstream.

### 2. The disagreement is with the *round budget*, not with each other

Every round produced a strictly better document and a strictly smaller, milder finding set. The
loop did not oscillate, did not re-litigate settled decisions, and did not diverge. What it did
was **fail to reach zero blocking findings within five rounds** on a document whose finding rate
per round has been falling monotonically but has not yet hit the floor.

### 3. The recurring *shape* of the residual findings: propagation debt

From v3 onward, essentially every remaining Medium has the same form:

> A decision taken in round *N* to close a round *N−1* finding is correct, but the REQ contains
> two or three **enumerations** frozen against the old answer, and one of them was not updated.

- v3 F-03/F-04 (SE): three ACs disagreeing about a case AC-1.4 itself introduced.
- v4 F-29/F-30 (TE): AC-5.2's partition sentence contradicting AC-5.2's own row 3; AC-1.3's
  Commits column contradicting AC-7.2.
- v5 F-02/F-03 (SE) and F-33/F-34 (TE): *all four* are ripples of the single v5 decision to make
  `refused` a row-writing status. Three of the five ripples of that decision were carried in the
  same revision, unprompted; two were missed.

This is a document with a high density of cross-referencing closed sets (§4b's reason-code ×
status table, AC-1.3's status set, AC-7.2's exemption set, AC-5.2's mapping table, NFR-4's key
set, AC-4.2's `credential:` value set) that the REQ **itself nominates as the downstream
set-equality oracle** ("checkable by set-equality against this table; adding a value above without
a row here is a defect"). That nomination is what makes each missed propagation a *blocking*
Medium rather than a cosmetic one — both reviewers said so explicitly, and TE noted that under a
REQ that did not make that promise the same finding would be Low.

### 4. What was never contested

Across all five rounds, in the last two rounds in particular, neither reviewer contested: user
need, scope, priority, phasing, or the truth of any claim the REQ makes about existing code. The
v5 citation audits check 9 (SE) and 12 (TE) changed `file:line` claims against HEAD; every one
resolves to a real authority saying what the REQ attributes to it, with two off-by-one-to-two
range slips that change no requirement.
