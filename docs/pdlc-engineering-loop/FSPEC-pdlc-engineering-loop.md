---
feature: pdlc-engineering-loop
---

# FSPEC — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC[-v{N}].md` in this directory |
| LEARNINGS | `docs/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.9 | 2026-08-25 |

v0.9 is an erratum round over v0.8, re-grounded on REQ v1.8 (unchanged since v0.8, so nothing is
absorbed): Phase T raised no items, and the three round-13 review findings left unapplied are
landed — BR-21 regains the carve-out's purpose clause, §2 decides that test-side transcriptions are
part of the enumeration and so widen additively, and AT-52's second conjunct also reds on any
assertion change other than that enumeration's membership.

v0.8 is an erratum round over v0.7, re-grounded on REQ v1.8: §2's exclusion adopts REQ §5's
narrowed wording ("changing what any gate delivered by orders 1–4 **asserts**") and records the
§5 carve-out and its bound on the in-scope side, BR-21 carries NFR-1's fifth authority
(`pdlc-engine-distribution`) and its single exception, AT-52 covers the published-engine packaging
channel with an additive-only conjunct, and BR-24's trailing pointer to BR-29 is reworded to the
claim BR-29 actually carries.

v0.7 is an erratum round over v0.6: Q-07 cites BR-24 rather than BR-29 as the authority excluding
the shipped example configuration, and the v0.5 changelog entry is restored to what v0.5 actually
changed. Phase R's raised item names DEC-LOOP-06 as the stale site; this FSPEC's BR-10/BR-11b
already carry the reading REQ AC-3.4 states, so no normative text changes here.

v0.6 is an erratum round over v0.5, re-grounded on REQ v1.6: BR-02 drops its "AC-2.5 names three
states" clause (AC-2.5 now states the four-state partition authoritatively), Q-03 is restated as the
residual AC-2.5 leaves, BR-18 drops its narrowing-and-upstream-erratum clause and its *(narrowed)*
trace marker (NFR-5 now states the same recognises-scoped form), Q-10 keeps only its residual half,
the Open Questions preamble records REQ O-6 as discharged, and AT-32 gains a tracked-declaration
conjunct with Q-07 reframed as mechanism selection.

v0.5 is an erratum round over v0.4: BR-10's Traces cell gains AC-3.4, BR-18 is marked as a
deliberate narrowing carrying an upstream-erratum clause owned by Q-10, BR-24's tracked-and-repo-wide
home is framed as an FSPEC *(addition)* rather than as AC-5.1a content, and Q-01/Q-03 cite REQ
O-5/O-6.

v0.4 is an erratum round over v0.3: it lands the four items Phase T raised (BR-24's tracked home,
BR-14's *who decided*, BR-18's provable form, Q-08's premise) together with the v5 review pair's
`preflight: "off"` correction. Earlier versions addressed the earlier review pairs; findings are
not restated here.

## Overview

This FSPEC specifies the behaviour of the **session-level loop driver** the REQ asks for: a
`/loop`-driven session that repeatedly invokes the queue driver, terminates on its own, refuses to
start on an unsafe machine, and renders one operator view over the escalation log.

**What already exists at HEAD** (the loop is built *on* these; none of them is re-specified here):

| Mechanism | Where | Behaviour relied on |
|---|---|---|
| One-feature-per-invocation queue driver | `pdlc/workflows/orchestrate-queue.js`, `main()` | Returns a report whose `outcome` is one of `no-queue`, `blocked`, `idle`, `ran`, `halted` (`buildQueueReport`, orchestrate-queue.js) |
| Queue skill → engine CLI delegation | `pdlc/skills/orchestrate-queue/SKILL.md`, "Invocation Contract" | `/pdlc:orchestrate-queue` delegates to `pdlc queue`; "processes **at most one** ready REQ per invocation, then returns" |
| In-engine iteration | `runQueueLoop`, `pdlc/engine/lib/run.mjs` | `pdlc queue --loop`, stopping on one of `LOOP_STOP_REASONS` (`exhausted`, `bound-reached`, `blocked`, `refused`) |
| Engine readiness check | `cmdDoctor`, `pdlc/engine/bin/cli.mjs` | Prints one `PASS`/`FAIL`/`SKIP` line per startup rung; on not-ok prints the reason plus a remediation line and sets a non-zero exit code |
| Engine dispatch refusal | `cmdQueue`, `pdlc/engine/bin/cli.mjs` | Refuses to dispatch a queue invocation when the engine's startup result is not ok, and says why |
| Escalation log | `appendEscalationEntry` / `renderEscalationEntry`, `pdlc/workflows/orchestrate-dev.js` | Appends a heading-delimited block to `docs/_queue/ESCALATIONS.md`; append-only, newest-last |
| Merge-refusal escalations | `MERGE_ESCALATIONS`, orchestrate-dev.js | Renders escalation **notice strings** onto the pipeline report |
| Effective guard-path set | `effectiveGuardPaths` / `MERGE_GUARD_DEFAULTS`, orchestrate-dev.js | Shipped defaults (`pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/`) unioned with configured extras |
| Per-repo config file | `MERGE_CONFIG_PATH`, orchestrate-dev.js | `.claude/pdlc.config.json`, one section per feature; `ADVISORY_CONFIG_PATH` is the same path (orchestrate-dev.js) |

**What this feature adds behaviourally:** an iteration contract over that queue invocation
(REQ-LOOP-01), a backoff-and-stop discipline (REQ-LOOP-02), a once-per-session preflight gate
(REQ-LOOP-03), a rendered operator view over the escalation log plus the two escalation sources
that do not yet reach it (REQ-LOOP-04), and the reporting and documentation surfaces
(REQ-LOOP-05…07).

**Altitude.** This document states observable behaviour and decision rules only. Field names,
module placement, seam signatures and the mechanics of reading `.claude/pdlc.config.json` are the
TSPEC's; where a rule needs one, it is routed in **Open Questions**.

## Linked Requirements

Every behaviour below traces to the REQ. FSPECs are written only for the requirements with
branching behaviour; REQ-LOOP-05 and REQ-LOOP-06 are documentation-shaped and appear here only
where a rule must be *derived* rather than written down.

| FSPEC | Title | Requirements | User stories |
|---|---|---|---|
| FSPEC-LOOP-01 | Iteration contract and outcome dispatch | REQ-LOOP-01 (AC-1.1…AC-1.6), NFR-1, NFR-2, NFR-4 | US-01, US-03 |
| FSPEC-LOOP-02 | Backoff schedule and session termination | REQ-LOOP-02 (AC-2.1…AC-2.5) | US-03 |
| FSPEC-LOOP-03 | Once-per-session preflight gate | REQ-LOOP-03 (AC-3.1…AC-3.4) | US-01 |
| FSPEC-LOOP-04 | Escalation sources and the operator view | REQ-LOOP-04 (AC-4.1…AC-4.7), NFR-5 | US-02 |
| FSPEC-LOOP-05 | Operator-surface derivation | REQ-LOOP-05 (AC-5.1, AC-5.1a, AC-5.2, AC-5.3), NFR-3, NFR-6 | US-04, US-05 |
| FSPEC-LOOP-06 | Session report | REQ-LOOP-07 (AC-7.1, AC-7.2) | US-02, US-03 |

REQ-LOOP-06 (durability documentation, AC-6.1…AC-6.3) has no branching behaviour: it is
documentation whose content is transcribed from the runtime's own `/loop` documentation with the
runtime version cited beside it. No behavioural-flow section is written for it; its content
obligations are BR-30 and its tests AT-35 and AT-47.

**Not specified here** (REQ §5 out of scope, and REQ §8 deferrals D-LOOP-01…05): parallel
execution of disjoint features, multi-repo driving, REQ-readiness watching, scheduled-task
packaging, and changing what any gate delivered by orders 1–4 asserts.

**In scope by REQ §5's carve-out.** This feature ships files that the completed
`pdlc-engine-distribution` feature's distribution and release gates enumerate. Widening those
enumerations — and the approved `pdlc-engine-distribution` tables they must keep agreeing with — so
that they cover this feature's shipped files is in scope. The licence reaches the test-side
transcriptions of those enumerations and tables on the same terms: a transcription is part of the
enumeration, so its diff is additive, not frozen. Its bound is the falsifiable half: the widening
may not alter what those gates assert about anything else, and it is the only permitted change to
any gate this feature inherits. BR-21 carries the rule; AT-52 falsifies it.

## Behavioral Flow

### 3.1 Session lifecycle (FSPEC-LOOP-01, FSPEC-LOOP-03)

```
session start
  └─ S1  read the `loop` configuration                     → BR-01, BR-02
  └─ S2  preflight: engine readiness                       → BR-10
  └─ S3  preflight: working-tree cleanliness               → BR-11
        ├─ refuse (policy "strict", either condition fails) → session ends, 0 iterations
        └─ warn   (policy "off")                            → BR-11b: tree condition
                                                              continues to iteration 1; not-ok
                                                              engine ends the session, 0 iterations
  └─ S4  iteration 1 … N
        └─ per-iteration flow, §3.2
  └─ S5  session report                                    → §3.4
