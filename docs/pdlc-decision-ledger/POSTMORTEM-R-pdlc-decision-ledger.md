# Post-Mortem: Phase R — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-decision-ledger.md` (v1.5, `a0cd343bc`) |
| Downstream | Phase R re-entry; FSPEC (blocked) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |
| Author | pm-author |
| Date | 2026-08-28 |

RESOLVED: no

## Phase

**R** — REQ authoring and review. The review loop exhausted `MAX_REVIEW_ROUNDS` without a
two-reviewer approving verdict on a single version of the document, so the phase halted and
this post-mortem was written in place of an approval.

## Iterations

**5 — limit reached.**

| Round | REQ version | software-engineer | test-engineer |
|---|---|---|---|
| 1 | v1.0 | Needs revision (3 High, 4 Medium, 2 Low) | Needs revision (5 High, 4 Medium, 2 Low) |
| 2 | v1.1 | Needs revision (1 High, 2 Medium, 1 Low) | Needs revision (1 High, 2 Medium, 1 Low) |
| 3 | v1.2 | Approved with minor changes (1 Medium) | Needs revision (1 High, 2 Medium, 1 Low) |
| 4 | v1.3 | Needs revision (1 High, 1 Medium, 1 Low) | Needs revision (1 High, 2 Medium, 1 Low) |
| 5 | v1.4 | Approved with minor changes (1 Medium, 1 Low) | Needs revision (1 High, 1 Medium, 1 Low) |

The two reviewers never approved the same version: SE approved v1.2 and v1.4, TE approved
neither. Round 5's revision (**v1.5**, `a0cd343bc`) is on the branch and addresses all five
round-5 findings, but the round budget was spent before any reviewer read it — v1.5 is
**unreviewed**, not approved.

## Reviewers

