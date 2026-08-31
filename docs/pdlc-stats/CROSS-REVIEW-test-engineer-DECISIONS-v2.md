# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`. Diffed
`07bf532e9..HEAD` on the document: six commits, all revision-driven. I verified each v1 finding is
resolved, then scanned only the changed sections for new issues. Unchanged sections already
approved in v1 were not re-litigated. Every claim below was re-measured against the tree at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **`pdlc/engine/__tests__/loop-distribution.test.js` is a mandatory sixth co-change site that the document names nowhere, and the new Residuals table's third row asserts the opposite of HEAD: the sibling-document half *does* have an oracle (`loop-distribution.test.js:182`), and it is pinned to `5` in three places plus a word-map that demands `6`, not `six`.** | Residuals — obligations with no oracle at HEAD, row 3; K-1; K-7; DEC-STATS-01 site table |
| F-02 | Medium | Local | **The re-evaluation trigger's "six hand-written lists" enumeration is short by four.** `loop-distribution.test.js`'s `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE` and `NEW_LIB_MEMBERS_*` are transcribed member lists too, so the trigger understates what deriving-from-a-listing would have to change. | DEC-STATS-01, *Re-evaluation triggers*, first bullet |
| F-03 | Low | Local | **K-3 describes the P9-02 declared conjunct as "set-equal … in both directions"; the shipped assertion is `toEqual` on an array, which is order-sensitive.** A correct-set/wrong-position edit is red. | Consequences, K-3, *Declared* |

Scope legend: `Local` — this artifact only. `Cross-Feature` — a testing constraint that outlives this
feature. `Process` — a skill/checklist gap.

## Disposition of v1 findings

| v1 | Severity | Status | Evidence at HEAD |
|----|----------|--------|------------------|
| F-01 | High | **Resolved** | K-3's Falsified-by now names two conjuncts that exist as real, extensible test shapes. Both are HEAD facts, not aspirations: `coverageInstrumentation.test.js`'s P9-02 test asserts `pkg.c8.include` `toEqual` a transcribed literal (`...REQUIRED_INCLUDES, CAPTURE_SCRIPT_INCLUDE`, plus the two `lib/` modules), and the second P9-02 test spawns a real c8 run whose driver `import()`s `lib/loop-session.mjs` and `lib/escalation-view.mjs` so an `allow-external` bare-basename entry that resolves to nothing is caught by the `json-summary` rather than by a string comparison. Adding `stats.mjs` to both is exactly the co-change K-3 now obliges, and the omission is red in both directions. **My v1 F-01 was partly mis-measured** — I read `REQUIRED_INCLUDES`' containment check and missed the set-equality test below it. The obligation the revision landed is right regardless, and it is now anchored to the assertions that carry it |
| F-02 | Medium | **Resolved** | The Option D paragraph now states the measured position: `document-oracles.mjs` is in none of the four vendoring enumerations **and in no coverage include set** — true, `c8.include` is the seven `**/`-anchored entries and it is not among them. The corroborating citation resolves: `docs/completed/pdlc-engineering-loop/PLAN-…md:64` does say the include list is four-entry and `lib/document-oracles.mjs` is **not** in it. The added two-axes paragraph (reachability decides vendoring; include membership is an independent edit) is the distinction I asked for, and it now sharpens the rejection rather than supplying a false precedent |
| F-03 | Medium | **Resolved** | DEC-STATS-03's trigger now carries a named detector — a purity conjunct calling each classifier twice in a fresh module instance, asserting deep-equal and non-aliased results — and states plainly why the identity oracle and the recording double are both blind to the trigger's arrival. Routed to TSPEC §6.4 as an erratum rather than restated as a rule (correct under K-6), with the interim gap listed as an explicit residual |
| F-04 | Medium | **Resolved** | K-4's disposition is no longer "review-blocking finding". It is a construction-site count conjunct: read `bin/cli.mjs`'s source, assert the four-classifier object literal occurs **exactly once**, inside `statsParsers` — occurrences counted, not "at least one". The precedent cited is real and is exactly this shape: `pdlc/engine/__tests__/bin-guard-structure.test.js` pins `bin/pdlc.mjs` at zero static import declarations (`:278`), exactly three non-comment top-level statements (`:284`) and zero `await` tokens (`:290`) |
| F-05 | Low | **Resolved as written, but see F-01** | K-1 now says four of five and hands the fifth (`c8.include`) to K-3, stating the two rows partition the set. The partition is stated correctly over the sites the document enumerates; F-01 is that the enumeration itself is one site short |
| F-06 | Low | **Resolved** | The threshold now reads "a **fourth** runtime-reachable member added after `stats.mjs`" and names the detector. Both halves check out: `prepack.mjs:20-25`'s `MODULE_NAMES` has exactly four entries, of which exactly two are `lib/` members (`lib/loop-session.mjs`, `lib/escalation-view.mjs`), so `stats.mjs` is the third and `MODULE_NAMES.length` exceeding five is the right trip-wire |

Q-01 and Q-02 from v1 were both answered in the revision (K-5's `SCHEMA_VERSION` scope stands as
TSPEC §6.3's; the `docs/completed/` literals are declared as *measurements of the archive*, and that
convention is now cited in the third residual's mitigation rather than left implicit).

## Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
