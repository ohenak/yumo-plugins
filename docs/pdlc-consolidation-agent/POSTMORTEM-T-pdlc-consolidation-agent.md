# POSTMORTEM — Phase T — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → **POSTMORTEM-T** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | Episode 1: `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..5}.md` (10 files) · Episode 2: `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v5.md` (2 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 2.0 | 2026-08-10 |

RESOLVED: no

**Two episodes, one marker.** Episode 1 (Phase T TSPEC round exhaustion, 2026-08-06) was resolved
on 2026-08-06 and its resolution is recorded below; its own marker has been folded into that prose
because `parseResolvedMarker` fails closed on a file carrying two markers (`duplicated`). The single
marker above governs the file and is currently open on **Episode 2** — the erratum-confirmation halt
of 2026-08-10. Do not flip it while Episode 2’s Recommendation is unaddressed.

| Episode | Halt | Document | Date | State |
|---|---|---|---|---|
| 1 | Review-round exhaustion (rounds 1–5, no approval) | `TSPEC` v1.4 | 2026-08-06 | resolved 2026-08-06 |
| 2 | Erratum delta-confirmation non-approving (`se-review`), on round 5 of 5 | `PROPERTIES` v1.4 | 2026-08-10 | **open** |

---

# Episode 1 — Phase T TSPEC round exhaustion (2026-08-06)

## Phase

**Phase T — TSPEC authoring and cross-review convergence. Rounds 1–5, the full
`MAX_REVIEW_ROUNDS = 5` window.**

| | |
|---|---|
| Document | `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` |
| Version at HEAD | **1.5** (2026-08-06) — v1.4 was the version round 5 reviewed |
| Size at HEAD | 2,545 lines / 215,394 bytes (0.78× its upstream FSPEC: 2,632 lines / 277,264 bytes; 3.5× the REQ) |
| Branch | `feat-pdlc-consolidation-agent` |
| Window | rounds 1–5; first reviews 2026-08-06 17:17, last reviews 18:46 — **1 h 29 m** wall clock |
| Reviewers | `pdlc:pm-review` (product-manager) and `pdlc:te-review` (test-engineer) |
| Countermeasures in force | `DEC-LAYER-01` (spec layer boundary), `DEC-SEV-01`/`DEC-SEV-02` (severity bars), `DEC-CONV-01` (approval carry-forward) — all recorded during the Phase R and Phase F resolutions, all landed before round 1 opened |
| Terminal state | round 5 reviewed TSPEC v1.4; both reviewers returned `VERDICT: Needs revision`; the round window was exhausted, so no round 6 could be opened |

As in both earlier halts on this feature, **the halt is not a stalled author.** Every finding of
every round was closed as filed, and the round-5 findings were closed too — commits `5396cb5` …
`ff0a94a` (18:49–18:54) close PM F-17/F-18/F-19 and TE F-01/F-02/F-03 and bump the document to
**v1.5**, three minutes after the last review landed. What the loop ran out of was rounds in which
a reviewer could confirm that.

**This is the feature's fifth exhausted window.** Phase R halted twice
(`POSTMORTEM-R-pdlc-consolidation-agent.md`, rounds 1–5 and 6–10, both resolved); Phase F halted
twice (`POSTMORTEM-F-pdlc-consolidation-agent.md`, rounds 1–5 and 6–10, both resolved). Phase T is
the third phase and the fifth window. The recurrence is treated as evidence in
§ Best-Guess Root Cause, not as coincidence.

**What makes this window diagnostic, and different from both Phase F windows.** Phase F's second
window failed on *synchronisation*: three of its five rounds contained an approval, they alternated
between the reviewers, and the fix — `DEC-CONV-01`, approval carry-forward — would have converged
it at round 7. That fix was in force here and **could not act, because this window contains no
approval at all.** Ten reviews, ten `Needs revision`. Something genuinely blocking was open in
every round, including the last: round 5 carries a **High**. That is a different failure from
Phase F's and it needs a different countermeasure.

## Iterations (5 — limit reached)

Findings counted from each review's `## Findings` table only (prior-finding disposition rows are
closures, not findings). The test-engineer's counts are cross-checked against the machine-readable
trailer each of its reviews carries.

| Round | TSPEC ver. | product-manager | test-engineer | PM verdict | TE verdict |
|---|---|---|---|---|---|
| 1 | 1.0 | **4 High**, 1 Medium, 1 Low | **5 High**, 7 Medium, 3 Low | Needs revision | Needs revision |
| 2 | 1.1 | 0 High, 1 Medium, 2 Low | **1 High**, 4 Medium, 2 Low | Needs revision | Needs revision |
| 3 | 1.2 | **1 High**, 3 Medium, 0 Low | 0 High, 1 Medium, 2 Low | Needs revision | Needs revision |
| 4 | 1.3 | 0 High, 1 Medium, 2 Low | 0 High, 2 Medium, 2 Low | Needs revision | Needs revision |
| 5 | 1.4 | **1 High**, 1 Medium, 1 Low | 0 High, 2 Medium, 1 Low | Needs revision | Needs revision |

Three facts this table carries, and each of them separates this window from Phase F's:

1. **High is not retired.** Combined High runs 9 → 1 → 1 → 0 → **1**. In both Phase R windows and
   both Phase F windows the High population drained monotonically and was gone by round 4; here it
   reappears in rounds 3 and 5 after reaching zero. Both of those late Highs are in text the same
   round added, and both are the same *class* — see § Pattern of Disagreement 1.
2. **No reviewer approved in any round.** This is the first window on this feature in which the
   verdict table is uniform. `DEC-CONV-01` (approval carry-forward), the countermeasure that would
   have converged Phase F's second window at round 7, has nothing to carry: it can rescue a window
   that produces an approval and is inert in one that does not.
3. **Medium is flat and low.** Combined Medium runs 8 → 5 → 4 → 3 → 3. It is decaying, but slowly
   and toward a positive floor, exactly as Phase F's second window found post-freeze. Round 5's
   three Mediums are all in text rounds 4–5 added.

### Prior-finding disposition, by round

