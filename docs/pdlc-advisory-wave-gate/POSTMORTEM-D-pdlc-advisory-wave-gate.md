# POSTMORTEM — Phase D (review cap) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1…v8.md` |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

**Date:** 2026-08-19
**Halt class:** `REVIEW-CAP` (`MAX_REVIEW_ROUNDS = 5`, per-invocation)
**Halt text:** Phase D exhausted this invocation's five-round review window (rounds 4–8) without a
both-lens approving round on `DECISIONS-pdlc-advisory-wave-gate.md`.
**Document at halt:** `DECISIONS-pdlc-advisory-wave-gate.md` v1.7 (`bbe65771`)

RESOLVED: no

---

## 1. Phase

Phase D authored and revised `DECISIONS-pdlc-advisory-wave-gate.md`, the record of the four
load-bearing choices inside TSPEC v1.10's A6 design: how the pre-repair tree is captured
(`DEC-A6-01`, dangling snapshot commit, never stashed), how an E-6 promotion reaches git history
(`DEC-A6-02`, its own `commitPaths` call), what the snapshot ref is named (`DEC-A6-03`, wave-scoped,
no run discriminator), and whether `waveBudgetPerRun: 0` is a configuration error (`DEC-A6-04`, a
supported affordance validated by a new `nonNegativeInt`).

**The four decisions are not what halted.** They were approved on substance early and stayed
byte-identical from round 5 onward; both lenses stopped re-litigating them and said so in scope
notes ("the four decisions … are byte-identical to the round I approved on substance and are not
re-litigated", PM v8). Every round from 4 to 8 turned on one sub-section of the `Consequences`
half — the DEC-A6-04 "sizing" bullet block that enumerates how many places in the tree carry the
pre-A6 five-member seam literal and the four-member envelope literal, split into three columns:
(1) gate-demanded edits, (2) oracles that flip red→green with no edit, (3) ungated hand-copy and
prose surfaces.

That block is a **measurement of the repository**, not a decision. It exists to stop PLAN sizing A6
as "one task touching three constants". Its numbers are only true against a HEAD that the feature's
own early-landed test-side commit (`e3b9d5a3`) had already moved, and every round both re-measured
one column and left another stale — so every round closed a High and opened a new one in the same
paragraph.

Phase D's window this invocation opened at round 4 (rounds 1–3 ran on 2026-08-18; round 2 earned an
approval anchor at `8ac724c0`, and round 3 re-opened the document as an upstream-cascade
confirmation against TSPEC v1.6). Rounds 4–8 all ran inside 42 minutes on 2026-08-19
(20:49 → 21:31). Round 8 returned PM **Needs revision** / TE **Approved with minor changes**; the
author addressed every round-8 finding in v1.7 (`17bf0e92`, `9e81ad0d`, `31d9105b`, `bbe65771`),
but the per-invocation budget was spent before round 9 could confirm it. The document at halt is
therefore **fully responsive to the last review round and unconfirmed**, which is a materially
different position from the Phase T halt recorded in `POSTMORTEM-T-pdlc-advisory-wave-gate.md`.

## 2. Iterations (5 — limit reached)

Eight rounds exist on disk; five of them (4–8) are this invocation's window and are what the cap
counted. `MAX_REVIEW_ROUNDS = 5` is per-invocation; `MAX_LIFETIME_ROUNDS = 15` is not yet reached,
so re-invocation is permitted and is the recommendation in §6.

| Round | Doc rev | PM verdict | PM findings | TE verdict | TE findings | Window |
|---|---|---|---|---|---|---|
| 1 | v1.0 | Approved w/ minor | 7 (0H / 3M / 4L) | Needs revision | 7 (3H / 3M / 1L) | prior |
| 2 | v1.1 | Approved w/ minor | 2 (0H / 1M / 1L) | Approved w/ minor | 3 (0H / 2M / 1L) | prior (anchored `8ac724c0`) |
| 3 | v1.1 (bytes unchanged) | Approved w/ minor | 5 (0H / 4M / 1L) | Needs revision | 5 (2H / 2M / 1L) | prior (upstream cascade) |
| 4 | v1.2 | **Needs revision** | 7 (1H / 2M / 4L) | Approved w/ minor | 2 (0H / 1M / 1L) | **1 of 5** |
| 5 | v1.3 | **Needs revision** | 3 (1H / 0M / 2L) | Approved w/ minor | 2 (0H / 1M / 1L) | **2 of 5** |
| 6 | v1.4 | **Needs revision** | 2 (1H / 0M / 1L) | Approved w/ minor | 2 (0H / 2M / 0L) | **3 of 5** |
| 7 | v1.5 | **Needs revision** | 5 (1H / 2M / 2L) | **Needs revision** | 3 (1H / 2M / 0L) | **4 of 5** |
| 8 | v1.6 | **Needs revision** | 5 (1H / 1M / 3L) | Approved w/ minor | 2 (0H / 1M / 1L) | **5 of 5 — cap** |