```

S1–S3 run **exactly once per session**, before iteration 1, and never again (REQ AC-3.1's
"once per session, before first iteration"). Both preflight conditions are properties of the
machine at session start; the loop stops outright on anything that changes mid-session
(BR-05, BR-06), so a per-iteration re-check has no outcome it could change.

**Session-scoped state and its two failure modes.** "Once per session" (S1–S3) and BR-09's
consecutive-idle counter and schedule position are *session* state: they exist for the life of one
loop session and are not durable. Two ways the host can fail to keep them are decided rules, not
assumptions — a session whose accumulated state is lost mid-run behaves as a fresh session and says
so (E-24), and a wait the host cannot honour at the requested length is reported with the length
actually waited rather than silently accepted (E-25). Both are made observable through the session
report (§3.4), which is what lets AT-07 and AT-17 read a waited interval and a preflight-evaluation
count instead of inferring them. Where this state lives is the TSPEC's (Q-08).

### 3.2 One iteration (FSPEC-LOOP-01)

```
iteration n
  └─ I1  invoke the queue driver exactly once
         (`/pdlc:orchestrate-queue` → `pdlc queue`, WITHOUT `--loop`)
  └─ I2  receive the queue report
  └─ I3  dispatch on the report's outcome        → BR-04 … BR-09 (a throw: BR-04a)
         ├─ ran            → continue immediately (no backoff interval)
         ├─ blocked        → STOP, naming the blocking feature and reason
         ├─ halted         → STOP, surfacing the halt
         ├─ idle           → BR-07: stop-vs-backoff decision
         └─ no-queue       → STOP immediately
  └─ I4  render the operator view                → §3.3
  └─ I5  emit the iteration line                 → §3.4
```

**One invocation is one iteration.** The unit the loop counts is the queue invocation, not a
phase inside it — the queue driver's own contract is one ready REQ per invocation
(`pdlc/skills/orchestrate-queue/SKILL.md`, "Behavior: processes **at most one** ready REQ per
invocation, then returns"), and this loop preserves it unchanged (REQ AC-1.2).

**The `--loop` flag is not used.** The engine ships its own in-process iteration
(`runQueueLoop`, `pdlc/engine/lib/run.mjs`) which continues past a `halted` outcome and stops
on the first `idle` as `"exhausted"`. This driver deliberately differs on both counts (BR-06,
BR-07) because it has wall-clock time available and the engine loop does not. Neither path
retires the other; `pdlc queue --loop` is left exactly as it ships (REQ AC-1.5).

### 3.3 Operator view over the escalation log (FSPEC-LOOP-04)

```
render(view)
  └─ V1  read `docs/_queue/ESCALATIONS.md`
         └─ absent → empty view, no error                  → E-06
  └─ V2  split into entry blocks; parse each
         └─ unparseable block → skip it, record a parse notice, keep going → BR-16
  └─ V3  drop entries whose latest decision record marks them resolved/rejected → BR-14
  └─ V4  collapse recurrences of the same escalation for the same feature
         into one item carrying an occurrence count                       → BR-15
  └─ V5  order open items by blocked-feature count, desc                  → BR-13
  └─ V6  emit the view
