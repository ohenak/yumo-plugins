---
feature: pdlc-advisory-tier
---

# FSPEC — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.1 | 2026-08-03 |

## 0. Overview

Today the PDLC pipeline stops at five points where a judgment is needed and no rung of the system is
authorised to make one: queue triage abstains (B-1), a stale REQ is never re-grounded (B-3), DoD
exhaustion halts (B-5), a rebase conflict halts (B-6), and a CI failure halts (B-7). Each stop is
correct — the pipeline refuses to guess — but each also parks an unattended run until an operator
returns to it.

The **advisory tier** adds one bounded capability at each of those five seams (A1…A5): a single
advisory invocation that may diagnose the situation and, if a resolution falls inside a declared
envelope, apply and verify it; otherwise it escalates and the seam behaves exactly as it does today.
Two properties make this safe to enable:

1. **Escalation is the shipped-behaviour path.** An invocation that does not resolve leaves the
   pipeline's pre-advisory outcome intact (§5's refusal ladder, §11's escalation output). The tier can
   only add outcomes an operator would otherwise have produced by hand; it can never remove one.
2. **Disabled is inert, and disabled is the default.** With no `advisory` config section — the normal
   state of a repo that never opts in (B-11, B-12) — no advisory agent is dispatched, no model is
   resolved, no file is written, and the report carries no advisory content (§12).

For a reader deciding where to start: §1 gives the section map and what is deliberately left to TSPEC,
§2 pins the observed baseline every later section cites by id, §3–§5 specify the tier's mechanics once
(rung, lifecycle, envelope), and §6–§9 apply them seam by seam. §10–§11 cover what the run leaves
behind for the operator; §12 covers the off case; §13 lists what is still open; §14 is the requirement→section→test
traceability. §15–§18 are consolidations across those sections — the run-level flow, the rule
register, the case index, and the test index — each citing the section that owns what it lists.

## 1. Scope and reading order

This FSPEC specifies the **observable behaviour** of the advisory tier described by
`REQ-pdlc-advisory-tier.md`. It covers the five judgment seams A1–A5, the advisory verdict
lifecycle, the envelope and its refusal ladder, the advisory record, and the escalation log.

**Behavioural complexity is why each of these has an FSPEC entry.** Every one has branching that an
engineer should not decide alone: a resolution path and a refusal path that must be observably
identical in their effect on the pipeline, an ordered reason ladder where two triggers can fire at
once, and a disabled mode that must be byte-for-byte inert.

| FSPEC | Requirement(s) | Behaviour specified |
|---|---|---|
| FSPEC-ADV-01 | REQ-ADV-01 | rung resolution, declared fallback, unresolvable failure, configuration |
| FSPEC-ADV-02 | REQ-ADV-02 | one advisory invocation from dispatch to disposition |
| FSPEC-ADV-03 | REQ-ADV-03, REQ-ADV-04 | envelope membership, prohibitions, ordered refusal reasons |
| FSPEC-ADV-04 | REQ-ADV-05 | seams A1 (triage abstention) and A2 (stale-REQ re-grounding) |
| FSPEC-ADV-05 | REQ-ADV-06 | seam A3 (DoD exhaustion classification) |
| FSPEC-ADV-06 | REQ-ADV-07 | seam A4 (rebase conflict) |
| FSPEC-ADV-07 | REQ-ADV-08 | seam A5 (CI failure) |
| FSPEC-ADV-08 | REQ-ADV-09 | advisory record, its harvest, the delete guard |
| FSPEC-ADV-09 | REQ-ADV-10 | escalation log and report notices |
| FSPEC-ADV-10 | AC-1.6, NFR-3 | disabled-tier equivalence |

§15–§18 add no behaviour: they consolidate what §3–§12 already specify — the cross-seam flow, the
business-rule register, the edge-case index, and the acceptance-test index — so each is readable as
a whole without re-reading ten sections.

**Not specified here** (owned downstream by TSPEC / PLAN): module and constant placement, seam and
function signatures, the literal advisory model alias, prompt text, file formats at the byte level,
and the order in which code is written. Where this document names a value it is a **product-visible
value** (a config key, a verdict word, a refusal reason) that a reviewer or an operator reads.

**Terminology.** *Seam* — one of the five points A1–A5 where the pipeline stops today.
*Invocation* — one advisory dispatch at one seam within one pipeline run. *Attempt* — one
diagnose-and-act cycle inside an invocation. *Resolution* — an in-envelope action applied and
verified. *Escalation* — an invocation that ends without an applied resolution, recorded for the
operator, leaving the pipeline's pre-advisory behaviour intact.

**Citation pin.** Every `file:line` in §2 is read at default-branch commit `26c3f1c`, the commit
REQ BL-02 pins for re-verification. Later sections cite those observations **by baseline id (B-n)**
rather than repeating line numbers, so a re-pin touches one section.

## 2. Baseline — the five seams as they behave today

Observed at default-branch commit `26c3f1c`. Paths are repo-relative; `dev` =
`pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`.

| id | Observed fact | Evidence |
|---|---|---|
| B-1 | Phase-0 triage yields exactly three verdicts — `ready`, `blocked`, `needs-human`; `blocked` and `needs-human` both skip the candidate and continue to the next queue entry, differing only in the free-text reason recorded | `queue:653-668`, `queue:907-921` |
| B-2 | The dependency pre-check is one-sided: it reports blocked only when a declared dependency has a queue row whose status is not `done`; a dependency that is `done`, or absent from the queue, is inconclusive and falls through to triage | `queue:631-649` |
| B-3 | The triage prompt carries **no** stale-REQ re-grounding obligation. Its only staleness-adjacent instruction is "Also flag if the REQ references subsystems that do not yet exist" | `queue:656-666` |
| B-4 | Phase DOD alternates verify → remediate, capped at 3 iterations; the third failing verify returns without remediating again | `dev:25`, `dev:6164`, `dev:6190-6191` |
| B-5 | A DoD loop that returns not-passed records a ❌ phase row and halts the pipeline with the last finding counts in the message | `dev:8179-8188` |
| B-6 | Phase DOD step 0 rebases the feature branch onto the default branch; a `conflict` result records ❌ and halts, branch unchanged | `dev:8161-8172` |
| B-7 | Phase PUB polls the PR's check rollup: `passed` returns success; `failed` halts; checks that register but never complete halt at the completion cap; **no check ever registering returns a pass** with status `no-checks` | `dev:6250-6286` |
| B-8 | The `no-checks` pass is *reported*, not silent: the phase row reads "no GHA checks detected within timeout (assumed none configured)" | `dev:8267-8271` |
| B-9 | CI state is read mechanically from GitHub's own rollup, with no agent in the poll loop | `dev:5812-5824`, `dev:6245-6250` |
| B-10 | Model rungs are named by one constant each: `MODEL_DEFAULT` = `"opus"`, `MODEL_IMPLEMENTATION` = `"sonnet"` in dev; `MODEL_QUEUE` = `"sonnet"` in queue. All three are bare alias strings | `dev:1578`, `dev:1621`, `queue:69` |
| B-11 | Per-repo configuration lives at `.claude/pdlc.config.json`, read as named top-level sections, each parsed independently and each degrading to its own defaults rather than failing the run | `dev:43`, `dev:101-152`, `dev:181-200` |
| B-12 | At the pinned commit this repo tracks **no** `.claude/pdlc.config.json` at all; where the file exists in a working tree it is untracked and carries an `implementation` section only — no `merge` section. So both an absent file and an absent section are the normal case, not error cases | `git ls-tree 26c3f1c .claude/`; `.claude/pdlc.config.json` (untracked, working tree) |
| B-13 | The final report carries a `notices` channel; Phase MERGE contributes escalation lines under a frozen, merge-specific prefix, all of which share the `ESCALATION:` token | `dev:1319-1328`, `dev:8291-8292`, `dev:8395`, `dev:8402` |
| B-14 | The harvest-before-delete guard matches only the tokens `CROSS-REVIEW` and `CODE_REVIEW`, and refuses a delete when no `LEARNINGS-*.md` exists in the same directory | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43`, `:52-59` |
| B-15 | Phase order at the tail of a run is DOD → H (harvest) → PUB → MERGE. Harvest therefore runs **before** the phase that raises the PR and polls CI | `dev:8151`, `dev:8192`, `dev:8248`, `dev:8274` |
| B-16 | `docs/_queue/` contains `QUEUE.md` only — there is no escalation log today | `docs/_queue/` |

**Consequences that shape this spec.**

1. B-1 + B-3: A1 and A2 are not two signals today, they are one. A2's gate does not exist to fire —
   §6 therefore specifies A2's trigger as a **new** obligation, not as the routing of an existing one.
2. B-15: the advisory record cannot be harvested by Phase H, because Phase PUB — which appends to it
   at seam A5 — has not run yet. §10 specifies a distinct post-PUB step.
3. B-7 + B-8: the `no-checks` pass is already visible on the phase row, so the advisory tier's job
   there is to name it in the advisory summary, not to make it visible for the first time.
4. B-11 + B-12: an absent `advisory` section is normal and means "tier off", which is also the
   shipped default — so a repo that never edits its config never changes behaviour.

## 3. FSPEC-ADV-01 — Advisory rung resolution and declared fallback

**Requirements:** REQ-ADV-01 (AC-1.1 … AC-1.7).

### 3.1 Configuration

All advisory knobs live in one `advisory` section of `.claude/pdlc.config.json` — the same file and
the same "named section, independently parsed" convention already in use (B-11), owned by the repo
operator.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `advisory.enabled` | boolean | `false` | master switch |
| `advisory.attemptBudget` | integer ≥ 1 | `3` | attempts per invocation |
| `advisory.seamBudgetMinutes` | number > 0 | `10` | wall-clock per invocation |
| `advisory.envelope` | per-seam allow-list | the §5.2 default | what may be resolved unattended |

**Business rules.**

| # | Rule |
|---|---|
| C-1 | An absent `advisory` section, an absent file, or unreadable JSON all yield the defaults above — i.e. the tier off. Consistent with B-11/B-12, a configuration problem never fails a run by itself. |
| C-2 | A present section with an unrecognised or out-of-range value for one key falls back to that key's default and reports the substitution on the run report; the other keys still take effect. One bad key never discards the section. |
| C-3 | Configuration is read once per pipeline run, before the first seam can fire, so every seam in a run sees the same settings. |
| C-4 | No agent may write this file, and no agent's output may change any value in it during a run. |

### 3.2 Rung resolution

Two rungs are named: the **advisory rung** (the Fable 5 rung) and the **advisory fallback rung**
(the Opus rung, the same rung the pipeline's non-implementation phases already use — B-10).

Behavioural flow, evaluated at the first advisory dispatch of a run:

```
enabled == false ─────────────────────────────────► no resolution attempted at all (§12)
        │ true
        ▼
dispatch on the advisory rung
        │
        ├── runtime rejects it with a model/alias error, before any agent output
        │        │
        │        ▼
        │   dispatch on the fallback rung
        │        ├── accepted ──► FALLBACK STATE: warn, record, proceed
        │        └── rejected ──► UNRESOLVABLE: run fails loudly, no advisory agent ever ran
        │
        └── accepted ──────────► NORMAL STATE: proceed on the advisory rung
