# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.4 (sha256:60a516fb…, re-verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 7 (targeted erratum delta confirmation)

## Overview

This is a targeted erratum delta confirmation carrying **one** routed item. The headline result is
unusual and needs stating plainly up front:

**No edit landed on this FSPEC, and none should have. The routed item is not an FSPEC item.**

The item reads: *"§2.1's co-change table lists only five in-repo sites; the two sibling-feature
document edits (`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26` and FSPEC §5.2's
per-class count 5 → 6) are missing, so the implementation-visible site list does not match
DEC-STATS-01's K-7."* Every noun in it is real, and every one of them lives somewhere other than
this document:

- **This FSPEC has no co-change table.** `§2.1` is *Acceptance criteria coverage* — a REQ-criterion →
  flow → rules → tests traceability matrix. `grep -in "co-change\|in-repo site\|sites"` over
  `FSPEC-pdlc-stats.md` returns **zero** hits. There is no five-row site list here to extend.
- **The table the item describes lives in `DECISIONS-pdlc-stats.md`**, under *Options Considered* →
  DEC-STATS-01 (`:129`). It is already at **nine** sweep-derived sites, not five, as of the round-3
  and round-4 DECISIONS edits (`e630dd867`, `17ddc28a0`, `a709b1be9`).
- **K-7 already owns exactly the two sibling-feature document edits the item asks for**
  (`DECISIONS-pdlc-stats.md:464`): TSPEC §5.4 gains `PK-26`, its vendored-members note moves five →
  six, and the sibling FSPEC §5.2's per-class count moves five → six, in the same change as
  `_tspec-packed-set.mjs`.

The likely cause of the mis-route is visible in the item's own text: it names **"FSPEC §5.2"**, and
that is `docs/completed/pdlc-engine-distribution/FSPEC-…md` — a *different feature's* completed
FSPEC, at `:583` and `:19`, currently reading "five vendored workflow members". The bare token
`FSPEC` appears to have been resolved to the feature under review rather than to the sibling
document K-7 names.

So the substance of the item is **already discharged**, one document over. Nothing is missing from
the pipeline; one routed slip is addressed to the wrong file. Asking this FSPEC to carry a vendoring
site table would in fact be an **altitude violation** — enumeration co-change sets are TSPEC and
DECISIONS material, not behavioural specification.

Per DEC-ERR-03 I did not stop at the item list. I re-verified the upstream REQ at its current
version and re-walked every FSPEC claim that leans on it. `REQ-pdlc-stats.md` hashes
`sha256:60a516fb…` at HEAD — **byte-identical** to the `UPSTREAM-STATE` anchor on my v6 approval, so
no upstream text has moved beneath this document. `git diff 7ca956d0e HEAD -- FSPEC-pdlc-stats.md`
is likewise **empty**: the document is byte-identical to the bytes I approved at v6, and
`REVIEWED-COMMIT: 6e7985d14` is still its tip.

That byte-identity has one consequence I must record rather than silently drop: the four findings I
left open at v6 are all still open, untouched. They are carried forward below tagged `inherited` so
they route back to the ordinary revision loop rather than vanishing because this round happened to
edit nothing. None is High. Nothing here gates the phase.

## Linked Requirements

The DEC-ERR-03 obligation is to re-read the upstream *as it stands now*, not as the item list
describes it. Method and result:

| Check | Command / anchor | Result |
|---|---|---|
| Upstream REQ identity | `sha256sum docs/pdlc-stats/REQ-pdlc-stats.md` | `60a516fb2ede…f1c9` |
| v6 `UPSTREAM-STATE` anchor | `CROSS-REVIEW-…-FSPEC-v6.md` trailer | `60a516fb2ede…f1c9` — **match** |
| REQ moved since v6? | `git diff 7ca956d0e HEAD -- REQ-pdlc-stats.md` | empty |
| FSPEC moved this round? | `git diff 7ca956d0e HEAD -- FSPEC-pdlc-stats.md` | empty |
| FSPEC tip | `git log -1 -- FSPEC-pdlc-stats.md` | `6e7985d14` = v6's `REVIEWED-COMMIT` |

Both sides of the pin are frozen. There is no upstream drift for this confirmation to catch, and no
delta edit to audit — a materially different situation from v6, where I had a nine-item, three-defect
edit to verify.

§2.1's coverage matrix — the section the routed item names — was therefore re-read on its own terms,
as traceability. All nine REQ criteria (`REQ-STATS-01` … `REQ-STATS-09`) carry a non-empty surface,
rules and acceptance-test cell; no row is empty, which is the property §2.1 declares about itself
("no row is empty; a criterion with no surface would mean the FSPEC under-specifies the command").
`REQ-STATS-09`'s row still carries its `D-9` marker. §2.2's constraint coverage still discharges
`C-1`…`C-5`, and §2.3 still maps `G-1`…`G-4`. Nothing in §2 needs the site list the item asks for,
and nothing in §2 is stale against REQ v1.4.

## Behavioral Flow

Re-read §3.1–§3.4 against REQ v1.4. Flow A (`pdlc stats {feature}`), Flow B (fleet mode), Flow C
(`--json`) and §3.4's read-only flows are unchanged and remain faithful to the criteria they
discharge. The v6 confirmation walked these in detail after a substantive edit; with the bytes
frozen and the upstream frozen, that verification stands unchanged and I do not re-litigate it.

One point worth re-affirming because the routed item brushes against it: nothing in §3 describes how
`lib/stats.mjs` is packaged, vendored or enumerated. That is correct. The flows describe what an
operator observes; the module's placement and its co-change set are DEC-STATS-01's subject and the
PLAN's obligation. The absence the item reports is not an absence in this layer.

## Business Rules

§4.1–§4.5 re-read against REQ v1.4. The three defects closed in the v6 round remain correctly
closed:

- **BR-11** still states the harvested predicate over `CODE_REVIEW-{feature}-v{N}.md`'s *version
  grammar*, matching REQ-STATS-04 at HEAD, and still decides the non-matching leftovers explicitly.
- **BR-16** still states its predicate over the documented basename grammar, agreeing with BR-14's
  numerator and REQ-STATS-06.
- **BR-25** still names both the directory and the loose-file illustration.

Two inherited defects still sit in this section and are carried forward as findings below: **BR-27**
(§4.5) attributes a quoted string to `REQ-STATS-07` when it lives at `G-3`, a goal, and frames its
narrowing as a live erratum that REQ-STATS-07 at HEAD no longer disputes; and **BR-06** (§4.2)
still calls the `-REVIEW-` malformed disposition "a wording defect of the upstream criterion" after
REQ-STATS-03 decided that case in `D-8`'s direction.

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
