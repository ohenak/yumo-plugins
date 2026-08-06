# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v7.0)
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`). Baseline for the diff is `87a6cb7` — the commit
v6 was written against; the revision is six commits, `92740b1`…`27eeab1`, +50/−18 lines. Prior
findings L-01, L-02, L-03 are verified for disposition; new observations are drawn **only** from
changed text.

## Prior findings — disposition

All three v6 findings are **resolved**, and both v6 questions are answered in the document. Each was
checked against the revised text and, where it made a claim about this repository, against HEAD.

| v6 ID | Sev | Disposition | Evidence in v7.0 |
|----|---|---|---|
| L-01 | Low | **Resolved**, in the form the finding asked for | The parenthetical "(and, on a kind-3 merge, the `target` with it)" is gone from §8.2's third note (`:1296-1307`) and from AT-R6b's fixture-2 text. Both now say what the fixture can actually assert — the `artifact` half — and both name the kind-3 case as PROPERTIES-owned: "that fixture is kind 2 on both sides, where `target` is a function of the id and the id is invariant under the tie-break … the clause's own motivating case — a colliding-subject merge of **two process learnings**, where precedence returns kind 3 — has no fixture here and is named **PROPERTIES-owned per DEC-LAYER-01**". Better than a deletion: the note also states the observable the deferred owner owes ("`artifact` and `target` are the same path on the merged record"), so the PROPERTIES author inherits an oracle, not a gap |
| L-02 | Low | **Resolved** | E-12b's AT cell (`:2504`) is split exactly as asked: "**AT-F21** for the `route` and `target` arms. The `artifact` arms (§8.3's row emitted with an unavailable path rather than dropped, §8.5's refusal to guess a `retirement`) have **no fixture at this layer** and are named PROPERTIES-owned per DEC-LAYER-01 — the rule and its observables are stated in §8.1's reader table; the fixture that pins them is not claimed here". The row no longer reads as if all three indexed fields were covered, and it names both wrong outcomes the deferred fixtures must kill |
| L-03 | Low | **Resolved for `F`'s existence, and this is where my new Medium sits** | AT-F21's conjunct (3) is rewritten as "the positive downstream state, asserted for **both** short records", and `F` now has its own arm. The asymmetry the finding named is gone. But the arm it gained turns on two fields of `F`'s record that the Given still does not fix, and reads against the Given's own new clause — see M-01 below. The finding is closed; what replaced it is a different defect, filed on its own merits |
| Q-01 | — | **Answered, in the row** | AT-R6b's Given now opens "**five fixtures — five separate passes over five separate logs**" and spells why the single-pass reading is wrong: "Fixtures 3, 4 and 5 share one subject and one phase and so derive one id; they are not one pass, and building them as one would collide all three merges onto a single record and make the per-fixture assertions below unstateable" (`:2032`). That is the answer plus its reason |
| Q-02 | — | **Answered, closed** | §6.5 (`:937-946`) now separates the two questions I conflated: the closed set is scoped to the **git** rows ("The PR seam has its own read verb, `read-pr`, in its **obliged** column … a `gh pr list` resolves there and is not an example of the class excluded here" — verified against the table, `read-pr` is in the PR seam's obliged column at `:916`), and ownership is stated: "'Made here' is a statement about which layer owns the **decision** … under DEC-LAYER-01 the seam verb permitted-sets are TSPEC's to transcribe and, with a recorded reason, to widen — this table is the frozen statement TSPEC inherits". The third-verb example list was corrected to git verbs (`git log`, `git diff`, `git show`), which is the repair the scoping required |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
