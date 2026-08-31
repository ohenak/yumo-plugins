# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Verification Performed

The document opens Options Considered with "Every cost below was measured against the tree at
HEAD, not estimated". I checked that promise rather than taking it. Every claim below was run
against the working tree.

**Confirmed accurate:**

| Claim | Where | Verified against |
|---|---|---|
| Four classifiers are `export function` declarations in `orchestrate-dev.js` | Context, DEC-STATS-01 | `parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex` all present as `export function` |
| `orchestrate-dev.js` is 816.5 KB at HEAD | DEC-STATS-03 rationale | 836,091 bytes = 816.5 KiB |
| `pdlc/engine/bin/cli.mjs` is 57.0 KB at HEAD | Option C rejection | 58,346 bytes = 57.0 KiB |
| Engine `lib/*.mjs` class 15 → 16, as `LIB_MODULES_AT_HEAD` 12 + `LIB_MODULES_FROM_THIS_FEATURE` 3 | Option B row | Both symbols exist with exactly 12 and 3 members; directory holds 15 files |
| Engine package has no coverage gate | Option B / C rejection | `pdlc/engine/package.json`'s only test script is `node __tests__/_run-suite.mjs`; no `c8` block, no coverage dependency |
| Vendored class 5 → 6 | Option A row, K-2 | `WORKFLOW_MEMBERS` holds exactly five entries incl. `VENDOR-MANIFEST.json` |
| `tspecPackedCount` returns `4 + 15 + 5 + 1 + (licence ? 1 : 0)` | Five-sites table | Exact literal match |
| `c8.include` holds seven `**/`-anchored entries incl. both existing `lib/*.mjs` members | Five-sites table | Exactly seven; `lib/loop-session.mjs` and `lib/escalation-view.mjs` both present |
| `test:coverage`'s second stage is `--per-file --branches 85` | DEC-STATS-01 rationale | Present in the `test:coverage` script |
| Bare basenames do not match under `allow-external`, already on | K-3 | `allow-external: true`; the package's own `//c8` note records this exact failure mode |
| The class already grew three → five via `loop-session`/`escalation-view`, recorded `PK-24`/`PK-25` | DEC-STATS-01 precedent | Helper comment reads "the vendored class size (5, was 3)"; `// PK-20…PK-22, PK-24…PK-25` on the `WORKFLOW_MEMBERS` spread |
| `resolveWorkflowRoot()` probes for `orchestrate-dev.js` and `orchestrate-queue.js` | DEC-STATS-01 decision | `MODULE_FILE_NAMES` is exactly those two; `rootResolves` requires both |
| The `loopSessionModule()` / `escalationViewModule()` arrangement exists to copy | DEC-STATS-01 decision | Both helpers present, each `resolveWorkflowRoot()` then dynamic `import()` |
| Vendor root is preferred over checkout, so an unvendored module breaks installed users | Option D rejection | Fixed candidate order, vendor first |
| `DECISIONS-seam-defaults.md` DEC-SEAM-01 exists and governs seam defaults | DEC-STATS-03, Relationship section | Present |

