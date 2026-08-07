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

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
