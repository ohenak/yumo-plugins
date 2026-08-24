# CODE REVIEW — pdlc-wave-resume (v3)

| Field | Detail |
|---|---|
| Feature | pdlc-wave-resume |
| Branch | feat-pdlc-wave-resume |
| Review version | 3 |
| Date | 2026-08-24 |
| Verdict | Pass |
| Branch coverage (lowest new module) | 94.44% (`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`) |
| Requirements traced | 21/21 |

**Scan basis.** Delta re-verify, not a full re-scan. Exactly one remediation commit since v2:
`b89a5cd0` *"docs(pdlc-wave-resume): TSPEC v1.5 — head-carrying mismatch fixtures, mutation 4 kill
conjunction"* — **one file, +16/-9, documentation only**. No production source, no test and no
config changed; `orchestrate-dev.js`, `orchestrate-queue.js`, `waveExecution.test.js` and
`dist/pdlc-cli.mjs` are byte-identical to their v2 state.

Re-measured in this tree at the branch tip, independently of the commit message's claims:
`npm test` → **123 suites, 4503 passed, 0 failed** (identical to v2). `npm run test:coverage` →
**exit 0**, `check-wave-resume-delta-coverage.mjs` **100 % stmt / 94.44 % branch / 100 % funcs**,
`orchestrate-dev.js` 88.87 % branch, delta gate `uncovered 0 — OK`.
`node pdlc/workflows/build-runtime.mjs --check` → `in-sync`. Working tree clean.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|

(Empty. The remediation diff is a single Markdown file. Grepping its added lines for
`todo|fixme|deferred|follow-up|successor|placeholder|stub|mock` returns nothing, so it introduces no
stub, no mock data, no unwired integration and no new deferral — bound or otherwise. Coverage is
unchanged because no instrumented file moved.)

## §2 Requirements Traceability

Carried forward from v2 unchanged. The remediation touched no row: `b89a5cd0` corrects prose in
TSPEC §5.4/§5.5 and re-measures no criterion. Rows 12–15 and 21 — the ones v2 flipped from YES to
No — were re-confirmed green by this review's own suite and coverage runs.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-WVR-01 | Automatic resume at the failed wave | `orchestrate-dev.js:16259-16289` | `waveExecution.test.js:2279` | No | — | — |
| 2 | REQ-WVR-02 IG-1..5 | Foreign/stale record → announced full run | `classifyWaveLedger` guards 2–6 | `waveExecution.test.js`; `waveResume.test.js` | No | — | — |
| 3 | REQ-WVR-02 IG-6 | Absent record → **silent** full run | guard 1 (`silent: true`) | `waveExecution.test.js:2988` | No | — | — |
| 4 | REQ-WVR-03 | Verification independence (gate before first commit) | wave loop gate ordering | `waveExecution.test.js:2556-2582` | No | — | — |
| 5 | REQ-WVR-04 | Operator override outranks the record | `orchestrate-dev.js:16217` + `if (!explicitPointer)` | `waveExecution.test.js:2758` | No | — | — |
| 6 | REQ-WVR-05 | Retention with invalidation | record left standing on skip | `waveExecution.test.js:2347`, `:2358` | No | — | — |
| 7 | REQ-WVR-06 | Completion evidence is never commit presence | write keyed on transport | `waveExecution.test.js:3044` | No | — | — |
| 8 | REQ-WVR-07 | Unattended queue parity | `orchestrate-queue` `_runPipeline` default | `waveResumeQueueParity.test.js` | No | — | — |
| 9 | REQ-WVR-08 | All waves recorded → Phase I skipped in full | `skip-phase` arm + `⏭` report row | `waveExecution.test.js:2358` | No | — | — |
| 10 | REQ-WVR-09 | Verified-but-uncommitted is never recorded | write guarded on git transport | `waveExecution.test.js:2669` | No | — | — |
| 11 | REQ-WVR-10 (repo half) | The record never becomes tracked content | `.gitignore:46` | `waveResumeRepoState.test.js:76` | No | — | — |
| 12 | PROP-REPO-03 (REQ-WVR-10 run half) | No commit a run produces may contain the record | Emergent (no wave owns the path) | `waveExecution.test.js:2358-2384` | No | — | — |
| 13 | PROP-SKIP-04 | Outcome (c): flattened `add` argv set-equal to `[]` + positive branch-guard conjunct | `orchestrate-dev.js` skip arm | `waveExecution.test.js:2429-2439` | No | — | — |
| 14 | PROP-COV-03 | Five TSPEC §5.5 mutations applied, observed RED, reverted, output recorded | n/a (process duty) | `MUTATION-EVIDENCE-pdlc-wave-resume.md` + `waveResumeRepoState.test.js:392-416` | No | — | — |
| 15 | PROP-PARITY-04 | Queue-parity falsification arm executed and recorded | n/a (process duty) | Same artifact, `## PROP-PARITY-04` | No | — | — |
| 16 | PROP-PRE-01/-02 | Pre-flight export/key/config gate | exports + `package.json` | `waveResumePreflight.test.js` | No | — | — |
| 17 | PROP-LAW-01..04 | Round-trip, totality, hash discrimination | `parseWaveLedger`/`formatWaveLedger`/`classifyWaveLedger`/`computePlanHash` | `waveResumeProperties.test.js` (`numRuns: 500`) | No | — | — |
| 18 | PROP-DISREGARD-07/-08/-09 | Probe laziness, zero-probe honouring, unanswerable probe | `headCorroborated` + `ANCESTRY_INDEPENDENT_CODES` | `waveExecution.test.js:2472`, `:2519`, `:2585` | No | — | — |
| 19 | PROP-DISREGARD-11 | Announcement catalogue closed at five rows | §2.4 suffixes | `waveExecution.test.js:3068` | No | — | — |
| 20 | PROP-REPO-04 | `M-WVR-1`/`M-WVR-2` promoted with version bump | `docs/_constraints/pdlc-wave-gate-baseline.md` §5 | `waveResumeRepoState.test.js` | No | — | — |
| 21 | PROP-COV-01/-02 | `test:coverage` exits 0; no uncovered line in introduced ranges | `scripts/check-wave-resume-delta-coverage.mjs` | Re-measured this round: exit 0, delta gate 0 uncovered, gate module 94.44 % branch | No | — | — |

