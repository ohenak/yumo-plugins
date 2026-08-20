# DECISIONS — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` (`docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` v1.10) |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-DECISIONS-v1.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`, `CROSS-REVIEW-product-manager-DECISIONS-v2.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v2.md`, `CROSS-REVIEW-product-manager-DECISIONS-v3.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v3.md` |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.2 | 2026-08-19 |

## Context

A6 is the sixth advisory seam: it fires at exactly one place — Phase I's wave loop, at the moment
the script-owned test gate goes red — snapshots the tree, attempts one bounded in-envelope repair,
re-runs the wave's own gate sequence, and either keeps the repair or restores the snapshot
byte-identical and halts with a diagnosis attached. TSPEC v1.10 settles the design; this document
records the four load-bearing choices inside it that had a live alternative, so that a later reader
finds the rejected option and its reason here rather than reverse-engineering it from a test oracle.

Two of the four are the entries TSPEC §6 nominates explicitly ("Two entries warrant a DECISIONS
document for this feature"): the restoration mechanism (§2.5) and the E-6 promotion commit shape
(OQ-8, raised as PM F-06). Two more are recorded because they are configuration- and
operator-visible and were re-litigated across review rounds: the snapshot ref's name (OQ-2, PM F-02
and PM F-03) and the admission of `waveBudgetPerRun: 0` as a legal configured value (OQ-1, E-33).

Constraints that shaped all four, none of them this feature's to change:

- **One module, one bundle.** The workflow runtime loads a single built artifact
  (`pdlc/workflows/dist/orchestrate-dev.bundle.js`); every advisory-tier symbol A6 reuses —
  `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry` — lives in
  `pdlc/workflows/orchestrate-dev.js`. A new file is not an option, so "add a module" never appears
  as an alternative below.
- **No new transport.** A6 gets `_git`, `_runCommand`, `_readFile`, `_appendFile` and `_agent`
  already threaded through Phase I (NFR-3). Anything a decision needs, it needs from those.
- **The wave contract forbids agent commits *and* agent staging.** `waveImplementPrompt` tells wave
  agents, in full, `Do NOT run git add or git commit — the orchestrator verifies your work and
  commits it.` The prohibition on `git add` is the load-bearing half: it is what makes "the index
  equals HEAD at gate time" true, and that premise is what the `reset --mixed` exactness argument
  rests on. With the index at HEAD, the uncommitted working tree *is* the wave's work — the asset
  every restoration option is judged against.
- **Advisory tier ships disabled** (`ADVISORY_DEFAULTS.enabled: false`). A decision that only
  changes behaviour under `advisory.enabled: true` costs a default-configured repo nothing, which
  is why the reversibility ratings below are as cheap as they are.

## Options Considered

Each option below was reachable with the transports A6 already has; none was rejected for being
unbuildable. The rejection reason is stated against shipped code, not intuition.

### For DEC-01 — how the pre-repair tree is captured and restored