```

**Business rules.**

| # | Rule |
|---|---|
| M-1 | *Non-resolution* means exactly one thing: the runtime rejected the dispatch with a model/alias error **before the agent produced any output**. A dispatch that starts and then fails for any other reason is an ordinary invocation failure and is handled by §4, never by this ladder. |
| M-2 | Taking the fallback is a first-class, declared outcome. It emits an `ADVISORY_MODEL_FALLBACK` warning naming both the unresolvable value and the substitute, is recorded in the advisory record (§10), and is named in the report's advisory summary. |
| M-3 | There is no third rung. Neither rung resolving fails the run with a model-resolution error; there is no silent revert to the pipeline's default rung, and no advisory agent runs on an unresolved model. |
| M-4 | Resolution is decided once per run and applies to every seam in that run. A run never mixes rungs across seams. |
| M-5 | Each rung is named once and referenced from every advisory dispatch site in **both** the dev and the queue pipeline — seams A1/A2 live in the queue pipeline. Changing the rung is a single edit. |

### 3.3 Edge cases

| Case | Behaviour |
|---|---|
| Tier disabled and the advisory rung does not exist in the runtime at all | No resolution is attempted; the run is unaffected. A missing alias cannot break a run with the tier off. |
| Tier enabled but no seam fires during the run | No dispatch happens, so no resolution happens; the advisory summary reports zero invocations for all five seams and names the rung as *not exercised*. This holds **whether or not either rung would have resolved**: resolution is lazy, so an unresolvable rung cannot fail a run in which nothing was ever dispatched (T-01-7). |
| Fallback taken, then a later seam's dispatch on the fallback rung fails | Handled as an ordinary invocation failure (§4), not as a second fallback. |

### 3.4 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-01-1 | **Who** operator · **Given** no `advisory` section in the config · **When** a run executes with a seam condition present · **Then** the pipeline behaves exactly as §12 requires and no advisory artifact is produced. |
| T-01-2 | **Who** operator · **Given** `advisory.enabled` true and the advisory rung resolvable · **When** a seam fires · **Then** the run's advisory summary names the advisory rung and reports no fallback. |
| T-01-3 | **Who** operator · **Given** `advisory.enabled` true and the advisory rung rejected with a model/alias error before output · **When** a seam fires · **Then** an `ADVISORY_MODEL_FALLBACK` warning is emitted naming the unresolvable value and the substitute, the advisory record and the summary both show the fallback, and the seam proceeds. |
| T-01-4 | **Who** operator · **Given** neither rung resolves · **When** a seam fires · **Then** the run fails with a model-resolution error and no advisory agent has run. |
| T-01-5 | **Who** operator · **Given** an advisory dispatch that starts and then fails mid-flight · **When** it fails · **Then** no fallback ladder is entered and the failure is dispositioned as an ordinary invocation failure. |
| T-01-6 | **Who** operator · **Given** `advisory.attemptBudget` set to an out-of-range value and `advisory.seamBudgetMinutes` set validly · **When** a seam fires · **Then** the attempt budget uses its default, the seam budget uses the configured value, and the substitution is reported. |
| T-01-7 | **Who** operator · **Given** `advisory.enabled` true and neither rung resolvable · **When** the run completes with **no** seam condition arising · **Then** the run completes normally, no model resolution was attempted, and the summary carries five zero rows — this is the run that distinguishes lazy resolution (§3.2) from eager. |

## 4. FSPEC-ADV-02 — Advisory invocation lifecycle

**Requirements:** REQ-ADV-02 (AC-2.1 … AC-2.4), and the AC-3.6 disposition triple it feeds.

### 4.1 The flow

One invocation, at one seam, in one run:

```
seam condition reached (A1…A5)
  │
  ├─ tier disabled ────────────────────────► pre-advisory behaviour, unchanged (§12)
  │
  ▼ attempt 1..attemptBudget, within seamBudgetMinutes
  1. DIAGNOSE   the advisory agent reads the seam's evidence and returns a verdict
  2. VALIDATE   the verdict is well-formed?          no ──► refuse: malformed-verdict
  3. GATE       within envelope AND confidence high? no ──► refuse (out-of-envelope | low-confidence)
  3b. RE-CHECK  does the seam condition still hold?   gone ──► no-action (nothing applied,
  │                                                            nothing refused; consumes no attempt)
  4. ACT        apply the proposed action
  5. CHECK      does the produced change stay inside the envelope?  no ──► revert, refuse
  6. VERIFY     the seam's own gate re-runs (§5.4)   fails ──► revert, refuse
  7. RECORD     write the advisory record            fails ──► revert, refuse: record-write-failed
  │
  ├─ all of 1..7 succeed ─────────────────► RESOLVED: the pipeline continues from the gate's verdict
  ├─ any refusal, or budget exhausted ────► ESCALATED: §11 entry + pre-advisory behaviour, unchanged
  └─ step 3b finds the condition gone ────► NO-ACTION: nothing applied, nothing refused; no §11
                                            entry, and the pipeline continues from its own re-read
