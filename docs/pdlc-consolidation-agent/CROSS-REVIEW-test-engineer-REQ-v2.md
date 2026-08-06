# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 2
**Scope:** Local (with one Cross-Feature finding, tagged inline)
**Delta base:** `a7e037e` (the tree v1 reviewed) → `d2b93d7` (HEAD)

Delta re-review. Prior findings F-01…F-13 are dispositioned in §Prior findings below; the
new findings are numbered F-14 onward so ids never collide across rounds.

## Prior findings

Every v1 finding is resolved. I re-verified each resolution against the code the revision now
cites, not against the revision's prose.

| v1 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-3.7 no longer claims inheritance. It names three observables owned by this feature — credential grants no merge rights, the pass calls no merge/auto-merge API, the PR carries a recognisable trailer — and restates the real reachability correctly: `guardVerdict` is defined at `pdlc/workflows/orchestrate-dev.js:732` over `effectiveGuardPaths` (`:709`), called only at `:900`/`:899` (Phase MERGE) and `:2143` (advisory envelope), with `mergeMode: "off"` at `:61` and its refusal at `:838`. All six citations check out. |
| F-02 | High | **Resolved** | REQ-CONS-01 adopts the basename predicate as the single definition, citing it exactly (`nudge-consolidation.sh:41`, log at `:32`), and commits to editing `consolidate-learnings/SKILL.md:35` to match — the competing date boundary is still there at that line, so the edit is a real deliverable and not a no-op. The trigger surface is named (`/loop`), and the hook is explicitly excluded with the right evidence: `hooks.json` registers only `PreToolUse`/`PostToolUse`/`SessionStart` (`:3`, `:14`, `:29`) and the script only prints `hookSpecificOutput` (`:47`, header `:4`). |
| F-03 | High | **Resolved** | AC-1.5 requires the rung actually used to be recorded; AC-1.6 adds the fallback branch (mirroring `ADVISORY_MODEL_FALLBACK` at `:1859`) and the total-non-resolution branch with status `failed` / reason `advisory-model-unresolved`. Constants verified module-private at `:1652`, `:1653`. See F-20 for a residual on the *justification*, not on the branches. |
| F-04 | High | **Resolved** | AC-1.3 now carries all three positive conjuncts: exact status `refused`, reason code `consolidation-in-progress`, and a named artifact (`IN-PROGRESS: {passId} {ISO-8601}` in `.consolidation-log.md`) a fixture can plant. The fate of the refused pass is stated (dropped, not queued) and the stale-lock reclaim closes the wedge. See F-18 for a residual on the *release* set. |
| F-05 | High | **Resolved as scoped** | REQ-CONS-06 is narrowed to `docs/_queue/ESCALATIONS.md`, and the narrowing rationale is accurate line by line: `advisorySummaryRows` at `:2708`, in-memory only at `:10663`/`:10695`; `renderAdvisoryEntry` at `:2642` deleted at `:10499`; `advisoryDistilPrompt` at `:7585` genuinely asks only for "a summary of its entries" with no schema; `ESCALATIONS_PATH` at `:2750`, appended at `:2812`, and `renderEscalationEntry` (`:2763`) does emit `\| Feature \|` and `\| Seam \|` rows. D-CONS-06 binds the deferred half. The *availability* of that input is a new finding (F-17), not a regression of F-05. |
| F-06 | High | **Resolved** | `passId` = `{YYYY-MM-DD}-{n}` disambiguates same-day passes across the proposal file, the branch and both trailers; NFR-4 is keyed explicitly (`failure-mode-id` for promotions, `PDLC-CONSOLIDATION-SOURCES` for PRs) and `duplicate-suppressed` gives the negative case a positive outcome. |
| F-07 | Medium | **Resolved** | AC-5.2 states a deterministic three-branch rule and an explicit **set-equality** obligation ("exactly one row per prior promotion … a dropped row is a failure, not a smaller table"). The `recurred` branch is grounded by the new LEARNINGS `failure-mode-id` convention. The `prevented`/`insufficient-evidence` split is not (F-16). |
| F-08 | Medium | **Resolved** | AC-5.3 counts in passes not time, and explicitly skips `insufficient-evidence` verdicts and `no-op` passes — neither advancing nor resetting. Both edge fixtures are now writable. |
| F-09 | Medium | **Resolved** | §4a gives six keys with defaults, per-key malformed behavior, a named owner, and the `parseAdvisoryConfig` contract shape. The `volumeThreshold` default is pinned to the real constant (`nudge-consolidation.sh:25` — `THRESHOLD = 5`, verified). |
| F-10 | Medium | **Resolved** | AC-4.2 pairs the never-logged assertion with a closed three-value `credential:` field (`present (redacted)` / `absent` / `local-gh`) on the same log row; NFR-5 pairs the no-modify assertion with an exact-set consumption record. Both negatives are now falsifiable on a path that demonstrably ran. |
| F-11 | Medium | **Resolved** | AC-3.5 replaces "for any reason" with a five-row table: class, reason code, whether the fallback fires, and what is recorded. AC-4.3 gains its positive conjunct (a `degraded` route with reason code in the AC-7.1 report). |
| F-12 | Low | **Resolved** | Every citation of `.consolidation-log.md` and `CONSOLIDATION-PROPOSAL-*` now carries `docs/_decisions/`. |
| F-13 | Low | **Resolved** | §1 states the four-column table verbatim; matches `pdlc/skills/consolidate-learnings/SKILL.md:54`. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
