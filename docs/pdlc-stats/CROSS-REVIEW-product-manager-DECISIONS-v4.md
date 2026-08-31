# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 4

Delta re-review. Diffed `06277f5d1` (the tree v3 reviewed) to HEAD `234595ce8`: the document moved
across eight commits, `d74a44eaf` → `234595ce8`, +104/−48 lines. I re-read my v3 findings first,
diffed the document, re-ran every new factual claim against the tree at HEAD, and scanned only the
changed sections for new issues. Sections untouched by this revision are not re-litigated.

## Prior findings disposition

| v3 finding | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — a seventh co-change site (`run.test.js`) missing; second consecutive round of the same miss | High | **Resolved, and resolved past what I asked** | The revision did not add the one site I named. It replaced the instrument: a mechanical sweep now derives the set, which found `run.test.js` *and* two more — `coverageInstrumentation.test.js` (already an obligation under K-3, absent from the table, which is why the table said six while the trigger said seven files) and `learningsPremises.test.js`. Cost moves six → **nine** sites; K-9 owns the two new tests; K-1 partitions nine sites over four K-rows; reversibility, the trigger count and the Consequences bullet all move together |
| F-02 — K-8's re-baselining silently narrows the importability conjunct | Medium | **Resolved** | K-8 now states conjunct (a) iterates the post-state set (`[...D1_BASELINE_LIB_MEMBERS, ...NEW_LIB_MEMBERS_BARE]` or a set derived from `prepackNs.MODULE_NAMES`), names the loss it prevents, cites conjunct (d)'s live-derivation as the shape to copy, and answers my Q-02 by naming `POST_STATE_LIB_MEMBERS` separately from the delta |
| F-03 — K-8's headline says six edits, its list enumerates seven | Medium | **Resolved** | Now *"**Seven** assertion edits in all … (3 + 2 + 1 + 1)"*, with the half-sentence I asked for: *"`D1_BASELINE` and `D5_BASELINE` look redundant and are not"* |
| F-04 — trigger threshold stated in hoists, contradicting the reversibility line | Medium | **Resolved** | Restated in *fields*: *"A second JSON-only **field** … Two such fields — not two hoist sites"*, plus an explicit disambiguation (*"the reversibility line above counts sites, this one counts fields"*) and the statement that the trigger has **not** fired today |
| F-05 — K-8 prescribes value edits but not the provenance edits they invalidate | Low | **Resolved** | K-8 gains a *"Provenance and message strings move with the values"* clause covering the constants' header comment and both stale message strings, with the reason it is a clause and not a row |

## HEAD verification of the revision's new claims

Every claim the revision added rests on the tree, so I checked each one rather than the prose.

| Claim | HEAD | Verdict |
|---|---|---|
| The sweep returns **fifteen** files | `git grep -l "escalation-view" HEAD -- pdlc/engine/__tests__/ pdlc/workflows/__tests__/` → 15 | Confirmed (with a caveat that is F-02 below) |
| Five of them transcribe a member list; the other ten import a module | Transcribers: `_tspec-packed-set.mjs`, `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`, `learningsPremises.test.js`. The remaining ten, including `loopProperties.test.js` (`:30`, `:581`, `:614`, `:621`, `:631` — all imports), transcribe nothing | Confirmed |
| `loop-cli.test.js` survives the grep but fails the predicate — its hits are `path.join(…, "lib", "loop-session.mjs")` paths and comments | Confirmed | Confirmed |
| Nine sites = five enumerations + four test files | `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json` + the four tests = 9 | Arithmetic holds |
| `run.test.js` transcribes the bare four **three** times | `run.test.js:117-122` and `:269-276` (`assert.deepEqual` over the manifest names), `:247-252` (the `scratchWorkflows` copy list) | Confirmed |
| `run.test.js` is live — no `.skip`, 27 top-level `test(` calls | 27 `^test(` calls; the only two "skip" hits (`:376`, `:525`) are prose in comments | Confirmed |
| `run.test.js` checks bytes and `existsSync`, never `import()`, for vendored members | No `await import()` of a vendored member anywhere in the file; `:267`, `:280`, `:290` are `existsSync` | Confirmed — K-8's justification for keeping the importability loop holds |
| `learningsPremises.test.js` P-1 array-equals a four-name literal parsed out of `prepack.mjs`'s source, and its title names the count | `:78` *"MODULE_NAMES is exactly the four canonical workflow modules"*, `:86` `expect(names).toEqual([…])` | Confirmed |
| `coverageInstrumentation.test.js` mirrors `c8.include`'s **seven** entries and its title names a count | `c8.include` holds 7 entries; P9-02's literal is `REQUIRED_INCLUDES` (4) + `CAPTURE_SCRIPT_INCLUDE` (1) + 2 `lib/` = 7; title at `:264` says *"exactly the six modules the feature owns"* | Confirmed — and the document is right that the title's count word is stale |
| **Options B and C do not pay `run.test.js` or `learningsPremises.test.js`** — the review's contrary claim was wrong | Both files fence `MODULE_NAMES`, which enumerates vendored *workflows* members only; B places the module in `pdlc/engine/lib/`, enumerated by `LIB_MODULES_AT_HEAD` in `_tspec-packed-set.mjs:29` and `publish-preflight.mjs:205`, which neither test reads | Confirmed — my v3 claim was wrong and the correction is right |
| B's three sites: the engine `lib/` class term, the `tspecPackedCount` amendment, and `loop-distribution.test.js`'s `15` | `_tspec-packed-set.mjs:99` `4 + 15 + 5 + 1`; `loop-distribution.test.js:161` the same literal | Confirmed |

Thirteen claims checked, thirteen hold. The one claim that did **not** hold at HEAD was mine, not the
document's, and the revision corrected it in writing rather than inheriting it.
