# CODE REVIEW — pdlc-merge-phase (v1)

| Field | Detail |
|---|---|
| Feature | pdlc-merge-phase |
| Branch | feat-pdlc-merge-phase |
| Review version | 1 |
| Date | 2026-08-02 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 85.58% (`orchestrate-queue.js`); `orchestrate-dev.js` 85.94% |
| Requirements traced | 50/50 |

**Scope:** `git diff origin/main...HEAD` at HEAD `2788d6fd2379002e71bbf1111df7cbf94da7ec8c`
(`origin/main` is an ancestor — the branch is rebased). Production surfaces scanned:
`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`,
`pdlc/workflows/runtime-adapter.js`, `pdlc/workflows/build-runtime.mjs`, and the generated
artifacts under `pdlc/workflows/dist/`. Adjacent surfaces swept for criterion 6:
`CLAUDE.md`, `README.md`, `pdlc/README.md`, `pdlc/skills/*/SKILL.md`, `docs/_queue/QUEUE.md`,
`docs/pdlc-merge-phase/CR-ERRATA.md`, and the four non-merge phase test files that carry a
`QUEUE_ROW_DOMAIN` constant.

**Counts:** stubs 0 · mock_data 0 · unwired_integrations 1 · coverage_below_threshold false ·
req_gaps 0 · boundary_gaps 7.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Unwired integration | medium | `.claude/workflows/` (consumer copy) | `pdlc/hooks/scripts/sync-workflows.sh --check` exits **1** at this HEAD: the untracked consumer copy still holds the pre-merge-phase bundles, so `phaseMerge` is present in `pdlc/workflows/dist/` but **not reachable from the runtime**, and `orchestrate-queue`'s drift gate will refuse the next queue invocation before `QUEUE.md` is read. `build-runtime.mjs --check` is green — only the consumer install step is outstanding (PLAN §10 V1's consumer-sync step) | Run `pdlc/hooks/scripts/sync-workflows.sh` (plain, no `--force` needed) and confirm `--check` exits 0. No source change | Process |
| 2 | Stale closed-domain oracle | low | `__tests__/dodPhase.test.js:534`, `__tests__/harvestPhase.test.js:151`, `__tests__/implPhase.test.js:557`, `__tests__/shipPhase.test.js:522` | `const QUEUE_ROW_DOMAIN = ["halted", "halted (uncommitted)", "none", "error"]` — the retired catalogue. The rename to `QUEUE_ROW_DISPOSITIONS` (`orchestrate-queue.js:89`) landed and `helpers/seams.js`'s docblock was updated, but these four call-site copies were not. They still pass only because `recordingRecordQueueRow`'s default returns `{queueRow:"none"}`, which is in both domains — the assertions are now **vacuous**, not wrong-and-red | Point all four at the exported `QUEUE_ROW_DISPOSITIONS`, or update the literals to `["recorded", "recorded (uncommitted)", "none", "error"]`. Prefer the import — that is what makes the next rename red instead of silent | Cross-Feature |
| 3 | Adjacent-surface falsification | medium | `pdlc/skills/orchestrate-queue/SKILL.md:109`, `:117`, `:128`–`:130` | The shipped skill prompt states the lifecycle as `awaiting-merge ──(human merges PR)──▶ done`, "The skill **never** sets `done`", and "`done` is set by a **human** after merging the PR". AC-5.6 is implemented (`orchestrate-queue.js:1026`–`:1027`: `newStatus = merged ? "done" : …`), so all three sentences are false on the merged path. This is the highest-severity member of the family: it is a prompt an agent reads, not only operator prose | Rewrite the lifecycle block: `done` is written by the driver when the pipeline reports `mergeStatus: "merged"`, and by a human otherwise. State the `mergeMode: "off"` default so the human path stays documented as today's shipped behaviour | Cross-Feature |
| 4 | Adjacent-surface falsification | medium | `pdlc/skills/orchestrate-dev/SKILL.md:34` | The phase sequence ends `… → Harvest → Raise PR & Verify CI`. Phase MERGE now runs after Phase PUB and is the last phase (`orchestrate-dev.js:6589`–`:6620`); `build-runtime.mjs:161` already added the row to the bundle's operator-visible `meta.phases`, so the SKILL is the one place the list is stale | Append `→ Merge & Advance Queue (Phase MERGE)` to the sequence and add a short Phase MERGE section alongside the Phase DOD / Phase PUB ones | Cross-Feature |
| 5 | Adjacent-surface falsification | medium | `CLAUDE.md:171` | "The PR is never auto-merged — `awaiting-merge` → `done` remains a human step." False as of this diff. `CLAUDE.md` also carries no Phase MERGE row in its artifact-convention / entry-point section, so a reader has no pointer to `mergeMode` or the guard | Correct the sentence and add a Phase MERGE bullet mirroring the Phase DOD / Phase PUB ones — naming `mergeMode` (ships `off`), the four default guard paths, and `mergeStatus` ∈ {merged, deferred, refused, skipped} | Cross-Feature |
| 6 | Adjacent-surface falsification | medium | `CLAUDE.md:168` | "A git refusal … yields `\"halted (uncommitted)\"`". The disposition catalogue was renamed: `commitQueueRow` now returns `"recorded"` (`orchestrate-queue.js:1173`, `:1183`) and `uncommitted` returns `"recorded (uncommitted)"` (`:1197`). Same paragraph's `queueRow: "none"` / `"error"` values are still correct | Replace the two `halted*` disposition strings with `recorded` / `recorded (uncommitted)`, and note that the disposition describes the row *write*, not the status written | Cross-Feature |
| 7 | Adjacent-surface falsification | low | `README.md:35`, `README.md:42` | The pipeline diagram ends "PR open, checks green — **never auto-merged**" and the prose repeats "The PR is raised but **never merged** by the pipeline: `awaiting-merge` → `done` is a human step" | Add the Phase MERGE row to the diagram and qualify the prose: the pipeline can merge, `mergeMode` ships `off`, and the self-modification guard makes `refused` permanent in this repo (REQ §6 BL-04) | Cross-Feature |
| 8 | Adjacent-surface falsification | low | `docs/_queue/QUEUE.md:4`–`:7` | The header prose says the driver "runs `orchestrate-dev`, then leaves it `awaiting-merge`. A human sets `done` after merging the PR." Falsified by the same `orchestrate-queue.js:1026` write-back. (The §Bootstrapping note at the file's foot *is* already correct — it anticipates the guard firing on every row of this queue) | One-sentence correction in the header, cross-referencing the Bootstrapping note that already explains why this repo's own rows will always report `refused` | Cross-Feature |

Findings 3–8 are the criterion-6(a) stale-disclosure family sweep of one claim — "the pipeline
never merges" — which this diff falsifies in six places. Finding 2 is a seventh
criterion-6 finding (a stale oracle rather than a stale disclosure). Together they are the
`boundary_gaps: 7` value. Finding 1 is the sole criterion-2 finding and is the
`unwired_integrations: 1` value; it is a one-command remediation with no source change.

**No criterion-1 finding.** Every `TODO` / `placeholder` / `stub` hit in the four production
sources is either an English word inside a docblock (`orchestrate-dev.js:1072`, `:3597`,
`:4520`, `orchestrate-queue.js:555`) or the literal text of the `dod-verify` prompt this very
skill is dispatched with (`orchestrate-dev.js:5190`–`:5232`) — none is deferred work. Every new
function body was read: no hollow bodies, no `return null` stand-ins. `decideMerge`
(`:755`) is a 25-row guard ladder with a resolved value on every path; `phaseMerge` (`:1281`)
carries a total outer `catch` that maps any throw to `row: "internal"` rather than propagating.

**No criterion-3 finding.** No `mock*` / `fake*` / seed data in production paths. Every literal
in the merge surface is a closed catalogue or a shipped default:
`MERGE_GUARD_DEFAULTS` (`:47`), `MERGE_MODES` (`:54`), `MERGE_DEFAULTS` (`:59`),
`OBSERVATION_REASONS` (`:205`), `PR_STATE_VALUES` / `MERGEABLE_VALUES` /
`MERGE_STATE_STATUS_VALUES` (`:214`–`:225`), `MERGE_NOTES` (`:1194`),
`MERGE_ESCALATIONS` (`:1241`), `QUEUE_ROW_DISPOSITIONS` (`orchestrate-queue.js:89`) — each
`Object.freeze`d, each exercised by a membership test. `MERGE_MAX_DECISION_STEPS` (`:83`) is a
derived expression, not a magic number. No `localhost` / `example.com` / placeholder URL: every
`gh` command string is built in one audited function, `mergeCommandFor` (`:238`).

**Criterion 4.** Measured with `npm test -- --coverage
--collectCoverageFrom='{orchestrate-dev,orchestrate-queue,runtime-adapter}.js'`:
`orchestrate-dev.js` **85.94%** branch / 92.32% stmt, `orchestrate-queue.js` **85.58%** branch /
93.78% stmt — both above the 85% bar, and both are whole-module figures that include a great deal
of pre-existing pipeline code, so the merge surface's own share is higher. `runtime-adapter.js`
reports 0% because it is never `import`ed (the build inlines it); `mergeAdapter.test.js:43`–`:120`
drives `rtGhRun` through `adapterHarness`, covering the label, the at-most-once instruction, both
JSON arms and the unparseable-reply fallback, plus `rtDevInjections._ghRun === rtGhRun` at `:39`.
Property-based coverage is present and heavy on every parameterisable module: `mergeDecision.test.js`
enumerates the decision core (`PROP-M-01`…`PROP-M-05`, `PROP-M-21`, 838-call purity check at `:548`),
`mergeGuard.test.js:338` checks prefix-exactness against an independent reference predicate, and
`mergeConfig.test.js:276` checks config totality.

**Suite state.** `cd pdlc/workflows && npm test` → 61/62 suites green, 2941 passed. The single red is
`documentOracles.test.js:246` (`coveredViolations(LIVE_ROOT)`) reporting the untracked
`.tokensave/tokensave.db` — the environmental false positive CLAUDE.md documents and PLAN §8 K-6
pre-registers. Not a finding; green in CI.

## §2 Requirements Traceability

All paths below are `pdlc/workflows/`-relative unless prefixed. Test paths are
`pdlc/workflows/__tests__/`-relative.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | Phase MERGE runs after PUB, last phase | `orchestrate-dev.js:6589` (after the PUB block, inside `pipelineFn`) | `mergePhase.test.js:154`; `pipelineWiring.test.js` | No | — | — |
| 2 | REQ AC-1.2 | Six preconditions, each from its named surface | `orchestrate-dev.js:755` (`decideMerge` guard ladder) | `mergeDecision.test.js:482`, `:780` | No | — | — |
| 3 | REQ AC-1.2a | Bounded `UNKNOWN` re-reads, then defer | `orchestrate-dev.js:889` (`o1Count` vs `mergeableRetries`), `:1362` (`_sleep(d.waitMs)`) | `mergeObservations.test.js:893`; `mergeDecision.test.js:505` | No | — | — |
| 4 | REQ AC-1.2b | Unretrievable/unparseable ⇒ failed precondition | `orchestrate-dev.js:205` (`OBSERVATION_REASONS`), `:300`–`:493` (six `classify*`, all fail-closed) | `mergeObservations.test.js:184`–`:529` | No | — | — |
| 5 | REQ AC-1.3 | Non-merge ⇒ outcome `success`, no queue commit | `orchestrate-dev.js:1372`–`:1384` (`queueRow: null`), `:6604` (glyph never ❌) | `mergePhase.test.js:485`; `haltAndQueue.test.js` | No | — | — |
| 6 | REQ AC-1.4 | `PHASE_MERGE_ENABLED = false` ⇒ `skipped`, no config read | `orchestrate-dev.js:39`, `:1309` (returns before the read at `:1322`), `:5773` | `mergePhase.test.js:154` (row 1) | No | — | — |
| 7 | REQ AC-1.5 | `off`/`gated`/`on`; no precondition-bypass mode | `orchestrate-dev.js:54`, `:1327`, `:757` | `mergeDecision.test.js:620` (`PROP-M-04`: gated ≡ on over 209 cases) | No | — | — |
| 8 | REQ AC-1.6 | Ordered decision table, first resolver wins | `orchestrate-dev.js:755`–`:1010` (rows 1–25, ordered) | `mergeDecision.test.js:46` (`ROW_IDS` 25 unique), `:780`; `mergePhase.test.js:154` | No | — | — |
| 9 | REQ AC-2.1 | Rebase attempted first | `orchestrate-dev.js:728` (`mergeCandidates` order), `:251` (`gh pr merge --rebase`) | `mergeDecision.test.js:693`; `mergeObservations.test.js:39` | No | — | — |
| 10 | REQ AC-2.2 | Merge commit as the single fallback | `orchestrate-dev.js:731` | `mergeDecision.test.js:693`; `mergePhase.test.js:154` | No | — | — |
| 11 | REQ AC-2.3 | Chain exhausted ⇒ stop, `deferred`, no halt | `orchestrate-dev.js:970` (row) + `:1372` (shared non-merge shape) | `mergeDecision.test.js:780`; `mergePhase.test.js:664` | No | — | — |
| 12 | REQ AC-2.4 | Squash absent unless `allowSquashMerge === true` | `orchestrate-dev.js:732` (strict equality, both conjuncts) | `mergeDecision.test.js:693` (`PROP-M-11`, enum(40)) | No | — | — |
| 13 | REQ AC-2.5 | Forbidden methods skipped, not attempted | `orchestrate-dev.js:728`–`:734` (chain built from `caps`) | `mergeDecision.test.js:693` | No | — | — |
| 14 | REQ AC-2.5a | Capability query unreadable ⇒ refused | `orchestrate-dev.js:366` (`classifyRepoCaps`, all fields required), `:929` | `mergeObservations.test.js:338`, `:779` | No | — | — |
| 15 | REQ AC-2.5b | Empty chain ⇒ `deferred`, distinct reason | `orchestrate-dev.js:941` | `mergeDecision.test.js:780` | No | — | — |
| 16 | REQ AC-2.6 | Remote branch deleted when configured; local untouched | `orchestrate-dev.js:1094` (`deleteRemoteBranch`), gated at `:1400` | `mergePostMerge.test.js` (`deleteRemoteBranch` block) | No | — | — |
| 17 | REQ AC-2.6a | Delete failure ⇒ note, never downgrades `merged` | `orchestrate-dev.js:1402` (`notes.push`, not `escalations`) | `mergePhase.test.js:829` (`PROP-M-16`, post-merge power set) | No | — | — |
| 18 | REQ AC-3.1 | Guard refuses on any matched path | `orchestrate-dev.js:651` (`guardVerdict`), `:826` | `mergeGuard.test.js:119`; `mergePhase.test.js:717` (`PROP-M-06` dominance) | No | — | — |
| 19 | REQ AC-3.2 | Escalation names every matched path + PR | `orchestrate-dev.js:828`, `:1242` (`MERGE_ESCALATIONS.guard`) | `mergePhase.test.js:613`, `:985` | No | — | — |
| 20 | REQ AC-3.3 | Additive config; defaults unremovable | `orchestrate-dev.js:628` (`effectiveGuardPaths`, union, never filters defaults) | `mergeGuard.test.js:54`, `:258` (`PROP-M-07`) | No | — | — |
| 21 | REQ AC-3.4 | Unretrievable changed-file list ⇒ guard fires | `orchestrate-dev.js:652` (`changed.ok !== true` ⇒ `fired: true`), `:838` | `mergeGuard.test.js:119` | No | — | — |
| 22 | REQ AC-3.5 | Two-arm falsifiability by construction | `orchestrate-dev.js:655` (`startsWith` over the file list) | `mergeGuard.test.js:184` (AT-M3 arms A/B); `mergePhase.test.js:613` | No | — | — |
| 23 | REQ AC-3.6 | Case-sensitive, `/`-delimited prefix, incl. renames | `orchestrate-dev.js:630` (trailing-`/` normalisation), `:655`; `:462` (`previous_filename` collected) | `mergeGuard.test.js:338` (`PROP-M-08`); `mergeObservations.test.js:406` | No | — | — |
| 24 | REQ AC-3.7 | Consumers extend via config; `.claude/workflows/` default | `orchestrate-dev.js:47` (fourth default) | `mergeGuard.test.js:54` | No | — | — |
| 25 | REQ AC-4.0 | CI re-read at merge time, not inherited | `orchestrate-dev.js:537` (`observeCi` — its own `_ghRun` call), demanded at `:862` | `mergeObservations.test.js:619`; `mergePhase.test.js:154` | No | — | — |
| 26 | REQ AC-4.1 | `passed` satisfies | `orchestrate-dev.js:680` | `mergeDecision.test.js:720` (5×2 matrix) | No | — | — |
| 27 | REQ AC-4.2 | `no-checks` + `mergeRequiresCi` ⇒ refused + escalation | `orchestrate-dev.js:681`–`:689`, escalation at `:870` / `:1243` | `mergeDecision.test.js:720`; `mergePhase.test.js:985` | No | — | — |
| 28 | REQ AC-4.3 | `mergeRequiresCi: false` ⇒ `no-checks` passes | `orchestrate-dev.js:690` | `mergeDecision.test.js:720` | No | — | — |
| 29 | REQ AC-4.4 | `failed` / `pending` / unparseable ⇒ refused | `orchestrate-dev.js:692`–`:704` | `mergeDecision.test.js:720` | No | — | — |
| 30 | REQ AC-5.1 | Merge ⇒ row written to `done` | `orchestrate-dev.js:1421` (`_recordQueueRow({status:"done", evidence})`) | `mergeQueueWriteback.test.js:45`; `mergeQueueDriver.test.js:70` | No | — | — |
| 31 | REQ AC-5.2 | Queue write failure ⇒ escalation, not a halt | `orchestrate-dev.js:1423`–`:1435`, `:1246` | `mergePhase.test.js:648` (AT-M6), `:829` | No | — | — |
| 32 | REQ AC-5.3 | Only the target row changes; two permitted structural edits | `orchestrate-queue.js:502` (`ensureEvidenceColumn` — splice-append only), `:434` | `mergeQueueWriteback.test.js:45` | No | — | — |
| 33 | REQ AC-5.4 | No `QUEUE.md` ⇒ merge proceeds, write-back skipped | `orchestrate-queue.js:1099`–`:1101` (`queueRow: "none"`) | `mergeQueueWriteback.test.js:187`; `mergePhase.test.js:485` | No | — | — |
| 34 | REQ AC-5.5 | Sixth `Evidence` cell; `Status` stays the bare token `done` | `orchestrate-dev.js:1078` (`evidenceCellFor`); `orchestrate-queue.js:502`, `:564` | `mergeQueueWriteback.test.js:45`, `:130` | No | — | — |
| 35 | REQ AC-5.6 | Driver records `done`, suppresses the human-merge message | `orchestrate-queue.js:1026`–`:1027`, `:1038` | `mergeQueueDriver.test.js:70` (AT-M4) | No | — | — |
| 36 | REQ AC-5.7 | Tree left on the updated default branch; else escalate, stay `merged` | `orchestrate-dev.js:1117` (`updateDefaultBranch`), `:1409`, `:1460`, `:1248` | `mergePostMerge.test.js`; `mergePhase.test.js:829` | No | — | — |
| 37 | REQ AC-5.8 | Idempotent re-attempt against an already-merged PR | `orchestrate-dev.js:806` (row 3), `:1416`–`:1458`; `orchestrate-queue.js:358` non-overwrite rule at `:447` | `mergePhase.test.js:593` (AT-M2a) | No | — | — |
| 38 | REQ AC-6.1 | `mergeStatus` + SHA + method on the report | `orchestrate-dev.js:6721`–`:6723`, `:6809` (default `skipped`) | `mergePhase.test.js:485` (`PROP-M-17`); `mergeQueueDriver.test.js:172` | No | — | — |
| 39 | REQ AC-6.1a | Exactly one status per run, per the 25-row table | `orchestrate-dev.js:755`–`:1010` | `mergeDecision.test.js:46`, `:505`, `:567` (`PROP-M-03`) | No | — | — |
| 40 | REQ AC-6.2 | One-line reason; outcome stays `success` | `orchestrate-dev.js:1374`, `:6612`–`:6620` | `mergePhase.test.js:485` | No | — | — |
| 41 | REQ AC-6.2a | `MERGE ESCALATION: ` prefix in the notices channel | `orchestrate-dev.js:1241` (frozen catalogue), `:6602` | `mergePhase.test.js:985` (`PROP-M-19` closure) | No | — | — |
| 42 | REQ AC-6.3 | Dependent selected next pass iff this row is `done` | `orchestrate-queue.js:1027`, `:583` (`selectNextPending`), `:630` | `mergeQueueDriver.test.js:212` (AT-M5, both halves) | No | — | — |
| 43 | REQ AC-7.1 | Setting inventory: home, default, owner | `orchestrate-dev.js:39`, `:43`, `:59`–`:67`, `:101` | `mergeConfig.test.js:56`, `:156` | No | — | — |
| 44 | REQ AC-7.2 | `mergeMode` ships `off` | `orchestrate-dev.js:60`; no `.claude/pdlc.config.json` exists in this repo, so `parseMergeConfig(null)` returns `MERGE_DEFAULTS` (`:104`) and Phase MERGE resolves row 2 `skipped` | `mergeConfig.test.js:103` (E1), `:56` | No | — | — |
| 45 | REQ AC-7.3 | Absent/unreadable/out-of-domain ⇒ per-key default | `orchestrate-dev.js:101`–`:151` (independent fallback), `:181` (`readMergeConfigSafely` swallows throws) | `mergeConfig.test.js:103`–`:298` (E1–E5, `PROP-M-09`, `PROP-M-10`) | No | — | — |
| 46 | REQ NFR-1 | No LLM judgment in the decision | `runtime-adapter.js:959` (`rtGhRun` transports only; the module builds every command at `orchestrate-dev.js:238` and parses every reply at `:300`–`:493`) | `mergeAdapter.test.js:43`; `mergeDecision.test.js:548` (purity) | No | — | — |
| 47 | REQ NFR-2 | No state-mutating call before every precondition resolves | `orchestrate-dev.js:1354`–`:1365` (only `act` issues `executeMerge`, and only after the ladder demands it) | `mergePhase.test.js:925` (`PROP-M-18`) | No | — | — |
| 48 | REQ NFR-3 | Guard has no override of any kind | `orchestrate-dev.js:628`–`:657` (no config/env/argv read in either body) | `mergeGuard.test.js:224` (source scan) | No | — | — |
| 49 | REQ NFR-4 | No new reasoning dispatch | `orchestrate-dev.js:1281`–`:1493` (no `_agent` parameter at all) | PLAN §11 checkbox; `mergePhase.test.js:1063` (seam enumeration) | No | — | — |
| 50 | REQ NFR-5 | Idempotent against an already-merged PR | `orchestrate-dev.js:806` (row 3: no merge, no guard, write-back still runs) | `mergePhase.test.js:593` | No | — | — |

No row is a gap: every AC resolves to both a production path and a test that could fail.
`req_gaps: 0`.

## Notes

**REQ-MERGE-07 / AC-7.2 — `mergeMode: "off"` is the specified shipped state, not a coverage gap.**
`MERGE_DEFAULTS.mergeMode` is `"off"` (`orchestrate-dev.js:60`), this repo carries no
`.claude/pdlc.config.json`, and `parseMergeConfig(null)` returns the frozen defaults, so
Phase MERGE resolves row 2 (`skipped`) on every run here until an operator opts in. That is
exactly what AC-7.2 asks for — "a repository that installs this feature does not begin
auto-merging until its operator opts in" — and REQ §6 BL-04 pre-registers the consequence:
the `merged` path cannot be exercised end-to-end in `yumo-plugins` because REQ-MERGE-03's
guard fires on every PR this queue raises (`pdlc/workflows/` and `pdlc/skills/` are two of the
four defaults). The `merged` path is therefore evidenced by tests driving the observation
points directly — `mergePhase.test.js:154`'s row table plus `mergeQueueDriver.test.js:212`'s
two-invocation selection test — which is the evidence standard the REQ itself specifies.
The remediator should **not** "fix" this by shipping `gated`.

**REQ-MERGE-05 / AC-5.1 in a real `gh`-authenticated environment.** The write-back is wired
end to end and is reachable: `phaseMerge` calls the injected `_recordQueueRow`
(`orchestrate-dev.js:1421`), `main()` supplies it from `defaultRecordQueueRow`
(`:5780`), and both bundle entrypoints close over `__queue.rewriteStatus` with the new
seventh `evidence` argument (`build-runtime.mjs:186`, `:219`). `_ghRun` is threaded the same
way — `rtDevInjections` at `runtime-adapter.js:1030`, `main()` parameter at
`orchestrate-dev.js:5781`, call site at `:6593`. What has **not** been observed is a live
`gh`-authenticated run, and it cannot be here (guard, above). Finding 1 is the only thing
standing between the shipped bytes and a consumer runtime that could perform one.

**PLAN §8 K-1 (git ≥ 2.26) — the deferral is recorded, and nothing is silently assumed.**
PLAN §8 row K-1, §10 step 5, §11's checklist box and §12's evidence line all state the same
thing: the local reading is `2.50.1 (Apple Git-155)`, the two-runner (`ubuntu-latest` /
`macos-latest`) reading is deferred to the first CI run during Phase DOD/PUB, and the fallback
to plain `git rebase FETCH_HEAD` is **pre-approved with no re-review** should either runner be
older. The code issues `git rebase --empty=drop FETCH_HEAD` unconditionally
(`orchestrate-dev.js:1164`). Two observations for the record, neither a finding:
(a) the fallback is a *pre-approved edit*, not a runtime branch — there is no version probe in
the code, by design, because DC-02 bars inferring the platform fact and the pre-approval is what
makes the edit cheap; (b) the failure mode if the assumption were false is fail-safe, not
merge-unsafe: `rebase` returns `!ok`, `updateDefaultBranch` aborts the rebase
(`:1166`) and returns `{ok:false, reason, branch}`, which becomes an AC-5.7 escalation while
`mergeStatus` stays `merged` (`:1460`–`:1467`). No merge decision depends on the git version.
Leave K-1 open until the first CI run records both readings.

**Deferral bindings (criterion 6b) — bound, with one deliberate exception.** REQ §7:
D-MERGE-01 and D-MERGE-02 → `pdlc-advisory-tier`, which is **queue row 14**
(`docs/_queue/QUEUE.md:27`, `pending`, `Depends-On: pdlc-merge-phase`). D-MERGE-04 and
D-MERGE-05 → `pdlc-engineering-loop`, **queue row 16** (`:29`, `pending`, depends on this
feature). Both successor REQ paths are named in the table and both rows pre-exist this diff.
D-MERGE-03 (merge queues / batched merges) binds to `—` by design: the REQ's own rationale is
that a serial queue makes it unnecessary at current scale, i.e. it is a declined item, not
deferred work awaiting an owner. Recorded here rather than counted as an unbound deferral.

**CR-ERRATA items have a home.** `docs/pdlc-merge-phase/CR-ERRATA.md` carries three advisory
items, all document-shaped and all correctly routed: items 1 and 2 are TSPEC-revision errata
(§5.3's guard 22/23 ordering table, §2.4's `row: number | string`) explicitly marked "do not
change the code" — the shipped behaviour was verified correct against FSPEC §6.2 and NFR-2
during this scan (`orchestrate-dev.js:977`–`:996`), and every row id is a string
(`:1299`). Item 3 is routed to LEARNINGS as the one residual gap between US-05's promise and
the §2.5 non-overwrite case (`orchestrate-queue.js:447`, note at `orchestrate-dev.js:1456`),
which FSPEC §7.4 / §11 row 18 sanction. The file is a tracked process artifact and will be
picked up by Phase H harvest alongside the cross-reviews — no queue row needed.

**Ordering hint for the remediator.** Finding 1 first (one command, unblocks the next queue
invocation), then finding 3 (a shipped skill prompt — the only stale surface an agent reads),
then 4–8 as one documentation commit, then finding 2 (four one-line test edits, ideally an
import of `QUEUE_ROW_DISPOSITIONS` so the next rename is red rather than vacuous). None of the
eight requires a change to the merge decision core, the guard, or the queue-write helpers.
