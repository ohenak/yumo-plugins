# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 5

**Scope:** frozen delta re-review of `27d3129f..HEAD` — four commits, all of them answering v4
findings. Nothing outside the inserted blocks was re-litigated; §T.5's citation fix and the v0.5
front-matter bump are included because they are part of the delta, not because they were reopened.

## Delta inventory

| Commit | Section | What landed |
|---|---|---|
| `643f4ea2` | §A.2 property 1 (`:186-234`) | Restructures "two consequences" into four (a)–(d). Adds the composition-site expected-set table (PM F-01: `"LEARNINGS"` is a second non-member), the once-per-episode probe placement (my Q-01), and the five-site seam-plumbing table (my F-01) |
| `8aee8c22` | §T.3 (`:832-847`) | Gives both `.baseline-worktree` obligations named oracles with shapes (my F-02) |
| `9cbcaa1e` | §T.5 (`:919-925`) | Corrects the `advisoryDisabled.test.js` mis-citation (my F-04) |
| `16f30820` | front matter | v0.4 → v0.5, cross-review lineage completed through v4 |

My F-03 was also taken silently inside `643f4ea2`: `:175` now reads "written only for dispatches the
injector was actually called for" instead of "*accepted*", which removes the collision with §D's
per-source `rejected[]`. All four v4 findings are resolved.

## Verification of the delta's claims

The delta's load-bearing content is a set of factual assertions about `orchestrate-dev.js` at HEAD.
Each was re-measured against the source, not read off the document's prose.

| Claim in the delta | Measured at HEAD | Holds |
|---|---|---|
| Phase H passes `docType: "LEARNINGS"`, `dispatchKind: "harvest"` through `wrappedDispatch` | `orchestrate-dev.js:14726-14732`, verbatim | ✅ |
| …and that dispatch is reachable, not dead code | `PHASE_H_ENABLED = true` at `:24`; the skip arm at `:14712` is not taken | ✅ |
| `wrappedDispatch` spreads `wrapperSeams` straight into `dispatchAndVerify` | `:12398-12406`, `...wrapperSeams` | ✅ |
| Phase CR forwards an explicit `null` because `roundDocType` distinguishes `null` from `undefined` | `:14556` passes `docType: null`; `:7306` is `docType === undefined ? docTypeFromPath(doc) : docType` | ✅ |
| Hop 1 — `mainDev` destructures params, `_recordQueueRow` is the defaulted-recorder precedent | `:12013` `_recordQueueRow: recordQueueRowFn = defaultRecordQueueRow` | ✅ |
| Hop 2 — `wrapperSeams` is an enumerated literal, not a spread | `:12381-12393`, twelve hand-listed keys, no rest | ✅ |
| Hop 3 — `reviewLoop` receives `...wrapperSeams` but destructures a fixed list | `:14565` spreads in; `:7266-7300` destructures a fixed list with no rest element | ✅ |
| Hop 4 — `wrapped` re-lists **seven** seams by hand | `:7342-7358`: `_agent`, `_readFile`, `_listFiles`, `_probeDoc`, `_probeReviewState`, `_log`, `_git` | ✅ |
| Hop 5 — `dispatchAndVerify` is a fixed seven-seam destructure | `:8862-8878`, same seven | ✅ |
| "Phase CR's `null` reaches the composition site through this path and no other" | `dispatchAndVerify` has exactly three call sites: its own definition `:8862`, `wrapped` `:7343`, `wrappedDispatch` `:12398`; `reviewLoop` reaches it only via `wrapped` | ✅ |
| `advisoryDisabled.test.js` imports the default export as `mainDev` | `import mainDev, * as dev from "../orchestrate-dev.js"`, verbatim in the file's import block | ✅ |
| `git check-ignore .baseline-worktree` exits non-zero at HEAD, so the inverted assertion is red-before-green | re-measured: exit 1, no output | ✅ |

**The `∪ {null, "LEARNINGS"}` claim is exhaustive, which is the part worth checking rather than
trusting.** An expected set asserted with set equality is only correct if *no third* non-member
reaches the composition site, so I enumerated the operand space rather than spot-checking it. The
three `dispatchAndVerify` call sites reduce to: `converge`'s creator and its `reviewLoop`, whose
`docType` comes from the six literal `converge({docType: …})` call sites (`:13766` REQ, `:13774`
FSPEC, `:13807` TSPEC, `:13874` DECISIONS, `:13893` PLAN, `:13996` PROPERTIES); the erratum and
cascade dispatches, whose `target`/`downstream` range over `ERRATUM_DOC_TYPES` (`:6845-6852`),
which is exactly those same six; Phase CR's `null`; and Phase H's `"LEARNINGS"`. There is no
seventh value. The delta's expected set is complete, and `erratumDocTypesBelow` (`:6877`) cannot
widen it because it only slices that frozen array.

No claim in the delta contradicts the repository at HEAD.
