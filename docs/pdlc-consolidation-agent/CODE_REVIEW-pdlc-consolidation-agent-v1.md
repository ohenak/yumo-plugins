# CODE_REVIEW — pdlc-consolidation-agent — v1

| Field | Detail |
|---|---|
| Feature | pdlc-consolidation-agent |
| Branch | `feat-pdlc-consolidation-agent` |
| Reviewer role | dod-verify (evaluator — documents findings, fixes nothing) |
| Review version | v1 |
| Scope | Local + Cross-Feature (per-finding tags in §1) |
| Specs read | `REQ-pdlc-consolidation-agent.md`, `FSPEC-pdlc-consolidation-agent.md`, `PROPERTIES-pdlc-consolidation-agent.md` |
| Primary production surface | `pdlc/workflows/consolidate-learnings.js` (2693 lines, 39 exported functions) |
| Test surface | `pdlc/workflows/__tests__/consolidation*.js` — 17 suites, 290 tests, all green |
| Verdict | **failed** |

---

## 1. Code Quality Findings

### F1 — Placeholder repository literal reaches two production `gh` invocations on the shipped default config
**Severity: High · Scope: Local · Criterion 3 (mock/fake data) + Criterion 2 (unwired integration)**

`consolidate-learnings.js:705` and `:905` both do:

```js
const repo = config.pluginRepository ?? "unknown/unknown";
```

`pluginRepository` ships as `null` (`:2039`), and REQ `:575` defines that default as **"`null` → the current repository (the same-repo case, AC-3.8)"**. So on the shipping configuration the substituted value is the literal string `unknown/unknown`, which is then interpolated into two real commands by `mergeCommandFor` (`orchestrate-dev.js:374`, `:378`):

- `gh pr list --repo unknown/unknown --state all …` — the NFR-4 duplicate-suppression poll (`:706`)
- `gh pr create --repo unknown/unknown --head … ` — the AC-3.1 guard-set PR (`:907`)

Both target a repository that does not exist. The same file already handles the `null` contract correctly elsewhere — `openClone:2543` branches on `cfg.pluginRepository == null` and falls back to the local remote — so the null case is understood in this module; these two call sites are the omission, not a missing convention.

No test and no spec sanctions the literal: `unknown/unknown` appears **zero** times across `pdlc/workflows/__tests__/` and zero times across `docs/pdlc-consolidation-agent/*.md`. Every test that reaches these paths supplies a non-null `pluginRepository`, so the shipping default arm is exercised by nothing.

Consequence: on the default config the duplicate poll returns `pr-poll` unavailable (masking NFR-4), and the PR route fails at creation — i.e. AC-3.1, AC-3.3, AC-3.4 and NFR-4 are all unreachable as shipped.

### F2 — The open-promotion list is computed but never handed to the harvest prompt; the skill instruction that depends on it is conditioned on a hand-off no production path performs
**Severity: High · Scope: Cross-Feature · Criterion 2 (unwired integration) + Criterion 6 (adjacent-surface falsification)**

FSPEC §8.4 step 1 (`:1531`) is explicit that openness is *"computed **by the pass**, from the log and nothing else, and **handed to the harvest prompt as a list** — the arithmetic is not delegated to the agent"*, and gives the reason: an id an LLM composes will not be byte-equal to a recorded slug, so a derive-it-yourself convention *"would make `recurred` unreachable and drift every promotion to `insufficient-evidence` and then `unmeasurable` (§8.7)"*.

Tracing the hand-off:

- `openPromotionList` (`consolidate-learnings.js:1816`) has exactly **one** caller in production: the report-body count at `:2396`.
- `pdlc/workflows/orchestrate-dev.js` — the owner of the Harvest phase prompt — contains **zero** occurrences of `openPromotionList`, `open promotion`, or `failure-mode-id`.
- `pdlc/skills/harvest-learnings/SKILL.md:104` nevertheless instructs the agent: *"If a candidate's failure mode was named in the **handed** open-promotion list (FSPEC §8.3, §8.4), copy that list's …"*.

