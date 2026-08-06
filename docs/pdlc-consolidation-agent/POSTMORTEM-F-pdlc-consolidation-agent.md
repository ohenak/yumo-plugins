# POSTMORTEM — Phase F — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → **POSTMORTEM-F** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1..10}.md` (20 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (pm-author) | 2.0 | 2026-08-06 |

RESOLVED: no

> **Second halt.** Version 1.0 of this file recorded the rounds 1–5 halt and was resolved on
> 2026-08-06. That resolution is preserved in **§ Appendix A**, and its two countermeasures — the
> mechanism freeze and `docs/_decisions/DECISIONS-spec-layer-boundary.md` (`DEC-LAYER-01`) — were
> **in force for the whole of the window this body describes**. The body below is therefore not a
> repeat of the appendix; it is the result of the appendix's experiment.

## Phase

**Phase F — FSPEC authoring and cross-review convergence. Rounds 6–10, the second full
`MAX_REVIEW_ROUNDS = 5` window on this document.**

| | |
|---|---|
| Document | `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` |
| Version at HEAD | **11.0** (2026-08-06) — v10.0 was the version round 10 reviewed |
| Size at HEAD | 2,634 lines / 277,525 bytes (4.5× its upstream REQ: 637 lines / 61,109 bytes) |
| Branch | `feat-pdlc-consolidation-agent` |
| Window | rounds 6–10; first reviews 2026-08-06 14:54, last reviews 15:48 — **54 minutes** wall clock |
| Countermeasures in force | mechanism freeze (Appendix A, Recommendation step 2) and `DEC-LAYER-01` (`docs/_decisions/DECISIONS-spec-layer-boundary.md`), both landed in resolution commit `87a6cb7` **before** round 6 opened |
| Terminal state | round 10 reviewed FSPEC v10.0; both reviewers returned `VERDICT: Needs revision`; the round window was exhausted, so no round 11 could be opened |

As in the first window, the halt is **not** a stalled author. Every finding of every round was
closed as filed, and the round-10 findings were closed too — commits `ee742a3`…`04e172e`
(15:51–15:54) close SE F-01/F-02/F-03 and TE M-01/L-01/L-02 and bump the document to **v11.0**,
three minutes after the last review landed. What the loop ran out of was rounds in which a
reviewer could confirm that.

**What makes this window different from Appendix A's, and what makes it diagnostic:** the first
window's postmortem named a primary root cause (FSPEC settling decisions that belong a layer down)
and shipped two countermeasures for it. Both worked *on the thing they targeted* — the
mechanism-class Medium is gone, the document stopped acquiring tie-break algorithms and reader
indices, and `DEC-LAYER-01` is cited by name in the reviews as the reason a finding was scored Low
instead of Medium. The window still exhausted. That is a result, not a repetition: it localises the
remaining cause to something neither countermeasure touched.

## Iterations (5 — limit reached)

Findings counted from each review's `## Findings` table only (prior-finding disposition tables are
excluded — a row there is a closure, not a finding). Rounds are numbered continuously with the
first window, so this window's cross-review files carry the suffixes `-v6` … `-v10`.

| Round | FSPEC ver. | software-engineer | test-engineer | SE verdict | TE verdict |
|---|---|---|---|---|---|
| 6 | 6.1 | 0 High, 3 Medium, 2 Low | 0 High, 0 Medium, 3 Low | Needs revision | **Approved with minor changes** |
| 7 | 7.0 | 0 High, 0 Medium, 5 Low | 0 High, 1 Medium, 3 Low | **Approved with minor changes** | Needs revision |
| 8 | 8.0 | 0 High, 0 Medium, 2 Low | 0 High, 1 Medium, 2 Low | **Approved with minor changes** | Needs revision |
| 9 | 9.0 | 0 High, 1 Medium, 1 Low | 0 High, 1 Medium, 2 Low | Needs revision | Needs revision |
| 10 | 10.0 | 0 High, 1 Medium, 2 Low | 0 High, 1 Medium, 2 Low | Needs revision | Needs revision |

