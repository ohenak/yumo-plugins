# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2
**Previous round:** `docs/pdlc-stats/CROSS-REVIEW-test-engineer-REQ-v1.md` (Needs revision; 5 High, 5 Medium, 2 Low)
**Diff reviewed:** `8001131f7..HEAD` on `docs/pdlc-stats/REQ-pdlc-stats.md` (commits `504784e1b`, `fa44e9733`, `90c2f4009`, `2ba820056`, `3138e6da0`, `5d8b8069d`, `5a116eba8`)

## Prior-round disposition

| v1 finding | Severity | Status |
|---|---|---|
| F-01 round-count oracle names the driver's forward budget window | High | **Resolved in part** — see F-01 below |
| F-02 headline `0` for harvested features | High | **Resolved in part** — see F-01 below |
| F-03 `RESOLVED:` oracle contradicts `parseResolvedMarker` | High | **Resolved** |
| F-04 REQ-STATS-08 absence-only AC | High | **Resolved** |
| F-05 `docs/completed/` inside REQ-STATS-07's discovery set | High | **Resolved** |
| F-06 malformed classification swallows ordinary spec files | Medium | **Resolved** |
| F-07 driver's refusal outcome uncovered | Medium | **Resolved** |
| F-08 `--json` key set unpinned | Medium | **Resolved** |
| F-09 dispatch count untraced | Medium | **Resolved** (NG-8) |
| F-10 REQ-STATS-04 mixes count and last index | Medium | **Resolved** |
| F-11 ratio precision / not-available token | Medium | **Resolved** (routed to O-1) |
| F-12 C-2 cites its own dispatch authority | Low | **Resolved** |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **REQ-STATS-03 still has no stated value for a document type with no cross-review file, and its harvested escape hatch does not fire on the partially harvested feature already in this repo.** The rewritten AC fixes the counted quantity ("the highest round index present on disk for that document type, taken across all roles") — v1's F-01 is genuinely closed for a doc type with files. But the empty set has no stated answer, and the two candidate answers disagree. (i) Via C-5 ("never diverge from the driver"), `deriveRoundWindow` returns `startIndex = 1` when nothing is present (`pdlc/workflows/orchestrate-dev.js:10236`), and `startIndex - 1` is documented as "the number of rounds already on disk" (`:10262-10264`) — so C-5 implies `0`. (ii) The harvested state overrides `0`, but only "where `LEARNINGS-{feature}.md` is present **and no cross-review file is on disk**" — a whole-feature predicate. `docs/completed/pdlc-headless-engine/` holds exactly one surviving cross-review, `CROSS-REVIEW-software-engineer-TSPEC-v13.md`, next to `LEARNINGS-pdlc-headless-engine.md`. The predicate is false there, so TSPEC reports `13` and REQ, FSPEC, PLAN, PROPERTIES and DECISIONS fall back to reading (i) and print a measured `0` — reinstating precisely the false zero v1's F-02 targeted, on a directory that exists today. A test author writing the fixture for that feature has three defensible expectations (`0`, `harvested`, row omitted) and must ask. Fix: state the empty-set value explicitly in REQ-STATS-03, and make the harvested predicate **per document type** (`LEARNINGS-{feature}.md` present *and no cross-review file for that document type*), so partial harvests report per-row rather than all-or-nothing. Both are one clause each. | REQ-STATS-03, C-5 |
| F-02 | Medium | Local | **The harvested state is defined on cross-review absence but applied to metrics whose own evidence survives, discarding measurable numbers.** REQ-STATS-06 says "where REQ-STATS-03's harvested state holds, the ratio is reported harvested, not measured — its numerator was deleted". The numerator (C-4) is cross-reviews **plus** post-mortems **plus** DoD reviews. `docs/completed/pdlc-engine-distribution/` satisfies the harvested predicate (0 cross-reviews, LEARNINGS present) while holding 4 `POSTMORTEM-*` files; `docs/completed/pdlc-loop-economics/` satisfies it while holding `CODE_REVIEW-pdlc-loop-economics-v1.md` and `-v2.md`. Both would print `harvested` for a ratio whose numerator is partly intact. Same shape in REQ-STATS-04: "REQ-STATS-03's harvested state is reported here too, rather than `0`" reads narrowly (harvested substitutes only for the `0`), which would give `pdlc-loop-economics` a measured `2` — but the sentence never says the substitution is conditional on the measured value *being* `0`, so the wider reading (`harvested` despite two files on disk) is also available. Pin the substitution rule: harvested displaces a metric only when that metric's own evidence is absent. | REQ-STATS-04, REQ-STATS-06 |
| F-03 | Low | Local | **"Reported separately as malformed" is now correctly scoped, but the driver's own classification is three-valued, not two.** REQ-STATS-03 partitions basenames into counted / malformed / neither. `parseReviewFilename` partitions into `ok:true`, `{ok:false, reason:"not_cross_review"}` (`orchestrate-dev.js:10135-10137`) and four grammar rejections `bad_role` / `bad_doc_type` / `bad_round` / `trailing_junk` (`:10143-10163`), and `deriveRoundWindow` puts **all** rejects into one `skipped` array (`:10205-10208`). The REQ's three-way split is the right operator-facing behaviour and does not contradict the driver's reason codes, but C-5's phrase "never diverge from the classification the pipeline's own driver derives" is literally read against `skipped`, which does include `not_cross_review`. One half-sentence in C-5 — that fidelity binds the reason code, not the driver's coarser `skipped` membership — removes the only place these two texts can be read as fighting. | C-5, REQ-STATS-03 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For `docs/completed/pdlc-headless-engine/` — one surviving TSPEC cross-review at v13, LEARNINGS present, five other document types with nothing on disk — what does REQ-STATS-03 print for FSPEC? (F-01) |
| Q-02 | Does `harvested` displace a metric whose own evidence survives — `docs/completed/pdlc-loop-economics/`'s DoD value with two `CODE_REVIEW-*` files present, `docs/completed/pdlc-engine-distribution/`'s ratio with four post-mortems present? (F-02) |

