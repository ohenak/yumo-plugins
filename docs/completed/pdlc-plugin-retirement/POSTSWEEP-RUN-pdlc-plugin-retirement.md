# POSTSWEEP-RUN — pdlc-plugin-retirement (T32)

Captured: 2026-08-18
Scope: AT-5.1, AT-5.2, AT-4.4 (REQ §6.5 AC-5.1/AC-5.2, §6.4 AC-4.4; TSPEC §4.5 field-set comparison model)

## 1. BL-08 process finding (High, process) — recorded, not papered over

REQ BL-08 required a pre-sweep engine-path run report **and** a transcript of C-7's green
gate-command run, committed at fixed paths in this feature's directory and cited by path +
commit, **before the first deletion commit** (REQ:149, FSPEC §3.0 step 4, TSPEC:766/814).

No such report or transcript was ever committed. `git log --diff-filter=A` over
`docs/pdlc-plugin-retirement/*REPORT*`, `*TRANSCRIPT*`, `*BASELINE*` returns nothing, and
`FSPEC-pdlc-plugin-retirement.md:71` / `:829` (O-B) both record the gap directly: "not yet
captured — no pre-sweep report or gate transcript is tracked at HEAD" / "uncapturable after the
sweep starts."

Deletion commits already landed before this gap was closed. The first deletion commit on this
branch is `2c706a54` ("T05 delete drift-channel legs and consumer-ac12 fixture",
2026-08-18 13:10:01 -0700). No BL-08 artifact was committed at any commit before it.

**Verdict: BL-08's ordering obligation ("before the first deletion commit") was violated and
cannot be un-violated.** This is recorded here as a **High, process** finding, verbatim, for
Phase CR and for the postmortem/LEARNINGS — it is not disposed of by the substitute capture in
§2 below, which is offered only to salvage the substantive AC-5.1/AC-5.2 comparison, not to
excuse the missed gate.

## 2. Retroactive-substitute baseline — anchor commit

Per the coordinator's ruling, the pre-sweep tree still exists in git history, so the substantive
comparison is not necessarily lost even though the BL-08 artifact was never captured live.

- **Anchor commit:** `6049c0bf3f5e6a9ef20ae7895a9c5d849b7110ce` — computed as `2c4999ba^`
  (parent of `2c4999ba`, "T01 pre-flight baseline"), timestamp 2026-08-18 12:43:20 -0700.
- **Verified to predate every deletion:** the first deletion commit on the branch is `2c706a54`
  (2026-08-18 13:10:01 -0700, T05), strictly after the anchor. `git log --reverse --oneline
  main..HEAD --diff-filter=D` confirms `2c706a54` is the earliest deletion commit in the whole
  sweep range, so `6049c0bf` precedes all of them.
- **Post-sweep anchor:** current branch HEAD, `ed0a9aa6ef6acee021895b9e94c478d81325ecb5`
  ("T30 — cleanup-consumer-workflows.sh, class 13").

## 3. Why no runs were performed here — AC-5.1/AC-5.2/AT-4.4 require a live engine dispatch

AC-5.1 (REQ §6.5, FSPEC §3.6 step 1, AT-5.1) requires "a real feature run end-to-end through the
engine, in a repo" reaching a configured final phase and producing the module's real artifact
classes (spec files, cross-review verdicts, queue-row writes, final report) — driven by
`pdlc queue --loop` (or an equivalent single-pass invocation) against a real
`docs/_queue/QUEUE.md` row in a consumer repo, with the plugin and engine actually installed and
skill sessions actually dispatched through Claude. AC-4.4 (AT-4.4) requires a second such run,
against a tree with cleanup leftovers present, for the same field-set comparison.

