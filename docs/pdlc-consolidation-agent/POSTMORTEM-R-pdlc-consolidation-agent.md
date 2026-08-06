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

RESOLVED: yes

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

## Best-Guess Root Cause

**The REQ made itself the downstream set-equality oracle, and the review loop's round budget was
sized for a document that had not.**

Three factors compose. In order of weight:

1. **Self-nominated oracle density.** The REQ deliberately elevates half a dozen enumerations
   (§4b's reason-code × status table, AC-1.3's status set, AC-7.2's exemption set, AC-4.2's
   `credential:` value set, AC-5.2's artifact mapping, NFR-4's key set) to normative
   set-equality sources — "checkable by set-equality against this table, not by containment".
   That is good requirements engineering and it is why the Highs died so fast. It also means
   **every** semantic change has to be propagated to *N* tables, and any single missed cell is a
   legitimate blocking finding by the document's own stated standard. The REQ raised its own bar
   and then had to clear it, five times, under a fixed budget.

2. **Serial single-decision rounds.** Each round closed the prior round's findings by taking one
   or two *decisions* (v5: "`refused` becomes a row-writing status"), and each decision had a
   ripple set of 4–5 places. The revision carried 3 of 5 ripples unprompted; the reviewers found
   the other 2 — and those 2 became the next round's blockers. The loop's steady state was
   therefore not "residual defects" but "one round of propagation lag per decision". With one
   decision per round and a 5-round budget, the loop can absorb at most four decisions cleanly.
   This REQ took more than four.

3. **No propagation checklist at the authoring seam.** Nothing in the authoring step forced the
   author, after changing a value in one enumeration, to re-derive every table whose membership
   is a function of that value. The reviewers ended up performing that derivation — correctly and
   consistently, which is why the findings are one-cell fixes — but a reviewer round is an
   expensive way to run a mechanical closure check, and it costs one of five rounds each time.

Contributing but not causal: the document is at the top of its size budget (697/700 lines,
60,246/61,440 bytes), so several rounds spent effort on compression that could have gone to
propagation. Not causal because compression demonstrably cost nothing checkable — TE re-verified
every citation in the reflowed text in v5 and found no regression.

**What is not the root cause:** reviewer disagreement (there is none), reviewer drift or
escalating standards (severity fell monotonically), a defective upstream document (zero ERRATUM
lines in five rounds), or an unimplementable requirement (no reviewer contested feasibility, and
SE verified 22 citations in v4 and 9 in v5 against HEAD without finding a false claim about the
codebase).

## Recommendation

The REQ is close. Two rounds with zero High findings, monotonically falling severity, complete
per-round closure, and — critically — **every v5 finding has already been addressed on the
branch** in commits made after the v5 reviews were written:

| v5 finding | Addressed by |
|---|---|
| SE F-02 / TE F-34 (`refused` commit vs. marker) | `4e2c002` — a refused pass writes its row but commits nothing |
| SE F-03 / TE F-33 / TE F-35 (§4b rows, `PHASE_DISPATCH` line) | `7640bd2` — `no-cadence-datum` admits `refused`; `writes-uncommitted` does not; declaration is `:3336` |
| SE F-04 / TE F-36 / TE F-37 (citations, second legacy-region exemption) | `cc601c3` |
| SE F-01 / TE Q-11 (duplicate-PR suppression key) | `e75a115` — suppression keys per promotion on a `PDLC-CONSOLIDATION-PROMOTIONS` trailer; `failure-mode-id` stability stated |
| Cross-review roster through v5 | `0445706` — REQ header v1.4 |

No reviewer has yet observed that tree. The halt therefore records an exhausted budget, not an
unresolved defect set.

**Recommended action, in order:**

1. **Verify the five commits above actually close the ten v5 findings.** Read each finding
   against the current REQ text — not against the commit messages. This is the judgment call the
   `RESOLVED:` marker gates, and it is the operator's, not the loop's.
2. **Re-run one bounded review round on the current tree.** Clear the halt by setting
   `RESOLVED: yes` in this file with a commit that names what addressed each finding, then
   re-invoke:
   `/pdlc:orchestrate-dev { "reqPath": "docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md", "forcePhases": "R" }`.
   Expect a short round: the reviewers' v5 dispositions show they close cleanly what has been
   addressed, and every open item is a one-cell or one-paragraph fix.
