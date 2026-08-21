# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.14)
**Date:** 2026-08-20
**Iteration:** 4 (delta confirmation, erratum round)

## Problem / Context

This is a **delta confirmation**, not a fresh review. I approved this REQ at v1.13 (round v3). A
targeted erratum has since landed in three commits, all on `feat-pdlc-advisory-wave-gate`:

| Commit | Scope |
|---|---|
| `75e5e13c` | lineage header (Upstream / Downstream / Cross-Reviews rows), `Status` field, v1.14 changelog |
| `524913ed` | AC-1.1 and R-5 name `c8aa22a4` as the pre-A6 measurement base |
| `c58fd61d` | AC-5.1's observation point, record-carrier exclusion, ignored-path boundary, failed-capture outcome |

The diff read for this round is `git diff 53fe0b73..HEAD -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
— 21 insertions, 9 deletions, touching exactly three regions (header block, AC-1.1, AC-5.1, R-5).
Sections outside those regions were approved at v3 and are not re-litigated here.

Per DEC-ERR-03 the scope is this REQ measured against its **upstream at HEAD**, not against the
routed item list. I therefore re-measured every upstream claim the erratum leans on, at its current
version, rather than trusting the v3 readings:

- `docs/_constraints/pdlc-wave-gate-baseline.md` at **v1.2** (header `Version | 1.2 · 2026-08-20`),
  whose `Verified at` row reads `§1–§2 at default-branch commit c8aa22a4; §3 at 1efb9a3b; §4 at 11420461`.
- `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` at its shipped version, for the
  eight `REQ-pdlc-advisory-tier` ids this REQ cites.
- The shipped workflow at HEAD, for the "HEAD already carries A6" claim.

Branch verified `feat-pdlc-advisory-wave-gate` by `git rev-parse --abbrev-ref HEAD` immediately
before each commit of this file. No `git checkout` was run in the shared tree.

## Goals

Answer one question: **does the delta resolve the routed items without breaking what I previously
approved, and is the document still a faithful compression of its upstream at HEAD?**

Concretely, this round set out to:

1. Confirm each of the eight routed items landed in the bytes, not merely in the changelog.
2. Re-measure every upstream fact the new text asserts — the base commit `c8aa22a4`, the
   post-change facts M-WG-13 / M-WG-14, M-WG-3 and M-WG-7, and the eight upstream-tier ids — at the
   current version of the cited authority.
3. Check the new AC-5.1 clauses for composition damage against criteria I already approved:
   AC-5.2, AC-6.1, AC-2.4 and O-1.
4. Check the rewritten lineage header against how sibling REQs in `docs/completed/` carry the same
   rows, and against what actually exists on the branch today.

## Non-Goals

- Re-reading unchanged sections. §1–§5, §6's REQ-AWG-02/03/04/06/07 and §7's R-1…R-4 were approved
  at v1/v2/v3 and are untouched by this erratum; nothing below re-opens them.
- Re-litigating findings already dispositioned. SE F-01 (C-5's soft threshold) and SE F-02 (v1.12's
  queue-block attribution) were resolved at v3 and stay resolved; SE Q-01 and Q-02 remain open by
  design and are not converted into findings here.
- Product, UX or test-pyramid judgement. Whether `approved (shipped)` is the right *product* status
  vocabulary and whether the file relocates to `docs/completed/` are pm-author's and SE Q-02's
  respectively; I record only the engineering consequence.

## Non-Goals

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
