# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 9
**Round type:** upstream-cascade confirmation (TSPEC bytes unmoved; FSPEC moved under it)

## Overview

**Question answered:** does TSPEC, whose own bytes have not moved, still hold as approved against
FSPEC as it now stands at `sha256:a4f775bd…` (v0.10)?

**Answer: yes.** The cascading edit is `9a4b7593`, a header-only erratum: the FSPEC front-matter
Cross-Reviews row is corrected from `v{1…9}` to `v{1…11}`, the version field moves `0.9 → 0.10`,
and a five-line `v0.10 erratum (header only)` changelog paragraph is inserted below the v0.9
paragraph. `git diff 523e2df9 HEAD -- FSPEC-…md` is 8 insertions / 2 deletions, entirely above
`> **Scope in one line.**`. No rule (BR-*), no acceptance test (AT-*), no error-envelope row
(E-*), no locus assignment and no traceability row is touched.

**State at HEAD, re-measured this round:**

| Artifact | sha256 | Versus my v8 |
|---|---|---|
| TSPEC (under review) | `eff5a19b…` | identical to the v8 `APPROVAL-HASH` |
| REQ (upstream) | `ff605dd3…` | unmoved, matches this dispatch's stated hash |
| FSPEC (upstream) | `a4f775bd…` | moved from `764414d0…`; matches this dispatch's stated hash |

Working tree is clean, HEAD is `15d8f46e` on `feat-pdlc-learnings-injection`.

Per DEC-ERR-03 my scope is not the item list but *whether this TSPEC is still a faithful
compression of upstream at its current version*. I re-read every FSPEC passage this TSPEC leans
on and re-derived the claims whose ground could have shifted; the sections below record that
work. One finding falls out — a version-label citation the erratum made stale — and it is Low.

## Architecture

The TSPEC's architecture rows describe seams in `pdlc/workflows/orchestrate-dev.js`, not FSPEC
prose, so a header-only upstream erratum cannot falsify them by construction. What it *could*
falsify is the compression claim: that each architecture row still transcribes an upstream rule
that says the same thing. Re-checked, by upstream anchor rather than by line number:

| TSPEC row | Upstream sentence it compresses | State at FSPEC v0.10 |
|---|---|---|
| P-2a — four `dispatchKind: "authoring"` sites | "The block is assembled by a **selection step** that runs once per authoring dispatch" (FSPEC §Overview) | verbatim, untouched |
| P-3 — single `dispatchAndVerify` funnel | "The flow runs **once per authoring dispatch**, at the point the dispatch's prompt is being composed" (FSPEC §Flow) | verbatim, untouched |
| P-7 / P-8 / P-10 — read/list/git seams | BR-8's per-document rows and their unlistable/unreadable reasons | untouched |
| P-11 / P-12 — `parseAdvisoryConfig` sibling precedent | the v0.6 erratum paragraph's `ADVISORY_DEFAULTS` contrast | still present, unedited; the v0.10 paragraph is additive and sits below it |

The v0.10 paragraph is worth one explicit note, because it is the only new upstream prose in this
window and a cascade confirmation must read it rather than assume it: it says "Upstream re-read at
HEAD (REQ v0.9, unchanged); no upstream decision to absorb … Header correction only; no
behavioural change." That is a self-describing no-op, and I verified the description against the
bytes rather than trusting it — the diff really is confined to the two header lines plus the
paragraph itself. There is no new decision for the TSPEC to absorb, and therefore no architecture
row that has fallen out of date.

The implementation anchors themselves have not moved since v8 (`472e505c` remains the last commit
to touch `orchestrate-dev.js`), so my v8 by-symbol re-verification of P-2a, P-3, P-11/P-12 and the
seam contracts stands unchanged; I did not re-run it, and nothing in this window invalidates it.

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_