```

Step 7 comes last because the record carries the disposition, which is not known earlier; §10.1 R-2
therefore makes the record a precondition of an action **surviving**, not of taking one. Seam A5 is
the one seam where the action leaves the local tree — its push is not undone by restoring a working
tree — so at A5 steps 5 and 7 both complete **before** the push, and step 6 (the re-poll) follows it.
§9.2 A5-8 states what the operator observes there.

### 4.2 The verdict the advisory agent returns

The verdict is the agent's product; it is data the pipeline reads, not an instruction the pipeline
obeys. It carries:

| Field | Meaning | Rules |
|---|---|---|
| `seam` | which of A1…A5 this verdict answers | must match the seam that dispatched it; a mismatch is malformed |
| `diagnosis` | what is wrong, in the agent's words | non-empty |
| `proposedAction` | what the agent would do about it | non-empty; may be an explicit "nothing" |
| `confidence` | `high` or `low` | exactly two values, because nothing in this feature reads a third |
| `withinEnvelope` | the agent's own reading of §5 | advisory only — never the control (V-3) |
| `evidence` | the concrete citations the diagnosis rests on | non-empty; the operator's turn starts here |

### 4.3 Business rules

| # | Rule |
|---|---|
| V-1 | Autonomous action requires **both** in-envelope and `confidence == high`. Either failing means the action is not taken and the invocation escalates. |
| V-2 | The envelope is the control; confidence is only the agent's licence to decline within it. An agent may never widen the envelope by declaring high confidence. |
| V-3 | The verdict's own `withinEnvelope` field is read as *evidence about the agent's reasoning*, never as the membership decision. Membership is decided by the pipeline against configuration (§5.1). A verdict claiming `withinEnvelope: true` for an action the pipeline finds out of envelope is refused, and the disagreement is recorded. |
| V-4 | A malformed or unparseable verdict is treated as an escalation, never as a pass, and it consumes one attempt. |
| V-5 | An invocation that exceeds `advisory.attemptBudget` attempts, or `advisory.seamBudgetMinutes` of wall-clock measured from first dispatch to final verdict, escalates rather than retrying. Whichever bound is reached first ends the invocation. The wall-clock bound **preempts an in-flight attempt** — an invocation whose first and only attempt overruns it escalates without waiting for that attempt to finish. Time spent waiting on GitHub's check rollup does not count against it (§9.2 A5-3): the pipeline's own CI cadence is not the advisory tier's spend. |
| V-6 | Attempts within one invocation are sequential; an invocation is never concurrent with itself, and no two seams are advised concurrently within one run. |
| V-7 | Every terminal disposition is exactly one of `resolved`, `escalated`, or `no-action` — the last being an invocation that applied nothing and refused nothing because the seam condition was gone before anything was applied, or because the seam's own inputs held nothing to act on (§4.4, §6.5's "no drift found", §8.3, §9.3). There is no fourth outcome, and no outcome converts a blocking verdict into a passing one: `no-action` leaves the pipeline continuing from its own gate's re-read, never from an advisory verdict. The summary counts all three, and `invocations == resolved + escalated + no-action` exactly (§10.3 S-1). |
| V-8 | Every escalation — from whatever cause — produces the same observable triple: the seam's outcome is `escalated`; the advisory record and the escalation entry each carry exactly one refusal reason; and the pipeline's pre-advisory behaviour for that seam proceeds unchanged. |

### 4.4 Error scenarios

| Scenario | Behaviour |
|---|---|
| The agent returns nothing at all | Malformed (V-4): consumes an attempt; if the budget remains, retry. If the budget is what ends the invocation, the reason is `budget-exhausted`, because a trigger names the condition on which the invocation **terminates** (§5.3). |
| The agent returns a verdict for a different seam | Malformed (V-4). |
| The agent's `evidence` is empty | Malformed (V-4) — a diagnosis with no evidence is not usable by the operator, which is the point of the escalation. |
| The agent proposes "nothing" with high confidence | Not a resolution: nothing is applied, and the invocation escalates carrying the diagnosis. This is the "the agent understood the problem and it needs a human" case, and it is the good outcome for US-02. |
| The seam condition disappears between dispatch and verdict (e.g. CI turns green on its own) | The invocation ends without applying anything; its disposition is `no-action` (V-7), it is counted in `invocations` and in the summary's `no-action` column but in neither `resolved` nor `escalated`, and the pipeline continues from the gate's own re-read. The re-read consumes no attempt. |
| An attempt applies a change and then the run is interrupted | Not recoverable inside this feature; the branch state is whatever the last completed step left. §10's record is written per completed attempt so the operator can see how far it got. |

### 4.5 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-02-1 | **Who** operator · **Given** a seam fires and the verdict is in-envelope with `confidence: high` · **When** the action is applied and the seam's gate re-runs green · **Then** the seam reports `resolved` and the pipeline continues past the seam. |
| T-02-2 | **Who** operator · **Given** a verdict with `confidence: low` that is otherwise in-envelope · **When** the invocation completes · **Then** nothing is applied, the seam reports `escalated` with reason `low-confidence`, and the pre-advisory behaviour for that seam happens. |
| T-02-3 | **Who** operator · **Given** a verdict claiming `withinEnvelope: true` for an action the configured envelope excludes · **When** the invocation completes · **Then** it is refused as out of envelope and the disagreement appears in the record. |
| T-02-4 | **Who** operator · **Given** an unparseable agent response on every attempt · **When** the attempt budget is exhausted · **Then** exactly `attemptBudget` attempts were made and the seam escalates. |
| T-02-5 | **Who** operator · **Given** an invocation whose elapsed time passes `advisory.seamBudgetMinutes` during its **first and only** attempt · **When** the bound is reached · **Then** the in-flight attempt is preempted, the invocation escalates with reason `budget-exhausted`, no further attempt is started, and the attempt count is 1. |
| T-02-6 | **Who** operator · **Given** any escalating invocation, for each refusal reason in §5.3 · **When** it completes · **Then** the §4.3 V-8 triple holds — outcome `escalated`, one reason in both the record and the escalation entry, and the unchanged pre-advisory behaviour. |

## 5. FSPEC-ADV-03 — Envelope, prohibitions, and the refusal ladder

**Requirements:** REQ-ADV-03 (AC-3.1 … AC-3.6), REQ-ADV-04 (AC-4.1 … AC-4.6), NFR-1, NFR-5.

### 5.1 What the envelope is

The envelope is a **declared, per-seam allow-list held in configuration** (§3.1). It answers one
question — *may this proposed action be applied without a human?* — and it answers it in the
pipeline, never in an agent's reasoning.

| # | Rule |
|---|---|
| E-R1 | The envelope is not inferable, extendable, or negotiable by any agent at runtime. An agent's argument that an action *should* be permitted has no effect on whether it is. |
| E-R2 | Membership is evaluated twice: on the **proposal**, before anything is applied, and on the **produced change**, after. A change that turns out to reach outside the envelope is reverted whole; no such change survives the seam. |
| E-R3 | Envelope enforcement is in the pipeline's own control flow, not in prompt text. A prompt instruction is not a control (NFR-1). |
| E-R4 | The advisory tier holds no credential the pipeline does not already hold (NFR-5). |

### 5.2 The shipped default envelope

Exactly four permitted actions, each with a rule an engineer can decide without judgment:

| # | Permitted | Decidable rule | Seam |
|---|---|---|---|
| E-1 | re-run a check that failed flakily | the check failed and the re-run is on the identical commit sha, with no push in between; bounded by `advisory.attemptBudget`. E-1 does **not** attempt to decide flakiness — nothing observable at the seam distinguishes a flaky failure from a deterministic one, so a deterministic failure re-run under E-1 simply exhausts the budget and escalates | A5 |
| E-2 | fix a lint, format or type error the branch introduced | the same check passes at **both** the merge-base commit and the default-branch tip, and fails at the branch head. §9's default-branch comparison is evaluated first | A5 |
| E-3 | resolve a rebase conflict in a file the branch created | *branch-created* = absent from the merge-base tree **and** absent from the default-branch tip | A4 |
| E-4 | re-ground a stale REQ's citations | every drifted citation's symbol still exists, at a new location | A2 |

**Excluded, as a closed set** — nothing outside E-1…E-4 is permitted, and these are called out
because they are the exclusions someone would otherwise argue about:

| # | Excluded |
|---|---|
| X-a | any change to a test file or test configuration — editing an assertion, deleting a test file or case, renaming a test out of the collected set, adding a skip/xfail/only marker, narrowing a parametrised case list, or lowering a coverage or mutation threshold |
| X-b | any change to a Definition-of-Done criterion or threshold |
| X-c | any rebase conflict outside E-3's branch-created files |
| X-d | any change outside the feature's declared scope — the files the PLAN names, plus the files the branch had already touched as of its head when the seam dispatched (at A4, the pre-rebase head). At A1/A2 no pipeline has started for the candidate, so there is no PLAN and no feature branch: declared scope there is exactly the candidate's own REQ file (A2-5) |
| X-e | anything under the merge phase's self-modification guard paths |

**X-a is the dangerous one and gets its own handling.** A produced diff touching anything in X-a is
reverted whole, the seam escalates, and no run in which that happened is reported as resolved.
Fixing a red test by editing the test is the failure mode this whole feature must not introduce.

### 5.3 The refusal ladder

Every refusal carries **exactly one** reason. A trigger is evaluated against the condition on which
the invocation **terminates**, not against every condition met somewhere inside it — an invocation
whose earlier attempts were malformed but which ends because the budget ran out reports
`budget-exhausted`, not `malformed-verdict`. Among triggers that co-occur *at termination* the set is
ordered and the first match wins:

| # | Reason | Trigger |
|---|---|---|
| 1 | `prohibited-action` | the proposal is one of §5.4's prohibitions |
| 2 | `revert-on-test-touch` | the proposed or produced diff touches X-a |
| 3 | `out-of-envelope` | any other out-of-envelope proposal, or a produced diff reverted under E-R2 |
| 4 | `post-action-verification-failed` | an in-envelope action was applied and the seam's gate (§5.4) or the A4 test re-run then failed |
| 5 | `record-write-failed` | the advisory record could not be written (§10) |
| 6 | `malformed-verdict` | §4 V-4 |
| 7 | `low-confidence` | `confidence != high` |
| 8 | `budget-exhausted` | attempt or wall-clock budget reached |

The set is closed: a reason that is neither in this list nor absent from it is a defect. Ordering
matters observably — a low-confidence proposal that also touches a test file is refused as
`revert-on-test-touch`, not as `low-confidence`, because that is the reason the operator needs to see.

### 5.4 Prohibitions, and the gate that decides instead

The advisory tier fixes **causes**; gates decide **outcomes**. It may never:

| # | Prohibition |
|---|---|
| P-1 | mark a Definition-of-Done criterion satisfied, weaken a criterion, or reduce the DoD iteration requirement |
| P-2 | set a REQ's `ready: true` frontmatter flag |
| P-3 | declare CI passed, or cause the reported CI status to derive from anything but GitHub's own check rollup (B-9) |
| P-4 | merge a PR, or alter a queue `Status` cell |

After any applied resolution, a gate re-runs and reaches its own verdict:

| Seam | Gate that re-runs | State it must reach |
|---|---|---|
| A1 | **none.** The dependency pre-check already ran *before* the seam could fire (B-2, and a blocked pre-check skips the candidate without reaching triage), and A1 changes no file (A1-4), so a re-run is a pure function of unchanged inputs and can only repeat its own result. A1 has no independent post-action gate; its safety rests on A1-3's escalate-when-unsettled rule | — |
| A2 | the pre-check plus triage, on the re-grounded REQ, in the **next** queue invocation | triage reaches a verdict of its own |
| A3 | Phase DOD's verify step | no findings remaining |
| A4 | the rebase completes, then the branch's test command | rebase clean and tests green |
| A5 | the check-rollup read (B-9) | all checks passed |

### 5.5 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-03-1 | **Who** operator · **Given** a proposal outside the configured envelope · **When** the invocation completes · **Then** nothing was applied, the reason is `out-of-envelope`, and the working tree is byte-identical to its pre-invocation state. |
| T-03-2 | **Who** operator · **Given** an in-envelope proposal whose produced diff reaches outside the envelope · **When** the change is checked · **Then** the whole change is reverted, the tree is byte-identical to its pre-invocation state, and the seam escalates. |
| T-03-3 | **Who** operator · **Given** one test per operation enumerated in X-a — assertion edit, test-file delete, test-case delete, rename out of the collected set, skip/xfail/only marker, parametrised-list narrowing, coverage or mutation threshold lowered · **When** an advisory diff performs that operation · **Then** the diff is reverted whole, the reason is `revert-on-test-touch`, and the run is not reported as resolved. |
| T-03-4 | **Who** operator · **Given** a refusal that satisfies two triggers at once · **When** the reason is recorded · **Then** exactly one reason appears, and it is the earlier of the two in §5.3's order. |
| T-03-5 | **Who** maintainer · **Given** the shipped refusal-reason set · **When** it is compared with §5.3 · **Then** the two are equal as sets — an invented or deleted reason fails. |
| T-03-6 | **Who** operator · **Given** each prohibition P-1…P-4 and each gate row of §5.4 · **When** an advisory invocation attempts the prohibited thing · **Then** it does not happen **and** the §4 V-8 triple holds on the same path — a negative assertion alone is satisfied by accident. |
| T-03-7 | **Who** operator · **Given** an applied in-envelope resolution whose seam gate then fails · **When** the gate reports · **Then** the resolution is reverted, the reason is `post-action-verification-failed`, and the seam escalates. |
| T-03-8 | **Who** maintainer · **Given** the shipped permitted-action set and the shipped exclusion set · **When** each is compared with §5.2 · **Then** the first equals {E-1, E-2, E-3, E-4} and the second equals {X-a, X-b, X-c, X-d, X-e} as sets — a fifth permitted action, or a deleted exclusion, fails. Where a capability the seam depends on is absent the action is still a member and is refused per §9.2 A5-2, so the comparison is not capability-parameterised. |
| T-03-9 | **Who** operator · **Given** an in-envelope proposal whose produced diff also touches a file outside the feature's declared scope (X-d) · **When** the change is checked · **Then** the whole change is reverted, the reason is `out-of-envelope`, and the out-of-scope file is byte-identical to its pre-invocation state. |
| T-03-10 | **Who** operator · **Given** a proposal whose produced diff touches a merge-phase self-modification guard path (X-e) · **When** the change is checked · **Then** the whole change is reverted, the reason is `out-of-envelope`, and the guarded file is byte-identical to its pre-invocation state. |

## 6. FSPEC-ADV-04 — Seams A1 and A2: queue triage and re-grounding

**Requirements:** REQ-ADV-05 (AC-5.1 … AC-5.5).

### 6.1 Why routing comes first

Today a triage stop is one free-text signal (B-1, B-3): a `needs-human` result names no gate, and
the stale-REQ re-grounding obligation A2 describes does not exist in the triage prompt at all. Two
consequences the flow below has to carry:

- a stop cannot be routed to the right envelope, because E-4 applies to A2 only; and
- A2's trigger has to be **introduced** by this feature, not merely routed.

So the triage stop gains a machine-readable seam token alongside its free text, and a `needs-human`
result carrying no recognised token routes to the A1 adjudicator — the conservative default, since
A1's envelope is empty of file-changing actions.

### 6.2 Flow

```
queue picks a candidate
  │
  ▼
dependency pre-check (B-2)            blocked ──► skip candidate; NO advisory invocation
  │ not blocked
  ▼
Phase-0 triage
  ├─ ready    ──────────────────────────────────► run the pipeline (unchanged)
  ├─ blocked  ──────────────────────────────────► skip (unchanged); NEVER adjudicable
  └─ needs-human + seam token
        ├─ token = A2 (stale citations) ──► A2 adjudication (§6.4)
        └─ token = A1, or unrecognised, or absent ──► A1 adjudication (§6.3)
