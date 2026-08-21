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

## Finding Detail — Medium and Low

### F-03 / F-04 — OF-1's numbers do not reproduce from the cited run (Medium, Cross-Feature)

§4 opens "Observed facts, each dated and **reproducible from the cited run**", and OB-2 will
promote OF-1..3 into `docs/_constraints/pdlc-wave-gate-baseline.md` as measured `M-*` facts that
downstream tests cite as oracle sources. So I re-derived them rather than trusting them, using
this branch's own deriver over the cited PLAN at HEAD (`parsePlanTasks:3730`,
`parsePlanOwnership:3948`, `computeWaves:8451`):

```
tasks: 34   ownership rows: 34   waves: 16
W1 (1): T00
W2 (5): T01, T02, T03, T04, T05
W3 (1): T06
W4 (5): T07, T08, T09, T10, T11
waves 1-3 total tasks: 7
```

- **F-03.** The plan derives **16** waves, not 15. (17 counting Phase PT's V-wave, which the
  script appends as wave `waves.length + 1`.) Neither reading is 15. Either the PLAN changed
  after the run — in which case OF-1 must say so, since an unreproducible measured fact cannot
  be promoted as `M-*` — or the count is off by one.
- **F-04.** "each re-invocation paid seven no-op agent dispatches (waves 1–3)" reproduces for
  the **wave-4** halt only. After the **wave-2** halt the re-invocation replays wave 1, which
  holds a single task (`T00`) — one dispatch. The sentence generalises a single observation to
  "each", and the generalisation is measurably false for the other observation in the same
  sentence.

OF-2 and OF-3 both reproduce (wave 1 genuinely has exactly one task; the gate throws before the
commit loop at `pdlc/workflows/orchestrate-dev.js:10321-10335`), so this is a narrow correction,
not a challenge to §4 as a whole.

### F-05 — REQ-WVR-06 is an absence-only oracle (Medium, Local)

"the determination does not consult commit presence or commit messages" is a white-box
statement, and "a no-op-completing task never causes its wave to be treated as incomplete" is
negative-shaped: any behaviour that is not "treated as incomplete" passes, including accidental
ones. A test written from this AC can only fail to observe something.

Rewrite with a positive conjunct on the same path, at REQ altitude — e.g. *Then:* the wave
containing the no-commit task is treated as complete, and a subsequent re-invocation of the same
plan starts at the **next** wave and announces that wave number as its resume point. That is
observable in the run log, it fails if the determination regresses to commit archaeology, and it
keeps the "how" in the TSPEC where OB-1 puts it. (Grounded: at HEAD a wave with no owned paths
emits "nothing to commit" — `orchestrate-dev.js:10340` — and is still recorded green.)

### F-06 — REQ-WVR-02's rejection catalogue is not a closed set (Medium, Local)

The AC lists rejection causes with an "or" and no closure, so the only oracle available is
containment: a test asserts that *these* three cases produce a full run, and a fourth cause
silently deleted from the implementation still passes. Enumerated contracts need set-equality,
so a deleted case fails.

At HEAD the catalogue has four announced members plus one deliberately silent one —
unparseable/foreign content (`parseWaveLedger` reason,
`feat-pdlc-consolidation-agent:orchestrate-dev.js:10479`), feature mismatch (`:10483`), changed
plan layout (`:10486`), recorded-waves-≥-plan-waves (`:10487`), and absent/empty/cleared, which
is intentionally silent (`:8555-8565`). Either enumerate the operator-visible causes in
REQ-WVR-02 as the complete set, or state explicitly that the set is the TSPEC's to close under
OB-1 **and** add the obligation that it be closed with a set-equality check.

### F-07 — C-1 has no AC, and its precedent does not transfer (Medium, Local)

C-1 requires the record to live in "consumer-local, untracked state (the drift-state record's
precedent)". I checked the precedent: the drift-state record is
`.claude/workflows/.pdlc-drift-state.json`
(`pdlc/hooks/scripts/sync-workflows.sh:239`), and it is untracked because `.gitignore:29`
ignores `/.claude/workflows/` — an anchored rule whose own comment explains that it deliberately
matches nothing outside that directory. The interim record sits at
`.claude/pdlc-wave-state.json` (`feat-pdlc-consolidation-agent:orchestrate-dev.js:8536`), a
sibling path covered by no ignore rule on either branch. Untrackedness there rests on nobody
running `git add -A`, not on a mechanism.

No AC in §7 fails if the record becomes tracked, so C-1 is currently unfalsifiable. Add the
observable: no commit produced by a run ever contains the resume record, and the record never
appears as a tracked file. That is a black-box assertion over `git` state, not a design choice,
so it does not intrude on OB-1.

### F-08 — REQ-WVR-05's first clause invites an oracle the mechanism cannot satisfy (Low, Local)

"no resume state survives" reads as file-absence. At HEAD the end-of-phase clear *writes* a
cleared record rather than deleting it (`WAVE_LEDGER_CLEARED = "{}\n"`,
`feat-pdlc-consolidation-agent:orchestrate-dev.js:8544`, written at `:10628`). Both designs are
legitimate — which is precisely why the REQ should assert only the behavioural clause it already
has ("a subsequent invocation behaves as if no halted run ever existed"), plus the positive
observable that it starts at wave 1 and announces no resume. Leave existence/absence of a file
to the TSPEC.

