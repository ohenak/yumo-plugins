# POSTMORTEM — Phase F — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → **POSTMORTEM-F** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1..5}.md` (10 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (pm-author) | 1.0 | 2026-08-06 |

RESOLVED: no

## Phase

**Phase F — FSPEC authoring and cross-review convergence. Rounds 1–5, the full
`MAX_REVIEW_ROUNDS = 5` window.**

| | |
|---|---|
| Document | `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` |
| Version at HEAD | **6.0** (2026-08-06) — v5.0 was the version rounds 5 reviewed |
| Size at HEAD | 2,513 lines / 247,750 bytes (4.1× its upstream REQ: 637 lines / 61,109 bytes) |
| Branch | `feat-pdlc-consolidation-agent` |
| Window | rounds 1–5; first reviews 2026-08-06 12:08, last reviews 13:54 — 1 h 46 m wall clock |
| Terminal state | round 5 reviewed FSPEC v5.0; both reviewers returned `VERDICT: Needs revision`; the round window was exhausted, so no round 6 could be opened |

The halt is **not** a stalled author. Every finding of every round was addressed, and the round-5
findings were addressed too — commits `561dd89`…`657b59a` (13:57–14:01) close all nine round-5
findings and all six round-5 questions and bump the document to **v6.0**. What the loop ran out of
was *rounds in which a reviewer could confirm that*, not work.

This is the **second** phase of this feature to exhaust its window. Phase R halted twice on the REQ
(`POSTMORTEM-R-pdlc-consolidation-agent.md`, rounds 1–5 and 6–10, both since resolved). The
recurrence is treated as evidence in § Best-Guess Root Cause rather than as coincidence.

## Iterations (5 — limit reached)

Findings counted from each review's `## Findings` table only (prior-finding disposition tables are
excluded — a row there is a closure, not a finding).

| Round | FSPEC ver. | software-engineer | test-engineer | Both verdicts |
|---|---|---|---|---|
| 1 | 1.0 | 5 High, 5 Medium, 2 Low | 7 High, 7 Medium, 2 Low | Needs revision |
| 2 | 2.0 | 3 High, 4 Medium, 1 Low | 3 High, 3 Medium, 0 Low | Needs revision |
| 3 | 3.0 | 1 High, 3 Medium, 2 Low | 1 High, 3 Medium, 1 Low | Needs revision |
| 4 | 4.0 | 0 High, 3 Medium, 1 Low | 0 High, 1 Medium, 0 Low | Needs revision |
| 5 | 5.0 | 0 High, 3 Medium, 3 Low | 0 High, 2 Medium, 1 Low | Needs revision |

**High severity is fully retired and has been since round 4** (SE last filed a High in round 3;
TE in round 3). **Medium is flat.** Across five rounds the combined Medium count runs
10 → 7 → 6 → 4 → 5. It is not trending to zero; it is oscillating around four or five.

### Prior-finding disposition, by round

| Round | Prior findings re-checked | Closed as filed | Argued / rejected / partially addressed |
|---|---|---|---|
| 2 | SE 12, TE 16 | all | none |
| 3 | SE 8, TE 6 | all | none |
| 4 | SE 6, TE 5 | all | none |
| 5 | SE 4, TE 1 (+3 questions answered) | all | none |

Four consecutive rounds in which **every** prior finding was closed as filed and none was argued
with. SE's round-5 recommendation states it outright: *"the fourth consecutive round in which every
prior finding was addressed rather than argued with."*

### Open at the limit (round 5, against FSPEC v5.0)

