# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v4.0)
**Date:** 2026-08-06
**Iteration:** 4
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `15f1ef0` (the commit `CROSS-REVIEW-software-engineer-FSPEC-v3.md` reviewed); diff `15f1ef0..HEAD` — 217 insertions, 118 deletions across 10 commits. Only the changed sections were re-read for new issues.

## Prior findings — disposition

Every v3 finding was re-checked against the revision and, where it made a claim about HEAD, against
the code. **All six are closed as filed.** As in the previous two rounds, two of the repairs create
new checkable defects in the sections they rewrote; those are filed below on their own merits, not as
reopenings.

| v3 | Verdict | Evidence |
|---|---|---|
| F-01 (High) — `{topic}` was circular and §5.2's worked example routed to the PR route under §5.1's own predicate | **Resolved, and by the harder path.** §8.1 is now an **eight**-field record: `artifact` is the failure mode's *subject* and a new `target` is "the one canonical repository path this promotion's write touches", the only field §5.1 routes on. §5.1's lead sentence, §5.2's table header, §8.2's opening, §8.5 rows 3–4, §8.6, BR-18, BR-33, BR-35a, AT-R6b, AT-F17, AT-F18 and the §15.1 rows for AC-5.1 / NFR-1 all moved to the split in the same round. The three consequences are stated where a future editor will read them (§8.1: the derivation terminates; an AC-2.2 promotion never routes to the PR route; AC-2.1 promotions stay distinct because each keys on its own subject) — including the AC-2.1 consequence I asked to be checked, which is answered rather than deferred. §5.1's new paragraph ("a guard-set subject does not imply the PR route") and §5.1 row 4 together make the predicate total over all three §5.2 kinds. `MERGE_GUARD_DEFAULTS` re-verified at `orchestrate-dev.js:48-53` |
| F-02 (Medium) — the `credential:` biconditional was falsified by S-11c | **Resolved as filed.** §10.3 now carries **three** readings, not two, and the third — `failed` without the code — is named as a **loss of row-level decidability** rather than asserted away; §7.3 item 1 is scoped ("when the pass's terminal status admits that code"); §12.1 S-11c, BR-41a, E-20b and E-20c all moved with it; AT-K6 grows from five rows to six, and rows (iv)/(v) are the pair the row now exists for, discriminated in the report body (§10.4 item 4, whose receive-side-totality rule at `:1626-1628` makes the rendering present on a `failed` pass too). ER-4 routes the enumeration gap upstream, and its argument is exact: I verified `credential-unavailable` / `repository-unresolved` / `api-failure` / `branch-exists` all carry `promoted-degraded`, `no-op` only (`pdlc-consolidation-vocabularies.md:49-52`) while §1's own composition rule at `:72-76` derives a wider set. "Recording the code anyway is not an option" is the right ruling and it is stated |
| F-03 (Medium) — §8.3's lead sentence contradicted §10.2 order 3, and the negative arm had no test | **Resolved.** §8.3's opening is re-worded to §10.2's condition verbatim ("Every pass that **reaches step 11**… That condition is §10.2 order 3's, verbatim and not a second one"), §2.6's observables row for the step-8 arm is corrected to "**not** emitted", AT-M6 gains the absent-table conjunct on the same path as AT-M9's positive, and **AT-M6b** is added for the `refused` arm no row asserted. E-16 now names both tests and what each covers |
| F-04 (Medium) — BR-28 generalised AT-Q7's set-equality past its Given | **Resolved as filed, and generalised further than I asked.** §6.5 now enumerates **three** domains (the git seam split by tree, so AC-3.8's invoking-tree scope is statable), the universal rule is `observed ⊆ permitted`, the obliged column is asserted present only on a PR-opening Given, and **AT-Q7c** is added as the row that pins the universal rule as containment. `fetch` moving to "permitted but not obliged" is the right call for the reason given. The new table's permitted sets are, however, narrower than the pass's own obligations — filed as F-01 |
| F-05 (Low) — §12.1's `Log row` column changed meaning in S-11c | **Resolved.** A preamble above the table declares the column counts terminal rows only in every row, and S-11c's extra detail moved into its Scenario cell |
| F-06 (Low) — two presentation defects | **Resolved.** §5.2's collapse sentence parses ("three of the fifteen skill directories at HEAD — would share one decision file…"), and AT-Q9 is back in sequence ahead of AT-Q10 |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