This is **not** a lightweight, scriptable non-interactive check in the sense L-9's `npm test` /
`bash -n` gate commands are (those are what T31's replay sweep runs). It is a live, real-money,
real-time engine run that dispatches actual Claude sessions through a real feature pipeline —
minutes to hours, non-deterministic in duration, and consuming real API budget, run **twice**
(pre-sweep world and post-sweep world) per the coordinator's instruction, plus a third and
fourth run for AT-4.4's leftover-present pair. I do not have standing, as an automated
verification subagent, to unilaterally commit an operator's API budget and wall-clock time to
four such runs. Per the coordinator's own fallback instruction ("If the needed engine run is
interactive-only, skip the runs and record PENDING-OPERATOR with exact commands for both
worlds"), these are recorded as **PENDING-OPERATOR** below rather than executed.

## 4. PENDING-OPERATOR — exact commands for both worlds

### 4a. Pre-sweep world (RETROACTIVE-SUBSTITUTE baseline)

```sh
git worktree add -d /tmp/pdlc-presweep-wt 6049c0bf3f5e6a9ef20ae7895a9c5d849b7110ce
cd /tmp/pdlc-presweep-wt/pdlc/workflows && npm ci && node build-runtime.mjs
# install the built runtime + plugin/engine into a scratch consumer repo per pdlc/OPERATIONS.md's
# fresh-clone bootstrap, then in that consumer repo:
#   1. seed docs/_queue/QUEUE.md with one ready row for a small real feature
#   2. pdlc queue --loop
#   3. capture the emitted run report (engine-stamped, via pdlc/engine/lib/report.mjs) at a
#      fixed path, e.g. docs/pdlc-plugin-retirement/POSTSWEEP-RUN-baseline-report.json
```

Label the resulting report explicitly:
**RETROACTIVE-SUBSTITUTE (captured 2026-08-18 from worktree at `6049c0bf3f5e6a9ef20ae7895a9c5d849b7110ce`) — not the BL-08 capture the REQ required.**

### 4b. Post-sweep world

```sh
git worktree add -d /tmp/pdlc-postsweep-wt ed0a9aa6ef6acee021895b9e94c478d81325ecb5
cd /tmp/pdlc-postsweep-wt/pdlc/workflows && npm ci && node build-runtime.mjs
# same consumer-repo install + queue-row + `pdlc queue --loop` sequence as 4a, against the
# post-sweep runtime, capturing docs/pdlc-plugin-retirement/POSTSWEEP-RUN-postsweep-report.json
```

For AT-4.4, repeat 4b with cleanup leftovers deliberately left in place (per AC-4.1/4.3's L-11
entry set), and compare that report's field set against the leftover-free post-sweep report
(both over AT-5.2's stable subset) — this is the "two runs required to falsify it" pair FSPEC
§6.4 AT-4.4 calls for, and it is a distinct pair from the AC-5.1/AC-5.2 pre/post pair.

### 4c. Field-set comparison, once both reports exist

Apply TSPEC §4.5's rule exactly: field sets compared for **equality** (added/removed path fails);
values compared for equality only on the fields TSPEC §4.5 enumerates as stable (excluding
`engineVersion`, `pluginVersion`, `pluginRoot`, `startupAuth.catalogueId`, `authSources`,
`startup`, `dispatches`, `retries`, `pauses`, `denials`, `loop`, `outcomes`, `startedAt`,
`finishedAt`, and any feature-name/id/path field — all compared for presence and shape only,
never content).

## 5. Verdict

**AC-5.1 and AC-5.2: EVIDENCE-CAPTURED-PENDING-ACCEPTANCE is not reached — no runs were
performed. Status: PENDING-OPERATOR.**

**AC-4.4: PENDING-OPERATOR** (same live-engine dependency; no substitute run was performed).

## 6. Explicit acceptance question for the operator

REQ BL-08's own text deems the pre-sweep baseline uncapturable once the sweep starts. The
retroactive-substitute anchor (`6049c0bf`, §2 above) is offered as a candidate replacement
baseline for AC-5.1/AC-5.2's comparison, conditioned on the operator actually running §4a/§4b's
commands. **This is a PENDING-OPERATOR decision: accept `6049c0bf` as a RETROACTIVE-SUBSTITUTE
baseline and perform the runs in §4, or reject the substitute and dispose of AC-5.1/AC-5.2/AT-4.4
by some other means (e.g. a REQ erratum acknowledging the criteria are now unsatisfiable as
written).** Neither AC-5.1 nor AC-5.2 nor AT-4.4 should be marked satisfied until the operator
rules on this question and, if accepted, the runs in §4 are actually performed and compared.
