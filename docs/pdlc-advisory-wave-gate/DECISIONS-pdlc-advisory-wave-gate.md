# DECISIONS — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` (`docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` v1.5) |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | none yet |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.0 | 2026-08-20 |

## Context

A6 is the sixth advisory seam: it fires at exactly one place — Phase I's wave loop, at the moment
the script-owned test gate goes red — snapshots the tree, attempts one bounded in-envelope repair,
re-runs the wave's own gate sequence, and either keeps the repair or restores the snapshot
byte-identical and halts with a diagnosis attached. TSPEC v1.5 settles the design; this document
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
- **The wave contract forbids agent commits.** `waveImplementPrompt` tells wave agents
  `Do NOT git commit`, so at gate time the index equals HEAD and the uncommitted working tree *is*
  the wave's work — the asset every restoration option is judged against.
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
| **D (chosen). A dangling snapshot commit built without touching the tree** | `git add -A` → `write-tree` → `commit-tree` → `update-ref refs/pdlc/a6-snapshot-{waveNum}` → `reset --mixed {head}`; restore is `read-tree --reset -u` + `clean -fd` + `reset --mixed` | — |

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

### For DEC-04 — whether `waveBudgetPerRun: 0` is a configuration error

| Option | Rejected because |
|---|---|
| **A. Reuse the shipped `positiveInt` validator** | `positiveInt` accepts a value only when `Number.isInteger(v) && v >= 1`, otherwise pushing the key onto `invalidKeys` and returning the default. `0` would therefore be reported invalid and silently defaulted to `1`: an operator asking for "no A6" would get one A6 dispatch per run, the opposite of the request |
| **B. Reject `0` loudly at parse time** | Contradicts E-33, which requires `0` to survive as a configured value, and discards a coherent affordance for no gain |
| **C (chosen). Add a sibling `nonNegativeInt` (`Number.isInteger(v) && v >= 0`) beside it, used by this key alone** | — |

## Decision

### DEC-A6-01: The pre-repair tree is captured as a dangling snapshot commit, never stashed

**Decision.** Capture builds a commit object without touching the working tree — `git rev-parse
HEAD`, `git add -A --`, `git write-tree`, `git commit-tree {tree} -p {head}`, `git update-ref
refs/pdlc/a6-snapshot-{waveNum}`, then `git reset --mixed {head}` to put the index back. Restore is
`git read-tree --reset -u {tree}`, `git clean -fd`, `git reset --mixed {head}`. Both run through the
injected `_git(argv)` transport, with `add` and `reset` going through `gitWithLockRetry`.

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

**Constraints that forced the shape.** Pathspec-scoped commits are the discipline M-WG-4 rests on;
`commitPaths` requires `message` and `what` (it is not a two-argument call), so a new call is fully
specified here rather than left to Phase I. AT-04-3's oracle is over writer *identities*, which both
shapes preserve — the choice is therefore not test-forced, which is exactly why it is recorded here.

**Reversibility:** easy, with one caveat — the commit *message* is asserted by AT-04-5, so a later
reshaping is a test-visible change, not a silent one.

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

**Re-evaluation triggers:** an operator investigation is ever lost to the re-run overwrite; a run id
or capture timestamp becomes available in Phase I scope; or the accumulated refs (one per wave per
run, in a namespace nothing prunes) become an operational complaint, at which point pruning and
discrimination are decided together.

### DEC-A6-04: `waveBudgetPerRun: 0` is a supported affordance, validated by a new `nonNegativeInt`

**Decision.** `parseAdvisoryConfig` gains `nonNegativeInt` (`Number.isInteger(v) && v >= 0`) beside
the shipped `positiveInt`, and `waveBudgetPerRun` is the only key that uses it. `0` means "keep the
tier on, keep A6 off": every red wave escalates with no dispatch, and the sixth summary row is
present reading zero. Per-key independent fallback is preserved — one bad key never retunes the
others.

**Constraints that forced the shape.** E-33 requires `0` to survive as configured; `positiveInt`
cannot express that; the shipped validator must not change, because A1–A5's keys depend on it.

**Reversibility:** easy. **Re-evaluation triggers:** a second key ever needs a non-negative integer
(then the helper is general, not A6's); or operators use `0` as a de-facto kill switch often enough
that a first-class per-seam `enabled` map becomes the better surface.

## Consequences
