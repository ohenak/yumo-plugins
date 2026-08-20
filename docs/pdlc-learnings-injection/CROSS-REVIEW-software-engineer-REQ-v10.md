# Cross-Review: software-engineer — REQ (delta confirmation, frozen round)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.9)
**Date:** 2026-08-19
**Iteration:** 10 (delta over commit `386e4f0c` → HEAD)

## Scope of this round

Non-empty delta this time: `git diff 386e4f0c HEAD -- docs/…/REQ-…md` is 14 insertions / 8
deletions across four hunks — the changelog row, §1.2 claim 2, AC-3.1's closure sentence,
AC-3.2's run-level-mirror parenthetical, and AC-5.1b's precedent clause. Per the delta
protocol I re-read my v9 file, diffed, verified each changed clause against HEAD source,
and scanned only the changed sections. Unchanged sections are not re-litigated.

Decision freeze respected: nothing new is opened below. The only blocking grounds available
this round are (i) a defect the delta introduced and (ii) a load-bearing claim contradicted
by the repository at HEAD. Neither is present.

## Carried findings — disposition

| Prior finding | Resolved? | Evidence |
|---|---|---|
| **v9 F-01 / Medium / Cross-Feature** — §1.2 claim 2 attributed a fail-open-on-unlistable outcome to DEC-CONS-05 | **Yes** | The DEC-CONS-05 attribution is gone from the fail-open clause. The replacement states the shipped behaviour correctly on both halves: `enumerateCorpus` is total, returning `{unlistable, detail}` rather than throwing (`pdlc/workflows/consolidate-learnings.js:1347-1354`), and the pass around it sets `state.status = "failed"` and returns through `finishPass` (`:588-594`). The REQ now names this feature's divergence explicitly and grounds it in `G-4 Fail-open, always` (`REQ:106+`, id confirmed at `REQ:118`) and `C-7 Fail-open unconditional and total` (`REQ:196`) — both cited ids exist and say what the sentence claims. This is the behavioural restatement the TE's v9 asked for, not a reference swap. |
| **v9 F-02 / Low / Process** — a round was dispatched over a zero-byte delta | **Yes (not recurring)** | This round's delta is non-empty; the observation was about round mechanics, not the document, and does not carry. |
| **v9 Q-01** — is the run-level mirror's value well-defined or unconstrained? | **Answered** | AC-3.2 now reads "a run-level mirror, if carried, is additive, is not the oracle, and has a deliberately unconstrained value that nothing asserts on" (`REQ:328`). Checked downstream for contradiction: the TSPEC carries no assertion over a run-level mirror (only `mirror` occurrence is an unrelated fixture name, `TSPEC:788`), so no completeness test can grow one over it. |

## Delta verification — each changed clause against HEAD

| Changed clause | Claim | Verdict at HEAD |
|---|---|---|
| §1.2 claim 2 (`REQ:71-75`) | `enumerateCorpus` is total; the pass marks itself `failed` and stops | **Holds.** `consolidate-learnings.js:1347-1354` (returns `{unlistable, detail}` when `!reply.ok`); `:588-594` (`state.status = "failed"`, comment pins "§10.3 row 1a … Never `no-op`"). |
| §1.2 claim 2, divergence clause | This feature fails open via `RSN-UNLISTABLE`, AC-3.2 | **Holds and is internally consistent.** `RSN-UNLISTABLE` is a corpus-level outcome member in AC-3.2 (`REQ:329-330`), and Group 4 continues the run on it (`REQ:352+`). |
| §1.2 claim 2, retained DEC-CONS-05 sentence (`REQ:79-80`) | "DEC-CONS-05 ships *one predicate, two enumerations*, and nothing in it claims readers agree on sets" | **Holds.** `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:54` and §7 at `:421-430`. The citation now sits only where the decision actually reaches. |
| AC-3.1 closure scoping (`REQ:317-321`) | Closure is over each selected document's row, not the dispatch record; AC-3.2/AC-3.3 material sits outside the set, each with its own completeness test | **Sound and non-contradictory.** AC-3.2 still declares three set-equality tests, one per catalogue (`REQ:333-335`), and AC-3.3's per-dispatch locus is unchanged (`REQ:336-341`). The three enumerations now partition rather than overlap, so no completeness test is written against a set another AC also claims — this removes the ambiguity, it does not weaken set-equality anywhere. |
| AC-3.2 mirror parenthetical (`REQ:328`) | Mirror value deliberately unconstrained, nothing asserts on it | **Holds**; see Q-01 disposition above. Reads as an explicit non-obligation, not as an absence-only oracle: the oracle remains the per-dispatch record, which AC-3.1/AC-3.2 assert positively. |
| AC-5.1b precedent (`REQ:388-390`) | `orchestrate-dev.js`'s `parseImplementationConfig` malformed section yields defaults plus an explicit operator notice | **Holds in substance.** `parseImplementationConfig` returns `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true}` on a non-object section (`orchestrate-dev.js:191-210`), and the wave-mode caller emits `Notice: the "implementation" section of … is not an object — using defaults for every implementation key.` (`:14128-14135`). One precision gap, filed Low below. |

No High finding from the engineering lens. Nothing the delta touched broke a clause that
worked before, and no changed clause contradicts HEAD.
