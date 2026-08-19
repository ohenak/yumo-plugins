# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** Delta re-review, product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Test strategy and technical design remain the SE/TE reviewers' lenses.

## Delta Basis

Reviewed at v1: commit `cb529f40` (`docs(...): PM cross-review PROPERTIES v1`).
`git diff cb529f40 HEAD -- .../PROPERTIES-pdlc-advisory-wave-gate.md` = 12 insertions, 9 deletions across six rows plus the changelog. Changed sections only were re-read; approved sections (C-1, C-2, Oracles A–H, §G-3 errata) were not re-litigated.

Changed rows: metadata/changelog (v1.1), PROP-SEAM-02, PROP-ENV-10, PROP-GATE-02, PROP-REC-07, PROP-CFG-03, Fixtures example-config row, C-3 rows A6-02 and A6-17, §G-1 row 7 (E-13), §G-2 first bullet.

## Verification Performed

Every claim newly introduced by the revision was checked against HEAD rather than read as prose.

| Claim (new in v1.1) | Method | Result |
|---|---|---|
| PROP-SEAM-02's added anchors `advisoryRecord.test.js:496`, `:544` | `sed -n '496p;544p'` | `expect(rows.map((r) => r.seam)).toEqual(["A1",…,"A5"])` and `test.each(["A1",…,"A5"])(` — byte-accurate ✓ |
| PROP-SEAM-02's added harvest anchors `advisoryHarvest.test.js:573`, `consolidationProperties.test.js:250` | same | `expect(seamNames).toEqual([…"A5"])` and `rng.pick(["A1",…,"A5"])` ✓ |
| PROP-SEAM-02's four bare row-count sites retained | `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `:726` | all four still `toHaveLength(5)` ✓ |
| PROP-REC-07's `ADVISORY_SEAM_PHASES` at `orchestrate-dev.js:3108`, module-private | `sed -n '3106,3114p'` | `const ADVISORY_SEAM_PHASES = Object.freeze({…})` at `:3108`, no `export` ✓ |
| PROP-REC-07's A3–A5 values `DOD`/`halted`, `PUB`/`halted` | `orchestrate-dev.js:3111`–`:3113` | A3 `DOD`/`halted`, A4 `DOD`/`halted`, A5 `PUB`/`halted` ✓ |
| PROP-REC-07's `unknown` fallback at `orchestrate-dev.js:3338` | `grep -n '"unknown"'` | fallback is `orchestrate-dev.js:3345`–`:3346` (`placement ? placement.id : "unknown"`), inside the `finalOutcome === "escalated"` block opened at `:3337` — anchor is off by ~7 lines, see F-01 |
| PROP-REC-07's home `advisoryEscalationLog.test.js` (A6-17) | PLAN manifest `:152` | A6-17 owns exactly that file ✓ |
| PROP-CFG-03's `ci-arrangement.test.js:39` resolves the example-config path | `sed -n '39p'` | `const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");` ✓ |
| PROP-CFG-03's `:799`–`:819` parses the example config and pins `testCommand` | read range | `JSON.parse(readText(configPath))` plus `assert.match(testCommand, /cd pdlc\/workflows\s*&&\s*npm test/)` and `/cd pdlc\/engine\s*&&\s*npm test/` — both regexes transcribed byte-accurately ✓ |
| PROP-CFG-03's home unchanged (`advisory-config-example.test.js`, A6-04) | PLAN manifest `:139` | A6-04 owns exactly that file; ci-arrangement is cited as precedent, not re-homed ✓ |
| Example config carries no `advisory` section at HEAD | `grep advisory .claude/pdlc.config.example.json` | zero occurrences ✓ (A6-06's edit is still the one that lands it) |
| §G-2's "this repo's `.claude/pdlc.config.json` runs `pdlc/workflows` only" | `grep testCommand .claude/pdlc.config.json` | live config runs `cd pdlc/workflows && npm test …` only; the *example* carries both — the two files are correctly held apart ✓ |
| §G-2's CI job name `Engine tests (ubuntu-latest)` | `.github/workflows/pr-tests.yml:88` | `name: Engine tests (${{ matrix.os }})`, `npm ci && npm test` in `pdlc/engine` ✓ |
| PROP-ENV-10's new traces `BR-8`, `E-17`, `E-18` | FSPEC `:190`, `:279`, `:280` | BR-8 "A6 never commits (AC-4.2)"; E-17 PLAN/manifest/config change refused; E-18 commit/push/tag refused — all three real and on-point ✓ |
| §G-1 row 7's E-13 citation | FSPEC `:270` | matches verbatim in substance: evidence inside existing classes, never a fifth class, best-effort ✓ |
| PROP-GATE-02 restatement against AC-4.1 | REQ `:382`–`:391` | AC-4.1's three positive conjuncts, each on a run of its own, are the three runs the row now enumerates; segment-from-apply framing preserves "gate command re-ran and returned success on its own" ✓ |
| PROP-REC-07 restatement against AC-6.2 | REQ `:460`–`:462` | AC-6.2 requires an appended entry carrying the tier's fields; the oracle now reads the written entry, not the constant ✓ |
| C-3 re-homing consistent | doc `:385`, `:394` | PROP-REC-07 removed from A6-02, added to A6-17 ✓ |

## Prior-Round Findings — Disposition

| Prior ID | Severity | Finding | Disposition |
|---|---|---|---|
| F-01 (v1) | Low | PROP-SEAM-02's member-literal side omitted concrete sites present at HEAD (`advisoryRecord.test.js:496`/`:544`, harvest/consolidation literals) | **Resolved.** The row now names the ordered full-catalogue equality (`:496`), the per-seam `test.each` list (`:544`), and both harvest-consolidation literals (`advisoryHarvest.test.js:573`, `consolidationProperties.test.js:250`), and its Home cell was widened to `advisoryRecord`, `advisoryHarvest`, `consolidationProperties`. All four anchors verified byte-accurate at HEAD; the four bare row-count sites are unchanged. |

The two upstream conflicts I recorded in v1 (FSPEC AT-01-4's "absent, not undefined" wording; FSPEC AT-06-1's containment wording) were raised as errata by the author in §G-3 and remain routed there. They are not re-raised here and are not gating on PROPERTIES.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | PROP-REC-07 (`:157`) says an unregistered seam "falls back to the literal `unknown` at `orchestrate-dev.js:3338`". At HEAD `:3338` is the lookup (`const placement = ADVISORY_SEAM_PHASES[seam];`); the `unknown` literal the property's negative control keys on is at `:3345`–`:3346` (`placement ? placement.id : "unknown"`, `placement ? placement.outcome : "unknown"`). The property's substance is correct and the fallback exists exactly as described — only the anchor points one statement early. Per DEC-DOC-01 an off-by-a-few `file:line` anchor is a Process/Low nit, not a content defect; suggest re-pinning to `:3345`–`:3346` so the negative control's oracle site is the cited site. | AC-6.2 |
| F-02 | Low | Local | PROP-CFG-03 (`:165`) now carries two clauses that a Phase-I reader could take opposite ways: "the paired blast-radius conjunct — `implementation.testCommand` still matches …" reads as an obligation the property imposes, while "Asserted in a purpose-named new engine file, never in `ci-arrangement.test.js`" forbids writing it where those assertions live. As verified above, `ci-arrangement.test.js:799`–`:819` **already** carries both regexes at HEAD, so the conjunct needs no new assertion and no new owner — which is the only reading consistent with PLAN's manifest (`:139`: A6-04 owns `advisory-config-example.test.js` alone; no task owns `ci-arrangement.test.js`). Suggest one clarifying half-sentence ("carried by the pre-existing assertions at `ci-arrangement.test.js:799`–`:819`; A6-04 adds nothing there") so no implementer opens an unowned file to satisfy the row. | C-2, TSPEC §5.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-REC-07 is now homed in A6-17 (RED), whose PLAN dependency is A6-14, while the `ADVISORY_SEAM_PHASES.A6` row it observes lands in A6-05 (GREEN) and the escalation path that writes the entry lands in A6-18. That is the ordinary RED-then-GREEN shape and I read no product problem in it — recording only so the batch author is not surprised that A6-17's red spans two GREEN tasks rather than one. No answer needed for this round. |

## Positive Observations

- **Every prior-round finding was closed by adding evidence, not by softening the claim.** PROP-SEAM-02's enumeration grew four concrete anchors and a wider Home cell; I re-checked all four against HEAD and each is byte-accurate. The row's "one set, cardinality six" contract is now exhaustive rather than illustrative — a deleted seam literal fails somewhere named.
- **PROP-REC-07's re-home is a genuine strengthening of the acceptance-criterion fidelity, not a relocation.** AC-6.2 obliges an *appended entry* carrying the tier's fields; the v1 oracle asserted a module-private constant instead. The v1.1 oracle reads the written entry and pairs the positive half (`I`/`halted`, with A3–A5 keeping `DOD`/`halted` and `PUB`/`halted` on the same suite) against a real negative control (a fixture seam absent from the table reading `unknown`/`unknown`). That is an absence-paired, positive-first oracle on the criterion's own observable.
- **PROP-GATE-02's restatement puts the claim ahead of the mechanism, which is what AC-4.1 asks for.** The row now leads with three runs — apply→green ⇒ resolved; pre-existing red-pass tokens ⇒ **not** resolved on tokens alone; no apply ⇒ not resolved — and demotes the `{value: -1}` carrier to "structure TSPEC mandates". Read against REQ `:382`–`:391`, the three runs are AC-4.1's three positive conjuncts, each on its own fixture, and the segment-origin framing is exactly what stops a verdict standing in for a gate result.
- **The revision kept the example-config and live-config claims apart under pressure.** PROP-CFG-03 asserts on `.claude/pdlc.config.example.json` (both regexes present at HEAD), while §G-2 states this repo's `.claude/pdlc.config.json` runs `pdlc/workflows` only and therefore gives the wave gate no evidence about PROP-CFG-03 — and names `Engine tests (ubuntu-latest)` (`pr-tests.yml:88`) as the real executor. Both statements verified; a weaker document would have blurred the two files and left an operator reading a green wave as proof.
- **§G-1 grew rather than shrank.** E-13 was added to the decided-not-missed list with FSPEC's own reasoning (`FSPEC:270`), so a later set-equality sweep over FSPEC's E table reads it as a decision. Declining to make something a property, in writing, with the citation, is the behaviour that keeps this section trustworthy.
- **PROP-ENV-10's trace widening is honest bookkeeping.** BR-8, E-17 and E-18 all exist upstream (`FSPEC:190`, `:279`, `:280`) and all three are genuinely what that row's prohibition set enforces; the row gained traces without gaining scope.

## Recommendation

**Approved with minor changes**

No High findings, and nothing in the delta narrowed, broadened or dropped an acceptance criterion. My one v1 finding is resolved with verified evidence. The two Low findings above are a stale anchor (F-01) and one ambiguous sentence (F-02); both can be absorbed in any later edit and neither should hold the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
