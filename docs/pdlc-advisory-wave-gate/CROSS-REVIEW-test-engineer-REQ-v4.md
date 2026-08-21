# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.14)
**Delta reviewed:** `4b925b1a..c58fd61d` (three erratum commits: lineage/Status, `c8aa22a4` base, AC-5.1)
**Date:** 2026-08-20
**Iteration:** 4 (delta confirmation — this REQ was previously approved at v1.13)

## Problem / Context

This is an erratum delta confirmation, not a fresh review. I approved this REQ at v1.13. A targeted
erratum landed in three commits and bumped it to v1.14, addressing eight routed items — two of mine
(the pre-A6 catalogue argued at an unnamed base; AC-5.1's "observably identical" tree contradicted by
the run's own record writes) and six of pm-author's (ignored-path boundary, failed-capture observable,
lineage `Downstream`/`Upstream`/`Cross-Reviews` rows, and the `draft` Status).

Per DEC-ERR-03 my scope is this REQ measured against its upstream **at HEAD**, not the item list. The
upstream this REQ leans on is `docs/_constraints/pdlc-wave-gate-baseline.md` (cited at v1.2),
`docs/_constraints/pdlc-advisory-corpus-baseline.md`, and
`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`. I re-read all three at their current
bytes and re-measured the two runtime facts the delta now pins.

## Goals

Answer one question: does the delta resolve the routed items without breaking what I previously
approved, and is the document still a faithful compression of its upstream at HEAD?

## Non-Goals

- Re-reviewing unchanged sections of the REQ (REQ-AWG-01..04, 06, 07, §1–§5, §9–§10) beyond the
  citations the delta newly leans on.
- The relocation of this feature's directory to `docs/completed/` — routed to SE Q-02 and still open
  there; the erratum correctly disposed only the `Status` field and said so.
- Product framing, technical mechanism, or TSPEC-altitude test design. Under the altitude rule my
  findings here ask only for black-box-testable outcomes.

## Constraints

Upstream re-read at HEAD (`origin/main` = `11420461`), with what I verified:

| Upstream | Checked | Result |
|---|---|---|
| `pdlc-wave-gate-baseline.md` **v1.2** | Version row, `Verified at` row, §4 preamble | Matches the REQ's citation. §4 states verbatim that PR #66 (`bb4d36fb`) "makes M-WG-8's five-member reading a **pre-change** fact: true at `c8aa22a4`, false at this base", and that M-WG-8 is deliberately left as measured because AC-1.1 and R-5 argue from the pre-change state. The delta's `c8aa22a4` naming is exactly what upstream says. |
| M-WG-13 / M-WG-14 | Re-ran both recipes at HEAD | `ADVISORY_SEAMS` = frozen `["A1".."A6"]` (`orchestrate-dev.js:1952`); `ENVELOPE_DEFAULTS` = frozen `["E-1".."E-6"]` (`:1942`). Both readings hold. |
| `pdlc-advisory-corpus-baseline.md` §1, §4 | Record/escalation carriers | `docs/_queue/ESCALATIONS.md` is the one durable, append-only per-seam record — a tracked working-tree file. Feeds F-01 below. |
| `REQ-pdlc-advisory-tier` (v1.4) AC-1.6, AC-2.2, AC-3.4, AC-3.6, AC-9.2 | Each cited id read at its current bytes | All five exist and still say what this REQ compresses them to. AC-9.2 still carries both halves the REQ restates (action-without-record is a defect; a failed record write refuses the action). No drift. |
| Referenced commits | `git cat-file` | `c8aa22a4` and `bb4d36fb` both resolve; `bb4d36fb` is the PR #66 merge. |

Constraint carried into the findings: an erratum may not introduce a new internal contradiction in
the section it edits. AC-5.1 is a black-box tree-equality criterion, so its exclusion list must be
exhaustive over the carriers the run writes on AC-5.1's **own** trigger path — otherwise the criterion
cannot be satisfied by a correct implementation and the acceptance test written from it is
unpassable-by-construction rather than merely imprecise.

## Acceptance Criteria

Item-by-item landing check against the erratum diff (`4b925b1a..c58fd61d`):

| # | Routed item | Landed? | Evidence in the delta |
|---|---|---|---|
| 1 | AC-1.1 / R-5 name the pre-A6 base (`c8aa22a4`) | **Yes** | AC-1.1 now reads "The five-member 'before' this argues from is the reading at base commit `c8aa22a4`; HEAD already carries A6 (baseline v1.2 §4, M-WG-13)." R-5 adds "The pre-change readings are measured at `c8aa22a4`; M-WG-13/M-WG-14 are the post-change ones." Both agree with upstream §4 verbatim. See F-03 for the one loose end. |
| 2 | AC-5.1 observation point pinned / record carriers excluded | **Partly** | The observation point is now pinned ("the moment restoration completes") and two carriers are excluded. The enumeration is not exhaustive over AC-5.1's own trigger path — see **F-01**. |
| 3 | AC-5.1 ignored-path boundary | **Yes** | "So are paths ignored by `.gitignore`, which are operator files A6 never wrote and never restores over." This closes the destructive-restore reading cleanly and is black-box checkable (compare tracked + non-ignored untracked paths only). |
| 4 | Observable for a failed **capture** | **Yes** | "Given the pre-A6 state cannot be captured at all, Then no repair is proposed, none is applied, and the wave halts on its own gate (AC-5.2) — a different outcome from a failed restoration." Three positive conjuncts, all observable at REQ altitude, and it correctly routes to AC-5.2 rather than inventing a new halt. This is now writable as its own acceptance test. |
| 5 | `Downstream` row names artifacts, not a feature | **Yes** | Now `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)`; all four files verified present in `docs/pdlc-advisory-wave-gate/`. |
| 6 | `Upstream` row carries the ordered chain | **Yes**, with a regression | Now `` `pdlc-advisory-tier` REQ (the five-seam tier this extends) → **REQ** ``. Chain shape and bolding are as requested; the resolvable path was dropped in the process — see **F-02**. |
| 7 | `Cross-Reviews` row | **Yes** | Now `harvested into `LEARNINGS-pdlc-advisory-wave-gate.md``; that file exists on the branch (32.8 KB). |
| 8 | `Status` disposed | **Yes** | `approved (shipped)`, v1.14, with the changelog naming PR #66 (`bb4d36fb`), queue row 19 `done`, and explicitly leaving relocation with SE Q-02. The changelog paragraph is accurate against the diff it describes. |

Nothing I previously approved was broken: the delta touches only the header block, AC-1.1's closing
sentence, AC-5.1's body, and R-5's closing sentence. AC-5.2, AC-5.3 and all of REQ-AWG-06 are
byte-identical, so the halt contract and the record contract I approved at v1.13 stand unchanged.

## Risks

## Obligations

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