Three facts this table carries that the first window's did not:

1. **High has been absent for eight consecutive rounds** (last High: round 3). Neither reviewer
   filed one in this window, and both say so in terms — SE round 10: *"No High finding remains, and
   none has since v3."*
2. **Medium fell from a flat four-or-five per round to one or two, and in the last two rounds to
   exactly one per reviewer.** The freeze and `DEC-LAYER-01` did move the number. They did not move
   it to zero, and — see § Pattern of Disagreement — they did not move it *toward* zero after
   round 8.
3. **Three of the five rounds contained an approval.** Rounds 6, 7 and 8 each ended with exactly
   one reviewer approving and the other requiring revision, and the approving reviewer **alternated**
   (TE in 6, SE in 7 and 8). At no point in five rounds did both approve in the same round. This is
   new; in rounds 1–5 both reviewers returned Needs revision in every round.

### Prior-finding disposition, by round

| Round | Prior findings re-checked | Closed as filed | Argued / rejected / partially addressed |
|---|---|---|---|
| 6 | SE 6, TE 3 (+3 questions) | all | none |
| 7 | SE 5, TE 3 (+questions) | all | none |
| 8 | SE 5, TE 4 (+questions) | all | none |
| 9 | SE 2, TE 3 (+questions) | all | none |
| 10 | SE 2, TE 3 (+2 questions) | all | none |

Nine consecutive rounds — four in the first window, five in this one — in which **every** prior
finding was closed as filed and none was argued with. SE's round-10 recommendation states it:
*"the ninth consecutive round in which every prior item was addressed rather than argued with, and
the Medium was closed by the more expensive of the two directions I offered."*

### Open at the limit (round 10, against FSPEC v10.0)

| ID | Reviewer | Sev | Subject |
|---|---|---|---|
| F-01 | SE | Medium | §14.5's new two-register disjointness paragraph (`:2225-2231`) assigns §8.1's unavailable-`phase`/id arms to §14.1 T-10; T-10 (`:2160`) enumerates four spellings and none is an id, and §8.1's id arm emits nothing at all (`:1180-1182`) — so the paragraph's own universal, *"every deferral this document makes has exactly one home"*, is false on the arms it names |
| M-01 | TE | Medium | The same defect, found independently and argued from the testing side: T-10 sends a TSPEC author to invent a spelling for a row whose verdict this document already pins to `insufficient-evidence` (`:1182`, `:1835`), so taken literally the §8.7 streak never accumulates and `unmeasurable` is unreachable — a silent drift with no oracle |
| F-02 | SE | Low | §8.4 step 1's cell lacks its `failure-mode-id` arm (`:1179`), so the only statement of that case sits in a different reader's row under a rule the same round made normative (`:1155-1159`) |
| L-02 | TE | Low | Same defect: split §8.4 step 1's cell as §8.3's was split, and re-anchor LD-5 |
| F-03 | SE | Low | E-12b's field→reader parenthetical (`:2590`), widened this round, lists seven of eight fields — `action` is omitted while the same row's AT cell names the `action` arm |
| L-01 | TE | Low | Adjacent: LD-1's scope line does not name §8.4's `artifact` arm, and E-12b's arm enumeration does not match the three readers its own Given now names |

**One distinct Medium, found independently by both reviewers** (SE F-01 ≡ TE M-01), and two
distinct Lows likewise doubled (SE F-02 ≡ TE L-02; SE F-03 ≈ TE L-01). The open set at the limit is
**three defects**, all of them in text this round added, none of them touching a rule, an arm or an
observable — both recommendations say the repair is a handful of clauses inside two registers and
adds no BR, no AT and no fixture.

### What happened after the limit

