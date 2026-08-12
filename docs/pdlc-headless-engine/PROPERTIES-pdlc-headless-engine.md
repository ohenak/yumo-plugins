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
