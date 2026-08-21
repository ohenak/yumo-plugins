# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 10 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved v0.7 → v0.8)

## Overview

**What this round is.** An upstream-cascade confirmation, not a re-review. The bytes of
`PROPERTIES-pdlc-learnings-injection.md` have not moved since my v9 approval —
`shasum -a 256` still returns `3e9fdf8b…`, matching v9's `APPROVAL-HASH`, and
`git log -1 --format=%H` on the file is still `23adb5e5`, matching v9's `REVIEWED-COMMIT`.
What moved is **PLAN**. My v9 approval recorded `UPSTREAM-STATE: PLAN sha256:b9fbd3ea…`
(commit `f73046ad`, PLAN v0.7); PLAN at HEAD is `sha256:281c60c0…` (commit `be64a0c6`, **v0.8**).
The one question I answer: is this PROPERTIES still a faithful compression of PLAN as it now stands?

**Answer: no, in three places, one of them load-bearing.** The other four upstream pins
(REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`) are byte-identical to
the ones v9 recorded, so REQ/FSPEC/TSPEC/DECISIONS fidelity is untouched and I did not re-open it.

**The delta.** `git diff f73046ad..be64a0c6` on PLAN is **10 insertions / 5 deletions**, all inside
*Amendment commits on landed suites (P-A-7)* plus the version cell and one changelog row:

1. The version cell: `0.7 / 2026-08-20` → **`0.8 / 2026-08-21`**.
2. **Case A** gains a derivation of its "before batch 7" window (batches 2–6 carry no ledger at all;
   their red reason is the earlier one). Its ruling — no row — is unchanged.
3. **Case B is re-scoped.** Its trigger column now reads "after LI-17 has greened the suite, **with a
   greening batch still ahead** (batch 9 through batch 12)", and its span is annotated "well-formed
   only while a greening batch remains ahead, which is why case C exists".
4. **New case C**, and it is the case PLAN says is live at HEAD: "after batch 13, the case that is
   live at HEAD … **None — and the amendment is expected to land green.**" It states in terms that
   *"Case B's span therefore has no terminus here and does not apply"*, replaces the span with batch
   14's unqualified gate, and closes by naming **this document's own routed re-reds** —
   "the PROPERTIES-driven re-reds §C.4 of PROPERTIES routes to this PLAN (PROP-BOUND-03's
   `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08, and the Group D amendments to the landed
   `learningsSelect.test.js`): under case C they owe no ledger row, and **they owe green**".
5. The fixture-consumer paragraph scopes its "no row of their own" ruling to this follow-up commit
   and adds the case-C branch.
6. A v0.8 changelog row recording the erratum and stating it answers PM Q-02.

**Why that cascades here.** §C.4 and §G.3 of PROPERTIES do not merely mention P-A-7 — they lean on
its *shape*. §C.4 states, in the document's own words, that under "PLAN's two-case follow-up table …
**case B is the live case and case A is unreachable**", derives from case B's wording the two gaps it
routes, and never records a green-at-landing obligation. §G.3 carries both of those gaps under
**"Still open — three items"**. The header's upstream row pins PLAN "(v0.7 — … the *Amendment
commits on landed suites (P-A-7)* two-case table was added at **v0.6** and is unchanged at v0.7)".
Every one of those is a statement about upstream that upstream no longer makes: the table is not
two-case, case B is not live, and the two "still open" items are exactly what PLAN v0.8's changelog
records itself as answering. Under DEC-ERR-03 those are findings of this confirmation.

**Verification method.** `shasum -a 256` on PROPERTIES and on all five upstream documents;
`git rev-list` over PLAN's history with a per-commit `shasum` to locate the blob my v9 approval named
(`b9fbd3ea` → `f73046ad`); `git diff f73046ad..be64a0c6` on PLAN; exact-substring greps of PLAN's
case A/B/C rows and its v0.8 changelog row; `sed -n` over PROPERTIES §C.4 (`:1052–1167`) and §G.3
(`:1235–1305`) and its header row (`:11`); `git diff 23adb5e5..HEAD` over PROPERTIES (empty).
I re-verified no code claim this round: no code claim in the document is downstream of the PLAN edit.

## Properties

TBD

## Oracles

TBD

## Fixtures

TBD

## Delta-Confirmation Findings

TBD

## Verdict

TBD