| Commit | Time | Closes |
|---|---|---|
| `ee742a3` | 15:51 | SE F-01, TE M-01 — T-10 drops the `phase`/id arms and registers §8.4 steps 2–3's unavailable half instead |
| `c8ab0cc` | 15:52 | SE F-01 (second half) — §14.5's lead states the `phase`/id arms are LD-5's alone; the registers are disjoint on members |
| `7de603b` | 15:52 | SE F-02, TE L-02 — §8.4 step 1's cell gains its `failure-mode-id` arm |
| `3bf184e` | 15:53 | TE L-01 — LD-1 names §8.4's `artifact` arm; LD-5 anchors step 1 and totalises its defect column |
| `b759d7d` | 15:53 | SE F-03, TE L-01 — E-12b lists all eight fields and three `artifact` arms |
| `d8b7f2f` | 15:53 | BR-33a's arm enumeration matched to LD-1/LD-5 |
| `586a7d9` `46bd850` `04e172e` | 15:54 | version bump to **11.0**; back-pointer symmetry; the §8.4 steps 2–3 reader cited by section rather than by line number |

Every round-10 item was closed within **six minutes** of the last review landing. The tree at HEAD
is v11.0 and no reviewer has ever seen it.

## Reviewers

| Role | Skill | Rounds | Files |
|---|---|---|---|
| software-engineer | `pdlc:se-review` | 6–10 | `CROSS-REVIEW-software-engineer-FSPEC-v{6..10}.md` |
| test-engineer | `pdlc:te-review` | 6–10 | `CROSS-REVIEW-test-engineer-FSPEC-v{6..10}.md` |

Nothing in this window impeaches either reviewer's conduct. The record on both:

- **Delta scoping held, and tightened.** Every review names its baseline commit and its diff range
  and states that nothing unchanged was re-litigated (round 6: baseline `7ad57c9`, *"76 insertions,
  14 deletions across 6 FSPEC commits — only the changed sections were re-read for new issues"*;
  rounds 9 and 10 open with *"All findings below are in text added this round"*). No round re-opened
  a settled decision.
- **`DEC-LAYER-01` was applied deliberately and against the reviewers' own interest.** SE's round-7
  review is explicit that it is choosing to *lower* its own findings: *"three of the five Lows are
  classes `DEC-LAYER-01` assigns to TSPEC or PROPERTIES; per the decision's review consequence,
  a finding of one of those classes with a named downstream owner is Low, deferred and tracked, not
  a blocking Medium — I applied the bar deliberately rather than by default, and say so per
  finding."* TE's round-10 review applies the same rule to itself and then explains why its one
  Medium is *not* of that class. The freeze was likewise honoured: TE's round-10 repair is offered
  with *"adds no BR and no AT, touches no fixture, and is fully inside the freeze."*
- **Claims were verified against the repository, not asserted.** Round 10 alone re-derives the
  field-side set-equality over all eight fields, re-checks the eight-reader counts at `:1104`,
  `:1153-1157`, `:1191-1193`, re-verifies the `phase` arm's antecedent at `:1384` and `:1396-1399`,
  and re-checks every repo path the changed text names. The one line-number citation defect found
  in this window (round 8) was in the FSPEC's citation of *itself*, and was found by both reviewers.
- **The erratum channel stayed used, not bypassed.** The single upstream defect in scope — the
  `suppressed-by:` value grammar at `docs/_constraints/pdlc-consolidation-vocabularies.md:63` —
  remains routed as §14.4 ER-5 and was re-verified verbatim at HEAD in round 10. No reviewer edited
  an upstream document, and no new erratum was emitted in this window.
- **Approval was given when it was earned.** Three of five rounds contain an approval. This is the
  strongest evidence available that the bar is not being applied as a ratchet: the same two
  reviewers who exhausted the window were each willing, inside it, to sign the document off.

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation

## Appendix A — Prior window (rounds 1–5), resolved 2026-08-06

This is the record of the **first** Phase F halt, preserved verbatim (headings demoted one level).
It was resolved on 2026-08-06 by the Resolution section at the end of this appendix, which
declared the mechanism freeze and recorded `DEC-LAYER-01`. Rounds 6–10 — the window this
postmortem's body describes — ran **under** those two countermeasures.


### Phase

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

### Iterations (5 — limit reached)

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

#### Prior-finding disposition, by round

