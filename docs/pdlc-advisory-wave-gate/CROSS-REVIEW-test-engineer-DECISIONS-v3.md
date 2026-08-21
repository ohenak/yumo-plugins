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

Three dispositions were open for this confirmation.

**A. Confirm unchanged — the delta lands an obligation, DECISIONS wanted it landed, nothing to do.**
This is the reading the item list invites: the routed item landed, so the cascade is satisfied.
Rejected. The item landing is necessary, not sufficient (DEC-ERR-03). DEC-A6-03 does not merely
*want* the obligation landed — it makes a **positive factual claim about upstream's current text**
and hangs a documented gap on it (`DECISIONS:357-362`):

> **The routing has not landed** (PM Q-02, TE): at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, "copy
> the ref" and "overwrit" match nothing in either document, so FSPEC E-28 and AT-05-5 still require
> only that the halt name the failed restoration, and an operator still learns the ref's name at
> halt and nothing about the ordinary next action destroying it. … This entry carries the gap until
> it lands.

I re-ran that document's own grep at HEAD. `overwrit` now matches REQ `:23` and REQ `:535`. The
claim's REQ half is false at HEAD, and it is false in the direction that matters: the record says
*no requirement obliges the halt message to warn*, and at HEAD one does. Confirming unchanged would
leave a decision record asserting the absence of a requirement that exists.

**B. File it as an inherited finding — the paragraph was already there before this round.**
Rejected on provenance grounds. The bytes are inherited; the **falsity is not**. At the moment my v2
approval was taken the paragraph was true — I verified it then and said so in v2's `## Decision`
("at REQ v1.15 and FSPEC v1.6 … still match zero lines … the document is right about its own gap").
This round's edit is precisely what made it false. That is the definition of `delta` provenance:
"this round's edit introduced it". Mis-tagging it `inherited` would route it back as a pre-existing
Phase-D defect and understate that the cascade caused it.

**C. Confirm with a delta finding against DEC-A6-03, scoped to the staleness and its oracle
consequence.** Chosen. See `## Decision`.

**A fourth option I explicitly did not take: re-opening the decision.** DEC-A6-03's *decision* —
`refs/pdlc/a6-snapshot-{waveNum}`, wave-scoped, no run discriminator, overwritten on re-run — is
untouched by this cascade and stays exactly where v1.11 leaves it. REQ v1.16 does not contest the
ref's shape; it obliges the halt report to *say* what that shape costs. The finding below is about
the record's description of upstream, never about which side of the option the decision landed on.

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
