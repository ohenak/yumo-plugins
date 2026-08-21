# Cross-Review: test-engineer — DECISIONS (revision round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.4, sha256:7dda3534…, commit `6f28eded`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v7.md` (v0.3, sha256:56617f5a…, commit `e29a296e`)
**Date:** 2026-08-21
**Iteration:** 8

## Context

The delta under review is three commits, `e29a296e` → `6f28eded`, +24/−6 lines, all of it aimed at
the two Mediums I carried unlanded from v6 into v7:

| Commit | Substance | Answers |
|---|---|---|
| `b909ead8` | `DEC-LI-08` gains a **What the caps bound (FSPEC v0.13)** paragraph: the three thresholds bound *material*, framing is charged to none of them, the shipped renderer agrees, and framing's measured cost is recorded as a pair of numbers | v7 F-01 |
| `f75140e3` | `D-O-3` gains an explicit zero-bound conjunct; `D-O-4` is split into realised **material** bytes and realised **block** bytes so the C-8 gap's closing condition compares commensurable quantities | v7 F-02, v7 F-01 |
| `6f28eded` | Version bumped 0.3 → 0.4, round-6 changelog prepended | — |

Both v7 findings are substantively landed. The zero-bound conjunct is correct against the shipped
code: `extractInjectableMaterial` short-circuits on `maxBytes <= 0` returning
`{material: "", bounded: false, bytes: 0, sections: []}` before any cut, and `selectLearnings`
routes `sections.length === 0` to `RSN-NO-MATERIAL` consuming no slot
(`pdlc/workflows/orchestrate-dev.js`, `extractInjectableMaterial` / `selectLearnings`). Every
upstream anchor the new text cites resolves: FSPEC §"The byte-accounting basis" (FSPEC:489),
§"How the per-document bound binds" (FSPEC:500), `E-36` (FSPEC:798), `AT-30` (FSPEC:967-971),
BR-8's *bytes injected* row (FSPEC:560) and its run-level scalar (FSPEC:563), REQ AC-2.3's "the
material taken" (REQ:291-294), and REQ §4.1's 5 / 6,000 / 20,000 (REQ:224-226), which match
`LEARNINGS_DEFAULTS` in the shipped module exactly.

What the delta also introduced is a **quantitative** claim — framing's measured cost, stated as a
pair of numbers and a derived cap-overrun figure — and that claim does not survive re-measurement
on the shipped renderer. That is the whole of this round.

Upstream moved underneath this document since v7 (FSPEC v0.13 → **v0.14**, REQ v0.9 → **v0.10**).
I re-derived both deltas; neither invalidates anything this document asserts. Details below.
