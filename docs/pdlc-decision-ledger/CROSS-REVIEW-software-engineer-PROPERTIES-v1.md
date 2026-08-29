# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md`
**Date:** 2026-08-29
**Iteration:** 1

## Verification Performed

Every quantitative and existing-code claim in the document was re-derived at HEAD rather than taken
on the document's word. **All of them reproduce exactly.** Recording that here so later rounds do
not re-pay the cost.

| Claim | Where | Result |
|---|---|---|
| 25 in-scope `DECISIONS-*.md` files at `8c673a09f`; 26 at branch HEAD, the addition being this feature's own DECISIONS | §Overview, FX-CORPUS | **Reproduced.** `git ls-tree -r --name-only 8c673a09f` over the four pathspecs yields 25; `git ls-files` at HEAD yields 26 |
| 141 records = 41 project-level + 100 feature-level under `DECISION_HEADING_RE` with last-wins | §Overview, ORC-01, FX-CORPUS | **Reproduced** by applying `TSPEC`:390's regex verbatim |
| Per-feature distribution: `pdlc-headless-engine` 22, `pdlc-advisory-tier` 11, `pdlc-engine-distribution`/`pdlc-learnings-injection`/`pdlc-loop-economics` 10, `pdlc-consolidation-agent`/`pdlc-wave-resume` 8, `pdlc-engineering-loop` 7, `orchestrate-dev-workflow` 6, `pdlc-advisory-wave-gate`/`pdlc-rcv-budget-stop` 4, `pdlc-plugin-retirement` **0** | ORC-01 | **Reproduced, every row, including the 0** |
| Project-level index = **6,305** bytes over 41 lines | ORC-03 A1/A2 | **Reproduced** under `TSPEC` §4.3's `{id} — {statement}  [{sourcePath} § {id}]` |
| `M-6b` 63-record slice = **10,859** bytes; margin `11,300 − 10,859 = 441` | ORC-03 B2/B3, §Risks | **Reproduced** |
| Eight HEAD symbols exported from `orchestrate-dev.js` at the cited offsets | §Overview | **Verified:** `LEARNINGS_CORPUS_ARGV`:2230, `parseLearningsConfig`:2252, `readLearningsConfigSafely`:2313, `parsePinCheckConfig`:2363, `parseDerivativeStopConfig`:2414 |
| `reviewerPrompt` at `:11433`; its two return paths at `:11483` / `:11506` | PROP-WIRE-08 | **Verified** |
| `fast-check": "^4.9.0"` declared at `pdlc/workflows/package.json:13` | §BND | **Verified** |
| `documentOracles.test.js` census filters `learnings`/`waveResume`/`loop`/`escalationView` and asserts `toBe(102)` | PROP-DISC-07 | **Verified** (`documentOracles.test.js`:398–421) |
| `advisoryDisabled.test.js` searches the LEARNINGS sentinel by exact string, not by shape | §Census prose | **Verified** (`advisoryDisabled.test.js`:718–719) |
| `pdlc.config.example.json` holds exactly the eight named blocks | PROP-DISC-01 | **Verified:** `dispatch advisory implementation learningsInjection cascade review loop merge` |
| `loop-config-example.test.js` transcribes `MERGE_DEFAULTS` rather than importing it | PROP-DISC-03 | **Verified** (`loop-config-example.test.js`:45) |
| `plugin.json` version `0.23.6`; `pdlcPluginCompat: "^0.23.0"` | PROP-DISC-08 | **Verified** |
| `runCaptureScript` exported from `scripts/capture-learnings-baseline.mjs`; `learningsBaselineGuard.test.js`, `loopEconomicsBaselineGuard.test.js`, `loopEconomicsAnchorGuard.test.js` all present | FX-BASELINE, ORC-04, §INV | **Verified** |
| All twelve `decisionLedger*.test.js` modules are new (zero exist at HEAD); `helpers/decisionLedgerDoubles.js` path agrees with `PLAN` T-01 | §Coverage Matrix | **Verified** |

I found **no** unverified existing-code claim and **no** nonexistent-authority citation. Given that
three features have shipped with a fabricated DEC/REQ citation, this is worth stating explicitly.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | Coverage Matrix omits `PLAN` T-00a and binds its obligation to the wrong batch | §Coverage Matrix, PROP-DISC-07 |
| F-02 | Medium | Local | `PLAN` T-20 is traced by no property; PROP-DISC-08 restates it but is bound to green task T-19 | §Coverage Matrix, PROP-DISC-08 |
| F-03 | Medium | Local | "All 12 modules are claimed and none is orphaned" is asserted, not demonstrated — two modules carry no `PROP-*` id and the module set is not set-equal to `PLAN`'s manifest | §Coverage Matrix |
| F-04 | Medium | Local | Pyramid reconciliation arithmetic does not add up (95 vs 98) and leaves 14 properties unclassified | §Coverage Matrix |
| F-05 | Medium | Local | PROP-BND-07 is normative but lives in prose outside the BND table and outside the family count | §BND, ORC-05 |
| F-06 | Medium | Local | PROP-CFG-06 is an absence-only oracle — no positive companion on the same path | PROP-CFG-06 |
| F-07 | Low | Local | Dangling id `PROP-DIS-06` (typo for `PROP-DISC-06`) | §Census prose |
| F-08 | Low | Local | PROP-BND-07 and PROP-BND-12 are discharged by no `FSPEC` AT row; the three ORC/AT ranges over BND disagree | §BND, ORC-03, ORC-05, §AT map |

