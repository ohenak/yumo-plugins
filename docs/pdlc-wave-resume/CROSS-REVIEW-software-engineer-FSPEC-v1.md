# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** technical lens — feasibility, implementability, completeness of failure paths, grounding of claims about existing behaviour.

## Grounding Note

This authoring tree does not contain the mechanism under specification — re-verified, not taken
from the FSPEC: `git rev-list --count origin/main ^HEAD` → **1637**, `git grep WAVE_STATE_PATH
HEAD -- pdlc/workflows/orchestrate-dev.js` → no hits, and
`docs/_constraints/pdlc-wave-gate-baseline.md` does not exist at `HEAD`. So does
`docs/_decisions/DECISIONS-review-severity-bars.md`'s `DEC-DOC-01`: absent here, applied anyway.
Every code claim below is therefore verified against `origin/main` and cited by symbol first,
line second, exactly as the FSPEC does.

I checked every positional anchor the FSPEC's §1 table asserts. **All eight verify**, which is
worth recording because they are anchors into a revision this branch cannot see:

| FSPEC claim | Verification run here | Result |
|---|---|---|
| `WAVE_STATE_PATH` at `orchestrate-dev.js:12214` | `git show origin/main:… \| sed -n 12214p` | `export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` ✓ |
| `.gitignore:41` root-anchored rule, rationale at `:24-32` | `git show origin/main:.gitignore \| sed -n 24,42p` | `:41` is `/.claude/pdlc-wave-state.json`; anchoring rationale at `:30-33` ✓ (rationale span is off by ~2 lines, immaterial) |
| `parseWaveLedger` at `:12267` | same | `export function parseWaveLedger(text) {` ✓ |
| write guarded by git transport, `if (waveGit)` at `:15531`, write at `:15600` | same | `if (waveGit) {` under `// Only now — verified — does anything get committed (M-6).`; `await writeWaveLedger(` at `:15600`, inside it ✓ — and a **sibling** of the gate-mode branch, so the FSPEC's and REQ-WVR-09's transport-not-gate-mode reading is correct |
| `explicitPointer` at `:15236`, above the clamp at `:15237-15244` | same | `const explicitPointer = startWave > 1;` then `if (startWave > waves.length)` ✓ |
| retention comment at `:15607-15615` | same | `// Every implementation wave is green and committed. The record is KEPT —` … `if (allWavesRecorded) {` ✓ |
| queue delegates in-process, `orchestrate-queue.js:45` | same | `import realMain, { … } from "./orchestrate-dev.js";` ✓ |
| wave-ledger describe block, `waveExecution.test.js:2239` | same | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended", …` ✓ |

Two further checks the FSPEC does not claim but its clauses depend on, both run against
`origin/main`:

- **§3.2's ordering ratifies the shipped order.** The reader's `else if` chain is
  `ledger.reason` → `feature` → `planHash` → `headCorroborated` → `lastGreenWave > waves.length`
  (`orchestrate-dev.js:15297-15317`). That is exactly §3.2's questions 2→3→4→5→6. Good — but see
  F-04: it is *not* REQ-WVR-02's enumeration order, and the FSPEC never says so.
- **Per-wave skip announcements exist and name their source.** `Wave N/M: skipped (wave ledger…|
  implementation.startWave=…)` at `orchestrate-dev.js:15373-15381`, so §3.1's D-6 ("individually
  announced … naming which source skipped it") and AT-01 are implementable as written, not just
  aspirational. `if (allWavesRecorded) break;` at `:15372` discharges BR-11's "dispatches nothing".

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | Completion is never stated to be **monotonic across invocations**, and no AT covers the multi-halt case the REQ is built on. §3.4's write rule read literally un-completes waves 1..N-1 of a resumed run. | §3.4, §6 (AT-01), BR-08 |
| F-02 | High | Local | EC-15 / AT-15 mis-state the consequence of a failed record write. "The next invocation starts from wave 1" / "resolves outcome (a)" is false for a *partial* write failure, which is the reachable shape. | EC-15, AT-15, BR-15 |
| F-03 | Medium | Local | §3.2's question 5 has a third case the FSPEC never resolves: a record that names **no commit at all**. EC-07 covers "names a commit, no probe"; nothing covers "names no commit". | §3.2, EC-07, AT-11 |
| F-04 | Medium | Local | AT-03's worked example is not the discriminating pair. The one place §3.2's fixed order visibly diverges from REQ-WVR-02's enumeration is IG-5 before IG-4; AT-03 tests IG-2 vs IG-3 instead. | AT-03, BR-03, §3.2 |
| F-05 | Medium | Local | AT-08's second conjunct is an **absence-only oracle** — "the absence of such a key from the config surface" — with no positive assertion on the same path and no set-equality over the key catalogue. | AT-08, BR-06 |
| F-06 | Medium | Local | BR-07 ("Every resume announces provenance … never unattributed") is contradicted by BR-02 / EC-01 / EC-02, where outcome (a) is entirely silent yet §3.1 still assigns it provenance `automatic`. | BR-07, BR-02, EC-01 |
| F-07 | Low | Process | §3.5 cites `pdlc/workflows/orchestrate-queue.js:45` as a bare `file:line` anchor with no symbol name (DEC-DOC-01), where §1's row for the same fact names `realMain`. | §3.5 |
| F-08 | Low | Local | §3.1's decision table renders D-4 and D-5 as rows of a Question/Yes/No table with two empty cells each; they are terminal actions, not questions. | §3.1 |