## §3 Prior-Finding Remediation Verdicts

| v2 # | Finding | Verified remediated? | Evidence bar met |
|---|---|---|---|
| B-5 | TSPEC §5.4's `feature-mismatch` / `plan-changed` rows omitted the `head` the shipped fixtures carry; AT-03's gloss re-planted the trap | **Yes — verified against code and fixtures, not against the commit message** | Both halves of the required fix landed. §5.4:781-782 now read "**`head` present**" with the reason ("the `head` is what makes the zero-probe conjunct falsifiable"), mirroring PROPERTIES v1.6's twin table. §5.4's grammar is now uniform: every one of the four well-formed rows states its `head` disposition, so the silence B-5 flagged is gone. AT-03's gloss at `:755` gained the clause. **The new claim was checked against the implementation**, not taken on trust: `orchestrate-dev.js:16243` is `if (!recordedHead) return true;` — the first statement of `headCorroborated`, before `branchGuardTransport(gitFn)` is even called, so "returns before touching the transport when the record has no `head`" is exactly true. **And against the shipped fixtures**: `waveExecution.test.js:2856` defines `DISREGARDED_HEAD = "c".repeat(40)` and `:2887`/`:2899` place it on the `other-feat` and `planHash: "00000000"` records — the two rows TSPEC now describes — each still carrying `expectedMergeBaseCalls` `[]`. The document now matches the code and the tests it describes |
| B-6 | §5.5 attributed mutation 4's kill wholly to the `toEqual` matcher, which the remediation's own measurement falsified | **Yes — numbers re-checked against the cited artifact** | §5.5:798-808 restates the kill as an explicit **conjunction** — `toEqual` on the filtered list **and** an ancestry-independent fixture carrying a `head` — and adds "Neither conjunct suffices alone", naming both failing cases (`toContainEqual`; `toEqual([])` on a head-less fixture). It is now sourced rather than asserted: the cited figures were verified line-by-line against `MUTATION-EVIDENCE-pdlc-wave-resume.md` — "surviving on first application (212 passed, 0 failed)" matches `:113` and the `:29` baseline; "killed (2 failed / 210 passed)" matches the row-4 verdict at `:39`. The closing sentence now makes **both** the matcher and the fixture shape load-bearing, which is the belief a future implementer needs to rebuild these fixtures correctly |

