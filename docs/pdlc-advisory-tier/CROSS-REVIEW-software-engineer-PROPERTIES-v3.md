# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 3
**Scope:** Local (unless a finding row says otherwise)
**Delta base:** `91439f6` (the commit my v2 review was written against) → `fd4bced`
(`git diff 91439f6 HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`: seven commits,
`0b230d3` … `fd4bced`). Only the changed sections were re-read.

## Disposition of v2 findings

All four are resolved, and each was re-verified against the tree rather than against the revision's
own description of itself.

| v2 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | High | **Resolved** | §6.5 conjunct 1 now reads "at the three seams that can apply an action — A2, A4, A5", and a new paragraph puts A1 **and** A3 on the stronger form with the citations checked: TSPEC §4.3's "(A1, A3) supplies `permittedActions: []` and an `apply` that is never reached" is at `TSPEC:422-423`; §5.5's gate table gives A1's row as "`permittedActions: []` means the gate is unreachable anyway" (`TSPEC:638`) and A3's as the literal "unreachable (`permittedActions: []`)" (`TSPEC:640`); PLAN A-23's "A3's `permittedActions: []` with throwing `apply`/`revert` stubs" is at `PLAN:274`. All four citations are correct to the line. The failure mode I named — a case asserting a disposition A3 cannot produce, red in A-07 and undiagnosed until A-23 — is now named in the document itself. (One residual scoping slip in the same paragraph — F-01 below, Low.) |
| F-02 | Medium | **Resolved, and better than asked.** | PROP-DIS-06 now transcribes `/\.enabled\b/` as its matcher and pins the counted set in four bullets. The reason the literal token failed is now stated with the three sites' actual shapes, all verified: driver `config.enabled === false` (`TSPEC:1240-1241`), notice gate `advisory.config.enabled` (`TSPEC:286`), distil guard `advisory.enabled` (`TSPEC:1113`) — so the old token does find exactly one. The parser exclusion is the part I did not ask for and it is right: `parseImplementationConfig`'s precedent reads keys through a computed `section[key]` (`orchestrate-dev.js:203-209` — verified, `const v = section[key]`), which produces no `.enabled` match, so counting the parser would make the expected total depend on an unmade choice. The exclusion carries its own non-empty-slice control keyed on `invalidKeys`, which closes the "a slice removing zero bytes passes" hole. I re-ran the grounding: `grep -c '\.enabled\b'` returns **0** on `orchestrate-dev.js` and **0** on `orchestrate-queue.js` at branch head, as stated. `ADVISORY_DEFAULTS`' `enabled: false` (`TSPEC:241`) is a property definition, not a read, so it does not perturb the count. |
| F-03 | Medium | **Resolved** | Both source-scan properties now take their controls from `pdlc/workflows/__tests__/fixtures/scanFixtures.js`, outside both scanned globs. The exclusion is real, not asserted: `pdlc/workflows/package.json`'s jest block lists `"/__tests__/fixtures/"` in `testPathIgnorePatterns`, so the module is never collected as a suite. §2.1 also rejects the runtime-assembly alternative with a reason I agree with (a scan hardened against fragment assembly would match its own control). §10.3 gained the matching rewrite and both properties now assert the scanned set **non-empty** first, which answers v2 Q-06 without my having to file it as a finding. |
| F-04 | Low | **Resolved** | (a) §12.4 now states the declaration "lives in PROP-A4-09 and nowhere else" and tells a scan that two occurrences are the declaration plus the audit's own sentence, three a real invented case. (b) PROP-BUD-03's Home cell names `advisoryDriver.test.js`, block `A-22 — driver lifecycle`; §12.2's A-07 and A-22 rows and §12.3's `advisoryDriver.test.js` row all carry the driver half now, so the A-07 author has the matrix row they lacked. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