### F-01 (High) — completion is not stated to accumulate across invocations, and the multi-halt case has no test

§3.4 states the write rule as: *"A wave is recorded as completed only after its gate is green
**and** its work has been committed by the run."* Under outcome (b), waves 1..N-1 were committed
by a **previous** run, not by this one. Read literally, this run's record therefore says nothing
about them — and an implementer who honours the sentence would write a per-run record, so a run
resuming at wave 4 and halting at wave 6 leaves a record whose "completed" set begins at 4.

The shipped mechanism is the opposite: the record carries a single absolute high-water mark,
`formatWaveLedger(featureName, planHash, waveNum, waveHead)` with `waveNum` the absolute wave
index (`orchestrate-dev.js:15600-15603`), and the reader resumes at `recorded.lastGreenWave + 1`
(`:15335`). Both designs are defensible; the FSPEC picks neither, and **no acceptance test can
tell them apart**, because AT-01 covers exactly one halt and one resume.

That is precisely the scenario the REQ's problem statement is built on: REQ §1 records a plan
"halted at wave 2 and again at wave 4", and OF-1 costs re-entry after *each* halt. The FSPEC
inherits the motivation and drops the observable.

**What must change.** (a) One clause in §3.4 or §4 stating that completion is a high-water
property of the *plan*, not of the run — a wave skipped as previously completed remains completed
in the record this run writes. (b) One AT: *given* a plan halted at wave 2, resumed, then halted
at wave 4, *when* re-invoked, *then* the announced resume point is wave 4 and waves 1–3 are each
announced as skipped — an oracle that fails against a per-run record while AT-01..AT-17 all still
pass. This is the same shape as AT-16's "discriminating arm", which the FSPEC already models well.

### F-02 (High) — the failed-write consequence is stated unconditionally and is false for the reachable case

EC-15: *"Announced as a notice; the run continues to completion. The cost is borne by the next
invocation, which starts from wave 1."* AT-15 turns that into an oracle: *"a subsequent invocation
resolves outcome (a)."*

The write is per-wave, and each attempt is independently caught: `writeWaveLedger` wraps
`writeFileFn` in its own `try/catch` and emits a notice (`orchestrate-dev.js:15350-15360`), and it
is invoked once per wave from inside the wave loop (`:15600`). So a run whose wave-1 write
succeeds and whose wave-3 write fails leaves a record saying `lastGreenWave = 2`, and the next
invocation resolves **outcome (b) at wave 3** — not outcome (a). AT-15 as written would fail a
correct implementation, or, worse, be satisfied by a fixture that only exercises the
never-any-write case and so never notices the partial one.

**What must change.** Split the row. *All* writes fail → outcome (a) (today's text, with the Given
tightened to "no write in the run succeeds"). *Some* write succeeds → the next invocation resumes
from the last successfully recorded wave, and re-executes the waves whose writes were lost. The
second arm is the honest statement of "the cost is borne by the next invocation": the cost is
bounded by the number of consecutive failed writes at the end of the run, not by the whole plan.
Note this is a *cost* clause, not a correctness one — BR-10 already bounds the damage — which is
why the fix is cheap and the current wording is still worth correcting rather than deleting.

### F-03 (Medium) — §3.2 question 5 has an unstated third answer

Question 5 asks *"Is the commit it names still reachable from the current branch tip?"*, and EC-07
handles the case where the run cannot ask. Neither covers a record that **names no commit**. The
shipped reader treats that as a pass — `if (!recordedHead) return true; // pre-head record:
honoured as before` (`orchestrate-dev.js:15281`) — a deliberate compatibility decision, not an
accident, and one with a real observable: such a record survives a `git reset --hard` that the
ancestry guard exists to catch.