So the shipped harvest instruction is guarded by a precondition ("the handed list") that is never satisfied, and the guard fails closed: the agent writes no `failure-mode-id`. That is the exact failure FSPEC §8.4 says the convention exists to prevent — `recurred` becomes unreachable, and AC-5.2's whole falsifiability loop degrades to `insufficient-evidence` → `unmeasurable` in perpetuity.

This is the feature's headline capability (REQ §1 `Unfalsifiability`), and the seam that carries it is not connected.

### F3 — Report item 10 counts the wrong population
**Severity: High · Scope: Local · Criterion 5 (final-artifact trace)**

FSPEC §10.4 item 10 (`:1939`) specifies: *"the **number** of open promotions in the list §8.4 step 1 hands to the harvest prompt"* — and §8.4 step 1's list is computed from **`docs/_decisions/.consolidation-log.md`**, i.e. over all prior records.

Tracing the final operator-visible artifact (the report body, the only entry point that renders item 10):

- `renderReportBody:2344` — `const records = Array.isArray(s.records) ? s.records : []`
- `:2396` — `lines.push(\`10. open promotions: ${openPromotionList(records).length}\`)`
- `state.records` is initialised `[]` at `:497` and is only ever appended by `state.records.push(record)` at `:780` — **this pass's own promotions**.

`main` holds the log-derived `priorRecords` in scope at that point and uses it correctly for `effectivenessTable` (`:701`) and `remediationChoice` (`:735`), so the correct population is available and simply is not the one passed. The observable consequence: item 10 can never exceed this pass's promotion count, and reports `0` on any `no-op` pass regardless of how large the real open backlog is — precisely inverting the number's purpose.

Writer enumeration for item 10: `grep -n 'open promotions' consolidate-learnings.js` yields the single writer at `:2396`; `renderReportBody` has one production caller (`:1192`) and no later writer re-renders or overwrites the value. So no clobbering writer hides this — the single writer is simply wrong, and the tests pin item 10's *presence* and its self-consistency with the state handed in, never its population. (The FSPEC v5 software-engineer cross-review Q-01 and test-engineer Q-01 both asked whether the count is asserted equal to the computed list's length; the shipped tests do not close it.)

### F4 — Dead control flag in the PR-authoring loop
**Severity: Medium · Scope: Local · Criterion 1 (stub-shaped code)**

`consolidate-learnings.js:842` declares `let authoringFailed = false;` and `:866` reads `if (authoringFailed) break;`. The flag is **never assigned** anywhere in the file (`grep -n authoringFailed` returns exactly those two lines), because every failure arm inside the loop returns via `finishPass` instead of setting it. The `break` is unreachable and the guard is inert — a control variable with no logic behind it, exactly the shape the stub criterion targets. It also reads as an intended-but-unfinished non-terminal degradation path for a per-proposal authoring failure.

### F5 — Branch coverage below the 85% floor
**Severity: Medium · Scope: Local · Criterion 4**

Measured on this branch:

```
$ node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage \
    --collectCoverageFrom='consolidate-learnings.js' --testPathPattern='consolidation'
Statements   : 92.18% ( 1050/1139 )
Branches     : 78.14% ( 819/1048 )   ← floor is 85%
Functions    : 89.31% ( 117/131 )
Lines        : 94.04% ( 916/974 )
Test Suites: 17 passed · Tests: 290 passed
```

Branches is the only metric below floor, and the shortfall is consistent with F1, F3 and F4: the shipped-default `pluginRepository == null` arm, the log-vs-pass population arm, and one arm that is structurally unreachable. Property-based testing is present (seeded-PRNG generators, PROP-GEN-* / PROP-DIS-*), so this is a coverage-depth gap, not a methodology gap.

### F6 — `consolidate-learnings/SKILL.md` still asserts two claims this feature falsifies
**Severity: Medium · Scope: Cross-Feature · Criterion 6 (adjacent-surface falsification)**

The file is modified on this branch (`git diff --name-only main...HEAD -- pdlc/skills/` lists it), so it was in the author's hands, and it still says:

