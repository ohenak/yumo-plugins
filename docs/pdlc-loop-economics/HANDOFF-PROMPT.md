# HANDOFF — feature `pdlc-loop-economics` (moves M1–M3 of the pipeline-optimization proposal)

You (Fable 5) are the **planner, orchestrator, architect, validator and gatekeeper** for this
feature. You do not implement anything yourself: delegate every authoring and implementation task
to subagents — **Opus** for complex synthesis/implementation, **Sonnet** for well-specified
writing/implementation, **Haiku** for mechanical fetch/verify work — and gate every deliverable
yourself (diff review before any commit; correct or re-dispatch on defects). Launch independent
agents in parallel.

## Goal

Deliver proposal moves **M1, M2, M3** end-to-end with all pdlc artifacts
(REQ, FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS, LEARNINGS) under `docs/pdlc-loop-economics/`.
Implementation must use **TDD** and **property-based testing** (`fast-check@4` is already a
devDependency of `pdlc/workflows`). Definition of Done: everything integrated, **no stubs, no
unwired code paths**, working end-to-end; full suites green.

We generate all the artifacts pdlc does but do **not** run the pdlc engine flow itself: no engine
invocation, no cross-review round files required, no queue row. You gate each artifact inline
instead of running review loops.

## Current state (as of 2026-08-27)

- Branch `feat-pdlc-loop-economics` exists, forked from `main` at `9dfaef197`; checked out; clean
  except the untracked proposal HTML.
