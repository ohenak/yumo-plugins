# Cross-Review: product-manager — Final Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the feature diff `main...feat-pdlc-decision-ledger` (implementation), read against `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` and `FSPEC-pdlc-decision-ledger.md`
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review of the revision that answers my v1 findings (`CROSS-REVIEW-product-manager-REVIEW-v1.md`).
Scope of attention is the delta `93a6d0ea9..HEAD` — five commits, `d51df091c` (F-01),
`a73021d03` (F-02), `c3bc9cc3b` (F-03 / TE F-03), `fa83831a3` (TE F-02), `c3c247e69` (TE F-04/F-07)
— plus a regression sweep over what those commits could have broken. Unchanged sections I approved
in v1 were not re-litigated.

What I ran, against the working tree at `HEAD` of `feat-pdlc-decision-ledger`:

- `git diff --stat 93a6d0ea9..HEAD` — 9 files, 545 insertions: production change confined to
  `pdlc/workflows/orchestrate-dev.js` (+40/-20) and its generated twin `pdlc/workflows/dist/pdlc-cli.mjs`;
  the rest is tests, the TE cross-review file, `.gitignore` and the untracked `docs/.DS_Store` removal.
- `npm test -- __tests__/decisionLedger` — **12 suites, 236 tests, all green** (was 231 in v1; +5).
- `npm test` (whole workflows suite) — **166 suites, 5,258 passed, 70 skipped** on three of four runs;
  one run flaked (see F-02 below).
- `node pdlc/workflows/build-runtime.mjs --check` — `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`; the
  dist twin carries the F-01 fix verbatim (`pdlc-cli.mjs:2734-2753`), so the operator-facing artifact
  is the fixed one, not just the source module.
- Two behavioural probes against the shipped module, reported under the F-01 disposition below.

**AC → production caller → served artifact, re-verified after the signature change.** `fa83831a3`
removed `reviewerPrompt`'s `ledgerBlock` parameter, which is the one change in this delta that could
have severed the block from the operator-visible artifact. It has not: `reviewLoop` still reads the
injector once per round (`orchestrate-dev.js:9991`) and threads the block as `runWrapped`'s trailing
argument on exactly the two reviewer dispatches (`:10024`, `:10032`) — grep for `ledgerBlock` over
the module returns those two call sites and no others — and `dispatchAndVerify` appends it last in
the delivered prompt, after the pacing-contract/opener suffix and the learnings block
(`:11610`). The test that drives that caller remains `decisionLedgerMain.test.js`, now with a
routing conjunct proving the creator and optimizer dispatches are byte-identical across the flag-off
and flag-on arms while the reviewer prompts differ (`decisionLedgerMain.test.js:491-514`).

## Prior findings — disposition

## Findings

## Carried-forward upstream items (routed as errata, not findings)

## Questions

## Positive Observations

## Recommendation
