# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-merge-phase/PROPERTIES-pdlc-merge-phase.md` (v1.1, commit `1c3daab`)
**Previous review:** `CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` (v1.0, Needs revision)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Delta re-review only — whether each round-1 finding is closed and whether the revision
broke anything. I recomputed §2's derivation table and PROP-M-03's construction independently rather
than reading the sums, and re-checked the new PROP-M-21 against TSPEC §5.3/§5.4 and FSPEC §5.
Unchanged properties already reviewed are not re-litigated; test-pyramid and product framing stay
outside my lens.

## Disposition of round-1 findings

| ID | Sev (v1) | Disposition | Evidence in v1.1 |
|----|----------|-------------|------------------|
| F-01 | High | **Resolved — arithmetic verified independently** | `D_core` is now a reachability-pruned enumeration with a derivation table and one asserted number. I recomputed every level from the leaves up and it is exact: `36 = 16 + 20`, `37 = 1 + 36`, `39 = 2 + 37`, `65 = 1 + 22 + 3 + 39`, `209 = (1+1+2+2+1+7) + 3×65 = 14 + 195`, `419 = 1 + 2×209`. Two sub-derivations I checked rather than trusted: the CI level's `3 + 7 = 10` is exactly the `(ci ∈ 5) × (mergeRequiresCi ∈ 2)` split with `(passed,·)` and `(none,false)` passing; and the candidate block's **36** is `Σ(L+1)` over the capability triples — squash-off gives `(1+2+2+3) × 2 = 16` (the squash capability bit being irrelevant, hence the doubling) and squash-on gives `1+2+2+2+3+3+3+4 = 20`. The `≤ 5 000 runs / ≤ 50 000 calls` budget with ~2 300 / ~20 000 actual is comfortably inside a jest suite, and the ≤ 2 000 integration budget holds too (§7's rows sum to ~1 532) |
| F-02 | Medium | **Resolved, twice** | `mergeRequiresCi` now enters `D_core` at the CI level (it is what makes the `3 + 7` split exist), **and** PROP-M-21 gives §5.4's rule its own exhaustive 5 × 2 sub-domain. The preemption trap I raised is explicitly closed: the fixture keeps `O5` clear so TSPEC §5.3 guard 7 cannot resolve before guard 11, and the expected column is transcribed from FSPEC §5 rather than read from the code. The differential conjunct — deep-equal under both settings for every `ci ≠ "none"` — is what actually kills the target mutant: a rule widened to `ci === "none" \|\| ci === "pending"` reds at `(pending, false)`. §8.4 now names M-21, not M-03, as that target's killer |
| F-03 | Medium | **Resolved as prescribed** | §1.2's new paragraph makes `ROW_IDS` a test-local frozen transcription of FSPEC §11, self-checked by `length === 25` and by cross-check against the row ids each expected-value table already names, and states outright that it must **not** become a production export because a catalogue-sourced membership oracle passes vacuously under the row-id mutation. `MERGE_STATUSES` remains module-sourced, which is correct — it is not the thing the mutation moves |
| F-04 | Medium | **Resolved** | PROP-M-16 gains the two §2.5 non-overwrite overlays (32 → **34**, both `merged`, queue byte-unchanged with the status-naming note), and PROP-M-19's domain adds the malformed-`merge`-section and unresolvable-`prNumber` fixtures — 34 + 29 + 2 = **65**. I re-walked TSPEC §10.2's seven notes against the enlarged domain and all seven are now producible: deferred (M-17's refused/deferred rows), ahead-of-remote (M-16 empty subset), M2 deletion failure and `recorded (uncommitted)` (M-16 subsets), §2.5 non-overwrite (the overlays), missing-`prNumber` and malformed-section (the named fixtures). The `AHEAD_OF_REMOTE_NOTE` vs `MERGE_NOTES` naming drift is named honestly and routed to task A7 rather than assumed away |
| F-05 | Low | **Resolved** | PROP-M-06 is **1 080** with the axes stated as crossed; PROP-M-19 is **65**; PROP-M-16 is **34**. §7's matrix agrees with each property's own text |
| F-06 | Low | **Resolved** | §2's preamble states the step loop is harness code re-driving the exported `decideMerge`, and routes the production throw to PROP-M-20 and TSPEC §12 **E21** — which is the right id: §12's row for "anything in `phaseMerge` throws → `refused`, `row: "internal"`, no halt" is E21 (`TSPEC:1308`). (TSPEC §2.4's prose calls the same case "E30 only" — a stale reference on the TSPEC's side, not this document's; worth a one-word fix there some time, and no reason to hold this review) |
| F-07 | Low | **Resolved** | `seeded` / `resolveSeed` are **imported** from `helpers/driftGenerators.js`, never re-declared, and the self-test sits at `__tests__/mergeDoubles.test.js` because jest's `testPathIgnorePatterns` skips `/__tests__/helpers/`. PLAN v1.2 carries both (batch-1 F1 row and §12's task body), so the routing is real rather than promised |
| Q-01, Q-02 | — | Answered | §2 chose the pruned enumeration and says why unreachability is proved by construction; §1.2 answers Q-02 in the direction I recommended |

**PROP-M-03's 602 is coherent.** The 120 base cases are `20 × 3 × 2`, and the **20** is not asserted
on faith: row 18 is the first-success family of the candidate block, which is `Σ L` over the
capability triples — `(0+1+1+2) × 2 = 8` squash-off plus `0+1+1+1+2+2+2+3 = 12` squash-on — exactly
20, and it is the same block whose `Σ(L+1) = 36` feeds the 419 total, so the two derivations are
mutually consistent rather than independently asserted. `120 × 5 + 2 = 602` matches §7. The five
degradation targets still land on TSPEC §5.3 guards 4, 11, 17, 8 and 20 (rows 8 / 11 / 13a / 5 / 15),
and the row-18 base excludes the retry sweep correctly — the 11-value `mergeableRetries` axis lives
only on the `UNKNOWN` sub-path, so it does not multiply into this domain.

## New findings

None blocking. Two cosmetic inconsistencies, both in prose rather than in an asserted count, offered
for the next edit of any file that touches these lines:

1. §2's cost line counts **`M-21 20`** while PROP-M-21's own domain and §7's matrix both say
   **`enum(10)`**. The asserted number is the consistent one (10 in two places); the budget line is
   the outlier, and the budget conclusion is unaffected either way (~2 300 runs).
2. PROP-M-03's bullet says "plus the **two** exception cases below" while the following bullet is
   headed "The **one** declared exception". The count 602 = 600 + 2 is right if the exception is
   asserted under both modes; say so, since §1.2 rule 2 makes the total an assertion.

## Positive Observations

- The revision fixed F-01 by **changing the construction**, not by re-labelling the number: a
  guard-walk generator whose every case is a distinct decision path is a better artefact than either
  v1.0 reading, and "unreachability proved by construction" is now true instead of aspirational.
- PROP-M-21 is the right shape for a rule this small — exhaustive, spec-transcribed expectations, and
  a differential that names the mutant it kills. It also fixed the *attribution* in §8.4, which is
  the part that would have quietly mattered at DoD.
- F-03 was resolved in the harder direction (keep the oracle independent) rather than the easier one
  (add the export), and the reasoning is recorded so a future reader does not "helpfully" reverse it.
- The disposition table in §9 states each fix in terms of what changed rather than asserting closure,
  which is what made this delta cheap to verify.

## Recommendation

**Approved** — every round-1 finding is closed, the new derivation checks out arithmetically at every
level, PROP-M-03's construction is internally consistent with the same candidate-block algebra that
produces 419, and nothing in the delta disturbs a property I already approved. The two cosmetic notes
above need no further round.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 0}
