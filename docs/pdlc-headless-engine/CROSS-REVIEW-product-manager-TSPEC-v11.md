# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.9)
**Date:** 2026-08-11
**Iteration:** 11
**Mode:** Delta confirmation of the Phase-T erratum edit against a previously approved TSPEC.
Scope is limited to the two errata raised in round 10 (one pm-review, one te-review); no
re-litigation of settled design.

## Confirmation of raised errata

| Erratum | Raised by | Claim | State at HEAD | Confirmed |
|---|---|---|---|---|
| E-01 | pm-review | TSPEC pinned FSPEC v1.6 and cited pre-insertion rung-4a anchors (`FSPEC:299`, `:406-407`) | Lineage header (`TSPEC:9`) and v1.9 changelog (`:19`) pin **FSPEC v1.7**; ladder row cited at `FSPEC:307` (`TSPEC:1056`), EC-START-10/11 at `:416`/`:417` (`TSPEC:2201-2202`) | Resolved |
| E-02 | te-review | Header pin and BR-START-1's "no probe of any kind" reading outstanding after FSPEC v1.7 landed the *billable* qualifier | §7.8 (`TSPEC:2248-2256`) quotes v1.7's BR-START-1 verbatim including the *billable* qualifier and the local-checks clause; §9.3 (`TSPEC:2478-2489`) records the erratum **resolved in FSPEC v1.7** and states no erratum remains outstanding | Resolved |

## Anchor verification (each re-read at HEAD)

| Citation | Lands on | OK |
|---|---|---|
| `FSPEC:307` | rung 4a row, "**guard executable (C-11)**" | yes |
| `FSPEC:310-313` | BR-START-1, "no *billable* probe of any kind" + local-checks clause | yes |
| `FSPEC:416` / `:417` | EC-START-10 / EC-START-11 | yes |
| `FSPEC:928-931` / `:932-933` | BR-GUARD-6 candidate set / "observed by **running**" | yes |
| `FSPEC:977` | AT-ENG-11a | yes |
| `FSPEC:300-308` | ladder table (header `:300` through rung 5 `:308`) | yes |
| `FSPEC:218`, `:223-225`, `:572-574`, `:690-694`, `:747`, `:1213-1223` | mechanical +8/+10 shift, each on claimed text | yes |
| `REQ:284` | C-11, REQ still v0.10 (correctly untouched) | yes |

The §4.3 mis-reference "FSPEC §5's ladder" is corrected: `TSPEC:1050` now reads
"FSPEC §4.1's ladder, verbatim", which is where the ladder lives.

## Residual `v1.6` / stale-anchor mentions — checked, not findings

Every remaining occurrence of `FSPEC v1.6` and of the pre-shift line numbers sits either in the
v1.9 changelog's own description of the shift (`TSPEC:19`, `:27-34`) or inside prior changelog
entries (`:42-43`, `:76`, `:124`), which record the pin in force when those revisions were written.
The v1.9 entry states this explicitly and it is the right call: changelogs are history, and
rewriting them would destroy the audit trail this pipeline depends on. The pin in force now appears
in exactly two live places, the lineage header and the v1.9 entry, and both say v1.7.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | None. No open High, Medium or Low finding from this delta pass; no prior finding reopened. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The edit stayed inside its mandate: citation re-grounding and one pin move, with the v1.9
  changelog stating plainly that no design, decision or mechanism changed. Verified against the
  body — §7.8's design text is unchanged apart from the quotation it was already written to.
- §9.3 closes the erratum in place rather than deleting it, so a later reader sees which round it
  was raised in and which upstream version discharged it. That is the behaviour that stops the same
  erratum being re-raised in a future round.
- The document distinguishes *its* off-by-one (withdrawn round-8 note about
  `guard-harvest-before-delete.sh:14-21`) from upstream's, and fixes the one it owns. Honest
  bookkeeping.
- Product intent is preserved end to end: C-11's promise — a host that cannot run the guard does not
  run pdlc unattended — still reaches the user as a rung-4a refusal that dispatches nothing and names
  the remedy (EC-START-10), and the billable-probe qualifier does not weaken it.

## Recommendation

**Approved**

Both errata are discharged, every re-grounded anchor lands on the text it claims, and no acceptance
criterion moved. Prior approval of TSPEC stands.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:677d908b52b1a9c413abc1cd4a08cc2d49fa98d8065c16708112973ff6b7f739
REVIEWED-COMMIT: 03d28fc60f1189bf2e7ec472fcf784c70b3462d3
