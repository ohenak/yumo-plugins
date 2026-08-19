# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Test strategy and technical design are the SE/TE reviewers' lenses.

## Verification Performed

Mechanical checks run against the repository at HEAD rather than read off the document:

| Check | Method | Result |
|---|---|---|
| REQ acceptance-criteria coverage | Extracted every `AC-n.m` from REQ; compared to matrix C-1 | Complete — 27 own ACs, all mapped |
| REQ NFR coverage | Extracted `NFR-1`…`NFR-6`; compared to C-1 | Complete — all 6 mapped |
| Apparent AC gaps (`AC-1.6`, `AC-3.6`, `AC-9.2`) | Read cite context in REQ `:367`, `:459`, `:483` | Not gaps — cross-references to `REQ-pdlc-advisory-tier`, correctly excluded |
| FSPEC acceptance-test coverage | Extracted every AT id from FSPEC; compared to matrix C-2 | Complete — 47 ATs, exactly the 47 C-2 claims |
| PLAN task coverage | Extracted `A6-00`…`A6-21` from PLAN task table | Complete — 14 RED tasks carry properties, 8 GREEN tasks accounted for in C-3 |
| Test homes are PLAN-owned | Cross-checked every `Home` against PLAN's file-ownership manifest (`PLAN:135`–`:156`) | No property names a file the manifest does not assign |
| "Verified absent at HEAD" claims | `git cat-file -e HEAD:…` | `advisoryWaveGate.test.js` absent ✓; `pdlc/engine/__tests__/advisory-config-example.test.js` absent ✓ |
| "Ten existing suites verified present" | Same | All ten present ✓ |

Every pinned anchor I sampled resolves to what the document says it does:

| Cited anchor | Actual content at HEAD | Verdict |
|---|---|---|
| `helpers/advisoryDoubles.js:271` | `const SEAMS = ["A1", "A2", "A3", "A4", "A5"];` | Accurate |
| `advisoryDriver.test.js:221` / `:846` | `GATE_EXCLUSIVITY_REGISTRY` declaration / its key-set comparison | Accurate |
| `advisoryDisabled.test.js:622` | `expect(result.advisory.rows).toHaveLength(5);` | Accurate |
| `advisoryQueueSeams.test.js:627` | same shape | Accurate |
| `advisoryHarvest.test.js:571` / `:726` | same shape | Accurate |
| "four bare row-count sites" | Repo-wide grep for `advisory.rows … toHaveLength` returns exactly those four | Complete |
| `advisoryDodSeams.test.js:371` | `mkdtempSync(join(tmpdir(), "pdlc-a3-fixture-"))` — the real-repo fixture builder | Accurate |
| `orchestrate-dev.js:3428`, `:3459` | The two `attempts += 1` arms that never reach `verifyGate` | Accurate |
| `orchestrate-dev.js:2297`–`:2306` | `ADVISORY_REFUSAL_REASONS`, eight members, in PROP-ENV-07's exact order | Byte-accurate |
| `orchestrate-dev.js:2311` | `ADVISORY_EXCLUSIONS = ["X-a","X-e","X-d","X-b","X-c"]` | Byte-accurate, order matches PROP-ENV-06 |
| `orchestrate-dev.js:1938`, `:1947` | `ENVELOPE_DEFAULTS` at four; `ADVISORY_SEAMS` at five | Consistent with the six-member post-A6 expectations |
| Pre-A6 gate-failure literal | `orchestrate-dev.js:14364` — `` Error: Wave ${waveNum} test gate failed — `${implConfig.testCommand}` `` | Accurate |
| Disabled-tier oracle "four sites" | `advisoryDisabled.test.js:554`, `:570`, `:577`, `:603` all `expect(result.advisory).toBeUndefined()` | Accurate — and confirms erratum 1 below |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | PROP-SEAM-02 (`:72`) enumerates the transcription surfaces "as one set" and pins the row-count side exhaustively ("the four"), but the member-literal side is loose prose that omits one concrete site present at HEAD: `advisoryRecord.test.js:496`, `expect(rows.map((r) => r.seam)).toEqual(["A1","A2","A3","A4","A5"])`. That is a full-catalogue ordered equality, distinct from the `test.each` list at `:544` which the row does name; "the harvest and consolidation seam literals" covers `advisoryHarvest.test.js:573` and `consolidationProperties.test.js:250`, but nothing covers `:496`. Oracle I's derivation rule (grep seam members as well as `advisory.rows … toHaveLength`) does catch it, and PLAN A6-03 already owns the file, so the pipeline self-corrects via a red test — hence Low, not a coverage gap. Fix: name `advisoryRecord.test.js:496` alongside `:544` in the row, so the enumeration matches the set-equality bar the document imposes on everyone else. | AT-07-2, AC-1.1 |

### Candidate findings I checked and dismissed

Recorded so the next round does not re-litigate them:

- **PROP-CTR-08 vs PROP-REST-04 (apparent contradiction).** PROP-CTR-08 forbids restoration on the high-confidence/no-proposal escalation while PROP-REST-04 fixes the restoration trigger set at `{refusal, budget exhaustion, red re-gate}`. No conflict: PROP-CTR-08's path carries **no** refusal reason (stated explicitly in the row), consumes no budget, and runs no re-gate, so none of the three triggers fires. The two rows are consistent.
- **PROP-GATE-08's "red against today's behaviour" companion.** Read as a knowingly-failing shipped test on first pass; it is the RED half of the TDD pair that A6-21 turns green. Correct construction, not a defect.
- **PM F-06 from PLAN v1.1 ("example config documents the whole `advisory` section").** PROP-CFG-03 (`:164`) carries it in full — `{"enabled": false, "waveBudgetPerRun": 1}`, both keys asserted. The prior round's finding is discharged by a property, not just by PLAN prose.
- **PROP-REST-09 transcribing a literal out of `orchestrate-dev.js`.** Would ordinarily read as an implementation echo. It is not: the claim under test is "unchanged from today's pipeline" (AC-5.2, M-WG-3), which makes shipped bytes the normative source, and the Fixtures table names the pre-A6 baseline as that source rather than leaving it implicit.
- **REQ objectives O-1…O-8.** Not every objective has a dedicated property, but the binding oracle is the AC/NFR matrix, which is complete. O-2, O-3, O-4, O-7 and O-8 are cited in Traces regardless.

## Questions

| ID | Question |
|----|---------|
| Q-01 | G-1 row 4 accepts that A6's **resolution** counts do not survive Phase PUB, only escalations do, and routes the durable-counts question to `pdlc-engineering-loop`. REQ AC-6.4 states the same honest limit, so this document is faithful. For the product record: is there an intent that a future feature make resolutions countable, or is "escalations only" the settled long-term product answer? Nothing in this feature depends on the answer. |
| Q-02 | PROP-CTR-08's path leaves a `refs/pdlc/a6-snapshot-{N}` ref behind with no restoration performed (snapshot is captured before dispatch per PROP-REST-06, restoration is correctly skipped). Is ref accumulation across many waves an operator-visible concern worth a REQ line, or is it deliberately out of scope as a harmless artifact? |

## Positive Observations

- **The traceability matrices are genuinely complete, not approximately complete.** C-1 covers all 27 REQ ACs and all 6 NFRs; C-2 covers exactly the 47 ATs that FSPEC actually declares — I extracted both id sets mechanically and they are set-equal, not containment-equal. C-3 accounts for all 22 PLAN tasks, explicitly listing the eight GREEN tasks that carry no property rather than silently omitting them. This is the first artifact in this feature where I found no coverage gap at all.
- **Claims about repository state are true.** Nine independently-checked `file:line` anchors and two constant catalogues transcribed byte-for-byte all resolved correctly, including the harder ones (`orchestrate-dev.js:3428`/`:3459` as the attempt-consuming arms that bypass `verifyGate`). The "four bare row-count sites" claim survives a repo-wide grep — it is exhaustive, not illustrative.
- **The document distinguishes what it can prove from what it cannot, and says so in writing.** §G-1 names six things deliberately not made properties with the decision each traces to; §G-2 names three known-soft properties, including the honest admission that AC-2.2's first-match *precedence* is prompt-only with no script oracle, and bounds the blast radius of a misclassification through the class-to-envelope binding. Softness that is declared is a managed risk; softness that is discovered in Phase I is not.
- **The oracle-quality bars are applied, not merely recited.** Oracle O-A rules out three wrong ledger units and says why each would false-green; O-B pairs every absence-shaped conjunct with a positive half on the same fixture; the AC-4.5 obligation ("a negative assertion alone is satisfied by accident") is carried concretely by PROP-ENV-10 rather than restated.
- **Errata are routed, not silently absorbed.** §G-3 declines to quietly follow TSPEC where FSPEC disagrees, and instead names both conflicts for a versioned upstream edit. I verified both independently and both are real — see below.

## Errata raised upstream

Both were surfaced by the author in §G-3; I verified each against the repository and am routing them so they receive a versioned FSPEC edit rather than living on as a documented conflict.

1. **FSPEC AT-01-4 (`FSPEC:325`–`:328`) forbids the oracle every other document mandates.** AT-01-4 requires "the test asserts the key is **absent**, not undefined". REQ AC-1.4, TSPEC §5.2, PLAN A6-20 and PROP-SEAM-05 all specify `undefined`, and the shipped tier's own oracle is `expect(result.advisory).toBeUndefined()` at four sites (`advisoryDisabled.test.js:554`, `:570`, `:577`, `:603`). In JavaScript `toBeUndefined()` passes for a present-but-undefined key, so AT-01-4 as written rules out the assertion the rest of the chain requires. PROPERTIES correctly follows REQ/TSPEC.
2. **FSPEC AT-06-1 (`FSPEC:432`–`:434`) mandates containment where TSPEC mandates set-equality.** AT-06-1 says "Containment is deliberate: the entry keeps the tier's record shape…". TSPEC §5.6's AT-06-1 row requires the entry's field set be asserted by set-equality against a transcribed literal, **not** containment, on the ground that a containment oracle cannot fail on a dropped field (TE F-15). PLAN A6-16 transcribes the set-equality form. The containment wording defeats the defect the correction exists to catch. PROPERTIES correctly follows TSPEC/PLAN.

## Recommendation

**Approved with minor changes**

No High findings. The single Low finding (F-01) asks for one anchor to be added to PROP-SEAM-02's enumeration and does not gate progress; it can be folded into the next revision or absorbed alongside the erratum edits. The two upstream conflicts are FSPEC wording defects in already-decided areas — neither reveals a missing requirement, and §G-4's "none found" on the requirements side matches my own reading.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