- `:12` — **"Cadence: Manually invoked."** AC-1.1 makes the pass fire on an elapsed `consolidation.cadenceHours` *"with no per-pass operator invocation"*, and AC-1.2 makes it fire on `volumeThreshold` *"even if `consolidation.cadenceHours` has not elapsed"*. The shipped implementation agrees (`triggerFor:1401`, trigger catalogue `:82`). The skill's cadence claim is now false.
- `:26-29` — **"Git Workflow: 1. Before starting: check out or create `chore-consolidate-learnings-{date}`. Pull latest. 2. After completing: commit … and the updated log; push."** AC-3.8b requires those writes to land *"in the invoking tree on whatever branch it is already on"*, and states plainly that AC-3.8 **forbids** changing it; AC-3.8b's uncommitted arm records `writes-uncommitted` in report item 9 (`renderReportBody:2394`). The skill therefore instructs an agent to perform exactly the branch operation the REQ forbids.

The REQ scopes out only *retiring* the manual entry point; it does not declare this contradiction out of scope, so it is not a sanctioned residue. Same-shape sibling sweep: the family is {`orchestrate-dev`, `orchestrate-queue`, `consolidate-learnings`} — skill + workflow-bundle pairs. The first two carry pointer-style SKILLs consistent with their bundles; `consolidate-learnings`' SKILL still carries a full manual procedure that its own bundle contradicts. The sibling is neither covered nor scoped out.

### F7 — FSPEC's own citation of where the harvest convention lives is false at HEAD
**Severity: Low · Scope: Local · Criterion 6 (adjacent-surface falsification)**

FSPEC §8.4 (`:1524`) states the convention is added to `pdlc/skills/harvest-learnings/SKILL.md` **"(metadata table `:70-78`)"**. At HEAD, `:70-78` is the LEARNINGS document-format metadata table and contains no such convention; the single `failure-mode-id` occurrence in the file is at `:104`, under *Open Items*. The cited location is falsified by the shipped artifact.

### F8 — The AC-1.1 direct-invocation override exists in code but is unreachable from any entry point; only tests reach it
**Severity: Medium · Scope: Local · Criterion 2 (unwired integration) + Criterion 5 (stub-backed assertion)**

AC-1.1's final clause: *"Given a direct `/pdlc:consolidate-learnings` invocation, Then the pass runs regardless of the interval — the manual entry point is never gated by cadence."*

The implementation exists: `main({ … direct = false })` (`:466`) → `triggerFor({ …, direct })` (`:559`) → `if (direct) return "manual"` (`:1402`). What is missing is the wire from an operator to that parameter:

- `meta.inputs: []` (`:35`) — the module declares **no** operator-supplied input. By the runtime's own input contract (cf. `orchestrate-dev.js:3349`, `orchestrate-queue.js:48`, which declare theirs), an operator invoking `/pdlc:consolidate-learnings` has no way to set `direct`.
- `orchestrate-queue.js` never passes `direct` (zero matches).
- `pdlc/skills/consolidate-learnings/SKILL.md` never mentions it.

The only 18 sites that set `direct: true` are in `__tests__/consolidation*.js`. So AT-C4's direct-invocation assertion passes over a path the production entry point cannot reach: without the input declaration, a real direct invocation takes the cadence test and can exit `skipped-cadence` (`:560`), which is what AC-1.1 forbids.

### Informational (not findings)

- `node pdlc/workflows/build-runtime.mjs --check` exits **0** — all five `dist/` rows in sync.
- `pdlc/hooks/scripts/sync-workflows.sh --check` exits 1 with four rows `stale` (`consumerArtifactVersion 0.22.4` vs `pluginArtifactVersion 0.22.5`), `_pdlc_c3_any_local_or_unverified=0`. This is the untracked consumer copy under `.claude/workflows/`, which RELEASE-CHECKLIST §5 anticipates; it is operator-local state, not a branch defect.
- `npm test` shows one red suite, `documentOracles.test.js` AT-22, caused solely by untracked local files (`.serena/cache/…`, `.tokensave/tokensave.db`). CLAUDE.md documents this false-red explicitly. Not a finding.
- Deferral binding (Criterion 6b): every `D-CONS-*` deferral binds to the named successor `pdlc-engineering-loop`, which has **both** a queue row (`docs/_queue/QUEUE.md` row 6) and a REQ file under `docs/`. BL-01a/BL-03/BL-05 are declared operator duties, not deferrals. **No unbound deferral.**