Three features of this trajectory matter more than the totals:

- **The finding volume converged; the verdict did not.** Total findings per round fall
  14 → 5 → 10 → 9 → 5 → 4 → 8 → 7, and the High count is pinned at exactly **one per round from
  round 4 to round 8** — always PM's, always `F-01`, always in the same bullet block. A stream of
  single Highs of shrinking scope is the signature the lifetime cap was written for (`DEC-ROUNDS-02`);
  the per-invocation cap caught it first.
- **Every round's High was a genuine, verified defect — and a new one.** Not one of the five was a
  re-raise. PM v4 F-01: the DEC-A6-04 bullet still assigned the engine expectation to
  `ci-arrangement.test.js` and contradicted itself four sentences later. PM v5 F-01: the seam
  enumeration was not re-derived and five of its six sites had already migrated. PM v6 F-01: the
  round's two new "oracle" claims were false at HEAD (`advisoryConfig`'s `PROP-CFG-02` deep-equal
  *is* an envelope oracle and *is* red). PM v7 F-01: column (2) was presented as a closed set of two
  and was ten. PM v8 F-01: the new parenthetical reconciling "seven sites" with column (2)'s ten
  asserted a subset relation the integers refute. Each was resolved in the next revision, verified
  resolved by the reviewer who raised it, and replaced.
- **The reviewers' verification got stronger as the rounds went on, which is why the loop did not
  self-terminate.** Round 7's repair moved from *reading* the suites to *running* them, and both
  lenses independently reproduced the same figure at HEAD — `npm test -- __tests__/advisory`,
  24 failed / 386 passed / 410 total across 15 suites — and each partitioned all 24 failures against
  the document's two populations with none left over and none double-counted. That is the strongest
  evidence any round in this phase produced, and it is also what surfaced
  `advisoryHarvest.test.js`'s `T-08-8`, a member four rounds of reading had missed. Better
  measurement kept finding real residue, so the document kept being right-shaped and non-approving.

## 3. Reviewers

| Role | Rounds | Round-8 verdict | Residual at halt (all addressed in v1.7, none confirmed) |
|---|---|---|---|
| product-manager | 1–8 | Needs revision | F-01 (High), F-02 (Medium), F-03/F-04 (Low), F-05 (Low, Process), Q-01, Q-02 |
| test-engineer | 1–8 | Approved w/ minor | F-01 (Medium), F-02 (Low) |

Both lenses stayed in lane for all eight rounds, and both spent their round-8 opening on disposition
of the prior round rather than on new ground.

- **PM** reviewed as a requirement-fidelity-and-implementer-cost lens. Its consistent question was
  not "is this decision right" but "what will an implementer budget after reading this sentence" —
  which is why every one of its Highs landed on a count rather than on a decision. Its round-8
  method is worth recording verbatim as the standard: re-run the advisory suites at HEAD, attribute
  all 24 failures to the document's two named populations, read every newly enumerated prose site
  *in context*, and re-run the record's own published re-derivation recipe over the whole surface
  that recipe names.
- **TE** reviewed as an oracle-and-falsifiability lens: for each claim, is there a run that could
  refute it, and does the claim survive that run. It routed one missing behaviour arm upstream in
  round 1 (the `waveBudgetPerRun: 0` fixture, which landed in TSPEC §5.2 and is verified landed in
  the document at HEAD), and by round 8 it was checking the record's arithmetic as arithmetic
  (14 + 10 = 24) and its positional anchors as positions.

Two reviewer behaviours held the phase together rather than stretching it:

