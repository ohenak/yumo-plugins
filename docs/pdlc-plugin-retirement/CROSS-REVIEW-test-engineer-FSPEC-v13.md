# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.10, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 13 (delta confirmation)

## Scope of this round

Per dispatch: this is a delta-confirmation round under the round-13 decision freeze. Round 12
already approved FSPEC v0.9 with zero findings from this reviewer
(`CROSS-REVIEW-test-engineer-FSPEC-v12.md`). In the same round, the software-engineer reviewer
filed a High finding (F-01) against stale C-9 rationale prose in BR-CLN-3a / the E-16a row (citing
REQ v0.15's superseded impossibility framing after REQ v0.16 restated C-9 as a scope decision). The
optimizer landed a targeted, non-behavioral erratum edit in commit `6c56b3cf`, producing FSPEC v0.10.
The only question this round asks: **does the delta break anything previously approved, or introduce
a new testing-lens defect (oracle shape, falsifiability)?** Decisions settled in rounds ≤12 are under
freeze and are not re-litigated.

Method: `git show 6c56b3cf -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`.

## Delta verification

The diff touches five spots, all in the same register as SE F-01 asked for:

- **Header table**: Upstream pin bumped REQ v0.15 → v0.16; Product table version bumped 0.9 → 0.10.
  Bookkeeping only, no testing-lens surface.
- **BR-CLN-3a prose**: the rationale for "a hand-modified file at an expected name is removed like
  any other expected entry" is re-grounded from an impossibility claim ("no post-sweep artifact can
  distinguish it") to a scope-decision claim ("the cleanup judges presence, not provenance — a
  deliberate scope decision, not an impossibility"). The **behavior** stated (removed alongside the
  other expected entries) is unchanged; only the *why* changed, and the *why* is not something a
  black-box acceptance test asserts on. The AC-4.3 citation is repointed from `(v0.15)` to
  `(v0.16)`.
- **E-16a row**: same substitution — "no post-sweep artifact can detect the modification" replaced
  with "the cleanup judges presence, not provenance, by REQ C-9's scope decision," citations
  repointed to `(v0.16)`. The observable outcome column (removed with the other expected entries) is
  byte-identical in effect; still a single, decidable, black-box outcome — "this file is gone,
  report says so" — same as before the edit.
- **§7.2 ledger**: gains row 6, correctly attributing the fix to SE FSPEC-v12 F-01, correctly stating
  what changed (rationale text + citation pins) and citing the new REQ version. Defect count in the
  lead-in prose bumped from "five" to "six," consistent with the new row.
- **§7.3 heading**: unchanged in substance (only the row insertion above it shifts nothing here).

No test oracle, acceptance criterion, decision branch, or error-scenario disposition changed. The
edit is exactly what it claims to be: erratum prose correcting a stale rationale and two citation
pins, not a behavioral change. Nothing in the delta introduces a new implied property, a vague or
unfalsifiable assertion, or a testability regression — the pre-edit text was already testable at
FSPEC altitude (an observable "entry is gone" outcome), and the post-edit text asserts the identical
observable outcome with corrected supporting prose. No previously-approved material outside these
five spots is touched.

## Findings

None.

## Questions

None.

## Positive Observations

- The erratum is scoped exactly to the defect SE F-01 named — rationale prose and two stale version
  pins — and does not reach into the observable-outcome text that testability review already
  approved in round 12. That precision is what makes a delta-confirmation round tractable: nothing
  needed re-deriving from scratch.
- The "presence, not provenance" framing is, if anything, an improvement for future testability
  review: an impossibility claim ("no artifact can distinguish it") invites a reviewer to go looking
  for a counterexample artifact, while a scope-decision claim states plainly that the predicate is a
  choice, not a technical ceiling — reducing ambiguity about what a future test would even be probing
  for.

## Recommendation

**Approved.**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
APPROVAL-HASH-NORMALIZED: sha256:9ab53f3f0071f5e126dfea71f008153ed1aabace6b18a9686585390e65bab11c
REVIEWED-COMMIT: 6c56b3cf21d90c707e90983d7d1a44f5482c867a
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
