---
feature: pdlc-headless-engine
---

# PROPERTIES — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** (`REQ-pdlc-headless-engine.md` v0.10; `FSPEC-pdlc-headless-engine.md` v1.6; `TSPEC-pdlc-headless-engine.md` v1.5; `DECISIONS-pdlc-headless-engine.md` v1.3; `PLAN-pdlc-headless-engine.md` v1.2) |
| Downstream | IMPL and tests (`pdlc/engine/__tests__/`, `pdlc/workflows/__tests__/`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 1. Purpose and scope

This document states the testable properties of the headless engine: what it must do, what it
must not do, and under which observation each claim is falsifiable. It is derived from REQ v0.10's
26 acceptance criteria, FSPEC v1.6's behavioural rules (`BR-*`), edge cases (`EC-*`) and 69
acceptance tests (`AT-ENG-01…AT-ENG-68` plus `AT-ENG-11a`), TSPEC v1.5's design sections, and PLAN
v1.2's 54 tasks (`T00…T53`).

**This is not a greenfield feature.** A partial engine is committed at
`pdlc/engine/` on this branch — seven modules under `lib/`, `bin/pdlc.mjs`, and nine test files
(verified at HEAD: `lib/{adapter,handshake,report,run,skills,startup,transport}.mjs`;
`__tests__/{adapter,cli,handshake,report,run,skills,smoke,startup,transport}.test.js`). Each
property below therefore carries a **state at HEAD** cell with one of three values, because a
property that re-asserts an existing green and one that starts red demand different work:

| State | Meaning |
|---|---|
| `red` | no code at HEAD satisfies this; the test starts failing and a PLAN task makes it pass |
| `green` | the observable exists at HEAD; the property pins it against regression |
| `partial` | some clauses hold at HEAD, others do not; the cell names which |

`docs/_constraints/pdlc-engine-baseline.md` M-ENG-06 remains the authority on per-criterion
red/green state; where a cell here and M-ENG-06 disagree, M-ENG-06 wins and the disagreement is a
defect in this document.

**Out of scope for this document.** Pipeline semantics (phase graph, convergence, round windows,
verdict parsing, erratum routing, POSTMORTEM lifecycle, queue lifecycle) are unchanged by this
feature (REQ NG-1) and their properties live with the workflow modules' own suite, not here. This
document asserts only that the engine *hosts* them without altering them — that is
`PROP-PARITY-*`'s job, and it is a structural claim, never a behavioural re-specification.

## 2. How to read a property row

**Identifier grammar.** `PROP-{DOMAIN}-{NUMBER}`. Domains are stable and each maps to one section:
`PARITY`, `FORK`, `READ`, `START`, `HAND`, `SKILL`, `AUTH`, `ENV`, `DISP`, `MODEL`, `PERM`, `FAIL`,
`RETRY`, `QUEUE`, `EXIT`, `REP`, `TUNE`, `GUARD`, `VER`, `MSG`, `SUITE`. Numbers are never reused;
a withdrawn property keeps its id with a `withdrawn` state rather than being deleted.

**Columns.** Every property table carries: the id; the property statement (`must` / `must not`,
with its `when`/`given`); `Traces` (the REQ acceptance criterion, FSPEC rule and TSPEC section it
derives from, plus the FSPEC acceptance test id where one exists); `Category` and `Level` from the
tables below; `State at HEAD`; and `Task` (the PLAN task that owns the red test, then the green).

| Category | This document's usage |
|---|---|
| Functional | Core engine logic — resolution, composition, classification |
| Contract | Protocol/interface conformance: seam shapes, transport option boundary, report schema |
| Error Handling | Failure modes, refusals, degradation, totality of parsers |
| Data Integrity | Transformations and mappings: descriptors, report blocks, exit codes |
| Integration | Cross-module wiring: engine ↔ workflow modules, engine ↔ transport, engine ↔ plugin |
| Security | Auth policy, billing safety, credential absence in fixtures, permission posture |
| Idempotency | Repeated dispatch/run producing the stated result |
| Observability | Banner, run report, retry/pause rows, suite observation records |

| Level | When it is chosen |
|---|---|
| Unit | The observable is reachable from a pure function or a single module with injected seams |
| Integration | The observable requires two or more engine modules, or the engine against a doubled transport, or the engine against the real workflow modules |
| E2E | The observable requires a whole pipeline run (hermetic, doubled transport) or a live credentialed run |

**E2E budget.** Five E2E properties exist and no more: `PROP-PARITY-1`, `PROP-PARITY-2`,
`PROP-READ-1`, `PROP-READ-2` and `PROP-VER-6` (the opt-in live smoke, which never runs in CI).
Everything else falsifies at unit or integration level. The five-configuration corpus (PLAN T48) is
an integration instrument driven over recorded descriptors, not a fifth pipeline run per property.

**Three oracle rules this document applies to itself**, each because a plausible-looking oracle here
would be vacuous:

1. **No absence-only oracle.** Every clause of the form "X is not present" is paired, in the same
   property or its immediate neighbour, with a positive on the same path. `PROP-READ-1`'s empty
   `.claude/workflows/` read-set is asserted only alongside the two positive read clauses, and
   `PROP-READ-3` is the deliberate-read falsifier that proves the instrument can fail.
2. **No blocked/refused state asserted by status alone.** Every refusal property asserts three
   conjuncts: the exact exit code, the named catalogue id, and the retention evidence (zero
   dispatches attempted, or the artifact set the run left behind).
3. **No set-equality asserted in one direction.** Where the spec says "both directions", the
   property names both and the reverse direction names the instrument that makes it satisfiable —
   a provocation fixture per outcome member, a corpus configuration per model-map row, an emission
   seam per catalogue id.

## 3. Pipeline parity, anti-fork and the read-set (PROP-PARITY, PROP-FORK, PROP-READ)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-PARITY-1 | A hermetic `pdlc dev` run over the fixture repo **must** produce, under `docs/{f}/`, a filename set equal to the phase-declared core (`FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `LEARNINGS`) for the phases that fixture's config enables — set-equality, observed over **creation events**, not over the tree surviving at exit | AC-1.1 cl.1(i), BR-PARITY-3, TSPEC §7.3, AT-ENG-45 | Integration | E2E | red | T34 → T49 |
| PROP-PARITY-2 | Each run-dependent member **must** appear iff its rule fires against the fixture: `DECISIONS-{f}.md` iff the fixture supplies the Phase-T decision; the `CROSS-REVIEW-{role}-{doc}[-v{N}].md` set equal to exactly one file per `(role, doc, round)` the fixture's round windows name; `CODE_REVIEW-{f}-v{N}.md` one per DoD round driven; `POSTMORTEM-{phase}-{f}.md` iff the fixture halts that phase; `ADVISORY-{f}.md` iff the advisory tier is enabled | AC-1.1 cl.1(ii), BR-PARITY-6, AT-ENG-46 | Data Integrity | E2E | red | T34 → T49 |
| PROP-PARITY-3 | No filename outside PROP-PARITY-1's and PROP-PARITY-2's rules **must** appear under `docs/{f}/`: the set is closed under both rules together | AC-1.1 cl.1, BR-PARITY-6, AT-ENG-45 | Data Integrity | Integration | red | T34 → T49 |
| PROP-PARITY-4 | Every `CROSS-REVIEW-*` file created by the run **must** carry a parseable `VERDICT:` line **and** a counts object | AC-1.1 cl.2, AT-ENG-45 | Contract | Integration | red | T34 → T49 |
| PROP-PARITY-5 | Approval anchors (`APPROVAL-HASH:`, `REVIEWED-COMMIT:`) **must** be present on each cross-review that reached a terminal approval, **and must be written by the module's own append path** (`orchestrate-dev.js:6190` via `_appendFile`), never by the test double | AC-1.1 cl.3, BR-PARITY-5, TSPEC §7.3, AT-ENG-45 | Data Integrity | Integration | red | T34 → T49 |
| PROP-PARITY-6 | The feature's `docs/_queue/QUEUE.md` row **must** hold one of `in-progress`, `awaiting-merge`, `halted` after the run, with its pathspec-scoped commit present in `git log` | AC-1.1 cl.4 | Integration | Integration | red | T34 → T49 |
| PROP-PARITY-7 | The run report **must** carry every field the modules already produce **plus** the engine block of FSPEC §12.2 — asserted as containment of the module fields and presence of the engine key, on the same run PROP-PARITY-1 observes | AC-1.1 cl.5, AT-ENG-45 | Observability | Integration | red | T32 → T40 |
| PROP-PARITY-8 | The write-replaying double **must** key each replay on `(skill, phase, round index)` with the round derived from the directory listing the way `deriveRoundWindow` (`orchestrate-dev.js:6366`, **not** `:2151` as TSPEC §7.3 states — erratum below) derives it — **never on skill alone** | TSPEC §7.3, DEC-ENG-10 neighbourhood, AT-ENG-45 | Contract | Unit | red | T34 → T49 |
| PROP-PARITY-9 | Two successive reviewer dispatches for one document **must** produce two files (`-v1`, `-v2`), never one rewritten file — the append-only round window survives the double | TSPEC §7.3, AC-1.1 cl.1(ii) | Functional | Integration | red | T34 → T49 |
| PROP-PARITY-10 | A dispatch path reaching the modules' throwing `agent()` stub (`orchestrate-dev.js:8458`) **must** propagate as an engine failure naming the missing seam and exit `1` — never be caught and turned into a skipped phase | EC-PAR-5, BR-PARITY-2, TSPEC §3.1, AT-ENG-51 | Error Handling | Integration | red | T25 → T39 |
| PROP-PARITY-11 | A phase disabled by the consumer's config **must** have its artifacts absent from PROP-PARITY-1's expected set — the oracle is over *enabled* phases, and a disabled phase is not a missing artifact | EC-PAR-4, AT-ENG-51 | Functional | Integration | red | T25 → T39 |
| PROP-PARITY-12 | The engine **must** supply exactly TSPEC §3.1's per-module seam set: `_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`, `_runCommand`, `_git` for dev; `_agent`, `_phase`, `_log`, `_git`, `_runPipeline` for queue — with `_runCommand` non-null for dev (a null seam silently degrades Phase I's wave gate) and `_runPipeline` supplied for queue (its `:1422` call forwards no seams) | AC-1.1, BR-PARITY-2, TSPEC §3.1, AT-ENG-51 | Contract | Unit | partial — `devInjection` `run.mjs:80`, `queueInjection` `:114` exist; completion to the table is T39's | T25 → T39 |
| PROP-PARITY-13 | The `_git` seam the engine supplies **must** be a function identity distinct from the modules' own `defaultGit` (`orchestrate-dev.js:8609`), because `branchGuardTransport` (`:3487`) returns a transport only when `_git !== defaultGit`; `createGit()` (`adapter.mjs:116`) **must not** be memoised into that default | TSPEC §3.1, AC-1.1, AT-ENG-16 | Security | Unit | green at `adapter.mjs:116`; the inequality assertion is red | T20 → T35 |
| PROP-PARITY-14 | `_sessionAgent` **must** remain unwired, **and** the absence **must** be paired with its positive on the same path: two successive dispatches produce two independent sessions (two fresh contexts, not one resumed) | TSPEC §3.1, R-4, O-6, AT-ENG-51 | Contract | Unit | red (positive half absent) | T25 → T39 |
| PROP-PARITY-15 | The twelve un-overridden IO/advisory/probe seams **must** keep the modules' Node defaults, **and** those defaults **must** be shown to be exercised by a real run — `smoke.test.js` already drives the consumer-relative `_readFile`/`_writeFile`/`_listFiles`/`_checkFile`/`_hashFile`/`_git` path, so the positive reuses it rather than asserting absence alone | TSPEC §2.5, §3.1, M-ENG-03, AT-ENG-51 | Contract | Integration | partial — `smoke.test.js` tracked at HEAD (387 lines); the pairing assertion is red | T25 → T39 |
| PROP-FORK-1 | The module specifier the engine resolves for each workflow module **must** equal the repo-relative path under `pdlc/workflows/` — strictly stronger than "a `file:` URL", which is all `run.test.js:64` asserts at HEAD | AC-1.5(a), BR-PARITY-1, AT-ENG-49 | Contract | Unit | partial — `run.mjs:58` already resolves the path; the assertion at `run.test.js:64` is the weaker form | — (T10, green on landing) |
| PROP-FORK-2 | No second file named `orchestrate-dev.js` or `orchestrate-queue.js` **must** exist anywhere under the engine tree (`node_modules` excluded) | AC-1.5(b), EC-PAR-6, AT-ENG-49 | Contract | Unit | green — `run.test.js:48-62` | T10 |
| PROP-FORK-3 | Only `lib/run.mjs` **must** name a path under `pdlc/workflows/`; any other engine file naming one fails the suite | R-ARCH-1, TSPEC §2.4 | Contract | Unit | red | T39 |
| PROP-READ-1 | On one observed `pdlc dev` run, all three clauses **must** hold on the **same recording**: (a) ≥1 read of `{pluginRoot}/skills/{skill}/SKILL.md`; (b) ≥1 read of the consumer's `docs/{f}/REQ-{f}.md`; (c) **zero** paths opened under `{consumerRoot}/.claude/workflows/`. Clause (c) is unconditional for the dev module — its single occurrence of that string is `MERGE_GUARD_DEFAULTS`' prefix list (`orchestrate-dev.js:48-53`, `:52`), compared against a PR's changed files and never opened | AC-1.2, BR-READ-1, TSPEC §7.7, AT-ENG-47 | Integration | E2E | red | T33 → T43, T46 |
| PROP-READ-2 | On one observed `pdlc queue` run **with** `distribution.checkEnabled: false` configured, clause (c) **must** hold, because `parseDistributionCheckEnabledOptOut` (`orchestrate-queue.js:2068`, called `:1071-1072`) short-circuits before the drift-state read at `:64` in the else-branch (`:1074`); **without** the opt-out the same run **must** be blocked by the module's own gate and the drift-state read **must** then be observable | AC-1.2, BR-READ-1, EC-PAR-3, AT-ENG-48 | Integration | E2E | red | T33 → T43, T46 |
| PROP-READ-3 | A case that deliberately reads a file under `.claude/workflows/` inside the observation window **must** fail clause (c), and a case asserting the recording is non-empty **must** pass — the two falsifying controls that make PROP-READ-1's absence clause meaningful | TSPEC §7.7, AT-ENG-47 | Error Handling | Unit | red | T33 → T43 |
| PROP-READ-4 | The AC-1.2 consumer fixture **must** carry a **populated** `.claude/workflows/` tree, never an absent or empty one — an empty directory satisfies clause (c) for the wrong reason | TSPEC §7.7, EC-PAR-1, AT-ENG-51 | Integration | Integration | red | T46 |
| PROP-READ-5 | The `fs` recorder **must** be live for the whole run — installed by `__tests__/_bootstrap.mjs` before `runLadder` and still live after the report is stamped, covering the modules' dynamic `import()` — and **must** observe both readers through one wrapper, since the modules read through their own Node defaults (`defaultReadFile`, `orchestrate-dev.js:8492`) which are also `node:fs` | TSPEC §7.7, DEC-ENG-10 | Observability | Unit | red | T43 |
| PROP-READ-6 | Across a full fixture run the engine **must** create **no** engine-owned file under the consumer repo, **and** the same run **must** be shown to have written the consumer's own artifacts (the `docs/{f}/` set of PROP-PARITY-1) — so "wrote nothing" is distinguishable from "ran nothing" | BR-READ-3, NG-7, AT-ENG-50 | Security | Integration | red | T33 → T43 |
| PROP-READ-7 | Reads of the consumer's own `docs/**` and `.claude/pdlc.config.json`, and reads inside the engine install and the located plugin's `skills/` tree, **must not** be treated as violations by the clause-(c) matcher — the matcher is scoped to `{consumerRoot}/.claude/workflows/` and nothing else | BR-READ-2, AC-1.2 | Functional | Unit | red | T33 |
| PROP-READ-8 | A consumer repo with no `.claude/pdlc.config.json` at all **must** run under the modules' own defaults, and the engine **must** add no config file of its own to that repo | EC-PAR-2, BR-READ-3 | Error Handling | Integration | red | T25 → T39 |

## 4. Startup ladder, plugin handshake and skill-set equality (PROP-START, PROP-HAND, PROP-SKILL)

## 5. Auth posture, per-dispatch auth policy and environment (PROP-AUTH, PROP-ENV)

## 6. Dispatch boundary, model forwarding and permission posture (PROP-DISP, PROP-MODEL, PROP-PERM)

## 7. Outcome taxonomy, retry machine and engine-fatal stops (PROP-FAIL, PROP-RETRY)

## 8. Queue surface, loop stop reasons and exit codes (PROP-QUEUE, PROP-EXIT)

## 9. Run report and tunables (PROP-REP, PROP-TUNE)

## 10. Guard parity and the M-ENG-09 measurement (PROP-GUARD)

## 11. Test-suite mechanics: hermeticity, fixtures, catalogue, set-equality harness (PROP-VER, PROP-MSG, PROP-SUITE)

## 12. Negative properties — what must not happen

## 13. Property-based testing strategies

## 14. Coverage matrix — acceptance criteria to properties

## 15. Coverage matrix — properties to PLAN tasks and test files

## 16. Gaps, risks and open items

REVISION-COMPLETE: yes