1. **Neither lens re-litigated settled material.** Explicit scope statements pin this in rounds 2,
   3, 4, 5 and 8 ("unchanged sections already reviewed in v1 are not re-litigated"; "no
   re-litigation of settled decisions"). The eight rounds are not eight reviews of one document;
   they are one review of the decisions plus five reviews of one measurement block.
2. **Both lenses retracted their own prior findings when HEAD refuted them.** TE v6 F-01 retracts
   the second half of TE v5 F-02 — the claim v1.4 had faithfully transcribed. A reviewer who
   corrects the author's transcription of the reviewer's own error is doing the expensive, correct
   thing, and it is also a hidden cost driver: two of the five rounds in this window were spent
   converging on a fact that a reviewer had earlier stated wrongly.

One process finding belongs outside this feature: **PM F-05, now in its fourth consecutive round**
(v4 F-03 → v5 F-01 → v6 F-01 → v7 F-01 → v8 F-01/F-02). PM states the generalisable rule better
than a harvest note would: *when a round re-measures one population, it must re-measure every
population its edit puts in the same sentence* — a reconciliation clause between two counts is a
claim about both, and inherits the staleness of whichever one was not re-run.

## 4. Pattern of Disagreement

**There is almost no author-versus-reviewer disagreement, and exactly one reviewer-versus-reviewer
disagreement — on an integer.** Round 8 asked for column (3) to be raised, and the two lenses named
different targets from the same recipe:

| Lens | Round-8 claim about column (3) | Members named |
|---|---|---|
| TE v8 F-01 (Medium) | "twenty, should read **twenty-two**" | `advisoryDriver.test.js`'s two generated `it` titles (`:238`, `:280`) |
| PM v8 F-02 (Medium) | "twenty, **at least twenty-five**" | the same two, **plus** three production-side prose sites in `orchestrate-dev.js` (`:2978`, `:13688`, `:15036`) |

The disagreement is not a contradiction: PM's set is a strict superset, and the difference is
scope-of-sweep — TE ran the recipe over the advisory *suites*, PM ran it over the suites **and**
`orchestrate-dev.js`, which is the surface the recipe's own text names. v1.7 adopted the superset
(seventeen seam sites + eight envelope sites = twenty-five) and cited both findings, which is the
correct resolution of a superset/subset split. It is recorded here only because it is the sole point
in eight rounds where the two lenses would have signed different numbers.

The more consequential split is one of **judgement about the same defect**:

| | PM v8 | TE v8 |
|---|---|---|
| The "seven versus ten" reconciliation | **F-01, High, blocking** — "ten cannot be a subset of seven" | listed under *"Everything else I verified clean at HEAD"* |
| Verdict | Needs revision | Approved with minor changes |

TE read the reconciliation clause as prose linking two independently-correct counts and checked the
counts; PM read it as a claim about a set relation and checked the relation. PM is right on the
merits — the parenthetical asserts a subset relation that ten-in-seven refutes, and the five sites
the "seven" omitted are exactly the ones an implementer would wrongly budget an edit for — and v1.7
resolves it PM's way, restating the true relation (column (2) *is* the oracle part of the bullet;
the residue is two green inputs) and re-deriving the population to twelve. But the split is the
reason the phase hit the cap rather than converging: **a single lens's single Medium-adjacent
reading of one clause was the difference between "approved with minor" and a sixth round.**

Three structural observations about where the disagreement lived:

1. **All five window Highs are in the same ~40-line bullet block, and none is in a `## Decision`
   section.** The part of the document that is a decision record converged in three rounds. The part
   that is a repository measurement never converged, because its truth conditions change under a
   moving tree — and the tree was moving for a reason this feature created (`e3b9d5a3` landed
   test-side transcriptions ahead of Phase I, so the advisory suites are red at HEAD by design).
2. **The block's failure mode is always the seam between two counts, never a count in isolation.**
   v4/v5: envelope re-derived, seam stale. v6: oracle-versus-input taxonomy. v7: column (2)'s
   cardinality. v8: the clause reconciling column (2) with the "already-migrated" bullet. PM's Q-01
   names the remedy the findings imply — *a seam that keeps failing is worth removing rather than
   re-welding*, i.e. fold the two counts into one enumeration read two ways.
3. **The author never pushed back and never under-delivered.** Every round's response is a set of
   small, individually-cited commits that both lenses verified as landing, several of which went
   past what was asked (the `PROP-CFG` id-collision note, the `A-17` retraction with its inverted
   operative advice, the `dist/` instruction, the published re-derivation recipe). There is no
   disagreement to adjudicate here — which is precisely why the loop could not terminate itself: no
   party was wrong, so no party's correction ended the round.