| Round | Prior findings re-checked | Closed as filed | Argued / rejected / partially addressed |
|---|---|---|---|
| 2 | SE 12, TE 16 | all | none |
| 3 | SE 8, TE 6 | all | none |
| 4 | SE 6, TE 5 | all | none |
| 5 | SE 4, TE 1 (+3 questions answered) | all | none |

Four consecutive rounds in which **every** prior finding was closed as filed and none was argued
with. SE's round-5 recommendation states it outright: *"the fourth consecutive round in which every
prior finding was addressed rather than argued with."*

#### Open at the limit (round 5, against FSPEC v5.0)

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

#### What happened after the limit

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

### Reviewers

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

### Pattern of Disagreement

**There is no disagreement between the reviewers, and none between the reviewers and the author.**
That is the finding. Five distinct patterns describe the window.

#### 1. The reviewers converge; they do not split

Round 5's two reviews overlap on two of their three Medium/Low pairs — SE F-03 ≡ TE M-01 (the
reader-side rule with no falsifier) and SE F-04 ≡ TE L-01 (the `:3585` citation) — each filed
independently, with independently-derived evidence. Round 3 shows the same convergence one level
in: SE F-04 and TE H-04 are the same AT-Q7 pooled-set defect. Where they differ it is by *lens*,
not by verdict: SE files contract totality (an undetermined `target`), TE files fixture coverage
(an enumeration sampled at one member). Neither ever contradicted the other's severity, and no
finding in five rounds was rebutted by the sibling reviewer.

#### 2. The author never argued a finding

Four consecutive rounds at 100 % closed-as-filed (table above). There is no rejected finding, no
"won't fix", no deferred-with-reason row anywhere in the window. The failure mode this loop is
designed to catch — an author and a reviewer deadlocked over a judgement call — did not occur.

#### 3. The disagreement is with the *loop*, not with a person: repairs generate defects at a roughly constant rate

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

#### 4. Findings migrate one axis over rather than recurring

The same defect *shape* reappears displaced by one level, which is why it never reads as a repeat
and never triggers a "we have been here" response:

| Thread | v1 | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| §6.5 / AT-Q7 seam oracle | F-10: absence-only oracle | F-02: set-equality on the wrong domain | F-04 / H-04: sets pooled across trees | F-01: per-tree sets narrower than the obligations | F-05/F-06: residual absolute + widened Given |
| §8 merge rule | — | — | — | F-03: `target` undetermined across §5.2 *kinds* | F-01: `target` undetermined across *subjects*; M-02: order fixtured at one pair |
| receive-side rules | F-08: "consumed window" undefined | F-04: carrier reads a field the record lacks | H-02: `passId` outside the field grammar | H-06: open-list computation untested | F-03/M-01: short-record rule untested |

TE named the mechanism in round 3, H-04: *"the failure mode G-01 raised, one level in."*

#### 5. Every round's repair enlarges the document

The FSPEC ended the window at 2,513 lines / 247,750 bytes — 4.1× its REQ — and each round's
convergence work adds normative surface (round 5 alone: a precedence table, a tie-break, a
reader-side rule, BR-33a/b/c, AT-F19/F20, O-C8, §10.4 items 4 and 10, ER-5). Each new rule obliges
matching edits at four to six coupled sites (a BR row, an AT row, an `E-` row, a §15 traceability
row, a report-body item, a §14.2 cost entry). A site missed is a legitimate Medium. The document's
own coupling is what sets the manufacture rate in pattern 3.

### Best-Guess Root Cause

**The loop is a fixed point, not a convergent series, because the FSPEC is still acquiring
normative mechanism at the layer below the one it owns — and each acquisition manufactures roughly
as many Mediums as the round's repairs retire.** Four contributing causes, in decreasing
confidence.

#### RC-1 (primary) — implementable-layer decisions are being settled at FSPEC layer