| Option | Mechanism | Rejected because |
|---|---|---|
| **A. `git stash push --include-untracked`, `git stash pop` to restore** | One command each way, no plumbing | **Capture mutates the working tree.** `stash push` reverts the tree to HEAD as its *first* act, so the wave's uncommitted work — the exact asset BR-9 exists to protect — is removed at the moment A6 starts diagnosing it. The A6 agent would then diagnose an empty wave. A restore that pops it back is a second failure surface on the same asset, and `pop` on a dirty tree can conflict. No `stash` call exists anywhere in `orchestrate-dev.js` today, so this would also be a first |
| **B. Copy the working tree aside with `_runCommand("cp -a …")` and copy back** | Reachable: `_runCommand(command)` is a real Phase I transport returning `{ok, output}` | Introduces a shell dependency and a filesystem path this workflow does not otherwise own, on a runtime whose modules cannot use `fs` or `process`. It also has no ignore semantics at all: a `cp -a` restore would have to decide by hand what `node_modules/` means. More mechanism, weaker guarantee |
| **C. Restore only the paths the repair declared (`producedPaths`)** | Cheapest of all — no capture step | Does not satisfy BR-9. The re-run post-wave command writes into paths no envelope rule ranges over (generated bundles under `implementation.postWavePathspecs`), so a path-scoped restore provably leaves them changed. AC-5.1's oracle is content-level over the whole tree |
| **D (chosen). A dangling snapshot commit built without touching the tree** | `git add -A` → `write-tree` → `commit-tree {tree} -p {head} -m "…"` → `update-ref refs/pdlc/a6-snapshot-{waveNum}` → `reset --mixed {head}`; restore is `read-tree --reset -u` + `clean -fd` + `reset --mixed` | — *save the same ignored-path boundary C is rejected on: `git add -A` skips `.gitignore`d paths, so D's snapshot never holds generated output written into an ignored path either. Whether AC-5.1's oracle ranges over ignored paths at all is upstream's open question (TSPEC §6 OQ-7), not D's answer* |

### For DEC-02 — how an E-6 promotion reaches git history

| Option | Mechanism | Rejected because |
|---|---|---|
| **A. Widen the owning per-task `commitPaths` call's `paths`** | The reading FSPEC BR-8's licence ("that scope may widen under O-8's E-6 resolution") most literally suggests | One task's commit would carry another task's owned paths. The wave loop's per-task commit is pathspec-scoped precisely so that a commit names one task's files — `commitPaths({paths: task.files, message: waveCommitMessage(featureName, task), what: "Wave N task T", …})`. Widening it breaks the property M-WG-4 rests on, and does so invisibly in git history |
| **B. Leave the repair uncommitted for the later task's agent to commit** | No new call at all | The wave loop is the only writer past the green gate, and wave agents are told `Do NOT git commit`. A resolved wave would strand its own repair as an uncommitted change, and a later run would never see it |
| **C (chosen). One further `commitPaths` call after the per-task loop, inside the same `if (waveGit)` block and past the same green gate** | Full argument set, own `message` and `what` label | — |

Option C is not a new shape in this loop. The wave already makes a **second** kind of commit past
the same gate — the build-outputs call, whose `message` is the template `chore({feature}): wave {N}
build outputs` and whose `what` is `Wave {N} build outputs`, guarded by `postWaveRan &&
implConfig.postWavePathspecs.length > 0`. "A commit that is not a task's commit, carrying its own
label" is therefore shipped precedent, not an invention.

### For DEC-03 — what the snapshot ref is named

| Option | Rejected because |
|---|---|
| **A. One fixed name, `refs/pdlc/a6-snapshot`** | A later wave's capture — including a no-dispatch, over-budget one — overwrites the record of an earlier, *resolved* wave's pre-repair tree, which is the tree an operator is most likely to want to inspect or undo (PM F-03) |
| **B. Wave- and run-discriminated, e.g. `refs/pdlc/a6-snapshot-{runId}-{waveNum}`** | Not rejected on merit — deferred. Phase I has no run id in scope, and a capture timestamp would make the ref name unpredictable to the halt message that has to print it. The cost of omitting the discriminator is bounded and operator-side (below) |
| **C (chosen). Wave-scoped, `refs/pdlc/a6-snapshot-{waveNum}`** | — |

Option A's rejection **is falsifiable at TSPEC v1.10**, and the loop that made it so closed
upstream. This entry's v1.1 revision recorded the rejection as "stated but not falsifiable" — every
fixture that observed the ref (§3.2's over-budget case, §5.5's capture assertions) ran a *single* A6
wave and saw a single `update-ref`, so a regression to option A's fixed name passed all of them —
and routed the missing oracle upstream (TE F-05). It landed. §4.5's snapshot-ref row now qualifies
"one ref per wave, never overwritten by a later wave" as asserted on §5.2's two-red-wave run, a
property a single-wave fixture cannot see; and §5.2 carries the fixture: one run, two A6 waves, both
gates red, the set of `update-ref` targets observed on the `_git` double set-equal to
`{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}` — two distinct targets, each written once, so a
fixed-name regression writes one target twice and fails on both conjuncts. Read the rejection as a
tested commitment.

