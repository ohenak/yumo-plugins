# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.9)
**Date:** 2026-08-19
**Iteration:** 10
**Scope:** Delta re-review of the v1.9 erratum round against `CROSS-REVIEW-test-engineer-TSPEC-v9.md`
(reviewed commit `a349767b`), plus grounding of the round's claims on repository HEAD.
Not a full re-review.

## Delta Under Review

`git diff a349767b..HEAD` on the TSPEC is +66/-24 across six commits (`12f506bd`, `0465145e`,
`6f39716d`, `5b06808c`, `a14cdfda`, `3f5a65f9`). Three routed items:

| v9 finding | Edit | Verified at HEAD |
|---|---|---|
| TE v9 F-01 (Medium) — §5.1's stated set-equality with §1.3 false on disk | §5.1 restated as **§5.1 ⊇ §1.3** and gains the missing `advisoryQueueSeams.test.js` row | Direction claim is now the true one; the added row's *content* is stale — see F-01 |
| TE v9 F-03 (Low) — §3.2 step 2's design-intent citation pointed at a comment range not carrying the quoted sentence | Every `orchestrate-dev.js` / `orchestrate-queue.js` pin in §1.3 and §3.2 re-anchored to symbols per DEC-DOC-01 | **Resolved and verified** (below) |
| PM v8 F-01 (Medium) — §4.4's example-teaches-the-affordance overclaim | Withdrawn in all four places; `0` re-homed onto behaviour + AT-07-2b | **Resolved**; FSPEC `:456` does carry AT-07-2b's "`0` in yields `0` back, and the key is absent from the invalid-key report" |

Symbol re-anchoring re-derived at HEAD — all three `.enabled` sites are where the delta says:

- `runAdvisorySeam`'s disabled-tier early return, `orchestrate-dev.js:3262` (`if (!config || config.enabled === false)`)
- the run-level `const advisoryTierOn = advisoryConfigResult.config.enabled;`, `orchestrate-dev.js:13682`
- `orchestrate-queue.js:1265`, inside the `finish` closure (`advisoryConfig.config.enabled ? advisorySummaryRows(advisoryDispositions) : undefined`)