3. **Before that round, run a propagation sweep yourself.** For each enumeration the REQ nominates
   as a set-equality oracle (§4b, AC-1.3, AC-4.2, AC-5.2, AC-7.2, NFR-4), re-derive its membership
   from the current ACs rather than reading it. This is the check that has consumed one round in
   four of the last five, and it is mechanical.
4. **Do not re-open settled ground.** Scope, priority, phasing, user need, and every claim about
   the shipped codebase have been reviewed and are uncontested by both reviewers for two rounds.
   A round that revisits them spends the budget on ground that is already firm.

**Not recommended:** re-running the loop unchanged with a larger budget. The steady state is one
round of propagation lag per decision; more rounds absorb more decisions but do not remove the
lag. If a future REQ in this family again self-nominates dense set-equality oracles, the durable
fix is a propagation checklist at the authoring seam (§3 above) — a candidate for
`harvest-learnings` to promote at Phase H.

**Escalation path if step 2 does not converge:** the residue would then be genuine, not
propagation lag, and the right move is to split the REQ — the consolidation-cadence half
(REQ-CONS-01, AC-1.x, §4b) and the cross-repo-promotion half (REQ-CONS-03, AC-3.x, AC-5.x, NFR-4)
have almost disjoint enumeration sets, and the coupling between them is what makes each decision's
ripple set large.

## Resolution (2026-08-06)

The Recommendation's steps 1 and 3 were carried out by two independent verification agents
against the current tree (REQ read at `2e29dd9`; all code citations checked against
`pdlc/workflows/orchestrate-dev.js` at HEAD, which no commit on this branch touches).

**Step 1 — per-finding verification.** Nine of the ten v5 findings, and all four open
questions, are closed by the commits the table above names, verified against the REQ text at
the cited lines — not against commit messages:

| v5 finding | Verified closed by |
|---|---|
| SE F-01 / TE Q-11 | `e75a115` — NFR-4 keys per promotion on the `PDLC-CONSOLIDATION-PROMOTIONS` trailer (REQ `:266-268`, `:540-547`); `failure-mode-id` stability at `:392-395` |
| SE F-02 / TE F-34 | `4e2c002` — AC-1.3 `refused` row commits nothing (`:200`, `:203-211`); AC-3.8b's "never committed" absolute is true again; end-of-file whole-record append discipline stated |
| SE F-03(a)(b) / TE F-33 | `7640bd2` — §4b `no-cadence-datum` admits `refused` (`:599`, justification `:627-630`); `writes-uncommitted` excludes it (`:600`, `:630-631`) |
| SE F-04(a)(b) / TE F-36 | `cc601c3` — `phase: "CR"` cited `:10255-10257`; both dod-verify dispatch sites (`:7911`, `:7941`) named |
| TE F-37 | `cc601c3` — REQ-CONS-01(b) names exactly two exempt pre-boundary records (`:122-125`) |
| TE F-35 | **regressed by `7640bd2`, corrected in the resolution commit**: the v5 fix adopted TE's line number, but TE's premise was wrong (SE v5 verification row 7 was accurate) — `:3336` is a comment; the `PHASE_DISPATCH` declaration is `:3337`, first key `R:` `:3338`. REQ §4b now cites `:3337-3437`. Verified against the file directly. REQ header bumped to v1.5. |

**Step 3 — propagation sweep.** All six self-nominated set-equality oracles (§4b, AC-1.3,
AC-4.2, AC-5.2, AC-7.2, NFR-4) were re-derived from the surrounding ACs and diffed against the
written tables: SWEEP CLEAN — no missing, extra, or contradictory cell; every ripple of the v5
"`refused` writes a row" decision is propagated, including the AC-1.3/§4b/AC-4.2/AC-7.2 and
REQ-CONS-01(b) sites.

No reviewer round is skipped by this resolution: per §3.6, re-entry derives a fresh window
(rounds 6–10) from the on-disk `-v{1..5}` files, and the reviewers judge the current tree in
round 6. Steps 2 and 4 of the Recommendation are the re-invocation itself.
