# CODE REVIEW — pdlc-advisory-wave-gate (v1)

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| Branch | feat-pdlc-advisory-wave-gate |
| Review version | 1 |
| Date | 2026-08-21 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 85.91% (`orchestrate-dev.js`; no new module introduced) |
| Requirements traced | 32/33 |

**Scope note.** PR #66 already merged the bulk of this feature into `main` (`11420461`, the
post-change reading AC-1.1 names). `git diff main…HEAD` over production source is therefore the
erratum round alone: `pdlc/workflows/orchestrate-dev.js` (+90/-4) and its regenerated
`pdlc/workflows/dist/pdlc-cli.mjs`. Criteria 1–4 and 6 were scanned over that diff; criterion 5 was
traced against the **whole** implementation at branch tip, since "done" is a claim about the shipped
feature, not about the tail commit.

**Method.** `pdlc/workflows`: 102 suites / 4162 passed / 70 skipped (none in an advisory or wave
suite — `advisory|waveExecution` alone is 19 suites / 777 passed / 0 skipped). `pdlc/engine`: 21
suites / 845 passed / 2 skipped / 0 failed. `node pdlc/workflows/build-runtime.mjs --check` →
`in-sync`. `git status --porcelain` → clean. Real-config smoke: `.claude/pdlc.config.example.json`
carries `advisory.waveBudgetPerRun: 1` and is parsed by a shipped oracle
(`pdlc/engine/__tests__/advisory-config-example.test.js`), so the new C-2 key is not a token the
production parser rejects.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Requirements traceability (weak oracle) | medium | `pdlc/workflows/__tests__/advisoryWaveGate.test.js:1230`–`1261` | E-20's arm ("a red re-gate (post-wave fails)…") asserts `args.invocations.filter((t) => t === "post-wave").length` **> 0** and `not.toContain("test")`. AC-4.4 states its oracle is **sequence** equality and explicitly rejects the collapsing form: "Set equality is not the unit: it collapses the duplicates and admits a resolution declared on one invocation, the defect this criterion excludes." As written the test stays green if only **one** of the three budgeted attempts actually re-gated — precisely the skipped-re-gate defect AC-4.4 names. The exact sequence is available and used on the sibling arm (`:2011`, `["post-wave","test",…]` ×3; `:2041`, `["test","test"]`). | Replace the two membership assertions with `expect(args.invocations).toEqual(["post-wave", "post-wave", "post-wave"])` (three attempts, each pass truncated at its first failing command per AC-4.4), keeping the `resolved === false` / `waveBudget.resolved === 0` conjuncts. Verify by mutation: capping the re-gate at one attempt must turn the case RED. | Local |
| 2 | Requirements traceability (citation) | low | `docs/pdlc-advisory-wave-gate/FSPEC-*.md:294,296,303,304,311,319,321` | FSPEC error rows **E-16, E-18, E-20, E-21, E-28, E-29, E-31** appear in no test file under `pdlc/workflows/__tests__/`. Each behaviour *is* exercised — via the BR ids the rows delegate to (BR-6/BR-7/BR-8/BR-13) and via AC-3.5 / AC-4.4 / AC-5.1 / AC-6.1 / AC-6.4 — so this is a citation gap, not a delivery gap. The consequence is that an edit to any of those seven rows has no test bound to it by id, unlike the other 31 E-rows. | Add the `E-nn` id to the describe/comment of the block that already covers each row (no new tests). | Process |

