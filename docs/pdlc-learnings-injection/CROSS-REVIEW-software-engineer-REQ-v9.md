# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.8)
**Date:** 2026-08-19
**Iteration:** 9 (delta confirmation over commit `386e4f0c`)

## Scope of this round

**This round has an empty delta.** The REQ is byte-identical to the revision I reviewed
in iteration 8:

```
$ git diff 386e4f0c HEAD -- docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
(no output)
$ git status --porcelain docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
(no output)
```

`386e4f0c` is still the tip commit touching this document, and there are no uncommitted
edits in the tree. Iteration 9 was dispatched after the test-engineer's v8 blocked the
document (`CROSS-REVIEW-test-engineer-REQ-v8.md`, `VERDICT: Needs revision`,
`{"high": 1, ...}`), but no erratum landed between that verdict and this dispatch.

Per the delta re-review protocol there is therefore nothing new to scan: no changed
section can have introduced a defect, and no previously-open finding can have been
resolved by an edit that does not exist. What this round can honestly do is re-verify my
one carried finding against HEAD source rather than against my own prior write-up, which
I did. Everything else from v8 stands unchanged and is not re-litigated here.

## Carried findings — disposition

| v8 finding | Resolved? | Evidence |
|---|---|---|
| **F-01 / Medium / Cross-Feature** — §1.2 claim 2 attributes a fail-open-on-unlistable outcome to DEC-CONS-05 | **No** | Text unchanged (`REQ:71`). Re-verified both halves against HEAD this round, not against my v8 note — both still fail. Carried forward below as F-01. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | *(carried unchanged from v8 F-01; re-verified against HEAD this round.)* §1.2 claim 2 says the shipped enumeration comes "with a fail-open outcome when the listing itself fails (DECISIONS-pdlc-consolidation-agent § DEC-CONS-05)" (`REQ:71`). Both halves fail verification. **(a) The citation points elsewhere.** DEC-CONS-05 decides "Two corpus enumerations pinned literally on each side; only the **predicate** held equal under a differential test" (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:54`, expanded at `:422-426`) — it decides *evidence form* for a two-implementation corpus predicate, and says nothing about listing failure. **(b) The shipped code is fail-closed, not fail-open.** On `corpusReply.unlistable` the pass logs the pathspec and stderr, sets `state.status = "failed"` and returns through `finishPass`; the comment there pins "§10.3 row 1a — `failed`, NO reason code … Never `no-op`" (`pdlc/workflows/consolidate-learnings.js:588-594`). Only `enumerateCorpus` itself is total — it returns `{unlistable, detail}` instead of throwing (`:1347-1354`) — but that is totality of a helper, not a fail-open *policy*; the pass-level policy above it halts the pass. This REQ's own choice is genuinely fail-open (AC-3.2 records `RSN-UNLISTABLE` as a corpus-level outcome, `REQ:325`, and AC-6.x continues the run, `REQ:356`), so **the AC set is unaffected and this does not gate**. The defect is that the premise section justifies that choice with a precedent pointing the opposite way. Same defect class as the AC-5.1b sibling-precedent error corrected in v8, and it will mislead the TSPEC/PROPERTIES author who reaches for the sibling to pin the behaviour. **Fix:** drop the DEC-CONS-05 citation from the fail-open clause and state the divergence plainly — the shipped pass marks itself `failed` on an unlistable corpus; this feature deliberately does not, because a failed listing must not halt an authoring dispatch (G-6, C-3) — or record the fail-open decision as a DECISIONS entry of this feature's own. | §1.2 claim 2 (`REQ:71`); AC-3.2 (`REQ:325`) |
| F-02 | Low | Process | A review round was dispatched over a zero-byte delta. TE v8 returned `Needs revision` on `386e4f0c`, and iteration 9 re-dispatched both reviewers against that same commit with no intervening author edit. A delta-confirmation round over an empty diff cannot change any reviewer's verdict — it can only re-emit the prior one — so it spends a full parallel fan-out to restate what the v8 files already record. Anchor is runtime-observed (the empty `git diff` above), which is why this is filed as `Process`/Low rather than against any document line. **Fix belongs in the workflow, not this REQ:** before dispatching a re-review round, require the document's tip commit to differ from the commit the previous round reviewed, and halt or skip the round when it does not. | Round mechanics (no document anchor) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried from v8, still unanswered.)* AC-3.2 permits a run-level mirror of the corpus outcome as "additive, not the oracle". Under a divergent corpus, is the mirror's value expected to be well-defined (e.g. last-write-wins, as the TSPEC currently builds it), or is the REQ deliberately leaving it unconstrained because nothing may assert on it? Either answer is fine at REQ altitude; naming which one prevents a completeness test from growing an assertion over it later. |

## Positive Observations

- The v8 erratum's substance holds up on a second, independent pass at the source: the
  per-dispatch corpus locus in AC-3.2/AC-3.3, the "additive, not the oracle" qualifier on
  the run-level mirror, and AC-1.2's naming of the CR optimizer as the hardest fixture all
  still read as implementable without re-deriving anything from `orchestrate-dev.js`.
- The document remains free of High findings from the engineering lens across two
  consecutive rounds. The one carried item is a rationale mis-citation, not an AC defect —
  the acceptance surface a TSPEC author builds against is sound.

## Recommendation

**Approved with minor changes**

Empty delta: nothing was edited since iteration 8, so nothing new could be introduced and
nothing carried could be resolved. My v8 assessment stands verbatim. No High findings from
the engineering lens. F-01 is a Medium mis-citation in a premise section that does not gate
approval, but it should be corrected before the TSPEC author cites the sibling as precedent
for fail-open behaviour.

Note for the orchestrator: this document is not blocked by *this* review. It is blocked by
the test-engineer's v8 High, which remains unaddressed because no erratum landed. The next
round needs an author edit before another reviewer fan-out is worth spending (F-02).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
