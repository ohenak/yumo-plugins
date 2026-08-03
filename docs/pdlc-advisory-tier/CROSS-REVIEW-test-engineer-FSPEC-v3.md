# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.2)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review. Two questions only — are my v2 findings F-01…F-07 resolved, and did the
revision break anything in the sections it touched. Unchanged sections approved in v1/v2 are not
re-litigated. The approval bar is unchanged.

## Delta basis

`git diff a50cafe HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` — 31 insertions,
21 deletions across nine commits (`f2de271` … `502c070`). Touched: §4.1 (flow diagram), §6.6
(T-04-3b), §9.4 (T-07-11, T-07-12), §10.2 (H-2, H-2b), §10.3 (S-3, S-5), §10.6 (T-08-4, T-08-4b,
T-08-8, T-08-10), §12.1 (D-6), §12.3 (T-10-3), §14.1/§14.2, §15.2 (diagram), §16.1 (register),
§18.1/§18.3. Version header 1.1 → 1.2.

Code re-verified for the *changed* claims only; the baseline sha §2 pins (`26c3f1c`) exists in this
clone (`git cat-file -t 26c3f1c` → `commit`), which is what makes D-6's new transcribed-literal
formulation constructible. `dev:N` cites below are at `26c3f1c`, as §2 requires. Local branch and
`origin/feat-pdlc-advisory-tier` are both at `502c070` — no stale base.

| Changed claim | Checked at | Result |
|---|---|---|
| §12.1 D-6 — the expected created-file set is the set at a real pre-feature commit | `26c3f1c` resolves to a commit in this clone; §2 already pins it as the baseline | Confirmed constructible — a golden-master observed once at pre-feature code, not re-derived by the code under test |
| §10.2 H-2 — the pending-CI path is a plain non-escalating refusal | `ciRule` at `dev:759-784`: `pending` → `{result:"refused", row:"10", escalate:false}` | Confirmed; the revised wording now matches the code exactly (my v2 F-07) |
| §9.2 A5-3 rollup-wait exclusion is arithmetically load-bearing | `dev:34` `CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000` against the shipped 10-minute seam budget | Confirmed — re-poll wait alone can exceed the seam budget threefold, so T-07-12's fixture is realisable |
| §10.6 T-08-4 — the distil delete must traverse the guarded channel | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:36` (matches `rm`/`unlink`/`git rm` in a Bash `tool_input.command`), registered `pdlc/hooks/hooks.json:9` | Confirmed — T-08-4's new production-path Given is the one that can falsify an unguarded channel; T-08-4b is the labelled unit companion |
| Upstream REQ AC-8.2 and NFR-4 | `REQ-pdlc-advisory-tier.md:245-248`, `:320-322` | Both still carry the wording the FSPEC has diverged from — re-emitted as errata, not counted here |

## Disposition of v2 findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
