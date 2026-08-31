# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-30
**Iteration:** 11 (delta confirmation)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I approved this PLAN at v10 with zero findings
(`REVIEWED-COMMIT: 64666b25a`). Since then exactly one commit touched the document — `789812155`
*"PLAN v0.9 re-grounds on DECISIONS v1.5"* — and `git diff 64666b25a..HEAD` on the file is **2
insertions, 2 deletions across 2 lines**:

1. the header `Upstream` row's DECISIONS pin, `sha256:13aba061…4fb89a` → **v1.5**
   `sha256:52580962…584ca0` (`:9`);
2. the `v0.9` revision-history entry (`:19`), extended with a closing passage recording that
   DECISIONS moved after both reviewers wrote, and the sweep this document was put through against
   the moved decision's corrected predicate.

No task row, batch column, dependency edge, ownership row, test-file path or AT reference is inside
the diff. The round therefore reduces to two questions: does the new pin agree with disk, and are
the sweep claims in the new prose true of this document's own bytes?

Per DEC-ERR-03 I re-measured all four upstream pins at HEAD rather than trusting the entry:

| Upstream | Pin in PLAN header | `shasum -a 256` at HEAD | Agrees |
|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | yes |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef055f…35aed39` | yes |
| TSPEC v1.2 | `fc57bc56…d4c27504` | `fc57bc56e0b5…d4c27504` | yes |
| DECISIONS **v1.5** | `52580962…584ca0` | `52580962706938…75584ca0` | yes |

The pin that moved is the one the delta claims moved, and the three that did not move are still
byte-exact. The header is mechanically correct.

## Batches

**No task, batch or ownership byte moved in this round**, and I verified that rather than accepting
the entry's "No routed item and no count is affected" on its word: the diff contains no `Batch`
cell, no `Depends on` cell, no `[red]`/`[green]` label, no test-file column and no AT id. Every
property I approved at v10 — TDD red-before-green pairing, `batch == max(dep batch) + 1`, the
same-batch same-new-file authoring guard, the `[Fake first]` ordering — is untouched by
construction, because none of their inputs are in the delta.

I still re-grounded the file claims the swept passage leans on, since the sweep talks about T-06 and
T-09's pinned literals and those rows name test files:

| File named in task table | Declared | State at HEAD | Consistent |
|---|---|---|---|
| `pdlc/workflows/__tests__/decisionLedgerCorpus.test.js` (T-09) | `[new]` | absent | yes |
| `pdlc/workflows/__tests__/decisionLedgerRender.test.js` (T-06, T-15) | `[new]` | absent | yes |
| `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` (T-11) | `[new]` | absent | yes |
| `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` | cited as **existing** precedent, not new | present (12.4K) | yes |

The three `[new]` files do not exist at HEAD and the one cited as an existing cloning precedent does
— so the table's new-vs-existing split is still true of the repository, not just of the document.

## Dependencies

The delta's substantive risk is upstream-fidelity: PLAN re-pinned to a DECISIONS that moved **twice**
(`v1.4`, then `v1.5`) after both reviewers passed the old pin. If either revision had moved a
standing decision PLAN's task rows depend on, a pin bump alone would be a stale re-ground dressed as
a fresh one. I diffed DECISIONS across the bump rather than reading its changelog:

- `git log` on the file shows three commits in the range — `63f205e89` (DEC-16 `## Decision` row made
  directional and scoped), `106531d42` (DEC-16 scoped in `## Consequences`, trigger licence closed),
  `420edb564` (v1.5 header and changelog). All three are DEC-DECLEDGER-16.
- The diff is 50 insertions / 12 deletions, and every deleted line belongs to DEC-DECLEDGER-16's
  positional formulation (`"only on the larger side of an inequality"`) being replaced by the
  directional one (`a ceiling may enter a claim only where substituting the true — necessarily
  smaller — drafted value preserves that claim`) plus an explicit scope predicate.

So PLAN's characterisation — *"v1.4 re-grounds three passages on TSPEC's landed propagation, and
v1.5 restates `DEC-DECLEDGER-16`'s provenance rule directionally"* — is accurate, and the "and
nothing else" is verifiable from the diff, not merely asserted. **No decision PLAN's batches depend
on changed**, which is why a pin bump with no task edit is the correct response here rather than a
suspiciously cheap one.

## Verification

The new prose makes four falsifiable claims about this document's own bytes, closing with
*"conformant without an edit"*. A self-certified sweep is exactly the kind of claim that is cheap to
write and load-bearing downstream, so I re-ran each one against the file rather than reading it.

