# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.2)
**Date:** 2026-08-28
**Iteration:** 3

Delta re-review. Base commit `dfa9496b2` (the tree my v2 read); the document moved across three
commits, `ec3b4f391`, `9cfcba84b`, `3c4b499c4`, for a net of +17/−6 lines. I re-verified v2's one
blocking finding against HEAD and scanned only the changed hunks for new issues. Unchanged
sections — DEC-DECLEDGER-01/-02/-04 through -11's mechanism, the Decision table's untouched rows,
the Options arithmetic re-derived in v2 — are not re-litigated.

**v2's blocking F-01 is resolved and correct at both sites.** One new Medium enters inside the F-02
remediation: the re-evaluation trigger's new "discharge list" enumerates five sites but the stale-
figure set in TSPEC is larger, so the list is not set-equal to the obligation it defines.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The new "five sites are the discharge list" enumeration is under-inclusive — it is a containment claim written as a set-equality claim.** L307 names five stale sites: §3.6's `8000 − 1200 = 6,800`, §3.6's *"~495 bytes of headroom"*, §3.6's *"the order is live under shipped defaults"*, D-10's restated 6,800-byte allowance, and §7.3's *"At 141 records the byte bound binds"* — then closes "Those five sites are the discharge list". Grepping the 8,000-derived figures across TSPEC returns more than those five. `TSPEC:630`, inside **§4.3 Rendering (pure)** — a section the list does not name at all — rests the 1,200-byte framing pin on the stale number: *"it is not free: §3.6's ~495 bytes of headroom shrink one-for-one with any raise, so the task that writes `DECISION_LEDGER_RULE_TEXT` either fits the budget or re-opens the arithmetic together with ERR-2"*. That sentence is load-bearing for D-9's budget argument and goes stale with the same literal, but an author working the list as a checklist never visits §4.3. Within §7.3 the named sentence at `:954` is only the first of three: `:958` carries *"6,305 index bytes against a 6,800-byte allowance leave nothing to drop"* and `:964` carries *"§3.6's ~495 bytes of headroom against a 152–261-byte feature line"*, both of which must move with it and neither of which the quoted sentence would lead a careful reader to. The re-measurement discharges as complete while four derived figures stay pre-raise. This is the exact failure mode the paragraph was added to prevent — an obligation stated as checkable, whose check passes early. Fix is mechanical: either name §4.3 and §7.3's two companion figures, or drop the closed "those five sites" framing and state the discharge condition as a predicate (*no `6,800`, `~495`, or "live under shipped defaults" derived from `maxBytes` 8,000 survives anywhere in TSPEC*), which stays true as sites are found. I have routed the missing sites upstream as a TSPEC erratum so the discharge list and the TSPEC edit converge on one set. | § Re-evaluation triggers, DEC-DECLEDGER-10/-12 row (L307) |

## Prior findings — disposition

