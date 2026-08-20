# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10)
**Date:** 2026-08-19
**Iteration:** 11
**Scope:** Delta re-review of v1.10 against my `CROSS-REVIEW-test-engineer-TSPEC-v10.md` (reviewed commit `3c7bf869`), decision-frozen round. Convergence judgement only: were my v10 blocking findings resolved, and did the delta break anything.

## Delta under review

`git diff 3c7bf869..HEAD` on the TSPEC: +78/-11 across six commits (`f7a3c9f4`, `a2c89cb0`, `c4f3aca7`, `db27fbf7`, `176b26e8`, `9c07cfec`, `c61f4294`). Changed regions: version row 1.9 → 1.10, the v1.10 changelog entry, a new "State of the surfaces at HEAD" subsection inside §1.3, the §1.3 row-count and `.enabled` pin re-anchoring, §3.2 step 2's queue-side quotation, §5.1's `advisoryQueueSeams.test.js` row plus a new Status-column caveat, and §6's OQ-1 article fix. No design change.

## Disposition of my v10 findings

| v10 finding | Edit made | Verified at HEAD |
|---|---|---|
| F-01 (High) — §1.3/§5.1 describe an at-HEAD baseline that no longer exists; the A6 test-side transcription already landed in `e3b9d5a3` and the branch is red | §1.3 gains an explicit HEAD-state table separating "landed test-side" from "production residue"; §5.1 gains a Status-column caveat; the `advisoryQueueSeams.test.js` row now transcribes `toHaveLength(6)` and states it is already applied and red; remedy explicitly routed as a PLAN erratum rather than decided here | **Resolved and verified** — every row of the new table checked against HEAD (evidence below) |
| F-02 (Medium, Process) — v9's approval anchor pointed at a commit not reachable from HEAD | No doc edit owed; this is branch hygiene | **No longer live for this round** — v10's reviewed commit `3c7bf869` is an ancestor of HEAD, so this round's delta was mechanically re-derivable |
| F-03 (Low) — "`0` is a **intended operator configuration**" article slip in two places | Fixed at `:1717` ("an **intended operator configuration**"); the §4.4 instance at `:1158` reads "it is the **intended operator configuration**" | **Resolved** |

### F-01 evidence — the new §1.3 HEAD table is true row by row

Each claim re-derived from the repository, not from the document's prose:

| §1.3 table claim | Checked at HEAD |
|---|---|
| `ADVISORY_SEAMS` assertion is six-member; production constant still five | `advisoryEnvelope.test.js:315`–`:317` asserts `["A1"…"A6"]`; `orchestrate-dev.js:1951` is still `Object.freeze(["A1", "A2", "A3", "A4", "A5"])` ✅ |
| `ENVELOPE_DEFAULTS` asserted as `{E-1 … E-6}`; production default still four | `advisoryEnvelope.test.js:283`–`:284`; `orchestrate-dev.js:1942` still `["E-1", "E-2", "E-3", "E-4"]` ✅ |
| `advisoryConfig.test.js` carries `waveBudgetPerRun: 1`; production key absent | `advisoryConfig.test.js:50`; no `waveBudgetPerRun` token anywhere in `orchestrate-dev.js` ✅ |
| Per-seam `rows.map((r) => r.seam)` equality **still reads `["A1" … "A5"]`** | `advisoryRecord.test.js:496` — still the five-member literal; `test.each` list separately carries A6 ✅ (this is the one test-side literal *not* early-landed, exactly as the table says) |
| Gate-exclusivity registry carries `A6` test-side, not production | `advisoryDriver.test.js` carries A6; `orchestrate-dev.js` registry does not ✅ |
| Harvest / property / double seam lists already six | `advisoryHarvest.test.js`, `consolidationProperties.test.js`, `helpers/advisoryDoubles.js` all carry A6 ✅ |
| Four bare row-count sites already read `toHaveLength(6)` | `advisoryDisabled.test.js:629`, `advisoryQueueSeams.test.js:634`, `advisoryHarvest.test.js:578` and `:733` — exactly four ✅ |
| `.enabled` occurrence count unchanged at three | `grep -c '\.enabled\b'` gives 2 in `orchestrate-dev.js` + 1 in `orchestrate-queue.js` = three ✅ |

