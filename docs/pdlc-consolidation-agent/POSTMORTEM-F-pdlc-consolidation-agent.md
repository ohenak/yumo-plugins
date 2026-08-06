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