The design-intent comment ("Read once, reused everywhere below … the tier's own master switch is
inspected from source text exactly once here") does sit directly above the `:13682` assignment, so
§3.2 step 2's "the comment sitting directly above that assignment" now cites content, not a range.
The old numeric pins (`:3258`, `:13678`, `:1318`) had indeed drifted, exactly as the changelog says.
PROP-DIS-06's counting oracle at `advisoryDisabled.test.js:634`–`:663` still requires `toHaveLength(3)`
and the three sites above are the only `/\.enabled\b/` matches outside `parseAdvisoryConfig`. The v9
changelog-provenance finding (F-02) is resolved: v1.9 names the **v8** cross-reviews and disposes
PM F-01, TE F-01 and TE F-02 by name.

## Findings

| ID | Severity | Scope | Tags | Finding | Section ref |
|----|----------|-------|------|---------|-------------|
| F-01 | High | Local | delta + inherited, nonlocal | **§1.3's transcription table and §5.1's manifest describe an at-HEAD baseline that no longer exists — the test-side A6 transcription has already landed, and the branch is red at HEAD before Phase I starts.** Details and evidence below. | §1.3 (`:254`–`:268`), §5.1 (`:1219`–`:1263`) |
| F-02 | Medium | Process | inherited, nonlocal | **The round's approval anchor points at a commit that is not on the branch.** `git merge-base --is-ancestor a349767b HEAD` is false: the `REVIEWED-COMMIT` carried by v9 (and by the v8 approvals it inherits) is unreachable from HEAD — branch history was rewritten between rounds. Round history, `APPROVAL-HASH` re-verification and any "unchanged since reviewed commit" argument all key on that anchor, so they cannot be mechanically re-derived. Content-level re-grounding still worked (`git diff a349767b..HEAD` resolves both objects), which is why this is not blocking on its own, but every future round on this branch inherits the same broken anchor until it is re-based or re-anchored. | v9 trailer; branch history |
| F-03 | Low | Local | delta, local | **Grammar slip introduced by this round's PM F-01 rewrite:** "`0` is a **intended operator configuration**" — article should be "an". Appears twice, identically, in §4.4's key table and §6's OQ close, so it is one find-and-replace. | §4.4 (`:1098`), §6 (`:1650`) |

### F-01 — evidence

§1.3 states, in the present tense, the eight surfaces that "go red the moment `A6` is declared", each
described as a literal that *currently* reads its pre-A6 value. At HEAD every test-side literal in that
table has already been flipped to its post-A6 value, while the production constants it is paired against
have not:

| §1.3 claim (present tense) | HEAD |
|---|---|
| `advisoryEnvelope.test.js` asserts `toEqual(["A1"…"A5"])` / `["E-1"…"E-4"]` (`:262`–`:263`) | `advisoryEnvelope.test.js:283` already reads "ENVELOPE_DEFAULTS equals {E-1 … E-5, E-6} as a set (A6-02 adds E-5, E-6)" |
| `advisoryRecord.test.js`'s `test.each` seam list "gains A6" (`:265`) | `advisoryRecord.test.js:544` already reads `test.each(["A1","A2","A3","A4","A5","A6"])` |
| `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` gains A6 (`:266`) | `advisoryDriver.test.js:227` already carries `A6: { gate: "declared", action: "E-6" }` |
| `helpers/advisoryDoubles.js`'s `SEAMS` (`:267`) | already carries `makeA6ReplyText` (`:78`) |
| Row counts `toHaveLength(5)` → `6` at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`/`:726` (`:268`) | all four already read `6`, at `:629`, `:634`, `:578`, `:733`; `advisoryHarvest.test.js:580` already asserts `toEqual(["A1"…"A6"])` |
| §5.1: `advisoryWaveGate.test.js` \| **new** (`:1232`) | file exists at HEAD, 1.8K, headed "PLAN A6-00 (batch 1, no deps)" |
| §5.1: `advisory-config-example.test.js` \| **new file** … "Authored, not adjusted — nothing in the engine suite asserts on `advisory` at HEAD" (`:1263`) | file exists at HEAD, 2.5K, and its own header says "At HEAD the example carries no `advisory` section at all, so this is expected RED" |
| §5.1's row added *this round*: `advisoryQueueSeams.test.js` — "`expect(report.advisory.rows).toHaveLength(5)` becomes `6`. Transcription only" (`:1233`) | the transcription is already done; there is no `5` left to change |

The production side is untouched: `orchestrate-dev.js:1951` is still
`ADVISORY_SEAMS = Object.freeze(["A1","A2","A3","A4","A5"])` and `ADVISORY_SEAM_PHASES` (`:3111`) still
carries A1–A5 only. The consequence is observable, not theoretical — `cd pdlc/workflows && npm test` at
HEAD reports **9 failed suites, 28 failed tests** (`advisoryQueueSeams`, `advisoryDisabled`,
`advisoryRecord`, `advisoryEnvelope`, `advisoryDriver`, `advisoryHarvest`, `documentOracles`,
`consumerCleanup`), e.g. `advisoryQueueSeams.test.js:634` fails `expected length 6, length 5`.

Provenance: commit `e3b9d5a3` ("docs(cross-review): se REQ v7 — High findings") swept 11 test files,
two new test files, the regenerated `.claude/workflows/` bundles and 19 `.pdlc-backups/*.bak` artifacts
into a docs-labelled commit. The `.bak` files are what redden `documentOracles.test.js`'s sweep oracles —
the `coveredViolations` whole-tree walk documented in the project's CLAUDE.md.

Why this blocks rather than defers: §1.3 exists precisely so "a PLAN that treats any of these as
incidental will [not] discover them as unexplained red suites in the middle of a wave" (`:270`–`:271`).
The wave is now guaranteed to start from red suites whose cause is *not* the work the wave dispatches,
and A6's own design — escalate on the red script-gate arm — reads that same signal. A red baseline makes
every A6 gate observation ambiguous on its first run, and this round's own delta added a row (`:1233`)
restating the false baseline. The fix is a repo decision, not a doc rewrite I can pick for you: either
revert the test-side transcription and the `.bak`/bundle sweep so HEAD matches §1.3, or re-ground §1.3
and §5.1 on what actually remains to be edited (and re-derive PLAN's batches accordingly). Either way
the phase should not advance while the document's grounding section is false at HEAD.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Was the test-side transcription in `e3b9d5a3` intended as a red-first Phase I wave that jumped the gate, or accidental staging (`git add -A`) during a docs commit? The answer decides F-01's remedy: a wave already underway wants §1.3 re-grounded, an accident wants the commit reverted. The `.bak` artifacts and regenerated bundles riding along in the same commit point at the accident reading. |
| Q-02 | If the transcription stays, does PLAN A6-00's pre-flight gate (`advisoryWaveGate.test.js`, "a red result means the baseline drifted underneath this feature before a single line of new code was written; it must halt the pipeline immediately") still discriminate? It is now landed *inside* the drift it was meant to detect. |

## Positive Observations

- The DEC-DOC-01 re-anchoring is the right fix and was done thoroughly rather than minimally: the round could have shifted one comment range to satisfy F-03 and instead re-anchored every drifting pin in §1.3 and §3.2, including two that had *already* silently drifted (`:3258`→`:3262`, `:13678`→`:13682`, `:1318`→`:1265`). Symbol anchors survive the very wave this feature dispatches; line numbers would not have.
- TE v9 F-01 was resolved by weakening the claim to the true one (§5.1 ⊇ §1.3) rather than by forcing the two lists equal. Containment in one named direction is checkable by a downstream author; the earlier bidirectional claim was false in both directions and the revision says so plainly instead of quietly editing it.
- PM F-01's withdrawal is a model erratum: the overclaim is removed in all four places it appeared, the replaced rationale names what *does* carry the guarantee (`nonNegativeInt` + AT-07-2b — both verified: FSPEC `:456` carries the companion case), and the un-carried part is explicitly parked as needing its own REQ rather than being quietly re-asserted somewhere weaker.
- The changelog now reconciles against the operative v8 approvals and disposes each routed item by id — the provenance line an erratum wave has to trust.

## Recommendation

**Needs revision**

One High. It is not a defect of the prose this round wrote — the v1.9 edits are all correct and all three routed items are resolved — but §1.3 and §5.1 are load-bearing grounding sections and they are false against HEAD, and this round's own delta added a row restating the false baseline. The branch is red at HEAD before Phase I dispatches, which is the exact failure §1.3 exists to prevent. Resolve F-01 (repo revert or re-grounding, per Q-01) and this document is otherwise ready.

DEFERRED: PLAN's A6-00 / A6-04 / A6-05 task rows and batch column need re-deriving once F-01's remedy is chosen — their red-test work appears already landed at HEAD.
DEFERRED: `consumerCleanup.test.js` and `documentOracles.test.js` failures at HEAD are collateral from `e3b9d5a3`'s `.bak`/bundle sweep, not A6 work; worth confirming they clear with the remedy rather than assuming.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
