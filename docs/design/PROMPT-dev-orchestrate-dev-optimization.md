# Kickoff prompt — implement the orchestrate-dev optimization

> Paste into a clean session (or just say: *"Read docs/design/PROMPT-dev-orchestrate-dev-optimization.md and begin"*).

---

## Mission

Implement `docs/design/PROPOSAL-orchestrate-dev-optimization.md` in full. You (Fable) are the
architect and orchestrator: you plan, design, decompose, sequence, review, and run the gates.
You do not write the bulk of the code yourself — delegate implementation to subagents, picking
the model by complexity:

- **Opus** — anything subtle or cross-cutting: the `converge()` primitive, `reviewLoop`
  surgery, the erratum protocol, phase-graph changes in `main()`, bundle/entry work in
  `build-runtime.mjs`, anything touching `runtimeBundle.test.js`'s structural assertions.
- **Sonnet** — well-specified mechanical work: prompt-template edits, test authoring against a
  written contract, fixture updates, the `parsePlanTasks` grammar fix, doc updates.

**Do NOT use the PDLC pipeline this round** — no `/pdlc:orchestrate-dev`, no REQ/FSPEC/TSPEC
authoring, no cross-review files. The proposal document is the spec. PDLC resumes for queue
row 14 (`pdlc-advisory-tier`) after this work lands.

## Preconditions (verify before any work)

1. You are on `main`, up to date with origin, and PR #31 has merged — the proposal must exist
   at `docs/design/PROPOSAL-orchestrate-dev-optimization.md` on main. If it does not, stop and
   tell Kane.
2. `cd pdlc/workflows && npm test` — expect green except `documentOracles` AT-22, an
   environmental false positive from the untracked `.tokensave/tokensave.db` (documented in
   CLAUDE.md; green in CI). Any other red: stop and report.

## Read before planning

- `docs/design/PROPOSAL-orchestrate-dev-optimization.md` — the spec. §5's three operator
  decisions are binding; in particular **CR and DOD stay separate gates, never merged**.
- `CLAUDE.md` — repo conventions, especially the workflow-runtime constraints, the review-loop
  mechanics, and the CI section.
- `docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` — the evidence base.
- `pdlc/workflows/orchestrate-dev.js` — at minimum: `reviewLoop`, `PHASE_DISPATCH`,
  `dispatchAndVerify`, `main()`'s phase bodies, `parsePlanTasks`, and the Phase MERGE region.

## Delivery plan — three slices, one PR each

Sequence per the proposal's §4. Each slice is its own branch (`feat-odev-opt-a/b/c`) and PR,
fully green before the next starts. Do not auto-merge PRs — Kane merges.

- **Slice A (steps 1–3, low risk):** delta-scoped review rounds + persistent/resumable
  author-reviewer dispatch in `reviewLoop` (fall back to delta-scoped prompts over fresh
  dispatches where the workflow runtime cannot resume a session); grounding manifests as a
  `PHASE_DISPATCH` field threaded into prompts; the three oracle-quality clauses in reviewer
  prompts; `parsePlanTasks` anchored header grammar + regression fixtures (the two PLANs under
  `docs/completed/` and `docs/discarded/` that today mis-parse to 289/247 tasks) + a PLAN
  self-parse gate at Phase P.
- **Slice B (step 4, medium):** wave-based Phase I — the PLAN file-ownership manifest becomes
  a parsed contract validated at Phase P; waves = topological batches ∩ ownership-disjoint
  sets; same-tree execution with pathspec-scoped agent commits; the script runs the test gate
  between waves itself and only then instructs commits; dist rebuild owned by the script;
  worktrees demoted to the exception path for genuinely overlapping tasks.
- **Slice C (steps 5–7, the rewrite proper):** the `converge()` primitive replacing the five
  copied phase bodies; phase-graph compression **T+D and I+PT only** (CR and DOD remain
  separate, each gaining delta-scoped re-verification on rounds 2+); the erratum protocol as a
  first-class signal, bounded at one erratum round per upstream doc per phase, exhaustion →
  POSTMORTEM.

## Invariants that must not regress (proposal §3.6)

Pacing contract and per-write byte caps; append-only, content-addressed review windows
(`deriveRoundWindow`); structural completeness gates (`isComplete`); approval anchors and the
staleness gate; POSTMORTEM fail-closed lifecycle; the queue drift gate; REQ size budgets;
model pinning; Phase MERGE's no-LLM decision ladder and its no-override self-modification
guard. The existing test suite is the contract for all of these — a red that isn't AT-22 is
your defect until proven otherwise.

## Engineering norms (measured in the pdlc-merge-phase run — follow them)

1. **You own the gates.** Subagents produce diffs; you run `cd pdlc/workflows && npm test`
   yourself between batches and only then instruct commits. Never accept a subagent's
   self-reported green. Subagents sometimes stall waiting on backgrounded test runs or die on
   resume — when one does, verify its staged work yourself and commit on its behalf.
2. **Same-tree parallelism only with disjoint file ownership**, pathspec-scoped `git add`
   (never `-a`), and an index.lock retry (sleep 5, ×5).
3. **Generated artifacts:** any change to `orchestrate-dev.js`, `orchestrate-queue.js`,
   `runtime-adapter.js`, or `build-runtime.mjs` requires `node pdlc/workflows/build-runtime.mjs`
   with `dist/` committed in the same commit, then `pdlc/hooks/scripts/sync-workflows.sh`
   (plain, then `--check` → 0). Never hand-edit `dist/` or `.claude/workflows/`.
4. **TDD red-first** for every behavioral change; where a red is impossible, declare it and
   state the falsifiable gate instead (e.g. "reverting line X reds test Y").
5. **Oracle quality:** no implementation echoes (an expectation never imports the constant it
   asserts); no absence-only oracles (pair every negative with a positive conjunct on the same
   path); completeness via set-equality counts, not containment.
6. **Test runner:** always `npm test --` from `pdlc/workflows`, never bare `npx jest`.
7. **Docs ride the change:** if a slice alters a contract that CLAUDE.md, a SKILL.md, or a
   README describes, update the description in the same PR — the last run's DoD caught six
   drifted doc sites precisely because this was skipped.

## Working style

Work autonomously; stop only for genuine scope decisions. Keep a running plan with the task
tools. When a design question the proposal doesn't settle comes up, decide, record the
decision and rationale in the PR body, and move on — flag it for Kane's review rather than
blocking on it. Report each slice's completion with: what landed, test counts, dist/sync
status, PR URL, and any decisions taken.
