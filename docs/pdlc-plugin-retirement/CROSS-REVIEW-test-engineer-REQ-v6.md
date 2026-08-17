# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 6
**Scope:** Delta confirmation of the single operator-authorized round prescribed by
`POSTMORTEM-R-pdlc-plugin-retirement.md` §Recommendation (`RESOLVED: yes`). The diff under review is
`f89736fb..fb6e58cf` (REQ v0.8 → v0.9, plus the baseline corrections in `f82b8e29`). Sections the v5
review approved are not re-litigated; this round confirms that the routed items landed and that the
edit introduced no new testability defect.

Every claim below was re-measured at HEAD `fb6e58cf` with the commands the baseline pins; nothing is
taken from the document's own account of itself.

## Round-5 disposition

| Round-5 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | **High** | **Resolved** | The two survivor terms are gone from AC-1.2 (`REQ:296-298` now names `build-runtime.mjs` and `pdlc/workflows/dist/` as explicit **non**-members with the reason: M-7 is reduced, AC-1.1 requires M-9 to survive). Re-ran the seven-term search myself — `grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled' $(git ls-files)` → **132** paths. All twelve paths round-5 measured as owned-by-nothing are absent from that result: `pdlc/workflows/runtime-adapter.js`, `pdlc/workflows/package.json`, `__tests__/{planOwnership,pipelineWiring,coverageInstrumentation,reportTemplates}.test.js`, `__tests__/helpers/{adapterHarness,freshClone}.js`, `pdlc/engine/__tests__/bin-guard-structure.test.js`, the two live feature REQs and `docs/_constraints/pdlc-rcv-baseline.md`. The narrow-reading collision is also gone: no term now matches the string `pdlc/workflows/dist/pdlc-cli.mjs`, so M-9's *path* no longer reds the criterion AC-1.1 requires it to survive. (Its *contents* are a separate, smaller matter — F-01 below.) |
| F-02 | Medium | **Resolved** | The recipe/term-set delta is now reconciled and enumerated with owners, at `docs/_constraints/pdlc-retirement-baseline.md:174-205`, and AC-1.2 (`REQ:302-303`) points at it as a documented **superset**. Re-measured at HEAD: recipe grep (`baseline:157-158`, eight alternatives) → **136**; AC-1.2 term set (`baseline:182-183`, seven alternatives) → **132**; `comm -13` between them → exactly the four claimed paths, no more and no fewer: `.claude/pdlc.config.example.json` (M-11h), `pdlc/workflows/__tests__/waveExecution.test.js` (M-11h, survives), `pdlc/workflows/__tests__/consolidationPreflight.test.js` (M-11h, edited), `pdlc/workflows/dist/consolidate-learnings.bundle.js` (M-10). The `covered-violations/` ambiguity round-5 flagged is also gone: the tree measures **4** hits under *both* commands now (it was 4/6 while `pdlc/workflows/dist/` was a term), matching AC-1.2's parenthetical; `consumer-ac12/` measures **6** under both. |
| F-03 | Medium | **Resolved** | AC-1.2 (`REQ:289-295`) now states the set as a set-equality — "**is exactly**… Adding a term fails this criterion and removing one fails it too" — and requires the FSPEC to transcribe, at C-6 re-measurement time, both the literal term list **and** the literal expected-empty command, the same treatment AC-1.3's literal count already gets. The narrowing game is closed: an implementer can no longer argue a term away to green a red search, because dropping a term is itself a failure. |
| F-04 | Low | **Resolved** | `helpers/driftGenerators.js` is now single-owned. `baseline:114` puts M-8 at **24** (18 `*.test.js` + 6 helpers) and `baseline:117` puts M-11p at **7** with `driftGenerators.js` its own; I re-derived the whole partition below and found no path in two classes. |

Independent re-derivations of the v0.9 material:

