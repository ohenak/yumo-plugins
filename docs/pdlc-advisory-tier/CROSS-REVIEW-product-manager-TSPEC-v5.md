# Cross-Review: product-manager — TSPEC (delta confirmation, erratum round)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** Local — delta confirmation of the Phase D erratum edit only (commits `5105ff5`, `9d9ae61`, `5042d5c`, `f38ad2e`, `b198f1a`, diffed against `e067f5e`, the commit approved in v4). Sections untouched by that diff are not re-reviewed.

## Delta under review

The edit is confined to seven regions plus a new §18 changelog: the metadata version cell (`1.0` → `1.1`), §2.2's rejected-alternative paragraph, §2.3's prelude block and a new "two module-private symbols" paragraph, §3.2's C-2 header paragraph, §4.4's durability paragraph, §6.4.1's heading, its step-order paragraph and a new Reachability paragraph, §11.2's fixture-provenance paragraph plus a new scenario table, §11.3's one table cell, and §16.1/§16.3/§16.4. No requirement mapping, no seam contract, no budget, no acceptance criterion, and no interface signature changed. §14.1/§14.2's REQ↔FSPEC↔TSPEC traceability tables are byte-identical.

I re-grounded every factual claim the edit newly asserts rather than taking the changelog's word for it:

| Claim the edit now makes | Ground truth |
|---|---|
| Manifest rows are emitted per artifact from a three-entry `bundles` array | `pdlc/workflows/build-runtime.mjs:277-296` — `const bundles = [ … ]` with exactly three entries (`orchestrate-queue.bundle.js`, `orchestrate-dev.bundle.js`, `pdlc-cli.mjs`). Confirmed. |
| `commitPaths` is module-private at `orchestrate-dev.js:6905` | `async function commitPaths({ paths, message, what, _git, _sleep, emit })` at `:6905`, no `export`. Confirmed. |
| `gitWithLockRetry` is module-private at `:6862` and reachable from `commitPaths` via shared module scope | `async function gitWithLockRetry(argv, { _git, _sleep, emit, label })` at `:6862`, no `export`; `commitPaths` calls it on its first statement. Confirmed. |
| FSPEC C-2 already scopes its notice to the enabled case | `FSPEC-pdlc-advisory-tier.md:145` — "reported on the run report **only when the resolved configuration leaves the tier enabled** … a malformed `advisory.enabled` produces a disabled run, which carries **no** advisory content on its report at all (§12 D-5, §10.3 S-4)". Confirmed. |
| FSPEC already reconciles A2-6 with R-2 | `FSPEC:232-237` — "at **both**, steps 5 and 7 complete **before** that durable git operation"; `FSPEC:635` (A5-8) and `FSPEC:690` (R-2, "a precondition of an action **surviving**"). All three citations resolve to the text cited. Confirmed. |

## Item-by-item disposition

The eleven routed items collapse to five distinct defects (four of the five were raised independently by two or three reviewers). Disposition:

