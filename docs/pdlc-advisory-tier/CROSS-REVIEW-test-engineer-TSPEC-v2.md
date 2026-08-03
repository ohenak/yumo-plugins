# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** Delta re-review. Prior review: `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (iteration 1, at repo HEAD `5ebec75`). Changed sections diffed `5ebec75..HEAD` (commits `afd916e`, `8c8f311`, `921dbab`, `590f12d`). Citations re-verified by symbol name at branch HEAD; source files (`orchestrate-dev.js`, `orchestrate-queue.js`) untouched since v1.

## Prior-finding disposition

| Prior ID | Status | Evidence |
|----------|--------|----------|
| F-01 (High) — set-equality had no transcribable operands | **Resolved** | §3.1 now exports `ENVELOPE_DEFAULTS = Object.freeze(["E-1".."E-4"])`; §5.3 exports `ADVISORY_EXCLUSIONS = Object.freeze(["X-a","X-e","X-d","X-b","X-c"])`. Both are literal, frozen, transcribable operands for T-03-8. The stale `// §5.2` cross-reference is corrected to `// the four-member literal above`. §13.2's set-equality row now names `ADVISORY_EXCLUSIONS`. |
| F-02 (High) — §17 cited but absent | **Resolved** | §17 authored: 17.1 (disposition set closed/total), 17.2 (escalation-log no-reader, owning L-1/T-09-2/T-09-8), 17.3 (terminal catch owning E-32). Each contract now has a spec a test can cite; the tests named (grep-for-zero-reads + bytes-intact; `escalatesOnUnclassified`) pair every negative with a positive conjunct. |
| F-03 (Medium) — two parsers lacked property strategies | **Resolved** | §13.5 adds a mandatory property each for `parseAdvisoryConfig` (exactly four keys; each value ∈ {parsed-valid, default}; `invalidKeys` set-equals the out-of-range key set) and `parseAdvisoryVerdict` (one-field-violation ⇒ `malformed && why` names that field; well-formed ⇒ field-equal verdict). Both are set-equality / paired-oracle framed, no implementation echo. |
| F-04 (Low) — §5.4 P-2 mislabelled the failing check | **Resolved** | P-2 now states the diff fails at **membership (§5.1 position 6)** — passes X-d because the edit is within `reqPath`, fails membership because frontmatter rewrite is not the E-4 action. Consistent with §5.1's row-6 table entry and with the `apply`-rewrites-citation-lines-only contract. |
| Q-01 (baseline commit) | Addressed but the fix rests on a **false premise** — see F-05. |
| Q-02 (A4 no-`testCommand` integration test) | Addressed by T-06-8 (§7.4); coverage is complete but the "end-to-end" phrasing overstates — see F-06. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-05 | Medium | Local | **§11.2's baseline rewrite (the Q-01 resolution) is justified by a claim that is exactly backwards against the repo.** §11.2 moves D-6's fixture baseline off `26c3f1c` because, per its cited reason, `26c3f1c` "**predates** `raisePrAndVerifyCi` (Phase PUB) … introduced by `4d5e4dc`, after `26c3f1c`" (also stated in §1.1). Verified against the branch: `raisePrAndVerifyCi` is **defined** at `26c3f1c` — `git grep -n "export async function raisePrAndVerifyCi" 26c3f1c` ⇒ `pdlc/workflows/orchestrate-dev.js:6222` — and its introducing commit `4d5e4dc` ("Add Phase PUB…") is an **ancestor** of `26c3f1c` (`git merge-base --is-ancestor 4d5e4dc 26c3f1c` ⇒ true). So the code the TSPEC says postdates `26c3f1c` in fact predates it. D-6 is the one place the feature transcribes a fixture rather than computing it, so the baseline commit and *why it is that commit* are load-bearing; a test author who checks the cited reason (as this review did) finds it false and cannot tell whether the pre-feature-tip baseline is actually needed or whether `26c3f1c` was adequate all along. The pre-feature-tip conclusion may still be defensible on other grounds (it equals HEAD-minus-feature by construction), but the stated mechanism is not one of them. Fix: either (a) substantiate the pre-feature-tip baseline with a real file-creating path that genuinely postdates `26c3f1c`, or (b) if no such path exists, keep `26c3f1c` and drop both the rewrite and its erratum. The `> Upstream note (routed as an erratum)` in §11.2 is premised on the same false claim and should be withdrawn rather than routed — FSPEC D-6's `26c3f1c` pin is not shown to be wrong. | §11.2, §1.1 |
| F-06 | Low | Local | **T-06-8's "routes to escalation end-to-end" overstates what a scripted-disposition fake proves.** §7.4 says T-06-8 "uses the `_runAdvisorySeam` phase-integration fake (§13.2) for the seam … to prove the `testCommand: null` default routes to escalation end-to-end." The `testCommand: null → revert+escalate` routing lives inside the real `verifyGate`, which is *inside* the faked seam, so T-06-8 cannot prove that routing — it proves the phase halts and reports on an escalated disposition. The routing itself is legitimately covered at the **Seam-unit** level (§13.2: "each real `SeamOps` against fake `_git`/`_ghRun`/`_readFile`", E-24 → §7.4), so the routing-branch rule is satisfied by the suite as a whole; only the sentence overreaches. Fix: attribute the routing proof to the seam-unit test and describe T-06-8 as the phase-wiring assertion over a scripted `escalated` disposition. | §7.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-05: is there any file-creating pipeline path (write/append/git seam) added between `26c3f1c` and this feature's pre-feature branch tip? If yes, cite it — that substantiates the rewrite. If no, `26c3f1c` is an adequate D-6 baseline and the rewrite/erratum can be dropped. |

## Positive Observations

- The v1 High findings are cleanly resolved, and the resolutions follow the model the review asked for: `ENVELOPE_DEFAULTS` / `ADVISORY_EXCLUSIONS` are frozen exactly as `ADVISORY_REFUSAL_REASONS` is, and §17's new tests pair every absence assertion with a positive conjunct rather than standing as absence-only oracles.
- `ADVISORY_EXCLUSIONS`'s array order is deliberately §5.1's evaluation order, so one frozen constant pins both set identity and firing order — the §5.1 table "documents what the constant drives", removing a drift surface a test would otherwise have to police separately.
- The new §13.5 parser properties are genuine invariants over the input space (set-equality on `invalidKeys`; one-field-violation ⇒ named `why`), not example restatements — exactly the property shape the project standard wants for a validator/classifier.
- Every newly-cited symbol resolves at HEAD: `IMPLEMENTATION_DEFAULTS.testCommand: null` (dev:160-164), the Phase-DOD rebase-conflict `haltError` (dev:8281 guard, 8283-8287 throw), `defaultAppendFile` (dev:6805), `parseQueue` (queue:116). The I-6 row ("A4 fires before `haltError`") makes T-06-8's flow internally coherent — A4 escalates within the conflict path, then the pre-existing halt still fires.

## Recommendation

**Needs revision**

All four v1 findings (F-01…F-04) are resolved. One new Medium (F-05) blocks: the D-6 baseline rewrite — the resolution of Q-01 — is justified by a claim about `raisePrAndVerifyCi`'s provenance that is verifiably backwards against `26c3f1c`, leaving the one transcribed-fixture in the feature resting on a false rationale. Resolve F-05 (substantiate the pre-feature-tip baseline with a real postdating path, or revert to `26c3f1c` and withdraw the erratum); F-06 can be folded into the same revision.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 1}