### For DEC-04 — whether `waveBudgetPerRun: 0` is a configuration error

| Option | Rejected because |
|---|---|
| **A. Reuse the shipped `positiveInt` validator** | `positiveInt` accepts a value only when `Number.isInteger(v) && v >= 1`, otherwise pushing the key onto `invalidKeys` and returning the default. `0` would therefore be reported invalid and silently defaulted to `1`: an operator asking for "no A6" would get one A6 dispatch per run, the opposite of the request |
| **B. Reject `0` loudly at parse time** | Contradicts E-33, which requires `0` to survive as a configured value, and discards a coherent affordance for no gain |
| **C (chosen). Add a sibling `nonNegativeInt` (`Number.isInteger(v) && v >= 0`) beside it, used by this key alone** | — |

## Decision

### DEC-A6-01: The pre-repair tree is captured as a dangling snapshot commit, never stashed

**Decision.** Capture builds a commit object without touching the working tree — `git rev-parse
HEAD`, `git add -A --`, `git write-tree`, `git commit-tree {tree} -p {head} -m "…"`, `git update-ref
refs/pdlc/a6-snapshot-{waveNum}`, then `git reset --mixed {head}` to put the index back. Restore is
`git read-tree --reset -u {tree}`, `git clean -fd`, `git reset --mixed {head}`. Both run through the
injected `_git(argv)` transport, with `add` and `reset` going through `gitWithLockRetry`.

The `-m "…"` on `commit-tree` is **not optional and not cosmetic**, and it is transcribed here
verbatim from TSPEC §2.5's block for that reason — but the failure mode is silence, not a block, and
v1.1's account of it was wrong (TE v2 F-01, carried here rather than across another round). A
`commit-tree` invoked without `-m` reads its message from stdin; the shipped transport `defaultGit`
runs `execFileSync("git", args, { stdio: "pipe", encoding: "utf8" })` with no `input`, so the child
sees an empty stdin rather than an error. Measured against real git: `git commit-tree {tree} -p HEAD
</dev/null` exits `0` and prints an object id, with an **empty commit message**. So a `-m`-less
capture does not fail loudly at the seam — it writes a valid, unlabelled snapshot commit, and the
operator who later inspects `refs/pdlc/a6-snapshot-{waveNum}` finds an object with nothing on it
saying which wave or which repair it belongs to, which is the whole point of capturing it.
No test catches the omission either: §5.5's oracle is an **argv-sequence** assertion over the `_git`
double's recorded argv (`commit-tree === 1`, plus an `update-ref` on the snapshot ref), and a double
answers a `-m`-less argv as happily as a correct one. The literal belongs in the implementing task's
argv, not in its judgement.

**Constraints that forced the shape.** BR-9's oracle is content-level over tracked *and* untracked
files, so path-scoped restoration is out. The wave's uncommitted work is the protected asset, so a
capture that mutates the tree is out. `clean -fd` deliberately omits `-x`, because `git add -A`
never records ignored paths and a restore that deleted what capture never held would be a worse
defect than the one it fixes — capture and restore share one ignore semantics because they must.
Whether BR-9's oracle ranges over ignored paths at all is an upstream question already raised as an
erratum (TSPEC §6 OQ-7) and is **not** decided here; this decision fixes the *symmetry*, not the
boundary.

**Reversibility:** easy. The mechanism is two module-private functions (`captureTreeSnapshot`,
`restoreTreeSnapshot`) behind a call site that runs only under `advisory.enabled: true`.