| Round | Prior findings re-checked | Closed as filed | Argued / rejected / partially addressed |
|---|---|---|---|
| 2 | PM 6, TE 15 (+3 questions) | all | none |
| 3 | PM 3, TE 5 (+3 questions) | all | none |
| 4 | PM 4, TE 3 (+3 questions) | all | none |
| 5 | PM 3, TE 4 (+3 questions) | all | none |

Four consecutive rounds at **100 % closed-as-filed**, with zero findings argued, rejected or
deferred — the fourteenth consecutive such round across this feature's three phases. Two rounds
closed findings *wider* than they were filed (TE v5's disposition: "two of the four repairs are
better than what I asked for"), and one round contains a reviewer withdrawing its **own** prior
claim on measurement (PM v3 on F-07(iii): "My v2 sub-claim (iii) was wrong and I withdraw it …
The document's transcription was right and my correction of it was not").

### Open at the limit (round 5, against TSPEC v1.4)

| ID | Reviewer | Sev | Subject |
|---|---|---|---|
| F-17 | PM | **High** | §7.3's release decision (`_writeFile(markerPath, "")`; `file_empty` treated exactly as absent) makes FSPEC §4.2's fourth enumerated row **unreachable** — an empty (truncated-write) marker is required to be reclaimed with `reclaimed-stale-lock` recorded (`FSPEC:442`, E-11 `:2592`, AT-M3 `:2038`) and now resolves `free` with nothing recorded. The engineering argument is sound and independently verified; what is missing is the *acknowledgement*: §10.3 row 4 dropped the row's "or empty" half without a word, and §12.3 still assigned AT-M3 as though satisfiable. Required: name the row, state what ships instead, raise the erratum |
| F-18 | PM | Medium | `releaseMarker` became a named function with a decided observable and a §12.1 CONS-03 row, but no §12.2 row and no §12.3 assignment. FSPEC §4.3's six-status take/release table is a closed set-equality obligation (`:452-470`, BR-15 `:2500`); a release that skips the `failed` arm would be green everywhere |
| F-01 | TE | Medium | Nothing asserts that `rtConsInjections()` supplies `_checkFile` — or any other §5.1 member. The repo has shipped this exact omission once (`runtime-adapter.js:1098-1100`); an unwired presence probe reads as "no marker present", turning AC-1.3's mutual exclusion off in production while every `fakeFs` fixture stays green |
| F-02 | TE | Medium | §7.3's take sequence — the line an implementer transcribes — still read `read → verdict → write → read back`, with no `_checkFile` probe, while decision 2 two paragraphs above forbids deriving `present` from the read. Two incompatible expected values for the same call-order oracle |
| F-19 | PM | Low | §4's `CheckReply` comment claims a `file_empty`/`file_missing` distinction §7.3 does not use, and the two implementations disagree on the boundary it names (`test -s` bytes vs. `fakeFs`'s `String(...).trim()`) |
| F-03 | TE | Low | §11.2's timer drain runs *after* the case's assertions, so it is skipped on precisely the failing path (the mandated mutation check) it exists to keep quiet |

**One High, three Mediums, two Lows — six items, all local, none touching the document's scope or
structure.** The two Mediums PM F-18 and TE F-01 are the same defect shape found independently from
opposite lenses (a decided observable with no coverage row); TE F-01 and TE F-02 are, in the
reviewer's own words, "the unfinished tail of the same repair".

### What happened after the limit

| Commit | Time | Closes |
|---|---|---|
| `5396cb5` | 18:49 | PM F-19, TE Q-03 — `CheckReply` comment states only the decision, records the byte-vs-trim divergence |
| `12f669e` | 18:50 | TE F-01 (half) — §5.5 states what module defaults do in the runtime; `defaultCheckFile` fails loudly |
| `5121ea9` | 18:50 | TE F-02 — §7.3's take sequence begins with the `_checkFile` probe, matching decision 2 |
| `64446be` | 18:51 | PM F-17, Q-12, Q-13 — §7.3 names FSPEC §4.2's unreachable empty-marker arm and raises it upstream |
| `5d866b8` | 18:51 | PM F-17 — §10.3 splits marker rows 4/4a; the empty arm's behaviour is recorded |
| `1a6f1d7` | 18:52 | TE F-03 — the drain moves into a `finally` |
| `3ba1e4d` `43ddf50` | 18:52–18:53 | PM F-18, TE F-01 — §12.2 release set-equality row and `rtConsInjections` protocol row; §12.3 assigns both and states AT-M3's partial coverage |
| `30a887d` `24d2f8f` `ff0a94a` | 18:53–18:54 | §13.1 row 13 records the release/presence decision and its rejected alternatives; §13.3 raises the marker erratum; version **1.5**, one spelling for the take's non-atomicity |

Every round-5 item was closed within **eight minutes** of the last review landing. Verified at HEAD:
§7.3 now reads "Take is `_checkFile`, then `_readFile`, then `_writeFile`" (`:966`) and the sequence
line is `check → read → verdict → write → read back → …` (`:987`); §10.3 carries a new row 4a naming
the narrowing of FSPEC §4.2 explicitly; §12.2 carries the `rtConsInjections()` ↔ §5.1 set-equality
row and §12.3 assigns it to `consolidationBuild.test.js` while recording AT-M3's partial coverage.
The tree at HEAD is v1.5 and no reviewer has ever seen it.

## Reviewers

| Role | Skill | Lens | Rounds | Files |
|---|---|---|---|---|
| product-manager | `pdlc:pm-review` | requirements traceability, scope compliance, AC fidelity, channel discipline | 1–5 | `CROSS-REVIEW-product-manager-TSPEC-v{1..5}.md` |
| test-engineer | `pdlc:te-review` | testability, oracle strength, fixture buildability, completeness by set-equality | 1–5 | `CROSS-REVIEW-test-engineer-TSPEC-v{1..5}.md` |

Nothing in this window impeaches either reviewer's conduct. The record on both:

- **Delta scoping held from round 2 onward.** Every review names its baseline commit and its diff
  range and states that unchanged sections were not re-litigated (round 3: `ea5be5a` → `e75feca`,
  "251 insertions / 62 deletions"; round 5: `74f990a` → HEAD, "188 insertions, 38 deletions across
  seven commits"). No round re-opened a settled decision, and both reviewers say so in terms
  ("Nothing I approved in earlier rounds is broken by this revision").
- **Claims were verified against the repository, not asserted — and re-verified each round.** Round
  5 alone re-checks `rtCheckFile` (`runtime-adapter.js:817-831`) and its `test -f && test -s`
  command, `fakeFs.checkFile`'s trim-based form (`__tests__/helpers/seams.js:292-300`), the absence
  of any removal verb in the adapter, `checkFileNonEmpty`'s never-throw contract
  (`orchestrate-dev.js:3674-3693`) and its unbound `fs` in the shipped bundle
  (`dist/orchestrate-dev.bundle.js:3219`), `nudge-consolidation.sh:28`'s `glob.glob` form, and the
  `adapterProbe.test.js:253-258` precedent. Earlier rounds re-ran the corpus pathspec measurement
  by hand, in both directions, three separate times.
- **A reviewer corrected itself against measurement.** PM v3 withdrew its own v2 sub-claim about the
  shipped `rtWriteFile` prompt text after re-measuring, and said so in the disposition table rather
  than quietly dropping it. That is the opposite of a ratchet.
- **The severity bars were applied as written, including downward.** Every finding filed Medium or
  High names a specific undetermined value, an unreachable enumerated row, or an obligation with no
  falsifier. No finding in the window is of the `DEC-SEV-02` bookkeeping-completeness class that
  would have had to be scored Low; the two Highs are both upstream-obligation collisions, which no
  standing decision assigns to Low (see § Recommendation 3).
- **The erratum channel was used rather than bypassed, by both reviewers and by the author.** PM v3
  F-10 was cleared by *raising* the enumeration relaxation against REQ `:115-116` and FSPEC AT-P7
  rather than absorbing it; PM v4 raised two errata in its own final message; PM v5 raised the
  FSPEC-side half of F-17; the author's §12.4 records ER-6 with a falsifiable interim, and §13.3
  now carries the marker erratum. No reviewer edited an upstream document.
- **Both reviewers repeatedly asked for less than they were given.** TE v5's disposition records
  that two of four repairs exceeded the finding ("the pin anchor was fixed by changing the artifact
  rather than weakening the assertion, and the pathspec case was moved to a self-built temp
  repository I had not thought to require"). A window in which the author over-delivers on every
  round and the reviewers say so is not a window failing on effort.

The one thing neither reviewer did — and it is the whole of the halt — is **approve**. Both applied
the shipped bar (any open High or Medium ⇒ Needs revision) to a finding set that was never empty.

## Pattern of Disagreement

**There is no disagreement between the reviewers, and none between the reviewers and the author.**
Zero findings were argued in four consecutive rounds; where the reviewers overlap they *converge*
(PM F-18 and TE F-01 are the same defect shape found independently from opposite lenses in the same
round), and one reviewer withdrew its own claim rather than defend it. Five patterns describe the
window, and the first is the one Phase F could not have shown.

### 1. Both late Highs are the same class: a decision this layer had to make, colliding with an enumerated upstream artifact

| Round | High | The decision | The upstream artifact it collided with |
|---|---|---|---|
| 3 | PM F-10 | the corpus enumeration and the hook's enumeration cannot be held set-equal by a test, so the equality is narrowed to the predicate | REQ `:115-116` ("keeping one **enumeration** as well as one predicate") and FSPEC AT-P7's *Then* (`:2026`, the two sets "set-equal"), bound by BR-09 |
| 5 | PM F-17 | release is `_writeFile(markerPath, "")` and `file_empty` is treated exactly as absent, because no seam can remove a file | FSPEC §4.2's fourth row (`:442`), E-11 (`:2592`) and AT-M3's *Given* (`:2038`), which require an empty marker to be **reclaimed** with `reclaimed-stale-lock` recorded |

Both decisions are *correct* — each reviewer verified the engineering argument at HEAD and said so.
Neither is a scope violation, an invention, or a slip. In both cases the finding is not "you decided
wrongly" but **"you decided locally something whose owner is upstream, and did not say so"**, and in
both cases the accepted repair was identical and had three parts: name the upstream artifact this
layer cannot satisfy, state what ships instead with a falsifier for it, and raise the erratum so the
owner re-decides. PM v5 says it explicitly: *"the right disposition is the one this document uses
elsewhere … What it must not do is state `file_empty ≡ absent` as a settled local fact while three
FSPEC artifacts say otherwise."*

This class did not exist in Phase F's windows, and it exists here **by design**: `DEC-LAYER-01`
moved exactly these decisions — tie-break algorithms, per-field reader indices, seam permitted-sets,
fixture construction and oracle strength — out of the FSPEC and into the TSPEC. It priced the move
honestly ("TSPEC inherits four open decisions") and it worked on its target: the FSPEC's Medium rate
fell ~75 %. What it did not do is give the receiving layer a *disposition rule* for the case where
an inherited decision turns out to falsify an enumerated upstream row. Absent that rule, every such
collision is a fresh High.

### 2. The second-largest class is a decided observable with no coverage row

| Round | Finding | The observable that was minted | Where the row was missing |
|---|---|---|---|
| 3 | PM F-12 | AC-3.2's three PR-body citations; FSPEC §5.3's "and only when" negative | no AT in the register, and no local case either |
| 4 | TE F-02 | §7.1's unreadable-corpus-entry decision — counted, in the consumed pair, named in the report body | no §12.2 row, no §12.3 file, no register AT |
| 5 | PM F-18 | `releaseMarker`'s six-status take/release obligation | §12.1 CONS-03 row present; §12.2 and §12.3 rows absent |
| 5 | TE F-01 | `rtConsInjections()`'s contents, once `_checkFile` was promoted to a protocol seam | no §12.2 row, no §12.3 file |

Four of the window's nine Mediums are this one shape. It is manufactured by the repair, not by the
draft: each round's fix *decides* something, a decision is an observable, and §12.2/§12.3 form a
coverage contract that every observable owes two rows to. The author's own rule for it — minted at
round 4 in response to PM F-12 — is the right one and is quoted approvingly by both reviewers:
**"a named gap is not a licence to ship uncovered."** The rule is correct and it is also the reason
the class keeps recurring: it converts every new decision into two further edits whose omission is a
legitimate Medium.

### 3. The residual class is propagation lag inside a heavily cross-referenced document

PM F-14 (round 4) found the *same* pin pair placed at two different levels in two different files by
two different sections of one revision; the repair had to touch five sections. TE F-02 (round 5) found
§7.3's take sequence still spelling `read → verdict` two paragraphs below a decision forbidding it.
TE's own summary is the general statement: *"Both new Mediums are the same shape as last round's: a
decision made correctly in one place that has not yet reached the one remaining place that
contradicts it. Neither is a redesign."* The document's coupling — §5.1 protocol × §7 functions ×
§10.3 outcome table × §11 levels × §12.1 CONS rows × §12.2 discharge rows × §12.3 file assignments ×
§13.1 decisions × §13.3 PLAN hand-off — means a single decision obliges edits at six to eight sites,
and the reviewers correctly check all of them.

### 4. Findings migrate one axis over rather than recurring

As in every prior window on this feature, no finding is ever the same finding twice. The marker
thread across five rounds: round 1 — nothing; round 4 (TE F-01) — T-13's conjunct (ii) cannot be
written because the document never says what release *does*; round 5 (TE F-01) — release is decided
but the seam that supplies `present` is never asserted to be wired; round 5 (TE F-02) — the take
sequence contradicts the decision; round 5 (PM F-17) — the decision makes an FSPEC row unreachable;
round 5 (PM F-18) — the decision has no coverage row; round 5 (PM F-19) — the type comment overstates
what the doubles distinguish. One subject, six genuinely different defects, each living in the text
written to close the previous one.

### 5. No approval was ever available, so the Phase F countermeasure could not act

`DEC-CONV-01` makes convergence "both reviewers *holding* an approval". In this window neither
reviewer ever held one. Each round's blocking set was non-empty on the merits, and in three of the
five rounds it contained a High. This is the crucial difference from Phase F's second window: there,
the document was approvable and the *rule* discarded the approvals; here, the document was not
approvable in any round, because each round's repair decided something new that collided with either
an upstream row (pattern 1) or the coverage contract (pattern 2). Fixing convergence cannot fix this
window. Only reducing the rate at which a repair manufactures a **blocking** finding can.

## Best-Guess Root Cause

**The TSPEC is the first layer that must *decide*, and this pipeline has no disposition rule for the
case where a correct local decision falsifies an enumerated upstream artifact. Every such collision
is therefore filed as a fresh High, and the collisions are manufactured by the repairs — so the High
population never drains.** Four causes, in decreasing confidence.

### RC-1 (primary) — an upstream-obligation collision has no severity ruling, so it blocks by default

Both late Highs (rounds 3 and 5) are of one class: a decision this layer had to make, which turns out
to make a REQ or FSPEC row unsatisfiable. The class is a **predicted consequence of `DEC-LAYER-01`** —
the decision that moved tie-breaks, reader indices, seam permitted-sets and oracle strength out of
the FSPEC and into the TSPEC, explicitly pricing the move as "TSPEC inherits four open decisions".
It inherited them. What it did not inherit is a rule for what happens when one of them collides.

The evidence that this is the binding constraint, and not merely present:

1. **The repair for both Highs was identical, and neither changed a decision.** Name the artifact,
   state what ships instead with a falsifier, raise the erratum. Round 3's F-10 and round 5's F-17
   were closed that way in 12 and 8 minutes respectively, and in both cases the decision the finding
   was "about" survived unchanged. A finding whose accepted repair never alters the thing it names
   is a **channel** finding, not a defect finding.
2. **`DEC-SEV-01` and `DEC-SEV-02` already establish the precedent for exactly this ruling.** Both
   demote a class of finding to Low on the ground that the finding is about *where a decision is
   recorded* rather than about the behaviour specified. An upstream collision that is named, priced
   and routed is the same kind of item — and it is strictly better evidenced, because the erratum
   channel gives it a named owner and a tracked lifecycle.
3. **Without such a ruling the class cannot drain**, because it is generated by the act of deciding,
   and deciding is what this document exists to do. Round 3 had reached zero Highs and round 3's own
   repairs produced one; round 4 reached zero again and round 5's repairs produced one.

Confidence: **high**. Two independent instances, identical shape, identical repair, both in
same-round text, and a standing project decision (`DEC-LAYER-01`) that predicts the class.

### RC-2 (secondary) — the coverage contract turns every decision into two further obligations

§12.2 (per-obligation discharge row) and §12.3 (per-file AT assignment, which feeds the PLAN's
file-ownership manifest) are a genuine coverage oracle, and the author's rule — "a named gap is not a
licence to ship uncovered" — is correct and was adopted unprompted. Its cost is arithmetic: each new
decided observable owes a §12.2 row **and** a §12.3 assignment, and a missed one is a well-founded
Medium. Four of the window's nine Mediums are of that class, one in each of rounds 3, 4, 5, 5.

So the Medium rate has a floor above zero for the same structural reason Phase F's did, one layer
down: the reviewers are dispatched with a completeness-by-set-equality clause, the only way to answer
it here is a coverage row, and every round's repair creates new things to cover.

Confidence: high for the mechanism; medium for the claim that the floor is strictly positive rather
than one or two rounds away — the rate is decaying (8 → 5 → 4 → 3 → 3), just not fast enough for a
five-round window.

### RC-3 (contributing) — `DEC-CONV-01` is inert in a window with no approval

Approval carry-forward was the decisive fix for Phase F's second window and it did nothing here,
because it can only preserve an approval that was granted. Ten reviews, zero approvals. This is not a
defect in `DEC-CONV-01` — it is the observation that Phase F's diagnosis was window-specific, and
that the two windows failed for genuinely different reasons. Keep the decision; do not expect it to
help until the blocking rate falls.

### RC-4 (contributing) — reflexivity and feature scale, unchanged and now five windows deep

This feature specifies a **specification-governance mechanism**, so the document and its reviewers
reason about the same kind of object and ordinary spec prose becomes checkable claims at an unusually
high rate. Across three phases the feature has now consumed **50 reviews** (20 REQ, 20 FSPEC, 10
TSPEC) and five full windows, and **no reviewer has yet been wrong** — the only withdrawn claim in
the whole record is a reviewer withdrawing its own (PM v3), and it withdrew in the document's favour.

### RC-5 (contributing) — `MAX_REVIEW_ROUNDS = 5` measures rounds, not progress

The window closed in **1 h 29 m** of wall clock, at roughly 18 minutes per round-trip, with every
round producing committed, versioned revisions and every round-5 item closed within eight minutes of
the last review landing. The loop was never slow and never stalled. Raising the constant is still not
a fix — it buys rounds at an unchanged manufacture rate — but the budget was exhausted by production,
not by delay.

### Ruled out

| Hypothesis | Why not |
|---|---|
| Author non-responsiveness or stalling | 100 % of prior findings closed as filed in four consecutive rounds; the six round-5 items closed within eight minutes of the last review landing; two rounds closed findings wider than filed |
| Reviewer severity inflation or a ratchet | Every High and Medium names a specific unreachable row, undetermined value or uncovered obligation; PM withdrew its own v2 claim on measurement; no finding of the `DEC-SEV-01`/`DEC-SEV-02` demoted classes was filed as blocking |
| Reviewer disagreement or deadlock | Zero contradicted findings in five rounds; two of round 5's Mediums are the same defect shape found independently by both reviewers |
| The countermeasures were not applied | `DEC-LAYER-01`, `DEC-SEV-01/02` and `DEC-CONV-01` all landed before round 1; `DEC-LAYER-01` is the reason these decisions are at this layer at all |
| The countermeasures were wrong | `DEC-LAYER-01` did what it promised (the FSPEC's mechanism-Medium class is gone); `DEC-CONV-01` was decisive for the window it was written for. Both are incomplete for *this* window, not mistaken |
| Ambiguous or contested upstream scope | No round re-opened scope, structure or a settled decision; both reviewers state this explicitly in rounds 3, 4 and 5. The two upstream collisions are enumerated-artifact conflicts, not scope disputes |
| A structural defect in the TSPEC | Every open finding is local and names a specific clause, function or table row; the terminal repair touches nine sections and adds no new mechanism |
| Watchdog or pacing failure | No no-progress halt occurred; every round produced committed, versioned revisions |
| Document bloat | The TSPEC is **smaller** than its FSPEC (215 KB vs 277 KB) and grew ~11 % across the window. Unlike Phase F, size is not a symptom here |

## Recommendation — Episode 1 (carried out in full; see § Resolution below)

Ordered. Steps 1–4 are the resolution; step 5 is re-entry; steps 6–8 are scope notes and the
escalation this feature has now earned.

### 1. Verify the v1.5 tree against the six open round-5 items — against the tree, not the commit messages

Commits `5396cb5` … `ff0a94a` claim closure of PM F-17/F-18/F-19 and TE F-01/F-02/F-03. Verify each
**per finding, at the file at HEAD**:

- **PM F-17 (High)** — §7.3 names FSPEC §4.2's fourth row's *empty* arm as unsatisfiable under the
  release form, states what ships instead, and raises the erratum; §10.3 carries rows 4 and 4a with
  the empty arm's behaviour spelled out; §12.3's `consolidationPass.test.js` row states that AT-M3 is
  **partly** satisfiable and which arm is written; §13.3 carries the erratum. Confirm no §12 row or
  §10.3 row still claims the truncated arm, and that **no test is specified against the register's
  full *Given*** (a test written to it would be red on correct code).
- **PM F-18 (Medium)** — §12.2 carries a release row asserting the six terminal statuses against
  `{taken?, released?}` by **set equality over the enumeration, not containment**, and §12.3 assigns
  it to a file. Check the `failed` arm — the one reached from step 8 rather than step 14 — is inside
  the asserted set.
- **TE F-01 (Medium)** — §12.2's `rtConsInjections()` row asserts **set equality** (not containment)
  between the injection object's key set and §5.1's declared seam names minus §5.6's named
  exclusions, §12.3 assigns it to `consolidationBuild.test.js`, and §5.5 states what the module
  defaults do **in the runtime** rather than under jest, with `defaultCheckFile` failing loudly.
- **TE F-02 (Medium)** — §7.3's lead-in and its sequence line both begin with the `_checkFile` probe,
  and the `read-then-write` race paragraph that follows prices a **three**-call take.
- **PM F-19 (Low)** — §4's `CheckReply` comment states only the decision (both reasons are absent)
  and records the byte-vs-trim divergence between `rtCheckFile` and `fakeFs.checkFile`.
- **TE F-03 (Low)** — §11.2's drain is inside a `finally` (or replaced by fake timers in an
  `afterEach`), so it runs on the failing path.

Re-verify every `file:line` the repair introduced **at HEAD**, and do not trust this postmortem's
line numbers either. Record the verification per finding in a `## Resolution` section appended to
this file. Any finding that does not verify is remediated **before** re-entry, not deferred into the
confirming round.

### 2. Decision freeze for the confirming round

Declare, in the resolution commit, that rounds 6–10 may **decide nothing new**: no new mechanism, no
new function, no new observable, and no new §12.2/§12.3 row beyond those closing round-5 items and
those a reviewer's finding directly obliges. This is the direct countermeasure to RC-2 and the
analogue of the mechanism freeze that measurably worked in Phase F (its target class disappeared and
the Medium rate fell ~75 %). It removes the manufacture surface for one round so the loop can observe
its own fixed point. Reviewers should be told the freeze is in force, so that a finding proposing new
mechanism is filed Low/deferred rather than as a blocking Medium.

### 3. Record the disposition rule for an upstream collision — this is the RC-1 countermeasure, and the one that ends the halt

Add `DEC-SEV-03` to `docs/_decisions/DECISIONS-review-severity-bars.md`:

> **A named, priced and routed upstream collision is Low, not High.** When a downstream document
> (TSPEC, PROPERTIES, PLAN) makes a decision its own layer owns, and that decision renders an
> *enumerated* upstream artifact — an AC, an AT, an `E-` row, a vocabulary row, a lifetime row —
> unreachable or narrowed, the finding is **Low** provided the document (a) **names** the upstream
> artifact it cannot satisfy, (b) **states what it ships instead**, with a falsifier for the part
> that is satisfiable, and (c) **raises the erratum** through the sanctioned channel so the owning
> layer re-decides. It is **High** only when one of those three is missing — i.e. when the collision
> is *absorbed silently*. Severity attaches to the concealment, never to the collision.

Two things this does not do: it does not let a wrong decision through (the decision itself remains
reviewable on its merits at full severity), and it does not weaken the erratum channel — it is the
channel's enforcement mechanism, since the only way to earn the demotion is to use it.

On this window's evidence the ruling is decisive. Both blocking Highs (rounds 3 and 5) were of
exactly this class, both were repaired to exactly the shape the rule prescribes, and neither changed
the decision it named. Under `DEC-SEV-03` round 5's open set is **three Mediums and three Lows**, and
round 3's is three Mediums — which does not by itself converge the window, but it stops the *High*
population being regenerated by the act of specifying, which is what RC-1 identifies as the cause.

Companion note for `docs/_decisions/DECISIONS-spec-layer-boundary.md`: record that `DEC-LAYER-01`'s
inherited decisions arrive at the receiving layer **with** this disposition rule, so the cost the
decision priced ("TSPEC inherits four open decisions") is paid through the erratum channel rather
than through the severity bar.

### 4. Keep `DEC-CONV-01`, `DEC-LAYER-01` and `DEC-SEV-01/02` — and record that this window tested them

None of them failed. `DEC-LAYER-01` did what it promised one layer up; `DEC-CONV-01` was decisive for
the window it was written for and was simply inert here, because a window with no approval has none
to carry. Add this window's evidence to both records: an approval-carry rule cannot rescue a window
whose blocking rate never reaches zero, and a layer-boundary rule needs a collision-disposition rule
beside it.

### 5. Re-entry

Once steps 1–4 are verifiably addressed on the branch:

1. Append a `## Resolution` section naming the evidence for each addressed finding.
2. Flip the marker to `RESOLVED: yes` in the same commit, and name the evidence in the commit
   message. **The workflow never writes `yes`; an operator or agent does, after verifying.**
3. Re-invoke the phase forced:
   `/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md", "forcePhases": "T"}`

Re-entry opens rounds 6–10 (`deriveRoundWindow` derives the window from the `-v5` basenames present,
so the append-only review history is preserved). The expectation under the decision freeze **and**
`DEC-SEV-03` is **one delta round that confirms the round-5 closures and produces the window's first
two approvals**; with `DEC-CONV-01` in force those approvals then hold.

### 6. Not recommended

| Option | Why not |
|---|---|
| Rewrite or restructure the TSPEC | Five rounds found no structural defect; every open finding is local and named. A rewrite discards five rounds of verified convergence and re-opens the High population. The document is also *smaller* than its FSPEC — there is no bloat to cut |
| Lower the approval bar, or force past the reviews without step 3 | The bar is being applied correctly. The fix is to stop *generating* blocking findings for a class whose repair never changes a decision, not to stop requiring approval |
| Raise `MAX_REVIEW_ROUNDS` | Buys rounds at an unchanged manufacture rate (RC-1, RC-2). It would not have converged this window either |
| Re-open the REQ or the FSPEC, or split the feature | Those two documents cost four windows and 40 reviews between them. The open upstream items are already routed as errata and are the right size for that channel |
| Reverse `DEC-LAYER-01` | It worked on its target class. Reversing it returns these decisions to the FSPEC, which is precisely what consumed both Phase F windows |
| Expect `DEC-CONV-01` to help | It cannot act until a first approval exists. Step 3 is what makes one reachable |

### 7. Housekeeping (not blocking)

Three errata are open at the phase boundary and **must not be lost**; §13.3 carries all three:

- **ER-6** — the `Route` union in `docs/_constraints/pdlc-consolidation-vocabularies.md` has no
  member for a proposal-file promotion. Interim: the pass writes `route: "degraded"`, with a
  two-fixture discriminator control asserting both the loss and the compensating difference.
- **The enumeration relaxation** — against REQ `:115-116` and FSPEC AT-P7/BR-09. The erratum ranks
  its own options (an answer of "yes, an ignored LEARNINGS file is corpus" strictly reduces the
  divergence set), which is the information the upstream reviewer needs.
- **The marker lifetime/reclaim erratum** — against FSPEC §4.1's "Removed at step 16" (no declared
  seam can remove a file) and §4.2's fourth row / E-11 / AT-M3. This is PM F-17's upstream half and
  is a product judgement about what the durable log must witness when a pass dies mid-take.

Also: the TSPEC's §12.3 file table is the input to the PLAN's file-ownership manifest (batch-safety
rule 2). Phase P will parse it, so any row added during the confirming round must name a file.

### 8. Escalation — the decision an operator should take if this window is repeated

This feature has now consumed **five** review windows and 50 reviews across three phases. Phase F's
postmortem set the precedent (its step 8) and it applies here with one phase's more evidence: if
rounds 6–10 also close without both approvals, do **not** open a second Phase T window. Accept the
TSPEC at its then-current version, route the open items to Phase P and Phase PT as errata through
the erratum channel, and record the acceptance and its reasoning in this file. The findings will be
checked one layer down by the reviewers `DEC-LAYER-01` says are equipped to check them — which is,
in the end, the same argument that moved them here.

### 9. Phase H

Harvest must fold **three** halted phases into `LEARNINGS-pdlc-consolidation-agent.md`: 20 REQ
cross-reviews, 20 FSPEC cross-reviews, 10 TSPEC cross-reviews, and all three post-mortems. The
durable signal from this window is § Pattern of Disagreement 1 and RC-1 — *moving a decision down a
layer moves its collisions down with it; a layer boundary without a collision-disposition rule
converts every inherited decision into a blocking finding whose repair never changes the decision.*
That is a candidate for promotion to `docs/_constraints/DOMAIN-CONSTRAINTS.md` at the next
`consolidate-learnings` pass, together with `DEC-SEV-03` from step 3.

## Resolution (2026-08-06)

The Recommendation was carried out in full by the outer orchestrator.

**Step 1 — verification (Opus agent, TSPEC v1.5 at HEAD, judged against file text, not commit
messages).** PM F-17 (High) CLOSED — §7.3 names FSPEC §4.2's empty arm unsatisfiable and states
what ships, §10.3 rows 4/4a split, §12.3 records AT-M3's partial coverage with no test specified
against the unreachable Given, §13.3 carries the erratum. PM F-18 CLOSED — §12.2 release row
set-equal over `TerminalStatus` with the step-8 `failed` arm inside the set. TE F-01 CLOSED —
`rtConsInjections()` set-equality row assigned to `consolidationBuild.test.js`; §5.5 states the
runtime behaviour with `defaultCheckFile` failing loudly. TE F-02 CLOSED — three-call take in
lead-in and sequence line. TE F-03 CLOSED — drain in a `finally`. PM F-19 was **PARTIAL** solely
on a wrong self-introduced citation (`runtime-adapter.js:820` for `test -s`, which is at `:823`).

**Completion — TSPEC v1.6, five mechanical/freeze-compliant edits, no new mechanism, function,
observable or §12 row:** the `:823` citation corrected; `orchestrate-dev.js:3690-3692` corrected
(the `catch`, not `:3688`); §13.3 gains a pure cross-reference bullet so the hand-off list carries
ER-6 (it was recorded in §12.4 but absent from the section Phase P reads); the §7.3 call-order
sentence and §5.5 `defaultCheckFile` paragraph gain the two pre-emptive clauses the verifier's
freeze-risk scan named (FR-1, FR-2), stating that no coverage row is owed or added under the
freeze.

**Step 2 — decision freeze, declared and in force for rounds 6–10.** The confirming round may
decide nothing new: no new mechanism, function, observable, or §12.2/§12.3 row beyond those
closing round-5 items and those a reviewer's finding directly obliges. A finding proposing new
mechanism is filed Low/deferred.

**Step 3 — disposition rule recorded.** `docs/_decisions/DECISIONS-review-severity-bars.md`
DEC-SEV-03: a named, priced and erratum-routed upstream collision is Low; High only when the
collision is absorbed silently. Companion note added to
`docs/_decisions/DECISIONS-spec-layer-boundary.md`: DEC-LAYER-01's inherited decisions arrive
with this disposition rule.

**Step 4 — DEC-CONV-01, DEC-LAYER-01, DEC-SEV-01/02 kept**, with this window's evidence: an
approval-carry rule is inert in a window with no approval, and a layer-boundary rule needs a
collision-disposition rule beside it.

**Step 5 — re-entry.** Queue row 15 back to `pending`; rounds 6–10 open from the on-disk `-v5`
basenames. Expectation under the decision freeze plus DEC-SEV-03: one delta round confirming the
round-5 closures and producing the window's first two approvals, which DEC-CONV-01 then holds.
Step 8's escalation stands: if rounds 6–10 exhaust, accept the TSPEC at its then-current version
and route the residue to Phase P / Phase PT as errata — do not open a second Phase T window.

---

# Episode 2 — Erratum-confirmation halt on PROPERTIES (2026-08-10)

## Phase — Episode 2

**Phase T's erratum wave, tail layer. The routed erratum landed in `PROPERTIES` as v1.4; the
delta-confirmation round came back split — `pm-review` **Approved**, `se-review` **Needs revision**
(1 High) — and that round was round 5 of `MAX_REVIEW_ROUNDS = 5`.**

| | |
|---|---|
| Document | `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` |
| Version at HEAD | **1.4** (2026-08-10, commit `9a95324f`) — the version round 5 reviewed |
| Size at HEAD | 118 distinct `PROP-*` ids, unchanged from v1.3 (verified both ways: id sets at HEAD and at `9a95324f^` have empty symmetric difference) |
| Branch | `feat-pdlc-consolidation-agent` |
| Window | rounds 1–5; the erratum edit at 16:12, PM confirmation 16:13, SE confirmation 16:16 — **4 minutes** of confirmation on a 27-minute wave |
| Reviewers | `pdlc:pm-review` (product-manager) and `pdlc:se-review` (software-engineer) |
| Halt condition | erratum delta-confirmation non-approving on the phase's erratum budget, with no round left in the window |

Both halt conditions fired on the same round, which matters for re-entry: this is **not** a case where
one more round would have been taken automatically. The window was spent and the erratum bound (one
erratum per upstream document per phase) was spent in the same act.

## The wave, in commit order

The erratum was not a single edit to a single document. It was a multi-layer wave descending
`REQ → FSPEC → TSPEC → PROPERTIES` inside half an hour, and its shape is the root cause:

| Time | Commit | Layer | What moved |
|---|---|---|---|
| 15:49–15:52 | `c74d5cef` … | TSPEC v2.5 | absorbs REQ §4b's *omission* decision (unreadable corpus entry omitted from the consumed pair) |
| 15:56–15:59 | (round-15 fixes) | TSPEC v2.6 | absorbs REQ v2.5's **second arm**: §7.1, §10.3 row 1b, §10.4, §12.2 gain the *all-unreadable pass terminates `no-op`* case and its set-equality oracle |
| 16:02–16:03 | `58a56d49`, `545ee0c0`, `dc3bca25` | TSPEC round 16 | both reviewers minor-changes; approval anchors appended |
| 16:06 | `b5ab7503` | FSPEC v11.7 | absorbs REQ v2.5's AC-1.4 `no-op` arm |
| 16:08–16:10 | `c094127d` … `0d6c4517` | FSPEC v18 | te-review PASS, anchors appended |
| **16:12** | **`9a95324f`** | **PROPERTIES v1.4** | absorbs **the omission decision only** |
| 16:13 | `34ff24ac` | pm-review v5 | **Approved** |
| 16:16 | `1f7f96b3` | se-review v5 | **Needs revision**, 1 High |

The upstream wave had two arms by 15:59. The routed item list handed to the PROPERTIES author had
one.

## Routed items — all six absorbed

The routing list carried six items, which collapse to two distinct defects, each stated twice by each
channel:

| Routed item | Disposition at HEAD | Evidence |
|---|---|---|
| `PROP-COR-09`'s conjunct (2) asserted `renderConsumedPair`'s output contains **both** basenames, contradicting the property's own title and REQ §4b | **Absorbed** | conjunct (2) (`PROPERTIES:397-401`) now pins the rendered list **set-equal to `{readable}`** — readable present, unreadable **absent**, **no third name** — with NFR-5's reason inline. The pre-erratum inclusion arm survives nowhere in the file |
| §O-5's parenthetical still read *(counted, in the consumed pair, named)* | **Absorbed** | `PROPERTIES:308-312` reads *(counted, **omitted from** the consumed pair — rendered set-equal to `{readable}` … — and named in the report body)*, plus the empty-pair positive control |

`se-review` states this in its own words (`CROSS-REVIEW-software-engineer-PROPERTIES-v5.md` §1 and
§6): *"the routed erratum items are fully and correctly absorbed — if the only question were 'did the
delta land', this would be an approval."* No routed item is open. **The confirmation did not fail on
the raised set.**

## The blocking finding — SE F-01 (High)

**The erratum absorbed half of the authority it now cites.** `PROP-COR-09`'s trailer names
`TSPEC §12.2` as its authority. That cell (`TSPEC:2835`) specifies **two** fixtures for this case:

1. the mixed corpus (one unreadable member, one readable control) — which v1.4 carries; and
2. *"a second fixture in the same case carries the **all-unreadable corpus** (§10.3 row 1b)"* — which
   asserts that terminal status is exactly `no-op` (**not** `failed`, which the same cell names as
   "the adjacent branch an implementer is most likely to reach for", and not `refused`), that the
   rendered pair's basename list is **empty**, and that `|un-consolidated|` is **2** with both
   basenames named as unread.

PROPERTIES carries only the first. The second arm is not deferred, not filed, not mentioned.

### Re-measured at HEAD for this postmortem (not taken from the cross-review)

| Claim | Result at HEAD |
|---|---|
| PROPERTIES nowhere covers the all-unreadable corpus | `grep -c "all-unreadable\|entirely unreadable\|row 1b"` over `PROPERTIES-…md` = **0** |
| `PROP-COR-09` scopes itself to one fixture | `:396` — *"One fixture carries **both** an unreadable member and a **readable control**"* |
| §12.1's AC-1.4 row does not reach it | `:1648` — `AC-1.4 — a no-op pass still reports \| PROP-PASS-11, PROP-RTE-06, PROP-EFF-06`; `PROP-COR-09` absent |
| `PROP-PASS-11` does not close it | it enumerates AC-1.4's first and second causes (un-consolidated set empty; every promotion duplicate-suppressed), never the third |
| The arm exists upstream and is minted, not implied | `REQ:26` — *"§4b's all-unreadable pass keeps terminal status `no-op` (AC-1.4's third cause)"*, staked on a **pairing** (consumed list empty **while** un-consolidated set non-empty) rather than a reason code |
| No register AT rescues it | `TSPEC:2835` states no register AT reaches these observables and walks through why (AT-K3, AT-L2, AT-F13, AT-R7 cover AC-1.4's first and second causes only) |
| The correction did no collateral damage | 118 distinct ids at HEAD and at `9a95324f^`; symmetric difference empty; `PROP-COR-09`'s trailer still `L2 · consolidationPass.test.js · T20 → T31` |

So the finding is **correct as stated**, and it is correctly filed as a finding rather than an
erratum: nothing upstream is wrong — REQ §4b, REQ's erratum note and TSPEC §12.2 all state the arm
consistently. The gap is this layer's alone. `se-review` says so explicitly and declines to route it
upstream, which is the right call under DEC-ERR-01.

Severity is also right. The register is what the V-wave runs from; an obligation absent from the
register is absent from the run whatever TSPEC says. The observable at risk is a terminal status
distinguished only by a two-field pairing, whose most likely wrong implementation (`failed`) TSPEC
names by hand.

## Why the two channels split on identical bytes

Neither reviewer is wrong, and the split is not a severity-bar disagreement.

| | `pm-review` v5 | `se-review` v5 |
|---|---|---|
| Declared scope | *"Delta confirmation … **product lens only**"*; `git diff c568c4c..HEAD`, three hunks | *"Delta confirmation … **every upstream citation the new text leans on was re-measured at HEAD**"* |
| Question asked | did the routed items land, and did the diff stay inside the erratum's stated scope? | that, **plus**: is the document still a faithful compression of the upstream it now cites? |
| Verdict | Approved (0/0/0) | Needs revision (1 High) |

The protocol's delta-confirmation check is *absorbed ⊇ raised*. PM ran exactly that check and it
passed. SE ran a superset check — the document against upstream HEAD — and it failed. **A wave that
grows a second arm mid-flight satisfies the first check and fails the second.** That is the whole
episode in one line.

## Best-guess root cause

**RC-1 (primary) — the routed item list was a snapshot of an earlier generation of the wave, and the
tail layer re-grounded on the list instead of on upstream HEAD.** The six routed items all descend
from REQ's *v2.1* omission erratum. By 15:59, REQ v2.5's second arm had been minted and absorbed into
TSPEC §7.1/§10.3/§10.4/§12.2, and into FSPEC v11.7 at 16:06. The PROPERTIES edit at 16:12 addressed
the list it was handed. The `se-author`/`te-author` SKILL's *Erratum Rounds — Re-ground Upstream
First* section requires the opposite order: re-read the immediate upstream at HEAD, diff its version
cell against the version the document was last approved against, enumerate what was **decided** in
`AC-`/`BR-` vocabulary, and absorb that **ahead of** the raised items. Step 3 of that procedure —
"the delta-confirmation check is the absorbed set, not the raised set" — is exactly the step that was
skipped, and exactly the step `se-review` then ran manually.

**RC-2 (structural, and the reason RC-1 was easy to miss) — a multi-layer wave has no synchronisation
point.** Each layer re-grounded on its own parent and each was individually correct: TSPEC absorbed
REQ, FSPEC absorbed REQ, PROPERTIES absorbed the routed text. Nothing in the protocol re-derives the
routing list at dispatch time from the upstream document's version *at that moment*. The list is
minted when the wave opens and travels unchanged while the wave keeps deciding.

**RC-3 (aggravating) — the confirmation round and the last round of the window were the same round.**
The fix `se-review` prices is one conjunct-pair inside a property that already exists, plus two
bookkeeping edits, no new id. There was no round left to spend on it, so a four-minute repair becomes
an operator halt.

**Not the cause, ruled out explicitly.** Over-correction (the edit was strictly stronger than the
routed items required — set equality with "no third name", not containment-plus-absence); collateral
movement (id set identical, no re-homing); pacing/watchdog failure (three hunks, one commit); a
reviewer re-litigating settled scope (SE re-litigated nothing — the finding is new scope surfaced by
the citation the erratum itself added); and severity inflation (the High bar is met on the register's
own completeness claim).
