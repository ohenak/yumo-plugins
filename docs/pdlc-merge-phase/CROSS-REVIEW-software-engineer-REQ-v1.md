# Cross-Review: software-engineer — REQ (pdlc-merge-phase)

Scope: docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md @ b97a006

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md`
**Date:** 2026-08-02
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `orchestrate-queue` overwrites the `done` row with `awaiting-merge` after the pipeline returns; the queue driver is not in §5 Scope | AC-5.1, AC-6.3, §5 |
| F-02 | High | Cross-Feature | NFR-1/NFR-4 are unsatisfiable against the shipped runtime, where every `gh`/`git` call is an agent dispatch | NFR-1, NFR-4 |
| F-03 | Medium | Local | NFR-5 (already-merged ⇒ `merged`) contradicts AC-1.2's mergeable precondition and AC-3.1's unconditional refusal | NFR-5, AC-1.2, AC-3.1 |
| F-04 | Medium | Local | Guard default path set omits `pdlc/hooks/` and the consumer's `.claude/workflows/`; AC-3.3 makes the omission permanent | AC-3.1, AC-3.3 |
| F-05 | Medium | Local | Post-merge working-tree state is unspecified — the next queue pass still sits on the merged feature branch | US-01, AC-2.6, §5 |
| F-06 | Medium | Local | Configuration home, owner and defaults are unstated; two independent disable switches with no precedence | AC-1.4, AC-1.5, AC-2.4, AC-2.6, AC-4.2 |
| F-07 | Medium | Cross-Feature | REQ carries no DC-09 stopping rule | whole document |
| F-08 | Low | Local | AC-4.4 is stated over CI values that cannot reach Phase MERGE | AC-4.4, AC-4.1 |
| F-09 | Low | Local | AC-5.5 evidence must not alter the parsed Status token (resolvable at FSPEC — guidance only) | AC-5.5, AC-5.3 |
| F-10 | Low | Local | `mergeable == UNKNOWN` disposition unstated; it is the common case right after a push | AC-1.2 |
| F-11 | Low | Process | Inline shipped-behaviour claims carry no `M-*` measured-fact ids | §1, AC-4.2 |
| F-12 | Low | Local | "Escalated to the operator" has no defined observable meaning | AC-3.1, AC-4.2, AC-5.2 |

---

## 1. [blocking] F-01 — The queue driver un-does the `done` write (AC-5.1, AC-6.3, §5 Scope)

`orchestrate-queue.js:818-827` writes the feature's status **after** the pipeline returns:

```js
const succeeded = report && report.outcome === "success";
const newStatus = succeeded ? "awaiting-merge" : "halted";
await rewriteStatus(queuePath, entry.feature, newStatus, …);
```

Phase MERGE runs inside `orchestrate-dev.main()`, i.e. strictly before that write. On the queue path
the sequence is therefore: MERGE writes `done` → `main()` returns `outcome: "success"` → `runPicked`
rewrites the same cell to `awaiting-merge` and emits *"Merge the PR, then set it to done"*
(`:829-833`). AC-5.1 and AC-6.3 are unachievable, silently, in exactly the path the feature exists
for — and the wrong value is then git-committed by `commitQueueRow`.

§5 Scope names "queue write-back" but §6 Dependencies names only `ship-pr` (BL-03) as an
untouched neighbour; nothing in the REQ acknowledges that `orchestrate-queue`'s success transition
must change. That is a scope statement, not a mechanic, so it belongs here.

**To resolve:** add an AC to REQ-MERGE-05 or REQ-MERGE-06 stating the outcome that the queue
driver's post-pipeline status write must not overwrite a `done` recorded by Phase MERGE (and that
its operator-facing "merge the PR" message must not be emitted for a merged feature), and add
`orchestrate-queue`'s success transition to §5 In scope.

## 2. [blocking] F-02 — NFR-1 and NFR-4 are unsatisfiable against the shipped runtime

NFR-1: *"Every precondition is evaluated deterministically from `gh` output. No LLM participates in
the decision to merge."* NFR-4: *"Phase MERGE adds no new agent dispatch; it is workflow-script logic
calling `gh`."*

In the shipped runtime the workflow scripts **cannot call `gh`**. `runtime-adapter.js:21` states the
mapping explicitly — *"`gh` and `git` invocations → an agent with Bash"* — and `rtMakeCheckCi`
(`runtime-adapter.js:838-850`) is the worked example: an agent is dispatched to run
`gh pr view … --json statusCheckRollup` and asked to return the raw JSON, which is then fed to the
tested classifier through a synthetic `execFn`. `defaultGit` / `checkPrCi` / `mergeWorktree`'s
`execFn` seams are Node-only paths used by tests, not by the runtime.

So every Phase MERGE input — changed-file list, `mergeable`, allowed merge methods — and the merge
action itself reach `gh` through an LLM turn. Written as-is, NFR-1 and NFR-4 are false on the only
execution path that ships, and NFR-3 ("no override of any kind") is weakened by the same fact: a
transcription error in the changed-file list *is* an override channel for AC-3.1.

This is a requirements-altitude problem, not an implementation detail: the REQ has to say which
property it actually wants.

**To resolve:** restate NFR-1 as "no LLM *judgment* participates: every transcribed observation is
parsed by tested module code, and any observation that does not parse fails closed" (AC-3.4 already
has the right shape — generalise it to every precondition), and restate NFR-4 as "no new *reasoning*
dispatch". If genuine `gh`-without-an-agent is wanted, that is a real requirement with a real
precedent to cite — `pdlc/workflows/dist/pdlc-cli.mjs` and `main()`'s `_probeDoc` /
`_probeReviewState` / `_probePostmortem` seams (`orchestrate-dev.js:4325-4327`) are the shipped
mechanism for getting deterministic data into the runtime without agent transcription — but then it
is a dependency the REQ must declare in §6, and the cost is not free.

## 3. [blocking] F-03 — NFR-5's idempotence contradicts AC-1.2 and AC-3.1

NFR-5 requires that invoking the phase against an already-merged PR reports `merged` and does
nothing. AC-1.2 requires, as a precondition of *any* merge decision, that "the PR reports mergeable
with no conflicts". A merged PR reports `state: MERGED` and a `mergeable` that is `UNKNOWN` or
`CONFLICTING` — so the AC-1.2 chain fails, AC-1.3 fires, and the reported `mergeStatus` is
`deferred`, not `merged`. AC-3.1 makes it worse: a self-modifying PR that is already merged must be
"refused … regardless of CI status, merge mode, or any other configuration", which contradicts NFR-5
for precisely the PRs this repo raises.

**To resolve:** state the ordering as an AC — "already merged" is evaluated **before** the
precondition chain and before the guard, and yields `merged` with no action.

## 4. [blocking] F-04 — The guard's default path set is incomplete and unremovable (AC-3.1, AC-3.3)

AC-3.1 pins two literal defaults (`pdlc/workflows/`, `pdlc/skills/`) and AC-3.3 makes them
unremovable by configuration. Two problems follow from the literals:

- **Omitted pipeline-affecting paths.** `pdlc/hooks/scripts/` ships executable code that runs in the
  consumer on `SessionStart` and `PreToolUse` (`guard-harvest-before-delete.sh`,
  `sync-workflows.sh`, `check-workflow-drift.sh` — CLAUDE.md §Hooks/§Distribution scripts), and
  `.claude/workflows/` is the copy the runtime actually loads. A PR touching either changes pipeline
  behaviour just as directly as one touching `pdlc/workflows/`, yet the guard lets it through — and
  AC-3.3 guarantees a repo can only *add* to the set, so the gap is permanent for anyone who does not
  notice it.
- **Repo-relative literals.** In a *consuming* repo the pipeline's code lives in the installed plugin
  and `.claude/workflows/`, so no PR ever matches `pdlc/**` and the guard is inert; in this repo
  nearly every PR matches, so the guard always fires. Neither is wrong, but the REQ should say which
  outcome it intends, because US-01's "unattended loop" cannot be exercised end-to-end in the repo
  that develops it.

**To resolve:** state the guard's default as an *outcome* ("any path whose contents participate in
the pipeline's own execution") with the concrete default list enumerated to include the hooks scripts
and the consumer's runtime copy, and add one line saying whether Phase MERGE is expected to be
permanently guard-blocked in `yumo-plugins` itself.

## 5. [blocking] F-05 — Post-merge working-tree state is unspecified (US-01, AC-2.6)

AC-2.6 deletes the remote branch and leaves the local branch alone; nothing says where the working
tree ends up. Today the human who merges also returns the tree to an updated default branch. Under
US-01 nobody does. The next queue pass runs `orchestrate-dev` for feature *Y* with the tree still on
`feat-X` — whose remote is now deleted — so *Y*'s branch is cut from a stale local base, and the
Phase-0 triage that "looks for the dependency's code in base" (quoted in §1) is looking at the wrong
base. This defeats the invariant the whole REQ is built on and is invisible until a dependent
mis-triages.

**To resolve:** add an AC to REQ-MERGE-05 (or a new REQ-MERGE-07) stating the observable outcome:
after a successful merge the working tree is on the default branch, updated to include the merge,
before the pipeline reports completion — and what happens when that fails (refuse to report `merged`
without it, or escalate per F-12).

## 6. [blocking] F-06 — No configuration home, owner, or defaults for six settings

The REQ names `PHASE_MERGE_ENABLED` (AC-1.4), `mergeMode` (AC-1.5), `allowSquashMerge` (AC-2.4,
default `false` stated), `deleteBranchOnMerge` (AC-2.6, no default), `mergeRequiresCi` (AC-4.2,
default `true` stated) and the guard path list (AC-3.3). Three gaps:

- **No home named.** The repo has two established homes with different semantics: module constants
  (`PHASE_DOD_ENABLED`, `orchestrate-dev.js:22`) and `.claude/pdlc.config.json` (the
  `distribution.checkEnabled` precedent, CLAUDE.md §Artifact convention). AC-1.4 reads like the
  former and AC-1.5 like the latter, without saying so.
- **No precedence between two disable switches.** `PHASE_MERGE_ENABLED = false` and
  `mergeMode: "off"` both mean "never merge". Which wins, and what `mergeStatus` each produces
  (AC-6.1 has only one `skipped` value), is unstated.
- **Missing defaults.** `mergeMode` has no shipped default — and given AC-1.5 makes `gated` and `on`
  equivalent, shipping anything but `off` is a live decision the REQ should own. `deleteBranchOnMerge`
  has neither a default nor an owner, and the name collides with GitHub's own repository setting of
  the same name (`gh repo view --json deleteBranchOnMerge`), so "configured true" is ambiguous
  between "the repo setting" and "a pdlc setting".

**To resolve:** one table in §3 or §4: setting, home, default, owner — plus one sentence fixing the
precedence.

## 7. [blocking] F-07 — DC-09's stopping rule is not in the document

`docs/_constraints/DOMAIN-CONSTRAINTS.md` DC-09 requires a REQ to carry its own stopping rule, and is
explicit that this is the load-bearing part: *"a rule living only in a constraints file … does
nothing; the same rule written into the REQ changed both reviewers' behaviour immediately."* This REQ
carries none. Given it touches an irreversible operation and will attract implementability findings
(most of mine are), it is exactly the document that needs one.

**To resolve:** paste DC-09's stopping rule into the REQ — including the clause that a round whose
blocking findings are all implementability or oracle defects means the REQ has met its bar and the
findings route downstream as named entry obligations.

## 8. [advisory] F-08 — AC-4.4 is stated over values that cannot reach Phase MERGE

`raisePrAndVerifyCi` (`orchestrate-dev.js:3895-3959`) returns only `{"passed"}` or `{"no-checks"}`;
`failed` throws `haltError` (`:3929-3930`), and both timeout paths halt (`:3941-3946`). A halted
pipeline never reaches a post-PUB phase. So AC-4.4's "any other value" is unreachable if Phase MERGE
consumes Phase PUB's `ciStatus`, and AC-4.1's evidence is in any case a snapshot taken before the
merge decision.

Not blocking — the AC is harmless and becomes meaningful the moment MERGE re-reads CI. But the REQ
would be stronger stating that outcome directly: CI evidence is established **at merge time**, which
simultaneously fixes staleness, gives AC-4.4 a reachable domain, and keeps NFR-2's "when in doubt,
refuse" honest.

## 9. [advisory] F-09 — AC-5.5 vs AC-5.3: resolvable, but state the invariant

The two ACs are compatible, not contradictory, so this is guidance rather than a blocker. The hazard
is narrow and worth pinning because its failure mode is silent and permanent.

`updateQueueStatus` (`orchestrate-queue.js:331-368`) replaces only the Status cell and rebuilds the
row as `| cells.join(" | ") |`; `parseQueue` lowercases that cell into `entry.status`; and three
readers compare it **by exact string**: `precheckDependencies` (`:438`, `match.status !== "done"`),
`selectNextPending` (`:387,392`) and `QUEUE_STATUSES` (`:74-81`). An FSPEC that satisfies AC-5.5 by
writing `done (abc1234)` or `done — <PR url>` into the Status cell therefore leaves every dependent
permanently blocked — the precise outcome US-05 exists to prevent.

Compatible resolutions exist and are FSPEC's to choose: an additional column (extra columns are
ignored by `parseQueue`'s header-driven `colIndex`, and `updateQueueStatus` preserves cell count), a
line outside the table, or the queue commit message. Two of the three need the header row touched,
which is why AC-5.3 should say what it permits.

**To resolve:** add one clause to AC-5.5 — the recorded evidence must not change the token a reader
parses as the row's status — and one clause to AC-5.3 clarifying that adding an evidence column
(header plus every row's cell count) is a permitted structural change, if it is.

## 10. [advisory] F-10 — `mergeable == UNKNOWN` has no stated disposition (AC-1.2)

GitHub computes mergeability asynchronously; `gh pr view --json mergeable` returns `UNKNOWN` for a
window after any push to the branch or the base — which is exactly the state a PR is in shortly
after Phase DOD's force-push and Phase PUB. NFR-2 implies "refuse", which is right, but taken
literally it means `gated` merges will defer most of the time and US-01 quietly does not happen.

**To resolve:** state the outcome — a bounded re-read of mergeability before deferring, with the
deferral as the terminal answer.

## 11. [advisory] F-11 — Shipped-behaviour claims carry no measured-fact ids

Per the REQ altitude rule, a REQ carries facts about existing code as `M-*` measured-fact ids cited
from a constraints file. §1 quotes the `orchestrate-queue` SKILL verbatim and asserts the status
lifecycle; AC-4.2 asserts *"Phase PUB legitimately treats `no-checks` as a pass for raising a PR"*.
Both are true at HEAD (`orchestrate-queue.js:819`; `orchestrate-dev.js:3947-3955`) — this is not a
correctness finding — but they are unversioned inline claims in the document least able to keep them
current. `docs/_constraints/pdlc-rcv-baseline.md` §2 is the established form.

## 12. [advisory] F-12 — "Escalated to the operator" is undefined

AC-3.2, AC-4.2 and AC-5.2 all turn on an escalation whose observable form is never stated, and
`orchestrate-dev` has only three channels: `emit()` log lines, the report's `notices` array
(`orchestrate-dev.js:5306`), and a halt. A halt is wrong for AC-3.2/AC-4.2 (AC-1.3 says a merge that
did not happen is not a pipeline failure) — but AC-5.2's "merged, queue not updated" is a different
class: it blocks the entire serial queue, and a `notices` line the operator may never read is
arguably not enough.

**To resolve:** define escalation once as a report field plus a notice, and say explicitly whether
AC-5.2's case halts.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is Phase MERGE expected to be permanently guard-blocked in `yumo-plugins` itself (F-04)? If so, how is US-01 exercised before this ships to a consuming repo? |
| Q-02 | Does `mergeMode` ship as `off` or `gated`? AC-1.5 defines the values but never names the shipped default. |
| Q-03 | Should AC-5.2 ("merged, queue not updated") halt the pipeline, or report and continue? |
| Q-04 | Is `deleteBranchOnMerge` a pdlc setting or GitHub's repository setting of the same name? |

## Positive Observations

- AC-1.5's refusal to define a "bypass the checks" mode, with the reasoning recorded inline, is the
  right call and the right place to record it.
- AC-3.4 (unretrievable diff ⇒ guard fires) is the correct failure direction and is the model the
  other preconditions should follow (F-02).
- AC-2.4's squash prohibition is justified from a concrete downstream consumer (`harvest-learnings`
  reads the commit history) rather than asserted as taste.
- AC-3.5 requiring a test that fails if the guard is removed is a genuinely load-bearing AC, not a
  restatement of "add tests".
- AC-1.3's "a merge that did not happen is not a pipeline failure" and AC-5.4's queue-less direct
  invocation both match how the existing code already behaves (`rewriteStatus` returning
  `queueRow: "none"`, `orchestrate-queue.js:889-891`) — no new mechanism needed.
- AC-1.4's reversibility flag mirrors the shipped `PHASE_DOD_ENABLED` / `PHASE_PUB_ENABLED`
  precedent rather than inventing a new switch style.

## Recommendation

**Needs revision** — seven blocking findings. F-01 (the queue driver overwrites `done`) and F-02
(NFR-1/NFR-4 unsatisfiable against the agent-mediated runtime) are the two that must be settled
before FSPEC begins; the remaining five are each one or two ACs' worth of text. F-08 through F-12 are
guidance and can be closed by deferring them to FSPEC as named entry obligations, per DC-09.

## Verdict

VERDICT: REVISE
{"high": 2, "medium": 5, "low": 5}
