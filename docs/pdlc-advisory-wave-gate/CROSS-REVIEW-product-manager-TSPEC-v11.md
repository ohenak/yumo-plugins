# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10)
**Date:** 2026-08-19
**Iteration:** 11
**Scope:** Local

Delta scope: `git diff 3f5a65f9..HEAD` on the TSPEC — 78 insertions, 11 deletions across the
changelog, §1.3, §3.2, §5.1 and §7. Frozen round: I judged only whether my two v10 High findings
landed and whether the edit broke anything, grounding every current-state claim in the tree at HEAD.

## Disposition of v10 findings

**v10 F-01 (High) — v1.9's re-grounding paragraph claimed REQ unchanged. RESOLVED.**
The v1.9 entry is now restated (`:38`–`:47`) with the true anchor: REQ moved to v1.9
(`sha256:817b6745…`) in commit `e619b6d6` at 16:42:31, ~15 minutes before the round's first TSPEC
commit, and the old wording is named "false when written, not merely stale". Verified independently:
`shasum -a 256` on REQ at HEAD returns `817b67455ae1…c918a7a8`; FSPEC is unmoved at
`82f74a2d…961c3e`. The two carried conclusions also check out — REQ `:237` carries
`advisory.waveBudgetPerRun` default `1` (matching §4.4's `1`), and `grep -n NFR-4` over the TSPEC
returns only the changelog's own two lines, so no clause inherits the corrected sentence. The
restoration split is stated more precisely than my own v10 text had it: `680efb0c` restores five
round-3 sites, `e619b6d6` carries the two corrections — five plus two, as the new prose says.

**v10 F-02 (High) — §5.1/§1.3 described already-landed test edits as remaining work. RESOLVED.**
The §5.1 row (`:1293`) now reads `toHaveLength(6)` and appends "**Already applied at HEAD** — red,
because production `ADVISORY_SEAMS` still counts five members". A new §1.3 subsection, *State of the
surfaces at HEAD*, re-grounds the whole table. I checked all seven of its rows against the tree:

| Claim | HEAD | Verified |
|---|---|---|
| `ADVISORY_SEAMS` assertion already six-member; production still five | `advisoryEnvelope.test.js:315`–`:317` asserts `{A1…A6}`; `orchestrate-dev.js:1951` freezes `["A1"…"A5"]` | Yes |
| `ENVELOPE_DEFAULTS` test asserts `{E-1…E-6}`; production four | test `:283`–`:284`; `orchestrate-dev.js:1942` freezes `["E-1"…"E-4"]` | Yes |
| `advisoryConfig.test.js` carries `waveBudgetPerRun: 1`; production key absent | test `:50`; `ADVISORY_DEFAULTS` has no such key | Yes |
| `advisoryRecord.test.js` `test.each` carries `A6` but `rows.map` equality still `["A1"…"A5"]` | `:496` reads `["A1","A2","A3","A4","A5"]` | Yes |
| `advisoryDriver.test.js` carries an `A6` block; production registry has none | test `:227` `A6: { gate: "declared", action: "E-6" }`; `ADVISORY_SEAM_PHASES` (`orchestrate-dev.js:3112`–`:3118`) has five rows | Yes |
| Four bare row-count sites already read `toHaveLength(6)` | `advisoryDisabled.test.js:629`, `advisoryQueueSeams.test.js:634`, `advisoryHarvest.test.js:578` and `:733` | Yes |
| `.enabled` occurrence count unchanged at three | `grep -c` returns 2 in `orchestrate-dev.js`, 1 in `orchestrate-queue.js` | Yes |

The subsection also routes the remedy (revert versus let Phase I catch up, and what A6-00's
pre-flight gate does about drift that already landed) to PLAN rather than deciding it here. That is
the right destination and the right restraint for a frozen round — it answers my v10 Q-02 without
opening a decision.

**v10 F-04 (Low) — §3.2's queue-side `.enabled` quotation elided two conjuncts. RESOLVED.**
`:686` now reads `advisoryConfig && advisoryConfig.config && advisoryConfig.config.enabled === false
? undefined : advisorySummaryRows(...)` with an explicit "the two conjuncts before it are presence
guards, only the third is an `.enabled` token" gloss, matching `orchestrate-queue.js:1265`.

**v10 F-03 (Medium, Process) — branch hygiene. NOT resolved, correctly not a TSPEC edit.**
`git ls-files '.claude/workflows/.pdlc-backups/*'` still returns 14 tracked files. The v1.10
changelog now names both this and the docs-labelled commit carrying source edits as owned outside
the document. Restated below as inherited, non-gating.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | FINDING: Medium \| inherited \| nonlocal \| The engine-side example-config claim is now stale in the same way §5.1's queue row was, and this round fixed one site but not its twin. §5.1's manifest row (`:1330`) still calls `pdlc/engine/__tests__/advisory-config-example.test.js` a "**new file** … Authored, not adjusted — nothing in the engine suite asserts on `advisory` at HEAD", and §4.4 (`:1158`) still says "nothing in `pdlc/engine` covers it at HEAD, so the feature authors a purpose-named expectation". Both are false at HEAD: the file is on disk and asserts on the `advisory` section (its own header at `:11`–`:14` says so, and the test body asserts `enabled` boolean plus non-negative-integer `waveBudgetPerRun`). The round's own new §5.1 paragraph (`:1308`–`:1309`) states the truth two lines below the row — "both on disk, the latter red because `.claude/pdlc.config.example.json` carries no `advisory` section at HEAD", which I confirmed: the tracked example carries only `dispatch` and `implementation` keys. Non-gating because the correcting paragraph is adjacent and the design conclusion it supports (purpose-named carrier, deliberately not hung on `ci-arrangement.test.js`) is untouched and correct. **Fix when next touched:** align the `:1330` row and `:1158` clause with the paragraph already written — "authored, early-landed at HEAD, red until the example gains the section". | AC-6.1; §4.4 |
| F-02 | Low | Local | FINDING: Low \| delta \| local \| §1.3's *required end state* table (the one following the new HEAD-state subsection) still quotes pre-edit literals in its **Site** column — the `ADVISORY_SEAMS` row cites `advisoryEnvelope.test.js` as asserting `toEqual(["A1", "A2", "A3", "A4", "A5"])` and the `ENVELOPE_DEFAULTS` row cites `["E-1", "E-2", "E-3", "E-4"]`, while at HEAD those same assertions read `{A1…A6}` (`advisoryEnvelope.test.js:317`) and `{E-1…E-6}` (`:284`). The new subsection disclaims exactly this ("the `Change` column reads as required end state, not as edit still to make") and the disclaimer covers the intent, but it speaks to the *Change* column while the drift sits in *Site*. A reader checking the parenthetical against the file finds a mismatch the prose has not explicitly licensed. Extending the disclaimer to name the Site parentheticals, or dropping the two now-stale literals, closes it. | §1.3 |
| F-03 | Medium | Process | FINDING: Medium \| inherited \| nonlocal \| Repository state, not the TSPEC. Commit `e3b9d5a3`, titled `docs(cross-review): …`, still carries production-test edits plus 14 tracked `.claude/workflows/.pdlc-backups/*.bak` files (`git ls-files` count confirmed at HEAD). Per this project's standing note, `coveredViolations` in `pdlc/workflows/lib/document-oracles.mjs` walks the entire tree under `root`, skipping only `.git/` and `node_modules/`, so tracked tool-cache backups are exactly the class of file that perturbs document oracles and DoD scans; and a docs-labelled commit carrying source edits defeats the round history the pipeline reads. v1.10's changelog now names both as owned outside the document, which is the right disposition. No TSPEC edit required — this belongs to branch hygiene before Phase I. | — |

DEFERRED: Whether the A6 test-side drift already on HEAD is reverted or absorbed by Phase I in PLAN order — §1.3 routes this to a PLAN erratum, which is the correct owner; the TSPEC's own correctness does not turn on the answer.
DEFERRED: §1.3's `.enabled` row states the constraint is "unchanged at three" — worth restating as a PROP-DIS-06 invariant the A6 work must not break, rather than as a state observation, next time §1.3 is touched.

## Questions

| ID | Question |
|----|---------|
| Q-01 | None open. v10's Q-01 (who owns documenting the `0`-with-`enabled: true` affordance) stays closed — the TSPEC correctly declines it and names REQ/FSPEC as the owner. v10's Q-02 (whether the already-red A6 assertions block Phase I opening green) is answered by §1.3's new subsection and routed to PLAN. |

## Positive Observations

- The v1.9 re-grounding repair did the harder, more honest thing: rather than quietly swapping in the right hash, it says the earlier claim was "false when written, not merely stale", and then re-derives the two conclusions that depended on it. A changelog that records its own error class, not just its correction, is what makes round history worth reading.
- The new *State of the surfaces at HEAD* subsection is the strongest single edit this document has taken in several rounds. It converts a table that silently mixed "to do" with "already done" into two tables with an explicit column contract, and every one of its seven rows survived mechanical checking against the tree — including the subtle one, where `advisoryRecord.test.js` carries `A6` in its `test.each` but not yet in its `rows.map` equality.
- Naming the remedy question and then refusing to answer it inside the TSPEC — routing revert-versus-catch-up to a PLAN erratum — is correct scope discipline under a decision freeze. The document says what is true and hands the decision to the artifact that owns it.
- The engine-side test's own header (`advisory-config-example.test.js:11`–`:14`) declares itself expected-RED and says why. Even where §5.1's row lags (F-01), the code carries its own truthful anchor, so no reader is left without a correct account.

## Recommendation

**Approved with minor changes**

Both v10 High findings are resolved and independently verified against HEAD: the REQ v1.9 anchor is
correct and the two conclusions that rested on it hold, and §1.3/§5.1 now describe the already-landed
test-side transcription as landed-and-red rather than as remaining work. No High findings remain, and
nothing the delta introduced broke a claim that previously held. F-01 and F-03 are Medium, F-02 is
Low; none gate. F-01 is worth folding into the next touch of §4.4/§5.1 so the manifest rows agree
with the paragraph directly beneath them.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