### F-01 (High) — the Coverage Matrix omits `PLAN` T-00a, and the property that restates T-00a's obligation is bound to batch 9

The document's own completion condition is that every property traces to a `PLAN` task and every
`PLAN` task is traced ("each task id is one of `PLAN`'s 24"). `PLAN` lists 24 tasks; I enumerated
them: `T-00, T-00a, T-01…T-10, T-10a, T-11, T-12, T-12a, T-13…T-20`. **`T-00a` appears nowhere in
this document** — zero occurrences.

That is not a bookkeeping nit, because PROP-DISC-07 restates `T-00a`'s obligation almost verbatim
— *"`documentOracles.test.js`'s `*.test.js` census filter must exclude the `decisionLedger`
namespace **and** still count `102`"* — and the DISC family row assigns DISC red tasks
`T-00, T-03, T-11, T-12, T-12a` and green task **`T-19`**. `PLAN` T-00a is explicitly headed
*"a batch-1 obligation, not a batch-9 one"* and sits in **batch 1**; `T-19` is **batch 9**.

So the matrix instructs the implementer to land the census exclusion in batch 9 — which is exactly
the failure PROP-DISC-07's own prose warns against two lines earlier: *"the literal is **saturated**
at HEAD … so batch 1 alone would redden a required check before any production code exists."* The
document contains both the correct diagnosis and a task mapping that produces the diagnosed failure.
I confirmed the hazard is live: `documentOracles.test.js`:398–421 filters only the four HEAD
prefixes and asserts `toBe(102)`, and `PLAN` T-00a records that batch 1 alone adds three
`decisionLedger*`-prefixed modules (T-00, T-02, T-03). Three new modules, no exclusion, required
check red at the batch-1 gate.

**What must change:** add `T-00a` to the DISC row as the red/owning task for PROP-DISC-07, and split
PROP-DISC-07's row so its batch-1 half (`add the exclusion`) is owned by `T-00a` while the terminal
namespace census stays with `T-12a → T-19` — the split `PLAN` T-00a already draws and this document
collapses.

### F-02 (Medium) — `PLAN` T-20 is traced by no property, and PROP-DISC-08 is bound to T-19

`T-20` likewise appears **zero** times in this document. PROP-DISC-08 states T-20's content exactly
— `build-runtime.mjs --check` clean, `dist/` staged in the same commit, `plugin.json` bumped
`0.23.6 → 0.23.7` against `pdlcPluginCompat: "^0.23.0"` (all three verified at HEAD) — but the DISC
row's only green task is `T-19`. `PLAN` places T-20 in **batch 10**, after T-19, and warns that a
`0.24.0` bump reds batch 10. Binding the version bump to T-19 puts the plugin bump one batch early,
in the same task as the documentation edits.

**What must change:** name `T-20` as PROP-DISC-08's owning task in the Coverage Matrix.

### F-03 (Medium) — the "12 modules claimed, none orphaned" reconciliation is asserted, not demonstrated

The document's stated standard is set-equality over enumerations, so the module census should be
checkable against `PLAN`'s file-ownership manifest. It is not:

1. **Two DISC modules carry no `PROP-*` id.** `decisionLedgerPreflight.test.js` (`PLAN`:152, T-00 —
   the eight-symbol import gate) and `decisionLedgerFixtureGuard.test.js` (`PLAN`:157, T-03 — the
   per-file digest literals plus the 25-path set equality) are listed in the DISC row's module
   column, but PROP-DISC-01…08 state neither obligation. Both live only in `§Overview` and
   `§Fixtures` prose. A module claimed by a family whose eight properties do not include it is the
   definition of orphaned.
2. **`documentOracles.test.js` is missing from the module column** although `PLAN`:244 names it as
   T-12a's green module and PROP-DISC-05 and PROP-DISC-07 both target it.
3. **`decisionLedgerCensus.test.js` is filed under DISC with green task T-19**, but `PLAN`:181 and
   `PLAN`:243 both give it green task **T-18**, and this document's own `§INV` section says
   *"Owner T-11 → T-18"*. The INV row then names only `decisionLedgerLoop.test.js` even though
   PROP-INV-06…10 are census properties owned by `decisionLedgerCensus.test.js`. The same module is
   double-filed and given two different green tasks in two different places.