| ID | Reviewer | Sev | Subject |
|---|---|---|---|
| F-01 | SE | Medium | §8.2's new kind-precedence rule leaves `target`/`artifact` undetermined on the *subject* axis for kind 3 (two colliding subject paths, one slug) |
| F-02 | SE | Medium | AT-R6b's third fixture contradicts itself in its Given ("two AC-2.2 promotions" vs. a fixture containing none; "the same colliding subjects" vs. one shared path) — not buildable as written |
| F-03 | SE | Medium | §8.1's new reader-side rule (short record ⇒ parse notice, skip, never halt/default/repair) is normative and asserted by no AT; its cited AT-F20/AT-F16 have other Givens |
| M-01 | TE | Medium | Same defect as SE F-03, filed independently — BR-33a's reader-side half has no falsifier, and no `E-` row beside E-12 |
| M-02 | TE | Medium | §8.2's precedence order is a three-member total order fixtured at one of its three ordered pairs; the untested (2, 3) pair is the one whose wrong answer produces the outcome §8.2 says cannot happen |
| F-04 | SE | Low | §6.5 cites the branch-guard read at `orchestrate-dev.js:3585` — an error-string line; the read is `:3524`, the call site `:3580` |
| L-01 | TE | Low | Same citation defect, filed independently |
| F-05 | SE | Low | §6.5's closing absolute ("equality is asserted on no domain") is falsified by AT-Q7c's own `∅` equalities |
| F-06 | SE | Low | §6.5's fifth column glosses its Given ("i.e. any pass that promotes anything") into a wider set than §5.4's stages-nothing path admits |

**Five Medium findings, of which two pairs are the same defect found twice** (SE F-03 ≡ TE M-01;
SE F-04 ≡ TE L-01). The distinct open Medium set is four: the subject tie-break, the unbuildable
fixture, the untested reader-side rule, and the under-fixtured precedence order.

### What happened after the limit

| Commit | Time | Closes |
|---|---|---|
| `561dd89` | 13:57 | SE F-04/F-05/F-06, TE L-01, TE Q-02 — §6.5 citation at its seam call, equality absolute qualified, commit Given un-widened, read set declared closed |
| `1f98b77` | 13:57 | SE F-01 — §8.2/§8.1 subject tie-break, lexicographic and input-pure, governing `artifact` and kind-3 `target` |
| `6690799` | 13:58 | SE F-02, TE M-02 — AT-R6b rebuilt as five buildable fixtures spanning the tie-break literal and all three kind pairs; BR-33b names them |
| `df3feef` | 13:59 | SE F-03, TE M-01, SE Q-02 — §8.1 per-field reader table, AT-F21 falsifier, E-12b error row |
| `9edbecc` | 14:00 | SE Q-01/Q-03, TE Q-01/Q-03 — AT-F19 asserts the literal count, ER-5 spells its on-landing delta, §8.2 bounds the merged `symptom` |
| `657b59a` | 14:01 | version bump to **6.0**; O-C8 prices the tie-break's loss |

Every round-5 finding and question has a claimed closure at HEAD. **None has been confirmed by a
reviewer** — that is precisely what the exhausted window forbids, and it is the whole of what this
halt is holding open.

## Reviewers

| Role | Skill | Lens | Rounds |
|---|---|---|---|
| software-engineer | `pdlc:se-review` | feasibility, implementability, contract totality, citation accuracy against HEAD | 1–5 |
| test-engineer | `pdlc:te-review` | testability, oracle strength, fixture buildability, completeness by set-equality | 1–5 |

Both reviewers worked to the shipped protocol and there is no procedural fault to record on either:

- **Rounds 2–5 were delta-scoped as designed.** Each review names its baseline commit and its diff
  range (round 5: `d0ee225..HEAD`, "+122/−33 lines across 6 commits") and states that unchanged
  sections were not re-litigated. Both held that line — no round re-opened a settled decision.
- **Repository claims were verified, not asserted.** Round 5 alone re-checks `parseAbbrevRef`
  (`orchestrate-dev.js:3491-3496`), `readHeadBranch`'s seam call (`:3524`), `gitWithLockRetry`
  (`:8617`), `commitPaths` (`:8669`), `MERGE_GUARD_DEFAULTS` (`:48-53`),
  `build-runtime.mjs:448/:464-471`, and the upstream quotation at
  `docs/_constraints/pdlc-consolidation-vocabularies.md:63`. The only citation defect found was the
  author's, and both reviewers found it.
