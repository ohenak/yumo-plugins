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
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

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
| B-12 | This repo's own config file exists and currently carries an `implementation` section only — no `merge` section — so an absent section is the normal case, not an error case | `.claude/pdlc.config.json` |
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
| Tier enabled but no seam fires during the run | No dispatch happens, so no resolution happens; the advisory summary reports zero invocations for all five seams and names the rung as *not exercised*. |
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
  4. ACT        apply the proposed action
  5. CHECK      does the produced change stay inside the envelope?  no ──► revert, refuse
  6. VERIFY     the seam's own gate re-runs (§5.4)   fails ──► revert, refuse
  7. RECORD     write the advisory record            fails ──► revert, refuse: record-write-failed
  │
  ├─ all of 1..7 succeed ─────────────────► RESOLVED: the pipeline continues from the gate's verdict
  └─ any refusal, or budget exhausted ────► ESCALATED: §11 entry + pre-advisory behaviour, unchanged
```

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
| V-5 | An invocation that exceeds `advisory.attemptBudget` attempts, or `advisory.seamBudgetMinutes` of wall-clock measured from first dispatch to final verdict, escalates rather than retrying. Whichever bound is reached first ends the invocation. |
| V-6 | Attempts within one invocation are sequential; an invocation is never concurrent with itself, and no two seams are advised concurrently within one run. |
| V-7 | Every terminal disposition is exactly one of `resolved` or `escalated`. There is no third outcome, and in particular no outcome that converts a blocking verdict into a passing one. |
| V-8 | Every escalation — from whatever cause — produces the same observable triple: the seam's outcome is `escalated`; the advisory record and the escalation entry each carry exactly one refusal reason; and the pipeline's pre-advisory behaviour for that seam proceeds unchanged. |

### 4.4 Error scenarios

| Scenario | Behaviour |
|---|---|
| The agent returns nothing at all | Malformed (V-4): consumes an attempt; if the budget remains, retry, else escalate with `malformed-verdict`. |
| The agent returns a verdict for a different seam | Malformed (V-4). |
| The agent's `evidence` is empty | Malformed (V-4) — a diagnosis with no evidence is not usable by the operator, which is the point of the escalation. |
| The agent proposes "nothing" with high confidence | Not a resolution: nothing is applied, and the invocation escalates carrying the diagnosis. This is the "the agent understood the problem and it needs a human" case, and it is the good outcome for US-02. |
| The seam condition disappears between dispatch and verdict (e.g. CI turns green on its own) | The invocation ends without applying anything; it is recorded as an invocation with no action, and the pipeline continues from the gate's own re-read. |
| An attempt applies a change and then the run is interrupted | Not recoverable inside this feature; the branch state is whatever the last completed step left. §10's record is written per completed attempt so the operator can see how far it got. |

### 4.5 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-02-1 | **Who** operator · **Given** a seam fires and the verdict is in-envelope with `confidence: high` · **When** the action is applied and the seam's gate re-runs green · **Then** the seam reports `resolved` and the pipeline continues past the seam. |
| T-02-2 | **Who** operator · **Given** a verdict with `confidence: low` that is otherwise in-envelope · **When** the invocation completes · **Then** nothing is applied, the seam reports `escalated` with reason `low-confidence`, and the pre-advisory behaviour for that seam happens. |
| T-02-3 | **Who** operator · **Given** a verdict claiming `withinEnvelope: true` for an action the configured envelope excludes · **When** the invocation completes · **Then** it is refused as out of envelope and the disagreement appears in the record. |
| T-02-4 | **Who** operator · **Given** an unparseable agent response on every attempt · **When** the attempt budget is exhausted · **Then** exactly `attemptBudget` attempts were made and the seam escalates. |
| T-02-5 | **Who** operator · **Given** an invocation whose elapsed time passes `advisory.seamBudgetMinutes` mid-attempt · **When** the bound is reached · **Then** the invocation escalates with reason `budget-exhausted` without starting a further attempt. |
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
| E-1 | re-run a check that failed flakily | the check failed and the re-run is on the identical commit sha, with no push in between; bounded by `advisory.attemptBudget` | A5 |
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
| X-d | any change outside the feature's declared scope — the files the PLAN names, plus the files the branch had already touched as of its head when the seam dispatched (at A4, the pre-rebase head) |
| X-e | anything under the merge phase's self-modification guard paths |

**X-a is the dangerous one and gets its own handling.** A produced diff touching anything in X-a is
reverted whole, the seam escalates, and no run in which that happened is reported as resolved.
Fixing a red test by editing the test is the failure mode this whole feature must not introduce.

### 5.3 The refusal ladder

Every refusal carries **exactly one** reason. Triggers can co-occur, so the set is ordered and the
first match wins:

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
| A1 | the queue's dependency pre-check only — Phase-0 triage is itself an agent verdict and is **not** re-run | the pre-check reports not-blocked |
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
| A1-2 | `run-candidate` may never be returned for a candidate the dependency pre-check reports blocked. The pre-check runs before any advisory agent and is the gate that re-runs (§5.4). |
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

### 6.5 Edge cases and error scenarios

| Case | Behaviour |
|---|---|
| Triage returns `needs-human` with an unrecognised seam token | Routed to A1 (§6.2). E-4 is unavailable there, so no file is changed. |
| Triage returns `needs-human` with an A2 token but the REQ has no citations | The proposal is empty; nothing is applied and the invocation records "no drift found", which is an invocation with no action, not a resolution. |
| Every drifted citation resolves, but two of them now point into the same symbol | Still in E-4 — E-4's rule is per citation, and merging targets is not a requirements change. |
| The REQ file is not writable, or the write fails | §5.3 reason `record-write-failed` applies to the advisory record; a failed REQ write is a failed action, reverted, refused as `post-action-verification-failed`. |
| Both A1 and A2 tokens appear on one stop | Malformed (§4 V-4): a stop names exactly one gate. |
| The queue's drift gate blocks the whole invocation before `QUEUE.md` is read | No seam fires; the advisory tier is not involved, and the blocked outcome stands. |

### 6.6 Acceptance tests

| # | Who / Given / When / Then |
|---|---|
| T-04-1 | **Who** operator · **Given** triage returns `blocked` · **When** the queue processes it · **Then** no advisory invocation happens and the candidate is skipped exactly as today. |
| T-04-2 | **Who** operator · **Given** triage returns `needs-human` with no recognised token · **When** the queue processes it · **Then** the A1 adjudicator runs and no file in the repository changes. |
| T-04-3 | **Who** operator · **Given** the dependency pre-check reports a candidate blocked · **When** an A1 verdict of `run-candidate` is returned for it · **Then** the candidate is not run and the seam escalates. |
| T-04-4 | **Who** operator · **Given** a declared dependency absent from the queue, so presence in base is unsettled · **When** A1 adjudicates · **Then** the verdict is `escalate` and no agent decided presence in base. |
| T-04-5 | **Who** operator · **Given** three `needs-human` candidates, the first adjudicated `hold` and the second `run-candidate` · **When** the invocation completes · **Then** exactly one candidate has been picked. |
| T-04-6 | **Who** operator · **Given** an A2 proposal of pure location corrections · **When** it is applied · **Then** only the REQ file changed, triage did **not** run again in this invocation, and the next queue invocation re-runs the pre-check and triage on the re-grounded REQ. |
| T-04-7 | **Who** operator · **Given** an A2 proposal containing a citation whose symbol no longer exists · **When** the invocation completes · **Then** nothing is applied and the seam escalates. |
| T-04-8 | **Who** operator · **Given** an A2 proposal that also edits an acceptance criterion · **When** the invocation completes · **Then** the change is reverted whole and the reason is `out-of-envelope`. |
| T-04-9 | **Who** operator · **Given** a triage stop · **When** its result is read · **Then** it names which gate produced it, and an A2 token routes to A2 while an A1 token routes to A1. |

## 7. FSPEC-ADV-05 — Seam A3: DoD exhaustion

## 8. FSPEC-ADV-06 — Seam A4: rebase conflict

## 9. FSPEC-ADV-07 — Seam A5: CI failure

## 10. FSPEC-ADV-08 — Advisory record and its harvest

## 11. FSPEC-ADV-09 — Escalation output

## 12. FSPEC-ADV-10 — Disabled-tier equivalence

## 13. Open questions
