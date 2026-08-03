# CODE REVIEW — pdlc-merge-phase (v2)

| Field | Detail |
|---|---|
| Feature | pdlc-merge-phase |
| Branch | feat-pdlc-merge-phase |
| Review version | 2 |
| Date | 2026-08-02 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 85.58% (`orchestrate-queue.js`); `orchestrate-dev.js` 85.94% — unchanged, no production source was touched |
| Requirements traced | 50/50 |

**Scope:** delta re-verify of the v1 findings at HEAD
`4cdf501ca73f6c2b040aa1e5a4bdf4fa2d92e10f`. The remediation diff under scan is
`git diff 479efa5..HEAD` — commit `4cdf501` (findings 2–8) plus the out-of-band consumer sync
(finding 1, which touches only the untracked `.claude/workflows/` tree). Nine files, +42/−23,
all of them **test or documentation**: `CLAUDE.md`, `README.md`, `docs/_queue/QUEUE.md`,
`pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md`, and the four
`__tests__/{dod,harvest,impl,ship}Phase.test.js`. **No production source file changed**, so
per the SKILL's v2 protocol criteria 1–4 are not re-scanned over unchanged code; the §2
traceability table is carried forward from v1 unaltered.

**Counts:** stubs 0 · mock_data 0 · unwired_integrations 0 · coverage_below_threshold false ·
req_gaps 0 · boundary_gaps 1.

## §1 v1 Finding Remediation

| v1 # | Finding | Remediation verified | Evidence | Closed? |
|---|---|---|---|---|
| 1 | Consumer runtime copy stale — Phase MERGE unreachable, queue drift gate would refuse | Plain `sync-workflows.sh` run by the orchestrator | I re-ran `pdlc/hooks/scripts/sync-workflows.sh --check` myself at this HEAD: **exit 0**, no warning lines. `build-runtime.mjs --check` also still exit 0, so the built artifacts and the consumer copy now agree | **Yes** |
| 2 | Four vacuous `QUEUE_ROW_DOMAIN` transcriptions | All four now `import { QUEUE_ROW_DISPOSITIONS } from "../orchestrate-queue.js"` and assign it directly — `dodPhase.test.js:11,535`, `harvestPhase.test.js:10,152`, `implPhase.test.js:13,558`, `shipPhase.test.js:12,523` | **Verified by mutation, not by reading.** I replaced `"none"` with `"NONE_MUTATED"` in the real catalogue (`orchestrate-queue.js:92`) and re-ran the four suites: **4 failed / 4 total**, one per file, each the `RLH-REPORT-01-*` domain assertion. Source restored (`git status` clean). The assertions are now falsifiable across a rename, which is exactly what v1 said they were not | **Yes** |
| 3 | `orchestrate-queue/SKILL.md` lifecycle: "human merges", "the skill never sets `done`" | Diagram at `:109` now reads `awaiting-merge ──Phase MERGE merges, or a human merges the PR──▶ done`; the `awaiting-merge` bullet (`:118`–`:120`) and the `done` bullet (`:131`–`:135`) both name Phase MERGE and both state `mergeMode` ships `off` | Grep for `never merged` / `never auto-merged` across the six doc sites returns **no matches**. The rewritten bullets are accurate against `orchestrate-queue.js:1026`–`:1027` and `orchestrate-dev.js:1421` | **Yes** |
| 4 | `orchestrate-dev/SKILL.md:34` phase sequence ended at Phase PUB | Sequence extended with `→ Merge & Advance Queue (Phase MERGE)`; a new `## Merge & Advance Queue (Phase MERGE)` section added at `:67` | Sequence now matches `build-runtime.mjs:161`'s `meta.phases` and `orchestrate-dev.js:6589`. The 100-line budget held: `wc -l` = **97**, and `orchestrateDevSkill.test.js:34` (`PROP-SKILL-06`) is green — the Model Selection section was compacted to pay for the new one, losing no fact (both model constants and the Phase I/Sonnet rule survive in one sentence) | **Yes** (see new finding 1 for a wording defect inside the new section) |
| 5 | `CLAUDE.md:171` "never auto-merged"; no Phase MERGE entry | Sentence now ends "merging, if it happens, is Phase MERGE's job, next"; a new Phase MERGE bullet added at `:172` | Accurate on every checkable claim: `mergeMode` ladder and `off` default (`orchestrate-dev.js:54`, `:60`), the four guard defaults (`:47`), the `mergeStatus` domain (`:55`), the `Evidence` cell (`:1420`, `orchestrate-queue.js:502`) | **Yes** (see new finding 1) |
| 6 | `CLAUDE.md:168` retired `"halted (uncommitted)"` disposition | Now reads `"recorded (uncommitted)"`, with an added parenthetical enumerating the full disposition catalogue and distinguishing it from the `status` value written | Matches `orchestrate-queue.js:89`–`:94`, `:1173`, `:1183`, `:1197`. The `status` stays `halted` on that path, which the new parenthetical says explicitly | **Yes** |
| 7 | `README.md:35`, `:42` "never auto-merged" / "never merged" | Diagram gains a `Phase MERGE` row at `:34`; the trailing line reads "merged if mergeMode opts in, else a human merges it"; the prose at `:43` states the `off` default and the guard, and points at QUEUE.md's Bootstrapping note | Accurate; the guard claim ("never merges a PR that touches the pipeline's own workflow/skill surfaces, whatever `mergeMode` is set to") matches the ladder's guard-before-mode-independent position (`orchestrate-dev.js:826`, and `mergePhase.test.js:717`'s `PROP-M-06` dominance property) | **Yes** |
| 8 | `docs/_queue/QUEUE.md:4`–`:7` header prose | Rewritten at `:5`–`:9`: the driver "runs `orchestrate-dev`, which now ends in Phase MERGE: if it merges the PR the row goes straight to `done`, otherwise it leaves the row `awaiting-merge` for a human", with a pointer to §Bootstrapping | §Bootstrapping is intact and unmodified (`git diff` shows the header hunk only) — its item 2, which already predicted the guard firing on every row of this queue, is now the cross-reference the header leans on | **Yes** |

