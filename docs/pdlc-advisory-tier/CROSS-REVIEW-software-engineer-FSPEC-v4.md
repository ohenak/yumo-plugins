# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** Erratum delta-confirmation only. Not a whole-document re-review. I previously approved this
FSPEC at v3 (`CROSS-REVIEW-software-engineer-FSPEC-v3.md`, REVIEWED-COMMIT `502c070`, "Approved with
minor changes"). One erratum edit has since landed — commit `3bbf934` (v1.2 → v1.3). I read the four
routed items, ran `git show 3bbf934 -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`, and
verified every cross-reference the new text introduces against the document at HEAD. The single
question here: does the delta resolve those four items without breaking anything I previously
approved?

## Disposition of the erratum items

All four items are resolved. Each is an FSPEC-altitude fix — a behavioural rule or a corrected
baseline definition, no implementation contract pulled up — and each new cross-reference resolves to
a real anchor in the document.

| Item (raised by) | Resolved by | Verified |
|---|---|---|
| **D-6 baseline pinned to `26c3f1c` predates already-merged pipeline code** (te-review; se-author) | §12.1 D-6 now defines the right-hand-side baseline as "the feature branch's **pre-feature base** — its fork point from the default branch, which carries every pipeline change already merged there (including Phase PUB's file-creating path, e.g. `raisePrAndVerifyCi`) but not this feature's," and explicitly states this is **not** §2's citation pin `26c3f1c` because that pin "may sit ahead of the branch's pre-feature base, so a run built there would create files a disabled branch-HEAD run does not." T-10-3 (line 855) is updated to the same baseline and cites §12.1 D-6. | **yes** — this is exactly the defect. It is also the situation my own v3 Q-08/Q-09 named: the pin is not an ancestor of `feat-pdlc-advisory-tier` (the branch forks at `7cdfbb0`). The new text makes the created-file oracle compare a disabled branch-HEAD run against a base on the branch's own ancestry, so `raisePrAndVerifyCi`'s outputs sit on **both** sides of the equality and no longer force a spurious diff. §2's pin (line 84) is untouched and still scoped to where `file:line` citations were read — the two concepts are now cleanly separated. |
| **A2-6 (commit before invocation end) vs R-2 (failed record un-takes the action) — ordering never reconciled** (se-author) | §4.1's step-7 paragraph (lines 233–239) now names A2 alongside A5 as a seam whose action is made durable through git: "at **both**, steps 5 and 7 complete **before** that durable git operation, so a failed produced-change check or a failed record write reverts the action before it becomes durable and R-2 governs unambiguously: an A2 re-grounding whose record cannot be written is reverted before it is committed." | **yes** — R-2 now governs A2 on the same terms it governs A5: the record write is a precondition of *surviving*, and a failed write reverts before the commit makes the action durable. This is consistent with §6.4 A2-6 (line 454), whose own last sentence reads "A re-grounding that cannot be committed is a failed action: reverted, refused as `post-action-verification-failed`." The reconciliation is stated as an observable ordering (revert-before-commit), not as a seam signature — correct FSPEC altitude; the apply/verifyGate split the item notes lives TSPEC-side and is not pulled up here. |
| **C-2 unconditionally reports a degraded key, contradicting D-5/S-4/T-10-4's no-content-on-a-disabled-run rule** (se-author) | §5 C-2 (line 145) now gates the substitution notice: "reported on the run report **only when the resolved configuration leaves the tier enabled** — a bad value that resolves the tier to disabled (e.g. a malformed `advisory.enabled`) produces a disabled run, which carries **no** advisory content on its report at all (§12 D-5, §10.3 S-4), this substitution notice included." | **yes** — the contradiction is removed at its source. §12 D-5 (line 834) and §10.3 S-4 (line 718) both exist and both assert a disabled run carries no advisory summary/content, so C-2 now defers to them rather than competing with them. This is the FSPEC half of the emit-side suppression the item notes was decided TSPEC-side in §3.2; the FSPEC states only the observable (no notice on a disabled run), not the suppression mechanism. |

## Non-regression check

The edit is confined to three loci — §5 C-2, the §4.1 step-7 prose paragraph, and §12.1 D-6 with its
paired T-10-3 (plus the version-stamp bump). It touches no section that carried an approval-gating
finding, and it introduces no new contradiction:

- **T-10-4 is now satisfied, not broken.** T-10-4 requires that a malformed config file behave as
  T-10-3 (no advisory content). Under the old C-2, a malformed `advisory.enabled` would have emitted
  a substitution notice — the very contradiction the item names. The new C-2 excludes that notice on
  a disabled run, so C-2 and T-10-4 now agree. The enabled-run behaviour of C-2 (a bad non-enabling
  key still reports its substitution) is unchanged, so no enabled-run test loses its expected notice.
- **A5's ordering is preserved.** The §4.1 rewrite generalises the step-5/step-7-before-durable-git
  rule from A5-only to {A2, A5}; A5's own sequence (steps 5 and 7 before the push, step 6 re-poll
  after it) is restated verbatim, and §9.2 A5-8 is still cited for what the operator observes there.
  A2 correctly gains no re-poll — it is not a CI-poll seam.
- **My five open v3 Lows are untouched and remain non-blocking.** L-05/L-06 (the §4.1 flow-diagram
  terminal and its "consumes no attempt" phrasing), L-07 (H-2's "deferral" wording), L-08 (AT-2's
  membership criterion), and L-09 (T-07-12's final re-poll colour) all sit outside this edit's three
  loci — the erratum changed the §4.1 prose paragraph, not the flow ```code``` block the diagram
  findings reference. They were "Approved with minor changes" in v3 and stay exactly that. This
  delta-confirmation does not re-open them and does not add to them.

## Findings

No new findings. The erratum resolves all four routed items and introduces no High or Medium issue.
The five Low findings from v3 (L-05 … L-09) remain open and remain non-blocking; this confirmation
neither re-opens nor extends them, per the delta-scope of an erratum round.

## Recommendation

**Approved with minor changes**

The erratum resolves all four routed items cleanly and at the correct altitude. D-6's baseline is now
the branch's own pre-feature fork point rather than §2's citation pin, so the disabled-run
created-file oracle compares like against like and `raisePrAndVerifyCi`'s outputs no longer force a
spurious diff — closing the te-review/se-author baseline defect and my own v3 Q-08/Q-09 in one edit.
R-2 now governs A2's commit on the same revert-before-durable-git terms as A5's push, reconciling the
A2-6/R-2 ordering as an observable rule. C-2's substitution notice is gated on the tier resolving to
enabled, removing the contradiction with D-5/S-4/T-10-4. Every new cross-reference resolves to a real
anchor, no approval-gating section regressed, and my five prior Lows are untouched and stay
non-blocking. My v3 approval stands.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 0}