**The partition closes at HEAD, 136/136/0/0.** I classified the recipe sweep's whole output myself
rather than reading the baseline's totals. A-1's globs cover **64** paths (39 `docs/completed/**`,
3 `docs/discarded/**`, 1 decision doc, the baseline, `QUEUE.md`, 12 feature-directory files, 2
`docs/design/**`, `docs/PLAN-pdlc-integration-boundary-gates.md`,
`docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md`, 2 fixture `CODE_REVIEW-*.md`, 1
`planParse/**` excerpt). The remaining **72** partition exactly as claimed: M-rows 9 (one file
each), M-8 **24** (18 test modules + `helpers/drift{Fixtures,Harness,Probe}.js` +
`helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh`), M-11a–n **30** (including
M-11e's 6 + 4 fixture files), M-11o **2**, M-11p **7**. Remainder 0, no path in two classes.

**The pinned expectation is now the right one.** §1.2 (`REQ:105-109`) records both runs
(`0e86f11a` 133/133, `b73fb4de` 136/136) and states that the **empty remainder**, never the total,
is what is pinned, "A-1's feature-directory glob grows by one file per cross-review". That is the
answer to round-5's Q-01 and it is the only stable reading — this very file makes the total 137.

**The three-banner correction is real, not editorial.** All three surviving workflow modules carry
the identical two-line banner at `:5`–`:6` (`orchestrate-dev.js`, `consolidate-learnings.js`,
`orchestrate-queue.js`), so M-11o owning two and M-11i owning the third (`REQ:225`, `REQ:481`,
`REQ:559`) covers the set with one owner per path.

**R-5's importer count re-derives to eight.** `REQ:527` now says eight surviving modules import the
`seeded`/`resolveSeed`/`shrink` primitives. Measured: thirteen files import
`./helpers/driftGenerators.js`, six of them inside M-8's deleted set; the seven survivors are
`approvalHash`, `roundDerivation`, `forcePhases`, `pacingWrapper`, `completeness`, `scanLines` and
`helpers/mergeDoubles.js`, plus `consolidationPreflight.test.js:172-175`, which reaches the module
through a dynamic `await import()` and asserts its exports. Eight is right, and the eighth is the
one a static-import grep would miss — the "fresh consumer scan" wording earns its place.

**C-7's green start still reproduces.** `env -u NODE_TEST_CONTEXT npm test` in `pdlc/engine` at HEAD:
`# tests 842`, `# pass 840`, `# fail 0`, `# skipped 2`, exit 0 — the numbers BL-08 and C-7 cite.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The one artifact AC-1.1 requires to survive still carries two AC-1.2 terms in its bytes, and nothing in the inventory says what clears them.** Round-5's High was about M-9's *path*; this is its *contents*, and the fix did not reach it. `pdlc/workflows/dist/pdlc-cli.mjs:16-17` reads `Built artifact: pdlc/workflows/dist/orchestrate-dev.bundle.js` / `Consumer runtime copy: installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh` — two hits, one on `\.bundle\.js` and one on `sync-workflows`, both members of the term set. M-9 is in the swept 132 with disposition "survives" (`baseline:46`), it is not A-1-allow-listed, and no M-row or M-11 row names an edit that clears those lines. The clearance is real but *derived*: the banner is inlined from `orchestrate-dev.js:5-6`, which M-11o rewrites, so a rebuild through the reduced build step (G-5 keeps M-9 generated) carries the rewrite through. A relocation that moves the existing bytes — which is what AC-1.1's "M-9 relocated to a single named surviving path" most plainly describes — leaves the criterion red on a file the REQ keeps, and the reader hits it mid-sweep, which is exactly what C-6's execute-then-trust discipline exists to prevent. Fix is one clause: record on M-9's row (or as a note under M-11o) that M-9 must be **regenerated after** the banner rewrite, because its inlined copy of the M-11o banner is the only AC-1.2 term-carrying content in a surviving, non-allow-listed path. | AC-1.2, AC-1.1, G-5, `baseline` M-9/M-11o rows |
| F-02 | Medium | Local | **M-7's reduction has a dependent no search term reaches, and the REQ's own doctrine says such a dependent needs an inventory row.** §1.2 states the sweep is a lower bound and names M-11c and `.worktreeinclude` as "the two measured instances" of dependents no term reaches (`REQ:110-115`, `REQ:483-486`). There is a third. `pdlc/workflows/__tests__/pipelineWiring.test.js:543-548` reads `build-runtime.mjs` as source text and **throws** `DEV_META anchor not found in build-runtime.mjs` if the literal `const DEV_META = \`` is absent; `DEV_META` (`build-runtime.mjs:346`, consumed at `:710`) exists only to stamp the retired `orchestrate-dev.bundle.js`, so M-7's "reduced — keeps M-9 only" deletes it. That file survives the sweep: it is not in the 136 (it names no retired artifact), not in M-8's deleted set, and not in any M-11 row — I grepped both REQ and baseline for `pipelineWiring` and got nothing. Today the only thing that catches it is AC-1.3's suite-green conjunct, i.e. a red discovered mid-sweep with no task sized for it, which is the failure mode C-6's "not for the first time mid-sweep" clause names. Same shape for anything else reading the builder's retired-bundle internals; a fresh `grep -rln 'DEV_META\|QUEUE_META\|CONS_META\|DEV_SOURCES' $(git ls-files)` at C-6 time would enumerate the class. Fix: an inventory row for the build-step-internals readers, alongside M-11c and `.worktreeinclude`, so the PLAN sizes the re-home. | §1.2, C-6, R-2, M-7, AC-1.3 |
| F-03 | Low | Local | **The set-equality is stated over artifact names but pinned as a regex whose members are not all names, so two faithful transcriptions differ.** AC-1.2 (`REQ:289-292`) enumerates nine things — three scripts, three bundles, `distribution-manifest`, the drift-state record, `distribution.checkEnabled` — while the command the FSPEC is told to transcribe literally (`baseline:182-183`) has seven alternatives, because the three bundles collapse into the suffix pattern `\.bundle\.js`, which is a shape, not a name. A transcriber reading the prose can produce a nine-literal command that is strictly narrower (it would not catch a fourth bundle name), and both readings claim to be "the term set", which is precisely the argument surface the set-equality was added to remove. One sentence fixes it: the pinned command at `baseline:182-183` **is** the term set, and the prose enumerates it. | AC-1.2, `baseline` §recipe-vs-term-set |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round-5's Q-02 is now F-02 with a named instance, so it is answered structurally, but the reverse direction is still open: after the reduced build step lands, is there an acceptance criterion asserting what `build-runtime.mjs` **emits** — that a fresh run produces `{M-9}` and nothing else? AC-1.1 asserts the *tree's* `dist/` entry set, which is equivalent only if the build is actually run in the same state. AC-1.3's suite green would catch it if a surviving module rebuilds and compares, but the two modules that do that today (`runtimeBundle.test.js`, `runtimeProvenanceWiring.test.js`) are both deleted by M-8/M-11p. Worth one sentence in the TSPEC's O-3 resolution naming which surviving test re-runs the reduced build. |

## Positive Observations

- **The High closed by removal, not by argument, and the measurement proves it.** Dropping the two
  survivor terms is the cheapest correct fix available, and the twelve paths that had no owner are
  now simply not in the search's output — I did not have to accept a narrow reading of anything to
  get there. The replacement paragraph then says *why* each excluded name is excluded (M-7 reduced,
  AC-1.1 keeps M-9, M-11h retires a value not a mechanism), so the next reader cannot re-add them by
  accident.
- **The superset clause is the right shape for a two-command reality.** Rather than forcing one
  command to serve both the inventory control (which wants the widest reach it can get) and the
  required-empty gate (which cannot carry a term that reds on surviving code), `baseline:174-205`
  keeps both, states which is which, measures the delta, and gives every delta path an owner. I
  reproduced all three numbers at HEAD and the delta membership is exact.
- **The pinned expectation moved from a number to a closure property.** "The empty remainder, never
  the total" is the one statement about this partition that stays true as the feature's own document
  set grows, and it was arrived at through the review loop rather than asserted up front.
- **The set-equality is genuinely two-sided.** "Adding a term fails this criterion and removing one
  fails it too" is what makes the oracle falsifiable rather than negotiable; combined with the FSPEC
  transcription of the literal command, a person re-running this in six months reproduces the result
  instead of re-deriving the argument.

## Recommendation

**Approved with minor changes**

The routed High is resolved by measurement, not by prose: the seven-term search runs clean of all
twelve previously-unowned paths, the recipe/term-set delta is exactly the four enumerated owned
paths, the set-equality is stated two-sidedly with a literal FSPEC transcription, the
`driftGenerators.js` two-class cell is gone, and the partition closes 136/136/0/0 at HEAD with the
engine suite green at 842/840/0/2. The two Mediums left are both one-clause inventory additions and
neither blocks the phase: M-9's inlined banner is the last swept-and-surviving path whose AC-1.2
clearance is derived rather than stated, and `pipelineWiring.test.js` is a third dependent that no
search term reaches, which the REQ's own lower-bound doctrine says deserves a row. Both are better
addressed in the FSPEC/TSPEC pass than by reopening Phase R.

FINDING: Medium | delta | local | AC-1.2 / baseline M-9 row | surviving M-9 (`dist/pdlc-cli.mjs:16-17`) carries two AC-1.2 terms in its inlined M-11o banner; clearance depends on regeneration after the banner rewrite and is never stated
FINDING: Medium | inherited | nonlocal | §1.2 / C-6 / M-7 | `pipelineWiring.test.js:543-548` breaks on M-7's reduction (reads `DEV_META`), reached by no search term and carried by no inventory row
FINDING: Low | delta | local | AC-1.2 term set | prose enumerates nine artifact names while the pinned command has seven alternatives (`\.bundle\.js` is a shape, not a name), so two faithful transcriptions differ

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
