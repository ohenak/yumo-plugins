# PROPOSAL — orchestrate-dev optimization

| Field | Value |
|---|---|
| Status | draft, for operator discussion |
| Author | Claude |
| Date | 2026-08-02 |
| Evidence base | The manual pdlc-merge-phase run of 2026-08-02 (Claude as orchestrator, PR #30), the abandoned `pdlc-rcv` family's LEARNINGS, `docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |
| Feeds | Queue rows 14 (`pdlc-advisory-tier`) and 16 (`pdlc-engineering-loop`); the closed-loop rewrite |

> **Goal.** Make `orchestrate-dev` more flexible, simpler, and more compact while making it a
> *truly* closed-loop engineering workflow — one where every signal a phase produces has a
> consumer, and nothing waits on a human unless a human is genuinely the only correct decider.
> Every proposal below is grounded in something measured, not something imagined.

## 1. What the manual run measured

The same pipeline the script encodes was run by hand, phase for phase, with one deliberate
difference per mechanism. The deltas are the argument:

| # | Script today | Manual run did instead | Measured effect |
|---|---|---|---|
| M-1 | Every review round dispatches fresh reviewers who re-review the whole document | Round 2+ reviewers were re-invoked **with their own round-1 context** and told: *"judge only whether your blocking findings are resolved, and whether the revision broke anything — convergence is the goal"* | Every document converged in 2–3 rounds against a budget of 5. The `pdlc-rcv` family's 9-round non-convergence (each round filing new findings in the text that answered the old ones) never appeared |
| M-2 | Every revision re-dispatches the author fresh; it re-reads everything | One **persistent author session per document** (FSPEC/TSPEC/PLAN shared one; PROPERTIES its own), resumed with each round's findings | Revision dispatches were dramatically cheaper and never re-litigated settled decisions. The author also caught its *own* cross-round inconsistencies (e.g. retiring `7d-unknown` for `13a`) because it remembered writing them |
| M-3 | Creator/reviewer prompts name documents only | Every dispatch carried a **grounding manifest**: named code files and symbols to verify claims against | The highest-value findings of the whole run came from grounding, not from document reading: `runPicked` overwrites the pipeline's own status write; `commitQueueRow` reports `"halted"` for any write; the post-merge checkout would strand the queue commit; `parsePlanTasks` mis-parses both shipped PLANs |
| M-4 | A downstream doc that finds an upstream defect has no channel; the upstream doc's approval simply goes stale | An explicit **erratum protocol**: the downstream author lists errata; the upstream author applies a *targeted versioned edit*; the upstream approvers **confirm the delta** rather than re-reviewing | Three FSPEC errata from the TSPEC and one from PLAN were absorbed in one targeted round each. No approval was silently invalidated and no full re-review was paid |
| M-5 | Phase I dispatches parallel worktree agents and merges branches back | Same-tree waves with a **file-ownership manifest** (no two tasks in a wave touch the same file), pathspec-scoped commits, and one dist-rebuild owner per wave | Zero merge conflicts across 12 waves. Two real harness failures surfaced instead: agents stalling after backgrounding their own test run, and agents dying on resume — both cured by the orchestrator owning the gate (below) |
| M-6 | The implementing agent runs the test gate and self-reports | The **orchestrator ran the full suite itself** between waves and told agents "your work is green — commit" | No agent ever shipped on a self-reported green; the two agent deaths cost nothing because the orchestrator could commit their staged, verified work |

## 2. Design principles for the rewrite

1. **The loop closes on signals, not on phases.** A phase is just a producer of typed signals
   (finding, approval, erratum, halt, mergeStatus). The script's job is routing every signal to
   its consumer. Anything with no consumer is waste; anything consumed by "a human, later" must
   be an explicit, named handoff (today: PR merge, POSTMORTEM resolution — and nothing else).
2. **Delta-scoped by default.** Full evaluation happens once per artifact; everything after is
   scoped to a delta (a revision, an erratum, a remediation). This is the single biggest
   convergence lever (M-1, M-4) and costs one prompt-template change.
3. **Sessions are state.** Authors and reviewers are resumable sessions, not stateless
   dispatches (M-2). The round window on disk stays the durable record; the session is the
   cheap path when it is alive, and the disk record rebuilds context when it is not.
4. **Ground everything.** Every dispatch carries a machine-assembled grounding manifest (M-3).
5. **The orchestrator owns gates.** Agents produce diffs; the script verifies them (M-6).
   No agent's self-reported green is ever load-bearing.
6. **Keep what is proven.** Pacing contract, append-only review files, content-addressed round
   derivation, structural completeness gates, POSTMORTEM lifecycle, the drift gate, size
   budgets, Phase MERGE's decision ladder — none of these change. They are the parts that
   never failed.

## 3. The proposed shape

### 3.1 One convergence primitive instead of five phase bodies

Today `main()` repeats the same ~40-line creator/reviewLoop/checkConverged block for R, F, T,
D, P and PR. Replace all of them with one primitive:

```
converge({ artifact, creator, reviewers, inputs, grounding })
  1. author        — creator session writes/revises the artifact (pacing contract as today)
  2. review        — round 1: full parallel review (as today)
  3. verify-delta  — rounds 2+: each reviewer resumed with its own prior review, scoped to
                     "are your blockings resolved; did the delta break anything"
  4. erratum       — a reviewer/author may emit `ERRATUM: {upstreamDoc, items}`; the loop
                     routes it to the upstream author for a targeted versioned edit, then a
                     delta-confirmation from that document's approvers (bounded: one erratum
                     round per upstream doc per phase, else halt to POSTMORTEM)
  5. stop          — dual approval, or budget exhausted → POSTMORTEM (unchanged)
```

The phase table then shrinks to data: `PHASE_DISPATCH` already is that table — the rewrite
deletes the five copied bodies, not the table. Estimated net effect on `orchestrate-dev.js`:
several hundred lines removed, one new ~150-line primitive.

### 3.2 Compress the phase graph

| Today | Proposed | Why |
|---|---|---|
| T then conditional D | **T absorbs D** — the DECISIONS trailer already decides it; when warranted, DECISIONS is authored *inside* Phase T by the same session and reviewed in the same window | The T and D reviewer sets are identical; the split buys one extra full loop for a document the T author drafts mentally anyway |
| I then PT | **PT becomes I's final wave** (V-wave), with the PROPERTIES suite as its gate | PT today is one more agent dispatch + gate with no distinct review; the PLAN's V1 task already models this correctly |
| CR then DOD | **Unchanged — kept as two separate gates** (operator decision, 2026-08-02). CR reviews the diff from the product/testing lenses; DOD stays a distinct final gate for integration checks — wiring, sync state, consumer-copy drift, doc/boundary consistency — with its own verify→remediate budget. Both loops still become delta-scoped on re-verification (M-1 applies to their round 2+), which is where this run's savings actually came from | Past experience: CR misses the integration checks DOD performs; a merged loop risks reverting to that. This run agrees in the specifics — DoD v1's real findings (stale consumer sync, vacuous cross-feature test constants, six drifted doc sites) were all things the CR lenses had not looked for |
| H, PUB, MERGE | Unchanged | PUB/MERGE just landed; H's guard-hook contract is proven |

Result: **R → F → T(+D) → P → PR → I(+PT) → CR → DOD → H → PUB → MERGE** — two fewer
phase bodies, no lens lost, and DOD's integration gate intact.

### 3.3 Implementation phase: waves over worktrees

Adopt the manual run's protocol as the scripted one:

- The PLAN's **file-ownership manifest becomes a parsed contract** (like the task table), and
  the script *derives* waves = topological batches ∩ ownership-disjoint sets. A PLAN whose
  manifest and task table disagree is rejected at Phase P, not discovered at Phase I.
- Same-tree execution, pathspec-scoped commits, dist rebuild owned by the script between waves
  (M-5). Worktrees remain available for genuinely overlapping tasks but stop being the default
  — this repo's merge-back machinery (`mergeWorktree`, conflict halts) becomes the exception
  path.
- **The script runs the gate**: after each wave it executes the suite through an IO call and
  only then instructs commits (M-6). The 180-second watchdog stops mattering for gates because
  no agent waits on a test run.
- **Fix `parsePlanTasks`**: anchor the header grammar (exact-cell match on `Task ID` /
  `Dependencies`, not substring), and add the completed-PLAN regression fixtures that today
  mis-parse to 289/247 tasks. Phase P's authoring gate runs the real parser over the candidate
  PLAN — the PLAN author did this by hand this run and caught the hazard; make it mechanical.

### 3.4 Grounding manifests

Each `PHASE_DISPATCH` entry gains a `grounding` field: repo paths/symbols the creator and
reviewers must verify claims against (for pdlc itself: the workflow scripts, the queue
helpers, build-runtime, the adapter). The prompt builder appends it as a "verify against
code, cite file:line" clause. Reviews that carry code citations were consistently the ones
whose findings survived verification (M-3); reviews without them were the ones that
over-claimed (both DoD doc-wording rounds).

### 3.5 Oracle-quality rules, promoted into the review prompts

Three defect classes from this run recur often enough to be standing review-prompt clauses
(cheap: prompt text only):

- **No implementation echoes** — an expectation may not import the constant it asserts
  (the `MERGE_ESCALATIONS` garble survived ~3,000 tests until literal anchors landed).
- **No absence-only oracles** — every negative assertion pairs with a positive conjunct on the
  same path (AT-M3's redesign).
- **Completeness counts, not containment** — enumerated contracts (row tables, catalogues)
  need a set-equality self-count so deleting a case reds the suite.

### 3.6 What explicitly does not change

Pacing contract and byte caps; append-only, content-addressed review windows
(`deriveRoundWindow`); structural completeness gates (`isComplete`); approval anchors and the
staleness gate; POSTMORTEM fail-closed lifecycle; the queue drift gate; REQ size budgets;
model pinning (Opus for spec/review, Sonnet for implementation waves — exactly what this run
used); Phase MERGE's no-LLM decision ladder and its no-override guard.

## 4. Sequencing

| Step | Change | Risk | Depends on |
|---|---|---|---|
| 1 | Delta-scoped rounds + persistent sessions in `reviewLoop` (M-1/M-2: prompt + dispatch changes, no phase-graph change) | Low | — |
| 2 | Grounding manifests + oracle-quality clauses (prompt-only) | Low | — |
| 3 | `parsePlanTasks` grammar fix + PLAN self-parse gate | Low | — |
| 4 | Wave-based Phase I with script-owned gates | Medium | 3 |
| 5 | `converge()` primitive; delete the five phase bodies | Medium | 1 |
| 6 | Phase-graph compression (T+D, I+PT — **not** CR+DOD, per §5 decision 3) | Medium | 5 |
| 7 | Erratum protocol as a first-class signal | Medium | 5 |

Steps 1–3 are independently shippable and carry most of the measured win; they should land
before row 14 (`pdlc-advisory-tier`) runs, so the advisory tier is specified against the loop
it will actually live in. Steps 5–7 are the `pdlc-engineering-loop` (row 16) rewrite proper.

## 5. Operator decisions (resolved 2026-08-02)

1. **Session persistence limits — accepted as proposed.** Attempt persistent sessions (M-2);
   where the workflow runtime cannot resume an agent, fall back to M-1 without M-2 —
   delta-scoped prompts over fresh dispatches, which carries most of the win on its own.
2. **Erratum bound — accepted as the shipped constant.** One erratum round per upstream doc
   per phase; exceeding it halts to POSTMORTEM. Not config — a knob here is a knob that gets
   turned mid-run.
3. **CR+DOD merge — rejected.** CR and DOD stay separate gates. Rationale (operator): past
   experience is that CR misses the integration checks DOD performs, and a combined loop
   risks reverting to that behavior. The evidence from this run supports it — DoD's real
   findings (stale consumer sync, vacuous cross-feature test constants, drifted doc sites)
   were categories the CR lenses had not looked for. §3.2 and §4 step 6 are amended
   accordingly: both loops still gain delta-scoped re-verification, but their checklists,
   findings files and budgets remain distinct.
