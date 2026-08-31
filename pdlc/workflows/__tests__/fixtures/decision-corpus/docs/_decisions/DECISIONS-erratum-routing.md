# DECISIONS — erratum routing

Project-level decisions about how findings raised outside the primary author↔reviewer round get
routed into erratum items. Promoted 2026-08-27 by `/pdlc:consolidate-learnings` from LEARNINGS
`pdlc-wave-resume`, `pdlc-learnings-injection`, `pdlc-advisory-wave-gate` and `pdlc-engineering-loop`.

Read by `orchestrate-dev` (erratum dispatch construction) and reviewer skills operating on a
cascade/delta-confirmation or re-grounding round.

---

## DEC-ERRROUTE-01: A confirmation round's findings must mechanically mint erratum items

**Decision.** A cascade or delta-confirmation round's findings must mechanically mint an erratum
item for each finding raised. A finding recorded in a confirmation cross-review that mints no
erratum item is a **routing defect**, not reviewer discretion — the round has no mechanism that
lets a reviewer choose to let a finding stop at prose.

**Origin.** Promoted 2026-08-27 from LEARNINGS of pdlc-wave-resume (the feature's own
`POSTMORTEM` concludes "a routing failure … will recur" over this exact channel),
pdlc-learnings-injection (3 of the feature's erratum halts land on this channel, the first two the
same failure two phases apart), pdlc-advisory-wave-gate.

---

## DEC-ERRROUTE-02: The erratum channel's round budget must scale with the routed change

**Decision.** The erratum channel's round budget must scale with the altitude/size of the change
routed into it. A fixed 1–2 round budget fed a full architectural section is a **mis-sized
channel**, not a failed review — the channel's capacity, not the reviewer's diligence, is the
defect to fix.

**Origin.** Promoted 2026-08-27 from LEARNINGS of pdlc-engineering-loop (Phase P halted on this),
pdlc-advisory-wave-gate (the T→P erratum halt).

---

## DEC-ERRROUTE-03: Partial re-grounding is worse than none

**Decision.** An erratum or re-grounding dispatch must diff the **full named upstream interval or
commit** and enumerate every absorption and withdrawal before editing — never just the raised item
list. A dispatch that re-grounds against only the items a finding named, while other changes in the
same interval go unabsorbed, leaves the document in a state worse than not re-grounding at all: it
reads as reconciled when it is not.

**Rationale.** Four independent instances of the same failure shape:

- `pdlc-advisory-wave-gate`: a v1.4 re-ground absorbed half the named upstream interval and left
  the rest silently unaddressed.
- `pdlc-learnings-injection`: a `POSTMORTEM`-driven PR package was never included in the routed
  list, so its change never reached the target document.
- `pdlc-wave-resume`: a changelog implied two absorptions; only one was actually performed.
- `pdlc-engineering-loop`: a C-1 truncate/restore occurred **inside** a confirmed delta — the
  round confirmed a state that its own edit then silently reverted.

**Origin.** Promoted 2026-08-27 from LEARNINGS of pdlc-advisory-wave-gate, pdlc-learnings-injection,
pdlc-wave-resume, pdlc-engineering-loop.

---

## DEC-ERRROUTE-04: a confirmation round with an unchanged document pin-checks, it does not re-review

**Decision.** When a confirmation round's own document hash is unchanged across the round boundary —
only its upstream pins moved — the round dispatches as a dependency-cell pin-check, not a full
re-review. A pin-check is cheap and batchable: one sweep can cover multiple documents whose own
content did not change. This is a decision about the document's hash, not about the round's verdict —
the document's bytes stayed put; only what it points at moved.

**Rationale.** The failure mode this closes is proving, round after round, that late upstream edits
did not silently invalidate an already-approved downstream document, at the cost of a full review
dispatch each time the fact needed re-establishing.

**Origin.** Cross-repo. `yumo-plugins`: `pdlc-wave-resume` — 2 of PLAN/TSPEC's 7 rounds were
confirmation rounds in which the document's bytes never moved. `regime-ledger` (external corpus, relayed
cross-session 2026-08-27): `longhorizon-product-scaffold` — DECISIONS v2–v7 and PLAN v2–v7 each carried
an identical hash across six rounds, with only upstream pins moving, inside a 112-cross-review-file
feature; `macro-nightly-job` — rounds 3 and later were overwhelmingly cascade-confirmation closing at
{high: 0, medium: 1–2}, with the harvest's own verdict recorded as "the expensive part was not getting
the spec right; it was proving, repeatedly, that late upstream edits had not silently invalidated
approved downstream text." The regime-ledger evidence is cited from that repo's harvest summaries, its surviving primary
source post-harvest. Promoted here in the cross-repo consolidation pass of 2026-08-27
(`2026-08-27-2`) alongside regime-ledger's own same-day consolidation pass.