---

## 2. Requirements Traceability

`Traced` column: `full` = implementation path and test path each located and read this round; `suite` = covered by the named suite at suite level, not individually re-traced this round. `Gap?` is `YES` only where a half was verified missing.

| Criterion | Implementation path | Test path | Traced | Gap? |
|---|---|---|---|---|
| AC-1.1 (cadence trigger) | `consolidate-learnings.js:1401` `triggerFor`, `:559` | `consolidationPass.test.js` | full | No |
| AC-1.1 (direct/manual clause) | `:1402` reachable only via `main({direct})`; **no `meta.inputs` declares it** (`:35`) | `consolidationPass.test.js` (AT-C4, sets `direct: true` directly) | full | **YES — F8** |
| AC-1.2 (volume trigger) | `:1401` `triggerFor` volume arm; `:556` | `consolidationPass.test.js` (AT-C1/C2) | suite | No |
| AC-1.3 (in-progress marker) | `:1449` `parseMarker`, `:1461` `markerVerdict`, `:1476` `takeMarker` | `consolidationBuild.test.js` | full | No |
| AC-1.4 | `:1727` `effectivenessTable` | `consolidationEffectiveness.test.js` | suite | No |
| AC-1.5 | `:58` `TERMINAL_STATUSES`, `:1136` finish ladder | `consolidationPass.test.js` | suite | No |
| AC-1.6 | `:2294` `renderTerminalRow` | `consolidationReport.test.js` | suite | No |
| AC-2.1 (DOMAIN-CONSTRAINTS) | `:1517` `targetFor`, `:1873` `routeOf` | `consolidationParse.test.js`, `consolidationPass.test.js` | full | No |
| AC-2.2 (DECISIONS) | `:1517`, `:1873` `DECISIONS_TARGET` | `consolidationCredential.test.js`, `consolidationIdentity.test.js`, `consolidationParse.test.js` | full | No |
| AC-2.3 | `:1891` `routeProposal` | `consolidationRoute.test.js`, `consolidationOperatorChannels.test.js` | suite | No |
| AC-2.4 (log row fields) | `:2294` `renderTerminalRow`, `:1375` `renderConsumedPair` | `consolidationReport.test.js` (AT-L*) | suite | No |
| AC-3.1 (guard-set PR route) | `:1873` `routeOf` over imported `MERGE_GUARD_DEFAULTS`; PR creation `:905-914` | `consolidationRoute.test.js`; **no test of the shipped `pluginRepository: null` arm** | full | **YES — F1** |
| AC-3.2 | `:1891` `routeProposal` | `consolidationRoute.test.js`, `consolidationOperatorChannels.test.js` | suite | No |
| AC-3.3 (one commit per promotion) | `:2504` `renderPromotionCommitMessage`, `:867-869` | `consolidationRoute.test.js` | full | **YES — F1** (commit lands in a clone whose PR cannot be created on the shipped default) |
| AC-3.4 (PR URL in log) | `:905-914`, `:2294` | `consolidationReport.test.js` | full | **YES — F1** (URL never produced on the shipped default) |
| AC-3.5 (proposal-file fallback) | `:2455` `renderProposalFile`, `:2209` `proposalPathFor` | `consolidationOperatorChannels.test.js` | full | No |
| AC-3.6 | `:1891` `routeProposal` retire arm | `consolidationRoute.test.js` | suite | No |
| AC-3.7 (self-modification guard) | `:1873` set-equality with imported `MERGE_GUARD_DEFAULTS` | `consolidationRoute.test.js` (AT-Q7 runtime oracle) | full | No |
| AC-3.8 (same-repo clone) | `:2533` `openClone` — handles `pluginRepository == null` correctly (`:2543`) | `consolidationRoute.test.js` | full | No |
| AC-3.8b (invoking-tree writes) | `:2663` `commitConsumingRepoPaths`, `:1142`; report item 9 `:2394` | `consolidationPass.test.js` (AT-M*) | full | No |
| AC-4.1 (scoped credential) | `:884-897` credential helper, `:2085` config parse | `consolidationCredential.test.js` | suite | No |
| AC-4.2 | `:878-903` | `consolidationCredential.test.js` (AT-K*) | suite | No |
| AC-4.3 | `:878-903` | `consolidationCredential.test.js` | suite | No |
| AC-4.4 (local `gh` auth) | `:876-882` `gh auth status` probe | `consolidationCredential.test.js` (AT-K5) | full | No |
| AC-5.1 (failure-mode record) | `:1504` `failureModeId`, `:2256` `renderFailureModeRecord`, `:780` | `consolidationIdentity.test.js`, `consolidationReport.test.js` | full | No |
| AC-5.2 (effectiveness table / `recurred` observability) | `:1727` `effectivenessTable` — but the `failure-mode-id` lookup it depends on is never handed to harvest (`:1816` single caller) | `consolidationEffectiveness.test.js` (feeds ids in directly; no test that the id reaches a LEARNINGS via any production path) | full | **YES — F2** |
| AC-5.3 (two-strike streak → remediation) | `:1844` `remediationChoice`, `:735`; rendered `:2280` | `consolidationEffectiveness.test.js`, `consolidationOperatorChannels.test.js` | full | No |
| AC-5.4 (retirement routes as making did) | `:1844`, `:1891` | `consolidationRoute.test.js`, `consolidationOperatorChannels.test.js` | full | No |
| AC-5.5 (`unmeasurable`) | `:1727` streak fold | `consolidationOperatorChannels.test.js` | suite | No |
| AC-6.1 (report item 7) | `:2382` `renderAdvisoryItem` | `consolidationOperatorChannels.test.js` | full | No |
| AC-6.2 | `:2382` | `consolidationOperatorChannels.test.js` | full | No |
| AC-6.3 (advisory over consumed window) | `:2382`, `:1956` `parseEscalations` | `consolidationAdvisory.test.js`, `consolidationOperatorChannels.test.js` | full | No |
| AC-6.x item 10 (open promotions) | `:2396` — passes `state.records`, not the log's records | `consolidationReport.test.js` (AT-F19: presence only) | full | **YES — F3** |
| AC-7.1 (`deferred:` on both channels) | `:2384-2392`, `:2455` | `consolidationOperatorChannels.test.js` | full | No |
| AC-7.2 | `:2340` `renderReportBody`, `:2294` | `consolidationPass.test.js` | full | No |
| NFR-1 (never applies to guard set) | `:1891` `routeProposal` | `consolidationRoute.test.js` | full | No |
| NFR-2 (no secret in argv) | `:907` `--body-file`, `orchestrate-dev.js:376-378` | `consolidationCredential.test.js` | full | No |
| NFR-3 / NFR-3a | `:82` `TRIGGERS`, `:565` | `consolidationPass.test.js` | suite | No |
| NFR-4 (duplicate suppression on `(id, action)`) | `:1906` `enactedByLog`, `:1928` `enactedByPr`, poll `:703-717` | `consolidationRoute.test.js` | full | **YES — F1** (the PR half of the key polls `unknown/unknown` on the shipped default) |
| NFR-5 (idempotence) | `:1524` `mergeProposals`, `:1906` | `consolidationRoute.test.js` | suite | No |