| Role | File series | Terminal verdict | Open at exhaustion |
|---|---|---|---|
| software-engineer | `CROSS-REVIEW-software-engineer-REQ-v{1..5}.md` | Approved with minor changes | F-01 Medium (second `DECISIONS-*.md` in a feature directory), F-02 Low (cross-file tie-break inert at HEAD) |
| test-engineer | `CROSS-REVIEW-test-engineer-REQ-v{1..5}.md` | Needs revision | F-23 High (`first record wins` selects the option-framing heading for `DEC-LOOP-01`…`06`), F-24 Medium (undefined `files in path order`), F-25 Low (feature leg's directory unpinned) |

Both reviewers were substantive and verified their claims against HEAD; no round contained a
finding that failed to reproduce, and every disposition table checked the prior round's fixes
rather than accepting them. This was not a reviewer-quality failure.

## Pattern of Disagreement

**One clause carried a blocking finding in every one of the five rounds.** The chain is
explicit in the reviewers' own disposition tables:

```
TE F-04 (r1) → F-12 (r2) → F-16 (r3) → F-20 (r4) → F-23 (r5)
SE F-01 (r1) → F-01 (r2) → F-01 (r4)
```

All of them sit on **§2 G-1's in-scope-set rule** and the criterion that depends on it,
**§5 REQ-DECLEDGER-01's set-equality check**. The question never changed: *which decision
records does the rendered index contain, derivable from the document alone?* Everything else
in the REQ converged — round 1's nine SE findings and eleven TE findings were resolved by
round 2 and never reopened; rounds 3–5 each closed every prior finding on the merits and
produced exactly one new High, always in the clause just rewritten.

The failure shape is therefore **a fix that mints the next round's finding**, not
disagreement over intent:

| Round | Clause added to G-1 | The finding it produced |
|---|---|---|
| 2 | per-decision unit | files under `docs/_decisions/` carrying no id had no stated outcome |
| 3 | carrier = heading *or* line-leading list item | the bullet exemplar (`DEC-AWG-Q1`) was false at HEAD |
| 4 | numeric `NUMBER`; `.consolidation-log.md` records nothing | the predicate admitted four list items in the file declared to record nothing (45 vs 41) |
| 5 | heading-only carrier; distinct id, **first** record wins | "first" selects `DEC-LOOP-01`'s option-framing heading, which decides nothing — the field contract and the key clause disagree |

Each round's rewrite was correct against the corpus the previous round cited and wrong against
a corpus feature the previous round had not needed to look at. The reviewers converged on
*severity* (round 5: one High, one Medium, one Low on both sides — the same shape as rounds 2
and 4) without converging on the clause.

## Best-Guess Root Cause

**The REQ is pinning a corpus-matching predicate at requirements altitude.** G-1 states the
in-scope set as a syntactic recognition rule over the repository's `DECISIONS-*.md` files —
carrier markup, id grammar, numeric segment, per-file and cross-file dedupe key, tie-break
ordering. That is a decision procedure over a live, growing corpus: exactly the class of
statement the pm-author altitude rule (5f) names as se-author's, and exactly the class whose
truth a reviewer with the source open can always contest with one more HEAD counterexample.
Five rounds produced five true counterexamples, each cheap to find and each requiring one more
clause. That is a loop, not a convergence, and the loop's length is bounded by the corpus's
irregularity, not by the reviewers' patience.

Two secondary causes made the loop run its full budget:

1. **The 5g split trigger did not fire.** The rule is: blocking findings in the same clause for
   two consecutive rounds stop in-place revision and become a split. That threshold was crossed
   at round 3 (TE F-12 → F-16 on G-1). Rounds 3, 4 and 5 were in-place revisions the authoring
   contract had already forbidden.
2. **AC-01 pins set equality, which forces the predicate into the REQ.** By requiring the
   rendered set to match an expected set derivable from the document alone, REQ-DECLEDGER-01
   makes the corpus predicate a REQ obligation. Every attempt to route recognition detail to
   TSPEC (O-1) then collided with AC-01's promise — TE F-21 is precisely that collision. The
   acceptance criterion and the altitude rule are in direct tension, and the criterion won five
   times.

## Recommendation

Address the items below on the branch, then set `RESOLVED: yes` in this file with a commit
message naming what addressed each one. Re-invoke with `forcePhases: "R"`.

**1. Stop revising G-1 in place — apply the 5g split (blocking).**
Remove the corpus-recognition rule from the REQ. Two workable forms, either acceptable:

  - **(a) Measure it out.** Relocate the in-scope set to `docs/_constraints/` as measured `M-*`
    facts (the 41 project-level ids, the per-feature counts, the twice-opened and second-file
    cases), taken once against a named commit, and have G-1 cite them by id. The REQ then states
    the *outcome* — the index contains every closed decision in scope, no citation unrenderable —
    and the predicate that produces it becomes TSPEC's.
  - **(b) Split the clause.** Give the membership rule its own REQ with a `depends-on` edge from
    this one and its own `docs/_queue/QUEUE.md` row, per the REQ Size Budget steps 2–3.

  Record the disposition of TE F-23/F-24/F-25 and SE F-01/F-02 as **routed** under whichever
  form is chosen, rather than as five more in-place clauses.

**2. Reconcile AC-01 with the split (blocking).**
REQ-DECLEDGER-01's set-equality check cannot survive step 1 as written — it is what forces the
predicate back into the REQ. Restate it against the relocated `M-*` facts (form (a)) or move it
to the child REQ (form (b)). Do not leave both the routing sentence in O-1 and the set-equality
promise in AC-01: that contradiction is TE F-21's, and it was closed by narrowing the carrier
rather than by deciding, so it will re-open the moment the carrier moves again.

**3. Decide v1.5's already-landed edits, don't re-litigate them.**
v1.5 (`a0cd343bc`) already resolves the round-5 finding set: last-record-wins (TE F-23),
`docs/_decisions/` precedence over feature records (TE F-24), the feature-directory glob and
the re-taken `41 + 22 = 63` floor with `maxEntries` 70 (SE F-01), plus the two Lows. Those edits
are sound and reviewers should not be asked to re-derive them — but under step 1 most of them
belong in the constraints file or the child REQ, not in G-1. Move them; do not delete the
measurements.

**4. Re-take `maxEntries` after the move.**
The floor has moved twice under revision (40 → 55 → 63) because the in-scope set moved. Once
step 1 fixes the set, take the floor once against a named commit and cite it — a budget derived
from a definition still under revision was never going to hold.

**Not blocking, carry forward:** SE F-02 (the cross-file tie-break has no HEAD instance) is a
genuine coverage gap for PROPERTIES, not a REQ defect — record it as a synthetic-fixture
obligation for te-author rather than fixing it in the REQ.
