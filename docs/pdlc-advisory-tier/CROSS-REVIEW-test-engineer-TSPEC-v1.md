# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** Testing lens only. Citations verified against `feat-pdlc-advisory-tier` (repo HEAD `5ebec75`; TSPEC pins `5d66c48`, confirmed an ancestor of HEAD, `orchestrate-dev.js` = 8,642 lines as claimed).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **T-03-8's set-equality has no transcribable operands.** T-03-8 (FSPEC §18) compares two shipped enumerations as sets — the permitted-action set and the exclusion set. This TSPEC names neither as an exported frozen literal a test can import or transcribe. `ENVELOPE_DEFAULTS` is referenced as the permitted-action set six times (§2.2, §2.4 diagram, §3.1, §8.3, §13.2, §14.1) but its shape and contents are **never written down** — is it `["E-1".."E-4"]`, or a per-seam map? §3.1 line 209 points to "§5.2" for the definition, but §5.2 defines only the three path regexes and the two predicates, not `ENVELOPE_DEFAULTS`. The exclusion set `{X-a..X-e}` appears only inside §5.1's prose evaluation-order table, never as an exported enumerable. Per the completeness-by-set-equality standard, a set-equality test must transcribe a literal from the spec; here there is no literal. Fix: define both as `Object.freeze(...)` exported constants with explicit literal contents, exactly as §5.3 does for `ADVISORY_REFUSAL_REASONS`, and correct the §3.1 cross-reference. | §3.1, §5.1, §5.3, §13.4(3) |
| F-02 | High | Local | **§17 is cited as an owning section three times but does not exist** — the document ends at §16. §12's E-32 row names §17.3 as the owner of the catch-all disposition ("anything not enumerated ⇒ escalated, driver terminal catch"), and §12's intro repeats it; §10.1 cites §17.2 for the escalation-log no-reader invariant that L-1/T-09-2 depend on. Both contracts are load-bearing test targets (E-32 is the terminal fallback disposition; §17.2's "no reader" is what makes T-09-2's "first entry unmodified" true) and neither has any specification a test can be written against. Fix: author §17, or relocate the two contracts into existing sections and repoint every §17.x reference. | §10.1, §12 (E-32) |
| F-03 | Medium | Local | **Two parameterisable parsers have no property-based strategy named.** `parseAdvisoryConfig` (independent per-key fallback + `invalidKeys`) and `parseAdvisoryVerdict` (five malformedness rules) are exactly the classifier/validator shape the project standard requires a property strategy for, yet §13.5 lists only three candidates and §13.4/§4.2 pin both purely as example cases ("five unit cases over one function"). Add ≥1 property each: for `parseAdvisoryConfig`, "for any JSON text the result carries exactly the four keys, each ∈ {parsed-valid value, its default}, and `invalidKeys` equals exactly the out-of-range key set"; for `parseAdvisoryVerdict`, "for any object violating one required field, `malformed === true` and `why` names that field." | §13.4, §13.5, §4.2 |
| F-04 | Low | Local | **§5.4 P-2 mislabels the failing envelope check.** It says a produced diff touching the REQ frontmatter "fails X-d (scope is the REQ but the action is not E-4)." X-d is `declaredScope = [reqPath]`; a frontmatter edit is *within* `reqPath`, so it passes X-d and fails at membership (position 6, "action is not E-4"). The parenthetical contradicts the claim it annotates. The observable refusal reason is `out-of-envelope` either way, but a P-2 test author derives the wrong falsifying fixture (a scope-violating path) from the mislabel. State the failing check as membership (position 6), consistent with `apply` rewriting citation lines only. | §5.4 P-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §11.2 transcribes D-6's baseline as `26c3f1c`, but §1.1 of this same TSPEC establishes that `26c3f1c` **predates** `raisePrAndVerifyCi` (Phase PUB) and other code already on the feature branch. A disabled run is measured at branch HEAD, so its created-file set is compared to a literal captured at an older tree. Can §11.2 establish that the pipeline's created-file set is invariant across `26c3f1c → 5d66c48` (the pre-feature branch tip), or must the fixture be captured at `5d66c48` instead? As written, T-10-3 can red/green-fail for reasons unrelated to the advisory tier. (Root cause is FSPEC D-6's commit pin — routed as an erratum below; noted here because §11.2 inherits it.) |
| Q-02 | §7.4 states A4's `verifyGate` runs `_runCommand(implConfig.testCommand)` and, when `testCommand` is null, escalates rather than degrading. Is there a named integration test that traverses the real Phase-DOD A4 path end-to-end (rebase → gate) and asserts the terminal `escalated` status for the no-`testCommand` repo, as opposed to a `verifyGate`-only unit test? The TSPEC's execution-routing-branch rule wants ≥1 workflow-level test on the full path. |

## Positive Observations

- Citation fidelity is excellent. Every load-bearing symbol resolves at HEAD by name at or within one line of the cited number: `parseImplementationConfig` (dev:181), `guardVerdict`/`effectiveGuardPaths` (dev:731/708), `commitPaths` (dev:6905), `rebaseOntoDefault` (dev:6254), `raisePrAndVerifyCi` (dev:6337, `status === "failed"` at 6371-6373), `parseTriageVerdict` (queue:302), the guard-script `\bgit\s+rm\b` alternative and the exact refusal message it must extend not rewrite, and `build.mjs`'s `wrapModule`/prelude precedent (`realMain = __dev.main`). The "extend, don't rewrite" guard-message coupling (§9.3, R-2) and its dedicated regression test (§13.4(5)) are correctly identified as the highest silent-break risk.
- The pure-leaf / one-impure-driver architecture (§2.4) puts every decision in an unit-testable function and follows the shipped `decideMerge` precedent; this is the right shape and makes most of the suite double-free.
- Negative assertions are consistently paired with positive oracles: §5.4's prohibitions demand the positive triple (T-03-6/AC-4.6), T-05-5 uses a byte-identical-tree comparison rather than an `permittedActions === []` claim, and A5-4's `ciStatus` "no path sets it" is a grep paired with the positive assignment-site enumeration.
- `refusalReasonFor` returning the first ordered match, tested directly over the frozen `ADVISORY_REFUSAL_REASONS` (which **is** fully written out in §5.3), is the model F-01 asks the envelope/exclusion sets to follow.

## Recommendation

**Needs revision**

Two High findings (F-01, F-02) each remove the ability to write a test the TSPEC's own strategy names: F-01 leaves T-03-8's set-equality with no literal operands, and F-02 leaves E-32's terminal disposition and L-1's no-reader invariant specified only by pointers to a section that does not exist. F-03 requires property strategies for two parsers. Resolve F-01/F-02/F-03; F-04 and the two Questions can be folded into the same revision.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