**Distinct `req_gaps` (root-cause deduplicated): 6** — AC-1.1 manual clause (F8), AC-3.1 (F1), AC-3.3 (F1), AC-3.4 (F1), AC-5.2 (F2), item-10/AC-6 population (F3). NFR-4 shares F1's root cause and is not counted a second time beyond its own row.

---

## 3. Criterion-by-Criterion Assessment

**Criterion 1 — Stubs, TODOs, `NotImplementedError`.** Swept every non-test changed file from `git diff --name-only main...HEAD`. No `TODO`, `FIXME`, `NotImplementedError` or `throw new Error("not implemented")` in production paths. One stub-shaped defect: **F4**, the never-assigned `authoringFailed` flag whose `break` is unreachable. *Scope: Local.*

**Criterion 2 — Unwired integrations (request → response traced).** Three breaks. **F2**: `openPromotionList` is computed and never handed to the harvest prompt, while the shipped harvest skill instruction is conditioned on receiving it — the request half exists, the response half does not. **F1**: two `gh` calls whose repository argument resolves to a placeholder on the shipped default config, so the request never reaches a real endpoint. **F8**: the `direct` override parameter has no declared input, so no operator request can reach the code that serves it. *Scope: Cross-Feature (F2), Local (F1, F8).*

**Criterion 3 — Mock/fake/placeholder data in production.** One: **F1**'s `"unknown/unknown"` literal at `:705` and `:905`, reached on the default configuration, present in no spec and pinned by no test. *Scope: Local.*

