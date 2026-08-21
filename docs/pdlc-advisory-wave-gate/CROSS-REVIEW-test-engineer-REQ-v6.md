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

- **Conditional-antecedent false green (F-01).** AC-6.3's new obligation is keyed to "Where the halt
  report points the operator at a captured pre-A6 tree state". Nothing in the REQ or in FSPEC E-28 /
  AT-05-5 requires the halt to point at the capture at all — E-28 requires only that the halt name the
  *failed restoration*, and the ref-naming requirement lives in TSPEC (`§2.5`, and the line DEC-A6-03
  cites). An implementation that drops the pointer therefore satisfies AC-6.3 vacuously, and an AT
  written from the REQ alone cannot force the antecedent true. In the shipping design the antecedent
  *is* pinned true by the TSPEC, so this is a routing note rather than a hole: the PROPERTIES/TSPEC AT
  for this AC must fix a fixture in which the halt names the capture, and assert the warning
  positively (exact string presence, same report section), not `warning is not absent`.
- **DECISIONS/REQ disagreement (F-02).** DEC-A6-03 still says the routing has not landed and pins that
  claim to "REQ v1.15 and FSPEC v1.6". It is now a record that denies the existence of the obligation
  the REQ cites it for. Low, and not this document's to fix — but it must not be read as evidence that
  v1.16 did not land.
- **FSPEC half.** The routed item said "REQ **or** FSPEC". The REQ half has landed; `a6-snapshot`,
  "copy the ref" and "overwrit" still match nothing in the FSPEC, so AT-05-5 does not yet assert the
  warning. That is the FSPEC's round to run, not a finding against this REQ; I record it so the
  orchestrator does not read this approval as closing DEC-A6-03's gap end-to-end.