- `docs/pdlc-loop-economics/` contains only `_evidence/` (inputs, below) and this file.
- The proposal being executed: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html`
  (untracked; §0 top-moves table defines M1–M3; §3 has per-move mechanism/risk; §6 rollout rules).
- The governing decisions are **already promoted and committed** on main:
  `docs/_decisions/DECISIONS-anchor-provenance.md` (DEC-ANCHOR-01),
  `docs/_decisions/DECISIONS-erratum-routing.md` (DEC-ERRROUTE-01..04),
  `docs/_decisions/DECISIONS-loop-termination.md` (DEC-TERM-01..02),
  `docs/_decisions/DECISIONS-test-oracle-mechanics.md` (DEC-ORACLE-06),
  plus proposal rows R1–R7 in `docs/_decisions/CONSOLIDATION-PROPOSAL-2026-08-27-1.md`.
- Evidence corpus: `docs/pdlc-loop-economics/_evidence/` —
  `report-A-learnings.md` (this repo's LEARNINGS distillation: round counts, 54× re-filed Low,
  4/6 docs at 15-round cap, 5.6× artifact-to-spec ratio),
  `report-B-costmodel.md` (dispatch/prompt cost model of `orchestrate-dev.js` with line cites:
  reviewLoop :8783, PHASE_DISPATCH :5142, dodVerifyLoop :12064, prompt builders :10826–:11073,
  MAX_REVIEW_ROUNDS=5 :1902, MAX_LIFETIME_ROUNDS=15 :1935),
  `regime-ledger-signals.md` (second-repo corroboration incl. raw counts),
  `mattpocock-skills-analysis.md` (background only; not needed for M1–M3).
- A seam-recon agent was interrupted before writing its map — **re-run seam recon first** (task 1
  below); do not trust the line numbers above beyond report-B's cites without re-verifying.

## Scope — exactly three moves, all in `pdlc/workflows/orchestrate-dev.js` (+ tests/config/docs)

**M1 — anchor & staleness mechanics. Always-on (defect-fix tier, no config gate).**
- M1a: approval anchors (`APPROVAL-HASH: sha256:…`, `REVIEWED-COMMIT:`, `UPSTREAM-STATE {DOCTYPE}
  sha256:…`) are computed and appended by the **harness IO path** at approval time from bytes on
  disk; the "agent appends anchor lines verbatim" dispatch is removed. Anchor grammar bytes stay
  identical so every existing parser (staleness walk, harvest) is untouched.
- M1b: any upstream hash a dispatch quotes as "current" is computed from bytes on disk at
  dispatch-construction time — never a committed-HEAD snapshot (kills the recurring R-5 stale-hash
  Low; see memory/OPERATIONS erratum notes).
- M1c: Phase DOD's next CODE_REVIEW version = `max(CODE_REVIEW-{feature}-v*.md on disk) + 1`,
  never a counter.
- M1d: finding-identity dedup — identity = `severity | section-anchor | normalized text`
  (normalization defined in FSPEC); a finding matching a prior round's finding for the same doc is
  accounted `carried`, not `new` (DEC-TERM-02). This accounting feeds M3.

**M2 — pin-cascade round. Config-gated `cascade.pinCheck.enabled`, default `false`,
per-key fail-open parsing (follow the `parseLearningsConfig` precedent).**
In the post-erratum downstream staleness walk: a doc whose own bytes still hash to its
APPROVAL-HASH and whose only invalidation is UPSTREAM-STATE mismatch goes into **one batched
pin-check dispatch** (all such docs in a single agent call; agent verifies dependency cells only;
closed verdict grammar defined in FSPEC, e.g. `PIN-CHECK: {doc}: PASS|FAIL`). On PASS the harness
(M1a machinery) re-appends refreshed anchors; on FAIL that doc falls back to the ordinary full
delta re-confirmation — never a silent downgrade of review strength. Disabled ⇒ byte-identical
behavior to today (baseline-guard test, cf. `learningsBaselineGuard.test.js` precedent).

**M3 — derivative stop rule. Config-gated `review.derivativeStop` = `{enabled:false, rounds:2}`.**
In `reviewLoop`: if `rounds` consecutive completed rounds introduce **zero new ≥Medium findings**
(per M1d identity) **and** zero open High exists, the loop resolves `converged-by-derivative-stop`
— its own report outcome, distinct from ordinary approval; never overrides an open High; never
bypasses POSTMORTEM lifecycle or MAX_LIFETIME_ROUNDS accounting. Disabled ⇒ byte-identical.

Non-goals: proposal moves M4–M6; SKILL.md prompt changes beyond deleting the anchor-append
dispatch instructions; `pdlc/engine/` changes beyond what vendoring picks up automatically.

## Hard repo constraints (violating any of these is a gate FAIL)

1. `pdlc/workflows/*.js` are ES modules; jest suite: `cd pdlc/workflows && npm test`; coverage:
   `npm run test:coverage` — **branch ≥85% per module** enforced per-file by c8 stage 2.
2. Any workflow-source change requires `node pdlc/workflows/build-runtime.mjs` and staging
   `pdlc/workflows/dist/` **in the same commit** (`--check` exits non-zero on drift). Never edit
   `dist/` by hand.
3. Changing anything under `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/` requires bumping
   `pdlc/.claude-plugin/plugin.json` version in the landing commit.
4. Every injected IO/git seam call must be `await`ed (adapter impls are async; test doubles sync).
5. Tests must stub the io/git seams — **never let seams default to live git/fs** (a prior suite
   committed 46 junk commits through a live default; see `_git` stub pattern, commit f325016).
6. If CLI/coverage tests fail with `pdlc/engine/vendor/` paths, `rm -rf pdlc/engine/vendor` (stale
   gitignored pack output) before debugging.
7. Document oracles walk the whole tree (skipping `.git/`, `node_modules/`) — untracked local
   files can red them; check for strays before touching code on an oracle failure.
8. `check-req-size.sh` hook warns REQ > 700 lines / 60 KB. Your budget is stricter: REQ ≤ 300
   lines, FSPEC ≤ 450 — this feature exists because REQ bloat killed features (see
   `_evidence/report-A-learnings.md`, rcv-budget-stop row). Cite the DECISIONS files; never
   restate them (DC-18).
9. Commits: pathspec-scoped (never `-a`), conventional messages, end with
   `Co-Authored-By:` trailer naming the model that authored the commit. Do not push and do not
   open a PR unless the operator asks.
10. `pdlc/OPERATIONS.md` is the operational contract reference (review-loop mechanics, erratum
    channel, anchors/UPSTREAM-STATE semantics, artifact conventions). Read it before TSPEC.

## Execution plan (adapt as needed; keep the gates)

1. **Seam recon** (Sonnet): precise file:line seam map of `orchestrate-dev.js` for M1a/M1b/M1c/
   M1d/M2/M3 slots — anchor append dispatch, upstream-hash snapshot, DoD version pick, FINDING:
   parser + per-round accounting, staleness walk + delta re-confirmation builder, config parse
   pattern, report-row pattern, and 2 representative seam-stubbing test files. Save the map into
   `_evidence/seam-map.md`.
2. **REQ + FSPEC** (Sonnet, pm-author role) — spec content per Scope above; AC→FSPEC traceability
   table. Gate: check every AC is testable, size caps hold, config schemas exact.
3. **TSPEC + DECISIONS + PLAN** (Opus, se-author role, grounded in seam map) — TSPEC cites real
   symbols/lines; DECISIONS records: M1 ungated vs M2/M3 gated-off rationale (DEC-SEAM-01 —
   defaults are choices), pin-check fallback-on-FAIL, derivative-stop never overriding High,
   finding-identity normalization choice; PLAN = task table with Deps + file-ownership manifest
   (parseable shape not required since the engine won't run it, but keep the discipline:
   ownership-disjoint tasks, each sized for one agent session).
4. **PROPERTIES** (Sonnet, te-author role) — property list incl. the fast-check properties:
   anchor round-trip (computed anchor parses back to the same hash; ∀ doc bytes), finding-identity
   (reflexive; normalization idempotent; carried∪new = all findings; dedup order-independent),
   derivative-stop (∀ finding sequences: never fires with an open High; fires iff `rounds`
   consecutive all-carried-below-Medium rounds; disabled ⇒ decision identical to baseline),
   pin-check routing (∀ walk states: pin-check set ∩ full-reconfirm set = ∅; FAIL ⇒ doc lands in
   full-reconfirm; disabled ⇒ sets identical to baseline), M1c (∀ existing version sets: next =
   max+1). Baseline byte-identity properties for M2/M3 disabled.
5. **Implementation** (Opus for reviewLoop/staleness-walk changes, Sonnet for M1c + config parsing
   + report rows): strict TDD — red test first per task; unit + property tests per PROPERTIES;
   wire config; wire report rows. Ownership-disjoint parallel agents where the PLAN allows.
6. **Integration + DoD gate** (you + a Sonnet verifier): `npm test`, `npm run test:coverage`
   (per-module floors), `node pdlc/workflows/build-runtime.mjs` + `--check`, engine suite
   `cd pdlc/engine && npm test`, then a dod-verify-style scan: no stubs/TODO/mock-only paths, every
   new function reachable from a production caller, M1a agent-dispatch removal actually removes the
   dispatch (grep), disabled-config byte-identity guards present. Remediate via se-implement-style
   dispatches until clean.
7. **LEARNINGS** (Sonnet): `LEARNINGS-pdlc-loop-economics.md` — 5 numbered sections + metadata
   incl. `Harvested from` row (cite this handoff + gate notes in lieu of cross-reviews).
8. **Land**: single feature commit series on `feat-pdlc-loop-economics` (artifacts commit;
   implementation commit(s) each with dist rebuild + plugin.json bump; LEARNINGS commit). Report
   final status with suite outputs. Leave merge/PR to the operator.

## Gatekeeper duties (yours, never delegated)

- Diff-review every artifact and every implementation wave before its commit; reject scope
  narrowing (a prior writer silently dropped 4 of 8 specified rows — re-check counts against the
  dispatch spec every time).
- Verify agents' factual claims spot-wise against the repo (agents have raced stale state before).
- Enforce the byte-identity claims with tests, not assertions.
- Keep a running decision log; anything you rule during the run that isn't in the DECISIONS
  artifact yet gets added there before landing.
