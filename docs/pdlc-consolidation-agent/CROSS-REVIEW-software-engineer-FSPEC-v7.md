# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v7.0)
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `26c9e15` (the commit at which my v6 was written); diff
`26c9e15..HEAD` — 50 insertions, 18 deletions across 6 FSPEC commits. Only the changed sections were
re-read for new issues.

## Prior findings — disposition

All five v6 findings and all three v6 questions were re-checked against the revision and, where they
made a claim about HEAD, against the code. **All eight are closed as filed.** This is the sixth
consecutive round in which every prior item was addressed rather than argued with, and the first in
which the repairs did not manufacture a Medium in the text they rewrote.

| v6 | Verdict | Evidence |
|---|---|---|
| F-01 (Medium) — AT-F21's stated falsifier for the middle prohibited behaviour was inverted, and the fixture never pinned `E`'s `action` | **Resolved as filed, on all three points.** The Given now gives `E` **`action: retire`** missing `route` and has the later pass derive a **`retire`** proposal for the same pair, so §6.4's carrier is actually consulted rather than the conjunct being vacuous (`:2060`). The unsafe default is restated as a **non-`degraded`** one (`route ?? "constraints"`, or any value outside `degraded`), and the conjunct mapping is now spelled explicitly and asymmetrically: halt ⇒ (1), non-`degraded` default ⇒ (3), silent rewrite ⇒ (4), and `route ?? "degraded"` is named as the **fourth reachable default that is not unsafe on either reader** and caught by (2) alone. I re-derived all four against the predicates: BR-33c (`:2454`) closes `E` on a `retire` with `route` other than `degraded`, and BR-25 reads the pair `enacted` on the same condition — so (3) is red on exactly that default and green on `degraded`, which is what the row now says |
| F-02 (Medium) — §8.1's reader table declared itself the enumeration and omitted §8.6, which the paragraph directly beneath it names | **Resolved as filed, and the arm is not §5.1's.** The table gains a **§8.6 remediation routing** row (`:1142`) whose arm is argued from the differing state — a remediation has already been *chosen* by §8.5 and has nowhere to go, so it is not routed on a guessed path and is re-proposed later — which is the distinction I said was not obvious. The lead is now an explicit set-equality claim naming all seven readers (`:1134-1137`), and E-12b's field list reads `target` for **`§5.1 / §8.6`** (`:2507`) |
| F-03 (Medium) — O-C8's subject-axis compensation was obliged by no rule and asserted by no test | **Resolved by the repair I recommended first, not by withdrawing the claim.** §10.4 item 4 is widened (`:1774-1781`): any promotion whose merge invoked the subject tie-break names, beside the surviving `artifact`, **every** canonical subject path the tie-break elided — with the reason stated (the id is one, BR-35a runs on the survivor, §8.3 carries the survivor). O-C8 (`:2128`) is rewritten to point at that obligation and **explicitly withdraws** the `symptom` claim ("It is not carried by the merged `symptom`, which §8.1 pins as one non-keying line"). BR-33b carries it (`:2453`), and AT-R6b fixture 2 gains the conjunct naming the literal elided path `pdlc/skills/a/b.md` |
| F-04 (Low) — §6.5's closed-read-set paragraph was scoped to no domain and its `gh pr list` example contradicted the PR seam's obliged `read-pr` | **Resolved as filed.** `:937-943` now opens "**On the two git rows** …", states the scope in its own sentence, names `read-pr` as the PR seam's obliged verb resolving a `gh pr list`, and swaps the third example for `git show` |
| F-05 (Low) — the tie-break's key word "normalised" was §8.1's word for the transform that makes its candidates identical | **Resolved as filed, with the parenthetical I asked for.** `:1281-1285` now says "byte order over the **canonical** root-relative paths of §8.1, i.e. each candidate's `artifact` value **as written**, before any slug substitution", and names the collision explicitly |
| Q-01 — is the precedence rule scoped to one `action`? | **Answered in the document, in the direction I flagged.** `:1232-1235`: the precedence rule is scoped to one `action` because the merge is; a `promote` and a `revise` over one subject at one phase are two keys, no merge fires, and **both writes happen — including a guard-set one**; consequence 2 is therefore an absolute about *merged* records only |
| Q-02 — does AT-F21 reuse AT-F19's computation or its fixture? | **Answered: its own fixture, its own set-equality.** The conjunct now reads "asserted as a set-equality over this fixture's ids in AT-F19's form, not as containment" — the stronger of the two readings. What the fixture does not yet pin is the *expected set* itself; filed as L-03 below, not as a reopening |
| Q-03 — is `unavailable` a literal or prose? | **Answered, and settled the layer question rather than inventing a literal.** `:1146`: the cell "carries **no path** and is rendered as an explicit unavailable statement rather than as an empty cell or a guessed path (§10.4's receive-side totality, DC-01)", and "'Unavailable' is the **observable**, not a literal this document pins — the spelling of that cell is TSPEC's, per DEC-LAYER-01, and §15.2's lexicon owns no such value." Both cited authorities exist and say what is claimed: `docs/_constraints/DOMAIN-CONSTRAINTS.md:20` (DC-01, closed and total across a component boundary) and `docs/_decisions/DECISIONS-spec-layer-boundary.md:10` |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
