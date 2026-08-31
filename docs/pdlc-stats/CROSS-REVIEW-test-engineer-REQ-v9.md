# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.7)
**Date:** 2026-08-31
**Iteration:** 9 (delta confirmation — erratum round)

## Scope of this round

Delta confirmation only. The REQ was approved at v1.6; this round reads the single erratum commit
`e12b78fd8` (REQ v1.6 -> v1.7, 12 insertions / 3 deletions, all inside the changelog block and
REQ-STATS-06's closing paragraph) and asks one question: does the delta resolve the routed item
without breaking anything previously approved? Unchanged sections were not re-litigated; the
upstream text REQ-STATS-06 leans on was re-read at current HEAD.

## Routed item

**Routed (raised by se-review):** REQ-STATS-06 v1.6's clause "a grammatical basename outside the
driver's document-type catalogue is a survivor" contradicted FSPEC BR-16 v1.7's "reports
`harvested`" on the same `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file, and the conflict was already
asserted downstream by AT-17 leg 4 and PROP-RATIO-08 leg 4.

**Landed:** the survivor clause is withdrawn, not reconciled. REQ-STATS-06 now reads that the
harvested predicate is evaluated over exactly the file set whose bytes the process side sums, so a
basename the driver's catalogue does not recognise contributes no process bytes and counts as no
file of its family remaining — a feature whose only `CROSS-REVIEW-` basenames are of that shape
reports **harvested**.

**Verified as resolved, in the testing lens:**

| Downstream assertion | Says | Agrees with REQ v1.7? |
|---|---|---|
| FSPEC BR-16 (§4.2) | out-of-catalogue-only directory reports `harvested`, evaluated over exactly BR-14's numerator set | Yes — same predicate, same file set, same verdict |
| FSPEC AT-17 leg 4 | `CODE_REVIEW` intact + only `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames -> `harvested`, not a measured ratio | Yes |
| FSPEC AT-15 | the out-of-catalogue cross-review's bytes reach **neither** side; a `CROSS-REVIEW-*` glob fails here | Yes — REQ now says "contributes no process bytes" |
| PROPERTIES PROP-RATIO-08 leg 4 | same, with three positive conjuncts (`state`, `ratio: null`, retained `processBytes`/`specBytes`) | Yes |
| Fixture `F-HARVEST-FOUR` | fourth directory is exactly this configuration | Yes — no fixture change implied |

No downstream document needs an edit to follow this delta: the erratum moved REQ **to** the reading
FSPEC, AT-17, PROP-RATIO-08 and `F-HARVEST-FOUR` already carry, so the previously-red contradiction
is now green from a single side. This is the cheapest possible resolution for the test estate — zero
test, fixture or oracle churn.

## Upstream re-grounding

The erratum's necessary-but-not-sufficient clause was checked: is REQ v1.7 still a faithful
compression of what it leans on, at current HEAD?

- **C-4 (process-artifact set)** — the process side is the byte total of files matching the
  documented `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar. Read through C-5, the grammar is
  the driver's, so an out-of-catalogue doc-type is not a member. REQ-STATS-06's new "contributes no
  process bytes" is a restatement of C-4, not a new rule. Faithful.
- **C-5 (parsing fidelity — no independent parsing rules)** — the new clause names an *outcome*
  (`harvested`) and defers the classification to REQ-STATS-03 by citation. It introduces no
  independent grammar and no third bucket, which is exactly what C-5 forbids and what the withdrawn
  survivor clause was quietly doing. Faithful, and strictly more so than v1.6.
- **REQ-STATS-03** — still classifies the grammatical-but-out-of-catalogue
  `CROSS-REVIEW-{role}-REVIEW-v{N}.md` name as **malformed** under the driver's grammar, one label,
  no third bucket. REQ-STATS-06 now cites that classification rather than dissenting from it. The
  two ACs are consistent for the first time in this document's history.
- **REQ-STATS-06's own preceding rationale** — "a family harvest deletes is gone from the numerator,
  so a computed value would silently undercount rather than be absent." The delta's closing sentence
  now completes that sentence instead of contradicting it two lines later.
- **NG-6 / R-6** — untouched by the delta; the harvested state is still scoped to the two families
  harvest removes, and no halt-side claim was disturbed.
- **Grep of the whole document** for `survivor`, `catalogue`, `REVIEW-v{N}` returns only the
  changelog's quotation of the withdrawn clause plus the two consistent live sites (REQ-STATS-03,
  REQ-STATS-06). No residual of the old reading survives anywhere in the document.

Nothing in the REQ cites upstream text that no longer says what the REQ says it says.

## Positive Observations

- **Deciding beats reconciling here.** Withdrawing the clause rather than inventing a reconciling
  rule kept the REQ inside C-5 and left the downstream test estate untouched. A reconciled third
  reading would have forced edits to BR-16, AT-15, AT-17, PROP-RATIO-08 and `F-HARVEST-FOUR` — five
  artifacts and a fixture — to buy nothing testable.
- **The resolved reading is the falsifiable one.** `harvested` is a positive token with positive
  conjuncts already specified downstream (`state`, `ratio: null`, retained byte totals). The
  withdrawn survivor reading would have produced a *measured ratio computed over an undercounted
  numerator* — a number no oracle can call wrong, since every value is plausible. The delta removes
  a false-green class from the ratio metric, it does not merely settle a wording dispute.
- **AT-15 and AT-17 now bracket the same file from both sides** — bytes reach neither side (AT-15),
  and the same basename does not hold its family open (AT-17). With the REQ agreeing, an
  implementation that globs `CROSS-REVIEW-*` fails at both, which is the mutation this pair exists
  to kill.
- **Changelog discipline held.** "No other change" is literally true against the diff: 12 insertions,
  3 deletions, confined to the version row, the erratum note and REQ-STATS-06's last paragraph.

## Recommendation

**Approved** — the delta resolves the routed item, and nothing previously approved is broken. The
document is testable as written: the new clause is a black-box outcome an acceptance test can assert
without further clarification, and the tests that assert it already exist downstream.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
