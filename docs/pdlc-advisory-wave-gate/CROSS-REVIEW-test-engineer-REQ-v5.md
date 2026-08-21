# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation, erratum round Phase F)

## Problem / Context

This round is a **delta confirmation**, not a fresh review. I approved this REQ at v4
(`CROSS-REVIEW-test-engineer-REQ-v4.md`). A targeted erratum edit has since landed in three commits —
`88c3554f`, `f3fbbc7b`, `0cef7148` — carrying the document from v1.14 to v1.15. The routed items were
four of mine (F-01 High, F-02, F-03, F-04) and three of se-review's (F-02, F-03, F-04).

Method: `git diff c58fd61d..HEAD` on the REQ (15 insertions, 7 deletions, four hunks), then a re-read
of the upstream this REQ now leans on **at HEAD** — `docs/_constraints/pdlc-wave-gate-baseline.md`
v1.2 (`64654032`) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` v1.0 — to check the REQ is
still a faithful compression of what those files currently say (DEC-ERR-03). Sections outside the four
hunks and outside the citation surface were not re-litigated.

## Goals

1. Confirm each routed item either landed or is recorded as deliberately not taken with a reason.
2. Confirm the landed edits did not break anything approved at v4 — in particular that the widened
   AC-5.1 exclusion list stays consistent with AC-6.1/AC-6.2/AC-5.2 and is enumerated in exactly one
   place.
3. Re-measure this REQ against its upstream at HEAD and raise any citation that upstream no longer
   supports as written, whether or not it appears in the routed list.

## Non-Goals

- Re-reviewing unchanged sections (§2–§4, §5 C-1…C-4, §6 REQ-AWG-01…04 beyond AC-1.1, §8) from
  scratch.
- Product-strategy, architecture, or style commentary — the testing lens only.
- Contesting the erratum's not-taken dispositions (C-5 overage, upstream `Cited by` rows); they are
  recorded below as inherited findings so they route, not halt.

## Constraints

- **C-5 (size).** The REQ is now **676 lines** against C-5's own 630-line soft budget and the hook's
  700-line hard limit. v1.14 stood at 668; the v1.15 changelog paragraph adds 8. Still under the hard
  gate, still over the soft one — recorded, not gating (F-01).
- **Citation-at-Version rule.** `pdlc-wave-gate-baseline.md` states "a consumer cites this file **at
  its `Version`**". The REQ cites v1.2 in §5 C-5 and §6; the file at HEAD is v1.2 with
  `Verified at | §1–§2 at c8aa22a4; §3 at 1efb9a3b; §4 at 11420461`. The pins the erratum introduced
  match that row exactly.
- **Altitude.** The added text is outcome-language (which appends are excluded from a tree
  comparison, which commits the readings were taken at). No seam design, no test-double design, no
  assertion placement leaked into the REQ.

## Acceptance Criteria

Item-by-item verification of the seven routed items.

| Routed item | Landed? | Evidence |
|---|---|---|
| SE F-02 / TE F-02 — `Upstream` row lost the resolvable path | **Yes** | Header now reads `` `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (the five-seam tier this extends) → **REQ** ``. Path resolves at HEAD (`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` exists). |
| SE F-03 — `Cross-Reviews` overclaimed harvest | **Yes** | Row now scopes harvest: "rounds through harvest are in `LEARNINGS-…`; the `CROSS-REVIEW-*` files on the branch are post-harvest erratum rounds, in no LEARNINGS table". Matches the branch state (twelve `CROSS-REVIEW-*` files present, none enumerated in LEARNINGS' round tables). |
| **TE F-01 (High)** — AC-5.1 carrier list omitted AC-6.2's `ESCALATIONS.md` append | **Yes** | §6 AC-5.1 excluded set is now "AC-6.1's record append, AC-6.2's escalation-log append, and AC-5.2's queue-row write (M-WG-7)". The refusal/budget/red-re-gate Given requires all three; the "observably identical" criterion is no longer self-contradictory at run end. Verified this is the **only** enumeration of the excluded-carrier set in the document (`grep` for `excluded`/`observably identical`/`queue-row write` → one normative site, line 500–501, plus the changelog and the AC-3.2/3.3 exclusion set, which is a different closed set and untouched). |
| TE F-03 — post-change reading left on unpinned "HEAD" | **Yes** | §6 AC-1.1: "the post-change reading, at `11420461`, carries A6 (baseline v1.2 §4, M-WG-13)". §7 R-5: "M-WG-13/M-WG-14 are the post-change ones, measured at `11420461`". Both agree with upstream's `Verified at` row. A test can now name both endpoints of the before/after comparison by commit. |
| SE F-04 — C-5 soft-budget overage | Not taken, recorded | Changelog names it inherited/nonlocal and dissolved by SE Q-02's relocation. Re-raised below as F-01 (Low, inherited) so it routes. |
| TE F-04 — baseline `Cited by` row vs §6/§7 | Not taken, recorded | Upstream row is upstream's to edit. Re-raised below as F-03 (Low, inherited). |
| — | New this round | Version/changelog bookkeeping: header `1.15`, changelog paragraph names every taken and not-taken item with its raiser. Accurate against the diff. |

**Upstream-fidelity re-read (DEC-ERR-03).** Every `M-WG-*` id the REQ cites resolves in
`pdlc-wave-gate-baseline.md` v1.2 at HEAD (M-WG-1…M-WG-14), and the §4 facts the erratum now pins —
M-WG-13's six-member `ADVISORY_SEAMS`, M-WG-14's six-member `ENVELOPE_DEFAULTS` — are stated there as
the REQ paraphrases them. `pdlc-advisory-corpus-baseline.md` §3 (reuse the exported resolver, do not
restate literals) and §4 (escalations durable, resolutions observable only as absence) still say what
C-1, NFR-6, AC-6.4 and O-2 attribute to them. One compression drifted: §1 of the corpus baseline
locates deletion of `ADVISORY-{feature}.md` at **Phase H2's distil**, while AC-6.4 and O-2 say
"deleted after Phase PUB" — see F-02.

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
