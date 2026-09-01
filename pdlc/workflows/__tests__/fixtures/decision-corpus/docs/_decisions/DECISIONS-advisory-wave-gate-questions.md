# Decisions — the operator questions behind `pdlc-advisory-wave-gate`

| Field | Value |
|---|---|
| Kind | **Project-level decision record.** Not a pipeline artifact, not reviewed, not queue-eligible. |
| Cited by | `docs/completed/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` §8 |
| Version | 1.0 · 2026-08-18 |

**Why this file exists.** The five questions below were asked by REQ v1.1, answered by the operator
(delegated adjudication) on 2026-08-13, and recorded in the REQ with their full analysis. At v1.4 the
REQ stood at 90 % of its size ceiling, and resolved-question provenance is the content whose value is
lowest per line inside a requirements document and highest in a durable record beside it. Nothing was
edited in the move: the text below is the REQ's v1.3 §8 question block verbatim. The REQ keeps the
decisions themselves, one line each, and cites this file for the reasoning (DEC-AWG-Q1…Q5 map onto
Q-1…Q-5 below).

**Open questions for the operator** — all resolved 2026-08-13; kept with their analysis for provenance:

- **Q-1** — `advisory.waveBudgetPerRun` default of **2** was proposed, not confirmed, and is superseded by the decision below. Alternatives: 1
  (one repair per run, maximally conservative) or unbounded-within-`attemptBudget` (no cross-wave
  cap). Proposed default is 2 because the motivating incident would have consumed one and left
  headroom for a second unrelated failure without letting a run repair itself indefinitely.

  **Decided 2026-08-13 — `1`.** The analysis recommends **1, not 2**: (a) no shipped advisory budget
  is cross-invocation — every one is per-invocation — so `waveBudgetPerRun` would be the tier's first
  cross-invocation counter, new machinery rather than reuse of A1–A5's `runAdvisorySeam` attempt
  counter (`pdlc/workflows/orchestrate-dev.js:3350-3457`); (b) the "headroom for a second unrelated
  failure" rationale has no observed instance — both motivating incidents were single-wave; (c) the
  wave ledger (`WAVE_STATE_PATH`, defined in `pdlc/workflows/orchestrate-dev.js` — interim when this
  decision was taken, shipped by `pdlc-wave-resume` on 2026-08-24) means a halt after one repair
  resumes at the failed wave on re-invocation, so a budget of 1 costs one wave on re-run, not a
  phase. Also, any value bounds per-invocation drift only, so R-3's "compounding drift across waves"
  wording slightly overclaims what the knob controls. The operator's actual question: after A6 has
  repaired one wave unreviewed in this invocation, may it repair a second unrelated one before any
  human has seen the first?

  **Decision: default `1`.** `advisory.waveBudgetPerRun` ships at `1`; A6 may resolve at most one
  distinct wave per run, and a second red wave in the same run escalates. The deciding argument is
  the one the analysis names: a second unattended repair would land on top of a first repair no
  human has seen, and re-invocation is cheap. Two costs are accepted rather than hidden. (i) The
  "budget 1 costs one wave, not the phase" consolation depends on the ledger resuming the
  failed wave, and **as of 2026-08-13** the ledger was not observably firing (the operational
  finding at `docs/completed/pdlc-wave-resume/REQ-pdlc-wave-resume.md` §1, queue row 20) — so on that date a
  budget of 1 could cost a full Phase-I re-run. (ii)
  R-3's "compounding drift across waves" wording still overclaims what a per-run knob controls;
  FSPEC should narrow it. Revisiting to `2` was recorded as in scope once wave resume landed and
  re-invocation demonstrably resumed the failed wave — revisitable, not settled forever.

  **Update 2026-08-24 — cost (i) is discharged; the deferral is closed at `1`.** `pdlc-wave-resume`
  (queue row 20) shipped the ledger as a first-class mechanism: it fires observably under the five
  announced outcomes catalogued in `docs/completed/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` §2.4, and a
  re-invocation resumes at the failed wave (`REQ-WVR-01`, exercised by
  `pdlc/workflows/__tests__/waveExecution.test.js`). The trigger this deferral named has therefore
  arrived, and it lands on the side of the shipped default: with resume live, a budget of `1` really
  does cost one wave rather than a phase, which is the argument the decision rested on. No successor
  REQ or queue row is opened for a `2`, and this deferral is closed — raising the budget now needs a
  fresh REQ making a positive case, not this record's standing permission. The 2026-08-13 decision
  and its analysis above are left as written, as the dated record of what was known then.
- **Q-2** — Should A6 also fire on a post-wave command failure (M-WG-2)? Proposed **no** (AC-1.2),
  because that failure is a build failure the script has already attempted and its repair is
  usually the same repair a wave task owes. Bound as D-AWG-04 if the operator wants it revisited.

  **Decided 2026-08-13 — no; rationale corrected same day.** The claim above and in AC-1.2's
  original text — that the post-wave failure "is a rebuild the script has already attempted" — is
  **false**: `postWaveCommand` runs exactly once and its failure halts immediately
  (`orchestrate-dev.js:12331-12343`); the single run is the detection, not an attempted remediation.
  The consequence the REQ omitted: the post-wave command runs **before** the test gate, so a source
  defect that breaks the build never reaches the gate, and with the gate as A6's only trigger **A6 is
  unreachable for that defect class** — including in this repo, whose `.claude/pdlc.config.json` sets
  `postWaveCommand` to `node pdlc/workflows/build-runtime.mjs`. The operator's question: is a red
  build on wave-owned sources inside the class of mechanical in-scope defects to be repaired
  unattended? (AC-1.2 itself now states the single-run behaviour accurately without changing what it
  requires.)

  **Decision: no.** A6 does not fire on post-wave command failure. AC-1.2 stands as written, but on
  the corrected rationale rather than the original one: A6's trigger is the script-owned test gate,
  `postWaveCommand` failure precedes that gate, and widening A6 to cover it would mean firing on a
  signal whose failure semantics the tier has never modelled (single run, no retry, no classifier).
  The consequence is accepted and named rather than left implicit: **a source defect that breaks the
  post-wave command is permanently outside A6's reach** — in this repo, exactly the class "breaks
  `node pdlc/workflows/build-runtime.mjs`". That gap is recorded as **O-7** and routed to
  `pdlc-engineering-loop` (queue row 6), where the remedy — if one is wanted — is a separate
  build-failure remediation with its own trigger and its own budget, not a widened A6.