```

### 6.3 A1 — adjudicating a triage abstention

The advisory agent reviews the triage evidence and returns one of three verdicts:

| Verdict | Meaning | Effect |
|---|---|---|
| `run-candidate` | the abstention was resolvable and the candidate is safe to run | the queue runs this candidate |
| `hold` | the abstention was correct; this candidate is not ready now | skip, as today |
| `escalate` | undecidable on the evidence available | skip, as today, plus an escalation entry |

| # | Rule |
|---|---|
| A1-1 | Only a `needs-human` **abstention** is adjudicable. An advisory verdict may never overturn a triage verdict of `blocked`. |
| A1-2 | `run-candidate` may never be honoured for a candidate the dependency pre-check reports blocked. On the production path this state is unreachable — a blocked pre-check skips the candidate before triage runs, so the seam never fires (B-2) — so this rule is **defence in depth** over the adjudicator, not a reachable flow branch, and §5.4 gives A1 no post-action gate. |
| A1-3 | The pre-check is one-sided (B-2): it establishes only that no declared dependency has a not-`done` queue row, never that a dependency's implementation is present in the base. Where presence in base is therefore unsettled, the verdict is `escalate`. **No advisory agent adjudicates presence in base.** |
| A1-4 | A1 adjudication changes no file. Its entire product is a verdict, an advisory record, and — on `escalate` — an escalation entry. |
| A1-5 | Candidates are adjudicated in queue order and **at most one candidate is picked per queue invocation**, preserving the serial guarantee. Adjudicating a second candidate after a `hold` is permitted; picking a second is not. |

### 6.4 A2 — re-grounding a stale REQ

| # | Rule |
|---|---|
| A2-1 | The advisory agent re-diffs the REQ's load-bearing citations against the current tree and produces a **re-grounding proposal**: one row per drifted citation, naming its corrected location. |
| A2-2 | A proposal containing **only** location corrections for citations whose symbol still exists is inside E-4 and may be applied. |
| A2-3 | A proposal containing any citation whose symbol no longer exists, or any change to the REQ's requirements — an acceptance criterion, a threshold, a scope statement, a dependency — escalates. A REQ whose premise has evaporated needs a human, not a patch. |
| A2-4 | Applying a re-grounding proposal does **not** pick the candidate. Triage re-runs on the re-grounded REQ in the **next** queue invocation, which preserves A1-5's one-pick guarantee. |
| A2-5 | A re-grounding that touches any file other than the REQ it re-grounds is out of envelope. |
| A2-6 | An applied re-grounding is **durable before the invocation ends**: it is committed on the branch the queue invocation is running on, scoped to that one REQ file, and not pushed. The observable is that the REQ at that branch's head carries the corrected citations, so the next invocation — a fresh process — reads them. A re-grounding that cannot be committed is a failed action: reverted, refused as `post-action-verification-failed`. |

### 6.5 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| Triage returns `needs-human` with an unrecognised seam token | Routed to A1 (§6.2). E-4 is unavailable there, so no file is changed. |
| Triage returns `needs-human` with an A2 token but the REQ has no citations | The proposal is empty; nothing is applied and the invocation records "no drift found" with disposition `no-action` (§4.3 V-7), not a resolution. |
| Every drifted citation resolves, but two of them now point into the same symbol | Still in E-4 — E-4's rule is per citation, and merging targets is not a requirements change. |
| The REQ file is not writable, or the write fails | §5.3 reason `record-write-failed` applies to the advisory record; a failed REQ write is a failed action, reverted, refused as `post-action-verification-failed`. |
| Both A1 and A2 tokens appear on one stop | Malformed (§4 V-4): a stop names exactly one gate. |
| The queue's drift gate blocks the whole invocation before `QUEUE.md` is read | No seam fires; the advisory tier is not involved, and the blocked outcome stands. |

### 6.6 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-04-1 | **Who** operator · **Given** triage returns `blocked` · **When** the queue processes it · **Then** no advisory invocation happens and the candidate is skipped exactly as today. |
| T-04-2 | **Who** operator · **Given** triage returns `needs-human` with no recognised token · **When** the queue processes it · **Then** the A1 adjudicator runs and no file in the repository changes. |
| T-04-3 | **Who** operator · **Given** the dependency pre-check reports a candidate blocked · **When** the queue processes it · **Then** the candidate is skipped, **no advisory invocation happens at all**, and the summary reports zero A1 invocations. *(Integration-level; this is the reachable assertion.)* |
| T-04-3b | **Who** maintainer · **Given** the A1 seam's verdict handler — the component that decides whether a verdict is honoured (BR-1) — a pre-check result of blocked and an adjudicator verdict of `run-candidate` · **When** the verdict is handled · **Then** it is not honoured and the seam escalates. *(Unit-scoped defence in depth over A1-2, asserting a state the pipeline cannot reach — see T-04-3 for the reachable path.)* |
| T-04-4 | **Who** operator · **Given** a declared dependency absent from the queue, so presence in base is unsettled · **When** A1 adjudicates · **Then** the verdict is `escalate` and no agent decided presence in base. |
| T-04-5 | **Who** operator · **Given** three `needs-human` candidates, the first adjudicated `hold` and the second `run-candidate` · **When** the invocation completes · **Then** exactly one candidate has been picked. |
| T-04-6 | **Who** operator · **Given** an A2 proposal of pure location corrections · **When** it is applied · **Then** only the REQ file changed, the change is committed on the queue's branch scoped to that file (A2-6), triage did **not** run again in this invocation, and a subsequent invocation reading that branch's head re-runs the pre-check and triage on the corrected citations. |
| T-04-7 | **Who** operator · **Given** an A2 proposal containing a citation whose symbol no longer exists · **When** the invocation completes · **Then** nothing is applied and the seam escalates. |
| T-04-8 | **Who** operator · **Given** an A2 proposal that also edits an acceptance criterion · **When** the invocation completes · **Then** the change is reverted whole and the reason is `out-of-envelope`. |
| T-04-9 | **Who** operator · **Given** a triage stop · **When** its result is read · **Then** it names which gate produced it, and an A2 token routes to A2 while an A1 token routes to A1. |

## 7. FSPEC-ADV-05 — Seam A3: DoD exhaustion

**Requirements:** REQ-ADV-06 (AC-6.1 … AC-6.4).

### 7.1 Trigger and flow

The seam fires when Phase DOD's verify → remediate loop has used all three iterations and findings
remain (B-4), at the point where the pipeline halts today (B-5).

```
DoD loop exhausted, findings remain
  │
  ▼
advisory agent classifies EVERY remaining finding, with evidence
  │
  ├─ any finding is `real-defect`         ──► halt, as today, with the classification attached
  ├─ any finding is `mis-scoped-criterion`──► escalate (a criterion may not be adjusted — P-1)
  └─ every finding is `deferral-candidate`──► propose deferral rows, each bound to a named
                                              successor, and ESCALATE — never enact
```

### 7.2 Business rules

| # | Rule |
|---|---|
| A3-1 | Every remaining finding is classified. A partial classification is malformed (§4 V-4) — the operator's turn depends on the whole picture. |
| A3-2 | Classes are exactly three: `real-defect`, `mis-scoped-criterion`, `deferral-candidate`. Each classification carries evidence. |
| A3-3 | `real-defect` present ⇒ the pipeline halts exactly as it does today. The only difference is that the halt now carries a diagnosis, so the operator starts from an analysis rather than from a scan. |
| A3-4 | The advisory tier **never enacts a deferral**: a deferral is a scope decision. It may propose deferral rows and it must bind each to a named successor, but the proposal escalates for a human. |
| A3-5 | `mis-scoped-criterion` escalates. Adjusting a DoD criterion is prohibited (P-1), and this class exists precisely to name the situation where the criterion, not the code, is wrong. |
| A3-6 | A3 changes **no** production file, no test file, and no DoD criterion. Its whole product is a classification, a record, an escalation entry, and — where applicable — a deferral proposal. |
| A3-7 | Class precedence when a run mixes classes: `real-defect` (halt) outranks `mis-scoped-criterion`, which outranks `deferral-candidate`. The reported outcome names the governing class. |

### 7.3 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| The DoD loop's own verifier produced no readable status | The seam fires as if findings remain — the existing conservative treatment (B-4/B-5) is not weakened, and the classification names the unreadable status as its evidence. |
| Findings remain but the advisory agent classifies none of them | Malformed (A3-1): consumes an attempt; on budget exhaustion the pipeline halts as today. |
| Every finding is a `deferral-candidate` but one has no plausible successor | The proposal is incomplete; the invocation escalates and names the unbound finding. An unbound deferral is never proposed as complete. |
| The advisory agent proposes a code fix instead of a classification | Out of envelope (A3 has no permitted action in §5.2) — refused with `out-of-envelope`; nothing is applied. |
| Phase DOD is disabled for the run | The seam cannot fire; the advisory summary reports zero A3 invocations. |

### 7.4 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-05-1 | **Who** operator · **Given** the DoD loop exhausts its iterations with findings remaining · **When** the advisory tier is enabled · **Then** every remaining finding carries a class and evidence in the advisory record. |
| T-05-2 | **Who** operator · **Given** at least one finding classified `real-defect` · **When** the phase completes · **Then** the pipeline halts exactly as it does with the tier disabled, and the halt carries the classification. |
| T-05-3 | **Who** operator · **Given** every finding classified `deferral-candidate` · **When** the phase completes · **Then** no deferral was enacted, no queue row changed, and the escalation entry carries the proposed rows with their named successors. |
| T-05-4 | **Who** operator · **Given** a finding classified `mis-scoped-criterion` · **When** the phase completes · **Then** no DoD criterion or threshold changed and the seam escalated. |
| T-05-5 | **Who** operator · **Given** any A3 invocation · **When** it completes · **Then** the working tree is byte-identical to its state when the seam fired. |
| T-05-6 | **Who** operator · **Given** a mix of `real-defect` and `deferral-candidate` findings · **When** the phase completes · **Then** the outcome is the halt of T-05-2, not the escalation of T-05-3. |

## 8. FSPEC-ADV-06 — Seam A4: rebase conflict

**Requirements:** REQ-ADV-07 (AC-7.1 … AC-7.4).

### 8.1 Trigger and flow

The seam fires at Phase DOD step 0, when the rebase onto the default branch reports a conflict —
the point at which the pipeline halts today with the branch left unchanged (B-6).

```
rebase reports conflict
  │
  ▼
advisory agent inspects every conflicting file
  │
  ├─ any conflicting file is NOT branch-created ──► escalate, hunks summarised; halt as today
  └─ every conflicting file IS branch-created (E-3) and confidence high
        │
        ▼  resolve the conflicts, complete the rebase
        ├─ rebase completes and the branch's tests pass ──► RESOLVED; Phase DOD continues
        └─ rebase fails, or tests fail ──► revert the resolution, escalate; halt as today
```

### 8.2 Business rules

| # | Rule |
|---|---|
| A4-1 | *Branch-created* is decided by E-3's rule — absent from the merge-base tree **and** absent from the default-branch tip. It is a property of the file, not of who last edited it. |
| A4-2 | A conflict touching a file the branch did not create escalates with the conflicting hunks summarised. A conflict in shared code means two features disagreed about that code, which is a design question, not a merge chore. |
| A4-3 | The declared-scope exclusion X-d is evaluated against the **pre-rebase** branch head, since the rebase has not completed. |
| A4-4 | After the resolution is applied and the rebase completes, the branch's test command re-runs. A failure reverts the resolution — returning the branch to its pre-seam state, as the halt would have left it — and escalates with `post-action-verification-failed`. |
| A4-5 | The resolution is recorded file by file: which file, which side of the conflict was taken, and why. A resolution recorded only as "resolved" is not usable evidence for the operator who inherits the branch. |
| A4-6 | The advisory tier never abandons the conflict half-resolved. Either the branch ends rebased with green tests, or it ends in the state the halt would have left it in. There is no third tree state. |

### 8.3 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| The conflict set is empty by the time the agent looks (a concurrent process resolved it) | Disposition `no-action` (§4.3 V-7); the invocation records "condition gone" and Phase DOD re-reads the rebase state (§4.4). |
| A file is branch-created but a **test** file | X-a outranks E-3: reverted whole, reason `revert-on-test-touch`. |
| Resolution succeeds but the branch has no test command configured | Verification cannot be performed, so the resolution is not verifiable: it is reverted and the seam escalates. An unverified resolution is never reported as resolved. |
| The tests pass but leave the working tree dirty | Out of envelope on the produced-change check (E-R2): reverted whole, escalate. |
| Conflicts span both branch-created and shared files | A4-2 governs: escalate. Partial resolution of the branch-created subset is not permitted, because it leaves the tree in the third state A4-6 forbids. |
| The rebase conflicts again on a second attempt within the same invocation | Consumes an attempt; on budget exhaustion, escalate with `budget-exhausted` and the pre-seam tree. |

### 8.4 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-06-1 | **Who** operator · **Given** a rebase conflict confined to files the branch created, and high confidence · **When** the seam completes · **Then** the branch is rebased, the tests are green, Phase DOD proceeds, and the record names each resolved file with the side taken. |
| T-06-2 | **Who** operator · **Given** a rebase conflict in a file present at the merge base · **When** the seam completes · **Then** nothing was resolved, the escalation entry summarises the conflicting hunks, and the pipeline halts exactly as it does with the tier disabled. |
| T-06-3 | **Who** operator · **Given** a resolution applied to branch-created files whose test run then fails · **When** the seam completes · **Then** the branch is byte-identical to its pre-seam state and the reason is `post-action-verification-failed`. |
| T-06-4 | **Who** operator · **Given** a conflict set mixing branch-created and shared files · **When** the seam completes · **Then** no file was resolved and the seam escalated. |
| T-06-5 | **Who** operator · **Given** a conflicting file that is branch-created and is a test file · **When** the seam completes · **Then** the reason is `revert-on-test-touch` and the branch is unchanged. |
| T-06-6 | **Who** operator · **Given** any A4 outcome · **When** the branch is inspected afterwards · **Then** it is in exactly one of two states — rebased with green tests, or unchanged from the pre-seam head. |

## 9. FSPEC-ADV-07 — Seam A5: CI failure

**Requirements:** REQ-ADV-08 (AC-8.1 … AC-8.6).

### 9.1 Trigger and flow

The seam fires in Phase PUB when the check rollup reports a failure — the point at which the
pipeline halts today (B-7). It does **not** fire on the no-checks path.

```
rollup reports a failing check
  │
  ▼