§5.1's new caveat is also true: `pdlc/workflows/__tests__/advisoryWaveGate.test.js` exists and its first line reads `// advisoryWaveGate.test.js -- PLAN A6-00 (batch 1, no deps).`, and `pdlc/engine/__tests__/advisory-config-example.test.js` exists and is **red** on `node --test` (`# fail 1`) because `.claude/pdlc.config.example.json` carries no `advisory` key at HEAD — which is what the row claims. `e3b9d5a3` is indeed titled `docs(cross-review): …` while carrying `.claude/workflows/.pdlc-backups/*.bak` and regenerated bundles, matching the document's account of how the drift landed.

The round also fixed the §3.2 step 2 quotation (PM F-04): `orchestrate-queue.js:1265` reads `advisoryConfig && advisoryConfig.config && advisoryConfig.config.enabled`, and the document now quotes all three conjuncts and notes only the third is a `.enabled` token — so the exactly-three PROP-DIS-06 pin and the quotation no longer disagree.

## Findings

| ID | Severity | Scope | Tags | Finding | Section ref |
|----|----------|-------|------|---------|-------------|
| — | — | — | — | None. No High finding remains; the delta introduced no defect and no load-bearing claim in the changed sections contradicts the repository at HEAD. | — |

DEFERRED: PLAN's A6-00 / A6-04 / A6-05 batch columns still need re-deriving (or `e3b9d5a3`'s test-side edits reverting) now that most transcription work has already landed — TSPEC correctly routes this as a PLAN erratum rather than deciding it here.
DEFERRED: A6-00's pre-flight gate was written to detect exactly the baseline drift that has now landed around it; whether it still discriminates once the drift is inside its own baseline is a PLAN/implementation question, not a TSPEC one.
DEFERRED: `consumerCleanup.test.js` / `documentOracles.test.js` redness at HEAD looks like collateral from `e3b9d5a3`'s `.bak`/bundle sweep rather than A6 work; worth confirming it clears with whichever remedy PLAN picks.

## Questions

| ID | Question |
|----|---------|
| — | None blocking. The one open question from v10 (was the early transcription intentional or an accidental `git add -A`) is now answered *inside* the document as "a repo and PLAN decision, not a TSPEC one", with both remedies named — which is the right disposition for a frozen round. |

## Positive Observations

- The re-grounding was done the honest way: rather than deleting the "required end state" table or pretending the surfaces are untouched, v1.10 keeps the design claim (declaring `A6` cannot be additive) and adds a separate at-HEAD residue table beside it. Both readings survive — an implementer knows what the end state must be *and* what has already moved.
- Every row of that residue table is independently checkable and checks out, including the subtle one: `advisoryRecord.test.js`'s `rows.map` equality is the single literal that did *not* early-land, and the table says so rather than rounding the whole file to "already done".
- §5.1's Status-column caveat fixes the class of defect, not just the instance: it states once that `new`/`edited` describe required end state rather than outstanding work, so the two files that already exist on disk stop reading as false.
- Refusing to decide the remedy here and routing it as a PLAN erratum is the correct seam. A TSPEC cannot resolve a batching question, and inventing one in a frozen round would have been worse than naming it.
- The §3.2 quotation fix removes a real oracle hazard: with only one conjunct quoted, a reader could have added a fourth `.enabled` token believing the guard needed it and silently broken PROP-DIS-06.

## Recommendation

**Approved**

My one High from v10 is resolved and verified against HEAD; the Medium (branch anchor) no longer applies to this round, and the Low is fixed. The delta is confined to changelog, §1.3, §3.2, §5.1 and §6, introduces no design change, and every factual claim it adds is true of the repository at HEAD. The remaining repo-state problem is real but is a PLAN/implementation remedy, correctly routed and recorded above as DEFERRED.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:4a092e85e8f3b58740dd02b09831a056a0dc7d28b1b13786f5ba8a664994ced3
APPROVAL-HASH-NORMALIZED: sha256:47920d813eed5f60ab01a08ab5eb4baca8e16dac5f7568511c7ddb5c9674af94
REVIEWED-COMMIT: c61f42942ca4b5fb29a15d1c41edad902dade03a
UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
