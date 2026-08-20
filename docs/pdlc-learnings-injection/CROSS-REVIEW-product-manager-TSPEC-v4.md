# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 4

**Scope:** Delta re-review of the two commits since the commit I last reviewed
(`0dc24641`): `9102fb86` (answers PM Q-02 — `.baseline-worktree` ignore + `finally` removal) and
`27d3129f` (answers TE Q-01 — the dispatch-set oracle samples the composition site). `git diff
0dc24641..HEAD` on the TSPEC is **+45 / −0**: two inserted blocks, no edits elsewhere. Unchanged
sections were approved in v3 and are not re-litigated. Frozen-round bar applied: only a defect this
delta introduced, or a load-bearing claim contradicted by the repository at HEAD, can block.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (v3) | Low | **Resolved / moot** | The §A.5 sentence that invited widening AC-3.3's two-member set-equality is gone; the surviving statement of the same question is ERR-6's routing paragraph (TSPEC:1196-1199), which explicitly says the locus question is *a product decision routed to REQ*, not a TSPEC restatement. Nothing left to restate. |

No other prior findings were open at v3 (v3 recorded `{high:0, medium:0, low:1}`).

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **FINDING: High \| delta \| local \| TSPEC:188-192 \| The new composition-site set-equality's expected value is incomplete against HEAD, so the oracle reds on a correct implementation.** The delta moves AT-33/AT-02's boundary oracle from report rows to a `_recordDocType(docType)` probe "called in `dispatchAndVerify` immediately *before* `injectHere` is evaluated" (TSPEC:180-182) — i.e. unconditional on `dispatchKind` — and then fixes the expected value at `LEARNINGS_TARGET_DOCTYPES ∪ {null}` (TSPEC:190-191), while mandating set equality rather than containment (TSPEC:186-189). At HEAD the composition site sees an eighth value the expected set omits: Phase H's harvest dispatch passes `docType: "LEARNINGS"` (`pdlc/workflows/orchestrate-dev.js:14730`) into `wrappedDispatch` (`:12397`), which calls `dispatchAndVerify` directly (`:12398`, defined `:8862`) — the same composition point the probe sits at. The full enumeration of `docType`s reaching that point at HEAD is `{REQ (:13766), FSPEC (:13774), TSPEC (:13807), DECISIONS (:13874), PLAN (:13893), PROPERTIES (:13996), null (:14556, Phase CR), "LEARNINGS" (:14730, Phase H)}`. The suite's instrument is a whole `main()` run on the `advisoryDisabled.test.js` pattern (TSPEC:864-867), which reaches Phase H, so the specified assertion fails against correct code the first time it runs. Product cost is the one this oracle exists to prevent: the predictable repair under time pressure is to relax set equality to containment, and containment is exactly the reading that lets a seventh authoring phase inherit injection silently — the NG-5 / C-1 boundary stops being mechanical. **Fix (either, no new product decision needed):** (a) scope the probe to the authoring path so the observed universe is the one the paragraph describes, or (b) state the expected value as the full composition-site enumeration — `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}` — and keep `LEARNINGS_TARGET_DOCTYPES` alone as the *accepted* set. Either way the "asserts equals, never merely contained in" rule at TSPEC:187-189 stays intact. | REQ C-1, NG-5; AC-1.2 |
| F-02 | Low | Local | **FINDING: Low \| delta \| local \| TSPEC:769-788 \| The two `.baseline-worktree` obligations are stated as PLAN tasks but neither is given an oracle.** The section's own evidence is that the hazard is live (`git check-ignore -v .baseline-worktree` exits non-zero at HEAD — I re-measured; and `WALK_SKIP_DIRS = new Set([".git", "node_modules"])`, `pdlc/workflows/lib/document-oracles.mjs:69`, confirms an abandoned worktree would be walked as live `docs/**`). Obligation 1 (anchored `/.baseline-worktree/` ignore rule) and obligation 2 (`finally`-block `git worktree remove --force`) are both checkable — the first by asserting `check-ignore` succeeds, the second by scripting a throw between materialise and remove and asserting the path is gone. Naming those checks would keep AC-6.2's baseline from silently re-acquiring the hazard the section just documented. Non-gating; a PLAN-task note is enough. | AC-6.2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01's fix (a): if the probe is scoped to the authoring path, does it still sample **both** arms of `injectHere` — i.e. is it placed after the `dispatchKind === "authoring"` test but before the `docType` conjunct? That placement keeps the paragraph's stated purpose (seeing a `docType` the feature *declined*) while dropping harvest, and it makes the expected set exactly `LEARNINGS_TARGET_DOCTYPES ∪ {null}` as written. Confirming so PLAN can transcribe one literal, not two. |

## Positive Observations

- **The TE Q-01 answer identifies a real false-green and says so in falsifiable terms.** The premise — a rejected dispatch leaves no `dispatches[]` row, so a report-sourced set equality cannot see the drift — is internally consistent with the TSPEC's own §A.2 contract ("no `dispatches[]` row is recorded", TSPEC:134-135). Choosing the composition site over the report is the right call for AC-1.2's boundary; F-01 is about the expected value, not the instrument.
- **The probe is justified against the module's actual idiom, not asserted.** `_`-prefixed defaulted seams are the established injection pattern in this module (`pdlc/workflows/orchestrate-dev.js:11985-12004`), so a no-op-defaulted `_recordDocType` adds no production behaviour and cannot perturb AC-4.3's byte-identity claim.
- **Every measured claim in the PM Q-02 answer holds at HEAD, including the one that costs the author work.** `git check-ignore -v .baseline-worktree` exits non-zero (no rule covers it); `WALK_SKIP_DIRS` is `new Set([".git", "node_modules"])` at `pdlc/workflows/lib/document-oracles.mjs:69`, so the "shipped gate would scan a second copy of every `docs/**` artifact" consequence is real, not hypothetical; and the anchoring precedent cited is genuine — `.gitignore` carries `/.claude/pdlc.config.json` anchored for exactly the nested-fixture reason quoted. The answer also declines the easy version (ignore *or* remove) and takes both, which is the reading that actually protects the operator.
- **Both additions are purely additive.** `+45 / −0` with no edits to previously approved sections: the frozen round was respected, and the delta review could be genuinely narrow.

DEFERRED: whether the `.baseline-worktree` ignore-and-remove obligations deserve their own AT id in FSPEC's inventory rather than living as untracked PLAN tasks (F-02's fix is sufficient for this round).

## Recommendation

**Needs revision**

One High finding, and it qualifies under the frozen-round bar on both permitted grounds: it was introduced by this round's delta, and its load-bearing claim is contradicted by the repository at HEAD.

Exactly one change is required:

1. **F-01 (High)** — TSPEC:188-192: either scope the `_recordDocType` probe to the authoring path (see Q-01), or restate the composition-site expected value as `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`, citing Phase H's `docType: "LEARNINGS"` (`orchestrate-dev.js:14730` → `:12397` → `:12398`). Keep set equality; do not weaken to containment. No product decision is opened either way.

F-02 (Low) is recorded, not gating, and can be folded into the same edit or into PLAN.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
