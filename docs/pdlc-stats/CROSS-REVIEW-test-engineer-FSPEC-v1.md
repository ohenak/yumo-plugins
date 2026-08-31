# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.2), approved *Approved with minor changes* at
`CROSS-REVIEW-test-engineer-REQ-v3.md` (0 High, 1 Medium, 3 Low)

## Claims verified against the repository

Every repository claim the FSPEC makes was checked against HEAD rather than taken from the document.

| FSPEC claim | Verdict | Evidence |
|---|---|---|
| `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker` all live in `pdlc/workflows/orchestrate-dev.js` (§1 fidelity anchor) | **Holds** | `:10134`, `:10192`, `:12384`, `:7601` |
| BR-10: the driver's DoD derivation returns highest-plus-one, so reporting it unchanged is off by one | **Holds** | `deriveDodRoundIndex` ends `return max + 1` with `max = 0` when nothing matches (`:12384-12396`) |
| BR-05: the un-suffixed basename denotes round 1, identically to `-v1` | **Holds** | `round: n === undefined ? 1 : Number(n)` (`:10145-10151`); runtime: `parseReviewFilename("CROSS-REVIEW-test-engineer-REQ-v3.md")` → `{ok:true,…,round:3}` |
| BR-07/EC-06: two round-1 spellings for one role and doc type refuse a round | **Holds** | `deriveRoundWindow` step 5 returns `{ok:false, reason:"malformed_round_one_duplicate", role}` (`:10225-10230`) |
| BR-12/EC-14: absent, duplicated or unparseable `RESOLVED:` classifies fail-closed | **Holds** | `parseResolvedMarker` returns `{ok:false, reason:"absent"|"duplicated"|"unparseable"}` (`:7608-7617`) |
| BR-01: `FLAGS_BY_COMMAND` / `validateFlags` are the existing closed-flag surface | **Holds** | `pdlc/engine/bin/cli.mjs:168`, `:198-199` |
| BR-29: exit `2` is reserved for a pipeline halt | **Holds** | `pdlc/engine/bin/cli.mjs:20-24` — `2  the pipeline HALTED`, `1  the engine itself refused or crashed` |
| BR-03: `docs/completed/pdlc-loop-economics/_evidence/` exists | **Holds** | directory present |
| BR-25/AT-18: `docs/PLAN-pdlc-integration-boundary-gates.md` and `docs/completed/REQ-completed.md` are loose files; the eight excluded directories are all present | **Holds** | `find docs -maxdepth 1 -type f` returns exactly the first; `docs/` carries `_constraints`, `_decisions`, `_queue`, `completed`, `design`, `discarded`, `ideas`, `requirements` — the exclusion set is set-equal at HEAD |
| AT-10: `docs/completed/pdlc-headless-engine/` has `LEARNINGS`, one surviving cross-review, none for the other five types | **Holds** | only `CROSS-REVIEW-software-engineer-TSPEC-v13.md` plus `LEARNINGS-pdlc-headless-engine.md` |
| AT-11: `docs/completed/pdlc-loop-economics/` carries `CODE_REVIEW-…-v1.md` and `-v2.md` | **Holds** | both present; expectation `2` is correct |
| AT-13: `docs/completed/pdlc-wave-resume/POSTMORTEM-PR-pdlc-wave-resume.md` exists | **Holds** | present; its marker is `RESOLVED: yes` at line 3, so the driver yields `resolved` (see F-03) |
| EC-17: `docs/pdlc-halt-hardening/` carries only a PLAN | **Holds** | single file `PLAN-pdlc-halt-hardening.md` |
| BR-09: the six-type row set is "the pipeline's cross-review doc-type catalogue" | **Partly** — the constant matches, but it is not the set of doc types the pipeline actually writes | `REVIEW_DOC_TYPES` is exactly those six (`:10105-10112`), while `reviewFileType = roundDocType \|\| "REVIEW"` (`:9245`) writes a seventh (F-01) |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **The row-set catalogue omits a document type the pipeline itself writes, so this repository's own Phase CR cross-reviews are reported to the operator as malformed and their rounds are unreportable.** BR-09 fixes the review-rounds row set to six types and calls it "the pipeline's cross-review doc-type catalogue". `REVIEW_DOC_TYPES` is indeed exactly those six (`pdlc/workflows/orchestrate-dev.js:10105-10112`) — but it is the catalogue a cross-review may be *validated against*, not the set the driver *emits*. Phase CR passes a directory, so `roundDocType` is null and the driver writes `reviewFileType = roundDocType \|\| "REVIEW"` (`:9245`) through `crossReviewPath(feature, skill, reviewFileType, round)` (`:9364`). Those files exist here: `docs/completed/pdlc-advisory-wave-gate/` carries `CROSS-REVIEW-product-manager-REVIEW-v{1,2}.md` and `CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md`. Runtime check: `parseReviewFilename("CROSS-REVIEW-test-engineer-REVIEW-v2.md")` → `{ok:false, reason:"bad_doc_type"}`, and `deriveRoundWindow([that], "REVIEW")` → `{ok:true, present:{}, skipped:[{reason:"bad_doc_type"}]}`. Under BR-06 ("begins `CROSS-REVIEW-` but fails the grammar … reported separately as malformed") that basename is malformed, so `pdlc stats pdlc-advisory-wave-gate` prints four malformed entries naming four legitimate pipeline-authored artifacts, and two rounds of implementation review appear nowhere in the metric. This is not a rendering nit: REQ R-1 exists to stop malformed reporting being wrong, and the operator's only fleet-visible signal of parse trouble becomes a permanent false alarm on an archived feature. It is also unwritable as a test — AT-09 asserts "no unrelated artifact appears in the malformed list" and AT-18 asserts over this very repository, and neither can be given an expectation without deciding this first. Fix: decide in §4.2 what a `bad_doc_type` reject is (a seventh `REVIEW` row in BR-09's catalogue is the reading that keeps C-5 intact, since the driver counts that doc type; suppressing it from the malformed list instead would be an independent parsing rule C-5 forbids), and give AT-09 a fixture that pins it. Tagged Cross-Feature: the same `bad_doc_type`-is-not-operator-malformed distinction binds any future consumer of `parseReviewFilename`. | BR-06, BR-09, §7.4 A-3, AT-09, AT-18 |
| F-02 | High | Local | **EC-10/BR-26's "unclassified entry" has no slot in the JSON fleet document, so AT-19 cannot be written in `--json` mode.** BR-23 fixes the fleet document at "exactly two top-level keys: `schemaVersion` and `features`", and `features` maps each name to either the four-metric object or `{gap: string}`. BR-26 and EC-10 then require an unexpected `docs/` directory to surface "as an unclassified entry in the report", explicitly "neither silently excluded nor silently counted as a feature". All three placements the document leaves open are forbidden by one of its own rules: a third top-level key breaks BR-23's exactly-two; an entry under `features` makes it a feature, which EC-10 forbids; a `gap` entry makes it a feature that failed, which is the different state BR-27 defines. AT-19 says only "the report still prints and names that directory" and never names a mode, so a test author has no expectation to transcribe for JSON — and the set-equality assertion AT-05 pins for single-feature mode has no fleet counterpart to catch the drift. Fix: name the JSON carrier explicitly (a third top-level key with BR-23 restated as three, or an `unclassified` array), and split AT-19 into a human-mode and a JSON-mode expectation, each with a literal key set. | BR-23, BR-26, EC-10, AT-19 |
| F-03 | High | Cross-Feature | **AT-13's oracle is an implementation echo, and it is the only acceptance test covering the feature's load-bearing constraint.** The expectation reads "tagged with the resolution the pipeline's own `RESOLVED:` rule yields for that file's bytes". That is not an expected value; it is a re-derivation through the same dependency the system under test uses, so the test passes for every implementation that calls the driver and for every implementation that reimplements the driver's bug — which is precisely the divergence C-5 and §1's fidelity anchor exist to catch. The literal is available and stable: `docs/completed/pdlc-wave-resume/POSTMORTEM-PR-pdlc-wave-resume.md` line 3 is `RESOLVED: yes`, and `parseResolvedMarker` lowercases the captured value and returns `{ok:true, resolved:true}` for `yes` (`pdlc/workflows/orchestrate-dev.js:7611-7615`), so the expectation is `phase PR, resolution resolved`. Fix: state the literal — "exactly one halt entry, `{phase: "PR", resolution: "resolved"}`" — and add the falsifying companion the current wording cannot express: a fixture whose marker is `RESOLVED: no` expecting `open`, so the test distinguishes the two classifications rather than agreeing with whatever comes back. Tagged Cross-Feature: "the oracle for a fidelity constraint must be a literal, never the dependency's own output" is the general lesson, and this feature's whole value proposition rests on it. | AT-13, BR-12, §1 fidelity anchor |

## Questions

## Positive Observations

## Recommendation

## Verdict