- **Both applied the approval bar as written** — any open High or Medium ⇒ Needs revision — and
  neither inflated severity to hold the document. TE's round-4 review filed a single Medium and
  nothing else; SE's round-5 review states "No High finding remains, and none has since v3."
- **The erratum channel was used rather than bypassed.** SE round-4 F-02 found an upstream defect
  in the REQ-owned vocabularies file; it was routed as ER-5 rather than edited in place, and SE
  round 5 confirms it: "No erratum is emitted with this review … already in the orchestrator's
  hands."

## Pattern of Disagreement

**There is no disagreement between the reviewers, and none between the reviewers and the author.**
That is the finding. Five distinct patterns describe the window.

### 1. The reviewers converge; they do not split

Round 5's two reviews overlap on two of their three Medium/Low pairs — SE F-03 ≡ TE M-01 (the
reader-side rule with no falsifier) and SE F-04 ≡ TE L-01 (the `:3585` citation) — each filed
independently, with independently-derived evidence. Round 3 shows the same convergence one level
in: SE F-04 and TE H-04 are the same AT-Q7 pooled-set defect. Where they differ it is by *lens*,
not by verdict: SE files contract totality (an undetermined `target`), TE files fixture coverage
(an enumeration sampled at one member). Neither ever contradicted the other's severity, and no
finding in five rounds was rebutted by the sibling reviewer.

### 2. The author never argued a finding

Four consecutive rounds at 100 % closed-as-filed (table above). There is no rejected finding, no
"won't fix", no deferred-with-reason row anywhere in the window. The failure mode this loop is
designed to catch — an author and a reviewer deadlocked over a judgement call — did not occur.

### 3. The disagreement is with the *loop*, not with a person: repairs generate defects at a roughly constant rate

Every round's Mediums are consequences of the previous round's repairs. SE says it in round 5's own
words — *"the three Mediums are all consequences of this round's own repairs — none touches the
document's scope, structure, or any settled decision"* — and in round 5's disposition table:
*"As in each of the last three rounds, the repairs create new checkable defects in the sections
they rewrote."* TE frames the same observation as a shape: *"both of the same shape the last two
rounds have had: a new mechanism arriving one step ahead of the artefact that pins it."*

The arithmetic follows: Highs are retired monotonically (12 → 6 → 2 → 0 → 0) because they were
defects in the *original* draft and are consumed by repair, while Mediums stay at four or five
because they are *manufactured* by repair. Five rounds is enough to exhaust the first population
and cannot, by construction, exhaust the second.

### 4. Findings migrate one axis over rather than recurring

The same defect *shape* reappears displaced by one level, which is why it never reads as a repeat
and never triggers a "we have been here" response:

| Thread | v1 | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| §6.5 / AT-Q7 seam oracle | F-10: absence-only oracle | F-02: set-equality on the wrong domain | F-04 / H-04: sets pooled across trees | F-01: per-tree sets narrower than the obligations | F-05/F-06: residual absolute + widened Given |
| §8 merge rule | — | — | — | F-03: `target` undetermined across §5.2 *kinds* | F-01: `target` undetermined across *subjects*; M-02: order fixtured at one pair |
| receive-side rules | F-08: "consumed window" undefined | F-04: carrier reads a field the record lacks | H-02: `passId` outside the field grammar | H-06: open-list computation untested | F-03/M-01: short-record rule untested |

TE named the mechanism in round 3, H-04: *"the failure mode G-01 raised, one level in."*

### 5. Every round's repair enlarges the document

The FSPEC ended the window at 2,513 lines / 247,750 bytes — 4.1× its REQ — and each round's
convergence work adds normative surface (round 5 alone: a precedence table, a tie-break, a
reader-side rule, BR-33a/b/c, AT-F19/F20, O-C8, §10.4 items 4 and 10, ER-5). Each new rule obliges
matching edits at four to six coupled sites (a BR row, an AT row, an `E-` row, a §15 traceability
row, a report-body item, a §14.2 cost entry). A site missed is a legitimate Medium. The document's
own coupling is what sets the manufacture rate in pattern 3.
