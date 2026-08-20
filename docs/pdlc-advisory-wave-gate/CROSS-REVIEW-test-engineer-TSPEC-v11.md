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
