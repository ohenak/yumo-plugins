# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** REQ-pdlc-wave-resume §1–§10, testing lens (testability, edge-case completeness, oracle falsifiability, traceability)

## Verification Method

Every existing-behaviour claim below was checked against code, not against documents.

- **This branch (`feat-pdlc-wave-resume`) HEAD.** `grep -rn startWave` over the repo returns
  *only* the REQ itself — the manual pointer named in BL-01 does not exist on this branch.
- **`refs/heads/feat-pdlc-consolidation-agent`** (where BL-01/BL-03 actually live, queue row 2
  status `halted`, `docs/_queue/QUEUE.md`): read `pdlc/workflows/orchestrate-dev.js` §§8523–8641
  (`WAVE_STATE_PATH`, `WAVE_LEDGER_CLEARED`, `computePlanHash`, `parseWaveLedger`,
  `formatWaveLedger`) and §§10434–10630 (the read site, the skip loop, the per-wave write, the
  end-of-phase clear).
- **Wave layout re-derived mechanically.** I ran this branch's own
  `parsePlanTasks` + `parsePlanOwnership` + `computeWaves`
  (`pdlc/workflows/orchestrate-dev.js:3730`, `:3948`, `:8451`) over
  `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` at HEAD. Result: 34 tasks,
  34 manifest rows, **16 waves**; W1 = `[T00]` (one task), W2 = `[T01..T05]`, W3 = `[T06]`,
  W4 = `[T07..T11]`; waves 1–3 hold **7** tasks. This is the arithmetic OF-1..3 assert, so the
  facts are checkable rather than testimonial — and two of the numbers do not land (F-03, F-04).
- **Gate-before-commit ordering** confirmed at `pdlc/workflows/orchestrate-dev.js:10321-10335`
  on this branch: the test gate throws `haltError` before the `if (waveGit)` commit loop is
  reached, so OF-3's "a halted wave's own work is uncommitted" is true by construction here.
- **No POSTMORTEM on wave halts** confirmed: `docs/pdlc-consolidation-agent/` carries
  POSTMORTEM-D/-F/-P/-PR/-R/-T and no `POSTMORTEM-I-*`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | REQ-WVR-04's precedence rule has no stated outcome at its only interesting boundary — an operator who *explicitly* sets the manual resume point to its default value (1, i.e. "run everything"). The "When" of the acceptance test cannot be written. | §7 REQ-WVR-04, §9 OQ-1 |
| F-02 | High | Local | The safety property that actually prevents data loss — a wave that ran green but whose work was **not** committed must never be skipped — appears only in §8 R-2 as a risk, with its acceptance test deferred to the FSPEC. No AC states it, so no AT traces to a requirement and a conforming implementation may drop it. | §8 R-2, §7 REQ-WVR-01 |
| F-03 | Medium | Cross-Feature | OF-1's "15-wave plan" does not reproduce: re-deriving the wave layout from the cited PLAN at HEAD yields **16** waves. OB-2 promotes OF-1 into `docs/_constraints/pdlc-wave-gate-baseline.md` as a measured `M-*` fact, so a number that does not reproduce becomes a bad oracle source. | §4 OF-1, §9 OB-2 |
| F-04 | Medium | Cross-Feature | OF-1's "**each** re-invocation paid seven no-op agent dispatches (waves 1–3)" is true only for the wave-4 halt. Re-entry after the wave-2 halt replays W1 = `[T00]` — **one** dispatch, not seven. The replay-cost claim that motivates the feature is overstated for one of the two observations. | §4 OF-1, §1 |
| F-05 | Medium | Local | REQ-WVR-06 is an absence-only oracle in both clauses ("does not consult commit presence or commit messages", "never causes its wave to be treated as incomplete"). Neither is falsifiable by black-box observation, and the first clause names implementation mechanics rather than an outcome. | §7 REQ-WVR-06 |
| F-06 | Medium | Local | REQ-WVR-02's ignore-reason set is open-ended prose ("a different feature, a since-changed plan, or an out-of-range state"), so no set-equality oracle over the rejection catalogue is possible and a deleted rejection case would pass a containment-style test. | §7 REQ-WVR-02 |
| F-07 | Medium | Local | C-1 (consumer-local, untracked state) has no acceptance criterion, and the precedent it cites does not transfer: the drift-state record is untracked because `/.claude/workflows/` is gitignored, a rule that covers no sibling path. Nothing in §7 fails if the record becomes a tracked file. | §4 C-1 |
| F-08 | Low | Local | REQ-WVR-05's "no resume state survives" invites a file-absence oracle that the mechanism at HEAD does not satisfy (it writes a cleared-but-present record). Only the second clause is behaviourally testable. | §7 REQ-WVR-05 |
| F-09 | Low | Local | BL-01 and BL-03 say the prerequisites exist "at HEAD" without naming which HEAD; they do not exist on this feature branch. The prerequisite check is therefore not mechanical, and the §1 sentence "A manual resume pointer now exists" reads as a claim about the reader's tree. | §5 BL-01/BL-03, §1 |
| F-10 | Low | Local | REQ-WVR-07 states its outcome by reference ("resumes exactly as a direct invocation would"), which is a restatement, not an oracle — it names no queue-specific observable that could fail while REQ-WVR-01..05 pass. | §7 REQ-WVR-07 |

