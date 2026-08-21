# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (bytes unchanged since v2 approval)
**Cascade trigger:** `REQ-pdlc-advisory-wave-gate.md` v1.15 → v1.16 (`sha256:f97f4f66…`)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation)

## Context

I approved this DECISIONS at v1.11 (`CROSS-REVIEW-test-engineer-DECISIONS-v2.md`, verdict *Approved
with minor changes*, `APPROVAL-HASH: sha256:ef59893d…`, `REVIEWED-COMMIT: 3143290a`). That approval
recorded its upstream state explicitly:

| Upstream | At my v2 approval | At HEAD now | Moved? |
|---|---|---|---|
| REQ | `sha256:c62cfc35…` (v1.15) | `sha256:f97f4f66…` (v1.16) | **yes — the cascade** |
| FSPEC | `sha256:91ef2557…` (v1.6) | `sha256:91ef2557…` | no |
| TSPEC | `sha256:3fa21acf…` (v1.11) | `sha256:3fa21acf…` | no |
| DECISIONS (subject) | `sha256:ef59893d…` (v1.11) | unchanged | no |

**The delta, in full.** `git diff 3143290a..HEAD -- REQ` is two hunks, twelve inserted lines, two
deleted:

1. Version `1.15` → `1.16` plus a v1.16 changelog paragraph (REQ `:15-23`).
2. **AC-6.3 gains a second sentence** (REQ `:533-536`): *"Where the halt report points the operator
   at a captured pre-A6 tree state, it also warns, in the same place, that re-running this feature
   overwrites that capture — so an operator who intends to inspect it preserves it first, rather
   than losing it to the ordinary next action after a halt (DEC-A6-03)."*

Nothing else in REQ moved — AC-5.1, C-2, C-5, BR/NFR text and the O-table are byte-identical, so the
three other places this record leans on REQ (`:98` and `:195` and `:272` on AC-5.1's ignored-path
map; `:503` and `:535-537` on C-2's `waveBudgetPerRun: 0` affordance; `:441` on AC-5.1's operator
files) are unaffected and I re-confirm them without re-litigating them.

**Why this cascade is not a formality.** The edit is not incidental to this document — it is the
landing of an obligation *this document itself routed*, and DEC-A6-03 contains a paragraph and a
re-evaluation trigger whose truth value is defined by whether that landing has happened. The
question this round answers is therefore narrow and sharp: is DEC-A6-03 still a faithful
compression of REQ as REQ now stands?

## Options Considered

_pending_

## Decision

_pending_

## Consequences

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_
