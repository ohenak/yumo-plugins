# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v5.0)
**Date:** 2026-08-06
**Iteration:** 5
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `d0ee225` (the commit v4 was
written against); the revision is six commits, `d07ead6`…`7ad57c9`, +122/−33 lines. Prior finding
H-06 and questions Q-01…Q-03 are verified for disposition; new findings are drawn **only** from
changed sections. Product framing, architecture choice and prose style remain out of scope.

## Prior findings — disposition

The single v4 finding is **resolved**, and all three v4 questions are answered in the document. Each
was checked against the revised text and, where it made a claim about this repository, against HEAD.

| v4 ID | Sev | Disposition | Evidence in v5 |
|----|---|---|---|
| H-06 | Medium | **Resolved**, in the form the finding asked for | §13.7 gains **AT-F19**, and it is the row I specified rather than a weaker cousin. Its Given is a constructed `.consolidation-log.md` spanning all four arms of §8.4 step 1's predicate in one run — id `A` `retire` at `route: constraints`, id `B` `retire` at `route: degraded`, id `C` `promote`-only, id `D` `revise`-only — and its Then is a **set-equality** against the literal `{B, C, D}`, with the reason set-equality is load-bearing stated in the row ("an implementation returning every id ever recorded satisfies containment, and that degenerate list is the *limit* O-C7 accepts, never the implementation"). Both directions are named to a specific defect: `A` absent pins the `route != degraded` conjunct, `B` present pins that a `degraded` retirement does not close an id. The expected value is transcribed from §8.4, not derived from anything. Traceability landed too: §15.1's AC-5.2 row now reads `…, AT-F16, AT-F19 (§8.4 step 1's open-promotion list, set-equal over all four arms)`, and the rule got its own home as **BR-33c**, which restates the predicate and closes with "The computed list is exactly that set — not a superset" |
| Q-01 | — | **Answered, and the answer is an AT** | I asked whether the eight-field record wanted a field-set-equality row or whether it was TSPEC's. §13.7 gains **AT-F20**: one pass writing records on each of the three §5.2 kinds plus one `degraded` record, asserting each record's field-name set is set-equal to §8.1's eight names, with the serialisation explicitly left to §14.1 T-01. Verified the eight against §8.1's table at `FSPEC:1060-1095`: `failure-mode-id`, `phase`, `symptom`, `artifact`, `target`, `passId`, `action`, `route` — the AT's list and the table's are the same set. It is listed on AC-5.1 and on BR-33/BR-33a |
| Q-02 | — | **Answered**, with the mechanism named rather than asserted around | I asked whether S-11 and S-11b reach "step 11 never ran" by one path or two. AT-M4's row now says: the same path — "§10.2 order 3's 'step 11 never ran' — and not by two arms: step 8 is one step, and every way of leaving it early leaves it before step 11" — and then adds the absent-table conjunct to AT-M4 **anyway**, with the reason ("the two Givens differ … and an implementation could special-case one"). That is the right resolution of a "which is it" question: answer it, and still pin both Givens |
| Q-03 | — | **Answered** | AT-Q7c's Given is now pinned to a pass that terminates **`promoted`** (§12.1 S-02) with the §5.4 commit made, and the row states why in its own text: "a pass that promotes nothing observes `∅` everywhere and would satisfy a containment-only reading vacuously, leaving the row with nothing to falsify." The invoking-tree conjunct is now two-sided — contains `{add, commit}`, contained in `{add, commit, read-branch, read-status}` — which is what the §6.5 read-verb change made necessary |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
