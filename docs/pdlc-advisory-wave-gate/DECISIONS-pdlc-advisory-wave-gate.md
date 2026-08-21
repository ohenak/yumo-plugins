# DECISIONS — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**`, pinned at HEAD on 2026-08-20 (TE v3 F-03): REQ v1.16 (`sha256:f97f4f66…`), FSPEC v1.7 (`sha256:d602c440…`), TSPEC v1.15 (`sha256:1f6ea486…`). The cell pins all three, not TSPEC alone, because a decision record's upstream-dependent claims can be falsified by an edit to any of them — as v1.12's repair below records. |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | Rounds 1–11 per reviewer (`CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1…v11.md`) were **harvested and deleted** at commit `9cf48051` ("docs(learnings): delete harvested cross-reviews and DoD code reviews") — read them there or in `LEARNINGS-pdlc-advisory-wave-gate.md`. Round numbering then restarted: the current round is `CROSS-REVIEW-product-manager-DECISIONS-v1.md` and `CROSS-REVIEW-test-engineer-DECISIONS-v1.md` (post-harvest round 1). Convention adopted here (PM F-04, TE F-07): this cell indexes rounds *responded to*, and harvested rounds are named as harvested rather than enumerated as live files. |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.12 | 2026-08-20 |

**On dates and on resolution vintage (PM v4 F-07, TE v4 F-02 / Q-01).** Revisions 1.0 and 1.1
carried `2026-08-20`, a date that had not happened; 1.2 corrected it to `2026-08-19` without
saying so, which left the history reading as though it ran backwards. The correction stands and
this is the note it was owed. Related convention, adopted here so the next reader does not
re-derive it: a finding is resolved against **upstream at the time of the edit**, not against the
upstream version the finding cited. Where the two differ, the resolving text says which version it
landed on — as the engine-channel and O-8 passages below do for TSPEC v1.11 against findings
written at v1.5/v1.6.
**On v1.8, and the sizing block that used to live here (POSTMORTEM-D §6 steps 1–2, PM v8 Q-01).**
Through v1.7 the `## Consequences` section carried a three-column sizing block — how many surfaces
A6's constants touch, how many already read the post-A6 value, how many are ungated prose. It is a
measurement of the working tree, not a consequence of a decision: its truth conditions move with
every commit, its consumer is PLAN's batch sizing, and it produced a finding in each of five
consecutive review rounds while `DEC-A6-01`…`DEC-A6-04` stood byte-frozen. v1.8 moves it whole to
`SIZING-pdlc-advisory-wave-gate.md`, a PLAN appendix cited from PLAN's Overview HEAD-drift note, and
leaves a pointer plus the one number that belongs beside the decisions. Two changes were made in the
move: the already-migrated-sites bullet is folded into column (2) as one enumeration read
two ways, and the clause that reconciled the two counts is deleted rather than reworded — a sentence
naming two counts inherits the staleness of whichever one was not re-run, which is the defect
generator POSTMORTEM-D §5 names. No decision entry is touched, and no count is restated here.

