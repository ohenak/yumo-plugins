# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.4)
**Date:** 2026-08-28
**Iteration:** 4
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.
Delta re-review protocol: prior findings verified first, then only the changed sections scanned for new issues.

## Method

Diffed `64cb78029..HEAD` on the TSPEC (80 insertions, 25 deletions) — changed regions are the v0.4
changelog block, §2.3 (TE Q-01 answer), §3.6's headroom paragraph, §7.3's shipped-default assertion,
§7.5's model paragraph, §9.1's D-10 row, and §9.2's ERR-2. Nothing outside those regions moved.

Prior-round dispositions, each checked against the artifact rather than the changelog's word:

| v3 finding | Asked for | Landed |
|---|---|---|
| F-01 (Medium) — D-10's third conjunct vacuous on a project-level-only input | build the assertion where the byte bound binds, so `omitted[]` is non-empty and the origin partition can falsify a reversed drop order | Yes — §7.3 now builds over the whole fixture, splits the assertion into three numbered conjuncts, states the non-emptiness explicitly, and records the rejected project-level-only alternative in D-10 |
| F-02 (Low) — blank line splits §9.1's table before D-10 | delete the blank line so D-10/D-11 render as rows | Yes — `git diff` shows the blank line removed; D-9…D-11 are now one table |

I also re-checked the three code citations this round newly leans on rather than taking the document's
word: the learnings sentinel literals are matched by exact string at
`pdlc/workflows/__tests__/advisoryDisabled.test.js:718-719`, which is the citation §2.3 gives, and the
surrounding comment at `:711-717` confirms the slice is the advisory pin's own, so §2.3's claim that
neither slicer sees the other holds. §7.5's superseded "model is built from the production line
renderer" sentence is gone and the paragraph now reads consistently with the own-formatter argument
four lines below it (TE F-01 closed at the root, not by hedging).

Arithmetic re-derived independently: `8000 − 1200 − 6305 = 495`; `10,859 + 1,200 = 12,059`, so ERR-2's
re-attribution of 12,059 to `M-6b`'s 63-line in-scope set is right and the earlier attribution to
`pdlc-headless-engine` alone was the error; `pdlc-headless-engine` alone at 22 joined lines reconciles
to 4,553 under §7.3's own `\n`-join convention (10,859 − 62 − (6,305 − 40) + 21), so that figure is
consistent too. `41 + 100 = 141` matches §3.5's measured corpus, so §7.3's new record count is the
right number for the whole fixture.

Two issues, neither gating, both inside sections this round changed.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §7.3 justifies the whole-fixture input as "what a real dispatch gathers"; FSPEC §3.2 step 2 makes the in-scope set project-level **plus one feature**, so no dispatch ever gathers 141 records, and the largest real regime (63 records / 10,859 bytes) is still the one no test exercises | REQ-DECLEDGER-01, FSPEC §3.2 |
| F-02 | Low | Local | §3.6/ERR-2 now say ~495 bytes is "about three" feature-level lines while §7.3's own note on the same quantity says "roughly two" — the two changed sections disagree, and only two whole lines fit | REQ-DECLEDGER-07, C-5 |