```

The view is **recomputed from `docs/_queue/ESCALATIONS.md` and `docs/_queue/QUEUE.md` on every
render** and holds no state between iterations (REQ AC-4.3). Rendering never writes to the log:
the append-only, newest-last guarantee the log carries (`appendEscalationEntry`,
`pdlc/workflows/orchestrate-dev.js`) is preserved — no block already on disk is rewritten,
reordered or deleted by anything in this feature.

**Blocked-feature count (V5).** For an entry naming feature *F*, the count is the number of
features in `docs/_queue/QUEUE.md` whose status is not `done` and which reach *F* through the
transitive closure of their **effective** dependencies, excluding *F* itself. "Effective" is the
union the queue itself resolves against — the `Depends-On` column unioned with the REQ
frontmatter's own `depends-on` (`pdlc/templates/QUEUE.md`: "Effective dependencies = this table's
Depends-On ∪ the REQ's own `depends-on`"; the same union feeds `precheckDependencies` in
`pdlc/workflows/orchestrate-queue.js`). An entry whose feature has no queue row counts 0.

### 3.4 Session report (FSPEC-LOOP-06)

Two report lines, each with **one** authoritative field set (BR-27, BR-28). AC-7.2 is the
authoritative field set for the summary and AC-2.3 adds none of its own (REQ AC-2.3); fields marked
*(addition)* are this FSPEC's deliberate additions, not AC content.

| Line | Fields (exact set) | Source |
|---|---|---|
| Per-iteration line (one per iteration) | iteration number *(addition)*; queue outcome; feature picked, or an explicit "none"; merge status; PR URL when the report carries one; wait — requested and actual length, present when a wait was taken (E-25) *(addition)*; notices — the notice codes raised in that iteration, possibly empty *(addition)* | AC-7.1 ∪ additions |
| End-of-session summary (one per session) | stop reason *(addition)*; iteration count *(addition)*; features merged, each with its PR URL; features halted *(addition)*; escalations raised this session *(addition)*; open escalation count; next actionable item; the current operator view *(addition)*; notices — the session-scoped notice codes *(addition)* | AC-7.2 ∪ additions |

"Escalations raised this session" counts entries appended during this session; "open escalation
count" is the size of the rendered view (§3.3) after BR-14's status derivation and BR-15's
collapsing, so the two differ and both are stated. Each set is asserted by set-equality (AT-36,
AT-37): a dropped field reds.

**Notice catalogue (closed).** Everything the report names beyond the two field sets rides the
`notices` field as a named code with its own subject; a notice is never a field. The ten codes are: configuration state applied (BR-02); threshold default substituted, naming
each key (BR-03); preflight warning naming its condition (BR-11b); preflight conditions
evaluated-and-holding (BR-11b); engine version mismatch (BR-10); escalation parse notice (BR-16);
escalation append failure (E-08); candidate skipped as not ready, with its reason (BR-20);
`docs/_queue/QUEUE.md` unreadable (E-05); session-state restart (E-24). It is closed and asserted by
set-equality (AT-51); each AT that reads a notice asserts its own code and subject.

**Stop-reason enumeration (closed).** A session stops for exactly these ten reasons: preflight
refusal (BR-11a); `blocked` (BR-05); `halted` (BR-06); `no-queue` (BR-08); `idle` with an
awaiting-merge row (BR-07); `idleStopAfter` exhausted (BR-09); a queue invocation that throws
(BR-04a, E-04); `docs/_queue/QUEUE.md` unreadable on an `idle` outcome (BR-07, E-05); backoff that
cannot be entered because `backoffSchedule` is empty or `idleStopAfter` is `0` (E-03); an engine
dispatch refusal under `loop.preflight: "off"` with a not-ok startup result, which ends the session
at zero iterations without a preflight refusal (BR-11b, E-19). BR-28 owes a
summary on every member, asserted by set-equality over this enumeration (AT-37).

The report is transient session output. It is **never read back** by any later render: the
authoritative record is the log on disk, so a re-run reproduces the view from the log rather than
from a prior report (REQ AC-4.1's "sole input" rule).

### 3.5 The three escalation sources reaching one file (FSPEC-LOOP-04)

REQ AC-4.1 requires that all three sources append an entry to `docs/_queue/ESCALATIONS.md`. At
HEAD only one of the three does:

| Source | REQ citation | State at HEAD |
|---|---|---|
| Advisory-seam escalation | `pdlc-advisory-tier` REQ-ADV-10 | **Appends.** `appendEscalationEntry` is called from the seam path in `pdlc/workflows/orchestrate-dev.js`; the entry is rendered by `renderEscalationEntry` |
| Refused merge | `pdlc-merge-phase` REQ-MERGE-03/04 | **Does not append.** `MERGE_ESCALATIONS` (orchestrate-dev.js) renders notice *strings* onto the pipeline report; the queue driver passes the pipeline report through whole (`buildQueueReport`, orchestrate-queue.js) and nothing writes them to the log |
| Pipeline halt | REQ AC-4.1 | **Does not append.** A halt is recorded on the queue row (`newStatus = "halted"`, orchestrate-queue.js) and in the report, not in the log |

So this feature must make the second and third sources append, with the fields BR-12 requires,
without altering the first source's entries. Whether they append through the existing writer or a
sibling one — and where the halt append sits relative to the queue's status write — is the
TSPEC's (O-2, O-3 in the REQ; see Open Questions Q-01).

**Advisory set-equality (REQ AC-4.1).** The advisory sources are exactly the members of the live
advisory seam catalogue, re-enumerated at check time rather than restated as a literal here — the
catalogue has grown once already and a copied list is what goes stale.

**Calibration (REQ AC-4.1a).** The consolidation agent's advisory over-escalation calibration
**counts advisory entries only** — AC-4.1a's own words, and the invariant is stated over the whole
calibration output, not over per-seam totals alone. At HEAD the calibration reader
(`parseEscalations`, `pdlc/workflows/consolidate-learnings.js`) keys every block carrying both a
Feature row and a Seam row — no advisory filter, and no key guessed for a block missing either
(Q-09) — and its candidate derivation (`seamCandidates`) takes a maximum across all seam keys and
short-circuits on a corpus-state value computed from the raw block count; so a
non-advisory entry carrying AC-4.1a's disjoint source name adds a key that leaves per-seam advisory
totals untouched while still moving the derived candidate and the corpus state. The requirement is
therefore: every part of the calibration a consolidation run reads — per-seam totals, distinct
feature counts, entry count, corpus state, and the derived over/tie/under candidate — is identical
to what it would be over the same log with every non-advisory entry removed, while the non-advisory
entries remain visible in the operator view (BR-12, E-09, AT-20). How that identity is achieved —
a filter in the reader, a namespace the reader excludes, or a separate file — is the TSPEC's (Q-01).

## Business Rules

### Configuration (REQ-LOOP-02)

| ID | Rule | Traces |
|---|---|---|
| BR-01 | The loop's thresholds live in a `loop` section of the per-repo config file `.claude/pdlc.config.json` (`MERGE_CONFIG_PATH`, `pdlc/workflows/orchestrate-dev.js`; `ADVISORY_CONFIG_PATH` is the same path, orchestrate-dev.js), alongside the sections that file already carries. The declared thresholds and defaults are the REQ's: `loop.backoffSchedule` `[5, 15, 30, 60]` minutes, `loop.idleStopAfter` `4`, `loop.preflight` `"strict"`, `loop.dirtyTreePolicy` `"tracked"` (REQ AC-3.2). These four keys and their four default values are the complete declared set, and each key's accepted value domain is declared alongside its default: `backoffSchedule` a list of non-negative minute values, the empty list included (E-03); `idleStopAfter` a non-negative integer, `0` included (E-03); `preflight` one of `"strict"` or `"off"`; `dirtyTreePolicy` one of `"tracked"` or `"any"`. A value outside its key's domain is BR-03's unacceptable case. | AC-2.1–2.4 |
| BR-02 | Four configuration states are distinguished, and the session report names which one applied: (a) section **absent**, (b) section **present and explicitly default-valued**, (c) section **present but malformed** — present under the right name with a shape the reader does not accept, (d) file **absent or unreadable/unparseable**. In every one of the four, the declared defaults apply unchanged and the loop runs. This partition is AC-2.5's, stated there authoritatively; state (d) is upstream-mandated, not an FSPEC elaboration. | AC-2.5 |
| BR-03 | A configured value that is present but of an unacceptable type is replaced by that threshold's default and named in the session report; it never aborts the session. This follows the sibling readers' precedent — `parseAdvisoryConfig` (`pdlc/workflows/orchestrate-dev.js`) collects invalid keys and substitutes defaults rather than throwing. | AC-2.5 |

### Iteration outcomes (REQ-LOOP-01)

| ID | Rule | Traces |
|---|---|---|
| BR-04a | A queue invocation that **throws** rather than returning a report is a stop, not an outcome: the session ends surfacing the failure, and the consecutive-idle counter is not advanced. The five-member outcome set below governs *returned* reports only (assumption A-02). | AC-1.4, NFR-4 |
| BR-04 | `ran` → the loop continues to the next iteration **immediately**, with no backoff interval, and the consecutive-idle counter resets to zero. | AC-1.3 |
| BR-05 | `blocked` (a row is `in-progress`) → the loop **stops**, naming the blocking feature and the reason. A serial queue that reports blocked stays blocked until a human acts, so polling it cannot change the outcome. | AC-1.4 |
| BR-06 | `halted` → the loop **stops** and surfaces the halt. This diverges deliberately from `runQueueLoop` (`pdlc/engine/lib/run.mjs`), which continues past a halt because the queue row already records it. | AC-1.5 |
| BR-07 | `idle` → if `docs/_queue/QUEUE.md` carries at least one `awaiting-merge` row, the loop **stops** rather than entering backoff, naming the awaiting-merge features read from the queue file — the `idle` report names features it *skipped* and why (BR-20), but carries no awaiting-merge feature names, so those come from `docs/_queue/QUEUE.md`. Otherwise the loop enters backoff (BR-09), **including** when every candidate was skipped as not ready (BR-20): a queue of only `ready: false` rows backs off and then stops under `idleStopAfter`, because a draft can become ready while the session waits. | AC-1.6, NFR-2 |
| BR-08 | `no-queue` → the loop ends immediately. | AC-2.4 |
| BR-09a | A backoff re-invocation re-runs whatever the queue invocation would run, advisory-seam triage included, so the same unresolved situation **may** append a further entry on each retry. This is intended and the on-disk block count is the honest record of it: BR-15 collapses the recurrences in the view, and the calibration reads the same recurrences the retry policy produced (BR-12, E-26). The loop neither suppresses nor de-duplicates an append. | AC-4.1a, AC-4.5 |
| BR-09 | Consecutive `idle` outcomes that entered backoff wait `loop.backoffSchedule[n]` minutes before iteration *n+1*, the last entry repeating once the schedule is exhausted; after `loop.idleStopAfter` consecutive `idle` outcomes the session ends. Any non-`idle` outcome resets both the counter and the schedule position. | AC-2.1, AC-2.2 |

### Preflight (REQ-LOOP-03)

| ID | Rule | Traces |
|---|---|---|
| BR-10 | Preflight consumes the engine's own startup result — the outcome `pdlc doctor` reports (`cmdDoctor`, `pdlc/engine/bin/cli.mjs`), which prints one `PASS`/`FAIL`/`SKIP` line per rung and, when not ok, the reason plus a remediation line and a non-zero exit code. Preflight consumes that outcome; it never restates or re-implements the engine's checks. The version-reporting preamble is excluded: it always reports rather than refuses (`runVersionDoctor`, cli.mjs). A not-ok startup result is refused a second time, at dispatch: the engine declines the queue invocation and says why (`cmdQueue`, `pdlc/engine/bin/cli.mjs`). That second refusal is the engine's, not the loop's, and holds under every value of `loop.preflight` (BR-11b). | AC-3.1, AC-3.4 |
| BR-11 | Preflight refuses when the consuming repo's working tree carries uncommitted changes to **tracked** files. `loop.dirtyTreePolicy: "any"` widens this to count untracked files too. Ignored files never count under either policy. The check applies to whichever branch the session starts on — the hazard is uncommitted work, not the branch's name. | AC-3.2 |
| BR-11a | A refusal names the failing condition and its remediation, is reported as a state distinct from `idle`, and leaves `docs/_queue/QUEUE.md` byte-identical to its pre-session content. | AC-3.3, NFR-2 |
| BR-11b | Under `loop.preflight: "off"`, both conditions are still **evaluated**; a failing condition produces a warning naming the same condition and remediation a refusal would have named. `"off"` suppresses the loop's own refusal, never the check. Under BR-11's working-tree condition the session then proceeds to iteration 1; under BR-10's not-ok startup result it does not — the engine refuses to dispatch the invocation, so the session ends at zero iterations with the warning emitted and the refusal attributable to the engine. No value of `loop.preflight` makes an unready engine run an iteration. | AC-3.4 |

### Escalations and the operator view (REQ-LOOP-04)

| ID | Rule | Traces |
|---|---|---|
| BR-12 | Every entry carries these seven fields as a **set**: what the operator must decide (one sentence), the feature, the source (advisory seam or pipeline phase), the diagnosis, the evidence, the proposed action where one exists, and a timestamp. Exactly one ordering constraint is normative — the decision sentence is the entry's first prose statement. Field order is otherwise unconstrained, and additional fields are explicitly permitted: the shipped writer (`renderEscalationEntry`, `pdlc/workflows/orchestrate-dev.js`) puts the timestamp in the heading, renders evidence after the proposed action, and adds a refusal-reason, optional root-cause and pipeline-state field. This feature does not rewrite that renderer. | AC-4.2 |
| BR-12a | A non-advisory entry (halt, refused merge) declares a source drawn from a namespace **disjoint** from the advisory seam catalogue, and the consolidation agent's calibration counts advisory entries only — over its whole output, per §3.5's enumeration, not per-seam totals alone. | AC-4.1a |
| BR-13 | Open entries are ordered by descending blocked-feature count (§3.3 V5). Ties break by oldest timestamp first, then by feature name ascending — so one expected sequence is assertable for any given log and queue. | AC-4.3 |
| BR-14 | An entry's status ∈ {`open`, `resolved`, `rejected`} is a **property of the view**, derived from a later decision record naming that entry. The appended block itself is never rewritten to change status. A decision — its outcome, who decided it, when it was decided, and which entry it decides — is recorded durably. | AC-4.2, AC-4.4 |
| BR-15 | Repeated occurrences of the same escalation for the same feature collapse into **one view item carrying an occurrence count**. Collapsing is a rendering operation only: the number of entry blocks on disk is unchanged by it, so the escalation-frequency signal the consolidation agent reads is neither deflated nor inflated by *rendering*. Recurrences the loop's own retry policy produced (BR-09a) are real appends and are counted as such. | AC-4.5 |
| BR-16 | An unparseable block — a missing or duplicated field, or a shape the reader does not recognise — is skipped, reported as a named parse notice carrying enough detail to locate it, and the rest of the log renders. A malformed corpus never refuses the render and never aborts the loop. | AC-4.7 |
| BR-17 | `docs/_queue/ESCALATIONS.md` is created on first escalation. Its absence is an empty view, not an error. | AC-4.6 |
| BR-18 | Escalation entries carry no credential or secret that the redaction check recognises: secret-shaped material reaching an entry's diagnosis or evidence is redacted or omitted before the entry is written, proven positively against known seeded material (AT-34). Material the check does not recognise is a documented residual, not a denial — an unconditional "no entry ever contains a secret" is not assertable by any check, so it is not asserted here. Which material the check recognises, and where the residual is recorded, is the TSPEC's (Q-10). | NFR-5 |

### Boundaries (REQ-LOOP-05, non-functional)

| ID | Rule | Traces |
|---|---|---|
| BR-19 | The loop driver never writes a queue row. Every row write belongs to the queue invocation, which writes and commits the row itself before returning. The driver reads only. Observable: across a loop session, **every** commit touching `docs/_queue/QUEUE.md` is attributable to a queue invocation the session made — zero are attributable to the driver — and a session running zero iterations leaves the file byte-identical. No count-equality is asserted: one row-writing invocation commits the row twice at HEAD (an `in-progress` marker before the pipeline runs, then the terminal `done`/`awaiting-merge`/`halted` status), so commits per invocation is a property of the queue driver, not of this feature. | NFR-2 |
| BR-20 | The loop never sets `ready: true`, under any configuration. A `ready: false` row is **not** an iteration outcome: the queue's outcome set is the closed five of §3.2 (`ran`/`blocked`/`halted`/`idle`/`no-queue`, pinned by the driver's own typedef in `pdlc/workflows/orchestrate-queue.js`), and a not-ready candidate is a **per-candidate skip reason** the invocation records (`skipped`, reason `"REQ not marked ready"`) while the iteration's outcome is `idle`. The session report names each such skipped candidate and its reason (§3.4, "next actionable item"). The row's bytes are unchanged. The draft-protection latch is permanent: no configuration key makes `ready: true` settable by an agent. | AC-5.3, NFR-3 |
| BR-21 | Every gate, guard and prohibition from orders 1–4, **and from the completed `pdlc-engine-distribution`**, holds unchanged inside a queue invocation — with the single exception §5's carve-out grants, which widens `pdlc-engine-distribution`'s file enumerations to cover the files this feature ships, without changing what any gate asserts. The loop decides only *when* to invoke the queue. | NFR-1 |
| BR-22 | Stopping is always cheap and always safe: an `Esc` at any point leaves a consistent state, because the smallest unit that must complete is one queue invocation. | NFR-4 |
| BR-23 | The documented guarded-path set is taken from the merge phase's **effective** guard-path set at render time — the shipped defaults unioned with the repo's configured extras (`effectiveGuardPaths`, `pdlc/workflows/orchestrate-dev.js`; defaults `MERGE_GUARD_DEFAULTS`, orchestrate-dev.js) — never restated as a literal list, which goes stale the first time the set widens. | AC-5.1a |
| BR-24 | This repo configures `pdlc/engine/` as a guard-path extra, so a change to the pipeline's own runtime is operator-approved on whichever channel carries it. The declaration is durable and repo-wide: it lives in a file tracked on this repo's default branch, so every clone and every run of the merge gate resolves the same effective set — a machine-local or untracked declaration would guard the path on one operator's machine only. Durable and repo-wide is this FSPEC's *(addition)*, not AC-5.1a content: AC-5.1a states set-equality with the effective set for the repo it documents at render time, which a machine-local declaration satisfies where it renders. The shipped example configuration is illustrative and is not that home (see BR-29 for what the shipped example carries). Which tracked file carries it is the TSPEC's (Q-07). The extra is not in the shipped defaults, and widening those defaults for every consumer belongs to `pdlc-merge-phase`, not here. | AC-5.1a, REQ §5 |
| BR-25 | The steady-state operator surface is exactly four items: flipping `ready: true` on a REQ, approving a PR that touches a guarded path, resolving open escalations, and product/business-judgment calls outside the pipeline's scope. One-time setup turns are documented **separately** so this set-equality stays true. | AC-5.1, AC-5.2 |
| BR-26a | The loop prompt template ships in the plugin at `pdlc/templates/loop.md`, alongside the queue template already there, and the shipped documentation states how to install it as the repo's default loop behaviour. This is the positive half of AC-1.1; BR-26 is its negative half. | AC-1.1 |
| BR-26 | Installing the loop prompt template is an operator convenience, not a precondition: an operator who runs `/loop run /pdlc:orchestrate-queue` explicitly gets every outcome REQ-LOOP-01…07 requires. No rule in this document depends on the default-prompt convention being honoured. | AC-1.1 |

### Session report and shipped surfaces (REQ-LOOP-06, REQ-LOOP-07)

| ID | Rule | Traces |
|---|---|---|
| BR-27 | The per-iteration line states exactly §3.4's first field set, no more and no fewer fields. | AC-7.1 |
| BR-28 | The end-of-session summary states exactly §3.4's second field set, no more and no fewer fields, and is emitted on **every** stop reason in §3.4's closed stop-reason enumeration — including a preflight refusal, where the iteration count is zero. | AC-2.3, AC-7.2 |
| BR-29 | The shipped example configuration `.claude/pdlc.config.example.json` carries a `loop` section holding BR-01's four keys at their declared defaults. It carries `dispatch`, `advisory`, `implementation` and `learningsInjection` at HEAD and no `loop` or `merge` section; the `merge` section the merge phase declared is added in the same change, so the shipped example is a complete picture of what a consuming repo may configure. | AC-2.1–2.4, REQ-LOOP-02 config preamble |
| BR-30 | The durability documentation states the promotion path for a cadence outliving a session — a Desktop scheduled task (local files, machine must be on) for pipeline work, or a Routine (cloud, fresh clone) for consolidation — and states plainly that `orchestrate-dev` is a poor fit for a Routine, because the pipeline authors specs against a working tree and a Routine has none. | AC-6.2, AC-6.3 |

## Edge Cases and Error Scenarios

| ID | Scenario | Behaviour | Traces |
|---|---|---|---|
| E-01 | Config file absent (first-adoption repo, no `.claude/pdlc.config.json` at all) | All declared defaults apply, the loop runs, the report names state (d) of BR-02 | BR-02, AC-2.5 |
| E-02 | `loop` section present but not an object, or a threshold present with an unacceptable type | Defaults apply for the affected keys, each named in the report; the session runs | BR-02, BR-03 |
| E-03 | `loop.backoffSchedule` is empty, or `loop.idleStopAfter` is `0` | The session ends at the first `idle` that would have entered backoff; it never busy-loops with a zero interval | BR-09 |
| E-04 | A queue invocation throws rather than returning a report | Treated as a stop, not as `idle`: the session ends surfacing the failure, and the consecutive-idle counter is not advanced | BR-04a |
| E-05 | An `idle` outcome while `awaiting-merge` rows exist, but `docs/_queue/QUEUE.md` cannot be read | The loop stops rather than entering backoff — the safe direction, since the reason to stop cannot be ruled out — and the read failure is named | BR-07 |
| E-06 | `docs/_queue/ESCALATIONS.md` absent | Empty view, no error, no file created by the render | BR-17 |
| E-07 | The log contains a block with a duplicated field, or a shape the reader does not recognise | That block is skipped with a locating parse notice; every other block renders | BR-16 |
| E-08 | An escalation append fails | The failure is surfaced in the session report, and the escalating phase's own outcome is unchanged by it | AC-4.7 |
| E-09 | The log contains merge-refusal and halt entries alongside advisory entries | Every part of the calibration a consolidation run reads — per-seam totals, distinct feature counts, entry count, corpus state, and the derived over/tie/under candidate — is identical to what it would be had no non-advisory entry been written (§3.5); the non-advisory entries are still visible in the operator view | BR-12a, AC-4.1a |
| E-10 | An entry names a feature with no row in `docs/_queue/QUEUE.md` | Blocked-feature count 0; the entry still renders and still orders by the tie-breakers | BR-13, AC-4.3 |
| E-11 | An entry's feature declares its dependencies only in REQ frontmatter, with an empty `Depends-On` column | The count uses the union, so the dependents are still counted — a column-only count would under-count a supported declaration form | BR-13, AC-4.3 |
| E-12 | A dependency cycle in the effective dependency graph | The transitive closure terminates and each feature is counted at most once | BR-13 |
| E-13 | Two entries have identical blocked-feature counts and identical timestamps | Feature name ascending decides; the sequence stays deterministic | BR-13 |
| E-14 | The same escalation recurs for the same feature across several sessions | One view item with an occurrence count; the number of blocks on disk is unchanged | BR-15 |
| E-15 | An entry is resolved, then the same escalation recurs afterwards | The later occurrence renders as open; the earlier decision does not suppress it | BR-14, BR-15 |
| E-16 | Working tree dirty only in ignored files | Preflight passes under both `dirtyTreePolicy` values | BR-11 |
| E-17 | Working tree dirty only in untracked files, default policy | Preflight passes; under `"any"` it refuses | BR-11 |
| E-18 | Preflight refuses | Zero iterations run, `docs/_queue/QUEUE.md` is byte-identical, and the refusal is reported as a state distinct from `idle` | BR-11a, NFR-2 |
| E-19 | `loop.preflight: "off"` with a failing engine-readiness check | The warning naming the condition and remediation is emitted, the engine then refuses the dispatch, and the session ends with iteration count 0, zero waits taken and `docs/_queue/QUEUE.md` byte-identical; the stop reason is §3.4's engine-dispatch-refusal member, distinct from a preflight refusal. The check is not skipped and the outcome is stated in positive conjuncts, never as an absence | BR-11b, BR-10, AC-3.4 |
| E-20 | The engine binary is missing or fails to start | Preflight refuses under `"strict"` and warns under `"off"`, in both cases naming the remediation the engine's own output gives; under `"off"` the engine then refuses the dispatch and zero iterations run (E-19) | BR-10, BR-11b |
| E-21 | A candidate row is `ready: false` | The invocation records it as a skipped candidate with the "not ready" reason and the iteration's outcome is `idle`; the session report names the candidate and the reason, the row's bytes are unchanged, and the loop does not flip the latch | BR-20, AC-5.3 |
| E-22 | The operator presses `Esc` mid-iteration | The in-flight queue invocation is the unit that must complete; state stays consistent at any interruption point | BR-22, NFR-4 |
| E-24 | The session's accumulated state is lost mid-run (the host compacts, restarts or resumes the session) | The loop behaves as a fresh session: preflight (§3.1 S1–S3) runs again and the consecutive-idle counter and schedule position restart at zero. The session report names the restart, so a restarted session is distinguishable from one that never accumulated state | §3.1, BR-09 |
| E-25 | The host cannot honour a requested backoff length (it wakes early, late, or on a fixed cadence of its own) | The iteration proceeds and the report states the length actually waited alongside the length BR-09 requested; the loop never treats an unhonoured wait as an error, and never counts a wait it did not take as taken | BR-09, §3.4 |
| E-26 | A backoff re-invocation re-triages a candidate that already escalated, appending a further entry for the same situation | Intended: the append happens, the view collapses the recurrences into one item with an occurrence count, and the calibration reads the recurrences as written. Nothing suppresses or de-duplicates the append | BR-09a, BR-15 |
| E-23 | A stop condition arises that is neither in the steady-state set (BR-25) nor the documented setup list | This is a **defect in the feature**, not an expected mode: the enumerated operator surface is understated and must be corrected | NFR-6 |

## Acceptance Tests

Who / Given / When / Then. Each names the rule and requirement it falsifies.

**AT-01 (BR-04, AC-1.3).** *Operator.* Given a queue whose feature B declares A among its
effective dependencies, When iteration 1 returns `ran` for A with the pipeline's merge status
`merged`, Then iteration 2 picks up B, and no operator input is recorded between the two.

**AT-02 (BR-04, AC-1.2).** *Operator.* Given one iteration, When it runs, Then exactly one queue
invocation is made, without `--loop`, and it returns before the next iteration begins.

**AT-03 (BR-05, AC-1.4).** *Operator.* Given a queue with an `in-progress` row, When an iteration
returns `blocked`, Then the session stops and the report names the blocking feature and the reason.

**AT-04 (BR-06, AC-1.5).** *Operator.* Given an iteration returns `halted`, Then the session stops
and surfaces the halt — and, contrasted against `runQueueLoop`'s continuation on `halted`
(`pdlc/engine/lib/run.mjs`), the two paths differ observably on the same queue state.

**AT-05 (BR-07, AC-1.6).** *Operator.* Given `idle` and at least one `awaiting-merge` row in
`docs/_queue/QUEUE.md`, When the iteration returns, Then the session stops without entering
backoff, and the report names the awaiting-merge features.

**AT-06 (BR-07/BR-09).** *Operator.* Given `idle` and no `awaiting-merge` row, When the iteration
returns, Then the session waits the first `backoffSchedule` interval and runs iteration 2.

**AT-07 (BR-09, AC-2.1/2.2).** *Operator.* Given five consecutive backoff-entering `idle` outcomes
under the declared defaults, Then the waited intervals are **sequence-equal** to the literal
`[5, 15, 30, 60, 60]` minutes — transcribed from BR-01, never computed from the schedule the code
under test reads — and the session ends after `idleStopAfter` (4) consecutive such outcomes. The
observable is the per-iteration line's reported wait (§3.4, E-25), not wall-clock elapsed time.

**AT-08 (BR-09).** *Operator.* Given a `ran` outcome after two `idle` outcomes, Then the counter and
the schedule position both reset, and the subsequent waits are sequence-equal to the literal
`[5, 15, …]` restarted from its first element — the post-reset sequence is asserted as a
transcribed literal, not as "the first interval again".

**AT-09 (BR-08, AC-2.4).** *Operator.* Given `no-queue`, Then the session ends immediately with no
backoff wait.

**AT-10 (BR-02, AC-2.5).** *Operator.* Given each of the four configuration states — absent
section, explicitly-default section, malformed section, absent/unreadable file — Then the declared
defaults apply as a key→default map **set-equal** to the literal
`{backoffSchedule: [5,15,30,60], idleStopAfter: 4, preflight: "strict", dirtyTreePolicy: "tracked"}`
(all four keys, transcribed from BR-01), the loop runs, and the session report names a **distinct**
case for each of the four. The four reported cases are pairwise distinguishable; this is the conjunct that fails if the
reader collapses two states onto one.

**AT-11 (BR-10, AC-3.1).** *Operator.* Given an engine whose startup result is not ok, When the
session begins under `preflight: "strict"`, Then no iteration runs and the refusal carries the
engine's reason and remediation.

**AT-12 (BR-10).** *Operator.* Given an engine whose startup result is ok but whose version
preamble reports a mismatch, Then preflight does **not** refuse on the preamble alone **and**
iteration 1 runs, with the session report positively recording the readiness result as passed and
naming the version mismatch as a notice — the positive conjunct that fails a build in which
preflight was never evaluated at all.

**AT-13 (BR-11, AC-3.2).** *Operator.* Given a tracked file with uncommitted changes, Then
preflight refuses under the default policy; given only untracked files, it passes under the default
and refuses under `"any"`; given only ignored files, it passes under both.

**AT-14 (BR-11a, AC-3.3, NFR-2).** *Operator.* Given preflight refuses, Then
`docs/_queue/QUEUE.md` is byte-identical before and after the session, zero iterations ran, and the
refusal state is distinguishable from `idle` in the report.

**AT-15a (BR-11b, AC-3.4).** *Operator.* Given `preflight: "off"` and a failing **working-tree**
condition, Then a warning naming that condition and the same remediation a refusal would give is
emitted **and** iteration 1 runs.

**AT-15b (BR-11b, BR-10, E-19).** *Operator.* Given `preflight: "off"` and a not-ok **engine
startup** result, Then the warning naming that condition and its remediation is emitted, the
engine's own dispatch refusal is observed and attributable to the engine, the iteration count is
zero and `docs/_queue/QUEUE.md` is byte-identical — four positive conjuncts, never an absence-only
"iteration 1 does not proceed".

**AT-16 (BR-11b).** *Operator.* Given `preflight: "off"` and both conditions holding, Then no
warning is emitted **and** the session report positively records both conditions as
evaluated-and-holding — the second conjunct is what fails a build that skips the checks entirely
under `"off"`, which BR-11b forbids and an absence-only assertion would pass. This is also the
vacuity control for AT-15a and AT-15b.

**AT-17 (§3.1).** *Operator.* Given a session running three iterations, Then the engine-readiness
and tree checks are each evaluated exactly once, before iteration 1.

**AT-18 (AC-4.1, §3.5).** *Operator.* Given an advisory escalation, a refused merge, and a
pipeline halt in one session, Then `docs/_queue/ESCALATIONS.md` carries an entry for each of the
three.

**AT-19 (AC-4.1).** *Operator.* Given the live advisory seam catalogue, Then the set of advisory
escalation sources that append to the log is **set-equal** to the catalogue's membership, computed
by re-enumerating the catalogue rather than comparing against a literal list — **and** both sides
are non-empty: cardinality is at least the advisory tier's own frozen enumeration currently holds,
and at least one named member is present on both sides. Without those conjuncts a catalogue read as
empty makes ∅ = ∅ green with zero sources wired.

**AT-20 (AC-4.1a, E-09, BR-12a).** *Consolidation agent.* Given a log containing advisory entries
and at least one non-advisory entry whose presence would otherwise change the maximum, Then the
calibration's **whole output** over that log equals its output over the same log with every
non-advisory entry removed — per-seam totals, distinct feature counts, entry count, corpus state,
**and** the derived over/tie/under candidate, compared as a whole rather than totals alone — while
the operator view still shows the non-advisory entries. The fixture is constructed so that the naive
reader flips `over` to a non-advisory source (or suppresses it into a `tie`); an oracle over totals
alone passes on that fixture, which is why the derived candidate is the conjunct that bites.

**AT-21 (BR-12, AC-4.2).** *Operator.* Given an entry from each of the three sources, Then the seven
required fields are present, compared as **containment of a literal transcription of BR-12's set**
(so a dropped field reds and the shipped renderer's extra fields do not), and the decision sentence
is the entry's first prose statement. Field order is not asserted beyond that first-field conjunct,
because BR-12 leaves it unconstrained.

**AT-22 (BR-13, AC-4.3).** *Operator.* Given a log of three entries and a queue in which their
features block 4, 1 and 0 downstream features respectively, Then the view's order is exactly
4, 1, 0 — asserted as a full expected sequence, not as a first-element check.

**AT-23 (BR-13, E-11).** *Operator.* Given a dependent that declares its dependency **only** in REQ
frontmatter, Then it is counted; the same fixture counted from the `Depends-On` column alone yields
a strictly smaller number, so the union is what the assertion pins.

**AT-24 (BR-13, E-13).** *Operator.* Given equal counts and equal timestamps, Then feature name
ascending decides the order, and the sequence is stable across renders.

**AT-25 (BR-14, AC-4.4).** *Operator.* Given an entry resolved by a durably recorded decision, Then
the view omits it, the decision's outcome/who-decided/when/which-entry are all four retrievable —
a record missing who decided reds — and the entry's block on disk is byte-identical to before the
decision.

**AT-26 (BR-15, AC-4.5).** *Operator.* Given the same escalation appended three times for one
feature, Then the view shows one item with occurrence count 3 and the file still holds three blocks.

**AT-27 (BR-16, AC-4.7).** *Operator.* Given a log whose second of three blocks is unparseable,
Then blocks one and three render, a parse notice locates block two, and the render succeeds.

**AT-28 (BR-17, AC-4.6, E-06).** *Operator.* Given the log is absent, Then the view is empty, no
error is raised, and no file is created by the render.

**AT-29 (E-08).** *Operator.* Given an escalation append fails, Then the session report surfaces the
failure and the escalating phase's own outcome is what it would have been had the append succeeded.

**AT-30 (BR-19, NFR-2).** *Operator.* Given a completed session of N iterations, Then every commit
touching `docs/_queue/QUEUE.md` in the session's range was produced by a queue invocation — each
carrying that invocation's own commit message form — and none was produced by the driver; a
driver-side write is falsified by a commit in the range that no invocation produced. No
count-equality is asserted (BR-19: a row-writing invocation commits twice). The zero-iteration half
is AT-14's byte-identity.

**AT-31 (BR-20, AC-5.3, E-21).** *Operator.* Given a `ready: false` row, Then the iteration's
outcome is `idle`, the invocation records the candidate as skipped with the "not ready" reason, the
session report names both, and the row's bytes are unchanged — asserted over a bounded configuration
universe: the four pairings of `preflight` ({`"strict"`, `"off"`}) with `dirtyTreePolicy`
({`"tracked"`, `"any"`}), crossed with `backoffSchedule` ∈ {declared default, empty} and
`idleStopAfter` ∈ {declared default, `0`}, plus one unknown-key case — with the result
**set-equal** across all of them. "Every configuration" is unbounded and no
test discharges it.

**AT-32 (BR-23/BR-24, AC-5.1a).** *Operator.* Given this repo's configuration, Then the documented
guarded-path set is set-equal to the merge phase's effective guard-path set computed at render time,
and `pdlc/engine/` is a member of the configured extras while remaining absent from the shipped
defaults — read from the repo's tracked default-branch content rather than the working tree, so an
untracked machine-local declaration (the case BR-24 excludes) reds.

**AT-33 (BR-25, AC-5.1/5.2).** *Operator.* Given the shipped documentation, Then the steady-state
operator surface is set-equal to the four listed items; the setup list is disjoint from that set;
**and** the setup list contains at least AC-5.2's three literal members — installing the engine,
creating `docs/_queue/QUEUE.md` from the shipped template, and installing the loop prompt. Without
the containment conjunct an empty setup list satisfies disjointness.

**AT-34 (BR-18, NFR-5).** *Operator.* Given an escalation whose context is seeded with
secret-shaped material (a token-shaped string in the diagnosis and in the evidence), Then the
appended entry renders that material in its redaction-or-omission form **and** still carries BR-12's
other six fields — redaction proven positively on a known seed, rather than an unfalsifiable
"contains no secret" scan over an arbitrary entry.

**AT-35 (AC-6.1).** *Operator.* Given the durability documentation, Then each `/loop` scope and
lifetime literal it states is transcribed from the runtime's own `/loop` documentation with that
runtime version cited beside it — so the claim is checkable when the runtime changes.

**AT-36 (BR-27, AC-7.1).** *Operator.* Given any iteration, Then its report line's field set is
**set-equal** to a literal transcription of §3.4's per-iteration set (iteration number, queue
outcome, feature picked or "none", merge status, PR URL when carried, wait when a wait was taken,
notices) — so a dropped field, merge status included, reds, while a named notice rides `notices`
and is not a field violation (AT-51 owns the catalogue).

**AT-37 (BR-28, AC-2.3/AC-7.2).** *Operator.* Given a session ending for each stop reason, Then a
summary is emitted in every case and its field set is **set-equal** to a literal transcription of
§3.4's summary set (`notices` included), with the preflight-refusal case reporting iteration count
zero — and the set of stop reasons exercised is **set-equal** to §3.4's ten-member stop-reason
enumeration, so a stop reason added later without a summary reds.

**AT-38 (BR-03, E-02).** *Operator.* Given `loop.idleStopAfter` present as a string and
`loop.backoffSchedule` present as an object, Then each affected key falls back to its declared
default **independently** (the other two keys keep any valid configured value), the report names
each substituted key by name, and the session runs.

**AT-39 (BR-09, E-03).** *Operator.* Given `loop.backoffSchedule: []` or `loop.idleStopAfter: 0`,
When the first backoff-entering `idle` occurs, Then the session ends at that iteration:
exactly one iteration runs after the triggering `idle` — zero, when the triggering `idle` is
iteration 1 — and zero waits are taken, so a zero-interval busy-loop reds on the iteration count
rather than on elapsed time.

**AT-40 (BR-04a, E-04).** *Operator.* Given a queue invocation that throws, Then the session ends
surfacing the failure, no backoff wait is taken, the consecutive-idle counter is unchanged from its
pre-iteration value, and the stop reason is distinguishable from `idle` in the summary.

**AT-41 (BR-07, E-05).** *Operator.* Given an `idle` outcome and a `docs/_queue/QUEUE.md` that
cannot be read, Then the session stops without entering backoff and the report names the read
failure — the safe direction, since an awaiting-merge row cannot be ruled out.

**AT-42 (BR-13, E-12).** *Operator.* Given an effective dependency graph containing a cycle among
queued features, Then the blocked-feature count returns, each feature contributes at most 1, and the
count is bounded above by the number of non-`done` rows.

**AT-43 (BR-14/BR-15, E-15).** *Operator.* Given an entry resolved by a durably recorded decision and
then the same escalation appended again for the same feature, Then the view shows one **open** item,
its occurrence count is that of the on-disk recurrences (BR-15 counts occurrences of the same
escalation for the same feature, and a decision neither resets nor suppresses that count), the
earlier decision is still retrievable, and every block on disk is byte-identical.

**AT-44 (BR-10, E-20).** *Operator.* Given the engine binary is missing or fails to start, Then
under `preflight: "strict"` zero iterations run and the refusal names the engine's own remediation;
under `"off"` a warning naming the same remediation is emitted, the engine's dispatch refusal is
observed, and the iteration count is still zero (AT-15b) — the engine is never faked to let an
iteration run.

**AT-45 (BR-26a, AC-1.1).** *Operator.* Given the shipped plugin, Then `pdlc/templates/loop.md`
exists and the shipped documentation contains an install instruction naming that path — the positive
half AT-35's siblings leave unasserted, since BR-26 asserts only that installing is optional.

**AT-46 (BR-29).** *Operator.* Given `.claude/pdlc.config.example.json`, Then its top-level section set
**contains** `loop` and `merge` and HEAD's four existing sections (`dispatch`, `advisory`,
`implementation`, `learningsInjection`), and the `loop` section's key→value map is **set-equal** to
BR-01's four declared keys at their declared defaults — the file is shared, so a fifth section
shipped by another feature must not red this feature's test.

**AT-47 (BR-30, AC-6.2/AC-6.3).** *Operator.* Given the durability documentation, Then it names both
promotion paths with their stated trade-offs (Desktop scheduled task — local files, machine on;
Routine — cloud, fresh clone) **and** states that `orchestrate-dev` is a poor fit for a Routine,
giving the working-tree reason. Asserted as content containment over the shipped file, not presence
of a heading.

**AT-48 (§3.1, E-24).** *Operator.* Given a session whose accumulated state is discarded after
iteration 2 and which then continues, Then preflight is evaluated a second time, the idle counter and
schedule position restart at zero, and the report names the restart — the observable that lets AT-17
assert "exactly once per session" without it being unfalsifiable across a restart.

**AT-49 (BR-09, E-25).** *Operator.* Given a host that returns from a requested 15-minute wait after
a different length, Then the iteration proceeds, the report states both the requested and the actual
length, and the schedule position advances exactly once — the wait is never counted twice and never
treated as an error.

**AT-50 (BR-09a, BR-15, E-26).** *Operator.* Given a candidate that escalates on triage and a session
of three backoff-entering `idle` iterations over an unchanged queue, Then three blocks exist on disk,
the view shows one item with occurrence count 3, and the calibration's per-seam total for that seam
is 3 — the appends are neither suppressed by the loop nor deflated by the view.


**AT-51 (§3.4).** *Operator.* Given a session exercising every notice-raising condition, Then the
set of notice codes the report can carry is **set-equal** to a literal transcription of §3.4's
ten-code catalogue, each carrying the subject its rule names — so a code outside the catalogue, or
a catalogue code no condition raises, reds.

**AT-52 (BR-21, REQ §5 carve-out).** *Operator.* Given an engine installed from the published
package rather than from a checkout, When the operator runs a loop session, Then it starts and
iterates — no shipped file this feature adds is missing from the installed engine — and, over the
diff to each distribution/release-gate enumeration and each approved `pdlc-engine-distribution`
table it must agree with, every pre-existing member is still present and unaltered **and nothing
the gate asserts changed other than that enumeration's membership** — so an edit to a comparison, a
normalisation or a derived count reds — making the change provably additive.

## Open Questions

Routed downstream rather than decided here; each names its owner. The REQ's own obligations O-1…O-5
are carried forward unchanged and are not restated; O-6 is discharged at REQ v1.6, and citations of
it re-point to AC-2.5.

| ID | Question | Owner |
|---|---|---|
| Q-01 | How the merge-refusal and pipeline-halt sources reach `docs/_queue/ESCALATIONS.md` (§3.5) — through the existing writer or a sibling one, and where the halt append sits relative to the queue's status write — is a contract question, not a requirements one. | TSPEC (REQ O-2, O-3, O-5) |
| Q-02 | Where the decision record BR-14 requires lives, and how a decision names the entry it decides, given that no block on disk may be rewritten. | TSPEC (REQ O-3) |
| Q-03 | How the loop reader obtains BR-02's fourth distinction, given that the sibling section reader this config file ships (`readEngineConfig`) distinguishes three states. AC-2.5 decides that the fourth distinction *extends* that precedent and that no divergence from any sibling reader is required, so what remains is the residual: how the extension is obtained. | TSPEC (REQ AC-2.5) |
| Q-04 | Which field of the queue report AT-01 reads the merged status from, given that `buildQueueReport` (`pdlc/workflows/orchestrate-queue.js`) projects no top-level merge field and the merge fields ride the nested pipeline report (`pdlc/workflows/__tests__/mergeQueueDriver.test.js`, "pass-through of the merge fields"). | TSPEC (REQ O-1) |
| Q-05 | At what level AT-01's two-report sequence is exercised, and whether it runs in CI. | TSPEC (REQ O-1) |
| Q-06 | The exit-code and field contract preflight consumes from the engine's readiness command. | TSPEC (REQ O-4) |
| Q-07 | On which mechanism this repo's `pdlc/engine/` guard-path extra is declared so that BR-24's tracked, repo-wide home exists — no tracked channel carries it at HEAD, since the per-repo config file is untracked and the shipped example configuration is excluded (BR-24), so this is mechanism selection, not filename selection — and how AT-32 reads the effective set at render time without restating it. | TSPEC |
| Q-08 | Where the session-scoped state §3.1 names — the once-per-session preflight marker, the consecutive-idle counter and the schedule position — is held, given that BR-19 forbids the driver a durable write and none of the durable files it does read carries session state — `.claude/pdlc.config.json` (BR-01), `docs/_queue/QUEUE.md` (BR-07) and `docs/_queue/ESCALATIONS.md` (BR-16, BR-17). E-24 fixes the *behaviour* when that state is lost; the holding mechanism is a contract question. | TSPEC / DECISIONS |
| Q-09 | Which reader BR-16's parse-notice rule governs — the loop's own view reader only, or also `parseEscalations` (`pdlc/workflows/consolidate-learnings.js`), which drops an unrecognised block silently and emits no notice. If the two disagree on "unparseable", AT-27 and AT-20 can diverge on one corpus. | TSPEC |
| Q-10 | Where BR-18's residual — secret-shaped material the redaction check does not recognise — is recorded. | TSPEC (residual) |

**Assumptions** (visible so they can be vetoed):

- **A-01.** "Consecutive `idle`" in BR-09 counts only `idle` outcomes that entered backoff; an
  `idle` that stopped the session under BR-07 ends the session and never advances the counter.
- **A-02.** A queue invocation that throws (E-04) is a stop rather than an `idle`; the REQ
  enumerates outcomes of a *returned* report and is silent on a throw.
- **A-03.** The blocked-feature count (§3.3) counts distinct features, not paths through the
  dependency graph.

