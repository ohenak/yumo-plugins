# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v3.0)
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `a7db1b9` (the commit `CROSS-REVIEW-software-engineer-FSPEC-v2.md` reviewed); diff `a7db1b9..HEAD` — 229 insertions, 77 deletions across 12 commits. Only the changed sections were re-read for new issues.

## Prior findings — disposition

Every v2 finding was re-checked against the revision and, where it made a claim about HEAD, against
the code. **All eight are closed as filed.** Two of the repairs, however, introduce new checkable
defects in the sections they rewrote; those are filed below on their own merits, not as reopenings.

| v2 | Verdict | Evidence |
|---|---|---|
| F-01 (High) — the `orchestrate-dev.js` edit was in neither of the two places §2.6 said it was | **Resolved** | §15.3 now carries the row for `pdlc/workflows/orchestrate-dev.js` (naming `:1833`, `:1797`, `:1841`, `:1844-1849`) **and** a second row for the `pdlc/workflows/dist/orchestrate-dev.bundle.js` / `orchestrate-queue.bundle.js` rebuild "in the same commit". Both bundle claims verified: `bundles` at `build-runtime.mjs:448-466` joins `devModule` into *both* artifacts (`[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY]` and `[DEV_META, BANNER, adapter, devModule, queueModule, DEV_ENTRY]`). T-05 now constrains the widening — optional, defaulting to `ADVISORY_RUNG_SKILL`, every call site unchanged, exactly one ladder — and AT-M10 is its regression test. §15.3's closing paragraph separates NFR-1 (a **run-time** prohibition on the pass) from the feature's own delivery diff, which is the right distinction and was worth writing down |
| F-02 (High) — AT-Q7's set-equality was red on a conforming pass | **Resolved as filed** | §6.5 now enumerates two seam domains with a set-equality on each; AT-Q7's Given puts each domain behind its own spy and classifies by resolved verb rather than by function name, which keeps the generic-seam coverage the oracle existed for. AT-Q7's own Given ("a pass that opens a PR") makes both equalities satisfiable. The *rule* that generalises it does not carry that scope — filed as F-04 |
| F-03 (High) — `{topic}` contradicted the continuity it claimed | **Resolved as filed** | The basename derivation is withdrawn, `{topic} = failure-mode-id` entire, the convention change is declared with three named consequences, `SKILL.md:41` is added to §15.3, and property row 1's false rationale is replaced by an explicit disclaimer that path stability buys the carrier nothing. Verified at HEAD: 15 skill directories under `pdlc/skills/`; the three decision files are `DECISIONS-plugin-distribution.md`, `DECISIONS-review-severity-bars.md`, `DECISIONS-test-oracle-mechanics.md`; `SKILL.md:41` is the `DECISIONS-{topic}.md` route line. The new derivation is well-formed but is not well-defined over the field it reads — filed as F-01 |
| F-04 (Medium) — the log record did not carry `action` | **Resolved** | §8.1's table is now **seven** fields — `passId`, `action`, `route` added — and the section declares itself **normative for the record's shape**, with §8.2's keying tuple demoted to "a key over these fields, never a second field list". §6.4, §8.4 step 1 and §10.2 order 2 all now point at §8.1. This is the right fix and it is stated in the one place that removes the ambiguity |
| F-05 (Medium) — `enacted` suppressed a promotion that only reached a proposal file | **Resolved** | `enacted` is now conditioned on `route != degraded`; §6.4 argues the conditioning explicitly against the PR route's `closed`-unmerged rule; BR-25 restates the substantive invariant ("a proposal that reached nothing is re-proposable; one that landed is not"); AT-Q12 constructs the degraded record and asserts the re-proposal, and AT-Q10 / AT-Q11 give the `enacted` and `absent` arms. AT-Q11's byte-identity assertion on the second run is the strongest oracle added this round |
| F-06 (Medium) — "open" ranged over an undefined `retired` state | **Resolved** | Step 1 now computes openness from the log alone: open ⇔ no record for that id carries `action: retire` with `route != degraded`. The §8.3 relationship is stated ("openness never filters it"), and the recall limit — a `retire` sitting on an unmerged PR is not observable from the log — is named with its failure direction (one extra question, never a missed one) |
| F-07 (Medium) — §10.3's `credential:` disambiguation was not total | **Resolved as filed** | The status-keyed table is explicitly withdrawn with its counterexamples named, and the reading is re-keyed on the co-occurrence of `credential-unavailable`. AT-K6's Given is widened from two rows to five and BR-41a / E-20b are re-worded to match. The biconditional the new table rests on has one unreachable-by-construction arm that is in fact reachable — filed as F-03 |
| F-08 (Low) — the empty-`reason:` precedent did not exist | **Resolved** | §2.6 withdraws the `skipped-cadence` precedent in terms ("a precedent for nothing about a row's fields") and re-grounds the claim on §10.3's own cardinality rule |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
