# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 3
**Scope:** Local (Scope tags per finding below)
**Delta base:** `d2b93d7` (the tree v2 reviewed) → `0b03f4d` (HEAD)

Delta re-review. v2's findings F-14…F-22 are dispositioned in §Prior findings; new findings are
numbered F-23 onward so ids never collide across rounds. Only the six commits that touched the REQ
since `d2b93d7` were read for new issues; unchanged sections approved in v1/v2 were not revisited.

## Prior findings

All nine v2 findings are resolved. Each resolution was re-verified against the code the revision
now cites, not against its prose.

| v2 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-14 | High | **Resolved** | The tick order is now stated as four numbered steps (enumerate → volume → cadence → `skipped-cadence`), and AC-1.1's cheap-exit clause is restated as "having read **no LEARNINGS body** — only basenames were enumerated". That is a true and separately testable claim: `nudge-consolidation.sh:41` is `os.path.basename(p) not in logtext` over a glob (`:28`), and reads no body. AC-1.2's count is explicitly sourced to step 1, so the two ACs no longer demand opposite fixtures for `(interval not elapsed, ≥threshold pending)` — that fixture now has one expected value, `volume`. |
| F-15 | High | **Resolved as scoped** | The datum is named: the most recent row with status in `promoted` / `promoted-degraded` / `no-op` / `failed`, and `skipped-cadence` writes no log row at all (AC-7.2, NFR-3a). The circularity is gone — a tick can no longer advance its own datum. The residual is the *empty* case, which the fix does not cover: see F-24. That is a new gap in the new text, not a survival of F-15. |
| F-16 | High | **Resolved** | The phase observable is named twice over: a new `Phases exercised` row in the harvest metadata table (`pdlc/skills/harvest-learnings/SKILL.md:70-78` — verified: the table runs `:70`–`:78`, `Harvested from` at `:77`), plus a total fallback mapping from `Harvested from` for pre-convention files, with an explicit "any phase the mapping cannot decide counts as **not** exercised → `insufficient-evidence`, never a guessed `prevented`". Both inputs are file text, so the determinism AC-5.2 claims now holds for all three branches. The mapping's own enumeration is incomplete (F-26), which is a narrower defect than F-16 was. |
| F-17 | High | **Resolved** | The availability paragraph now states the precondition and every claim in it checks out: `docs/_queue/` holds `QUEUE.md` alone (verified), `git log --all -- docs/_queue/ESCALATIONS.md` is empty (verified), `advisoryTierOn = advisoryConfigResult.config.enabled` is at `orchestrate-dev.js:9653`, `parseAdvisoryConfig` at `:1682`, `enabled: false` at `:1663`, and this repo's `.claude/pdlc.config.json` carries an `implementation` section only (verified — three keys, no `advisory`). AC-6.1's three-state table makes absence first-class, AC-6.3 now requires a non-empty corpus **and** at least one other seam escalating, and BL-01a records the corpus as not-met. The "first pass proposes widening all five `ADVISORY_SEAMS`" hazard is closed; `ADVISORY_SEAMS` is at `:1669` as cited. |
| F-18 | Medium | **Resolved** | AC-1.3 now carries a six-row take/release table set-equal to AC-7.1's status set, with `refused` (never takes, never releases — "the loser never unlocks the winner") and `skipped-cadence` (terminates before the marker is written) both explicit. The marker is now written *after* the trigger decision, which removes the wedge the v2 reading produced. A per-status fixture table is writable directly from the table, and a deleted row fails set-equality. |
| F-19 | Medium | **Resolved** | §4b gathers every enumerated value with its category, the statuses it may accompany, and its defining AC. The reason-code set I enumerated in v2 is present in full, plus the two new corpus codes. Two joins previously undetermined are settled explicitly. Two residuals in the new table are filed as F-26 and F-27 — neither is a re-litigation of F-19's ask, which was the table itself. |
| F-20 | Medium | **Resolved** | The ladder is reused, not restated: `resolveAdvisoryRung` is exported at `orchestrate-dev.js:1833` and its doc comment at `:1800` reads "TSPEC §3.4's model-rung ladder, and the **one** ladder the tier ships … there is no second, private copy of this ladder anywhere" — exactly what the REQ attributes to it. The queue precedent checks out (comment at `orchestrate-queue.js:1243-1244`, dispatch `:1245-1251`). And the fallback branch now demands a named drift observable (a set-equality test against `:1652-1653`) instead of a "named risk". |
| F-21 | Low | **Resolved** | All three references now attribute the trailers to the REQ-CONS-03 preamble; AC-3.5's `duplicate-suppressed` row cites NFR-4 rather than AC-3.1. |
| F-22 | Low | **Resolved** | AC-5.3 requires the AC-7.1 report to name the chosen alternative over the closed set `revision` / `retirement`, with the choosing *rule* correctly left to FSPEC. §4b carries the pair as its own row. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