All eight v1 findings are closed. Findings 1 and 2 were verified by re-execution and by mutation
respectively, not by reading the remediation commit message.

## §1b New Findings in the Remediation Diff

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification (new prose) | low | `pdlc/skills/orchestrate-dev/SKILL.md:68`; `CLAUDE.md:172` | Both new Phase MERGE descriptions over-claim the escalation contract. SKILL: "otherwise it reports `deferred`/`refused` as a `MERGE ESCALATION:` notice". CLAUDE.md: "any failure is reported as a `MERGE ESCALATION:` notice rather than a halt". Neither is true. AC-6.2a names exactly four escalating conditions, and the code agrees: escalations are emitted only for a guard match (`orchestrate-dev.js:828`), a guard-unretrievable list (`:840`), CI `none` with `mergeRequiresCi` (`:870`), and post-merge queue/tree failures (`:1428`, `:1461`). **Every `deferred` row and most `refused` rows carry `escalations: []`** and exactly one plain note (`:1374`, `MERGE_NOTES.mergeDeferred`) — an operator told to grep `MERGE ESCALATION:` will find nothing on a CI-pending or not-mergeable deferral. Secondary, same two sentences: the SKILL's "**Six** preconditions gate a merge" then lists a six that is not AC-1.2's six — it substitutes `mergeMode` and idempotence (which are ladder rows 2 and 3, not preconditions) and **omits unresolved review threads**, a real AC-1.2 precondition with its own GraphQL observation (`:549`) | Two sentence-level edits, no code change. (a) Scope the escalation claim: escalations are raised for the guard, for CI-absent-when-required, and for a post-merge queue-write or working-tree failure; other `deferred` / `refused` outcomes are reported as a plain note naming the condition. (b) In the SKILL, either drop the count ("preconditions gate a merge — …") or make the enumeration AC-1.2's: PR exists, PR open, CI evidence, mergeable, no unresolved review threads, guard | Cross-Feature |

