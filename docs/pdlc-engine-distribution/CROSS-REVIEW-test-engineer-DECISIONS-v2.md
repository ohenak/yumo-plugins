# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md`
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Testing lens only, delta-scoped. Round-1 findings (TE F-01…F-08) verified as
resolved or not; only sections changed between `f8dfa56b` and HEAD re-read for new defects.
Unchanged sections already reviewed in v1 are not re-litigated.

## Round-1 finding disposition

Delta read: `git diff f8dfa56b..HEAD` over the document, eight commits
(`668483f1`…`8f3d6a1e`). Every re-derived cost claim the revision *added* was checked against
HEAD rather than accepted from the changelog.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §5 no longer claims the catalogue equality covers the branch. The new accounting is accurate at HEAD: `catalogue.test.js`'s `messageIds()` vs `Object.keys(MESSAGES)` deep-equal is module-against-itself (`pdlc/engine/__tests__/catalogue.test.js:71-74`), its header disclaims the cross-process equality (`:4-6`), and the biting one is `checkMessageCatalogue` (`_assert-suite-wide.mjs:196-210`) driven forward at `assert-suite-wide.test.js:165` and in reverse at `:183` — the reverse direction is correctly described as *an obligation to emit*, not as coverage. The two replacement assertions are positive in both directions (resolved root **is** the discovered one **and** the notice id **is** present; the `devDeclared: true` row asserts the variable **is** honoured), and both assert rendered text, not only the id |
| F-02 | High | **Resolved** | §7 now decides the signalled child rather than naming it: `status === null` → exit `128 + signum`, with the oracle asserting **equality with the decided value** and explicitly rejecting `!== 0` as non-distinguishing. That is the exact-value positive oracle the finding asked for, and the AC-1.4 collision (1 = crash, 2 = halt) is reasoned rather than asserted by fiat |
| F-03 | Medium | **Resolved** | §2 states AF-2's `prepack`-into-temp precondition inline and corrects Reversibility to "AF-1 remains correct; **AF-2 is deleted along with the vendor step**", with `TSPEC:256` and `TSPEC:1782` cited for both halves |
| F-05 | Medium | **Resolved, and upgraded** | The `vendor/`-git-ignored × `files`-allow-list interaction is now named in *both* §2 and §6, and §6 states the anti-erosion reason explicitly ("a cheaper way to satisfy the first reason silently removing the only cover for the second"). The revision went further than asked and *decided* the inclusion mechanism — see F-02 below for the oracle that decision now needs |
| F-06 | Medium | **Resolved** | §8's Reversibility is a three-row state table; row (c) is the corrupt-config-under-`doctor` composition, and §9's carve-out table gained the matching fourth row cross-referencing it. Row (c) is stated as observable behaviour (branch 0's parse-error text, the file named, store root, installed versions, exit 0) rather than as a policy sentence |
| F-07 | Low | **Resolved** | Header `Version` cell is `0.3`, changelog carries the `0.3` row |
| F-08 | Medium | **Resolved** | §3's AC-6.2 bullet now says **N-1**, cites `TSPEC:1948`, and names N-3 as BL-03's unrelated operator item so the next reader does not re-make the slip |
| Q-01 | — | **Answered** | §5 restates the trigger as an operator report and says so honestly, naming why no mechanical observation exists (no telemetry, NG-3) |
| Q-02 | — | **Answered** | §2's trigger now names the CI mechanism: AF-2's two-member set-equality turns red the moment a third vendored file lands |
| Q-03 | — | **Answered** | §8 row (a) compares the **two observed outputs** (launcher `--version` stdout vs the report's engine block), with the two-read-paths rationale and `bin/pdlc.mjs:323-325` cited |

New cost claims introduced by the revision, all re-derived at HEAD and all accurate:
`build-runtime.mjs:94-97` (four `readFileSync(resolve(HERE, …))` calls) and `:531-533`
(`QUEUE_SOURCES`/`DEV_SOURCES`/`CONS_SOURCES`); `MERGE_GUARD_DEFAULTS` with the literal
`"pdlc/workflows/"` at `orchestrate-dev.js:48-53`; the four-member set-equality at
`consolidationRoute.test.js:108-110`; the banner pin at `runtimeBundle.test.js:593-595`; and
the correction that `build-runtime.mjs:19` is a usage comment while `:48-49` is generated
banner text — both verified verbatim. The nine-import count is exact: three `node:` builtins
at `bin/pdlc.mjs:22-24`, six local modules at `:26-31`.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
