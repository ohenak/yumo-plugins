# Cross-Review: product-manager — TSPEC (erratum delta-confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.12)
**Date:** 2026-08-14
**Iteration:** 12
**Scope:** Delta only — erratum confirmation round, plus mandatory upstream re-grounding at HEAD.

## 1. Scope of this confirmation

Diffed `a9f1584b` (the erratum edit) against its parent. The edit touches exactly three
surfaces of one file: the lineage header's REQ cell (`v0.10 → v0.11`), the version/date row
(`0.11 → 0.12`) plus a new changelog row, and §5.4's expected-set paragraph
(`TSPEC:386-401`). 19 insertions, 6 deletions, no other file. Nothing settled in rounds 1–9
is re-opened; no section outside §5.4 moved.

Not re-reviewed: everything approved in v11 and earlier that the diff does not touch.
Re-grounded regardless of the item list, per DEC-ERR-03: REQ and FSPEC at HEAD.

## 2. Upstream re-grounding at HEAD

REQ **moved** since this TSPEC was last approved: v0.10 → v0.11 (`01c27ee4`). FSPEC is
unchanged at v0.2. I read the REQ delta rather than trusting the author's summary of it.

| Upstream change at HEAD | What it decides | Does the TSPEC still compress it faithfully? |
|---|---|---|
| **AC-1.3 re-worded** (`REQ:264-275`): the packed-set oracle now compares against an expected set whose **classes and per-class member counts are stated in the FSPEC** and whose **member names are stated downstream in the TSPEC** | Ownership of the number vs. ownership of the names — the verifier is no longer asked to read a literal member list out of the FSPEC | **Yes.** §5.4's new paragraph (`TSPEC:396-398`) transcribes the split in the REQ's own vocabulary and derives the obligation from it, rather than restating the AC. The `PK-*` table remains the sole home of member *names*, which is the half AC-1.3 assigns here |
| **v0.10 changelog citation** corrected `FSPEC F-3 step 5 → F-4 step 2` (`REQ:29`) | Prose only; no AC affected (REQ states so, and the diff confirms it) | **N/A** — the TSPEC never cited `F-3 step 5` (grepped; the string appears only in cross-review files). Nothing to absorb |

Absorption ordering is correct per DEC-ERR-01: the v0.12 changelog row records the REQ
v0.10 → v0.11 move and the AC-1.3 decision **before** the raised items, and states that the
absorbed decision is what resolves them. The raised-item set is a subset of what the round
addressed, not a superset — nothing raised was dropped, and the absorbed decision is not
smuggled in as a finding fix.

Nothing else in the REQ delta touches a claim the TSPEC leans on. AC-1.4 (the version
triple), AC-3.1, AC-5.6 and NG-6 are byte-unchanged this round, so v11's grounding of §6.2,
§5.1 and §6.5 still holds.

## 3. Raised-item disposition

Both raised items are the same defect seen from two lenses, so they are confirmed together.

| Item (raiser) | Landed? | Evidence at HEAD |
|---|---|---|
| §5.4 carried a **second copy** of the 23/24 count with no reciprocal co-change obligation; express it once, or derive it, so the two copies cannot diverge silently (pm-author) | **Yes — by derivation, the stronger of the two options offered** | `TSPEC:386-393` no longer authors a total. It sums its own `PK-*` rows — `4 + 15 + 3 + 1 + 0/1` — and shows 23/24 as that sum's *value*, explicitly "not authored as a second total". Editing a `PK-*` row now changes the arithmetic's inputs, so the TSPEC side cannot silently disagree with its own table |
| §5.4 carried **no reciprocal co-change sentence** for a number it shares with FSPEC §5.2, so the FSPEC-side obligation was one-directional (se-review) | **Yes** | `TSPEC:395-401` states the mirror: any `PK-*` row added, removed or re-classed updates FSPEC §5.2's **per-class counts in the same change**, naming FSPEC §5.2's existing `TSPEC:386-389` citation as the obligation it mirrors. It also names the right change-control point (per-class, not total, since a cross-class move leaves the total invariant) and names PF-4's member-for-member equality as what turns a missed co-change red rather than merely untidy. FSPEC §5.2 (`FSPEC:509-516`) states the same rule from its side, so the pair is now closed in both directions |

