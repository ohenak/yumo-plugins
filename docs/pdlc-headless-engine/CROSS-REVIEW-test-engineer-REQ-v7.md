# Cross-Review: test-engineer — REQ (delta confirmation, erratum round 5)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md (v0.9)
**Date:** 2026-08-11
**Iteration:** 7
**Scope:** Delta confirmation only — the M-ENG-06 totality erratum I raised in v6 F-03. Not a
re-review of the REQ; every other item stands as approved at v6.

## Delta reviewed

Commit `2a4939ca`, two files, four hunks, no acceptance-criterion text touched:

| File | Hunk | Change |
|---|---|---|
| `docs/_constraints/pdlc-engine-baseline.md` | M-ENG-06 preamble (`:87`) | "appears in **exactly one** row" → "appears in **at least one** row", plus a new sentence: a criterion whose clauses differ in state is split across rows, **each row naming its clause explicitly**, with AC-4.5 named as the instance and "the split is a partition, not a gap" stated |
| `REQ-…md` | header table (`:19`) | version 0.8 → 0.9 |
| `REQ-…md` | change note (`:21-26`) | new 0.9 note recording this one erratum and asserting nothing else changed |
| `REQ-…md` | §1.2a (`:113-114`) | the echo "one row per AC (Phase-F erratum: AC-2.3 and AC-4.4 had no row…)" → "a criterion whose clauses differ in state is split across rows, each naming its clause (AC-4.5's per-dispatch auth clause)" |

I confirmed the table body itself is byte-unchanged in the diff: no row moved, no state changed,
no evidence citation added or removed. The edit is prose-only, as the change note claims.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No new findings. v6 F-03 is resolved; v6 F-01 and F-02 (both Medium, both non-blocking) are untouched by this edit and carry forward unchanged. | — |

**v6 F-03 — resolved.** The finding was that `pdlc-engine-baseline.md:87`'s "exactly one row"
contradicted AC-4.5's deliberate two-row split, leaving a reader unable to tell a sanctioned split
from a duplication defect. The new wording resolves it in the direction I asked for and slightly
better: it does not merely weaken totality to "at least one", it adds the discriminator — a split
is legitimate **only** when the criterion's clauses differ in state **and** each row names its
clause. An unqualified duplicate is therefore still a defect in the fact, which is the property
F-03 was defending. "Every clause of a split criterion carries a state, so the split is a
partition, not a gap" states the coverage invariant explicitly, so a TSPEC author reading AC-4.5
twice now knows both halves are accounted for rather than one being an editing residue.

**Re-derived rather than trusted.** Extracting the 26 `AC-n.m` ids from the REQ's criteria
sections and the ids named across all seven table rows gives two sets of 26 that match exactly —
nothing in the REQ lacks a row, nothing in the table names a criterion the REQ does not define.
Weakening "exactly one" to "at least one" did not open a coverage gap; AC-4.5 remains the only
criterion appearing twice, and both of its appearances name their clause.

**Nothing previously approved regressed.** The edit adds no claim about HEAD, weakens no evidence
citation, and changes no AC's testability. §1.2a's echo now agrees with the fact it cites, which
removes the one place where a reader could have inherited the old wording after the fact was
fixed. My v6 approval anchors were taken against the AC text, which is byte-identical here.

## Questions

| ID | Question |
|----|---------|
| — | None in this round's scope. Q-01 from rounds 2–6 (AC-5.1 guard parity on the SDK transport) is unchanged and unaffected by this edit. |

## Positive Observations

- **The fix generalises without loosening.** The easy version of this erratum was to delete
  "exactly" and move on, which would have made the sentence true and useless. This version keeps
  the invariant enforceable by naming the two conditions a split must satisfy, so the fact can
  still be checked mechanically against the table.
- **The correction is dated and attributed in place.** "correction, Phase-F erratum round 5 —
  AC-4.5 appears in the green row … the earlier 'exactly one row' wording contradicted it" sits
  in the fact itself, alongside the earlier Phase-F correction. A later reader who finds AC-4.5
  twice reads why in the same paragraph rather than reconstructing it from cross-review history.
- **The change note's scope claim is accurate.** "No AC text changed" is verifiable from the diff
  in one read, and it is true — which is what makes the targeted-edit protocol cheap to confirm.

## Recommendation

**Approved**

The delta resolves the erratum I raised and breaks nothing I previously approved. M-ENG-06's
totality sentence now admits AC-4.5's clause-level split while keeping unqualified duplication a
defect, the AC-id sets on both sides of the fact still match by set-equality at 26/26, §1.2a's
echo agrees with the fact it cites, and no acceptance criterion's text — hence no criterion's
testability — changed. My v6 approval of the REQ stands, with F-01 and F-02 carried forward as
the same non-blocking Medium residue for the TSPEC author to inherit.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:0588cd1b74288cd6f0a41dfcc05ff1bba5e371c6c681db24bb32fdc27c526784
REVIEWED-COMMIT: 2a4939cab5e84e4e0963ea20b7b34448d16ed1de