This is above the altitude line, not below it: it is which outcome a run reaches, not how the
record is encoded. OB-F3 reserves the sibling question (the content-free "cleared" shape) for the
TSPEC; this one deserves the same treatment or an explicit EC row. Either is fine — silence is
not, because the two readings ("honour it" vs. "disregard it, announced as IG-5") are both
plausible and the disregard catalogue is declared closed at six by BR-02.

### F-04 (Medium) — AT-03 does not test the ordering that is actually contestable

BR-03 makes the order of §3.2 normative, which is right. But §3.2's order (…4 plan layout, 5
ancestry, 6 over-count) is **not** REQ-WVR-02's enumeration order, which lists IG-4 (over-count)
before IG-5 (ancestry). The FSPEC silently ratifies the shipped chain — `planHash` →
`headCorroborated` → `lastGreenWave > waves.length` at `orchestrate-dev.js:15305-15317` — which is
the correct call, and worth saying out loud so a downstream reader does not "fix" it back to the
REQ's numbering.

AT-03's example is a foreign feature *and* a changed plan: questions 3 vs 4, where the two
documents agree, so the test passes under either ordering. **What must change:** state in §3.2 or
BR-03 that the order is deliberately not the REQ's IG numbering, and make AT-03's fixture a record
that fails **both** ancestry (IG-5) and over-count (IG-4), asserting IG-5 is announced.

### F-05 (Medium) — AT-08's config-surface arm is an absence-only oracle

*"no configuration value anywhere in the pipeline forces a full run — asserted as the absence of
such a key from the config surface."* An absence assertion over an open universe ("anywhere") is
unwritable as stated, and nothing positive is asserted on the same path, so the test passes on a
build where resume is entirely absent.

**What must change.** Two conjuncts, both positive. (i) The hatch works: with a valid record that
would produce outcome (b), removing the record yields outcome (a) — the hatch named in the
announcement is the hatch that functions. (ii) **Set equality**, not absence, over the recognised
`implementation.*` configuration keys, so adding a `forceFullRun`-style key fails a test rather
than passing one. The shipped parser gives that catalogue a real home — the key-validation block
at `orchestrate-dev.js:235-245` with its `invalidKeys` accumulator — so the assertion is
mechanical rather than aspirational. This is the same set-equality discipline OB-F5 already
demands for the other two closed catalogues; AT-08 was simply left out of it.

### F-06 (Medium) — BR-07 overreaches into the silent case

§3.1 says the decision "produces exactly two outputs: a **resume point** and a **provenance**",
and D-2's No arm assigns provenance `automatic`. BR-07 then says every resume announces its
provenance and "A run's starting point is never unattributed". But BR-02 and EC-01/EC-02 make the
fresh-run case deliberately **silent** — provenance `automatic`, announced nowhere. A property
derived from BR-07 verbatim contradicts AT-02's IG-6 arm.

**What must change.** Scope BR-07 to the outcomes that announce: every run that starts anywhere
other than the plan's first wave (outcomes b and c) announces its provenance. The silent full run
is not an unattributed start; it is the absence of a resume, which is exactly BR-02's rationale.

### F-07 (Low, Process) — one bare line anchor

§3.5's `pdlc/workflows/orchestrate-queue.js:45` carries no symbol. Per DEC-DOC-01 this is a Low
`Process` finding, not a style nit. §1's table already has the durable form —
"imports `orchestrate-dev`'s `main` as `realMain`" — and §3.5 should reuse it. This matters more
than usual here: §1 itself warns these anchors are not re-verifiable in this tree.

### F-08 (Low) — §3.1's decision table mixes questions and actions

