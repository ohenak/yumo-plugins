# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the shipped diff `main...feat-pdlc-wave-resume`
**Date:** 2026-08-24
**Iteration:** 3

## Scope and method

Product lens only, delta protocol: **narrower scope of attention, not a lower standard.** I re-read my
own `CROSS-REVIEW-product-manager-REVIEW-v2.md`, diffed the tree against `b5c217cf` (the commit at
which v2 closed), and checked each of my two round-2 findings at HEAD. I did not re-litigate the
requirement-by-requirement trace signed off in v1 and re-confirmed in v2; I re-checked only what the
remediation commits touched, plus one thing they touched that I had explicitly *praised* in v2 and
that this round deliberately reverses (see the third section).

**The delta under review.** Five commits since v2, `b5c217cf..HEAD`:

| Commit | What it claims to close |
|---|---|
| `55bcbf0c` | TE F-08 (High) — the empty-introduced-range reading; TE F-09/F-10 injectable IO and dirty-tree warning; **my F-02** (header names the correct neighbouring step) |
| `2012e9b9` | TE F-09 — `waveResumeDeltaGate.test.js`, the gate's four exit paths plus the positive path; TE F-11 — the census gains a transcribed literal set |
| `544d6176` | **My F-01** — PLAN §4.5's DoD reconciled against observed evidence, three boxes left unticked *with reasons* |
| `36827946` | PLAN v1.6 — oracle (ii)'s lifetime recorded; §2.1's status column reconciled |
| `f59266b2` | **My F-02's cross-round half** — §4.5.1's own statement of the oracle's position corrected; the uncovered-line count re-measured |

Files touched: `PLAN-pdlc-wave-resume.md`, `check-wave-resume-delta-coverage.mjs`,
`waveResumeRepoState.test.js`, and one new suite `waveResumeDeltaGate.test.js`. No production
runtime source (`orchestrate-dev.js`, `orchestrate-queue.js`, `dist/pdlc-cli.mjs`) is in this diff,
which bounds what this round can have broken: the feature's shipped behaviour is byte-identical to
the tree I approved in v2.

**Evidence I ran rather than read.** The 7-suite `waveResume|waveExecution` run is **205 tests,
all passing** (v2 measured 191, so the round adds 14 and loses none), and
`node pdlc/workflows/build-runtime.mjs --check` prints `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`,
exit **0**. Both numbers are the ones PLAN §4.5 now cites, checked rather than taken on trust.

## Disposition of round-2 findings

| v2 ID | Sev | Scope | Status at HEAD | Evidence |
|---|---|---|---|---|
| F-01 | Medium | Process | ✅ **Resolved, and better than I asked** | PLAN §4.5: 15 of 18 boxes ticked against recorded evidence, 3 left unticked *with the reason stated*; §2.1's status column reads `✅` for all nine task ids |
| F-02 | Low | Local | ✅ **Resolved, in both places** | `check-wave-resume-delta-coverage.mjs:13-15` and PLAN §4.5.1's own sentence now both name `c8 report --reporter=json` |

### F-01 (Medium, Process) — the completion record now tells the truth, including where it cannot

I asked for sixteen unticked boxes on demonstrably-landed work to be reconciled. What landed is the
stronger version of that. Three things make it so, and each is the thing I would have had to ask for
next round if it had been done the cheap way:

**1. The ticking rule is written down before the ticks.** PLAN §4.5's opening paragraph states the
convention: a box is ticked only against *observed* evidence recorded beside it — "a measured
number, a named green oracle, or a command and its exit status" — and ticking is a **Phase DOD**
act, not a per-task one. That is a direct answer to my Q-02, and it is the durable half: it tells the
next feature's author what the checklist is *for*, which is why the boxes were left blank in the
first place.

**2. Three boxes stay unticked, and the reasons are the honest ones.** This is what distinguishes a
reconciliation from a box-tick. The Phase I run log is not a durable artifact on the branch; the
three merged tasks each landed as a **single** wave commit (`196dab92`, `42d0592a`, `fa17fb78`), so
§2.3's red-before-green split is not observable from git; and only **one** of §4.3's five mutation
runs is recorded in a commit message (`e6f9f776`). Each unticked box says so in italics beside
itself. The closing paragraph names the cost plainly — "manufacturing the evidence now would be
worse than recording its absence" — which is the correct product call. A checklist that tells you
what was *not* captured is worth more to the next maintainer than one that is uniformly green.

**3. The ticks I spot-checked are real.** I did not take the recorded evidence on trust:

- "205-test run" — I ran it: 7 suites, **205 passed**.
- "`build-runtime.mjs --check` exits 0" — I ran it: `in-sync`, exit **0**.
- "§2.1's status column marks the nine landed tasks" — `awk` over the task table returns `✅` for
  T-01, T-02, T-03, T-04, T-07, T-08, T-10, T-11, T-12. Nine, no remainder.
- The stale clause removed by `544d6176` is genuinely stale: `pdlc/hooks/scripts/sync-workflows.sh`
  was deleted by the pdlc-plugin-retirement sweep at `35f444f6`, before this feature's base. Removing
  an uncheckable clause rather than leaving a permanently-unticked box is the right disposal, and the
  removal is disclosed in the box's own text rather than done silently.

### F-02 (Low, Local) — corrected in the place I named *and* the place I did not

I asked for one comment line. `55bcbf0c` fixed it
(`check-wave-resume-delta-coverage.mjs:13-15`: "third step … after `c8 report --reporter=json` and
before `c8 report --check-coverage`"). `f59266b2` then found the *same* misstatement in PLAN §4.5.1,
which I had not flagged, and corrected it there too — along with re-measuring the uncovered-line
count (836) rather than carrying forward a number nobody had re-checked. Chasing a one-line comment
fix into the document that quotes it is the behaviour that keeps a spec and its code from drifting;
it is worth naming because nothing forced it.

## Did the revision break anything I had approved?

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
