# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.2)
**Previous review:** `CROSS-REVIEW-product-manager-DECISIONS-v1.md` (iteration 1)
**Date:** 2026-08-19
**Iteration:** 2

## Delta scope

`git diff 588c726a..HEAD` on the document — the commit that closed my v1 review — shows eight
revision commits touching seven top-level entries plus the obligations table. Changed regions
reviewed: the version row, DEC-LI-02 (seam-contract paragraph), DEC-LI-03 (new funnelling-premise
paragraph, re-evaluation triggers), DEC-LI-04 (new rejected alternative, constraints paragraph),
DEC-LI-05/06/10 (re-evaluation triggers), DEC-LI-07 (new erratum paragraph, triggers), DEC-LI-08
(constraints paragraph), DEC-LI-09 (new recorded-sha guard), the "Decisions deliberately NOT taken"
table row on AC-3.3, the hand-off bullet on read cost, and obligations `D-O-2`, `D-O-3`, `D-O-4`,
`D-O-6`…`D-O-9`. Unchanged entries (DEC-LI-01, the corpus/grounding preamble, DEC-LI-05's body,
DEC-LI-08's body) were approved in v1 and are not re-litigated.

## Prior findings — disposition

| v1 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | DEC-LI-07 gains a dedicated paragraph naming the divergence, its downstream cost (PROPERTIES/PLAN read TSPEC, so `AT-31`/`AT-32` against §I.3 would be red against a correct implementation), the four specific edits asked of TSPEC, and obligation `D-O-9` owned by TSPEC. The erratum is now a tracked item, not a promise. |
| F-02 | Medium | **Resolved** | DEC-LI-04 adds the "widen the enumeration to include consolidation's project-level artefacts" alternative with the reason I asked for, and states the extra cost (double-delivery at per-dispatch cost, plus breaking the pinning test's premise). A future agent re-reaching for it now meets a written answer. |
| F-03 | Medium | **Resolved, and better than I asked** | Rather than record a residual risk, DEC-LI-02 and DEC-LI-04 correct the seam contract outright: the Node channel never throws, the runtime channel may reject, so the shell's `try` covers **both** seam calls. This is the fail-open guarantee (REQ C-7/G-4, FSPEC `BR-12`) actually holding on the channel that runs the pipeline. |
| F-04 | Low | **Resolved** | The "Decisions deliberately NOT taken" row now cites TSPEC `ERR-6` as the existing route to REQ AC-3.3 and states it is not re-raised here. Verified: `TSPEC-pdlc-learnings-injection.md:353` and `:1248` both carry `ERR-6` routed at REQ AC-3.3. |
| F-05 | Low | **Resolved in kind, one residual** | Both `DC-18` miscitations are gone. The replacement authority is `DEC-LAYER-01`, which on re-reading does not actually cover this claim — see F-01 below. My v1 fix suggestion offered that swap, so the residual is partly mine. |
| F-06 | Low | **Resolved** | `D-O-4` now names realised prompt sizes against REQ §4.1's caps as the input C-8's weakly-satisfied second half needs, and states explicitly that this obligation is where the C-8 gap is owned and what its closing condition is. |

## Verification of new claims

Every load-bearing new claim was re-run against HEAD, not read back out of the document.

| New claim | Where | Verified |
|---|---|---|
| `defaultGit` wraps `execFileSync` in `try` and converts non-zero exit to `{ok:false,…}` | DEC-LI-02, DEC-LI-04 | **Holds** — `pdlc/workflows/orchestrate-dev.js`, `defaultGit`. |
| `rtGit` awaits `RT.agent` with **no** `try`, so a rejected host call rejects `rtGit` | DEC-LI-02, DEC-LI-04 | **Holds** — `pdlc/workflows/runtime-adapter.js`, `async function rtGit(argv)` opens `const out = await RT.agent(` with no guard through to its return. |
| Siblings `rtReadChunk`, `rtReadProbe`, `rtHashFile`, `rtCliQuery` all wrap their `await` | DEC-LI-02 | **Holds** — each of the four has a `try {` / `} catch` pair around the await inside its own body. The asymmetry the document names is real, and it is the asymmetry that makes the correction load-bearing rather than pedantic. |
| `rtGit`'s docblock claims "never throws" | DEC-LI-02 | **Holds** — the docblock reads "Returns { ok, stdout, stderr } and never throws; the caller interprets." The document is right that the docblock is the trap: a future agent reading only the docblock would rebuild exactly the design v0.1 had. |
| TSPEC still builds the injector on `present && config.enabled && !sectionMalformed` and still carries `OQ.2`/`ERR-4` open | DEC-LI-07, `D-O-9` | **Holds at HEAD** — TSPEC is unchanged at v0.5 (`16f30820` is its latest commit); §I.3 at `:435`, the `enabled`-default row at `:1179`, `OQ.2` at `:1183`, `ERR-4` at `:1228`. The erratum is live, not already discharged. |
| REQ §4.1 declares `learningsInjection.enabled` default `true` with no second gate | DEC-LI-07 | **Holds** — REQ `:223` gives the bare `true` default; AC-5.1a (`:378`) makes explicit `false` the only disabling state, AC-5.1b/c (`:387`, `:395`) keep malformed and wrong-typed configuration **enabled**. DEC-LI-07 follows the settled product decision. |
| TSPEC `ERR-6` already routes the AC-3.3 locus question to REQ | "NOT taken" table | **Holds** — TSPEC `:353` and `:1248`. |
| `DEC-LAYER-01` supports "REQ §4.1 owns the threshold values" | DEC-LI-08, "NOT taken" table | **Does not hold** — see F-01. `DEC-LAYER-01` fixes what an **FSPEC** may not carry (tie-breaks, reader indices, seam permitted-sets, fixture construction → TSPEC/PROPERTIES); it says nothing about REQ owning tunable numbers. |
| `DEC-ERR-01` is available as this feature's erratum id | DEC-LI-07 | **Does not hold** — see F-02. `DEC-ERR-01` is an occupied project-level id. |
| Four authoring-classified dispatch producers, all reaching `dispatchAndVerify` | DEC-LI-03 | **Holds** — re-verified from v1: three `dispatchKind: "authoring"` object literals plus `reviewLoop`'s positional `"authoring"` through `runWrapped`. |
| Corpus predicate returns **9** documents at HEAD | DEC-LI-06 trigger | **Holds** — re-ran `LEARNINGS_CORPUS_ARGV`'s frozen argv; 9. |

## Findings

Both are new, both introduced by this round's edits, both in changed regions. Neither is High:
neither narrows, reinterprets nor drops a REQ acceptance criterion, and neither changes what the
feature does. They are traceability defects in citations a downstream author will follow.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **`DEC-LAYER-01` does not support the claim it is now cited for** (DEC-LI-08 "Constraints that forced the shape"; "Decisions deliberately NOT taken" threshold row). `DEC-LAYER-01` is titled "An FSPEC states the observable and names the artefact that will pin it; it does not carry the artefact", and its enumerated classes are all **FSPEC → TSPEC/PROPERTIES** hand-downs (tie-break algorithms, per-field reader indices, seam verb permitted-sets, fixture construction). It has nothing to say about **REQ** owning tunable numbers, which is a different boundary in the other direction. The v1 fix I suggested offered this swap, so the round replaced one unsupported citation with another rather than dropping the borrowed authority. The claim needs none: REQ `:223`'s defaults table *is* the product's declaration of the numbers, and DEC-LI-08 depends only on their existence. **Fix:** cite REQ §4.1 directly and drop the project-decision reference in both places. | REQ §4.1 |
| F-02 | Medium | Cross-Feature | **The erratum is raised under an id that is already occupied at project level, and the occupant is a rule about erratum routing.** DEC-LI-07 says the divergence "is therefore raised as **DEC-ERR-01 against TSPEC**". `DEC-ERR-01` is a promoted project-level decision — "A collision whose upstream has already decided is absorbed, not routed" (`docs/_decisions/DECISIONS-review-severity-bars.md:88`), read by every author and reviewer role before authoring. A PLAN or PROPERTIES author who follows the reference lands on a rule that reads, in this exact situation, as an instruction *not* to route — the opposite of what the paragraph intends. (The document's substantive handling is correct: REQ v0.9 decided, this document **absorbed** the decision onto the settled form, and the TSPEC ask is that TSPEC absorb it too rather than a re-raise upstream. Only the label is wrong.) The obligations table gets this right — `D-O-9` is the tracked item, keyed to no colliding id — so the fix is local. **Fix:** drop the `DEC-ERR-01` label from DEC-LI-07 and refer to the erratum by its obligation (`D-O-9`) and its emitted item; if a feature-local erratum id is wanted, use a namespace that cannot collide with `docs/_decisions/` (e.g. `LI-ERR-01`). Cross-Feature because the collision hazard is generic: any feature minting `DEC-*` ids for local items will shadow promoted project decisions. | REQ G-1, AC-5.1a/b/c |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried from v1, still open and still not blocking)* DEC-LI-07 ships the feature **on** at upgrade with no opt-in step, which is exactly what REQ G-1 asks for. Nothing in the document or TSPEC hands `pdlc/OPERATIONS.md` the operator-facing note that a consumer repository will start seeing injected context after an engine upgrade. Is that PLAN's to own, or does it belong in the ship-side checklist? |
| Q-02 | `D-O-6`'s call-count oracle asserts counts over the **injected Node-channel seams**. On the Claude Code channel the platform read cache (`RT_READ_CACHE_MAX_BYTES`, 2 MiB) sits underneath, so the *observable* per-dispatch read cost differs between channels while E-32's behavioural guarantee is identical. Is the operator report (`D-O-4` / `T-O-3`) expected to distinguish the two, or is the Node-channel count the number that moves the thresholds? |
| Q-03 | DEC-LI-06's new review prompt is "corpus count passes ~30, or measured bytes per authoring dispatch pass 2 MiB". Both are good observable proxies. Neither has a mechanism that fires — is a periodic check of the corpus count something `D-O-4`'s report should carry, so the prompt arrives without anyone remembering to look? |

## Positive Observations

## Recommendation

## Verdict