retrieve the failing job's log      unavailable ──► escalate (no diagnosis is possible)
  │
  ▼
compare against the DEFAULT BRANCH's own check history      ← evaluated FIRST
  ├─ the same check also fails at the default-branch tip ──► escalate; the feature did not
  │                                                          cause it and must not own it
  ├─ that history is unavailable ─────────────────────────► escalate, comparison undone,
  │                                                          no fix attempted
  └─ the failure is the branch's
        │
        ▼
   diagnose: name the failing step and the cause
        ├─ cause is in-envelope (E-1 flaky re-run, E-2 branch-introduced lint/format/type)
        │      └─ apply the minimal fix, push, RE-POLL CI
        │             ├─ green ──► RESOLVED
        │             └─ still red, and budget remains ──► next attempt
        └─ otherwise ──► escalate
```

### 9.2 Business rules

| # | Rule |
|---|---|
| A5-1 | The default-branch comparison is evaluated **before** E-2's *introduced* test, because a pre-existing failure is not a branch-introduced one and the two tests would otherwise disagree. Its input may itself be noisy — a check that is flaky on the branch is flaky on the default branch too — and the comparison is nonetheless **authoritative on the reading it gets**: a check observed failing at the default-branch tip is escalated as pre-existing, deliberately, in preference to attempting a fix the feature may not own. |
| A5-2 | Where the default branch's own check history cannot be read, the seam escalates with the comparison undone and attempts no fix. E-1 likewise requires the ability to re-run a workflow run; where that is unavailable, E-1 is out of envelope and the seam escalates under the same clause. |
| A5-3 | One **attempt** is one act → push → re-poll cycle, drawn from `advisory.attemptBudget`; under E-1 the act is a re-run with no fix and no push, and the cycle is re-run → re-poll. A re-poll that reaches Phase PUB's own completion timeout consumes an attempt rather than escalating separately. Because a re-poll waits on the pipeline's own CI cadence, **time spent waiting on the rollup does not count against `advisory.seamBudgetMinutes`** (§4.3 V-5) — otherwise the shipped 10-minute default would end every A5 invocation inside its first attempt and `attemptBudget` would never bind. |
| A5-4 | The advisory tier may never declare CI passed, and the reported CI status is always derived from GitHub's own rollup (P-3, B-9). A resolution at A5 means *the rollup subsequently reported green*, never *the agent judged the failure benign*. |
| A5-5 | Where the log cannot be retrieved, the seam escalates. A diagnosis without the log is a guess, and a guess is exactly what this feature exists to avoid shipping. |
| A5-6 | The no-checks path is untouched: the seam does not fire, the phase's existing pass stands, and the outcome is **named in the advisory summary** so a repo with no CI is distinguishable from a repo whose checks never registered. (B-8: the phase row already says so; the summary makes it visible where the operator reads the tier's own account of the run.) |
| A5-7 | Phase PUB runs after harvest (B-15), so a fix pushed here moves the branch head beyond the commit Phase DOD verified. The report therefore names the **DoD-verified commit**, and a branch head beyond it is reported **unverified**. What restores a verified state — re-verification inside Phase PUB, or a halt for the operator — is a technical choice left to TSPEC; either way the report never claims DoD-passed for bytes the DoD gate did not see. |
| A5-8 | A5 is the one seam whose action leaves the local tree, so "revert" is defined on the branch's **content**, not on its history. The produced-change check and the record write both complete **before** the push (§4.1); after a push nothing is force-pushed and no history is rewritten. A re-poll that stays red therefore does **not** undo the pushed commit: the invocation escalates, the fix commit remains on the branch and in the PR, the escalation entry and the report name it, and the pipeline halts exactly as it does today. §16.2 BR-5's two-tree-states invariant is asserted at A5 on the **pre-push** tree; on the branch the operator observes one additional commit per attempt and no rewritten history. |
| A5-9 | A5 does **not** fire on Phase PUB's completion-cap halt — checks that register and never complete leave no failing check to diagnose, and re-polling is what already timed out. That outcome is **named in the advisory summary** the way A5-6 names no-checks, so it is distinguishable there from a diagnosed failure, and the halt proceeds unchanged. |

### 9.3 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| Several checks fail at once | Each is diagnosed; the invocation is in-envelope only if **every** failing check is in-envelope. A mixed set escalates. |
| A check fails, the agent re-runs it under E-1, and a *different* check then fails | The new failure is a new diagnosis within the same invocation, drawing on the same attempt budget. |
| The push during an attempt is rejected (branch moved) | The attempt fails; the fix is not left half-applied, and the invocation retries or escalates on budget. |
| CI turns green between the failure and the agent's diagnosis | Disposition `no-action` (§4.3 V-7); the invocation records "condition gone" and the phase continues from its own rollup read. |
| The failing check has no retrievable log because the job never started | A5-5: escalate. |
| The repo has no CI at all | The no-checks path (A5-6); the seam never fires. |
| Checks register and then never complete **before any seam fired** | The existing completion cap governs and the phase halts; A5-9 — the seam does not fire, and the summary names the outcome. |
| A re-poll **inside** an A5 invocation hits the completion cap | A5-3: it consumes an attempt; on budget exhaustion the seam escalates with `budget-exhausted`. |
| The proposed fix would touch a test file | X-a: reverted whole, reason `revert-on-test-touch`. This is the single most likely way an agent "fixes" red CI, so it is asserted directly. |

### 9.4 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-07-1 | **Who** operator · **Given** a lint failure that passes at both the merge base and the default-branch tip and fails at the branch head · **When** the seam completes · **Then** a minimal fix was pushed, the rollup subsequently reported green, and the seam reports `resolved`. |
| T-07-2 | **Who** operator · **Given** the same check also fails at the default-branch tip · **When** the seam completes · **Then** no fix was attempted and the seam escalated, naming the failure as pre-existing. |
| T-07-3 | **Who** operator · **Given** the default branch's check history cannot be read · **When** the seam completes · **Then** no fix was attempted and the escalation says the comparison was not done. |
| T-07-4 | **Who** operator · **Given** the ability to re-run a workflow run is unavailable · **When** a flaky failure is diagnosed · **Then** E-1 is out of envelope and the seam escalates. |
| T-07-5 | **Who** operator · **Given** the failing job's log cannot be retrieved · **When** the seam completes · **Then** the seam escalates without a diagnosis of the cause. |
| T-07-6 | **Who** operator · **Given** `advisory.attemptBudget` act → push → re-poll cycles all ending red · **When** the budget is spent · **Then** exactly that many cycles occurred, the reason is `budget-exhausted` (§5.3 — the terminating condition), the pushed fix commits remain on the branch (A5-8), and the pipeline halts as it does today. |
| T-07-7 | **Who** operator · **Given** any A5 resolution · **When** the report is read · **Then** the CI status derives from the rollup, and no path exists by which an agent verdict sets it. |
| T-07-8 | **Who** operator · **Given** a fix pushed during Phase PUB · **When** the report is read · **Then** it names the DoD-verified commit and reports the branch head beyond it as unverified. |
| T-07-9 | **Who** operator · **Given** no check registers within the existing no-checks window · **When** the phase completes · **Then** the seam did not fire, the phase passes exactly as today, and the advisory summary names the no-checks outcome. |
| T-07-10 | **Who** operator · **Given** checks that register and never complete, so Phase PUB reaches its completion cap · **When** the phase ends · **Then** no A5 invocation occurred, the halt happened exactly as with the tier disabled, and the advisory summary names the outcome (A5-9). |
| T-07-11 | **Who** operator · **Given** an A5 invocation whose **first** re-poll reaches Phase PUB's completion cap and whose second cycle then completes red, with `advisory.attemptBudget` of 2 · **When** the invocation ends · **Then** the run did **not** halt at the cap, exactly two attempts were consumed (the capped re-poll consumed one, A5-3), and the disposition is `escalated` with reason `budget-exhausted`. |
| T-07-12 | **Who** operator · **Given** an A5 invocation whose re-poll waits alone exceed `advisory.seamBudgetMinutes` while the act work between them does not · **When** the invocation ends · **Then** it reached its full `attemptBudget` cycles, it did **not** escalate `budget-exhausted` on the first cycle, and its terminal disposition is the one its last re-poll earned — the rollup wait is excluded from the wall-clock bound (V-5, A5-3). |

## 10. FSPEC-ADV-08 — Advisory record and its harvest

**Requirements:** REQ-ADV-09 (AC-9.1 … AC-9.4).

### 10.1 The record

Every advisory invocation appends an entry to `docs/{feature}/ADVISORY-{feature}.md`, carrying:

| Field | Why it is there |
|---|---|
| timestamp | orders the entries within a run |
| seam | which of A1…A5 |
| diagnosis | what the agent concluded |
| confidence | `high` or `low` |
| envelope determination | in or out, and against which permitted action |
| action taken, or escalated with its refusal reason | the disposition |
| evidence citations | where the operator's own check starts |

| # | Rule |
|---|---|
| R-1 | An advisory **action** taken without a record being written is a defect, asserted against by test. |
| R-2 | Where the record write itself fails, the action is not taken — or is reverted — and the seam takes the refusal path with reason `record-write-failed`. The record is a precondition of an action **surviving**, not a by-product of having acted: the record carries the disposition, so it is written at §4.1 step 7 — but no action outlives a failed record write. At A5 the write completes before the push (A5-8), so nothing has left the local tree when this rule is decided. |
| R-3 | The record is append-only within a run: an entry is never rewritten or removed by a later invocation. |
| R-4 | Invocations that took no action are recorded too. Escalations are the tier's most valuable output (§10.4), and a record that only showed successes would measure the wrong thing. |

### 10.2 When the record is harvested — and why not at Phase H

The advisory record is a process artifact of the same kind as a cross-review or a DoD code review:
distilled into `LEARNINGS-{feature}.md`, then deleted.

It cannot be harvested at Phase H. Harvest runs **before** Phase PUB (B-15), and seam A5 appends to
the record during Phase PUB. Harvesting at Phase H would distil a record that is still being
written. So:

| # | Rule |
|---|---|
| H-1 | The advisory record's distil-and-delete happens **after the last phase that can append to it**, which is Phase PUB, and **before Phase MERGE**. No seam fires at Phase MERGE — merging is out of scope for this feature. |
| H-2 | Observably, for a completed **dev-side** run: `ADVISORY-{feature}.md` is absent, its content is in `LEARNINGS-{feature}.md`, and both facts are committed to the feature branch and pushed, so the PR raised at Phase PUB shows them. This is a commit made after the checks Phase PUB polled went green, so the branch head Phase MERGE evaluates is one commit beyond the checked head. Phase MERGE evaluates that head under its own existing preconditions and reports its own outcome; where its CI evidence is not satisfied it declines under its existing preconditions — on the pending-CI path that is a plain **non-escalating** refusal, not a merge-escalation notice — and **nothing in the advisory tier merges, overrides, or re-reports CI** (P-3, P-4). Phase MERGE's own outcome is out of scope for this FSPEC's tests: this rule is tested only up to the pushed commit and the PR (T-08-3). An operator running with merges enabled should expect a deferral on runs where a seam fired — the trade is a truthful record against an automatic merge, and the deferral is visible on the report rather than silent. |
| H-2b | A **queue-side** record (A1/A2) is not harvested by the queue: no `orchestrate-dev` run, and therefore no Phase PUB, happens for a candidate that was held, escalated, or only re-grounded. Its `docs/{feature}/ADVISORY-{feature}.md` deliberately persists as the operator's standing account of why the candidate was not picked, and is distilled by that feature's own pipeline run when it later reaches Phase PUB. Persisting means **durable, not merely written**, on the same terms A2-6 states for a re-grounded REQ: committed on the branch the queue invocation is running on, scoped to that one record file, not pushed. An uncommitted record does not satisfy this rule — it is lost by any checkout, and an untracked file under `docs/` is walked by the document oracles. H-2's absence observable is scoped to dev-side runs (T-08-8). |
| H-3 | The harvest-then-delete protection that today covers `CROSS-REVIEW-*` and `CODE_REVIEW-*` (B-14) extends to `ADVISORY-*`, and the distil step's delete goes through the channel the guard covers rather than around it — the guard is the control, not a courtesy. A delete attempted with no sibling `LEARNINGS-{feature}.md` is refused, the refusal names the artifact class it refused, and the file survives. |
| H-4 | A run that halts before the distil step leaves the record on disk, complete up to the halt. That is the correct outcome — the operator is about to read it. |

### 10.3 The advisory summary on the final report

| # | Rule |
|---|---|
| S-1 | The report carries an advisory summary: invocations, resolved, escalated, no-action — listed for **all five seams A1–A5, zero counts included**, and satisfying `invocations == resolved + escalated + no-action` per seam and in total (§4.3 V-7). A seam that never fired must be visibly zero, not absent. The summary is carried on **every** report the run produces, including the report of a run that halted: it then covers the seams reached so far. A halt is the tier's primary escalation path, so the summary is exactly what the operator needs there. |
| S-2 | The summary names the **advisory model actually used**, and whether it was the configured rung or the declared fallback (§3.2 M-2). |
| S-3 | The summary names the Phase PUB no-checks outcome when it occurred (A5-6), and likewise names the completion-cap outcome when the phase halted on it without A5 firing (A5-9). |
| S-4 | With the tier disabled the report carries **no** advisory summary at all (§12). |
| S-5 | Each pipeline's summary covers the seams it owns. A queue invocation that produces no `orchestrate-dev` run carries its A1/A2 summary on the **queue's own run report**; an `orchestrate-dev` report's A1/A2 rows are therefore always zero, because no dev-side run can reach those seams (§15.1). Both reports still list all five seams with zero counts included (S-1), so the summary's presence — on whichever report the invocation produced — is what distinguishes an enabled, unexercised tier from a disabled one (§12.2). |

### 10.4 Why this matters beyond the run

The harvested record and the summary are what make the advisory tier improvable: the consolidation
agent reads which seams escalate most, and that is the signal for where the envelope — or the phase
upstream of the seam — needs work. A tier that recorded only its successes would be unimprovable.

### 10.5 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| Two seams fire in one run | Both append to the same file, in the order they occurred. |
| The feature directory does not exist when the first record is written | The write fails; R-2 governs — nothing is applied and the seam escalates. |
| A run halts at seam A3 | The record survives on disk with the A3 entry (H-4); no distil happens, and the halt report still carries the advisory summary for the seams reached (S-1). |
| A queue invocation adjudicates A1 or A2 and picks nothing | No dev run follows, so no distil happens; the record persists (H-2b). |
| The distil step runs but `LEARNINGS-{feature}.md` does not exist | The delete is refused by the guard (H-3), the record survives, and the run reports the refusal rather than losing the file. |
| A run in which no seam ever fired | No record file is created, so nothing is distilled and nothing is deleted; the summary reports five zero rows (S-1). |

### 10.6 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-08-1 | **Who** operator · **Given** any advisory invocation, resolving or escalating · **When** it completes · **Then** an entry exists carrying all seven §10.1 fields. |
| T-08-2 | **Who** operator · **Given** the record write fails · **When** the invocation completes · **Then** no action survives, the reason is `record-write-failed`, and the working tree is byte-identical to its pre-invocation state. |
| T-08-3 | **Who** operator · **Given** a completed **dev-side** run in which seams fired · **When** the run ends · **Then** `ADVISORY-{feature}.md` is absent, its content is present in `LEARNINGS-{feature}.md`, both are committed and pushed on the feature branch, and the PR shows the commit (H-2). |
| T-08-4 | **Who** operator · **Given** a completed run reaching the distil step with no `LEARNINGS-{feature}.md` present · **When** the distil step attempts its delete · **Then** the refusal is emitted and **names the artifact class it refused**, `ADVISORY-{feature}.md` still exists with its entries intact, and the run report names the refusal (H-3). |
| T-08-4b | **Who** maintainer · **Given** a direct delete of `ADVISORY-{feature}.md` with no sibling `LEARNINGS-{feature}.md` · **When** the delete is attempted · **Then** it is refused, the refusal names the artifact class, and the file still exists. *(Unit-scoped over the guard itself; T-08-4 is the production-path assertion.)* |
| T-08-5 | **Who** operator · **Given** a run where seam A5 fired · **When** the distil step runs · **Then** it runs after Phase PUB and the A5 entry is included in what was distilled. |
| T-08-6 | **Who** operator · **Given** a run where only seam A4 fired · **When** the report is read · **Then** all five seams appear in the summary, four of them with zero counts. |
| T-08-7 | **Who** operator · **Given** a run on the declared fallback rung · **When** the report is read · **Then** the summary names the model used and marks it as the fallback. |
| T-08-8 | **Who** operator · **Given** a queue invocation that adjudicated A1 (or applied A2) and picked no candidate · **When** the invocation ends · **Then** `ADVISORY-{feature}.md` exists with that entry and is committed on the queue's branch scoped to that one file and not pushed, a second process reading that branch's head finds it, no distil ran, no `LEARNINGS-{feature}.md` was required (H-2b), and the queue's own run report carries the advisory summary for A1/A2 (S-5). |
| T-08-9 | **Who** operator · **Given** a run that halts at A3 or A4 · **When** the halt report is read · **Then** it carries the advisory summary for the seams reached so far, and the record is still on disk un-distilled (S-1, H-4). |
| T-08-10 | **Who** operator · **Given** a dev-side run in which A3 ends `no-action`, A4 ends `resolved` and A5 ends `escalated` · **When** the summary is read · **Then** the five seam rows are, by literal value, A1 0/0/0/0, A2 0/0/0/0, A3 1/0/0/1, A4 1/1/0/0, A5 1/0/1/0 and the total row 3/1/1/1, and `invocations == resolved + escalated + no-action` holds on each of those six rows. |

## 11. FSPEC-ADV-09 — Escalation output

**Requirements:** REQ-ADV-10 (AC-10.1 … AC-10.5).

### 11.1 The escalation log

Every escalation appends an entry to `docs/_queue/ESCALATIONS.md` — a new artifact (B-16), sibling
to the queue and consumed later by the loop driver.

| Field | Content |
|---|---|
| *(first line, under the entry's heading)* | **what the operator must decide, in one sentence** |
| feature | which feature's run |
| seam | A1…A5 |
| refusal reason | exactly one, from §5.3 |
| diagnosis | the agent's conclusion |
| proposed action | what it would have done |
| evidence | citations |
| pipeline state | the phase id and that phase's outcome |

| # | Rule |
|---|---|
| L-1 | The file is **append-only and newest-last**, one entry per escalation under its own heading. A later invocation escalating the same feature and the same seam appends a further entry rather than updating one in place — the loop driver consumes it as a log, not as a state file. |
| L-2 | The decision sentence is first, before any detail. An operator scanning the file must be able to read only the first line of each entry and know what is being asked. |
| L-3 | Escalation adds information; it never changes control flow. The pipeline's existing halt or skip for that seam happens exactly as it would with the tier disabled. |
| L-4 | The durable file is required because the operator's turn begins after the process has exited, and a report notice does not survive it. |

### 11.2 The report notice

The report already has one escalation-notice channel, whose only members today are the merge phase's,
under a frozen merge-specific prefix; all of them share the `ESCALATION:` token (B-13).

| # | Rule |
|---|---|
| N-1 | That catalogue is left exactly as it is — not widened, not re-worded, not re-prefixed. |
| N-2 | Each advisory escalation emits a notice under a **distinct advisory prefix of its own**, naming the seam and pointing at its `ESCALATIONS.md` entry. |
| N-3 | Both prefixes carry the shared `ESCALATION:` token, so a single scan of the report still finds every notice of either kind. |
| N-4 | The notice channel stays the single place the operator watches during a run; the log file is where the operator picks the run back up afterwards. |

### 11.3 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| `docs/_queue/ESCALATIONS.md` does not exist | It is created with the first entry. A missing log is the normal first-run state, not an error. |
| Two escalations in one run | Two entries, in occurrence order, newest last. |
| The same feature and seam escalate on consecutive runs | Two entries; neither is edited or removed. |
| The escalation write fails | The escalation stands — an escalation is the pipeline doing *less*, so a failed log write can never turn it into a resolution. The failure is reported on the run report, and the pre-advisory behaviour still happens. |
| A halting seam escalates | Both the entry and the notice are produced, then the halt proceeds unchanged (L-3). |
| `docs/_queue/` does not exist (a consumer repo with no queue) | The directory is created alongside the log; the absence of a queue does not suppress escalations. |

### 11.4 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-09-1 | **Who** operator · **Given** any escalating invocation · **When** it completes · **Then** an entry exists carrying all eight §11.1 fields, with the decision sentence first. |
| T-09-2 | **Who** operator · **Given** two escalations for the same feature and seam in successive runs · **When** the log is read · **Then** two entries exist, newest last, and the first is unmodified. |
| T-09-3 | **Who** operator · **Given** an escalation at a halting seam · **When** the run ends · **Then** the halt happened exactly as it does with the tier disabled. |
| T-09-4 | **Who** operator · **Given** an escalation at a skipping seam · **When** the queue invocation ends · **Then** the skip happened exactly as it does with the tier disabled. |
| T-09-5 | **Who** maintainer · **Given** the merge phase's notice catalogue · **When** compared before and after this feature · **Then** it is unchanged. |
| T-09-6 | **Who** operator · **Given** a run with one merge escalation and one advisory escalation · **When** the report is scanned for `ESCALATION:` · **Then** both notices are found, under distinct prefixes, and the advisory one names its seam and points at its log entry. |
| T-09-7 | **Who** operator · **Given** no `ESCALATIONS.md` and no `docs/_queue/` directory · **When** an escalation occurs · **Then** both are created and the entry is written. |
| T-09-8 | **Who** operator · **Given** an escalating invocation whose `ESCALATIONS.md` write fails · **When** it completes · **Then** the seam still reports `escalated`, the disposition is **not** `resolved`, nothing was applied, the pre-advisory halt or skip still happened, and the failed write is named on the run report — the asymmetry with §10.1 R-2, where a failed record write reverts the action. |

## 12. FSPEC-ADV-10 — Disabled-tier equivalence

**Requirements:** AC-1.6, NFR-3. Shipped default: `advisory.enabled` is `false`, and an absent
`advisory` section means the same thing (§3.1 C-1) — so a repo that never edits its config is a
repo in which nothing changes.

### 12.1 The equivalence

Given identical inputs and `advisory.enabled` false, a run is observably identical to a run of the
pipeline without this feature:

| # | Rule |
|---|---|
| D-1 | Every seam reverts exactly to its pre-advisory behaviour — skip at A1/A2, halt at A3/A4/A5. |
| D-2 | No advisory agent is dispatched, and **no model resolution is attempted** — so a missing advisory alias cannot break a run with the tier off. |
| D-3 | The report's phase table and every phase outcome are identical to today's. |
| D-4 | No `ADVISORY-*` file is created, and no `ESCALATIONS.md` entry is written. |
| D-5 | The report carries no advisory summary and emits no advisory notice. |
| D-6 | The set of files a disabled run creates is **equal** to the set a run of the pipeline without this feature creates — not merely free of the two artifacts D-4 names. A third artifact this feature adds later is caught by the same comparison (T-10-3). |

The equivalence is stated on **named artifacts and phase outcomes**, not on report text, because
report text legitimately varies by timestamp and iteration count.

### 12.2 Edge cases

| Case | Behaviour |
|---|---|
| `advisory.enabled` false but other advisory keys set | The other keys are inert; the master switch governs. |
| `advisory.enabled` true in a repo where no seam condition arises | The tier is active but unexercised: no artifacts, and a summary of five zero rows (§10.3 S-1). This is *not* the disabled case — the summary's presence distinguishes them. |
| The config file is absent entirely | Disabled (C-1). |
| The config file is present but malformed JSON | Disabled (C-1) — a broken config never enables the tier. |

### 12.3 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-10-1 | **Who** operator · **Given** `advisory.enabled` false and a seam condition at each of A1…A5 in turn · **When** the run completes · **Then** each seam produced its pre-advisory outcome and no advisory agent was dispatched. |
| T-10-2 | **Who** operator · **Given** the tier disabled and an advisory rung that does not resolve · **When** a seam condition arises · **Then** the run is unaffected and no model resolution was attempted. |
| T-10-3 | **Who** operator · **Given** the tier disabled · **When** the run ends · **Then** no `ADVISORY-*` file exists, `ESCALATIONS.md` gained no entry, the report carries no advisory summary, and the set of files the run created equals the set a tier-off baseline run creates (D-6) — no file outside that set appears. |
| T-10-4 | **Who** operator · **Given** no `advisory` section, and separately a malformed config file · **When** each run completes · **Then** both behave as T-10-3. |
| T-10-5 | **Who** operator · **Given** the tier enabled and no seam condition arising · **When** the report is read · **Then** an advisory summary is present with five zero rows — distinguishing it from T-10-3. |

## 13. Open questions

| # | Question | Why it matters | Proposed default while unanswered |
|---|---|---|---|
| OQ-1 | The advisory rung's literal alias for the workflow runtime is still unverified (REQ BL-01). | It decides whether a run uses the intended rung or the declared fallback. | Ship on the fallback with the substitution declared (§3.2 M-2); this is non-fatal by construction. |
| OQ-2 | A2's re-grounding gate does not exist at the pinned baseline (B-3), so this feature introduces its trigger rather than routing an existing one. | Changes the shape of the work at A2 from routing to authoring, and gives AC-5.2/AC-5.3 a testable precondition they otherwise lack. | Specified as new in §6.1; raised upstream as an erratum against the REQ's §1 seam table. |
| OQ-3 | A5's fix pushes bytes past the DoD-verified commit (A5-7). Whether Phase PUB re-verifies, or halts for the operator, is left to TSPEC. | Either choice is defensible; both satisfy "never report DoD-passed on unverified bytes". | Report the verified commit and mark the head unverified; TSPEC chooses the restoration path. |
| OQ-4 | Whether the default-branch check history and the workflow re-run capability (REQ BL-05, BL-06) are available in a given consuming repo is a per-repo fact. | E-1 and E-2 both depend on them; where absent the seam escalates rather than guessing. | §9.2 A5-2 — escalate with the comparison undone, attempt no fix. |
| OQ-5 | Whether the branch's test command exists is a per-repo fact that A4's verification depends on. | An unverifiable resolution must not be reported as resolved. | §8.3 — revert and escalate. |

## 14. Linked Requirements

This FSPEC covers **every** requirement of `REQ-pdlc-advisory-tier.md` — the ten `REQ-ADV-*`
requirements (§3 of the REQ) and the five `NFR-*` (§4). The mapping is one FSPEC section per
requirement, with that section's acceptance-test table as the coverage evidence.

### 14.1 Requirement → section → tests

| Requirement | Acceptance criteria | FSPEC section | Acceptance tests |
|---|---|---|---|
| REQ-ADV-01 — Model rung and configuration | AC-1.1 … AC-1.7 | §3 FSPEC-ADV-01 | T-01-1 … T-01-7 |
| REQ-ADV-02 — The advisory contract | AC-2.1 … AC-2.4 | §4 FSPEC-ADV-02 | T-02-1 … T-02-6 |
| REQ-ADV-03 — The envelope | AC-3.1 … AC-3.6 | §5 FSPEC-ADV-03 | T-03-1 … T-03-10 |
| REQ-ADV-04 — Prohibitions | AC-4.1 … AC-4.6 | §5 FSPEC-ADV-03 (P-1…P-4, gate rows) | T-03-6 |
| REQ-ADV-05 — Seams A1/A2 | AC-5.1 … AC-5.5 | §6 FSPEC-ADV-04 | T-04-1 … T-04-9, T-04-3b |
| REQ-ADV-06 — Seam A3 (DoD exhaustion) | AC-6.1 … AC-6.4 | §7 FSPEC-ADV-05 | T-05-1 … T-05-6 |
| REQ-ADV-07 — Seam A4 (rebase conflict) | AC-7.1 … AC-7.4 | §8 FSPEC-ADV-06 | T-06-1 … T-06-6 |
| REQ-ADV-08 — Seam A5 (CI failure) | AC-8.1 … AC-8.6 | §9 FSPEC-ADV-07 | T-07-1 … T-07-10 |
| REQ-ADV-09 — Advisory record | AC-9.1 … AC-9.4 | §10 FSPEC-ADV-08 | T-08-1 … T-08-10 |
| REQ-ADV-10 — Escalation output | AC-10.1 … AC-10.5 | §11 FSPEC-ADV-09 | T-09-1 … T-09-8 |

### 14.2 Non-functional and cross-cutting

| Requirement | Where it is specified | Acceptance tests |
|---|---|---|
| NFR-1 — envelope enforced in the workflow, not in a prompt | §5 (refusal ladder; the envelope is a control, not an instruction) | T-03-1, T-03-2, T-03-5, T-03-8 |
| NFR-2 — every prohibition has an explicit failing test | §5.4 gate rows | T-03-6 |
| NFR-3 — the tier is additive when disabled | §12 FSPEC-ADV-10 (D-1 … D-6) | T-10-1 … T-10-5 |
| NFR-4 — per-seam wall-clock bound | §4 lifecycle (V-5: preempts an in-flight attempt; rollup wait excluded) | T-02-5 |
| NFR-5 — never merges | §5 (P-4) | T-03-6 |
| NFR-5 — no new credentials (§5.1 E-R4) | a design constraint on the implementation, carried by TSPEC | *none at FSPEC level* — nothing observable at a seam distinguishes a tier that holds a credential it never uses |
| AC-1.6 — disabled means inert | §12 FSPEC-ADV-10 | T-01-1, T-10-1 … T-10-4 |
| AC-3.6 — every escalation carries a reason from the closed set | §4.3 (disposition triple), §5.3 (reason set) | T-02-6, T-03-4, T-03-5 |

### 14.3 Coverage direction

Read the other way: every FSPEC section §3–§12 opens with a **Requirements:** line naming the REQ
items it discharges, so no section exists without an upstream requirement, and §14.1 shows no
requirement without a section. The two lists are the same set — an FSPEC section added without a
requirement, or a requirement added without a section, breaks one of the two tables above and is
the intended failure signal.

Traceability beyond this document — user story → requirement → FSPEC — is held in
`docs/requirements/traceability-matrix.md`, not restated here.

## 15. Behavioral Flow

§4.1 gives the flow *inside* one invocation and §6.2/§7.1/§8.1/§9.1 give each seam's own trigger.
This section gives the flow those five sit in: where in a run a seam can fire, in what order, and
what the run looks like end to end. It states no new rule — every row cites the section that owns it.

### 15.1 Where each seam lives

Two pipelines, because A1 and A2 are queue-side and A3–A5 are dev-side (§3.2 M-5).

| Seam | Pipeline | Fires at | Pre-advisory outcome it may not remove |
|---|---|---|---|
| A1 | `orchestrate-queue` | after the dependency pre-check, on a Phase-0 `needs-human` result (§6.2) | skip the candidate (B-1) |
| A2 | `orchestrate-queue` | same stop, when the stop's seam token names A2 (§6.2) | skip the candidate (B-1, B-3) |
| A3 | `orchestrate-dev` | Phase DOD, verify→remediate loop exhausted with findings remaining (§7.1) | halt (B-5) |
| A4 | `orchestrate-dev` | Phase DOD step 0, rebase reports conflict (§8.1) | halt, branch unchanged (B-6) |
| A5 | `orchestrate-dev` | Phase PUB, rollup reports a failing check (§9.1) | halt (B-7) |

A4 precedes A3 in a run: Phase DOD's step 0 rebase runs before its verify→remediate loop (B-6, B-4).
A5 follows both, because Phase PUB runs after Phase DOD (B-15). No seam fires at Phase MERGE (§10.2
H-1).

### 15.2 The run, end to end

```
run starts
  │
  ▼
