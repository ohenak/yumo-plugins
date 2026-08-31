# DESIGN — The minimal pdlc loop (2026-08-30)

Status: design, not a decision record. Successor to
`docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` (§0 moves M1–M6): M1–M3
shipped as `pdlc-loop-economics`; M4 REQ in flight (`docs/pdlc-decision-ledger/`). This
document answers three questions the proposal did not: what the *end state* looks like, why
the artifact store stays in-repo rather than GitHub Issues, and how the pipeline keeps
learning without growing.

## 1. What the evidence says quality is made of

Across two repos, fourteen features, ~600 cross-review files:

1. **Mechanical gates converge; open-ended review does not.** DoD (fixed checklist against a
   diff) closed in 2 rounds on the same feature whose document phases all hit the 15-round
   lifetime cap. `pdlc-engineering-loop` recorded 114 approving verdicts on the way to four
   capped documents. The cap did the converging, not the reviewers (DEC-TERM-01's origin).
2. **Rounds past ~3 buy bookkeeping, not fidelity.** The dominant round classes were pin
   re-confirmation, stale-hash re-filing (54× one finding), and re-litigation of closed
   decisions — none of them spec content. Process artifacts ran 5.6× the specification bytes.
3. **Fidelity failures that were actually caught were caught by executable checks** — DoD's
   stub/mock/coverage scan, document oracles, the fail-closed FINDING grammar, tests and
   properties — not by late review rounds.

Design principle that falls out: **spend judgment once, early, and record it; spend the rest
of the budget on executable verification of the diff against the spec.** Review rounds are a
cost center to be bounded, not the quality mechanism.

## 2. Store decision: docs stay in-repo; GitHub Issues is not adopted

The proposal already rejected the wayfinder map issue (§4e); this generalizes that to the
whole artifact set. Reasons, in order:

- **Every mechanical gate is content-addressed over bytes on disk** — approval hashes,
  UPSTREAM-STATE staleness walks, `deriveRoundWindow`, document oracles, the drift gate.
  Issues have no stable byte identity; moving to a tracker forfeits the strongest quality
  layer the pipeline has.
- **Atomicity.** A commit couples spec, decision, code, and dist rebuild. Tracker state is
  non-atomic with the tree and can't be bisected, branched, or reverted with it.
- **Unattended operation.** wayfinder expects concurrent human sessions editing the tracker;
  pdlc is `/loop`-driven and unattended. A tracker adds auth, network, and rate limits as new
  halt classes with zero offsetting judgment.
- **Portability.** "Any repo following the convention" is satisfied by files + config alone;
  a tracker requirement would make host, org permissions, and API tokens part of the contract.

One optional, additive concession: escalation rows (`docs/_queue/ESCALATIONS.md`) MAY be
mirrored to GitHub Issues for operator visibility. Mirror only — the file remains the truth,
and mirroring failure is a notice, never a halt.

## 3. Target pipeline: three tiers, one spine

Tier is classified at intake from REQ size, file-ownership breadth, and dependency count
(proposal R3-3/M6); recorded in REQ frontmatter (`tier: S|M|L`); default M; escalation is
one-way (any reviewer may raise the tier, none may lower it).

| Phase | S | M (default) | L |
|---|---|---|---|
| SPEC (REQ+FSPEC merged) | one doc, ≤1 review round | one doc | separate REQ + FSPEC |
| Phase G — bounded grilling | — | ≤2 rounds | ≤3 rounds |
| TSPEC+PLAN | merged, one doc | merged, one doc | separate |
| DECISIONS doc | never (ledger rows only) | ledger rows only | full doc |
| PROPERTIES | never | on trigger only¹ | always |
| Implement (TDD waves) | unchanged | unchanged | unchanged |
| Verify — two-axis DoD² | always | always | always |
| Ship (PR, CI gate, merge) | unchanged | unchanged | unchanged |

¹ Trigger: the feature contains an algorithmic or stateful core (parser, scheduler, money
math, concurrency) rather than wiring/config/docs. The trigger fires from TSPEC review — a
reviewer names the core; absence of a naming means no PROPERTIES doc.
² R3-4: pm lens → Spec axis, te lens → Standards axis, run in parallel with the DoD scan,
reports aggregated verbatim under separate headings, never merged or re-ranked. This retires
the standalone CR phase and **requires an explicit operator re-decision** (it contradicts a
standing one) — it is the only row of this table that does.

**Phase G** (proposal R3-1/§4a–b) is the load-bearing simplification: discovery moves in
front of authoring instead of leaking into review rounds 2–15. Grillers (pm-review,
te-review) interrogate the approved SPEC in numbered frontier rounds with recommended
answers; the grillee answers only from the authority ladder — (1) the SPEC text, (2)
`docs/_constraints/` + `docs/_decisions/`, (3) code, verified with file:line — or emits
ESCALATE. Every resolved question becomes a decision-ledger row. Cost bound ≤8 dispatches.
Downstream authoring then runs to-spec style: pure synthesis, zero discovery, existing seams
preferred.

**The decision ledger (M4) is the spine.** Every review dispatch carries the
one-line-per-closed-decision index; re-opening a closed decision requires a High finding
citing new evidence and naming the decision id; the dedupe key for re-litigation and
staleness re-filing is the same id (R1-4 and R3-2 are one mechanism). With M1 (anchors and
round indices derived from the tree, never hand-copied) and M2/M3 (pin-check rounds,
derivative stop) this removes every observed non-substantive round class.

**Review loop end state, once validated:** derivative stop and pin-check default-on, verdict
line required for a round to count (R1-5), FINDING-grammar parse errors returned in-round
before failing closed (R1-6), split-halt after one High blocks the same document twice
(R2-5), REQ ≥90%-of-ceiling mechanical relocation (R2-6), fail-closed Scope gate (R2-7).
Per-invocation cap drops from 5 to 3 and the lifetime cap from 15 to 8 — with a working stop
condition, the cap is a tripwire, not the convergence mechanism, and a document that hits 8
rounds is evidence for a split, not for round 9.

## 4. CLI surface (complete)

```
pdlc init                  # scaffold docs/_queue, _decisions, _constraints, config in a new repo
pdlc dev <spec-path>       # run one feature through the tiered pipeline
pdlc queue [--loop]        # serial, dependency-ordered multi-feature driver
pdlc decide ...            # resolve/reject an escalation row
pdlc stats [feature]       # measure: rounds, dispatches, payload bytes, halts — from artifacts
pdlc doctor                # environment/config diagnosis
```

`init` and `stats` are the two additions; both are mechanical. `stats` implements the
proposal §5 measurement plan (round counts from `CROSS-REVIEW-*-v{N}` basenames, payload from
`report.learningsInjection`, halts from POSTMORTEM files) — no new instrumentation, the
artifacts are the log. Everything else — tier classification, Phase G, the ledger — lives
inside `pdlc dev`; the operator surface does not grow.

## 5. The self-improvement loop, with a simplification bias

The repo already has the open half of a learning loop: LEARNINGS per feature →
`harvest-learnings` → `consolidate-learnings` → learnings-injection into authoring
dispatches. Three additions close it and force it to trend simpler:

1. **Learnings graduate into mechanism, not prose.** The injection corpus is a holding pen.
   At consolidation, each recurring learning is classified: *decision* → ledger row
   (enforced by never-re-litigate, then deleted from the injected corpus), *constraint* →
   `docs/_constraints/` (read by dispatch, deleted from corpus), *mechanism* → an engine
   issue on the queue (this is how M1–M4 themselves were produced — the loop has already run
   twice). A learning that becomes a gate stops costing prompt bytes forever. The existing
   injection budgets (20 KB total) stay fixed: they are the forcing function — new learnings
   displace old ones, so consolidation must distill or promote, never accrete.
2. **Measurement closes the loop.** After each feature, `pdlc stats` output is appended to
   the feature's LEARNINGS metadata (rounds per document, dispatch count, process-to-spec
   byte ratio). Consolidation compares against the rolling baseline; a regression (rounds
   up, ratio up) is itself a harvestable finding with the offending phase named. The
   pipeline's own drift becomes a first-class defect class.