## §4 Integration-Boundary Findings — new, introduced by the remediation diff (criterion 6)

**None.** The sweeps performed:

- **Stale-disclosure family sweep (the check that produced v2's own findings).** The mutation-4
  kill-attribution family was enumerated by grep across all feature docs and the suite, not just the
  nearest occurrence: `PROPERTIES:311-312`, `PROPERTIES:335` (PROP-DISREGARD-07),
  `PROPERTIES:447-455`, `PLAN:385`, `PLAN:401` (§4.3 row 4), `PLAN:404-408`,
  `DECISIONS:114`, `DECISIONS:414`, and `waveExecution.test.js:2556`, `:2860-2865`. Each was read in
  full and checked for a claim the measurement falsifies. **Every one is individually true.** The
  members that name the matcher (`PLAN:385`, `PROPERTIES:311`, `PROPERTIES:335`, both `DECISIONS`
  lines) assert only that `toEqual` is load-bearing and that `toContainEqual` passes under the
  mutation — both true, and none claims the matcher is *sufficient*, which was the precise defect in
  the old §5.5. `PLAN:401`'s "`toEqual` only" is the parallel matcher-discipline phrasing used
  throughout, and PLAN §4.3 explicitly defers to TSPEC §5.5 for the mutation account — now corrected.
  PROPERTIES carries the corrected account outright at `:447-455`, including the measured survival.
  The family is materially consistent; no sibling was left behind.
- **Other writers / later overwrites.** `MUTATION-EVIDENCE-pdlc-wave-resume.md` still has exactly one
  writer; the diff adds two readers (`TSPEC:755`, `:806`) alongside the existing `PROPERTIES:451` and
  the mechanical one at `waveResumeRepoState.test.js:395`. No later stage overwrites it, and its
  oracle test passes.
- **Re-measured recorded derivations.** The two figures the diff newly records (212/0 and 2/210) were
  re-derived from the artifact rather than trusted. Document versions are coherent: TSPEC is bumped
  1.4 → 1.5 with an erratum revision row, PROPERTIES is 1.6 — the version TSPEC's new text cites.
  `grep "Version | 1.4"` across the feature's non-review docs returns nothing, so no cross-reference
  went stale behind the bump. TSPEC is 982 lines and under no recorded byte or line budget
  (`docs/_constraints/` records none for it, and the REQ-size hook governs `REQ-*` only).
- **Sibling surfaces.** `PLAN:490-491`'s laziness checklist was re-read once more under the corrected
  account and remains true — the two mismatch fixtures still expect zero `merge-base` calls; the
  `head` changes why that assertion is falsifiable, not what it asserts.
- **Deferral binding.** The diff introduces no deferral; the grep over its added lines is empty.
  v2's B-2 closure ("closed at `1`", no successor owed) is untouched.

## Notes

- The remediation is minimal and correctly scoped: two prose corrections to the single document that
  v2 identified as teaching the wrong belief, plus the revision row. It changed no production source,
  no test and no oracle, so the 4503-test suite and the delta-coverage gate are byte-for-byte the
  same measurements v2 recorded — as they should be for a documentation erratum.
- Both findings were verified against primary evidence rather than the commit message: B-5 against
  `headCorroborated`'s actual first statement and the actual fixture literals, B-6 against the line
  numbers of the artifact it cites. Neither claim was accepted on assertion.
- No new finding is raised. The mutation-4 family sweep — the exact check that caught B-5 and B-6 one
  round ago — was run again over the full feature-doc set and came back clean.
- Standing observation carried from v2, still not a finding: `MUTATION-EVIDENCE-pdlc-wave-resume.md`
  is a durable artifact type absent from `CLAUDE.md`'s artifact-convention sentence. It correctly
  sits outside Phase H's harvest-and-delete set (`CROSS-REVIEW-*`, `CODE_REVIEW-*`) and must persist,
  since PROPERTIES, TSPEC and a test all now depend on it. Worth a line in the convention if a later
  feature reuses the pattern.