read the advisory config ONCE (§3.1 C-3)
  ├─ tier disabled ──► the entire rest of this diagram is skipped (§12 D-1…D-6)
  │ enabled
  ▼
  … pipeline proceeds; at each seam condition it reaches, exactly one invocation.
  At the FIRST such invocation, and only then, the rung is resolved ONCE for the whole
  run (§3.2 — resolution is lazy; a run in which no seam fires resolves no rung and
  cannot fail on one, §3.3, T-01-7):
  ├─ neither rung resolves ──► the run fails loudly; no advisory agent ever runs (§3.2 M-3)
  └─ advisory rung, or the declared fallback with its warning (§3.2 M-2)
  │
  │   ┌──────────────────────────────────────────────────────────────┐
  │   │ §4.1 lifecycle: DIAGNOSE → VALIDATE → GATE → ACT → CHECK →   │
  │   │                 VERIFY → RECORD                              │
  │   │   resolved  ──► the pipeline continues from the gate's verdict│
  │   │   escalated ──► §11 log entry + report notice, then the       │
  │   │                 pre-advisory outcome above, unchanged         │
  │   └──────────────────────────────────────────────────────────────┘
  │
  ▼
after the last phase that can append to the record — Phase PUB — and before Phase MERGE,
a dev-side run distils the record into LEARNINGS, deletes it, and commits and pushes both
(§10.2 H-1/H-2). A queue-side record is not distilled here (§10.2 H-2b).
  │
  ▼
