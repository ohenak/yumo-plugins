# POSTMORTEM — Phase T — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → **POSTMORTEM-T** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..5}.md` (10 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-06 |

RESOLVED: no

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

## Recommendation