No violations of criteria 1–3 in the diff or in the A6 production surface: a full
`TODO|FIXME|XXX|HACK|NotImplemented|pragma: no cover|placeholder|stub|dummy|mock` sweep of
`orchestrate-dev.js` returns only the DoD prompt/parser text at `:7007,:10798–10954,:11338,:15795`,
which is the pipeline's own vocabulary for this document, not deferred work.

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | Seam catalogue carries a sixth member `A6`; every catalogue-driven surface reads six rows | `orchestrate-dev.js` `ADVISORY_SEAMS` / `advisorySummaryRows` | `advisoryRecord.test.js`, `advisoryEnvelope.test.js`, `advisoryQueueSeams.test.js` (set-equality, `toHaveLength(6)`) | No | — | — |
| 2 | REQ AC-1.2 | A6 fires on exactly one condition — a red script-owned test gate | `orchestrate-dev.js:15431`–`15476` (`gateOutcome.failed === "test"` only); `:15409` post-wave halts first | `waveExecution.test.js`, `advisoryWaveGate.test.js:3070` (`["post-wave"]`), `advisoryWaveGateMain.test.js` | No | — | — |
| 3 | REQ AC-1.3 | A6 does not fire on the PROPERTIES V-wave | `orchestrate-dev.js:15672`–`15682` (V-wave gate halts with no seam call) | `waveExecution.test.js`, `advisoryWaveGate.test.js` | No | — | — |
| 4 | REQ AC-1.4 | `advisory.enabled: false` ⇒ provably inert, snapshot included | `orchestrate-dev.js:3424`+ (duplicated tier gate before capture) | `advisoryDisabled.test.js` (PROP-DIS-*), `advisoryWaveGateMain.test.js` | No | — | — |
| 5 | REQ AC-1.5 | Absent prerequisite (BL-03/BL-04) ⇒ inapplicability added to the existing once-per-run notice, mutually exclusive | `orchestrate-dev.js:15178` config-notice hoist | `waveExecution.test.js`, `advisoryWaveGateMain.test.js` (legacy/worktree harness) | No | — | — |
| 6 | REQ AC-2.1 | Existing verdict shape; envelope ∧ high confidence gates action; malformed ⇒ escalation consuming one attempt | `runAdvisorySeam` (`:4014`+), `buildA6SeamOps` (`:3063`+) | `advisoryDriver.test.js`, `advisoryVerdict.test.js`, `parseVerdict.test.js` | No | — | — |
| 7 | REQ AC-2.2 | Closed, **ordered** root-cause set; first match wins; receiving side total | `ADVISORY_ROOT_CAUSES` (`:1956`), `ADVISORY_ROOT_CAUSE_MEANINGS` (`:1961`), `parseA6RootCause` (`:2390`) | `advisoryEnvelope.test.js:334` (ordered deep-equal), `advisoryWaveGateMain.test.js:420`+ (ordered meanings in the **real dispatched prompt**) | No | — | — |
| 8 | REQ AC-2.3 | Diagnosis cites the gate command's own captured output | `buildA6SeamOps` prompt (`:3155`+), verdict evidence check | `advisoryWaveGate.test.js`, `advisoryVerdict.test.js` | No | — | — |
| 9 | REQ AC-2.4 | Escalate on `attemptBudget` / `seamBudgetMinutes` / `waveBudgetPerRun`; only resolutions consume the wave budget; `0` is a valid mode | `runWaveGateSeam` budget arms; `waveBudget.resolved` | `advisoryWaveGate.test.js:1230`+, `:2011`, `advisoryConfig.test.js` | No | — | — |
| 10 | REQ AC-3.1 | Envelope gains exactly E-5 and E-6; one six-member set-equality over ids | `ENVELOPE_DEFAULTS` | `advisoryEnvelope.test.js` | No | — | — |
| 11 | REQ AC-3.2 | Tier exclusion set holds unchanged; clause (a) and clause (e) take precedence over E-5/E-6 | `ADVISORY_EXCLUSIONS`, envelope evaluation in `buildA6SeamOps` | `advisoryEnvelope.test.js`, `advisoryWaveGate.test.js:2476`+ | No | — | — |
| 12 | REQ AC-3.3 | Closed additional exclusions (f)…(i) | `A6_PROHIBITIONS` (`:1975`), `a6ProhibitedPaths` | `advisoryEnvelope.test.js:359`, `advisoryWaveGate.test.js:2476`+ (each letter its own test with paired positive), `advisoryHelperProperties.test.js:388` (fast-check) | No | — | — |
| 13 | REQ AC-3.4 | Refusal reasons drawn from the unchanged eight; diagnosis-only ⇒ no reason | refusal-reason set + escalation entry renderer (`:3848`) | `advisoryEscalationLog.test.js`, `advisoryWaveGate.test.js` | No | — | — |
| 14 | REQ AC-3.5 | Violating proposal: no part survives, wave escalates, not reported resolved | `runWaveGateSeam` refusal path + restore | `advisoryWaveGate.test.js:2476`+, `:2552`+ | No | — | — |
| 15 | REQ AC-4.1 | Gated only on a real gate re-run; three positive conjuncts (i)/(ii)/(iii) | `runWaveGateSeam` step 6 (`invocations` comparison) | `advisoryWaveGate.test.js:2011`, `:2146`, `:2220` | No | — | — |
| 16 | REQ AC-4.2 | A6 never commits | `buildA6SeamOps` exposes no committing transport (`:1978` note) | `commit-sites.test.js` (engine), `advisoryWaveGate.test.js` (BR-8) | No | — | — |
| 17 | REQ AC-4.3 | Never edits a test file/config, the PLAN/manifest, or the implementation config | same enforcement as AC-3.2/AC-3.3 | `advisoryEnvelope.test.js`, `advisoryWaveGate.test.js:2476`+ (letters f, g) | No | — | — |
| 18 | REQ AC-4.4 | Whole gate sequence re-runs in shipped order; oracle is **sequence** equality; each pass truncated at its first failing command | `runWaveGateSequence` + `invocations` (`:3407`–`3409`) | `advisoryWaveGate.test.js:2011` (`[pw,t]×3`), `:2041` (`["test","test"]`), `:2220` (`[pw,t,pw,t]`) — but **the E-20 truncated arm at `:1230` uses a membership oracle, not sequence equality** (§1 #1) | **YES** | medium | Local |
| 19 | REQ AC-4.5 | Each of AC-4.1…AC-4.4 has a failing test proving the prohibition **and** asserting the paired positive outcome | — | `advisoryWaveGate.test.js:2476`+ ("each prohibited operation is refused by its own test, with its paired positive") | No | — | — |
| 20 | REQ AC-4.6 | E-6 repair is committed once the wave's commit step completes; paths + later task named in the record | `groupPromotedPaths` (`:3373`+), the extra `commitPaths` per promoted task (`:15551`+) | `waveExecution.test.js`, `advisoryWaveGate.test.js`, `advisoryRecord.test.js` | No | — | — |
| 21 | REQ AC-5.1 | Refusal / budget exhaustion / red re-gate ⇒ tree observably identical to the pre-A6 state; record carriers excluded; `.gitignore`d paths excluded; uncapturable ⇒ no repair | `captureTreeSnapshot` (`:12641`+), the `read-tree --reset -u` + `clean -fd` restore | `advisoryWaveGate.test.js:485`+, `:1160`, `:1762`+, PROP-REST-01…10 | No | — | — |
| 22 | REQ AC-5.2 | Unresolved ⇒ byte-identical existing halt, same reason, same queue-row write | `orchestrate-dev.js:15475` (`throw haltError(testGateMessage, …)`) | `waveExecution.test.js`, `advisoryWaveGateMain.test.js` | No | — | — |
| 23 | REQ AC-5.3 | Resolved ⇒ normal post-gate path continues, resolution visible in the report | `:15478`–`15490`, `advisorySummaryRows` | `advisoryWaveGateMain.test.js`, `advisoryRecord.test.js` | No | — | — |
| 24 | REQ AC-6.1 | Every invocation appends to the advisory record; failed record write refuses the action | `appendAdvisoryEntry` (`:3717`), called at `:3470` and via the driver | `advisoryRecord.test.js`, `advisoryWaveGateMain.test.js:497` (real transport, `ADVISORY-{feature}.md` created) | No | — | — |
| 25 | REQ AC-6.2 | Every escalation appends to `docs/_queue/ESCALATIONS.md` with the root-cause class and a one-sentence lede | `appendEscalationEntry` (`:3848`) | `advisoryEscalationLog.test.js`, `advisoryWaveGateMain.test.js:498` | No | — | — |
| 26 | REQ AC-6.3 | Halt report carries diagnosis + class; where it points at a captured tree state it warns, **in the same place**, that re-running overwrites the capture | `haltFields.snapshotRef` (`:3625`), `renderSnapshotOverwriteNotice` (`:3866`), pushed at `:3611` (seam's unresolved returns) and `:15516` (un-skip halt); carried out on the report as `notices` / `haltAdvisory` (`:16150`, `:16182`) and printed verbatim by `pdlc/engine/bin/cli.mjs:610`–`632` (`JSON.stringify(stamped)`) | `advisoryWaveGateMain.test.js:411`–`413` (positive, on `result.notices` from the **real** seam; mutation-verified), `:494`–`495` (E-34 negative, whole-array), `waveExecution.test.js:1345`+ (un-skip arm) | No | — | — |
| 27 | REQ AC-6.4 | `plan-ordering-defect` countable per feature from the durable escalation log | escalation-entry class field | `advisoryEscalationLog.test.js` | No | — | — |
| 28 | REQ NFR-1 | Every REQ-AWG-03/04 boundary enforced in the script, never only in a prompt | `runWaveGateSeam` / `buildA6SeamOps` | `advisoryWaveGate.test.js:3099` (BR-1…BR-16 proposable partition) | No | — | — |
| 29 | REQ NFR-2 | Disabled tier ⇒ phase table, phase outcomes and created-file set equal the pre-A6 baseline; `advisory` key **absent** | `:16156` (conditional spread), `:16333` | `advisoryDisabled.test.js` (T-10-3/T-10-4, `toBeUndefined()`) | No | — | — |
| 30 | REQ NFR-3 | No new credential, no new network surface | no new transport in `buildA6SeamOps` | `advisoryDriver.test.js:1015` (dispatch-option parity, member for member) | No | — | — |
| 31 | REQ NFR-4 | No attempt exceeds `seamBudgetMinutes`, dispatch→verdict, deadline restarting each attempt | seam deadline in `runAdvisorySeam` / `runWaveGateSeam` | `advisoryWaveGate.test.js`, `advisoryConfig.test.js` | No | — | — |
| 32 | REQ NFR-5 | No wall-clock cost on a green wave | reachable only from `gateOutcome.failed === "test"` (`:15431`) | `waveExecution.test.js` | No | — | — |
| 33 | REQ NFR-6 | Runs on the tier's existing rung via the tier's exported resolver, no restated literals | `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK`, `dispatchAt(...)` | `advisoryRung.test.js:178`–`212` | No | — | — |

### PROPERTIES

All 86 `PROP-*` ids in `PROPERTIES-pdlc-advisory-wave-gate.md` resolve to at least one test file, and
the two previously-thin ones are now oracle-backed: `PROP-NFR-04` at
`advisoryWaveGate.test.js:3331` (module-scope datum check — itself raised by an earlier CODE_REVIEW
round, §2 row 29) and `PROP-ENV-10` at `advisoryHelperProperties.test.js:388` (generative,
fast-check). Property-based coverage exists for the parameterisable helpers
(`advisoryHelperProperties.test.js`); the rest of the A6 surface is a stateful driver, not a
parameterisable pure function, so table-driven fixtures are the right unit.

### Criterion 6 — integration boundary

Clean; `boundary_gaps: 0`.

- **Adjacent surfaces.** `pdlc/OPERATIONS.md:63`–`72` (the A6 seam paragraph and the config-key
  list, including `waveBudgetPerRun`) and `pdlc/RELEASE-CHECKLIST.md` remain true after the diff —
  the erratum adds a prompt rendering and a notice, and changes no behaviour either document
  discloses. `docs/_constraints/pdlc-wave-gate-baseline.md` was updated in the same branch.
  `CLAUDE.md`'s `pdlc/workflows/dist/` rebuild-and-stage rule (DEC-08) is honoured:
  `build-runtime.mjs --check` reports `in-sync`.
- **Multi-writer sweep on the traced artifact.** The AC-6.3 warning rides `notices`, which has many
  writers (`:13186`…`:16120`). All of them **push**; nothing reassigns or truncates the array, and
  `buildFinalReport` passes it through by reference (`:16276`, `:16316`), so no later writer can
  clobber the A6 element. The oracle at `advisoryWaveGateMain.test.js:411` selects by content rather
  than by index, which survives the interleaving.
- **Same-shape sibling family.** The `_now`-injection family: `main`'s `_now` parameter carries no
  default (`:13020`), so every callee must default its own. Enumerated — `raisePrAndVerifyCi`
  (`:11434`), `phaseMerge`, `runAdvisorySeam` (`:4014`) and now `runWaveGateSeam` (`:3412`) — all
  four default it. `runWaveGateSeam` was the sole outlier and is closed; no sibling remains
  unhandled. (See Notes for a hardening suggestion, not a finding.)
- **Snapshot-ref literal.** `refs/pdlc/a6-snapshot-${waveNum}` is written at `:12675` and re-derived
  at `:3603`. Both sides are pinned by the same spec-side literal in tests
  (`advisoryWaveGate.test.js:506`, `:1800`; `advisoryWaveGateMain.test.js:411`), so a rename that
  desynchronised the pointer from the ref would go red.
- **Deferral binding.** All seven REQ §10 deferrals (D-AWG-01…D-AWG-06, incl. 03b) and all four
  queue-owned obligations (O-2, O-6, O-7 → `pdlc-engineering-loop`; D-AWG-03b → `pdlc-wave-resume`)
  name successors that exist as live rows in `docs/_queue/QUEUE.md` — row 6
  (`docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md`) and row 20
  (`docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`). O-1, O-4, O-5 and O-8 are bound to this
  feature's own TSPEC and are discharged there. No unbound deferral.

## Notes

- **Remediation order.** Finding #1 is the only one that changes an oracle; do it first and
  mutation-verify it (cap the re-gate loop at one attempt — the case must go RED). Finding #2 is a
  comment/label edit with no behavioural risk.
- **Coverage margin.** `orchestrate-dev.js` sits at 85.91% branch — over the bar, but by 0.91 points
  on a 16,336-line module. `orchestrate-queue.js` (76.76%) and several `__tests__/helpers/*` are
  below 85% but are untouched by this feature and out of scope for this review.
- **Hardening, not a finding.** Defaulting `_now` at `main`'s own signature (`:13020`) would close
  the whole injected-clock family at the root rather than one callee at a time, and would make the
  next seam added to `main` immune to the defect TE F-02 found. Every current sibling already
  defaults, so nothing is broken today; this is a suggestion for a successor REQ, not a gap.
- **Prior rounds.** This is v1 for the post-#66 erratum branch, but not the feature's first
  CODE_REVIEW — `advisoryWaveGate.test.js:3312` cites "CODE_REVIEW v1 §2 row 29" from a
  pre-merge round whose file was harvested and deleted in Phase H, as the artifact convention
  requires. That earlier finding is verified closed at `:3331`.
