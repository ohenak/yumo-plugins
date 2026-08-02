# FSPEC — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `-v2.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md`, `-v2.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

## 1. Scope and entry obligations

This FSPEC specifies the behaviour of **Phase MERGE**, the last phase of the `orchestrate-dev`
pipeline, plus the two adjacent behaviours REQ §5 scopes in: the queue driver's post-pipeline status
transition (AC-5.6) and the post-merge working-tree state (AC-5.7).

It is written against an approved REQ (v1.1, both cross-reviews `APPROVED`). Per the REQ's §8
stopping rule, four non-blocking round-2 findings were routed here as **named entry obligations**.
Each is resolved below; this table is the record.

| Finding | Obligation | Resolved in |
|---|---|---|
| TE **N-01** | AC-3.1's "regardless of … merge mode" vs AC-1.6 rows 1–2 | §2.2 — the ordered evaluation of §2.1 is the sole authority; `skipped` wins over `refused` because the guard is never reached. AC-3.1's "regardless" is read as scoped to rows 4–6 |
| TE **N-02** | Precedence among simultaneous precondition failures | §2.3 — the AC-1.2 table's own top-to-bottom row order is *the* evaluation order, one failure reported, no `refused`-beats-`deferred` re-sort |
| SE **F-13** | Name the superseded criterion and the test to re-express | §7.5 — AC-5.6 supersedes `pdlc-rcv-budget-stop` AC-2.7a for the `merged` case only; `RLH-AT-32-orch` is re-expressed, not deleted |
| SE **F-14** | Order of AC-5.7's checkout vs the queue write-and-commit | §8.2 — the queue write-and-commit happens **first**, on the feature branch; the default-branch checkout follows |

Two round-2 questions are also answered here: TE **Q-01** (the N-02 tie-break — §2.3) and TE **Q-02**
(when the `Evidence` column migration happens — §7.3).

**Altitude.** This document states *observable behaviour*: which external surface each fact is read
from, what values are recognised, which decision follows, and what the operator sees. Where a
behaviour requires an internal substitution point so a test can drive it, this FSPEC states that a
**single substitutable observation point per external surface is required** and names it by its
behavioural role (`O1`…`O6`, §3). The seam's actual name, signature and injection mechanics are
TSPEC-owned (§13). Commands and JSON field names *are* stated: they are the contract with GitHub, not
an internal contract, and the REQ already names them (AC-1.2, BL-02).

**Out of scope**, unchanged from REQ §5: resolving CI failures or rebase conflicts, the loop driver,
and merging PRs the pipeline did not raise.

## 2. FSPEC-MERGE-01 — Phase MERGE placement and control flow

**Links:** REQ-MERGE-01, NFR-2, NFR-5.

### 2.1 Placement

Phase MERGE runs **inside the pipeline body, immediately after Phase PUB**, and is the last phase.
Consequences that follow from the existing pipeline shape and are therefore requirements on this
phase:

- It runs inside the same guarded body as every other phase, so anything it throws is caught by the
  pipeline's halt path. **Phase MERGE never throws.** Every failure it can observe resolves to a
  reported value (§9); AC-1.3 requires the pipeline outcome to stay `success` for every non-merge,
  and a throw here would take the halt path and write a `halted` queue row over a feature whose only
  fault is that its PR was not ready.
- It records a phase row like every other phase: `MERGE`, title `Merge PR`, one status glyph
  (`✅` merged, `⏭` skipped, `⚠️` deferred or refused) and a one-line detail naming the resolving
  condition.
- It reads `prUrl` from Phase PUB's result. When Phase PUB is disabled or produced no `prUrl`, the
  phase resolves at §2.1 row for "no PR" (`deferred`).

### 2.2 The evaluation order is the control flow (N-01)

AC-1.6's ordered table **is** the phase's control flow. It is evaluated top to bottom and the first
row that resolves is the answer; no later row is evaluated once one resolves.

| # | Evaluated | Resolves to | Nothing later runs, including |
|---|---|---|---|
| 1 | `PHASE_MERGE_ENABLED` is false | `skipped` | config read, guard, every observation |
| 2 | `mergeMode` resolves to `off` | `skipped` | guard, every observation |
| 3 | PR state is already `MERGED` | `merged` (method `unknown`) | guard, remaining preconditions, merge attempt — but **not** the queue write-back (§7.4), which still runs |
| 4 | self-modification guard fires | `refused` | remaining preconditions, merge attempt |
| 5 | a remaining precondition fails (§2.3) | `refused` or `deferred` | merge attempt |
| 6 | merge attempted | `merged` or `deferred` | — |

