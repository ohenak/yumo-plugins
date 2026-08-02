# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-merge-phase/FSPEC-pdlc-merge-phase.md` (v1.2, commit `518ec6a`)
**Previous review:** `CROSS-REVIEW-software-engineer-FSPEC-v2.md` (v1.1, Approved)
**Date:** 2026-08-02
**Iteration:** 3
**Scope:** Confirmation pass over the v1.1 → v1.2 delta only (§2.3, §3.1, §3.2, §8.3, §9.1, §11) —
whether the targeted edits close what they claim and whether any of them disturbs a behaviour I
already approved. Nothing outside the diff is re-reviewed; product framing and test strategy remain
outside my lens.

## Delta assessment

All four edits land cleanly and my approval holds. The **§2.3 7c split** is the right shape: row 4's
trigger is now explicitly scoped to `state` alone, and the parseability of `O1`'s other fields is
decided at the precondition that consumes them, with `refused` for unretrievable/unrecognised and
`deferred` reserved for values that parse and simply are not mergeable — so §3.2's fail-closed rule
now has exactly one resolution site per field instead of an unstated one, and new terminal row **11a**
sits above row 12 without overlapping it (11a is "cannot be read", 12 is "read, and it says no"; 13
remains the post-re-read `UNKNOWN`). Folding `O1.number` in with them is well-motivated — it is
consumed by §7.2's Evidence cell and three §9.3 lines — and the exclusivity sentence was updated to
name 11a rather than left to be inferred. **`O4` gaining `defaultBranchRef.name`** closes my F-11 at
the altitude I asked for: one external surface, one substitutable observation, the fail-closed row
extended to require a non-empty name ("never guess a branch name to check out"), and §8.3 rewritten
to name that value as the source it fetches and checks out, the same one §8.2's report line
interpolates. Sequencing works out: `O4` is observed at 7c→7e, before row 8's merge, so the name is
in hand by the time M3 runs on the merge path. **§9.1's fourth-field paragraph** closes F-12 exactly
as scoped — `queueRow` carries the §7.4 disposition on a `merged` run, is unchanged otherwise, and
the supersession is tied back to §7.5 rather than restated. **§11 row 18's qualified "queue written"**
closes F-13 by naming §2.5's non-overwritable statuses inline, so the parameterised suite no longer
asserts a write that correctly does not happen. One advisory observation, offered for the TSPEC pass
and not a finding to resolve here: §2.2 row 5 (PR already `MERGED`) short-circuits the remaining
preconditions, so `O4` is never observed on that path and the default-branch name is unavailable to
M3 — the behaviour is still *defined* (§8.3's "if any part cannot be completed" escalates and keeps
`mergeStatus: merged`), but the recovery path AT-M2a exercises would then always report row 22, which
is probably not the intent; the cheapest fix is a clause letting row 5 observe `O4` for the name
before M3. Nothing in the delta contradicts the code I verified for v1.2's predecessor — the
observation set, the M1–M5 ordering, the driver's M5 write and the next feature's branch point are
untouched.

## Findings

None. The three v2 Low findings are closed; no new High, Medium or Low finding arises from the delta.

## Recommendation

**Approved** — v1.2 closes every open item without introducing a defect. Proceed to TSPEC.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 0}