## 5. Best-Guess Root Cause

**Proximate cause: a DECISIONS document took on a repository measurement as a first-class section,
and a measurement of a moving tree cannot converge inside a review loop that re-measures it one
column at a time.**

The `Consequences` sizing block answers a real and well-motivated question — how big is A6's
transcription surface, so PLAN does not size it as "one task, three constants". Both lenses agree the
question is worth answering and the answer has repeatedly improved. But the block's content is
**24 test failures, twelve already-migrated sites, twenty-five hand-copy surfaces, and a set of
excluded false positives**, all of which are facts about HEAD rather than facts about a decision.
Three properties of that content make it structurally incompatible with a five-round cap:

- **Its truth conditions move.** `e3b9d5a3` landed test-side transcriptions ahead of Phase I, so the
  advisory suites are red at HEAD by design and the counts change with each such commit.
- **It has no oracle.** A decision can be checked against its alternatives; an enumeration can only
  be checked by re-running the enumeration, and each reviewer re-runs it slightly better than the
  last. Rounds 7 and 8 escalated from grep to running the suites to running the recipe over
  production code — three different sweeps, three different totals, each correct for its surface.
- **It is explicitly de-weighted by the document itself** ("the number an implementer must not get
  wrong is column (1)'s four, and it is small") while nonetheless carrying every High in the window.
  The block that the record says matters least is the block that consumed five rounds.

**Contributing cause: the repair pattern was "fix the challenged half", and a reconciliation clause
makes that impossible.** PM's F-05 names this exactly, and the mechanism is worth stating: when a
round re-derives column (2) and then writes a sentence relating column (2) to a *neighbouring*
count, the new sentence is a claim about both counts — so it inherits the staleness of the one that
was not re-run, and it converts a stale number into a stale *relation*, which is a strictly worse
defect because it reads as reconciled. v1.6 is the clearest instance: it re-derived column (2)
beautifully by running the suite, and the very act of reconciling it against the carried-forward
"seven" produced round 8's blocking High. Four consecutive rounds show the same shape.

**Contributing cause: reviewer verification improved faster than the document could absorb it.**
This is not a criticism of either lens — it is the honest cost account. Rounds 1–6 were reviewed by
reading; round 7 introduced running the suites; round 8 introduced running the document's own
published recipe over the whole surface it names. Each escalation found true residue that the
previous method could not have found (`T-08-8` is the crisp example: four rounds of reading missed
it; one run found it). A loop where the measurement instrument sharpens every round will keep
producing findings for as long as the loop runs, independent of author quality.

**Contributing cause (smaller): one reviewer error was faithfully transcribed and had to be
unwound.** TE v5 F-02's second half was wrong, v1.4 transcribed it, and TE v6 F-01 retracted it. Two
of the five window rounds were partly spent on that cycle. This is the healthy version of the
failure — the lens that erred caught it — but it costs a round.

**Not the cause:**

- *Not the decisions.* `DEC-A6-01…04` were approved on substance and byte-frozen from round 5. No
  round-4-to-8 High touches a decision, an alternative, a reversibility rating or a re-evaluation
  trigger.
- *Not author non-responsiveness.* Every round produced cited commits; every reviewer verified them
  as landing; several exceeded the ask. v1.7 addresses **all** round-8 findings, PM F-01 through
  F-04 and TE F-01 through F-02, plus PM Q-02's early-green drift signal.
- *Not reviewer disagreement.* One superset/subset integer split (§4), resolved by taking the
  superset. No lens contradicted the other on substance in eight rounds.
- *Not severity inflation.* Every window High is a verified, falsifiable defect; this postmortem
  re-checked the round-8 pair independently (`grep -c "A-17"` on PLAN is `0`; the four bare
  `toHaveLength(6)` sites read `6`; seventeen + eight = twenty-five as v1.7 states).
- *Not the cap being mis-set.* Five rounds is the right budget for a decision record. The document
  simply contains a section that is not a decision record.

## 6. Recommendation

**Re-invoke Phase D for one confirmation round. Do not re-author, do not re-open the decisions, and
before that round, move the sizing block out of DECISIONS.**

The halt is a budget expiry, not a defect: v1.7 already answers every round-8 finding from both
lenses. `MAX_LIFETIME_ROUNDS = 15` leaves seven rounds of headroom, and the expected cost of
confirmation is one round. But re-invoking with the sizing block still in place re-opens the same
seam that produced five consecutive Highs, so the ordered steps are:

1. **Relocate the sizing block to PLAN (or to a `SIZING-` appendix PLAN cites), leaving DECISIONS
   with a pointer and column (1)'s four.** This is the highest-value step and it is the one PM Q-01
   and the document's own "the number an implementer must not get wrong is column (1)'s four" both
   argue for. The block's consumer is PLAN's batch sizing; its content is a measurement of HEAD with
   a short shelf life; and DECISIONS is the one artifact in the set that is supposed to be stable
   after approval. Keep the published re-derivation recipe with it — the recipe is the durable
   artifact, the totals are not. If relocation is judged out of scope at this stage, apply step 2
   instead and accept that the block will need re-measuring at Phase I.
2. **If the block stays, collapse the failing seam rather than re-welding it (PM Q-01).** Fold the
   "twelve already-migrated sites" bullet into column (2) as one enumeration read two ways — twelve
   sites at the post-A6 value, of which the ten oracles are red today and the two inputs are green —
   and delete the reconciliation clause entirely. A reconciliation clause between two counts is the
   defect generator identified in §5; removing it removes the class.
3. **Adopt the one-sentence rule as a standing authoring check.** Before committing an edit to any
   enumeration: *if this sentence names two counts, re-run both.* This is PM F-05's rule and it is
   mechanically checkable by the author at write time, which the "re-derive" guidance it replaces
   was not.
4. **Run round 9 as a pure delta confirmation with scope stated in the dispatch.** Both lenses have
   pre-committed to what they want: PM's F-01 wants twelve and the true relation (landed,
   `17bf0e92`), F-02 wants twenty-five (landed, `31d9105b`), F-03 wants PLAN cited by task row
   (landed, `9e81ad0d`), F-04 wants `S-5` beside the `advisoryQueueSeams` quote (landed); TE's F-01
   wants the two `advisoryDriver` `it` titles (landed inside the twenty-five) and F-02 wants the
   "four lines above it" offset dropped (landed — dropped, not corrected, per `DEC-DOC-01`). Scope
   the round to those six items plus the step-1/step-2 relocation, and state that
   `DEC-A6-01…04` are byte-frozen and out of scope.