**Re-evaluation triggers:** git gains a genuinely non-mutating stash-capture; the wave contract
changes to permit agent commits or staged work (which would invalidate the `reset --mixed` exactness
argument, TSPEC §6 OQ-5); or the OQ-7 erratum returns holding ignored generated outputs inside the
oracle, in which case capture grows a *scoped* ignored-path arm over the post-wave pathspecs only —
never the whole ignored tree.

### DEC-A6-02: An E-6 promotion is committed by its own `commitPaths` call, not by widening a task's

**Decision.** A resolved wave whose repair landed in a later task's owned paths makes one additional
`commitPaths` call after the per-task loop, inside the same `if (waveGit)` block and past the same
green gate, with `paths` = the promotion's produced paths, `message` = `chore({feature}): wave {N}
advisory promotion ({taskId})`, `what` = `Wave N advisory promotion (task T)`, and the wave loop's
own `_git`, `_sleep`, `emit` and `provenance`. FSPEC BR-8's licence to "widen scope" is therefore
read as *licence to commit the promotion*, not as licence to enlarge another task's pathspec.

**Upstream now states this shape, and cites this entry for the rejection.** v1.1 of this record
superseded two pieces of upstream text that described option A; one of the two has since been
corrected. TSPEC §1.1's obligation table, row O-8, no longer resolves the obligation by widening an
existing pathspec: at v1.10 it reads "**One further `commitPaths` call** after the per-task loop,
inside the same `if (waveGit)` block, carrying the promotion's paths under its own `message` and
`what` (§3.6); the owning task's own commit keeps its own pathspec, unwidened", and names "the
rejected option A of `DECISIONS-pdlc-advisory-wave-gate.md`'s DEC-A6-02" explicitly. The row and
§3.6's body agree, and the reader who enters through the obligation table now meets the rejection
where v1.5 hid it (PM F-03, TE F-07 — landed). What remains is one, not two: FSPEC BR-8's clause
"that scope may widen under O-8's E-6 resolution" is permissive rather than wrong — it licenses this
decision's shape too — so it is left standing and read through this entry.

**Constraints that forced the shape.** Pathspec-scoped commits are the discipline M-WG-4 rests on;
`commitPaths` requires `message` and `what` (it is not a two-argument call), so a new call is fully
specified here rather than left to Phase I. AT-04-3's oracle is over writer *identities*, which both
shapes preserve — the choice is therefore not test-forced, which is exactly why it is recorded here.

**Reversibility:** easy, with one caveat — the commit *message* is asserted, so a later reshaping is
a test-visible change, not a silent one. The oracle is **TSPEC's**, not FSPEC's: TSPEC §7's
test-mapping row for AT-04-5 identifies the promotion commit "by its `message` literal and its
pathspec", and §3.6 fixes that literal. FSPEC's own AT-04-5 asserts four other things — the repair in
the branch's committed state, no residual working-tree change, the advisory record naming the paths,
and the later task's dispatch being told — and does not range over the message at all. The caveat
holds; only the citation needed fixing, and it needed fixing because "a test will catch it" is a
reversibility rating an operator acts on, and it is true only of the test that actually catches it
(PM F-04).

**Re-evaluation triggers:** FSPEC BR-8 is rewritten to name the per-task commit explicitly; the wave
loop stops being the sole writer past the gate; or operators report that a third commit per resolved
wave is noise in `git log` (in which case the remedy is a squash at commit time, never a widened
task pathspec).

### DEC-A6-03: The snapshot ref is wave-scoped and carries no run discriminator

**Decision.** `refs/pdlc/a6-snapshot-{waveNum}` — one dangling ref per wave, never pushed, never
pruned by this feature, and named from the wave number alone. A run that resolves wave 1 and halts
on wave 2 ends holding both refs; a *re-run* of a halted feature reaches wave 1 and overwrites
`refs/pdlc/a6-snapshot-1`.

**Constraints that forced the shape.** The halt message must print the ref name, so the name has to
be derivable from what the halting wave knows. Phase I has no run id.

**Reversibility:** easy — the name is computed in one function and printed in one halt field.

**Known gap in the remedy's reach (PM F-05).** The "copy the ref" remedy below is documented in
TSPEC §2.5 and in this record — neither of which an operator reads at halt time. FSPEC E-28 requires
the halt to name the failed restoration and TSPEC requires it to name the ref, so at halt an operator
learns the object's *name* but gets no indication that the ordinary next step after a halt —
re-running the feature, which §2.5 itself describes — destroys it. Putting that sentence on the halt
message is a product decision about an operator-facing obligation and therefore belongs in
REQ/FSPEC, not here; the PM is routing it. This entry carries the gap in the meantime.

**Re-evaluation triggers:** an operator investigation is ever lost to the re-run overwrite; a run id
or capture timestamp becomes available in Phase I scope; or the accumulated refs (one per wave per
run, in a namespace nothing prunes) become an operational complaint, at which point pruning and
discrimination are decided together; or the halt-message obligation the PM is routing to REQ lands,
in which case the remedy stops being record-only and this entry's known gap closes.

### DEC-A6-04: `waveBudgetPerRun: 0` is a supported affordance, validated by a new `nonNegativeInt`

**Decision.** `parseAdvisoryConfig` gains `nonNegativeInt` (`Number.isInteger(v) && v >= 0`) beside
the shipped `positiveInt`, and `waveBudgetPerRun` is the only key that uses it. `0` means "keep the
tier on, keep A6 off" **at the dispatch level, not at the mechanism level**: every red wave still
enters A6 and still *captures* — per TSPEC §3.2 step 3 the capture precedes the budget read, so an
over-budget wave writes its `write-tree`/`commit-tree` pair and its
`refs/pdlc/a6-snapshot-{waveNum}` — then escalates with `reason: "budget-exhausted"` and dispatches
no agent. The sixth summary row is present reading zero. That ordering is deliberate, not incidental:
it is what leaves an operator running with `0` a pre-repair snapshot to inspect. Read together with
DEC-A6-03, `0` therefore still accumulates one ref per red wave; it suppresses agent calls, not
git objects (TE F-04). Per-key independent fallback is preserved — one bad key never retunes the
others.

**Constraints that forced the shape.** E-33 requires `0` to survive as configured; `positiveInt`
cannot express that; the shipped validator must not change, because A1–A5's keys depend on it.

**Reversibility:** easy. **Re-evaluation triggers:** a second key ever needs a non-negative integer
(then the helper is general, not A6's); or operators use `0` as a de-facto kill switch often enough
that a first-class per-seam `enabled` map becomes the better surface.

## Consequences

### What follows from DEC-A6-01

- **Five new git verbs enter this workflow**, not two. `write-tree`, `commit-tree`, `update-ref`,
  `read-tree` and `clean` each appear **zero** times in `orchestrate-dev.js` today; `git clean` in
  particular is never invoked, the only `"clean"` strings in the module being `parseRebaseStatus`'s
  rebase-status vocabulary, which is not a git verb at all. The verbs A6 reuses rather than
  introduces are `add`, `reset` (shipped once, as `reset --hard` on the seam-revert path) and
  `rev-parse`. The count matters because it sizes the double: every `_git` double A6 touches has to
  answer all five, and the restore path is the half most easily left unanswered — which is why
  TSPEC §5.2's fixtures assert on the observed argv sequence rather than on outcomes alone, and why
  §5.5 counts a capture-*unique* verb (`commit-tree === 1`) rather than raw `_git` calls, since
  `restoreTreeSnapshot` drives the same transport with `read-tree`/`clean`/`reset`. An
  under-enumerated verb set is exactly how a restore-path double false-greens (TE F-02).
- **Fail-closed in both directions.** Any capture or restore call returning `ok !== true` throws. On
  the restore side the throw surfaces through `seamOps.revert()`, which `runAdvisorySeam`'s
  `doRevert` tags `__isRevertFailure` and whose terminal catch rethrows rather than mapping to an
  escalation — shipped behaviour, relied on rather than re-invented.
- **Capture failure escalates, then halts** — in that order — writing its record through
  `appendAdvisoryEntry` and `appendEscalationEntry` directly, because the driver is never entered.
  The `__preDispatch` escape is unavailable on this path: it is a return value of
  `seamOps.gatherEvidence()`, and `gatherEvidence` is called *inside* the driver's `while (true)`
  attempt loop, which a `consumesAttempt: true` gate re-enters — capture there would re-capture on
  attempt 2 and break the one-snapshot-per-wave invariant.
- **A wave that staged something anyway loses its staging, never its content.** The `reset --mixed`
  is exact only because the wave contract keeps the index equal to HEAD. This is an accepted
  deviation, inside BR-9's content-level oracle (TSPEC §6 OQ-5).
- **The ignored-path boundary is inherited, not set here.** If the OQ-7 erratum returns holding
  ignored generated outputs inside AC-5.1, this decision's mechanism grows an arm; the *stash*
  rejection is unaffected either way.

### What follows from DEC-A6-02

- A resolved wave with a promotion produces **three** commit kinds on the branch: per-task commits,
  the promotion commit, and (when a post-wave command ran with pathspecs configured) the build-output
  commit. An operator reading `git log` sees the promotion as its own entry with its own message —
  the intended legibility, and the reason the message literal is fixed in TSPEC §3.6 rather than
  left to Phase I.
- The later task's dispatch is *also* told through the prompt: `waveImplementPrompt` gains an
  optional third argument, a `Map<taskId, {paths, symbol}>`. Absent a row the prompt is
  byte-identical to today's, which is what keeps every existing prompt fixture green.
- **Cross-run asymmetry, accepted.** The map lives in Phase I scope, so the prompt clause reaches a
  later task in the same run only; the *commit* survives across runs, so a later run's agent finds
  the promotion in the tree regardless. The clause is a shortcut, not the mechanism (TSPEC §6 OQ-6).

### What follows from DEC-A6-03

- The promise A6 makes an operator is **run-scoped**: the pre-repair tree of a halting wave is
  recoverable *until the next run of that feature*. What an overwrite costs is inspectability of a
  pre-repair tree, never content — a retained repair is gate-verified and committed in its own wave
  commit.
- The documented operator remedy, until DEC-A6-03 is revisited: copy the ref before re-running a
  halted feature.
- Refs accumulate — one dangling commit object per wave per run — and nothing in this feature deletes
  them (TSPEC §6 OQ-2).

### What follows from DEC-A6-04

- `.claude/pdlc.config.example.json` gains the key, and `pdlc/engine`'s `ci-arrangement` test must
  gain a **new** expectation over it. Nothing "moves": the tracked example carries exactly two
  sections today, `dispatch` and `implementation`, with no `advisory` section at all, and
  `pdlc/engine/__tests__/ci-arrangement.test.js` contains zero occurrences of `advisory` — it reads
  the example file and asserts only on `implementation.testCommand`. Adding
  `advisory.waveBudgetPerRun` to the example therefore breaks no engine expectation and, as things
  stand, requires no engine edit to stay green. This is still a two-channel edit, but the second
  channel's work is *authoring a new expectation*, which is a different size and a different risk
  from relocating one. That work now has an owner: TSPEC §4.4 carries the claim, and §5.1's
  file-ownership map assigns the expectation to a **new file**,
  `pdlc/engine/__tests__/advisory-config-example.test.js` — deliberately *not* to
  `ci-arrangement.test.js`, whose stated oracle is FSPEC §5.1's CI arrangement alone, and which a
  config-schema assertion would let an unrelated example edit redden under the delivery-blocking
  `Engine tests (ubuntu-latest)` check. No FSPEC acceptance test ranges over it and none is expected
  to: upstream states the coverage as TSPEC-owned (§5.1), so this is a deliberate allocation, not an
  open gap. The product reason to do the work rather than drop the claim:
  `waveBudgetPerRun: 0` is a documented operator affordance (REQ C-2, FSPEC E-33), the example is the
  operator's first and possibly only encounter with the key on a tier that ships off by default, and
  an affordance nothing asserts into the example can ship working and undiscoverable (PM F-01,
  TE F-06).
- `waveBudgetPerRun: 0` and `advisory.enabled: false` are **observably different** and must stay so:
  the former reports a sixth advisory row reading zero, the latter carries no `advisory` key at all.
  **The collapse is falsified upstream at TSPEC v1.10.** v1.1 of this entry recorded that nothing
  exercised the behaviour it rests on — the FSPEC ATs reach `0` only obliquely (AT-01-4 is the
  disabled-tier case; AT-01-6's premise is "tier enabled, **no wave red**", so it never reaches the
  budget gate; AT-07-2b is parse-level only, `0` in, `0` back, absent from `invalidKeys`) — and
  routed the missing behaviour arm upstream (TE F-03). It landed. TSPEC §5.2 now carries the
  fixture written to exactly this spec: one run, tier **enabled**, `waveBudgetPerRun: 0`, the first
  wave's script gate red, disposition `escalated` with `reason: "budget-exhausted"`, the `_agent`
  double recording **zero** calls, the snapshot still taken (§3.2 step 3's capture-before-budget
  order), and the report's advisory summary key **present** with the sixth row's counters at zero.
  That present-and-zero conjunct is what separates this arm from `advisory.enabled: false`, where
  the key is absent entirely (AT-01-4) — so a future "simplification" collapsing `0` into
  `enabled: false` now fails the suite rather than passing it. The behaviour is decided here and
  asserted upstream; nothing further is owed by this record.

### What follows for the whole feature

- None of the four decisions changes behaviour for a repo that configures nothing:
  `ADVISORY_DEFAULTS.enabled` stays `false`, so the default-configured run is byte-identical to
  today's. This is what keeps all four ratings at "easy" reversibility.
- Three transcribed set-equality surfaces move together when A6 lands — `ADVISORY_SEAMS`,
  `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS`. The **constants** are three; their counterparts are
  not, and the PLAN must be sized against the counterparts. The five-member seam literal
  `["A1", "A2", "A3", "A4", "A5"]` is transcribed at six sites under `pdlc/workflows/__tests__/` —
  the `ADVISORY_SEAMS` set-equality in `advisoryEnvelope`, a report-row assertion and a `test.each`
  table in `advisoryRecord`, a harvest-row assertion in `advisoryHarvest`, a generator pick in
  `consolidationProperties`, and a `SEAMS` constant inside the shared `advisoryDoubles` helper. The
  four-member envelope literal `["E-1", "E-2", "E-3", "E-4"]` is transcribed at six more code
  sites — `advisoryEnvelope`'s `ENVELOPE_DEFAULTS` set-equality, two in `advisoryDisabled`, one in
  `advisoryHarvest`, and two in `helpers/advisoryDoubles.js` (the frozen `ADVISORY_DEFAULTS_SHAPE`
  and the property generator's shuffle) — **plus a seventh in prose**: the `advisoryDoubles` comment
  that records why the frozen shape must be hand-synced restates the literal itself. A comment that
  restates a set-equality literal is a maintenance site like any other — it is what a later editor
  reads to decide whether the copy below is still right — so the envelope's hand-sync surface is
  seven, not six (TE v2 F-03).
- The shared double is the coupling the other two surfaces do not have: `advisoryDoubles.js` carries
  *both* literals plus the frozen defaults shape, so a partial edit reddens tests in files that never
  mention the changed constant, with a failure reason the record cannot predict. Sequencing all of
  this as **one task remains the right call** — that co-movement is the failure class A6 itself
  exists to survive — but it is one task touching roughly a dozen transcriptions and one shared
  helper, not one task touching three constants. Sized as the latter, it invites exactly the partial
  edit the set-equality discipline exists to catch (PM F-02).
