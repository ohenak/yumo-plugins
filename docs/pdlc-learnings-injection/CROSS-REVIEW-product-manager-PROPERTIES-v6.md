# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation — PROPERTIES bytes unchanged, PLAN moved v0.5 → v0.6)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · DECISIONS `sha256:56617f5ab31a…` · PLAN
`sha256:d028d972450c…` (**v0.6**, was v0.5 `sha256:4510f9c3f12b…` at my v5) · PROPERTIES under
review `sha256:6d74d3eb5a23…` (**v0.3**, byte-identical to the version I approved at v5), branch
`feat-pdlc-learnings-injection` at `fdcdefec`.

## Overview

**The question.** I approved PROPERTIES v0.3 at round v5. Its bytes have not moved
(`sha256:6d74d3eb5a23…`, the same subject my v5 measured). What moved is **PLAN**, from v0.5
(`4510f9c3f12b…`) to v0.6 (`d028d972450c…`) — an erratum round of **23 insertions / 2 deletions**
across three commits (`748659c0`, `92e5d178`, `6a2d3007`), so my approval was recorded against a
PLAN that no longer exists. The single question here: is PROPERTIES v0.3 still a faithful
compression of PLAN as it now stands?

**What the PLAN erratum did.** Three edits, no more:

1. §The three gate wordings gains a paragraph **Amendment commits on landed suites (P-A-7)**, which
   names the expected-red ledger rows the heading-form follow-up commit owes, in two cases:
   **A** — the commit lands before batch 7 ⇒ **no** row is added, because `learningsBlock.test.js`
   is already ledgered as a **whole-suite** red after batches 7–8 and greens entire at LI-17 /
   batch 9; **B** — the commit lands at batch 9 or later ⇒ the ledger gains
   `learningsBlock` → **`LI-AT-11`'s heading-form cases only**, stated in test names, for every
   batch from the landing batch through the batch that greens them. `learningsFixtures.js`'s other
   consumers carry no row, because the declared-heading-form knob is additive over the landed
   helper's ordinal/gloss rendering.
2. LI-08's row appends a pointer to that paragraph.
3. The version cell reads 0.6 and a changelog row records the round.

The changelog's own closing sentence — *"no task moved batch, no `Deps` edge changed, no AT
partition or fixture was touched"* — is confirmed by the diff.

**Answer: PROPERTIES still holds as approved, with three documentation-fidelity items and no
behavioural change.** Every property's trace (`red LI-xx` / `green LI-yy`), every AT id, every
fixture, every oracle and §C.3's 23-of-23 task accounting are untouched by this erratum, because the
erratum touched none of the things they cite. What *is* now stale is PROPERTIES §C.4's own narrative
about this very erratum: it says the naming "is the PLAN's to do and is routed as an erratum" — the
erratum has since landed, and it landed scoped more narrowly than §C.4's sentence anticipates. All
three items below are Medium or Low, none gates, and none touches an oracle.

## Properties

**Nothing in the property catalogue moves.** The erratum added no task, moved no task between
batches, changed no `Deps` edge, added no AT id and invalidated no fixture, so the three things every
property in this document leans on PLAN for — its **owning red task**, its **owning green task**, and
its place in §C.3's task accounting — are all unchanged.

Checked directly against PLAN v0.6 rather than assumed:

| PROPERTIES claim about PLAN | Status at PLAN v0.6 |
|---|---|
| The 70 properties trace to red/green pairs LI-07/LI-16, LI-08/LI-17, LI-10/LI-19, LI-12/LI-21, LI-14, LI-23 | Holds — every one of those rows is byte-unchanged except LI-08, whose only edit is the appended pointer to the new paragraph |
| §C.3 "23 of 23 tasks accounted for"; LI-02 and LI-22 own no property by design | Holds — the task table still has 23 rows, LI-02 is still the fixture helper with no property of its own |
| §C.4's fourteen-file ownership table mirrors PLAN §File-ownership manifest | Holds — the manifest is untouched; the erratum explicitly states ownership does not move and the single-writer manifest is unchanged |
| PROP-RECORD-06/07's batch-11/13 split rides PLAN's LI-19 / LI-21 split of BR-10's two loci, with `LI-AT-22`'s run-level half in the expected-red ledger for batches 11–12 | Holds — LI-10's row carries that split verbatim, and the erratum did not touch it |
| PROP-CONFIG-09 matches LI-12's three-case `LI-AT-30` (including the `maxBytesPerDocument: 0` arm) | Holds — LI-12's row is byte-unchanged |
| PROP-BOUND-05/08's §D.3 heading-recognition oracle is red by LI-08 / green by LI-17 | Holds, and is now *better* supported: LI-08's row still declares the non-canonical heading forms and the `## Process Findings` near-miss, and the new paragraph says how their re-red is ledgered |

One PLAN-facing sentence in PROPERTIES is now **stale in the direction of understating upstream**:
§C.4's *"PLAN's LI-08 v0.5 amendment note assigns the follow-up commit to the existing owners but
does not name the ledger rows; that naming is the PLAN's to do and is routed as an erratum, not
decided here."* At HEAD, PLAN **does** name them. The routed item is answered, so the sentence should
read as closed rather than open (F-02). The neighbouring claim it exists to protect — *"No property
of this document changes either way"* — is confirmed by PLAN v0.6, not contradicted by it: both of
the paragraph's cases add or drop **zero** rows that any property here names.

The upstream pin in the header table still reads `PLAN-…md` **(v0.5)** (F-01). No property depends on
the pin, but the pin is what the next reviewer measures the document against.

## Oracles

_pending_

## Fixtures

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