The four distinct open Mediums are, in order: a *tie-break algorithm* over canonical paths
(lexicographic, input-pure); a *fixture construction* (AT-R6b's Given); a *per-field reader index*
and its parse-notice contract; and a *fixture-set completeness argument* over a three-member order.
Every one of these is a decision a TSPEC author or a PROPERTIES author is equipped to make, and
three of the four are test-artefact decisions. The FSPEC settled them because each round's reviewer
correctly observed that a rule stated at FSPEC layer without its pinning artefact is unfalsifiable
— so the document answered at FSPEC layer, and every answer is a new checkable claim in a document
whose claims are checked by two reviewers per round.

The size ratio is the symptom: 247,750 bytes of FSPEC against 61,109 bytes of REQ, for one
workflow pass. Nothing about the *feature* is 4× its requirements; the excess is layer absorption.

#### RC-2 — the coupling factor makes every repair a multi-site edit

§5.2's three promotion kinds × §8.1's eight-field record × §6.5's four seam domains × §13's AT
table × §18.7's BR table × §19's error rows × §15's traceability form a lattice. A rule added at
one node obliges edits at four to six others, and the reviewers — correctly, and per the
completeness-by-set-equality clause they are dispatched with — check every one. A 90 %-accurate
multi-site edit yields a Medium per round essentially by arithmetic. This is why the Medium count
is flat rather than decaying: it is a function of edit volume, not of remaining defect stock.

#### RC-3 — five rounds is calibrated for a document that has stopped growing

`MAX_REVIEW_ROUNDS = 5` assumes the review population is a fixed defect stock being drained. That
assumption held for the High population (12 → 6 → 2 → 0, fully drained by round 4) and fails for
the Medium population, which is regenerated each round. The window was consumed in 1 h 46 m of wall
clock with author turnarounds of ~10 minutes; the loop was not slow, it was *productive in a
direction the round counter does not measure*. Raising the constant would not fix this — it would
buy rounds at the same manufacture rate. Only RC-1 changes the rate.

#### RC-4 — feature-level recurrence, not phase-level bad luck

Phase R on this same feature exhausted two full windows (rounds 1–5 and 6–10) before the REQ was
approved, and the Phase R resolution's own diagnosis was adjacent: governance rules stated without
the version-pin/defect clause that makes them checkable. The same feature has now spent 20 REQ
reviews and 10 FSPEC reviews. The common factor is a specification whose subject matter is *itself*
a specification-governance mechanism — the document and its reviewers are reasoning over the same
kind of object, so every rule the document states is immediately available as a rule the reviewers
can check it against. That reflexivity is real and is not going away by rewriting prose.

#### Ruled out

| Hypothesis | Why not |
|---|---|
| Author non-responsiveness / stalling | 100 % of prior findings closed as filed in four consecutive rounds; the round-5 findings were closed within 7 minutes of the last review landing |
| Reviewer severity inflation | Both reviewers retired High entirely by round 4 and TE filed exactly one finding in round 4; every open Medium names a specific undetermined value or an untested normative sentence |
| Reviewer disagreement / deadlock | Zero contradicted findings across five rounds; two of round 5's findings are the *same* defect found independently |
| Ambiguous or contested REQ scope | No round re-opened scope, structure, or a settled decision — both reviewers state this explicitly in rounds 4 and 5 |
| Watchdog / pacing failure | No no-progress halt occurred; every round produced committed, versioned revisions |

### Recommendation

Ordered. Steps 1–3 are the resolution; step 4 is re-entry; steps 5–7 are scope notes.

#### 1. Verify the v6.0 tree against the nine open round-5 findings — against the tree, not the commit messages

`561dd89`…`657b59a` claim closure of SE F-01…F-06, TE M-01/M-02/L-01 and all six questions. Verify
each **per finding, against the file at HEAD**, in the shape the Phase R resolution used (its
step 1). Specifically:

- SE F-01 — §8.2 states a tie-break that is a pure function of the inputs (lexicographic over the
  canonical path, **not** proposal order), and §8.1's `artifact` follows it.
- SE F-02 / TE M-02 — AT-R6b's fixtures are buildable as written (no self-contradicting Given, the
  row's lead sentence describes the fixtures it now contains) and range over **all three** ordered
  pairs of the precedence order, with the rank-2/rank-3 pair asserting `route: decisions`, no
  guard-set write and no PR.
- SE F-03 / TE M-01 — AT-F21 constructs a `.consolidation-log.md` record short of an indexed field
  and asserts, on one path, the **positive** half (terminal status reached, notice names the
  record, promotion re-proposed / id present in AT-F19's open list) beside the negative
  ("never a halt", bytes unchanged); E-12b exists beside E-12; BR-33a points at AT-F21 and no
  longer at AT-F16/AT-F20.
- SE F-04 / TE L-01 — §6.5 cites `orchestrate-dev.js:3524` (the seam call) and/or `:3580` (the call
  site), not `:3585`. Re-verify at HEAD; do not trust this postmortem's line numbers either.
- SE F-05, F-06 — §6.5's equality absolute is qualified against AT-Q7c's `∅` assertions, and the
  fifth column's "i.e." no longer widens its Given past §5.4's stages-nothing path.

Record the verification per finding in a `## Resolution` section appended to this file. Any finding
that does not verify is remediated before re-entry, not deferred into the confirming round.

#### 2. Freeze the mechanism for the confirming round

Declare, in the resolution commit, a **structural freeze**: the confirming round may add no new
normative rule, no new BR, no new AT beyond the pinning artefacts of rules already stated. This is
the direct countermeasure to pattern 3 — it removes the manufacture surface for one round so the
loop can observe its own fixed point. Reviewers should be told the freeze is in force, so a finding
that proposes *new* mechanism is filed as Low/deferred rather than as a blocking Medium.

#### 3. Record the layer boundary as a project-level decision (this is the step that changes the rate)

Write `docs/_decisions/DECISIONS-spec-layer-boundary.md` fixing which classes of decision are
FSPEC-owned and which are TSPEC/PROPERTIES-owned. On the evidence of this window, at minimum:
tie-break and ordering **algorithms**, per-field reader indices, seam verb permitted-sets, and
**fixture construction / oracle strength** belong below FSPEC. An FSPEC states the observable and
names the artefact that will pin it; it does not carry the artefact. Without this step, RC-1
persists into Phase T and the same arithmetic reappears one document down — and the FSPEC's 4.1×
size ratio persists into everything derived from it.

This is a genuine judgement call with a real cost: moving these decisions down means the FSPEC's
reviewers lose falsifiers they currently have, and TSPEC inherits four open decisions. It is
recommended anyway, because the alternative — settling them at FSPEC layer — is exactly what
consumed this window.

#### 4. Re-entry

Once steps 1–3 are done and every finding in this document's Recommendation is verifiably
addressed on the branch:

1. Append the `## Resolution` section naming what addressed each finding.
2. Flip the marker to `RESOLVED: yes` in the same commit, and name the evidence in the commit
   message. **The workflow never writes `yes`; an operator or agent does, after verifying.**
3. Re-invoke with the phase forced:
   `/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md", "forcePhases": "F"}`

Re-entry opens rounds 6–10 (`deriveRoundWindow` derives them from the `-v5` basenames present, so
the append-only review history is preserved). The expectation under the freeze is **one short delta
round confirming the closures**, as Phase R's second resolution expected and got.

#### 5. Not recommended

| Option | Why not |
|---|---|
| Rewrite or restructure the FSPEC | Nothing in five rounds found a structural defect; every open finding is local and named. A rewrite discards five rounds of verified convergence and re-opens the High population |
| Lower the approval bar / force past the reviews | Both reviewers apply the bar consistently and their Mediums are real undetermined values — an undetermined `target` on the common kind (§5.2's own worked collapse: three of fifteen skill directories share one decision file) ships as an unstated tie-break |
| Re-open REQ scope or split the feature | The REQ cost two full windows to approve. Splitting now forfeits that and re-enters Phase R |
| Raise `MAX_REVIEW_ROUNDS` | Buys rounds at an unchanged manufacture rate (RC-3). Step 3 changes the rate; the constant does not |

#### 6. Housekeeping (not blocking)

- SE Q-02's open question — which contract owns a short record for §8.3's effectiveness rows — is
  answered by `df3feef`'s per-field reader table; confirm the table names §8.3.
- TE Q-02's read-set question (closed two-member enumeration vs. open "any non-mutating read") is
  claimed closed by `561dd89` as the closed set; confirm a test author reading §6.5 alone reaches
  the same reading.

#### 7. Phase H

Harvest must fold **both** halted phases into `LEARNINGS-pdlc-consolidation-agent.md`: 20 REQ
cross-reviews, 10 FSPEC cross-reviews, and both post-mortems. The durable signal is § Pattern of
Disagreement 3 and RC-1 — *on an accreting specification, repairs manufacture defects at a roughly
constant rate, so High drains and Medium does not; a fixed round window then expires on a document
that is converging in severity but not in count.* That is a candidate for promotion to
`docs/_constraints/DOMAIN-CONSTRAINTS.md` at the next `consolidate-learnings` pass, together with
the layer boundary from step 3.

### Resolution (2026-08-06)

The Recommendation was carried out in full by the outer orchestrator.

**Step 1 — per-finding verification (Opus agent, FSPEC v6.0 at HEAD, judged against file text,
not commit messages).** All nine round-5 findings and all six questions verified CLOSED:

| Finding | Verified closed by |
|---|---|
| SE F-01 (subject tie-break) | §8.2 `:1256-1268` — lexicographic byte order over normalised root-relative paths, input-pure, proposal order explicitly refused; `target` follows `artifact` on kind 3; BR-33b/BR-35a/O-C8 carry it |
| SE F-02 / TE M-02 (AT-R6b) | AT-R6b `:1971` — five named fixtures, no self-contradicting Given, all three ordered pairs (1,3)/(2,3)/(1,2) fixtured, rank-2/rank-3 pair asserts `route: decisions`, no guard-set write, no PR |
| SE F-03 / TE M-01 (reader-side rule) | AT-F21 `:2028` — two short records + one well-formed, positive and negative halves asserted on one path; E-12b beside E-12; BR-33a cites AT-F20/AT-F21 |
| SE F-04 / TE L-01 (citation) | §6.5 `:925-928` cites `:3520`/`:3524`/`:3580`; `:3585` gone; all re-verified at HEAD |
| SE F-05 / F-06 (§6.5 absolutes) | `:954-958` equality absolute qualified against AT-Q7c's `∅`; `:917` Given un-widened |
| SE Q-01..Q-03, TE Q-01..Q-03 | AT-F19 literal count `3`; per-field reader table names §8.3 and §8.5; `symptom` one-line obligation with report-body compensation; §6.5 closed two-member read set; ER-5 on-landing delta spelled |

Three residual wording risks the verifier flagged (none a round-5 finding) were fixed in the
resolution commit as FSPEC v6.1: §8.2 `:1280` no longer overstates the fixture's `target`
assertion; §6.5's `:917` cell says "the two non-mutating reads" instead of the open class; `:1166`
cites AT-R6b's third, fourth **and fifth** fixtures.

**Step 2 — structural freeze, declared and in force for the confirming round.** Rounds 6–10 may
add **no new normative rule, no new BR, and no new AT** beyond pinning artefacts of rules already
stated in v6.1. A finding that proposes new mechanism is filed as Low/deferred per
`docs/_decisions/DECISIONS-spec-layer-boundary.md` (DEC-LAYER-01), not as a blocking Medium.

**Step 3 — layer boundary recorded.** `docs/_decisions/DECISIONS-spec-layer-boundary.md`
DEC-LAYER-01: tie-break/ordering algorithms, per-field reader indices, seam verb permitted-sets,
and fixture construction/oracle strength are TSPEC/PROPERTIES-owned; an FSPEC states the
observable and names the pinning artefact's owner. Companion to DEC-SEV-01.

**Step 4 — re-entry.** Queue row 15 back to `pending`; re-entry opens rounds 6–10 from the
on-disk `-v5` basenames. Expectation: one short delta round confirming the closures above.
