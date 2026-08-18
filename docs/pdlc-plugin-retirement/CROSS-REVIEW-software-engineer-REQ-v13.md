# Cross-Review: software-engineer — REQ (delta, decision freeze)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-18
**Iteration:** 13

## Scope of this round

Delta reviewed: `git diff 55f9f312..HEAD -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`
— one commit, `224bee64`, +9/−5 across three hunks: the changelog row (v0.15 → v0.16 plus a new
entry), C-9's closing sentence (`REQ:287`–`:288`), and AC-4.1's *given*/*then* (`REQ:468`–`:471`).
Both edits are the fixes v12 asked for: F-01 (C-9's impossibility claim) and F-02 (AC-4.1's
two-artifact enumeration). Working tree clean. Under the freeze I checked only whether the delta
broke something and whether any load-bearing claim is false at HEAD; unchanged sections were not
re-litigated.

## Prior-finding disposition

| Prior | Status | Evidence |
|---|---|---|
| F-01 (Medium) — C-9 justified the hand-modified-expected exclusion by an impossibility that is not one, since `.pdlc-sync-manifest.json` does carry per-row `consumerHash` (`pdlc/hooks/scripts/sync-workflows.sh:505`, `:527`, read `:139`) | **Resolved** | `REQ:287`–`:288` now reads "deliberately outside the constraint by scope decision: the cleanup judges presence, not provenance." Presence-not-provenance matches the design actually chosen downstream — DECISIONS `DEC-04` (`DECISIONS-pdlc-plugin-retirement.md:165`) fixes the script as "operator-invoked, name-only, all-or-nothing". No false claim remains. |
| F-02 (Medium) — AC-4.1 named two artifacts as the removal target while the sync writes four kinds of entry | **Resolved, and resolved robustly** | `REQ:468`–`:471` now scopes the target as the whole directory "in whatever state the sync last left it — every entry the sync writes, bookkeeping and backups included, not two named artifacts". Because the wording is generic rather than a new enumeration, it also covers the third state entry an enumeration would likely have missed, `.pdlc-drift-state.json` (`pdlc/hooks/scripts/sync-workflows.sh:239`), alongside `.pdlc-sync-manifest.json` (`:464`) and `.pdlc-backups/` (`:612`). |
| F-03 (Low) — v0.15 changelog row at near-full length | **Open, unchanged** | Carried below as F-01 of this round. |

## Delta consistency checks

- **AC-4.1 vs AC-4.3 (no new contradiction).** AC-4.1 now demands the directory go "in its
  entirety"; AC-4.3 (`REQ:473`–`:481`) still refuses any entry "the cleanup's own expected set
  does not name". These cohere only if the state entries and backups are inside the expected set,
  and downstream they are: FSPEC `:439`–`:445` puts `.pdlc-drift-state.json`,
  `.pdlc-sync-manifest.json` and `.pdlc-backups/` (expected "as a whole directory") in the L-11
  expected set, and AT-4.1 (FSPEC `:759`–`:764`) builds the fixture from **every** L-11 entry with
  a non-empty backups directory. The delta moved AC-4.1 toward its own downstream, not away.
- **No stale echo of the retired wording.** Grepped every non-review doc in the feature directory
  for `AC-4.1`: FSPEC `:105`, `:555`, `:759`; TSPEC `:364`, `:1285`; DECISIONS `:165`. None
  restates the two-artifact form, so nothing downstream now contradicts the revised criterion.
- **Changelog/version pair.** Row reads `0.16` and the new entry is dated and scoped
  "no scope change" — accurate: neither hunk adds or removes an obligation.
- **Size budget.** 637 lines / 53,132 bytes — inside the pdlc REQ budget (700 lines / 60 KB).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Inherited, nonlocal, unchanged since v11.** The v0.15 changelog row (`REQ:19`) still runs near full length where a citation of O-8 would do; the new v0.16 row (`REQ:17`) is appropriately short, so this is a single-row cosmetic leftover. | §Changelog |

No High findings. No Medium findings. The one Low is inherited and nonlocal to this delta.

DEFERRED: trim the v0.15 changelog row to a citation of O-8 whenever the REQ is next opened for content.
DEFERRED: confirm downstream that AC-5.2's eight run-variable collections are checked by set-equality rather than containment, so a deleted collection reds the check.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried v8–v13, still non-gating: is AC-5.2's eight-collection enumeration set-equality-checked downstream, or containment-checked? |

## Positive Observations

- Both v12 findings were fixed by narrowing the *claim*, not the scope — C-9 keeps the same
  exclusion and now states the real reason for it, and AC-4.1 keeps the same cleanup and now
  states the real target. Neither edit created new obligations for T-phase to absorb.
- AC-4.1's generic phrasing is the better of the two available fixes: an enumeration would have
  had to be re-verified against the sync script on every future change, and would already have
  been one entry short.

## Recommendation

**Approved with minor changes**

Neither blocking condition is met: the delta introduced no defect — it repaired two — and every
load-bearing claim re-checked against HEAD holds. The single remaining Low is cosmetic and
inherited.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