## Positive Observations

- **REQ-STATS-03 now names the counted quantity in one unambiguous sentence.** "The highest round index present on disk for that document type, taken across all roles… reports `5`" is assertable without opening the driver, and it agrees with `deriveRoundWindow`'s `startIndex - 1` (`orchestrate-dev.js:10236, 10262-10264`). The worked two-role example is exactly the ambiguity v1's Q-01 could not resolve, answered inline.
- **C-5's widening is the strongest edit in the round.** Pulling the `CODE_REVIEW-*-v{N}` grammar and the `RESOLVED:` marker under one fidelity constraint, and then explicitly forbidding the ACs from restating any rule, deletes v1's F-03 at the root rather than patching its two symptoms. The three properties it names as binding are all real: `parseResolvedMarker` lowercases before comparing (`orchestrate-dev.js:7612`), rejects a second marker as `duplicated` (`:7610`), and reads via fence-aware `scanLines` (`:7105`, `:7407`).
- **REQ-STATS-08 is now falsifiable.** Conjunct (a) — exits zero having emitted the metric set, or exits non-zero having emitted the not-found report — plus the closing "conjunct (b) never suffices alone: a binary that prints nothing, or crashes, fails this criterion" makes the stubbed-no-op false green impossible to write.
- **REQ-STATS-07 fixes an enumeration and demands set-equality over it.** The eight-directory exclusion set checks out against the tree: `docs/` holds exactly those eight non-feature directories plus thirteen feature directories, and the loose file `docs/PLAN-pdlc-integration-boundary-gates.md` at the root is a live justification for the directories-only rule. `docs/completed/` as container-not-feature is what stops `docs/completed/REQ-completed.md` from presenting a phantom feature.
- **NG-8 closes v1's traceability hole with a reason, not a silence.** Both citations verify: `DESIGN-pdlc-minimal-loop-2026-08-30.md:106` ("rounds, dispatches, payload bytes, halts") and `:131` ("dispatch count"). "A dispatch leaves no on-disk artifact C-1's read-only stance can count" is the honest mechanism, and O-4 folds it into the no-bound-successor list.
- **C-2's citation is now openable.** `pdlc/OPERATIONS.md:146` does name `docs/completed/*/LEARNINGS-*.md`, and `docs/completed/REQ-completed.md` exists as the archive marker — and the REQ now labels the preference order as its own decision rather than an inherited convention.

## Recommendation

**Needs revision**

One open High. Nine of the twelve v1 findings are fully resolved and the document is materially more testable than v1 — the round-count quantity, the `RESOLVED:` deferral, REQ-STATS-08's positive conjunct, the discovery exclusion set and the `--json` key set are all now assertable without a clarifying question.

What blocks approval is the residue of v1's F-01/F-02 pair: REQ-STATS-03 states the value for a document type that *has* cross-review files but not for one that has none, and its harvested predicate is whole-feature while harvest in this repo is demonstrably partial (`docs/completed/pdlc-headless-engine/`). Under either available reading, a real archived feature prints a measured `0` for five document types whose evidence was deleted — the exact corruption the round set out to remove.

To reach Approved: (1) state REQ-STATS-03's value for a document type with no cross-review file on disk; (2) make the harvested predicate per document type rather than per feature. F-02 and F-03 are recorded, not gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
