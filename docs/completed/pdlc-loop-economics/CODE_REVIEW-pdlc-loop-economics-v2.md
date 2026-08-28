---
Feature: pdlc-loop-economics
Author: dod-verify
Version: 2
Date: 2026-08-28
Branch: feat-pdlc-loop-economics
Scope: Local
---

# CODE REVIEW — pdlc-loop-economics (v2, re-verification round)

| | |
|---|---|
| Verdict | **Findings** |
| Findings | 4 open (High 0, Medium 0, Low 4) — 2 accepted, 1 carried unverifiable, 1 new |
| v1 findings resolved | 5 of 8 (F-1, F-2, F-3, F-5, F-7) |
| Branch coverage (aggregate) | 88.88% |
| Branch coverage (lowest module) | 87.73% (`pdlc/workflows/lib/escalation-view.mjs`) — every module ≥ 85% |
| `orchestrate-dev.js` | 97.59% stmt / 88.74% branch / 95.59% func |
| Requirements traced | 10/10 REQ criteria delivered (was 8/10) |
| Suites | `pdlc/workflows`: 154 suites — 153 passed, **1 failed** (`waveResumePreflight.test.js`, = F-4); 5019 passed / 1 failed / 70 skipped. `pdlc/engine`: 891 tests, 889 pass / 0 fail / 2 skipped (exit 0) |
| `build-runtime.mjs --check` | exit 0 — `pdlc/workflows/dist/pdlc-cli.mjs` in sync |
| Guard paths | `pdlc/engine/`, `pdlc/skills/`, `pdlc/hooks/` all clean (`git status --porcelain` empty) — REQ NG-2 / NG-3 hold |

**Round-2 method.** Per the re-verification contract, this is a delta round: each v1
finding was traced to a production code path *and* to a test that would fail if the fix
were reverted; the round-2 code delta was then scanned for new stubs, mock data, unwired
integrations and boundary gaps. The six-criteria scan was **not** re-run wholesale.

**Scope note (unchanged from v1).** The change is still entirely uncommitted:
`main..HEAD` carries exactly one commit (`146e2b3ba`, the PROPERTIES doc). The
remediation delta is therefore not isolable by `git diff` between review rounds; each
fix was verified by reading the current working tree against the v1 finding text.

---

## §1 Disposition of v1 findings