| Prior | Status | Evidence |
|-------|--------|----------|
| F-01 (High) — DEC-DECLEDGER-14 routed to the wrong erratum id `ERR-3` | **Resolved** | Both sites now read `ERR-4`. The Decision table row (L281) routes DEC-DECLEDGER-14 "upstream as `ERR-4` (open, FSPEC-owned)", and the Risks bullet (L320–323) now states it in terms and disambiguates the neighbour: "DEC-DECLEDGER-14 is the design-side half of `ERR-4` — AT-03's fixture mutation, which TSPEC's D-11 routes as `ERR-4` in terms; `ERR-3` is the separate AT-02 citation-format correction and no decision here pairs with it." Verified against upstream rather than accepted: `TSPEC-pdlc-decision-ledger.md:1286` (D-11) ends "Raised at the FSPEC as ERR-4"; TSPEC §9.2's `ERR-4` is AT-03's Given contradicted by AT-01's frozen-fixture requirement, and `ERR-3` is AT-02's Then clause written against the retired heading-citation format. The pairing is now the one the cited authority holds, and the added disclaimer forecloses the same mis-pairing recurring, which is more than the finding asked for. No stale `ERR-3` reference to DEC-DECLEDGER-14 survives anywhere in the file. |
| F-02 (Medium) — derived figures attributed to a TSPEC section that still carries 8,000-based arithmetic | **Substantially addressed; residue is F-01 above** | The document no longer implies §3.6 backs its derived numbers. The citation rule now carries an explicit exception (L57–67) separating what it *quotes* from §3.6 — 10,859 and 6,305, "measurements of the corpus rather than of the bound", which I re-confirmed are current at `TSPEC:422` and `TSPEC:1306` — from what it *derives*: the 11,300-byte allowance, DEC-DECLEDGER-12's 441 bytes of slack and DEC-DECLEDGER-13's 4,995, stated plainly to "have no upstream home until §3.6 is re-measured". That is the honest form of the claim, and the quote/derive split is the right axis to cut on: it tells a re-verifying reviewer exactly which numbers will not reconcile upstream yet and why, instead of leaving them to discover the disagreement. The obligation is then given an owner and a location (TSPEC's to land under `ERR-2`, listed in the DEC-DECLEDGER-10/-12 trigger). Only the completeness of that list is still wrong. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v2 Q-02, still open and still cheap to answer: DEC-DECLEDGER-13 pins 41 ids / 6,305 bytes "at the Baseline's commit", and the Baseline's `Verified at` is `8c673a09f`. Is TSPEC §7.3's frozen fixture captured at that same commit? If it is captured at another, the transcribed expected values and the pinned corpus are two artifacts that can drift apart silently, and every byte figure in this document inherits the discrepancy. A one-clause statement of the capture commit in §7.3 would close it permanently. |

## Positive Observations

- **The erratum correction was verified in terms, not just swapped.** The fix could have been a
  two-token substitution; instead the Risks bullet now names *why* `ERR-4` is the pair (AT-03's
  fixture mutation, matching D-11's own routing language) and states affirmatively that no decision
  pairs with `ERR-3`. That converts a corrected id into a claim a future reader can falsify against
  TSPEC §9.2 without re-deriving the mapping, which is what stops the same error returning.
- **The quote/derive distinction in the citation rule is a genuinely reusable device.** Separating
  figures that measure the *corpus* (stable across the threshold raise) from figures that measure the
  *bound* (invalidated by it) is what makes the stale-upstream disclosure precise rather than a
  blanket "TSPEC is behind". Any document citing a spec mid-erratum faces this, and the shape here
  is worth carrying forward.
- **The outstanding re-measurement is stated as checkable rather than general.** "One such
  re-measurement is outstanding now" with quoted literals beats a standing "keep these in sync"
  instruction: it can be tested by grep and it expires when discharged. My F-01 is that the grep
  returns more than the list admits — the instinct to make the obligation mechanical is right, and
  widening the list preserves it.

## Recommendation

**Approved with minor changes**

No open High finding. v2's blocker is resolved against the cited upstream authority, and the Medium
recorded here is a completeness defect in a prose discharge list, not a testability or traceability
gap: the derived figures are correct arithmetic, disclosed as unbacked upstream, and routed to the
document that owns them. The single Medium is recorded and non-gating, and the missing sites are
routed as a TSPEC erratum so the list and the eventual TSPEC edit close on the same set.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | Medium | delta | local | § Re-evaluation triggers, DEC-DECLEDGER-10/-12 row (L307) | "Those five sites are the discharge list" under-enumerates the 8,000-based figures in TSPEC: §4.3 at `TSPEC:630` rests D-9's framing-budget argument on "~495 bytes of headroom" and is not named at all, and §7.3 carries two more derived figures (`:958` 6,800-byte allowance, `:964` ~495 bytes) beyond the one sentence quoted at `:954`. A re-measurement worked from this list discharges while four derived figures stay pre-raise |

FINDING: Medium | delta | local | Re-evaluation triggers, DEC-DECLEDGER-10/-12 row (L307) | The "five sites are the discharge list" enumeration is under-inclusive — TSPEC:630 (§4.3, framing-budget argument) is unnamed, and §7.3 carries two further 8,000-based figures at :958 and :964 beyond the quoted :954 sentence; the obligation would read as discharged while stale figures survive

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

APPROVAL-HASH: sha256:fa39cee9fcab31d7551b39923b3bddd5f33ec028ee89b9ec5c3c42bb7004cd96
APPROVAL-HASH-NORMALIZED: sha256:6cdbba7480df2d0138a9464d188c8c98e3c88f493b5bf10a43270ca0b4c67b37
REVIEWED-COMMIT: 3c4b499c4382bbe679a72a019d504364542bbd28
UPSTREAM-STATE: REQ sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba
UPSTREAM-STATE: FSPEC sha256:b32a6623036ddc6a86ccc3396431b1364aeaf36b70745b0d11025765b0711bb1
UPSTREAM-STATE: TSPEC sha256:751e55c9a31fb7f1313f658317b05a2e5f5ce64767305fc8aacf68164b4710a2
