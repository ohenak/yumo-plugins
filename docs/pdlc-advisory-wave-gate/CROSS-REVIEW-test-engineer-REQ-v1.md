# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-18
**Iteration:** 1
**Scope:** REQ (phase R) — testing lens only: testability of acceptance criteria, oracle
falsifiability, vocabulary totality, completeness of the transcribed-set prerequisite.

Verified against HEAD `7b2c3879` on `feat-pdlc-advisory-wave-gate`. Every baseline fact this REQ
cites by `M-WG-*` id was re-read in code rather than inherited from
`docs/_constraints/pdlc-wave-gate-baseline.md`; the ones I checked all hold at HEAD
(gate ladder `pdlc/workflows/orchestrate-dev.js:10299-10333`, commit-after-green `:10334`,
`FORCE_PHASE_TOKENS` six-member without `I` `:4585`, `ADVISORY_SEAMS` five-member `:1669`,
catalogue-driven report rows `:2711`, `check-req-size.sh:41-42`).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | The inherited exclusion set makes A6 provably unable to act on the incident that motivates it, and the REQ states no precedence rule, so two opposite oracles are derivable. C-1 inherits `REQ-pdlc-advisory-tier` AC-3.4 unchanged; clause (e) excludes "anything under REQ-MERGE-03's self-modification paths", which ship as `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` (`pdlc/workflows/orchestrate-dev.js:48-53`). The motivating incident's wave owns `pdlc/workflows/consolidate-learnings.js` (`docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md:55`) — squarely inside (e). AC-3.2 grants explicit precedence to clause (a) only, so a test writer cannot decide whether E-5/E-6 over self-modification-path owned files is permitted or refused as `out-of-envelope`. Add one AC fixing the precedence in either direction, plus a named test for a wave whose owned-path set intersects the guard list; if the answer is "refused", say so in §1 so US-01 is not read as covering the incident it cites. | §5 C-1, AC-3.1, AC-3.2, §1 |
| F-02 | High | Local | Root-cause classification has no defined receiving-side value, so C-3's totality promise is untestable and AC-2.1/AC-2.2 yield contradictory oracles. C-3 requires "a defined fallback, not undefined behaviour" for an unrecognised, absent or malformed classification but names no value; AC-2.1 says a malformed verdict is an escalation consuming one attempt. A verdict carrying `classification: "flaky-suite"` therefore has two defensible expected outcomes — coerce to `unclassified` and continue, or escalate as `malformed-verdict` (`REQ-pdlc-advisory-tier` AC-3.6 row 6). Name the total function's output in AC-2.2 (and say whether the coerced case still consumes an attempt), so the expected value is a literal transcription from the spec rather than derived by the test author. | AC-2.2, C-3, AC-2.1 |
| F-03 | Medium | Local | `advisory.waveBudgetPerRun`'s counting rule is underdetermined. AC-2.4 caps "an attempt on a wave beyond the `waveBudgetPerRun`-th distinct wave A6 has already **resolved**", but R-3 motivates the cap by compounding drift, which only applied repairs cause. Whether an attempted-and-escalated wave consumes the budget gives opposite oracles for the third wave. State it, and require both tests: two resolved waves + third red wave ⇒ escalate without dispatch; two escalated waves + third red wave ⇒ still attempts. | AC-2.4, C-2, R-3 |
| F-04 | High | Cross-Feature | BL-06 under-enumerates the transcribed set-equality surfaces this REQ reds, so a plan derived from it discovers them as late suite failures. BL-06 and R-5 scope the non-additive change to "M-WG-8's measured sites", i.e. the seam catalogue. But (i) the seam catalogue is asserted by set-equality at three sites, not the one M-WG-8 names: `pdlc/workflows/__tests__/advisoryEnvelope.test.js:317`, `advisoryHarvest.test.js:573`, `advisoryRecord.test.js:496`; (ii) AC-3.1's E-5/E-6 also red `advisoryEnvelope.test.js:283-284` (`ENVELOPE_DEFAULTS` set-equals `{E-1..E-4}`, transcribed literal at `orchestrate-dev.js:1660`); (iii) C-2's new `waveBudgetPerRun` key reds the four-key `ADVISORY_DEFAULTS` shape transcribed at `advisoryDisabled.test.js:129` and `:616` and key-set-compared at `advisoryConfig.test.js:321`. Widen BL-06 to "every transcribed set-equality assertion over `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS`", and widen R-5 accordingly. | BL-06, R-5, C-2, AC-3.1 |
| F-05 | Medium | Local | The disabled-state oracle is absence-only where the tier's is not. NFR-2 asks that "the report carries no A6 row"; a test asserting only that passes on a report that wrongly carries a five-row advisory summary, because the shipped disabled behaviour is that the `advisory` key is **absent/`undefined`** (`REQ-pdlc-advisory-tier` AC-1.6, pinned by `advisoryDisabled.test.js` PROP-DIS-*). Pair the negative with the positive conjunct already available: `advisory` key absent, phase outcomes and created-file set byte-identical to the pre-A6 baseline. | NFR-2, AC-1.4 |
| F-06 | Medium | Local | AC-1.5's "named once in the run report" has no decidable observable. Which surface carries it — a report field, or an `emit()` notice like the existing script-gate fallback at `orchestrate-dev.js:10255-10259`? — and "once" per what (per run, per wave)? Note the two triggers differ: BL-04-absent already has that shipped notice, BL-03-absent (legacy worktree path, no ownership manifest) has no equivalent today. Name the observable and its cardinality so a test can assert presence **and** count rather than "mentioned somewhere". | AC-1.5, BL-03, BL-04 |
| F-07 | Medium | Local | AC-4.4's re-gate needs a runtime oracle, not just an outcome. "A green re-gate lets the wave proceed" is satisfied identically by a run in which the gate command genuinely re-ran green and by one in which A6's verdict was allowed to stand in for it — the exact failure AC-4.1 exists to forbid. AC-4.5 requires a positive pairing but leaves the mechanism open; state that the proof is a call-count observation on the configured test-command transport (≥2 invocations of `implementation.testCommand` for the same wave, second one green), so AC-4.1 is falsifiable rather than merely asserted. | AC-4.4, AC-4.1, AC-4.5 |
| F-08 | Low | Local | AC-5.1 routes the restoration mechanism to "(O-4)", but O-4 is the owned-path membership comparison; O-1 is the restoration obligation. Fix the cross-reference so the downstream routing lands on the right obligation. | AC-5.1, O-1, O-4 |
| F-09 | Low | Local | AC-2.3's evidence requirement should acknowledge what the gate surface actually yields: the halt path captures only a truncated tail (`outputTail(...)`, `orchestrate-dev.js:10327`). An oracle for "cites the gate command's own output" must be satisfiable from a tail, or the REQ must require the full captured output be made available to A6. As written, a strict reading is unsatisfiable on long suites. | AC-2.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under F-01: is A6 intended to operate at all in a repo whose implementation waves own self-modification-guard paths (this repo)? If yes, the inheritance in C-1 needs an explicit carve-out and a justification; if no, US-01's incident is out of reach and §1 should say so. |
| Q-02 | AC-1.3 excludes the V-wave because it has no ownership-manifest row. Is a red V-wave (PROPERTIES tests) therefore always a halt even when the failure is a `plan-ordering-defect` in an earlier wave's output? A test asserting "no dispatch at V-wave" is easy; I want to be sure that is the intended product outcome and not an accident of D-AWG-02. |
| Q-03 | Does a coerced-to-`unclassified` verdict (F-02) consume an attempt against `advisory.attemptBudget`, the way a malformed one does under `REQ-pdlc-advisory-tier` AC-2.3? |