**N-01 is resolved by this table, not by re-reading AC-3.1.** A PR that touches a guard path in a
repo with `mergeMode: "off"` reports **`skipped`**, because row 2 resolves before row 4 is reached.
AC-3.1's "regardless of CI status, merge mode, or any other configuration" is scoped to the
situation in which the guard is *evaluated at all* — rows 4 through 6. Neither reading merges
anything, so no safety property depends on the choice; determinacy of the reported value does, and
this table is the single answer.

Row 1 is evaluated before the configuration file is read at all, so a disabled phase cannot fail on
a malformed config.

### 2.3 Order within row 5 (N-02, Q-01)

Row 5's preconditions are evaluated in **the AC-1.2 table's own top-to-bottom order**, and the
**first** failure in that order is the one reported:

| Order | Precondition | Observation | Failure resolves to |
|---|---|---|---|
| 5a | PR exists | Phase PUB's `prUrl` | `deferred` — "no PR URL from Phase PUB" |
| 5b | PR open | `O1` (§3) | `deferred` — "PR is CLOSED" |
| 5c | CI evidence | `O2` (§5) | `refused` |
| 5d | Mergeable | `O1` + bounded re-read (§3.3) | `deferred` |
| 5e | No unresolved review threads | `O3` | `deferred` — "N unresolved review thread(s)" |
| 5f | Merge-method capability retrievable | `O4` | `refused` on unretrievable/unparseable (AC-2.5a); `deferred` when retrieved and no permitted method remains (AC-2.5b) |

**The tie-break is positional, not class-based.** A run holding both `CI pending` (5c, `refused`) and
`mergeable: CONFLICTING` (5d, `deferred`) reports **`refused`** — because 5c precedes 5d, not because
`refused` outranks `deferred`. A run holding both `PR CLOSED` (5b, `deferred`) and `CI failed` (5c,
`refused`) reports **`deferred`**. This is deliberate and is Q-01's answer: a class-based re-sort
would require every observation to be taken before any can be reported, which contradicts the
short-circuit AC-1.6 already fixes, and it would report a CI failure on a PR nobody can merge anyway.
No safety is lost: the failure of *any* precondition means no merge, and that is invariant under the
ordering.

**Evaluation is short-circuit within row 5 as well.** Once a precondition fails, later ones are not
observed. NFR-2's "no state-mutating call is issued before every precondition has been evaluated" is
satisfied because the merge attempt (row 6) is the only state-mutating call and it is reached only
when every precondition has resolved *pass* — NFR-2 constrains mutation, not observation.

### 2.4 Enable/skip resolution

`PHASE_MERGE_ENABLED` is a pipeline-level flag, defaulting **true**, evaluated first (row 1).
`mergeMode` is read from the consuming repo's configuration (§10), defaults **`off`**, and any
absent, unreadable, malformed or unrecognised value resolves to `off` (AC-7.3). Both produce
`mergeStatus: skipped` and neither evaluates the guard, so a skipped run has exactly one reported
answer.

### 2.5 Idempotent re-entry (NFR-5)

Row 3 is what makes a re-invocation safe. Against an already-merged PR the phase attempts **zero**
merges, evaluates **no** guard, reports `merged` with `mergeMethod: unknown` and no `mergeSha` it did
not observe, and re-attempts only the queue write-back idempotently (§7.4). A PR merged by a human
counts. This is the recovery path for AC-5.2's "merged, queue not updated".

## 3. FSPEC-MERGE-02 — GitHub observations

## 4. FSPEC-MERGE-03 — Self-modification guard

## 5. FSPEC-MERGE-04 — CI evidence rule

## 6. FSPEC-MERGE-05 — Merge execution and method policy

## 7. FSPEC-MERGE-06 — Queue write-back

## 8. FSPEC-MERGE-07 — Post-merge working tree and branch handling

## 9. FSPEC-MERGE-08 — Reporting contract

## 10. FSPEC-MERGE-09 — Configuration

## 11. Observable outcomes per scenario

## 12. Acceptance tests

## 13. Obligations and open questions

## 14. Traceability