### F-09 — "exists at HEAD" has no fixed referent (Low, Local)

`grep -rn startWave` across this branch returns only the REQ itself; the pointer, the ledger and
the INTERIM comments exist on `refs/heads/feat-pdlc-consolidation-agent`, whose queue row is
`halted` (`docs/_queue/QUEUE.md`, Order 2), not merged. §1's "A manual resume pointer now
exists" and BL-01/BL-03's "exists at HEAD" are therefore true only of a branch the REQ names
once, in §1, and not in the prerequisite table. Name the branch (or say "at HEAD of the default
branch once BL-01 merges") so the FSPEC-time prerequisite check is a mechanical grep with an
unambiguous answer.

### F-10 — REQ-WVR-07 states an outcome by reference (Low, Local)

"resumes exactly as a direct invocation would under REQ-WVR-01..05" gives an AT nothing of its
own to assert, so it will be written as a duplicate of REQ-WVR-01 and will pass for the wrong
reason. The queue delegates in-process to `orchestrate-dev`'s `main()`
(`pdlc/workflows/orchestrate-queue.js:41`, and the module header at `:10-17`), so the only
queue-specific risk surface is the working directory the record is resolved against and the
absence of any queue-level configuration. Say that: *Then:* the delegated run announces the same
resume point and provenance in the queue run's report, with no queue-specific configuration
present. That fails if resume state is ever resolved relative to something the queue path
changes.

## Questions

| ID | Question |
|----|---------|
| Q-01 | What is the intended observable outcome of an operator explicitly setting the manual resume point to 1? (F-01 — the AT's *When* depends entirely on this answer.) |
| Q-02 | Does OF-1's "15-wave plan" refer to a PLAN revision predating HEAD? If so, which commit — a measured fact promoted under OB-2 needs a reproducible subject. |
| Q-03 | REQ-WVR-05 says "no resume state survives **for a later fresh run of any feature**". Does a completed Phase I for feature A have to clear a record left by feature B, or is clearing scoped to the running feature? The two give different ATs. |
| Q-04 | Is a wave whose tasks produce no commits *at all* (OF-2's case, run through) required to be recorded complete, or merely permitted to be? REQ-WVR-06's negative phrasing leaves both readings open (F-05). |
| Q-05 | Should REQ-WVR-03's "before any new commit lands" be observable as ordering (gate outcome precedes the first commit of the resumed run) or as a stronger post-condition (no commit exists in the resumed run unless the whole-tree suite passed)? The latter is testable after the fact; the former needs an ordering oracle. |

## Positive Observations

- **§4 is measurable, and most of it measures true.** OF-2 (wave 1's single task) and OF-3
  (halted work uncommitted at the halt) both reproduce mechanically — OF-3 by construction, at
  `pdlc/workflows/orchestrate-dev.js:10321-10335`, where the gate throws before the commit loop.
  A constraints section that a reviewer can re-derive instead of believe is exactly what OB-2's
  promotion into a `M-*` baseline needs, and it is why F-03/F-04 are narrow corrections rather
  than a challenge to the section.
- **G-2 is stated as a testable invariant, not an aspiration.** "no new commit lands before the
  full test suite has verified the whole tree" is falsifiable, it is carried into REQ-WVR-03
  with an adversarial *Given* ("corrupt or adversarial bytes"), and it makes the resume record a
  pure optimisation. This is the right shape for the property that everything else depends on.
- **The altitude discipline is well kept.** OB-1 explicitly parks location, format, matching
  rules and procedure with the TSPEC, and §7 mostly states operator-visible outcomes. My
  testability findings ask for *more precise outcomes*, not for mechanics — the one place
  mechanics leaked in (REQ-WVR-06's "does not consult commit presence") is flagged as F-05.
- **Non-Goals are enforceable, not decorative.** "Commit-history archaeology … explicitly
  rejected (OF-2), not deferred" and "no form of trust-the-record-and-skip-the-gate" both name
  behaviours a test can look for, and both are grounded in an observed fact rather than taste.
- **The interim mechanism is honestly disclosed.** §1's INTERIM paragraph plus BL-03's gating
  logic ("formalize or replace, never duplicate") is the activation-check discipline applied
  correctly; it is what let me diff the REQ against a real implementation instead of against
  assumption, which is how F-01 surfaced.

## Recommendation

**Needs revision**

Two High findings must be closed before this REQ is a sound basis for FSPEC/PROPERTIES work:

1. **F-01** — state the outcome when the manual resume point is explicitly set to its default
   value, so REQ-WVR-04's acceptance test has a writable *When*. Coordinate with OQ-1: if the
   escape hatch is the answer, say so in the AC.
2. **F-02** — promote R-2's strand-prevention property from a risk into an acceptance criterion
   with a positive oracle, so the AT the risk demands has a requirement to trace to.

The five Medium findings (F-03..F-07) are all closable with sentence-level edits: correct OF-1's
two numbers, give REQ-WVR-06 a positive conjunct, close or explicitly delegate REQ-WVR-02's
rejection catalogue with a set-equality obligation, and give C-1 an observable AC. The Lows are
precision, not correctness.

Nothing in this review contests the product judgement, the goal set, or the decision to make
resume self-determining — the shape of the feature is right, and §4's measurable-facts approach
is a model for other REQs. The revision needed is to make the two properties that carry the
safety argument falsifiable.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 5, "low": 3}