**On v1.9 (Phase-P erratum round, TE v9 F-01).** Two current-state repairs, no design change. (1) The
v1.8 paragraph above quoted the relocated bullet by its cardinality ("the *twelve* already-migrated
sites"); accurate as a description of what moved, but a HEAD measurement sitting in the one document
whose stated purpose is to hold none, and readable as a current claim by anyone who does not parse it
as a quotation. The integer is dropped; the bullet is named by subject instead, which loses nothing —
no reader needs the old bullet's cardinality to understand the move. `SIZING-pdlc-advisory-wave-gate.md`
remains the sole carrier of that number. (2) The Cross-Reviews cell records the round-9 reviews.
Re-grounded on upstream **as it stood at the v1.9 edit** — these hashes are that
round's dated observation, not a current pin; the header's `Upstream` cell carries the current one:
REQ (`sha256:817b6745…`) and FSPEC
(`sha256:82f74a2d…`) were unchanged from the state v1.8 was authored against; TSPEC moved
(`sha256:4a092e85…` → `sha256:1531143c…`) within v1.10, whose added text sizes
`PROP-SWEEP-2(b)`'s residue in §1.3 and routes its partition, owners and figures to PLAN's
Overview HEAD-drift note and A6-00's Edit 1. Nothing in that erratum is owed here: DECISIONS carries
no hygiene note, no sweep figure and no disposition of the residue, and no design claim moved, so the
absorption is a recorded no-op rather than an edit. The round's two remaining findings are likewise
not DECISIONS edits — PM v9 F-01 asks PLAN to cite the appendix rather than restate column (1)'s
count, and PM v9 F-02 is a harvest item about the pipeline's missing evidence-appendix artifact class.

**On v1.10 (closing pass, all claims re-grounded against the working tree).** No decision entry's
`Decision`, `Constraints`, `Reversibility` or `Re-evaluation triggers` text changed; `DEC-A6-01`…
`DEC-A6-04` remain byte-frozen. Four repairs, three of them the same defect the v1.8 note names —
a HEAD measurement left standing in the one document whose purpose is to hold none, which the tree
then falsified: (1) Context cited the bundle as `pdlc/workflows/dist/orchestrate-dev.bundle.js`;
`build-runtime.mjs` writes `pdlc-cli.mjs` into `pdlc/workflows/dist/` and its own comment says the
`.claude/workflows/` consumer copy "is produced by the maintainer sync step, not this script", so
the path is corrected and the load-bearing half — one module, inlined from
`pdlc/workflows/orchestrate-dev.js` — restated. *(Superseded at v1.11: that repair kept the retired
bundle and the inlining premise and invented a sync channel; see the v1.11 note's item 1 for the
ground that replaced it. Retained here as the record of what the round actually did.)* (2) The `DEC-A6-01` verb bullet said the five verbs
appear "zero times in `orchestrate-dev.js` today"; `captureTreeSnapshot` and `restoreTreeSnapshot`
now exist and drive all five, so the bullet is restated as a claim about A6's mechanism —
five verbs new to the workflow, `add`/`reset`/`rev-parse` reused — with the present-tense count
routed to `SIZING-pdlc-advisory-wave-gate.md`. (3) The `DEC-A6-04` "nothing moves" bullet cited two
counts, both since falsified: the example now carries an `advisory` section and
`ci-arrangement.test.js` mentions `advisory` once, in a comment. The claim it supported — there was
no prior expectation over the key to relocate — is true of the pre-A6 baseline and is restated as
such. (4) The companion bullet asserted a channel *order* at HEAD; it is restated as the principle
that survives any tree state — the engine expectation and the example edit are one red/green pair,
so neither channel is free. Verified unchanged and left standing: `stash` still has no call site;
`reset --hard` still has exactly one, on the seam-revert path; `ADVISORY_DEFAULTS.enabled` is still
`false`; the build-outputs commit precedent (`chore({feature}): wave {N} build outputs` /
`Wave {N} build outputs`) and the wave contract's `Do NOT run git add or git commit` clause are both
verbatim in the shipped module.

**On v1.11 (round 1 after harvest; PM F-01/F-02/F-03/F-04, TE F-01…F-07).** Seven repairs, no
decision *outcome* moved: every alternative rejected below stays rejected, on the same side. What
changed is the **ground** under three claims a downstream reader would have transcribed into an
oracle or read as foreclosing an option, and the answers to four staleness items.

1. **Context's first constraint was reasoning from a retired channel** (PM F-01, TE F-03).
   `orchestrate-dev.bundle.js`, the inlining premise and the `.claude/workflows/` maintainer-sync
   delivery step no longer exist: `build-runtime.mjs`'s own header records the per-module runtime
   bundles as "retired along with the Claude Code workflow runtime" and says the builder "now emits
   a single artifact: `pdlc-cli.mjs`"; `git ls-files pdlc/workflows/dist/` returns that one path;
   and the consumer copy is now *swept* by `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, not
   synced. The constraint is re-grounded on the channel that ships — `pdlc/engine/scripts/prepack.mjs`
   vendoring the modules verbatim — and, importantly, **"add a module" stops being an impossibility
   claim**: it is a three-list edit, so it is re-rejected on merit instead.
2. **The fail-closed sentence was false for capture** (TE F-01). It said "any capture or restore call
   returning `ok !== true` throws"; `captureTreeSnapshot` returns `null` through its `fail(verb)`
   helper and never throws, which its own docstring states, and only `restoreTreeSnapshot` throws.
   Transcribed as written the sentence yields a property that fails against correct code. The two
   halves are now stated separately, with fail-closed named as a property of the *pair*.
3. **Four sites still hedged on OQ-7 as open** (TE F-02). It is closed, answered *no*, at TSPEC
   v1.11 — ignored paths are outside BR-9's map in both directions (FSPEC BR-9 v1.6, REQ AC-5.1) and
   TSPEC states the scoped ignored-path arm "is **not** built: the decision that would have required
   it did not come back". The hedges are restated as transcriptions of the decided boundary and the
   re-evaluation trigger that named the resolved event as pending is dropped.

The other four: the promotion commit's cardinality is one `commitPaths` call **per promoted task**,
not one (PM F-02); Context's "no new transport" constraint now cites the clause that actually closes
the set rather than NFR-3, which is about credentials and network surface (PM F-03);
`captureTreeSnapshot`/`restoreTreeSnapshot` are `export`ed and directly unit-tested rather than
module-private, so DEC-A6-01's reversibility is test-visible (TE F-04); and DEC-A6-04's
"now fails the suite" is attributed to TSPEC §5.2, with A6-15's fixture named as still owing the
present-and-zero conjunct (TE F-05). Two argv/citation nits (TE F-06) and the provenance cell
(PM F-04, TE F-07) are taken in the same pass. `DEC-A6-01`…`DEC-A6-04`'s *decisions* are unchanged;
three of the four entries take a sentence-level repair inside their supporting prose, which the
findings require and which the "byte-frozen" note of v1.10 was never meant to forbid.

Answer to the standing question about v1.10's sweep (TE Q-01): it was scoped to the claims the v1.10
preamble enumerates — `stash`, `reset --hard`, `ADVISORY_DEFAULTS.enabled`, the commit precedents —
all of which still hold. It was not exhaustive, and this note says so rather than leaving the
unswept claims reading as verified. The three misses share a signature worth carrying forward: they
are claims about **failure modes, visibility and impossibility**, none of them falsifiable by the
grep-shaped check that confirms a count.

**On v1.12 (upstream-cascade round 3, PM F-01/F-02/F-03, TE F-01/F-02/F-03).** No decision moves;
`DEC-A6-01`…`DEC-A6-04`'s `Decision`, `Constraints` and option tables are untouched, and no entry in
`## Options Considered` is reopened. One class of defect is repaired: `DEC-A6-03` carried a
**negative factual claim about upstream** — "the routing has not landed", pinned at REQ v1.15 and
FSPEC v1.6 — and the cascade that triggered this round falsified it. Both reviewers caught the REQ
half. Re-grounding on upstream at HEAD before editing (this record's own convention, stated in the
dates note above: a finding is resolved against upstream *at the time of the edit*) shows the split
has moved further than either review saw: FSPEC has since gone v1.6 → v1.7 and TSPEC v1.11 → v1.15,
and both now carry the obligation too. The repair therefore states HEAD, not the review's snapshot of
it. Related: the header `Upstream` cell now pins all three upstream hashes, and the v1.9 note's REQ
and FSPEC hashes are date-scoped as that round's observation rather than reading as current pins.
The durable lesson is the one TE names for harvest and it is recorded here so it survives the
reviews' deletion: **a sentence of the form "X matches nothing upstream" is a dated observation, not
a decision, and must carry the upstream version it was checked against and be re-checked on every
cascade.** Where such a claim is load-bearing, prefer stating the specified-vs-asserted split — which
level specifies the obligation and which level asserts it — over a bare "nothing anywhere", because
the split degrades gracefully as routing lands one hop at a time.

## Context

A6 is the sixth advisory seam: it fires at exactly one place — Phase I's wave loop, at the moment
the script-owned test gate goes red — snapshots the tree, attempts one bounded in-envelope repair,
re-runs the wave's own gate sequence, and either keeps the repair or restores the snapshot
byte-identical and halts with a diagnosis attached. TSPEC v1.11 settles the design; this document
records the four load-bearing choices inside it that had a live alternative, so that a later reader
finds the rejected option and its reason here rather than reverse-engineering it from a test oracle.

Two of the four are the entries TSPEC §6 nominates explicitly ("Two entries warrant a DECISIONS
document for this feature"): the restoration mechanism (§2.5) and the E-6 promotion commit shape
(OQ-8, raised as PM F-06). Two more are recorded because they are configuration- and
operator-visible and were re-litigated across review rounds: the snapshot ref's name (OQ-2, PM F-02
and PM F-03) and the admission of `waveBudgetPerRun: 0` as a legal configured value (OQ-1, E-33).

Constraints that shaped all four, none of them this feature's to change:

- **The shipping channel vendors a fixed list of module files.** Every advisory-tier symbol A6
  reuses — `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry` —
  lives in `pdlc/workflows/orchestrate-dev.js`, and that module reaches an operator by being copied
  **verbatim** into the published `@kaneho/pdlc-engine` package at pack time:
  `pdlc/engine/scripts/prepack.mjs` iterates a hardcoded `MODULE_NAMES = ["orchestrate-dev.js",
  "orchestrate-queue.js"]`, `copyFileSync`s each into `pdlc/engine/vendor/workflows/`, and records a
  `VENDOR-MANIFEST.json`. `pdlc/OPERATIONS.md` states it directly — workflow modules are vendored
  into the package at pack time and the engine never loads `.claude/workflows/`. A file added beside
  `orchestrate-dev.js` is therefore not vendored, does not resolve at runtime, and stays invisible to
  the published package until **three** hardcoded lists are edited together: `MODULE_NAMES` in
  `prepack.mjs`, `WORKFLOW_MEMBERS` in `pdlc/engine/scripts/publish-preflight.mjs`, and
  `WORKFLOW_MODULE_NAMES` in `pdlc/engine/scripts/fixture-machine.mjs`.
  **That is a cost, not an impossibility, and this document previously miscounted it as one**
  (PM F-01, TE F-03): through v1.10 this bullet read "one module, one bundle" and rejected the whole
  class on unbuildability, reasoning from a per-module runtime bundle
  (`orchestrate-dev.bundle.js`) and a `.claude/workflows/` maintainer sync step that the plugin
  channel's retirement had already removed — `build-runtime.mjs` emits `pdlc-cli.mjs` alone and the
  consumer copy is *swept* by `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` rather than synced.
  So "add a module" is rejected **on merit** wherever it would apply below: A6's mechanism is
  co-located with the advisory-tier symbols it calls, in the same file region as `buildA4SeamOps`
  and `buildA5SeamOps` (TSPEC §1.2's reuse map), and splitting it out would buy nothing while
  paying the three-list edit and a second vendoring surface to keep in step. TSPEC §1.2 states the
  same envelope as a design commitment — "No new module, no new file, no new transport, no new
  credential".
- **No new transport.** A6 gets `_git`, `_runCommand`, `_readFile`, `_appendFile` and `_agent`
  already threaded through Phase I. Anything a decision needs, it needs from those. **The clause
  that closes the set is TSPEC §1.2's**, not REQ NFR-3's (PM F-03): §1.2 states "No new module, no
  new file, no new transport, no new credential (NFR-3): A6 uses `_git`, `_runCommand`, `_readFile`,
  `_appendFile` and `_agent` — every one of them already threaded into Phase I or into
  `runAdvisorySeam`". NFR-3 itself says something narrower — A6 "holds no credentials the pipeline
  does not already hold, and reaches no network surface Phase I does not already reach" — which a
  sixth injected transport over the *local filesystem* would not violate, and a sixth local
  transport is exactly what this constraint is invoked below to forbid (DEC-01 option B). Stated
  plainly so the pruning stays auditable: no requirement closes the transport set; TSPEC's design
  envelope does, and this feature adopts it as an engineering constraint.
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
| **B. Copy the working tree aside with `_runCommand("cp -a …")` and copy back** | Reachable: `_runCommand(command)` is a real Phase I transport returning `{ok, output}` | Introduces a shell dependency and a filesystem path this workflow does not otherwise own — a sixth local transport in all but name, which TSPEC §1.2's design envelope closes out. It also has no ignore semantics at all: a `cp -a` restore would have to decide by hand what `node_modules/` means. More mechanism, weaker guarantee. *(Through v1.10 this row also said the runtime's modules "cannot use `fs` or `process`". That is false at HEAD and was inherited from the same retired-bundle premise Context now corrects — `orchestrate-dev.js` carries a module-level `import * as fs from "fs"`. What is actually enforced, and what A6's own mechanism is held to, is narrower: A6's pure helpers are source-scanned for ambient readers by `advisoryWaveGate.test.js`'s A6-07 / PROP-NFR-04 suite, which fails any of the five on `process`, `Date`, `Math.random`, `require(`, `_now` or `globalThis` appearing in its body. TE F-03.)* |
| **C. Restore only the paths the repair declared (`producedPaths`)** | Cheapest of all — no capture step | Does not satisfy BR-9. The re-run post-wave command writes into paths no envelope rule ranges over (generated bundles under `implementation.postWavePathspecs`), so a path-scoped restore provably leaves them changed. AC-5.1's oracle is content-level over the whole tree |
| **D (chosen). A dangling snapshot commit built without touching the tree** | `git add -A --` → `write-tree` → `commit-tree {tree} -p {head} -m "…"` → `update-ref refs/pdlc/a6-snapshot-{waveNum}` → `reset --mixed {head}`; restore is `read-tree --reset -u` + `clean -fd` + `reset --mixed` | — *and the ignored-path boundary C is rejected on is no longer a gap here: `git add -A --` skips `.gitignore`d paths, so D's snapshot never holds generated output written into an ignored path — and upstream has since decided that the oracle does not range over such paths either. OQ-7 is **closed, answered no** at TSPEC v1.11; FSPEC BR-9 v1.6 and REQ AC-5.1 put ignored paths outside the map in both directions, so mechanism and oracle agree by decision rather than by coincidence (TE F-02)* |

### For DEC-02 — how an E-6 promotion reaches git history

| Option | Mechanism | Rejected because |
|---|---|---|
| **A. Widen the owning per-task `commitPaths` call's `paths`** | The reading FSPEC BR-8's licence ("that scope may widen under O-8's E-6 resolution") most literally suggests | One task's commit would carry another task's owned paths. The wave loop's per-task commit is pathspec-scoped precisely so that a commit names one task's files — `commitPaths({paths: task.files, message: waveCommitMessage(featureName, task), what: "Wave N task T", …})`. Widening it breaks the property M-WG-4 rests on, and does so invisibly in git history |
| **B. Leave the repair uncommitted for the later task's agent to commit** | No new call at all | The wave loop is the only writer past the green gate, and wave agents are told `Do NOT git commit`. A resolved wave would strand its own repair as an uncommitted change, and a later run would never see it |
| **C (chosen). One further `commitPaths` call *per promoted task* after the per-task loop, inside the same `if (waveGit)` block and past the same green gate** | Full argument set, own `message` and `what` label, one commit per owning task id | — |

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

Option A's rejection **is falsifiable at TSPEC v1.11**, and the loop that made it so closed
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
with TSPEC §2.5's own elision for that reason (TE F-06: what the block writes, and what this
sentence therefore reproduces, is the ellipsis; the literal the implementation carries is
`A6 snapshot: wave {waveNum} pre-repair tree ({feature})`) — but the failure mode is silence, not a block, and
v1.1's account of it was wrong (TE v2 F-01, carried here rather than across another round). A
`commit-tree` invoked without `-m` reads its message from stdin; the shipped transport `defaultGit`
runs `execFileSync("git", args, { stdio: "pipe", encoding: "utf8" })` with no `input`, so the child
sees an empty stdin rather than an error. Measured against real git: `git commit-tree {tree} -p HEAD
</dev/null` exits `0` and prints an object id, with an **empty commit message**. So a `-m`-less
capture does not fail loudly at the seam — it writes a valid, unlabelled snapshot commit, and the
operator who later inspects `refs/pdlc/a6-snapshot-{waveNum}` finds an object with nothing on it
saying which wave or which repair it belongs to, which is the whole point of capturing it.
No test catches the omission either: §5.2's oracle is an **argv-sequence** assertion over the `_git`
double's recorded argv (`commit-tree === 1`, plus an `update-ref` on the snapshot ref), and a double
answers a `-m`-less argv as happily as a correct one. The literal belongs in the implementing task's
argv, not in its judgement.

**Constraints that forced the shape.** BR-9's oracle is content-level over tracked *and* untracked
files, so path-scoped restoration is out. The wave's uncommitted work is the protected asset, so a
capture that mutates the tree is out. `clean -fd` deliberately omits `-x`, because `git add -A --`
never records ignored paths and a restore that deleted what capture never held would be a worse
defect than the one it fixes — capture and restore share one ignore semantics because they must.
The boundary itself is **inherited, and now settled**: OQ-7 asked whether BR-9's oracle ranges over
ignored paths and closed *no* at TSPEC v1.11, with FSPEC BR-9 v1.6 and REQ AC-5.1 fixing the map's
domain as tracked files plus non-ignored untracked ones — ignored paths outside it in both
directions. This decision still fixes only the *symmetry*; what changed upstream is that the
symmetry and the oracle now agree by decision rather than by luck (TE F-02).

**Reversibility:** easy, and **test-visible rather than silent**. The mechanism is two *exported*,
directly unit-tested functions (`export async function captureTreeSnapshot` / `restoreTreeSnapshot`)
behind a call site that runs only under `advisory.enabled: true`. The caveat matters for the same
reason DEC-A6-02's does: `advisoryWaveGate.test.js` destructures both by name off the module and
drives them directly — A6-10's round-trip over a real temporary git repo and the restore-path throw
cases — so reshaping either one reddens tests an operator will see, rather than changing quietly
under the seam (TE F-04). Through v1.10 this rating said "module-private", which understated what a
reversal costs.

**Re-evaluation triggers:** git gains a genuinely non-mutating stash-capture; the wave contract
changes to permit agent commits or staged work (which would invalidate the `reset --mixed` exactness
argument, TSPEC §6 OQ-5); or **BR-9's ignored-path exclusion is reopened and reversed** — that is,
a future erratum brings ignored generated outputs *inside* AC-5.1's map, which OQ-7 has already
declined to do. Only then does capture grow a *scoped* ignored-path arm over the post-wave
pathspecs only, never the whole ignored tree. Stated as a live reversal rather than as a pending
OQ-7 because OQ-7 is closed and the scoped arm is explicitly **not built** — TSPEC records that
"the decision that would have required it did not come back" (TE F-02).

### DEC-A6-02: An E-6 promotion is committed by its own `commitPaths` call, not by widening a task's

**Decision.** A resolved wave whose repair landed in a later task's owned paths makes one additional
`commitPaths` call **per promoted task** after the per-task loop, inside the same `if (waveGit)`
block and past the same green gate, with `paths` = that promotion's produced paths, `message` = `chore({feature}): wave {N}
advisory promotion ({taskId})`, `what` = `Wave N advisory promotion (task T)`, and the wave loop's
own `_git`, `_sleep`, `emit` and `provenance`. The cardinality is load-bearing, not a detail
(PM F-02): the wave loop iterates `waveResolvedPromotions` — the return of `groupPromotedPaths`,
which groups produced paths **by owning task id** and can therefore hold more than one row — and
issues one call per iteration; the `message` template carries a single `{taskId}` slot, which is
only coherent under the per-task reading. A single widened commit naming one of two promoted tasks
would quietly lose exactly the per-task attribution option A is rejected to protect. FSPEC BR-8's
licence to "widen scope" is therefore read as *licence to commit each promotion*, not as licence to
enlarge another task's pathspec.

**Upstream now states this shape, and cites this entry for the rejection.** v1.1 of this record
superseded two pieces of upstream text that described option A; one of the two has since been
corrected. TSPEC §1.1's obligation table, row O-8, no longer resolves the obligation by widening an
existing pathspec: at v1.11 it reads "**One further `commitPaths` call** after the per-task loop,
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
a test-visible change, not a silent one. The oracle is **TSPEC's**, not FSPEC's: TSPEC §5.6's
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

**Reversibility:** easy — the name is computed in one function. It is *printed* in two places as of
the routing above (TE v3 F-02): the halt field that names the ref, and, adjacent to it, the
overwrite notice `renderSnapshotOverwriteNotice(snapshotRef)` renders — co-located by contract, so a
rename moves one computation and one rendered string, not two independent ones.

**The gap in the remedy's reach, and how it closed (PM F-05; state re-grounded at HEAD, v1.12).**
The gap this entry carried was real and is now closed at the specification levels. The original
finding: the "copy the ref" remedy below was documented in TSPEC §2.5 and in this record — neither of
which an operator reads at halt time — so at halt an operator learned the object's *name* but got no
indication that the ordinary next step after a halt, re-running the feature, destroys it. Putting
that sentence on the halt message is a product decision about an operator-facing obligation and
therefore belonged in REQ/FSPEC, not here; the PM routed it, and this entry carried the gap until it
landed. **It has landed, at all three specification levels** — each citing this entry by id:

- **REQ v1.16, AC-6.3** — where the halt report points the operator at a captured pre-A6 tree state,
  it also warns, *in the same place*, that re-running this feature overwrites that capture (DEC-A6-03).
- **FSPEC v1.7, BR-14** — states the same conjunct as an observable and names **co-location** as the
  observable ("a pointer in the halt report and the warning in a runbook does not satisfy it"),
  with `AT-06-4` conjunct (3) as its acceptance test and `AT-06-4b` as the negative arm for the
  capture-failure branch, where **E-34** requires no warning because there is no capture to point at.
- **TSPEC v1.15, §4.5** — the halt-field contract is no longer the closed four-literal set
  `{rootCause, diagnosis, repairApplied, repairPaths}`: it adds a snapshot-overwrite notice rendered
  by `renderSnapshotOverwriteNotice(snapshotRef)` into the report's `notices`, one string carrying
  the ref pointer and the overwrite statement adjacent, emitted on every A6-touched halt whose
  `snapshotRef` is non-`null` and never when it is `null`.

**What is still owed, and to whom (TE v3 F-02).** Specified is not asserted. At HEAD the conjunct
has no property and no test: `PROPERTIES` covers AC-6.3 through `PROP-REC-05`, which asserts only
that the halt report carries the diagnosis and the root-cause class, and `overwrit` matches nothing
in PROPERTIES; no test in the suite inspects halt text for an overwrite warning. This is the same
specified-vs-asserted split DEC-A6-04 records for `waveBudgetPerRun: 0`, and it is named here so a
test author reads an open obligation rather than an absent one. The falsifiable half is
**co-location**, not presence: the oracle asserts the ref pointer and the overwrite statement on the
**same rendered report field**, and must go RED both when the warning is deleted and when it is
emitted somewhere other than beside the pointer. An `expect(report).toContain(ref)` alone can fail
neither. Recording the routing rather than implying it is what let this close — an uncited in-flight
routing is indistinguishable from a dropped one.

**Re-evaluation triggers:** an operator investigation is ever lost to the re-run overwrite; a run id
or capture timestamp becomes available in Phase I scope; or the accumulated refs (one per wave per
run, in a namespace nothing prunes) become an operational complaint, at which point pruning and
discrimination are decided together. The halt-message trigger — "the obligation the PM is
routing to REQ lands, in which case the remedy stops being record-only" — **fired at REQ v1.16 and
is spent** (PM v3 F-03): it landed in REQ AC-6.3, FSPEC v1.7 BR-14/AT-06-4 and TSPEC v1.15 §4.5, and
the remedy is no longer record-only. What replaces it is narrower: revisit if the conjunct is still
unasserted by any property or test when Phase I closes, since an obligation specified at three levels
and checked at none is the shape this entry exists to make visible.

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

- **Five git verbs are new to this workflow**, not two. A6's mechanism introduces `write-tree`,
  `commit-tree`, `update-ref`, `read-tree` and `clean` — none of which the pre-A6 module invoked;
  `git clean` in particular had no call site at all, the module's only `"clean"` strings being
  `parseRebaseStatus`'s rebase-status vocabulary, which is not a git verb. The verbs A6 reuses
  rather than introduces are `add`, `reset` (invoked once before A6, as `reset --hard` on the
  seam-revert path) and `rev-parse`. The claim is about A6's mechanism, not about a tree state:
  which of the five are present at any given HEAD moves with implementation and is
  `SIZING-pdlc-advisory-wave-gate.md`'s to measure, not this record's. The count matters because it
  sizes the double: every `_git` double A6 touches has to
  answer all five, and the restore path is the half most easily left unanswered — which is why
  TSPEC §5.2's fixtures assert on the observed argv sequence rather than on outcomes alone, and why
  §5.5 counts a capture-*unique* verb (`commit-tree === 1`) rather than raw `_git` calls, since
  `restoreTreeSnapshot` drives the same transport with `read-tree`/`clean`/`reset`. An
  under-enumerated verb set is exactly how a restore-path double false-greens (TE F-02).
- **Fail-closed is a property of the *pair*, discharged two different ways on purpose.** Do not read
  it as one rule; through v1.10 this bullet stated it as "any capture or restore call returning
  `ok !== true` throws", which is false for capture and which a PROPERTIES author transcribing it
  would turn into a rejection assertion that correct code never satisfies (TE F-01).
  - **Restore throws.** `restoreTreeSnapshot` raises on each of its three verbs — `read-tree
    --reset -u`, `clean -fd`, `reset --mixed` — with the failing argv and git's stderr in the
    message. The throw surfaces through `seamOps.revert()`, which `runAdvisorySeam`'s `doRevert`
    tags `__isRevertFailure` and whose terminal catch rethrows rather than mapping to an
    escalation — shipped behaviour, relied on rather than re-invented.
  - **Capture returns `null`, and the call site writes the disposition.** `captureTreeSnapshot`
    routes every failed verb through a `fail(verb)` helper that returns `null` (optionally recording
    the failing verb on the caller-owned `failure` carrier) and **never throws**; its docstring says
    so in as many words. `runWaveGateSeam` reads the `null` and writes the capture-failure
    disposition itself, which is the disposition TSPEC §2.5's table assigns to the call site — and
    which the next bullet describes. The reason it cannot throw its way there is the same reason the
    `__preDispatch` escape is unavailable: the driver is never entered on this path.
  Both halves end the wave; neither leaves a repair half-applied. That conjunction is the property,
  and it is the one worth transcribing.
- **Capture failure escalates, then halts** — in that order — writing its record through
  `appendAdvisoryEntry` and `appendEscalationEntry` directly, because the driver is never entered.
  The `__preDispatch` escape is unavailable on this path: it is a return value of
  `seamOps.gatherEvidence()`, and `gatherEvidence` is called *inside* the driver's `while (true)`
  attempt loop, which a `consumesAttempt: true` gate re-enters — capture there would re-capture on
  attempt 2 and break the one-snapshot-per-wave invariant.
- **A wave that staged something anyway loses its staging, never its content.** The `reset --mixed`
  is exact only because the wave contract keeps the index equal to HEAD. This is an accepted
  deviation, inside BR-9's content-level oracle (TSPEC §6 OQ-5).
- **The ignored-path boundary is inherited, not set here — and it is now settled.** OQ-7 closed
  *no* at TSPEC v1.11: ignored paths sit outside BR-9's map in both directions (FSPEC BR-9 v1.6,
  REQ AC-5.1 — they "are operator files A6 never wrote and never restores over"), so the scoped
  ignored-path arm this record held in reserve is explicitly **not built**. Mechanism and oracle
  agree on the same domain. Only a reversal of that exclusion would grow the arm; the *stash*
  rejection is unaffected either way (TE F-02).

### What follows from DEC-A6-02

- A resolved wave with a promotion produces **three** commit kinds on the branch: per-task commits,
  **one promotion commit per promoted task**, and (when a post-wave command ran with pathspecs
  configured) the build-output commit. Kinds, not counts: a wave that promotes into two later tasks'
  paths shows two promotion commits, each naming its own task id in its message (PM F-02).
  An operator reading `git log` sees each promotion as its own entry with its own message —
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
- The operator remedy — copy the ref before re-running a halted feature — is no longer documentation
  the operator has to already know about. **REQ v1.16 AC-6.3 makes the warning a required element of
  the halt report itself** (FSPEC v1.7 BR-14, AT-06-4 conjunct (3); TSPEC v1.15 §4.5's
  `renderSnapshotOverwriteNotice` notice), co-located with the pointer at the captured tree state, so
  preserving the capture is an action the operator can take *at halt time* from the halt report
  alone. The record and TSPEC §2.5 remain the place the remedy is explained; they are no longer the
  only place it is reachable. Still owed downstream: no property or test asserts the conjunct yet —
  see DEC-A6-03's specified-vs-asserted note.
- Refs accumulate — one dangling commit object per wave per run — and nothing in this feature deletes
  them (TSPEC §6 OQ-2).

### What follows from DEC-A6-04

- `.claude/pdlc.config.example.json` gains the key, and **`pdlc/engine` must gain a new expectation
  over it, in a file of its own** (named below). Nothing "moves": pre-A6 the tracked example carried
  `dispatch` and `implementation` and no `advisory` section, and
  `pdlc/engine/__tests__/ci-arrangement.test.js` held no `advisory` expectation — it reads the
  example file and asserts on `implementation.testCommand`, whose oracle is FSPEC §5.1's CI
  arrangement. There was therefore no existing expectation over the key anywhere to relocate, and
  that is the whole of what this bullet claims; the current contents of either file are a tree
  measurement, `SIZING-pdlc-advisory-wave-gate.md`'s to carry. The point is not guidance about where
  the new expectation belongs:
  `ci-arrangement.test.js` is explicitly *not* its home. TSPEC §5.1's file-ownership map assigns it
  to a new file, `pdlc/engine/__tests__/advisory-config-example.test.js`, because
  `ci-arrangement.test.js`'s stated oracle is FSPEC §5.1's CI arrangement alone, and a config-schema
  assertion parked there would let an unrelated example edit redden the delivery-blocking
  `Engine tests (ubuntu-latest)` check under a scope that names no such concern. This is still a
  two-channel edit, and the second channel's work is *a new expectation* — a different size and a
  different risk from relocating one.
- **The two channels are not ordered the way v1.2 recorded** (PM v4 F-02). v1.2 said adding the key
  "requires no engine edit to stay green" and that the second channel's work was still ahead. That
  is wrong in principle, not merely out of date: the engine expectation and the example edit are one
  red/green pair, so whichever lands first waits on the other, and neither channel is free. Which of
  the two is outstanding at any given moment is a tree measurement and this record deliberately
  stops restating it:
  TSPEC §5.1's status caveat and §1.3 are the carriers of repo state for this feature, and whether
  the early-landed edits are reverted or PLAN's batches are re-derived around them is PLAN's call.
  What is decided *here* is only that the key ships in the operator-facing example and that the
  engine channel asserts over it in a file of its own. No FSPEC acceptance test ranges over it and
  none is expected to: upstream states the coverage as TSPEC-owned (§5.1), so this is a deliberate
  allocation, not an open gap. The product reason to do the work rather than drop the claim:
  `waveBudgetPerRun: 0` is a documented operator affordance (REQ C-2, FSPEC E-33), the example is the
  operator's first and possibly only encounter with the key on a tier that ships off by default, and
  an affordance nothing asserts into the example can ship working and undiscoverable (PM F-01,
  TE F-06).
- `waveBudgetPerRun: 0` and `advisory.enabled: false` are **observably different** and must stay so:
  the former reports a sixth advisory row reading zero, the latter carries no `advisory` key at all.
  **The collapse is falsified upstream at TSPEC v1.11.** v1.1 of this entry recorded that nothing
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
  `enabled: false` is **specified** to fail rather than pass. Specified, not yet asserted, and the
  difference is worth stating precisely (TE F-05): the requirement is TSPEC §5.2's, and the fixture
  that must carry it — A6-15's `waveBudgetPerRun: 0` case in `advisoryWaveGate.test.js` — is short
  of it at HEAD. A6-15 asserts the disposition (`escalated` / `budget-exhausted`), zero `_agent`
  calls and `commit-tree` observed once, and it drives `runWaveGateSeam` directly rather than a run,
  so it never reaches the report's advisory summary key at all. Until it does, the two arms are
  distinguishable by inspection and not by assertion, and the collapse regression ships green. The
  behaviour is decided here and specified upstream; **what is still owed is the fixture conjunct,
  and it is A6-15's to complete** — recorded here rather than closed, because a closed obligation is
  what stops the next reader looking.
- **What the example teaches is the default, not the affordance** (TE Q-03). `.claude/pdlc.config.example.json`
  carries `"waveBudgetPerRun": 1`, and `pdlc/engine/__tests__/advisory-config-example.test.js`
  requires only a non-negative integer, so `1` passes. That is deliberate: an example config's job is
  to show a working default configuration, and shipping `0` in it would teach an operator to disable
  the seam by default on a tier that is already off by default. The `0` affordance's documented
  surface is REQ C-2 and FSPEC E-33; what the example channel buys is that the *key* is
  discoverable at all, which is the discoverability claim above and the whole of it. The residual
  gap — nothing operator-facing spells out that `0`-with-`enabled: true` is legal — is REQ/FSPEC's
  to close if it is worth closing, not this record's.

### What follows for the whole feature

- None of the four decisions changes behaviour for a repo that configures nothing:
  `ADVISORY_DEFAULTS.enabled` stays `false`, so the default-configured run is byte-identical to
  today's. This is what keeps all four ratings at "easy" reversibility.
- **The sizing of that co-movement lives in `SIZING-pdlc-advisory-wave-gate.md`, not here.** Three
  transcribed set-equality surfaces move together when A6 lands — `ADVISORY_SEAMS`,
  `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS` — and the **constants** are three while their
  counterparts are not. The number an implementer must not get wrong is **four**: those three
  production constants plus the one test-side literal a gate still demands
  (`advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality inside `PROP-SUM-01`). Every other
  total — which sites already carry the post-A6 value, which oracles flip red→green with no edit at
  all, how many ungated prose sites restate the old cardinality, which apparent hits are false
  positives, and the recipe for re-deriving each — is a measurement of the working tree with a short
  shelf life, whose consumer is PLAN's batch sizing rather than this record. Those totals are
  enumerated and re-measured in `SIZING-pdlc-advisory-wave-gate.md`, cited from PLAN's Overview
  HEAD-drift note; this entry deliberately restates none of them (POSTMORTEM-D §6 steps 1–2,
  PM v8 Q-01).
- The shared double is the coupling the other two surfaces do not have: `advisoryDoubles.js` carries
  *both* literals plus the frozen defaults shape, so a partial edit reddens tests in files that never
  mention the changed constant, with a failure reason the record cannot predict. Sequencing all of
  this as **one task remains the right call** — that co-movement is the failure class A6 itself
  exists to survive. That is a decision-shaped claim and stays here; its sizing does not.
