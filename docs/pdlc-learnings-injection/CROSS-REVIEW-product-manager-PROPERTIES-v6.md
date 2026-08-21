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

_pending_

## Oracles

_pending_

## Fixtures

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