That is an unusually high hit rate for a cost table, and it is worth saying so plainly. One claim
did not survive, and it is recorded as F-02.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | DEC-STATS-01's carve-out paragraph asserts "This paragraph is that amendment's single site", but the co-change rule the same document quotes two sections earlier says the vendored class size is co-changed with `docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 `PK-*` table and FSPEC §5.2's per-class counts, "never this file alone". Writing a paragraph in *this* feature's DECISIONS does not edit *that* feature's two documents. The Consequences obligation table (K-1…K-6) names five code sites, the `tspecPackedCount` term move, the `c8.include` entry, the single construction site and the citation rule — but never names editing the sibling feature's TSPEC §5.4 table or FSPEC §5.2 counts. PLAN and PROPERTIES read the K-table as the obligation interface, so the one obligation the decision calls its hardest cost is the one obligation that will not reach them. Either add a `K-*` row owning those two document edits, or state explicitly that this decision *overrides* the helper's co-change rule and why the frozen documents may go stale — but the document cannot both quote the rule as binding and declare itself the whole compliance. | REQ C-5 (via O-2's design latitude); REQ G-1 |
| F-02 | Medium | Local | Option D's rejection rests on `pdlc/workflows/lib/document-oracles.mjs` as the precedent member, claiming it "appears in none of the four vendoring enumerations, only in `pdlc/workflows/package.json`'s `c8.include`". The second half is false: `document-oracles.mjs` appears nowhere in `pdlc/workflows/package.json`. The `c8.include` set is the seven entries listed in the document's own five-sites table, and it is not among them. This matters twice over. First, Options Considered promises "Every cost below was measured against the tree at HEAD, not estimated", and this is the one row where that promise fails — in a record whose stated purpose is to stop a later reader re-opening the choice. Second, the true state is *stronger* evidence for the same conclusion than the stated one: a `workflows/lib/` member can sit outside **every** gate, vendoring and coverage alike, which sharpens rather than softens why `stats.mjs` must not follow it. Correct the sentence to what the tree says, and let the asymmetry argument stand on the accurate fact. | REQ O-2 |
| F-03 | Medium | Local | K-4 records that a second `StatsParsers` construction site "voids DEC-STATS-03's oracle without failing it", and that the guard is "a review-blocking finding, not a test failure". REQ C-5 is a constraint on *every* artifact-parsing rule the command re-reads, and DEC-STATS-03's whole claim to beat option C is that identity "cannot be satisfied by a re-implementation at all, so C-5 holds for every input". That totality is real for the one site the oracle covers and absent everywhere else, which means C-5's enforcement degrades to human vigilance at exactly the seam the decision was written to protect. The document lists three Standing costs accepted; this residual — a self-identified unenforceable obligation on a P0-grade constraint — is not among them. Either add it to Standing costs accepted so PLAN and the DoD reviewer inherit it as a known risk, or state the mechanical check that would close it (a construction-site count is greppable). | REQ C-5 |
| F-04 | Low | Local | DEC-STATS-01's first re-evaluation trigger says that on a third runtime-reachable member "the four vendoring enumerations should be *derived* from a directory listing at pack time". K-1 already describes TSPEC §6.4's vendoring oracle as "derived from `MODULE_NAMES` rather than transcribed". A later reader cannot tell from the trigger which enumerations are still literal transcriptions and therefore what the trigger would actually change. Naming the three script literals plus `c8.include` explicitly would make the trigger checkable rather than directional. | REQ O-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is the intent that `docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 and FSPEC §5.2 *do* get edited in the same change (in which case the K-table needs a row), or that they are deliberately left frozen and this DECISIONS becomes the pointer a future reader follows (in which case the helper's "never this file alone" comment needs a co-change too, or it will keep asserting a rule the repo no longer follows)? |
| Q-02 | DEC-STATS-02 hoists `SCHEMA_VERSION` into all three emitted documents including the refusal. I confirmed FSPEC BR-30 requires exactly that, so this traces cleanly — but REQ-STATS-02's set-equality guarantee is written about the success document only. Is the refusal document's schema-version presence intended to be part of REQ R-5's consumer-stability promise, or an FSPEC-level convenience? The answer decides whether a future change to the refusal shape is a contract break. |
| Q-03 | Standing costs names "Real-path test bindings to the live archive" and cites the `doc-moves-break-pinned-tests` pattern. Given that DEC-STATS-01 also binds this feature to a *completed* feature's documents, does the same mitigation (declare each literal as a measurement, re-measure, never path-rewrite) extend to the carve-out, or is that a separate obligation? |

## Positive Observations

- **The cost table is genuinely measured, and that is rare.** Fifteen of sixteen verifiable claims
  matched the tree exactly, down to `tspecPackedCount`'s literal `4 + 15 + 5 + 1 + (licence ? 1 : 0)`
  and the 12 + 3 decomposition of the engine `lib` class. A decision record that can be checked this
  cheaply is worth far more later than one that reads well.
- **Option D is the right option to have named.** Rejecting the obvious cheap alternative — skip the
  vendoring co-change — and explaining *why* the one existing member that skips it is not a precedent
  is exactly the reasoning that would otherwise be re-opened in six months. The conclusion is correct
  on the tree: vendor root is tried first, so an unvendored `stats.mjs` would work in a checkout and
  fail only for installed users. F-02 asks for a corrected supporting sentence, not a changed verdict.
- **"What these decisions do not decide" is a strong section.** Explicitly disclaiming observable
  behavior, and pinning token spellings and key sets back to FSPEC §4/§5, is what keeps this document
  from quietly becoming a second spec. From a product lens that is the single most valuable paragraph
  here: it means no acceptance criterion can drift into an engineering artifact.
- **Anti-restatement discipline.** K-6 requiring downstream documents to *cite* `DEC-STATS-01` rather
  than restate it, justified by a prior feature's LEARNINGS on verbatim restatement as a defect
  generator, is process learning applied rather than merely recorded.
- **Re-evaluation triggers are stated in conditions an operator can observe**, not in vague
  "if this becomes a problem" terms — a third `lib/` member, a second JSON-only field, driver exports
  gaining state. Q-01 and F-04 are refinements to that, not objections.

## Recommendation

**Needs revision**

One High finding gates. The document is in good shape overall and its cost analysis is unusually
well-grounded; the revision is narrow.

Exactly what to change:

1. **F-01 (High, gating).** Resolve the contradiction between the carve-out paragraph's "This
   paragraph is that amendment's single site" and the quoted "never this file alone" co-change rule.
   Either add a `K-*` obligation row owning the edits to
   `docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 `PK-*` table and FSPEC §5.2 per-class
   counts, or state that this decision overrides that rule and record the consequence of the frozen
   documents going stale. Do not leave both readings live.
2. **F-02 (Medium).** Correct the Option D sentence: `document-oracles.mjs` is not in
   `pdlc/workflows/package.json`'s `c8.include`; it is in no enumeration in that file at all. Restate
   the asymmetry on the accurate fact — which strengthens the argument.
3. **F-03 (Medium).** Add the unenforceable-second-construction-site residual to Standing costs
   accepted, or name the mechanical check that closes it.
4. **F-04 (Low).** In DEC-STATS-01's first re-evaluation trigger, name which enumerations are still
   literal transcriptions, given K-1 states the vendoring oracle is already derived.

No changes are requested to DEC-STATS-02, which traces cleanly to REQ-STATS-02, REQ R-5 and FSPEC
BR-21/BR-23/BR-24/BR-30, nor to DEC-STATS-03's chosen option, which is the right call for REQ C-5.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
