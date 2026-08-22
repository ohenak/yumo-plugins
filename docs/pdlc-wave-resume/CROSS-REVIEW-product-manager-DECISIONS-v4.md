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

**DECISIONS still holds as approved against TSPEC as it now stands.** Confirmed. No new finding is
raised by this round's delta; four findings are carried forward, all `inherited`, none gating.

Edit by edit, against TSPEC at HEAD:

**Edit 1 — the version header and revision-history row (`TSPEC:7`, `TSPEC:20`).** Bookkeeping.
DECISIONS pins no TSPEC version number anywhere — `grep -n "TSPEC v1"` over DECISIONS returns
nothing, so the bump cannot falsify a citation. Worth noting for its own sake: the new row states
"Corrections only; no decision re-litigated and no scope change", and the diff bears that out — the
floor itself, its 85% threshold and its backstop are carried through unchanged. That is the erratum
mechanism behaving as designed, and it is what makes this confirmation cheap.

**Edit 2 — §5.8's coverage floor re-assigned to the last implementation task (`TSPEC:846`–`:852`).**
The substitution is `the last implementation wave's postWaveCommand` → `the last implementation task
(PLAN T-10, RK-2)`, with the reason now stated inline. DECISIONS says nothing about §5.8, the
coverage floor, the 85% branch threshold, T-10 or RK-2 — verified by grep, reported in Context. The
one adjacent fact DECISIONS does assert is `:153`'s enumeration of the four `implementation` keys,
and the erratum's own justification quotes that same four-key surface (V-13) as its premise. Both
documents now say, independently, that `postWaveCommand` is a single global key. **The compression is
faithful and got no less faithful.** No finding.

**Edit 3 — RT-7's mitigation rewritten to match (`TSPEC:918`).** Same substitution, same reason,
backstop preserved word for word ("the per-arm unit coverage of §5.3 and the generative suite of §5.7
are designed to cover the added branches directly, and the risk degrades to a PUB-time finding rather
than a silent one"). DECISIONS' own risk material is in `## Consequences` and in the measured-surface
table; neither cites RT-7. The nearest neighbour is DECISIONS `:472`, which cites the *post-wave
command runs before the gate* fact that RT-**5** owns — and `TSPEC:916` still states it verbatim,
outside the erratum range. No finding.

**What is still open, and unchanged.** Four findings, none introduced by this round:

- **Medium (was v3 F-01, now F-01).** DECISIONS `:205`–`:207` quotes TSPEC §3.1 as saying "four of
  the seven reasons interpolate" and reports the correction as an outstanding erratum. `git grep -n
  'four of the seven'` over TSPEC at HEAD returns **no hits**; `TSPEC:426`–`:428` reads "Three of the
  seven reasons interpolate run-specific values … carrying four interpolated values between them",
  which is DECISIONS' own count, adopted. The substantive sentence above the parenthetical
  (`:200`–`:204`) is correct and should not change; only the parenthetical's tense and attribution
  are stale.
- **Medium (was v3 F-02, now F-02).** DECISIONS `:167`–`:169` asserts "TSPEC §2.4's announcement
  table omits the invalid-pointer notice entirely rather than excluding it by rule; that is an
  upstream gap". §2.4 at HEAD closes the catalogue by rule, states the `iff` criterion, and gives the
  excluded notice its own table row with an exclusion reason. The gap the sentence reports no longer
  exists.
- **Low (was v2 F-01, v3 F-03, now F-03).** DECISIONS `:44`'s measured-surface row calls
  `pdlc/workflows/dist/pdlc-cli.mjs` "a *generated* artifact built from the module below"; the
  artifact's own header names `orchestrate-dev.js` **and** `cli.mjs` as inputs. Re-verified at HEAD;
  still open.
- **Low (was v2 F-02, v3 F-04, now F-04).** DEC-WVR-05's `*(observable)*` re-evaluation trigger
  depends on a contiguity property that no assertion in its Consequences row owes, so the trigger has
  no detector. Untouched this round; still open.

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