Verified against the FSPEC's own arithmetic rather than the TSPEC's prose: manifest 1 +
README 1 + CLI entry 2 + engine modules 15 + workflow modules 3 + install script 1 + licence
0/1 = **23/24** (`FSPEC:509-512`), and the TSPEC's `PK-*` table (`TSPEC:347-359`) enumerates
exactly 4 + 15 + 3 + 1 names plus PK-3. The two sides agree at HEAD; this round did not fix
the obligation while leaving a live discrepancy behind it.

## 4. Findings

Neither finding is a regression against anything previously approved, and neither blocks.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The derivation aggregates three FSPEC classes into one bucket, so the arithmetic it publishes is not class-for-class with the counts it names as the change-control point.** `TSPEC:387-390` sums "four manifest-adjacent and `bin/` members (PK-1, PK-2, PK-4, PK-4b)", which is FSPEC §5.2's manifest 1 + package README 1 + CLI entry 2 (`FSPEC:509-511`) merged. The very sentence at `:399-400` says per-class and not the total is the control point "because a member moved between classes leaves the total invariant" — yet the `4` bucket is itself invariant under exactly that move among those three classes. Substance is right and no count is wrong; the presentation makes the mirror non-mechanical for the one case it argues about. Fix is one line: write the sum as `1 + 1 + 2 + 15 + 3 + 1 + 0/1`, matching FSPEC §5.2's class boundaries term for term | AC-1.3 (REQ-EDIST-01) |
| F-02 | Low | Local | **This edit made FSPEC §5.2's line-anchored citation under-cover the text it points at.** FSPEC §5.2 cites `TSPEC:386-389` as "carries the same arithmetic" (`FSPEC:512`), and the new §5.4 paragraph leans on that citation by name (`TSPEC:398`). After the edit, `386-389` lands on the derivation's opening and its first two terms; the `23/24` value now sits at `TSPEC:392-393`, outside the cited range. Nothing false — the range still points into the right paragraph — but a line-anchored citation that no longer covers the number is the drift class this round exists to close. No FSPEC erratum warranted for a range refresh; ride it on the next FSPEC edit, or state the anchor as `§5.4` rather than a line span so it survives future edits | AC-1.3 (REQ-EDIST-01) |

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | The co-change obligation is prose in two documents; PF-4 catches a divergence only once the *tarball* is built and enumerated. Is there value in a cheaper oracle — a doc-level check that the FSPEC's per-class counts sum to the TSPEC's `PK-*` row count — or is that a PLAN-time question rather than a TSPEC one? I lean PLAN-time and am not raising it as a finding. |

## 6. Positive Observations

- **The stronger of the two offered remedies was chosen.** My item allowed either a mirror
  sentence *or* deriving the count once; the edit does both, and the derivation is the part
  that makes drift structurally hard rather than merely documented. A second authored total
  no longer exists on this side to go stale.
- **The upstream re-grounding was done, and it is what fixed the items.** The REQ moved
  underneath this document this round. The changelog absorbs AC-1.3's ownership split ahead
  of the raised items and uses it to decide *which side owns the number* — the routing
  DEC-ERR-01 asks for, and the reason the fix is a split rather than a duplicated sentence.
- **The right change-control point is named.** Choosing per-class counts over the total, and
  justifying it with the cross-class-move case, is a sharper reading than the item asked for.
- **Freeze respected.** Every hunk maps to the raised items or the upstream absorption; no
  section outside §5.4 and the lineage header moved, and no upstream document was rewritten
  from here.

## 7. Recommendation

**Approved with minor changes.**

The delta resolves both raised items, and it resolves them at the level they were raised:
the duplicated total is gone (derived, not restated) and the co-change obligation now runs
in both directions with the correct control point. The upstream move (REQ v0.10 → v0.11) was
re-grounded, absorbed ahead of the item list, and is what decides the fix — I verified the
REQ diff directly rather than accepting the changelog's account of it.

Nothing previously approved is broken: no acceptance criterion is narrowed, reinterpreted or
dropped, no scope is added or removed, the `PK-*` member names are untouched, and the
23/24 arithmetic agrees with FSPEC §5.2 term for term at HEAD. The two Low findings are
presentational — a bucket boundary and a stale line range — and can ride any later edit
without a round of their own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