| Claim in the new passage | Mechanical check | Result |
|---|---|---|
| Bound assertions are in **subtraction** form | `grep -o -E '[0-9,]+ ≤ maxBytes − 1200'` | 3 hits, all subtraction: `10,859 ≤ maxBytes − 1200` ×2, `6,305 ≤ maxBytes − 1200` ×1 |
| "no addition form is asserted anywhere" | `grep -n -E '\+ ?1,?200\|1,?200 ?\+'` | **zero hits** — no `measured + ceiling` assertion exists |
| "`12,059` is explicitly **not** asserted as an equality" | `grep -n '12,059'` | 2 hits: the new passage, and T-09 (`:159`) which states the block total *"is deliberately **not** asserted as an equality (`DEC-DECLEDGER-16`)"` |
| "`441` appears only as the worst-case figure" | `grep -n '441'` | 2 hits: T-09 `:159` (`≤ 11,300`, the 441-byte margin) and `:276` (margin shrinks one-for-one with any raise) — both labelled worst-case, neither an equality |

The arithmetic underneath resolves: `12500 − 1200 = 11,300`; `11,300 − 10,859 = 441`;
`6,305 ≤ 11,300`. The retired `10,859 + 1,200 = 12,059` is the figure DEC-16 forbids and it appears
nowhere as an assertion.

I also applied the **new directional predicate** to the one site that could plausibly trip it and is
not mentioned in the sweep: T-06's framing pin (`:156`, `:273`, `:498`) — *"header + preamble + rule
text + trailer + separating blank lines render to ≤ 1,200 bytes, asserted against that literal"*.
Substituting the true, smaller drafted value into `drafted ≤ 1200` **preserves** the claim, so it
passes the directional test; the 1,200 here is the budget being enforced, not a ceiling charged into
a measurement. The sweep's conclusion holds for this site too even though it does not name it.

**One imprecision, recorded not blocking.** The passage says *"the only bound assertion it carries is
T-09's subtraction form `10,859 ≤ maxBytes − 1200`"*. T-09 in fact carries **two** bound assertions —
`6,305 ≤ maxBytes − 1200` over the whole 141-record fixture, and `10,859 ≤ maxBytes − 1200` over the
`M-6b` slice (`:159`). Both are subtraction form, so the DEC-16 conformance verdict is unaffected and
no assertion needs to change; the enumeration is simply under-counted by one. Filed **Low** below.

**Did the delta break anything I previously approved?** No. The two changed lines are a header pin
and a revision-history entry. T-09's oracle design — literals hand-transcribed from the fixture and
never captured from the renderer (`:159`, `:454`), `omitted[]` asserted positively empty on the
`M-6b` slice rather than merely "not containing" ids, AT-18's positive conjunct that the
feature-level statement is *absent from the whole block* alongside the project-level record's
statement/`sourcePath`/`origin` being present — is byte-identical to what I approved at v10. No
absence-only oracle crept in, no set-equality was weakened to containment, and no expected value
became renderer-derived.

## Positive Observations

- The re-grounding was done **before** the entry was closed, and the pin re-derived mechanically
  (`shasum -a 256`) rather than transcribed. All four pins agree with disk at HEAD.
- The author noticed an upstream move that **did not force a single content edit** and still recorded
  the sweep instead of silently bumping the pin. A pin bump with no task change is the honest outcome
  here, and the entry says why in checkable terms rather than asserting conformance.
- The sweep is written as evidence a reviewer can re-run — named forms, named literals, named
  sections — which is what let me falsify it in four greps. That is the difference between a claim
  and a receipt.
- DEC-16's own correction is the right one from a testing standpoint: the positional rule rejected
  `measured + ceiling ≤ bound` while admitting the algebraically identical `measured ≤ bound −
  ceiling`, so its verdict depended on how the author happened to write the comparison. The
  directional restatement makes it a mechanical authoring check with one answer per site.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Low | delta | local | The v0.9 entry says *"the only bound assertion it carries is T-09's subtraction form `10,859 ≤ maxBytes − 1200`"*, but T-09 carries two bound assertions — `6,305 ≤ maxBytes − 1200` (whole 141-record fixture) and `10,859 ≤ maxBytes − 1200` (`M-6b` slice). Both are subtraction form, so the DEC-DECLEDGER-16 conformance verdict and every pinned literal are unaffected; only the enumeration is under-counted. Non-gating. | Revision history, v0.9 entry (`:19`); operands at T-09 (`:159`) |

FINDING: Low | delta | local | Revision history v0.9 sweep passage (:19) | Sweep says "the only bound assertion" is `10,859 ≤ maxBytes − 1200`; T-09 (:159) also carries `6,305 ≤ maxBytes − 1200` — both subtraction form, conformance verdict unaffected, enumeration under-counted by one

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63
APPROVAL-HASH-NORMALIZED: sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63
REVIEWED-COMMIT: 789812155c2a28fb553cac52227f074f24970bd4
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:fc57bc56e0b53ba00402555bcf4a71575ddf820796586607137fdd8ad4c27504
UPSTREAM-STATE: DECISIONS sha256:5258096270693873ffc1a24cd4bfa542f540c143c4c16cd0aa5e512375584ca0
