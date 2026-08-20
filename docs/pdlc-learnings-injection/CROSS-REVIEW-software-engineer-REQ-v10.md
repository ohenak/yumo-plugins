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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | *(delta, local — non-gating.)* AC-5.1b attributes the notice to the parser: "the same response `orchestrate-dev.js`'s `parseImplementationConfig` ships, whose malformed section yields defaults plus an explicit operator notice" (`REQ:388-390`). The parser ships only the *flag*: it returns `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: []}` and emits nothing (`pdlc/workflows/orchestrate-dev.js:191-210`). The notice is emitted by one caller, on the wave-mode path (`:14130-14135`); the other call site drops the flag and emits nothing (`:11913`, `parseImplementationConfig(implRaw).config`). The AC's *decision* — fail open on defaults, with a catalogued notice — is unaffected and remains implementable; only the precedent sentence over-attributes. **Fix (not owed this round):** say "the reader-plus-caller path around `parseImplementationConfig` ships this response — defaults from the parser, the notice from its caller", or drop the "whose …" clause. | AC-5.1b (`REQ:388-390`) |

DEFERRED: §1.2's "byte order over the document path, as the shipped corpus enumeration already does (DEC-CONS-05)" (`REQ:285`) — the ordering fact is true of `git ls-files` output, but DEC-CONS-05 decides evidence form for the predicate, not ordering; inherited, nonlocal, untouched by this delta.
DEFERRED: O-2's ordering key is still unbound (`REQ:286-288`); FSPEC/TSPEC authoring must bind it before AC-2.2 is fully testable, as the REQ itself already flags.

## Questions

| ID | Question |
|----|---------|
| — | None. Q-01 from v9 is answered by AC-3.2's parenthetical and is closed. |

## Positive Observations

- The erratum did exactly the repair the TE's v9 High named: it separates `enumerateCorpus`'s
  totality from the pass's `failed` policy — two different facts the prior text had collapsed —
  and then owns this feature's divergence as a decision of its own rather than borrowing a
  sibling precedent that pointed the other way.
- The AC-3.1/AC-3.2/AC-3.3 partition is now explicit. A completeness-test author can read
  three disjoint enumerations with three set-equality obligations off the page without
  inferring which record each closure covers.
- The document stays at REQ altitude throughout the delta: every added sentence states an
  observable outcome or names a shipped behaviour with a citation; none of them specifies a
  seam signature, an algorithm, or an internal string.

## Recommendation

**Approved with minor changes**

The delta resolves my v9 F-01 and answers Q-01, introduces no defect, and contradicts nothing
at HEAD. No High findings from the engineering lens across three consecutive rounds. F-01 is a
Low attribution imprecision in a precedent clause; it does not gate and can ride along with any
later edit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
APPROVAL-HASH-NORMALIZED: sha256:6a9544d4bbf0f0c09fbb863337f8cb41c5afec98138a76c47a7b40216bf5a958
REVIEWED-COMMIT: a2353445280c5f08b8938da272ba4e42ec9becb9
