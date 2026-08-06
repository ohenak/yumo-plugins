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
The propose-only rule behind that is correct — agents proposing changes to the prompts that govern
agents must pass through human judgment — but *propose-only* and *hand-transcribed* are different
requirements, and the skill enforces the second while intending only the first.

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
`hookSpecificOutput.additionalContext` and exits 0 (`:47-48`, header `:4`). The hook's role is
**unchanged by this feature** — it advises, it does not trigger. Truly session-free execution (no
Claude Code session at all) is D-CONS-04, bound to `pdlc-engineering-loop`.

**One predicate for "un-consolidated", named.** Two definitions exist at HEAD and disagree: the
hook's basename test (`pending = [p for p in learnings if os.path.basename(p) not in logtext]`,
`pdlc/hooks/scripts/nudge-consolidation.sh:41`, against `docs/_decisions/.consolidation-log.md`,
`:32`) and the skill's date boundary (`Date Completed` after the last logged pass,
`pdlc/skills/consolidate-learnings/SKILL.md:35`). **This feature adopts the basename test as the
single predicate** — it is durable against LEARNINGS date edits and is already the shipped
mechanism — and updates `consolidate-learnings/SKILL.md:35` to match. Every AC below that says
"un-consolidated" or "accumulated since the last pass" means exactly this predicate.

**The predicate's corpus is a delimited region, not the whole log.** The shipped predicate is a bare
substring test over the entire text of `docs/_decisions/.consolidation-log.md`
(`nudge-consolidation.sh:41`, log read at `:32`). This feature writes five further record types into
that same file (the AC-1.3 marker, AC-3.4's PR URLs, AC-5.1's failure-mode records — whose `artifact`
field may legitimately be `docs/{feature}/LEARNINGS-{feature}.md` — and AC-5.2's effectiveness
table), any of which could otherwise contain a LEARNINGS basename and falsely mark that file
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

**What is in that file at HEAD, and the migration rule.** `docs/_decisions/.consolidation-log.md`
**exists** and predates every convention this feature introduces: a markdown pass log whose
`## Pass 1 — 2026-07-29` records its consumed set as a two-column table of **full paths**
(`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md` | 2026-06-02, and the same
shape for `docs/pdlc-workflow-distribution/…`), followed by prose promotion sections. It carries
**no** `<!-- pdlc:consumed -->` block and **no** row status of any kind — "Promoted" appears only as
a section heading. A predicate matching blocks alone would therefore report both files
un-consolidated on the first pass, re-consume a corpus a prior pass already promoted from, and get
no help from NFR-4 (keyed on `failure-mode-id`, which a pre-convention LEARNINGS does not carry,
AC-5.2). The predicate is therefore stated over two regions, and is total over any log:

> A basename is **consolidated** if it appears inside a `<!-- pdlc:consumed {passId} -->` block, **or**
> anywhere in the log's **legacy region** — the text preceding the file's *first*
> `<!-- pdlc:consumed` marker. A log with no block at all is legacy region in its entirety.

The legacy region is the shipped substring test (`nudge-consolidation.sh:41`) applied to exactly the
text predating this feature, so nothing already consolidated is re-consumed and no transcription or
parse of Pass 1's prose is required. It is frozen by construction: the first pass appends its
`<!-- pdlc:consumed -->` block **before** any other record it writes, so every record this feature
introduces lands after the boundary and none can be read as legacy consumption.
`nudge-consolidation.sh:41` is updated to the same two-region rule, keeping hook and pass on one
predicate. **On this repo today** (the state a first-run test asserts against) step 1's enumeration
matches 5 files; `LEARNINGS-orchestrate-dev-workflow.md` and `LEARNINGS-pdlc-workflow-distribution.md`
are named in the legacy region and consolidated; the other 3 (`…-pdlc-advisory-tier`,
`…-pdlc-merge-phase`, `…-pdlc-review-loop-hardening`) are un-consolidated — below the default
`volumeThreshold` of 5, so the first tick reaches the cadence test.

**Tick evaluation order, stated.** Every `/loop` tick evaluates in exactly this order, and no step
reads a LEARNINGS **body**:

1. **Enumerate** LEARNINGS basenames and diff them against the predicate above — this yields the
   un-consolidated set. Enumeration is basenames only, which is all `nudge-consolidation.sh:41` does.
   The corpus is `docs/*/LEARNINGS-*.md` **and** `docs/completed/*/LEARNINGS-*.md`. The shipped glob
   is depth-1 only (`nudge-consolidation.sh:28`), but this repo archives completed features one level
   deeper (`docs/completed/{pdlc-merge-phase,pdlc-review-loop-hardening,pdlc-workflow-distribution}/`
   each hold a LEARNINGS; BL-02 cites the convention), so depth-1 hides 3 of the 5 LEARNINGS at HEAD
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
runs, its trigger is `cadence` (NFR-3a needs no new member) and its log row additionally carries
reason code `no-cadence-datum` so the bootstrap tick is distinguishable from an ordinary cadence tick.
The pass's own row then becomes the datum for every later tick. The opposite reading — empty means
not elapsed — is rejected because it makes cadence unreachable until someone runs a manual pass,
which is the never-fires failure this datum exists to prevent.

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
  fires on whichever of cadence or volume arrives first. The count is produced by step 1 of the tick
  order above — a basename enumeration, not a read of LEARNINGS bodies — so it is available before
  the cadence test without contradicting AC-1.1's cheap exit. The threshold is evaluated **by the
  pass itself**, not by the hook.
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
  | `failed` | yes | yes | yes, if it wrote anything; otherwise nothing to commit |
  | `refused` | **no** — the marker belongs to the pass that holds it | **no** — the loser never unlocks the winner | **no** — it wrote nothing |
  | `skipped-cadence` | **no** — the tick terminates before the marker is written | **no** | **no** — it writes no log row (AC-7.2) |

  Given the marker is older than `consolidation.staleLockMinutes` (default 60), Then
  the pass reclaims it, records `reclaimed-stale-lock` with the abandoned pass id in its report,
  and proceeds — so a pass that dies mid-flight cannot wedge the cadence permanently. An operator
  may also clear it by deleting the line.
- **AC-1.4** — Given a pass that makes **no new promotion** — either because the un-consolidated set
  under the AC-1.1 predicate is empty, or because every promotion it would have made was suppressed
  as a duplicate (NFR-4) — Then it records `no-op` in `docs/_decisions/.consolidation-log.md` and
  exits successfully without opening a PR or writing a proposal file. A `no-op` pass still emits the
  AC-5.2 effectiveness table, restating each prior promotion's **standing** verdict and state
  (including an `unmeasurable` already reached), and still releases the AC-1.3 marker. **Which
  streaks it advances is decided by consumed-set emptiness, never by the `no-op` label** — the two
  causes above differ exactly there. A `no-op` with an **empty** consumed set is not an evaluated
  pass (AC-5.5) and is not a counted pass (AC-5.3): it advances neither streak, so it can report an
  ageing but never cause one. A `no-op` reached by duplicate suppression has a **non-empty** consumed
  set, produces real AC-5.2 verdicts, and therefore counts in both populations on the ordinary rules
  — `prevented` / `recurred` in AC-5.3's `counted` set, any verdict in AC-5.5's evaluated set.
- **AC-1.5** — Given a pass runs, Then it runs on the advisory model rung and records the rung it
  actually ran on in its report and in the log row. The rung ladder is the one
  `pdlc-advisory-tier` ships: `MODEL_ADVISORY` (`pdlc/workflows/orchestrate-dev.js:1652`) first,
  `MODEL_ADVISORY_FALLBACK` (`:1653`) on non-resolution. **This feature reuses that ladder; it does
  not restate it.** The two constants are module-private, but the ladder itself is not: the resolver
  `resolveAdvisoryRung` is exported at `orchestrate-dev.js:1833`, under a doc comment at `:1800`
  calling it "TSPEC §3.4's model-rung ladder, and the **one** ladder the tier ships". The shipped
  second consumer follows exactly that pattern rather than copying literals —
  `orchestrate-queue.js` dispatches through an injected seam with the raw agent and a threaded
  `rungState` (`orchestrate-queue.js:1245-1256`, under the comment "the advisory
  driver resolves its own model rung", `:1243-1244`), and the build inlines `orchestrate-dev` into the
  queue bundle so that works (CLAUDE.md, "Workflow scripts and the runtime build"). The consolidation
  pass resolves its rung the same way, and the rung it actually ran on is what AC-7.1 reports.

  If FSPEC/TSPEC establishes that reuse is impossible for this pass, the fallback is a restated pair
  of literals **plus a named drift observable**, never a named risk: a test asserting the
  consolidation ladder is set-equal to `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK`
  (`orchestrate-dev.js:1652-1653`), which fails when either copy moves. A restatement without that
  observable is not an acceptable outcome.
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
  consumed files (by basename, exactly the set the AC-1.1 predicate selected), promoted items, and
  deferred items, as today (`pdlc/skills/consolidate-learnings/SKILL.md:43`).

### REQ-CONS-03 — Pipeline-file promotion as a pull request

**Pass identity and artifact naming.** Every pass has a `passId` of the form `{YYYY-MM-DD}-{n}`,
where `n` is the 1-based ordinal of that pass on that calendar date — so the two same-day passes
AC-1.2 makes an expected case never collide. The proposal artifact is
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` (superseding today's `{date}`-only name at
`pdlc/skills/consolidate-learnings/SKILL.md:49`), the promotion branch is
`consolidation/{passId}`, and the PR body carries two trailers:
`PDLC-CONSOLIDATION-PASS: {passId}` and `PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}`.
These are the identity keys NFR-4 is stated against.

- **AC-3.1** — Given a promotion targets any path under the guard set — **exactly**
  `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53`): `pdlc/workflows/`,
  `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — Then the agent opens a pull request against
  the repository named by `consolidation.pluginRepository` containing the **concrete edit**, not a
  description of it. The routing predicate is set-equal to that constant, not a restatement of part
  of it: a promotion editing `pdlc/hooks/scripts/nudge-consolidation.sh` (which is where AC-1.2's
  threshold lives, `:25`) routes here like any other.
- **AC-3.2** — Given such a PR, Then its body cites the source LEARNINGS files by feature name, the
  failure mode the edit targets, and the pattern evidence that cleared AC-2.3.
- **AC-3.3** — Given multiple promotions in one pass, Then they may share one PR, but each edit is
  a separate commit carrying the trailer `PDLC-PROMOTION-ID: {id}` naming exactly the promotion it
  enacts, so any single edit can be reverted independently and a reader can map commit → promotion
  without counting. A retirement (AC-5.4) may share a PR with additive promotions; it carries its
  own `PDLC-PROMOTION-ID` and its own commit.
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
  | An open PR already carries this pass's `PDLC-CONSOLIDATION-SOURCES` trailer | `duplicate-suppressed` | **no** | class + the existing PR URL (NFR-4) |

- **AC-3.6** — Given any promotion, Then it is **never** pushed directly to the default branch.
  Pull request only, from branch `consolidation/{passId}`. The branch is never reused across passes
  (the `passId` makes it unique) and is **not** deleted by the pass — deletion follows the operator's
  merge or close of the PR, so the residue of a half-failed pass stays inspectable.
- **AC-3.7** — Given a promotion PR, Then **this feature's own controls** make auto-merge
  impossible, and the pass asserts them as its own observables rather than inheriting a mechanism:
  (a) the credential grants no merge rights (AC-4.1); (b) the pass never calls a merge or
  enable-auto-merge API on any PR — including its own; (c) the PR body carries the
  `PDLC-CONSOLIDATION-PASS` trailer defined in the REQ-CONS-03 preamble ("Pass identity and artifact
  naming"), so a repo-side control can recognise it.

  This restates, and does not repeat, `pdlc-merge-phase` REQ-MERGE-03: that guard is `guardVerdict`
  (`pdlc/workflows/orchestrate-dev.js:732`) over `effectiveGuardPaths` (`:709`), reachable only from
  Phase MERGE's ladder (`:899-900`) and the advisory-envelope check (`:2143`) — both inside a run
  deciding about **that run's own** PR — and Phase MERGE ships `mergeMode: "off"` (`:61`, refusal
  `:838`). Nothing here evaluates an inbound PR raised by another process, so claiming inheritance
  would assert a control nothing enforces. Repository-side enforcement is BL-05, an operator duty.
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
  commits them **itself, exactly once, at its terminal outcome** (AC-1.3's Commits column), never
  pushed, with the **pathspec on both git calls** — `git add -- {paths}` *and*
  `git commit -m {msg} -- {paths}`. The precedent is `commitQueueRow`
  (`pdlc/workflows/orchestrate-queue.js:1576`: add `:1577`, commit `:1580-1585`) and the advisory-record
  commit that mirrors its exact two-call shape (`:1615`). It is explicitly **not** `commitPaths`
  (`pdlc/workflows/orchestrate-dev.js:8669`), whose commit is a plain `git commit -m` with no pathspec
  (`:8690`) — deliberately, because there the `git add` scopes a set the wave already verified. That
  shape would sweep anything already staged into the pass's commit, and AC-3.8's shipping tree is
  precisely one that may be mid-pipeline with a staged index, so it cannot deliver this AC's
  isolation guarantee. Consequences the REQ commits to: the AC-1.3 marker is written and removed
  inside the pass and is therefore **never committed** (one commit per pass, not two); an unrelated
  pathspec-scoped pipeline commit in the same tree cannot pick these files up and vice versa; and
  because a concurrent pipeline commit can hold `index.lock`, the pass retries on that class of
  failure the way `commitPaths` does (`gitWithLockRetry`, `:8670`). A commit that still fails leaves
  the writes uncommitted for the operator, does not change the pass's terminal status, and records
  reason code `writes-uncommitted` in the report and log row. These writes never travel through the
  AC-3.1 PR — that PR carries only guard-set edits.

  **Where those commits go, stated.** The invoking branch **is** the accepted destination in the
  shipping configuration, with the consequence said out loud: when that branch is a mid-pipeline
  `feat-*`, the AC-2.1/AC-2.2 promotions reach the default branch by riding that feature's own PR
  (pushed later by Phase PUB, merged if at all by Phase MERGE) — a PR raised and reviewed for
  something else. The AC-7.1 report therefore names the branch the commit landed on, so the operator
  can see it. The abandonment case is closed by construction rather than by policy: the promotions
  **and** the NFR-5 consumed block are written in the **same single commit**, so a discarded branch
  loses both together — the LEARNINGS are not marked consumed on the default branch, and a later pass
  redoes the work. The failure mode "marked consumed while the promotion is lost" is therefore
  unreachable. A destination other than the invoking branch (a `consolidation/{passId}` branch for
  the consuming-repo writes too) is **not** specified here: it would require the branch operations
  AC-3.8 forbids in the invoking tree.

### REQ-CONS-04 — Credential scope

- **AC-4.1** — Given a credential is used at all, Then it grants `contents:write` and
  `pull_requests:write` on the repository named by `consolidation.pluginRepository` only, and grants
  **no merge rights**. This holds in the same-repo configuration too: AC-3.8 does not license a
  broader credential.
- **AC-4.2** — Given the credential, Then it is read at runtime from the environment variable named
  by `consolidation.credentialEnv` (default `PDLC_PLUGIN_REPO_TOKEN`) and is never logged, never
  written into a PR body, and never persisted into any artifact. **Positive conjunct on the same
  path:** the log row for every pass carries exactly one `credential:` field whose value is drawn
  from the closed set `present (redacted)` / `absent` / `local-gh` — so the absence assertion is
  made on a path that demonstrably ran, not on a path that may never have executed.
- **AC-4.3** — Given the credential is absent or invalid, Then the pass degrades to AC-3.5's
  proposal-file fallback with reason code `credential-unavailable`, records
  `credential: absent` per AC-4.2, and surfaces the affected promotion in the AC-7.1 report under a
  `degraded` route with its reason code. It does not halt the whole pass, and it does not silently
  skip the promotion. Its terminal status is `promoted-degraded` when the pass promoted anything at
  all and `no-op` when it did not (§4b) — never a bare `promoted`, so a degraded run cannot read as
  an unqualified success.
- **AC-4.4** — Given the pass runs under the operator's own `gh` authentication, Then that is a
  supported configuration and records `credential: local-gh` (AC-4.2). It is the **shipping**
  configuration for the same-repo case (AC-3.8); the scoped credential of AC-4.1 is required only
  when `consolidation.pluginRepository` names a different repository (BL-03).

AC-4.1 is a principle, not a convenience: an identity that proposes changes to the rules governing it
must not be able to enact them. Separating propose-rights from merge-rights at the credential level
makes that structural — the agent cannot merge its own proposal even if every other control failed.

### REQ-CONS-05 — Falsifiability

- **AC-5.1** — Given any promotion, Then it records the failure mode it targets as a **structured
  record with four named fields**, not prose: `failure-mode-id` (a stable slug, unique within the
  log), `phase` (a member of the pipeline's phase catalogue), `symptom` (one line), and
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

  **The phase observable, named.** A LEARNINGS file at HEAD carries no phase field: its metadata
  table is `Feature` / `REQ` / `Date Completed` / `Total Iterations` / `Upstream` / `Harvested from` /
  `DoD rounds` (`pdlc/skills/harvest-learnings/SKILL.md:70-78`), and `## 6. Approval Record` (`:105`)
  is keyed by document type, not phase. So this feature adds one, exactly as it adds
  `failure-mode-id`: a **`Phases exercised`** row to the harvest metadata table
  (`harvest-learnings/SKILL.md:70-78`), whose value is the set of pipeline phase ids that feature's
  run actually executed. For a LEARNINGS predating that convention the value is derived, by a stated
  and total mapping, from the `Harvested from` row (`:77`) — the one field that already names phase-
  bearing artifacts:

  | `Harvested from` basename class | Phases it evidences | Shipped naming |
  |---|---|---|
  | `CROSS-REVIEW-{role}-{docType}-v{N}.md` | the phase owning that docType (REQ→R, FSPEC→F, TSPEC→T, DECISIONS→D, PLAN→P, PROPERTIES→PR) | `orchestrate-dev.js:5799` |
  | `CODE_REVIEW-{feature}-v{N}.md` | DOD | `orchestrate-dev.js:10349` |
  | `POSTMORTEM-{phase}-{feature}.md` | that `{phase}` verbatim | `orchestrate-dev.js:5429` |

  The mapping is a partition of the §4b phase catalogue: **decidable** = R, F, T, D, P, PR (row 1),
  DOD (row 2), plus whatever `{phase}` row 3 names verbatim; **undecidable** = I, PT, CR, H, PUB,
  MERGE. The two sets are disjoint and their union is set-equal to the catalogue, so no phase falls
  through. Any phase the mapping cannot decide for a pre-convention file counts as **not** exercised
  — which routes that promotion to `insufficient-evidence`, never to a guessed `prevented`. Both
  inputs are file text, so two runs over the same corpus cannot disagree; that is what NFR-4 rests on.

  The table is under a **set-equality** obligation: it carries exactly one row per prior promotion
  in the log — no missing rows and no rows for promotions that were never made. A dropped row is a
  failure, not a smaller table.

  To make the id observable in the consumed corpus, this feature adds a `failure-mode-id` line to
  the LEARNINGS §5 Open Items convention; a LEARNINGS predating the convention names no id and is
  therefore evidence only for the `phase` population test, never for `recurred`.
- **AC-5.3** — Given a promotion whose verdict was `recurred` on two consecutive **counted** passes,
  Then it is flagged `ineffective` and the pass proposes either a revision or a retirement — an
  edit that did not work is not left in place indefinitely — and the AC-7.1 report **names which of
  those two closed alternatives it chose**, as a field over the set `revision` / `retirement`, so the
  disjunction is assertable rather than implied. (Which one to choose is FSPEC's rule to state; that
  the choice is reported is this REQ's.) The streak is counted **in passes, not elapsed time**, and
  only passes that returned `prevented` or `recurred` for that promotion are counted: an
  `insufficient-evidence` verdict is skipped entirely, as is any pass with an **empty consumed set**
  (which produces no verdict at all — AC-1.4's first cause). The population is keyed on consumed-set
  emptiness, never on the `no-op` label: a `no-op` reached by duplicate suppression has a non-empty
  consumed set and real verdicts, so it counts here like any other pass. Quiet weeks therefore cannot
  silently reset the streak. This `counted` population governs the `ineffective` streak **only**;
  AC-5.5 counts a different population.
- **AC-5.4** — Given a promotion flagged `ineffective`, Then retiring it follows the same
  propose-only path as making it. A promotion that landed under the AC-3.1 guard set is retired by a
  PR (AC-3.1, AC-3.6). A promotion that landed in the **consuming repo** — `DOMAIN-CONSTRAINTS.md`
  (AC-2.1) or `DECISIONS-{topic}.md` (AC-2.2) — is not a cross-repo edit; its retirement is written
  into `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` for operator approval and is **never**
  applied by the pass. Removal is as reviewable as addition on both routes.
- **AC-5.5** — Given a promotion that has returned `insufficient-evidence` on
  `consolidation.unmeasurablePasses` consecutive **evaluated** passes (default 3), Then it is
  reported as `unmeasurable`, so a promotion whose effect can never be observed is visible as such
  rather than accumulating silently. An **evaluated pass** is a pass with a **non-empty consumed
  set** that produced any AC-5.2 verdict for this promotion — the population is deliberately *not*
  AC-5.3's `counted` set, which excludes `insufficient-evidence` by construction and would make this
  state unreachable. A `prevented` or `recurred` verdict resets the `unmeasurable` streak to zero; a
  pass with an **empty** consumed set (AC-1.4's first cause) and a `skipped-cadence` tick are not
  evaluated passes and neither advance nor reset it — while a duplicate-suppressed `no-op`, whose
  consumed set is non-empty, is an evaluated pass and does. Once reached, `unmeasurable` is a standing state reported by every subsequent
  pass, including a `no-op` one (AC-1.4), until a verdict resets it.

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

- **AC-6.1** — Given a consolidation pass, Then it reads `docs/_queue/ESCALATIONS.md` as its
  machine-readable per-seam input, counting escalations per `Seam` per `Feature` from the entry
  fields `renderEscalationEntry` emits. Advisory text folded into LEARNINGS is a **corroborating,
  non-numeric** input only: the pass may cite it as evidence but never derives a count from it. The
  three states of that input are distinguished, and the shipping state is the first:

  | Corpus state | Meaning | Pass behavior |
  |---|---|---|
  | File absent | the advisory tier has never run here (the shipping default, `enabled: false`) | records reason code `no-advisory-corpus` in the AC-7.1 report; makes **no** seam proposal of any kind — neither AC-6.2 nor AC-6.3 may fire; the rest of the pass proceeds normally |
  | File present, zero entries | the tier ran and escalated nothing | records `advisory-corpus-empty`; AC-6.2 cannot fire (no counts); AC-6.3 may fire only under its own non-emptiness gate below, which this state fails |
  | File present, ≥1 entry | a real corpus | AC-6.2 and AC-6.3 apply as written |

  Absence of the file is never read as absence of escalations: a tier that could not escalate is not
  a tier whose seams worked.
- **AC-6.2** — Given a seam whose escalation count in `docs/_queue/ESCALATIONS.md` spans at least
  two distinct features and exceeds the other seams' counts (the AC-2.3 pattern bar applied to this
  corpus), Then the pass surfaces it as a candidate for envelope revision or upstream-phase repair,
  bound to the relevant deferral.
- **AC-6.3** — Given a **non-empty** corpus (AC-6.1 row 3) in which at least one *other* seam
  escalated across the consumed window, and a seam with escalations from no feature across that same
  window, Then the pass may propose an envelope widening for that seam — never enacted. Both
  conjuncts are required: with an absent or empty corpus the pass makes no widening proposal at all,
  so the first pass on a stock repo cannot propose widening all five `ADVISORY_SEAMS`
  (`pdlc/workflows/orchestrate-dev.js:1669`) on the strength of a corpus that no run could have
  written. The proposal targets the **shipped
  defaults** in `pdlc/workflows/`, so it routes as a PR under AC-3.1. A consumer's
  `.claude/pdlc.config.json` is untracked and is not a PR-able surface; a widening a consumer must
  adopt locally is reported as an operator action in the AC-7.1 report, never as a PR.

REQ-CONS-06 is what makes the advisory envelope evidence-driven rather than frozen at whatever was
guessed on day one, while keeping every widening under operator approval. Note the honest limit:
`ESCALATIONS.md` records escalations, not resolutions, so "resolves autonomously at a high rate" is
observable here only as *absence of escalation*. A resolution-rate input requires the advisory
summary to be persisted, which is D-CONS-06.

### REQ-CONS-07 — Reporting

- **AC-7.1** — Given a pass completes, Then it reports: terminal status and reason code (both drawn
  from §4b's enumeration, and paired only as §4b permits), the rung it ran on (AC-1.5/AC-1.6),
  LEARNINGS consumed by basename, promotions by route (constraints, decisions, PR, `degraded`), the
  AC-5.2 effectiveness table, and what it deferred for human judgment. The terminal-status set is
  the six-member set of §4b: `promoted` / `promoted-degraded` / `no-op` / `skipped-cadence` /
  `refused` / `failed`. `promoted-degraded` exists so that a pass which promoted something *and* fell
  back to a proposal file (AC-4.3's `degraded` route) never reads as an unqualified success.
- **AC-7.2** — Given a pass completes on any path **other than `skipped-cadence`**, Then exactly one
  report is emitted, on one channel: the pass's terminal report, written as the pass's row in
  `docs/_decisions/.consolidation-log.md` and returned as the invocation's report body (which is
  what a `/loop` tick prints). It carries the PR URL **when and only when** a PR was opened. A
  `skipped-cadence` tick writes **no log row** — it returns its status as the invocation's report
  body only. The exemption is load-bearing twice over: under a `/loop` cadence the skipped tick is
  the common case, so a row per tick would grow the log without bound, and it is that same log the
  AC-1.1 predicate and the AC-1.1 cadence datum are read from. No separate notification channel is
  introduced by this feature; a channel that survives with no session at all is bound to D-CONS-04.

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
- **NFR-4** — A pass is idempotent with respect to its boundary, keyed explicitly: re-running over
  the same consumed-LEARNINGS set produces no duplicate promotion (identity: `failure-mode-id`,
  AC-5.1) and no duplicate PR (identity: the `PDLC-CONSOLIDATION-SOURCES` trailer defined in the
  REQ-CONS-03 preamble, "Pass identity and artifact naming"). A pass
  that finds an **open** PR carrying an identical sources trailer opens nothing, records
  `duplicate-suppressed` with that PR's URL (AC-3.5), and never extends or supersedes it — an
  interrupted pass's partial PR is left for the operator to merge or close, not silently amended.
  Idempotence is well-defined precisely because AC-5.2's verdicts are deterministic. Its limit is
  stated: `failure-mode-id` cannot key a LEARNINGS predating that convention (AC-5.2), so duplicate
  suppression would not protect a re-consumed pre-convention corpus — which is why the REQ-CONS-01
  legacy region prevents that re-consumption instead of relying on NFR-4 to absorb it.
- **NFR-5** — The pass never modifies a LEARNINGS file it consumed; and on the same path, it
  positively records consumption by appending the consumed basenames to the delimited
  `<!-- pdlc:consumed {passId} -->` block of `docs/_decisions/.consolidation-log.md` (REQ-CONS-01,
  AC-2.4; that block is appended before any other record the pass writes, which is what freezes the
  legacy-region boundary) — which is exactly what makes those files "consolidated" for the AC-1.1 predicate
  (`pdlc/hooks/scripts/nudge-consolidation.sh:41`, scoped to that block by this feature). Those
  blocks must name **exactly** the consumed set — neither more nor fewer — and no other record type
  may be written inside one, so a basename appearing elsewhere in the log (a PR title, a failure
  mode's `artifact` field, an effectiveness row) never marks a LEARNINGS consolidated.

## 4a. Configuration

All keys live under `.claude/pdlc.config.json` → `consolidation`, following the contract shape
`parseAdvisoryConfig` establishes: **per-key independent fallback with a stated default**, so one
malformed key never retunes the rest, and an absent or malformed `consolidation` section leaves
every key at its default. **Config owner: the repo operator** (the human who owns
`.claude/pdlc.config.json`; the same owner as `implementation`, `advisory`, `distribution`, `merge`).

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

Every enumerated value this REQ uses, in one place, with its category and the terminal statuses it
may accompany. Completeness of any downstream handling is checkable by **set-equality against this
table**, not by containment across six sections; adding a value anywhere above without a row here is
a defect.

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
| `no-cadence-datum` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-1.1 |
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
| R / F / T / D / P / PR / I / PT / CR / DOD / H / PUB / MERGE | pipeline phase id (AC-5.1's catalogue) | any status emitting the AC-5.2 table | `PHASE_DISPATCH` (`orchestrate-dev.js:3337-3431`) for R/F/T/D/P/PR/CR/DOD; `recordPhase` literals for I (`:10020`), PT (`:10250`), H (`:10407`), PUB (`:10462`), MERGE (`:10568`) |

Two joins the table settles, because both were previously undetermined. A pass that promoted
something and also hit an AC-3.5 fallback class is `promoted-degraded`, never a bare `promoted` — the
degradation is visible in the status, not only in a route field. A pass whose every promotion was
`duplicate-suppressed` promoted nothing new and is therefore `no-op` (AC-1.4's second cause), while a
pass that suppressed one duplicate and landed another is `promoted` — or `promoted-degraded` if it
also degraded a third, which is why `duplicate-suppressed` permits all three.

A pass may carry more than one reason code, and each row's permitted set is derived **by
composition, not by the status the code was first introduced under**: a code is legal with every
terminal status still reachable after the point in the pass at which the code is recorded. That is
why the two AC-6.1 corpus codes permit `failed` (the corpus is read before AC-3.5's or AC-1.6's
failure is decidable) and why `no-cadence-datum` and `writes-uncommitted` permit all four
row-writing statuses. By the same rule `refused` carries `consolidation-in-progress` and nothing
else, and `skipped-cadence` carries no code at all — it writes no log row (AC-7.2).

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

The pass ships as a workflow script alongside the existing `consolidate-learnings` skill — the
`orchestrate-queue` shape, a skill and a bundled workflow sharing a name. Its bundle is therefore a
new tracked artifact of `pdlc/workflows/build-runtime.mjs` and a new row in
`pdlc/workflows/dist/distribution-manifest.json`, and BL-02's distribution machinery applies to this
feature's own output as much as to what it promotes.

**Out of scope:** merging any promotion PR; changing the promotion bar; session-free (no Claude Code
session) execution; a new notification channel; consolidating across multiple consuming repos;
persisting the advisory per-seam summary; retiring the manual `/pdlc:consolidate-learnings` entry
point; repository-side branch protection (BL-05, operator).

## 5a. Stopping rule

This REQ is done when every acceptance criterion above names **what is observed and where** — a
status value, a reason code, a config key with a default, a path, or a named constant at
`file:line`. It is **not** this REQ's job to specify how any of that is tested, generated or
fixtured: property axes, fault-injection vocabularies, coverage floors, fixture construction and
oracle mechanics belong to FSPEC, TSPEC and PROPERTIES (DC-09,
`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`).

Concretely, for the review loop:

- A round whose blocking findings are **all** of the form "this cannot be tested as written" or
  "this needs an oracle" — none contesting user need, scope, priority, phasing, or the truth of a
  claim about existing code — means this REQ has met its bar. **Approve, and route those findings
  downstream** to the document that owns them.
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