Nothing else in the remediation diff introduces a violation. The four test edits add an import
and re-point one constant each — no new stub, no mock data, no assertion weakened (the mutation
run proves the opposite). The five documentation edits introduce no other claim that the code
contradicts; I checked each new sentence against the implementation rather than against the
specs.

## §2 Requirements Traceability

Carried forward from `CODE_REVIEW-pdlc-merge-phase-v1.md` §2 **unchanged**: all 50 rows
(REQ-MERGE-01 AC-1.1 … REQ-MERGE-07 AC-7.3, plus NFR-1…NFR-5) still trace to both a production
path and a falsifiable test, and the `Gap?` column is `No` on every row. No row is updated,
because the remediation touched no production source and no merge-surface test — the four test
files it did touch belong to the Phase DOD / H / I / PUB report contract, not to any
REQ-MERGE criterion. `req_gaps: 0`.

The one row worth re-stating, because it is the row most likely to be mis-read as a gap: **AC-7.2,
`mergeMode` ships `off`** (`orchestrate-dev.js:60`; no `.claude/pdlc.config.json` in this repo).
That is the specified shipped state, and all five rewritten doc sites now say so explicitly —
which is a small improvement on v1, where the default was correct in code and undocumented
outside the feature's own specs.

## Notes

**Suite state is unchanged and clean.** `cd pdlc/workflows && npm test` → 61/62 suites,
**2941 passed, 1 failed, 70 skipped** — byte-identical counts to the v1 run. The single red is
still `documentOracles.test.js:246` reporting the untracked `.tokensave/tokensave.db`, the
environmental false positive CLAUDE.md documents and PLAN §8 K-6 pre-registers. Notably the
remediation touched five files the `coveredViolations` document-drift oracle walks (including
`pdlc/skills/orchestrate-dev/SKILL.md`, named at `documentOracles.test.js:238`) and produced no
new oracle violation.

**PLAN §8 K-1 remains correctly open.** The two-runner `git --version` reading is still deferred
to the first CI run and read in Phase DOD/PUB, per the PLAN's own text; nothing in the
remediation diff touched `updateDefaultBranch` (`orchestrate-dev.js:1117`) or the unconditional
`--empty=drop` at `:1164`. The v1 assessment stands: the deferral is recorded in four places,
the fallback is pre-approved, and the failure mode is fail-safe (an AC-5.7 escalation, never a
wrong merge decision).

**Deferral bindings unchanged.** D-MERGE-01/02 → queue row 14 (`docs/_queue/QUEUE.md:27`),
D-MERGE-04/05 → row 16 (`:29`), D-MERGE-03 declined by design. The QUEUE.md header rewrite did
not touch the table or §Bootstrapping, so both bindings are intact.

**One advisory, deliberately not filed as a finding.** `CLAUDE.md:167` still describes the queue
status lifecycle as "`pending → in-progress → awaiting-merge → done` (human sets `done` after
merge)" without qualification. Read alone it is now incomplete — but the new Phase MERGE bullet
five lines below it says "superseding the human-merge step above" in as many words, so the
document is self-consistent and a reader is routed correctly. Folding the qualifier into `:167`
would be tidier; it is not a false claim as the document stands, and I am not spending a
remediation round on it. Recorded here so the next reviewer does not re-derive the question.

**Ordering hint for the remediator.** New finding 1 is two sentence edits in two files, both
already open in the same paragraph the last round rewrote. There is no code change, no test
change, and no rebuild — `pdlc/workflows/dist/` is untouched by this round and
`build-runtime.mjs --check` is green.