- **Q-3** — Should `environmental` classifications be permitted to re-run the gate once without any
  repair, as seam A5's E-1 permits for a flaky check? Proposed **no** for v1 — a flaky suite is a
  test-quality defect this pipeline should surface, not absorb. Bound as D-AWG-05.

  **Answered 2026-08-13 — no, as proposed; D-AWG-05 stands.** Correction to the E-1 analogy: A5's E-1
  is not a bare re-poll but `gh run rerun --failed` plus re-poll, capability-probed, re-executing in a
  **fresh CI runner** (`orchestrate-dev.js:2851-2857`, `probeWorkflowRerun` `:2698-2708`); an A6 gate
  re-run is same machine, same tree, so the prior that a re-run differs is far lower and the analogy
  supports "no" more weakly than this REQ implied — the conclusion is unchanged. A distinct and
  narrower question was surfaced and is **not** part of this REQ: whether a *transport-level* failure
  (the suite never executed) should get one mechanical retry at the gate itself, alongside
  `gitWithLockRetry`'s existing retry on `index.lock`/unparseable-adapter-response
  (`orchestrate-dev.js:10356-10378`), outside the advisory tier entirely. Also note that AC-2.2's
  `environmental` conflates sub-cases and that `_runCommand`'s `{ok, output}` contract gives no
  structured way to tell them apart — only text.
- **Q-4** — Should the engine run a deterministic **per-task ownership-delivery check** when a wave
  gate goes red, and feed it to A6 as diagnosis input: diff the tree against the PLAN ownership
  manifest and name each dispatched task whose owned NEW/MOD file shows no change? In the
  2026-08-11 incident this turns a cryptic collection ImportError into "T07 delivered its test but
  not its owned impl file". Proposed **yes**, as diagnosis/reporting only — no model, no repair
  authority — because it sharpens the class 1/2 split in AC-2.2. Whether it also runs on the
  disabled-tier halt path (pure reporting; AC-1.4's created-file inertness must still hold) is the
  operator's call.

  **Answered 2026-08-13 — yes for the diagnosis half; the disabled-tier half is routed to D-AWG-06.** The check
  is feasible with the existing wave git transport, because on a red gate all wave work is
  uncommitted and prior waves are committed. Two binding caveats: (i) **drop "NEW/MOD" from the
  wording** — `parsePlanOwnership` (`orchestrate-dev.js:4259`) retains only `{taskId, files[]}` and
  ignores extra columns, so no NEW/MOD distinction exists to check; the per-path "owned path
  untouched" form suffices for both incidents; (ii) ownership rows may be directories or glob-ish
  cells, so a directory-owning task that legitimately changed nothing is a false positive — the
  result is a **signal, never a verdict**. For the disabled-tier half: NFR-2's letter permits running
  it with the tier off (it creates no file, so `advisoryDisabled.test.js` PROP-DIS-03's created-file
  set-equality still passes), but the tier's shipped discipline is that even when *enabled*, A3/A4
  halts stay byte-identical with classification only appended; running it tier-off deliberately
  breaks that, so AC-1.4 would need an explicit carve-out. The operator's question: may a tier-off
  wave halt carry a deterministic diagnosis line at the price of the halt message no longer being
  byte-identical to the pre-A6 baseline? An alternative is routing the disabled-path half to
  D-AWG-06 instead, keeping A6's inertness contract clean.

  **Decision on the disabled-tier half, 2026-08-13: option (c) — route it to D-AWG-06.** The
  ownership-delivery check runs only when the tier is enabled, as an A6 diagnosis input. With
  `advisory.enabled: false` the wave-gate halt stays byte-identical to the pre-A6 baseline: no
  classification line, no created file, AC-1.4 and `advisoryDisabled.test.js`/PROP-DIS-03 unamended.
  Tier-off operators get the same diagnosis from D-AWG-06's mode-aware halt reporting, which is
  engine report-surface work and already owns the halt message. Rejected: an AC-1.4 carve-out — it
  would trade the tier's one mechanically provable property, inertness when disabled, for a
  convenience line, and that property is what made the tier shippable disabled-by-default.
- **Q-5** — Should gate-output evidence (AC-2.3) distinguish a **collection error** (zero tests
  run, suite interrupted) from failing assertions? A collection error indicates a missing
  deliverable or a linkage defect (classes 1–2), almost never `environmental`. Proposed **yes**, as
  an evidence signal inside the existing classes — not a fifth class.

  **Answered 2026-08-13 — yes, exactly as scoped: an evidence signal inside the existing classes, not
  a fifth class.** The one specification obligation this adds: detection is runner-specific text and
  `testCommand` is arbitrary operator config, so no classifier can be total — the signal must be
  best-effort with a defined absent state, following the shipped precedent of the report-only
  `_summarise` hook, which is absorbed on throw and can never change a disposition
  (`orchestrate-dev.js:3427-3433`). The full gate output is available at A6 time even though the
  human-visible halt truncates to the last 30 lines (`outputTail`, `:9451-9454`), so the signal
  survives truncation.