**Criterion 4 — Coverage and property-based testing.** Property-based testing is genuinely present (seeded-PRNG generators, PROP-GEN-*/PROP-DIS-* families) and the suites are substantive, not assertion-free. Branch coverage is **78.14% (819/1048)**, below the 85% floor — **F5**. *Scope: Local.*

**Criterion 5 — REQ/FSPEC/PROPERTIES traceability to a production path and a test that can fail.** §2 above. Six criteria have a verified missing half. The most consequential is **F3**, found by tracing the *final* operator-visible artifact rather than the builder: `openPromotionList` is a correct pure function, and the defect lives entirely in what `renderReportBody` hands it. Writer enumeration on the traced output (`grep -n 'open promotions'`, one production writer at `:2396`; `renderReportBody` one caller at `:1192`) confirms no later writer clobbers the value — the single writer is simply fed the wrong population, and no test pins the population at the final artifact. **F8** is the criterion's other shape: a test that passes over a path production cannot reach. *Scope: Local (F3, F8), Cross-Feature (F2).*

**Criterion 6 — Integration-boundary integrity.**
*(a) Adjacent-surface falsification:* **F6** — `consolidate-learnings/SKILL.md:12` ("Manually invoked") is falsified by AC-1.1/AC-1.2, and `:26-29`'s branch-and-push Git Workflow is falsified by AC-3.8/AC-3.8b, which forbid exactly that branch operation. **F7** — FSPEC §8.4's citation of `harvest-learnings/SKILL.md:70-78` is falsified by the shipped file (the convention is at `:104`). **F2** — the harvest skill's "handed open-promotion list" asserts a hand-off that does not occur.
*Sibling-family sweep:* the {`orchestrate-dev`, `orchestrate-queue`, `consolidate-learnings`} skill+bundle family — the third member's SKILL was not brought into line with its bundle, and the REQ scopes out only *retiring* the manual entry point, not this contradiction. Not covered, not declared out of scope.
*(b) Deferral binding:* clean. Every `D-CONS-*` names `pdlc-engineering-loop`, which has both a `docs/_queue/QUEUE.md` row (row 6) and a REQ file under `docs/`.
**boundary_gaps: 3** (F6 skill contradiction + uncovered sibling; F2 falsified hand-off claim; F7 false FSPEC citation). *Scope: Cross-Feature (F2, F6), Local (F7).*

---

## 4. Recommendation

Not Done. The two that block on their own merits are **F2** (the falsifiability loop's central seam is unconnected, making the feature's headline capability inert) and **F1** (the PR route and duplicate suppression are both broken on the configuration this repo actually ships). **F3** makes an operator-visible number systematically wrong in the reassuring direction. **F5**, **F6**, **F8** follow. **F4** and **F7** are cheap.

## Verdict

VERDICT: Needs revision

DOD_STATUS: failed
{"status":"failed","req_gaps":6,"boundary_gaps":3,"stubs":1,"mock_data":1,"unwired_integrations":3,"coverage_below_threshold":true,"branch_coverage_pct":78.14,"coverage_threshold_pct":85,"property_based_testing":true,"findings":["F1","F2","F3","F4","F5","F6","F7","F8"],"review_file":"docs/pdlc-consolidation-agent/CODE_REVIEW-pdlc-consolidation-agent-v1.md"}