5. **Then flip `RESOLVED: no` → `RESOLVED: yes` in this file and re-invoke `orchestrate-dev`.**
6. **If round 9 returns a sixth consecutive single-High on the sizing block, do not author a tenth
   revision.** Delete the block from DECISIONS by fiat, record that deletion as a fifth decision
   entry (`DEC-A6-05`: sizing evidence lives with the plan that consumes it, not with the record
   that motivates it), and move to Phase P. Five rounds of correct-but-superseded integers is the
   measured cost of keeping it; that is now evidence, not speculation.

Carry forward to LEARNINGS (Phase H):

- **A DECISIONS document should not carry a measurement of the working tree.** Decisions are stable
  after approval; measurements of a moving HEAD are not, and a review loop cannot converge on one.
  Route repository sizing to the artifact that consumes it (PLAN) and keep the *recipe* rather than
  the *total* in the durable record.
- **When a round re-measures one population, it must re-measure every population its edit puts in
  the same sentence** (PM F-05, fourth consecutive recurrence — a promotion candidate). A
  reconciliation clause between two counts is a claim about both, and a stale relation reads as
  reconciled, which is worse than a stale number that reads as stale.
- **A seam between two counts that fails in three or more consecutive rounds should be removed, not
  re-welded** (PM Q-01). Fold the counts into one enumeration read two ways.
- **A converging finding volume with a pinned single High per round is the cap's real trigger
  signal.** Rounds 4–8 each closed one High and opened exactly one new one in the same paragraph.
  Detecting "same section, N consecutive rounds, one High each" is cheaper than the rounds it would
  save, and this is now the second phase in this feature to exhibit it.
- **A run beats a reading, and the escalation should happen in round 1.** `T-08-8` survived four
  rounds of careful reading by both lenses and fell to the first `npm test`. Where a claim is a
  count of test sites, the authoring dispatch should run the suite before the first review, not in
  response to the fourth finding.
- **Landing test-side transcriptions ahead of the phase that plans them (`e3b9d5a3`) makes every
  downstream count a measurement of a red tree.** The convenience is local; the cost lands on every
  artifact that has to describe HEAD until Phase I closes it.

---

**Provenance**

- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
