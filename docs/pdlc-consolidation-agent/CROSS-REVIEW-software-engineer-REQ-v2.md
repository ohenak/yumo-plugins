# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 2
**Scope:** Local + Cross-Feature (delta re-review — v1 findings + changed sections only)
**Baseline diffed:** `cb72752..d2b93d7` (8 revision commits, +317/−91)

## Prior-Finding Disposition

All sixteen v1 findings, checked against the revision. Nothing below is re-litigated.

| v1 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-3.7 no longer claims inheritance. It asserts three of the pass's *own* observables (no merge rights, never calls a merge API, carries an identifying trailer) and states plainly that "No code path in this repository evaluates an inbound PR raised by another process". Every citation checks out: `guardVerdict` `orchestrate-dev.js:732`, `effectiveGuardPaths` `:709`, MERGE ladder `:899-900`, envelope check `:2143`, `mergeMode: "off"` `:61`, refusal `:838`. Repo-side enforcement is bound as BL-05. |
| F-02 | High | **Resolved** | AC-3.1 now says "**exactly** `MERGE_GUARD_DEFAULTS`" and enumerates all four members verbatim against `orchestrate-dev.js:48-53`, with the `pdlc/hooks/` case called out explicitly. NFR-1 restates the same constant. Set-equality obligation is stated, not implied. |
| F-03 | High | **Resolved** | AC-3.8 specifies the same-repo configuration as primary and pins the mechanism: a separate clone under a temporary directory, cut from the fetched default branch. §1 states the topology. (See v2 F-03 for a residue.) |
| F-04 | High | **Resolved** | REQ-CONS-01's preamble names `/loop run /pdlc:consolidate-learnings` (the vehicle CLAUDE.md:215 already documents for the queue) and states correctly that nothing in `pdlc/hooks/hooks.json` can start a pass — `PreToolUse` `:3`, `PostToolUse` `:14`, `SessionStart` `:29`, all session-triggered. The hook's advisory-only role is preserved, not repurposed. Session-free execution is D-CONS-04/07. |
| F-05 | High | **Resolved** | AC-1.3 gives the marker a form (`IN-PROGRESS: {passId} {ISO-8601}`), a location (`docs/_decisions/.consolidation-log.md`), a writer, a release-on-every-terminal-outcome rule, a stale reclaim keyed to `consolidation.staleLockMinutes`, and an operator escape. Crash recovery is explicit. |
| F-06 | High | **Resolved** | §4a declares all six keys with defaults, malformed/absent behavior, consuming AC, and a named owner ("the repo operator"), shaped after `parseAdvisoryConfig`'s per-key independent fallback. Every AC that cites a configured value has a row. |
| F-07 | High | **Resolved as scoped** | REQ-CONS-06 narrowed off the destroyed artifact onto `ESCALATIONS.md`, with the persistence gap bound as D-CONS-06. The narrowing is the right call; the new input has its own problem — v2 F-01, a new finding, not this one reopened. |
| F-08 | High | **Resolved** | §5a is a stopping rule pasted into the artifact, per DC-09 (`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`), and it names both the approve-and-route case and the fix-here case. |
| F-09 | Medium | **Resolved** | `docs/_queue/ESCALATIONS.md` is now the named input of REQ-CONS-06, with `ESCALATIONS_PATH` `:2750`, append site `:2812` and `renderEscalationEntry` `:2763` cited. The `Feature`/`Seam` field claim is accurate (`:2782-2783`). |
| F-10 | Medium | **Resolved** | AC-1.5 states both rungs; AC-1.6 states the fallback-with-notice path and the neither-resolves path (`failed` / `advisory-model-unresolved`, no default-model fallthrough). The module-privacy of both constants is acknowledged and the restatement is flagged as a risk rather than an inherited guarantee. |
| F-11 | Medium | **Resolved** | AC-5.2 replaces the quality adjective with a three-arm deterministic rule over the consumed set, plus a set-equality obligation on the table and an explicit pre-convention-LEARNINGS carve-out. NFR-4 now derives its truth from that determinism. |
| F-12 | Medium | **Resolved** | The REQ-CONS-03 preamble defines `passId`, the branch name, and two PR trailers; NFR-4 keys idempotence on `PDLC-CONSOLIDATION-SOURCES` and states the leave-it-alone rule for a partial PR. |
| F-13 | Medium | **Resolved** | AC-3.5 carries a five-class failure table with reason codes and per-class recording; AC-3.6 pins branch lifecycle (never reused, not deleted by the pass). |
| F-14 | Medium | **Resolved** | NFR-5 is paired with the positive on the same path — appending consumed basenames to `.consolidation-log.md` — and adds an exactness obligation ("neither more nor fewer"). NFR-2 gets the same treatment via AC-4.2's closed-set `credential:` field. |
| F-15 | Low | **Resolved** | §1 transcribes the four-column table verbatim and cites `pdlc/skills/consolidate-learnings/SKILL.md:54`. |
| F-16 | Low | **Resolved** | `docs/_decisions/` prefixes now appear on every mention of `.consolidation-log.md` and `CONSOLIDATION-PROPOSAL-{passId}.md`. |

Sixteen of sixteen resolved. The findings below are **new**, and all arise in sections the
revision changed.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict
