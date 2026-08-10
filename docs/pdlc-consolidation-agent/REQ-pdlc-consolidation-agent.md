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
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..10}.md` (20 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 2.2 | 2026-08-09 |

> **Erratum round (v2.2, Phase PR).** Two targeted corrections, nothing else changed: AC-6.3's population is stated as the
> whole of `ESCALATIONS.md` rather than "the consumed window", matching FSPEC §9.2/§9.5 and BR-37a; AC-3.4 no longer
> requires the opened PR's URL in `CONSOLIDATION-PROPOSAL-{passId}.md`, which FSPEC §5.3 does not write on that path.

> **Erratum round (v2.1, Phase D).** Three targeted corrections, nothing else changed: REQ-CONS-01 step 1 withdraws its
> "one enumeration as well as one predicate" claim and decides the two classes on which the hook's and the pass's
> enumerations would otherwise disagree (including whether a `.gitignore`d LEARNINGS file is corpus — it is); §4b decides
> whether the durable log row carries unreadable corpus basenames (it does not).

> **Scope in one line.** Run consolidation on a cadence with the advisory model, and carry pipeline-level promotions to `yumo-plugins` as pull requests
> (the same repository today, AC-3.8), with every promotion recording the failure mode it targets and the next pass reporting, by a deterministic rule,
> whether that failure mode recurred.

## 1. Problem

`consolidate-learnings` reads per-feature LEARNINGS and promotes recurring patterns into
project-level `DOMAIN-CONSTRAINTS` and `DECISIONS`. That part works and stays.

Two things do not.

**The cross-repo dead end.** When a learning says *a skill prompt itself should change*, the skill
writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a four-column markdown table,
`| Source LEARNINGS | Target skill | Proposed change | Rationale |`
(`pdlc/skills/consolidate-learnings/SKILL.md:75`) — **in the consuming repo**, while the skills it names live in `yumo-plugins/pdlc/skills/`. Nothing
carries the proposal across that boundary: no `gh pr create` and no cross-repo push exists outside Phase PUB's own-repo `ship-pr`. Propose-only is
correct — agents changing the prompts that govern agents must pass through human judgment — but *propose-only* and *hand-transcribed* are different
requirements, and the skill enforces the second while intending only the first.

**Today's only consumer is `yumo-plugins` itself.** `docs/_queue/QUEUE.md:11` states that this queue is the pipeline's own queue, and `:279` that every
PR in it trips the self-modification guard: "consuming repo" and "plugin repo" are one repository in the shipping configuration, which is why AC-3.8 is
the primary case rather than a two-repo topology that does not yet exist.

**Unfalsifiability.** Nothing checks whether a promotion worked. A pass promotes a constraint or a skill edit and never revisits it. Over enough passes
this drifts toward ceremony: prompts grow, nobody can say which growth helped, and no promotion is ever retired. An improvement process that cannot be
wrong cannot be trusted to be right.

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

**Trigger surface, named.** The pass ships as a workflow script invoked as `/pdlc:consolidate-learnings`. Its cadence vehicle at HEAD is the one the
queue already uses — a session-resident `/loop run /pdlc:consolidate-learnings` (CLAUDE.md, "Entry (queue, multi-feature)"), where the operator starts
the loop once and each tick runs a pass with no per-pass invocation. Nothing in `pdlc/hooks/hooks.json` can start a pass: it registers only `PreToolUse`,
`PostToolUse` and `SessionStart` entries (`:3`, `:14`, `:29`), and `nudge-consolidation.sh` only prints `hookSpecificOutput.additionalContext` and exits
0 (`:47-48`, header `:4`) — its advisory role is **unchanged** here. Session-free execution is D-CONS-04, bound to `pdlc-engineering-loop`.

**One predicate for "un-consolidated", named.** Two definitions exist at HEAD and disagree: the hook's basename test (`pending = [p for p in learnings
if os.path.basename(p) not in logtext]`, `pdlc/hooks/scripts/nudge-consolidation.sh:41`, against `docs/_decisions/.consolidation-log.md`, `:32`) and the
skill's date boundary (`Date Completed` after the last logged pass — the boundary step, `pdlc/skills/consolidate-learnings/SKILL.md:56`). **This feature adopts the basename
test** — durable against LEARNINGS date edits and already shipped — and updates `SKILL.md:56` to match. Every AC below saying "un-consolidated" or
"accumulated since the last pass" means exactly this predicate.

**The predicate's corpus is a delimited region, not the whole log.** The shipped predicate is a bare
substring test over the whole of `docs/_decisions/.consolidation-log.md` (`:41`; the read is `:36-37`), and
this feature writes further record types into that same file (AC-3.4's PR URLs, AC-5.1's failure-mode
records — whose `artifact` field may legitimately be a LEARNINGS path — and AC-5.2's effectiveness
table), any of which could contain a basename and falsely mark that file consolidated. So consumption
is recorded **only** inside the delimited `<!-- pdlc:consumed {passId} -->` block whose grammar,
exclusivity rule ("no other record type may appear inside one") and append-only write granularity are
stated in **`docs/_constraints/pdlc-consolidation-vocabularies.md` §3** (at `Version` 1.4) and are binding here. This
feature updates `pdlc/hooks/scripts/nudge-consolidation.sh:41` to scope its test to those blocks, so
the hook and the pass keep one predicate rather than two — which is what makes NFR-5's "exactly the
consumed set" enforceable by the predicate that consumes it.

**What is in that file at HEAD, and the migration rule.** `docs/_decisions/.consolidation-log.md` already **exists** and predates every convention
this feature introduces — it carries no `<!-- pdlc:consumed -->` block and no row status of any kind — and NFR-4 gives no help with it, being keyed on
`failure-mode-id`, which a pre-convention LEARNINGS does not carry (AC-5.2). The predicate is therefore stated over two regions, and is total over any
log:

> A basename is **consolidated** if it appears inside a `<!-- pdlc:consumed {passId} -->` block, **or**
> anywhere in the log's **legacy region** — the text preceding the file's *first* `<!-- pdlc:consumed`
> marker (a log with no block at all is legacy region entire).

The log's shape at HEAD, and the two clauses that freeze the legacy boundary — the unconditional consumed-pair append, empty pair included, and the
single exempt record, which is a `refused` pass's AC-7.2 row — are stated once in
**`docs/_constraints/pdlc-consolidation-vocabularies.md` §3** (at `Version` 1.4), are binding here and are not restated; the AC-1.3 marker is not a
second exemption, since it lives in its own file. **On this repo today** (the state a first-run test asserts against) step 1's enumeration matches 5 files; `LEARNINGS-orchestrate-dev-workflow.md` and
`LEARNINGS-pdlc-workflow-distribution.md` are named in the legacy region and consolidated; the other 3 (`…-pdlc-advisory-tier`, `…-pdlc-merge-phase`,
`…-pdlc-review-loop-hardening`) are un-consolidated — below the default `volumeThreshold` of 5, so the first tick reaches the cadence test.

**Tick evaluation order, stated.** Every `/loop` tick evaluates in exactly this order, and no step
reads a LEARNINGS **body**:

1. **Enumerate** LEARNINGS basenames and diff them against the predicate above — this yields the
   un-consolidated set. Enumeration is basenames only, which is all `nudge-consolidation.sh:41` does.
   The corpus is `docs/*/LEARNINGS-*.md` **and** `docs/completed/*/LEARNINGS-*.md`. The shipped glob
   is depth-1 only (`nudge-consolidation.sh:28`), but this repo archives completed features one level
   deeper — `docs/completed/pdlc-merge-phase/`, `docs/completed/pdlc-review-loop-hardening/` and
   `docs/completed/pdlc-workflow-distribution/` each hold one LEARNINGS — so depth-1 hides 3 of the 5 at HEAD
   and biases AC-5.2's phase population toward `insufficient-evidence`. `docs/discarded/*/` is
   deliberately **excluded** — abandoned work is not evidence about a delivered pipeline. Widening
   makes `nudge-consolidation.sh:28` an in-scope edit (§5).

   **One predicate, two enumerations (erratum, v2.1).** This step previously closed with "keeping one
   enumeration as well as one predicate". The second half is not deliverable and is **withdrawn**. The
   hook enumerates with Python `glob.glob` (`nudge-consolidation.sh:28`); the pass cannot, because the
   `_listFiles` seam lists exactly one directory and drops directory entries (`runtime-adapter.js:915`,
   `:929-931`), so it cannot walk `docs/*/` at all and must enumerate through the git seam. **One
   predicate remains guaranteed by construction** — both sides run the same block-scoped basename test
   stated above — while the two enumerations are separate mechanisms whose agreement is a stated,
   testable property rather than a shared code path. The two classes on which those mechanisms would
   otherwise disagree are decided here, not left to TSPEC:

   - **A `.gitignore`d LEARNINGS file *is* corpus.** Membership is presence on disk under the two globs,
     not tracked-ness: a LEARNINGS file that exists has a body to read, and the hook — which cannot see
     `.gitignore` — would otherwise nag about a file the pass is forbidden to consume, a nag that never
     quiesces. The pass's enumeration therefore does **not** apply `--exclude-standard`. That closes this
     class at exactly that price and no other, because `docs/discarded/*/` is excluded by the pathspec,
     not by the ignore rules.
   - **An index entry with no working-tree file is *not* corpus.** A staged-but-deleted LEARNINGS has no
     body, so it is not evidence about anything; the pass's enumeration is restricted to paths present in
     the working tree, which closes the second class.
2. **Volume test** — if `|un-consolidated| >= consolidation.volumeThreshold`, the pass runs, trigger
   `volume` (AC-1.2).
3. **Cadence test** — otherwise, if `consolidation.cadenceHours` has elapsed since the cadence datum
   below, the pass runs, trigger `cadence` (AC-1.1).
4. Otherwise the tick terminates `skipped-cadence`.

A direct `/pdlc:consolidate-learnings` invocation skips steps 2–4 entirely and runs with trigger
`manual`.

**The cadence datum, named.** Step 3's interval is measured from the timestamp of the most recent log row whose status is in the set `promoted` /
`promoted-degraded` / `no-op` / `failed` — the last pass that took the AC-1.3 marker and did work. A `refused` row is not a datum, and a
`skipped-cadence` tick **writes no log row at all** (AC-7.2), so ticking cannot advance the datum; otherwise every tick's own row would become "the last
logged pass" and `cadenceHours` could never elapse.

**The empty-datum case, decided.** The datum set is empty in two states — no log file (a fresh repo) and a log with no row carrying one of those four
statuses (the state at HEAD: Pass 1 predates the status convention). **An empty datum set counts as elapsed**: the cadence test fires, the pass runs,
trigger `cadence` (NFR-3a needs no new member), and its row additionally carries reason code `no-cadence-datum`, so a bootstrap tick is distinguishable
from an ordinary one. That row then becomes the datum. Empty-means-not-elapsed is rejected: it makes cadence unreachable until someone runs a manual
pass — the never-fires failure this datum prevents.

- **AC-1.1** — Given a `/loop` tick and `consolidation.cadenceHours` elapsed since the cadence datum
  defined above, Then a consolidation pass runs with no per-pass operator invocation. Given **no** log
  row carries one of that datum's four statuses, Then
  the interval counts as elapsed, the pass runs, and its log row records trigger `cadence` plus
  reason code `no-cadence-datum`; given neither the volume test (step 2)
  nor the cadence test (step 3) fires, Then the tick exits `skipped-cadence` having read **no
  LEARNINGS body** — only basenames were enumerated — and writes no log row. Given a direct
  `/pdlc:consolidate-learnings` invocation, Then the pass runs regardless of the interval — the
  manual entry point is never gated by cadence.
- **AC-1.2** — Given the count of un-consolidated LEARNINGS (the AC-1.1 predicate) is at least
  `consolidation.volumeThreshold` (default 5, the value at `nudge-consolidation.sh:25`), Then the
  pass runs on this tick even if `consolidation.cadenceHours` has not elapsed, so consolidation fires on whichever of cadence or volume arrives first.
  The count comes from step 1 — basenames, never bodies. The threshold is evaluated **by the pass**, not by the hook.
- **AC-1.3** — Given a pass begins while the in-progress marker is present and younger than
  `consolidation.staleLockMinutes`, Then the second pass exits with status `refused` and reason
  code `consolidation-in-progress`, naming the marker's timestamp and pass id; the refused pass is
  **dropped, not queued** — the next tick re-evaluates from scratch. The marker is a single
  `IN-PROGRESS: {passId} {ISO-8601}` line in a file of its **own**, `docs/_decisions/.consolidation-lock` —
  deliberately **not** in `.consolidation-log.md`, because taking and releasing it are in-place
  rewrites of a whole small file and every write to the *log* must stay an append (below). It is
  written **after** the trigger decision of steps 1–4 and before any other pass work, lives in the
  working tree only, and is never committed by any pass (AC-3.8b). Because a standalone untracked file in a tracked directory is committable by any
  actor that is not pathspec-scoped, "working tree only" is guaranteed against actors other than the pass too: this feature adds
  `docs/_decisions/.consolidation-lock` to the repository `.gitignore` (§5), which today carries no pattern matching it (verified at HEAD:
  `.tokensave/`, `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`, `node_modules/`, `/.claude/workflows/`). Without that clause a
  committed lock reaches every fresh clone and refuses every pass with `consolidation-in-progress` until `staleLockMinutes` elapses, per clone. Take and release are set-equal to
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
  a trigger (NFR-3a — the refused tick fired one of `cadence` / `volume` / `manual` to reach the marker check) and `credential: absent` (AC-4.2). It is
  **written, never committed**, by decision: a pathspec stages a whole file, so a refused commit would capture the winner's log at an arbitrary mid-pass
  instant. The winner's own AC-3.8b commit covers the same path and sweeps the row up; if the winner dies first the row stays in the working tree, which
  is all its evidentiary purpose needs. It writes **no** consumed block — only marker-holding passes emit one (REQ-CONS-01) — so it never touches the
  legacy-region boundary.

  **Why no lock is needed: the write-granularity obligation** (`docs/_constraints/pdlc-consolidation-vocabularies.md` §3 at `Version` 1.4, binding here and not
  restated: every log write is one whole record appended at end of file, the whole-file read-modify-write forbidden). Its two consequences here: the
  marker lives in `.consolidation-lock` (its take and release are in-place edits), and the winner's consumed pair is emitted complete in one append, its
  set fixed at step 1 before any promotion work (NFR-5). So the loser's refused row and the winner's
  records interleave in either order without loss, which is what makes both durability claims above true.

  Given the marker is older than `consolidation.staleLockMinutes` (default 60), Then the pass
  reclaims it, records `reclaimed-stale-lock` with the abandoned pass id, and proceeds — a pass that dies mid-flight cannot wedge the cadence. An
  operator may also clear it by deleting `.consolidation-lock`.
- **AC-1.4** — Given a pass that makes **no new promotion** — either because the un-consolidated set
  under the AC-1.1 predicate is empty, or because every promotion it would have made was suppressed
  as a duplicate (NFR-4) — Then it records `no-op` in `docs/_decisions/.consolidation-log.md` and
  exits successfully without opening a PR or writing a proposal file. A `no-op` pass still emits the
  AC-5.2 effectiveness table, restating each prior promotion's **standing** verdict and state
  (including an `unmeasurable` already reached), and still releases the AC-1.3 marker. **Which
  streaks it advances is decided by consumed-set emptiness, never by the `no-op` label** — the two
  causes differ exactly there, and AC-5.3 and AC-5.5 state each population in those terms.
- **AC-1.5** — Given a pass runs, Then it runs on the advisory model rung and records the rung it actually ran on in its report and in the log row.
  The rung ladder — its two constants, its exported resolver `resolveAdvisoryRung`
  (`pdlc/workflows/orchestrate-dev.js:1833`), its shipped second consumer, and the drift-observable fallback if reuse proves impossible — is stated in
  **`docs/_constraints/pdlc-advisory-corpus-baseline.md` §3** (at `Version` 1.0) and is binding here. **This feature reuses that ladder; it does not restate it.**
- **AC-1.6** — Given the primary rung does not resolve, Then the pass runs on the fallback rung and
  reports the downgrade explicitly (mirroring `ADVISORY_MODEL_FALLBACK:`,
  `pdlc/workflows/orchestrate-dev.js:1859`) — never a silent downgrade. Given **neither** rung
  resolves, Then the pass makes no promotion, releases the AC-1.3 marker, and exits with status
  `failed` and reason code `advisory-model-unresolved`; it does not fall through to a default model.

### REQ-CONS-02 — Promotion routing (unchanged behavior preserved)

- **AC-2.1** — Given a promoted domain invariant, Then it appends to `docs/_constraints/DOMAIN-CONSTRAINTS.md` in the consuming repo, as today.
- **AC-2.2** — Given a promoted architectural decision, Then it writes to `docs/_decisions/DECISIONS-{topic}.md` in the consuming repo, as today.
- **AC-2.3** — Given the pattern-vs-coincidence bar (recurs across ≥2 unrelated features, or a single occurrence stating a standing invariant), Then it
  is unchanged and still governs every promotion.
- **AC-2.4** — Given the pass completes, Then `docs/_decisions/.consolidation-log.md` records date, consumed basenames (exactly the AC-1.1 predicate's
  set), promoted and deferred items, as today (`pdlc/skills/consolidate-learnings/SKILL.md:64`).

### REQ-CONS-03 — Pipeline-file promotion as a pull request

**Pass identity and artifact naming.** The `passId` form `{YYYY-MM-DD}-{n}` (which is what keeps the two same-day passes AC-1.2 makes an expected case
from colliding), the derived proposal-artifact and branch names, and the three PR-body trailers plus the per-commit `PDLC-PROMOTION-ID` are stated once
in **`docs/_constraints/pdlc-consolidation-vocabularies.md` §4** (at `Version` 1.4) and are binding here. Two obligations over that grammar are this
REQ's own. `PDLC-CONSOLIDATION-PROMOTIONS` is **set-equal** to the proposals the PR enacts, `action` over the closed set `promote` / `revise` / `retire`
(AC-5.1, §4b): a revision or a retirement (AC-5.4) sharing the PR is enumerated there like any other, under its own action. And that trailer — never the
sources trailer — is the duplicate-PR key NFR-4 is stated against: it rides the PR, so it outlives the log record of the pass that opened it, and
because the key is the pair, a merged `promote` entry never bars its own remediation.

- **AC-3.1** — Given a promotion targets any path under the guard set — **exactly**
  `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53`): `pdlc/workflows/`,
  `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — Then the agent opens a pull request against
  the repository named by `consolidation.pluginRepository` containing the **concrete edit**, not a
  description of it. The routing predicate is set-equal to that constant, not a restatement of part
  of it: a promotion editing `pdlc/hooks/scripts/nudge-consolidation.sh` (which is where AC-1.2's
  threshold lives, `:25`) routes here like any other.
- **AC-3.2** — Given such a PR, Then its body cites the source LEARNINGS files by feature name, the failure mode the edit targets, and the pattern
  evidence that cleared AC-2.3.
- **AC-3.3** — Given multiple promotions in one pass, Then they may share one PR, but each edit is a
  separate commit carrying `PDLC-PROMOTION-ID: {id}:{action}` naming exactly the proposal it enacts, so any
  single edit is independently revertible and commit → proposal is readable without counting. A
  revision or retirement (AC-5.3, AC-5.4) may share that PR, in its own commit; it carries the **retired promotion's own `failure-mode-id`** under the
  `revise` or `retire` action — AC-5.1 mints no second id for it — and that pair joins `PDLC-CONSOLIDATION-PROMOTIONS` like any other, so the trailer
  stays set-equal to the proposals the PR enacts.
- **AC-3.4** — Given the PR is opened, Then its URL is recorded in `docs/_decisions/.consolidation-log.md`, so a later reader can tell which promotions
  landed and which are still open. It is **not** also recorded in `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`: that file is written when, and
  only when, the pass has something to propose that it does not enact (AC-3.5, AC-5.4, AC-6.3), and an opened PR is enacted, so on this path no proposal
  file exists to record into. In the log it is
  **not** an in-place edit of an earlier record — that shape is forbidden (AC-1.3): it is the `pr:` field of the pass's single terminal row, appended
  once (AC-7.2). "Exactly one report" there counts reports, and the log gains exactly one row per pass on this path.
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

  `duplicate-suppressed` is **not** a member of this table: it is decided per promotion before any PR is attempted, fires no fallback, and is stated in
  NFR-4.
- **AC-3.6** — Given any promotion, Then it is **never** pushed directly to the default branch: pull request only, from branch
  `consolidation/{passId}`, never reused across passes (`passId` makes it unique) and **not** deleted by the pass — deletion follows the operator's
  merge or close, so the residue of a half-failed pass stays inspectable.
- **AC-3.7** — Given a promotion PR, Then **this feature's own controls** make auto-merge
  impossible, and the pass asserts them as its own observables rather than inheriting a mechanism:
  (a) the credential grants no merge rights (AC-4.1); (b) the pass never calls a merge or
  enable-auto-merge API on any PR — including its own; (c) the PR body carries the
  `PDLC-CONSOLIDATION-PASS` trailer (vocabularies §4, cited by the REQ-CONS-03 preamble), so a
  repo-side control can recognise it.

  This restates `pdlc-merge-phase` REQ-MERGE-03 rather than inheriting it: `guardVerdict` (`pdlc/workflows/orchestrate-dev.js:732`) over
  `effectiveGuardPaths` (`:709`) is reachable only from Phase MERGE's ladder (`:899-900`) and the advisory-envelope check (`:2143`) — both deciding
  about **that run's own** PR — and Phase MERGE ships `mergeMode: "off"` (`:61`, refusal `:838`). Nothing there evaluates an inbound PR, so claiming
  inheritance would assert a control nothing enforces. Repository-side enforcement is BL-05, an operator duty.
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
  (`pdlc/workflows/orchestrate-dev.js:8669`), whose commit is a plain `git commit -m` with no pathspec (`:8690`): that shape would sweep a staged index
  into the pass's commit, and AC-3.8's shipping tree may be mid-pipeline with one. Consequences the REQ commits to:
  the AC-1.3 marker is written and removed inside the pass and is **never committed** — it is not one of the enumerated paths, and
  `docs/_decisions/.consolidation-lock` appears in no pathspec of any pass; an unrelated pathspec-scoped
  pipeline commit in the same tree cannot pick these files up and vice versa; and because a concurrent commit can hold `index.lock`, the pass retries
  that failure class as `commitPaths` does (`gitWithLockRetry`, `:8670`) — a commit that still fails leaves the writes uncommitted for the operator,
  does not change the terminal status, and records `writes-uncommitted`. These writes never travel through the AC-3.1 PR, which carries only
  guard-set edits.

  **Where those commits go.** The invoking branch **is** the accepted destination. When it is a mid-pipeline `feat-*`, the AC-2.1/AC-2.2 promotions
  reach the default branch by riding that feature's own PR — raised and reviewed for something else — so the AC-7.1 report names the branch the commit
  landed on. Abandonment is closed by construction **for the consuming-repo writes this AC enumerates, and for those only**: the promotions and the
  NFR-5 consumed block are one commit, so a discarded branch loses both together and a later pass redoes the work. Any other destination (a
  `consolidation/{passId}` branch for these writes too) is **not** specified: it needs the branch operations AC-3.8 forbids.

  **The AC-3.1 PR route under the same abandonment inverts**, so it is stated separately: a guard-set promotion is pushed from the AC-3.8 clone and
  lives or dies independently of the invoking branch, so a merged PR can survive while the consumed block, the AC-5.1 record and the AC-3.4 URL die with
  the branch. This is closed on the PR identity, not the log: NFR-4 keys on the `(failure-mode-id, action)` pair in the merged PR's
  `PDLC-CONSOLIDATION-PROMOTIONS` trailer, and the id is stable across passes (AC-5.1), so a later pass re-deriving the same `promote` from a *larger*
  consumed set records `duplicate-suppressed` rather than opening a second PR — which a sources-set key could not do. What is *not* recovered is the
  effectiveness record: that promotion re-enters the AC-5.2 table as if first made, a loss accepted here, not closed.

### REQ-CONS-04 — Credential scope

- **AC-4.1** — Given a credential is used at all, Then it grants `contents:write` and `pull_requests:write` on the repository named by
  `consolidation.pluginRepository` only, and grants **no merge rights**. This holds in the same-repo configuration too: AC-3.8 does not license a
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

AC-4.1 is a principle, not a convenience: separating propose-rights from merge-rights at the
credential level is what makes "the agent cannot merge its own proposal" structural rather than
procedural — it holds even if every other control failed.

### REQ-CONS-05 — Falsifiability

- **AC-5.1** — Given any promotion, Then it records the failure mode it targets as a **structured
  record with four named fields**, not prose: `failure-mode-id` (a slug derived deterministically from the promotion's `phase` and its target
  `artifact`, and from **nothing else** — not from the pass, not from its consumed set, and **not** from `symptom`), `phase` (a member of the pipeline's
  phase catalogue, §4b), `symptom` (one line, human-readable and explicitly **non-keying**), and `artifact` — **exactly one canonical repository path,
  never a glob and never a directory**: the single file the edit touches, path-normalised (repository-root-relative, no `./`, no symlink alias). The
  record is written into `docs/_decisions/.consolidation-log.md` alongside the promotion, and the same id is carried, under its `action` below, by the
  `PDLC-PROMOTION-ID` trailer of AC-3.3.

  **Why those inputs.** Determinism of the derivation is not stability of its inputs. `phase` (closed 13-member catalogue) and `artifact` (a repository
  path) are *file* text — the property AC-5.2's determinism argument rests on. `symptom` is a line the pass's own model writes under no vocabulary, so
  two passes recognising one failure mode from different corpora would word it differently and slug differently — exactly the case NFR-4 must survive
  (AC-3.8b's abandonment: a later pass with a *larger* consumed set). The glob form is forbidden for the same reason in the other direction: passes free
  to name `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/*.js` or `pdlc/workflows/` for one mode would slug three ways and NFR-4 would miss. One
  canonical path closes the split direction as `phase` closes the merge direction, which makes "a later pass re-deriving the same failure mode yields
  the same id" true rather than hoped for.

  **One promotion is one authored file.** "The single file the edit touches" is a requirement, not an assumption: a remedy spanning two authored files
  is **two** proposals — two ids, two AC-3.3 commits, two AC-5.2 rows, two AC-5.3 streaks — which may share one PR (AC-3.3 already permits that shape);
  they share nothing else and are measured separately. A **generated** path is never an `artifact` and never mints an id. *Generated* is a predicate, not
  an example, and is keyed on the **producer**, never on a path glob: a path a tracked build step of this repo writes — at HEAD exactly the four tracked
  outputs of `pdlc/workflows/build-runtime.mjs` (`:465` mints the fourth), all under `pdlc/workflows/dist/`, which `CLAUDE.md` requires to be rebuilt
  "in the same commit" as their source, so they ride the authored file's commit. An authored file whose path merely *contains* `dist/` — the
  `pdlc/workflows/__tests__/fixtures/` copies — is authored and does mint an id. So an edit to `pdlc/workflows/orchestrate-dev.js` plus its rebuilt
  bundles is **one** promotion whose `artifact` is that source file, and the derivation stays total on every edit shape.

  **Uniqueness, scoped.** Within **one pass** the pair `(failure-mode-id, action)` is unique: two proposals deriving one id under one `action` name the
  same `phase` and `artifact`, are one failure mode, and are recorded once — the pass never mints a suffixed variant, which would break derivation
  purity and with it NFR-4. Two distinct failure modes in one `phase` touching one file therefore merge into one promotion carrying one `symptom`; that
  is the accepted cost of a path-level key, and a finer key is D-CONS-08. **Across passes** the id deliberately repeats: NFR-4 sanctions re-proposing a
  promotion whose PR the operator closed unmerged. Log **records** are keyed `(failure-mode-id, passId, action)`; a **promotion** — the unit whose
  *effectiveness* is measured — is keyed on the id alone, and every effectiveness contract counts promotions, not records and not actions: AC-5.2 emits
  one row per id, AC-5.3 counts one streak per id over all its records, AC-5.4 retires an id. So a repeated id is never an ambiguous referent.

  **Action, and what it discriminates.** Every proposal carries an `action` over the closed set `promote` / `revise` / `retire` (§4b): `promote` for an
  edit targeting the mode, `revise` and `retire` for the two AC-5.3 remediations. NFR-4's suppression key is the **pair**, never the id alone, and the
  consequence must be visible: a merged `promote` PR bars a second `promote` for that `(phase, artifact)` pair forever and bars **nothing else** — the
  AC-5.3 remediations are different keys, are never suppressed by the promotion they remediate, and reach the AC-3.1 route unimpeded **by it**. They can
  still be suppressed by an *earlier remediation of the same kind* — each action fires at most once per id — which is why AC-5.3 routes the pass to the
  other alternative when its first choice is spent, and makes `retire` terminal. `action` is recorded beside the id, never folded into its derivation.
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

  **The phase observable, named.** A LEARNINGS at HEAD carries no phase field, so this feature adds a
  **`Phases exercised`** row to the harvest metadata table and derives the value, for a LEARNINGS
  predating that convention, by a stated and total mapping from `Harvested from`. That mapping — its
  three basename-class rows, their shipped-naming citations, the per-file (never fixed-partition)
  split, and the precedence of the POSTMORTEM row — is stated once in
  **`docs/_constraints/pdlc-consolidation-vocabularies.md` §2** (at `Version` 1.4) and is binding here. Its two
  consequences this AC depends on: the decidable and undecidable halves are set-equal to the §4b
  catalogue for every file, which makes the rule total; and any phase the mapping cannot decide counts
  as **not** exercised, which routes that promotion to `insufficient-evidence`, never to a guessed
  `prevented`.

  The table is under a **set-equality** obligation: exactly one row per **distinct `failure-mode-id`** recorded in prior passes — records sharing an id
  are one promotion carrying one standing verdict, not two rows (AC-5.1) — with no missing rows and no rows for promotions never made; a dropped row is
  a failure, not a smaller table. To make the id observable in the consumed corpus, this feature adds a `failure-mode-id`
  line to the LEARNINGS §5 Open Items convention; a LEARNINGS predating that convention names no id
  and is evidence only for the `phase` population test, never for `recurred`.
- **AC-5.3** — Given a promotion whose verdict was `recurred` on two consecutive **counted** passes,
  Then it is flagged `ineffective` and the pass proposes either a revision or a retirement — an edit that did not work is not left in place
  indefinitely — and the AC-7.1 report **names which of those two closed alternatives it chose**, as a field over the set `revision` / `retirement`, so
  the disjunction is assertable rather than implied — and **absent** for an ordinary `promote`, which chose nothing. (Which one to choose is FSPEC's rule
  to state; that the choice is reported is this REQ's.) The
  streak is counted per `failure-mode-id` **in passes, not elapsed time**, and only passes that returned `prevented` or `recurred` for that promotion are
  counted: an `insufficient-evidence` verdict is skipped entirely, as is any pass with an **empty consumed set** (which produces no verdict at all —
  AC-1.4's first cause), so quiet weeks cannot silently reset the streak. The population is keyed on consumed-set emptiness, never on the `no-op` label
  (AC-1.4), and it governs the `ineffective` streak **only**; AC-5.5 counts a different population.

  **A spent alternative, and the terminal remediation.** NFR-4 suppresses on the pair, so each `action` fires at most once per id — which would leave
  AC-5.3's promise merely *achievable* rather than guaranteed if the pass could choose an alternative already spent. It cannot: **when the pass's chosen
  alternative is already on a PR in state open or merged, it proposes the other one**, and `retire` is the **terminal** remediation — a retired promotion
  is gone, so no successor is owed. Terminal is stated over the **proposal**, since the pending case is the reachable one: once a `retire` proposal for
  an id is on a PR in state open or merged, that id's ladder has **ended** — a later `ineffective` tick proposes nothing, records `duplicate-suppressed`
  against that PR, and the AC-7.1 field names `retirement`. So the ladder cannot run out and the displacement clause never points back into a spent
  pair. The AC-7.1 field otherwise names the alternative actually proposed, never the one displaced.
  And a **merged** revision resets that promotion's `ineffective` streak to zero — the reset AC-5.5 makes explicit for `unmeasurable`, made explicit here
  too — so a revision that lands is re-judged on two fresh `recurred` counted passes rather than re-flagged on the next one.
- **AC-5.4** — Given a promotion flagged `ineffective`, Then retiring it follows the same
  propose-only path as making it: one that landed under the AC-3.1 guard set is retired by a PR
  (AC-3.1, AC-3.6); one that landed in the **consuming repo** — `DOMAIN-CONSTRAINTS.md` (AC-2.1) or
  `DECISIONS-{topic}.md` (AC-2.2) — has its retirement written into
  `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` for operator approval, **never** applied by the pass — removal as reviewable as addition on both
  routes. A **revision** routes exactly as that promotion's retirement would, under the `revise` action instead of `retire`; the two AC-5.3 alternatives
  differ in the edit they carry, never in their route. The unit retired or revised is a `failure-mode-id` (AC-5.1), not one of its records, and neither
  proposal is ever suppressed by the `promote` it remediates (NFR-4).
- **AC-5.5** — Given a promotion that has returned `insufficient-evidence` on
  `consolidation.unmeasurablePasses` consecutive **evaluated** passes (default 3), Then it is
  reported as `unmeasurable`, so a promotion whose effect can never be observed is visible as such rather than accumulating silently. An **evaluated
  pass** is a pass with a **non-empty consumed set** that produced any AC-5.2 verdict for this promotion — the population is deliberately *not*
  AC-5.3's `counted` set, which excludes `insufficient-evidence` by construction and would make this state unreachable. A `prevented` or `recurred`
  verdict resets the `unmeasurable` streak to zero; a pass with an **empty** consumed set (AC-1.4's first cause) and a `skipped-cadence` tick are not
  evaluated passes and neither advance nor reset it — while a duplicate-suppressed `no-op`, whose consumed set is non-empty, is an evaluated pass and
  does. Once reached, `unmeasurable` stands until a verdict resets it, and AC-1.4 restates it meanwhile.

### REQ-CONS-06 — Advisory-record input

**Why this requirement narrowed, and what it may rely on.** Which advisory records survive a run (§1) and whether the surviving one exists at HEAD (§2)
are stated once in **`docs/_constraints/pdlc-advisory-corpus-baseline.md`** (at `Version` 1.0) and are binding here; this REQ restates neither, and takes
two obligations from them. **(a)** REQ-CONS-06 consumes `docs/_queue/ESCALATIONS.md` — §1's one durable machine-readable per-seam record — and never a
destroyed artifact, so no count is ever derived from LEARNINGS advisory text. **(b)** Because §2 finds it absent at HEAD, REQ-CONS-06 is specified
**absent-first**: it ships and is testable with the tier off, and availability is tracked as BL-01a, not asserted as delivered.

- **AC-6.1** — Given a consolidation pass, Then it reads `docs/_queue/ESCALATIONS.md` as its machine-readable per-seam input, counting escalations per
  `Seam` per `Feature` from the entry fields `renderEscalationEntry` emits. Advisory text folded into LEARNINGS is a **corroborating, non-numeric**
  input only: the pass may cite it as evidence but never derives a count from it. The three states of that input are distinguished, shipping first:

  | Corpus state | Meaning | Pass behavior |
  |---|---|---|
  | File absent | the advisory tier has never run here (the shipping default, `enabled: false`) | records reason code `no-advisory-corpus` in the AC-7.1 report; makes **no** seam proposal of any kind — neither AC-6.2 nor AC-6.3 may fire; the rest of the pass proceeds normally |
  | File present, zero entries | the tier ran and escalated nothing | records `advisory-corpus-empty`; AC-6.2 cannot fire (no counts) and AC-6.3's own non-emptiness gate fails |
  | File present, ≥1 entry | a real corpus | AC-6.2 and AC-6.3 apply as written |

  Absence of the file is never read as absence of escalations: a tier that could not escalate is not a tier whose seams worked.
- **AC-6.2** — Given a seam whose escalation count in `docs/_queue/ESCALATIONS.md` spans at least two distinct features and exceeds the other seams'
  counts (the AC-2.3 pattern bar applied to this corpus), Then the pass surfaces it as a candidate for envelope revision or upstream-phase repair,
  bound to the relevant deferral.
- **AC-6.3** — Given a **non-empty** corpus (AC-6.1 row 3) in which at least one *other* seam escalated anywhere in `docs/_queue/ESCALATIONS.md`, and a
  seam with escalations from no feature anywhere in that same file, Then the pass may propose an envelope widening for that seam — never enacted. Both
  conjuncts range over the **whole** file — no filter on `Feature`, none on date, no relation to the pass's consumed set. Both conjuncts are
  required: with an absent or empty corpus there is no widening proposal at all, so a first pass on a stock repo cannot propose widening all five
  `ADVISORY_SEAMS` (`pdlc/workflows/orchestrate-dev.js:1669`) on the strength of a corpus no run could have written. The proposal targets the **shipped
  defaults** in `pdlc/workflows/`, so it routes as a PR under AC-3.1. A consumer's `.claude/pdlc.config.json` is untracked and is not a PR-able
  surface; a widening a consumer must adopt locally is reported as an operator action in the AC-7.1 report, never as a PR.

The honest limit (baseline §4): `ESCALATIONS.md` records escalations, not resolutions — a resolution-rate input is D-CONS-06.

### REQ-CONS-07 — Reporting

- **AC-7.1** — Given a pass completes, Then it reports: terminal status and reason code (both drawn
  from §4b's enumeration, and paired only as §4b permits), the rung it ran on (AC-1.5/AC-1.6),
  LEARNINGS consumed by basename, promotions by route (constraints, decisions, PR, `degraded`), the
  AC-5.2 effectiveness table, and what it deferred for human judgment. The terminal-status set is
  the six-member set of §4b: `promoted` / `promoted-degraded` / `no-op` / `skipped-cadence` /
  `refused` / `failed`.
- **AC-7.2** — Given a pass completes on any path **other than `skipped-cadence`** — `refused` included (AC-1.3) — Then exactly one report is emitted,
  on one channel: the pass's terminal report, written as the pass's row in `docs/_decisions/.consolidation-log.md` and returned as the invocation's
  report body (what a `/loop` tick prints). Its `pr:` field carries the URL of a PR **this pass opened**, when and only when this pass opened one — the
  biconditional is scoped to *this pass's own* PR, so an all-suppressed `no-op` (AC-1.4's second cause) leaves `pr:` empty and carries its evidence in
  the distinct `suppressed-by:` field instead (NFR-4, §4b); the two fields are never merged and a row may carry both. A `skipped-cadence` tick writes **no log
  row**, returning its status as the report body only — the exemption is load-bearing twice: the skipped tick is the common case under `/loop`, so a
  row per tick would grow the log without bound, and it is that same log the AC-1.1 predicate and cadence datum read from.

## 4. Non-functional requirements

- **NFR-1** — No promotion is ever applied by this agent to any path in the AC-3.1 guard set
  (`MERGE_GUARD_DEFAULTS`, `pdlc/workflows/orchestrate-dev.js:48-53`). Pull request
  only, operator approves, always (DEC-E2).
- **NFR-2** — The credential never appears in a log, PR body, artifact, or notification; and on the same path, the log row carries the AC-4.2
  `credential:` field from its closed three-value set.
- **NFR-3** — The pattern-vs-coincidence bar (AC-2.3) is unchanged; running on a cadence must not
  lower the promotion threshold, or cadence becomes a volume machine.
- **NFR-3a** — A cadence-triggered pass and a volume-triggered pass are distinguishable in the log:
  the pass's log row records its trigger over the closed set `cadence` / `volume` / `manual`, so
  NFR-3's "the bar held on both" is checkable rather than asserted. The set needs no "no trigger"
  member: a `skipped-cadence` tick fired no trigger and writes no log row (AC-7.2), and every status
  that does write a row was reached by exactly one of these three.
- **NFR-4** — A pass is idempotent with respect to its boundary, keyed explicitly and **per proposal**: re-running produces no duplicate proposal and no
  duplicate PR, both keyed on the pair `(failure-mode-id, action)` (AC-5.1) — for the PR, as carried by the body's `PDLC-CONSOLIDATION-PROMOTIONS`
  trailer (REQ-CONS-03 preamble). It is deliberately **not** keyed on the sources trailer: a consumed set is time-dependent (REQ-CONS-01 step 1
  enumerates whatever is un-consolidated *now*), so two passes proposing the same promotion normally consume different sets and a set key would miss
  exactly when suppression matters. It is equally deliberately not keyed on the id alone: that would let a merged `promote` PR suppress the `revise` and
  `retire` proposals AC-5.3 requires, making the remediation of an `ineffective` promotion unreachable and the §1 `Unfalsifiability` problem unsolved.
  A pass whose proposal's pair is already on a PR in state **open or merged** opens nothing for it, records `duplicate-suppressed` naming that pair and
  that PR's URL in its log row's `suppressed-by:` field (§4b) and its AC-7.1 report — one entry per suppressed proposal, and **never** in AC-7.2's
  `pr:` field, which stays empty for a pass that opened nothing — and never extends or supersedes it: an interrupted pass's partial PR is the
  operator's to merge or close, not silently amended. State is read at poll time with no memory of prior states: a reopened PR is open, hence a key; a
  **closed-unmerged** PR is *not* — the operator rejected that proposal, and a later pass re-proposing it is intended behaviour. Merged is in the key
  set deliberately, and now harmlessly: it is what survives when the invoking branch carrying the log record is abandoned (AC-3.8b, "the AC-3.1 PR route
  under the same abandonment"), and with `action` in the key it suppresses only a re-`promote`, never a remediation.
  Idempotence is well-defined because AC-5.2's verdicts are deterministic. Its limit: `failure-mode-id` cannot key a LEARNINGS predating
  that convention (AC-5.2), so suppression would not protect a re-consumed pre-convention corpus — which is why the REQ-CONS-01 legacy region prevents
  that re-consumption rather than relying on NFR-4 to absorb it.
- **NFR-5** — The pass never modifies a LEARNINGS file it consumed; and on the same path, it
  positively records consumption in the delimited `<!-- pdlc:consumed {passId} -->` block of
  `docs/_decisions/.consolidation-log.md` (REQ-CONS-01, AC-2.4; the block is emitted **complete, in
  one append** — AC-1.3's write-granularity obligation — before any other record the pass writes,
  and **even when the consumed set is empty**, as an empty pair, freezing the legacy-region boundary
  unconditionally) — which is exactly what makes those files "consolidated" for the AC-1.1 predicate
  (`pdlc/hooks/scripts/nudge-consolidation.sh:41`, scoped to that block by this feature). Those
  blocks must name **exactly** the consumed set — neither more nor fewer — and no other record type
  may be written inside one (vocabularies §3), so a basename appearing elsewhere in the log never
  marks a LEARNINGS consolidated.

## 4a. Configuration

All keys live under `.claude/pdlc.config.json` → `consolidation`, in the shape `parseAdvisoryConfig` establishes: **per-key independent fallback with a
stated default**, so one malformed key never retunes the rest and an absent or malformed section leaves every key at its default. **Config owner: the
repo operator** — the same owner as `implementation`, `advisory`, `distribution`, `merge`.

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

Every enumerated value this REQ uses — terminal statuses, reason codes, trigger, promotion route,
per-promotion verdicts and states, `action`, the reported `revision`/`retirement` field, the `pr:`,
`suppressed-by:` and `credential:` fields, and the closed 13-member phase catalogue — is stated once,
with its category, its permitted statuses and its `file:line` definition site, in
**`docs/_constraints/pdlc-consolidation-vocabularies.md` §1** (cited at `Version` 1.4), together with
the two joins and the composition rule that decide which codes a status may carry.

**This REQ owns every section of each `docs/_constraints/` file it authors — §1–§4 entire in
both**, and changes none of anyone else's; a successor feature's vocabulary belongs in its own new
section of the governed file or in its own file, never interleaved into §1–§4. Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned
normative prose** — binding, but carrying no table a downstream layer transcribes, so no row oracle
ranges over it. So the oracle's range is stated, not "the table": downstream completeness is
checkable by **set-equality over every enumerated row this REQ owns — §1, §2 and §4 entire at
Version 1.4** (§4's four-row trailer table and its two derived names included) — and the defect
rule is symmetric, a value used here with no row there **and** a row there naming a value this REQ
never uses being equally defects. The symmetry is what makes a *deleted* row a breach; the version
pin is what gives a downstream test a fixed expected value to transcribe.

**Unreadable corpus entries add no field (erratum, v2.1).** Because this section reserves
`pdlc-consolidation-vocabularies.md` §3's record grammar to this REQ, the question is answered here and
not at TSPEC or DECISIONS: **the consumed pair gains no `unread:` field beside `consumed`, and §3 stays
at `Version` 1.4.** An enumerated basename whose body cannot be read is instead **not consumed** — it is
omitted from the `<!-- pdlc:consumed {passId} -->` pair, so it stays un-consolidated and the next pass
retries it. That removes the defect the question named, an entry marked consumed while contributing no
evidence: under AC-5.2 such an entry can only ever push a verdict toward `prevented` or
`insufficient-evidence` and never toward `recurred`, which corrupts REQ-CONS-05's falsifiability loop in
one direction. Omission needs no new field, no new reason code and no vocabulary row, and it is not
silent: the basename remains in the un-consolidated set that both the hook and the next tick compute.
Enumeration-level unreadability is already closed by REQ-CONS-01 step 1's working-tree restriction, so
the residual case is an on-disk file that cannot be read — permissions or an IO error.

## 5. Scope

**In scope:** the `/loop`-driven cadence trigger and the volume trigger evaluated by the pass, in the
stated tick order, including the empty-datum bootstrap; the single un-consolidated predicate over
the delimited consumed block plus the legacy region — including the matching edits to
`pdlc/skills/consolidate-learnings/SKILL.md:56`, to `pdlc/hooks/scripts/nudge-consolidation.sh:41`
(predicate) and to `:28` (the corpus glob widened to `docs/completed/*/`); reuse of the shipped two-rung advisory ladder
(`resolveAdvisoryRung`, `orchestrate-dev.js:1833`) with reported fallback; PR promotion with scoped
credential, in both the same-repo (AC-3.8) and two-repo configurations, plus the pathspec-scoped
commit of the consuming-repo writes (AC-3.8b); the effectiveness/falsifiability loop, including the
two LEARNINGS convention additions this feature makes — `failure-mode-id` (AC-5.2) and
`Phases exercised` in the harvest metadata table (`harvest-learnings/SKILL.md:70-78`);
`ESCALATIONS.md` consumption in all three corpus states (AC-6.1); the one-line `.gitignore` entry for
`docs/_decisions/.consolidation-lock` (AC-1.3); the two project-level reference files this feature
authors and thereafter owns — `docs/_constraints/pdlc-consolidation-vocabularies.md` (§1–§4 entire,
per §4b) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` (§1–§4 entire, per §4b), both
kept current with this REQ under §4b's change-control rule; reporting against
`pdlc-consolidation-vocabularies.md` §1's vocabularies; tests.

The pass ships as a workflow script beside the existing `consolidate-learnings` skill (the `orchestrate-queue` shape: a skill and a bundled workflow
sharing a name), so its bundle is a new tracked artifact of `pdlc/workflows/build-runtime.mjs` and a new row in
`pdlc/workflows/dist/distribution-manifest.json`.

**Out of scope:** merging any promotion PR; changing the promotion bar; session-free (no Claude Code
session) execution; a new notification channel; consolidating across multiple consuming repos;
persisting the advisory per-seam summary; retiring the manual `/pdlc:consolidate-learnings` entry
point; repository-side branch protection (BL-05, operator).

## 5a. Stopping rule

This REQ is done when every acceptance criterion above names **what is observed and where** — a status value, a reason code, a config key with a
default, a path, or a named constant at `file:line`. How any of that is tested, generated or fixtured is **not** this REQ's job: property axes,
fault-injection vocabularies, coverage floors, fixture construction and oracle mechanics belong to FSPEC, TSPEC and PROPERTIES (DC-09,
`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`). Concretely, for the review loop:

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
| BL-01a | An advisory **escalation corpus** — `docs/_queue/ESCALATIONS.md` with ≥1 entry | Operator sets `.claude/pdlc.config.json` → `advisory.enabled: true`, and a run escalates | **Not met, and not expected to be** (REQ-CONS-06 preamble). Does **not** gate FSPEC: AC-6.1 specifies the absent and empty states as first-class, and AC-6.2/AC-6.3 are inert without a corpus |
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
| D-CONS-06 | Persisting the advisory per-seam summary (`advisorySummaryRows`, `orchestrate-dev.js:2708`) in a defined LEARNINGS section, so resolution *rates* — not only escalations — are consumable | Adding a schema to `advisoryDistilPrompt` is an `orchestrate-dev` change, not a consolidation change (REQ-CONS-06 preamble) | `pdlc-engineering-loop` |
| D-CONS-07 | Session-free execution and a notification channel that survives without a Claude Code session | Same vehicle as D-CONS-04; AC-7.2 names the in-session report until then | `pdlc-engineering-loop` |
| D-CONS-08 | A `failure-mode-id` key finer than `(phase, canonical path)` — discriminating two failure modes in one phase touching one file | AC-5.1 states that merge as an accepted cost; a finer key needs a stable sub-file location identity LEARNINGS does not carry today | `pdlc-engineering-loop` |
