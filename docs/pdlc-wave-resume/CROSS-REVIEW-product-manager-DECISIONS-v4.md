# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4 (upstream-cascade confirmation, round 4)
**Scope:** Upstream-cascade confirmation. DECISIONS' own bytes are unchanged since the v2 approval
(`sha256:37b3684d…`); TSPEC moved underneath it a fourth time. One question is answered: **is
DECISIONS still a faithful compression of TSPEC as TSPEC now stands?** Product lens only.

## Context

**What moved.** My v3 confirmation re-took the approval against TSPEC `sha256:458e9ec6…`, commit
`b4a628b8`. TSPEC at HEAD is `sha256:5ed76227…`. The round-4 erratum range `b4a628b8..HEAD` is three
commits over one file — 9 insertions, 4 deletions, all of it in two places plus the version header:

| # | TSPEC edit | Where |
|---|---|---|
| 1 | Version bumped `1.2` → `1.3`, with a revision-history row recording the round-4 erratum | `TSPEC:7`, `TSPEC:20` |
| 2 | §5.8's coverage floor re-assigned from "the last implementation wave's `postWaveCommand`" to the **last implementation task** (PLAN T-10, RK-2), with the reason stated: V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a per-wave-scoped setting is not expressible, and a global one would run `test:coverage` after every wave | `TSPEC:846`–`:852` |
| 3 | §6.4's RT-7 mitigation rewritten to match, same substitution and same reason, backstop retained verbatim | `TSPEC:918` |

REQ (`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) match what my v2 approval pinned and what v3
re-confirmed. Neither moved. Nothing in this confirmation concerns them.

**What DECISIONS did not do.** `shasum -a 256` over `DECISIONS-pdlc-wave-resume.md` at HEAD returns
`37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46` — byte-identical to the
`APPROVAL-HASH` recorded in my v2 cross-review and re-affirmed in v3. The document under review has
not been touched for three rounds. Every question here is about whether text changed *underneath*
it.

**Does DECISIONS lean on what moved?** This is the whole confirmation, so it was answered
mechanically before anything else. `grep -n -i "postWave\|coverage\|85\|RT-7\|5\.8\|V-13\|four
keys\|T-10\|RK-2"` over DECISIONS at HEAD returns exactly **two** lines, and neither is a citation
of the moved text:

| DECISIONS line | What it says | Status against TSPEC at HEAD |
|---|---|---|
| `:153` | The invalid-value notice is emitted by a key-generic loop "shared verbatim by every `implementation` key (`testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`)" | Holds. `TSPEC:63` (V-13) and `TSPEC:561` both still close the surface at exactly those four keys; the erratum *reaffirms* V-13 rather than changing it |
| `:472` | "Any wave whose tasks touch the module must name the dist path in `implementation.postWavePathspecs`; the post-wave command runs before the gate" | Holds. `TSPEC:916` (RT-5) still states both halves, and RT-5 was not in the erratum range |

**The shape of the answer.** DECISIONS never cited §5.8, never cited RT-7, and never took a position
on where the coverage floor is enforced — that is a test-strategy and sequencing question, which is
why it lives in TSPEC and PLAN and not here. The one config fact DECISIONS *does* rely on —
`postWaveCommand` is one of four recognised `implementation` keys, and it is global — is the fact the
erratum leaned on to make its correction. Upstream moved toward this document's premise, not away
from it. This is a clean cascade with no product surface touched.

## Options Considered

Not the document's options — mine. A cascade confirmation has a narrow catalogue of verdicts, and
naming the ones I rejected is what makes the one I chose auditable.

**(a) Confirm with no findings, since the delta does not touch anything DECISIONS cites.** Tempting,
and the grep in Context supports the first half of it. Rejected — not because the cascade analysis is
wrong, but because DEC-ERR-03 makes this round's scope *this document measured against its upstream
at HEAD*, not *this document measured against the delta*. Two Medium findings from v3 and two Lows
from v2 are still open in bytes that have not changed. Dropping them because this particular edit did
not touch them would quietly retire findings that were never addressed, and would make the v4 record
read as if the document had improved when it has not moved at all.

**(b) Escalate the two open Medium stale-erratum notes to High, on the grounds that they have now
survived two rounds.** Rejected. Severity is calibrated to user impact, not to age. Both sentences
are still parentheticals inside `## Options Considered` narrative, both still have TSPEC as their
grammatical subject rather than this feature, and striking either one entirely still moves no
acceptance criterion, no constraint row, no re-evaluation trigger and no downstream obligation. The
DEC-ERR-01 demotion that applied in v3 applies unchanged — a false statement in a hand-off or
bookkeeping section is demoted, not promoted, and persistence does not convert bookkeeping into
load-bearing content. Inflating severity to attract attention is exactly what the Scope tags exist to
make unnecessary.

**(c) Raise a finding that DECISIONS should have absorbed the round-4 coverage-floor correction.**
Rejected as out of lens and factually wrong. PLAN already owns this: `PLAN:286` records "Coverage
floor | **T-10**, not `postWaveCommand`" with the erratum it raised, and `PLAN:377` carries it as
RK-2. The correction travelled REQ→FSPEC→TSPEC→PLAN and landed where the obligation is executed.
DECISIONS is a compression of the *decisions taken for this feature*; where a test gate runs is not
one of them, and asking DECISIONS to grow a section for it would be scope creep into a sibling
document.

**(d) Confirm, carrying the two open Mediums and two open Lows forward unchanged, all tagged
`inherited`.** Chosen. It is the only reading that is honest in both directions: the cascade is
clean, and the document's four known defects are still there. Tagging them `inherited` is what keeps
them non-gating and routes them to the owning phase rather than halting this one — which is the
correct disposition for findings that this edit neither introduced nor was asked to fix.

## Decision

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
