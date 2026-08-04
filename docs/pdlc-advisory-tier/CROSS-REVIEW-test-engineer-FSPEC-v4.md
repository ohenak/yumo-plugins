# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.3)
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** erratum delta-confirmation. I previously approved this FSPEC (v3, `502c070`). It has since
received one targeted erratum commit (`3bbf934`). One question only: does that delta resolve the four
routed items without breaking anything I previously approved? Sections untouched by `3bbf934` are not
re-litigated. **Outcome: the delta does not confirm — the D-6 half of the erratum rests on a claim
the code disproves.**

## Delta basis

`git diff 502c070 HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` — a single erratum
commit `3bbf934`, version header 1.2 → 1.3. Three regions changed: **§3.2 C-2** (config-substitution
rule), **§4.1** (step-order paragraph), and **§12.1 D-6 / §12.2 T-10-3** (disabled-run created-file
baseline).

Grounding cross-checks against code (my skill requires every "X does/does not exist at commit C"
claim be verified against the object, not the prose):

| Changed claim | Checked | Result |
|---|---|---|
| §12.1 D-6 / T-10-3 — `26c3f1c` **predates** file-creating pipeline code (`raisePrAndVerifyCi` / Phase PUB), so a disabled branch-HEAD run compared against it would spuriously differ | `git grep raisePrAndVerifyCi 26c3f1c -- pdlc/workflows/` | **Claim is false.** `26c3f1c` already carries `raisePrAndVerifyCi` — it appears throughout the test suite at that commit (`__tests__/dodPhase.test.js:418,592`, `forcePhases.test.js:412`, `haltAndQueue.test.js:316`) and the PLAN excerpt tracked there names `TASK-P6-03 Implement raisePrAndVerifyCi poll loop`. The premise behind swapping the baseline off `26c3f1c` does not hold. |
| §3.2 C-2 — disabled resolution carries no notice; cross-refs §12 D-5, §10.3 S-4 | D-5 `:834`, S-4 `:718`, T-10-4 `:856` | Targets exist and match; the disabled branch is test-covered by T-10-4 → T-10-3. This item resolves cleanly. |
| §4.1 — A2 commit / A5 push both preceded by steps 5 and 7 | A2-6 `:454`, T-04-6 `:477`; R-2 `:690`, T-08-2 `:743` | Backed by existing rules and tests; makes explicit what R-2 already governed. This item resolves cleanly. |

## Erratum items — disposition

Two of the four items resolve; the two D-6 items do not, because their shared premise is
false against code.

| Item | Raised by | Status | Evidence in v1.3 |
|---|---|---|---|
| **D-6 pins the disabled-run baseline to `26c3f1c`, which predates merged pipeline code (`raisePrAndVerifyCi`/Phase PUB) a branch-HEAD disabled run exercises — the baseline should be the pre-feature branch tip.** | te-review (me) | **Not resolved — premise disproved.** | The edit swaps the D-6 baseline from `26c3f1c` to the branch's fork point on the stated ground that `26c3f1c` sits before `raisePrAndVerifyCi`. `git grep` at `26c3f1c` shows `raisePrAndVerifyCi` is already present there. `26c3f1c` is an ancestor of the default branch and carries every merged pipeline change including Phase PUB's file-creating path — it is therefore a **valid** baseline whose created-file set matches a disabled branch-HEAD run's. My own erratum was mistaken: `26c3f1c` does not predate that code. The edit "fixes" a baseline that was already correct and replaces it with a justification (`26c3f1c` "may sit ahead of the branch's pre-feature base") that is unverified and, on the checked fact, backwards. This is my error to withdraw, not the author's to carry. |
| **D-6 baseline `26c3f1c` predates file-creating pipeline code; baseline should be the pre-feature branch tip.** | se-author | **Not resolved — same disproved premise.** | Same code fact: `26c3f1c` carries `raisePrAndVerifyCi`. Both D-6 items share the false "predates" claim; both should be withdrawn and D-6 left at `26c3f1c`. |
| **A2-6 requires an applied re-grounding committed before invocation end while R-2 requires a failed record write to un-take the action — FSPEC never reconciled the ordering.** | se-author | **Resolved.** | §4.1 now states two seams make their action durable through git — A5 by a push, A2 by a commit — and at both, steps 5 and 7 complete before that git operation, so a failed record write reverts before the action is durable. Backed by A2-6 (`:454`), T-04-6 (`:477`), R-2 (`:690`), T-08-2 (`:743`). This reconciliation is correct and independent of the D-6 defect. |
| **C-2 unconditionally reports a degraded config key, but D-5/S-4/T-10-4 require a disabled run to carry no advisory content.** | se-author | **Resolved.** | C-2 now emits the substitution notice only when the resolved configuration leaves the tier enabled; a value that resolves the tier to disabled (e.g. malformed `advisory.enabled`) suppresses it, matching D-5 (`:834`), S-4 (`:718`), T-10-4 (`:856`). Consistent; independent of the D-6 defect. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The §12.1 D-6 / §12.2 T-10-3 baseline change rests on a claim the code disproves.** The edit moves the disabled-run created-file baseline off `26c3f1c` on the ground that `26c3f1c` predates `raisePrAndVerifyCi` / Phase PUB. `git grep raisePrAndVerifyCi 26c3f1c -- pdlc/workflows/` shows that symbol is already present at `26c3f1c` (test suite + the tracked PLAN excerpt row "Implement `raisePrAndVerifyCi` poll loop"), and `26c3f1c` is an ancestor of the default branch carrying every merged pipeline change. `26c3f1c` is therefore a valid baseline whose created-file set equals a disabled branch-HEAD run's — exactly what D-6 needs. The erratum (mine and se-author's) was based on a false "predates" premise; the correct resolution is to **withdraw both D-6 errata and restore D-6/T-10-3 to `26c3f1c`**, not to substitute the fork point on a reversed, unverified rationale ("may sit ahead"). Any High or Medium finding → Needs revision. | §12.1 D-6, §12.2 T-10-3 |

Non-D-6 regressions I checked and did **not** file:

- **§4.1's revised framing does not contradict A5-8** (`:635`, "A5 is the one seam whose action
  leaves the local tree"): A2's commit is durable through git but local/unpushed; A5's push escapes
  to the remote. The two statements coexist under their own definitions.
- **C-2's newly-conditional notice adds no untested branch.** The tightened disabled → no-notice
  branch is covered by T-10-4 → T-10-3; the enabled + bad-key → notice branch is unchanged from v3.

## Questions

| ID | Question |
|----|---------|
| — | none |

## Positive Observations

- **The A2/A5 ordering reconciliation is a clean fix.** §4.1 was lifted from "A5 is the one seam …"
  to a two-seam rule keyed on durable-through-git, so R-2's revert-before-durable invariant reads
  uniformly and stays consistent with A5-8. This item, and the C-2 report-gating item, both resolve
  as asked and should be kept.

## Recommendation

**Needs revision**

Two of the four routed items (A2-6/R-2 ordering, C-2 report gating) resolve cleanly and should be
kept. The two D-6 items do not: their shared premise — that `26c3f1c` predates `raisePrAndVerifyCi` /
Phase PUB — is disproved by `git grep` at `26c3f1c`, where that code already exists. The original
D-6 baseline (`26c3f1c`) was correct; the erratum replaces it with the fork point on a reversed,
unverified rationale. The fix is to withdraw both D-6 errata and restore D-6/T-10-3 to `26c3f1c`,
leaving the two sound errata in place. One High finding → Needs revision.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