| v1 # | Disposition | Evidence |
|---|---|---|
| **F-1** (PASS re-anchor is a guaranteed no-op) | **RESOLVED** | `appendApprovalAnchors` (`pdlc/workflows/orchestrate-dev.js:9859`) gained an explicit `refreshUpstreamState` parameter (`:9876`, default `false`) and a `_writeFile` seam. The `existing[0] === hash` limb (`:9921`) no longer unconditionally short-circuits: in refresh mode it re-reads the file, calls the new `refreshUpstreamStateText` (`:7806`) and writes back (`:9951`). The rewrite is **in place** and respects both reader contracts named in the finding — it replaces the stale `UPSTREAM-STATE:` rows where they stand rather than appending a second anchor block, so `parseApprovalHash`'s first-wins row selection and `approvalAnchorPreCount`'s `>= 2 ⇒ ambiguous` rule both still see exactly one `APPROVAL-HASH:` line (asserted at `loopEconomicsPinCascade.test.js:740-741`). The sole caller passing `refreshUpstreamState: true` is the pin-check PASS route (`orchestrate-dev.js:15546`). **Kill-the-loop test exists and is load-bearing:** `loopEconomicsPinCascade.test.js:562-618` drives the full pipeline, parses the produced file through the *shipped* `parseApprovalHash`, and asserts the `TSPEC` row equals the **edited** TSPEC's hash and that the stale hash is absent — i.e. the next staleness walk cannot re-flag. `:620-659` then re-runs the pipeline and asserts the PASS route is a **fixed point** (`again.changed === false`), so the fix does not trade one loop for another. Fail-open is pinned too (`:793` — a throwing `_writeFile` emits and leaves the run alive). |
| **F-2** (REQ-LOOPECON-02 had no production implementation) | **RESOLVED** | The open-finding ledger is now **production and un-gated**. `reviewLoop` declares `openFindings` at `orchestrate-dev.js:9285` and runs `classifyRoundFindings(openFindings, roundFindings)` at `:9643` **outside** any `derivativeStopEnabled` check (`:9625-9669`); the M3 gate moved to the *consumers* only (`strictVerdict` `:9676`, `derivativeStopFired` `:9684`), which is what REQ G-1's "M1 always-on, no config gate" requires. The erratum/cascade confirmation channel carries the same accounting (`:16224-16255`), with a per-target ledger threaded through `erratumRound`'s `openFindings` parameter (`:15708`) from a caller-scoped `targetOpenFindings` array (`:16544`, `:16559`) so it spans a target's follow-up attempts. Falsifying tests: `loopEconomicsFindingIdentity.test.js:548-687` drives `reviewLoop` itself with **no `derivativeStop` config at all**, asserts exactly one carried-notice naming `REQ-LOOPECON-02`, and pins the array count (`Open findings: 3` — three, not four, for two rounds × two findings); `erratumProtocol.test.js:1216-1225` pins the erratum-channel notice byte-exactly on a default-config run. Byte-identity with M3 off is separately pinned (`loopEconomicsFindingIdentity.test.js:654` — the returned record still carries no `derivativeStop` key), and `loopEconomicsBaselineGuard.test.js` (committed merge-base fixtures) is green, so the un-gating did not move the baseline dispatch stream. |
| **F-3** (OPERATIONS.md sentence falsified by F-1) | **RESOLVED** | `pdlc/OPERATIONS.md`'s pin-cascade bullet now describes the shipped mechanism accurately: a `PASS` re-stamps the recorded `UPSTREAM-STATE` **in place**, explicitly noting readers are first-wins and that a duplicated block would read as unevaluable. The matching operator notice at `orchestrate-dev.js:15552-15558` now states the same thing ("recorded upstream pin has been re-stamped … the staleness walk will not flag it again"), so prose and runtime notice agree with code. |
| **F-4** (`waveResumePreflight` literal vs shipped example config) | **ACCEPTED — pre-existing, Cross-Feature. STILL OPEN, and confirmed as the only red.** | `EXPECTED_TEST_COMMAND` at `pdlc/workflows/__tests__/waveResumePreflight.test.js:45` is still the hand-transcribed literal without the `(cd pdlc/engine && npm test) && ` prefix, while `.claude/pdlc.config.example.json` (and this machine's untracked `.claude/pdlc.config.json`) both carry it. Verified live this round: `npm run test:coverage` is **exit 0** overall but reports `1 failed` suite, and it is exactly this one (`run-precondition: … testCommand string-equals the §3.4 transcribed literal`). No other suite in the workflows or engine runs is red. **The CI-vacuity is documented, not fixed:** the file is untracked in a fresh CI clone, so the assertion degrades to `process.env.GITHUB_ACTIONS === "true"` and passes without exercising anything. Accepting this means accepting that the wave gate's config-drift guard is green in CI for a reason unrelated to config drift. Fix remains: derive the literal from `.claude/pdlc.config.example.json`. |
| **F-5** (PLAN §9's `assertNoLiveGitWrites` obligation unmet) | **RESOLVED** | The guard is now imported and used in 7 of the 9 new suites, including both files the finding named as reachable seams: `loopEconomicsAnchorGuard.test.js` and `loopEconomicsFindingIdentity.test.js` (the latter installs a `fakeGit` recorder and drains it in `afterEach`, `:615-624`). The two exclusions — `loopEconomicsConfig.test.js` and `loopEconomicsPreflight.test.js` — are **sound**: `grep` for any `git` token in either file returns nothing at all, so neither constructs, injects or reaches a git seam; a leak guard there would assert over an empty set, which is the vacuous-probe shape the un-skip discipline warns against. |
| **F-6** (`pdlc/README.md` / `CLAUDE.md` omit the two new config keys) | **ACCEPTED — advisory. STILL OPEN.** | Re-checked this round: `grep -n "pinCheck\|derivativeStop\|cascade"` over `pdlc/README.md` and `CLAUDE.md` returns nothing. README's config disclosure still documents only `learningsInjection`. `pdlc/OPERATIONS.md` does carry both keys with full fail-open semantics, which is where T-16 assigns the authoritative disclosure, so the operator can find the truth — the README is a stale *summary*, not a false statement. Deliberate advisory accept. |
| **F-7** (upstream state derived before the pin-check round trip) | **RESOLVED** | Pass 2 now re-derives at dispatch-construction time: `const { upstreamState } = await deriveUpstreamState(downstream, …)` sits inside the `for (const c of candidates)` loop at `orchestrate-dev.js:15582`, *after* the pin-check `parallelFn` round trip (`:15498`), and that freshly-derived value is what `cascadeConfirmPrompt` renders and what the anchor records. The PASS route re-derives independently at `:15530`. **Falsifying test exists for the previously-unexercised limb:** `loopEconomicsAnchorFreshness.test.js:496` (`F-7 — pin-check-ENABLED cascade re-derives upstream state at dispatch construction`) covers the pin-check-**enabled** path the v1 finding called out as untested, and `:540` pins the F-1 + F-7 interaction (a PASS re-stamps to the *edited* TSPEC's hash, which is only obtainable from the re-derived value — a pass-1 snapshot would answer with the stale hash). |
| **F-8** (whole change uncommitted; PLAN §9 commit shape unverifiable) | **STILL OPEN** | `git status --porcelain` still shows 9 modified + 12 untracked paths; `main..HEAD` is still the single PROPERTIES commit `146e2b3ba`. The two mechanical facts are green *in the tree* — `build-runtime.mjs --check` exits 0 and `pdlc/.claude-plugin/plugin.json` is at `0.23.6` (bumped from `0.23.5`) — but PLAN §9's obligations are about **commit shape** ("`dist/` staged in the same commit as the workflow-source change", "`version` bumped in the landing commit") and cannot be verified against a history that does not yet contain the change. Unchanged from v1; closes at Phase PUB. |

---

## §2 New findings (round-2 delta scan)

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| F-9 | 4 / 5 | low | `pdlc/workflows/__tests__/loopEconomicsFindingIdentity.test.js:434-448`, `:459-509`; `docs/completed/pdlc-loop-economics/PROPERTIES-pdlc-loop-economics.md:129-133` | **PROP-LOOPECON-06/07's property oracle is not falsifying for the dedup logic it claims to guard.** `simulateOpenFindingList` accumulates into a `Map` keyed by `findingIdentityKey` and guards each insert with `if (!open.has(key))`. Because the `Map` deduplicates by construction, the property's assertions (`open.size`, and `[...open.keys()].filter(k => k === staleKey).length === 1`) *cannot* exceed 1 no matter what `classifyRoundFindings` returns. Verified by mutation: replacing the classifier with a total-failure stub (`{ added: curr, carried: [], resolved: [] }` — nothing is ever carried) still yields `open.size === 1`, so the property stays green through a complete loss of the accounting under test. What the property does prove is `findingIdentityKey`'s **normalisation** (round/hash noise collapses to one key) — which is real and valuable, but is not what PROPERTIES claims. The doc's own words are the falsified surface: *"Oracle is a positive count assertion … an off-by-one duplicate on round 2 alone must still fail this property."* It would not. Mitigating: after F-2 the **production** ledger is an array, and `loopEconomicsFindingIdentity.test.js:651` (`Open findings: 3`) plus `erratumProtocol.test.js:1225` (`Open findings: 3.`) are genuine count assertions over it, so REQ-LOOPECON-02 itself is not vacuous — hence `low`, not `high`. | Re-point the `fast-check` property at the production accounting rather than the model: either accumulate into an **array** (`open.push(...added)` with `classifyRoundFindings(open, curr)`, mirroring `orchestrate-dev.js:9643-9644`) so a mis-classification actually grows the count, or drive `reviewLoop` under the generator the way the F-2 scenario does. Alternatively, correct PROPERTIES §PROP-LOOPECON-07's oracle sentence to claim only what the `Map` model can falsify. | Local |

**Round-2 delta scan, otherwise clean.** The added production lines contain no
`TODO`/`FIXME`/`HACK`/`XXX`, no `NotImplementedError`/`throw new Error("not implemented")`,
no `mock*`/`fake*`/`dummy*` identifiers, no `Math.random()`, and no `localhost` /
`example.com` URLs (grep over `git diff HEAD -- pdlc/workflows/orchestrate-dev.js`
restricted to added lines returns nothing). Criteria 1–3: no violations. Every new IO
call is `await`ed (`await _readFile`, `await _writeFile`, `await deriveUpstreamState`).

---

## §3 Traceability (carried forward from v1; rows 3 and 6 updated)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-LOOPECON-01a | Anchor set-equality, sole writer | `orchestrate-dev.js:9818` | `loopEconomicsAnchorGuard.test.js:134,138,160,171,197` | No | — | — |
| 2 | REQ-LOOPECON-01b | Upstream state re-derived at dispatch construction | `orchestrate-dev.js:15582` (pass 2), `:15530` (PASS route) | `loopEconomicsAnchorFreshness.test.js:252,270,316,496,540` | No (was: F-7) | — | — |
| 3 | REQ-LOOPECON-02 | Carried finding mints no second open entry | **`orchestrate-dev.js:9285,9643-9669`** (ungated `reviewLoop` ledger); **`:16224-16255`** (erratum channel); threaded via `:15708`, `:16544` | `loopEconomicsFindingIdentity.test.js:548-687` (production, M3 off); `erratumProtocol.test.js:1216-1225` | **No** (was: **YES/high**) | — | — |
| 4 | REQ-LOOPECON-03 | Carried/new classification on exact triple, order-independent | `orchestrate-dev.js:188` `normalizeFindingText`, `:210` `findingIdentityKey`, `:6766` `classifyRoundFindings` | `loopEconomicsFindingIdentity.test.js` (both-direction normalisation, shuffle-invariance, resolved bucket `:514-535`) | No | — | — |
| 5 | REQ-LOOPECON-04 | Pin-check disabled ⇒ dispatch stream byte-identical | `orchestrate-dev.js:15296-15302` | `loopEconomicsBaselineGuard.test.js` (committed merge-base fixtures); `loopEconomicsPinCascade.test.js:411,419,428,436` | No | — | — |
| 6 | REQ-LOOPECON-05 | Own-bytes-unchanged batch; PASS **re-anchors**; FAIL re-confirms | `orchestrate-dev.js:15503-15561` — PASS branch now re-stamps via `appendApprovalAnchors({ refreshUpstreamState: true, _writeFile })` (`:15546`) → `refreshUpstreamStateText` (`:7806`); FAIL falls through `:15564` | `loopEconomicsPinCascade.test.js:562-618` (re-anchor asserted through shipped reader), `:620-659` (fixed point), `:709-791` (rewrite contract), `:793` (fail-open) | **No** (was: **YES/high**) | — | — |
| 7 | REQ-LOOPECON-06 | Derivative-stop on N flat rounds, never on open High | `orchestrate-dev.js:9684`, `:9576`, `:16465` | `loopEconomicsDerivativeStop.test.js:115,237,274,308,333,637` | No | — | — |
| 8 | REQ-LOOPECON-07 | Enabled M3 suspends the high-only shortcut; disabled M3 byte-identical | `orchestrate-dev.js:9676` `strictVerdict` | `loopEconomicsDerivativeStop.test.js:390,439,492`; `loopEconomicsBaselineGuard.test.js` (`PHASE-T-REVIEW-ROUNDS`) | No | — | — |
| 9 | REQ-LOOPECON-08 | Per-key fail-open config parse | `orchestrate-dev.js:32,51,102` | `loopEconomicsConfig.test.js` (PROP-LOOPECON-12 cross-product) | No | — | — |
| 10 | REQ-LOOPECON-09 | DoD round index disk-derived, resume-safe | `deriveDodRoundIndex` `:682`; `dodVerifyLoop` `:12670-12729`; `_listFiles` threaded from `main()` `:17706` | `loopEconomicsDodRoundIndex.test.js:39,82,89,157` | No | — | — |
| P | PROP-LOOPECON-06 / -07 | Staleness re-filing mints exactly one entry | `orchestrate-dev.js:9643-9644` (array ledger) | `loopEconomicsFindingIdentity.test.js:450-509` — **property oracle non-falsifying (F-9)**; production count pinned at `:651` | Partial | low | Local |

---

## §4 Integration-boundary notes

- **Adjacent-surface falsification:** F-3 closed (`pdlc/OPERATIONS.md` re-worded to match the
  in-place re-stamp, and the runtime notice at `orchestrate-dev.js:15552` agrees). F-6 open
  and accepted (`pdlc/README.md`, `CLAUDE.md`). F-9 is a *new* adjacent-surface falsification
  in the other direction: PROPERTIES §PROP-LOOPECON-07's oracle sentence is falsified by the
  test it describes.
- **Sibling-surface sweep:** both census oracles were updated in step with the feature and
  re-run green — `dispatchableSkills.test.js` 15→16 indirect-dispatch positions (the batched
  pin-check dispatch), `documentOracles.test.js` `loopEconomics*` namespace note. The second
  `reviewLoop` call site (`orchestrate-dev.js:17616`, Phase CR) is a **declared** omission,
  not a gap: `pdlc/OPERATIONS.md` now states in prose that Phase CR's own loop does not
  participate in derivative-stop because `recordPhase` hardcodes `Approved`.
- **Un-swept sibling in the round-2 delta:** the ungated ledger was added at the two review
  channels that emit the `FINDING:` grammar (`reviewLoop`, erratum confirmation). No third
  emitter exists — `grep` for `parseConfirmationFindings` finds only these call sites.
- **Deferral binding:** REQ NG-2's deferral (deleting three vestigial SKILL.md sentences)
  is still named "a permitted follow-up outside this feature" with **no queue row and no
  successor REQ**. As in v1: scoped out in the REQ rather than deferred-with-a-successor,
  so criterion 6(b) accepts it. Flagged, not counted.
- **Guard paths intact:** `pdlc/engine/`, `pdlc/skills/`, `pdlc/hooks/` unmodified, and the
  engine suite is green independently (889 pass), so the vendored-workflows channel is
  unaffected by the round-2 delta.

---

## §5 Note for the remediator

Five of eight v1 findings are genuinely closed, each with a test that goes red if the fix
is reverted — F-1 and F-2 in particular are now backed by production paths rather than
test-local models, which was the substance of both findings.

What remains does **not** describe broken behaviour:

- **F-8** is the only mechanical blocker, and it closes by landing the change (Phase PUB).
  Nothing to implement.
- **F-4** and **F-6** are accepted, and both are one-line fixes if the round is cheap:
  F-4 wants `EXPECTED_TEST_COMMAND` derived from `.claude/pdlc.config.example.json` rather
  than transcribed; F-6 wants the two new config keys named in `pdlc/README.md`.
- **F-9** is the one new item worth an edit. Prefer changing the *test* over changing the
  *doc*: swapping the model's `Map` for an array that mirrors `orchestrate-dev.js:9643-9644`
  turns a currently-decorative property into a real one, and costs about four lines.

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 88, "req_gaps": 1, "boundary_gaps": 2}
