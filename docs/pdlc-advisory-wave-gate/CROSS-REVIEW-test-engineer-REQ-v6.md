# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.16)
**Date:** 2026-08-20
**Iteration:** 6 (delta confirmation, erratum round — DEC-A6-03 halt-message obligation)

## Problem / Context

This round is a **delta confirmation**, not a review. I approved this REQ at v5
(`CROSS-REVIEW-test-engineer-REQ-v5.md`, `REVIEWED-COMMIT: 0cef7148`, document v1.15). One targeted
erratum edit has since landed — `30d8bf7b`, carrying the document to v1.16 — addressing the single
item this round routed, raised identically by se-author, pm-review and me: DEC-A6-03's
operator-facing halt-message obligation (the halt names a captured pre-A6 tree state but never warns
that re-running the feature destroys it) had been routed since round 5 and never landed.

Method: `git show 30d8bf7b` on the REQ (12 insertions, 2 deletions, two hunks — the version/changelog
header and §6 AC-6.3), then a re-read of the upstream this REQ leans on **at HEAD** —
`docs/_constraints/pdlc-wave-gate-baseline.md` v1.2 (`64654032`, unchanged since v5),
`docs/_constraints/pdlc-advisory-corpus-baseline.md` v1.0 (unchanged since v5), and this feature's
`DECISIONS-pdlc-advisory-wave-gate.md` DEC-A6-03, which AC-6.3 now cites by id — to check the REQ is
still a faithful compression of what those files currently say (DEC-ERR-03). Sections outside the two
hunks are not re-litigated except where the upstream re-read reaches them.

## Goals

1. Confirm the routed item landed, as an observable operator-visible outcome rather than a mechanism.
2. Confirm the landed edit breaks nothing I approved at v5 — in particular that AC-6.3 still carries
   its original diagnosis/root-cause obligation, that the addition leaks no capture *name* or storage
   form across the O-1 boundary, and that AC-5.1's excluded-carrier set (the v5 High) is untouched.
3. Re-measure the REQ against upstream at HEAD and report any citation upstream no longer supports,
   whether or not it appears in the routed item list (DEC-ERR-03).

## Non-Goals

- Re-reviewing sections this edit did not touch and the upstream re-read does not reach (§2–§4,
  §5 C-1…C-4, §6 REQ-AWG-01…05, §7, §8 beyond O-1/O-2).
- Product strategy, technical design, or the FSPEC's parallel landing. This confirmation measures the
  **REQ**; whether FSPEC E-28/AT-05-5 also need the warning is the FSPEC's own round (see F-01, which
  raises only the consequence for testability *of this REQ*).
- Reopening DEC-A6-03. The decision is unchanged; only its routed operator-facing obligation moved.

## Constraints

- **Size (C-5).** The REQ is now **686 lines / 55,627 bytes** — inside C-5's 700-line / 61,440-byte
  hard gate, over its 630-line / 55,296-byte soft budget, and +10 lines on v1.15's 676. The overage
  pre-dates this round; this edit widened it by 10 (F-03).
- **Citation-at-version.** `pdlc-wave-gate-baseline.md` is cited at v1.2 and reads v1.2 at HEAD;
  `pdlc-advisory-corpus-baseline.md` is cited at v1.0 and reads v1.0 at HEAD. Neither file has changed
  since my v5 read (`git log -- docs/_constraints/` still tops out at `64654032`), so v5's
  upstream-fidelity conclusions carry forward unchanged, including its two open Lows (F-04, F-05).
- **Altitude (O-1).** The new AC-6.3 clause names no ref, no namespace, no storage form — it says
  "a captured pre-A6 tree state" and "re-running this feature overwrites that capture". That is the
  correct REQ altitude: the operator-visible outcome, with the capture's name and mechanism left to
  the TSPEC as O-1 binds. No seam design, fixture design, or assertion placement leaked in.

## Acceptance Criteria

Item-by-item verification of this round's routed item (all four list entries are the same item,
raised by three reviewers).

| Routed item | Landed? | Evidence |
|---|---|---|
| DEC-A6-03's halt-message obligation: the halt names the capture but never warns the ordinary next action destroys it (te-review ×2, se-author, pm-review) | **Yes** | §6 AC-6.3 now reads: "Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the same place, that re-running this feature overwrites that capture — so an operator who intends to inspect it preserves it first, rather than losing it to the ordinary next action after a halt (DEC-A6-03)." The warning is pinned to *the same place* as the pointer, which is exactly the property the routed item said was missing (a remedy that lives only in TSPEC §2.5 and the DECISIONS record is a remedy the operator never reads at halt time). |
| Bookkeeping | **Yes** | Header row bumped `1.15` → `1.16`; a v1.16 changelog paragraph names the item, all three raisers, the AC it landed in, and the O-1 boundary it deliberately did not cross. "Nothing else changed; no decision reopened" is accurate against the diff — the two hunks are the header and AC-6.3, nothing else. |

**Non-regression checks against what I approved at v5.**

- AC-6.3's pre-existing obligation (halt report carries the diagnosis and the root-cause class,
  US-02) is intact and unmodified; the new sentence is additive and separately falsifiable.
- AC-5.1's excluded-carrier enumeration — the v5 High — is byte-identical; the new clause adds no
  fourth run-owed write and does not touch the tree-identity oracle.
- AC-3.2/AC-3.3's separate closed exclusion set is untouched. No ripple.
- The `*(US-02.)*` trace is preserved, so the added obligation stays traceable to a user scenario.

**Testability of the landed clause.** A black-box acceptance test is writable from it: drive a wave
to an A6 escalation whose halt report points at a captured pre-A6 tree state; assert the report body
that names the capture also contains a re-run-overwrites warning; assert both are in the same report
section. One caveat on the antecedent is filed as F-01.

**Upstream-fidelity re-read (DEC-ERR-03).** Both constraint baselines are unchanged at HEAD, so v5's
two open compression Lows persist verbatim (F-04, F-05) and no new upstream drift appeared. The one
new fidelity problem is *internal* to this feature and created by this round: AC-6.3 now cites
DEC-A6-03, and DEC-A6-03 at HEAD (`DECISIONS-…:353-362`) still asserts, in its **Known gap in the
remedy's reach** paragraph, that "**The routing has not landed** (PM Q-02, TE): at REQ v1.15 and
FSPEC v1.6, `a6-snapshot`, 'copy the ref' and 'overwrit' match nothing in either document". As of
v1.16 that is half-false for the REQ. The citing document and the cited record now disagree about
whether the cited obligation exists (F-02).

## Risks

## Questions

## Positive Observations

## Obligations

## Recommendation

## Delta-Confirmation Findings

## Verdict
