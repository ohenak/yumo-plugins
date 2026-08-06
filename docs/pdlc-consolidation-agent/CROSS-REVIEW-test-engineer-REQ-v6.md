# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Local (Scope tags per finding below)
**Delta base:** `610c19e` (the tree v5 reviewed) → HEAD

Delta re-review. v5's findings F-33…F-37 are dispositioned in §Prior findings; new findings are
numbered F-38 onward so ids never collide across rounds. Only the six commits that touched the REQ
since `610c19e` were read for new issues; unchanged sections approved in v1–v5 were not revisited.

## Prior findings

All five v5 findings are resolved — one of them by correcting *me*. Each disposition was checked
against the code the revision cites, not against its prose.

| v5 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-33 | Medium | **Resolved** | §4b's `no-cadence-datum` row now reads `promoted`, `promoted-degraded`, `no-op`, `failed`, `refused`, and the justifying paragraph replaces the "marker-holding" category with the ordering argument the composition rule actually needs: the code "is decided at step 3 of the tick order, and the marker check that yields `refused` comes after (AC-1.3 — the marker is written 'after the trigger decision of steps 1–4')". That is the derivation, not an assertion, so a set-equality test transcribed from §4b now passes on AC-1.3's two-tick race fixture instead of failing on it. `reclaimed-stale-lock` correctly still excludes `refused`. |
| F-34 | Medium | **Resolved, by the opposite decision — cleanly** | Rather than softening the two absolute "never committed" claims, the revision made them true: AC-1.3's Commits cell for `refused` is now "**no** — it writes its AC-7.2 row but commits nothing", and the reason is stated as the mechanism I raised ("a pathspec stages a whole file, so a refused commit would capture the winner's live `IN-PROGRESS:` line"). Both absolutes survive verbatim (`:334`, and AC-1.3's own `:191`). The ripple was carried in the same revision: §4b's `writes-uncommitted` row **drops** `refused` (a pass that commits nothing cannot lose an `index.lock` race), and AC-3.8b's "commits them itself, exactly once, at its terminal outcome" now defers to "(AC-1.3's Commits column)" rather than asserting universality. The new durability argument that replaces the commit has a gap — F-39 — but the decision itself is sound and the enumerations are consistent with it. |
| F-35 | Low | **Resolved — my finding was wrong** | I claimed `export const PHASE_DISPATCH = {` was `:3336`. It is **`:3337`**; `:3336` is the `// TSPEC-DISPATCH-01` comment and `:3338` is `R: {` (verified at HEAD). The REQ's original label was correct and my correction was off by one in the other direction. The revision did the right thing with a wrong finding: it kept `:3337` and *added* the disambiguating datum — "declaration `:3337`, first key `R:` `:3338`" — so the row can no longer be misread the way I misread it. `:3431` (`DOD: {`) and `:3437` (`};`) re-verified exact. |
| F-36 | Low | **Resolved** | The AC-5.2 citation is now `:10255-10257`. At HEAD `:10255` is `const crResult = await reviewLoop({`, `:10256` is `doc:`, `:10257` is `phase: "CR"` — the cited range now contains the property it is cited to prove. |
| F-37 | Low | **Resolved, and better stated than I asked** | REQ-CONS-01 clause (b) now names "exactly **two**" exempt records, and states the safety property *once* for both rather than twice: "neither is readable as legacy consumption because neither ever carries a basename", then gives each record's field list (marker: passId + ISO-8601; refused row: status, trigger, `credential:`, reason code). That is the shape a legacy-region test transcribes — a quantified claim over a two-member set with the discriminating field named — rather than two prose sentences a reader has to conjoin. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