- **Size (F-03).** +10 lines against a soft budget already exceeded. The dissolution path recorded at
  v5 (SE Q-02's relocation) is unchanged, and the hard gate has 14 lines of headroom — enough for one
  more erratum clause, not two.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Should AC-6.3's clause be unconditional — "the halt report tells the operator whether an inspectable pre-A6 capture exists, and if it does, that re-running overwrites it" — so the antecedent is a REQ obligation rather than a TSPEC accident? Either shape is defensible at this altitude; the conditional shape simply moves the fixture obligation into PROPERTIES (F-01). |
| Q-02 | DEC-A6-03's known-gap paragraph is pinned to "REQ v1.15 and FSPEC v1.6". When the FSPEC half lands, is the intent to close the paragraph outright, or to keep it as a historical record of the routing? A record that closes cleanly is easier for harvest to read (F-02). |

## Positive Observations

- The item landed exactly scoped: one clause, in one AC, in the one place US-02 already owns the halt
  path. No new AC id, no new obligation row, no ripple into AC-5.1's or AC-3.2's exclusion sets.
- The clause is written as an operator outcome and stops precisely at the O-1 boundary — it never
  names `refs/pdlc/a6-snapshot-{waveNum}` — while still being concrete enough to test black-box.
  Landing an obligation without importing the mechanism it guards is the hard part, and it is done.
- "In the same place" is the load-bearing phrase, and it is the right one: it is what distinguishes
  the landed remedy from the pre-existing state (a remedy documented in TSPEC and DECISIONS, neither
  of which an operator reads at halt) and it is directly assertable.
- The v1.16 changelog names the item, all three raisers, the AC touched, and what was deliberately not
  imported. The diff matches the changelog exactly, which is what makes a delta confirmation cheap.

## Obligations

- **O-1 (unchanged).** The capture's name, namespace and storage form remain the TSPEC's. This edit
  respects that boundary; nothing in it reopens O-1.
- **Routed out of this document by this round:** the AT that pins AC-6.3's antecedent and asserts the
  warning positively belongs to PROPERTIES/TSPEC (F-01). The FSPEC-side landing of the same obligation
  belongs to the FSPEC's round.
- **Carried forward from v5, still open, non-gating:** C-5 soft-budget overage (F-03); the AC-6.4/O-2
  "deleted after Phase PUB" vs corpus-baseline §1 "after Phase H2's distil" phase-name slip (F-04);
  the two upstream `Cited by` rows that understate which REQ sections cite them (F-05).

## Recommendation

**Approved with minor changes**

The delta resolves the routed item and breaks nothing I approved at v5. No High findings: one Medium
(AC-6.3's conditional antecedent, which routes a fixture obligation to PROPERTIES rather than leaving
a hole) and four Lows, three of them inherited and unchanged since v5.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | AC-6.3's new warning is conditional on the halt report pointing at a captured pre-A6 tree state, but neither the REQ nor FSPEC E-28/AT-05-5 requires that pointer to exist — only the TSPEC does. An AT written from the REQ alone cannot force the antecedent true, so an implementation that drops the pointer satisfies AC-6.3 vacuously. Either make the antecedent a REQ obligation, or have PROPERTIES pin a fixture where the halt names the capture and assert the warning positively (exact string, same report section), never absence-only. | §6 AC-6.3 |
| F-02 | Low | delta | nonlocal | DEC-A6-03's "Known gap in the remedy's reach" still states "**The routing has not landed** … at REQ v1.15 and FSPEC v1.6", so AC-6.3 now cites a record that denies the obligation it is cited for. Update the paragraph (or its re-evaluation trigger) to record the REQ half as landed at v1.16, leaving only the FSPEC half open. | DECISIONS DEC-A6-03 |
| F-03 | Low | inherited | nonlocal | The REQ is 686 lines / 55,627 bytes against C-5's 630-line / 55,296-byte soft budget (676 at v1.15; +10 this round). Inside the 700-line hard gate with 14 lines of headroom. Dissolution path recorded (SE Q-02's relocation). | §5 C-5 |
| F-04 | Low | inherited | nonlocal | AC-6.4's honest limit and O-2 place the per-feature advisory record's deletion "after Phase PUB"; the cited upstream, `docs/_constraints/pdlc-advisory-corpus-baseline.md` §1 at HEAD, places it after Phase H2's distil. The conclusion is unaffected; the phase name is not what upstream says. | §6 AC-6.4, §8 O-2 |
| F-05 | Low | inherited | nonlocal | Both upstream baselines understate their consumers: `pdlc-wave-gate-baseline.md` v1.2's `Cited by` row records REQ §1/§4/§5/§8 only, though §6 (AC-1.1) and §7 (R-5) cite `M-WG-*` ids; `pdlc-advisory-corpus-baseline.md` v1.0's row names only `REQ-pdlc-consolidation-agent`, though this REQ cites it at C-1, AC-6.4, NFR-6 and O-2. Upstream's fix, not this REQ's. | Lineage / upstream `Cited by` |

FINDING: Medium | delta | local | §6 AC-6.3 | The new re-run-overwrite warning is keyed to an antecedent ("where the halt report points the operator at a captured pre-A6 tree state") that no REQ or FSPEC obligation makes true — only the TSPEC does — so an AT written from the REQ alone cannot force it and an implementation that drops the pointer passes vacuously; make the antecedent a REQ obligation or pin the fixture in PROPERTIES and assert the warning positively.
FINDING: Low | delta | nonlocal | DECISIONS DEC-A6-03 | The known-gap paragraph still says "The routing has not landed … at REQ v1.15 and FSPEC v1.6", so AC-6.3 cites a record that denies the obligation it is cited for; record the REQ half as landed at v1.16 and leave only the FSPEC half open.
FINDING: Low | inherited | nonlocal | §5 C-5 | REQ is 686 lines / 55,627 bytes against C-5's 630-line soft budget (676 at v1.15, +10 this round); inside the 700-line hard gate, dissolution path recorded (SE Q-02's relocation).
FINDING: Low | inherited | nonlocal | §6 AC-6.4, §8 O-2 | The advisory record is described as "deleted after Phase PUB" while the cited corpus baseline §1 at HEAD places deletion after Phase H2's distil.
FINDING: Low | inherited | nonlocal | Lineage / upstream `Cited by` | Both baselines' `Cited by` rows understate this REQ's citing sections (wave-gate baseline omits §6/§7; corpus baseline omits this REQ entirely) — upstream's fix, not this document's.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 4}