the report carries the advisory summary: five seam rows, zero counts included, on every
report the run produces — including a halt's (§10.3 S-1)
```

### 15.3 Flow invariants across seams

| # | Invariant | Owner |
|---|---|---|
| F-1 | Config and rung are resolved once per run and apply to every seam in it. | §3.1 C-3, §3.2 M-4 |
| F-2 | Seams are advised one at a time; no two invocations overlap, and no invocation is concurrent with itself. | §4.3 V-6 |
| F-3 | Each seam condition yields **at most one** invocation per run — the budgets in §4.3 V-5 bound the attempts inside it, not the number of invocations. | §4.3 V-5, V-6 |
| F-4 | Every invocation terminates in exactly one of `resolved`, `escalated` or `no-action`, and neither an escalation nor a `no-action` changes the pre-advisory outcome. | §4.3 V-7, V-8 |
| F-5 | An escalation at a halting seam still halts; an escalation at a skipping seam still skips. Escalation adds information, never control flow. | §11.1 L-3 |
| F-6 | A seam that never fires produces no invocation, no record entry, and no escalation — and still appears as a zero row in the summary. | §10.3 S-1 |

## 16. Business Rules

Every business rule of this FSPEC is stated once, in the section that owns it. This section is the
**register** of those rules — the prefix each family uses, where it lives, and what it governs — plus
the six cross-cutting rules that no single seam section owns.

### 16.1 Rule register

| Prefix | Family | Owning section | Governs |
|---|---|---|---|
| C-1 … C-4 | configuration | §3.1 | how the `advisory` config section is read and degraded |
| M-1 … M-5 | model rung | §3.2 | rung resolution, the declared fallback, the unresolvable case |
| V-1 … V-8 | verdict and lifecycle | §4.3 | what a verdict is, what licenses action, the disposition triple |
| E-R1 … E-R4 | envelope, structural | §5.1 | that the envelope is a control, evaluated twice, held in configuration |
| E-1 … E-4 | envelope, permitted | §5.2 | the four permitted actions and each one's decidable rule |
| X-a … X-e | envelope, excluded | §5.2 | the closed exclusion set, of which X-a (test artifacts) is enforced hardest |
| P-1 … P-4 | prohibitions | §5.4 | the four things the tier may never do, whatever the envelope says |
| A1-1 … A1-5 | seam A1 | §6.3 | adjudicating a triage abstention |
| A2-1 … A2-6 | seam A2 | §6.4 | re-grounding a stale REQ, and what makes an applied one durable |
| A3-1 … A3-7 | seam A3 | §7.2 | classifying remaining DoD findings |
| A4-1 … A4-6 | seam A4 | §8.2 | resolving a rebase conflict in branch-created files |
| A5-1 … A5-9 | seam A5 | §9.2 | diagnosing a CI failure, what "green" is allowed to mean, and what "revert" means after a push |
| R-1 … R-4 | advisory record | §10.1 | that the record is a precondition of acting, and append-only |
| H-1 … H-4 (incl. H-2b) | record harvest | §10.2 | when the record is distilled — dev-side and queue-side — and the delete guard over it |
| S-1 … S-4 | report summary | §10.3 | the five-seam summary and what it names |
| L-1 … L-4, N-1 … N-4 | escalation output | §11.1, §11.2 | the append-only log, and the report notice beside the existing catalogue |
| D-1 … D-6 | disabled equivalence | §12.1 | what "inert" means, artifact by artifact |
| F-1 … F-6 | flow invariants | §15.3 | ordering and one-invocation-per-seam across a whole run |

### 16.2 Cross-cutting rules

These hold at every seam and are not restated per seam.

| # | Rule | Derived from |
|---|---|---|
| BR-1 | **The pipeline decides membership; the agent only proposes.** No agent output — confidence, a `withinEnvelope` claim, or an argument in prose — widens what may be applied. | §5.1 E-R1, §4.3 V-2, V-3 |
| BR-2 | **Two gates, both mandatory.** In-envelope **and** `confidence == high` are jointly necessary before anything is applied; either failing escalates. | §4.3 V-1 |
| BR-3 | **Checked before and after.** Membership is evaluated on the proposal and again on the produced change; a change that reaches outside is reverted whole, never trimmed. | §5.1 E-R2 |
| BR-4 | **Test artifacts are never the fix.** A proposed or produced diff touching anything in X-a is reverted whole and refused as `revert-on-test-touch`, ahead of every other reason but `prohibited-action`. | §5.2 X-a, §5.3 |
| BR-5 | **Two tree states, never three.** After any invocation the working tree is either the verified post-resolution state or byte-identical to its pre-invocation state. At A5, where the action leaves the local tree, the invariant is asserted on the **pre-push** tree and the branch's published history is never rewritten (A5-8). | §8.2 A4-6, §5.1 E-R2, §9.2 A5-8 |
| BR-6 | **A gate, not an agent, ends a seam.** Every applied resolution is followed by the seam's own gate re-running and reaching its own verdict; an agent never supplies the verdict a gate exists to produce. | §5.4 gate table, §9.2 A5-4 |

### 16.3 Where a rule is enforced

Enforcement location is itself a rule, because NFR-1 turns on it: the envelope, the refusal ladder,
the prohibitions and the budgets are evaluated in the pipeline's own control flow. Prompt text may
*describe* them so an agent proposes usefully, but no rule in §16.1 is satisfied by an instruction in
a prompt — which is why §5.5 T-03-1/T-03-2/T-03-5 assert against the pipeline's behaviour with an
agent that proposes the forbidden thing, rather than against what the prompt says.

## 17. Edge Cases and Error Scenarios

Each seam's own cases live with that seam. This section is the index of those tables, plus the cases
that belong to no single seam because they arise from a run as a whole.

### 17.1 Index of the per-section tables

| Section | Table | Cases it covers |
|---|---|---|
| §3.3 | rung edge cases | tier off with no rung at all; tier on but no seam fires; a later failure after a fallback was taken |
| §4.4 | lifecycle error scenarios | empty, wrong-seam and evidence-less verdicts; "propose nothing"; the seam condition disappearing; interruption mid-attempt |
| §6.5 | A1/A2 | unrecognised or doubled seam tokens; a REQ with no citations; an unwritable REQ; the queue's drift gate blocking first |
| §7.3 | A3 | an unreadable verifier status; no finding classified; a deferral with no successor; a code fix proposed instead of a classification; Phase DOD disabled |
| §8.3 | A4 | the conflict resolving itself; a branch-created **test** file; no test command; a dirty tree after green tests; mixed conflict sets; a second conflict inside one invocation |
| §9.3 | A5 | several checks failing; a re-run surfacing a different failure; a rejected push; CI turning green mid-diagnosis; no retrievable log; no CI at all; checks that never complete; a fix that would touch a test file |
| §10.5 | record | two seams in one run; a missing feature directory; a halt before the distil step; a distil with no LEARNINGS file; a run with no seam at all |
| §11.3 | escalation output | a missing log file or `docs/_queue/` directory; two escalations in one run; repeats across runs; a failed log write; an escalation at a halting seam |
| §12.2 | disabled tier | other keys set while disabled; enabled but unexercised; an absent config file; malformed JSON |

### 17.2 Run-level cases

| Case | Behaviour | Owner |
|---|---|---|
| Two different seams fire in the same run | Both are advised, sequentially, never concurrently; both append to the one record file in occurrence order. | §15.3 F-2, §10.5 |
| A4 resolves and A3 then exhausts in the same Phase DOD | Two invocations, two dispositions, two record entries; A4's resolution is not re-litigated by A3, whose product is a classification only. | §7.2 A3-6, §15.1 |
| A run halts at A3 or A4, so Phase PUB never runs | A5 cannot fire and the record survives on disk un-distilled. The halt report — which the pipeline still produces — **carries the advisory summary** for the seams reached so far; a halt is where the operator needs it most (§10.3 S-1, T-08-9). | §10.2 H-4, §10.3 S-1 |
| The same feature escalates on two successive runs | Two log entries, newest last, neither edited. Nothing in the tier reads its own prior escalations as state. | §11.1 L-1 |
| The fallback rung is taken and a later seam's dispatch fails outright | An ordinary invocation failure under §4, not a second rung resolution — the ladder ran once, at the run's first advisory dispatch. | §3.3, §3.2 M-4 |
| An advisory action succeeds but the record write fails | The action does not survive: it is reverted and the seam escalates with `record-write-failed`. Acting without a record is the one success the tier refuses to keep. | §10.1 R-2 |
| The escalation log write fails while a seam is escalating | The escalation still stands — it is the pipeline doing less — and the failed write is reported. A failed write can never upgrade an escalation to a resolution. | §11.3 |
| The run is interrupted mid-attempt | Not recoverable inside this feature. The record holds every completed attempt, so the operator can see how far the run got. | §4.4 |

### 17.3 The direction every unhandled case falls

Where a case is not enumerated above, one rule decides it: **the unenumerated case escalates.** It
never resolves, never partially applies, and never converts a blocking outcome into a passing one
(§4.3 V-7). That direction is why the error tables can be finite — an omission costs an escalation
an operator would have handled anyway, not an unsafe action.

## 18. Acceptance Tests

Every acceptance test of this FSPEC is written in Who / Given / When / Then form in the section that
owns the behaviour, so a test engineer reads a test beside the rule it pins. This section is the
index — the whole set, its shape, and the three assertions that span sections.

### 18.1 The set

| Series | Section | Count | Range |
|---|---|---|---|
| T-01 | §3.4 rung and configuration | 7 | T-01-1 … T-01-7 |
| T-02 | §4.5 invocation lifecycle | 6 | T-02-1 … T-02-6 |
| T-03 | §5.5 envelope, prohibitions, refusal ladder | 10 | T-03-1 … T-03-10 |
| T-04 | §6.6 seams A1 and A2 | 10 | T-04-1 … T-04-9, plus T-04-3b |
| T-05 | §7.4 seam A3 | 6 | T-05-1 … T-05-6 |
| T-06 | §8.4 seam A4 | 6 | T-06-1 … T-06-6 |
| T-07 | §9.4 seam A5 | 10 | T-07-1 … T-07-10 |
| T-08 | §10.6 advisory record and harvest | 10 | T-08-1 … T-08-10 |
| T-09 | §11.4 escalation output | 8 | T-09-1 … T-09-8 |
| T-10 | §12.3 disabled-tier equivalence | 5 | T-10-1 … T-10-5 |
| **Total** | | **78** | |

The series number matches the FSPEC-ADV id it discharges — T-04-* covers FSPEC-ADV-04, and so on —
so §14.1's requirement → section → tests chain reads in either direction without a lookup.

### 18.2 The three cross-section assertions

Three tests are deliberately written as *for-each* assertions rather than as single cases, because
each pins a closed set that a later change could quietly widen.

| Test | Quantified over | What widening it catches |
|---|---|---|
| T-02-6 | every refusal reason in §5.3 | a reason whose escalation path skips part of the §4.3 V-8 triple |
| T-03-3 | every operation enumerated in X-a | a test-artifact edit that slips past the revert because it takes an unlisted form |
| T-03-6 | every prohibition P-1…P-4 and every gate row of §5.4 | a prohibition that holds only by accident, with no gate re-run behind it |

T-03-5 and T-03-8 are the set-equality companions — the shipped refusal-reason set against §5.3, and
the shipped permitted-action and exclusion sets against §5.2 — so an invented or deleted member fails
even where no individual path changed.

### 18.3 What the suite is required to pin

| # | Obligation | Tests |
|---|---|---|
| AT-1 | The disabled tier is inert on named artifacts and phase outcomes — not merely "looks the same". | T-01-1, T-10-1 … T-10-5 |
| AT-2 | Every escalation, whatever its cause, produces the same observable triple. | T-02-6, T-04-3b, T-04-7, T-04-8, T-05-3, T-05-4, T-06-2 … T-06-5, T-07-2 … T-07-6, T-08-2 |
| AT-3 | Nothing the tier does converts a blocking outcome into a passing one. | T-03-6, T-05-2, T-07-7, T-09-3, T-09-4 |
| AT-4 | After any invocation the tree is in one of exactly two states — at A5, the pre-push tree (A5-8). | T-03-1, T-03-2, T-03-9, T-03-10, T-05-5, T-06-3, T-06-6, T-08-2 |
| AT-5 | A resolution is always a gate's verdict, never an agent's. | T-02-1, T-03-7, T-06-1, T-07-1, T-07-7 |
| AT-6 | The run leaves a durable, honest account behind — record, log, summary — including on a run that halted. | T-08-1 … T-08-10, T-09-1, T-09-2, T-09-6, T-09-8 |

### 18.4 Out of scope for this document

The suite's *form* — framework, fixtures, doubles for the runtime seams, and which of these are
property-based rather than example-based — is a testing decision owned by PROPERTIES and TSPEC.
This FSPEC fixes only what must be true, and for which inputs.

