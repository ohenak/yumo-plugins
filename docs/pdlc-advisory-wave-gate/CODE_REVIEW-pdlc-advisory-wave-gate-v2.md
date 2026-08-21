# CODE REVIEW — pdlc-advisory-wave-gate (v2)

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| Branch | feat-pdlc-advisory-wave-gate |
| Review version | 2 |
| Date | 2026-08-21 |
| Verdict | Pass |
| Branch coverage (lowest new module) | 88.46% (`orchestrate-dev.js`; no new module introduced) |
| Requirements traced | 33/33 |

**Round type.** Delta re-verification of the remediation for v1's two findings. Per the re-verification
contract this round does **not** re-run the full six-criteria scan: it re-verifies each v1 finding
against the fix, scans the remediation diff only, and carries §2 forward from v1 with the one
remediated row updated.

**Remediation scope.** Exactly one commit since v1 (`9f34635b`): `780f3607`
*"test(advisory-wave-gate): tighten E-20 re-gate oracle to sequence equality and bind orphan FSPEC
E-rows"*. Four files, all under `pdlc/workflows/__tests__/` (+21/−3). `git diff 9f34635b..780f3607
--name-only` lists no production file — the commit's "no production code changed" claim is true as
stated, which is why criteria 1–4 have no diff surface this round beyond the coverage re-measure.

**Method.** `pdlc/workflows`: 102 suites / 4162 passed / 0 failed / 70 skipped — totals identical to
v1, so the remediation introduced no new skip and dropped no test. Per-file coverage gate
(`npm run test:coverage`, `c8 report --per-file --branches 85`) exits 0. `pdlc/engine`: 21 suites /
845 passed / 0 failed / 2 skipped. `node pdlc/workflows/build-runtime.mjs --check` reports
`in-sync`. `git status --porcelain` clean after the mutation probe below was reverted.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|

(Empty — no violation of criteria 1–4 in the remediation diff, and both v1 findings are remediated.)

## §1a Prior-Finding Disposition

| v1 # | Criterion | Severity | Fix location | Verified how | Status |
|---|---|---|---|---|---|
| 1 | Requirements traceability (oracle strength) | medium | `advisoryWaveGate.test.js:1234`, oracle at `:1266` | Mutation-verified RED (below) | **Remediated** |
| 2 | Requirements traceability (citation) | low | `advisoryWaveGate.test.js:431,1232,2022,2482,2786`; `advisoryDriver.test.js:590`; `advisoryRecord.test.js:314`; `advisoryEscalationLog.test.js:859` | Citation/FSPEC cross-read + full E-row family sweep | **Remediated** |

**Finding #1 — verified load-bearing, not assertion-shaped.** The E-20 truncated-re-gate case now
asserts `expect(args.invocations).toEqual(["post-wave", "post-wave", "post-wave"])`
(`advisoryWaveGate.test.js:1266`), replacing v1's membership pair
(`filter((t) => t === "post-wave").length > 0` + `not.toContain("test")`). The `resolved === false`
and `args.waveBudget.resolved === 0` conjuncts are retained at `:1262`–`:1263`, so the tightening
added an oracle rather than trading one away. Mutation probe: capping the attempt loop by editing
`budgetExceeded` (`orchestrate-dev.js:2378`) from `attempts >= attemptBudget` to `attempts >= 1`
turns the case **RED** with `Received: ["post-wave"]` against the expected three tokens. The v1
oracle would have stayed green on that exact value — `["post-wave"]` satisfies both
`filter(...).length > 0` and `not.toContain("test")` — so the defect class v1 named is now genuinely
caught. Production file restored byte-for-byte after the probe (`git status` clean).

**Finding #2 — verified accurate, not merely present.** All seven orphan rows (E-16, E-18, E-20,
E-21, E-28, E-29, E-31) now carry an `E-nn` citation on a describe/test block. Each citation was
cross-read against its FSPEC row rather than counted: E-16 ↔ FSPEC:294 (no partial application,
AC-3.5), E-18 ↔ :296 (commit/push/tag refused, BR-6/BR-8), E-20 ↔ :303 (truncated invocation
sequence is an admitted form, BR-7), E-21 ↔ :304 (`[test, test]` with no post-wave command), E-28 ↔
:311 (restoration failure halts the wave, REQ O-1), E-29 ↔ :319 (record-write failure surfaced, never
healed, BR-13 — cited on both the driver and the record suite), E-31 ↔ :321 (`plan-ordering-defect`
countable from the durable log alone, AC-6.4). Every citation's prose matches its row's substance.
No new test and no behaviour change, as the commit claims — consistent with the unchanged suite
totals.

## §2 Requirements Traceability

Carried forward from v1 unchanged except row 18, which the remediation closed. No other row's
implementation or test path was touched by the diff, so per the re-verification contract they are
not re-traced here; v1 §2 remains the record for rows 1–17 and 19–33.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 18 | REQ AC-4.4 | The gate sequence re-runs in the shipped order; the oracle is **sequence** equality, including the truncated arm | `runWaveGateSequence` / `invocations` (`orchestrate-dev.js:3407`–`3409`) | `advisoryWaveGate.test.js:2017` (`[pw,t]×3`), `:2047` (`["test","test"]`), `:2226` (`[pw,t,pw,t]`), and now `:1266` (E-20 truncated arm, `["post-wave"]×3`) | **No** | — | — |

Rows 1–17 and 19–33: no gap, per v1. Requirements traced 33/33 (was 32/33).

## §3 Criterion 6 — Integration Boundary

Clean; `boundary_gaps: 0`.

- **Adjacent-surface falsification.** The diff is test-only — comments plus one oracle expression —
  so it changes no behaviour a shipped disclosure could describe. `pdlc/OPERATIONS.md`,
  `pdlc/RELEASE-CHECKLIST.md` and `docs/_constraints/pdlc-wave-gate-baseline.md` describe A6
  behaviour and config keys, none of which moved. Swept the repo for prose asserting the *old*
  oracle shape (membership / `not.toContain("test")`); the only hits are unrelated completed
  features under `docs/completed/`. Nothing in the branch claims E-20 is membership-asserted.
- **Same-shape sibling sweep (E-row family).** The family v1's finding #2 belongs to is the FSPEC §5
  error table. Enumerated it: FSPEC declares E-01…E-34, and every one of those 34 ids now appears in
  `pdlc/workflows/__tests__/`. The remediation closed the family completely rather than the seven
  named rows only — no sibling left unbound and none newly orphaned.
- **Self-inspecting oracle.** `advisoryWaveGate.test.js:3343` (PROP-NFR-04) reads source with
  `readFileSync`, so a line-shifting edit to that file is a plausible silent falsifier. It reads
  `../orchestrate-dev.js`, not itself, and asserts column-0 declarations rather than line numbers —
  unaffected by the added comments. Its non-vacuity guard (`A6_PROHIBITIONS` must still match) is
  intact and passing.
- **Coverage-exemption / weakening sweep.** No `.skip`, `.only`, `xit`, `xdescribe`, `toBeTruthy`, or
  `expect.any` among the added lines; the diff strengthens one oracle and adds comments.
- **Deferral binding.** The remediation introduces no new deferral, TODO-with-successor, or
  DECISIONS entry. v1's deferral audit (D-AWG-01…06 incl. 03b; O-2/O-6/O-7 → `pdlc-engineering-loop`
  queue row 6, D-AWG-03b → `pdlc-wave-resume` queue row 20) is unchanged and still bound.
- **`dist/` rebuild rule (DEC-08).** No `pdlc/workflows/*.js` production source changed, so no
  regeneration was owed; `build-runtime.mjs --check` confirms `in-sync` regardless.

## Notes

- **Coverage delta.** v1 recorded `orchestrate-dev.js` at 85.91% branch; this round measures 88.46%
  via `npm run test:coverage` (c8, `--runInBand`, the shipped gate). The remediation added no
  production code and no new test, so the delta is a measurement-mode difference between rounds, not
  a coverage movement. Either figure clears the 85% bar; the shipped per-file gate exits 0, which is
  the binding check. Worth pinning the measurement command in the next round's method note so the
  two numbers stop looking like a regression in reverse.
- **Mutation probe hygiene.** The `budgetExceeded` edit used to prove finding #1's fix was reverted
  from the working tree and never committed; `git status --porcelain` is empty and
  `git diff --stat` is empty at the time of writing.
- **Hardening carried forward, still not a finding.** v1's `_now`-defaulting suggestion for `main`
  (`orchestrate-dev.js:13020`) remains a successor-REQ candidate, not a gap — untouched by this
  remediation and nothing broken today.
