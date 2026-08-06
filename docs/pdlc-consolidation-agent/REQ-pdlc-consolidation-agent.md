---
feature: pdlc-consolidation-agent
ready: true
depends-on: [pdlc-workflow-distribution, pdlc-advisory-tier]
---

# REQ — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 2, DEC-E4/E5, order 4) |
| Downstream | `pdlc-engineering-loop` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3}.md` (6 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.3 | 2026-08-05 |

> **Scope in one line.** Run consolidation on a cadence with the advisory model, and carry
> pipeline-level promotions to `yumo-plugins` as pull requests — the same repository today
> (AC-3.8), a separate one when configured — with every promotion recording the failure mode it
> targets and the next pass reporting, by a deterministic rule, whether that failure mode recurred.

## 1. Problem

`consolidate-learnings` reads per-feature LEARNINGS and promotes recurring patterns into
project-level `DOMAIN-CONSTRAINTS` and `DECISIONS`. That part works and stays.

Two things do not.

**The cross-repo dead end.** When a learning says *a skill prompt itself should change*, the skill
writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a four-column markdown table,
`| Source LEARNINGS | Target skill | Proposed change | Rationale |`
(`pdlc/skills/consolidate-learnings/SKILL.md:54`) — **in the consuming repo**, while the skills it
names live in `yumo-plugins/pdlc/skills/`. Nothing carries the proposal across that boundary: no
`gh pr create` and no cross-repo push exists outside Phase PUB's own-repo `ship-pr`. So the pipeline
accumulates precise evidence about its own failure modes and then hand-transcribes it, or doesn't.
Propose-only is correct — agents changing the prompts that govern agents must pass through human
judgment — but *propose-only* and *hand-transcribed* are different requirements, and the skill
enforces the second while intending only the first.

**Today's only consumer is `yumo-plugins` itself.** `docs/_queue/QUEUE.md:11` states that this queue
is the pipeline's own queue, and `:279` that every PR in it trips the self-modification guard. So the
"consuming repo" and the "plugin repo" are, in the shipping configuration, one repository. This REQ
therefore specifies the same-repo case as the primary configuration (AC-3.8) rather than assuming a
two-repo topology that does not yet exist.

**Unfalsifiability.** Nothing checks whether a promotion worked. A consolidation pass promotes a
constraint or a skill edit and never revisits it. Over enough passes this drifts toward ceremony:
prompts grow, nobody can say which growth helped, and no promotion is ever retired. An improvement
process that cannot be wrong cannot be trusted to be right.

## 2. User stories

- **US-01** — As the operator, I want a proposed skill change to arrive as a reviewable pull
  request with the actual diff, not as a table I must transcribe.
- **US-02** — As the operator, I want to approve every pipeline change, and I want no automated
  identity to hold the ability to merge one.
- **US-03** — As the operator, I want consolidation to run on a cadence without my starting each
  pass, and without it running more often than the evidence justifies.
- **US-04** — As the operator, I want each pass to tell me whether the *previous* pass's
  promotions actually prevented the failures they targeted.
- **US-05** — As the operator, I want to see which promotions are dead weight, so prompts can be
  pruned rather than only grown.

## 3. Requirements

### REQ-CONS-01 — Cadence and trigger

**Trigger surface, named.** The pass ships as a workflow script invoked as
`/pdlc:consolidate-learnings`. Its cadence vehicle at HEAD is the same one the queue already uses —
a session-resident `/loop run /pdlc:consolidate-learnings` (CLAUDE.md, "Entry (queue, multi-feature)"),
where the operator starts the loop once and each tick runs a pass with no per-pass invocation.
Nothing in `pdlc/hooks/hooks.json` can start a pass: it registers only `PreToolUse`, `PostToolUse`
and `SessionStart` entries (`:3`, `:14`, `:29`), and `nudge-consolidation.sh` only prints
`hookSpecificOutput.additionalContext` and exits 0 (`:47-48`, header `:4`) — its advisory role is
**unchanged** here. Session-free execution is D-CONS-04, bound to `pdlc-engineering-loop`.

**One predicate for "un-consolidated", named.** Two definitions exist at HEAD and disagree: the
hook's basename test (`pending = [p for p in learnings if os.path.basename(p) not in logtext]`,
`pdlc/hooks/scripts/nudge-consolidation.sh:41`, against `docs/_decisions/.consolidation-log.md`,
`:32`) and the skill's date boundary (`Date Completed` after the last logged pass,
`pdlc/skills/consolidate-learnings/SKILL.md:35`). **This feature adopts the basename test** — durable
against LEARNINGS date edits and already shipped — and updates `SKILL.md:35` to match. Every AC
below saying "un-consolidated" or "accumulated since the last pass" means exactly this predicate.

**The predicate's corpus is a delimited region, not the whole log.** The shipped predicate is a bare
substring test over the whole of `docs/_decisions/.consolidation-log.md` (`:41`, read at `:32`), and
this feature writes further record types into that same file (the AC-1.3 marker, AC-3.4's PR URLs,
AC-5.1's failure-mode records — whose `artifact` field may legitimately be a LEARNINGS path — and
AC-5.2's effectiveness table), any of which could contain a basename and falsely mark that file
consolidated. So consumption is recorded **only** inside a delimited block:

```
<!-- pdlc:consumed {passId} -->
LEARNINGS-{feature}.md      (one basename per line)
<!-- /pdlc:consumed -->
```

The predicate matches a basename **only within** such blocks; no other record type may appear inside
one. This feature updates `pdlc/hooks/scripts/nudge-consolidation.sh:41` to scope its test the same
way, so the hook and the pass keep one predicate rather than two. This is what makes NFR-5's
"exactly the consumed set" enforceable by the predicate that consumes it.

**What is in that file at HEAD, and the migration rule.** `docs/_decisions/.consolidation-log.md` **exists** and predates every convention this
feature introduces: a markdown pass log whose `## Pass 1 — 2026-07-29` records its consumed set as a two-column table of **full paths**
(`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md` | 2026-06-02, same shape for `docs/pdlc-workflow-distribution/…`), then prose
promotion sections. It carries **no** `<!-- pdlc:consumed -->` block and **no** row status of any kind — "Promoted" is only a section heading. A
predicate matching blocks alone would report both files un-consolidated on the first pass, re-consuming a corpus a prior pass already promoted from,
with no help from NFR-4 (keyed on `failure-mode-id`, which a pre-convention LEARNINGS does not carry, AC-5.2). The predicate is therefore stated over
two regions, and is total over any log:

> A basename is **consolidated** if it appears inside a `<!-- pdlc:consumed {passId} -->` block, **or**
> anywhere in the log's **legacy region** — the text preceding the file's *first* `<!-- pdlc:consumed`
> marker (a log with no block at all is legacy region entire).

The legacy region is the shipped substring test (`nudge-consolidation.sh:41`) applied to exactly the text predating this feature, so nothing already
consolidated is re-consumed and no transcription or parse of Pass 1's prose is required. It is frozen by construction, in two clauses: **(a)** every pass
that takes the AC-1.3 marker appends a `<!-- pdlc:consumed {passId} --> … <!-- /pdlc:consumed -->` pair **before any other record it writes, even when
its consumed set is empty** (the pair is then empty, which satisfies NFR-5's "exactly the consumed set"), so the boundary is frozen unconditionally by
the first pass rather than only by one whose consumed set happens to be non-empty; **(b)** exactly **two** records are exempt — both can precede the
first block, and neither is readable as legacy consumption because neither ever carries a basename: the AC-1.3 in-progress marker (a passId and an
ISO-8601 timestamp, never committed, removed by the pass that wrote it), and a `refused` pass's AC-7.2 row (status, trigger, `credential:` and reason
code only — AC-1.3), written there by a tick that loses the race between the winner's marker and its block. Every other record lands after it.
`nudge-consolidation.sh:41` is updated to the same two-region rule, keeping hook and pass on one predicate. **On this repo
today** (the state a first-run test asserts against) step 1's enumeration matches 5 files; `LEARNINGS-orchestrate-dev-workflow.md` and
`LEARNINGS-pdlc-workflow-distribution.md` are named in the legacy region and consolidated; the other 3 (`…-pdlc-advisory-tier`, `…-pdlc-merge-phase`,
`…-pdlc-review-loop-hardening`) are un-consolidated — below the default `volumeThreshold` of 5, so the first tick reaches the cadence test.

**Tick evaluation order, stated.** Every `/loop` tick evaluates in exactly this order, and no step
reads a LEARNINGS **body**:

1. **Enumerate** LEARNINGS basenames and diff them against the predicate above — this yields the
   un-consolidated set. Enumeration is basenames only, which is all `nudge-consolidation.sh:41` does.
   The corpus is `docs/*/LEARNINGS-*.md` **and** `docs/completed/*/LEARNINGS-*.md`. The shipped glob
   is depth-1 only (`nudge-consolidation.sh:28`), but this repo archives completed features one level
   deeper (three `docs/completed/*/` dirs each hold a LEARNINGS, named below; BL-02 cites the
   convention), so depth-1 hides 3 of the 5 LEARNINGS at HEAD
   and biases AC-5.2's phase population toward `insufficient-evidence`. `docs/discarded/*/` is
   deliberately **excluded** — abandoned work is not evidence about a delivered pipeline. Widening
   makes `nudge-consolidation.sh:28` an in-scope edit (§5), keeping one enumeration as well as one
   predicate.
2. **Volume test** — if `|un-consolidated| >= consolidation.volumeThreshold`, the pass runs, trigger
   `volume` (AC-1.2).
3. **Cadence test** — otherwise, if `consolidation.cadenceHours` has elapsed since the cadence datum
   below, the pass runs, trigger `cadence` (AC-1.1).
4. Otherwise the tick terminates `skipped-cadence`.

A direct `/pdlc:consolidate-learnings` invocation skips steps 2–4 entirely and runs with trigger
`manual`.

**The cadence datum, named.** The interval of step 3 is measured from the timestamp of the most
recent log row whose status is in the set `promoted` / `promoted-degraded` / `no-op` / `failed` —
that is, the last pass that actually took the AC-1.3 marker and did work. A `refused` row is not a
datum (that pass did no work), and a `skipped-cadence` tick **writes no log row at all** (AC-7.2), so
ticking cannot advance the datum. Without this, every tick's own row would become "the last logged
pass" and `cadenceHours` could never elapse.

**The empty-datum case, decided.** The datum set is empty in two states — no log file (a fresh repo)
and a log with no row carrying one of those four statuses (the state at HEAD: Pass 1 predates the
status convention). "Elapsed since ∅" is otherwise undefined, and the two readings diverge on the
most common initial state. **An empty datum set counts as elapsed**: the cadence test fires, the pass
runs, its trigger is `cadence` (NFR-3a needs no new member) and its row additionally carries reason
code `no-cadence-datum`, so a bootstrap tick is distinguishable from an ordinary one. That row then
becomes the datum. The opposite reading is rejected: empty-means-not-elapsed makes cadence
unreachable until someone runs a manual pass — the never-fires failure this datum prevents.

- **AC-1.1** — Given a `/loop` tick and `consolidation.cadenceHours` elapsed since the cadence datum
  (the most recent log row with status `promoted` / `promoted-degraded` / `no-op` / `failed`), Then a
  consolidation pass runs with no per-pass operator invocation. Given **no** log row carries one of
  those statuses — no log file, or a log like HEAD's whose rows predate the status convention — Then
  the interval counts as elapsed, the pass runs, and its log row records trigger `cadence` plus
  reason code `no-cadence-datum`; given neither the volume test (step 2)
  nor the cadence test (step 3) fires, Then the tick exits `skipped-cadence` having read **no
  LEARNINGS body** — only basenames were enumerated — and writes no log row. Given a direct
  `/pdlc:consolidate-learnings` invocation, Then the pass runs regardless of the interval — the
  manual entry point is never gated by cadence.
- **AC-1.2** — Given the count of un-consolidated LEARNINGS (the AC-1.1 predicate) is at least
  `consolidation.volumeThreshold` (default 5, the value at `nudge-consolidation.sh:25`), Then the
  pass runs on this tick even if `consolidation.cadenceHours` has not elapsed, so consolidation
  fires on whichever of cadence or volume arrives first. The count comes from step 1 — a basename
  enumeration, not a read of bodies — so it precedes the cadence test without contradicting AC-1.1's
  cheap exit. The threshold is evaluated **by the pass**, not by the hook.
- **AC-1.3** — Given a pass begins while the in-progress marker is present and younger than
  `consolidation.staleLockMinutes`, Then the second pass exits with status `refused` and reason
  code `consolidation-in-progress`, naming the marker's timestamp and pass id; the refused pass is
  **dropped, not queued** — the next tick re-evaluates from scratch. The marker is a single
  `IN-PROGRESS: {passId} {ISO-8601}` line in `docs/_decisions/.consolidation-log.md`, written
  **after** the trigger decision of steps 1–4 and before any other pass work, and it lives in the
  working tree only — it is never a commit of its own (AC-3.8b). Take and release are set-equal to
  AC-7.1's terminal-status set, one stated outcome per status, so no status is unmapped:

  | Terminal status | Marker taken? | Marker released by this pass? | Commits (AC-3.8b)? |
  |---|---|---|---|
  | `promoted` | yes | yes | yes |
  | `promoted-degraded` | yes | yes | yes |
  | `no-op` | yes | yes | yes — the log row and consumed block are still writes |
  | `failed` | yes | yes | **yes** — under AC-7.2 a completed `failed` pass always wrote its row |
  | `refused` | **no** — the marker belongs to the pass that holds it | **no** — the loser never unlocks the winner | **no** — it writes its AC-7.2 row but commits nothing |
  | `skipped-cadence` | **no** — the tick terminates before the marker is written | **no** | **no** — it writes no log row (AC-7.2) |

  **A `refused` pass writes its AC-7.2 row and commits nothing.** The row is the only evidence a tick was refused, and REQ-CONS-01's cadence rule
  already presupposes it ("a `refused` row is not a datum"); AC-7.2's exemption set therefore stays a single member, `skipped-cadence`. The row carries
  a trigger (NFR-3a — the refused tick fired one of `cadence` / `volume` / `manual`; that is how it reached the marker check) and `credential: absent`
  (AC-4.2). It is **written, never committed**, by decision: a pathspec stages a whole file, so a refused commit would capture the winner's live
  `IN-PROGRESS:` line — falsifying AC-3.8b's "the marker is never committed" — and the winner's log at an arbitrary mid-pass instant. The winner's own
  AC-3.8b commit covers the same path and sweeps the row up; if the winner dies first the row stays in the working tree, which is all its evidentiary
  purpose needs. So the two passes' concurrent writes need no lock, the refused row is an **append of one
  whole record at end of file** — never an edit inside the winner's `<!-- pdlc:consumed -->` block or any other region. It writes **no** consumed
  block — only marker-holding passes emit one (REQ-CONS-01) — so it never touches the legacy-region boundary.

  Given the marker is older than `consolidation.staleLockMinutes` (default 60), Then the pass
  reclaims it, records `reclaimed-stale-lock` with the abandoned pass id, and proceeds — a pass that
  dies mid-flight cannot wedge the cadence. An operator may also clear it by deleting the line.
- **AC-1.4** — Given a pass that makes **no new promotion** — either because the un-consolidated set
  under the AC-1.1 predicate is empty, or because every promotion it would have made was suppressed
  as a duplicate (NFR-4) — Then it records `no-op` in `docs/_decisions/.consolidation-log.md` and
  exits successfully without opening a PR or writing a proposal file. A `no-op` pass still emits the
  AC-5.2 effectiveness table, restating each prior promotion's **standing** verdict and state
  (including an `unmeasurable` already reached), and still releases the AC-1.3 marker. **Which
  streaks it advances is decided by consumed-set emptiness, never by the `no-op` label** — the two
  causes differ exactly there. An **empty** consumed set is neither an evaluated pass (AC-5.5) nor a
  counted one (AC-5.3): it advances neither streak, so it can report an ageing but never cause one.
  A duplicate-suppressed `no-op` has a **non-empty** consumed set and real AC-5.2 verdicts, so it
  counts in both populations on the ordinary rules.
- **AC-1.5** — Given a pass runs, Then it runs on the advisory model rung and records the rung it actually ran on in its report and in the log row.
  The rung ladder is the one `pdlc-advisory-tier` ships: `MODEL_ADVISORY` (`pdlc/workflows/orchestrate-dev.js:1652`) first, `MODEL_ADVISORY_FALLBACK`
  (`:1653`) on non-resolution. **This feature reuses that ladder; it does not restate it.** The two constants are module-private, but the ladder is
  not: the resolver `resolveAdvisoryRung` is exported at `orchestrate-dev.js:1833`, under a doc comment at `:1800` calling it "TSPEC §3.4's model-rung
  ladder, and the **one** ladder the tier ships". The shipped second consumer follows that pattern rather than copying literals —
  `orchestrate-queue.js` dispatches through an injected seam with the raw agent and a threaded `rungState` (`orchestrate-queue.js:1245-1256`, under the
  comment "the advisory driver resolves its own model rung", `:1243-1244`), and the build inlines `orchestrate-dev` into the queue bundle so that works
  (CLAUDE.md, "Workflow scripts and the runtime build"). The consolidation pass resolves its rung the same way, and AC-7.1 reports the rung it ran on.

  If FSPEC/TSPEC establishes that reuse is impossible here, the fallback is a restated pair of literals **plus a named drift observable**, never a
  named risk: a test asserting set-equality with `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` (`orchestrate-dev.js:1652-1653`), failing when either
  copy moves. A restatement without that observable is not an acceptable outcome.
- **AC-1.6** — Given the primary rung does not resolve, Then the pass runs on the fallback rung and
  reports the downgrade explicitly (mirroring `ADVISORY_MODEL_FALLBACK:`,
  `pdlc/workflows/orchestrate-dev.js:1859`) — never a silent downgrade. Given **neither** rung
  resolves, Then the pass makes no promotion, releases the AC-1.3 marker, and exits with status
  `failed` and reason code `advisory-model-unresolved`; it does not fall through to a default model.

### REQ-CONS-02 — Promotion routing (unchanged behavior preserved)

- **AC-2.1** — Given a promoted domain invariant, Then it appends to
  `docs/_constraints/DOMAIN-CONSTRAINTS.md` in the consuming repo, as today.
- **AC-2.2** — Given a promoted architectural decision, Then it writes to
  `docs/_decisions/DECISIONS-{topic}.md` in the consuming repo, as today.
- **AC-2.3** — Given the pattern-vs-coincidence bar (recurs across ≥2 unrelated features, or a
  single occurrence stating a standing invariant), Then it is unchanged and still governs every
  promotion.
- **AC-2.4** — Given the pass completes, Then `docs/_decisions/.consolidation-log.md` records date,
  consumed basenames (exactly the AC-1.1 predicate's set), promoted and deferred items, as today
  (`pdlc/skills/consolidate-learnings/SKILL.md:43`).

### REQ-CONS-03 — Pipeline-file promotion as a pull request

**Pass identity and artifact naming.** Every pass has a `passId` of the form `{YYYY-MM-DD}-{n}`,
where `n` is the 1-based ordinal of that pass on that calendar date — so the two same-day passes
AC-1.2 makes an expected case never collide. The proposal artifact is
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` (superseding today's `{date}`-only name at
`pdlc/skills/consolidate-learnings/SKILL.md:49`), the promotion branch is
`consolidation/{passId}`, and the PR body carries three trailers: `PDLC-CONSOLIDATION-PASS: {passId}`;
`PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}`, which records pass provenance and is **not** a duplicate key; and
`PDLC-CONSOLIDATION-PROMOTIONS: {sorted failure-mode-ids}`, one id per promotion the PR enacts (AC-5.1, AC-3.3). The promotions trailer is the
duplicate-PR key NFR-4 is stated against — it rides the PR, so it outlives the log record of the pass that opened it.

- **AC-3.1** — Given a promotion targets any path under the guard set — **exactly**
  `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53`): `pdlc/workflows/`,
  `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — Then the agent opens a pull request against
  the repository named by `consolidation.pluginRepository` containing the **concrete edit**, not a
  description of it. The routing predicate is set-equal to that constant, not a restatement of part
  of it: a promotion editing `pdlc/hooks/scripts/nudge-consolidation.sh` (which is where AC-1.2's
  threshold lives, `:25`) routes here like any other.
- **AC-3.2** — Given such a PR, Then its body cites the source LEARNINGS files by feature name, the
  failure mode the edit targets, and the pattern evidence that cleared AC-2.3.
- **AC-3.3** — Given multiple promotions in one pass, Then they may share one PR, but each edit is a
  separate commit carrying `PDLC-PROMOTION-ID: {id}` naming exactly the promotion it enacts, so any
  single edit is independently revertible and commit → promotion is readable without counting. A
  retirement (AC-5.4) may share that PR, with its own id and its own commit.
- **AC-3.4** — Given the PR is opened, Then its URL is written back into
  `docs/_decisions/.consolidation-log.md` and into
  `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, so a later reader can tell which promotions
  actually landed and which are still open.
- **AC-3.5** — Given the PR cannot be opened, Then the pass **still** writes
  `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` with the full proposed diff inline, so the
  fallback is today's behavior rather than a lost promotion. The failure classes are enumerated and
  each is recorded by name in the log row and the proposal file:

  | Class | Reason code | Fallback fires? | Recorded |
  |---|---|---|---|
  | Credential absent or invalid | `credential-unavailable` | yes | class + `credential: absent` (AC-4.3) |
  | `consolidation.pluginRepository` unset, not found, or renamed | `repository-unresolved` | yes | class + the configured value |
  | Network / API failure, including rate limiting | `api-failure` | yes | class + the API's status text |
  | Head branch `consolidation/{passId}` already exists remotely | `branch-exists` | yes | class + the existing branch and any PR found for it |
  | An **open or merged** PR already carries this promotion's id in its `PDLC-CONSOLIDATION-PROMOTIONS` trailer | `duplicate-suppressed` | **no** | class + the existing PR URL (NFR-4) |

- **AC-3.6** — Given any promotion, Then it is **never** pushed directly to the default branch: pull
  request only, from branch `consolidation/{passId}`, never reused across passes (`passId` makes it
  unique) and **not** deleted by the pass — deletion follows the operator's merge or close, so the
  residue of a half-failed pass stays inspectable.
- **AC-3.7** — Given a promotion PR, Then **this feature's own controls** make auto-merge
  impossible, and the pass asserts them as its own observables rather than inheriting a mechanism:
  (a) the credential grants no merge rights (AC-4.1); (b) the pass never calls a merge or
  enable-auto-merge API on any PR — including its own; (c) the PR body carries the
  `PDLC-CONSOLIDATION-PASS` trailer defined in the REQ-CONS-03 preamble ("Pass identity and artifact
  naming"), so a repo-side control can recognise it.

  This restates `pdlc-merge-phase` REQ-MERGE-03 rather than inheriting it: `guardVerdict`
  (`pdlc/workflows/orchestrate-dev.js:732`) over `effectiveGuardPaths` (`:709`) is reachable only from Phase MERGE's ladder (`:899-900`) and the
  advisory-envelope check (`:2143`) — both inside a run deciding about **that run's own** PR — and Phase MERGE ships `mergeMode: "off"` (`:61`,
  refusal `:838`). Nothing here evaluates an inbound PR raised by another process, so claiming inheritance would assert a control nothing enforces.
  Repository-side enforcement is BL-05, an operator duty.
- **AC-3.8** — Given `consolidation.pluginRepository` resolves to the same repository as the
  consuming repo — the shipping configuration today (§1) — Then the pass performs the promotion in
  a **separate clone under a temporary directory**, cut from the fetched default branch. In the
  invoking tree it performs **no branch operation of any kind**: no `checkout`, no `switch`, no
  `stash`, no `reset`, no `rebase`, no fetch into its refs — the tree may be mid-pipeline on a
  `feat-*` branch and its HEAD must be identical before and after the pass. Everything else in
  REQ-CONS-03 and REQ-CONS-04 applies unchanged; AC-4.4's local `gh` authentication is the supported
  credential in this configuration.
- **AC-3.8b** — Given the pass writes the consuming-repo artifacts — `DOMAIN-CONSTRAINTS.md`
  (AC-2.1), `DECISIONS-{topic}.md` (AC-2.2), `.consolidation-log.md` (AC-1.3, AC-2.4, AC-3.4, AC-5.1,
  AC-7.2) and `CONSOLIDATION-PROPOSAL-{passId}.md` (AC-3.5, AC-5.4) — Then those writes land in the
  **invoking tree on whatever branch it is already on** (AC-3.8 forbids changing it), and the pass
  commits them **itself, exactly once, at its terminal outcome** (AC-1.3's Commits column), never pushed, with the **pathspec on both git calls** —
  `git add -- {paths}` *and* `git commit -m {msg} -- {paths}`. The precedent is `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1576`: add
  `:1577`, commit `:1580-1585`) and the advisory-record commit mirroring its exact two-call shape (`:1615`). It is explicitly **not** `commitPaths`
  (`pdlc/workflows/orchestrate-dev.js:8669`), whose commit is a plain `git commit -m` with no pathspec (`:8690`) — deliberately, because there the
  `git add` scopes a set the wave already verified: that shape would sweep a staged index into the pass's commit, and AC-3.8's shipping tree may be
  mid-pipeline with one. Consequences the REQ commits to:
  the AC-1.3 marker is written and removed inside the pass and is **never committed**; an unrelated pathspec-scoped
  pipeline commit in the same tree cannot pick these files up and vice versa; and because a concurrent commit can hold `index.lock`, the pass retries
  that failure class as `commitPaths` does (`gitWithLockRetry`, `:8670`) — a commit that still fails leaves the writes uncommitted for the operator,
  does not change the terminal status, and records `writes-uncommitted`. These writes never travel through the AC-3.1 PR, which carries only
  guard-set edits.

  **Where those commits go, stated.** The invoking branch **is** the accepted destination, with its
  consequence stated: when it is a mid-pipeline `feat-*`, the AC-2.1/AC-2.2 promotions reach
  the default branch by riding that feature's own PR (pushed by Phase PUB, merged if at all by Phase
  MERGE) — a PR raised and reviewed for something else — so the AC-7.1 report names the branch the
  commit landed on. Abandonment is closed by construction **for the consuming-repo writes this AC
  enumerates, and for those only**: the promotions **and** the NFR-5 consumed block are one commit,
  so a discarded branch loses both together — nothing is marked consumed on the default branch and a
  later pass redoes the work, making "consumed while the promotion is lost" unreachable.

  **The AC-3.1 PR route under the same abandonment, stated separately**, because there the failure inverts: a guard-set promotion is pushed from the
  AC-3.8 separate clone to `consolidation/{passId}` and lives or dies independently of the invoking branch. If that PR merges and the branch is then
  abandoned, the promotion survives on the default branch while the consumed block, the AC-5.1 `failure-mode-id` record and the AC-3.4 PR URL die with
  the branch. This is closed on the PR identity, not on the log: NFR-4 keys **per promotion** on the `failure-mode-id` in the merged PR's
  `PDLC-CONSOLIDATION-PROMOTIONS` trailer, and that id is stable across passes (AC-5.1), so a later pass re-deriving the same promotion from a
  *larger* consumed set still records `duplicate-suppressed` rather than opening a second PR — which a sources-set key could not do (NFR-4).
  What is *not* recovered is the effectiveness record — that promotion re-enters the AC-5.2 table as if first made — and
  that loss is accepted here, not closed. Any other destination (a `consolidation/{passId}` branch for the consuming-repo writes too) is **not**
  specified: it needs the branch operations AC-3.8 forbids.

### REQ-CONS-04 — Credential scope

- **AC-4.1** — Given a credential is used at all, Then it grants `contents:write` and
  `pull_requests:write` on the repository named by `consolidation.pluginRepository` only, and grants
  **no merge rights**. This holds in the same-repo configuration too: AC-3.8 does not license a
  broader credential.
- **AC-4.2** — Given the credential, Then it is read at runtime from the environment variable named
  by `consolidation.credentialEnv` (default `PDLC_PLUGIN_REPO_TOKEN`) and is never logged, never
  written into a PR body, never persisted into any artifact. **Positive conjunct on the same path:**
  every pass's log row carries exactly one `credential:` field over the closed set
  `present (redacted)` / `absent` / `local-gh`, so the absence assertion is made on a path that
  demonstrably ran. `absent` means **no credential was in hand when the row was written** — which
  covers both a pass that looked and found none (AC-4.3) and a pass that terminated before reading
  one, i.e. `refused` (AC-1.3). The set needs no fourth "not reached" member.
- **AC-4.3** — Given the credential is absent or invalid, Then the pass degrades to AC-3.5's
  proposal-file fallback with reason code `credential-unavailable`, records
  `credential: absent` per AC-4.2, and surfaces the affected promotion in the AC-7.1 report under a
  `degraded` route with its reason code. It does not halt the whole pass, and it does not silently
  skip the promotion. Its terminal status is `promoted-degraded` when the pass promoted anything at
  all and `no-op` when it did not (§4b) — never a bare `promoted`, so a degraded run cannot read as
  an unqualified success.
- **AC-4.4** — Given the pass runs under the operator's own `gh` authentication, Then that is a
  supported configuration recording `credential: local-gh` (AC-4.2), and it is the **shipping** one
  for the same-repo case (AC-3.8); AC-4.1's scoped credential is required only when
  `consolidation.pluginRepository` names a different repository (BL-03).

AC-4.1 is a principle, not a convenience: an identity that proposes changes to the rules governing it
must not be able to enact them — separating propose-rights from merge-rights at the credential level
makes that structural, so the agent cannot merge its own proposal if every other control failed.

### REQ-CONS-05 — Falsifiability

- **AC-5.1** — Given any promotion, Then it records the failure mode it targets as a **structured
  record with four named fields**, not prose: `failure-mode-id` (a slug derived deterministically
  from the failure mode itself — its `phase` and `symptom` — never from the pass or its consumed set,
  so a later pass re-deriving the same failure mode yields the same id, which is what lets NFR-4 key
  on it after a log record is lost; unique within the log), `phase` (a member of the pipeline's phase catalogue), `symptom` (one line), and
  `artifact` (a path or glob the symptom appears in). The record is written into
  `docs/_decisions/.consolidation-log.md` alongside the promotion, and the same
  `failure-mode-id` is carried by the `PDLC-PROMOTION-ID` trailer of AC-3.3.
- **AC-5.2** — Given a consolidation pass, Then it reports, for **every** promotion recorded in
  prior passes, a verdict over the closed set `prevented` / `recurred` / `insufficient-evidence`,
  decided by a deterministic rule with no model judgment — so two runs over the same inputs cannot
  disagree, which is what makes NFR-4 true:
  - `recurred` — at least one LEARNINGS in the consumed set names this `failure-mode-id`.
  - `prevented` — no consumed LEARNINGS names the id, **and** at least one consumed LEARNINGS is
    decided by the phase observable below to have exercised the promotion's recorded `phase` (the
    population where the failure could have appeared is non-empty).
  - `insufficient-evidence` — otherwise: no consumed LEARNINGS is decided to have exercised that
    phase. This is the arm an undecidable input falls into, so the split is total.

  **The phase observable, named.** A LEARNINGS at HEAD carries no phase field: its metadata table is
  `Feature` / `REQ` / `Date Completed` / `Total Iterations` / `Upstream` / `Harvested from` /
  `DoD rounds` (`pdlc/skills/harvest-learnings/SKILL.md:70-78`), and `## 6. Approval Record` (`:105`)
  is keyed by document type, not phase. So this feature adds a **`Phases exercised`** row to that
  table, carrying the set of phase ids the feature's run executed. For a LEARNINGS predating the
  convention the value is derived, by a stated and total mapping, from `Harvested from` (`:77`) — the
  one field that already names phase-bearing artifacts:

  | `Harvested from` basename class | Phases it evidences | Shipped naming |
  |---|---|---|
  | `CROSS-REVIEW-{role}-{docType}-v{N}.md` | the phase owning that docType (REQ→R, FSPEC→F, TSPEC→T, DECISIONS→D, PLAN→P, PROPERTIES→PR) | `orchestrate-dev.js:5799` |
  | `CODE_REVIEW-{feature}-v{N}.md` | DOD | both dod-verify dispatch sites — `orchestrate-dev.js:7911` (round 1, `dodVerifyPrompt`) and `:7941` (rounds ≥2, `dodReVerifyPrompt` `:7924`); classified at `:6423` |
  | `POSTMORTEM-{phase}-{feature}.md` | that `{phase}` verbatim | `orchestrate-dev.js:5429` |

  The split is **per file, not a fixed partition of the catalogue**, and row 3 takes precedence over every other statement here. For one
  pre-convention LEARNINGS: **decidable** = the phases that file's own `Harvested from` decides — R, F, T, D, P, PR from row 1, DOD from row 2, plus
  whatever `{phase}` row 3 names verbatim; **undecidable** = the §4b catalogue minus that set. Their union is set-equal to the catalogue for every
  file — which is what makes the rule total — but neither half is fixed, because `{phase}` in a POSTMORTEM basename is **any** halting phase, not only
  a converge phase: the shared review loop builds `POSTMORTEM-${phaseId}-${feature}.md` (`orchestrate-dev.js:5429`), Phase CR runs that loop with
  `phase: "CR"` (`:10255-10257`), and the halt path builds the same name from whatever phase halted (`:10603`). So `POSTMORTEM-CR-*` is producible and
  decides CR for the file naming it; a file naming none decides no phase. Nothing here is a disjointness claim, and a set-equality test transcribed
  from this paragraph must be written per file. Any phase the mapping cannot decide for a pre-convention file counts as **not** exercised
  — which routes that promotion to `insufficient-evidence`, never to a guessed `prevented`.

  The table is under a **set-equality** obligation: exactly one row per prior promotion in the log —
  no missing rows, no rows for promotions never made; a dropped row is a failure, not a smaller
  table. To make the id observable in the consumed corpus, this feature adds a `failure-mode-id`
  line to the LEARNINGS §5 Open Items convention; a LEARNINGS predating that convention names no id
  and is evidence only for the `phase` population test, never for `recurred`.
- **AC-5.3** — Given a promotion whose verdict was `recurred` on two consecutive **counted** passes,
  Then it is flagged `ineffective` and the pass proposes either a revision or a retirement — an edit that did not work is not left in place
  indefinitely — and the AC-7.1 report **names which of those two closed alternatives it chose**, as a field over the set `revision` / `retirement`, so
  the disjunction is assertable rather than implied. (Which one to choose is FSPEC's rule to state; that the choice is reported is this REQ's.) The
  streak is counted **in passes, not elapsed time**, and only passes that returned `prevented` or `recurred` for that promotion are counted: an
  `insufficient-evidence` verdict is skipped entirely, as is any pass with an **empty consumed set** (which produces no verdict at all — AC-1.4's first
  cause). The population is keyed on consumed-set emptiness, never on the `no-op` label (AC-1.4). Quiet weeks cannot silently reset the streak. This `counted`
  population governs the `ineffective` streak **only**; AC-5.5 counts a different population.
- **AC-5.4** — Given a promotion flagged `ineffective`, Then retiring it follows the same
  propose-only path as making it: one that landed under the AC-3.1 guard set is retired by a PR
  (AC-3.1, AC-3.6); one that landed in the **consuming repo** — `DOMAIN-CONSTRAINTS.md` (AC-2.1) or
  `DECISIONS-{topic}.md` (AC-2.2) — has its retirement written into
  `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` for operator approval, **never** applied by
  the pass. Removal is as reviewable as addition on both routes.
- **AC-5.5** — Given a promotion that has returned `insufficient-evidence` on
  `consolidation.unmeasurablePasses` consecutive **evaluated** passes (default 3), Then it is
  reported as `unmeasurable`, so a promotion whose effect can never be observed is visible as such rather than accumulating silently. An **evaluated
  pass** is a pass with a **non-empty consumed set** that produced any AC-5.2 verdict for this promotion — the population is deliberately *not*
  AC-5.3's `counted` set, which excludes `insufficient-evidence` by construction and would make this state unreachable. A `prevented` or `recurred`
  verdict resets the `unmeasurable` streak to zero; a pass with an **empty** consumed set (AC-1.4's first cause) and a `skipped-cadence` tick are not
  evaluated passes and neither advance nor reset it — while a duplicate-suppressed `no-op`, whose consumed set is non-empty, is an evaluated pass and
  does. Once reached, `unmeasurable` is a standing state reported by every subsequent pass, including a `no-op` one (AC-1.4), until a verdict resets it.

### REQ-CONS-06 — Advisory-record input

**Why this requirement narrowed.** The structured per-seam counts exist only in memory:
`advisorySummaryRows` (`pdlc/workflows/orchestrate-dev.js:2708`, driven by `ADVISORY_SEAMS`) is a
field of one run's report (`:10663`, `:10695`), never persisted; the per-feature `ADVISORY-{feature}.md`
has a strict schema (`renderAdvisoryEntry`, `:2642`) but is **deleted** after Phase H2's distil
(`:10499`), whose dispatch asks only for prose with no schema (`advisoryDistilPrompt`,
`:7585-7594`) — so LEARNINGS advisory text cannot carry counts. `docs/_queue/ESCALATIONS.md`
(`ESCALATIONS_PATH`, `:2750`; appended `:2812`) is the one durable per-seam record — append-only,
never distilled, never deleted — and `renderEscalationEntry` (`:2763`) gives every entry named
`Feature` and `Seam` fields. REQ-CONS-06 consumes **that**, not an artifact that is destroyed.

**Availability of that input, stated honestly.** `docs/_queue/ESCALATIONS.md` **does not exist at
HEAD** — `docs/_queue/` holds `QUEUE.md` alone and `git log --all -- docs/_queue/ESCALATIONS.md`
returns nothing. Its only writer is the advisory tier, which ships **disabled**: `advisoryTierOn`
(`orchestrate-dev.js:9653`) resolves from `parseAdvisoryConfig` (`:1682`), default `enabled: false`
(`:1663`), and this repo's `.claude/pdlc.config.json` has an `implementation` section only. So
REQ-CONS-06 is specified **absent-first**: it ships and is testable with the tier off, and its
proposals are gated on a corpus that could actually have carried evidence. Availability is tracked
as BL-01a, not asserted as delivered.

- **AC-6.1** — Given a consolidation pass, Then it reads `docs/_queue/ESCALATIONS.md` as its machine-readable per-seam input, counting escalations per
  `Seam` per `Feature` from the entry fields `renderEscalationEntry` emits. Advisory text folded into LEARNINGS is a **corroborating, non-numeric**
  input only: the pass may cite it as evidence but never derives a count from it. The three states of that input are distinguished, shipping first:

  | Corpus state | Meaning | Pass behavior |
  |---|---|---|
  | File absent | the advisory tier has never run here (the shipping default, `enabled: false`) | records reason code `no-advisory-corpus` in the AC-7.1 report; makes **no** seam proposal of any kind — neither AC-6.2 nor AC-6.3 may fire; the rest of the pass proceeds normally |
  | File present, zero entries | the tier ran and escalated nothing | records `advisory-corpus-empty`; AC-6.2 cannot fire (no counts); AC-6.3 may fire only under its own non-emptiness gate below, which this state fails |
  | File present, ≥1 entry | a real corpus | AC-6.2 and AC-6.3 apply as written |

  Absence of the file is never read as absence of escalations: a tier that could not escalate is not a tier whose seams worked.
- **AC-6.2** — Given a seam whose escalation count in `docs/_queue/ESCALATIONS.md` spans at least two distinct features and exceeds the other seams'
  counts (the AC-2.3 pattern bar applied to this corpus), Then the pass surfaces it as a candidate for envelope revision or upstream-phase repair,
  bound to the relevant deferral.
- **AC-6.3** — Given a **non-empty** corpus (AC-6.1 row 3) in which at least one *other* seam escalated across the consumed window, and a seam with
  escalations from no feature across that same window, Then the pass may propose an envelope widening for that seam — never enacted. Both conjuncts are
  required: with an absent or empty corpus there is no widening proposal at all, so a first pass on a stock repo cannot propose widening all five
  `ADVISORY_SEAMS` (`pdlc/workflows/orchestrate-dev.js:1669`) on the strength of a corpus no run could have written. The proposal targets the **shipped
  defaults** in `pdlc/workflows/`, so it routes as a PR under AC-3.1. A consumer's `.claude/pdlc.config.json` is untracked and is not a PR-able
  surface; a widening a consumer must adopt locally is reported as an operator action in the AC-7.1 report, never as a PR.

REQ-CONS-06 makes the advisory envelope evidence-driven rather than frozen at day-one guesses, with
every widening under operator approval. The honest limit: `ESCALATIONS.md` records escalations, not
resolutions, so "resolves autonomously" is observable only as *absence of escalation*; a
resolution-rate input needs the advisory summary persisted, which is D-CONS-06.

### REQ-CONS-07 — Reporting

- **AC-7.1** — Given a pass completes, Then it reports: terminal status and reason code (both drawn
  from §4b's enumeration, and paired only as §4b permits), the rung it ran on (AC-1.5/AC-1.6),
  LEARNINGS consumed by basename, promotions by route (constraints, decisions, PR, `degraded`), the
  AC-5.2 effectiveness table, and what it deferred for human judgment. The terminal-status set is
  the six-member set of §4b: `promoted` / `promoted-degraded` / `no-op` / `skipped-cadence` /
  `refused` / `failed`. `promoted-degraded` exists so that a pass which promoted something *and* fell
  back to a proposal file (AC-4.3's `degraded` route) never reads as an unqualified success.
- **AC-7.2** — Given a pass completes on any path **other than `skipped-cadence`** — `refused` included (AC-1.3) — Then exactly one report is emitted,
  on one channel: the pass's terminal report, written as the pass's row in `docs/_decisions/.consolidation-log.md` and returned as the invocation's
  report body (what a `/loop` tick prints). It carries the PR URL **when and only when** a PR was opened. A `skipped-cadence` tick writes **no log
  row**, returning its status as the report body only — the exemption is load-bearing twice: the skipped tick is the common case under `/loop`, so a
  row per tick would grow the log without bound, and it is that same log the AC-1.1 predicate and cadence datum read from. No new notification channel
  here; a session-free one is D-CONS-04.

## 4. Non-functional requirements

- **NFR-1** — No promotion is ever applied by this agent to any path in the AC-3.1 guard set
  (`MERGE_GUARD_DEFAULTS`, `pdlc/workflows/orchestrate-dev.js:48-53`). Pull request
  only, operator approves, always (DEC-E2).
- **NFR-2** — The credential never appears in a log, PR body, artifact, or notification; and on the
  same path, the log row carries the AC-4.2 `credential:` field from its closed three-value set, so
  the absence is asserted on a run that demonstrably reached the credential.
- **NFR-3** — The pattern-vs-coincidence bar (AC-2.3) is unchanged; running on a cadence must not
  lower the promotion threshold, or cadence becomes a volume machine.
- **NFR-3a** — A cadence-triggered pass and a volume-triggered pass are distinguishable in the log:
  the pass's log row records its trigger over the closed set `cadence` / `volume` / `manual`, so
  NFR-3's "the bar held on both" is checkable rather than asserted. The set needs no "no trigger"
  member: a `skipped-cadence` tick fired no trigger and writes no log row (AC-7.2), and every status
  that does write a row was reached by exactly one of these three.
- **NFR-4** — A pass is idempotent with respect to its boundary, keyed explicitly and **per promotion**: re-running produces no duplicate promotion
  and no duplicate PR, both keyed on `failure-mode-id` (AC-5.1) — for the PR, as carried by the body's `PDLC-CONSOLIDATION-PROMOTIONS` trailer
  (REQ-CONS-03 preamble). It is deliberately **not** keyed on the sources trailer: a consumed set is time-dependent (REQ-CONS-01 step 1 enumerates
  whatever is un-consolidated *now*), so two passes proposing the same promotion normally consume different sets and a set key would miss exactly
  when suppression matters. A pass whose promotion's id is already on a PR in state **open or merged** opens nothing for it, records
  `duplicate-suppressed` with that PR's URL (AC-3.5), and never extends or supersedes it — an interrupted pass's partial PR is the operator's to merge
  or close, not silently amended. State is read at poll time with no memory of prior states: a reopened PR is open, hence a key; a
  **closed-unmerged** PR is *not* — the operator rejected that promotion, and a later pass re-proposing it is intended behaviour. Merged is in the key
  set deliberately: it is what survives when the invoking branch carrying the log record is abandoned (AC-3.8b, "the AC-3.1 PR route under the same
  abandonment"). Idempotence is well-defined because AC-5.2's verdicts are deterministic. Its limit: `failure-mode-id` cannot key a LEARNINGS predating
  that convention (AC-5.2), so suppression would not protect a re-consumed pre-convention corpus — which is why the REQ-CONS-01 legacy region prevents
  that re-consumption rather than relying on NFR-4 to absorb it.
- **NFR-5** — The pass never modifies a LEARNINGS file it consumed; and on the same path, it
  positively records consumption by appending the consumed basenames to the delimited
  `<!-- pdlc:consumed {passId} -->` block of `docs/_decisions/.consolidation-log.md` (REQ-CONS-01,
  AC-2.4; that block is appended before any other record the pass writes — and is emitted **even
  when the consumed set is empty**, as an empty pair — freezing the legacy-region boundary
  unconditionally) — which is exactly what makes those files "consolidated" for the AC-1.1 predicate
  (`pdlc/hooks/scripts/nudge-consolidation.sh:41`, scoped to that block by this feature). Those
  blocks must name **exactly** the consumed set — neither more nor fewer — and no other record type
  may be written inside one, so a basename appearing elsewhere in the log (a PR title, a failure
  mode's `artifact` field, an effectiveness row) never marks a LEARNINGS consolidated.

## 4a. Configuration

All keys live under `.claude/pdlc.config.json` → `consolidation`, in the shape `parseAdvisoryConfig`
establishes: **per-key independent fallback with a stated default**, so one malformed key never
retunes the rest and an absent or malformed section leaves every key at its default. **Config owner:
the repo operator** — the same owner as `implementation`, `advisory`, `distribution`, `merge`.

| Key | Default | Malformed / absent | Used by |
|---|---|---|---|
| `consolidation.cadenceHours` | `168` (weekly) | falls back to default, noted in report | AC-1.1 |
| `consolidation.volumeThreshold` | `5` (matches `nudge-consolidation.sh:25`) | falls back to default | AC-1.2 |
| `consolidation.staleLockMinutes` | `60` | falls back to default | AC-1.3 |
| `consolidation.pluginRepository` | `null` → the current repository (the same-repo case, AC-3.8) | treated as unresolved: `repository-unresolved`, AC-3.5 fallback | AC-3.1, AC-4.1 |
| `consolidation.credentialEnv` | `"PDLC_PLUGIN_REPO_TOKEN"` | falls back to default | AC-4.2 |
| `consolidation.unmeasurablePasses` | `3` | falls back to default | AC-5.5 |

`cadenceHours` resolves master-plan OQ-E3 for this feature: weekly **and** threshold-driven, whichever
arrives first (AC-1.2). BL-04 is thereby closed at the REQ layer.

## 4b. Enumerated vocabularies

Every enumerated value this REQ uses, in one place, with its category and the statuses it may
accompany. Downstream completeness is checkable by **set-equality against this table**, not by
containment across six sections; adding a value above without a row here is a defect.

| Value | Category | May accompany status | Defined at |
|---|---|---|---|
| `promoted` | terminal status | — | AC-7.1 |
| `promoted-degraded` | terminal status | — | AC-7.1, AC-4.3 |
| `no-op` | terminal status | — | AC-1.4 |
| `skipped-cadence` | terminal status | — | AC-1.1 (writes no log row, AC-7.2) |
| `refused` | terminal status | — | AC-1.3 |
| `failed` | terminal status | — | AC-1.6, AC-3.5 |
| `consolidation-in-progress` | reason code | `refused` | AC-1.3 |
| `reclaimed-stale-lock` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-1.3 |
| `advisory-model-unresolved` | reason code | `failed` | AC-1.6 |
| `no-cadence-datum` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed`, `refused` | AC-1.1 |
| `writes-uncommitted` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-3.8b |
| `credential-unavailable` | reason code | `promoted-degraded`, `no-op` | AC-3.5, AC-4.3 |
| `repository-unresolved` | reason code | `promoted-degraded`, `no-op` | AC-3.5 |
| `api-failure` | reason code | `promoted-degraded`, `no-op` | AC-3.5 |
| `branch-exists` | reason code | `promoted-degraded`, `no-op` | AC-3.5 |
| `duplicate-suppressed` | reason code | `promoted`, `promoted-degraded`, `no-op` | AC-3.5, NFR-4 |
| `no-advisory-corpus` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-6.1 |
| `advisory-corpus-empty` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-6.1 |
| `cadence` / `volume` / `manual` | trigger | any status that writes a row | NFR-3a, REQ-CONS-01 tick order |
| constraints / decisions / PR / `degraded` | promotion route | `promoted`, `promoted-degraded` | AC-7.1, AC-4.3 |
| `prevented` / `recurred` / `insufficient-evidence` | per-promotion verdict | any status emitting the AC-5.2 table | AC-5.2 |
| `ineffective` / `unmeasurable` | per-promotion state | as above | AC-5.3, AC-5.5 |
| `revision` / `retirement` | proposed action on an `ineffective` promotion | as above | AC-5.3 |
| `present (redacted)` / `absent` / `local-gh` | `credential:` field | any status that writes a row | AC-4.2 |
| R / F / T / D / P / PR / I / PT / CR / DOD / H / PUB / MERGE | pipeline phase id (AC-5.1's catalogue) | any status emitting the AC-5.2 table | `PHASE_DISPATCH` (`orchestrate-dev.js:3336-3437` — declaration `:3336`, first key `R:` `:3337`, last key `DOD:` `:3431`, close `:3437`) for R/F/T/D/P/PR/CR/DOD; `recordPhase` literals for I (`:10020`), PT (`:10250`), H (`:10407`), PUB (`:10462`), MERGE (`:10568`) |

Two joins the table settles. A pass that promoted something and also hit an AC-3.5 fallback class is
`promoted-degraded`, never a bare `promoted` — the degradation is visible in the status, not only in
a route field. A pass whose every promotion was `duplicate-suppressed` promoted nothing new and is
therefore `no-op` (AC-1.4's second cause), while a pass that suppressed one duplicate and landed
another is `promoted` — or `promoted-degraded` if it also degraded a third, which is why
`duplicate-suppressed` permits all three.

A pass may carry more than one reason code, and each row's permitted set is derived **by
composition, not by the status the code was first introduced under**: a code is legal with every
terminal status still reachable after the point in the pass at which the code is recorded. That is
why the two AC-6.1 corpus codes permit `failed` (the corpus is read before AC-3.5's or AC-1.6's
failure is decidable), and why `no-cadence-datum` permits `refused`: it is decided at step 3 of the
tick order, and the marker check that yields `refused` comes after (AC-1.3 — the marker is written
"after the trigger decision of steps 1–4"), so a tick with an empty datum set that then loses the
race carries both. `writes-uncommitted` does **not** permit `refused`, because a refused pass commits
nothing (AC-1.3). `skipped-cadence` carries no code at all: it writes no log row (AC-7.2).

## 5. Scope

**In scope:** the `/loop`-driven cadence trigger and the volume trigger evaluated by the pass, in the
stated tick order, including the empty-datum bootstrap; the single un-consolidated predicate over
the delimited consumed block plus the legacy region — including the matching edits to
`pdlc/skills/consolidate-learnings/SKILL.md:35`, to `pdlc/hooks/scripts/nudge-consolidation.sh:41`
(predicate) and to `:28` (the corpus glob widened to `docs/completed/*/`); reuse of the shipped two-rung advisory ladder
(`resolveAdvisoryRung`, `orchestrate-dev.js:1833`) with reported fallback; PR promotion with scoped
credential, in both the same-repo (AC-3.8) and two-repo configurations, plus the pathspec-scoped
commit of the consuming-repo writes (AC-3.8b); the effectiveness/falsifiability loop, including the
two LEARNINGS convention additions this feature makes — `failure-mode-id` (AC-5.2) and
`Phases exercised` in the harvest metadata table (`harvest-learnings/SKILL.md:70-78`);
`ESCALATIONS.md` consumption in all three corpus states (AC-6.1); reporting against §4b's
vocabularies; tests.

The pass ships as a workflow script beside the existing `consolidate-learnings` skill (the
`orchestrate-queue` shape: a skill and a bundled workflow sharing a name), so its bundle is a new
tracked artifact of `pdlc/workflows/build-runtime.mjs` and a new row in
`pdlc/workflows/dist/distribution-manifest.json`; BL-02's machinery applies to this feature's own
output as much as to what it promotes.

**Out of scope:** merging any promotion PR; changing the promotion bar; session-free (no Claude Code
session) execution; a new notification channel; consolidating across multiple consuming repos;
persisting the advisory per-seam summary; retiring the manual `/pdlc:consolidate-learnings` entry
point; repository-side branch protection (BL-05, operator).

## 5a. Stopping rule

This REQ is done when every acceptance criterion above names **what is observed and where** — a
status value, a reason code, a config key with a default, a path, or a named constant at
`file:line`. How any of that is tested, generated or fixtured is **not** this REQ's job: property
axes, fault-injection vocabularies, coverage floors, fixture construction and oracle mechanics
belong to FSPEC, TSPEC and PROPERTIES (DC-09, `docs/_constraints/DOMAIN-CONSTRAINTS.md:245`).
Concretely, for the review loop:

- A round whose blocking findings are **all** "this cannot be tested as written" or "this needs an
  oracle" — none contesting user need, scope, priority, phasing, or the truth of a claim about
  existing code — means this REQ has met its bar. **Approve, and route those findings downstream.**
- Findings that *do* belong here, and must be fixed here: a false or under-stated claim about code
  at HEAD; an AC whose input is a configured value with no key, default and owner; a deferral with
  no bound successor; a topology or trigger the shipped architecture cannot provide.
- Re-opening a question settled in an earlier round is out of order unless new evidence at
  `file:line` contradicts the settlement.

## 6. Dependencies

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-advisory-tier`'s two-rung model ladder delivered — `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` (`orchestrate-dev.js:1652-1653`) and the exported resolver `resolveAdvisoryRung` (`:1833`) | PR merged | **Met** — queue row 14 `done`, merged `bb99f89` (#38). Gates AC-1.5/AC-1.6 |
| BL-01a | An advisory **escalation corpus** — `docs/_queue/ESCALATIONS.md` with ≥1 entry | Operator sets `.claude/pdlc.config.json` → `advisory.enabled: true`, and a run escalates | **Not met, and not expected to be.** The file does not exist at HEAD or in history; the writer is gated on `advisoryTierOn` (`orchestrate-dev.js:9653`) whose default is `enabled: false` (`:1663`), and this repo's config has no `advisory` section. Does **not** gate FSPEC: AC-6.1 specifies the absent and empty states as first-class, and AC-6.2/AC-6.3 are inert without a corpus |
| BL-02 | `pdlc-workflow-distribution` delivered. A promotion that lands in `yumo-plugins` and never reaches a consumer's `.claude/workflows/` is not a promotion | PR merged | **Met** — archived to `docs/completed/pdlc-workflow-distribution/` |
| BL-03 | Fine-grained token per AC-4.1 provisioned, and the env var of `consolidation.credentialEnv` populated | Operator action + config value | Required only for the two-repo configuration; the same-repo shipping configuration (AC-3.8) runs on local `gh` auth (AC-4.4), so this does **not** gate FSPEC |
| BL-04 | Cadence value (master plan OQ-E3) | Config default | **Closed** by §4a: `cadenceHours` default 168, plus the AC-1.2 volume trigger |
| BL-05 | Repository-side enforcement that no promotion PR is auto-merged — branch protection / required review on the plugin repo | Operator action on the GitHub repo | Not a code dependency and does not gate FSPEC; AC-3.7's controls hold without it, but the repo-side belt is the operator's |

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-CONS-01 | Auto-merging any promotion PR | DEC-E2 is unconditional | — |
| D-CONS-02 | Consolidating across multiple consuming repos | One real consumer today | `pdlc-engineering-loop` |
| D-CONS-03 | Automatic prompt-size budgeting / pruning by age | Effectiveness-based retirement (AC-5.3) is the honest mechanism; age is a proxy | — |
| D-CONS-04 | Running the cadence as a cloud Routine | Routines run on a fresh clone with no working tree; viable for consolidation but needs its own design | `pdlc-engineering-loop` |
| D-CONS-05 | A/B measuring a promotion against a control | No control population exists in a serial single-pipeline setup | — |
| D-CONS-06 | Persisting the advisory per-seam summary (`advisorySummaryRows`, `orchestrate-dev.js:2708`) in a defined LEARNINGS section, so resolution *rates* — not only escalations — are consumable | The rows exist only in memory and `ADVISORY-{feature}.md` is deleted after distil (`:10499`); adding a schema to `advisoryDistilPrompt` is an `orchestrate-dev` change, not a consolidation change. REQ-CONS-06 is narrowed to `ESCALATIONS.md` in the meantime | `pdlc-engineering-loop` |
| D-CONS-07 | Session-free execution and a notification channel that survives without a Claude Code session | Same vehicle as D-CONS-04; AC-7.2 names the in-session report until then | `pdlc-engineering-loop` |
