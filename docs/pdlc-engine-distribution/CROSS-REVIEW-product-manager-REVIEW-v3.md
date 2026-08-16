# Cross-Review: product-manager — Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** implementation on `feat-pdlc-engine-distribution` (delta `2bc136d2..HEAD`), against `REQ-pdlc-engine-distribution.md` §5 and my own round-2 review `CROSS-REVIEW-product-manager-REVIEW-v2.md`
**Date:** 2026-08-16
**Iteration:** 3
**Scope:** Local / Cross-Feature / Process tags on every finding

## Method

Delta review per the protocol. Read my round-2 review first, then `git diff
2bc136d2..HEAD` (8 files, +415/−64 across six commits), and exercised only what
changed. Nothing outside the delta is re-litigated; every claim below was
checked against the tree rather than read off a commit message.

**Both suites run, not quoted.** `pdlc/engine` → `1..747`, 808 tests, **806 pass
/ 0 fail / 2 skipped** (the two documented `PDLC_LIVE=1` opt-in legs).
`pdlc/workflows` → **4 516 pass / 1 fail**, the same known-local false red
carried since round 1 (`documentOracles.test.js` AT-23 walking this checkout's
untracked `.claude/` and `.serena/` trees; CI is green).

**The two behaviour fixes were run as an operator, not read.** With an empty
store, `pdlc --version` still prints branch 7's refusal wording — correct, since
nothing runs — while `pdlc dev …` now prints `no engine version is installed;
running in place as 0.1.0 — run `npm install -g @kaneho/pdlc-engine` to populate
the version store if you want to pin a version`, and the pipeline then proceeds.
That is the fix F-02 asked for, observed end to end.

**The ledger's own evidence was re-derived, not accepted.** All 57 extractable
paths in PLAN §3's ownership manifest exist at HEAD (none missing); both `[gate]`
rows check out against their records — `DEC-DIST-06` exists at
`docs/_decisions/DECISIONS-plugin-distribution.md:143`, `**N-2 recorded:** yes`
at `:176`, `pdlc/engine/LICENSE` is present, and `package.json:19` carries
`"license": "MIT"`.

## Round-2 disposition

All four round-2 findings (0 High, 2 Medium, 2 Low) are resolved. None was
closed by widening a test.

| Round-2 ID | Sev | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The empty-store dispatching arm now has two legs (`launch-wiring.test.js:291-338`, commit `dd7eb185`). They assert the arm *by count* — `runMain` once, `exec` zero, so a spawn against a store with no entry is a bug the leg names — and assert `{mode:"unresolved",version:null,pin:null}` in the marker `runMain` stamps. This was the one launcher arm no oracle observed |
| F-02 | Medium | **Resolved** | New catalogue id `store.empty-in-place` (`lib/catalogue.mjs:112-118`), selected in `launchMoveFor` only on the proceeding arm (`bin/cli.mjs:320-325`). `--version`/`doctor` keep the refusal wording where it is correct. Verified by running both. The oracle pairs positives (`running in place as \d+\.\d+\.\d+`, `npm install -g`) with the negative (`before running pdlc` absent) on the same path, so it is not absence-only |
| F-03 | Medium | **Resolved** | `659f8ed2` flips 53 rows; the Status column is now **59 ✅ / 0 ⬚**. I re-derived the flip's evidence independently rather than trusting the changelog — see Method. The two `[gate]` rows are the ones most easily asserted without proof, and both hold |
| F-04 | Low | **Resolved** | `devModeKinds.test.js` leg 5 (`de512cfe`) drives two provenance values differing *only* in resolved mode through the same placement and asserts each message carries its own rendering and never the other's. It first asserts the two renderings differ, so the discrimination cannot be vacuous. Runs green (6/6). The two suites now say the same thing about the mark |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | PLAN changelog v0.13 bills its evidence as auditable, then quotes an engine run that is not the tree it was committed against: it records `1..744`, `803 pass / 0 fail / 2 skipped`, while HEAD gives `1..747`, **806 pass** / 0 fail / 2 skipped. The suite was evidently run mid-stream, before the last three test commits (`3eaf0e58`, `dd7eb185`, `a3fab532`/`e2b5d188`) landed. The *conclusion* is unaffected — zero failures either way, and I re-derived the manifest and both gate rows myself — so no row is wrongly flipped. But the ledger is what DoD reads as the completion record, and a reader who re-runs the suite gets a number the record does not predict. The workflows figure (`4 516` plus the known local false red) is exactly right. Fix: restate the engine line as `1..747 / 806 pass`, or drop the absolute counts in favour of "0 fail" | — |
| F-02 | Low | Local | The F-02 fix is keyed to one id rather than to the structural condition, so the defect class it closes can return silently. `launchMoveFor` reads `id === "store.empty" ? message("store.empty-in-place", …) : decision.announcement` (`bin/cli.mjs:320-325`). Today that is complete and the comment's claim is true — I enumerated the resolver's refusals (`lib/resolve-version.mjs:58,69,80,84,93`: exactly five ids, four of them in `REFUSING_REFUSAL_IDS`), so `store.empty` is the only id that reaches the proceeding arm and the `: decision.announcement` fallback is currently unreachable. The consequence is the finding: any future refusal id added *outside* `REFUSING_REFUSAL_IDS` inherits its refusal wording on an arm that proceeds — precisely the operator-facing defect just fixed — and the fallback branch has no input that can redden it. Cheapest guard: assert in the test that the set of refusal ids reaching the proceed arm equals `{store.empty}`, so adding a sixth id forces the author to choose wording | AC-5.2 |

### On what is *not* filed here

Two things I checked closely and am deliberately not filing, because in both
cases the delta made the guarantee stronger rather than weaker:

**`3aad8836` narrows two parsers without weakening the contract.** Scoping
`implementedSubcommands` to `main()`'s brace-balanced dispatch switch and
`workflowSubcommandTokens` to non-comment YAML lines is the kind of change that
usually turns a set-equality into a containment. It does not here: the assertion
is still `assert.deepEqual(invoked, implemented)` over both full enumerations
(`publish-channel.test.js:349-354`), and it is now preceded by a positive control
(`invoked.length >= 5`, `implemented.length >= 5`, `:346-347`) that rejects the
one failure mode a scoped parser introduces — an equality between two empty sets
satisfied by a parser that matched nothing. Both parsers also fail closed with a
named message if the region cannot be found.

**`e2b5d188` replaces an implementation echo with a faithful transcription.**
PF-4 previously recovered its expected set by parsing `checkPackedSet`'s own
refusal message, so deleting a member left the suite green — a textbook echo. It
now transcribes TSPEC §5.4's `PK-*` table. I verified the transcription against
the spec rather than assuming it: `TSPEC:347-359` enumerates PK-1…PK-23, and the
test's list matches member for member, including PK-3's conditionality on N-2.
The twelve `PK_LIB_MODULES_AT_HEAD` plus the three from this feature are exactly
the fifteen `pdlc/engine/lib/*.mjs` present at HEAD.

## Questions

## Positive Observations

## Recommendation

## Verdict