3. **Every flag has a death date.** A config gate (M2, M3, and each future one) exists only
   to run the one-feature experiment discipline of §6. After a measured win it defaults on
   and the gate is deleted next minor version; after a measured loss the code is deleted.
   Recorded as a decision row at flag introduction (`DEC-…: gate X retires by 0.(N+2)`), so
   the ledger itself enforces that the config surface shrinks back. Same rule for phases:
   any phase whose `pdlc stats` contribution is ~zero across 3 consecutive features is
   nominated for removal at consolidation.

Net effect: the system that reviews features also reviews itself, on the same artifacts,
through the same queue — and its knowledge store is byte-capped, so learning is forced to
take the form of deletion (of rounds, flags, phases, prompt bytes) rather than accumulation.

## 6. Unattended halt resolution — `queue.autoResolve`

Today a POSTMORTEM halt is terminal for the queue: the driver never re-picks a `halted` row,
and workflow scripts never write `RESOLVED: yes`. The invariant behind that —
**the loop that produced the halt never clears it** — binds the *review loop*, not the queue
driver, which is a different loop with fresh context. That reading permits an in-engine
resolution phase without weakening attribution:

On `report.outcome === "halted"`, instead of only recording the row, the queue driver runs a
bounded remediation cycle:

1. **Classify.** Parse the POSTMORTEM's phase and `## Recommendation`. Only the automatable
   classes proceed: review-cap non-convergence and mechanical-precondition halts. Erratum R4
   halts, guard-fired merges, `MERGE ESCALATION:` conditions, split recommendations, and any
   unparseable POSTMORTEM stay human — fail closed to today's behaviour.
