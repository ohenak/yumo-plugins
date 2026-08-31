# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-30
**Iteration:** 10 (delta confirmation, erratum round)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I previously approved this PLAN; a targeted
erratum edit (`6b10f388c`…`64666b25a`, PLAN **v0.9**) has landed to close one routed item:

> PLAN v0.7 contradicted TSPEC v1.2 §7.3 at six sites — the `:19` revision history calling the
> adopted test-file/fourteen form "rejected", T-11, T-18's instruction to declare
> `DECISION_LEDGER_CENSUS_TOKENS` in `pdlc/workflows/orchestrate-dev.js`, two file-ownership-manifest
> rows, and §Definition of Done — all to be re-pinned to the census test-file home and to
> six ∪ eight = fourteen **before batches 3–8 run**.

Per DEC-ERR-03 the measurement is this PLAN against its upstream **at HEAD**, not against the item
list. I re-measured the four upstream pins mechanically before reading the delta:

| Upstream | Pin in PLAN header | `shasum -a 256` at HEAD | Agrees |
|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | yes |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef055f…35aed39` | yes |
| TSPEC **v1.2** | `fc57bc56…d4c27504` | `fc57bc56e0b5…d4c27504` | yes |
| DECISIONS | `13aba061…4fb89a` | `13aba06127b4…0bb4fb89a` | yes |

The header's TSPEC pin moved `v1.1 → v1.2` in this same edit, so the document is measured against the
version this dispatch names — no stale-pin gap of the kind that produced the last two rounds.

**Answer to the one question:** yes. The delta lands all six sites, is a faithful compression of
TSPEC v1.2 §7.3 and §7.2 at every site it now leans on, and breaks nothing I previously approved.

## Batches

Site-by-site landing check of the routed item. Each row is verified against the PLAN bytes at HEAD,
not against the commit messages.

| # | Site | State at HEAD | Landed |
|---|---|---|---|
| 1 | `:19`–`:29` revision history | v0.9 entry added; **v0.7's entry explicitly marked superseded** ("the count and home this entry records were corrected downstream-to-TSPEC-§7.3; retained as history") and a standalone paragraph records that v0.7's "six ∪ nine = fifteen" reading, and its labelling of the fourteen-member form as "rejected", is history and **not contract** | yes |
| 2 | T-11 (`:162`) | Operands re-pinned: `CENSUS_TOKENS` six data-carrying names, `CENSUS_EXEMPT` eight plumbing declarations, `OWNED_DECLS` fourteen; **"All three are declarations of this task's own test file"**, none production, none a member of the owned list | yes |
| 3 | T-18 (`:168`) | The production-declaration instruction is gone and replaced by its negation: "This task writes **no census constant**: TSPEC §7.3 homes all three … in `decisionLedgerCensus.test.js`" | yes |
| 4 | Manifest row, census test file (`:217`) | Re-worded to "the sole home of **all three** frozen census lists … never of `orchestrate-dev.js`" | yes |
| 5 | Manifest row, T-18 / `orchestrate-dev.js` (`:229`) | "it declares **no** census constant — all three are test-file constants owned by T-11, TSPEC §7.3" | yes |
| 6 | §Definition of Done (`:~505`) | Partition bullet re-pinned to six data-carrying ∪ eight plumbing = fourteen, all three constants test-file, `TSPEC v0.9 §7.3` version-pins dropped for bare `§7.3` | yes |

A grep for the stale numerals confirms no residual assertion: every surviving `fifteen` / `nine` in
the file is either inside a revision-history entry that names itself superseded, or unrelated (`:103`
counts fifteen new *test/fixture paths*; `:352` is a different arithmetic). TSPEC §7.3's own
*This paragraph is the authority for that count* explicitly permits the history form — "the revision
history records the count as history of an edit, not as a claim about HEAD" — so those survivals are
conformant, not leftovers.

**Batch-timing conjunct.** The routed item required the re-pin to land *before batches 3–8 run*. It
did: nothing in batches 1–2 has been executed against the old text, T-11 remains a batch-2
committed-skipped red un-skipped by T-18 in batch 8, and the fourteen owned declarations it resolves
against are still written by `[green]` tasks T-13…T-18 across batches 3–8. The red-before-green edge
is untouched by this edit.

## Dependencies

Upstream-fidelity measurement (DEC-ERR-03). I re-read the TSPEC v1.2 text this PLAN now leans on and
compared it operand-by-operand, because a numerically-correct-but-wrongly-wired partition is exactly
the failure §7.3 warns about.

**The two partitions are distinguished correctly.** TSPEC §7.3's *The size of the owned list, stated
once* is the authority for the count, and warns that "§7.3's *Forbidden token set* row states a
second, numerically identical but membership-different partition", so "a bare 'six ∪ eight =
fourteen' cited elsewhere could be wired to the wrong operands. Cite the phrase with its nouns, or
cite this paragraph." The PLAN does **both**, at both sites — T-11 and the Definition of Done each
name the operands inline (`CENSUS_TOKENS`'s six *data-carrying names* ∪ `CENSUS_EXEMPT`'s eight
*plumbing declarations*), state why they are named inline, and cite the authority paragraph by its
title. This is the strongest form §7.3 permits; it is not an independent restatement of the
arithmetic, so it does not trip §7.3's ban on a "*third* kind of site".

**Membership, not just cardinality.** Both operand lists are enumerated in T-11 and every member
matches TSPEC §7.3's *Forbidden token set* row verbatim:

| Operand | PLAN T-11 members | TSPEC §7.3 |
|---|---|---|
| `CENSUS_TOKENS` (6) | `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` | identical, same order |
| `CENSUS_EXEMPT` (8) | `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_NOTICES` | identical, each with §7.3's reason |
| `OWNED_DECLS` (14) | union of the above | = §4.1–§4.4's six functions + eight top-level constants |

The two decompositions cross-check: the six functions of the owned list are `CENSUS_EXEMPT`'s two
plus `CENSUS_TOKENS`'s four, and the eight constants are `CENSUS_EXEMPT`'s six plus `CENSUS_TOKENS`'s
two. Fourteen from either direction, disjointly. The arithmetic is now internally falsifiable rather
than asserted.

**Regex-widening conjunct.** The PLAN's new sentence — the precedent's `DECL_RE` widened to recognise
top-level `const` and `let` (`export`-prefixed or not) alongside `function`, "since eight of the
fourteen owned declarations are `const`s" — is a faithful compression of §7.3's *The precedent's
declaration regex must be widened, not cloned verbatim*, including the reason (a verbatim clone finds
no boundary at a catalogue's declaration line, leaving its body in the remainder and reddening the
census on its own literals) and the guard that catches it (non-empty-slice plus resolves-to-exactly-one).
That guard is the falsifiable half, and the PLAN keeps it attached to the instruction rather than
stating the regex change on its own — which is what makes the task's red meaningful.

**§7.2 flag-off oracle.** The Definition of Done's rewritten bullet matches §7.2 conjunct 3
term-for-term: symmetric difference of the flag-off and flag-on `report` key sets exactly
`{decisionLedger}`, asserted as set equality **in both directions**, plus `NTC-DECLEDGER-*` set-equal
to empty, plus the referent split (§7.4's recording is cited for the *prompt* conjunct only, since it
captures reviewer-prompt streams and never `report` keys). §7.2 itself closes with "which is the form
PLAN T-10a already states" — and T-10a still states it. No both-directions conjunct was lost when the
bullet was re-worded, and no absence-only oracle crept back in.

## Verification

Did the delta break anything I previously approved? I diffed the erratum range and checked each
previously-approved property that the changed regions could plausibly disturb.

| Previously-approved property | Effect of the delta |
|---|---|
| TDD order — every `[green]` row preceded by a `[red]` row naming the same test file and ≥1 AT | Untouched. The edit changed prose inside T-11 (`[red]`) and T-18 (`[green]`); no row's `[red]`/`[green]` label, test-file column or AT reference moved |
| Batch column = `max(dep batch) + 1` | Untouched. No `Batch` or `Depends on` cell is in the diff. T-11 stays batch 2 (deps T-00, T-01); T-18 stays batch 8 |
| Same-batch same-new-file authoring guard | **Improved.** Moving all three census constants into `decisionLedgerCensus.test.js` removes T-18's write to a declaration T-11 also reasoned about; the batch-8 manifest row for `orchestrate-dev.js` is now narrower, not wider |
| `[Fake first]` convention | Untouched — T-01's doubles row is outside the diff |
| Census non-vacuity conjuncts (non-empty slice, resolves-to-exactly-one) | Preserved verbatim in T-11 and restated in the Definition of Done. This is the load-bearing pair; I checked it explicitly because a test-file-homed constant with an empty slice is exactly how this census could go vacuously green |
| T-10a's `main()`-driven live arm (DC-07 production-path oracle) | Preserved. Conjunct 3 still asserts on the arm's own paired runs, not a stored artefact |
| §Definition of Done mutation-testing bullet | Untouched by the diff |

**The one substantive improvement worth naming.** Before this edit, `DECISION_LEDGER_CENSUS_TOKENS`
was specified as a production declaration written by T-18 *and* as a member of
`DECISION_LEDGER_OWNED_DECLS`. That combination is not merely inconsistent bookkeeping — it is
unsatisfiable as a test: the owned list's every-member-resolves-to-exactly-one-top-level-declaration
conjunct would have to resolve a name that the census's own scanned source excludes the body of,
while the constant's own literals (the six token names) sat in its body inside the scanned module.
An implementer following v0.7 would have hit a red they could not make green without contradicting
another conjunct. The delta removes the contradiction at its root rather than papering over one
site's numeral, which is why I read it as resolving the item rather than deferring it.

**What I did not re-review.** Sections outside the diff — T-00…T-10, T-12a…T-17, T-19, T-20, the
traceability tables, the batch-boundary rationale — were approved in earlier rounds and are unchanged
here. I re-litigated none of them.

## Positive Observations

- The re-grounding was done **before** the routed item was touched, and the header pin was re-derived
  mechanically (`shasum -a 256`) rather than transcribed. All four pins agree with disk at HEAD.
- The correction was taken in the direction §7.3 mandates — downstream-to-TSPEC — instead of being
  argued as a competing design. The v0.7 entry is marked superseded in place rather than rewritten,
  which keeps the history honest without leaving a live contradictory claim.
- Both restatement sites name their operands inline *and* explain why, pre-empting the exact
  wrong-operand wiring §7.3 warns about. That is the harder, more useful form of the citation.
- The regex-widening instruction travels with the conjunct that falsifies it. An instruction to widen
  a regex, on its own, has no red; paired with non-empty-slice and resolves-to-exactly-one, it does.
- The Definition of Done keeps set equality in **both** directions and set-equal-to-empty for notices.
  No absence-only oracle survived the rewrite.

## Delta-Confirmation Findings

No findings.

## Recommendation

**Approved.**

The delta resolves the routed item at all six sites, is a faithful compression of TSPEC v1.2 §7.3 and
§7.2 at every site it leans on, and breaks nothing previously approved. The PLAN is ready for batches
3–8.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