D-4 and D-5 occupy rows of a `Step | Question | Yes | No` table with the Yes/No cells empty, so
they render as malformed rows. Move them below the table as the two terminal outcomes they are,
or give the table a `Step | Condition | Then` shape. Purely presentational; the logic is right.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §3.1's D-1 asks whether the manual point is "set to something other than the plan's first wave", which reads as covering values *below* wave 1 as well. At HEAD they never reach the decision: the config parser accepts `startWave` only when `Number.isInteger(v) && v >= 1` and otherwise falls back to the default with an invalid-key notice (`orchestrate-dev.js:236-242`). Is that intentionally left to the TSPEC as parse-layer behaviour, or should D-1 say "greater than the plan's first wave" so the two-sided reading does not survive into PROPERTIES? No finding filed — the observable is unreachable today — but the wording invites a test that cannot be written. |
| Q-02 | AT-16 (queue parity) asks for "run once directly and once through a queue-delegated iteration". Given that the queue delegates in-process to the same `main` (`orchestrate-queue.js:45`), is the intended oracle a real two-path fixture, or the weaker structural one (the record path resolves against the same working directory on both)? The "discriminating arm" sentence hints at the former; te-author will need to know which, since the former is a substantially heavier fixture. |
| Q-03 | EC-16 / AT-17 assert the record "is in no wave's owned-path set". That is a claim about every PLAN this pipeline will ever run, not about one artifact. Should it be discharged as a *Phase P* check (ownership manifests may not claim `.claude/`), which is mechanical, rather than as a per-feature PROPERTIES assertion (OB-F6), which can only sample? Raised as a question because the REQ (OB-3) states it the same way, so it is not this FSPEC's invention. |
| Q-04 | BR-17 says the feature "adds no new host capability and no new configuration surface". Is that intended to bind the TSPEC — i.e. does a TSPEC that introduces a config key violate this FSPEC — or is it a description of the shipped interim? F-05's set-equality assertion only bites under the first reading. |

## Positive Observations

- **The grounding discipline is the best I have reviewed in this pipeline.** §1 does not merely
  cite; it names the tree the citations are valid in, states the prerequisite that is unmet, and
  tells downstream artifacts to carry the symbol names rather than the line numbers. Every one of
  the eight anchors verified. Authoring against `origin/main` from a tree 1,637 commits behind it
  is a trap, and the FSPEC walked into it with its eyes open instead of quietly guessing.
- **The altitude discipline holds throughout.** Location, encoding, field names, matching
  procedure and write mechanics are named as *not specified here* and routed to OB-F2 — and the
  document then keeps that promise, including in §3.2 where it would have been easy to slip into
  describing the `else if` chain instead of the questions it answers.
- **§3.2's ordering is the shipped order.** Verified against `orchestrate-dev.js:15297-15317`.
  Ratifying rather than reinventing is exactly BL-03 / R-4's requirement, and F-04 asks only that
  the ratification be made explicit — not that it be changed.
- **REQ-WVR-09's guard is read correctly.** The FSPEC identifies the write's guard as the git
  transport rather than the gate mode, and AT-09's "companion arm" turns that into a
  discriminating test. That distinction is subtle enough that the REQ itself records having got it
  wrong once (SE F-01, v1.5); the FSPEC got it right and grounded it at the right branch.
- **AT-14 anchors exclusion to the ignore rule, not to observed quiet.** "asserted against the
  rule itself rather than against the absence of churn in one run" is the difference between a
  test that catches a regression and one that happens to pass. `.gitignore:41` confirms the rule
  exists to assert against.
- **EC-08's rationale for keeping IG-4 and IG-5 separate** — "fusing them would let one be deleted
  without the catalogue changing" — is exactly the right instinct, and it is the reason F-04 is a
  Medium about test *selection* rather than a High about the catalogue.
- **The obligations table names owners and discharge conditions**, including one (OB-F1) that
  indicts the FSPEC's own authoring conditions. That is the finding a reviewer most often has to
  raise; here it was already on the table.

## Recommendation

**Needs revision**

Two High findings, both narrow and both fixable without restructuring the document:

1. **F-01** — add one clause stating that completion accumulates across invocations (a wave
   skipped as previously completed stays completed in the record this run writes), and one AT for
   the two-halt sequence, whose oracle fails a per-run record while every existing AT passes.
2. **F-02** — split EC-15 / AT-15 into all-writes-fail and some-write-succeeds arms; the current
   unconditional "the next invocation starts from wave 1" is false for the partial case and would
   fail a correct implementation.

The four Mediums (F-03 unstated third answer at §3.2 Q5; F-04 AT-03's non-discriminating fixture;
F-05 AT-08's absence-only oracle; F-06 BR-07's overreach) are each a sentence or a fixture change.
The two Lows are cosmetic.

Nothing in this document duplicates the shipped mechanism or invents a parallel contract, so R-4
is not triggered; the revision is additive. One erratum is raised against the REQ separately —
BL-04 is recorded as discharged there while remaining objectively unmet, which is what OB-F1
already says, plus two internal inconsistencies in the REQ's own §1/OF-1 replay-cost figures.