2. **Remediate.** Dispatch a fix agent (se-implement / pm-author shape, per the phase that
   halted) scoped to the Recommendation findings only.
3. **Verify and clear.** Dispatch a *separate* verifier agent that checks each finding is
   addressed on the branch and, only then, writes `RESOLVED: yes` in a commit naming every
   addressed finding — the same evidence obligation the contract puts on a human. Fixer and
   verifier are never the same dispatch.
4. **Re-queue.** Flip the row `halted → pending`; the normal picker re-enters the feature on
   a later iteration, and the re-invoked phase re-derives everything from the tree (M1 makes
   this safe — no carried prompt state to go stale).

Budgets, in the M2/M3 config pattern (`queue.autoResolve`, default **false**, per-key
fail-open): `maxAttemptsPerPostmortem` (default 1) and `maxResolutionsPerFeature`
(default 2). Exhaustion leaves the row `halted` and appends an escalation row — the human is
the backstop, not the loop. Every auto-resolution is a `pdlc stats` line (feature, phase,
attempts, outcome), so §5.2's measurement decides whether it defaults on.

Sizing note: with M1–M4 landed, cap-halts should become rare — auto-resolve is the backstop
that makes `pdlc queue --loop` genuinely unattended, not the mechanism that does the
converging. If stats ever show it firing routinely, that is a §5.2 process regression to
diagnose upstream, not a budget to raise.

## 7. Explicitly not adopted

| Mechanism | Verdict |
|---|---|
| GitHub Issues as artifact store | Rejected (§2); optional escalation mirror only |
| wayfinder map issue / one-ticket-per-session | Rejected (§4e of proposal) — QUEUE.md + ledger already are the map; session-sizing caps throughput at operator attention |
| HITL grilling verbatim | Adapted — authority ladder replaces the human (§3) |
| grill-with-docs wrapper | Rejected — it is two Skill calls and a name; the components (Phase G, glossary) are adopted directly |
| prototype as a standing phase | AFK spike ticket only, when a decision would otherwise argue from intuition |
| Relaxing any fail-closed gate | Out of scope permanently (proposal §6) |

## 8. Rollout order (one-feature experiments, measured by `pdlc stats`)

1. **Land M4** (decision ledger — REQ in flight). Highest leverage: kills the re-litigation
   class and is the spine everything else references.
2. **`pdlc stats`** (small, mechanical) — must exist before experiments, or nothing is
   attributable. Then enable **M2 + M3 on one experiment feature**; on a measured win,
   default-on with retirement dates per §5.3.
3. **R1-5 + R1-6 + R2-5 + R2-6 + R2-7** — small always-on/fail-closed tightenings, one
   feature, no config gates needed.
4. **`queue.autoResolve`** (§6) — config-gated off, one-feature experiment on a consumer
   repo queue; needs `pdlc stats` (step 2) live first so resolution attempts are attributable.
5. **Phase G** on one M-tier feature (High risk per proposal; the experiment is cheap: ≤8
   dispatches, and a failed experiment leaves a decision ledger, not damage).
6. **Size tiers + document merges** (S first — `pdlc-rcv-budget-stop` is the archetype S
   feature that paid for six documents).
7. **Two-axis DoD (R3-4)** — last, because it needs the operator re-decision.
8. **`pdlc init`** — whenever a second consuming repo wants onboarding; independent of 1–7.

Each step is one queue feature following the pipeline it improves, with LEARNINGS harvested
into the next — the loop of §5 applied to itself.