| # | Item (raisers) | Where it landed | Resolved? |
|---|---|---|---|
| 1 | Manifest-composition claim is false — a fourth build source adds no `distribution-manifest.json` row (pm-review, te-review, se-author) | §2.2 (`115-122`) now says the fourth source "changes the artifact composition rule that `__tests__/runtimeBundle.test.js` is written against" and adds "It does **not** change `distribution-manifest.json`'s composition: manifest rows are emitted one per *artifact* from the three-entry `bundles` array (`build-runtime.mjs:277-296`) … only the `pluginSha1` values move." §16.1 (`1490-1497`) carries the same correction with the same citation. | **Yes.** Both occurrences fixed, the `runtimeBundle.test.js` half retained exactly as the item asked, and the residual effect (`pluginSha1` moves) is stated rather than elided — a more accurate claim than the one the item required. Grep confirms no third occurrence survives. |
| 2 | §6.4.1's `verifyGate` calls `commitPaths`, which is module-private and absent from §2.3's export list and queue prelude (pm-review, te-review, se-author) | §2.3's code block gains `"commitPaths"` to the dev export array and `"const commitPaths = __dev.commitPaths;\n"` to the queue prelude, plus a new paragraph (`152-163`) stating that `commitPaths` gains one `export` keyword in `orchestrate-dev.js`, that `gitWithLockRetry` stays private because `commitPaths` closes over it in the same module scope, and that the addition is additive w.r.t. §2.2's composition and `runtimeBundle.test.js`. §6.4.1 gains a matching **Reachability** paragraph (`780-785`). §14.3 already lists `build-runtime.mjs` as "§2.3's export-list and prelude edit". | **Yes.** The item offered two exits (add to §2.3, or name a different mechanism); the edit takes the first, completely — export site, build export list, queue prelude, and the private-helper reachability argument. The `gitWithLockRetry`-stays-private reasoning is correct against `:6862`/`:6905`. |
| 3 | §11.3 and §3.2 call C-2 handling a "deliberate deviation" when FSPEC:145 makes it conformance (pm-review ×2, te-review, se-author) | §3.2's header paragraph is retitled "**Where C-2's reporting half applies — conformance, not deviation (see §16.4).**" and quotes FSPEC:145's own "only if the resolved configuration leaves the tier enabled" clause with the citation. §11.3's table cell now reads "§3.2's emit gate — C-2's own report-only-when-enabled clause (`FSPEC:145`)". The C-2 row of §3.2's rule table (`272`) is likewise restated with the **iff** scoping. | **Yes.** Behaviour is unchanged (suppress the notice when effective `enabled` is `false`) — only the traceability framing moved from "deviation" to "conformance", which is what FSPEC:145 actually says. This closes my own v4 F-01 at both cited sites. |
| 4 | §16.4 raises as open FSPEC defects two things FSPEC v1.3 already settled; §4.4/§6.4.1/§16.3 forward-reference them as gaps (pm-review, plus the te-review/se-author variants) | §16.4 is retitled "**Two settled FSPEC rules, and the TSPEC mechanism that expresses each**" and now states "**They are not upstream defects.** FSPEC v1.3 settles both … No erratum is outstanding against FSPEC from this document," restating each as a settled rule + the TSPEC-side mechanism that expresses it. §4.4 (`459-465`) becomes "the mechanism for a settled FSPEC rule, not a fix to an FSPEC gap"; §6.4.1's heading becomes "expressing FSPEC's settled A2-6 / R-2 rule"; §16.3's rejected-alternative rationale is rewritten in the same register. | **Yes.** All four forward references I listed in v4 F-01 (`257`, `437`, `731`, `1453`) are converted. A grep for `deviation|erratum|errata|FSPEC gap` across the document returns only the four *negating* sentences plus the §18 changelog row — no surviving assertion that FSPEC carries an open contradiction. |
| 5 | §11.2's D-6 fixture pins a commit but not a run scenario, so the two created-file sets are not guaranteed comparable (te-review, se-author) | §11.2 gains "**The fixture pins a scenario, not just a commit.**" (`1261-1282`) with an eight-row scenario table (`baselineCommit`, `reqPath`, `forcePhases`, `agentDoubles`, `config`, `phasesReached`, `seamsInstrumented`, `command`/`date`), each row carrying *why it is load-bearing*, plus the rule that the test **re-asserts the scenario before comparing** and that a mismatch fails as a *fixture-staleness* failure distinct from a created-file diff, and that the disabled run is constructed from the same four inputs. | **Yes, and it exceeds the item.** The item asked for the scenario to be recorded; the edit additionally makes the scenario a *checked* precondition with its own distinguishable failure mode, which is what actually prevents both failure directions the item named (false-red on drift, vacuous green on narrowing). The `config` row explicitly names the sections that gate file-creating phases (`implementation`, `distribution`, `mergeMode`, `advisory`), which is the part that makes the guard non-vacuous. |

**Nothing previously approved was broken.** The delta touches no requirement mapping, no seam contract, no error-handling row, and no interface. §14.1/§14.2 traceability is unchanged, so every P0/P1 requirement retains the mapping I approved at v3/v4. The two behavioural statements that could have drifted — C-2's emit gate and A2's record-before-commit order — are byte-for-byte the same behaviour, re-labelled; §11.3's outcome column still reads "disabled, **and no substitution notice**", and §6.4.1's step order still puts step 7 before step 6 at A2/A5. The one genuinely new commitment (exporting `commitPaths`) is additive and is reflected in §14.3's file table.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
