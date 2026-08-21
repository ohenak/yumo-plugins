# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation, erratum round Phase F)

## Problem / Context

I approved this REQ at v4. Since then one erratum edit landed across three commits
(`88c3554f`, `f3fbbc7b`, `0cef7148`), touching 15 lines and removing 7: the lineage header
(`Upstream`, `Cross-Reviews`, version/changelog), §6 AC-1.1, §6 AC-5.1, and §7 R-5. The routed list
carried one High (TE F-01, AC-5.1's carrier exclusion omitting AC-6.2), four Lows taken, and two
Lows explicitly not taken as inherited/nonlocal.

This round answers one question: does that delta land the routed items without breaking what v4
approved, and — per DEC-ERR-03 — is the document still a faithful compression of the upstream it
leans on, read at upstream's current bytes rather than at the version the REQ was written against.

## Goals

1. Confirm each routed item either landed in the bytes or is correctly recorded as not taken.
2. Re-read the upstream this REQ now cites — `docs/_constraints/pdlc-wave-gate-baseline.md` v1.2 and
   `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` — at HEAD, and verify every id and
   commit the delta newly pins is still said, and still said the same way, upstream.
3. Verify the edit broke nothing in the sections it did not target.

## Non-Goals

- Re-reviewing sections the erratum did not touch. Unchanged material approved at v4 stands.
- Re-litigating decisions this REQ already closed, or the two Lows dispositioned "not taken" —
  except where this round's own bytes changed the fact underneath one of them (see F-01).
- FSPEC/TSPEC/PLAN altitude material. Mechanism remains O-1's and TSPEC's.

## Constraints

Measured at HEAD, not recalled:

| # | Check | Result |
|---|---|---|
| 1 | `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` resolves | Present (26.7K). The `Upstream` row is now a reachable path. |
| 2 | Every upstream id this REQ cites exists at HEAD — AC-1.6, AC-2.2, AC-3.4, AC-3.6, AC-9.2, NFR-1, BL-01 | All seven resolve in the tier REQ (`:87`, `:109`, `:134`, `:148`, `:276`, `:321`, `:347`). Upstream is unchanged at v1.4 / 2026-08-03, so no withdrawal or re-anchoring happened under this REQ. |
| 3 | `11420461`, newly pinned by AC-1.1 and R-5, is what upstream says | Baseline v1.2 header: "§1–§2 at `c8aa22a4`; §3 at `1efb9a3b`; §4 at `11420461`". §4 states M-WG-8's five-member reading is "true at `c8aa22a4`, false at this base", and M-WG-13/M-WG-14 are the post-change readings. The pin is upstream's own word, at the right section, for the right facts. |
| 4 | Baseline version cited (`v1.2`) matches upstream's `Version` field | Yes — `1.2 · 2026-08-20`. |
| 5 | C-5's quoted thresholds match the hook | Exact: `pdlc/hooks/scripts/check-req-size.sh` `LINE_LIMIT=700`, `BYTE_LIMIT=61440`, `SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`. |
| 6 | Document size after the edit | 676 lines / 54,803 bytes. Over the 630-line soft threshold, 24 lines under the hard ceiling, 493 bytes under the soft byte threshold. See F-01. |
| 7 | The `Cross-Reviews` claim | LEARNINGS `:10` enumerates the 116 harvested rounds as "all deleted in the harvest commit"; the twelve `CROSS-REVIEW-*` files now on the branch are post-harvest erratum rounds appearing in no LEARNINGS table. The rewritten row is accurate. |

## Acceptance Criteria

Item-by-item disposition of the routed list. "Landed" means I read the bytes at HEAD, not the
changelog's claim about them.

| Routed item | Raised by | Landed? | Evidence at HEAD |
|---|---|---|---|
| Low/delta/local — `Upstream` dropped the resolvable path | se-review (F-02), te-review (F-02) | Yes | Header row now reads `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (the five-seam tier this extends) → **REQ**. Path resolves; the chain form is retained alongside it, so nothing v4 approved was lost. |
| Low/delta/local — `Cross-Reviews` over-claimed harvest | se-review (F-03) | Yes | Row now scopes harvest to "rounds through harvest … in `LEARNINGS-…`" and names the on-branch files as post-harvest erratum rounds "in no LEARNINGS table". Cross-checked against LEARNINGS `:10`; accurate. |
| **High**/delta/local — AC-5.1 carrier list omitted AC-6.2's `ESCALATIONS.md` append | te-review (F-01) | Yes | AC-5.1 now excludes "AC-6.1's record append, AC-6.2's escalation-log append, and AC-5.2's queue-row write (M-WG-7)". AC-6.2's Given ("any A6 escalation") is entailed by AC-5.1's Given (refusal, budget exhaustion, red re-gate), so the three carriers the run still owes are now the three the comparison excludes. The self-contradiction at run end is closed. |
| Low/delta/local — AC-1.1 / R-5 left the post-change reading on unpinned "HEAD" | te-review (F-03) | Yes | AC-1.1: "the post-change reading, at `11420461`, carries A6 (baseline v1.2 §4, M-WG-13)". R-5: "M-WG-13/M-WG-14 are the post-change ones, measured at `11420461`". Both agree with the baseline's `Verified at` row verbatim. |
| Low/inherited/nonlocal — C-5 soft-budget overage | se-review (F-04) | Not taken, correctly so | Recorded in the v1.15 changelog as inherited and nonlocal, dissolved by SE Q-02's relocation. I do not reopen it. This round's own bytes did change the numbers underneath it — filed fresh and narrowly as F-01. |
| Low/inherited/nonlocal — baseline `Cited by` row vs §6/§7 | te-review (F-04) | Not taken, correctly so | The defect is in upstream's bytes, not this REQ's; owner is the baseline file. Still open upstream — recorded as F-02 so it is not lost. |

Nothing outside the four targeted locations moved: `git diff c58fd61d..HEAD` is 15 insertions / 7
deletions, all inside the header, AC-1.1, AC-5.1 and R-5. No decision was reopened; no AC's Given,
Then, or trace list changed except AC-5.1's exclusion list and the two commit pins.

## Risks

## Obligations

## Delta-Confirmation Findings

## Verdict