4. **The OFF row assigns green task `T-13` to T-02.** `PLAN`:101's row has green `—` ("No red
   predecessor by construction"), and this document's ORC-04 says *"Owner: T-02"* with no green.

**What must change:** rebuild the Red/Green columns by transcription from `PLAN`'s file-ownership
manifest (`PLAN`:152–181) and its red→green table (`PLAN`:238–244), and give the preflight gate and
the fixture integrity guard `PROP-*` ids so the module column is a set-equality check rather than a
claim.

### F-04 (Medium) — the pyramid reconciliation does not add up

*"47 pure-unit properties needing no seam, 11 under a generator, 37 integration properties … zero
end-to-end"* sums to **95**, against the stated total of **98**. Summing the matrix's own Level
column: pure unit `CFG 10 + REC 11 + REND 9 + TEXT 6 = 36`; generator `BND 11`; integration
`FAIL 11 + PRE 5 + INV 10 + WIRE 11 = 37`; recorded byte-identity `OFF 6`; repo/document oracle
`DISC 8`. Total 98. The figure `47` is `36 + 11` — BND double-counted as both pure-unit and
generator — after which `OFF` and `DISC`, 14 properties, drop out of the sentence entirely.

The count is load-bearing here: `§Coverage Matrix` uses it as the completeness argument. An
arithmetic completeness claim that does not reconcile cannot be checked by the reader it exists for.

**What must change:** state the partition as `36 / 11 / 37 / 6 / 8 = 98`, or drop the "47".

### F-05 (Medium) — PROP-BND-07 is normative but sits outside the enumeration it belongs to

PROP-BND-07 (*the property's model must carry its own formatter and must not call
`renderDecisionLedgerBlock`*) is stated as a **bold prose paragraph** between the BND table and the
boundary-example rows — not as a table row. Consequences:

- ORC-05 says *"Decides: PROP-BND-01…07"* and the upstream-obligation table cites *"PROP-BND-07
  forbidding renderer reuse"* as part of O-8's discharge, so it is treated as normative everywhere
  except where the family is enumerated.
- The BND count in the Coverage Matrix is **11**, which is the eleven table rows (01–06, 08–12).
  PROP-BND-07 is counted nowhere, so the 98 total excludes it.
- The BND table is exactly the kind of enumerated contract this document elsewhere demands be
  checked by set-equality. A member reachable only through prose cannot be.

This matters more than placement usually would: PROP-BND-07 **is** the anti-echo conjunct for the
whole BND family. If it is the one property with no row and no count, it is the one an implementer
working from the table will silently not write — and PROP-BND-03 then becomes true by construction,
which the paragraph itself explains.

**What must change:** promote PROP-BND-07 to a numbered row (Category: Contract, ✖) and re-count BND
as 12 and the total as 99.

### F-06 (Medium) — PROP-CFG-06 is an absence-only oracle

PROP-CFG-06 reads, in full: *"`parseDecisionLedgerConfig` must **not** throw, must **not** read the
filesystem, must **not** mutate its argument, for **any** input — empty string, JSON scalar at top
level, deeply nested garbage."* Three negatives, no positive companion on the same path: the row
never says what the call **returns** for those inputs. A stub returning `undefined` satisfies every
conjunct.

PROP-CFG-03 supplies the positive (three defaults + `sectionMalformed: true`) only for the
"`decisionLedger` present but not a plain object" case — it does not reach empty string, top-level
scalar, or unparseable text, which are precisely PROP-CFG-06's inputs. This is the one row in the
document that does not meet the standard the document sets for everyone else (compare PROP-PRE-03,
PROP-FAIL-05 and PROP-BND-04, each of which explicitly pairs its absence check with a positive on
the same path and says why).

**What must change:** add the return conjunct — *"returning the three resolved defaults with
`sectionMalformed: true`"* — to PROP-CFG-06 for every input in its range.

### F-07 (Low) — dangling id `PROP-DIS-06`

The census prose reads *"this feature's own wiring sentinels are invisible to **PROP-DIS-06**'s
slice"*. There is no `PROP-DIS-*` family; the intended referent is `PROP-DISC-06`. In a document
whose entire method is id-level traceability, a dangling id is worth one character of repair.

### F-08 (Low) — the three ranges quoted over the BND family disagree, and two BND properties are discharged by no AT

`ORC-05` decides *"PROP-BND-01…07"*, `ORC-03` refers to *"PROP-BND-01…12"*, and the `§BND` mutation
note covers *"PROP-BND-01…04"*. In the `FSPEC` AT map, AT-13 takes 01–04, AT-14 takes 08/09/10 and
AT-15 takes 05/06/11 — leaving **PROP-BND-07 and PROP-BND-12** discharged by no AT row. The document
claims *"Every one of AT-01…AT-18 is claimed"*, which is true in the AT→property direction; the
property→AT direction has these two holes. Reconciling the ranges to one spelling would surface
them.

## Questions

## Positive Observations

## Recommendation

## Verdict