## Finding Detail — High

### F-01 — REQ-WVR-04 is unwritable as a test at the value that matters (High, Local)

REQ-WVR-04's *Given* is "both an explicit manual resume point (BL-01) and an automatic resume
determination available", *Then* "the manual point wins". Apply the write-the-test-right-now
check to the operator's most likely use of the manual pointer — forcing a full run — and the
test cannot be written, because the REQ never says how "explicitly set" is observable when the
set value equals the default.

This is not hypothetical. At the branch where BL-01 lives, explicitness is *inferred from the
value*: `const explicitPointer = startWave > 1;`
(`feat-pdlc-consolidation-agent:pdlc/workflows/orchestrate-dev.js:10441`), and the automatic
record is consulted only `if (!explicitPointer)` (`:10466`). So an operator who writes
`"startWave": 1` into `.claude/pdlc.config.json` is indistinguishable from one who wrote
nothing, and the automatic record wins — the exact opposite of REQ-WVR-04's *Then*. Note that
the same code path treats an out-of-range pointer clamped back to 1 as "still an operator
asking for a full run" (`:10439-10441` comments), which is a third, again unstated, reading.

This finding compounds with OQ-1: REQ-WVR-04 also requires "a documented, announced escape
hatch … to force a full run despite a valid record", and setting the manual point to 1 is the
first thing an operator will try as that hatch.

**What must change:** add a clause to REQ-WVR-04 stating the observable outcome when the
operator explicitly sets the manual resume point to the value that means "start at the
beginning" — either (a) it wins and the run announces provenance operator-set with a full run,
or (b) it is explicitly defined as *not* an explicit setting, in which case say so and route the
force-full-run intent entirely to the escape hatch of OQ-1. Either answer yields a writable AT;
silence does not.

### F-02 — the strand-prevention property is a risk, not a requirement (High, Local)

§8 R-2 identifies the only outcome of this feature that can destroy work: "If a wave were
recorded complete while its work is uncommitted, a resumed run would skip work that exists
nowhere but the tree." It then says the requirement forbidding this is REQ-WVR-01/OF-3 and that
"the FSPEC must carry an explicit acceptance test for it".

REQ-WVR-01 does not carry it. REQ-WVR-01's *Given* is "a Phase I run **halted at a wave gate**"
and its *Then* is "resumes at the wave that failed". The dangerous case is different: a wave
that went **green** and whose work was nevertheless never committed. On this branch that case is
reachable — `if (waveGit)` guards the whole commit loop
(`pdlc/workflows/orchestrate-dev.js:10335`) and the run emits "no git transport is injected —
wave work will be verified but NOT committed" (`:10267-10270`). The mechanism at HEAD does
respect the property (the ledger write sits *inside* the same `if (waveGit)` block, after the
commits — `feat-pdlc-consolidation-agent:pdlc/workflows/orchestrate-dev.js:10611-10619`), but
nothing in §7 requires it: a replacement implementation that records waves green at gate time
would satisfy every AC in this REQ and strand work.

An AT that traces to no AC does not get written, and an invariant with no falsifying test is an
invariant that regresses silently.

**What must change:** promote R-2's property into an acceptance criterion at REQ altitude, with
a positive oracle rather than a "must not" — e.g. *Who:* pipeline maintainer; *Given:* a Phase I
run in which a wave's tasks completed and were verified but the run committed nothing; *When:*
the pipeline is re-invoked for the same feature and unchanged plan; *Then:* implementation
starts at that same wave (not after it) and announces it as not previously completed. Keep R-2
as the risk, and let it cite the new AC instead of deferring the test to the FSPEC.

## Questions

## Positive Observations

## Recommendation

