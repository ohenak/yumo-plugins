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

One thing in this delta reverses a property I *specifically praised* in v2, so I checked it rather
than assuming good faith. In v2 I wrote that the delta oracle "cannot vacuously pass" because an
empty introduced-range set was a hard failure, and I called that "the absence-only-oracle trap,
avoided without being asked". `55bcbf0c` (TE F-08) turns that same reading into a **success**. A
reviewer who only remembered his own praise would file that as a regression. It is not one, and the
reason matters more than the verdict:

**The v2 shape was wrong, and wrong in a way my round-2 lens could not see.** The gate is
`&&`-chained into `npm run test:coverage`, which the **required** check
`Unit tests (ubuntu-latest, node 20)` runs (`CLAUDE.md`'s CI table; `pdlc/workflows/package.json`).
The day after this feature merges, the merge-base *contains* the feature's lines, the diff is
legitimately empty — and the v2 shape would have exited 1 on `main` and on every branch cut from it
that does not touch `orchestrate-dev.js`. A required check red forever, with the `--branches 85`
floor step never reached because it is chained *after*. My v2 finding asked for an oracle that could
not pass vacuously; taken literally it would have shipped a permanently-red gate on the default
branch. TE caught the thing I missed, and the fix is the correct reading of what I was actually
protecting.

**The protection I cared about is still there, and it is now falsifiable rather than argued.** The
guard was reaching for "the base or the path is wrong". That reading is separated **mechanically**,
not by comment: `check-wave-resume-delta-coverage.mjs:185-190` fails when `SUBJECT` is absent from
the checkout ("The path is wrong"), `:139-144` fails when the coverage artifact is missing, `:147-152`
fails when the subject has no entry in the report, and `:105-110` fails when no base commit resolves
at all. Four fail-closed readings, one benign reading, and the benign one prints *which* of two
distinct reasons applies (`:193-197`). All five are driven by
`waveResumeDeltaGate.test.js:108-214` through the injected IO seam, and the **first** case in the
file is F-08's own post-merge scenario — the falsifying test for the fix itself, placed first with a
comment saying so.

**No absence-only assertion among them.** Each negative case asserts the exit status *and* the
message (`:17-19` states this as the suite's convention, and the reason: "a status-only assertion
cannot tell 'passed because there is no delta' from 'passed because the report was empty'"). The
one that matters most for my lens is `:147-153`: an uncovered line **outside** every introduced
range exits 0 *and* prints `uncovered lines in file: 1` — the positive half proving the gate is
delta-scoped rather than silently doing nothing. That is exactly the paired-positive discipline I
would have asked for.

**The rest of the delta is document-only or additive.** No production runtime file is in
`b5c217cf..HEAD`. The census change (`waveResumeRepoState.test.js:229-250`) *adds* a transcribed
literal set of six suite names alongside the existing two-way set-equality — it closes the
matched-pair-deletion hole (delete a suite and its manifest row together and both sides stay equal)
without weakening what was there. Nothing I approved in v2 is narrowed, reinterpreted or dropped.

**Verified end to end.** `npm run test:coverage` from `pdlc/workflows` exits **0**; the delta oracle
prints `per-file branch coverage: 88.90 %`, `uncovered lines in file: 836`, and
`uncovered lines inside introduced ranges: 0 — OK`, resolving its base as
`merge-base with origin/main`. Those are the exact three numbers PLAN §4.5/§4.5.1 now record, so the
document and the run agree digit for digit.

## Findings

Two new findings, both non-gating, neither a regression. Both come from the same source: this round
promoted a feature-scoped tool into a **permanent** control, and the consequences of that promotion
are recorded in the feature's PLAN — a document that is archived when the feature ships.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Cross-Feature | Oracle (ii) is now a **permanent** required-check step (PLAN §4.5.1 "The gate is **permanent**, not a feature-duration control"), but it is documented only inside this feature's PLAN and is named after this feature. A future contributor whose unrelated branch reds `check-wave-resume-delta-coverage` has no durable place to read what it is. `pdlc/OPERATIONS.md` and `CLAUDE.md` do not mention it. | REQ-WVR-04; PLAN §4.5.1 |
| F-02 | Low | Local | `waveResumeDeltaGate.test.js:216-226` proves the invoked-directly guard by string-matching the source file's own text, so it stays green if the line it quotes is commented out. | PLAN §2.1 T-10 |

### F-01 (Medium, Cross-Feature) — a permanent control documented in a per-feature artifact

This is the same shape as my v1 F-05, which asked for the wave ledger's escape hatch to be written
somewhere an operator would find it and was answered at `pdlc/OPERATIONS.md:30-42` plus a
`CLAUDE.md:106` index entry. The lifetime decision this round makes creates a second instance of
that shape, and the answer stopped one step short.

The facts, checked rather than assumed:

- The gate is `&&`-chained into `test:coverage` (`pdlc/workflows/package.json:9`), which the required
  check `Unit tests (ubuntu-latest, node 20)` runs. It gates **every** PR in this repo from now on,
  not just this feature's.
- PLAN §4.5.1 says so explicitly and correctly: "it outlives this branch whether or not anyone
  maintains it."
- `grep -rn "delta-coverage\|check-wave-resume-delta" pdlc/OPERATIONS.md CLAUDE.md
  pdlc/RELEASE-CHECKLIST.md` returns **nothing**. The only durable description lives in
  `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` §4.5.1 and in the script's own 42-line header.

Why this is a product finding and not an engineering preference: the artifact is **operator-facing**
by construction. The next person to meet it is someone who did not work on this feature, whose PR is
red, on a step whose name is `check-wave-resume-delta-coverage` — a feature that by then is merged
and archived. The two failure modes are the ones the pdlc pipeline exists to prevent: they weaken a
control they do not understand and cannot find an owner for, or they lose a day reading a shipped
feature's PLAN to find out that the control is not about wave resume at all. The script's header is
good — genuinely good, `:34-42` states the lifetime rule — but a header is found only by someone who
has already located the file.

I am not asking for behaviour to change and I am not asking for a rename. What is missing is one
paragraph in `pdlc/OPERATIONS.md`, in the register `:30-42` already uses for the wave ledger: what
the gate asserts (no uncovered line inside the branch's own introduced ranges in
`orchestrate-dev.js`), the one benign green ("no delta in range" — an unrelated branch), the four
fail-closed reds and what each means, and the fact that a red is attributable because the script
prints which base it resolved. `CLAUDE.md`'s CI section is the natural index: its four-check table is
unchanged and correct — the gate lives *inside* `Unit tests`, it is not a fifth check — but a
sentence naming the step inside that check would put the pointer where people already look.

Severity **Medium**, not High: no capability is missing, no acceptance criterion is unmet, and no
oracle is absent. The gate works and is well tested. The gap is that a permanent control is
discoverable only through a document that is about to be archived. Scope **Cross-Feature** per the
tag-selection discipline, deliberately: the lesson generalises past this fix — *when a feature
promotes one of its own tools into a permanent repo-wide control, the promotion is not finished until
the control has a durable home outside the feature's artifacts* — and it recurs, since this is the
second instance in this one feature. That is precisely the "reusable regardless of where the fix
lands" test, and it belongs in `docs/_constraints/DOMAIN-CONSTRAINTS.md` at harvest whether or not
the paragraph is written now.

**What to change:** add the paragraph to `pdlc/OPERATIONS.md` beside the wave-ledger entry and index
it from `CLAUDE.md`, or record a decision that the PLAN is the intended home and accept the archive.
Either resolves it; leaving a permanent required-check step described only in a feature PLAN does
not.

### F-02 (Low, Local) — one oracle in the new suite is a text match, not a behaviour check

`waveResumeDeltaGate.test.js:216-226` — "the module self-executes only when invoked directly" — reads
the script with `cat` and asserts the output contains
`"if (invokedDirectly) process.exit(runDeltaCoverageGate());"`. The guard it checks is real and
load-bearing: without it, importing the module would call `process.exit` and kill the jest worker.
But the assertion is satisfied by the *presence of the text*, so commenting the line out
(`// if (invokedDirectly) …`) leaves the test green while the guard is gone.

In practice this is close to harmless, which is why it is Low and not Medium: if the guard actually
broke, the other **twelve** tests in the same file would fail to run at all, loudly. The behavioural
proof already exists — it is the suite's own ability to import the module. The text assertion adds a
false sense of a dedicated check.

**What to change:** either assert the behaviour (import the module in a case that would not survive a
top-level `process.exit`, and assert the gate's exported symbols are reachable), or keep the text
check and reword the title to say what it is — a source-shape reminder, not an exit-guard oracle. The
second is legitimate; what should not stand is a test title claiming an oracle the assertion does not
provide.

## Questions

| ID | Question |
|----|---------|
| Q-01 | **FSPEC AT-16 still disagrees with DEC-WVR-07, unchanged since v2.** `FSPEC-pdlc-wave-resume.md:406-412` still requires, without qualification, that "both resolve the same outcome, the same resume point and the same provenance, **and the queue run's own report states them**". No shipped test observes a delegated run's report — by design, per DEC-WVR-07 option O-9 — and `waveResumeQueueParity.test.js:1-23` now says so in its own header, explicitly disowning FSPEC as the source of its narrowing. So AT-16 as written is unmet, while AT-16 as narrowed is met. This is an upstream document defect, not a defect in the code or in the PLAN in front of me, so I am routing it as **ERRATUM: FSPEC** again rather than folding it into the verdict. Should AT-16's text be amended to carry DEC-WVR-07's narrowing, or should DEC-WVR-07 be re-opened? Either resolves it; two documents disagreeing about a P0-adjacent acceptance test does not. |
| Q-02 | Does F-01's paragraph belong in this feature, or at harvest? The fix is one paragraph, but §4.5's own closing argument — that the durable fix for a records gap "belongs upstream of this checklist" — applies here too. I have no objection to it being routed as a process/constraint item instead of retro-fitted, provided it is *routed* rather than assumed. |
| Q-03 | `PINNED_BASE_SHA` (`check-wave-resume-delta-coverage.mjs:54`) is now asserted to be a real ancestor of `HEAD` (`waveResumeDeltaGate.test.js:200-213`), which closes the "silently wrong pin" hole I worried about in v2's Q-03. But that assertion runs against the real repository, so it pins the *current* branch's ancestry. After merge, is the pin expected to remain — a permanent fallback for a permanent gate, which is coherent — or is it feature residue? §4.5.1 answers this for the gate but not for the constant. Not a finding; the fallback is correct either way, and the ancestry test means a wrong value reds rather than lying dormant. |

## Positive Observations

- **The reversal of my own v2 praise was handled the right way round.** I had commended the
  hard-failing empty-range set by name. The remediation did not quietly keep it to avoid contradicting
  a reviewer, and did not throw the property away either — it split the one reading into five,
  four of them fail-closed, and put the case that motivated the change **first** in the new suite
  with a comment naming what round 1 got wrong. That is how a reviewer's finding should be
  overturned: by showing the mechanism, not by arguing.

- **PLAN §4.5's three unticked boxes are the best thing in this delta.** Anyone can tick eighteen
  boxes. Leaving three unticked, in italics, each naming the specific artifact that does not exist
  (the Phase I run log; the single-commit landings `196dab92`/`42d0592a`/`fa17fb78`; four of five
  mutation runs unrecorded) is a completion record a future maintainer can actually trust — because
  it demonstrably distinguishes "done" from "not observed". The closing sentence, that manufacturing
  the evidence now would be worse than recording its absence, is the correct product judgement and
  I want it preserved at harvest.

- **The census fix understood the difference between symmetry and anchoring.** TE F-11's hole was
  subtle: two-way set-equality between disk and manifest is symmetric, so deleting a suite *and* its
  manifest row keeps both sides equal and reds nothing.
  `waveResumeRepoState.test.js:229-250` adds a **transcribed literal** of the six suite names —
  "never derived from either side", says the comment — and asserts both sides against it in one
  `toEqual`. That is completeness-as-set-equality applied to the oracle itself, not just to the
  thing it watches.

- **F-02's fix went looking for the same error elsewhere.** I flagged one comment line. `f59266b2`
  fixed it, then found and fixed the identical misstatement in PLAN §4.5.1 that I had not caught,
  and re-measured the 836 figure rather than copying it forward. Nothing compelled the second half.

- **Every number in the documents matches a command I ran.** 205 tests; `build-runtime.mjs --check`
  in-sync, exit 0; `test:coverage` exit 0; 88.90 % per-file branches; 836 uncovered lines in file;
  **0** inside the introduced ranges; nine `✅` in §2.1. The 836-versus-0 contrast is still the
  whole argument for why this feature needed a delta oracle, and it is now printed on every CI run
  of every PR — which is exactly what F-01 asks be written down somewhere durable.

## Recommendation

## Verdict