## Positive Observations

- Every `M-WG-*` fact I spot-checked against HEAD holds, and the baseline-file convention keeps the
  REQ at requirements altitude without forcing a reviewer to trust prose: the gate ladder, the
  commit-after-green discipline, the missing `I` force token, and the catalogue-driven report rows
  are all as described. That is the difference between a REQ I can review and one I can only read.
- AC-4.5 is exactly the right shape: it forbids a bare negative assertion for each prohibition and
  names the positive conjunct (refusal reason recorded, escalation entry written, pre-A6 behaviour
  taken). If AC-4.4 gets the same treatment (F-07), REQ-AWG-04 is fully falsifiable.
- AC-5.1 is a model reversibility criterion — "identical to the pre-A6 tree **with the wave agents'
  own uncommitted work intact**" carries its own positive conjunct, so a revert that also destroys
  the wave's work cannot pass.
- AC-2.2's ordered, first-match-wins classification with an explicit set-equality assertion is the
  right vocabulary contract; only the receiving-side fallback (F-02) is missing.
- The self-imposed stopping rule and the deferral table (D-AWG-01..05) make the boundary between
  "this round's business" and "TSPEC's business" legible, which is why the findings above are
  confined to ones that no amount of TSPEC detail can settle.

## Recommendation

**Needs revision**

Three High findings. None of them is an oracle-placement or seam-design defect of the kind the REQ's
own DC-09 stopping rule says to defer: F-01 is a scope question (whether the motivating incident is
in reach at all), F-02 is a vocabulary-totality gap the REQ explicitly claims to own in C-3, and
F-04 is a factual error in a §9 prerequisite row that gates FSPEC authoring. Each is closable with a
sentence or two, and the Medium findings are all "name the observable" edits.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 4, "low": 2}
