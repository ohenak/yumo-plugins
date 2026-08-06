# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Local (Scope tags per finding below)
**Delta base:** `980fde0` (the tree v8 reviewed) → HEAD

Delta re-review. v8's findings F-45…F-47 are dispositioned in §Prior findings; new findings are
numbered F-48 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `980fde0`, plus the two new `docs/_constraints/` files they created, were read for new issues;
unchanged sections approved in v1–v8 were not revisited.

## Prior findings

All three v8 findings are dispositioned below, each against the code or the measurement the revision
cites rather than against its prose.

| v8 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-45 | Medium | **Partially resolved — the ordinary path is closed, one state further out is not; refiled as F-48 at Medium** | The round made the choice I said the REQ had to make, and made it on the strongest of my three shapes plus a fourth I had not offered. AC-5.3 gains "**when the pass's chosen alternative is already on a PR in state open or merged, it proposes the other one**", declares `retire` **terminal**, and adds a streak reset — "a **merged** revision resets that promotion's `ineffective` streak to zero … re-judged on two fresh `recurred` counted passes rather than re-flagged on the next one" (`:430-435`). AC-5.1's `action` paragraph was made to agree rather than left behind: remediations reach AC-3.1 "unimpeded **by it**" but "can still be suppressed by an *earlier remediation of the same kind* — each action fires at most once per id" (`:390-392`). The exact v8 fixture is now decidable: promote merged → `ineffective` → `revise` merged → streak 0 → two fresh `recurred` → `ineffective` → `revise` spent → **retire** proposed. What remains is the state one tick beyond that, where *both* alternatives are spent because the retirement is sitting on an open PR; NFR-4's key is open-**or**-merged (`:522-528`), so it suppresses. Refiled narrowly as F-48. |
| F-46 | Medium | **Resolved — the breach is cleared, and cleared by relocation rather than by another compression pass** | At HEAD the REQ is **634 lines / 61,053 bytes** (`wc -l -c`) against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — under both, where v8 measured 683 / 65,492. The 4,439 bytes came out through the mechanism `pm-author/SKILL.md:118` names: two new project-level files, `docs/_constraints/pdlc-consolidation-vocabularies.md` (118 lines — §1 vocabularies, §2 the phase observable, §3 the log's record grammar) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` (60 lines), both committed, each carrying a `Cited by` row and a version. I checked the relocation for loss rather than for size: the §1 table is row-for-row identical to the old §4b table plus both joins and the composition paragraph verbatim, and the three "as above" / "any status emitting a proposal" cells were **replaced by explicit sets** (`:47-49`) under the file's own rule that "no cell in either table below may use a positional back-reference" (`:15-16`) — so the set-equality obligation survived the move and got harder to break by row insertion, not softer. The residual margin is thin enough to note separately (F-50, Low). |
| F-47 | Low | **Resolved, and over-delivered** | AC-5.1 gains "**One promotion is one authored file**" (`:373-380`), which states the split direction as a requirement — "a remedy spanning two authored files is **two** proposals — two ids, two AC-3.3 commits, two AC-5.2 rows, two AC-5.3 streaks — which may share one PR" — so AC-5.2's per-id set-equality and AC-5.3's streak are now decidable for the two-file remedy I described. The paragraph also closes a hole I had not filed: a **generated** path never mints an id, so `pdlc/workflows/orchestrate-dev.js` plus its rebuilt `dist/` bundles is one promotion, not three. That citation checks out — `CLAUDE.md:68` reads "`pdlc/workflows/dist/` must be rebuilt in the same commit", which is what the REQ attributes to it. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
